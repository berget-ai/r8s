import { CodeBlock } from '../../components/CodeBlock'

const fileTree = `packages/my-operator/
├── package.json          # Metadata — drives the docs page
├── tsconfig.json         # Extends root config, project references
├── src/
│   └── index.ts          # Operator declaration + components
└── __tests__/
    └── my-operator.test.ts`

const copyExample = `cp -r packages/example packages/my-operator
cd packages/my-operator`

const packageJson = `{
  "name": "@r8s/my-operator",
  "version": "0.1.0",
  // Shown as the lead paragraph on the docs page — write it for users
  "description": "Short, concrete description of what this package provides.",
  "license": "MIT",
  "author": "Berget AI AB",
  "homepage": "https://r8s.berget.ai",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/berget-ai/r8s.git",
    "directory": "packages/my-operator"
  },
  "bugs": "https://github.com/berget-ai/r8s/issues",
  "publishConfig": { "access": "public" },
  "files": ["dist"],
  // Powers search on the docs site
  "keywords": ["my-operator", "databases", "ha"],
  // Determines which section the package appears under on /packages
  "r8s": { "category": "Data & Analytics" },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc --build",
    "test": "vitest run",
    "clean": "rm -rf dist tsconfig.tsbuildinfo"
  },
  "dependencies": {
    "@r8s/core": "*",
    "@r8s/k8s-types": "*"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}`

const operatorDecl = `import { helmOperator } from '@r8s/k8s-types'

/**
 * Operator factory. The version is pinned as a default parameter —
 * users can override it, but the default must always be a tested release.
 *
 * Choose the helper matching how the operator is installed:
 *   helmOperator(name, chart, repo, version, opts)           — Helm chart
 *   manifestOperator(name, url, version, opts)               — plain YAML
 *   olmOperator(name, packageName, channel, version, opts)   — OLM
 */
export const myOperator = (version = '1.4.2') =>
  helmOperator(
    'my-operator',                          // unique name across all packages
    'my-operator',                          // Helm chart
    'https://charts.example.com/',          // Helm repository
    version,
    {
      description: 'What the operator does',
      namespace: 'my-operator-system',
      // Every CRD the operator provides — this is what users see
      // in 'r8s render --include-operators' output
      crds: ['widgets.example.com', 'gadgets.example.com'],
    }
  )`

const componentCode = `import { jsx, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'

export interface WidgetProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Number of widget replicas */
  replicas?: number
}

/**
 * One-line summary shown on the docs page.
 *
 * The @example block is rendered by the docs generator — the resulting
 * YAML is displayed next to the code. Keep it runnable.
 *
 * @example
 * <Widget name="cache" namespace="production" replicas={3} />
 */
export function Widget(props: WidgetProps) {
  const { name, namespace = 'default', replicas = 1 } = props

  // Don't re-declare the operator if it was provided via
  // <Platform operators={[...]}> — this is how deduplication works
  const shared = useContext(OperatorContext)
  const hasOperator = shared.some((op) => op.name === 'my-operator')

  const widget = {
    apiVersion: 'example.com/v1',
    kind: 'Widget',
    metadata: { name, namespace },
    spec: { replicas },
  }

  return [!hasOperator && declareOperator(myOperator()), jsx('Widget', widget)]
}`

const testCode = `import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Widget, myOperator } from '../src/index'

describe('myOperator', () => {
  it('should declare the operator with a pinned default version', () => {
    const op = myOperator()
    expect(op.name).toBe('my-operator')
    expect(op.source.type).toBe('helm')
    expect(op.version).toBe('1.4.2')
  })
})

describe('Widget', () => {
  it('should render with defaults', () => {
    const result = render(jsx(Widget, { name: 'w' }))
    const widget = result.resources.find((r) => r.kind === 'Widget')
    expect(widget?.metadata.namespace).toBe('default')
  })

  it('should declare its operator dependency', () => {
    const result = render(jsx(Widget, { name: 'w' }))
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('my-operator')
  })
})`

const tsconfigRoot = `// tsconfig.json (repo root) — add BOTH entries:
{
  "compilerOptions": {
    "paths": {
      "@r8s/my-operator": ["./packages/my-operator/src/index.ts"]
    }
  },
  "references": [
    { "path": "./packages/my-operator" }
  ]
}`

const docsAlias = `// docs/scripts/generate-docs.ts — add a path alias so the
// docs generator can render your @example blocks to YAML:
paths: {
  // ...existing aliases...
  '@r8s/my-operator': [path.join(ROOT, 'packages/my-operator/src/index.ts')],
}`

