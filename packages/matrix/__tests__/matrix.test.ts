import { describe, it, expect } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { runGuardrails, noPlaintextSecrets } from '@r8s/core'
import { SecretContext, Namespace } from '@r8s/core/defaults'
import { Matrix } from '../src/index'

function renderMatrix(overrides: any = {}) {
  const element = jsx(Matrix, {
    domain: 'example.com',
    ...overrides,
  })
  return render(element)
}

function renderMatrixWithPlatform(
  overrides: any = {},
  secrets: any = { backend: 'openbao', mount: 'kv', path: 'matrix' }
) {
  const element = jsx(SecretContext.Provider, {
    value: secrets,
    children: jsx(Matrix, { domain: 'example.com', ...overrides }),
  })
  return render(element)
}

const kinds = (result: any) => result.resources.map((r: any) => r.kind)
const find = (result: any, kind: string, name: string) =>
  result.resources.find((r: any) => r.kind === kind && r.metadata?.name === name)

describe('Matrix — resource rendering', () => {
  it('renders two CNPG clusters with managed roles and sizing', () => {
    const result = renderMatrix()
    const synapseDb = find(result, 'Cluster', 'matrix-synapse-db') as any
    const masDb = find(result, 'Cluster', 'matrix-mas-db') as any
    expect(synapseDb).toBeDefined()
    expect(masDb).toBeDefined()
    expect(synapseDb.spec.instances).toBe(2)
    expect(synapseDb.spec.managed.roles[0].name).toBe('synapse')
    expect(synapseDb.spec.storage.size).toBe('20Gi')
    expect(synapseDb.spec.monitoring.enablePodMonitor).toBe(true)
  })

  it('renders scheduled backups + barman retention when backup is configured', () => {
    const result = renderMatrix({
      database: {
        backup: {
          destinationPath: 's3://backups/matrix-cnpg',
          endpointURL: 'https://s3.example.com',
          credentialsSecret: 'backup-creds',
        },
      },
    })
    expect(find(result, 'ScheduledBackup', 'matrix-synapse-db-backup')).toBeDefined()
    expect(find(result, 'ScheduledBackup', 'matrix-mas-db-backup')).toBeDefined()
    const cluster = find(result, 'Cluster', 'matrix-synapse-db') as any
    expect(cluster.spec.backup.retentionPolicy).toBe('30d')
    expect(cluster.spec.backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe(
      'backup-creds'
    )
  })

  it('skips backups by default (explicit opt-in)', () => {
    const result = renderMatrix()
    expect(kinds(result)).not.toContain('ScheduledBackup')
    const cluster = find(result, 'Cluster', 'matrix-synapse-db') as any
    expect(cluster.spec.backup).toBeUndefined()
  })

  it('renders synapse with probes, /tmp emptyDir and db-credentials volume', () => {
    const result = renderMatrix()
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    const container = dep.spec.template.spec.containers[0]
    expect(container.livenessProbe.httpGet.path).toBe('/health')
    expect(dep.spec.template.spec.volumes.map((v: any) => v.name)).toContain('tmp')
    expect(dep.spec.template.spec.volumes.map((v: any) => v.name)).toContain('db-credentials')
  })

  it('renders appservice registrations as Secrets (tokens must never ride a ConfigMap)', () => {
    const result = renderMatrix({
      appservices: [{ name: 'hookshot', registration: { id: 'hookshot', as_token: 'x' } }],
    })
    expect(find(result, 'ConfigMap', 'matrix-appservice-hookshot')).toBeUndefined()
    const secret = find(result, 'Secret', 'matrix-appservice-hookshot') as any
    expect(secret).toBeDefined()
    expect(secret.stringData['registration.yaml']).toContain('hookshot')
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    const mountNames = dep.spec.template.spec.containers[0].volumeMounts.map((m: any) => m.name)
    expect(mountNames).toContain('appservice-hookshot')
    const volumes = dep.spec.template.spec.volumes
    const volume = volumes.find((v: any) => v.name === 'appservice-hookshot')
    expect(volume.secret.secretName).toBe('matrix-appservice-hookshot')
  })

  it('mounts an existing Secret via secretRef without rendering a resource', () => {
    const result = renderMatrix({
      appservices: [{ name: 'gitbot', secretRef: 'gitbot-registration-secret' }],
    })
    expect(find(result, 'Secret', 'matrix-appservice-gitbot')).toBeUndefined()
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    const volume = dep.spec.template.spec.volumes.find((v: any) => v.name === 'appservice-gitbot')
    expect(volume.secret.secretName).toBe('gitbot-registration-secret')
  })

  it('flags live appservice tokens through the guardrail, allows placeholders', () => {
    const live = renderMatrix({
      appservices: [
        {
          name: 'hookshot',
          registration: { id: 'hookshot', as_token: 's3cr3t-tok3n-value-12345' },
        },
      ],
    })
    const flagged = runGuardrails(live.resources, [noPlaintextSecrets])
    expect(flagged.errors.length).toBeGreaterThan(0)

    const placeholder = renderMatrix({
      appservices: [
        {
          name: 'hookshot',
          registration: {
            id: 'hookshot',
            as_token: 'PROVIDED_VIA_GITOPS',
            hs_token: 'PROVIDED_VIA_GITOPS',
          },
        },
      ],
    })
    const clean = runGuardrails(placeholder.resources, [noPlaintextSecrets])
    expect(clean.errors).toEqual([])
  })

  it('renders the five public endpoints (web/synapse/admin/account/rtc)', () => {
    const result = renderMatrix()
    const ingresses = result.resources.filter((r: any) => r.kind === 'Ingress') as any[]
    const hosts = ingresses.flatMap((i) => i.spec.rules.map((r: any) => r.host))
    expect(hosts).toContain('element.example.com')
    expect(hosts).toContain('matrix.example.com')
    expect(hosts).toContain('element-admin.example.com')
    expect(hosts).toContain('matrix-account.example.com')
    expect(hosts).toContain('matrix-rtc.example.com')
  })

  it('supports host overrides', () => {
    const result = renderMatrix({ hosts: { web: 'chat.example.com' } })
    const ingresses = result.resources.filter((r: any) => r.kind === 'Ingress') as any[]
    const hosts = ingresses.flatMap((i) => i.spec.rules.map((r: any) => r.host))
    expect(hosts).toContain('chat.example.com')
    expect(hosts).not.toContain('element.example.com')
  })

  it('renders SFU with UDP ports on a LoadBalancer service (numeric targetPorts)', () => {
    const result = renderMatrix()
    const svc = find(result, 'Service', 'matrix-sfu') as any
    // RTC without external exposure is silently broken — never ClusterIP
    expect(svc.spec.type).toBe('LoadBalancer')
    expect(svc.spec.externalTrafficPolicy).toBe('Local')
    const udp = svc.spec.ports.find((p: any) => p.name === 'rtc-muxed-udp')
    expect(udp.protocol).toBe('UDP')
    expect(udp.targetPort).toBe(30002)
  })

  it('pins a manual external IP on the SFU LoadBalancer when given', () => {
    const result = renderMatrix({ rtc: { manualIP: '203.0.113.10' } })
    const svc = find(result, 'Service', 'matrix-sfu') as any
    expect(svc.spec.loadBalancerIP).toBe('203.0.113.10')
  })

  it('disables RTC entirely when rtc.enabled is false', () => {
    const result = renderMatrix({ rtc: { enabled: false } })
    expect(find(result, 'Deployment', 'matrix-sfu')).toBeUndefined()
    expect(find(result, 'Service', 'matrix-sfu')).toBeUndefined()
    const ingresses = result.resources.filter((r: any) => r.kind === 'Ingress') as any[]
    const hosts = ingresses.flatMap((i) => i.spec.rules.map((r: any) => r.host))
    expect(hosts).not.toContain('matrix-rtc.example.com')
  })

  it('applies HA tolerations and topology spread to every Deployment', () => {
    const result = renderMatrix()
    const deployments = result.resources.filter((r: any) => r.kind === 'Deployment') as any[]
    expect(deployments.length).toBeGreaterThanOrEqual(4)
    for (const dep of deployments) {
      const tolerations = dep.spec.template.spec.tolerations
      expect(tolerations.some((t: any) => t.tolerationSeconds === 60)).toBe(true)
      const spread = dep.spec.template.spec.topologySpreadConstraints
      if (dep.spec.replicas !== 1) {
        expect(spread).toBeDefined()
        // Scoped to this component's pods — unscoped constraints match every
        // pod in the namespace and misbehave as the namespace grows
        expect(spread[0].labelSelector.matchLabels.app).toBe(dep.metadata.name)
      }
    }
  })

  it('includes the SSRF-hardened URL preview blacklist by default', () => {
    const result = renderMatrix()
    const cm = find(result, 'ConfigMap', 'matrix-synapse-config') as any
    expect(cm.data['homeserver.yaml']).toContain('url_preview_ip_range_blacklist')
    expect(cm.data['homeserver.yaml']).toContain('10.0.0.0/8')
  })

  it('uses pinned component versions (web v1.12.15, sfu v1.10.1)', () => {
    const result = renderMatrix()
    const web = find(result, 'Deployment', 'matrix-web') as any
    expect(web.spec.template.spec.containers[0].image).toContain('v1.12.15')
    const sfu = find(result, 'Deployment', 'matrix-sfu') as any
    expect(sfu.spec.template.spec.containers[0].image).toContain('v1.10.1')
  })

  it('propagates custom versions', () => {
    const result = renderMatrix({ version: { web: 'v1.13.0', sfu: 'v1.11.0' } })
    const web = find(result, 'Deployment', 'matrix-web') as any
    expect(web.spec.template.spec.containers[0].image).toContain('v1.13.0')
  })

  it('inherits namespace from the Platform context', () => {
    const element = jsx(Namespace.Provider, {
      value: 'collab',
      children: jsx(Matrix, { domain: 'example.com' }),
    })
    const result = render(element)
    const namespaces = new Set(result.resources.map((r: any) => r.metadata?.namespace))
    expect(namespaces.has('collab')).toBe(true)
    expect(namespaces.has('default')).toBe(false)
  })
})

describe('Matrix — secrets backends', () => {
  it('throws on sso without clientSecretRef and without secrets backend', () => {
    expect(() =>
      renderMatrix({ sso: { issuer: 'https://keycloak.example.com/realms/x', clientId: 'matrix' } })
    ).toThrow(/clientSecretRef|secrets backend/)
  })

  it('throws on backup without credentialsSecret and without secrets backend', () => {
    expect(() =>
      renderMatrix({
        database: {
          backup: { destinationPath: 's3://b/x', endpointURL: 'https://s3.example.com' },
        },
      })
    ).toThrow(/credentialsSecret|secrets backend/)
  })

  it('renders OpenBaoStaticSecret bundles when the backend is openbao', () => {
    const result = renderMatrixWithPlatform({
      sso: { issuer: 'https://keycloak.example.com/realms/x', clientId: 'matrix' },
      database: { backup: { destinationPath: 's3://b/x', endpointURL: 'https://s3.example.com' } },
    })
    const oidc = find(result, 'OpenBaoStaticSecret', 'matrix-keycloak-oidc') as any
    const backup = find(result, 'OpenBaoStaticSecret', 'matrix-backup-credentials') as any
    expect(oidc).toBeDefined()
    expect(backup).toBeDefined()
    // CRD field name — a vaultAuthRef here produces an invalid OpenBao spec
    expect(oidc.spec.openbaoAuthRef).toBe('openbao-auth')
    expect(oidc.spec.vaultAuthRef).toBeUndefined()
    expect(backup.spec.openbaoAuthRef).toBe('openbao-auth')
  })

  it('wires the MAS OIDC secret via secretKeyRef', () => {
    const result = renderMatrix({
      sso: {
        issuer: 'https://keycloak.example.com/realms/x',
        clientId: 'matrix',
        clientSecretRef: 'my-oidc-secret',
      },
    })
    const mas = find(result, 'Deployment', 'matrix-mas') as any
    const env = mas.spec.template.spec.containers[0].env
    const oidc = env.find((e: any) => e.name === 'MAS_OIDC_CLIENT_SECRET')
    expect(oidc.valueFrom.secretKeyRef.name).toBe('my-oidc-secret')
    expect(oidc.value).toBeUndefined()
  })

  it('passes the plaintext-secrets guardrail on a fully configured render', () => {
    const result = renderMatrixWithPlatform({
      sso: { issuer: 'https://keycloak.example.com/realms/x', clientId: 'matrix' },
      database: { backup: { destinationPath: 's3://b/x', endpointURL: 'https://s3.example.com' } },
      appservices: [{ name: 'hookshot', registration: { id: 'hookshot' } }],
    })
    const check = runGuardrails(result.resources, [noPlaintextSecrets])
    expect(check.errors).toEqual([])
  })
})

describe('Matrix — operators', () => {
  it('declares the cnpg operator once', () => {
    const result = renderMatrix()
    const cnpg = result.operators.filter((op) => op.name === 'cnpg')
    expect(cnpg).toHaveLength(1)
  })
})
