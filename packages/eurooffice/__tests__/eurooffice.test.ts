import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// EuroOffice recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation, TCP probes
//   3. Namespace inheritance from the Platform context
//   4. Security: no plaintext credentials in rendered output
import { EuroOffice } from '../src/index'

const objectStorage = {
  endpoint: 'https://s3.test',
  bucket: 'docs-blobs',
  credentialsSecret: 'docs-blobs-credentials',
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

/** Render EuroOffice inside a Platform-like secrets backend (OpenBao). */
function renderEuroOffice(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: { backend: 'openbao', mount: 'kv', path: 'test' },
      children: jsx(EuroOffice, { objectStorage, ...props } as never),
    })
  )
}

/** Render EuroOffice wrapped only in an OperatorContext (no secrets backend). */
function renderEuroOfficeWithContext(
  operators_: any[],
  props: Record<string, unknown>
): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(EuroOffice, {
      objectStorage,
      secretsName: 'existing-secrets',
      ...props,
    } as never),
  })
}

/** Render EuroOffice inside a Platform-like Namespace context (no explicit namespace prop). */
function renderEuroOfficeInNamespace(
  namespaceValue: string,
  props: Record<string, unknown>
): ReturnType<typeof render> {
  return render(
    jsx(Namespace.Provider, {
      value: namespaceValue,
      children: jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(EuroOffice, { objectStorage, ...props } as never),
      }),
    })
  )
}

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('adds no app-level operators beyond cnpg (Endpoint owns routing operators)', () => {
    const result = renderEuroOffice({ host: 'docs.example.com', conversions: true })
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
    expect(names).not.toContain('redis-operator')
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderEuroOfficeWithContext([operators['cnpg']()], { host: 'docs.example.com' })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(renderEuroOfficeWithContext([operators['cnpg']('1.24.0')], {}))
    const cnpg = result.operators.filter((op) => op.name === 'cnpg')
    expect(cnpg).toHaveLength(1)
    expect(cnpg[0].version).toBe('1.24.0')
  })
})