const readmeRow = `| \`@r8s/my-operator\` | What it provides | my-operator |`

const newCrd = `// packages/redis/src/index.ts — adding RedisSentinel to the
// existing package means two edits:

// 1. Add the CRD to the operator declaration
crds: [
  'redisclusters.redis.redis.opstreelabs.in',
  'redisreplications.redis.redis.opstreelabs.in',
  'redissentinels.redis.redis.opstreelabs.in', // already here
]

// 2. Add the component (props interface + JSDoc + function)
export function RedisSentinel(props: RedisSentinelProps) {
  // ...same pattern as the other components
}`

const recipeCode = `// packages/recipes/src/kafka.tsx
import { jsx, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { Database } from './database'

export interface KafkaProps {
  /** Resource name */
  name: string
  /** Number of broker replicas */
  replicas?: number
}

/**
 * @title Kafka
 * @category Data & Analytics
 *
 * Kafka cluster with storage and defaults wired in.
 *
 * @example
 * <Kafka name="events" replicas={3} />
 */
export function Kafka(props: KafkaProps) {
  // Compose existing components and raw resources —
  // a recipe is just a component that returns other components
  return (
    <>
      <Database name={\`\${props.name}-db\`} storage="20Gi" />
      {/* ... */}
    </>
  )
}

// Then export it from packages/recipes/src/index.ts:
//   export { Kafka } from './kafka'`

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl tracking-tight">Adding Packages</h1>
        <p className="text-xl text-cloud/80">
          How to contribute new operator integrations, components, and recipes to r8s.
        </p>
      </div>

      {/* Three kinds of contributions */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Three Kinds of Contributions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-white/10">
            <h3 className="font-serif text-xl mb-3 text-moss">New package</h3>
            <p className="text-cloud/70 text-sm">
              Integrate a Kubernetes operator that r8s doesn't support yet. One package per
              operator.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-white/10">
            <h3 className="font-serif text-xl mb-3 text-moss">New component</h3>
            <p className="text-cloud/70 text-sm">
              Add a component for a CRD provided by an operator r8s already integrates — e.g. a new
              resource kind in an existing package.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-white/10">
            <h3 className="font-serif text-xl mb-3 text-moss">New recipe</h3>
            <p className="text-cloud/70 text-sm">
              Compose existing components into a higher-level pattern in <code>@r8s/recipes</code> —
              like <code>&lt;App&gt;</code> or <code>&lt;Database&gt;</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Anatomy */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Anatomy of a Package</h2>
        <p className="text-cloud/70 leading-relaxed">
          A package is deliberately small — four files. Everything else (docs, search, examples) is
          generated from these files, so their quality directly determines the quality of the docs
          site.
        </p>
        <CodeBlock code={fileTree} language="bash" />
        <p className="text-cloud/70 leading-relaxed">
          Start from <code>packages/example</code> — a minimal, fully annotated template that is
          compiled and tested in CI, so it always reflects current conventions:
        </p>
        <CodeBlock code={copyExample} language="bash" />
      </div>

      {/* Step 1: package.json */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 1 — package.json</h2>
        <p className="text-cloud/70 leading-relaxed">
          The docs generator reads <code>description</code>, <code>keywords</code>, and the custom{' '}
          <code>r8s.category</code> field straight from package.json. Remove{' '}
          <code>"private": true</code> from the template — real packages are published.
        </p>
        <CodeBlock code={packageJson} language="json" />
        <p className="text-cloud/70 leading-relaxed">
          Existing categories: <em>Data & Analytics</em>, <em>Networking</em>,{' '}
          <em>Observability</em>, <em>Security & Identity</em>. Reuse one if it fits — new
          categories are welcome when a package genuinely doesn't fit.
        </p>
      </div>

      {/* Step 2: operator declaration */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 2 — Declare the Operator</h2>
        <p className="text-cloud/70 leading-relaxed">
          The operator declaration is what makes r8s packages self-describing: it records how the
          operator is installed and which CRDs it provides. Render with{' '}
          <code>--include-operators</code> and users get installable operator manifests next to
          their resources.
        </p>
        <CodeBlock code={operatorDecl} language="tsx" />
      </div>

      {/* Step 3: components */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 3 — Write Components</h2>
        <p className="text-cloud/70 leading-relaxed">
          One component per CRD the package manages. Three rules: every prop documented with JSDoc
          (the docs prop tables are generated from these comments), sensible defaults for everything
          optional, and a runnable <code>@example</code> block.
        </p>
        <CodeBlock code={componentCode} language="tsx" />
        <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
          <h3 className="font-serif text-lg mb-2">Why the OperatorContext check?</h3>
          <p className="text-cloud/70 text-sm leading-relaxed">
            When a user wraps components in{' '}
            <code>&lt;Platform operators=&#123;[...]&#125;&gt;</code>, the platform owns operator
            installation. Components must not re-declare what the context already provides —
            otherwise operators would be installed twice. The <code>hasOperator</code> check is what
            makes deduplication work, and the test suite verifies it.
          </p>
        </div>
      </div>

      {/* Step 4: tests */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 4 — Tests</h2>
        <p className="text-cloud/70 leading-relaxed">
          Every package tests three things: the operator declaration itself, rendering with defaults
          and with all props set, and operator deduplication via <code>OperatorContext</code>.
        </p>
        <CodeBlock code={testCode} language="tsx" />
      </div>

      {/* Step 5: registration */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 5 — Register the Package</h2>
        <p className="text-cloud/70 leading-relaxed">
          Three files outside the package directory need one edit each:
        </p>
        <ol className="list-decimal list-inside space-y-3 text-cloud/70">
          <li>
            <strong className="text-peak">Root tsconfig.json</strong> — add a path alias and a
            project reference so <code>tsc --build</code> compiles the package in dependency order:
          </li>
        </ol>
        <CodeBlock code={tsconfigRoot} language="json" />
        <ol className="list-decimal list-inside space-y-3 text-cloud/70" start={2}>
          <li>
            <strong className="text-peak">docs/scripts/generate-docs.ts</strong> — add a path alias
            so the docs generator can execute your <code>@example</code> blocks and render the YAML
            shown on the package page:
          </li>
        </ol>
        <CodeBlock code={docsAlias} language="tsx" />
        <ol className="list-decimal list-inside space-y-3 text-cloud/70" start={3}>
          <li>
            <strong className="text-peak">README.md</strong> — add a row to the Available Packages
            table:
          </li>
        </ol>
        <CodeBlock code={readmeRow} language="markdown" />
        <p className="text-cloud/70 leading-relaxed">
          The docs page itself is automatic: <code>npm run build</code> in <code>docs/</code>{' '}
          regenerates <code>docs/data/packages.ts</code> from your source. If no components are
          found, the package is skipped with a warning — check your JSDoc.
        </p>
      </div>

      {/* Adding a CRD */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Adding a CRD to an Existing Package</h2>
        <p className="text-cloud/70 leading-relaxed">
          Simpler: no new package, no registration. Add the CRD name to the operator's{' '}
          <code>crds</code> array, write the component following the same pattern as its siblings,
          and add tests.
        </p>
        <CodeBlock code={newCrd} language="tsx" />
      </div>

      {/* Adding a recipe */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Adding a Recipe</h2>
        <p className="text-cloud/70 leading-relaxed">
          Recipes are higher-level patterns composed from packages and raw resources. Add one file
          per recipe in <code>packages/recipes/src/</code>, export it from <code>index.ts</code>,
          and tag the JSDoc with <code>@title</code> and <code>@category</code> — the docs generator
          picks it up from there.
        </p>
        <CodeBlock code={recipeCode} language="tsx" />
      </div>

      {/* Acceptance criteria */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">What We Look For in Review</h2>
        <p className="text-cloud/70 leading-relaxed">
          A new package is accepted when all of these hold. Reviewers check this list — save
          everyone a round-trip by verifying it yourself first.
        </p>
        <div className="p-6 rounded-lg border border-white/10 space-y-3">
          {[
            'Operator version pinned as default parameter, pointing at a tested upstream release',
            'crds array lists every CRD the components render',
            'Every exported prop documented with JSDoc — docs tables are generated from these',
            'Runnable @example block on every component — it is executed by the docs generator',
            'OperatorContext deduplication check in every component that declares an operator',
            'Tests: operator declaration, rendering with defaults and full props, context dedup',
            'package.json complete: description, keywords, r8s.category, no leftover "private": true',
            'Registered in root tsconfig.json (paths + references) and generate-docs.ts aliases',
            'README.md packages table row added',
            'CI green: build, tests, format check',
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 text-sm text-cloud/70">
              <span className="text-moss mt-0.5">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h2 className="font-serif text-2xl mb-3">Ready to contribute?</h2>
        <p className="text-cloud/70">
          Copy <code>packages/example</code>, follow the steps above, and open a PR — we review
          within 24 hours on weekdays. Questions? Open an issue on{' '}
          <a
            href="https://github.com/berget-ai/r8s/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-moss hover:text-peak transition-colors"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  )
}
