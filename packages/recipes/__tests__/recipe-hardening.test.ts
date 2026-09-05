import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Database, WebService } from '../src/index'
import { SecretContext } from '@r8s/core/defaults'

const find = (result: any, kind: string, name: string) =>
  result.resources.find((r: any) => r.kind === kind && r.metadata?.name === name)

const openbao = (extra: any = {}) => ({
  backend: 'openbao' as const,
  mount: 'kv',
  path: 'apps',
  ...extra,
})

describe('Database — HA sizing props', () => {
  it('renders instances/storageClass/parameters on the cluster', () => {
    const result = render(
      jsx(Database, {
        name: 'tuned-db',
        instances: 2,
        storage: '20Gi',
        storageClass: 'harvester',
        parameters: { max_connections: '200' },
      })
    )
    const cluster = find(result, 'Cluster', 'tuned-db') as any
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.storage.size).toBe('20Gi')
    expect(cluster.spec.storage.storageClass).toBe('harvester')
    expect(cluster.spec.postgresql.parameters.max_connections).toBe('200')
  })
})

describe('Database — backup', () => {
  const backup = {
    destinationPath: 's3://backups/app-cnpg',
    endpointURL: 'https://s3.example.com',
  }

  it('renders barmanObjectStore + ScheduledBackup with an explicit credentials secret', () => {
    const result = render(
      jsx(Database, { name: 'app-db', backup: { ...backup, credentialsSecret: 'my-creds' } })
    )
    const cluster = find(result, 'Cluster', 'app-db') as any
    expect(cluster.spec.backup.retentionPolicy).toBe('30d')
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe('s3://backups/app-cnpg')
    expect(cluster.spec.backup.barmanObjectStore.s3Credentials.accessKeyId).toEqual({
      name: 'my-creds',
      key: 'access-key-id',
    })
    expect(cluster.spec.backup.barmanObjectStore.wal.encryption).toBe('AES256')

    const sb = find(result, 'ScheduledBackup', 'app-db-backup') as any
    expect(sb.spec.cluster.name).toBe('app-db')
    expect(sb.spec.schedule).toBe('0 3 * * *')
    expect(sb.spec.backupOwnerReference).toBe('self')
  })

  it('honors custom retention/schedule/compression/encryption', () => {
    const result = render(
      jsx(Database, {
        name: 'app-db',
        backup: {
          ...backup,
          credentialsSecret: 'my-creds',
          retention: '14d',
          schedule: '0 4 * * *',
          compression: 'bzip2',
          encryption: 'aws:kms',
        },
      })
    )
    const cluster = find(result, 'Cluster', 'app-db') as any
    expect(cluster.spec.backup.retentionPolicy).toBe('14d')
    expect(cluster.spec.backup.barmanObjectStore.data.compression).toBe('bzip2')
    expect(cluster.spec.backup.barmanObjectStore.wal.encryption).toBe('aws:kms')
    expect(find(result, 'ScheduledBackup', 'app-db-backup')).toHaveProperty(
      'spec.schedule',
      '0 4 * * *'
    )
  })

  it('is opt-in: no backup resources without the prop', () => {
    const result = render(jsx(Database, { name: 'app-db' }))
    const cluster = find(result, 'Cluster', 'app-db') as any
    expect(cluster.spec.backup).toBeUndefined()
    expect(find(result, 'ScheduledBackup', 'app-db-backup')).toBeUndefined()
  })

  it('throws without credentialsSecret and without a secrets backend', () => {
    expect(() => render(jsx(Database, { name: 'app-db', backup }))).toThrow(
      /credentialsSecret|secrets backend/
    )
  })

  it('provisions backup credentials from the openbao backend', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao(),
        children: jsx(Database, { name: 'app-db', backup }),
      })
    )
    const obss = find(result, 'OpenBaoStaticSecret', 'app-db-backup-credentials') as any
    expect(obss.spec.path).toBe('apps/app-db-s3-credentials')
    expect(obss.spec.destination.name).toBe('app-db-backup-credentials')
    const cluster = find(result, 'Cluster', 'app-db') as any
    expect(cluster.spec.backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe(
      'app-db-backup-credentials'
    )
  })

  it('renders credentials via VaultStaticSecret for the vault backend', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(Database, { name: 'app-db', backup }),
      })
    )
    expect(find(result, 'VaultStaticSecret', 'app-db-backup-credentials')).toBeDefined()
    expect(find(result, 'VaultStaticSecret', 'app-db-db-secret')).toBeDefined()
  })
})

