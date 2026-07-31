/**
 * CRD → TypeScript generator.
 *
 * Reads vendored CRD YAML files from crds/, extracts the OpenAPI v3
 * schema for each served version, and emits:
 *   - src/generated/<group>.ts — one file per API group containing
 *       * a 1:1 TypeScript interface per Kind (apiVersion/kind literals,
 *         full metadata, and a spec typed from the CRD schema)
 *       * a component per Kind: ({ metadata, spec }) => CR object
 *
 * The generated code is never edited by hand. Re-run after bumping a
 * vendored CRD:  npm run generate -w @r8s/crds
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const crdsDir = join(root, 'crds')
const outDir = join(root, 'src', 'generated')

// ---------------------------------------------------------------------------
// CRD discovery
// ---------------------------------------------------------------------------

interface CrdDoc {
  spec: {
    group: string
    names: { kind: string; plural: string }
    versions: Array<{
      name: string
      served: boolean
      storage: boolean
      schema?: { openAPIV3Schema?: JsonSchema }
    }>
  }
}

interface JsonSchema {
  type?: string
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  required?: string[]
  description?: string
  format?: string
  enum?: unknown[]
  additionalProperties?: boolean | JsonSchema
  'x-kubernetes-preserve-unknown-fields'?: boolean
  'x-kubernetes-int-or-string'?: boolean
  nullable?: boolean
}

function loadCrds(): Array<{ file: string; doc: CrdDoc }> {
  const out: Array<{ file: string; doc: CrdDoc }> = []
  for (const file of readdirSync(crdsDir)) {
    if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue
    const text = readFileSync(join(crdsDir, file), 'utf8')
    for (const raw of yaml.loadAll(text)) {
      const doc = raw as CrdDoc
      if (doc?.spec?.names?.kind && doc?.spec?.group) out.push({ file, doc })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Schema → TypeScript type expression
// ---------------------------------------------------------------------------

/** Schemas that map to a free-form bag rather than a generated interface. */
function isFreeform(s: JsonSchema): boolean {
  return (
    s['x-kubernetes-preserve-unknown-fields'] === true ||
    (s.type === 'object' && !s.properties && s.additionalProperties !== false)
  )
}

function tsType(
  schema: JsonSchema,
  name: string,
  emit: (n: string, s: JsonSchema) => string
): string {
  if (schema['x-kubernetes-int-or-string']) return 'number | string'
  if (isFreeform(schema)) return 'Record<string, unknown>'

  switch (schema.type) {
    case 'string':
      if (schema.format === 'date-time') return 'string'
      return 'string'
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'array':
      return schema.items ? `${tsType(schema.items, name + 'Item', emit)}[]` : 'unknown[]'
    case 'object': {
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        return `Record<string, ${tsType(schema.additionalProperties, name + 'Value', emit)}>`
      }
      if (schema.properties) return emit(name, schema)
      return 'Record<string, unknown>'
    }
    default:
      return 'unknown'
  }
}

// ---------------------------------------------------------------------------
// Interface emission
// ---------------------------------------------------------------------------

