/**
 * README examples are executable promises — every ```tsx block with an
 * `export default` must compile, render and pass guardrails against HEAD
 * sources. This is the CI net the README never had: the flagship example
 * silently broke when backups became a required decision (#115) and stayed
 * broken for two releases because nothing rendered it.
 *
 * Blocks without `export default` (illustrative snippets — the capability
 * hook, the test skeleton) are out of scope: they reference symbols that
 * only exist in their surrounding prose.
 */
import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { runGuardrails, noPlaintextSecrets } from '@r8s/core'
import { compileTsx, renderExample, ROOT } from './helpers/example-harness'

const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf-8')

/** Fenced ```tsx blocks, in document order */
const blocks = [...readme.matchAll(/```tsx\r?\n([\s\S]*?)```/g)].map((m) => m[1])
const renderable = blocks.filter((code) => code.includes('export default'))

describe('README examples', () => {
  it('finds the expected blocks (floors catch parser rot)', () => {
    expect(blocks.length).toBeGreaterThanOrEqual(4)
    expect(renderable.length).toBeGreaterThanOrEqual(2)
  })

  for (const [i, code] of renderable.entries()) {
    const label = `block ${i + 1}`

    it(`should compile: ${label}`, () => {
      const result = compileTsx(code)
      if (!result.success) {
        console.error(`Compile errors in README ${label}:`, result.errors)
      }
      expect(result.success).toBe(true)
    })

    it(`should render + pass guardrails: ${label}`, async () => {
      const result = await renderExample(code)
      if (!result.success) {
        console.error(`Render error in README ${label}:`, result.error)
      }
      expect(result.success).toBe(true)
      expect(result.resourceCount).toBeGreaterThan(0)

      const { passed, errors } = runGuardrails(result.resources ?? [], [noPlaintextSecrets])
      if (!passed) console.error(`Guardrail violations in README ${label}:`, errors)
      expect(passed).toBe(true)
    })
  }
})
