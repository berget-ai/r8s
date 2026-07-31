/**
 * Generate docs data (packages.ts, recipes.ts) from source code.
 *
 * Usage:
 *   npx tsx docs/scripts/generate-docs.ts
 *
 * This extracts component props, JSDoc descriptions, and package metadata
 * from the TypeScript source files and writes them to docs/data/.
 * Code examples are formatted with prettier and rendered to YAML.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as os from 'os'
import * as ts from 'typescript'
import { render } from '@r8s/core'
import * as yaml from 'js-yaml'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const DOCS_DATA = path.join(ROOT, 'docs', 'data')

// ─── Code formatting & rendering ────────────────────────────────────────────

/** Format TSX code with prettier */
async function formatTsx(code: string): Promise<string> {
  try {
    const { format } = await import('prettier')
    return await format(code, {
      parser: 'tsx',
      semi: true,
      singleQuote: true,
      trailingComma: 'all' as const,
      printWidth: 80,
      tabWidth: 2,
    })
  } catch {
    return code // fallback to unformatted
  }
}

/**
 * Format generated output files with the repo's own prettier config.
 * Keeps regenerated files diff-free against `npm run format:check` in CI.
 */
async function formatOutput(code: string): Promise<string> {
  try {
    const { format, resolveConfig } = await import('prettier')
    const config = (await resolveConfig(path.join(ROOT, '.prettierrc'))) ?? {}
    return await format(code, { ...config, parser: 'typescript' })
  } catch {
    return code // fallback to unformatted
  }
}

/** Render a TSX code snippet to YAML using r8s render() */
async function renderToYaml(code: string): Promise<string | null> {
  let tmpDir: string | null = null
  try {
    // Write to a temp dir inside the project so node_modules resolves
    tmpDir = fs.mkdtempSync(path.join(ROOT, '.tmp-docs-'))
    const tmpFile = path.join(tmpDir, 'example.tsx')
    fs.writeFileSync(tmpFile, code, 'utf-8')
    // Write a tsconfig so esbuild picks up JSX settings and path aliases
    fs.writeFileSync(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          jsx: 'react-jsx',
          jsxImportSource: '@r8s/core',
          paths: {
            '@r8s/core': [path.join(ROOT, 'packages/core/src/index.ts')],
            '@r8s/core/*': [path.join(ROOT, 'packages/core/src/*')],
            '@r8s/recipes': [path.join(ROOT, 'packages/recipes/src/index.ts')],
            '@r8s/crds': [path.join(ROOT, 'packages/crds/src/index.ts')],
            '@r8s/crds/*': [path.join(ROOT, 'packages/crds/src/generated/*')],
            '@r8s/k8s-types': [path.join(ROOT, 'packages/k8s-types/src/index.ts')],
            '@r8s/element': [path.join(ROOT, 'packages/element/src/index.ts')],
            '@r8s/grafana': [path.join(ROOT, 'packages/grafana/src/index.ts')],
            '@r8s/rustfs': [path.join(ROOT, 'packages/rustfs/src/index.ts')],
            '@r8s/superset': [path.join(ROOT, 'packages/superset/src/index.ts')],
            '@r8s/wireguard': [path.join(ROOT, 'packages/wireguard/src/index.ts')],
          },
        },
      }),
      'utf-8'
    )

    const { build } = await import('esbuild')
    const result = await build({
      entryPoints: [tmpFile],
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
    })

    const bundledCode = result.outputFiles[0].text
    const dataUrl = 'data:text/javascript;base64,' + Buffer.from(bundledCode).toString('base64')
    const mod = await import(dataUrl)
    const element = mod.default

    if (!element) return null

    const renderResult = render(element)
    if (renderResult.resources.length === 0) return null

    const yamlDocs = renderResult.resources.map((resource: unknown) =>
      yaml.dump(resource, { sortKeys: false, noRefs: true, lineWidth: -1 })
    )

    return yamlDocs.join('---\n')
  } catch {
    return null
  } finally {
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComponentProp {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

interface ComponentDoc {
  name: string
  description: string
  props: ComponentProp[]
  /** JSDoc @example blocks with formatted TSX and rendered YAML */
  examples: { tsx: string; yaml: string | null }[]
}

interface PackageDoc {
  slug: string
  name: string
  title: string
  description: string
  category: string
  operator?: string
  operatorVersion?: string
  keywords: string[]
  components: ComponentDoc[]
}

// ─── TypeScript extraction ───────────────────────────────────────────────────

function parseSourceFile(filePath: string): ts.SourceFile {
  const content = fs.readFileSync(filePath, 'utf-8')
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true)
}

function getJSDoc(node: ts.Node): string {
  const jsDoc = (ts as any).getJSDocCommentsAndTags?.(node) ?? []
  for (const doc of jsDoc) {
    if (ts.isJSDoc(doc)) {
      return (
        doc.comment
          ?.toString()
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => !line.startsWith('@'))
          .join(' ')
          .trim() ?? ''
      )
    }
  }
  // Fallback: check for JSDoc via symbol
  const sym = (node as any).jsDoc?.[0]
  if (sym?.comment) {
    return sym.comment
      .toString()
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => !line.startsWith('@'))
      .join(' ')
      .trim()
  }
  return ''
}