function pascal(s: string): string {
  return s
    .split(/[-_.\s/]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

class Emitter {
  interfaces: string[] = []
  /** Maps a requested base name to the actual interface name (deduplicated). */
  private names = new Map<string, string>()
  /** Schemas already emitted under a given interface name, to avoid duplicates. */
  private emitted = new Map<string, string>()

  /** Reserve a name (a CRD Kind) so nested interfaces never collide with it. */
  reserve(name: string): void {
    this.emitted.set(name, '__reserved__')
  }

  /**
   * Emit (once) an interface for an object schema; returns its name.
   * Names are derived from the leaf property name, deduplicated with a
   * numeric suffix on collision — keeps names short and readable.
   */
  emit(name: string, schema: JsonSchema): string {
    const base = pascal(name)
    const signature = JSON.stringify(
      schema.properties ? Object.keys(schema.properties).sort() : schema
    )

    // Reuse an existing interface if the same name maps to the same shape.
    const existing = this.emitted.get(base)
    if (existing === signature) return base

    // Find a free name: base, base2, base3, ...
    let iface = base
    let n = 2
    while (this.emitted.has(iface) && this.emitted.get(iface) !== signature) {
      iface = `${base}${n++}`
    }
    if (this.emitted.get(iface) === signature) return iface
    this.emitted.set(iface, signature)

    const lines: string[] = []
    for (const [prop, propSchema] of Object.entries(schema.properties ?? {})) {
      const optional = schema.required?.includes(prop) ? '' : '?'
      const doc = propSchema.description
        ? `  /** ${propSchema.description.replace(/\*\//g, '*\\/').replace(/\n+/g, ' ')} */\n`
        : ''
      // Child interface name from the leaf property only — the Emitter
      // deduplicates on collision, keeping names short and stable.
      const type = tsType(propSchema, prop, (n, s) => this.emit(n, s))
      const nullable = propSchema.nullable ? ' | null' : ''
      lines.push(`${doc}  ${JSON.stringify(prop)}${optional}: ${type}${nullable}`)
    }
    if (typeof schema.additionalProperties === 'object') {
      const v = tsType(schema.additionalProperties, iface + 'Value', (n, s) => this.emit(n, s))
      lines.push(`  [key: string]: ${v}`)
    }

    this.interfaces.push(`export interface ${iface} {\n${lines.join('\n')}\n}`)
    return iface
  }
}

// ---------------------------------------------------------------------------
// Per-CRD emission
// ---------------------------------------------------------------------------

/**
 * Emit the root interface + component for one CRD into a shared group emitter.
 * All CRDs in the same API group share one Emitter so nested interfaces are
 * deduplicated across Kinds (e.g. CNPG Cluster/Pooler share PodSpec shapes).
 */
function generateForCrd(doc: CrdDoc, emitter: Emitter): { kind: string; code: string } | null {
  const version =
    doc.spec.versions.find((v) => v.storage && v.schema?.openAPIV3Schema) ??
    doc.spec.versions.find((v) => v.served && v.schema?.openAPIV3Schema)
  if (!version) return null

  const kind = doc.spec.names.kind
  const apiVersion = `${doc.spec.group}/${version.name}`
  const schema = version.schema!.openAPIV3Schema!

  // Reserve the Kind and its Props so nested schemas never take those names.
  // Spec/Status are emitted normally (as <Kind>Spec / <Kind>Status).
  emitter.reserve(kind)
  emitter.reserve(`${kind}Props`)

  const specSchema = schema.properties?.spec
  const specType = specSchema
    ? tsType(specSchema, `${kind}Spec`, (n, s) => emitter.emit(n, s))
    : 'Record<string, unknown>'
  const statusSchema = schema.properties?.status
  const statusType = statusSchema
    ? tsType(statusSchema, `${kind}Status`, (n, s) => emitter.emit(n, s))
    : null

  const root = `export interface ${kind} {
  apiVersion: '${apiVersion}'
  kind: '${kind}'
  metadata: ObjectMeta
  spec: ${specType}${statusType ? `\n  status?: ${statusType}` : ''}
}

/** Props for the {@link ${kind}} component — a 1:1 mapping of the ${apiVersion} CRD. */
export interface ${kind}Props {
  metadata: ObjectMeta
  spec: ${specType}
}

/** Render a ${kind} (${apiVersion}) exactly as defined by its CRD. */
export function ${kind}Component(props: ${kind}Props) {
  return jsx('${kind}', {
    apiVersion: '${apiVersion}',
    kind: '${kind}',
    metadata: props.metadata,
    spec: props.spec,
  })
}
`
  return { kind, code: root }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(outDir, { recursive: true })

// Group CRDs by API group first so each group gets ONE shared emitter.
const groups = new Map<string, { kinds: string[]; roots: string[]; emitter: Emitter }>()

/**
 * Derive a readable file key from an API group. Generic first labels
 * (k8s, networking) fall back to the second label so keycloak.org's
 * k8s.keycloak.org lands in keycloak.ts, not k8s.ts.
 */
function groupFileKey(group: string): string {
  const labels = group.split('.')
  const first = labels[0]
  if ((first === 'k8s' || first === 'networking') && labels.length > 1) return labels[1]
  return first
}

for (const { file, doc } of loadCrds()) {
  const groupKey = groupFileKey(doc.spec.group)
  const group = groups.get(groupKey) ?? { kinds: [], roots: [], emitter: new Emitter() }
  const result = generateForCrd(doc, group.emitter)
  if (!result) {
    console.warn(`skip ${file}: no served version with a schema`)
    continue
  }
  group.kinds.push(result.kind)
  group.roots.push(result.code)
  groups.set(groupKey, group)
  console.log(`✓ ${result.kind} (${doc.spec.group}) → ${groupKey}.ts`)
}

const indexLines: string[] = [
  '/**',
  ' * GENERATED index — do not edit by hand.',
  ' *',
  ' * Group files intentionally do NOT use `export *` here: generic nested',
  ' * interfaces (LabelSelector, Affinity, ...) collide across API groups.',
  ' * Import per group file instead:',
  ' *',
  ' *   import { Cluster, ClusterComponent } from "@r8s/crds/postgresql"',
  ' *   import { Certificate } from "@r8s/crds/cert-manager"',
  ' */',
  '',
]
for (const [groupKey, { kinds, roots, emitter }] of groups) {
  const header = `/**
 * GENERATED from ${groupKey} CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

`
  const code = header + roots.join('\n') + '\n' + emitter.interfaces.join('\n\n') + '\n'
  writeFileSync(join(outDir, `${groupKey}.ts`), code)
  indexLines.push(`export * as ${groupKey.replace(/-/g, '_')} from './${groupKey}'`)
  console.log(
    `  wrote ${groupKey}.ts: ${kinds.join(', ')} (${emitter.interfaces.length} interfaces)`
  )
}
indexLines.push(`export { operators, operatorMetadata } from './operators'`)
indexLines.push(`export type { OperatorMeta } from './operators'`)
writeFileSync(join(outDir, 'index.ts'), indexLines.join('\n') + '\n')
console.log(`\nGenerated ${groups.size} group files in src/generated/`)

// ---------------------------------------------------------------------------
// operators.yaml → operators.ts
// ---------------------------------------------------------------------------

interface OperatorEntry {
  name: string
  description?: string
  category?: string
  source:
    | { type: 'manifest'; url: string }
    | { type: 'helm'; chart: string; repository: string }
    | { type: 'olm'; package: string; channel: string }
  version: string
  namespace?: string
  crds?: string[]
}

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{version}', version).replaceAll('{minor}', minor)
}

const operatorsYaml = yaml.load(
  readFileSync(join(root, 'operators.yaml'), 'utf8')
) as OperatorEntry[]

const opsLines: string[] = [
  '/**',
  ' * GENERATED from operators.yaml — do not edit by hand.',
  ' * Regenerate with: npm run generate -w @r8s/crds',
  ' */',
  "import type { Operator } from '@r8s/k8s-types'",
  '',
  `export const operators: Record<string, (version?: string) => Operator> = {`,
]

for (const op of operatorsYaml) {
  const url = 'url' in op.source ? expandVersion(op.source.url, op.version) : undefined
  const sourceObj =
    op.source.type === 'manifest'
      ? `{ type: 'manifest', url: ${JSON.stringify(url)}, version, namespace: ${JSON.stringify(op.namespace)} }`
      : op.source.type === 'helm'
        ? `{ type: 'helm', chart: ${JSON.stringify(op.source.chart)}, repository: ${JSON.stringify(op.source.repository)}, version, namespace: ${JSON.stringify(op.namespace)} }`
        : `{ type: 'olm', package: ${JSON.stringify(op.source.package)}, channel: ${JSON.stringify(op.source.channel)}, version }`

  opsLines.push(
    `  ${JSON.stringify(op.name)}: (version = ${JSON.stringify(op.version)}) => ({`,
    `    name: ${JSON.stringify(op.name)},`,
    op.description ? `    description: ${JSON.stringify(op.description)},` : '',
    `    source: ${sourceObj},`,
    `    version,`,
    op.namespace ? `    namespace: ${JSON.stringify(op.namespace)},` : '',
    op.crds ? `    crds: ${JSON.stringify(op.crds)},` : '',
    `  }),`
  )
}
opsLines.push('}')

// Operator metadata for docs generation — description, category, version per operator.
const metaLines: string[] = [
  '/**',
  ' * GENERATED operator metadata for docs — do not edit by hand.',
  ' */',
  'export interface OperatorMeta {',
  '  name: string',
  '  description: string',
  '  category: string',
  '  version: string',
  '  crds: string[]',
  '}',
  '',
  'export const operatorMetadata: OperatorMeta[] = [',
]
for (const op of operatorsYaml) {
  metaLines.push(
    '  {',
    `    name: ${JSON.stringify(op.name)},`,
    `    description: ${JSON.stringify(op.description ?? '')},`,
    `    category: ${JSON.stringify(op.category ?? 'Uncategorized')},`,
    `    version: ${JSON.stringify(op.version)},`,
    `    crds: ${JSON.stringify(op.crds ?? [])},`,
    '  },'
  )
}
metaLines.push(']')

writeFileSync(
  join(outDir, 'operators.ts'),
  opsLines.filter(Boolean).join('\n') + '\n\n' + metaLines.join('\n') + '\n'
)
console.log(`  wrote operators.ts: ${operatorsYaml.length} operators`)
