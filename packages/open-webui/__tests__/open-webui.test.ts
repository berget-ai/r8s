import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// Open WebUI recipe tests:
//   1. Operator declarations (cnpg via Database, redis, deduped via OperatorContext)
//   2. Rendering: defaults incl. uploads PVC, all props, gateway/ingress adaptation
//   3. Env wiring: upstream env names, no duplicate env names, probes, offline mode
//   4. Security: no plaintext credentials in rendered output
import { OpenWebui } from '../src/index'

/** Render OpenWebui inside a Platform-like secrets backend (OpenBao). */
function renderOpenWebui(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: { backend: 'openbao', mount: 'kv', path: 'test' },
      children: jsx(OpenWebui, props as never),
    })
  )
}

/** Render OpenWebui wrapped only in an OperatorContext (no secrets backend). */
function renderOpenWebuiWithContext(operators_: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(OpenWebui, props as never),
  })
}

/**
 * k8s rejects duplicate env names in one container — assert every env
 * list we render is unique.
 */
function assertUniqueEnvNames(env: Array<{ name: string }>): void {
  const names = env.map((e) => e.name)
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  expect(dupes).toEqual([])
  expect(new Set(names).size).toBe(names.length)
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('declares the redis operator when cache is enabled', () => {
    const result = renderOpenWebui({ host: 'chat.example.com', cache: true })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(true)
  })

  it('does not declare operators when cache is off (default)', () => {
    const result = render(
      jsx(OpenWebui, { host: 'chat.example.com', secretsName: 'existing-secrets' })
    )
    const names = result.operators.map((op) => op.name)
    expect(names).toContain('cnpg')
    expect(names).not.toContain('redis-operator')
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderOpenWebuiWithContext([operators['redis-operator'](), operators['cnpg']()], {
        host: 'chat.example.com',
        cache: true,
        secretsName: 'existing-secrets',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'redis-operator')).toHaveLength(1)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      renderOpenWebuiWithContext([operators['redis-operator']('1.0.0')], {
        host: 'chat.example.com',
        cache: true,
        secretsName: 'existing-secrets',
      })
    )
    const redis = result.operators.filter((op) => op.name === 'redis-operator')
    expect(redis).toHaveLength(1)
    expect(redis[0].version).toBe('1.0.0')
  })
})