describe('Database — rotation semantics', () => {
  it('passes provider refreshAfter onto generated static secrets', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao({ refreshAfter: '3600s' }),
        children: jsx(Database, { name: 'app-db' }),
      })
    )
    const obss = find(result, 'OpenBaoStaticSecret', 'app-db-db-secret') as any
    expect(obss.spec.refreshAfter).toBe('3600s')
  })

  it('renders rolloutRestartTargets on the credentials secret', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao(),
        children: jsx(Database, {
          name: 'app-db',
          rolloutRestartTargets: [{ name: 'my-app' }],
        }),
      })
    )
    const obss = find(result, 'OpenBaoStaticSecret', 'app-db-db-secret') as any
    expect(obss.spec.rolloutRestartTargets).toEqual([
      { apiVersion: 'apps/v1', kind: 'Deployment', name: 'my-app' },
    ])
  })
})

describe('WebService — pod placement and lifecycle', () => {
  const base = { name: 'app', image: 'ghcr.io/berget-ai/app:v1' }

  it('renders strategy Recreate', () => {
    const result = render(jsx(WebService, { ...base, strategy: 'Recreate' }))
    const dep = find(result, 'Deployment', 'app') as any
    expect(dep.spec.strategy.type).toBe('Recreate')
  })

  it('renders volumes, volumeMounts and initContainers', () => {
    const result = render(
      jsx(WebService, {
        ...base,
        volumes: [{ name: 'data', persistentVolumeClaim: { claimName: 'app-data' } }],
        volumeMounts: [{ name: 'data', mountPath: '/data' }],
        initContainers: [
          {
            name: 'chown',
            image: 'busybox:1.36',
            command: ['chown', '-R', '1000:1000', '/data'],
            volumeMounts: [{ name: 'data', mountPath: '/data' }],
          },
        ],
      })
    )
    const dep = find(result, 'Deployment', 'app') as any
    const pod = dep.spec.template.spec
    expect(pod.volumes).toHaveLength(1)
    expect(pod.volumes[0].persistentVolumeClaim.claimName).toBe('app-data')
    expect(pod.initContainers).toHaveLength(1)
    expect(pod.initContainers[0].name).toBe('chown')
    expect(pod.containers[0].volumeMounts).toEqual([{ name: 'data', mountPath: '/data' }])
  })

  it('renders startupProbe, lifecycle, imagePullSecrets and imagePullPolicy', () => {
    const result = render(
      jsx(WebService, {
        ...base,
        imagePullPolicy: 'IfNotPresent',
        imagePullSecrets: ['ghcr-pull-secret'],
        probes: { startup: { path: '/health', failureThreshold: 30 } },
        lifecycle: { preStop: { exec: { command: ['sh', '-c', 'drain.sh'] } } },
      })
    )
    const dep = find(result, 'Deployment', 'app') as any
    const pod = dep.spec.template.spec
    expect(pod.imagePullSecrets).toEqual([{ name: 'ghcr-pull-secret' }])
    const container = pod.containers[0]
    expect(container.imagePullPolicy).toBe('IfNotPresent')
    expect(container.startupProbe.httpGet.path).toBe('/health')
    expect(container.startupProbe.failureThreshold).toBe(30)
    expect(container.lifecycle.preStop.exec.command).toEqual(['sh', '-c', 'drain.sh'])
    // defaults unchanged
    expect(container.livenessProbe.httpGet.path).toBe('/health')
    expect(dep.spec.strategy).toBeUndefined()
  })

  it('derives imagePullPolicy from the tag: Always for floating, IfNotPresent for pinned', () => {
    const floating = render(jsx(WebService, { ...base, image: 'app:latest' }))
    expect(
      find(floating, 'Deployment', 'app').spec.template.spec.containers[0].imagePullPolicy
    ).toBe('Always')
    for (const tag of ['master', 'main', 'dev', 'edge', 'head', 'nightly', 'canary']) {
      const r = render(jsx(WebService, { ...base, image: `app:${tag}` }))
      expect(find(r, 'Deployment', 'app').spec.template.spec.containers[0].imagePullPolicy).toBe(
        'Always'
      )
    }
    const pinned = render(jsx(WebService, { ...base, image: 'app:1.2.3' }))
    expect(find(pinned, 'Deployment', 'app').spec.template.spec.containers[0].imagePullPolicy).toBe(
      'IfNotPresent'
    )
    const digest = render(jsx(WebService, { ...base, image: 'ghcr.io/x/app@sha256:abc123' }))
    expect(find(digest, 'Deployment', 'app').spec.template.spec.containers[0].imagePullPolicy).toBe(
      'IfNotPresent'
    )
    const withRegistryPort = render(jsx(WebService, { ...base, image: 'registry.local:5000/app' }))
    expect(
      find(withRegistryPort, 'Deployment', 'app').spec.template.spec.containers[0].imagePullPolicy
    ).toBe('Always')
    const explicit = render(
      jsx(WebService, { ...base, image: 'app:1.2.3', imagePullPolicy: 'Always' })
    )
    expect(
      find(explicit, 'Deployment', 'app').spec.template.spec.containers[0].imagePullPolicy
    ).toBe('Always')
  })

  it('derives Recreate for single-replica PVC-backed pods', () => {
    const withPvc = (overrides: object = {}) =>
      render(
        jsx(WebService, {
          ...base,
          replicas: 1,
          volumes: [{ name: 'data', persistentVolumeClaim: { claimName: 'pvc' } }],
          volumeMounts: [{ name: 'data', mountPath: '/data' }],
          ...overrides,
        })
      )
    expect(find(withPvc(), 'Deployment', 'app').spec.strategy.type).toBe('Recreate')
    // replicas > 1 keeps RollingUpdate — operators decide
    const scaled = withPvc({ replicas: 2 })
    expect(find(scaled, 'Deployment', 'app').spec.strategy).toBeUndefined()
    // no volumes → no opinion
    const stateless = render(jsx(WebService, { ...base, replicas: 1 }))
    expect(find(stateless, 'Deployment', 'app').spec.strategy).toBeUndefined()
    // explicit prop always wins
    const explicit = withPvc({ strategy: 'RollingUpdate' })
    expect(find(explicit, 'Deployment', 'app').spec.strategy.type).toBe('RollingUpdate')
    // emptyDir does not attach — no Recreate needed
    const ephemeral = render(
      jsx(WebService, {
        ...base,
        replicas: 1,
        volumes: [{ name: 'tmp', emptyDir: {} }],
        volumeMounts: [{ name: 'tmp', mountPath: '/tmp' }],
      })
    )
    expect(find(ephemeral, 'Deployment', 'app').spec.strategy).toBeUndefined()
  })

  it('names Service ports — the API server rejects multi-port Services without names', () => {
    const result = render(jsx(WebService, { ...base, port: 3000 }))
    const svc = find(result, 'Service', 'app') as any
    expect(svc.spec.ports).toHaveLength(2)
    for (const p of svc.spec.ports) {
      expect(p.name).toBeTruthy()
    }
    expect(svc.spec.ports[0]).toMatchObject({ name: 'http', port: 3000, targetPort: 3000 })
    expect(svc.spec.ports[1]).toMatchObject({ name: 'http-80', port: 80, targetPort: 3000 })

    const at80 = render(jsx(WebService, { ...base, port: 80 }))
    expect((find(at80, 'Service', 'app') as any).spec.ports).toHaveLength(1)
    expect((find(at80, 'Service', 'app') as any).spec.ports[0].name).toBe('http')
  })
})