function getJSDocTag(node: ts.Node, tagName: string): string | null {
  const jsDoc = (node as any).jsDoc?.[0]
  if (jsDoc?.tags) {
    for (const tag of jsDoc.tags) {
      if (tag.tagName?.text === tagName) {
        // JSDoc @tag value is the first line/word after the tag name
        const comment = tag.comment?.toString().trim() ?? ''
        // Take only the first line (the tag value)
        return comment.split('\n')[0].trim()
      }
    }
  }
  return null
}

function getJSDocExamples(node: ts.Node): string[] {
  const examples: string[] = []
  // Use getJSDocCommentsAndTags to find all JSDoc blocks (handles multiple blocks)
  const jsDocs = (ts as any).getJSDocCommentsAndTags?.(node) ?? []
  for (const doc of jsDocs) {
    if (ts.isJSDoc(doc) && doc.tags) {
      for (const tag of doc.tags) {
        if (tag.tagName?.text === 'example') {
          examples.push(tag.comment?.toString() ?? '')
        }
      }
    }
  }
  // Fallback: check jsDoc property (all blocks)
  if (examples.length === 0) {
    const allJsDoc = (node as any).jsDoc ?? []
    for (const doc of allJsDoc) {
      if (doc?.tags) {
        for (const tag of doc.tags) {
          if (tag.tagName?.text === 'example') {
            examples.push(tag.comment?.toString() ?? '')
          }
        }
      }
    }
  }
  return examples.filter(Boolean)
}

