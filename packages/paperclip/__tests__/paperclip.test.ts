import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { Paperclip } from '../src/index'

// Paperclip (operator Instance CR) recipe tests, facit-aligned against
// berget-internal/apps/paperclip:
//   1. Operator declaration (paperclip-operator 0.19.0, facit values)
//   2. Instance CR: image/pullSecrets, Better Auth, external DB, adapters,
//      storage, resources, networking, probes, heartbeat, backup, security, env
//   3. Secrets via backend: paperclip-secrets + berget-api-key with
//      StatefulSet rotation-restart; reference fallbacks; actionable errors
//   4. CNPG cluster in 'cnpg' credentialsMode (facit: `-app` fqdn-uri)

const openbao = { backend: 'openbao', mount: 'secret', path: 'paperclip' }

function renderApp(props: Record<string, unknown> = {}) {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao,
      children: jsx(Paperclip, { host: 'paperclip.example.com', ...props } as never),
    })
  )
}

const resource = (result: ReturnType<typeof render>, kind: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind) as any

describe('Paperclip operator Instance', () => {
  it('declares the paperclip-operator once (facit chart values)', () => {
    const ops = renderApp().operators.filter((o) => o.name === 'paperclip-operator')
    expect(ops).toHaveLength(1)
    expect(ops[0].version).toBe('0.19.0')
    const src = ops[0].source as { type: string; chart: string; values: Record<string, unknown> }
    expect(src.type).toBe('helm')
    expect(src.chart).toBe('paperclip-operator')
    expect(src.values.metrics).toEqual({ enabled: true, serviceMonitor: { enabled: false } })
    expect(src.values.leaderElection).toEqual({ enabled: false })
  })

  it('renders the Instance CR with facit image/auth/database spec', () => {
    const inst = resource(renderApp(), 'Instance')
    expect(inst.apiVersion).toBe('paperclip.inc/v1alpha1')
    expect(inst.metadata.name).toBe('paperclip')
    expect(inst.spec.image).toEqual({
      repository: 'ghcr.io/berget-ai/paperclip',
      tag: 'sso-oidc',
      pullPolicy: 'Always',
      pullSecrets: [{ name: 'ghcr-pull-secret' }],
    })
    expect(inst.spec.deployment).toEqual({
      mode: 'authenticated',
      exposure: 'public',
      publicURL: 'https://paperclip.example.com',
      allowedHostnames: ['paperclip.example.com'],
    })
    expect(inst.spec.auth).toEqual({
      disableSignUp: true,
      secretRef: { name: 'paperclip-secrets', key: 'better-auth-secret' },
    })
    expect(inst.spec.database).toEqual({
      mode: 'external',
      externalURLSecretRef: { name: 'paperclip-db-app', key: 'fqdn-uri' },
    })
    expect(inst.spec.adapters).toEqual({ apiKeysSecretRef: { name: 'berget-api-key' } })
  })

  it('renders facit storage/resources/networking/probes/heartbeat/backup/security', () => {
    const s = resource(renderApp(), 'Instance').spec
    expect(s.storage.persistence).toEqual({ enabled: true, size: '10Gi' })
    expect(s.resources).toEqual(DEFAULT_RESOURCES_MATCH)
    expect(s.networking.service).toEqual({ type: 'ClusterIP', port: 3100 })
    expect(s.networking.ingress.ingressClassName).toBe('nginx')
    expect(s.networking.ingress.hosts).toEqual(['paperclip.example.com'])
    expect(s.networking.ingress.tls).toEqual([
      { hosts: ['paperclip.example.com'], secretName: 'paperclip-tls' },
    ])
    expect(s.probes).toEqual({ type: 'auto' })
    expect(s.heartbeat).toEqual({ enabled: true, intervalMS: 30000 })
    expect(s.backup.appNative).toEqual({ enabled: true, intervalMinutes: 60, retentionDays: 7 })
    expect(s.security.containerSecurityContext.runAsUser).toBe(0)
    expect(s.security.containerSecurityContext.runAsNonRoot).toBe(false)
    expect(s.security.podSecurityContext).toEqual({ fsGroup: 1000 })
  })

  it('renders facit ingress annotations, mergeable via ingressAnnotations', () => {
    const a = resource(renderApp(), 'Instance').spec.networking.ingress.annotations
    expect(a['cert-manager.io/cluster-issuer']).toBe('letsencrypt-prod')
    expect(a['nginx.ingress.kubernetes.io/proxy-body-size']).toBe('50m')
    expect(a['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe('300')
    expect(a['nginx.ingress.kubernetes.io/ssl-redirect']).toBe('true')

    const b = resource(
      renderApp({ ingressAnnotations: { 'nginx.ingress.kubernetes.io/proxy-body-size': '500m' } }),
      'Instance'
    ).spec.networking.ingress.annotations
    expect(b['nginx.ingress.kubernetes.io/proxy-body-size']).toBe('500m')
  })

  it('renders the facit env contract incl. model catalog', () => {
    const env = Object.fromEntries(
      resource(renderApp(), 'Instance').spec.env.map((e: { name: string; value?: string }) => [
        e.name,
        e.value,
      ])
    )
    expect(env.PAPERCLIP_TELEMETRY_DISABLED).toBe('1')
    expect(env.OPENAI_BASE_URL).toBe('https://api.berget.ai/v1')
    expect(env.PAPERCLIP_SECRETS_PROVIDER).toBe('local_encrypted')
    expect(env.PAPERCLIP_STORAGE_LOCAL_DIR).toBe('/paperclip/storage')
    expect(env.HEARTBEAT_SCHEDULER_ENABLED).toBe('true')
    expect(env.PAPERCLIP_DB_BACKUP_ENABLED).toBe('true')
    expect(env.PAPERCLIP_AUTH_BASE_URL_MODE).toBe('explicit')
    expect(env.PAPERCLIP_AUTH_PUBLIC_BASE_URL).toBe('https://paperclip.example.com')
    expect(env.OPENCODE_CONFIG_CONTENT).toContain('"moonshotai/Kimi-K3"')
    expect(env.PAPERCLIP_ADAPTER_MODELS).toContain('berget/google/gemma-4-31B-it')
    // OPENAI_API_KEY comes via secretKeyRef, never inline
    const key = resource(renderApp(), 'Instance').spec.env.find(
      (e: { name: string }) => e.name === 'OPENAI_API_KEY'
    )
    expect(key.valueFrom.secretKeyRef).toEqual({ name: 'berget-api-key', key: 'api-key' })
  })

  it('modelCatalog: false omits both catalog vars; override replaces them', () => {
    const envOff = Object.fromEntries(
      resource(renderApp({ modelCatalog: false }), 'Instance').spec.env.map(
        (e: { name: string; value?: string }) => [e.name, e.value]
      )
    )
    expect(envOff.OPENCODE_CONFIG_CONTENT).toBeUndefined()
    expect(envOff.PAPERCLIP_ADAPTER_MODELS).toBeUndefined()

    const envCustom = Object.fromEntries(
      resource(renderApp({ modelCatalog: { adapterModels: '{"x":[]}' } }), 'Instance').spec.env.map(
        (e: { name: string; value?: string }) => [e.name, e.value]
      )
    )
    expect(envCustom.PAPERCLIP_ADAPTER_MODELS).toBe('{"x":[]}')
  })

  it('provisions paperclip-secrets + berget-api-key with StatefulSet rotation restart', () => {
    const all = renderApp().resources.filter((r) => r.kind === 'OpenBaoStaticSecret') as {
      metadata: { name: string }
      spec: {
        path: string
        refreshAfter?: string
        rolloutRestartTargets?: { kind: string; name: string }[]
        destination: {
          name: string
          transformation: { templates: Record<string, { text: string }> }
        }
      }
    }[]
    const appSecret = all.find((r) => r.metadata.name === 'paperclip-secrets')
    const apiKey = all.find((r) => r.metadata.name === 'berget-api-key')
    expect(appSecret?.spec.path).toBe('paperclip/paperclip/app')
    expect(appSecret?.spec.rolloutRestartTargets).toEqual([
      { kind: 'StatefulSet', name: 'paperclip' },
    ])
    expect(appSecret?.spec.destination.transformation.templates['better-auth-secret'].text).toBe(
      '{{ .Secrets.better-auth-secret }}'
    )
    expect(apiKey?.spec.path).toBe('paperclip/paperclip/berget-ai')
    expect(apiKey?.spec.refreshAfter).toBe('3600s')
    expect(apiKey?.spec.rolloutRestartTargets).toEqual([{ kind: 'StatefulSet', name: 'paperclip' }])
  })

  it('secretsName/apiKeySecretName reference pre-created secrets (no provisioning)', () => {
    const result = renderApp({ secretsName: 'existing-app', apiKeySecretName: 'existing-key' })
    expect(result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret')).toHaveLength(0)
    const inst = resource(result, 'Instance')
    expect(inst.spec.auth.secretRef.name).toBe('existing-app')
    expect(inst.spec.adapters.apiKeysSecretRef.name).toBe('existing-key')
  })

  it('throws an actionable error without a backend and without secret references', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(Paperclip, { host: 'paperclip.example.com' } as never),
        })
      )
    ).toThrow(/Paperclip "paperclip" requires/)
  })

  it('renders the CNPG cluster in cnpg credentialsMode (no backend VSO, default -app secret)', () => {
    const result = renderApp()
    const cluster = resource(result, 'Cluster')
    expect(cluster.metadata.name).toBe('paperclip-db')
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.storage.size).toBe('20Gi')
    expect(cluster.spec.postgresql.parameters.max_connections).toBe('200')
    // CNPG default bootstrap secret naming — the Instance references `<db>-app`
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
    // No backend-managed credentials VSO for the database
    expect(
      result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret').map((r) => r.metadata.name)
    ).toEqual(['paperclip-secrets', 'berget-api-key'])
  })

  it('passes backup through to the Database recipe', () => {
    const cluster = resource(
      renderApp({
        backup: {
          destinationPath: 's3://backups/paperclip-cnpg',
          endpointURL: 'https://s3.nl-ams.scw.cloud',
          credentialsSecret: 'scaleway-s3-secret',
        },
      }),
      'Cluster'
    )
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://backups/paperclip-cnpg'
    )
  })

  it('produces valid, plaintext-free manifests', () => {
    const result = renderApp()
    for (const r of result.resources) {
      expect(validateResource(r)).toEqual([])
    }
    expect(runGuardrails(result.resources as never, [noPlaintextSecrets]).passed).toBe(true)
  })
})

const DEFAULT_RESOURCES_MATCH = {
  requests: { memory: '512Mi', cpu: '250m' },
  limits: { memory: '12Gi', cpu: '2' },
}