describe('rendering defaults', () => {
  it('renders app deployment, service, database and endpoint', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
  })

  it('adds LibreOffice conversion workers when conversions is set', () => {
    const result = renderEuroOffice({
      host: 'docs.example.com',
      conversions: true,
      conversionWorkers: 2,
    })
    const deployments = result.resources.filter((r) => r.kind === 'Deployment')
    const soffice = deployments.find((d: any) => d.metadata.name === 'eurooffice-soffice') as any
    expect(soffice).toBeDefined()
    expect(soffice.spec.replicas).toBe(2)
    expect(soffice.spec.template.spec.containers[0].command).toContain(
      '--accept=socket,host=0.0.0.0,port=2002;urp;'
    )
    const services = result.resources.filter((r) => r.kind === 'Service')
    expect(services.some((s: any) => s.metadata.name === 'eurooffice-soffice')).toBe(true)
  })

  it('probes the soffice workers on the UNO TCP socket (not HTTP)', () => {
    const result = renderEuroOffice({ host: 'docs.example.com', conversions: true })
    const soffice = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice-soffice'
    ) as any
    const container = soffice.spec.template.spec.containers[0]
    expect(container.livenessProbe.tcpSocket).toEqual({ port: 2002 })
    expect(container.readinessProbe.tcpSocket).toEqual({ port: 2002 })
    expect(container.readinessProbe.initialDelaySeconds).toBe(20)
    expect(container.livenessProbe.httpGet).toBeUndefined()
    expect(container.readinessProbe.httpGet).toBeUndefined()
  })

  it('does not render conversion workers by default', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    const deployments = result.resources
      .filter((r) => r.kind === 'Deployment')
      .map((d: any) => d.metadata.name)
    expect(deployments).not.toContain('eurooffice-soffice')
  })

  it('defaults app replicas to 1 when websockets are enabled (no session affinity)', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    expect(app.spec.replicas).toBe(1)
  })

  it('defaults app replicas to 2 when websockets are disabled', () => {
    const result = renderEuroOffice({ host: 'docs.example.com', websockets: false })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    expect(app.spec.replicas).toBe(2)
  })

  it('renders explicit replicas with websockets enabled (caller opts into sticky sessions)', () => {
    const result = renderEuroOffice({
      host: 'docs.example.com',
      websockets: true,
      replicas: 3,
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    expect(app.spec.replicas).toBe(3)
  })

  it('enables websockets by default and allows disabling them', () => {
    const on = renderEuroOffice({ host: 'docs.example.com' })
    const appOn = on.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    const envOn = appOn.spec.template.spec.containers[0].env
    expect(envOn.find((e: any) => e.name === 'WEBSOCKETS_ENABLED').value).toBe('true')

    const off = renderEuroOffice({ host: 'docs.example.com', websockets: false })
    const appOff = off.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    const envOff = appOff.spec.template.spec.containers[0].env
    expect(envOff.find((e: any) => e.name === 'WEBSOCKETS_ENABLED').value).toBe('false')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(EuroOffice, { objectStorage, host: 'docs.example.com' } as never),
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
          children: jsx(EuroOffice, { objectStorage, host: 'docs.example.com' } as never),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('docs.example.com')
  })

  it('passes resource validation', () => {
    const result = renderEuroOffice({ host: 'docs.example.com', conversions: true })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('namespace inheritance', () => {
  it('inherits namespace from the Platform context when namespace prop is not set', () => {
    const result = renderEuroOfficeInNamespace('docs', { host: 'docs.example.com' })
    for (const kind of ['Deployment', 'Service', 'Cluster', 'Ingress']) {
      const resource = result.resources.find((r: any) => r.kind === kind)
      expect(resource).toBeDefined()
      expect(resource.metadata.namespace).toBe('docs')
    }
  })

  it('explicit namespace prop wins over the Platform context', () => {
    const result = renderEuroOfficeInNamespace('docs', {
      host: 'docs.example.com',
      namespace: 'collab',
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    expect(app.metadata.namespace).toBe('collab')
  })

  it('falls back to default when no Platform namespace is present', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    expect(app.metadata.namespace).toBe('default')
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderEuroOffice({
      name: 'docs',
      namespace: 'docs',
      version: '1.2.0',
      host: 'docs.example.com',
      replicas: 3,
      websockets: false,
      smtp: { host: 'smtp.example.com', port: 465, from: 'no-reply@docs.example.com' },
      conversions: true,
      conversionWorkers: 4,
      objectStorage: {
        endpoint: 'https://s3.internal.example.com',
        bucket: 'docs-blobs',
        credentialsSecret: 'docs-blobs-credentials',
        region: 'eu-north-1',
      },
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'docs-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    expect(result.resources.length).toBeGreaterThan(0)
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'docs'
    ) as any
    expect(app.spec.template.spec.containers[0].image).toBe('ghcr.io/berget-ai/eurooffice:1.2.0')
    expect(app.spec.replicas).toBe(3)
    expect(app.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')
    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'WEBSOCKETS_ENABLED').value).toBe('false')
    expect(env.find((e: any) => e.name === 'SMTP_HOST').value).toBe('smtp.example.com')
    expect(env.find((e: any) => e.name === 'SMTP_PORT').value).toBe('465')
    expect(env.find((e: any) => e.name === 'SMTP_FROM').value).toBe('no-reply@docs.example.com')
    expect(env.find((e: any) => e.name === 'AWS_REGION').value).toBe('eu-north-1')
    expect(env.find((e: any) => e.name === 'SOFFICE_HOST').value).toBe('docs-soffice')

    const soffice = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'docs-soffice'
    ) as any
    expect(soffice.spec.template.spec.containers[0].image).toBe(
      'ghcr.io/berget-ai/eurooffice:1.2.0'
    )
    expect(soffice.spec.replicas).toBe(4)
  })
})

describe('secrets handling', () => {
  it('accepts an explicit secretsName without a backend', () => {
    expect(() =>
      render(
        jsx(EuroOffice, {
          host: 'docs.example.com',
          objectStorage,
          secretsName: 'existing-secrets',
        } as never)
      )
    ).not.toThrow()

    const result = render(
      jsx(EuroOffice, {
        host: 'docs.example.com',
        objectStorage,
        secretsName: 'existing-secrets',
      } as never)
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('OpenBaoStaticSecret')
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const appSecret = env.find((e: any) => e.name === 'APP_SECRET')
    expect(appSecret.valueFrom.secretKeyRef.name).toBe('existing-secrets')
    expect(appSecret.valueFrom.secretKeyRef.key).toBe('secretKey')
  })

  it('provisions the app secrets bundle through a secrets backend', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    const secretCr = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret') as any
    expect(secretCr).toBeDefined()
    expect(secretCr.metadata.name).toBe('eurooffice-secrets')
    expect(secretCr.spec.destination.name).toBe('eurooffice-secrets')
    expect(secretCr.spec.path).toBe('test/eurooffice/secrets')
  })

  it('provisions the app secrets bundle through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(EuroOffice, { objectStorage, host: 'docs.example.com' } as never),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
    const secretCr = result.resources.find((r) => r.kind === 'VaultStaticSecret') as any
    expect(secretCr.spec.path).toBe('apps/eurooffice/secrets')
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderEuroOffice({
      host: 'docs.example.com',
      smtp: { host: 'smtp.example.com' },
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const smtpPassword = env.find((e: any) => e.name === 'SMTP_PASSWORD')
    const appSecret = env.find((e: any) => e.name === 'APP_SECRET')
    const accessKey = env.find((e: any) => e.name === 'AWS_ACCESS_KEY_ID')
    const secretAccessKey = env.find((e: any) => e.name === 'AWS_SECRET_ACCESS_KEY')
    expect(smtpPassword.valueFrom.secretKeyRef.name).toBe('eurooffice-secrets')
    expect(smtpPassword.valueFrom.secretKeyRef.key).toBe('smtpPassword')
    expect(appSecret.valueFrom.secretKeyRef.name).toBe('eurooffice-secrets')
    expect(appSecret.valueFrom.secretKeyRef.key).toBe('secretKey')
    expect(accessKey.valueFrom.secretKeyRef.name).toBe('docs-blobs-credentials')
    expect(accessKey.valueFrom.secretKeyRef.key).toBe('accessKey')
    expect(secretAccessKey.valueFrom.secretKeyRef.name).toBe('docs-blobs-credentials')
    expect(secretAccessKey.valueFrom.secretKeyRef.key).toBe('secretKey')
    expect(smtpPassword.value).toBeUndefined()
    expect(appSecret.value).toBeUndefined()
    expect(accessKey.value).toBeUndefined()
    expect(secretAccessKey.value).toBeUndefined()
  })

  it('auto-wires DATABASE_URL from the DatabaseContext (no manual connection string)', () => {
    const result = renderEuroOffice({ host: 'docs.example.com' })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eurooffice'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const databaseUrl = env.find((e: any) => e.name === 'DATABASE_URL')
    expect(databaseUrl.value).toBe(
      'postgresql://$(PGUSER):$(PGPASSWORD)@$(PGHOST):$(PGPORT)/$(PGDATABASE)'
    )
    const dbPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(dbPassword.valueFrom.secretKeyRef.name).toBe('eurooffice-db-credentials')
    expect(dbPassword.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderEuroOffice({
      host: 'docs.example.com',
      smtp: { host: 'smtp.example.com', port: 587, from: 'no-reply@docs.example.com' },
      conversions: true,
      conversionWorkers: 2,
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('validation errors', () => {
  it('throws when no secrets backend and no secrets name', () => {
    expect(() =>
      render(jsx(EuroOffice, { host: 'docs.example.com', objectStorage } as never))
    ).toThrow(/application secrets/)
  })

  it('throws for unknown secrets backends', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'unknown' as never },
          children: jsx(EuroOffice, { objectStorage, host: 'docs.example.com' } as never),
        })
      )
    ).toThrow(/application secrets/)
  })
})
