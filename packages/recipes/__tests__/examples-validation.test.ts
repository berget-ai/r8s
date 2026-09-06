import { describe, it, expect } from 'vitest'
import { recipes } from '../../../docs/data/recipes'
import { packages } from '../../../docs/data/packages'
import { compileTsx, renderExample } from './helpers/example-harness'

describe('Example validation', () => {
  describe('Recipes', () => {
    for (const recipe of recipes) {
      // Skip recipes with no examples — vitest fails on empty describe suites
      if (recipe.component.examples.length === 0) continue
      describe(recipe.title, () => {
        for (let i = 0; i < recipe.component.examples.length; i++) {
          const example = recipe.component.examples[i]
          const title = example.title ?? `Example ${i + 1}`

          it(`should compile: ${title}`, () => {
            const result = compileTsx(example.tsx)
            if (!result.success) {
              console.error(`Compile errors in ${recipe.title} / ${title}:`, result.errors)
            }
            expect(result.success).toBe(true)
          })

          it(`should render: ${title}`, async () => {
            const result = await renderExample(example.tsx)
            if (!result.success) {
              console.error(`Render error in ${recipe.title} / ${title}:`, result.error)
            }
            expect(result.success).toBe(true)
            expect(result.resourceCount).toBeGreaterThan(0)
          })
        }
      })
    }
  })

  describe('Packages', () => {
    for (const pkg of packages) {
      const componentsWithExamples = pkg.components.filter((c) => c.examples.length > 0)
      // Skip packages where no component has examples — vitest fails on empty describe suites
      if (componentsWithExamples.length === 0) continue
      describe(pkg.title, () => {
        for (const component of componentsWithExamples) {
          for (let i = 0; i < component.examples.length; i++) {
            const example = component.examples[i]
            const title = example.title ?? `Example ${i + 1}`

            it(`should compile: ${component.name} / ${title}`, () => {
              const result = compileTsx(example.tsx)
              if (!result.success) {
                console.error(
                  `Compile errors in ${pkg.title} / ${component.name} / ${title}:`,
                  result.errors
                )
              }
              expect(result.success).toBe(true)
            })

            it(`should render: ${component.name} / ${title}`, async () => {
              // CRD examples may not have export default — add it if missing
              const code = example.tsx.includes('export default')
                ? example.tsx
                : example.tsx.replace(/^([<>(])/m, 'export default $1')
              const result = await renderExample(code)
              if (!result.success) {
                console.error(
                  `Render error in ${pkg.title} / ${component.name} / ${title}:`,
                  result.error
                )
              }
              expect(result.success).toBe(true)
              expect(result.resourceCount).toBeGreaterThan(0)
            })
          }
        }
      })
    }
  })
})
