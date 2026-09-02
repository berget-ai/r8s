import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// Eneo recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation, dbStorage
//   3. Namespace inheritance from the Platform context
//   4. Security: no plaintext credentials in rendered output
import { Eneo } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

/** Render Eneo inside a Platform-like secrets backend (OpenBao). */
function renderEneo(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao as never,
      children: jsx(Eneo, props as never),
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
        children: jsx(Eneo, props as never),
      }),
    })
  )
}

/** Wrap Eneo in an OperatorContext (no secrets backend). */
function elementWithContext(ops: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: ops,
    children: jsx(Eneo, props as never),
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

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('declares no cache operator on a plain render', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(false)
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
  })
})

describe('rendering defaults', () => {
  it('renders deployment, service, ingress and database cluster', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Eneo, { host: 'eneo.example.com', objectStorage }),
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
          children: jsx(Eneo, { host: 'eneo.example.com', objectStorage }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('eneo.example.com')
  })

  it('defaults app replicas to 2', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    expect(app.spec.replicas).toBe(2)
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
    for (const kind of ['Deployment', 'Service', 'Cluster', 'Ingress']) {
      const resource = result.resources.find((r: any) => r.kind === kind)
      expect(resource).toBeDefined()
      expect(resource.metadata.namespace).toBe('ai')
    }
  })

  it('inherits non-default context namespace even with multiple levels', () => {
    const result = renderEneoInNamespace('team-corpora', {
      host: 'eneo.example.com',
      objectStorage,
      secretsName: 'existing-secrets',
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    expect(app.metadata.namespace).toBe('team-corpora')
  })

  it('explicit namespace prop wins over the Platform context', () => {
    const result = renderEneoInNamespace('ai', {
      host: 'eneo.example.com',
      objectStorage,
      namespace: 'assistant-ns',
    })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    expect(app.metadata.namespace).toBe('assistant-ns')
  })

  it('falls back to default when no Platform namespace is present', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    expect(app.metadata.namespace).toBe('default')
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

    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'assistant'
    ) as any
    expect(app).toBeDefined()
    expect(app.spec.replicas).toBe(3)
    expect(app.spec.template.spec.containers[0].image).toBe('ghcr.io/berget-ai/eneo:1.4.0')
    expect(app.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')

    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'S3_BUCKET').value).toBe('assistant-corpora')
    expect(env.find((e: any) => e.name === 'AWS_REGION').value).toBe('eu-north-1')
    expect(env.find((e: any) => e.name === 'OIDC_ISSUER').value).toBe(sso.issuer)
    expect(env.find((e: any) => e.name === 'OIDC_TOKEN_URI').value).toBe(
      '$(OIDC_ISSUER)/protocol/openid-connect/token'
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
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    const env = app.spec.template.spec.containers[0].env as Array<{ name: string }>
    const names = env.map((e) => e.name)
    expect(new Set(names).size).toBe(names.length)
    // The OIDC client secret must come from the secretKeyRef entry only —
    // no plain env duplicate.
    expect(names.filter((n) => n === 'OIDC_CLIENT_SECRET')).toHaveLength(1)
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
        children: jsx(Eneo, { host: 'eneo.example.com', objectStorage }),
      })
    )
    const vault = result.resources.find((r: any) => r.kind === 'VaultStaticSecret') as any
    expect(vault).toBeDefined()
    expect(vault.spec.destination.name).toBe('eneo-secrets')
    expect(vault.spec.path).toBe('apps/eneo/secrets')
  })

  it('throws when no secrets backend and no secretsName (bundle requires appSecret)', () => {
    expect(() => render(jsx(Eneo, { host: 'eneo.example.com', objectStorage }))).toThrow(
      /application secrets \(appSecret\)/
    )
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
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    const env = app.spec.template.spec.containers[0].env
    const appSecret = env.find((e: any) => e.name === 'APP_SECRET')
    const smtpPassword = env.find((e: any) => e.name === 'SMTP_PASSWORD')
    const awsAccessKey = env.find((e: any) => e.name === 'AWS_ACCESS_KEY_ID')
    const oidcClientSecret = env.find((e: any) => e.name === 'OIDC_CLIENT_SECRET')
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
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
    for (const e of [appSecret, smtpPassword, awsAccessKey, oidcClientSecret, pgPassword]) {
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
    const smtpApp = withSmtp.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    const smtpEnv = smtpApp.spec.template.spec.containers[0].env
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
    const plainApp = withoutSmtp.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    const plainEnv = plainApp.spec.template.spec.containers[0].env
    expect(plainEnv.find((e: any) => e.name === 'SMTP_PASSWORD')).toBeUndefined()
    expect(plainEnv.find((e: any) => e.name === 'SMTP_HOST')).toBeUndefined()
  })

  it('auto-wires DATABASE_URL from the Database context without plaintext', () => {
    const result = renderEneo({ host: 'eneo.example.com', objectStorage })
    const app = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'eneo'
    ) as any
    const env = app.spec.template.spec.containers[0].env
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
