import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Grafana } from '../src/index'

describe('Grafana', () => {
  it('should render Secret, Deployment, Service, and PVC with defaults', () => {
    const result = render(jsx(Grafana, {}))

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    expect(deployment).toBeDefined()
    expect(deployment.metadata.name).toBe('grafana')
    expect(deployment.metadata.namespace).toBe('monitoring')
    expect(deployment.spec.template.spec.containers[0].image).toBe('grafana/grafana:10.3.0')

    const service = result.resources.find((r) => r.kind === 'Service')
    expect(service).toBeDefined()
    expect(service?.metadata.name).toBe('grafana')
    expect(service?.metadata.namespace).toBe('monitoring')

    const pvc = result.resources.find((r) => r.kind === 'PersistentVolumeClaim') as any
    expect(pvc).toBeDefined()
    expect(pvc?.metadata.name).toBe('grafana-pvc')
    expect(pvc?.spec.resources.requests.storage).toBe('10Gi')

    expect(result.resources).toHaveLength(4)
  })

  it('should render admin Secret so the Deployment volume reference resolves', () => {
    const result = render(jsx(Grafana, {}))

    const secret = result.resources.find((r) => r.kind === 'Secret') as any
    expect(secret).toBeDefined()
    expect(secret.metadata.name).toBe('grafana-admin')
    expect(secret.metadata.namespace).toBe('monitoring')
    expect(secret.stringData.password).toBeDefined()

    // The Deployment mounts this exact Secret — without it the pod
    // fails with CreateContainerConfigError.
    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const adminVolume = deployment.spec.template.spec.volumes.find((v: any) => v.name === 'admin')
    expect(adminVolume.secret.secretName).toBe(secret.metadata.name)
  })

  it('should not render admin Secret when existingSecret is provided', () => {
    const result = render(jsx(Grafana, { admin: { existingSecret: 'my-creds' } }))

    const secret = result.resources.find((r) => r.kind === 'Secret')
    expect(secret).toBeUndefined()

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const adminVolume = deployment.spec.template.spec.volumes.find((v: any) => v.name === 'admin')
    expect(adminVolume.secret.secretName).toBe('my-creds')
  })

  it('should not render ConfigMap when no datasources are provided', () => {
    const result = render(jsx(Grafana, {}))
    const configMap = result.resources.find((r) => r.kind === 'ConfigMap')
    expect(configMap).toBeUndefined()
    expect(result.resources).toHaveLength(4)
  })

  it('should render ConfigMap when datasources are provided', () => {
    const result = render(
      jsx(Grafana, {
        datasources: [{ name: 'Prometheus', type: 'prometheus', url: 'http://prometheus:9090' }],
      })
    )

    const configMap = result.resources.find((r) => r.kind === 'ConfigMap') as any
    expect(configMap).toBeDefined()
    expect(configMap.metadata.name).toBe('grafana-datasources')
    expect(configMap.metadata.namespace).toBe('monitoring')

    const dsConfig = JSON.parse(configMap.data['datasources.yaml'])
    expect(dsConfig.datasources).toHaveLength(1)
    expect(dsConfig.datasources[0].name).toBe('Prometheus')
    expect(dsConfig.datasources[0].type).toBe('prometheus')
    expect(dsConfig.datasources[0].url).toBe('http://prometheus:9090')

    expect(result.resources).toHaveLength(5)
  })

  it('should wire the datasources volume to its ConfigMap', () => {
    const result = render(
      jsx(Grafana, {
        datasources: [{ name: 'Loki', type: 'loki', url: 'http://loki:3100' }],
      })
    )

    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    const dsVolume = deployment.spec.template.spec.volumes.find(
      (v: any) => v.name === 'datasources'
    )
    // A volume without a source is rejected by the Kubernetes API.
    expect(dsVolume.configMap).toBeDefined()
    expect(dsVolume.configMap.name).toBe('grafana-datasources')
  })

  it('should resolve every volume source against rendered resources', () => {
    const result = render(
      jsx(Grafana, {
        datasources: [{ name: 'Prometheus', type: 'prometheus', url: 'http://p:9090' }],
      })
    )

    const names = new Set(result.resources.map((r) => r.metadata?.name))
    const deployment = result.resources.find((r) => r.kind === 'Deployment') as any
    for (const vol of deployment.spec.template.spec.volumes) {
      const ref =
        vol.secret?.secretName ?? vol.configMap?.name ?? vol.persistentVolumeClaim?.claimName
      expect(ref, `volume "${vol.name}" has no source`).toBeDefined()
      expect(names.has(ref), `volume "${vol.name}" references missing resource "${ref}"`).toBe(true)
    }
  })

  it('should not render Ingress when host is not set', () => {
    const result = render(jsx(Grafana, {}))
    const ingress = result.resources.find((r) => r.kind === 'Ingress')
    expect(ingress).toBeUndefined()
    expect(result.resources).toHaveLength(4)
  })

  it('should render Ingress when host is set', () => {
    const result = render(jsx(Grafana, { host: 'grafana.example.com' }))

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.metadata.name).toBe('grafana')
    expect(ingress.metadata.namespace).toBe('monitoring')
    expect(ingress.spec.rules[0].host).toBe('grafana.example.com')

    expect(result.resources).toHaveLength(5)
  })

  it('should add cert-manager annotation when tls is configured', () => {
    const result = render(
      jsx(Grafana, {
        host: 'grafana.example.com',
        tls: { secretName: 'grafana-tls', clusterIssuer: 'letsencrypt' },
      })
    )

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.metadata.annotations['cert-manager.io/cluster-issuer']).toBe('letsencrypt')
    expect(ingress.spec.tls).toEqual([
      { hosts: ['grafana.example.com'], secretName: 'grafana-tls' },
    ])

    expect(result.resources).toHaveLength(5)
  })
})
