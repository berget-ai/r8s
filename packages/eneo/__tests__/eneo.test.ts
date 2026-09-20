import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import { S3Provider, Bucket } from '@r8s/recipes'
import type { r8sElement } from '@r8s/core'

// Eneo recipe tests:
//   1. Operator declarations (deduped via OperatorContext) — cnpg + redis
//   2. Rendering: backend + frontend deployments, defaults, all props,
//      gateway/ingress adaptation, dbStorage
//   3. Namespace inheritance from the Platform context
//   4. Security: no plaintext credentials in rendered output
//   5. objectStorage resolution: explicit wins → <Bucket/> descriptor →
//      derived from the S3Provider → actionable throw without either
//   6. The eneo-ai split contract: image pins, POSTGRES_*/REDIS_* env,
//      frontend→backend wiring, host→frontend + /api→backend routing
import { Eneo } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

/** Render Eneo inside a Platform-like secrets backend (OpenBao). */
function renderEneo(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao as never,
      children: jsx(Eneo, { backup: false, ...(props ?? {}) } as never),
    })
  )
}

/** Render Eneo inside a Platform-like Namespace context (no explicit namespace prop). */
function renderEneoInNamespace(
  namespaceValue: string,
  props: Record<string, unknown>
): ReturnType<typeof render> {
  return render(
    jsx(Namespace.Provider, {
      value: namespaceValue,
      children: jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(Eneo, { backup: false, ...(props ?? {}) } as never),
      }),
    })
  )
}

/** Wrap Eneo in an OperatorContext (no secrets backend). */
function elementWithContext(ops: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: ops,
    children: jsx(Eneo, { backup: false, ...(props ?? {}) } as never),
  })
}

const objectStorage = {
  endpoint: 'https://s3.internal.example.com',
  bucket: 'eneo-corpora',
  credentialsSecret: 'eneo-object-storage',
}

const sso = {
  issuer: 'https://keycloak.example.com/realms/platform',
  clientId: 'eneo',
  clientSecretRef: { secret: 'eneo-sso', key: 'clientSecret' },
}

/** Fetch a rendered Deployment by exact name. */
function deployment(result: ReturnType<typeof render>, name: string): any {
  return result.resources.find(
    (r: any) => r.kind === 'Deployment' && r.metadata.name === name
  ) as any
}

const containerOf = (dep: any) => dep.spec.template.spec.containers[0]
const envOf = (env: any[], name: string) => env.find((e: any) => e.name === name)

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('declares the redis operator — the ARQ queue is required by the backend image', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(true)
  })

  it('renders a Redis replication set at ${name}-redis', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const redis = result.resources.find((r: any) => r.kind === 'RedisReplication') as any
    expect(redis).toBeDefined()
    expect(redis.metadata.name).toBe('eneo-redis')
    expect(redis.spec.kubernetesConfig.image).toBe('redis:7.2-alpine')
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      elementWithContext([operators['cnpg']()], {
        host: 'eneo.example.com',
        objectStorage,
        secretsName: 'existing-secrets',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
    expect(names.filter((n) => n === 'redis-operator')).toHaveLength(1)
  })
})

