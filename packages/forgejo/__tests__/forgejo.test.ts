import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext, Namespace } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { S3Provider } from '@r8s/recipes'
import { Forgejo } from '../src/index'

// Forgejo recipe tests:
//   1. Instance model (image/port/probes/resources, single replica + data PVC)
//   2. Version pinning policy and error cases
//   3. env-to-ini wiring: server/database/security/service (+ secretKeyRefs)
//   4. LFS: s3-derived (default under S3Provider) / pvc fallback / false / errors
//   5. SSH: LoadBalancer Service (default, custom port) / disabled
//   6. Actions runners: default on (register init + dind sidecar) / opt-out / token
//   7. Namespace override, guardrails

const openbao = { backend: 'openbao', mount: 'kv', path: 'forgejo' }
const s3 = {
  endpoint: 'https://rustfs:9000',
  bucket: 'infra',
  region: 'us-east-1',
  forcePathStyle: true,
  credentialsSecret: 'infra-s3-creds',
}

function renderApp(props: Record<string, unknown> = {}, withS3 = true) {
  const app = jsx(SecretContext.Provider, {
    value: openbao,
    children: jsx(Forgejo, { host: 'git.example.com', backup: false, ...props } as never),
  })
  return render(withS3 ? jsx(S3Provider as never, { provider: s3, children: app }) : app)
}

const resource = (result: ReturnType<typeof render>, kind: string, name?: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind && (!name || r.metadata?.name === name)) as any

const envOf = (d: any) =>
  Object.fromEntries(
    d.spec.template.spec.containers[0].env.map((e: { name: string; value?: string }) => [
      e.name,
      e.value,
    ])
  )

const secretRefsOf = (d: any) =>
  Object.fromEntries(
    d.spec.template.spec.containers[0].env.map(
      (e: { name: string; valueFrom?: { secretKeyRef?: { name: string; key: string } } }) => [
        e.name,
        e.valueFrom?.secretKeyRef,
      ]
    )
  )