describe('rendering defaults', () => {
  it('renders deployment, service, uploads PVC, database and endpoint', () => {
    const result = renderOpenWebui({ host: 'chat.example.com', storage: '10Gi' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('PersistentVolumeClaim')

    const pvc = result.resources.find(
      (r) => r.kind === 'PersistentVolumeClaim' && (r as any).metadata.name === 'open-webui-uploads'
    ) as any
    expect(pvc.spec.accessModes).toEqual(['ReadWriteOnce'])
    expect(pvc.spec.resources.requests.storage).toBe('10Gi')
  })

  it('wires the deployment image, port, probes and PVC mount', () => {
    const result = renderOpenWebui({ host: 'chat.example.com', storage: '10Gi' })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const container = app.spec.template.spec.containers[0]
    expect(container.image).toBe('ghcr.io/open-webui/open-webui:latest')
    expect(container.ports[0].containerPort).toBe(8080)
    expect(container.livenessProbe.httpGet).toEqual({ path: '/health', port: 8080 })
    expect(container.readinessProbe.httpGet).toEqual({ path: '/health', port: 8080 })
    // First boot runs Alembic migrations — probes give the app room
    expect(container.livenessProbe.initialDelaySeconds).toBe(30)
    expect(container.livenessProbe.failureThreshold).toBe(6)
    expect(container.readinessProbe.initialDelaySeconds).toBe(30)
    expect(container.readinessProbe.failureThreshold).toBe(6)
    expect(container.volumeMounts).toEqual([{ name: 'uploads', mountPath: '/app/backend/data' }])
    expect(app.spec.template.spec.volumes).toEqual([
      { name: 'uploads', persistentVolumeClaim: { claimName: 'open-webui-uploads' } },
    ])
  })

  it('renders no PVC or volumes when storage is not set', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('PersistentVolumeClaim')
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const container = app.spec.template.spec.containers[0]
    expect(container.volumeMounts).toBeUndefined()
    expect(app.spec.template.spec.volumes).toBeUndefined()
  })

  it('provisions Redis replication and REDIS_URL against the master service', () => {
    const result = renderOpenWebui({ host: 'chat.example.com', cache: true })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('RedisReplication')
    expect(kinds).not.toContain('RedisCluster')

    const redis = result.resources.find((r) => r.kind === 'RedisReplication') as any
    expect(redis.metadata.name).toBe('open-webui-redis')
    expect(redis.spec.clusterSize).toBe(3)
    expect(redis.spec.kubernetesConfig.image).toBe('redis:7.2-alpine')

    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const redisUrl = app.spec.template.spec.containers[0].env.find(
      (e: any) => e.name === 'REDIS_URL'
    )
    expect(redisUrl.value).toBe('redis://open-webui-redis:6379')
  })

  it('defaults ENABLE_OLLAMA_API to false', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'ENABLE_OLLAMA_API').value).toBe('false')
    assertUniqueEnvNames(env)
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(OpenWebui, { host: 'chat.example.com' }),
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
          children: jsx(OpenWebui, { host: 'chat.example.com' }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('chat.example.com')
  })

  it('points the Ingress at the service on port 8080', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.spec.rules[0].http.paths[0].backend.service.name).toBe('open-webui')
    expect(ingress.spec.rules[0].http.paths[0].backend.service.port.number).toBe(8080)
  })

  it('passes resource validation', () => {
    const result = renderOpenWebui({
      host: 'chat.example.com',
      storage: '10Gi',
      cache: true,
      sso: {
        issuer: 'https://keycloak.example.com/realms/platform',
        clientId: 'open-webui',
        clientSecretRef: { secret: 'open-webui-sso', key: 'clientSecret' },
      },
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderOpenWebui({
      name: 'chat',
      namespace: 'chat',
      version: 'v0.6.5',
      host: 'chat.example.com',
      replicas: 3,
      backend: 'https://api.example.com/v1',
      cache: true,
      sso: {
        issuer: 'https://keycloak.example.com/realms/platform',
        clientId: 'chat',
        clientSecretRef: { secret: 'chat-sso', key: 'clientSecret' },
        scopes: 'openid email profile groups',
      },
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'chat-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    expect(result.resources.length).toBeGreaterThan(0)

    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'chat'
    ) as any
    const container = app.spec.template.spec.containers[0]
    expect(container.image).toBe('ghcr.io/open-webui/open-webui:v0.6.5')
    expect(app.spec.replicas).toBe(3)
    expect(container.resources.limits.memory).toBe('4Gi')

    const backendUrl = container.env.find((e: any) => e.name === 'OPENAI_API_BASE_URL')
    expect(backendUrl.value).toBe('https://api.example.com/v1')

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('RedisReplication')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
    assertUniqueEnvNames(container.env)
  })
})

describe('offline mode', () => {
  it('sets OFFLINE_MODE, disables update checks and keeps Ollama off', () => {
    const result = renderOpenWebui({ host: 'chat.example.com', offline: true })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OFFLINE_MODE').value).toBe('true')
    expect(env.find((e: any) => e.name === 'ENABLE_UPDATE_CHECK').value).toBe('false')
    expect(env.find((e: any) => e.name === 'ENABLE_OLLAMA_API').value).toBe('false')
    assertUniqueEnvNames(env)
  })

  it('leaves runtime networking untouched when offline is not set', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OFFLINE_MODE')).toBeUndefined()
    expect(env.find((e: any) => e.name === 'ENABLE_UPDATE_CHECK')).toBeUndefined()
  })
})