function getPropDescription(prop: ts.PropertySignature): string {
  // Check for JSDoc on the property
  const jsDoc = (prop as any).jsDoc?.[0]
  if (jsDoc?.comment) {
    return jsDoc.comment.toString().trim()
  }
  // Check for inline comment
  const fullText = prop.getFullText()
  const commentMatch = fullText.match(/\/\*\*\s*(.*?)\s*\*\//)
  if (commentMatch) {
    return commentMatch[1].trim()
  }
  return ''
}

function typeNodeToString(typeNode: ts.TypeNode | undefined): string {
  if (!typeNode) return 'unknown'

  // Simple type reference
  if (ts.isTypeReferenceNode(typeNode)) {
    return typeNode.typeName.getText()
  }

  // Array type
  if (ts.isArrayTypeNode(typeNode)) {
    return `${typeNodeToString(typeNode.elementType)}[]`
  }

  // Union type
  if (ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.map((t) => typeNodeToString(t)).join(' | ')
  }

  // Literal types
  if (ts.isLiteralTypeNode(typeNode)) {
    return typeNode.literal.getText()
  }

  // Inline object type
  if (ts.isTypeLiteralNode(typeNode)) {
    const members = typeNode.members
      .map((m) => {
        if (ts.isPropertySignature(m)) {
          return `${m.name?.getText()}${m.questionToken ? '?' : ''}: ${typeNodeToString(m.type)}`
        }
        return ''
      })
      .filter(Boolean)
    return `{ ${members.join(', ')} }`
  }

  // Keyword types (string, number, boolean, etc.)
  if (ts.isTypeNode(typeNode)) {
    return typeNode.getText()
  }

  return typeNode.getText()
}

function extractProps(interfaceDecl: ts.InterfaceDeclaration): ComponentProp[] {
  const props: ComponentProp[] = []

  for (const member of interfaceDecl.members) {
    if (!ts.isPropertySignature(member)) continue
    if (!member.name) continue

    const name = member.name.getText()
    const type = typeNodeToString(member.type)
    const required = !member.questionToken
    const description = getPropDescription(member)

    // Extract default from JSDoc @default tag
    let defaultVal: string | undefined
    const jsDoc = (member as any).jsDoc?.[0]
    if (jsDoc?.tags) {
      for (const tag of jsDoc.tags) {
        if (tag.tagName?.text === 'default') {
          defaultVal = tag.comment?.toString().trim()
        }
      }
    }

    props.push({ name, type, required, default: defaultVal, description })
  }

  return props
}

async function extractComponents(
  sourceFile: ts.SourceFile,
  sourcePath: string
): Promise<ComponentDoc[]> {
  const components: ComponentDoc[] = []
  const seenNames = new Set<string>()

  function visit(node: ts.Node) {
    // Find export function declarations
    if (ts.isFunctionDeclaration(node)) {
      const name = node.name?.text
      if (!name) return
      if (!hasExportModifier(node)) return

      // Only include PascalCase functions (components)
      if (name[0] !== name[0].toUpperCase()) return

      // Generated CRD components have a "Component" suffix (e.g. ClusterComponent).
      // Strip it for display so the docs show "Cluster" not "ClusterComponent".
      const displayName = name.replace(/Component$/, '')

      const description = getJSDoc(node)
      const rawExamples = getJSDocExamples(node)

      // If already added via interface, update description and examples
      const existing = components.find((c) => c.name === displayName)
      if (existing) {
        if (description) existing.description = description
        if (rawExamples.length > 0) existing._rawExamples = rawExamples
        return
      }

      if (seenNames.has(displayName)) return
      seenNames.add(displayName)
      components.push({
        name: displayName,
        description,
        props: [],
        examples: [],
        _rawExamples: rawExamples,
      })
    }

    // Find interface declarations with "Props" suffix
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
      const componentName = node.name.text.replace('Props', '')
      const props = extractProps(node)

      // Find matching component from the function declaration
      const existing = components.find((c) => c.name === componentName)
      if (existing) {
        existing.props = props
      } else if (!seenNames.has(componentName)) {
        seenNames.add(componentName)
        const description = getJSDoc(node)
        components.push({ name: componentName, description, props, examples: [], _rawExamples: [] })
      }
    }
  }

  sourceFile.forEachChild(visit)

  // Format examples and render YAML for each component
  for (const comp of components) {
    const rawExamples = (comp as any)._rawExamples ?? []
    comp.examples = []
    for (const raw of rawExamples) {
      // Split multiple examples separated by blank-line + comment
      // Each example starts with a // comment followed by JSX
      const lines = raw.split('\n')
      const exampleBlocks: string[] = []
      let currentBlock: string[] = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === '' && currentBlock.length > 0) {
          // Blank line — save current block if it has JSX
          if (currentBlock.some((l) => l.includes('<'))) {
            exampleBlocks.push(currentBlock.join('\n'))
          }
          currentBlock = []
        } else {
          currentBlock.push(line)
        }
      }
      if (currentBlock.length > 0 && currentBlock.some((l) => l.includes('<'))) {
        exampleBlocks.push(currentBlock.join('\n'))
      }

      // If no blocks found (single example), use the whole raw
      if (exampleBlocks.length === 0 && raw.includes('<')) {
        exampleBlocks.push(raw)
      }

      for (const block of exampleBlocks) {
        // Extract just the JSX element (skip comment lines)
        const jsxLines = block.split('\n').filter((l) => {
          const t = l.trim()
          return t && !t.startsWith('//') && !t.startsWith('*')
        })
        const code = jsxLines.join('\n').trim()
        if (!code || !code.startsWith('<')) continue

        // Detect which imports are needed based on component names
        const imports: string[] = []
        if (code.match(/<(App|Database|WebService|Endpoint|Platform|Cluster|Ingress)\b/)) {
          imports.push(
            "import { App, Database, WebService, Endpoint, Platform, Cluster, Ingress } from '@r8s/recipes';"
          )
        }
        if (code.match(/<(Gateway|HTTPRoute|EnvoyProxy)\b/)) {
          imports.push("import { Gateway, HTTPRoute, EnvoyProxy } from '@r8s/envoy';")
        }
        if (code.match(/<(LetsEncryptIssuer|ManagedCertificate)\b/)) {
          imports.push("import { LetsEncryptIssuer, ManagedCertificate } from '@r8s/cert-manager';")
        }
        if (code.match(/<(ServiceMonitor|PrometheusRule|PodMonitor)\b/)) {
          imports.push(
            "import { ServiceMonitor, PrometheusRule, PodMonitor } from '@r8s/prometheus';"
          )
        }
        if (code.match(/<(Logging|Flow|Output)\b/)) {
          imports.push("import { Logging, Flow, Output } from '@r8s/logging-operator';")
        }
        if (code.match(/<(LokiStack|AlertingRule)\b/)) {
          imports.push("import { LokiStack, AlertingRule } from '@r8s/loki';")
        }
        if (code.match(/<(RedisCluster|RedisReplication)\b/)) {
          imports.push("import { RedisCluster, RedisReplication } from '@r8s/redis';")
        }
        if (code.match(/<(ClickHouseCluster)\b/)) {
          imports.push("import { ClickHouseCluster } from '@r8s/clickhouse';")
        }
        if (code.match(/<(KeycloakInstance|KeycloakRealm)\b/)) {
          imports.push("import { KeycloakInstance, KeycloakRealm } from '@r8s/keycloak';")
        }
        if (
          code.match(
            /<(VaultConnectionConfig|VaultKubernetesAuth|VaultDatabaseSecret|VaultKVSecret)\b/
          )
        ) {
          imports.push(
            "import { VaultConnectionConfig, VaultKubernetesAuth, VaultDatabaseSecret, VaultKVSecret } from '@r8s/openbao';"
          )
        }
        if (code.match(/<(ExternalDNSRecord)\b/)) {
          imports.push("import { ExternalDNSRecord } from '@r8s/external-dns';")
        }
        if (code.match(/<(Element)\b/)) {
          imports.push("import { Element } from '@r8s/element';")
        }
        if (code.match(/<(Grafana)\b/)) {
          imports.push("import { Grafana } from '@r8s/grafana';")
        }
        if (code.match(/<(RustFS)\b/)) {
          imports.push("import { RustFS } from '@r8s/rustfs';")
        }
        if (code.match(/<(Superset)\b/)) {
          imports.push("import { Superset } from '@r8s/superset';")
        }
        if (code.match(/<(Backup|Schedule|BackupStorageLocation)\b/)) {
          imports.push("import { Backup, Schedule, BackupStorageLocation } from '@r8s/velero';")
        }
        if (code.match(/<(WireGuard)\b/)) {
          imports.push("import { WireGuard } from '@r8s/wireguard';")
        }
        if (code.match(/<(EnvoyIngress)\b/)) {
          imports.push("import { EnvoyIngress } from '@r8s/recipes';")
        }
        if (code.match(/<RoutingContext\.Provider\b/)) {
          imports.push("import { RoutingContext } from '@r8s/core/defaults';")
        }

        // Operator factories used in examples (e.g. <Platform operators={[...]}>)
        if (code.match(/\b(cnpgOperator|nginxIngressOperator)\s*\(/)) {
          imports.push("import { cnpgOperator, nginxIngressOperator } from '@r8s/recipes';")
        }
        if (code.match(/\bcertManagerOperator\s*\(/)) {
          imports.push("import { certManagerOperator } from '@r8s/cert-manager';")
        }

        // Wrap in a default export with imports
        const fullCode = `${imports.join('\n')}\n\nexport default ${code};`
        const formattedTsx = await formatTsx(fullCode)
        const yamlOutput = await renderToYaml(fullCode)
        comp.examples.push({ tsx: formattedTsx.trim(), yaml: yamlOutput })
      }
    }
    delete (comp as any)._rawExamples
  }

  return components
}

