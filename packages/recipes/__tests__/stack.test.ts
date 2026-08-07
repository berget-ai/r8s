import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Stack } from '../src/stack'
import { App, Database } from '../src/index'

const baseProps = {
  namespace: 'production',
  secrets: { mount: 'secret', path: 'production' },
  dns: { server: 'ns1.example.com', zone: 'example.com', tsigPath: 'dns/tsig' },
  children: null,
}

describe('Stack', () => {
  it('declares all cluster operators', () => {
    const result = render(jsx(Stack, baseProps))

    const opNames = result.operators.map((o) => o.name)
    expect(opNames).toContain('cert-manager')
    expect(opNames).toContain('external-dns')
    expect(opNames).toContain('envoy-gateway')
    expect(opNames).toContain('vault-secrets-operator')
    expect(opNames).toContain('prometheus')
    expect(opNames).toContain('loki')
    expect(opNames).toContain('logging-operator')
  })

  it('materializes the Namespace resource', () => {
    const result = render(jsx(Stack, baseProps))

    const ns = result.resources.find(
      (r) => r.kind === 'Namespace' && r.metadata?.name === 'production'
    )
    expect(ns).toBeDefined()
  })

  it('creates LokiStack for log aggregation', () => {
    const result = render(jsx(Stack, baseProps))

    const loki = result.resources.find((r) => r.kind === 'LokiStack')
    expect(loki).toBeDefined()
    expect(loki?.metadata?.namespace).toBe('production')
  })

  it('creates Logging (FluentBit) for pod log collection', () => {
    const result = render(jsx(Stack, baseProps))

    const logging = result.resources.find((r) => r.kind === 'Logging')
    expect(logging).toBeDefined()
    expect(logging?.metadata?.namespace).toBe('production')
  })

  it('creates Flow matching all pods and Output pointing to Loki', () => {
    const result = render(jsx(Stack, baseProps))

    const flow = result.resources.find((r) => r.kind === 'Flow') as any
    expect(flow).toBeDefined()
    expect(flow.spec.localOutputRefs).toHaveLength(1)

    const output = result.resources.find((r) => r.kind === 'Output') as any
    expect(output).toBeDefined()
    expect(output.spec.loki.tenant).toBe('application')
  })

  it('creates VaultStaticSecret for TSIG key', () => {
    const result = render(jsx(Stack, baseProps))

    const tsigSecret = result.resources.find(
      (r) => r.kind === 'VaultStaticSecret' || r.kind === 'OpenBaoStaticSecret'
    )
    expect(tsigSecret).toBeDefined()
  })

  it('passes namespace context to children', () => {
    const result = render(
      jsx(Stack, {
        ...baseProps,
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })
    )

    const deploy = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata?.name === 'api'
    ) as any
    expect(deploy).toBeDefined()
    expect(deploy.metadata.namespace).toBe('production')
  })

  it('passes routing context (Envoy Gateway) to children', () => {
    const result = render(
      jsx(Stack, {
        ...baseProps,
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })
    )

    // App with gateway routing creates Gateway + HTTPRoute, not Ingress
    const gateway = result.resources.find(
      (r) => r.kind === 'Gateway' && r.metadata?.name === 'api-endpoint-gateway'
    )
    expect(gateway).toBeDefined()

    const ingress = result.resources.find((r) => r.kind === 'Ingress' && r.metadata?.name === 'api')
    expect(ingress).toBeUndefined()
  })

  it('passes secrets context (OpenBao) to children', () => {
    const result = render(
      jsx(Stack, {
        ...baseProps,
        children: jsx(Database, { name: 'api-db', storage: '10Gi' }),
      })
    )

    // Database creates a VaultStaticSecret/OpenBaoStaticSecret for credentials
    const dbSecret = result.resources.find(
      (r) =>
        (r.kind === 'VaultStaticSecret' || r.kind === 'OpenBaoStaticSecret') &&
        r.metadata?.name === 'api-db-db-secret'
    )
    expect(dbSecret).toBeDefined()
  })

  it('does not re-declare operators already provided via operators prop', () => {
    const preinstalled = [
      {
        name: 'cert-manager',
        description: 'pre-installed',
        source: { type: 'manifest' as const, url: '', version: '1.18.0' },
        version: '1.18.0',
        namespace: 'cert-manager',
        crds: [],
      },
    ]

    const result = render(
      jsx(Stack, {
        ...baseProps,
        operators: preinstalled,
        children: null,
      })
    )

    const certManagerCount = result.operators.filter((o) => o.name === 'cert-manager').length
    expect(certManagerCount).toBe(1)
  })

  it('sets domain context when domain prop is provided', () => {
    const result = render(
      jsx(Stack, {
        ...baseProps,
        domain: 'example.com',
        children: null,
      })
    )

    // Domain context doesn't produce a resource directly, but Stack
    // should render without errors
    expect(result.resources.length).toBeGreaterThan(0)
  })

  it('renders a complete stack with apps', () => {
    const result = render(
      jsx(Stack, {
        ...baseProps,
        children: [
          jsx(Database, { name: 'api-db', storage: '20Gi' }),
          jsx(App, {
            name: 'api',
            image: 'api:v1',
            host: 'api.example.com',
            tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
          }),
        ],
      })
    )

    const kinds = result.resources.map((r) => r.kind)
    // Cluster infrastructure
    expect(kinds).toContain('Namespace')
    expect(kinds).toContain('LokiStack')
    expect(kinds).toContain('Logging')
    expect(kinds).toContain('Flow')
    expect(kinds).toContain('Output')
    // App resources
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Gateway')
    expect(kinds).toContain('HTTPRoute')
    expect(kinds).toContain('Certificate')
  })
})