describe('WebService — vault rotation semantics', () => {
  it('renders refreshAfter/rolloutRestartTargets/templates on VaultStaticSecret', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao({ refreshAfter: '3600s' }),
        children: jsx(WebService, {
          name: 'app',
          image: 'img:v1',
          vault: {
            N8N_ENCRYPTION_KEY: {
              mount: 'kv',
              path: 'n8n/app',
              key: 'encryption_key',
              rolloutRestartTargets: [{ name: 'app' }],
              templates: { N8N_ENCRYPTION_KEY: '{{ get .Secrets "encryption_key" }}' },
            },
          },
        }),
      })
    )
    const vss = find(result, 'VaultStaticSecret', 'app-n8n-encryption-key-vault') as any
    expect(vss.spec.refreshAfter).toBe('3600s') // inherited from the Platform secrets config
    expect(vss.spec.rolloutRestartTargets).toEqual([
      { apiVersion: 'apps/v1', kind: 'Deployment', name: 'app' },
    ])
    expect(vss.spec.destination.transformation.templates.N8N_ENCRYPTION_KEY.text).toBe(
      '{{ get .Secrets "encryption_key" }}'
    )
  })

  it('per-ref refreshAfter wins over the provider default', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao({ refreshAfter: '3600s' }),
        children: jsx(WebService, {
          name: 'app',
          image: 'img:v1',
          vault: { TOKEN: { mount: 'kv', path: 'app/token', refreshAfter: '60s' } },
        }),
      })
    )
    const vss = find(result, 'VaultStaticSecret', 'app-token-vault') as any
    expect(vss.spec.refreshAfter).toBe('60s')
  })
})
