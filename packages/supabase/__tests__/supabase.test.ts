import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// Supabase recipe tests:
//   1. Operator declarations (cnpg via Database, deduped via OperatorContext)
//   2. Rendering: defaults (>=5 service deployments), all props, gateway/ingress adaptation
//   3. Security: no plaintext credentials in rendered output
import { Supabase } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

const objectStorage = {
  endpoint: 'https://s3.internal.example.com',
  bucket: 'supabase-uploads',
  credentialsSecret: 'object-store-credentials',
}

/** Render Supabase inside a Platform-like secrets backend (OpenBao). */
function renderSupabase(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao as never,
      children: jsx(Supabase, props as never),
    })
  )
}

/** Render Supabase wrapped only in an OperatorContext (no secrets backend). */
function renderSupabaseWithContext(operators_: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(Supabase, props as never),
  })
}

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderSupabaseWithContext([operators['cnpg']()], {
        host: 'backend.example.com',
        objectStorage,
        jwtSecretsName: 'existing-jwt',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      renderSupabaseWithContext([operators['cnpg']('1.27.0')], {
        host: 'backend.example.com',
        objectStorage,
        jwtSecretsName: 'existing-jwt',
      })
    )
    const cnpg = result.operators.filter((op) => op.name === 'cnpg')
    expect(cnpg).toHaveLength(1)
    expect(cnpg[0].version).toBe('1.27.0')
  })
})

describe('rendering defaults', () => {
  it('renders the service suite, database and endpoint', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
    const deployments = result.resources.filter((r) => r.kind === 'Deployment')
    expect(deployments.length).toBeGreaterThanOrEqual(5)
    const names = deployments.map((d: any) => d.metadata.name)
    expect(names).toContain('supabase-gotrue')
    expect(names).toContain('supabase-postgrest')
    expect(names).toContain('supabase-realtime')
    expect(names).toContain('supabase-storage-api')
    expect(names).toContain('supabase-imgproxy')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Supabase, { host: 'backend.example.com', objectStorage }),
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
          children: jsx(Supabase, { host: 'backend.example.com', objectStorage }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('backend.example.com')
  })

  it('passes resource validation', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('service probes', () => {
  it('configures per-service probe paths', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const containerOf = (name: string) =>
      (
        result.resources.find(
          (r: any) => r.kind === 'Deployment' && r.metadata.name === name
        ) as any
      ).spec.template.spec.containers[0]

    for (const serviceName of ['supabase-gotrue', 'supabase-realtime', 'supabase-imgproxy']) {
      const container = containerOf(serviceName)
      expect(container.livenessProbe.httpGet.path).toBe('/health')
      expect(container.readinessProbe.httpGet.path).toBe('/health')
    }

    const postgrest = containerOf('supabase-postgrest')
    expect(postgrest.livenessProbe.httpGet.path).toBe('/')
    expect(postgrest.readinessProbe.httpGet.path).toBe('/')

    const storage = containerOf('supabase-storage-api')
    expect(storage.livenessProbe.httpGet.path).toBe('/status')
    expect(storage.readinessProbe.httpGet.path).toBe('/status')
  })

  it('gives GoTrue a longer probe initial delay', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const gotrue = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-gotrue'
    ) as any
    const container = gotrue.spec.template.spec.containers[0]
    expect(container.livenessProbe.initialDelaySeconds).toBe(15)
    expect(container.readinessProbe.initialDelaySeconds).toBe(15)
  })
})

