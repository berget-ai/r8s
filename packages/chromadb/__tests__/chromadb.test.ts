import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// ChromaDb recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation
//   3. Security: no plaintext credentials in rendered output
import { ChromaDb } from '../src/index'

/** Render ChromaDb inside a Platform-like secrets backend (OpenBao). */
function renderChromaDb(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: { backend: 'openbao', mount: 'kv', path: 'test' },
      children: jsx(ChromaDb, props as never),
    })
  )
}

/** Render ChromaDb wrapped only in an OperatorContext (no secrets backend). */
function renderChromaDbWithContext(operators_: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(ChromaDb, props as never),
  })
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe when pg is enabled', () => {
    const result = renderChromaDb({ host: 'vectors.example.com', pg: true })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('requires no cnpg operator without pg', () => {
    const result = renderChromaDb({ host: 'vectors.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(false)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderChromaDbWithContext([operators['cnpg']()], {
        host: 'vectors.example.com',
        pg: true,
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      renderChromaDbWithContext([operators['cnpg']('1.26.0')], {
        host: 'vectors.example.com',
        pg: true,
      })
    )
    const cnpg = result.operators.filter((op) => op.name === 'cnpg')
    expect(cnpg).toHaveLength(1)
    expect(cnpg[0].version).toBe('1.26.0')
  })
})

