import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_CERTMANAGER_VERSION, CertManagerOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-cert-manager', () => {
  it('mirrors the registry version (1.18.0)', () => {
    expect(pkg.version).toBe('1.18.0')
    expect(DEFAULT_CERTMANAGER_VERSION).toBe(pkg.version)
    expect(CertManagerOperator().version).toBe('1.18.0')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['cert-manager']('1.18.0')
    const actual = CertManagerOperator('1.18.0')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['cert-manager']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['cert-manager'])
  })
})
