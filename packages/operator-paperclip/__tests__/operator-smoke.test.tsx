import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_PAPERCLIP_VERSION, PaperclipOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-paperclip', () => {
  it('mirrors the registry version (0.19.1)', () => {
    expect(pkg.version).toBe('0.19.1')
    expect(DEFAULT_PAPERCLIP_VERSION).toBe(pkg.version)
    expect(PaperclipOperator().version).toBe('0.19.1')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['paperclip-operator']('0.19.1')
    const actual = PaperclipOperator('0.19.1')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('installs helm-free from the upstream release manifest', () => {
    const op = PaperclipOperator()
    expect(op.source.type).toBe('manifest')
    expect(op.source.url).toBe(
      'https://github.com/paperclipinc/paperclip-operator/releases/download/v0.19.1/install.yaml'
    )
    // the static manifest deploys into `paperclip-operator-system` (upstream
    // renamed the namespace from the chart's `paperclip-system`)
    expect(op.namespace).toBe('paperclip-operator-system')
    expect(op.crds).toEqual([
      'instances.paperclip.inc',
      'paperclipclusterdefaults.paperclip.inc',
      'paperclipselfconfigs.paperclip.inc',
    ])
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['paperclip-operator']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['paperclip-operator'])
  })
})
