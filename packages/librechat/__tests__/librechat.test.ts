import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// LibreChat recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, Meilisearch, all props, gateway/ingress adaptation
//   3. MongoDB wiring: MONGO_URI expansion + secretKeyRef credentials
//   4. Env wiring: reverse proxy, redis, search, session credentials,
//      upstream env names, no duplicate env names
//   5. Security: no plaintext credentials in rendered output
import { LibreChat } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

const mongodb = {
  host: 'mongo.data.svc.cluster.local',
  port: 27017,
  passwordSecret: 'chat-mongodb-credentials',
}

const sso = {
  issuer: 'https://keycloak.example.com/realms/platform',
  clientId: 'librechat',
  clientSecretRef: { secret: 'librechat-sso', key: 'clientSecret' },
}

/** Render LibreChat inside a Platform-like secrets backend (OpenBao). */
function renderLibreChat(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao as never,
      children: jsx(LibreChat, props as never),
    })
  )
}

/** Wrap LibreChat in an OperatorContext (no secrets backend). */
function elementWithContext(ops: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: ops,
    children: jsx(LibreChat, props as never),
  })
}

/**
 * k8s rejects duplicate env names in one container — assert every env
 * list we render is unique (this bit us with `$(VAR)` self-echoes of
 * secretKeyRef-backed vars).
 */
function assertUniqueEnvNames(env: Array<{ name: string }>): void {
  const names = env.map((e) => e.name)
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  expect(dupes).toEqual([])
  expect(new Set(names).size).toBe(names.length)
}

describe('operator declarations', () => {
  it('declares the redis operator when cache is enabled', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(true)
  })

  it('skips the redis operator when cache is disabled', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb, cache: false })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(false)
  })

  it('never declares cnpg (MongoDB is provisioned externally)', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(false)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      elementWithContext([operators['redis-operator']()], {
        host: 'chat.example.com',
        mongodb,
        secretsName: 'existing-secrets',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'redis-operator')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      elementWithContext([operators['redis-operator']('1.0.0')], {
        host: 'chat.example.com',
        mongodb,
        secretsName: 'existing-secrets',
      })
    )
    const redis = result.operators.filter((op) => op.name === 'redis-operator')
    expect(redis).toHaveLength(1)
    expect(redis[0].version).toBe('1.0.0')
  })
})

