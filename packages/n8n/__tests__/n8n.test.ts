import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// N8n recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation
//   3. Security: no plaintext credentials in rendered output
import { N8n } from '../src/index'

/** Render N8n inside a Platform-like secrets backend (OpenBao). */
function renderN8n(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: { backend: 'openbao', mount: 'kv', path: 'test' },
      children: jsx(N8n, props as never),
    })
  )
}

/** Render N8n wrapped only in an OperatorContext (no secrets backend). */
function renderN8nWithContext(operators_: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(N8n, props as never),
  })
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

describe('operator declarations', () => {
  it('declares the redis operator when queue mode is enabled', () => {
    const result = renderN8n({
      host: 'n8n.example.com',
      queueMode: true,
      encryptionKeySecretName: 'enc',
    })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(true)
  })

  it('does not declare the redis operator without queue mode', () => {
    const result = renderN8n({ host: 'n8n.example.com' })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(false)
  })

  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderN8n({ host: 'n8n.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderN8nWithContext([operators['redis-operator'](), operators['cnpg']()], {
        host: 'n8n.example.com',
        encryptionKeySecretName: 'existing-encryption',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'redis-operator')).toHaveLength(1)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      renderN8nWithContext([operators['redis-operator']('1.0.0')], {
        host: 'n8n.example.com',
        queueMode: true,
        encryptionKeySecretName: 'existing-encryption',
      })
    )
    const redis = result.operators.filter((op) => op.name === 'redis-operator')
    expect(redis).toHaveLength(1)
    expect(redis[0].version).toBe('1.0.0')
  })
})

describe('rendering defaults', () => {
  it('renders editor deployment, service, database and endpoint', () => {
    const result = renderN8n({ host: 'n8n.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
  })

  it('renders queue mode with Redis and workers', () => {
    const result = renderN8n({ host: 'n8n.example.com', queueMode: true, workers: 3 })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('RedisReplication')
    const deployments = result.resources.filter((r) => r.kind === 'Deployment')
    expect(deployments.map((d: any) => d.metadata.name)).toContain('n8n-worker')
    expect(deployments.map((d: any) => d.metadata.name)).toContain('n8n')
  })

  it('wires the worker to the RedisReplication service and health checks', () => {
    const result = renderN8n({ host: 'n8n.example.com', queueMode: true })
    const worker = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'n8n-worker'
    ) as any
    const env = worker.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'QUEUE_BULL_REDIS_HOST').value).toBe('n8n-redis')
    expect(env.find((e: any) => e.name === 'QUEUE_HEALTH_CHECK_ACTIVE').value).toBe('true')
    const probes = worker.spec.template.spec.containers[0]
    expect(probes.livenessProbe.httpGet.path).toBe('/healthz')
  })

  it('throws on multiple editor replicas without queue mode', () => {
    expect(() => renderN8n({ host: 'n8n.example.com', replicas: 3 })).toThrow(/queue mode/)
  })

  it('propagates the storage prop to the CNPG cluster', () => {
    const result = renderN8n({ host: 'n8n.example.com', storage: '30Gi' })
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.storage.size).toBe('30Gi')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(N8n, { host: 'n8n.example.com' }),
        }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('HTTPRoute')
  })

  it('renders a valid Ingress when platform uses ingress routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'ingress' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(N8n, { host: 'n8n.example.com' }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('n8n.example.com')
  })

  it('passes resource validation', () => {
    const result = renderN8n({ host: 'n8n.example.com', queueMode: true })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderN8n({
      name: 'automation',
      namespace: 'automation',
      version: '1.60.0',
      host: 'automation.example.com',
      replicas: 2,
      queueMode: true,
      workers: 4,
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'automation-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    expect(result.resources.length).toBeGreaterThan(0)
    const editor = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'automation'
    ) as any
    expect(editor.spec.template.spec.containers[0].image).toContain('1.60.0')
    expect(editor.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')
  })
})

