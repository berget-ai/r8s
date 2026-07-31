import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { WireGuard } from '../src/index'

describe('WireGuard', () => {
  it('should render Namespace, Deployment, Service and PVC with defaults', () => {
    const result = render(jsx(WireGuard, {}))

    expect(result.resources).toHaveLength(4)
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toEqual(['Namespace', 'Deployment', 'Service', 'PersistentVolumeClaim'])
  })

  it('should use default name, namespace and ports', () => {
    const result = render(jsx(WireGuard, {}))

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    expect(deployment.metadata.name).toBe('wireguard')
    expect(deployment.metadata.namespace).toBe('wireguard')

    const container = deployment.spec.template.spec.containers[0]
    expect(container.image).toBe('ghcr.io/wg-easy/wg-easy:latest')
    expect(container.ports[0].containerPort).toBe(51820)
    expect(container.ports[0].protocol).toBe('UDP')
    expect(container.ports[1].containerPort).toBe(51821)
  })

  it('should require NET_ADMIN and SYS_MODULE capabilities', () => {
    const result = render(jsx(WireGuard, {}))

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const caps = deployment.spec.template.spec.containers[0].securityContext.capabilities.add
    expect(caps).toContain('NET_ADMIN')
    expect(caps).toContain('SYS_MODULE')
  })

  it('should read the admin password from a secret', () => {
    const result = render(jsx(WireGuard, { passwordSecret: 'wg-credentials' }))

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const env = deployment.spec.template.spec.containers[0].env
    const pw = env.find((e: any) => e.name === 'PASSWORD_HASH')
    expect(pw.valueFrom.secretKeyRef.name).toBe('wg-credentials')
  })

  it('should use ClusterIP service by default and NodePort when nodePort is set', () => {
    const clusterIp = render(jsx(WireGuard, {}))
    const svc1 = clusterIp.resources.find((r) => r.kind === 'Service') as any
    expect(svc1.spec.type).toBe('ClusterIP')
    expect(svc1.spec.ports[0].nodePort).toBeUndefined()

    const nodePort = render(jsx(WireGuard, { nodePort: 31820 }))
    const svc2 = nodePort.resources.find((r) => r.kind === 'Service') as any
    expect(svc2.spec.type).toBe('NodePort')
    expect(svc2.spec.ports[0].nodePort).toBe(31820)
    expect(svc2.spec.ports[0].protocol).toBe('UDP')
  })

  it('should not render Ingress without host', () => {
    const result = render(jsx(WireGuard, {}))
    expect(result.resources.find((r) => r.kind === 'Ingress')).toBeUndefined()
  })

  it('should render Ingress with TLS when host and tls are set', () => {
    const result = render(
      jsx(WireGuard, {
        host: 'vpn.example.com',
        tls: { secretName: 'wg-tls', clusterIssuer: 'letsencrypt' },
      })
    )

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.spec.rules[0].host).toBe('vpn.example.com')
    expect(ingress.spec.tls[0].secretName).toBe('wg-tls')
    expect(ingress.metadata.annotations['cert-manager.io/cluster-issuer']).toBe('letsencrypt')

    // Web UI traffic goes to the web port, not the WireGuard UDP port
    expect(ingress.spec.rules[0].http.paths[0].backend.service.port.number).toBe(51821)
  })
})