describe('rendering defaults', () => {
  it('renders PVC, deployment, service and endpoint', () => {
    const result = renderChromaDb({ host: 'vectors.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('PersistentVolumeClaim')
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).not.toContain('Cluster')
  })

  it('defaults to a single replica (RWO-safe)', () => {
    const result = renderChromaDb({ host: 'vectors.example.com' })
    const deployment = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    expect(deployment.spec.replicas).toBe(1)
  })

  it('renders the data PVC with the requested storage', () => {
    const result = renderChromaDb({ host: 'vectors.example.com' })
    const pvc = result.resources.find((r) => r.kind === 'PersistentVolumeClaim') as any
    expect(pvc.metadata.name).toBe('chromadb-data')
    expect(pvc.spec.resources.requests.storage).toBe('50Gi')
  })

  it('wires the v2 heartbeat health checks on port 8000', () => {
    const result = renderChromaDb({ host: 'vectors.example.com' })
    const deployment = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    const container = deployment.spec.template.spec.containers[0]
    expect(container.livenessProbe.httpGet.path).toBe('/api/v2/heartbeat')
    expect(container.livenessProbe.httpGet.port).toBe(8000)
    expect(container.readinessProbe.httpGet.path).toBe('/api/v2/heartbeat')
    expect(container.ports[0].containerPort).toBe(8000)
    expect(container.volumeMounts).toContainEqual({ name: 'data', mountPath: '/data' })
    expect(deployment.spec.template.spec.volumes[0].persistentVolumeClaim.claimName).toBe(
      'chromadb-data'
    )
  })

  it('supports the probePath prop for older v1-API images', () => {
    const result = renderChromaDb({
      host: 'vectors.example.com',
      probePath: '/api/v1/heartbeat',
    })
    const deployment = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    const container = deployment.spec.template.spec.containers[0]
    expect(container.livenessProbe.httpGet.path).toBe('/api/v1/heartbeat')
    expect(container.readinessProbe.httpGet.path).toBe('/api/v1/heartbeat')
  })

  it('wires CHROMA_SERVER_HTTP_PORT to the port prop on a custom port', () => {
    const result = renderChromaDb({ host: 'vectors.example.com', port: 9000 })
    const deployment = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    const container = deployment.spec.template.spec.containers[0]
    const httpPort = container.env.find((e: any) => e.name === 'CHROMA_SERVER_HTTP_PORT')
    expect(httpPort.value).toBe('9000')
    expect(container.ports[0].containerPort).toBe(9000)
    const service = result.resources.find(
      (r) => r.kind === 'Service' && r.metadata.name === 'chromadb'
    ) as any
    expect(service.spec.ports[0].port).toBe(9000)
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(ChromaDb, { host: 'vectors.example.com' }),
        }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('HTTPRoute')
    expect(kinds).not.toContain('Ingress')
  })

  it('renders a valid Ingress when platform uses ingress routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'ingress' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(ChromaDb, { host: 'vectors.example.com' }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('vectors.example.com')
    expect(ingress.spec.rules[0].http.paths[0].backend.service.port.number).toBe(8000)
  })

  it('passes resource validation', () => {
    const result = renderChromaDb({
      host: 'vectors.example.com',
      pg: true,
      autoscaling: true,
      storageClassName: 'fast-ssd-rwx',
      auth: true,
      authTokenSecretName: 'chromadb-auth-token',
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderChromaDb({
      name: 'vectors',
      namespace: 'ai',
      version: '0.6.3',
      host: 'vectors.example.com',
      port: 8000,
      replicas: 3,
      storage: '100Gi',
      storageClassName: 'fast-ssd-rwx',
      auth: true,
      authTokenSecretName: 'vectors-auth-token',
      autoscaling: true,
      pg: true,
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'vectors-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    const deployment = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'vectors'
    ) as any
    expect(deployment.spec.template.spec.containers[0].image).toBe(
      'ghcr.io/chroma-core/chroma:0.6.3'
    )
    expect(deployment.spec.replicas).toBe(3)
    expect(deployment.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')

    const pvc = result.resources.find((r) => r.kind === 'PersistentVolumeClaim') as any
    expect(pvc.metadata.name).toBe('vectors-data')
    expect(pvc.spec.resources.requests.storage).toBe('100Gi')
    expect(pvc.spec.storageClassName).toBe('fast-ssd-rwx')

    const hpa = result.resources.find((r) => r.kind === 'HorizontalPodAutoscaler') as any
    expect(hpa).toBeDefined()
    expect(hpa.spec.scaleTargetRef).toMatchObject({ kind: 'Deployment', name: 'vectors' })
    expect(hpa.spec.minReplicas).toBe(3)
    expect(hpa.spec.maxReplicas).toBe(9)
    expect(hpa.spec.metrics[0].resource.target.averageUtilization).toBe(70)

    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster).toBeDefined()
    expect(cluster.metadata.name).toBe('vectors-meta')
  })
})

describe('secrets handling', () => {
  it('accepts an explicit authTokenSecretName without a backend', () => {
    expect(() =>
      render(
        jsx(ChromaDb, {
          host: 'vectors.example.com',
          auth: true,
          authTokenSecretName: 'existing-token-secret',
        })
      )
    ).not.toThrow()
  })

  it('provisions the auth token through a secrets backend at <path>/<name>/auth-token', () => {
    const result = renderChromaDb({ host: 'vectors.example.com', auth: true })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
    const secret = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret') as any
    expect(secret.metadata.name).toBe('chromadb-auth-token')
    expect(secret.spec.path).toBe('test/chromadb/auth-token')
    expect(secret.spec.destination.name).toBe('chromadb-auth-token')
  })

  it('provisions the auth token through vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'ai' },
        children: jsx(ChromaDb, { name: 'vectors', host: 'vectors.example.com', auth: true }),
      })
    )
    const secret = result.resources.find((r) => r.kind === 'VaultStaticSecret') as any
    expect(secret).toBeDefined()
    expect(secret.spec.path).toBe('ai/vectors/auth-token')
    expect(secret.spec.destination.name).toBe('vectors-auth-token')
  })

  it('wires the backend-provisioned auth token via secretKeyRef', () => {
    const result = renderChromaDb({ host: 'vectors.example.com', auth: true })
    const deployment = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    const env = deployment.spec.template.spec.containers[0].env
    const token = env.find((e: any) => e.name === 'CHROMA_SERVER_AUTH_CREDENTIALS')
    expect(token.valueFrom.secretKeyRef.name).toBe('chromadb-auth-token')
    expect(token.valueFrom.secretKeyRef.key).toBe('token')
    expect(token.value).toBeUndefined()
  })

  it('wires the auth token via secretKeyRef (never plaintext env)', () => {
    const result = renderChromaDb({
      host: 'vectors.example.com',
      auth: true,
      authTokenSecretName: 'existing-token-secret',
    })
    const deployment = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    const env = deployment.spec.template.spec.containers[0].env
    const token = env.find((e: any) => e.name === 'CHROMA_SERVER_AUTH_CREDENTIALS')
    expect(token.valueFrom.secretKeyRef.name).toBe('existing-token-secret')
    expect(token.valueFrom.secretKeyRef.key).toBe('token')
    expect(token.value).toBeUndefined()
  })

  it('wires Postgres credentials via secretKeyRef when pg is enabled', () => {
    const result = renderChromaDb({ host: 'vectors.example.com', pg: true })
    const deployment = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'chromadb'
    ) as any
    const env = deployment.spec.template.spec.containers[0].env
    const host = env.find((e: any) => e.name === 'CHROMA_POSTGRES_HOST')
    const password = env.find((e: any) => e.name === 'CHROMA_POSTGRES_PASSWORD')
    expect(host.value).toBe('chromadb-meta-rw')
    expect(password.valueFrom.secretKeyRef.name).toBe('chromadb-meta-db-credentials')
    expect(password.valueFrom.secretKeyRef.key).toBe('password')
    expect(password.value).toBeUndefined()
  })

  it('provisions Postgres credentials through the openbao backend when pg is enabled', () => {
    const result = renderChromaDb({ host: 'vectors.example.com', pg: true })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
  })

  it('provisions Postgres credentials through vault when pg is enabled', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(ChromaDb, { host: 'vectors.example.com', pg: true }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderChromaDb({
      name: 'vectors',
      host: 'vectors.example.com',
      replicas: 3,
      storageClassName: 'vectors-rwx',
      auth: true,
      authTokenSecretName: 'vectors-auth-token',
      autoscaling: true,
      pg: true,
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('validation errors', () => {
  it('throws when auth is enabled without an auth token secret or backend', () => {
    expect(() => render(jsx(ChromaDb, { host: 'vectors.example.com', auth: true }))).toThrow(
      /auth token/
    )
  })

  it('throws when autoscaling on RWO storage without an RWX StorageClass', () => {
    expect(() =>
      renderChromaDb({
        host: 'vectors.example.com',
        autoscaling: true,
        storageClassName: 'fast-ssd',
      })
    ).toThrow(/Multi-Attach/)
    expect(() => renderChromaDb({ host: 'vectors.example.com', autoscaling: true })).toThrow(
      /ReadWriteMany/
    )
    // Explicit RWX class names (any case) are allowed
    expect(() =>
      renderChromaDb({
        host: 'vectors.example.com',
        autoscaling: true,
        storageClassName: 'NFS-RWX',
      })
    ).not.toThrow()
  })
})