describe('rendering defaults', () => {
  it('renders backend + frontend deployments, services, ingress, redis and database cluster', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(deployment(result, 'eneo-backend')).toBeDefined()
    expect(deployment(result, 'eneo-frontend')).toBeDefined()
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('RedisReplication')
  })

  it('pins both deployments to the public eneo-ai images (2.1.1 by default)', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(containerOf(deployment(result, 'eneo-backend')).image).toBe(
      'ghcr.io/eneo-ai/eneo-backend:2.1.1'
    )
    expect(containerOf(deployment(result, 'eneo-frontend')).image).toBe(
      'ghcr.io/eneo-ai/eneo-frontend:2.1.1'
    )
  })

  it('applies the version prop to both images', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage, version: '2.2.0' })
    expect(containerOf(deployment(result, 'eneo-backend')).image).toBe(
      'ghcr.io/eneo-ai/eneo-backend:2.2.0'
    )
    expect(containerOf(deployment(result, 'eneo-frontend')).image).toBe(
      'ghcr.io/eneo-ai/eneo-frontend:2.2.0'
    )
  })

  it('probes the backend on /openapi.json and the frontend on /', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const backend = containerOf(deployment(result, 'eneo-backend'))
    expect(backend.livenessProbe.httpGet).toEqual({ path: '/openapi.json', port: 8000 })
    expect(backend.readinessProbe.httpGet).toEqual({ path: '/openapi.json', port: 8000 })
    const frontend = containerOf(deployment(result, 'eneo-frontend'))
    expect(frontend.livenessProbe.httpGet).toEqual({ path: '/', port: 3000 })
    expect(frontend.readinessProbe.httpGet).toEqual({ path: '/', port: 3000 })
  })

  it('mirrors the image user contract: fsGroup 1000 on the backend, none on the frontend', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const backendPod = deployment(result, 'eneo-backend').spec.template.spec
    expect(backendPod.securityContext.fsGroup).toBe(1000)
    expect(backendPod.volumes.map((v: any) => v.name).sort()).toEqual(['data', 'tmp'])
    expect(backendPod.containers[0].imagePullPolicy).toBe('IfNotPresent')
    const frontendPod = deployment(result, 'eneo-frontend').spec.template.spec
    expect(frontendPod.securityContext).toBeUndefined()
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Eneo, { backup: false, host: 'eneo.example.com', objectStorage }),
        }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('HTTPRoute')
    // One shared Gateway for the host — the API path routes attach to it
    expect(
      result.resources.filter((r: any) => r.kind === 'Gateway').map((r) => r.metadata.name)
    ).toEqual(['eneo-endpoint-gateway'])
  })

  it('routes the host to the frontend and the API prefixes to the backend (gateway mode)', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Eneo, { backup: false, host: 'eneo.example.com', objectStorage }),
        }),
      })
    )
    const main = result.resources.find(
      (r: any) => r.kind === 'HTTPRoute' && r.metadata.name === 'eneo-endpoint-route'
    ) as any
    expect(main).toBeDefined()
    expect(main.spec.rules[0].matches).toBeUndefined()
    expect(main.spec.rules[0].backendRefs).toEqual([{ name: 'eneo-frontend', port: 3000 }])

    const api = result.resources.find(
      (r: any) => r.kind === 'HTTPRoute' && r.metadata.name === 'eneo-api-endpoint-route'
    ) as any
    expect(api).toBeDefined()
    expect(api.spec.rules[0].matches[0].path).toEqual({ type: 'PathPrefix', value: '/api' })
    expect(api.spec.rules[0].backendRefs).toEqual([{ name: 'eneo-backend', port: 8000 }])
    // every route hangs off the one shared gateway
    for (const name of [
      'eneo-docs-endpoint-route',
      'eneo-openapi-json-endpoint-route',
      'eneo-version-endpoint-route',
    ]) {
      const route = result.resources.find(
        (r: any) => r.kind === 'HTTPRoute' && r.metadata.name === name
      ) as any
      expect(route).toBeDefined()
      expect(route.spec.parentRefs).toEqual([{ name: 'eneo-endpoint-gateway' }])
    }
  })

  it('renders a valid Ingress when platform uses ingress routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'ingress' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Eneo, { backup: false, host: 'eneo.example.com', objectStorage }),
        }),
      })
    )
    const ingress = result.resources.find(
      (r: any) => r.kind === 'Ingress' && r.metadata.name === 'eneo-endpoint'
    ) as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('eneo.example.com')
    expect(ingress.spec.rules[0].http.paths[0].backend.service).toEqual({
      name: 'eneo-frontend',
      port: { number: 3000 },
    })
  })

  it('routes /api to the backend while / stays on the frontend (ingress mode)', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'ingress' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Eneo, { backup: false, host: 'eneo.example.com', objectStorage }),
        }),
      })
    )
    const apiIngress = result.resources.find(
      (r: any) => r.kind === 'Ingress' && r.metadata.name === 'eneo-api-endpoint'
    ) as any
    expect(apiIngress).toBeDefined()
    expect(apiIngress.spec.rules[0].http.paths[0]).toEqual({
      path: '/api',
      pathType: 'Prefix',
      backend: { service: { name: 'eneo-backend', port: { number: 8000 } } },
    })
    // The API ingresses carry no DNS annotation (declared once on the main)
    expect(
      apiIngress.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']
    ).toBeUndefined()
  })

  it('defaults replicas to 2 on backend and frontend', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(deployment(result, 'eneo-backend').spec.replicas).toBe(2)
    expect(deployment(result, 'eneo-frontend').spec.replicas).toBe(2)
  })

  it('passes resource validation', () => {
    const result = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      sso,
      smtp: { host: 'smtp.example.com', port: 587, from: 'no-reply@eneo.example.com' },
      dbStorage: '50Gi',
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('namespace inheritance', () => {
  it('inherits namespace from the Platform context when namespace prop is not set', () => {
    const result = renderEneoInNamespace('ai', { host: 'eneo.example.com', objectStorage })
    const kinds = new Set(result.resources.map((r: any) => r.kind))
    for (const kind of ['Deployment', 'Service', 'Cluster', 'Ingress']) {
      expect(kinds.has(kind)).toBe(true)
    }
    for (const deploymentName of ['eneo-backend', 'eneo-frontend']) {
      expect(deployment(result, deploymentName).metadata.namespace).toBe('ai')
    }
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.metadata.namespace).toBe('ai')
    const ingress = result.resources.find((r: any) => r.kind === 'Ingress') as any
    expect(ingress.metadata.namespace).toBe('ai')
  })

  it('inherits non-default context namespace even with multiple levels', () => {
    const result = renderEneoInNamespace('team-corpora', {
      host: 'eneo.example.com',
      objectStorage,
      secretsName: 'existing-secrets',
    })
    expect(deployment(result, 'eneo-backend').metadata.namespace).toBe('team-corpora')
    expect(deployment(result, 'eneo-frontend').metadata.namespace).toBe('team-corpora')
  })

  it('explicit namespace prop wins over the Platform context', () => {
    const result = renderEneoInNamespace('ai', {
      host: 'eneo.example.com',
      objectStorage,
      namespace: 'assistant-ns',
    })
    expect(deployment(result, 'eneo-backend').metadata.namespace).toBe('assistant-ns')
    expect(deployment(result, 'eneo-frontend').metadata.namespace).toBe('assistant-ns')
  })

  it('falls back to default when no Platform namespace is present', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(deployment(result, 'eneo-backend').metadata.namespace).toBe('default')
    expect(deployment(result, 'eneo-frontend').metadata.namespace).toBe('default')
  })
})

