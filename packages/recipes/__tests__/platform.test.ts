import { describe, it, expect } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { Platform, App, Endpoint } from '../src/index'
import { cnpgOperator } from '@r8s/operator-cnpg'
import { NginxIngressOperator } from '@r8s/operator-nginx-ingress'
import { operators } from '@r8s/crds'

describe('Platform', () => {
  describe('routing', () => {
    it('should default to ingress mode', () => {
      const element = jsx(Platform, {
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)

      expect(result.resources[0].kind).toBe('Ingress')
    })

    it('should use gateway mode when routing="gateway"', () => {
      const element = jsx(Platform, {
        routing: 'gateway',
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Gateway')
      expect(kinds).toContain('HTTPRoute')
      expect(kinds).not.toContain('Ingress')
    })

    it('should pass gatewayClassName to Endpoint', () => {
      const element = jsx(Platform, {
        routing: 'gateway',
        gatewayClassName: 'custom-gc',
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)
      const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

      expect(gateway.spec.gatewayClassName).toBe('custom-gc')
    })

    it('should default gatewayClassName to "eg"', () => {
      const element = jsx(Platform, {
        routing: 'gateway',
        children: jsx(Endpoint, {
          name: 'test',
          host: 'test.example.com',
          serviceName: 'svc',
        }),
      })

      const result = render(element)
      const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

      expect(gateway.spec.gatewayClassName).toBe('eg')
    })
  })

  describe('namespace inheritance', () => {
    it('should propagate namespace to <App>', () => {
      const element = jsx(Platform, {
        namespace: 'production',
        children: jsx(App, {
          name: 'myapp',
          image: 'myapp:v1',
          host: 'myapp.example.com',
        }),
      })

      const result = render(element)

      for (const res of result.resources) {
        // Cluster-scoped resources (Namespace) have no metadata.namespace
        if (res.kind === 'Namespace') continue
        expect(res.metadata?.namespace).toBe('production')
      }
    })

    it('should let explicit namespace prop override Platform namespace', () => {
      const element = jsx(Platform, {
        namespace: 'production',
        children: jsx(App, {
          name: 'myapp',
          namespace: 'override-ns',
          image: 'myapp:v1',
          host: 'myapp.example.com',
        }),
      })

      const result = render(element)

      for (const res of result.resources) {
        // Cluster-scoped resources (Namespace) have no metadata.namespace
        if (res.kind === 'Namespace') continue
        expect(res.metadata?.namespace).toBe('override-ns')
      }
    })

    it('should default to "default" namespace when no Platform or prop', () => {
      const element = jsx(App, {
        name: 'myapp',
        image: 'myapp:v1',
        host: 'myapp.example.com',
      })

      const result = render(element)

      for (const res of result.resources) {
        expect(res.metadata?.namespace).toBe('default')
      }
    })
  })

  describe('operators', () => {
    it('should share operators across all children', () => {
      const element = jsx(Platform, {
        operators: [cnpgOperator(), operators['cert-manager']('1.14.0')],
        children: jsx(Fragment, {
          children: [
            jsx(App, {
              name: 'app1',
              image: 'app:v1',
              host: 'app1.example.com',
              tls: { secretName: 'app1-tls', clusterIssuer: 'letsencrypt' },
            }),
            jsx(App, {
              name: 'app2',
              image: 'app:v1',
              host: 'app2.example.com',
              tls: { secretName: 'app2-tls', clusterIssuer: 'letsencrypt' },
            }),
          ],
        }),
      })

      const result = render(element)

      // cert-manager should appear once, not twice
      const certManagerOps = result.operators.filter((op) => op.name === 'cert-manager')
      expect(certManagerOps).toHaveLength(1)
    })

    it('should not duplicate nginx-ingress when provided via Platform', () => {
      const element = jsx(Platform, {
        operators: [NginxIngressOperator('1.15.1')],
        children: jsx(App, {
          name: 'myapp',
          image: 'myapp:v1',
          host: 'myapp.example.com',
        }),
      })

      const result = render(element)

      const nginxOps = result.operators.filter((op) => op.name === 'nginx-ingress')
      expect(nginxOps).toHaveLength(1)
    })

    it('should not duplicate envoy-gateway when provided via Platform', () => {
      const element = jsx(Platform, {
        routing: 'gateway',
        operators: [operators['envoy-gateway']('1.7.0')],
        children: jsx(App, {
          name: 'myapp',
          image: 'myapp:v1',
          host: 'myapp.example.com',
        }),
      })

      const result = render(element)

      const envoyOps = result.operators.filter((op) => op.name === 'envoy-gateway')
      expect(envoyOps).toHaveLength(1)
    })
  })

  describe('multiple apps', () => {
    it('should route both apps via gateway when routing="gateway"', () => {
      const element = jsx(Platform, {
        routing: 'gateway',
        namespace: 'production',
        children: jsx(Fragment, {
          children: [
            jsx(App, {
              name: 'api',
              image: 'api:v1',
              host: 'api.example.com',
            }),
            jsx(App, {
              name: 'web',
              image: 'web:v1',
              host: 'app.example.com',
            }),
          ],
        }),
      })

      const result = render(element)

      const gateways = result.resources.filter((r) => r.kind === 'Gateway')
      const routes = result.resources.filter((r) => r.kind === 'HTTPRoute')
      const ingresses = result.resources.filter((r) => r.kind === 'Ingress')

      expect(gateways).toHaveLength(2)
      expect(routes).toHaveLength(2)
      expect(ingresses).toHaveLength(0)
    })

    it('should route both apps via ingress by default', () => {
      const element = jsx(Platform, {
        namespace: 'production',
        children: jsx(Fragment, {
          children: [
            jsx(App, {
              name: 'api',
              image: 'api:v1',
              host: 'api.example.com',
            }),
            jsx(App, {
              name: 'web',
              image: 'web:v1',
              host: 'app.example.com',
            }),
          ],
        }),
      })

      const result = render(element)

      const gateways = result.resources.filter((r) => r.kind === 'Gateway')
      const ingresses = result.resources.filter((r) => r.kind === 'Ingress')

      expect(gateways).toHaveLength(0)
      expect(ingresses).toHaveLength(2)
    })
  })

  describe('namespace resource', () => {
    it('should materialize a Namespace resource when namespace is set', () => {
      // Without this, every rendered resource references a namespace that
      // may not exist in the cluster — apply fails or lands in the wrong ns.
      const element = jsx(Platform, {
        namespace: 'production',
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })

      const result = render(element)

      const ns = result.resources.find((r) => r.kind === 'Namespace') as any
      expect(ns).toBeDefined()
      expect(ns.metadata.name).toBe('production')
    })

    it('should not render Namespace when namespace is not set', () => {
      const element = jsx(Platform, {
        children: jsx(App, { name: 'api', image: 'api:v1', host: 'api.example.com' }),
      })

      const result = render(element)

      expect(result.resources.find((r) => r.kind === 'Namespace')).toBeUndefined()
    })

    it('should not duplicate Namespace when a child also creates it', () => {
      // Superset/RustFS create their own Namespace resources — the renderer
      // must deduplicate by kind/namespace/name.
      const element = jsx(Platform, {
        namespace: 'saas',
        children: jsx(Fragment, {
          children: [
            jsx('Namespace', {
              apiVersion: 'v1',
              kind: 'Namespace',
              metadata: { name: 'saas' },
            }),
          ],
        }),
      })

      const result = render(element)

      const namespaces = result.resources.filter((r) => r.kind === 'Namespace')
      expect(namespaces).toHaveLength(1)
    })
  })
})
