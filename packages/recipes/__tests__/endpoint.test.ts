import { describe, it, expect } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { Endpoint, App } from '../src/index'
import { nginxIngressOperator } from '../src/operators'
import { certManagerOperator } from '@r8s/cert-manager'
import { envoyGatewayOperator } from '@r8s/envoy'
import { OperatorContext, RoutingContext } from '@r8s/core/defaults'

describe('Endpoint — ingress mode (default)', () => {
  it('should render Ingress when no RoutingContext is provided', () => {
    const element = jsx(Endpoint, {
      name: 'api-endpoint',
      host: 'api.example.com',
      serviceName: 'api',
      servicePort: 80,
    })

    const result = render(element)

    expect(result.resources).toHaveLength(1)
    expect(result.resources[0].kind).toBe('Ingress')
    expect((result.resources[0] as any).spec.ingressClassName).toBe('nginx')
  })

  it('should render Ingress when RoutingContext mode is ingress', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'ingress' },
      children: jsx(Endpoint, {
        name: 'api-endpoint',
        host: 'api.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)

    expect(result.resources[0].kind).toBe('Ingress')
    expect((result.resources[0] as any).spec.ingressClassName).toBe('nginx')
  })

  it('should declare nginx-ingress operator in ingress mode', () => {
    const element = jsx(Endpoint, {
      name: 'test',
      host: 'test.example.com',
      serviceName: 'svc',
    })

    const result = render(element)

    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('nginx-ingress')
  })

  it('should declare cert-manager when TLS is enabled in ingress mode', () => {
    const element = jsx(Endpoint, {
      name: 'test',
      host: 'test.example.com',
      serviceName: 'svc',
      tls: { secretName: 'test-tls', clusterIssuer: 'letsencrypt' },
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('nginx-ingress')
    expect(names).toContain('cert-manager')
  })

  it('should set TLS on Ingress when configured', () => {
    const element = jsx(Endpoint, {
      name: 'test',
      host: 'test.example.com',
      serviceName: 'svc',
      tls: { secretName: 'test-tls', clusterIssuer: 'letsencrypt' },
    })

    const result = render(element)
    const spec = (result.resources[0] as any).spec

    expect(spec.tls).toHaveLength(1)
    expect(spec.tls[0].secretName).toBe('test-tls')
    expect(spec.tls[0].hosts).toContain('test.example.com')
  })

  it('should not set TLS on Ingress when not configured', () => {
    const element = jsx(Endpoint, {
      name: 'test',
      host: 'test.example.com',
      serviceName: 'svc',
    })

    const result = render(element)
    const spec = (result.resources[0] as any).spec

    expect(spec.tls).toBeUndefined()
  })

  it('should not duplicate operators when provided via OperatorContext', () => {
    const element = jsx(OperatorContext.Provider, {
      value: [nginxIngressOperator('1.15.1'), certManagerOperator('1.14.0')],
      children: jsx(Endpoint, {
        name: 'test',
        host: 'test.example.com',
        serviceName: 'svc',
        tls: { secretName: 'test-tls', clusterIssuer: 'letsencrypt' },
      }),
    })

    const result = render(element)

    expect(result.operators).toHaveLength(2)
  })
})

describe('Endpoint — gateway mode', () => {
  it('should render Gateway + HTTPRoute when RoutingContext mode is gateway', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway', gatewayClassName: 'eg' },
      children: jsx(Endpoint, {
        name: 'api-endpoint',
        host: 'api.example.com',
        serviceName: 'api',
        servicePort: 80,
      }),
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Gateway')
    expect(kinds).toContain('HTTPRoute')
  })

  it('should render Certificate when TLS is enabled in gateway mode', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
        tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
      }),
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Certificate')
    expect(kinds).toContain('Gateway')
    expect(kinds).toContain('HTTPRoute')
  })

  it('should not render Certificate when TLS is not set in gateway mode', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('Certificate')
    expect(kinds).toContain('Gateway')
    expect(kinds).toContain('HTTPRoute')
  })

  it('should use HTTP listener (port 80) when TLS is not set in gateway mode', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)
    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

    expect(gateway.spec.listeners[0].protocol).toBe('HTTP')
    expect(gateway.spec.listeners[0].port).toBe(80)
    expect(gateway.spec.listeners[0].name).toBe('http')
    expect(gateway.spec.listeners[0].tls).toBeUndefined()
  })

  it('should use HTTPS listener (port 443) when TLS is set in gateway mode', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
        tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
      }),
    })

    const result = render(element)
    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

    expect(gateway.spec.listeners[0].protocol).toBe('HTTPS')
    expect(gateway.spec.listeners[0].port).toBe(443)
    expect(gateway.spec.listeners[0].name).toBe('https')
    expect(gateway.spec.listeners[0].tls).toBeDefined()
  })

  it('should use gatewayClassName from RoutingContext', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway', gatewayClassName: 'custom-gc' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)
    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

    expect(gateway.spec.gatewayClassName).toBe('custom-gc')
  })

  it('should default gatewayClassName to "eg" when not specified', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)
    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

    expect(gateway.spec.gatewayClassName).toBe('eg')
  })

  it('should declare envoy-gateway operator in gateway mode', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)

    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('envoy-gateway')
  })

  it('should declare cert-manager and envoy-gateway when TLS is enabled', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
        tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
      }),
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('envoy-gateway')
    expect(names).toContain('cert-manager')
  })

  it('should not duplicate operators when provided via OperatorContext', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(OperatorContext.Provider, {
        value: [envoyGatewayOperator('1.7.0'), certManagerOperator('1.14.0')],
        children: jsx(Endpoint, {
          name: 'api',
          host: 'api.example.com',
          serviceName: 'api',
          tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
        }),
      }),
    })

    const result = render(element)

    expect(result.operators).toHaveLength(2)
  })

  it('should set TLS on Gateway listener when configured', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'api',
        tls: { secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' },
      }),
    })

    const result = render(element)
    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any

    expect(gateway.spec.listeners[0].tls).toBeDefined()
    expect(gateway.spec.listeners[0].tls.mode).toBe('Terminate')
    expect(gateway.spec.listeners[0].tls.certificateRefs[0].name).toBe('api-tls')
  })

  it('should route to the correct service and port', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'api.example.com',
        serviceName: 'backend',
        servicePort: 8080,
      }),
    })

    const result = render(element)
    const route = result.resources.find((r) => r.kind === 'HTTPRoute') as any

    expect(route.spec.rules[0].backendRefs[0].name).toBe('backend')
    expect(route.spec.rules[0].backendRefs[0].port).toBe(8080)
  })

  it('should set hostname on Gateway listener and HTTPRoute', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(Endpoint, {
        name: 'api',
        host: 'myapp.example.com',
        serviceName: 'api',
      }),
    })

    const result = render(element)
    const gateway = result.resources.find((r) => r.kind === 'Gateway') as any
    const route = result.resources.find((r) => r.kind === 'HTTPRoute') as any

    expect(gateway.spec.listeners[0].hostname).toBe('myapp.example.com')
    expect(route.spec.hostnames).toContain('myapp.example.com')
  })
})