describe('document corpus storage', () => {
  it('renders no PVC (corpora live in object storage; local corpus PVC is a v1.1 item)', () => {
    const result = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      dbStorage: '50Gi',
    })
    expect(result.resources.map((r) => r.kind)).not.toContain('PersistentVolumeClaim')
  })

  it('passes dbStorage to the Postgres cluster (default 10Gi)', () => {
    const defaults = renderEneo({ host: 'eneo.example.com', objectStorage })
    const defaultCluster = defaults.resources.find((r) => r.kind === 'Cluster') as any
    expect(defaultCluster.spec.storage.size).toBe('10Gi')

    const result = renderEneo({ host: 'eneo.example.com', objectStorage, dbStorage: '50Gi' })
    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.storage.size).toBe('50Gi')
  })

  it('bootstraps the pgvector extension (Eneo stores vectors in Postgres)', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.bootstrap.initdb.postInitApplicationSQL).toEqual([
      'CREATE EXTENSION IF NOT EXISTS vector;',
    ])
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderEneo({
      name: 'assistant',
      namespace: 'ai',
      version: '1.4.0',
      host: 'assistant.example.com',
      replicas: 3,
      objectStorage: { ...objectStorage, bucket: 'assistant-corpora', region: 'eu-north-1' },
      sso,
      smtp: { host: 'smtp.example.com', port: 587, from: 'no-reply@assistant.example.com' },
      dbStorage: '100Gi',
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'assistant-tls', clusterIssuer: 'letsencrypt-prod' },
    })

    const backend = deployment(result, 'assistant-backend')
    expect(backend).toBeDefined()
    expect(backend.spec.replicas).toBe(3)
    expect(containerOf(backend).image).toBe('ghcr.io/eneo-ai/eneo-backend:1.4.0')
    expect(containerOf(backend).resources.limits.memory).toBe('4Gi')
    expect(deployment(result, 'assistant-frontend')).toBeDefined()
    expect(containerOf(deployment(result, 'assistant-frontend')).image).toBe(
      'ghcr.io/eneo-ai/eneo-frontend:1.4.0'
    )
    expect(deployment(result, 'assistant-frontend').spec.replicas).toBe(3)

    const env = containerOf(backend).env
    expect(env.find((e: any) => e.name === 'S3_BUCKET').value).toBe('assistant-corpora')
    expect(env.find((e: any) => e.name === 'AWS_REGION').value).toBe('eu-north-1')
    // The upstream images discovery contract (issuer + /.well-known/…)
    expect(env.find((e: any) => e.name === 'OIDC_DISCOVERY_ENDPOINT').value).toBe(
      'https://keycloak.example.com/realms/platform/.well-known/openid-configuration'
    )
    expect(env.find((e: any) => e.name === 'SMTP_HOST').value).toBe('smtp.example.com')
    expect(env.find((e: any) => e.name === 'SMTP_PORT').value).toBe('587')
    expect(env.find((e: any) => e.name === 'SMTP_FROM').value).toBe(
      'no-reply@assistant.example.com'
    )

    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.storage.size).toBe('100Gi')
  })

  it('renders unique env var names (k8s rejects duplicates)', () => {
    const result = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      sso,
      smtp: { host: 'smtp.example.com' },
    })
    for (const deploymentName of ['eneo-backend', 'eneo-frontend']) {
      const env = containerOf(deployment(result, deploymentName)).env as Array<{ name: string }>
      const names = env.map((e) => e.name)
      expect(new Set(names).size).toBe(names.length)
      // The OIDC client secret must come from the secretKeyRef entry only —
      // no plain env duplicate.
      expect(names.filter((n) => n === 'OIDC_CLIENT_SECRET')).toHaveLength(1)
    }
  })
})