describe('database bootstrap', () => {
  it('bootstraps extensions, roles and schemas via postInitSQL', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    const sql = cluster.spec.bootstrap.initdb.postInitApplicationSQL as string[]
    expect(Array.isArray(sql)).toBe(true)
    expect(sql.length).toBeGreaterThan(0)
    for (const statement of sql) {
      expect(typeof statement).toBe('string')
    }
    const joined = sql.join('\n')
    for (const needle of [
      'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
      'CREATE EXTENSION IF NOT EXISTS pgjwt;',
      'CREATE ROLE anon NOLOGIN;',
      'CREATE ROLE authenticated NOLOGIN;',
      'CREATE ROLE service_role NOLOGIN;',
      'CREATE ROLE authenticator NOLOGIN;',
      'CREATE SCHEMA IF NOT EXISTS auth;',
      'CREATE SCHEMA IF NOT EXISTS storage;',
      'CREATE SCHEMA IF NOT EXISTS realtime;',
      'GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;',
      'GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;',
      'GRANT USAGE ON SCHEMA realtime TO anon, authenticated, service_role;',
      'GRANT anon TO authenticator;',
      'GRANT authenticated TO authenticator;',
      'GRANT service_role TO authenticator;',
    ]) {
      expect(joined).toContain(needle)
    }
  })
})

describe('service urls and env', () => {
  it('points IMGPROXY_URL at the imgproxy app port', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const storage = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-storage-api'
    ) as any
    const env = storage.spec.template.spec.containers[0].env
    const imgproxyUrl = env.find((e: any) => e.name === 'IMGPROXY_URL')
    expect(imgproxyUrl.value).toBe('http://supabase-imgproxy:8080')
  })

  it('uses Postgres service-internal ports and the storage region', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    for (const serviceName of ['supabase-gotrue', 'supabase-postgrest', 'supabase-storage-api']) {
      const deploy = result.resources.find(
        (r: any) => r.kind === 'Deployment' && r.metadata.name === serviceName
      ) as any
      const env = deploy.spec.template.spec.containers[0].env as any[]
      const dbUri = env.find(
        (e: any) =>
          e.name === 'GOTRUE_DB_DATABASE_URL' ||
          e.name === 'PGRST_DB_URI' ||
          e.name === 'DATABASE_URL'
      )
      expect(dbUri.value).toContain('@supabase-rw:5432/supabase')
    }
    const realtime = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-realtime'
    ) as any
    const realtimeEnv = realtime.spec.template.spec.containers[0].env as any[]
    expect(realtimeEnv.find((e: any) => e.name === 'DB_HOST').value).toBe('supabase-rw')
    expect(realtimeEnv.find((e: any) => e.name === 'DB_PORT').value).toBe('5432')
  })

  it('defaults GLOBAL_S3_REGION to us-east-1 without GOTRUE_URI_ALLOW_LIST', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const storage = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-storage-api'
    ) as any
    const storageEnv = storage.spec.template.spec.containers[0].env as any[]
    expect(storageEnv.find((e: any) => e.name === 'GLOBAL_S3_REGION').value).toBe('us-east-1')
    const gotrue = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-gotrue'
    ) as any
    const gotrueEnv = gotrue.spec.template.spec.containers[0].env as any[]
    expect(gotrueEnv.find((e: any) => e.name === 'GOTRUE_URI_ALLOW_LIST')).toBeUndefined()
  })

  it('accepts region and uriAllowList overrides', () => {
    const result = renderSupabase({
      host: 'backend.example.com',
      objectStorage,
      region: 'eu-central-1',
      uriAllowList: ['https://app.example.com', 'https://app2.example.com'],
    })
    const storage = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-storage-api'
    ) as any
    const storageEnv = storage.spec.template.spec.containers[0].env as any[]
    expect(storageEnv.find((e: any) => e.name === 'GLOBAL_S3_REGION').value).toBe('eu-central-1')
    const gotrue = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'supabase-gotrue'
    ) as any
    const gotrueEnv = gotrue.spec.template.spec.containers[0].env as any[]
    expect(gotrueEnv.find((e: any) => e.name === 'GOTRUE_URI_ALLOW_LIST').value).toBe(
      'https://app.example.com,https://app2.example.com'
    )
  })
})