describe('rendering defaults', () => {
  it('renders app deployment, service, ingress and redis', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('RedisReplication')
    expect(kinds).not.toContain('RedisCluster')
    expect(kinds).toContain('OpenBaoStaticSecret')
  })

  it('renders a Meilisearch deployment with health probes and resources when search is enabled', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb, search: true })
    const deployments = result.resources.filter((r) => r.kind === 'Deployment')
    const services = result.resources.filter((r) => r.kind === 'Service')
    expect(deployments.map((d: any) => d.metadata.name)).toContain('librechat-meilisearch')
    expect(services.map((s: any) => s.metadata.name)).toContain('librechat-meilisearch')
    const meili = deployments.find((d: any) => d.metadata.name === 'librechat-meilisearch') as any
    expect(meili.spec.template.spec.containers[0].image).toBe('getmeili/meilisearch:v1.6')
    const meiliContainer = meili.spec.template.spec.containers[0]
    expect(meiliContainer.livenessProbe.httpGet).toEqual({ path: '/health', port: 7700 })
    expect(meiliContainer.readinessProbe.httpGet).toEqual({ path: '/health', port: 7700 })
    expect(meiliContainer.resources).toEqual({
      requests: { memory: '256Mi', cpu: '100m' },
      limits: { memory: '1Gi', cpu: '500m' },
    })
    assertUniqueEnvNames(meiliContainer.env)
  })

  it('renders no Meilisearch resources and no SEARCH flag when search is disabled', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const names = result.resources
      .filter((r) => r.kind === 'Deployment' || r.kind === 'Service')
      .map((r: any) => r.metadata.name)
    expect(names).not.toContain('librechat-meilisearch')
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'SEARCH')).toBeUndefined()
  })

  it('quotes the redis master service and enables USE_REDIS', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const redis = result.resources.find((r) => r.kind === 'RedisReplication') as any
    expect(redis.metadata.name).toBe('librechat-redis')
    expect(redis.spec.clusterSize).toBe(3)
    expect(redis.spec.kubernetesConfig.image).toBe('redis:7.2-alpine')

    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'USE_REDIS').value).toBe('true')
    expect(env.find((e: any) => e.name === 'REDIS_URI').value).toBe('redis://librechat-redis:6379')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(LibreChat, { host: 'chat.example.com', mongodb }),
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
          children: jsx(LibreChat, { host: 'chat.example.com', mongodb }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('chat.example.com')
  })

  it('sets websocket-friendly proxy annotations on the Ingress', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.metadata.annotations).toMatchObject({
      'nginx.ingress.kubernetes.io/proxy-read-timeout': '300',
      'nginx.ingress.kubernetes.io/proxy-send-timeout': '300',
      'nginx.ingress.kubernetes.io/proxy-buffering': 'off',
    })
  })

  it('passes resource validation', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb,
      search: true,
      sso,
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderLibreChat({
      name: 'chat',
      namespace: 'chat',
      version: '0.7.8',
      host: 'chat.example.com',
      port: 3080,
      replicas: 3,
      mongodb: { ...mongodb, username: 'chat' },
      cache: true,
      search: true,
      sso,
      backend: 'https://api.berget.ai/v1',
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'chat-tls', clusterIssuer: 'letsencrypt-prod' },
    })

    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'chat'
    ) as any
    expect(app).toBeDefined()
    expect(app.spec.replicas).toBe(3)
    expect(app.spec.template.spec.containers[0].image).toBe('ghcr.io/danny-avila/librechat:0.7.8')
    expect(app.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')
    expect(app.spec.template.spec.containers[0].ports[0].containerPort).toBe(3080)
    assertUniqueEnvNames(app.spec.template.spec.containers[0].env)
  })
})

describe('mongodb wiring', () => {
  it('builds MONGO_URI with $(VAR) expansion and the database named after the resource', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const mongoUri = env.find((e: any) => e.name === 'MONGO_URI')
    expect(mongoUri.value).toBe(
      'mongodb://$(MONGO_USERNAME):$(MONGO_PASSWORD)@mongo.data.svc.cluster.local:27017/librechat'
    )
  })

  it('appends authSource when the mongodb connection declares one', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb: { ...mongodb, authSource: 'admin' },
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'MONGO_URI').value).toBe(
      'mongodb://$(MONGO_USERNAME):$(MONGO_PASSWORD)@mongo.data.svc.cluster.local:27017/librechat?authSource=admin'
    )
  })

  it('delivers MONGO_USERNAME / MONGO_PASSWORD via secretKeyRef from the password secret', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const username = env.find((e: any) => e.name === 'MONGO_USERNAME')
    const password = env.find((e: any) => e.name === 'MONGO_PASSWORD')
    expect(username.valueFrom.secretKeyRef).toEqual({
      name: 'chat-mongodb-credentials',
      key: 'username',
    })
    expect(password.valueFrom.secretKeyRef).toEqual({
      name: 'chat-mongodb-credentials',
      key: 'password',
    })
    expect(username.value).toBeUndefined()
    expect(password.value).toBeUndefined()
  })

  it('inlines an explicitly provided username (identifier, not secret)', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb: { ...mongodb, username: 'chat' },
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const username = env.find((e: any) => e.name === 'MONGO_USERNAME')
    const password = env.find((e: any) => e.name === 'MONGO_PASSWORD')
    expect(username.value).toBe('chat')
    expect(username.valueFrom).toBeUndefined()
    expect(password.valueFrom.secretKeyRef.key).toBe('password')
  })

  it('shares MEILI_MASTER_KEY with the main app via the secrets bundle when search is on', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb, search: true })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'SEARCH').value).toBe('true')
    expect(env.find((e: any) => e.name === 'MEILI_HOST').value).toBe(
      'http://librechat-meilisearch:7700'
    )
    const meiliKey = env.find((e: any) => e.name === 'MEILI_MASTER_KEY')
    expect(meiliKey.valueFrom.secretKeyRef.name).toBe('librechat-secrets')
    expect(meiliKey.valueFrom.secretKeyRef.key).toBe('meiliMasterKey')
    expect(meiliKey.value).toBeUndefined()
    assertUniqueEnvNames(env)

    const meiliDeployment = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat-meilisearch'
    ) as any
    const meiliEnv = meiliDeployment.spec.template.spec.containers[0].env
    const meiliMasterKey = meiliEnv.find((e: any) => e.name === 'MEILI_MASTER_KEY')
    expect(meiliMasterKey.valueFrom.secretKeyRef.name).toBe('librechat-secrets')
    expect(meiliMasterKey.value).toBeUndefined()
  })
})

