import { describe, it, expect } from 'vitest'
import { render, jsx, useContext } from '@r8s/core'
import type { r8sElement } from '@r8s/core'
import { DatabaseContext, SecretContext, ClusterContext } from '@r8s/core/defaults'
import { Database, databaseCredentialsRef } from '../src/index'

// Database credentials contract: databaseCredentialsRef is the single
// resolution point for the bootstrap-password Secret. CloudNativePG does
// NOT auto-create a Secret referenced from bootstrap.initdb.secret, so the
// resolved name must always be one something actually provisions — the
// backend-provisioned `<name>-db-credentials` when a provisioning backend
// is active, otherwise the CNPG-generated `<name>-app`.

/** Probe child: emits the DatabaseContext password Secret as a ConfigMap. */
function PasswordSecretProbe(): r8sElement {
  const ctx = useContext(DatabaseContext)
  return jsx('ConfigMap', {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: 'credentials-probe' },
    data: { name: ctx?.passwordSecret?.name ?? '', key: ctx?.passwordSecret?.key ?? '' },
  })
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }
const vault = { backend: 'vault', mount: 'kv', path: 'test' }
const sealed = { backend: 'sealed-secrets' }
const kubernetes = { backend: 'kubernetes' }
const manual = { backend: 'manual-secrets' }

const sharedClusterConfig = { host: 'shared-db.example.internal', port: 5432 } as never

describe('databaseCredentialsRef — helper resolution', () => {
  it('resolves <name>-db-credentials with an openbao backend in default mode', () => {
    expect(databaseCredentialsRef('app-db', openbao as never)).toEqual({
      name: 'app-db-db-credentials',
      key: 'password',
    })
  })

  it('resolves <name>-db-credentials with a vault backend in default mode', () => {
    expect(databaseCredentialsRef('app-db', vault as never)).toEqual({
      name: 'app-db-db-credentials',
      key: 'password',
    })
  })

  it('resolves <name>-db-credentials for sealed-secrets (the rendered SealedSecret destination)', () => {
    expect(databaseCredentialsRef('app-db', sealed as never)).toEqual({
      name: 'app-db-db-credentials',
      key: 'password',
    })
  })

  it('resolves <name>-app without a backend', () => {
    expect(databaseCredentialsRef('app-db', null)).toEqual({
      name: 'app-db-app',
      key: 'password',
    })
  })

  it("resolves <name>-app with a backend when credentialsMode is 'cnpg'", () => {
    for (const provider of [openbao, vault, sealed, kubernetes, manual]) {
      expect(databaseCredentialsRef('app-db', provider as never, 'cnpg')).toEqual({
        name: 'app-db-app',
        key: 'password',
      })
    }
  })

  it('resolves <name>-app under passive backends (kubernetes, manual-secrets)', () => {
    for (const provider of [kubernetes, manual]) {
      expect(databaseCredentialsRef('app-db', provider as never)).toEqual({
        name: 'app-db-app',
        key: 'password',
      })
    }
  })

  it("explicit 'backend' mode resolves like the default", () => {
    expect(databaseCredentialsRef('app-db', openbao as never, 'backend')).toEqual(
      databaseCredentialsRef('app-db', openbao as never)
    )
    expect(databaseCredentialsRef('app-db', null, 'backend')).toEqual(
      databaseCredentialsRef('app-db', null)
    )
  })
})

describe('contract alignment — helper resolution vs Database rendering', () => {
  // For every backend the helper and the rendered Cluster must agree:
  // initdb.secret present ⇔ the helper resolves the provisioned
  // `-db-credentials` (the name createSecretResources renders). A drift
  // either flips app packages onto a CNPG Secret the backend does not
  // control or re-creates the dangling-initdb-reference bug.
  const backends: Array<{ backend: string; mount?: string; path?: string } | null> = [
    null,
    openbao,
    vault,
    sealed,
    kubernetes,
    manual,
  ]

  it('initdb.secret is present exactly when the helper resolves -db-credentials', () => {
    for (const provider of backends) {
      const element = jsx(Database, {
        backup: false,
        name: 'align-db',
        namespace: 'ns',
      })
      const result = render(
        provider
          ? jsx(SecretContext.Provider, { value: provider as never, children: element })
          : element
      )
      const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
      const resolved = databaseCredentialsRef('align-db', provider as never)
      if (resolved.name === 'align-db-db-credentials') {
        expect(cluster.spec.bootstrap.initdb.secret).toEqual({ name: resolved.name })
      } else {
        expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
      }
    }
  })
})