describe('path-based routing', () => {
  const routes = [
    { path: '/auth/v1', service: 'supabase-gotrue', port: 9999 },
    { path: '/rest/v1', service: 'supabase-postgrest', port: 3000 },
    { path: '/realtime/v1', service: 'supabase-realtime', port: 4000 },
    { path: '/storage/v1', service: 'supabase-storage-api', port: 5000 },
  ]

  it('renders path-based Ingresses for auth, rest, realtime and storage on one host', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const ingresses = result.resources.filter((r) => r.kind === 'Ingress') as any[]
    // Root route (PostgREST) + one per service
    expect(ingresses).toHaveLength(5)
    for (const route of routes) {
      const match = ingresses.find((i) => i.spec.rules[0].http.paths[0].path === route.path) as any
      expect(match, `no Ingress for ${route.path}`).toBeDefined()
      expect(match.spec.rules[0].host).toBe('backend.example.com')
      const backend = match.spec.rules[0].http.paths[0].backend.service
      expect(backend.name).toBe(route.service)
      expect(backend.port.number).toBe(route.port)
    }
    const root = ingresses.find((i) => i.spec.rules[0].http.paths[0].path === '/')
    expect(root).toBeDefined()
    expect(root.spec.rules[0].http.paths[0].backend.service.name).toBe('supabase-postgrest')
  })

  it('renders HTTPRoute PathPrefix matches in gateway mode', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Supabase, { host: 'backend.example.com', objectStorage }),
        }),
      })
    )
    const httpRoutes = result.resources.filter((r) => r.kind === 'HTTPRoute') as any[]
    expect(httpRoutes).toHaveLength(5)
    for (const route of routes) {
      const match = httpRoutes.find(
        (r) => r.spec.rules[0].matches?.[0]?.path?.value === route.path
      ) as any
      expect(match, `no HTTPRoute for ${route.path}`).toBeDefined()
      expect(match.spec.hostnames).toContain('backend.example.com')
      expect(match.spec.rules[0].matches[0].path.type).toBe('PathPrefix')
      expect(match.spec.rules[0].backendRefs[0]).toMatchObject({
        name: route.service,
        port: route.port,
      })
    }
  })

  it('adds websocket-friendly realtime annotations to the realtime route', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const realtime = result.resources.find(
      (r: any) => r.kind === 'Ingress' && r.metadata.name === 'supabase-realtime-endpoint'
    ) as any
    expect(realtime).toBeDefined()
    expect(realtime.metadata.annotations['nginx.ingress.kubernetes.io/proxy-buffering']).toBe('off')
    expect(realtime.metadata.annotations['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe(
      '3600'
    )
    expect(realtime.metadata.annotations['nginx.ingress.kubernetes.io/proxy-send-timeout']).toBe(
      '3600'
    )
  })

  it('omits the storage route when storageApi is disabled', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage, storageApi: false })
    const ingresses = result.resources.filter((r) => r.kind === 'Ingress') as any[]
    expect(ingresses).toHaveLength(4)
    const paths = ingresses.map((i) => i.spec.rules[0].http.paths[0].path)
    expect(paths).not.toContain('/storage/v1')
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderSupabase({
      name: 'platform',
      namespace: 'platform',
      host: 'platform.example.com',
      replicas: 3,
      storage: '50Gi',
      storageApi: true,
      objectStorage,
      jwtSecretsName: 'platform-jwt',
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'platform-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    expect(result.resources.length).toBeGreaterThan(0)
    const deployments = result.resources.filter((r) => r.kind === 'Deployment')
    expect(deployments.length).toBeGreaterThanOrEqual(5)
    const names = deployments.map((d: any) => d.metadata.name)
    for (const prefix of ['gotrue', 'postgrest', 'realtime', 'storage-api', 'imgproxy']) {
      expect(names).toContain(`platform-${prefix}`)
    }
    const images = Object.fromEntries(
      deployments.map((d: any) => [d.metadata.name, d.spec.template.spec.containers[0].image])
    )
    expect(images['platform-gotrue']).toBe('supabase/gotrue:v2')
    expect(images['platform-postgrest']).toBe('postgrest/postgrest:v12')
    expect(images['platform-realtime']).toBe('supabase/realtime:v2')
    expect(images['platform-storage-api']).toBe('supabase/storage-api:v0')
    expect(images['platform-imgproxy']).toBe('darthsim/imgproxy:v3')
    const gotrue = deployments.find((d: any) => d.metadata.name === 'platform-gotrue') as any
    expect(gotrue.spec.replicas).toBe(3)
    expect(gotrue.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')
    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.storage.size).toBe('50Gi')
  })
})

