import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initProject } from '../src/cli'

// The CLI's own version — the single source of truth for scaffolded pins.
// Resolved via import.meta.url so the path holds under any test runner.
const cliVersion = JSON.parse(
  readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf-8')
).version as string

let testDir: string

function projectPath(name: string): string {
  return join(testDir, name)
}

describe('r8s init scaffold', () => {
  beforeEach(() => {
    testDir = join(tmpdir(), `r8s-init-test-${Date.now()}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('pins @r8s/* deps to the CLI version (single source of truth)', async () => {
    const dir = projectPath('pins')
    await initProject(dir, 'basic', 'github-actions')

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
    expect(pkg.version).toBe(cliVersion)
    expect(pkg.dependencies['@r8s/core']).toBe(`^${cliVersion}`)
    expect(pkg.dependencies['@r8s/recipes']).toBe(`^${cliVersion}`)
    expect(pkg.devDependencies['@r8s/cli']).toBe(`^${cliVersion}`)
    expect(pkg.dependencies['@r8s/core']).not.toBe('^0.1.0')
  })

  describe('gitignore keeps the documented flows addable', () => {
    const run = (dir: string, cmd: string) => execSync(cmd, { cwd: dir, stdio: 'pipe' })

    const staged = (dir: string): string[] =>
      run(dir, 'git diff --cached --name-only').toString().split('\n').filter(Boolean)

    function seedGitOpsFiles(dir: string): void {
      // The GitOps flow renders to clusters/<env>/ — a directory the
      // scaffold itself never creates, so the test provisions it the way
      // the docs describe.
      mkdirSync(join(dir, 'clusters', 'prod'), { recursive: true })
      writeFileSync(join(dir, 'clusters', 'prod', 'manifest.yaml'), 'kind: Namespace\n')
      mkdirSync(join(dir, 'k8s', 'rendered'), { recursive: true })
      writeFileSync(join(dir, 'k8s', 'rendered', 'manifest.yaml'), 'kind: Namespace\n')
      // Negative controls: random scratch yaml + junk must stay ignored.
      writeFileSync(join(dir, 'scratch.yaml'), 'kind: Scratch\n')
    }

    it('github-actions: workflow + rendered output are tracked', async () => {
      const dir = projectPath('gh-addable')
      await initProject(dir, 'basic', 'github-actions')
      seedGitOpsFiles(dir)
      run(dir, 'git init')

      run(dir, 'git add -A')

      const files = staged(dir)
      expect(files).toContain('.github/workflows/render.yaml')
      expect(files).toContain('k8s/r8s.tsx')
      expect(files).toContain('k8s/rendered/manifest.yaml')
      expect(files).toContain('clusters/prod/manifest.yaml')
      expect(files).not.toContain('scratch.yaml')
    })

    it('flux-controller: flux manifests + GitOps layout are tracked', async () => {
      const dir = projectPath('flux-addable')
      await initProject(dir, 'basic', 'flux-controller')
      seedGitOpsFiles(dir)
      run(dir, 'git init')

      run(dir, 'git add -A')

      const files = staged(dir)
      expect(files).toContain('flux/gitrepository.yaml')
      expect(files).toContain('flux/webhook.yaml')
      expect(files).toContain('k8s/r8s.tsx')
      expect(files).toContain('clusters/prod/manifest.yaml')
      expect(files).not.toContain('scratch.yaml')
    })
  })

  it('flux scaffold documents bootstrap token auth', async () => {
    const dir = projectPath('flux-docs')
    await initProject(dir, 'basic', 'flux-controller')

    const readme = readFileSync(join(dir, 'README.md'), 'utf-8')
    expect(readme).toContain('GITHUB_TOKEN=$(gh auth token)')
    expect(readme).toContain('--token-auth')
    expect(readme).toContain('clusters/<env>')

    const fluxReadme = readFileSync(join(dir, 'flux', 'README.md'), 'utf-8')
    expect(fluxReadme).toContain('GITHUB_TOKEN=$(gh auth token)')
    expect(fluxReadme).toContain('--token-auth')
  })

  it('scaffolds both templates with a valid entry file', async () => {
    const basic = projectPath('basic')
    await initProject(basic, 'basic', 'github-actions')
    expect(readFileSync(join(basic, 'k8s/r8s.tsx'), 'utf-8')).toContain(
      "import { App } from '@r8s/recipes'"
    )

    const fullstack = projectPath('fullstack')
    await initProject(fullstack, 'fullstack', 'github-actions')
    const tsx = readFileSync(join(fullstack, 'k8s/r8s.tsx'), 'utf-8')
    expect(tsx).toContain('<Database')
    expect(tsx).toContain('<App')
  })
})