describe('eneo-ai image contract', () => {
  it('wires the backend POSTGRES_*/REDIS_* settings contract (required fields in the image)', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const env = containerOf(deployment(result, 'eneo-backend')).env as any[]
    expect(envOf(env, 'POSTGRES_HOST').value).toBe('eneo-rw')
    expect(envOf(env, 'POSTGRES_PORT').value).toBe('5432')
    expect(envOf(env, 'POSTGRES_DB').value).toBe('eneo')
    expect(envOf(env, 'POSTGRES_USER').value).toBe('eneo')
    expect(envOf(env, 'REDIS_HOST').value).toBe('eneo-redis')
    expect(envOf(env, 'REDIS_PORT').value).toBe('6379')
    expect(envOf(env, 'PUBLIC_ORIGIN').value).toBe('https://eneo.example.com')
  })

  it('wires the frontend to the backend Service and the public host', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const env = containerOf(deployment(result, 'eneo-frontend')).env as any[]
    expect(envOf(env, 'ENEO_BACKEND_SERVER_URL').value).toBe('http://eneo-backend:8000')
    expect(envOf(env, 'ENEO_BACKEND_URL').value).toBe('https://eneo.example.com')
    expect(envOf(env, 'PUBLIC_ENEO_BACKEND_URL').value).toBe('https://eneo.example.com')
    expect(envOf(env, 'ORIGIN').value).toBe('https://eneo.example.com')
    expect(envOf(env, 'NODE_ENV').value).toBe('production')
    // The frontend runs outside the Database context — no DB vars leak in
    expect(envOf(env, 'PGPASSWORD')).toBeUndefined()
    expect(envOf(env, 'DATABASE_URL')).toBeUndefined()
  })

  it('signs cookies with the shared appSecret on BOTH deployments (JWT_SECRET must match)', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    for (const deploymentName of ['eneo-backend', 'eneo-frontend']) {
      const jwt = envOf(containerOf(deployment(result, deploymentName)).env as any[], 'JWT_SECRET')
      expect(jwt.value).toBeUndefined()
      expect(jwt.valueFrom.secretKeyRef).toEqual({ name: 'eneo-secrets', key: 'appSecret' })
    }
  })
})