describe('Forgejo instance', () => {
  it('renders the pinned image on port 3000 with /api/healthz probes', () => {
    const d = resource(renderApp(), 'Deployment', 'forgejo')
    const c = d.spec.template.spec.containers[0]
    expect(c.image).toBe('codeberg.org/forgejo/forgejo:11')
    expect(c.ports[0].containerPort).toBe(3000)
    expect(c.startupProbe.httpGet.path).toBe('/api/healthz')
    expect(c.startupProbe.failureThreshold).toBe(60)
    expect(c.readinessProbe.httpGet.path).toBe('/api/healthz')
    expect(c.livenessProbe.httpGet.path).toBe('/api/healthz')
    expect(c.resources.requests).toEqual({ memory: '512Mi', cpu: '250m' })
    expect(c.resources.limits).toEqual({ memory: '2Gi', cpu: '2' })
  })

  it('is single-replica Recreate with the repo data PVC at /data', () => {
    const result = renderApp()
    const d = resource(result, 'Deployment', 'forgejo')
    expect(d.spec.replicas).toBe(1)
    expect(d.spec.strategy.type).toBe('Recreate')
    const pvc = resource(result, 'PersistentVolumeClaim', 'forgejo-data')
    expect(pvc.spec.resources.requests.storage).toBe('20Gi')
    const mount = d.spec.template.spec.containers[0].volumeMounts.find(
      (m: { name: string }) => m.name === 'data'
    )
    expect(mount.mountPath).toBe('/data')

    const custom = resource(
      renderApp({ storage: { size: '100Gi', storageClass: 'harvester' } }),
      'PersistentVolumeClaim',
      'forgejo-data'
    )
    expect(custom.spec.resources.requests.storage).toBe('100Gi')
    expect(custom.spec.storageClassName).toBe('harvester')
    expect(
      renderApp({ storage: false }).resources.find((r) => r.kind === 'PersistentVolumeClaim')
    ).toBeUndefined()
  })

  it('rejects the unpinned latest tag with an actionable error', () => {
    expect(() => renderApp({ version: 'latest' })).toThrow('pinned version')
  })

  it('wires the database env against the CNPG cluster (HOST includes port)', () => {
    const d = resource(renderApp(), 'Deployment', 'forgejo')
    const env = envOf(d)
    expect(env['FORGEJO__database__DB_TYPE']).toBe('postgres')
    expect(env['FORGEJO__database__HOST']).toBe('forgejo-db-rw.default.svc.cluster.local:5432')
    expect(env['FORGEJO__database__NAME']).toBe('forgejo-db')
    expect(env['FORGEJO__database__SSL_MODE']).toBe('disable')
    expect(env['FORGEJO__server__ROOT_URL']).toBe('https://git.example.com')
    expect(env['FORGEJO__security__INSTALL_LOCK']).toBe('true')
    expect(env['FORGEJO__service__DISABLE_REGISTRATION']).toBe('true')

    const refs = secretRefsOf(d)
    expect(refs['FORGEJO__database__PASSWD']).toEqual({
      name: 'forgejo-db-db-credentials',
      key: 'password',
    })
  })

  it('registration: true opens registration', () => {
    expect(
      envOf(resource(renderApp({ registration: true }), 'Deployment', 'forgejo'))[
        'FORGEJO__service__DISABLE_REGISTRATION'
      ]
    ).toBe('false')
  })

  it('provisions the credential bundle via the backend with rotation restart', () => {
    const result = renderApp()
    const vso = resource(result, 'OpenBaoStaticSecret', 'forgejo-credentials')
    expect(vso.spec.path).toBe('forgejo/forgejo')
    const t = vso.spec.destination.transformation.templates
    expect(t.SECRET_KEY.text).toBe('{{ .Secrets.SECRET_KEY }}')
    expect(t.INTERNAL_TOKEN.text).toBe('{{ .Secrets.INTERNAL_TOKEN }}')
    expect(t.LFS_JWT_SECRET.text).toBe('{{ .Secrets.LFS_JWT_SECRET }}')
    expect(vso.spec.destination.name).toBe('forgejo-credentials')
    expect(vso.spec.rolloutRestartTargets).toEqual([{ kind: 'Deployment', name: 'forgejo' }])

    const refs = secretRefsOf(resource(result, 'Deployment', 'forgejo'))
    expect(refs['FORGEJO__security__SECRET_KEY']).toEqual({
      name: 'forgejo-credentials',
      key: 'SECRET_KEY',
    })
    expect(refs['FORGEJO__security__INTERNAL_TOKEN']).toEqual({
      name: 'forgejo-credentials',
      key: 'INTERNAL_TOKEN',
    })
  })

  it('credentialsSecretName references a pre-created bundle instead of provisioning', () => {
    const result = renderApp({ credentialsSecretName: 'existing-forgejo-creds' })
    expect(
      result.resources.find(
        (r) => r.kind === 'OpenBaoStaticSecret' && r.metadata?.name === 'forgejo-credentials'
      )
    ).toBeUndefined()
    expect(
      secretRefsOf(resource(result, 'Deployment', 'forgejo'))['FORGEJO__security__SECRET_KEY']
    ).toEqual({
      name: 'existing-forgejo-creds',
      key: 'SECRET_KEY',
    })
  })

  it('throws an actionable error without a backend and without credentialsSecretName', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(Forgejo, { host: 'git.example.com', backup: false } as never),
        })
      )
    ).toThrow(/Forgejo "forgejo" requires/)
  })

  it('renders the CNPG cluster with backups on by default under an S3Provider', () => {
    const cluster = resource(renderApp({ backup: undefined }), 'Cluster', 'forgejo-db')
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe('s3://infra/forgejo-db-cnpg')
    expect(resource(renderApp({ backup: undefined }), 'ScheduledBackup')).toBeDefined()
  })
})