describe('secrets handling', () => {
  it('accepts an explicit encryptionKeySecretName without a backend', () => {
    expect(() =>
      render(jsx(N8n, { host: 'n8n.example.com', encryptionKeySecretName: 'existing-encryption' }))
    ).not.toThrow()
  })

  it('provisions the encryption key through a secrets backend', () => {
    const result = renderN8n({ host: 'n8n.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
  })

  it('provisions the encryption key through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(N8n, { host: 'n8n.example.com' }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderN8n({
      host: 'n8n.example.com',
      encryptionKeySecretName: 'existing-encryption',
    })
    const editor = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'n8n'
    ) as any
    const env = editor.spec.template.spec.containers[0].env
    const encryption = env.find((e: any) => e.name === 'N8N_ENCRYPTION_KEY')
    const dbPassword = env.find((e: any) => e.name === 'DB_POSTGRESDB_PASSWORD')
    expect(encryption.valueFrom.secretKeyRef.name).toBe('existing-encryption')
    expect(dbPassword.valueFrom.secretKeyRef.name).toBe('n8n-db-credentials')
    expect(encryption.value).toBeUndefined()
    expect(dbPassword.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderN8n({ host: 'n8n.example.com', queueMode: true })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('validation errors', () => {
  it('throws when no secrets backend and no encryption key secret', () => {
    expect(() => render(jsx(N8n, { host: 'n8n.example.com' }))).toThrow(/encryption key/)
  })

  it('throws for unknown secrets backends', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'unknown' as never },
          children: jsx(N8n, { host: 'n8n.example.com' }),
        })
      )
    ).toThrow(/encryption key/)
  })
})

