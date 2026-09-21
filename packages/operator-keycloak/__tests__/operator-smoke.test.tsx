import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_KEYCLOAK_VERSION, KeycloakOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-keycloak', () => {
  it('mirrors the registry version (26.7.4)', () => {
    expect(pkg.version).toBe('26.7.4')
    expect(DEFAULT_KEYCLOAK_VERSION).toBe(pkg.version)
    expect(KeycloakOperator().version).toBe('26.7.4')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['keycloak-operator']('26.7.4')
    const actual = KeycloakOperator('26.7.4')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('sources an ordered multi-URL manifest (CRD, CRD, operator)', () => {
    const source = KeycloakOperator('26.7.4').source
    expect(source.type).toBe('manifest')
    if (source.type !== 'manifest' || !source.urls) throw new Error('expected manifest with urls')
    expect(source.urls[0]).toContain('keycloaks.k8s.keycloak.org-v1.yml')
    expect(source.urls[1]).toContain('keycloakrealmimports.k8s.keycloak.org-v1.yml')
    expect(source.urls[2]).toContain('/cluster-wide/kubernetes.yml')
    expect('url' in source).toBe(false)
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['keycloak-operator']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['keycloak-operator'])
  })
})
