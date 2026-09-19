import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_ENVOYGATEWAY_VERSION, EnvoyGatewayOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-envoy-gateway', () => {
  it('mirrors the registry version (1.7.1)', () => {
    expect(pkg.version).toBe('1.7.1')
    expect(DEFAULT_ENVOYGATEWAY_VERSION).toBe(pkg.version)
    expect(EnvoyGatewayOperator().version).toBe('1.7.1')
    expect(operators['envoy-gateway']().version).toBe('1.7.1')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['envoy-gateway']('1.7.1')
    const actual = EnvoyGatewayOperator('1.7.1')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('installs helm-free from the upstream static manifest', () => {
    const op = EnvoyGatewayOperator()
    expect(op.source.type).toBe('manifest')
    expect(op.source.url).toBe(
      'https://github.com/envoyproxy/gateway/releases/download/v1.7.1/install.yaml'
    )
    expect(op.source.namespace).toBe('envoy-gateway-system')
    expect(op.crds).toContain('gatewayclasses.gateway.networking.k8s.io')
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['envoy-gateway']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['envoy-gateway'])
  })
})
