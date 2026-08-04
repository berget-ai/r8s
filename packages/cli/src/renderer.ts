import { render, r8sElement, fetchOperatorManifests } from '@r8s/core'
import * as yaml from 'js-yaml'
import { resolve, dirname, join } from 'path'
import { existsSync } from 'fs'

interface EntryModule {
  default: r8sElement | ((props: unknown) => r8sElement)
}

export interface RenderOptions {
  includeOperators?: boolean
  operatorsOnly?: boolean
}

/**
 * Find the monorepo root tsconfig (the one with `paths` for @r8s/*).
 * Passing it to esbuild makes module resolution use a single source of
 * truth — the workspace `src/` directories — so each module is bundled
 * exactly once. Without this, some imports resolve via node_modules to
 * `dist/` while others resolve to `src/`, producing two copies of every
 * component function and breaking `child.type === Component` identity
 * checks in the renderer.
 */
function findRootTsconfig(): string | undefined {
  let dir = process.cwd()
  for (let i = 0; i < 5; i++) {
    const candidate = join(dir, 'tsconfig.json')
    if (existsSync(candidate) && existsSync(join(dir, 'packages', 'core', 'src', 'index.ts'))) {
      return candidate
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return undefined
}

export async function bundleAndRender(entryFile: string) {
  const absolutePath = resolve(entryFile)

  let result
  try {
    const { build } = await import('esbuild')

    result = await build({
      entryPoints: [absolutePath],
      bundle: true,
      format: 'esm',
      target: 'es2022',
      platform: 'node',
      write: false,
      jsx: 'automatic',
      jsxImportSource: '@r8s/core',
      external: [],
      tsconfig: findRootTsconfig(),
    })
  } catch (error) {
    throw new Error(
      `Failed to bundle ${entryFile}: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  if (!result.outputFiles?.[0]?.text) {
    throw new Error(`Bundling produced no output for ${entryFile}`)
  }

  const bundledCode = result.outputFiles[0].text
  const dataUrl = 'data:text/javascript;base64,' + Buffer.from(bundledCode).toString('base64')

  let module: EntryModule
  try {
    module = (await import(dataUrl)) as EntryModule
  } catch (error) {
    throw new Error(
      `Failed to import bundled module: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  const Component = module.default

  if (!Component) {
    throw new Error(`Entry file ${entryFile} must export a default component or function`)
  }

  let element: r8sElement
  if (typeof Component === 'function') {
    element = Component({})
  } else {
    element = Component
  }

  return render(element)
}

export async function renderToYaml(
  entryFile: string,
  options: RenderOptions = {}
): Promise<string> {
  const renderResult = await bundleAndRender(entryFile)

  if (renderResult.resources.length === 0 && !options.operatorsOnly) {
    throw new Error(
      `No Kubernetes resources rendered from ${entryFile}. ` +
        `Ensure your component returns resources with 'apiVersion' and 'kind'.`
    )
  }

  const yamlDocs: string[] = []

  // Include operators if requested
  if ((options.includeOperators || options.operatorsOnly) && renderResult.operators.length > 0) {
    const operatorManifests = await fetchOperatorManifests(renderResult.operators)
    yamlDocs.push(...operatorManifests)
  }

  // Include resources unless operators-only
  if (!options.operatorsOnly) {
    const resourceDocs = renderResult.resources.map((resource) =>
      yaml.dump(resource, {
        sortKeys: false,
        noRefs: true,
        lineWidth: -1,
      })
    )
    yamlDocs.push(...resourceDocs)
  }

  if (yamlDocs.length === 0) {
    throw new Error(`No output generated from ${entryFile}.`)
  }

  return yamlDocs.join('---\n')
}

export async function renderToOperatorsYaml(entryFile: string): Promise<string> {
  return renderToYaml(entryFile, { operatorsOnly: true })
}
