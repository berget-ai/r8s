import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { RustFS } from '../src/index'

describe('RustFS', () => {
  it('should render Namespace, headless Service, Service and StatefulSet with defaults', () => {
    const result = render(jsx(RustFS, {}))

    expect(result.resources).toHaveLength(4)
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toEqual(['Namespace', 'Service', 'Service', 'StatefulSet'])

    const sts = result.resources.find((r) => r.kind === 'StatefulSet') as any
    expect(sts.metadata.name).toBe('rustfs')
    expect(sts.metadata.namespace).toBe('rustfs')
    expect(sts.spec.replicas).toBe(4)
    expect(sts.spec.volumeClaimTemplates[0].spec.resources.requests.storage).toBe('100Gi')
  })

  it('should render a headless service for the StatefulSet', () => {
    const result = render(jsx(RustFS, {}))

    const headless = result.resources.find((r) => r.metadata.name === 'rustfs-headless') as any
    expect(headless.kind).toBe('Service')
    expect(headless.spec.clusterIP).toBe('None')
    expect(sts_serviceName(result)).toBe('rustfs-headless')

    function sts_serviceName(res: typeof result) {
      return (res.resources.find((r) => r.kind === 'StatefulSet') as any).spec.serviceName
    }
  })

  it('should honor instances, storage and storageClass', () => {
    const result = render(jsx(RustFS, { instances: 6, storage: '500Gi', storageClass: 'fast-ssd' }))

    const sts = result.resources.find((r) => r.kind === 'StatefulSet') as any
    expect(sts.spec.replicas).toBe(6)
    const tpl = sts.spec.volumeClaimTemplates[0].spec
    expect(tpl.resources.requests.storage).toBe('500Gi')
    expect(tpl.storageClassName).toBe('fast-ssd')
  })

  it('should wire the root password from a secret', () => {
    const result = render(jsx(RustFS, { rootPasswordSecret: 's3-credentials' }))

    const sts = result.resources.find((r) => r.kind === 'StatefulSet') as any
    const env = sts.spec.template.spec.containers[0].env
    const pw = env.find((e: any) => e.name === 'RUSTFS_ROOT_PASSWORD')
    expect(pw.valueFrom.secretKeyRef.name).toBe('s3-credentials')
  })

  it('should not render Ingress without host', () => {
    const result = render(jsx(RustFS, {}))
    expect(result.resources.find((r) => r.kind === 'Ingress')).toBeUndefined()
  })

  it('should render Ingress with TLS and cert-manager annotation when host and tls are set', () => {
    const result = render(
      jsx(RustFS, {
        host: 's3.example.com',
        tls: { secretName: 's3-tls', clusterIssuer: 'letsencrypt' },
      })
    )

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.spec.rules[0].host).toBe('s3.example.com')
    expect(ingress.spec.tls[0].secretName).toBe('s3-tls')
    expect(ingress.metadata.annotations['cert-manager.io/cluster-issuer']).toBe('letsencrypt')
  })
})
