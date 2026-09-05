/**
 * Operator package contracts — the npm-resolve rules, enforced statically.
 *
 * The desired behavior (before any npm install runs):
 * 1. every packages/operator-* package mirrors its operator's own version
 *    (major = operator major, version === operators.yaml until phase 2)
 * 2. every consumer of an operator package declares it as
 *    ^<major>.0.0 — in peerDependencies (apps) or dependencies (toolkits)
 * 3. two packages depending on the same operator therefore resolve to one
 *    copy, and mixed majors fail at `npm install` (ERESOLVE), never on the
 *    cluster
 *
 * When a check fails here, the offending package.json is the fix — not this
 * file.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const packagesDir = join(repoRoot, 'packages')

function packageJson(dir: string): Record<string, any> {
  return JSON.parse(readFileSync(join(packagesDir, dir, 'package.json'), 'utf8'))
}

const operatorPackages = readdirSync(packagesDir)
  .filter((d) => d.startsWith('operator-'))
  .filter((d) => existsSync(join(packagesDir, d, 'package.json')))

/** cnpg → '1.27.0' straight from the single-source registry (phase-2 guard) */
function registryVersion(operator: string): string {
  const yaml = readFileSync(join(packagesDir, 'crds', 'operators.yaml'), 'utf8')
  const block = yaml.split('\n- name: ').find((b) => b.startsWith(`${operator}\n`))
  if (!block) throw new Error(`operator '${operator}' missing from operators.yaml`)
  return block.match(/version: '([^']+)'/)?.[1] ?? ''
}

const operatorNames = new Set(operatorPackages.map((dir) => packageJson(dir).name as string))

describe.each(operatorPackages.map((dir) => [dir]))('operator package %s', (dir) => {
  const pj = packageJson(dir)
  const name: string = pj.name
  const operator = dir.replace(/^operator-/, '')

  it('is publishable with dist files and an Operator category', () => {
    expect(pj.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(pj.files).toContain('dist')
    expect(pj.r8s?.category).toBe('Operators')
    expect(pj.keywords).toContain('r8s')
    expect(pj.keywords).toContain('operator')
  })

  it('package major mirrors the operator major (semver-mapped, never 0.x)', () => {
    expect(Number(pj.version.split('.')[0])).toBeGreaterThanOrEqual(1)
  })

  it('agrees with operators.yaml until phase 2 splits the registry', () => {
    expect(pj.version).toBe(registryVersion(operator))
  })
})

describe('operator dependency ranges resolve under one major', () => {
  const consumerDirs = readdirSync(packagesDir).filter((d) =>
    existsSync(join(packagesDir, d, 'package.json'))
  )

  /**
   * The declared range must pin the operator's major — and may floor at the
   * minor the package was cut against ('^1.27.0'), which still lets npm
   * flatten the whole tree onto one copy and refuses mixed majors.
   */
  const rangeOk = (range: string, opVersion: string) => {
    const m = /^\^(\d+)\.\d+\.\d+$/.exec(range)
    if (!m) return false
    return Number(m[1]) === Number(opVersion.split('.')[0])
  }

  for (const dir of consumerDirs) {
    const pj = packageJson(dir)
    const declared: Record<string, string> = {
      ...(pj.dependencies ?? {}),
      ...(pj.peerDependencies ?? {}),
    }
    const ranges = Object.entries(declared).filter(([name]) => operatorNames.has(name))

    if (ranges.length === 0) continue

    describe(`${pj.name}`, () => {
      it.each(ranges)('range %s → %s pins the operator major', (name, range) => {
        expect(
          rangeOk(range, packageJson(`operator-${name.replace('@r8s/operator-', '')}`).version)
        ).toBe(true)
      })
    })
  }

  it('has at least one operator consumer wired (suite is not vacuous)', () => {
    const wired = consumerDirs.filter((dir) => {
      const pj = packageJson(dir)
      const declared = { ...(pj.dependencies ?? {}), ...(pj.peerDependencies ?? {}) }
      return Object.keys(declared).some((name) => operatorNames.has(name))
    })
    expect(wired.length).toBeGreaterThan(0)
  })
})
