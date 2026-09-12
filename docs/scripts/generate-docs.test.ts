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
      const slugMatches = content.matchAll(/slug: ["']([^"']+)["']/g)
      const slugs = [...slugMatches].map((m) => m[1])
      const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i)

      expect(duplicates).toEqual([])
    })

    it('should have no duplicate component names within a package', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'packages.ts'), 'utf-8')
      // Parse the packages array structure (generator may emit either
      // double-quoted strings or prettier-normalized single quotes)
      const packageBlocks = content.split(/(?=\s{4}slug: ['"])/)
      for (const block of packageBlocks) {
        // Only match component-level names (8-space indent) — nested prop
        // type names at deeper indentation are not component names
        const nameMatches = block.matchAll(/^ {8}name: ["']([A-Z][^"']+)["']/gm)
        const names = [...nameMatches].map((m) => m[1])
        const duplicates = names.filter((name, i) => names.indexOf(name) !== i)
        expect(duplicates).toEqual([])
      }
    })
  })

  describe('recipes.ts', () => {
    it('should have no duplicate recipe slugs', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      const slugMatches = content.matchAll(/slug: ["']([^"']+)["']/g)
      const slugs = [...slugMatches].map((m) => m[1])
      const duplicates = slugs.filter((slug, i) => slugs.indexOf(slug) !== i)

      expect(duplicates).toEqual([])
    })

    it('should have no duplicate recipe titles', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      // Only match recipe-level titles (4-space indent) — example titles at
      // deeper indentation may legitimately repeat across recipes
      const titleMatches = content.matchAll(/^ {4}title: ["']([^"']+)["']/gm)
      const titles = [...titleMatches].map((m) => m[1])
      const duplicates = titles.filter((title, i) => titles.indexOf(title) !== i)

      expect(duplicates).toEqual([])
    })

    it('should not include Ingress as a recipe', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      expect(content).not.toMatch(/slug: ["']ingress["']/)
    })

    it('should include Platform, Endpoint, and App recipes', () => {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', 'recipes.ts'), 'utf-8')
      expect(content).toMatch(/slug: ["']platform["']/)
      expect(content).toMatch(/slug: ["']endpoint["']/)
      expect(content).toMatch(/slug: ["']app["']/)
    })
  })

  describe('validation.json', () => {
    const record = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'docs', 'validation.json'), 'utf-8')
    ) as {
      packages?: Record<string, unknown>
      recipes?: Record<string, unknown>
    }

    // Slug lines sit at 4-space indent in the generated files (same
    // convention as the duplicate-slug tests above)
    function readSlugs(dataFile: string): string[] {
      const content = fs.readFileSync(path.join(ROOT, 'docs', 'data', dataFile), 'utf-8')
      return [...content.matchAll(/^ {4}slug: ["']([^"']+)["']/gm)].map((m) => m[1])
    }

    it('should map every package record key to a generated package slug', () => {
      const slugs = readSlugs('packages.ts')
      for (const key of Object.keys(record.packages ?? {})) {
        // An orphan key renders nowhere in the docs while the smoke keeps
        // stamping it (see the generator's orphan-record warning) — e.g. a
        // smoke target missing from the generator's appPackages list.
        expect(slugs, `docs/validation.json package "${key}"`).toContain(key)
      }
    })

    it('should map every recipe record key to a generated recipe slug', () => {
      const slugs = readSlugs('recipes.ts')
      for (const key of Object.keys(record.recipes ?? {})) {
        expect(slugs, `docs/validation.json recipe "${key}"`).toContain(key)
      }
    })
  })
})