describe('Forgejo LFS', () => {
  it('defaults to S3 under an S3Provider (endpoint stripped, path-style lookup)', () => {
    const d = resource(renderApp(), 'Deployment', 'forgejo')
    const env = envOf(d)
    expect(env['FORGEJO__lfs__ENABLED']).toBe('true')
    expect(env['FORGEJO__storage.lfs__STORAGE_TYPE']).toBe('minio')
    expect(env['FORGEJO__storage.lfs__MINIO_ENDPOINT']).toBe('rustfs:9000')
    expect(env['FORGEJO__storage.lfs__MINIO_USE_SSL']).toBe('true')
    expect(env['FORGEJO__storage.lfs__MINIO_BUCKET_LOOKUP_TYPE']).toBe('path')
    expect(env['FORGEJO__storage.lfs__MINIO_BUCKET']).toBe('infra')
    const refs = secretRefsOf(d)
    expect(refs['FORGEJO__storage.lfs__MINIO_ACCESS_KEY_ID']).toEqual({
      name: 'infra-s3-creds',
      key: 'access-key-id',
    })
    expect(refs['FORGEJO__storage.lfs__MINIO_SECRET_ACCESS_KEY']).toEqual({
      name: 'infra-s3-creds',
      key: 'secret-access-key',
    })
  })

  it('falls back to PVC storage without an S3Provider (LFS stays enabled)', () => {
    const d = resource(renderApp({}, false), 'Deployment', 'forgejo')
    const env = envOf(d)
    expect(env['FORGEJO__lfs__ENABLED']).toBe('true')
    expect(env['FORGEJO__storage.lfs__STORAGE_TYPE']).toBeUndefined()
  })

  it("throws when lfs='s3' is requested without an S3Provider", () => {
    expect(() => renderApp({ lfs: 's3' }, false)).toThrow(/lfs='s3' requires an <S3Provider>/)
  })

  it('lfs: false disables LFS entirely', () => {
    const env = envOf(resource(renderApp({ lfs: false }), 'Deployment', 'forgejo'))
    expect(env['FORGEJO__lfs__ENABLED']).toBeUndefined()
    expect(env['FORGEJO__storage.lfs__STORAGE_TYPE']).toBeUndefined()
  })

  it('throws when pvc LFS (the no-provider fallback) is combined with storage: false', () => {
    // LFS would write to ephemeral container storage and vanish on restart
    expect(() => renderApp({ storage: false }, false)).toThrow(/lfs='pvc' with storage=\{false\}/)
  })
})

describe('Forgejo SSH', () => {
  it('renders a LoadBalancer Service on port 22 by default and advertises it', () => {
    const result = renderApp()
    const svc = resource(result, 'Service', 'forgejo-ssh')
    expect(svc.spec.type).toBe('LoadBalancer')
    expect(svc.spec.ports[0].port).toBe(22)
    expect(svc.spec.ports[0].targetPort).toBe(22)
    const env = envOf(resource(result, 'Deployment', 'forgejo'))
    expect(env['FORGEJO__server__SSH_PORT']).toBe('22')
    expect(env['FORGEJO__server__SSH_DOMAIN']).toBe('git.example.com')
    expect(env['FORGEJO__server__DISABLE_SSH']).toBeUndefined()
  })

  it('ssh: { port } changes the external port and the advertised clone URL port', () => {
    const result = renderApp({ ssh: { port: 2222 } })
    expect(resource(result, 'Service', 'forgejo-ssh').spec.ports[0].port).toBe(2222)
    expect(envOf(resource(result, 'Deployment', 'forgejo'))['FORGEJO__server__SSH_PORT']).toBe(
      '2222'
    )
  })

  it('ssh: false disables SSH (git over HTTPS only)', () => {
    const result = renderApp({ ssh: false })
    expect(
      result.resources.find((r) => r.kind === 'Service' && r.metadata?.name === 'forgejo-ssh')
    ).toBeUndefined()
    expect(envOf(resource(result, 'Deployment', 'forgejo'))['FORGEJO__server__DISABLE_SSH']).toBe(
      'true'
    )
  })
})

