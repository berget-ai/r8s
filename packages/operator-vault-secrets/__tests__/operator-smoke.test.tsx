import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_VAULTSECRETS_VERSION, VaultSecretsOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-vault-secrets', () => {
  it('mirrors the registry version (0.5.0)', () => {
    expect(pkg.version).toBe('0.5.0')
    expect(DEFAULT_VAULTSECRETS_VERSION).toBe(pkg.version)
    expect(VaultSecretsOperator().version).toBe('0.5.0')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['vault-secrets-operator']('0.5.0')
    const actual = VaultSecretsOperator('0.5.0')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['vault-secrets-operator']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['vault-secrets-operator'])
  })
})
