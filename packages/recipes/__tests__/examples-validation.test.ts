import { describe, it, expect } from 'vitest'
import { render } from '@r8s/core'
import { recipes } from '../../../docs/data/recipes'
import { packages } from '../../../docs/data/packages'
import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')

/**
 * Compile a TSX code snippet and return diagnostics
 */
function compileTsx(code: string): { success: boolean; errors: string[] } {
  const tmpDir = fs.mkdtempSync(path.join(ROOT, '.tmp-test-'))
  const tmpFile = path.join(tmpDir, 'example.tsx')

  try {
    fs.writeFileSync(tmpFile, code, 'utf-8')

    // Write tsconfig for path resolution
    fs.writeFileSync(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          jsxImportSource: '@r8s/core',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          paths: {
            '@r8s/core': [path.join(ROOT, 'packages/core/src/index.ts')],
            '@r8s/core/*': [path.join(ROOT, 'packages/core/src/*')],
            '@r8s/recipes': [path.join(ROOT, 'packages/recipes/src/index.ts')],
            '@r8s/recipes/*': [path.join(ROOT, 'packages/recipes/src/*')],
            '@r8s/crds': [path.join(ROOT, 'packages/crds/src/index.ts')],
            '@r8s/crds/*': [path.join(ROOT, 'packages/crds/src/generated/*')],
            '@r8s/k8s-types': [path.join(ROOT, 'packages/k8s-types/src/index.ts')],
          },
        },
        include: ['example.tsx'],
      }),
      'utf-8'
    )

    const program = ts.createProgram([tmpFile], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      jsx: ts.JsxEmit.ReactJSX,
      jsxImportSource: '@r8s/core',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      baseUrl: tmpDir,
      paths: {
        '@r8s/core': [path.join(ROOT, 'packages/core/src/index.ts')],
        '@r8s/core/*': [path.join(ROOT, 'packages/core/src/*')],
        '@r8s/recipes': [path.join(ROOT, 'packages/recipes/src/index.ts')],
        '@r8s/recipes/auth': [path.join(ROOT, 'packages/recipes/src/auth/index.ts')],
        '@r8s/recipes/*': [path.join(ROOT, 'packages/recipes/src/*')],
        '@r8s/crds': [path.join(ROOT, 'packages/crds/src/index.ts')],
        '@r8s/crds/*': [path.join(ROOT, 'packages/crds/src/generated/*')],
        '@r8s/k8s-types': [path.join(ROOT, 'packages/k8s-types/src/index.ts')],
        '@r8s/element': [path.join(ROOT, 'packages/element/src/index.ts')],
        '@r8s/grafana': [path.join(ROOT, 'packages/grafana/src/index.ts')],
        '@r8s/rustfs': [path.join(ROOT, 'packages/rustfs/src/index.ts')],
        '@r8s/superset': [path.join(ROOT, 'packages/superset/src/index.ts')],
        '@r8s/wireguard': [path.join(ROOT, 'packages/wireguard/src/index.ts')],
      },
    })

    const diagnostics = ts.getPreEmitDiagnostics(program)
    const errors = diagnostics
      .filter((d) => d.category === ts.DiagnosticCategory.Error)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))

    return { success: errors.length === 0, errors }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

/**
 * Try to render a TSX example by evaluating it
 */
async function renderExample(
  code: string
): Promise<{ success: boolean; error?: string; resourceCount?: number }> {
  try {
    // Use esbuild to bundle the example
    const { build } = await import('esbuild')
    const result = await build({
      stdin: {
        contents: code,
        loader: 'tsx',
        resolveDir: ROOT,
      },
      bundle: true,
      format: 'esm',
      target: 'es2022',
      platform: 'node',
      write: false,
      jsx: 'automatic',
      jsxImportSource: '@r8s/core',
      external: [],
      absWorkingDir: ROOT,
      nodePaths: [path.join(ROOT, 'node_modules')],
      alias: {
        '@r8s/core': path.join(ROOT, 'packages/core/src'),
        '@r8s/recipes': path.join(ROOT, 'packages/recipes/src'),
        '@r8s/recipes/auth': path.join(ROOT, 'packages/recipes/src/auth/index.ts'),
        '@r8s/crds': path.join(ROOT, 'packages/crds/src'),
        '@r8s/crds/postgresql': path.join(ROOT, 'packages/crds/src/generated/postgresql.ts'),
        '@r8s/crds/cert-manager': path.join(ROOT, 'packages/crds/src/generated/cert-manager.ts'),
        '@r8s/crds/gateway': path.join(ROOT, 'packages/crds/src/generated/gateway.ts'),
        '@r8s/crds/redis': path.join(ROOT, 'packages/crds/src/generated/redis.ts'),
        '@r8s/crds/velero': path.join(ROOT, 'packages/crds/src/generated/velero.ts'),
        '@r8s/crds/monitoring': path.join(ROOT, 'packages/crds/src/generated/monitoring.ts'),
        '@r8s/crds/keycloak': path.join(ROOT, 'packages/crds/src/generated/keycloak.ts'),
        '@r8s/crds/externaldns': path.join(ROOT, 'packages/crds/src/generated/externaldns.ts'),
        '@r8s/crds/clickhouse': path.join(ROOT, 'packages/crds/src/generated/clickhouse.ts'),
        '@r8s/crds/logging': path.join(ROOT, 'packages/crds/src/generated/logging.ts'),
        '@r8s/crds/loki': path.join(ROOT, 'packages/crds/src/generated/loki.ts'),
        '@r8s/k8s-types': path.join(ROOT, 'packages/k8s-types/src'),
        '@r8s/element': path.join(ROOT, 'packages/element/src'),
        '@r8s/grafana': path.join(ROOT, 'packages/grafana/src'),
        '@r8s/rustfs': path.join(ROOT, 'packages/rustfs/src'),
        '@r8s/superset': path.join(ROOT, 'packages/superset/src'),
        '@r8s/wireguard': path.join(ROOT, 'packages/wireguard/src'),
      },
    })

    const bundledCode = result.outputFiles[0].text
    const dataUrl = 'data:text/javascript;base64,' + Buffer.from(bundledCode).toString('base64')
    const mod = await import(dataUrl)
    // Handle both ESM default export and CJS module.exports
    const element = mod.default ?? mod

    if (!element) {
      return { success: false, error: 'No default export' }
    }

    const renderResult = render(element)
    return { success: true, resourceCount: renderResult.resources.length }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

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
