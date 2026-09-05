import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_LOGGING_VERSION, LoggingOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-logging', () => {
  it('mirrors the registry version (4.2.3)', () => {
    expect(pkg.version).toBe('4.2.3')
    expect(DEFAULT_LOGGING_VERSION).toBe(pkg.version)
    expect(LoggingOperator().version).toBe('4.2.3')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['logging-operator']('4.2.3')
    const actual = LoggingOperator('4.2.3')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['logging-operator']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['logging-operator'])
  })
})