describe('App with RoutingContext', () => {
  it('should render Ingress by default (no RoutingContext)', () => {
    const element = jsx(App, {
      name: 'myapp',
      host: 'myapp.example.com',
      image: 'myapp:v1',
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).not.toContain('Gateway')
  })

  it('should render Gateway + HTTPRoute when wrapped in gateway RoutingContext', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway', gatewayClassName: 'eg' },
      children: jsx(App, {
        name: 'myapp',
        host: 'myapp.example.com',
        image: 'myapp:v1',
        tls: { secretName: 'myapp-tls', clusterIssuer: 'letsencrypt-prod' },
      }),
    })

    const result = render(element)

    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Gateway')
    expect(kinds).toContain('HTTPRoute')
    expect(kinds).toContain('Certificate')
    expect(kinds).not.toContain('Ingress')
  })

  it('should declare envoy-gateway operator in gateway mode via App', () => {
    const element = jsx(RoutingContext.Provider, {
      value: { mode: 'gateway' },
      children: jsx(App, {
        name: 'myapp',
        host: 'myapp.example.com',
        image: 'myapp:v1',
      }),
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('envoy-gateway')
    expect(names).not.toContain('nginx-ingress')
  })

  it('should declare nginx-ingress operator by default via App', () => {
    const element = jsx(App, {
      name: 'myapp',
      host: 'myapp.example.com',
      image: 'myapp:v1',
    })

    const result = render(element)

    const names = result.operators.map((op) => op.name)
    expect(names).toContain('nginx-ingress')
    expect(names).not.toContain('envoy-gateway')
  })

  it('should not leak gateway context to sibling Apps', () => {
    const element = jsx(Fragment, {
      children: [
        jsx(RoutingContext.Provider, {
          value: { mode: 'gateway' },
          children: jsx(App, {
            name: 'gateway-app',
            host: 'gateway.example.com',
            image: 'app:v1',
          }),
        }),
        jsx(App, {
          name: 'ingress-app',
          host: 'ingress.example.com',
          image: 'app:v1',
        }),
      ],
    })

    const result = render(element)

    // First app should use Gateway
    const gatewayResources = result.resources.filter((r) =>
      r.metadata?.name?.startsWith('gateway-app')
    )
    const gatewayKinds = gatewayResources.map((r) => r.kind)
    expect(gatewayKinds).toContain('Gateway')

    // Second app should use Ingress
    const ingressResources = result.resources.filter((r) =>
      r.metadata?.name?.startsWith('ingress-app')
    )
    const ingressKinds = ingressResources.map((r) => r.kind)
    expect(ingressKinds).toContain('Ingress')
    expect(ingressKinds).not.toContain('Gateway')
  })
})
