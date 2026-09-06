/**
 * Shared harness for validating TSX examples — docs-data examples
 * (examples-validation.test.ts) and README code blocks
 * (readme-examples.test.ts).
 *
 * compileTsx type-checks a snippet against repo sources; renderExample
 * bundles + evaluates + renders it and returns the rendered resources so
 * callers can run guardrails. All @r8s/* imports resolve to SOURCE (not
 * dist) so examples always exercise HEAD.
 */
import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { render } from '@r8s/core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, '../../../..')

/** Every @r8s package an example may import, as esbuild alias → source dir */
const ESBUILD_ALIASES: Record<string, string> = {
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
  '@r8s/n8n': path.join(ROOT, 'packages/n8n/src'),
  '@r8s/nextcloud': path.join(ROOT, 'packages/nextcloud/src'),
  '@r8s/outline': path.join(ROOT, 'packages/outline/src'),
  '@r8s/chromadb': path.join(ROOT, 'packages/chromadb/src'),
  '@r8s/supabase': path.join(ROOT, 'packages/supabase/src'),
  '@r8s/odoo': path.join(ROOT, 'packages/odoo/src'),
  '@r8s/open-webui': path.join(ROOT, 'packages/open-webui/src'),
  '@r8s/librechat': path.join(ROOT, 'packages/librechat/src'),
  '@r8s/eurooffice': path.join(ROOT, 'packages/eurooffice/src'),
  '@r8s/paperclip': path.join(ROOT, 'packages/paperclip/src'),
  '@r8s/eneo': path.join(ROOT, 'packages/eneo/src'),
  '@r8s/matrix': path.join(ROOT, 'packages/matrix/src'),
  '@r8s/harbor': path.join(ROOT, 'packages/harbor/src'),
  '@r8s/umami': path.join(ROOT, 'packages/umami/src'),
}

/** tsc paths variant of the same mapping (file targets, NodeNext resolution) */
const TSC_PATHS: Record<string, string[]> = {
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
  '@r8s/n8n': [path.join(ROOT, 'packages/n8n/src/index.tsx')],
  '@r8s/nextcloud': [path.join(ROOT, 'packages/nextcloud/src/index.tsx')],
  '@r8s/outline': [path.join(ROOT, 'packages/outline/src/index.tsx')],
  '@r8s/chromadb': [path.join(ROOT, 'packages/chromadb/src/index.tsx')],
  '@r8s/supabase': [path.join(ROOT, 'packages/supabase/src/index.tsx')],
  '@r8s/odoo': [path.join(ROOT, 'packages/odoo/src/index.tsx')],
  '@r8s/open-webui': [path.join(ROOT, 'packages/open-webui/src/index.tsx')],
  '@r8s/librechat': [path.join(ROOT, 'packages/librechat/src/index.tsx')],
  '@r8s/eurooffice': [path.join(ROOT, 'packages/eurooffice/src/index.tsx')],
  '@r8s/paperclip': [path.join(ROOT, 'packages/paperclip/src/index.tsx')],
  '@r8s/eneo': [path.join(ROOT, 'packages/eneo/src/index.tsx')],
  '@r8s/matrix': [path.join(ROOT, 'packages/matrix/src/index.tsx')],
  '@r8s/harbor': [path.join(ROOT, 'packages/harbor/src/index.tsx')],
  '@r8s/umami': [path.join(ROOT, 'packages/umami/src/index.tsx')],
}

/**
 * Compile a TSX code snippet and return diagnostics
 */
export function compileTsx(code: string): { success: boolean; errors: string[] } {
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
          paths: TSC_PATHS,
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
      paths: TSC_PATHS,
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

export interface RenderedExample {
  success: boolean
  error?: string
  resourceCount?: number
  /** Rendered resources — for guardrail checks by the caller */
  resources?: ReturnType<typeof render>['resources']
}

/**
 * Try to render a TSX example by evaluating it
 */
export async function renderExample(code: string): Promise<RenderedExample> {
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
      alias: ESBUILD_ALIASES,
    })

    const bundledCode = result.outputFiles[0].text
    const dataUrl = 'data:text/javascript;base64,' + Buffer.from(bundledCode).toString('base64')
    const mod = await import(dataUrl)
    // Handle both ESM default export and CJS module.exports
    let element = mod.default ?? mod
    // A default export may be a root component function — call it to get
    // its element (render() only understands elements)
    if (typeof element === 'function') {
      element = (element as () => unknown)()
    }

    if (!element) {
      return { success: false, error: 'No default export' }
    }

    const renderResult = render(element)
    return {
      success: true,
      resourceCount: renderResult.resources.length,
      resources: renderResult.resources,
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