function hasExportModifier(node: ts.Node): boolean {
  const modifiers = (node as any).modifiers
  if (!modifiers) return false
  return modifiers.some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword)
}

function extractOperatorInfo(
  sourceFile: ts.SourceFile,
  sourcePath: string
): { name: string; version: string } | null {
  function visit(node: ts.Node): { name: string; version: string } | null {
    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const decl of node.declarationList.declarations) {
        const name = decl.name.getText()
        if (name.endsWith('Operator') && decl.initializer && ts.isArrowFunction(decl.initializer)) {
          // Extract default version from parameter
          if (decl.initializer.parameters.length > 0) {
            const param = decl.initializer.parameters[0]
            if (param.initializer) {
              const version = param.initializer.getText().replace(/['"]/g, '')
              return { name: name.replace('Operator', ''), version }
            }
          }
          return { name: name.replace('Operator', ''), version: '' }
        }
      }
    }
    return null
  }

  let result: { name: string; version: string } | null = null
  sourceFile.forEachChild((node) => {
    const found = visit(node)
    if (found) result = found
  })
  return result
}

// ─── Generate packages.ts ────────────────────────────────────────────────────

function readPackageJson(dir: string): {
  name: string
  description: string
  keywords: string[]
  category: string
} {
  const pkgPath = path.join(ROOT, 'packages', dir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  return {
    name: pkg.name,
    description: pkg.description || '',
    keywords: pkg.keywords || [],
    category: pkg.r8s?.category || 'Uncategorized',
  }
}

async function generatePackages(): Promise<PackageDoc[]> {
  const packages: PackageDoc[] = []

  // Read operator metadata from the generated operators.ts
  const operatorsTsPath = path.join(ROOT, 'packages/crds/src/generated/operators.ts')
  const operatorsSource = parseSourceFile(operatorsTsPath)
  const operatorMeta = extractOperatorMetadata(operatorsSource)

  // Read examples from packages/crds/examples/index.tsx
  const examplesPath = path.join(ROOT, 'packages/crds/examples/index.tsx')
  const examples = fs.existsSync(examplesPath)
    ? extractExamples(examplesPath)
    : new Map<string, { name: string; code: string }[]>()

  // Scan generated group files (skip index.ts and operators.ts)
  const generatedDir = path.join(ROOT, 'packages/crds/src/generated')
  const groupFiles = fs
    .readdirSync(generatedDir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'operators.ts')

  for (const file of groupFiles) {
    const groupKey = file.replace('.ts', '')
    const srcPath = path.join(generatedDir, file)
    const sourceFile = parseSourceFile(srcPath)
    const components = await extractComponents(sourceFile, srcPath)

    if (components.length === 0) {
      console.warn(`No components found in generated group "${groupKey}", skipping`)
      continue
    }

    // Find operator metadata by matching CRD group to operator entry
    const meta = findOperatorForGroup(groupKey, operatorMeta)

    // Find examples for this group — try both the file key (cert-manager)
    // and the camelCase variant (certManager) used in examples/index.tsx
    const camelKey = groupKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const groupExamples = examples.get(groupKey) ?? examples.get(camelKey) ?? []

    // Attach examples to matching components
    for (const comp of components) {
      const compExamples = groupExamples.filter(
        (e) => e.code.includes(`${comp.name}Component`) || e.code.includes(`<${comp.name}`)
      )
      if (compExamples.length > 0) {
        comp._rawExamples = compExamples.map((e) => e.code)
      }
    }

    // Render CRD examples to YAML — the example strings are complete TSX
    // with imports, so we render them directly rather than going through
    // the JSDoc example parser in extractComponents.
    for (const comp of components) {
      const rawExamples = (comp as any)._rawExamples ?? []
      if (rawExamples.length === 0) continue
      comp.examples = []
      for (const raw of rawExamples) {
        const formattedTsx = await formatTsx(raw)
        // renderToYaml expects `export default <element>`.
        // The example code has imports + a JSX expression; prepend
        // `export default` to the first line that starts with `<` or `<>`.
        const renderable = raw.includes('export default')
          ? raw
          : raw.replace(/^([<>(])/m, 'export default $1')
        const yamlOutput = await renderToYaml(renderable)
        comp.examples.push({ tsx: formattedTsx, yaml: yamlOutput })
      }
      delete (comp as any)._rawExamples
    }

    packages.push({
      slug: groupKey,
      name: `@r8s/crds/${groupKey}`,
      title: groupKey,
      description: meta?.description ?? `${groupKey} CRD components`,
      category: meta?.category ?? 'Uncategorized',
      operator: meta?.name,
      operatorVersion: meta?.version,
      keywords: [groupKey],
      components,
    })
  }

  // Also scan app packages (element, grafana, rustfs, superset, wireguard)
  const appPackages = ['element', 'grafana', 'rustfs', 'superset', 'wireguard']
  for (const dir of appPackages) {
    const srcPath = path.join(ROOT, 'packages', dir, 'src', 'index.ts')
    if (!fs.existsSync(srcPath)) continue
    const sourceFile = parseSourceFile(srcPath)
    const components = await extractComponents(sourceFile, srcPath)
    const pkg = readPackageJson(dir)

    if (components.length === 0) continue

    packages.push({
      slug: dir,
      name: pkg.name,
      title: pkg.name.replace('@r8s/', ''),
      description: pkg.description,
      category: pkg.category,
      keywords: pkg.keywords,
      components,
    })
  }

  return packages
}

/** Extract operator metadata array from the generated operators.ts file. */
function extractOperatorMetadata(sourceFile: ts.SourceFile): Array<{
  name: string
  description: string
  category: string
  version: string
  crds: string[]
}> {
  const result: Array<{
    name: string
    description: string
    category: string
    version: string
    crds: string[]
  }> = []

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === 'operatorMetadata') {
          if (decl.initializer && ts.isArrayLiteralExpression(decl.initializer)) {
            for (const elem of decl.initializer.elements) {
              if (ts.isObjectLiteralExpression(elem)) {
                const obj: Record<string, unknown> = {}
                for (const prop of elem.properties) {
                  if (ts.isPropertyAssignment(prop) && prop.name) {
                    const key = (prop.name as ts.Identifier).text
                    const val = prop.initializer
                    if (ts.isStringLiteral(val)) {
                      obj[key] = val.text
                    } else if (ts.isArrayLiteralExpression(val)) {
                      obj[key] = val.elements.filter(ts.isStringLiteral).map((e) => e.text)
                    }
                  }
                }
                if (obj.name) {
                  result.push({
                    name: obj.name as string,
                    description: (obj.description as string) ?? '',
                    category: (obj.category as string) ?? 'Uncategorized',
                    version: (obj.version as string) ?? '',
                    crds: (obj.crds as string[]) ?? [],
                  })
                }
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return result
}

/** Match a generated group file key to its operator by CRD group prefix. */
function findOperatorForGroup(
  groupKey: string,
  meta: Array<{
    name: string
    crds: string[]
    description: string
    category: string
    version: string
  }>
): { name: string; description: string; category: string; version: string } | undefined {
  // The group key matches the first label of the CRD's API group.
  // e.g. "postgresql" → crds like "clusters.postgresql.cnpg.io"
  for (const op of meta) {
    if (op.crds.some((crd) => crd.includes(`.${groupKey}.`))) {
      return op
    }
  }
  return undefined
}

/** Extract named example objects from the examples file. */
function extractExamples(examplesPath: string): Map<string, { name: string; code: string }[]> {
  const result = new Map<string, { name: string; code: string }[]>()
  const sourceFile = parseSourceFile(examplesPath)

  function visit(node: ts.Node) {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          const varName = decl.name.text
          // Extract group key from variable name: "postgresqlExamples" → "postgresql"
          const groupKey = varName.replace(/Examples$/, '')
          if (ts.isObjectLiteralExpression(decl.initializer)) {
            const examples: { name: string; code: string }[] = []
            for (const prop of decl.initializer.properties) {
              if (ts.isPropertyAssignment(prop) && prop.name) {
                const name = (prop.name as ts.Identifier).text
                const code = prop.initializer
                if (ts.isStringLiteral(code) || ts.isNoSubstitutionTemplateLiteral(code)) {
                  examples.push({ name, code: code.text })
                }
              }
            }
            if (examples.length > 0) {
              result.set(groupKey, examples)
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return result
}

// ─── Generate recipes.ts ────────────────────────────────────────────────────

async function generateRecipes(): Promise<PackageDoc[]> {
  const recipes: PackageDoc[] = []
  const seenSlugs = new Set<string>()

  // Get all .tsx files in recipes/src (excluding index, operators, legacy)
  const recipeFiles = fs
    .readdirSync(path.join(ROOT, 'packages', 'recipes', 'src'))
    .filter(
      (f) =>
        f.endsWith('.tsx') &&
        f !== 'index.ts' &&
        f !== 'operators.ts' &&
        f !== 'ingress-legacy.tsx' &&
        f !== 'postgres.tsx'
    )

  for (const file of recipeFiles) {
    const filePath = path.join(ROOT, 'packages', 'recipes', 'src', file)
    const fileSource = parseSourceFile(filePath)
    const fileComponents = await extractComponents(fileSource, filePath)

    for (const comp of fileComponents) {
      // Skip non-recipe components (Ingress is a low-level component, not a recipe)
      if (comp.name === 'Postgres' || comp.name === 'CustomIngress' || comp.name === 'Ingress')
        continue

      const slug = comp.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')

      // Skip duplicates (component may appear as both Function and Interface)
      if (seenSlugs.has(slug)) continue
      seenSlugs.add(slug)

      // Extract @title and @category from the function's JSDoc
      let title: string | null = null
      let category: string | null = null
      let description: string | null = null

      function visit(node: ts.Node) {
        if (ts.isFunctionDeclaration(node) && node.name?.text === comp.name) {
          title = getJSDocTag(node, 'title')
          category = getJSDocTag(node, 'category')
          description = getJSDoc(node)
        }
      }
      fileSource.forEachChild(visit)

      recipes.push({
        slug,
        name: `@r8s/recipes`,
        title: title ?? comp.name,
        description: description ?? comp.description,
        category: category ?? 'Recipes',
        keywords: [],
        components: [comp],
      })
    }
  }

  return recipes
}

// ─── Write output ───────────────────────────────────────────────────────────

function escapeStr(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatProp(prop: ComponentProp): string {
  const parts = [
    `      { name: "${escapeStr(prop.name)}", type: "${escapeStr(prop.type)}", required: ${prop.required}`,
    prop.default ? `, default: "${escapeStr(prop.default)}"` : '',
    `, description: "${escapeStr(prop.description)}" },`,
  ]
  return parts.join('')
}

async function writePackages(packages: PackageDoc[]) {
  const lines: string[] = [
    '// AUTO-GENERATED by docs/scripts/generate-docs.ts',
    '// Do not edit manually — run: npx tsx docs/scripts/generate-docs.ts',
    '',
    'export interface ComponentProp {',
    '  name: string;',
    '  type: string;',
    '  required: boolean;',
    '  default?: string;',
    '  description: string;',
    '}',
    '',
    'export interface ComponentDoc {',
    '  name: string;',
    '  description: string;',
    '  props: ComponentProp[];',
    '  examples: { tsx: string; yaml: string | null }[];',
    '}',
    '',
    'export interface Package {',
    '  slug: string;',
    '  name: string;',
    '  title: string;',
    '  description: string;',
    '  category: string;',
    '  operator?: string;',
    '  operatorVersion?: string;',
    '  keywords: string[];',
    '  components: ComponentDoc[];',
    '}',
    '',
    'export const packages: Package[] = [',
  ]

  for (const pkg of packages) {
    lines.push('  {')
    lines.push(`    slug: "${escapeStr(pkg.slug)}",`)
    lines.push(`    name: "${escapeStr(pkg.name)}",`)
    lines.push(`    title: "${escapeStr(pkg.title)}",`)
    lines.push(`    description: "${escapeStr(pkg.description)}",`)
    lines.push(`    category: "${escapeStr(pkg.category)}",`)
    if (pkg.operator) lines.push(`    operator: "${pkg.operator}",`)
    if (pkg.operatorVersion) lines.push(`    operatorVersion: "${pkg.operatorVersion}",`)
    lines.push(`    keywords: [${pkg.keywords.map((k) => `"${k}"`).join(', ')}],`)
    lines.push('    components: [')
    for (const comp of pkg.components) {
      lines.push('      {')
      lines.push(`        name: "${comp.name}",`)
      lines.push(`        description: "${escapeStr(comp.description)}",`)
      lines.push('        props: [')
      for (const prop of comp.props) {
        lines.push(formatProp(prop))
      }
      lines.push('        ],')
      lines.push(`        examples: ${JSON.stringify(comp.examples)},`)
      lines.push('      },')
    }
    lines.push('    ],')
    lines.push('  },')
  }

  lines.push('];')
  lines.push('')
  lines.push('export function getPackageCategories(): string[] {')
  lines.push('  return [...new Set(packages.map(p => p.category))].sort();')
  lines.push('}')
  lines.push('')
  lines.push('export function getPackageBySlug(slug: string): Package | undefined {')
  lines.push('  return packages.find(p => p.slug === slug);')
  lines.push('}')
  lines.push('')

  const output = await formatOutput(lines.join('\n'))
  const outPath = path.join(DOCS_DATA, 'packages.ts')
  fs.writeFileSync(outPath, output)
  console.log(
    `✅ Generated ${outPath} (${packages.length} packages, ${packages.reduce((sum, p) => sum + p.components.length, 0)} components)`
  )
}

async function writeRecipes(recipes: PackageDoc[]) {
  const lines: string[] = [
    '// AUTO-GENERATED by docs/scripts/generate-docs.ts',
    '// Do not edit manually — run: npx tsx docs/scripts/generate-docs.ts',
    '',
    'export interface ComponentProp {',
    '  name: string;',
    '  type: string;',
    '  required: boolean;',
    '  default?: string;',
    '  description: string;',
    '}',
    '',
    'export interface ComponentDoc {',
    '  name: string;',
    '  description: string;',
    '  props: ComponentProp[];',
    '  examples: { tsx: string; yaml: string | null }[];',
    '}',
    '',
    'export interface Recipe {',
    '  slug: string;',
    '  title: string;',
    '  description: string;',
    '  category: string;',
    '  keywords: string[];',
    '  component: ComponentDoc;',
    '}',
    '',
    'export const recipes: Recipe[] = [',
  ]

  for (const recipe of recipes) {
    const comp = recipe.components[0]
    lines.push('  {')
    lines.push(`    slug: "${escapeStr(recipe.slug)}",`)
    lines.push(`    title: "${escapeStr(recipe.title)}",`)
    lines.push(`    description: "${escapeStr(recipe.description)}",`)
    lines.push(`    category: "${escapeStr(recipe.category)}",`)
    lines.push(`    keywords: [${recipe.keywords.map((k) => `"${k}"`).join(', ')}],`)
    lines.push('    component: {')
    lines.push(`      name: "${comp.name}",`)
    lines.push(`      description: "${escapeStr(comp.description)}",`)
    lines.push('      props: [')
    for (const prop of comp.props) {
      lines.push(formatProp(prop))
    }
    lines.push('      ],')
    lines.push(`      examples: ${JSON.stringify(comp.examples)},`)
    lines.push('    },')
    lines.push('  },')
  }

  lines.push('];')
  lines.push('')
  lines.push('export function getRecipeBySlug(slug: string): Recipe | undefined {')
  lines.push('  return recipes.find(r => r.slug === slug);')
  lines.push('}')
  lines.push('')

  const output = await formatOutput(lines.join('\n'))
  const outPath = path.join(DOCS_DATA, 'recipes.ts')
  fs.writeFileSync(outPath, output)
  console.log(`✅ Generated ${outPath} (${recipes.length} recipes)`)
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Generating docs from source code...\n')

  const pkgs = await generatePackages()
  await writePackages(pkgs)

  const recipes = await generateRecipes()
  await writeRecipes(recipes)

  console.log('\n✅ Done!')
}

main()