describe('session credentials', () => {
  it('wires JWT + CREDS multi-user credentials via secretKeyRef from the secrets bundle', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const jwtSecret = env.find((e: any) => e.name === 'JWT_SECRET')
    const jwtRefresh = env.find((e: any) => e.name === 'JWT_REFRESH_SECRET')
    const credsKey = env.find((e: any) => e.name === 'CREDS_KEY')
    const credsIv = env.find((e: any) => e.name === 'CREDS_IV')
    expect(jwtSecret).toMatchObject({
      valueFrom: { secretKeyRef: { name: 'librechat-secrets', key: 'jwtSecret' } },
    })
    expect(jwtRefresh).toMatchObject({
      valueFrom: { secretKeyRef: { name: 'librechat-secrets', key: 'jwtRefreshSecret' } },
    })
    expect(credsKey).toMatchObject({
      valueFrom: { secretKeyRef: { name: 'librechat-secrets', key: 'credsKey' } },
    })
    expect(credsIv).toMatchObject({
      valueFrom: { secretKeyRef: { name: 'librechat-secrets', key: 'credsIv' } },
    })
    for (const e of [jwtSecret, jwtRefresh, credsKey, credsIv]) {
      expect(e.value).toBeUndefined()
    }
    // REFRESH_TOKEN_EXPIRY is a plain TTL — delivered via configMapKeyRef
    const refreshTokenExpiry = env.find((e: any) => e.name === 'REFRESH_TOKEN_EXPIRY')
    expect(refreshTokenExpiry.valueFrom.configMapKeyRef).toEqual({
      name: 'librechat-config',
      key: 'REFRESH_TOKEN_EXPIRY',
    })
    expect(refreshTokenExpiry.value).toBeUndefined()
    const configMap = result.resources.find(
      (r: any) => r.kind === 'ConfigMap' && r.metadata.name === 'librechat-config'
    ) as any
    expect(configMap.data).toEqual({ REFRESH_TOKEN_EXPIRY: '604800' })
    assertUniqueEnvNames(env)
  })

  it('resolves session credential keys against an explicit secretsName', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb,
      secretsName: 'existing-secrets',
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    for (const envName of ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'CREDS_KEY', 'CREDS_IV']) {
      expect(env.find((e: any) => e.name === envName).valueFrom.secretKeyRef.name).toBe(
        'existing-secrets'
      )
    }
  })
})

