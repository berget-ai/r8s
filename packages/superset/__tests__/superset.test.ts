import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Superset } from '../src/index'

const baseProps = {
  host: 'superset.example.com',
  database: {
    host: 'superset-db-rw',
    database: 'superset',
    user: 'superset',
    passwordSecret: 'superset-db-credentials',
  },
  redis: { host: 'redis-master' },
  admin: { password: 'test-secret' },
}

describe('Superset', () => {
  it('should render Namespace, ConfigMap, Deployment, Service and Ingress', () => {
    const result = render(jsx(Superset, baseProps))

    expect(result.resources).toHaveLength(6)
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toEqual(['Namespace', 'Secret', 'ConfigMap', 'Deployment', 'Service', 'Ingress'])
  })

  it('should use default name, namespace and version', () => {
    const result = render(jsx(Superset, baseProps))

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    expect(deployment.metadata.name).toBe('superset')
    expect(deployment.metadata.namespace).toBe('superset')
    expect(deployment.spec.template.spec.containers[0].image).toBe('apache/superset:4.0.0')
  })

  it('should wire database and redis connection via env', () => {
    const result = render(jsx(Superset, baseProps))

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const env = deployment.spec.template.spec.containers[0].env

    expect(env.find((e: any) => e.name === 'DB_HOST').value).toBe('superset-db-rw')
    expect(env.find((e: any) => e.name === 'DB_NAME').value).toBe('superset')
    expect(env.find((e: any) => e.name === 'DB_PASS').valueFrom.secretKeyRef.name).toBe(
      'superset-db-credentials'
    )
    expect(env.find((e: any) => e.name === 'REDIS_HOST').value).toBe('redis-master')
    expect(env.find((e: any) => e.name === 'REDIS_PORT').value).toBe('6379')
    expect(env.find((e: any) => e.name === 'SUPERSET_SECRET_KEY').valueFrom.secretKeyRef.name).toBe(
      'superset-admin'
    )
  })

  it('should support custom redis port and database passwordKey', () => {
    const result = render(
      jsx(Superset, {
        ...baseProps,
        database: { ...baseProps.database, passwordKey: 'db-pass' },
        redis: { host: 'redis-master', port: 6380 },
      })
    )

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const env = deployment.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'DB_PASS').valueFrom.secretKeyRef.key).toBe('db-pass')
    expect(env.find((e: any) => e.name === 'REDIS_PORT').value).toBe('6380')
  })

  it('should add Keycloak env vars when oauth is configured', () => {
    const result = render(
      jsx(Superset, {
        ...baseProps,
        oauth: {
          clientId: 'superset',
          clientSecret: 'secret',
          keycloakUrl: 'https://auth.example.com',
        },
      })
    )

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const env = deployment.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'KEYCLOAK_CLIENT_ID').value).toBe('superset')
    expect(env.find((e: any) => e.name === 'KEYCLOAK_BASE_URL').value).toBe(
      'https://auth.example.com'
    )
  })

  it('should render Ingress with TLS annotations when tls is set', () => {
    const result = render(
      jsx(Superset, {
        ...baseProps,
        tls: { secretName: 'superset-tls', clusterIssuer: 'letsencrypt' },
      })
    )

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.spec.rules[0].host).toBe('superset.example.com')
    expect(ingress.spec.tls[0].secretName).toBe('superset-tls')
    expect(ingress.metadata.annotations['cert-manager.io/cluster-issuer']).toBe('letsencrypt')
  })

  describe('managed Redis', () => {
    it('should render RedisCluster when redis.create is true', () => {
      const result = render(jsx(Superset, { ...baseProps, redis: { create: true } }))

      const redis = result.resources.find((r) => r.kind === 'RedisCluster') as any
      expect(redis).toBeDefined()
      expect(redis.metadata.name).toBe('superset-redis')
      expect(redis.metadata.namespace).toBe('superset')
    })

    it('should declare redis-operator when creating managed Redis', () => {
      const result = render(jsx(Superset, { ...baseProps, redis: { create: true } }))

      const op = result.operators.find((o) => o.name === 'redis-operator')
      expect(op).toBeDefined()
    })

    it('should point REDIS_HOST at the managed cluster', () => {
      const result = render(jsx(Superset, { ...baseProps, redis: { create: true } }))

      const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
      const env = deployment.spec.template.spec.containers[0].env
      expect(env.find((e: any) => e.name === 'REDIS_HOST').value).toBe(
        'superset-redis-master.superset.svc.cluster.local'
      )
    })

    it('should not render RedisCluster for external redis host', () => {
      const result = render(jsx(Superset, baseProps))

      const redis = result.resources.find((r) => r.kind === 'RedisCluster')
      expect(redis).toBeUndefined()
    })
  })
})