describe('facit deltas', () => {
  const editorSpec = (result: ReturnType<typeof renderN8n>) =>
    (result.resources.find((r: any) => r.kind === 'Deployment' && r.metadata.name === 'n8n') as any)
      .spec.template.spec

  it('pins the release by default and skips re-pulling immutable tags', () => {
    const spec = editorSpec(renderN8n({ host: 'n8n.example.com' }))
    expect(spec.containers[0].image).toBe('docker.n8n.io/n8nio/n8n:2.35.5')
    expect(spec.containers[0].imagePullPolicy).toBe('IfNotPresent')
  })

  it('imagePullPolicy reverts to Always for floating tags', () => {
    const spec = editorSpec(renderN8n({ host: 'n8n.example.com', version: 'latest' }))
    expect(spec.containers[0].imagePullPolicy).toBe('Always')
  })

  it('dataStorage renders a PVC, mounts it at /home/node/.n8n, fixes ownership and rolls Recreate', () => {
    const result = renderN8n({ host: 'n8n.example.com', dataStorage: '5Gi' })
    const pvc = result.resources.find((r: any) => r.kind === 'PersistentVolumeClaim') as any
    expect(pvc).toBeDefined()
    expect(pvc.spec.resources.requests.storage).toBe('5Gi')
    const spec = editorSpec(result)
    const pod = (
      result.resources.find((r: any) => r.kind === 'Deployment' && r.metadata.name === 'n8n') as any
    ).spec.template
    expect(
      spec.containers[0].volumeMounts.some((m: any) => m.mountPath === '/home/node/.n8n')
    ).toBe(true)
    expect(pod.spec.initContainers.some((c: any) => c.name === 'fix-data-permissions')).toBe(true)
    expect(
      (
        result.resources.find(
          (r: any) => r.kind === 'Deployment' && r.metadata.name === 'n8n'
        ) as any
      ).spec.strategy.type
    ).toBe('Recreate')
    const env = spec.containers[0].env
    expect(env.find((e: any) => e.name === 'N8N_DEFAULT_BINARY_DATA_MODE').value).toBe('filesystem')
  })

  it('keeps binary data in Postgres without a data volume or in queue mode', () => {
    for (const props of [
      { host: 'n8n.example.com' },
      { host: 'n8n.example.com', queueMode: true, dataStorage: '5Gi' },
    ]) {
      const env = editorSpec(renderN8n(props)).containers[0].env
      expect(env.find((e: any) => e.name === 'N8N_DEFAULT_BINARY_DATA_MODE').value).toBe('default')
    }
  })

  it('passes the backup prop through to the CNPG cluster', () => {
    const result = renderN8n({
      host: 'n8n.example.com',
      backup: {
        destinationPath: 's3://bucket/n8n-cnpg',
        endpointURL: 'https://s3.example.com',
      },
    })
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe('s3://bucket/n8n-cnpg')
  })

  it('prunes executions after 168h by default; pruning: false removes both env entries', () => {
    const env = editorSpec(renderN8n({ host: 'n8n.example.com' })).containers[0].env
    expect(env.find((e: any) => e.name === 'EXECUTIONS_DATA_PRUNE').value).toBe('true')
    expect(env.find((e: any) => e.name === 'EXECUTIONS_DATA_MAX_AGE').value).toBe('168')
    const envOff = editorSpec(renderN8n({ host: 'n8n.example.com', pruning: false })).containers[0]
      .env
    expect(envOff.find((e: any) => e.name === 'EXECUTIONS_DATA_PRUNE')).toBeUndefined()
    expect(envOff.find((e: any) => e.name === 'EXECUTIONS_DATA_MAX_AGE')).toBeUndefined()
  })

  it('trusting the ingress proxy by default (N8N_PROXY_HOPS=1), overridable', () => {
    const env = editorSpec(renderN8n({ host: 'n8n.example.com' })).containers[0].env
    expect(env.find((e: any) => e.name === 'N8N_PROXY_HOPS').value).toBe('1')
    const envCustom = editorSpec(renderN8n({ host: 'n8n.example.com', proxyHops: 3 })).containers[0]
      .env
    expect(envCustom.find((e: any) => e.name === 'N8N_PROXY_HOPS').value).toBe('3')
  })

  it('does not grant builtin node functions unless explicitly opted in', () => {
    const env = editorSpec(renderN8n({ host: 'n8n.example.com' })).containers[0].env
    expect(env.find((e: any) => e.name === 'NODE_FUNCTION_ALLOW_BUILTIN')).toBeUndefined()
    const envOptIn = editorSpec(
      renderN8n({ host: 'n8n.example.com', allowBuiltinNodeFunctions: '*' })
    ).containers[0].env
    expect(envOptIn.find((e: any) => e.name === 'NODE_FUNCTION_ALLOW_BUILTIN').value).toBe('*')
  })

  it('adds long-lived-connection ingress annotations and allows overrides', () => {
    const result = renderN8n({ host: 'n8n.example.com' })
    const ingress = result.resources.find((r: any) => r.kind === 'Ingress') as any
    expect(ingress.metadata.annotations['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe(
      '3600'
    )
    const resultCustom = renderN8n({
      host: 'n8n.example.com',
      endpointAnnotations: { 'nginx.ingress.kubernetes.io/proxy-read-timeout': '900' },
    })
    const ingressCustom = resultCustom.resources.find((r: any) => r.kind === 'Ingress') as any
    expect(
      ingressCustom.metadata.annotations['nginx.ingress.kubernetes.io/proxy-read-timeout']
    ).toBe('900')
  })

  it('rotations restart the editor (and workers) when the backend provisions the key', () => {
    const result = renderN8n({ host: 'n8n.example.com' })
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vso.spec.refreshAfter).toBe('1h')
    expect(
      vso.spec.rolloutRestartTargets.some((t: any) => t.kind === 'Deployment' && t.name === 'n8n')
    ).toBe(true)
  })

  it('supports a custom encryption-secret key name end-to-end', () => {
    const result = renderN8n({
      host: 'n8n.example.com',
      encryptionSecret: { key: 'N8N_ENCRYPTION_KEY' },
    })
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vso.spec.destination.transformation.templates.N8N_ENCRYPTION_KEY).toContain(
      'N8N_ENCRYPTION_KEY'
    )
    const env = editorSpec(result).containers[0].env
    expect(env.find((e: any) => e.name === 'N8N_ENCRYPTION_KEY').valueFrom.secretKeyRef.key).toBe(
      'N8N_ENCRYPTION_KEY'
    )
  })
})

describe('secretKeyRef wiring in queue mode', () => {
  it('worker deployment uses the same credentials secret', () => {
    const result = renderN8n({
      host: 'n8n.example.com',
      queueMode: true,
      encryptionKeySecretName: 'existing-encryption',
    })
    const worker = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'n8n-worker'
    ) as any
    expect(worker).toBeDefined()
    const env = worker.spec.template.spec.containers[0].env
    const dbPassword = env.find((e: any) => e.name === 'DB_POSTGRESDB_PASSWORD')
    expect(dbPassword.valueFrom.secretKeyRef.name).toBe('n8n-db-credentials')
    expect(dbPassword.value).toBeUndefined()
  })
})
