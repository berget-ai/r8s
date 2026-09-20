import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { Paperclip } from '../src/index'

// Paperclip (operator Instance CR) recipe tests, facit-aligned against
// berget-internal/apps/paperclip:
//   1. Operator declaration (paperclip-operator 0.19.1, facit values)
//   2. Instance CR: image/pullSecrets, Better Auth, external DB, adapters,
//      storage, resources, networking, probes, heartbeat/backup (objects or
//      absent — never null), security, env
//   3. Secrets via backend: paperclip-secrets + berget-api-key with
//      StatefulSet rotation-restart; reference fallbacks; actionable errors
//   4. CNPG cluster in 'cnpg' credentialsMode (facit: `-app` fqdn-uri)

const openbao = { backend: 'openbao', mount: 'secret', path: 'paperclip' }

function renderApp(props: Record<string, unknown> = {}) {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao,
      children: jsx(Paperclip, { host: 'paperclip.example.com', backup: false, ...props } as never),
    })
  )
}

const resource = (result: ReturnType<typeof render>, kind: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind) as any

describe('Paperclip operator Instance', () => {
  it('declares the paperclip-operator once (helm-free manifest install)', () => {
    const ops = renderApp().operators.filter((o) => o.name === 'paperclip-operator')
    expect(ops).toHaveLength(1)
    expect(ops[0].version).toBe('0.19.1')
    const src = ops[0].source as { type: string; url: string; namespace: string }
    expect(src.type).toBe('manifest')
    expect(src.url).toBe(
      'https://github.com/paperclipinc/paperclip-operator/releases/download/v0.19.1/install.yaml'
    )
    expect(src.namespace).toBe('paperclip-operator-system')
  })

  it('renders the Instance CR with facit image/auth/database spec', () => {
    const inst = resource(renderApp(), 'Instance')
    expect(inst.apiVersion).toBe('paperclip.inc/v1alpha1')
    expect(inst.metadata.name).toBe('paperclip')
    expect(inst.spec.image).toEqual({
      repository: 'ghcr.io/paperclipai/paperclip',
      tag: '2026.831.1',
      pullPolicy: 'Always',
      pullSecrets: [],
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

  it('renders facit storage/resources/networking/probes/security; CR keys left to the operator when heartbeat/backup are omitted', () => {
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
    // Omitted props leave heartbeat/backup OUT of the Instance CR: the
    // paperclip.inc CRD types both as objects and rejects explicit nulls,
    // so the operator's own default governs (see the never-null suite below)
    expect('heartbeat' in s).toBe(false)
    expect('backup' in s).toBe(false)
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
    // identity-mapped keys render as a raw passthrough (Go template names
    // reject dashes — VSO names templates after the destination key)
    expect(appSecret?.spec.destination.transformation).toBeUndefined()
    expect(appSecret?.spec.destination.name).toBe('paperclip-secrets')
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

describe('heartbeat/backup CR fields — objects or absent, never null', () => {
  // Dogfood regression: the API server rejected the Instance CR with
  //   spec.backup: Invalid value: "null": must be of type object;
  //   spec.heartbeat: Invalid value: "null": must be of type object
  // The paperclip.inc/v1alpha1 CRD types both fields as objects (not
  // nullable); the old disabled-path rendered explicit `null`. Absent or
  // disabled props now omit the fields entirely; only explicit objects
  // render, with facit defaults filled.
  it('props omitted: the Instance spec has NO heartbeat/backup keys', () => {
    const s = resource(renderApp(), 'Instance').spec
    expect('heartbeat' in s).toBe(false)
    expect('backup' in s).toBe(false)
  })

  it('props disabled (false): keys omitted, never null', () => {
    const inst = resource(renderApp({ heartbeat: false, appBackup: false }), 'Instance')
    expect('heartbeat' in inst.spec).toBe(false)
    expect('backup' in inst.spec).toBe(false)
    // belt-and-braces: no null of either field anywhere in the rendered CR
    const rendered = JSON.stringify(inst)
    expect(rendered).not.toContain('"heartbeat":null')
    expect(rendered).not.toContain('"backup":null')
  })

  it('enabled: false inside the object: keys omitted instead of rendering null', () => {
    const s = resource(
      renderApp({ heartbeat: { enabled: false }, appBackup: { enabled: false } }),
      'Instance'
    ).spec
    expect('heartbeat' in s).toBe(false)
    expect('backup' in s).toBe(false)
  })

  it('props present: rendered as objects with facit defaults filled', () => {
    const s = resource(
      renderApp({ heartbeat: { intervalMS: 15000 }, appBackup: { intervalMinutes: 30 } }),
      'Instance'
    ).spec
    expect(s.heartbeat).toEqual({ enabled: true, intervalMS: 15000 })
    expect(s.backup.appNative).toEqual({ enabled: true, intervalMinutes: 30, retentionDays: 7 })
  })
})

describe('no secrets backend — CNPG-generated credentials contract', () => {
  it('still references the CNPG-generated <db>-app fqdn-uri (the contract unchanged)', () => {
    const result = render(
      jsx(Paperclip, {
        backup: false,
        host: 'paperclip.example.com',
        dbInstances: 1,
        storage: { size: '1Gi' },
        appBackup: false,
        heartbeat: false,
        modelCatalog: false,
        pullSecrets: [],
        secretsName: 'paperclip-secrets',
        apiKeySecretName: 'paperclip-api-key',
      } as never)
    )
    const inst = result.resources.find((r: any) => r.kind === 'Instance') as any
    expect(inst).toBeDefined()
    expect(inst.spec.database).toEqual({
      mode: 'external',
      externalURLSecretRef: { name: 'paperclip-db-app', key: 'fqdn-uri' },
    })

    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster).toBeDefined()
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
  })
})