describe('secrets handling', () => {
  it('provisions the JWT bundle through a secrets backend', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
    const bundle = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret') as any
    expect(bundle.spec.path).toBe('test/supabase/jwt')
    expect(bundle.spec.destination.name).toBe('supabase-jwt')
  })

  it('provisions the JWT bundle through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(Supabase, { host: 'backend.example.com', objectStorage }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
  })

  it('accepts an explicit jwtSecretsName without a backend', () => {
    expect(() =>
      render(
        jsx(Supabase, {
          host: 'backend.example.com',
          objectStorage,
          jwtSecretsName: 'existing-jwt',
        })
      )
    ).not.toThrow()
  })

  it('throws when no secrets backend and no JWT bundle secret', () => {
    expect(() => render(jsx(Supabase, { host: 'backend.example.com', objectStorage }))).toThrow(
      /JWT secret bundle/
    )
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const getDeploy = (name: string) =>
      result.resources.find((r: any) => r.kind === 'Deployment' && r.metadata.name === name) as any
    const envOf = (name: string) => {
      const deploy = getDeploy(name)
      expect(deploy).toBeDefined()
      return deploy.spec.template.spec.containers[0].env as any[]
    }
    const findEnv = (env: any[], name: string) => env.find((e) => e.name === name)

    const gotrueEnv = envOf('supabase-gotrue')
    const jwtSecret = findEnv(gotrueEnv, 'GOTRUE_JWT_SECRET')
    expect(jwtSecret.valueFrom.secretKeyRef).toEqual({ name: 'supabase-jwt', key: 'jwtSecret' })
    expect(jwtSecret.value).toBeUndefined()
    const pgPassword = findEnv(gotrueEnv, 'PGPASSWORD')
    expect(pgPassword.valueFrom.secretKeyRef).toEqual({
      name: 'supabase-db-credentials',
      key: 'password',
    })
    expect(pgPassword.value).toBeUndefined()

    const postgrestEnv = envOf('supabase-postgrest')
    expect(findEnv(postgrestEnv, 'PGRST_JWT_SECRET').value).toBeUndefined()
    expect(findEnv(postgrestEnv, 'PGRST_JWT_SECRET').valueFrom.secretKeyRef.name).toBe(
      'supabase-jwt'
    )

    const realtimeEnv = envOf('supabase-realtime')
    expect(findEnv(realtimeEnv, 'DB_PASSWORD').value).toBeUndefined()
    expect(findEnv(realtimeEnv, 'DB_PASSWORD').valueFrom.secretKeyRef.name).toBe(
      'supabase-db-credentials'
    )

    const storageEnv = envOf('supabase-storage-api')
    expect(findEnv(storageEnv, 'ANON_KEY').valueFrom.secretKeyRef).toEqual({
      name: 'supabase-jwt',
      key: 'anonKey',
    })
    expect(findEnv(storageEnv, 'SERVICE_KEY').valueFrom.secretKeyRef).toEqual({
      name: 'supabase-jwt',
      key: 'serviceRoleKey',
    })
    expect(findEnv(storageEnv, 'ANON_KEY').value).toBeUndefined()
    for (const envName of ['GLOBAL_S3_ACCESS_KEY', 'GLOBAL_S3_SECRET_KEY']) {
      const envVar = findEnv(storageEnv, envName)
      expect(envVar.value).toBeUndefined()
      expect(envVar.valueFrom.secretKeyRef.name).toBe('object-store-credentials')
    }
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderSupabase({ host: 'backend.example.com', objectStorage })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})
