import { describe, it, expect } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { validateResource } from '@r8s/core'
import { Database, App, WebService, Endpoint } from '../src/index'
import { OperatorContext, SecretContext, ClusterContext } from '@r8s/core/defaults'
import { cnpgOperator, nginxIngressOperator } from '../src/operators'

const sharedClusterConfig = {
  name: 'main',
  namespace: 'db',
  storage: '100Gi',
  host: 'main-rw',
  secretName: 'main-credentials',
}

describe('Recipes Error Cases', () => {
  describe('Database', () => {
    it('should handle missing storage gracefully', () => {
      const element = jsx(Database, { backup: false, name: 'test-db' })
      const result = render(element)

      expect(result.resources).toHaveLength(1)
      expect(result.resources[0].kind).toBe('Cluster')
    })

    it('should handle empty name', () => {
      const element = jsx(Database, { backup: false, name: '' })
      const result = render(element)

      const validationErrors = validateResource(result.resources[0])
      expect(validationErrors.some((e) => e.code === 'MISSING_NAME')).toBe(true)
    })

    it('should not duplicate CNPG operator when provided via context', () => {
      const element = jsx(OperatorContext.Provider, {
        value: [cnpgOperator('1.22.5')],
        children: jsx(Database, { backup: false, name: 'test-db' }),
      })

      const result = render(element)
      expect(result.operators).toHaveLength(1)
      expect(result.operators[0].name).toBe('cnpg')
    })

    it('should handle special characters in database name', () => {
      const element = jsx(Database, { backup: false, name: 'test-db_123' })
      const result = render(element)

      const validationErrors = validateResource(result.resources[0])
      expect(validationErrors.some((e) => e.code === 'INVALID_NAME')).toBe(true)
    })
  })

  describe('App', () => {
    it('should handle missing optional props', () => {
      const element = jsx(App, {
        name: 'test-app',
        image: 'test:latest',
        host: 'test.example.com',
      })
      const result = render(element)

      expect(result.resources).toHaveLength(3) // Deployment, Service, Ingress
    })

    it('should handle empty env', () => {
      const element = jsx(App, {
        name: 'test-app',
        image: 'test:latest',
        host: 'test.example.com',
        env: {},
      })
      const result = render(element)

      const deployment = result.resources.find((r) => r.kind === 'Deployment')
      expect(deployment).toBeDefined()
    })

    it('should handle zero replicas', () => {
      const element = jsx(App, {
        name: 'test-app',
        image: 'test:latest',
        host: 'test.example.com',
        replicas: 0,
      })
      const result = render(element)

      const deployment = result.resources.find((r) => r.kind === 'Deployment')
      expect((deployment as any).spec.replicas).toBe(0)
    })
  })

  describe('WebService', () => {
    it('should handle missing env', () => {
      const element = jsx(WebService, {
        name: 'test-service',
        image: 'test:latest',
      })
      const result = render(element)

      expect(result.resources).toHaveLength(2) // Deployment, Service
    })

    it('should handle empty secrets', () => {
      const element = jsx(WebService, {
        name: 'test-service',
        image: 'test:latest',
        secrets: {},
      })
      const result = render(element)

      const deployment = result.resources.find((r) => r.kind === 'Deployment')
      expect((deployment as any).spec.template.spec.containers[0].env).toEqual([])
    })
  })

  describe('Endpoint', () => {
    it('should handle TLS configuration', () => {
      const element = jsx(Endpoint, {
        name: 'test-endpoint',
        host: 'test.example.com',
        serviceName: 'test-service',
        servicePort: 80,
        tls: { secretName: 'test-tls', clusterIssuer: 'letsencrypt' },
      })
      const result = render(element)

      expect(result.operators).toHaveLength(2) // nginx-ingress + cert-manager
    })

    it('should handle missing TLS gracefully', () => {
      const element = jsx(Endpoint, {
        name: 'test-endpoint',
        host: 'test.example.com',
        serviceName: 'test-service',
        servicePort: 80,
      })
      const result = render(element)

      expect(result.resources).toHaveLength(1)
      expect(result.operators).toHaveLength(1) // nginx-ingress only
    })
  })

  describe('Integration', () => {
    it('should handle complex composition', () => {
      const element = jsx(OperatorContext.Provider, {
        value: [cnpgOperator('1.22.5'), nginxIngressOperator('1.15.1')],
        children: jsx(Fragment, {
          children: [
            jsx(Database, { backup: false, name: 'app-db', storage: '10Gi' }),
            jsx(App, {
              name: 'api',
              image: 'myapp/api:v1',
              host: 'api.example.com',
              env: { LOG_LEVEL: 'info' },
            }),
          ],
        }),
      })

      const result = render(element)
      expect(result.resources.length).toBeGreaterThan(0)
      expect(result.operators).toHaveLength(2)
    })

    it('should handle nested contexts', () => {
      const element = jsx(OperatorContext.Provider, {
        value: [cnpgOperator('1.22.5')],
        children: jsx(Database, {
          backup: false,
          name: 'app-db',
          storage: '10Gi',
        }),
      })

      const result = render(element)
      expect(result.operators).toHaveLength(1)
    })
  })

  describe('Secrets backend errors', () => {
    it('should throw when a plaintext password prop is provided', () => {
      const element = jsx(Database, { backup: false, name: 'my-db', password: 'test-pass' } as any)
      expect(() => render(element)).toThrow(/received a plaintext password/)
      expect(() => render(element)).toThrow(/secrets backend/)
    })

    it('should not render plaintext Secrets with the kubernetes backend', () => {
      const element = jsx(SecretContext.Provider, {
        value: { backend: 'kubernetes' },
        children: jsx(Database, { backup: false, name: 'my-db' }),
      })
      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Cluster')
      // CNPG provisions the bootstrap secret in-cluster — nothing plaintext in the manifest
      expect(kinds).not.toContain('Secret')
    })

    it('should not render plaintext Secrets with the manual-secrets backend', () => {
      const element = jsx(SecretContext.Provider, {
        value: { backend: 'manual-secrets' },
        children: jsx(Database, { backup: false, name: 'my-db' }),
      })
      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Cluster')
      expect(kinds).not.toContain('Secret')
    })

    it('should throw for a shared cluster without a secrets backend', () => {
      const element = jsx(ClusterContext.Provider, {
        value: sharedClusterConfig,
        children: jsx(Database, { backup: false, name: 'my-db' }),
      })

      expect(() => render(element)).toThrow(/shared Cluster without a secrets backend/)
    })

    it('should throw for the kubernetes backend on a shared cluster', () => {
      const element = jsx(SecretContext.Provider, {
        value: { backend: 'kubernetes' } as any,
        children: jsx(ClusterContext.Provider, {
          value: sharedClusterConfig,
          children: jsx(Database, { backup: false, name: 'my-db' }),
        }),
      })

      expect(() => render(element)).toThrow(/shared Cluster/)
      expect(() => render(element)).toThrow(/backend: 'openbao'/)
    })

    it('should throw on unknown backend', () => {
      expect(() => {
        render(
          jsx(SecretContext.Provider, {
            value: { backend: 'unknown-backend' as any },
            children: jsx(Database, { backup: false, name: 'my-db' }),
          })
        )
      }).toThrow(/unknown secrets backend "unknown-backend"/)
    })

    it('should list supported backends in the error', () => {
      expect(() => {
        render(
          jsx(SecretContext.Provider, {
            value: { backend: 'unknown-backend' as any },
            children: jsx(Database, { backup: false, name: 'my-db' }),
          })
        )
      }).toThrow(
        /Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'/
      )
    })

    it('should succeed with openbao backend and no password', () => {
      const element = jsx(SecretContext.Provider, {
        value: { backend: 'openbao', mount: 'kv', path: 'db' },
        children: jsx(Database, { backup: false, name: 'my-db' }),
      })
      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Cluster')
      expect(kinds).toContain('OpenBaoStaticSecret')
    })

    it('should succeed with vault backend and no password', () => {
      const element = jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'db' },
        children: jsx(Database, { backup: false, name: 'my-db' }),
      })
      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Cluster')
      expect(kinds).toContain('VaultStaticSecret')
    })

    it('should succeed with sealed-secrets backend and no password', () => {
      const element = jsx(SecretContext.Provider, {
        value: { backend: 'sealed-secrets' },
        children: jsx(Database, { backup: false, name: 'my-db' }),
      })
      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Cluster')
      expect(kinds).toContain('SealedSecret')
    })

    it('should succeed with no backend and no password (CNPG manages bootstrap secret)', () => {
      const element = jsx(Database, { backup: false, name: 'my-db' })
      const result = render(element)

      const kinds = result.resources.map((r) => r.kind)
      expect(kinds).toContain('Cluster')
      // CNPG creates the bootstrap secret automatically — no explicit Secret needed
      expect(kinds).not.toContain('Secret')
    })
  })
})