describe('secrets handling', () => {
  it('provisions the model API key and secret key through OpenBao', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    const kind = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret') as any
    expect(kind).toBeDefined()
    expect(kind.metadata.name).toBe('open-webui-secrets')
    expect(kind.spec.path).toBe('test/open-webui/secrets')
    expect(kind.spec.destination).toEqual({ create: true, name: 'open-webui-secrets' })
  })

  it('provisions the keys through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(OpenWebui, { host: 'chat.example.com' }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
    expect(kinds).not.toContain('OpenBaoStaticSecret')
  })

  it('accepts an explicit secretsName without a backend', () => {
    expect(() =>
      render(jsx(OpenWebui, { host: 'chat.example.com', secretsName: 'existing-secrets' }))
    ).not.toThrow()
    const result = render(
      jsx(OpenWebui, { host: 'chat.example.com', secretsName: 'existing-secrets' })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('OpenBaoStaticSecret')
    expect(kinds).not.toContain('VaultStaticSecret')
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderOpenWebui({ host: 'chat.example.com', secretsName: 'existing-secrets' })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const modelKey = env.find((e: any) => e.name === 'OPENAI_API_KEY')
    const webuiSecret = env.find((e: any) => e.name === 'WEBUI_SECRET_KEY')
    const dbPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(modelKey.valueFrom.secretKeyRef.name).toBe('existing-secrets')
    expect(modelKey.valueFrom.secretKeyRef.key).toBe('modelApiKey')
    expect(webuiSecret.valueFrom.secretKeyRef.name).toBe('existing-secrets')
    expect(webuiSecret.valueFrom.secretKeyRef.key).toBe('secretKey')
    expect(dbPassword.valueFrom.secretKeyRef.name).toBe('open-webui-db-credentials')
    expect(dbPassword.valueFrom.secretKeyRef.key).toBe('password')
    expect(modelKey.value).toBeUndefined()
    expect(webuiSecret.value).toBeUndefined()
    expect(dbPassword.value).toBeUndefined()
  })

  it('declares secretKeyRef env entries before dependent $(VAR) expansion', () => {
    const result = renderOpenWebui({ host: 'chat.example.com' })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const names = env.map((e: any) => e.name)
    assertUniqueEnvNames(env)
    expect(names.indexOf('PGPASSWORD')).toBeLessThan(names.indexOf('DATABASE_URL'))
    const databaseUrl = env.find((e: any) => e.name === 'DATABASE_URL')
    expect(databaseUrl.value).toBe(
      'postgresql://open-webui:$(PGPASSWORD)@open-webui-rw:5432/open-webui'
    )
    const modelKey = env.find((e: any) => e.name === 'OPENAI_API_KEY')
    const backendUrl = env.find((e: any) => e.name === 'OPENAI_API_BASE_URL')
    expect(names.indexOf('OPENAI_API_KEY')).toBeLessThan(names.indexOf('OPENAI_API_BASE_URL'))
    expect(modelKey.valueFrom.secretKeyRef.name).toBe('open-webui-secrets')
    expect(backendUrl.value).toBe('https://api.berget.ai/v1')
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderOpenWebui({
      host: 'chat.example.com',
      storage: '10Gi',
      cache: true,
      sso: {
        issuer: 'https://keycloak.example.com/realms/platform',
        clientId: 'open-webui',
        clientSecretRef: { secret: 'open-webui-sso', key: 'clientSecret' },
      },
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('sso wiring', () => {
  it('wires upstream OAUTH env names and the client secret via secretKeyRef', () => {
    const result = renderOpenWebui({
      host: 'chat.example.com',
      sso: {
        issuer: 'https://keycloak.example.com/realms/platform',
        clientId: 'open-webui',
        clientSecretRef: { secret: 'open-webui-sso', key: 'clientSecret' },
        scopes: 'openid email profile',
      },
    })
    const app = result.resources.find(
      (r) => r.kind === 'Deployment' && (r as any).metadata.name === 'open-webui'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const names = env.map((e: any) => e.name)
    assertUniqueEnvNames(env)

    const clientId = env.find((e: any) => e.name === 'OAUTH_CLIENT_ID')
    const clientSecret = env.find((e: any) => e.name === 'OAUTH_CLIENT_SECRET')
    const providerUrl = env.find((e: any) => e.name === 'OPENID_PROVIDER_URL')
    const scopes = env.find((e: any) => e.name === 'OAUTH_SCOPES')
    const redirectUri = env.find((e: any) => e.name === 'OPENID_REDIRECT_URI')
    expect(clientId.value).toBe('open-webui')
    expect(clientSecret.valueFrom.secretKeyRef.name).toBe('open-webui-sso')
    expect(clientSecret.valueFrom.secretKeyRef.key).toBe('clientSecret')
    expect(clientSecret.value).toBeUndefined()
    // OPENID_PROVIDER_URL is the issuer — Open WebUI appends the
    // /.well-known/openid-configuration discovery path itself
    expect(providerUrl.value).toBe('https://keycloak.example.com/realms/platform')
    expect(scopes.value).toBe('openid email profile')
    expect(redirectUri.value).toBe('https://chat.example.com/oauth/oidc/callback')
    expect(env.find((e: any) => e.name === 'ENABLE_OAUTH_SIGNUP').value).toBe('true')
    // legacy env names must not leak
    expect(names).not.toContain('OPENID_CLIENT_ID')
    expect(names).not.toContain('OPENID_CLIENT_SECRET')
    expect(names).not.toContain('OPENID_SCOPES')
    expect(names).not.toContain('ENABLE_OPENID_SIGNUP')
  })
})

describe('validation errors', () => {
  it('throws when no secrets backend and no existing Secret ref', () => {
    expect(() => render(jsx(OpenWebui, { host: 'chat.example.com' }))).toThrow(
      /application secrets/
    )
  })

  it('throws for unknown secrets backends', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'unknown' as never },
          children: jsx(OpenWebui, { host: 'chat.example.com' }),
        })
      )
    ).toThrow(/application secrets/)
  })

  it('throws when storage is combined with multiple replicas (RWO single attach)', () => {
    expect(() =>
      renderOpenWebui({ host: 'chat.example.com', storage: '10Gi', replicas: 2 })
    ).toThrow(/storage with replicas/)
  })

  it('allows single-replica storage and multi-replica without storage', () => {
    expect(() =>
      renderOpenWebui({ host: 'chat.example.com', storage: '10Gi', replicas: 1 })
    ).not.toThrow()
    expect(() => renderOpenWebui({ host: 'chat.example.com', replicas: 3 })).not.toThrow()
  })
})
