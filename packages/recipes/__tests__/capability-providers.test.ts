import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext, Namespace, RoutingContext } from '@r8s/core/defaults'
import {
  StaticSecret,
  Endpoint,
  canProvisionSecrets,
  provisionerForSecretProvider,
} from '../src/index'

/**
 * Capability-hook tests: providers carry behavior (provision()/route()),
 * not identity. New backends plug in without touching recipes or packages.
 */

describe('capability hooks — secrets', () => {
  const externalSecretsProvisioner = {
    backend: 'external-secrets',
    mount: 'kv',
    path: 'apps',
    provision: (req: {
      name: string
      namespace: string
      path: string
      keys: Record<string, string>
      refreshAfter?: string
    }) =>
      jsx('ExternalSecret', {
        apiVersion: 'external-secrets.io/v1beta1',
        kind: 'ExternalSecret',
        metadata: { name: req.name, namespace: req.namespace },
        spec: {
          refreshInterval: req.refreshAfter,
          data: Object.entries(req.keys).map(([dest, src]) => ({
            secretKey: dest,
            remoteRef: { key: `${req.path}#${src}` },
          })),
        },
      }),
  }

  it('StaticSecret provisions through a custom provision() hook (no built-in CRD emitted)', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: externalSecretsProvisioner as never,
        children: jsx(StaticSecret, {
          name: 'api-secrets',
          namespace: 'prod',
          path: 'api/app',
          keys: { API_KEY: 'api_key' },
          refreshAfter: '5m',
        }),
      })
    )
    const es = result.resources.find((r) => r.kind === 'ExternalSecret') as {
      metadata?: { name: string; namespace: string }
      spec?: { data: { secretKey: string; remoteRef: { key: string } }[] }
    }
    expect(es).toBeDefined()
    expect(es.metadata?.name).toBe('api-secrets')
    expect(es.metadata?.namespace).toBe('prod')
    expect(es.spec?.data).toEqual([{ secretKey: 'API_KEY', remoteRef: { key: 'api/app#api_key' } }])
    expect(result.resources.find((r) => r.kind === 'VaultStaticSecret')).toBeUndefined()
    expect(result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')).toBeUndefined()
  })

  it('capability detection: provision() carries capability, passive backends do not', () => {
    expect(canProvisionSecrets({ backend: 'openbao', mount: 'kv', path: 'apps' })).toBe(true)
    expect(canProvisionSecrets({ backend: 'vault', mount: 'kv', path: 'apps' })).toBe(true)
    expect(canProvisionSecrets(externalSecretsProvisioner as never)).toBe(true)
    expect(canProvisionSecrets({ backend: 'manual-secrets', mount: '', path: '' })).toBe(false)
    expect(canProvisionSecrets(null)).toBe(false)
    expect(
      provisionerForSecretProvider({ backend: 'kubernetes', mount: '', path: '' })
    ).toBeUndefined()
  })
})

describe('capability hooks — routing', () => {
  it('Endpoint delegates to a custom route() hook (no built-in Ingress/HTTPRoute)', () => {
    const routing = {
      mode: 'traefik',
      route: (req: { name: string; namespace: string; host: string; serviceName: string }) =>
        jsx('IngressRoute', {
          apiVersion: 'traefik.io/v1alpha1',
          kind: 'IngressRoute',
          metadata: { name: req.name, namespace: req.namespace },
          spec: {
            entryPoints: ['websecure'],
            routes: [{ match: `Host(\`${req.host}\`)`, services: [{ name: req.serviceName }] }],
          },
        }),
    }
    const result = render(
      jsx(RoutingContext.Provider, {
        value: routing as never,
        children: jsx(Endpoint, {
          name: 'web',
          host: 'web.example.com',
          serviceName: 'web',
        }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('IngressRoute')
    expect(kinds).not.toContain('Ingress')
    expect(kinds).not.toContain('HTTPRoute')
  })
})

describe('capability hooks — namespace', () => {
  it('useNamespace: context inherits, explicit override wins', () => {
    const child = jsx(StaticSecret, {
      name: 's',
      path: 's/app',
      keys: { FOO: 'foo' },
    })
    const inherited = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'openbao', mount: 'kv', path: 'apps' } as never,
        children: jsx(Namespace.Provider, { value: 'team-x', children: child }),
      })
    )
    const sec = inherited.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
    expect(sec?.metadata?.namespace).toBe('team-x')

    const overridden = render(
      jsx(Namespace.Provider, {
        value: 'team-y',
        children: jsx(SecretContext.Provider, {
          value: { backend: 'openbao', mount: 'kv', path: 'apps' } as never,
          children: jsx(StaticSecret, {
            name: 's',
            namespace: 'override-ns',
            path: 's/app',
            keys: { FOO: 'foo' },
          }),
        }),
      })
    )
    expect(
      overridden.resources.find((r) => r.kind === 'OpenBaoStaticSecret')?.metadata?.namespace
    ).toBe('override-ns')
  })
})
