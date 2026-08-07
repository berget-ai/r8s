import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { R8sCluster } from '../src/r8s-cluster'
import { Platform, App, Database } from '../src/index'

const baseProps = {
  secrets: { mount: 'secret', path: 'production' },
  dns: { server: 'ns1.example.com', zone: 'example.com', tsigPath: 'dns/tsig' },
  children: null,
}

describe('R8sCluster — operators', () => {
  it('declares all 7 cluster operators', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const opNames = result.operators.map((o) => o.name)
    expect(opNames).toContain('cert-manager')
    expect(opNames).toContain('external-dns')
    expect(opNames).toContain('envoy-gateway')
    expect(opNames).toContain('vault-secrets-operator')
    expect(opNames).toContain('prometheus')
    expect(opNames).toContain('loki')
    expect(opNames).toContain('logging-operator')
    expect(result.operators).toHaveLength(7)
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
      jsx(R8sCluster, {
        ...baseProps,
        operators: preinstalled,
        children: null,
      })
    )

    const certManagerCount = result.operators.filter((o) => o.name === 'cert-manager').length
    expect(certManagerCount).toBe(1)
    expect(result.operators).toHaveLength(7)
  })
})

describe('R8sCluster — logging infrastructure', () => {
  it('creates LokiStack in the logging namespace', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const loki = result.resources.find((r) => r.kind === 'LokiStack') as any
    expect(loki).toBeDefined()
    expect(loki.metadata.namespace).toBe('logging')
    expect(loki.spec.size).toBe('1x.small')
    expect(loki.spec.storage.secret.name).toBe('cluster-loki-storage')
  })

  it('creates Logging (FluentBit) in the logging namespace', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const logging = result.resources.find((r) => r.kind === 'Logging') as any
    expect(logging).toBeDefined()
    expect(logging.metadata.namespace).toBe('logging')
    expect(logging.spec.fluentbit).toBeDefined()
    expect(logging.spec.controlNamespace).toBe('logging')
  })

  it('creates Output pointing to Loki gateway', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const output = result.resources.find((r) => r.kind === 'Output') as any
    expect(output).toBeDefined()
    expect(output.metadata.namespace).toBe('logging')
    expect(output.spec.loki.tenant).toBe('application')
    expect(output.spec.loki.url).toContain('loki-gateway.logging.svc.cluster.local')
  })

  it('creates Flow matching ALL pods (empty selector)', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const flow = result.resources.find((r) => r.kind === 'Flow') as any
    expect(flow).toBeDefined()
    expect(flow.metadata.namespace).toBe('logging')
    expect(flow.spec.match[0].select.labels).toEqual({})
    expect(flow.spec.localOutputRefs).toHaveLength(1)
  })

  it('uses custom logs namespace when provided', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        logsNamespace: 'obs',
        children: null,
      })
    )

    const loki = result.resources.find((r) => r.kind === 'LokiStack') as any
    expect(loki.metadata.namespace).toBe('obs')

    const logging = result.resources.find((r) => r.kind === 'Logging') as any
    expect(logging.metadata.namespace).toBe('obs')

    const output = result.resources.find((r) => r.kind === 'Output') as any
    expect(output.spec.loki.url).toContain('loki-gateway.obs.svc.cluster.local')
  })

  it('uses custom storage class when provided', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        logsStorageClass: 'fast-ssd',
        children: null,
      })
    )

    const loki = result.resources.find((r) => r.kind === 'LokiStack') as any
    expect(loki.spec.storageClassName).toBe('fast-ssd')
  })
})

describe('R8sCluster — DNS with TSIG', () => {
  it('creates VaultStaticSecret for TSIG key in external-dns namespace', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const tsigSecret = result.resources.find(
      (r) =>
        (r.kind === 'VaultStaticSecret' || r.kind === 'OpenBaoStaticSecret') &&
        r.metadata?.name === 'external-dns-tsig'
    ) as any
    expect(tsigSecret).toBeDefined()
    expect(tsigSecret.metadata.namespace).toBe('external-dns')
  })

  it('passes DNS context to children so Endpoints get annotated', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })
    )

    const gateway = result.resources.find(
      (r) => r.kind === 'Gateway' && r.metadata?.name === 'api-endpoint-gateway'
    ) as any
    expect(gateway).toBeDefined()
    expect(gateway.metadata.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe(
      'api.example.com'
    )
  })
})

