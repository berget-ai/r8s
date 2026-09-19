import { describe, it, expect } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import {
  SecretProvider,
  OpenBao,
  Vault,
  SealedSecrets,
  Kubernetes,
  DnsProvider,
  ExternalDns,
  EndpointProvider,
  Nginx,
  EnvoyGateway,
  Platform,
  App,
  Database,
  Endpoint,
} from '../src/index'

describe('Provider Hierarchy', () => {
  describe('SecretProvider', () => {
    it('should accept string provider "openbao"', () => {
      const element = jsx(SecretProvider, {
        provider: 'openbao',
        children: jsx(Database, { backup: false, name: 'test-db' }),
      })

      const result = render(element)
      const kinds = result.resources.map((r) => r.kind)

      // Should declare vault-secrets-operator
      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
      // Should create Cluster (CNPG manages secret)
      expect(kinds).toContain('Cluster')
    })

    it('should accept component provider <OpenBao>', () => {
      const element = jsx(SecretProvider, {
        provider: OpenBao({ mount: 'secret', path: 'infra', authRef: 'custom-auth' }),
        children: jsx(Database, { backup: false, name: 'test-db' }),
      })

      const result = render(element)

      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
    })

    it('should accept component provider <Vault>', () => {
      const element = jsx(SecretProvider, {
        provider: Vault({ mount: 'kv', path: 'apps' }),
        children: jsx(Database, { backup: false, name: 'test-db' }),
      })

      const result = render(element)

      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
    })

    it('should accept string provider "sealed-secrets"', () => {
      const element = jsx(SecretProvider, {
        provider: 'sealed-secrets',
        children: jsx(Database, { backup: false, name: 'test-db' }),
      })

      const result = render(element)
      const kinds = result.resources.map((r) => r.kind)

      // Should NOT declare vault-secrets-operator
      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(false)
      // Should create SealedSecret
      expect(kinds).toContain('SealedSecret')
    })

    it('should accept string provider "kubernetes" without rendering plaintext Secrets', () => {
      const element = jsx(SecretProvider, {
        provider: 'kubernetes',
        children: jsx(Database, { backup: false, name: 'test-db' }),
      })

      const result = render(element)
      const kinds = result.resources.map((r) => r.kind)

      // Should NOT declare vault-secrets-operator
      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(false)
      // CNPG provisions credentials in-cluster — no plaintext Secret in the manifest
      expect(kinds).toContain('Cluster')
      expect(kinds).not.toContain('Secret')
    })

    it('should reject plaintext password props on Database via SecretProvider', () => {
      const element = jsx(SecretProvider, {
        provider: 'sealed-secrets',
        children: jsx(Database, { backup: false, name: 'test-db', password: 'secret123' } as any),
      })

      expect(() => render(element)).toThrow(/received a plaintext password/)
    })

    it('declares Reloader alongside VSO for the rotation-capable backends only', () => {
      const rotating = (provider: any) =>
        render(jsx(SecretProvider, { provider, children: null })).operators.some(
          (op) => op.name === 'reloader'
        )

      expect(rotating('openbao')).toBe(true)
      expect(rotating('vault')).toBe(true)
      expect(rotating('sealed-secrets')).toBe(false)
      expect(rotating('kubernetes')).toBe(false)
      expect(rotating('manual-secrets')).toBe(false)
    })

  it('Reloader is deduplicated when the Platform already declares it', () => {
    const preinstalled = [
      {
        name: 'reloader',
        description: 'pre-installed',
        source: {
          type: 'manifest' as const,
          url: 'https://raw.githubusercontent.com/stakater/Reloader/v1.4.22/deployments/kubernetes/reloader.yaml',
          version: '1.4.22',
        },
        version: '1.4.22',
        namespace: 'reloader',
        crds: [],
      },
    ]
      const result = render(
        jsx(OperatorContext.Provider, {
          value: preinstalled,
          children: jsx(SecretProvider, { provider: 'openbao', children: null }),
        })
      )

      expect(result.operators.filter((op) => op.name === 'reloader')).toHaveLength(1)
    })
  })

  describe('DnsProvider', () => {
    it('should accept string provider "external-dns"', () => {
      const element = jsx(DnsProvider, {
        provider: 'external-dns',
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)

      // Should declare external-dns operator
      expect(result.operators.some((op) => op.name === 'external-dns')).toBe(true)
      // Without explicit targets, no DNSEndpoint CR is created — the Ingress
      // is annotated for the ExternalDNS ingress source instead.
      expect(result.resources.some((r) => r.kind === 'DNSEndpoint')).toBe(false)
      const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
      expect(ingress.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe(
        'test.example.com'
      )
    })

    it('should accept component provider <ExternalDns>', () => {
      const element = jsx(SecretProvider, {
        provider: 'openbao',
        children: jsx(DnsProvider, {
          provider: ExternalDns({
            server: 'ns1.example.com',
            zone: 'example.com',
            tsig: { path: 'dns/tsig', key: 'secret' },
          }),
          children: jsx(Endpoint, {
            name: 'test',
            host: 'test.example.com',
            serviceName: 'svc',
          }),
        }),
      })

      const result = render(element)

      // Should declare both operators
      expect(result.operators.some((op) => op.name === 'external-dns')).toBe(true)
      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
      // Should create OpenBaoStaticSecret for TSIG — with the openbao group,
      // not the vault/hashicorp group (secret-provider parity)
      const tsig = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
      expect(tsig).toBeDefined()
      expect(tsig?.apiVersion).toBe('secrets.openbao.org/v1beta1')
      // Without explicit targets, no DNSEndpoint CR is created
      expect(result.resources.some((r) => r.kind === 'DNSEndpoint')).toBe(false)
      const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
      expect(ingress.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe(
        'test.example.com'
      )
    })

    it('should throw when tsig used without SecretProvider', () => {
      const element = jsx(DnsProvider, {
        provider: ExternalDns({
          server: 'ns1.example.com',
          tsig: { path: 'dns/tsig', key: 'secret' },
        }),
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      expect(() => render(element)).toThrow(/tsig requires SecretProvider/)
    })

    it('should annotate all Endpoint children for ExternalDNS source mode', () => {
      const element = jsx(DnsProvider, {
        provider: 'external-dns',
        children: jsx(Fragment, {
          children: [
            jsx(Endpoint, { name: 'api', host: 'api.example.com', serviceName: 'api' }),
            jsx(Endpoint, { name: 'web', host: 'web.example.com', serviceName: 'web' }),
          ],
        }),
      })

      const result = render(element)

      // No DNSEndpoint CRs without explicit targets — both Ingresses get
      // the external-dns hostname annotation instead.
      const dnsEndpoints = result.resources.filter((r) => r.kind === 'DNSEndpoint')
      expect(dnsEndpoints).toHaveLength(0)

      const ingresses = result.resources.filter((r) => r.kind === 'Ingress') as any[]
      expect(ingresses).toHaveLength(2)
      const hostnames = ingresses.map(
        (i) => i.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']
      )
      expect(hostnames).toContain('api.example.com')
      expect(hostnames).toContain('web.example.com')
    })
  })

  describe('EndpointProvider', () => {
    it('should accept string provider "nginx"', () => {
      const element = jsx(EndpointProvider, {
        provider: 'nginx',
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)

      expect(result.resources.some((r) => r.kind === 'Ingress')).toBe(true)
    })

    it('should accept component provider <Nginx>', () => {
      const element = jsx(EndpointProvider, {
        provider: Nginx({ className: 'nginx-internal' }),
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)
      const ingress = result.resources.find((r) => r.kind === 'Ingress')

      expect(ingress.spec.ingressClassName).toBe('nginx-internal')
    })

    it('should accept component provider <EnvoyGateway>', () => {
      const element = jsx(EndpointProvider, {
        provider: EnvoyGateway({ className: 'custom-eg' }),
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)

      expect(result.resources.some((r) => r.kind === 'Gateway')).toBe(true)
      expect(result.resources.some((r) => r.kind === 'HTTPRoute')).toBe(true)
      const gateway = result.resources.find((r) => r.kind === 'Gateway')
      expect(gateway.spec.gatewayClassName).toBe('custom-eg')
    })
  })

  describe('Full hierarchy', () => {
    it('should compose all providers with Platform', () => {
      const element = jsx(Platform, {
        secrets: 'openbao',
        dns: 'external-dns',
        routing: 'gateway',
        children: jsx(App, {
          name: 'api',
          image: 'myapp:v1',
          host: 'api.example.com',
        }),
      })

      const result = render(element)
      const kinds = result.resources.map((r) => r.kind)

      // Operators
      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
      expect(result.operators.some((op) => op.name === 'external-dns')).toBe(true)
      expect(result.operators.some((op) => op.name === 'envoy-gateway')).toBe(true)

      // Resources
      expect(kinds).toContain('Deployment')
      expect(kinds).toContain('Service')
      expect(kinds).toContain('Gateway')
      expect(kinds).toContain('HTTPRoute')
      // No DNSEndpoint without explicit targets — Gateway is annotated instead
      expect(kinds).not.toContain('DNSEndpoint')
      const gateway = result.resources.find((r) => r.kind === 'Gateway') as any
      expect(gateway.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe(
        'api.example.com'
      )
    })

    it('should compose all providers manually', () => {
      const element = jsx(SecretProvider, {
        provider: OpenBao({ mount: 'secret', path: 'infra' }),
        children: jsx(DnsProvider, {
          provider: ExternalDns({
            server: 'ns1.example.com',
            tsig: { path: 'dns/tsig', key: 'secret' },
          }),
          children: jsx(EndpointProvider, {
            provider: EnvoyGateway({ className: 'eg' }),
            children: jsx(App, {
              name: 'api',
              image: 'myapp:v1',
              host: 'api.example.com',
            }),
          }),
        }),
      })

      const result = render(element)
      const kinds = result.resources.map((r) => r.kind)

      // All operators
      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
      expect(result.operators.some((op) => op.name === 'external-dns')).toBe(true)
      expect(result.operators.some((op) => op.name === 'envoy-gateway')).toBe(true)

      // All resources
      expect(kinds).toContain('Deployment')
      expect(kinds).toContain('Service')
      expect(kinds).toContain('Gateway')
      expect(kinds).toContain('HTTPRoute')
      // No DNSEndpoint without explicit targets — Gateway is annotated instead
      expect(kinds).not.toContain('DNSEndpoint')
      const gateway = result.resources.find((r) => r.kind === 'Gateway') as any
      expect(gateway.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe(
        'api.example.com'
      )
      expect(kinds).toContain('OpenBaoStaticSecret')
    })

    it('should allow mixed string and component providers', () => {
      const element = jsx(SecretProvider, {
        provider: 'openbao',
        children: jsx(DnsProvider, {
          provider: ExternalDns({ server: 'ns1.example.com' }),
          children: jsx(EndpointProvider, {
            provider: 'nginx',
            children: jsx(App, {
              name: 'api',
              image: 'myapp:v1',
              host: 'api.example.com',
            }),
          }),
        }),
      })

      const result = render(element)

      expect(result.operators.some((op) => op.name === 'vault-secrets-operator')).toBe(true)
      expect(result.operators.some((op) => op.name === 'external-dns')).toBe(true)
      expect(result.resources.some((r) => r.kind === 'Ingress')).toBe(true)
    })
  })
})

describe('Reloader secret-rotation rollouts', () => {
  const deployments = (element: any) =>
    render(element).resources.filter((r) => r.kind === 'Deployment') as any[]

  it('App under an OpenBao Platform carries the Reloader annotation on its Deployment', () => {
    const element = jsx(Platform, {
      namespace: 'production',
      secrets: { backend: 'openbao', mount: 'secret', path: 'infra' },
      children: jsx(App, { name: 'api', image: 'myapp/api:v1' }),
    })

    for (const d of deployments(element)) {
      expect(d.spec.template.metadata.annotations).toEqual({
        'reloader.stakater.com/auto': 'true',
      })
    }
  })

  it('the App Deployment facing backend-provisioned credentials is annotated', () => {
    // App under a Database consumes the backend-provisioned
    // `<name>-db-credentials` Secret via DatabaseContext — no explicit
    // `secrets`/`vault` props — mirroring the directive's core scenario.
    const element = jsx(Platform, {
      namespace: 'production',
      secrets: 'openbao',
      children: jsx(Fragment, {
        children: [
          jsx(Database, { backup: false, name: 'api-db' }),
          jsx(App, { name: 'api', image: 'myapp/api:v1' }),
        ],
      }),
    })

    const app = deployments(element).find((d) => d.metadata.name === 'api')
    expect(app?.spec.template.metadata.annotations).toEqual({
      'reloader.stakater.com/auto': 'true',
    })
    // The CNPG Cluster itself is NOT opting into Reloader — the operator
    // manages its own credential rollouts.
    const cluster = render(element).resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.template).toBeUndefined()
  })

  it('no annotation without a rotation-capable backend', () => {
    const element = jsx(App, { name: 'api', image: 'myapp/api:v1' })
    for (const d of deployments(element)) {
      expect(d.spec.template.metadata.annotations).toBeUndefined()
    }

    const manual = jsx(Platform, {
      namespace: 'production',
      secrets: 'manual-secrets',
      children: jsx(App, { name: 'api', image: 'myapp/api:v1' }),
    })
    for (const d of deployments(manual)) {
      expect(d.spec.template.metadata.annotations).toBeUndefined()
    }
  })

  it('standalone App with vault refs implies VSO and is annotated', () => {
    const element = jsx(App, {
      name: 'api',
      image: 'myapp/api:v1',
      vault: { DATABASE_URL: { mount: 'kv', path: 'db/credentials' } },
    })

    const app = deployments(element).find((d) => d.metadata.name === 'api')
    expect(app?.spec.template.metadata.annotations).toEqual({
      'reloader.stakater.com/auto': 'true',
    })
  })
})
