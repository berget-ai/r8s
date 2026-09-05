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
    // facit: standalone Redis (durable PVC + exporter), not a Replication
    expect(kinds).toContain('Redis')
    const redis = result.resources.find((r: any) => r.kind === 'Redis') as any
    expect(redis.spec.kubernetesConfig.image).toBe('redis:7.0.12')
    expect(redis.spec.storage.volumeClaimTemplate.spec.resources.requests.storage).toBe('1Gi')
    expect(redis.spec.redisExporter.enabled).toBe(true)
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

describe('facit deltas', () => {
  it('pins docker.getoutline.com/outlinewiki/outline:1.9.2 with IfNotPresent', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    expect(app.spec.template.spec.containers[0].image).toBe(
      'docker.getoutline.com/outlinewiki/outline:1.9.2'
    )
    expect(app.spec.template.spec.containers[0].imagePullPolicy).toBe('IfNotPresent')
  })

  it('rolls Recreate at replicas=1 with migration-safe probe timings', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    expect(app.spec.strategy.type).toBe('Recreate')
    expect(app.spec.replicas).toBe(1)
    const c = app.spec.template.spec.containers[0]
    expect(c.readinessProbe).toMatchObject({
      tcpSocket: { port: 3000 },
      initialDelaySeconds: 30,
      failureThreshold: 6,
    })
    expect(c.livenessProbe).toMatchObject({
      tcpSocket: { port: 3000 },
      initialDelaySeconds: 90,
      periodSeconds: 30,
    })
  })

  it('sizes CNPG per facit (2 instances, 20Gi) and supports backup passthrough', () => {
    const result = renderOutline({
      host: 'wiki.example.com',
      backup: {
        destinationPath: 's3://outline-cnpg-backups',
        endpointURL: 'https://s3.example.com',
      },
    })
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.storage.size).toBe('20Gi')
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe('s3://outline-cnpg-backups')
  })

  it('uploads use endpoint-only AWS_S3_UPLOAD_BUCKET_URL semantics', () => {
    const result = renderOutline({ host: 'wiki.example.com', objectStorage })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'AWS_S3_UPLOAD_BUCKET_URL').value).toBe(
      'https://s3.internal.example.com'
    )
    expect(env.find((e: any) => e.name === 'AWS_S3_UPLOAD_BUCKET_NAME').value).toBe(
      'wiki-attachments'
    )
  })

  it('provisions the facit secret bundle — snake_case vault keys templated to env-case, hourly refresh, restart on rotation', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vso.spec.path).toBe('test/outline/app')
    expect(vso.spec.refreshAfter).toBe('3600s')
    expect(vso.spec.rolloutRestartTargets).toEqual([{ kind: 'Deployment', name: 'outline' }])
    expect(vso.spec.destination.overwrite).toBe(true)
    expect(vso.spec.destination.transformation.excludeRaw).toBe(true)
    const tpl = vso.spec.destination.transformation.templates
    expect(tpl.SECRET_KEY.text).toContain('secret_key')
    expect(tpl.UTILS_SECRET.text).toContain('utils_secret')
  })

  it('bundle carries OIDC creds when sso is set; clientId/SecretRef override individually', () => {
    const result = renderOutline({ host: 'wiki.example.com', sso })
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    const tpl = vso.spec.destination.transformation.templates
    expect(tpl.OIDC_CLIENT_ID.text).toContain('oidc_client_id')
    expect(tpl.OIDC_CLIENT_SECRET.text).toContain('oidc_client_secret')
    // clientId given in fixture → literal env; clientSecretRef given → used directly
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OIDC_CLIENT_ID').value).toBe('outline')
    expect(env.find((e: any) => e.name === 'OIDC_CLIENT_SECRET').valueFrom.secretKeyRef).toEqual({
      name: 'outline-sso',
      key: 'clientSecret',
    })
  })

  it('reads OIDC_CLIENT_ID from the bundle when clientId is omitted', () => {
    const result = renderOutline({
      host: 'wiki.example.com',
      sso: { issuer: 'https://keycloak.example.com/realms/x' },
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OIDC_CLIENT_ID').valueFrom.secretKeyRef).toEqual({
      name: 'outline-app-secrets',
      key: 'OIDC_CLIENT_ID',
    })
    expect(env.find((e: any) => e.name === 'OIDC_USERNAME_CLAIM').value).toBe('preferred_username')
    expect(env.find((e: any) => e.name === 'OIDC_DISPLAY_NAME').value).toBe('SSO')
  })

  it('hardened production env defaults: NODE_ENV, FORCE_HTTPS, rate limiter, no updates', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = Object.fromEntries(
      app.spec.template.spec.containers[0].env.map((e: any) => [e.name, e.value ?? '--ref--'])
    )
    expect(env.NODE_ENV).toBe('production')
    expect(env.WEB_CONCURRENCY).toBe('1')
    expect(env.PGSSLMODE).toBe('disable')
    expect(env.FORCE_HTTPS).toBe('true')
    expect(env.RATE_LIMITER_ENABLED).toBe('true')
    expect(env.ENABLE_UPDATES).toBe('false')
    expect(env.APP_URL).toBeUndefined()
    expect(env.PROXY_HEADERS_TRUSTED).toBeUndefined()
  })

  it('injects websocket-friendly ingress timeouts, overridable per annotation', () => {
    const result = renderOutline({ host: 'wiki.example.com' })
    const ingress = result.resources.find((r: any) => r.kind === 'Ingress') as any
    expect(ingress.metadata.annotations['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe(
      '3600'
    )
    const o = renderOutline({
      host: 'wiki.example.com',
      endpointAnnotations: { 'nginx.ingress.kubernetes.io/proxy-read-timeout': '600' },
    })
    const ing2 = o.resources.find((r: any) => r.kind === 'Ingress') as any
    expect(ing2.metadata.annotations['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe('600')
  })

  it('extra env merges last (escape hatch)', () => {
    const result = renderOutline({
      host: 'wiki.example.com',
      env: { LOG_LEVEL: 'debug', CUSTOM_KEY: 'x' },
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'outline'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'LOG_LEVEL').value).toBe('debug')
    expect(env.find((e: any) => e.name === 'CUSTOM_KEY').value).toBe('x')
  })
})
