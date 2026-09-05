import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { Harbor } from '../src/index'

// Harbor recipe tests, facit-aligned against berget-internal/apps/harbor:
//   1. Flux HelmRelease/HelmRepository (pinned chart, facit values shapes)
//   2. Encoded traps: string port, proxy-body-size "0", Recreate,
//      disableredirect, serviceMonitor off
//   3. S3 bundle 6-key remap + literal templates; CNPG -app existingSecret
//   4. Secrets via backend with reference fallbacks + actionable errors

const openbao = { backend: 'openbao', mount: 'secret', path: 'rustfs' }
const baseS3 = {
  bucket: 'harbor-registry',
  region: 'berget-cloud',
  endpoint: 'https://s3.berget.cloud',
}

function renderApp(props: Record<string, unknown> = {}) {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao,
      children: jsx(Harbor, { host: 'registry.example.com', s3: baseS3, ...props } as never),
    })
  )
}

const resource = (result: ReturnType<typeof render>, kind: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind) as any

describe('Harbor chart release', () => {
  it('renders the pinned Flux release against the harbor repo', () => {
    const repo = resource(renderApp(), 'HelmRepository')
    expect(repo.metadata.namespace).toBe('flux-system')
    expect(repo.spec.url).toBe('https://helm.goharbor.io')
    expect(repo.spec.interval).toBe('24h')

    const rel = resource(renderApp(), 'HelmRelease')
    expect(rel.spec.chart.spec.chart).toBe('harbor')
    expect(rel.spec.chart.spec.version).toBe('1.18.3')
    expect(rel.spec.chart.spec.sourceRef).toEqual({
      kind: 'HelmRepository',
      name: 'harbor',
      namespace: 'flux-system',
    })
    expect(rel.spec.interval).toBe('30m')
  })

  it('encodes the facit chart values incl. all production traps', () => {
    const v = resource(renderApp(), 'HelmRelease').spec.values
    expect(v.externalURL).toBe('https://registry.example.com')
    // TRAP: unlimited body size — image layers
    expect(v.expose.ingress.annotations['nginx.ingress.kubernetes.io/proxy-body-size']).toBe('0')
    expect(v.expose.ingress.annotations['cert-manager.io/cluster-issuer']).toBe('letsencrypt-prod')
    expect(v.expose.tls.secret.secretName).toBe('harbor-tls')
    // TRAP: no S3 307 redirects for the Docker registry protocol
    expect(v.persistence.imageChartStorage.disableredirect).toBe(true)
    expect(v.persistence.imageChartStorage.s3).toEqual({
      region: 'berget-cloud',
      bucket: 'harbor-registry',
      regionendpoint: 'https://s3.berget.cloud',
      secure: true,
      v4auth: true,
      existingSecret: 'harbor-s3-credentials',
    })
    // TRAP: port MUST be a string (chart bug)
    expect(v.database.external.port).toBe('5432')
    expect(v.database.external.host).toBe('harbor-db-rw')
    expect(v.database.external.username).toBe('harbor')
    expect(v.database.external.coreDatabase).toBe('registry')
    expect(v.database.external.existingSecret).toBe('harbor-db-app')
    expect(v.database.external.sslmode).toBe('disable')
    // TRAP: RWO jobLog PVC deadlocks rolling updates
    expect(v.updateStrategy.type).toBe('Recreate')
    // TRAP: no Prometheus CRDs on-cluster
    expect(v.metrics.serviceMonitor).toEqual({ enabled: false })
    expect(v.existingSecretAdminPassword).toBe('harbor-admin-secret')
    expect(v.existingSecretSecretKey).toBe('harbor-secret')
    expect(v.persistence.persistentVolumeClaim.registry).toBeUndefined()
    expect(v.persistence.persistentVolumeClaim.database).toBeUndefined()
  })

  it('provisions the 6-key S3 bundle with remap + literal template passthrough', () => {
    const vso = resource(renderApp(), 'OpenBaoStaticSecret')
    expect(vso.metadata.name).toBe('harbor-rustfs-s3-credentials')
    expect(vso.spec.path).toBe('rustfs/harbor')
    expect(vso.spec.refreshAfter).toBe('3600s')
    const t = vso.spec.destination.transformation.templates
    expect(t.REGISTRY_STORAGE_S3_ACCESSKEY.text).toBe('{{ .Secrets.accesskey }}')
    expect(t.AWS_ACCESS_KEY_ID.text).toBe('{{ .Secrets.accesskey }}')
    expect(t.AWS_SECRET_ACCESS_KEY.text).toBe('{{ .Secrets.secretkey }}')
    // literals, not template dereferences
    expect(t.AWS_ENDPOINTS.text).toBe('https://s3.berget.cloud')
    expect(t.VIRTUAL_HOSTED_STYLE.text).toBe('false')
    expect(vso.spec.destination.name).toBe('harbor-s3-credentials')
  })

  it('renders the CNPG cluster with registry db/harbor owner and cnpg credentialsMode', () => {
    const result = renderApp()
    const cluster = resource(result, 'Cluster')
    expect(cluster.metadata.name).toBe('harbor-db')
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.storage.size).toBe('40Gi')
    expect(cluster.spec.bootstrap.initdb.database).toBe('registry')
    expect(cluster.spec.bootstrap.initdb.owner).toBe('harbor')
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
    // CNPG generates harbor-db-app — the chart's existingSecret
  })

  it('provisions admin + secretKey + backup creds (kebab remap, no restart targets)', () => {
    const result = renderApp({
      backup: {
        destinationPath: 's3://backups/harbor-cnpg',
        endpointURL: 'https://s3.berget.cloud',
      },
    })
    const vsos = result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret') as {
      metadata: { name: string }
      spec: {
        rolloutRestartTargets?: unknown[]
        destination: { transformation: { templates: Record<string, { text: string }> } }
      }
    }[]
    const names = vsos.map((r) => r.metadata.name)
    expect(names).toContain('harbor-admin-secret')
    expect(names).toContain('harbor-secret')
    const backup = vsos.find((r) => r.metadata.name === 'harbor-cnpg-backup')
    expect(backup).toBeDefined()
    expect(backup?.spec.destination.transformation.templates['access-key-id'].text).toBe(
      '{{ .Secrets.accesskey }}'
    )
    // barman reads per backup run — never restart workloads
    expect(backup?.spec.rolloutRestartTargets).toBeUndefined()

    const cluster = resource(result, 'Cluster')
    expect(cluster.spec.backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe(
      'harbor-cnpg-backup'
    )
    const sched = resource(result, 'ScheduledBackup')
    expect(sched.spec.schedule).toBe('0 3 * * *')
  })

  it('reference fallbacks skip provisioning for s3/admin/secretKey', () => {
    const v = resource(
      renderApp({
        s3: { ...baseS3, credentialsSecret: 'existing-s3' },
        adminPasswordSecretRef: 'existing-admin',
        secretKeySecretRef: 'existing-key',
      }),
      'HelmRelease'
    ).spec.values
    expect(v.persistence.imageChartStorage.s3.existingSecret).toBe('existing-s3')
    expect(v.existingSecretAdminPassword).toBe('existing-admin')
    expect(v.existingSecretSecretKey).toBe('existing-key')
  })

  it('throws an actionable error without a backend and without s3.credentialsSecret', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(Harbor, { host: 'registry.example.com', s3: baseS3 } as never),
        })
      )
    ).toThrow(/Harbor "harbor" requires/)
  })

  it('produces valid, plaintext-free manifests', () => {
    const result = renderApp({
      backup: {
        destinationPath: 's3://backups/harbor-cnpg',
        endpointURL: 'https://s3.berget.cloud',
      },
    })
    for (const r of result.resources) {
      expect(validateResource(r)).toEqual([])
    }
    expect(runGuardrails(result.resources as never, [noPlaintextSecrets]).passed).toBe(true)
  })
})
