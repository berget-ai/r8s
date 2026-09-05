import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '@r8s/core'
import { DEFAULT_CNPG_VERSION, cnpgOperator, declareCnpg } from '../src/index'
import { jsx, Fragment } from '@r8s/core'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('cnpgOperator declaration', () => {
  it('defaults to the package-mirrored operator version', () => {
    expect(pkg.version).toBe('1.27.0')
    expect(DEFAULT_CNPG_VERSION).toBe(pkg.version)
    expect(cnpgOperator().version).toBe('1.27.0')
  })

  it('expands {minor} + {version} into the release manifest URL', () => {
    const op = cnpgOperator()
    expect(op.source).toMatchObject({
      type: 'manifest',
      url: 'https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.27/releases/cnpg-1.27.0.yaml',
      namespace: 'cnpg-system',
    })
  })

  it('expands other versions onto their own minor line', () => {
    const op = cnpgOperator('1.28.2')
    expect(op.source).toMatchObject({
      url: 'https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.28/releases/cnpg-1.28.2.yaml',
      version: '1.28.2',
    })
    expect(op.version).toBe('1.28.2')
  })

  it('registers the CNPG CRDs', () => {
    expect(cnpgOperator().crds).toEqual([
      'clusters.postgresql.cnpg.io',
      'poolers.postgresql.cnpg.io',
      'scheduledbackups.postgresql.cnpg.io',
    ])
  })
})

describe('declareCnpg — declare unless the Platform provides it', () => {
  it('returns a declaration when no surrounding operator context has cnpg', () => {
    const resources = declareCnpg([])
    expect(resources).toHaveLength(1)

    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['cnpg'])
    expect(result.operators[0].version).toBe('1.27.0')
  })

  it('renders the operator element through a component tree', () => {
    function Stack() {
      const resources = declareCnpg([])
      return jsx(Fragment, { children: resources })
    }
    const result = render(<Stack />)
    expect(result.operators.map((o) => o.name)).toEqual(['cnpg'])
  })

  it('returns [] when the shared operators already include cnpg', () => {
    const shared = [cnpgOperator('1.27.0')]
    expect(declareCnpg(shared)).toEqual([])
  })

  it('does not get confused by operators sharing a name prefix', () => {
    const fake = { ...cnpgOperator(), name: 'cnpg-something-else' }
    expect(declareCnpg([fake as never])).toHaveLength(1)
  })

  it('passes a version override through to the declaration', () => {
    const resources = declareCnpg([], '1.28.2')
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators[0].version).toBe('1.28.2')
  })
})
