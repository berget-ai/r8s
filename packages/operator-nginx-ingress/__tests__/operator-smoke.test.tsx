import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_NGINXINGRESS_VERSION, NginxIngressOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-nginx-ingress', () => {
  it('mirrors the registry version (1.15.1)', () => {
    expect(pkg.version).toBe('1.15.1')
    expect(DEFAULT_NGINXINGRESS_VERSION).toBe(pkg.version)
    expect(NginxIngressOperator().version).toBe('1.15.1')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['nginx-ingress']('1.15.1')
    const actual = NginxIngressOperator('1.15.1')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['nginx-ingress']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['nginx-ingress'])
  })
})