describe('secrets handling', () => {
  it('provisions app secrets through the openbao backend', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const bao = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(bao).toBeDefined()
    expect(bao.spec.destination.name).toBe('eneo-secrets')
    expect(bao.spec.path).toBe('test/eneo/secrets')
  })

  it('provisions app secrets through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(Eneo, { backup: false, host: 'eneo.example.com', objectStorage }),
      })
    )
    const vault = result.resources.find((r: any) => r.kind === 'VaultStaticSecret') as any
    expect(vault).toBeDefined()
    expect(vault.spec.destination.name).toBe('eneo-secrets')
    expect(vault.spec.path).toBe('apps/eneo/secrets')
  })

  it('throws when no secrets backend and no secretsName (bundle requires appSecret)', () => {
    expect(() =>
      render(jsx(Eneo, { backup: false, host: 'eneo.example.com', objectStorage }))
    ).toThrow(/application secrets \(appSecret\)/)
  })

  it('requires smtpPassword from the bundle only when the smtp prop is set', () => {
    expect(() =>
      render(
        jsx(Eneo, { host: 'eneo.example.com', objectStorage, smtp: { host: 'smtp.example.com' } })
      )
    ).toThrow(/application secrets \(appSecret, smtpPassword\)/)
  })

  it('accepts an existing secretsName without a backend', () => {
    expect(() =>
      render(
        jsx(Eneo, {
          backup: false,
          host: 'eneo.example.com',
          objectStorage,
          secretsName: 'existing-secrets',
        })
      )
    ).not.toThrow()
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      sso,
      smtp: { host: 'smtp.example.com' },
      secretsName: 'existing-secrets',
    })
    const env = containerOf(deployment(result, 'eneo-backend')).env
    const appSecret = env.find((e: any) => e.name === 'JWT_SECRET')
    const smtpPassword = env.find((e: any) => e.name === 'SMTP_PASSWORD')
    const awsAccessKey = env.find((e: any) => e.name === 'AWS_ACCESS_KEY_ID')
    const oidcClientSecret = env.find((e: any) => e.name === 'OIDC_CLIENT_SECRET')
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    const postgresPassword = env.find((e: any) => e.name === 'POSTGRES_PASSWORD')
    expect(appSecret.valueFrom.secretKeyRef).toEqual({
      name: 'existing-secrets',
      key: 'appSecret',
    })
    expect(smtpPassword.valueFrom.secretKeyRef).toEqual({
      name: 'existing-secrets',
      key: 'smtpPassword',
    })
    expect(awsAccessKey.valueFrom.secretKeyRef).toEqual({
      name: 'eneo-object-storage',
      key: 'accessKey',
    })
    expect(oidcClientSecret.valueFrom.secretKeyRef).toEqual({
      name: 'eneo-sso',
      key: 'clientSecret',
    })
    expect(pgPassword.valueFrom.secretKeyRef.name).toBe('eneo-db-credentials')
    // The image's POSTGRES_* contract points at the SAME credentials Secret
    // as the recipe's PGPASSWORD — resolved via databaseCredentialsRef
    expect(postgresPassword.valueFrom.secretKeyRef).toEqual(pgPassword.valueFrom.secretKeyRef)
    for (const e of [
      appSecret,
      smtpPassword,
      awsAccessKey,
      oidcClientSecret,
      pgPassword,
      postgresPassword,
    ]) {
      expect(e.value).toBeUndefined()
    }
  })

  it('injects SMTP password via secretKeyRef only when smtp is configured', () => {
    const withSmtp = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      smtp: { host: 'smtp.example.com', port: 465, from: 'no-reply@eneo.example.com' },
      secretsName: 'existing-secrets',
    })
    const smtpEnv = containerOf(deployment(withSmtp, 'eneo-backend')).env
    const smtpPassword = smtpEnv.find((e: any) => e.name === 'SMTP_PASSWORD')
    expect(smtpPassword.valueFrom.secretKeyRef).toEqual({
      name: 'existing-secrets',
      key: 'smtpPassword',
    })
    expect(smtpPassword.value).toBeUndefined()
    expect(smtpEnv.find((e: any) => e.name === 'SMTP_HOST').value).toBe('smtp.example.com')
    expect(smtpEnv.find((e: any) => e.name === 'SMTP_PORT').value).toBe('465')
    expect(smtpEnv.find((e: any) => e.name === 'SMTP_FROM').value).toBe('no-reply@eneo.example.com')

    const withoutSmtp = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      secretsName: 'existing-secrets',
    })
    const plainEnv = containerOf(deployment(withoutSmtp, 'eneo-backend')).env
    expect(plainEnv.find((e: any) => e.name === 'SMTP_PASSWORD')).toBeUndefined()
    expect(plainEnv.find((e: any) => e.name === 'SMTP_HOST')).toBeUndefined()
  })

  it('auto-wires DATABASE_URL from the Database context without plaintext', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const env = containerOf(deployment(result, 'eneo-backend')).env
    const dbUrl = env.find((e: any) => e.name === 'DATABASE_URL')
    expect(dbUrl.value).toBe(
      'postgresql://$(PGUSER):$(PGPASSWORD)@$(PGHOST):$(PGPORT)/$(PGDATABASE)'
    )
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderEneo({
      host: 'eneo.example.com',
      objectStorage,
      sso,
      smtp: { host: 'smtp.example.com', port: 587, from: 'no-reply@eneo.example.com' },
      dbStorage: '50Gi',
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('no secrets backend — CNPG-generated credentials contract', () => {
  it('references the CNPG-generated <name>-app secret without a secrets backend', () => {
    const result = render(
      jsx(Eneo, {
        backup: false,
        host: 'eneo.example.com',
        secretsName: 'eneo-secrets',
        objectStorage: {
          endpoint: 'https://s3.example.com',
          bucket: 'eneo-corpora',
          credentialsSecret: 'eneo-object-storage',
        },
      } as never)
    )
    const env = containerOf(deployment(result, 'eneo-backend')).env
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(pgPassword.valueFrom.secretKeyRef).toEqual({ name: 'eneo-app', key: 'password' })
    const postgresPassword = env.find((e: any) => e.name === 'POSTGRES_PASSWORD')
    expect(postgresPassword.valueFrom.secretKeyRef).toEqual({ name: 'eneo-app', key: 'password' })

    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster).toBeDefined()
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
  })
})

describe('objectStorage — derives from the S3Provider', () => {
  const s3Config = {
    endpoint: 'https://rustfs:9000',
    bucket: 'infra',
    credentialsSecret: 'infra-s3-creds',
  }

  const backendEnv = (result: ReturnType<typeof render>) =>
    containerOf(deployment(result, 'eneo-backend')).env as any[]
  const envOf = (env: any[], name: string) => env.find((e: any) => e.name === name)

  /** Eneo under an S3Provider only (secrets referenced explicitly). */
  function renderEneoUnderS3Provider(
    props: Record<string, unknown>,
    provider = s3Config
  ): ReturnType<typeof render> {
    return render(
      jsx(S3Provider as never, {
        provider,
        children: jsx(Eneo, {
          backup: false,
          host: 'eneo.example.com',
          secretsName: 'eneo-secrets',
          ...props,
        } as never),
      })
    )
  }

  it('omitted under an S3Provider: the app derives endpoint/bucket/credentials', () => {
    const result = renderEneoUnderS3Provider({})
    const env = backendEnv(result)
    expect(envOf(env, 'S3_ENDPOINT').value).toBe(s3Config.endpoint)
    expect(envOf(env, 'S3_BUCKET').value).toBe(s3Config.bucket)
    const accessKey = envOf(env, 'AWS_ACCESS_KEY_ID')
    expect(accessKey.value).toBeUndefined()
    expect(accessKey.valueFrom.secretKeyRef).toEqual({
      name: s3Config.credentialsSecret,
      key: 'accessKey',
    })
  })

  it('omitted under an S3Provider: backups default on and derive too', () => {
    const result = render(
      jsx(S3Provider as never, {
        provider: s3Config,
        children: jsx(Eneo, {
          host: 'eneo.example.com',
          secretsName: 'eneo-secrets',
        } as never),
      })
    )
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.backup.barmanObjectStore.endpointURL).toBe(s3Config.endpoint)
    expect(result.resources.filter((r: any) => r.kind === 'ScheduledBackup')).toHaveLength(1)
  })

  it('explicit object wins over the surrounding provider', () => {
    const result = renderEneoUnderS3Provider({ objectStorage })
    const env = backendEnv(result)
    expect(envOf(env, 'S3_ENDPOINT').value).toBe(objectStorage.endpoint)
    expect(envOf(env, 'S3_BUCKET').value).toBe(objectStorage.bucket)
    expect(envOf(env, 'AWS_ACCESS_KEY_ID').valueFrom.secretKeyRef.name).toBe(
      objectStorage.credentialsSecret
    )
  })

  it('<Bucket/> descriptor: provider config is used (name is the scope, bucket comes from the provider)', () => {
    const result = renderEneoUnderS3Provider({
      objectStorage: jsx(Bucket as never, { name: 'eneo' } as never),
    })
    const env = backendEnv(result)
    expect(envOf(env, 'S3_BUCKET').value).toBe(s3Config.bucket)
    expect(envOf(env, 'S3_ENDPOINT').value).toBe(s3Config.endpoint)
  })

  it('<Bucket/> descriptor: the bucket override selects a different bucket', () => {
    const result = renderEneoUnderS3Provider({
      objectStorage: jsx(Bucket as never, { name: 'eneo', bucket: 'corpora' } as never),
    })
    expect(envOf(backendEnv(result), 'S3_BUCKET').value).toBe('corpora')
  })

  it('omitted without a provider throws the actionable guidance (what/why/how)', () => {
    // secretsName satisfies the instance-secrets decision so the storage
    // guidance is what surfaces
    expect(() =>
      render(
        jsx(Eneo, {
          backup: false,
          host: 'eneo.example.com',
          secretsName: 'eneo-secrets',
        })
      )
    ).toThrow(
      /Eneo "eneo" needs object storage[\s\S]*no <S3Provider> in scope[\s\S]*no objectStorage prop[\s\S]*Fix:[\s\S]*<S3Provider[\s\S]*or pass a <Bucket> descriptor[\s\S]*objectStorage=\{<Bucket name="…"/
    )
  })
})