describe('Forgejo Actions runners', () => {
  it('ships a runner by default: register init + daemon + privileged dind sidecar', () => {
    const result = renderApp()
    const d = resource(result, 'Deployment', 'forgejo-runner')
    expect(d.spec.replicas).toBe(1)
    const init = d.spec.template.spec.initContainers[0]
    expect(init.image).toBe('code.forgejo.org/forgejo/runner:6.3.1')
    expect(init.args[0]).toContain('forgejo-runner register')
    // registration + job polling ride the in-cluster Service (port 80), not
    // the external host — no ingress DNS / LB hairpin dependency
    const instanceUrl = init.env.find((e: { name: string }) => e.name === 'INSTANCE_URL')
    expect(instanceUrl.value).toBe('http://forgejo.default.svc.cluster.local')
    const runner = d.spec.template.spec.containers.find(
      (c: { name: string }) => c.name === 'runner'
    )
    expect(runner.command).toEqual([
      'forgejo-runner',
      'daemon',
      '--config',
      '/runner-config/config.yaml',
    ])
    expect(runner.image).toBe('code.forgejo.org/forgejo/runner:6.3.1')
    const dind = d.spec.template.spec.containers.find((c: { name: string }) => c.name === 'dind')
    expect(dind.securityContext.privileged).toBe(true)
    // dind opens the root-owned socket for the non-root runner sidecar
    expect(dind.args[0]).toContain('chmod 666 /var/run/docker.sock')
    // runner never touches the kube API — no ambient credentials in a privileged pod
    expect(d.spec.template.spec.automountServiceAccountToken).toBe(false)
    // token provisioned through the backend
    const vso = resource(result, 'OpenBaoStaticSecret', 'forgejo-runner-registration')
    expect(vso.spec.path).toBe('forgejo/forgejo/runner-registration-token')
    expect(vso.spec.destination.transformation.templates['registration-token'].text).toBe(
      '{{ .Secrets.registration-token }}'
    )
    // Actions enabled on the instance + runner config labels
    expect(envOf(resource(result, 'Deployment', 'forgejo'))['FORGEJO__actions__ENABLED']).toBe(
      'true'
    )
    const cm = resource(result, 'ConfigMap', 'forgejo-runner-config')
    expect(cm.data['config.yaml']).toContain('runner-images:ubuntu-latest')
    expect(cm.data['config.yaml']).toContain('docker_host: unix:///var/run/docker.sock')
  })

  it('actions: false opts out entirely', () => {
    const result = renderApp({ actions: false })
    expect(result.resources.find((r) => r.metadata?.name === 'forgejo-runner')).toBeUndefined()
    expect(
      result.resources.find((r) => r.metadata?.name === 'forgejo-runner-config')
    ).toBeUndefined()
    expect(
      envOf(resource(result, 'Deployment', 'forgejo'))['FORGEJO__actions__ENABLED']
    ).toBeUndefined()
  })

  it('actions.registrationTokenSecretName references a pre-created token', () => {
    const result = renderApp({
      actions: { registrationTokenSecretName: 'existing-runner-token' },
    })
    expect(
      result.resources.find(
        (r) =>
          r.kind === 'OpenBaoStaticSecret' && r.metadata?.name === 'forgejo-runner-registration'
      )
    ).toBeUndefined()
    const init = resource(result, 'Deployment', 'forgejo-runner').spec.template.spec
      .initContainers[0]
    const token = init.env.find((e: { name: string }) => e.name === 'REGISTRATION_TOKEN')
    expect(token.valueFrom.secretKeyRef).toEqual({
      name: 'existing-runner-token',
      key: 'registration-token',
    })
  })

  it('throws without a backend and without a registration token secret', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(Forgejo, {
            host: 'git.example.com',
            backup: false,
            // reference a pre-created bundle so the runner-token check is what fails
            credentialsSecretName: 'existing-forgejo-creds',
          } as never),
        })
      )
    ).toThrow(/registration token/)
  })
})

describe('Forgejo misc', () => {
  it('metrics: true enables the metrics endpoint', () => {
    expect(
      envOf(resource(renderApp({ metrics: true }), 'Deployment', 'forgejo'))[
        'FORGEJO__metrics__ENABLED'
      ]
    ).toBe('true')
    expect(
      envOf(resource(renderApp(), 'Deployment', 'forgejo'))['FORGEJO__metrics__ENABLED']
    ).toBeUndefined()
  })

  it('renders the Endpoint with forge-tuned proxy limits', () => {
    const ann = resource(renderApp(), 'Ingress').metadata.annotations
    expect(ann['nginx.ingress.kubernetes.io/proxy-body-size']).toBe('512m')
    expect(ann['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe('900')
    expect(ann['cert-manager.io/cluster-issuer']).toBe('letsencrypt-prod')
  })

  it('explicit namespace prop overrides the ambient <Namespace> scope', () => {
    const result = render(
      jsx(Namespace.Provider, {
        value: 'team-x',
        children: jsx(SecretContext.Provider, {
          value: openbao,
          children: jsx(Forgejo, {
            host: 'git.example.com',
            namespace: 'git-ns',
            backup: false,
          } as never),
        }),
      })
    )
    expect(resource(result, 'Deployment', 'forgejo').metadata.namespace).toBe('git-ns')
  })

  it('produces valid, plaintext-free manifests', () => {
    const result = renderApp()
    for (const r of result.resources) {
      expect(validateResource(r)).toEqual([])
    }
    expect(runGuardrails(result.resources as never, [noPlaintextSecrets]).passed).toBe(true)
  })
})

describe('no secrets backend — CNPG-generated credentials contract', () => {
  it('references the CNPG-generated <dbName>-app secret without a secrets backend', () => {
    const result = render(
      jsx(Forgejo, {
        backup: false,
        host: 'git.example.com',
        credentialsSecretName: 'forgejo-credentials',
        actions: false,
      } as never)
    )
    const d = resource(result, 'Deployment', 'forgejo')
    const refs = secretRefsOf(d)
    expect(refs['FORGEJO__database__PASSWD']).toEqual({
      name: 'forgejo-db-app',
      key: 'password',
    })

    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster).toBeDefined()
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
  })
})
