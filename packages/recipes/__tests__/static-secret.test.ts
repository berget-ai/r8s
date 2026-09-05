import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext, Namespace } from '@r8s/core/defaults'
import { StaticSecret } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'apps' }

describe('StaticSecret', () => {
  it('provisions through OpenBao with snake_case → env-case templates', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(StaticSecret, {
          name: 'wiki-secrets',
          path: 'wiki/app',
          keys: {
            SECRET_KEY: 'secret_key',
            OIDC_CLIENT_ID: 'oidc_client_id',
            OIDC_CLIENT_SECRET: 'oidc_client_secret',
          },
          restart: [{ kind: 'Deployment', name: 'wiki' }],
        }),
      })
    )
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vso).toBeDefined()
    expect(vso.spec.openbaoAuthRef).toBeUndefined() // provider.authRef not set → omitted per provider
    expect(vso.spec.mount).toBe('kv')
    expect(vso.spec.type).toBe('kv-v2')
    expect(vso.spec.path).toBe('wiki/app')
    expect(vso.spec.refreshAfter).toBe('1h')
    expect(vso.spec.rolloutRestartTargets).toEqual([{ kind: 'Deployment', name: 'wiki' }])
    expect(vso.spec.destination).toMatchObject({
      create: true,
      name: 'wiki-secrets',
      overwrite: true,
    })
    expect(vso.spec.destination.transformation.excludeRaw).toBe(true)
    const tpl = vso.spec.destination.transformation.templates
    expect(tpl.SECRET_KEY.text).toBe('{{ .Secrets.secret_key }}')
    expect(tpl.OIDC_CLIENT_ID.text).toBe('{{ .Secrets.oidc_client_id }}')
    expect(tpl.OIDC_CLIENT_SECRET.text).toBe('{{ .Secrets.oidc_client_secret }}')
    expect(Object.keys(tpl)).toHaveLength(3)
  })

  it('provisions through Vault with kind/apiVersion/authRef swapped', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'secret', path: 'x', authRef: 'my-vault-auth' } as never,
        children: jsx(StaticSecret, {
          name: 'keys',
          path: 'x/app',
          keys: { API_KEY: 'api_key' },
        }),
      })
    )
    const vso = result.resources.find((r: any) => r.kind === 'VaultStaticSecret') as any
    expect(vso.apiVersion).toBe('secrets.hashicorp.com/v1beta1')
    expect(vso.spec.vaultAuthRef).toBe('my-vault-auth')
    expect(result.resources.some((r: any) => r.kind === 'OpenBaoStaticSecret')).toBe(false)
  })

  it('string-array keys render as identity mappings', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(StaticSecret, {
          name: 'creds',
          path: 'rustfs/app',
          keys: ['accesskey', 'secretkey'],
        }),
      })
    )
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    const tpl = vso.spec.destination.transformation.templates
    expect(tpl.accesskey.text).toBe('{{ .Secrets.accesskey }}')
    expect(tpl.secretkey.text).toBe('{{ .Secrets.secretkey }}')
  })

  it('backup creds: no restart targets means no rolloutRestartTargets key', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(StaticSecret, {
          name: 's3',
          path: 'rustfs/app',
          keys: { accesskey: 'accesskey' },
        }),
      })
    )
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect('rolloutRestartTargets' in vso.spec).toBe(false)
  })

  it('inherits provider refreshAfter; explicit value wins', () => {
    const inherited = render(
      jsx(SecretContext.Provider, {
        value: { ...openbao, refreshAfter: '2h' } as never,
        children: jsx(StaticSecret, { name: 'a', path: 'p', keys: { K: 'k' } }),
      })
    )
    const vsoA = inherited.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vsoA.spec.refreshAfter).toBe('2h')

    const explicit = render(
      jsx(SecretContext.Provider, {
        value: { ...openbao, refreshAfter: '2h' } as never,
        children: jsx(StaticSecret, {
          name: 'a',
          path: 'p',
          keys: { K: 'k' },
          refreshAfter: '30m',
        }),
      })
    )
    const vsoB = explicit.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vsoB.spec.refreshAfter).toBe('30m')
  })

  it('honors secretName override and namespace context', () => {
    const result = render(
      jsx(Namespace.Provider, {
        value: 'team-x',
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(StaticSecret, {
            name: 'bundle',
            namespace: undefined,
            path: 'p',
            secretName: 'bundle-secret',
            keys: { K: 'k' },
          }),
        }),
      })
    )
    const vso = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(vso.metadata).toEqual({ name: 'bundle', namespace: 'team-x' })
    expect(vso.spec.destination.name).toBe('bundle-secret')
  })

  it('throws an actionable error without a provisioning backend', () => {
    for (const backend of [
      undefined,
      { backend: 'manual-secrets' },
      { backend: 'sealed-secrets' },
    ]) {
      const fn = () =>
        render(
          backend
            ? jsx(SecretContext.Provider, {
                value: backend as never,
                children: jsx(StaticSecret, { name: 'x', path: 'p', keys: { K: 'k' } }),
              })
            : jsx(StaticSecret, { name: 'x', path: 'p', keys: { K: 'k' } })
        )
      expect(fn).toThrow(/ende?points|backends?/i)
      expect(fn).toThrow(/provision/)
    }
  })
})
