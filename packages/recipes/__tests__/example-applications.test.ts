import { describe, it, expect } from 'vitest'
import { render } from '@r8s/core'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXAMPLES_DIR = path.resolve(__dirname, '../../..')

/**
 * Bundle and render a TSX example file
 */
async function renderExample(examplePath: string): Promise<{
  success: boolean
  resourceCount?: number
  error?: string
}> {
  try {
    const { build } = await import('esbuild')

    const result = await build({
      entryPoints: [examplePath],
      bundle: true,
      format: 'esm',
      target: 'es2022',
      platform: 'node',
      write: false,
      jsx: 'automatic',
      jsxImportSource: '@r8s/core',
      external: [],
      absWorkingDir: EXAMPLES_DIR,
      nodePaths: [path.join(EXAMPLES_DIR, 'node_modules')],
      alias: {
        '@r8s/core': path.join(EXAMPLES_DIR, 'packages/core/src'),
        '@r8s/recipes': path.join(EXAMPLES_DIR, 'packages/recipes/src'),
        '@r8s/recipes/auth': path.join(EXAMPLES_DIR, 'packages/recipes/src/auth/index.ts'),
        '@r8s/crds': path.join(EXAMPLES_DIR, 'packages/crds/src'),
        '@r8s/crds/postgresql': path.join(
          EXAMPLES_DIR,
          'packages/crds/src/generated/postgresql.ts'
        ),
        '@r8s/crds/cert-manager': path.join(
          EXAMPLES_DIR,
          'packages/crds/src/generated/cert-manager.ts'
        ),
        '@r8s/crds/gateway': path.join(EXAMPLES_DIR, 'packages/crds/src/generated/gateway.ts'),
        '@r8s/crds/redis': path.join(EXAMPLES_DIR, 'packages/crds/src/generated/redis.ts'),
        '@r8s/crds/velero': path.join(EXAMPLES_DIR, 'packages/crds/src/generated/velero.ts'),
        '@r8s/crds/monitoring': path.join(
          EXAMPLES_DIR,
          'packages/crds/src/generated/monitoring.ts'
        ),
        '@r8s/crds/keycloak': path.join(EXAMPLES_DIR, 'packages/crds/src/generated/keycloak.ts'),
        '@r8s/crds/externaldns': path.join(
          EXAMPLES_DIR,
          'packages/crds/src/generated/externaldns.ts'
        ),
        '@r8s/crds/clickhouse': path.join(
          EXAMPLES_DIR,
          'packages/crds/src/generated/clickhouse.ts'
        ),
        '@r8s/crds/logging': path.join(EXAMPLES_DIR, 'packages/crds/src/generated/logging.ts'),
        '@r8s/crds/loki': path.join(EXAMPLES_DIR, 'packages/crds/src/generated/loki.ts'),
        '@r8s/k8s-types': path.join(EXAMPLES_DIR, 'packages/k8s-types/src'),
        '@r8s/element': path.join(EXAMPLES_DIR, 'packages/element/src'),
        '@r8s/grafana': path.join(EXAMPLES_DIR, 'packages/grafana/src'),
        '@r8s/rustfs': path.join(EXAMPLES_DIR, 'packages/rustfs/src'),
        '@r8s/superset': path.join(EXAMPLES_DIR, 'packages/superset/src'),
        '@r8s/wireguard': path.join(EXAMPLES_DIR, 'packages/wireguard/src'),
      },
    })

    const bundledCode = result.outputFiles[0].text
    const dataUrl = 'data:text/javascript;base64,' + Buffer.from(bundledCode).toString('base64')
    const mod = await import(dataUrl)
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

describe('Example Applications', () => {
  const examples = [
    { name: 'web-shop', path: 'web-shop/index.tsx', minResources: 15 },
    { name: 'monitoring-stack', path: 'monitoring-stack/index.tsx', minResources: 5 },
    { name: 'saas-platform', path: 'saas-platform/index.tsx', minResources: 25 },
  ]

  for (const example of examples) {
    describe(example.name, () => {
      it('should render successfully', async () => {
        const examplePath = path.join(EXAMPLES_DIR, 'examples', example.path)
        const result = await renderExample(examplePath)

        if (!result.success) {
          console.error(`Render error in ${example.name}:`, result.error)
        }

        expect(result.success).toBe(true)
        expect(result.resourceCount).toBeGreaterThanOrEqual(example.minResources)
      })
    })
  }
})
