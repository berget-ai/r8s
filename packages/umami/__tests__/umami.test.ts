import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { Umami } from '../src/index'

// Umami recipe tests, facit-aligned against berget-internal/apps/umami:
//   1. Pinned image policy (facit floated on postgresql-latest — rejected)
//   2. App secret + OIDC client secrets via the backend (hyphenated keys)
//   3. CNPG cluster in 'cnpg' credentialsMode; DATABASE_URL ← `<db>-app/fqdn-uri`
//   4. Facit probes/resources; Endpoint without configuration-snippet
//   5. Reference fallbacks + actionable errors

const openbao = { backend: 'openbao', mount: 'secret', path: 'umami' }

function renderApp(props: Record<string, unknown> = {}) {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao,
      children: jsx(Umami, { host: 'umami.example.com', ...props } as never),
    })
  )
}

const resource = (result: ReturnType<typeof render>, kind: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind) as any

describe('Umami', () => {
  it('renders the pinned image and facit probes/resources', () => {
    const d = resource(renderApp(), 'Deployment')
    const c = d.spec.template.spec.containers[0]
    expect(c.image).toBe('ghcr.io/umami-software/umami:postgresql-v2.17.0')
    expect(c.ports[0].containerPort).toBe(3000)
    expect(c.readinessProbe.httpGet.path).toBe('/api/heartbeat')
    expect(c.readinessProbe.initialDelaySeconds).toBe(30)
    expect(c.livenessProbe.httpGet.path).toBe('/api/heartbeat')
    expect(c.livenessProbe.initialDelaySeconds).toBe(60)
    expect(c.livenessProbe.periodSeconds).toBe(30)
    expect(c.resources).toEqual({
      requests: { memory: '256Mi', cpu: '100m' },
      limits: { memory: '512Mi', cpu: '500m' },
    })
    expect(d.spec.replicas).toBe(1)
  })

  it('rejects the floating latest tags with an actionable error', () => {
    expect(() => renderApp({ version: 'postgresql-latest' })).toThrow('pinned version')
    expect(() => renderApp({ version: 'latest' })).toThrow('pinned version')
  })

  it('DATABASE_URL references the CNPG-generated <db>-app fqdn-uri directly', () => {
    const c = resource(renderApp(), 'Deployment').spec.template.spec.containers[0]
    const dbUrl = c.env.find((e: { name: string }) => e.name === 'DATABASE_URL')
    expect(dbUrl.valueFrom.secretKeyRef).toEqual({ name: 'umami-db-app', key: 'fqdn-uri' })
  })

  it('provisions the app secret via StaticSecret with rotation restart', () => {
    const vso = resource(renderApp(), 'OpenBaoStaticSecret')
    expect(vso.metadata.name).toBe('umami-secrets')
    expect(vso.spec.path).toBe('umami/umami/app')
    expect(vso.spec.rolloutRestartTargets).toEqual([{ kind: 'Deployment', name: 'umami' }])
    expect(vso.spec.destination.transformation.templates['app-secret'].text).toBe(
      '{{ .Secrets.app-secret }}'
    )
  })

  it('renders the CNPG cluster in cnpg credentialsMode (no VSO for db creds)', () => {
    const result = renderApp()
    const cluster = resource(result, 'Cluster')
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.storage.size).toBe('20Gi')
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
    expect(result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret')).toHaveLength(1)
  })

  it('sso wires the facit OAUTH_* contract with hyphenated secret keys', () => {
    const result = renderApp({
      sso: {
        discoveryUrl: 'https://keycloak.example.com/realms/master/.well-known/openid-configuration',
        clientId: 'umami',
      },
    })
    const c = resource(result, 'Deployment').spec.template.spec.containers[0]
    const byName = Object.fromEntries(
      c.env.map((e: { name: string; value?: string; valueFrom?: { secretKeyRef?: object } }) => [
        e.name,
        e.value ?? e.valueFrom?.secretKeyRef,
      ])
    )
    expect(byName.OAUTH_DISCOVERY_URL).toContain('realms/master/')
    expect(byName.OAUTH_REDIRECT_URL).toBe('https://umami.example.com/api/auth/callback/openid')
    expect(byName.OAUTH_SCOPE).toBe('openid email profile')
    expect(byName.OAUTH_CLIENT_ID).toEqual({ name: 'umami-keycloak-oidc', key: 'client-id' })
    expect(byName.OAUTH_CLIENT_SECRET).toEqual({
      name: 'umami-keycloak-oidc',
      key: 'client-secret',
    })

    const vso = result.resources.find(
      (r) => r.kind === 'OpenBaoStaticSecret' && r.metadata.name === 'umami-keycloak-oidc'
    ) as { spec?: { path?: string } }
    expect(vso?.spec?.path).toBe('umami/umami/keycloak-oidc')
  })

  it('reference fallbacks skip provisioning', () => {
    const result = renderApp({
      appSecretRef: 'existing-app',
      sso: {
        discoveryUrl: 'https://keycloak.example.com/realms/master/.well-known/openid-configuration',
        clientId: 'umami',
        clientSecretRef: 'existing-oidc',
      },
    })
    expect(result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret')).toHaveLength(0)
    const c = resource(result, 'Deployment').spec.template.spec.containers[0]
    const appSecret = c.env.find((e: { name: string }) => e.name === 'APP_SECRET')
    expect(appSecret.valueFrom.secretKeyRef.name).toBe('existing-app')
  })

  it('throws an actionable error without a backend and without appSecretRef', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(Umami, { host: 'umami.example.com' } as never),
        })
      )
    ).toThrow(/Umami "umami" requires/)
  })

  it('renders the Endpoint without configuration-snippet (cluster policy)', () => {
    const ingress = resource(renderApp(), 'Ingress')
    expect(ingress.spec.rules[0].host).toBe('umami.example.com')
    const anns = ingress.metadata.annotations
    expect(anns['cert-manager.io/cluster-issuer']).toBe('letsencrypt-prod')
    expect(Object.keys(anns).some((k) => k.includes('configuration-snippet'))).toBe(false)
  })

  it('passes backup through to the Database recipe', () => {
    const cluster = resource(
      renderApp({
        backup: {
          destinationPath: 's3://backups/umami-cnpg',
          endpointURL: 'https://s3.nl-ams.scw.cloud',
          credentialsSecret: 'scaleway-s3-secret',
        },
      }),
      'Cluster'
    )
    expect(cluster.spec.backup.barmanObjectStore.endpointURL).toBe('https://s3.nl-ams.scw.cloud')
    const sb = resource(renderApp(), 'ScheduledBackup')
    expect(sb).toBeUndefined() // no backup → no ScheduledBackup
  })

  it('produces valid, plaintext-free manifests', () => {
    const result = renderApp()
    for (const r of result.resources) {
      expect(validateResource(r)).toEqual([])
    }
    expect(runGuardrails(result.resources as never, [noPlaintextSecrets]).passed).toBe(true)
  })
})
