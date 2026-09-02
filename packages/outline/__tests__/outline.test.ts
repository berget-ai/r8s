import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// Outline recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation
//   3. Security: no plaintext credentials in rendered output
import { Outline } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

/** Render Outline inside a Platform-like secrets backend (OpenBao). */
function renderOutline(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao as never,
      children: jsx(Outline, props as never),
    })
  )
}

/** Wrap Outline in an OperatorContext (no secrets backend). */
function elementWithContext(ops: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: ops,
    children: jsx(Outline, props as never),
  })
}

const objectStorage = {
  endpoint: 'https://s3.internal.example.com',
  bucket: 'wiki-attachments',
  credentialsSecret: 'wiki-attachments-credentials',
}

const sso = {
  issuer: 'https://keycloak.example.com/realms/platform',
  clientId: 'outline',
  clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },
}

describe('operator declarations', () => {
  it('declares the redis operator when cache is enabled', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(true)
  })

  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('skips the redis operator when cache is disabled', () => {
    const result = renderOutline({ host: 'wiki.example.com', cache: false })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(false)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      elementWithContext([operators['redis-operator'](), operators['cnpg']()], {
        host: 'wiki.example.com',
        secretsName: 'existing-secrets',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'redis-operator')).toHaveLength(1)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })
})

describe('rendering defaults', () => {
  it('renders deployment, service, ingress, database and redis', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('RedisReplication')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Outline, { host: 'wiki.example.com' }),
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
          children: jsx(Outline, { host: 'wiki.example.com' }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('wiki.example.com')
  })

  it('passes resource validation', () => {
    const result = renderOutline({
      host: 'wiki.example.com',
      objectStorage,
      sso,
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderOutline({
      name: 'wiki',
      namespace: 'docs',
      version: '0.78.0',
      host: 'docs.example.com',
      replicas: 3,
      objectStorage: { ...objectStorage, bucket: 'docs' },
      sso,
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'docs-tls', clusterIssuer: 'letsencrypt-prod' },
    })

    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'wiki'
    ) as any
    expect(app).toBeDefined()
    expect(app.spec.replicas).toBe(3)
    expect(app.spec.template.spec.containers[0].image).toContain('0.78.0')
    expect(app.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')
  })

  it('wires S3 and SSO on the app when configured', () => {
    const result = renderOutline({
      host: 'wiki.example.com',
      objectStorage,
      sso,
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'AWS_S3_UPLOAD_BUCKET_NAME').value).toBe(
      'wiki-attachments'
    )
    expect(env.find((e: any) => e.name === 'OIDC_ISSUER').value).toBe(sso.issuer)
  })
})

describe('secrets handling', () => {
  it('provisions app secrets through a secrets backend', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
  })

  it('throws when no secrets backend and no secretsName', () => {
    expect(() => render(jsx(Outline, { host: 'wiki.example.com' }))).toThrow(/application secrets/)
  })

  it('accepts an existing secretsName without a backend', () => {
    expect(() =>
      render(jsx(Outline, { host: 'wiki.example.com', secretsName: 'existing-secrets' }))
    ).not.toThrow()
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderOutline({ host: 'wiki.example.com', secretsName: 'existing-secrets' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const secretKey = env.find((e: any) => e.name === 'SECRET_KEY')
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(secretKey.valueFrom.secretKeyRef.name).toBe('existing-secrets')
    expect(pgPassword.valueFrom.secretKeyRef.name).toBe('outline-db-credentials')
    expect(secretKey.value).toBeUndefined()
    expect(pgPassword.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderOutline({
      host: 'wiki.example.com',
      objectStorage,
      sso,
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})
