import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { envoyGatewayOperator } from '@r8s/envoy'
import { certManagerOperator } from '@r8s/cert-manager'
import { EnvoyIngress } from '../src/envoy-ingress'

describe('EnvoyIngress', () => {
  it('should render a Gateway and HTTPRoute', () => {
    const result = render(
      jsx(EnvoyIngress, { name: 'app', host: 'app.example.com', serviceName: 'frontend' })
    )

    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any
    expect(gateway.apiVersion).toBe('gateway.networking.k8s.io/v1')
    expect(gateway.metadata.name).toBe('shared-gateway')
    expect(gateway.metadata.namespace).toBe('envoy-gateway-system')
    expect(gateway.spec.gatewayClassName).toBe('eg')
    expect(gateway.spec.listeners).toHaveLength(1)
    expect(gateway.spec.listeners[0].protocol).toBe('HTTP')

    const route = result.resources.find((r) => r.kind === 'HTTPRoute') as any
    expect(route.metadata.name).toBe('app')
    expect(route.spec.hostnames).toEqual(['app.example.com'])
    expect(route.spec.parentRefs[0].name).toBe('shared-gateway')
    expect(route.spec.rules[0].backendRefs[0].name).toBe('frontend')
    expect(route.spec.rules[0].backendRefs[0].port).toBe(80)
  })

  it('should declare the envoy-gateway operator', () => {
    const result = render(
      jsx(EnvoyIngress, { name: 'app', host: 'app.example.com', serviceName: 'frontend' })
    )
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('envoy-gateway')
  })

  it('should add an HTTPS listener and declare cert-manager when tls is set', () => {
    const result = render(
      jsx(EnvoyIngress, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
        tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt' },
      })
    )

    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any
    expect(gateway.spec.listeners).toHaveLength(2)
    const https = gateway.spec.listeners[1]
    expect(https.protocol).toBe('HTTPS')
    expect(https.tls.certificateRefs[0].name).toBe('api-tls')

    const operatorNames = result.operators.map((op) => op.name)
    expect(operatorNames).toContain('envoy-gateway')
    expect(operatorNames).toContain('cert-manager')
  })

  it('should not re-declare operators provided via context', () => {
    const result = render(
      jsx(OperatorContext.Provider, {
        value: [envoyGatewayOperator(), certManagerOperator()],
        children: jsx(EnvoyIngress, {
          name: 'api',
          host: 'api.example.com',
          serviceName: 'api',
          tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt' },
        }),
      })
    )
    expect(result.operators).toHaveLength(2)
  })

  it('should honor custom servicePort, path and gatewayName', () => {
    const result = render(
      jsx(EnvoyIngress, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
        servicePort: 8080,
        path: '/v1',
        gatewayName: 'api-gateway',
      })
    )

    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any
    expect(gateway.metadata.name).toBe('api-gateway')

    const route = result.resources.find((r) => r.kind === 'HTTPRoute') as any
    expect(route.spec.rules[0].backendRefs[0].port).toBe(8080)
    expect(route.spec.rules[0].matches[0].path.value).toBe('/v1')
  })
})
