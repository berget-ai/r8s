import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Database, WebService, App, Endpoint, Auth, Monitoring, Backup } from '../src/index'
import { cnpgOperator, nginxIngressOperator } from '../src/operators'
import { operators } from '@r8s/crds'
import { OperatorContext } from '@r8s/core/defaults'

describe('Database Recipe (CNPG)', () => {
  it('should render CNPG Cluster', () => {
    const element = jsx(Database, {
      name: 'test-db',
      namespace: 'test-ns',
      storage: '5Gi',
    })

    const result = render(element)

    expect(result.resources).toHaveLength(1)

    const cluster = result.resources[0]
    expect(cluster.kind).toBe('Cluster')
    expect(cluster.apiVersion).toBe('postgresql.cnpg.io/v1')
    expect(cluster.metadata.name).toBe('test-db')
    expect(cluster.metadata.namespace).toBe('test-ns')
    expect((cluster as any).spec.instances).toBe(3)
    expect((cluster as any).spec.storage.size).toBe('5Gi')
    expect((cluster as any).spec.bootstrap.initdb.database).toBe('test-db')
    expect((cluster as any).spec.bootstrap.initdb.owner).toBe('test-db')
  })

  it('should use default values', () => {
    const element = jsx(Database, { name: 'default-db' })
    const result = render(element)

    const cluster = result.resources[0]
    expect(cluster.metadata.namespace).toBe('default')
    expect((cluster as any).spec.instances).toBe(3)
    expect((cluster as any).spec.storage.size).toBe('10Gi')
  })

  it('should set DatabaseContext for child components', () => {
    const element = jsx(Database, {
      name: 'context-db',
      storage: '10Gi',
    })

    const result = render(element)
    expect(result.resources.length).toBeGreaterThanOrEqual(1)
    expect(result.resources[0].kind).toBe('Cluster')
  })

  it('should declare CNPG operator dependency', () => {
    const element = jsx(Database, { name: 'test-db' })
    const result = render(element)

    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('cnpg')
    expect(result.operators[0].source.type).toBe('manifest')
    expect(result.operators[0].source.url).toContain('cloudnative-pg')
  })

  it('should not duplicate CNPG operator when provided via context', () => {
    const element = jsx(OperatorContext.Provider, {
      value: [cnpgOperator('1.22.5')],
      children: jsx(Database, { name: 'test-db' }),
    })

    const result = render(element)

    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('cnpg')
  })

  it('should allow operator version override', () => {
    const element = jsx(Database, {
      name: 'test-db',
      operatorVersion: '1.23.0',
    })

    const result = render(element)

    expect(result.operators[0].version).toBe('1.23.0')
  })
})

describe('Endpoint Recipe', () => {
  it('should render Ingress by default', () => {
    const element = jsx(Endpoint, {
      name: 'test-endpoint',
      host: 'test.example.com',
      serviceName: 'test-svc',
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Ingress')
  })

  it('should declare nginx-ingress operator', () => {
    const element = jsx(Endpoint, {
      name: 'test-endpoint',
      host: 'test.example.com',
      serviceName: 'test-svc',
    })

    const result = render(element)

    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('nginx-ingress')
  })

  it('should declare cert-manager when TLS is enabled', () => {
    const element = jsx(Endpoint, {
      name: 'test-endpoint',
      host: 'test.example.com',
      serviceName: 'test-svc',
      tls: { secretName: 'test-tls', clusterIssuer: 'letsencrypt' },
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('nginx-ingress')
    expect(names).toContain('cert-manager')
  })

  it('should not duplicate operators when provided via context', () => {
    const element = jsx(OperatorContext.Provider, {
      value: [nginxIngressOperator('1.15.1'), operators['cert-manager']('1.14.0')],
      children: jsx(Endpoint, {
        name: 'test-endpoint',
        host: 'test.example.com',
        serviceName: 'test-svc',
        tls: { secretName: 'test-tls', clusterIssuer: 'letsencrypt' },
      }),
    })

    const result = render(element)

    expect(result.operators).toHaveLength(2)
  })
})

describe('WebService Recipe', () => {
  it('should render Deployment and Service', () => {
    const element = jsx(WebService, {
      name: 'api',
      image: 'myapp/api:v1',
      port: 3000,
      replicas: 3,
    })

    const result = render(element)

    expect(result.resources).toHaveLength(2)
    expect(result.resources[0].kind).toBe('Deployment')
    expect(result.resources[1].kind).toBe('Service')
  })
})

describe('App Recipe', () => {
  it('should render app with deployment, service, and ingress', () => {
    const element = jsx(App, {
      name: 'myapp',
      host: 'myapp.example.com',
      image: 'myapp:v1',
    })

    const result = render(element)

    expect(result.resources.length).toBeGreaterThanOrEqual(2)
    const kinds = result.resources.map((r: any) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
  })

  it('should declare nginx-ingress operator', () => {
    const element = jsx(App, {
      name: 'myapp',
      host: 'myapp.example.com',
      image: 'myapp:v1',
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('nginx-ingress')
  })

  it('should declare cert-manager when TLS is configured', () => {
    const element = jsx(App, {
      name: 'myapp',
      host: 'myapp.example.com',
      image: 'myapp:v1',
      tls: { secretName: 'myapp-tls', clusterIssuer: 'letsencrypt' },
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('cert-manager')
    expect(names).toContain('nginx-ingress')
  })

  it('should not declare cert-manager when TLS is disabled', () => {
    const element = jsx(App, {
      name: 'myapp',
      host: 'myapp.example.com',
      image: 'myapp:v1',
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).not.toContain('cert-manager')
    expect(names).toContain('nginx-ingress')
  })

  it('should use shared operators from context without duplication', () => {
    const element = jsx(OperatorContext.Provider, {
      value: [operators['cert-manager']('1.14.0'), nginxIngressOperator('1.15.1')],
      children: jsx(App, {
        name: 'myapp',
        host: 'myapp.example.com',
        image: 'myapp:v1',
        tls: { secretName: 'myapp-tls', clusterIssuer: 'letsencrypt' },
      }),
    })

    const result = render(element)

    expect(result.operators).toHaveLength(2)
  })
})

describe('Auth Recipe', () => {
  it('should render Keycloak, Database, and Endpoint', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Keycloak')
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('Ingress')
  })

  it('should declare keycloak and cnpg operators', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('keycloak-operator')
    expect(names).toContain('cnpg')
  })

  it('should not duplicate operators when provided via context', () => {
    const element = jsx(OperatorContext.Provider, {
      value: [operators['keycloak-operator'](), operators['cnpg'](), nginxIngressOperator()],
      children: jsx(Auth, {
        name: 'auth',
        host: 'auth.example.com',
      }),
    })

    const result = render(element)

    // Auth declares keycloak + cnpg; Endpoint declares nginx-ingress
    // All three are already in context, so no duplicates
    expect(result.operators).toHaveLength(3)
  })
})

describe('Monitoring Recipe', () => {
  it('should render ServiceMonitor', () => {
    const element = jsx(Monitoring, {
      name: 'api-monitor',
      selector: { app: 'api' },
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('ServiceMonitor')
  })

  it('should declare prometheus operator', () => {
    const element = jsx(Monitoring, {
      name: 'api-monitor',
      selector: { app: 'api' },
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('prometheus')
  })
})

describe('Backup Recipe', () => {
  it('should render Velero Schedule', () => {
    const element = jsx(Backup, {
      name: 'daily',
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Schedule')
  })

  it('should declare velero operator', () => {
    const element = jsx(Backup, {
      name: 'daily',
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('velero')
  })
})