describe('secrets handling', () => {
  it('provisions the app secrets bundle through a secrets backend', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const bao = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret') as any
    expect(bao).toBeDefined()
    expect(bao.spec.destination.name).toBe('librechat-secrets')
    expect(bao.spec.path).toBe('test/librechat/secrets')
  })

  it('provisions the app secrets bundle through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(LibreChat, { host: 'chat.example.com', mongodb }),
      })
    )
    const vault = result.resources.find((r) => r.kind === 'VaultStaticSecret') as any
    expect(vault).toBeDefined()
    expect(vault.spec.destination.name).toBe('librechat-secrets')
    expect(vault.spec.path).toBe('apps/librechat/secrets')
  })

  it('accepts an existing secretsName without a backend', () => {
    expect(() =>
      render(
        jsx(LibreChat, {
          host: 'chat.example.com',
          mongodb,
          secretsName: 'existing-secrets',
        })
      )
    ).not.toThrow()
    const result = render(
      jsx(LibreChat, {
        host: 'chat.example.com',
        mongodb,
        secretsName: 'existing-secrets',
      })
    )
    expect(
      result.resources.find(
        (r) => r.kind === 'OpenBaoStaticSecret' || r.kind === 'VaultStaticSecret'
      )
    ).toBeUndefined()
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'SECRET_KEY').valueFrom.secretKeyRef.name).toBe(
      'existing-secrets'
    )
  })

  it('throws when no secrets backend and no secretsName', () => {
    expect(() => render(jsx(LibreChat, { host: 'chat.example.com', mongodb }))).toThrow(
      /application secrets/
    )
  })

  it('wires app credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const secretKey = env.find((e: any) => e.name === 'SECRET_KEY')
    const modelApiKey = env.find((e: any) => e.name === 'OPENAI_API_KEY')
    expect(secretKey.valueFrom.secretKeyRef.name).toBe('librechat-secrets')
    expect(secretKey.valueFrom.secretKeyRef.key).toBe('secretKey')
    expect(modelApiKey.valueFrom.secretKeyRef.name).toBe('librechat-secrets')
    expect(modelApiKey.valueFrom.secretKeyRef.key).toBe('modelApiKey')
    expect(secretKey.value).toBeUndefined()
    expect(modelApiKey.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb,
      search: true,
      sso,
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('sso wiring', () => {
  it('sets OPENID env vars and wires the client secret via secretKeyRef', () => {
    const result = renderLibreChat({ host: 'chat.example.com', mongodb, sso })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const names = env.map((e: any) => e.name)
    assertUniqueEnvNames(env)
    expect(env.find((e: any) => e.name === 'ALLOW_SOCIAL_LOGIN').value).toBe('true')
    expect(env.find((e: any) => e.name === 'DOMAIN_SERVER').value).toBe('https://chat.example.com')
    expect(env.find((e: any) => e.name === 'DOMAIN_CLIENT').value).toBe('https://chat.example.com')
    expect(env.find((e: any) => e.name === 'OPENID_ISSUER').value).toBe(sso.issuer)
    expect(env.find((e: any) => e.name === 'OPENID_CLIENT_ID').value).toBe(sso.clientId)
    expect(env.find((e: any) => e.name === 'OPENID_SCOPES').value).toBe('openid profile email')
    expect(env.find((e: any) => e.name === 'OPENID_CALLBACK_URL').value).toBe(
      'https://chat.example.com/oauth/openid/callback'
    )
    const clientSecret = env.find((e: any) => e.name === 'OPENID_CLIENT_SECRET')
    expect(clientSecret.valueFrom.secretKeyRef).toEqual({
      name: 'librechat-sso',
      key: 'clientSecret',
    })
    expect(clientSecret.value).toBeUndefined()
    // no $(VAR) self-echo of the secretKeyRef-backed var
    expect(names).not.toContain('OPENID_SCOPE')
  })
})

describe('openai backend wiring', () => {
  it('routes model calls through OPENAI_REVERSE_PROXY (no OPENAI_API_BASE_URL)', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb,
      secretsName: 'existing-secrets',
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const names = env.map((e: any) => e.name)
    expect(env.find((e: any) => e.name === 'OPENAI_REVERSE_PROXY').value).toBe(
      'https://api.berget.ai/v1/chat/completions'
    )
    expect(names).not.toContain('OPENAI_API_BASE_URL')
  })

  it('honors a backend override with the chat/completions suffix', () => {
    const result = renderLibreChat({
      host: 'chat.example.com',
      mongodb,
      backend: 'https://api.example.com/v1',
      secretsName: 'existing-secrets',
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'librechat'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OPENAI_REVERSE_PROXY').value).toBe(
      'https://api.example.com/v1/chat/completions'
    )
  })
})
