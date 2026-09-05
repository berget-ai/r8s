import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_EXTERNALDNS_VERSION, ExternalDnsOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-external-dns', () => {
  it('mirrors the registry version (1.21.1)', () => {
    expect(pkg.version).toBe('1.21.1')
    expect(DEFAULT_EXTERNALDNS_VERSION).toBe(pkg.version)
    expect(ExternalDnsOperator().version).toBe('1.21.1')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['external-dns']('1.21.1')
    const actual = ExternalDnsOperator('1.21.1')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['external-dns']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['external-dns'])
  })
})
