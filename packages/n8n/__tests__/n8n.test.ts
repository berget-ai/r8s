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
