import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_RELOADER_VERSION, ReloaderOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-reloader', () => {
  it('mirrors the registry version (1.4.22 — the app release tag; chart 2.2.17 == app v1.4.22)', () => {
    expect(pkg.version).toBe('1.4.22')
    expect(DEFAULT_RELOADER_VERSION).toBe(pkg.version)
    expect(ReloaderOperator().version).toBe('1.4.22')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['reloader']('1.4.22')
    const actual = ReloaderOperator('1.4.22')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('installs helm-free from the upstream static manifest', () => {
    const op = ReloaderOperator()
    expect(op.source.type).toBe('manifest')
    expect(op.source.url).toBe(
      'https://raw.githubusercontent.com/stakater/Reloader/v1.4.22/deployments/kubernetes/reloader.yaml'
    )
    expect(op.source.namespace).toBe('reloader')
  })

  it('declares no CRDs (Deployment + RBAC only)', () => {
    expect(ReloaderOperator().crds).toEqual([])
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['reloader']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['reloader'])
  })
})
