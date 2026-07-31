import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')

// Import the generator functions
// We test the output files, not the generator internals

describe('Generated docs data', () => {
  describe('packages.ts', () => {
    it('should have no duplicate package slugs', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'packages.ts'), 'utf-8')
      const slugMatches = content.matchAll(/slug: "([^"]+)"/g)
      const slugs = [...slugMatches].map((m) => m[1])
      const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i)

      expect(duplicates).toEqual([])
    })

    it('should have no duplicate component names within a package', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'packages.ts'), 'utf-8')
      // Parse the packages array structure
      const packageBlocks = content.split(/(?=\s{4}slug: ")/)
      for (const block of packageBlocks) {
        const nameMatches = block.matchAll(/name: "([A-Z][^"]+)"/g)
        const names = [...nameMatches].map((m) => m[1])
        const duplicates = names.filter((name, i) => names.indexOf(name) !== i)
        expect(duplicates).toEqual([])
      }
    })
  })

  describe('recipes.ts', () => {
    it('should have no duplicate recipe slugs', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      const slugMatches = content.matchAll(/slug: "([^"]+)"/g)
      const slugs = [...slugMatches].map((m) => m[1])
      const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i)

      expect(duplicates).toEqual([])
    })

    it('should have no duplicate recipe titles', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      const titleMatches = content.matchAll(/title: "([^"]+)"/g)
      const titles = [...titleMatches].map((m) => m[1])
      const duplicates = titles.filter((title, i) => titles.indexOf(title) !== i)

      expect(duplicates).toEqual([])
    })

    it('should not include Ingress as a recipe', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      expect(content).not.toMatch(/slug: "ingress"/)
    })

    it('should include Platform, Endpoint, and App recipes', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      expect(content).toMatch(/slug: "platform"/)
      expect(content).toMatch(/slug: "endpoint"/)
      expect(content).toMatch(/slug: "app"/)
    })
  })
})