describe('R8sCluster — secrets (OpenBao VSO)', () => {
  it('passes secrets context to children so Database creates VaultStaticSecret', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        children: jsx(Database, { name: 'api-db', storage: '10Gi' }),
      })
    )

    const dbSecret = result.resources.find(
      (r) =>
        (r.kind === 'VaultStaticSecret' || r.kind === 'OpenBaoStaticSecret') &&
        r.metadata?.name === 'api-db-db-secret'
    ) as any
    expect(dbSecret).toBeDefined()
    // Database secret should use the OpenBao path from Stack
    expect(dbSecret.spec.path).toContain('production')
  })
})

describe('R8sCluster — routing (Envoy Gateway)', () => {
  it('passes gateway routing context to children', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })
    )

    // App with gateway routing creates Gateway + HTTPRoute, not Ingress
    const gateway = result.resources.find(
      (r) => r.kind === 'Gateway' && r.metadata?.name === 'api-endpoint-gateway'
    )
    expect(gateway).toBeDefined()

    const httpRoute = result.resources.find(
      (r) => r.kind === 'HTTPRoute' && r.metadata?.name === 'api-endpoint-route'
    )
    expect(httpRoute).toBeDefined()

    const ingress = result.resources.find((r) => r.kind === 'Ingress' && r.metadata?.name === 'api')
    expect(ingress).toBeUndefined()
  })

  it('uses custom gatewayClassName', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        gatewayClassName: 'envoy-gateway-system/eg',
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })
    )

    const gateway = result.resources.find(
      (r) => r.kind === 'Gateway' && r.metadata?.name === 'api-endpoint-gateway'
    ) as any
    expect(gateway.spec.gatewayClassName).toBe('envoy-gateway-system/eg')
  })
})

describe('R8sCluster — cluster-scoped (no namespace prop)', () => {
  it('does not set a namespace context — children manage their own', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })
    )

    // App without Platform/namespace defaults to 'default'
    const deploy = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata?.name === 'api'
    ) as any
    expect(deploy.metadata.namespace).toBe('default')
  })

  it('does not materialize a Namespace resource', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const ns = result.resources.filter((r) => r.kind === 'Namespace')
    expect(ns).toHaveLength(0)
  })

  it('works with Platform for app namespacing', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        children: jsx(Platform, {
          namespace: 'production',
          children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
        }),
      })
    )

    const deploy = result.resources.find(
      (r) => r.kind === 'Deployment' && r.metadata?.name === 'api'
    ) as any
    expect(deploy.metadata.namespace).toBe('production')

    const ns = result.resources.find(
      (r) => r.kind === 'Namespace' && r.metadata?.name === 'production'
    )
    expect(ns).toBeDefined()
  })
})

describe('R8sCluster — complete cluster', () => {
  it('renders a complete cluster with apps', () => {
    const result = render(
      jsx(R8sCluster, {
        ...baseProps,
        children: jsx(Platform, {
          namespace: 'production',
          routing: 'gateway',
          children: [
            jsx(Database, { name: 'api-db', storage: '20Gi' }),
            jsx(App, {
              name: 'api',
              image: 'api:v1',
              host: 'api.example.com',
              tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
            }),
          ],
        }),
      })
    )

    const kinds = result.resources.map((r) => r.kind)

    // Cluster logging infrastructure
    expect(kinds).toContain('LokiStack')
    expect(kinds).toContain('Logging')
    expect(kinds).toContain('Flow')
    expect(kinds).toContain('Output')

    // DNS
    expect(kinds).toContain('OpenBaoStaticSecret') // TSIG key

    // App namespace
    expect(kinds).toContain('Namespace')

    // App resources
    expect(kinds).toContain('Cluster') // CNPG
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Gateway')
    expect(kinds).toContain('HTTPRoute')
    expect(kinds).toContain('Certificate')

    // Operators — 7 from R8sCluster + cnpg from Database
    expect(result.operators).toHaveLength(8)
  })

  it('all logging resources are in the logging namespace', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const loggingResources = result.resources.filter(
      (r) =>
        r.kind === 'LokiStack' || r.kind === 'Logging' || r.kind === 'Flow' || r.kind === 'Output'
    )

    for (const r of loggingResources) {
      expect(r.metadata?.namespace).toBe('logging')
    }
  })

  it('TSIG secret is in external-dns namespace, not logging', () => {
    const result = render(jsx(R8sCluster, baseProps))

    const tsigSecret = result.resources.find(
      (r) =>
        (r.kind === 'VaultStaticSecret' || r.kind === 'OpenBaoStaticSecret') &&
        r.metadata?.name === 'external-dns-tsig'
    ) as any
    expect(tsigSecret.metadata.namespace).toBe('external-dns')
  })
})
