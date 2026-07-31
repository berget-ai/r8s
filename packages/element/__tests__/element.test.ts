import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Element } from '../src/index'

describe('Element', () => {
  it('should render Namespace, ConfigMap, Deployment, Service and Ingress', () => {
    const result = render(
      jsx(Element, { host: 'chat.example.com', homeserverUrl: 'https://matrix.example.com' })
    )

    expect(result.resources).toHaveLength(5)
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toEqual(['Namespace', 'ConfigMap', 'Deployment', 'Service', 'Ingress'])
  })

  it('should use default name and namespace', () => {
    const result = render(
      jsx(Element, { host: 'chat.example.com', homeserverUrl: 'https://matrix.example.com' })
    )

    const deployment = result.resources.find((r) => r.kind === 'Deployment')
    expect(deployment?.metadata.name).toBe('element')
    expect(deployment?.metadata.namespace).toBe('element')

    const ns = result.resources.find((r) => r.kind === 'Namespace')
    expect(ns?.metadata.name).toBe('element')
  })

  it('should wire the homeserver URL into the ConfigMap config.json', () => {
    const result = render(
      jsx(Element, { host: 'chat.example.com', homeserverUrl: 'https://matrix.example.com' })
    )

    const configMap = result.resources.find((r) => r.kind === 'ConfigMap') as any
    const config = JSON.parse(configMap.data['config.json'])
    expect(config.default_server_config['m.homeserver'].base_url).toBe('https://matrix.example.com')
    expect(config.default_server_config['m.homeserver'].server_name).toBe('chat.example.com')
  })

  it('should render Ingress with the given host', () => {
    const result = render(
      jsx(Element, { host: 'chat.example.com', homeserverUrl: 'https://matrix.example.com' })
    )

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.spec.rules[0].host).toBe('chat.example.com')
    expect(ingress.metadata.annotations).toBeUndefined()
  })

  it('should add TLS and cert-manager annotation when tls is set', () => {
    const result = render(
      jsx(Element, {
        host: 'chat.example.com',
        homeserverUrl: 'https://matrix.example.com',
        tls: { secretName: 'element-tls', clusterIssuer: 'letsencrypt' },
      })
    )

    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress.spec.tls[0].secretName).toBe('element-tls')
    expect(ingress.metadata.annotations['cert-manager.io/cluster-issuer']).toBe('letsencrypt')
  })
})