describe('Database credentials rendering — dedicated cluster', () => {
  it('no backend: no initdb.secret and the context resolves <name>-app', () => {
    const result = render(
      jsx(Database, {
        backup: false,
        name: 'web-db',
        namespace: 'ns',
        children: jsx(PasswordSecretProbe, {}),
      })
    )
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster).toBeDefined()
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()

    const probe = result.resources.find((r: any) => r.metadata?.name === 'credentials-probe') as any
    expect(probe.data.name).toBe('web-db-app')
    expect(probe.data.key).toBe('password')
  })

  it('backend (openbao): initdb.secret present, static-secret destination and context agree on <name>-db-credentials', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(Database, {
          backup: false,
          name: 'web-db',
          namespace: 'ns',
          children: jsx(PasswordSecretProbe, {}),
        }),
      })
    )
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.bootstrap.initdb.secret).toEqual({ name: 'web-db-db-credentials' })

    const staticSecret = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(staticSecret).toBeDefined()
    expect(staticSecret.spec.destination.name).toBe('web-db-db-credentials')

    const probe = result.resources.find((r: any) => r.metadata?.name === 'credentials-probe') as any
    expect(probe.data.name).toBe('web-db-db-credentials')
    expect(probe.data.key).toBe('password')
  })

  it("credentialsMode 'cnpg' with a backend: no initdb.secret, no DB provisioning, context resolves <name>-app", () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(Database, {
          backup: false,
          name: 'web-db',
          namespace: 'ns',
          credentialsMode: 'cnpg',
          children: jsx(PasswordSecretProbe, {}),
        }),
      })
    )
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
    // createSecretResources is skipped entirely — CNPG owns the credentials
    expect(result.resources.some((r: any) => r.kind === 'OpenBaoStaticSecret')).toBe(false)

    const probe = result.resources.find((r: any) => r.metadata?.name === 'credentials-probe') as any
    expect(probe.data.name).toBe('web-db-app')
  })

  it('passive backend (kubernetes): no initdb.secret and the context resolves <name>-app (no dangling reference)', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: kubernetes as never,
        children: jsx(Database, { backup: false, name: 'web-db', namespace: 'ns' }),
      })
    )
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
  })

  it('sealed-secrets backend: unchanged — initdb.secret points at the rendered SealedSecret destination', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: sealed as never,
        children: jsx(Database, { backup: false, name: 'web-db', namespace: 'ns' }),
      })
    )
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.bootstrap.initdb.secret).toEqual({ name: 'web-db-db-credentials' })
    const sealedSecret = result.resources.find((r: any) => r.kind === 'SealedSecret') as any
    expect(sealedSecret.metadata.name).toBe('web-db-db-credentials')
  })
})

describe('Database credentials rendering — shared cluster', () => {
  it('with a backend: the context resolves the provisioned <name>-db-credentials', () => {
    const result = render(
      jsx(ClusterContext.Provider, {
        value: sharedClusterConfig as never,
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Database, {
            backup: false,
            name: 'web-db',
            namespace: 'ns',
            children: jsx(PasswordSecretProbe, {}),
          }),
        }),
      })
    )
    // No Cluster resource of its own — connection info comes from the context
    const probe = result.resources.find((r: any) => r.metadata?.name === 'credentials-probe') as any
    expect(probe).toBeDefined()
    expect(probe.data.name).toBe('web-db-db-credentials')
    expect(probe.data.key).toBe('password')
  })

  it('without a backend: throws (CNPG cannot generate credentials for shared clusters)', () => {
    expect(() =>
      render(
        jsx(ClusterContext.Provider, {
          value: sharedClusterConfig as never,
          children: jsx(Database, { backup: false, name: 'web-db', namespace: 'ns' }),
        })
      )
    ).toThrow(/shared Cluster without a secrets backend/)
  })
})
