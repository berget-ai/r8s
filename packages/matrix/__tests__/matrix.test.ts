import { describe, it, expect } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { runGuardrails, noPlaintextSecrets } from '@r8s/core'
import { SecretContext, Namespace } from '@r8s/core/defaults'
import { S3Provider, Bucket } from '@r8s/recipes'
import { Matrix } from '../src/index'

function renderMatrix(overrides: any = {}) {
  const element = jsx(Matrix, {
    domain: 'example.com',
    // explicit opt-out — without an S3Provider the backup decision is
    // required; under one, omitting defaults to enabled (covered by its
    // own test)
    database: { backup: false },
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

  it('backup: false skips backups entirely', () => {
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

  it('renders a persistent keys PVC mounted writable at /data (signing key = server identity)', () => {
    const result = renderMatrix()
    const pvc = find(result, 'PersistentVolumeClaim', 'matrix-synapse-keys') as any
    // Persistent — a fresh signing key on every boot de-federates rooms and
    // invalidates sessions; fresh boot must be able to GENERATE the key too
    // (the previous read-only-config-only deployment PermissionErrored here)
    expect(pvc).toBeDefined()
    expect(pvc.spec.accessModes).toContain('ReadWriteOnce')
    expect(pvc.spec.resources.requests.storage).toBe('1Gi')
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    const container = dep.spec.template.spec.containers[0]
    const mount = container.volumeMounts.find((m: any) => m.name === 'keys')
    expect(mount.mountPath).toBe('/data')
    // writable — synapse generates <server_name>.signing.key there
    expect(mount.readOnly).toBeFalsy()
    const volume = dep.spec.template.spec.volumes.find((v: any) => v.name === 'keys')
    expect(volume.persistentVolumeClaim.claimName).toBe('matrix-synapse-keys')
    // the config still rides the subPath file mount on TOP of the PVC
    const configMount = container.volumeMounts.find((m: any) => m.name === 'config')
    expect(configMount.mountPath).toBe('/data/homeserver.yaml')
    expect(configMount.readOnly).toBe(true)
  })

  it('keysStorage overrides PVC size + storageClass', () => {
    const result = renderMatrix({ keysStorage: { size: '5Gi', storageClass: 'fast' } })
    const pvc = find(result, 'PersistentVolumeClaim', 'matrix-synapse-keys') as any
    expect(pvc.spec.resources.requests.storage).toBe('5Gi')
    expect(pvc.spec.storageClassName).toBe('fast')
  })

  it('keysStorage: false renders no keys volume (bring your own /data)', () => {
    const result = renderMatrix({ keysStorage: false })
    expect(find(result, 'PersistentVolumeClaim', 'matrix-synapse-keys')).toBeUndefined()
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    const c = dep.spec.template.spec.containers[0]
    expect(dep.spec.template.spec.volumes.map((v: any) => v.name)).not.toContain('keys')
    expect(c.volumeMounts.map((m: any) => m.name)).not.toContain('keys')
  })

  it('renders a dedicated media PVC mounted at /data/media_store and pins media_store_path', () => {
    const result = renderMatrix()
    const pvc = find(result, 'PersistentVolumeClaim', 'matrix-synapse-media') as any
    // Media is the large-growing data of a Matrix server (uploads, avatars,
    // thumbnails) — it gets its OWN volume, never the 1Gi keys PVC
    expect(pvc).toBeDefined()
    expect(pvc.spec.accessModes).toContain('ReadWriteOnce')
    expect(pvc.spec.resources.requests.storage).toBe('20Gi')
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    const container = dep.spec.template.spec.containers[0]
    const mount = container.volumeMounts.find((m: any) => m.name === 'media')
    expect(mount.mountPath).toBe('/data/media_store')
    // writable — uploads, thumbnails and avatars land here
    expect(mount.readOnly).toBeFalsy()
    const volume = dep.spec.template.spec.volumes.find((v: any) => v.name === 'media')
    expect(volume.persistentVolumeClaim.claimName).toBe('matrix-synapse-media')
    // homeserver.yaml must pin the path — synapse's own default (/media_store,
    // off the container root fs) PermissionErrors on read-only root
    // filesystems (caught one step after the #136 signing-key fix)
    const cm = find(result, 'ConfigMap', 'matrix-synapse-config') as any
    expect(cm.data['homeserver.yaml']).toContain('media_store_path: /data/media_store')
  })

  it('mediaStorage overrides PVC size + storageClass', () => {
    const result = renderMatrix({ mediaStorage: { size: '100Gi', storageClass: 'NVMe' } })
    const pvc = find(result, 'PersistentVolumeClaim', 'matrix-synapse-media') as any
    expect(pvc.spec.resources.requests.storage).toBe('100Gi')
    expect(pvc.spec.storageClassName).toBe('NVMe')
  })

  it('mediaStorage: false renders no media volume but keeps the media_store_path pin', () => {
    const result = renderMatrix({ mediaStorage: false })
    expect(find(result, 'PersistentVolumeClaim', 'matrix-synapse-media')).toBeUndefined()
    const dep = find(result, 'Deployment', 'matrix-synapse') as any
    expect(dep.spec.template.spec.volumes.map((v: any) => v.name)).not.toContain('media')
    const c = dep.spec.template.spec.containers[0]
    expect(c.volumeMounts.map((m: any) => m.name)).not.toContain('media')
    // bring-your-own volumes must still mount at the pinned path
    const cm = find(result, 'ConfigMap', 'matrix-synapse-config') as any
    expect(cm.data['homeserver.yaml']).toContain('media_store_path: /data/media_store')
  })

  it('renders MAS with the pinned image and the current listener resource names', () => {
    const result = renderMatrix()
    const mas = find(result, 'Deployment', 'matrix-mas') as any
    // Floating 'latest' drifted from the config schema (CrashLoop: unknown
    // variant) — the default must be a real, current release
    expect(mas.spec.template.spec.containers[0].image).toBe(
      'ghcr.io/element-hq/matrix-authentication-service:1.24.0'
    )
    const cm = find(result, 'ConfigMap', 'matrix-mas-config') as any
    const yaml = cm.data['config.yaml']
    // renamed upstream: oauthapi/compatapi → oauth/compat
    expect(yaml).toContain('name: oauth')
    expect(yaml).toContain('name: compat')
    expect(yaml).not.toContain('oauthapi')
    expect(yaml).not.toContain('compatapi')
  })

  it('emits MAS 1.24.0 listener binds (top-level host/port no longer parse)', () => {
    const result = renderMatrix()
    const cm = find(result, 'ConfigMap', 'matrix-mas-config') as any
    const yaml = cm.data['config.yaml']
    // Schema per crates/config/src/sections/http.rs @ v1.24.0: ListenerConfig
    // requires per-socket `binds` ("missing field `binds` for key
    // default.http.listeners.0"). Shape: the BindConfig enum's Listen
    // variant { host, port } — same 0.0.0.0:8080 socket the pre-1.24
    // top-level fields produced (binds entries render two indents deeper)
    expect(yaml).toContain('binds:\n        -\n          host: 0.0.0.0\n          port: 8080')
    // the obsolete top-level listener fields must be gone
    expect(yaml).not.toContain('\n      port: 8080')
    expect(yaml).not.toContain('\n      host: 0.0.0.0')
    // resources (names) ride along unchanged
    expect(yaml).toContain('name: discovery')
    expect(yaml).toContain('name: graphql')
  })

  it('pulls the admin console from oci.element.io (ghcr no longer serves anonymous pulls)', () => {
    const result = renderMatrix()
    const admin = find(result, 'Deployment', 'matrix-admin') as any
    expect(admin.spec.template.spec.containers[0].image).toBe('oci.element.io/element-admin:0.1.13')
  })

  it('rejects floating latest for mas and admin (pinned-version policy)', () => {
    expect(() => renderMatrix({ version: { mas: 'latest' } })).toThrow(/pinned tag/)
    expect(() => renderMatrix({ version: { admin: 'latest' } })).toThrow(/pinned tag/)
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

  it('propagates custom versions (including mas + admin overrides)', () => {
    const result = renderMatrix({
      version: { web: 'v1.13.0', sfu: 'v1.11.0', mas: '1.23.0', admin: '0.1.12' },
    })
    const web = find(result, 'Deployment', 'matrix-web') as any
    expect(web.spec.template.spec.containers[0].image).toContain('v1.13.0')
    const mas = find(result, 'Deployment', 'matrix-mas') as any
    expect(mas.spec.template.spec.containers[0].image).toContain(':1.23.0')
    const admin = find(result, 'Deployment', 'matrix-admin') as any
    expect(admin.spec.template.spec.containers[0].image).toBe('oci.element.io/element-admin:0.1.12')
  })

  it('inherits namespace from the Platform context', () => {
    const element = jsx(Namespace.Provider, {
      value: 'collab',
      children: jsx(Matrix, { domain: 'example.com', database: { backup: false } }),
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

  it('backup: true derives destination + credentials from the S3 provider', () => {
    const element = jsx(S3Provider as never, {
      provider: {
        endpoint: 'https://rustfs:9000',
        bucket: 'infra',
        credentialsSecret: 'infra-s3-creds',
      },
      children: jsx(Matrix, { domain: 'example.com', database: { backup: true } }),
    })
    const result = render(element)
    const synapseDb = find(result, 'Cluster', 'matrix-synapse-db') as any
    expect(synapseDb.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://infra/matrix-backup/synapse-cnpg'
    )
    expect(synapseDb.spec.backup.barmanObjectStore.endpointURL).toBe('https://rustfs:9000')
    expect(synapseDb.spec.backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe(
      'infra-s3-creds'
    )
    // provider-driven creds → no secrets-backend copy needed
    expect(find(result, 'StaticSecret', 'matrix-backup-credentials')).toBeUndefined()
  })

  it('a <Bucket> descriptor scopes the backup destination', () => {
    const element = jsx(S3Provider as never, {
      provider: {
        endpoint: 'https://rustfs:9000',
        bucket: 'infra',
        credentialsSecret: 'infra-s3-creds',
      },
      children: jsx(Matrix, {
        domain: 'example.com',
        database: { backup: jsx(Bucket as never, { name: 'matrix_backup' }) },
      }),
    })
    const result = render(element)
    const masDb = find(result, 'Cluster', 'matrix-mas-db') as any
    expect(masDb.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://infra/matrix_backup/matrix-backup/mas-cnpg'
    )
  })

  it('pod template labels match the Service selectors (name-prefixed)', () => {
    const result = renderMatrix()
    for (const svc of ['synapse', 'mas', 'web', 'admin']) {
      const dep = find(result, 'Deployment', `matrix-${svc}`) as any
      const app = dep.spec.selector.matchLabels.app
      expect(dep.spec.template.metadata.labels.app).toBe(app)
      expect(app).toBe(`matrix-${svc}`)
    }
  })

  it('explicit object gaps derive from the S3 provider (destinationPath included)', () => {
    const element = jsx(S3Provider as never, {
      provider: {
        endpoint: 'https://rustfs:9000',
        bucket: 'infra',
        credentialsSecret: 'infra-s3-creds',
      },
      children: jsx(Matrix, {
        domain: 'example.com',
        database: { backup: { retention: '14d' } as never },
      }),
    })
    const result = render(element)
    const synapseDb = find(result, 'Cluster', 'matrix-synapse-db') as any
    expect(synapseDb.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://infra/matrix-backup/synapse-cnpg'
    )
    expect(synapseDb.spec.backup.retentionPolicy).toBe('14d')
  })

  it('omitting the backup decision fails with guidance when no S3Provider is in scope', () => {
    expect(() =>
      renderMatrixWithPlatform({
        sso: { issuer: 'https://keycloak.example.com/realms/x', clientId: 'matrix' },
      })
    ).toThrow(/backup is a required decision/)
  })

  it('omitting the backup decision defaults to enabled under an S3Provider', () => {
    const element = jsx(S3Provider as never, {
      provider: {
        endpoint: 'https://rustfs:9000',
        bucket: 'infra',
        credentialsSecret: 'infra-s3-creds',
      },
      children: jsx(Matrix, { domain: 'example.com', database: {} }),
    })
    const result = render(element)
    const synapseDb = find(result, 'Cluster', 'matrix-synapse-db') as any
    expect(synapseDb.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://infra/matrix-backup/synapse-cnpg'
    )
    expect(find(result, 'ScheduledBackup', 'matrix-synapse-db-backup')).toBeDefined()
    expect(find(result, 'ScheduledBackup', 'matrix-mas-db-backup')).toBeDefined()
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
