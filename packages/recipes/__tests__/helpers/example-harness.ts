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
  '@r8s/core/defaults': path.join(ROOT, 'packages/core/src/defaults.ts'),
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
}

/**
 * App packages an example may import: package name → its entry file (tsc
 * needs the concrete file for NodeNext resolution; esbuild just gets the
 * src dir). Single source of truth for both alias maps — adding a package
 * is one edit, not two.
 */
const APP_PACKAGES: Record<string, string> = {
  'k8s-types': 'index.ts',
  element: 'index.ts',
  grafana: 'index.ts',
  rustfs: 'index.ts',
  superset: 'index.ts',
  wireguard: 'index.ts',
  n8n: 'index.tsx',
  nextcloud: 'index.tsx',
  outline: 'index.tsx',
  chromadb: 'index.tsx',
  supabase: 'index.tsx',
  odoo: 'index.tsx',
  'open-webui': 'index.tsx',
  librechat: 'index.tsx',
  eurooffice: 'index.tsx',
  paperclip: 'index.tsx',
  eneo: 'index.tsx',
  matrix: 'index.tsx',
  harbor: 'index.tsx',
  umami: 'index.tsx',
  forgejo: 'index.tsx',
  // Operator packages are imported from recipe/app sources (endpoint.tsx,
  // database.tsx, …) — without these they silently resolve to dist and the
  // bundle runs mixed source/dist module instances.
  'operator-cnpg': 'index.tsx',
  'operator-cert-manager': 'index.tsx',
  'operator-clickhouse': 'index.tsx',
  'operator-envoy-gateway': 'index.tsx',
  'operator-external-dns': 'index.tsx',
  'operator-keycloak': 'index.tsx',
  'operator-loki': 'index.tsx',
  'operator-logging': 'index.tsx',
  'operator-nginx-ingress': 'index.tsx',
  'operator-paperclip': 'index.tsx',
  'operator-prometheus': 'index.tsx',
  'operator-redis': 'index.tsx',
  'operator-vault-secrets': 'index.tsx',
  'operator-velero': 'index.tsx',
}

/** tsc paths variant of the same mapping (file targets, NodeNext resolution) */
const TSC_PATHS: Record<string, string[]> = {
  '@r8s/core': [path.join(ROOT, 'packages/core/src/index.ts')],
  '@r8s/core/defaults': [path.join(ROOT, 'packages/core/src/defaults.ts')],
  '@r8s/core/*': [path.join(ROOT, 'packages/core/src/*')],
  '@r8s/recipes': [path.join(ROOT, 'packages/recipes/src/index.ts')],
  '@r8s/recipes/auth': [path.join(ROOT, 'packages/recipes/src/auth/index.ts')],
  '@r8s/recipes/*': [path.join(ROOT, 'packages/recipes/src/*')],
  '@r8s/crds': [path.join(ROOT, 'packages/crds/src/index.ts')],
  '@r8s/crds/*': [path.join(ROOT, 'packages/crds/src/generated/*')],
}

for (const [name, entry] of Object.entries(APP_PACKAGES)) {
  ESBUILD_ALIASES[`@r8s/${name}`] = path.join(ROOT, 'packages', name, 'src')
  TSC_PATHS[`@r8s/${name}`] = [path.join(ROOT, 'packages', name, 'src', entry)]
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
