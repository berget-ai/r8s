import { CodeBlock } from '../../components/CodeBlock'

const fileTree = `packages/crds/
├── crds/                          # Vendored CRD YAML (pinnade upstream versioner)
│   ├── cnpg-cluster.yaml
│   ├── certmanager-certificate.yaml
│   └── ...
├── operators.yaml                 # All operator declarations (single source of truth)
├── scripts/
│   └── generate.ts                # CRD → TypeScript generator
└── src/
    ├── index.ts                   # Re-exports generated modules
    └── generated/                 # OUTPUT — never hand-edited
        ├── postgresql.ts          # Cluster, Pooler, ScheduledBackup + 244 interfaces
        ├── cert-manager.ts
        ├── operators.ts           # operators['cnpg']('1.27.0') etc.
        └── ...`

const operatorsYaml = `# operators.yaml — add an entry per operator
- name: my-operator
  description: What the operator does
  source:
    type: helm                      # helm | manifest | olm
    chart: my-operator
    repository: https://charts.example.com/
  version: "1.4.2"
  namespace: my-operator-system
  crds:
    - widgets.example.com
    - gadgets.example.com`

const vendorCrd = `# 1. Download the CRD YAML from the operator's release
curl -sfL "https://raw.githubusercontent.com/example/my-operator/v1.4.2/config/crd/bases/example.com_widgets.yaml" \\
  -o packages/crds/crds/my-operator-widget.yaml

# 2. Add the operator to operators.yaml (see above)

# 3. Regenerate
npm run generate -w @r8s/crds`

const generatedOutput = `// src/generated/example.ts — GENERATED, do not edit
import type { ObjectMeta } from '@r8s/k8s-types'

export interface Widget {
  apiVersion: 'example.com/v1'
  kind: 'Widget'
  metadata: ObjectMeta
  spec: WidgetSpec
}

export interface WidgetProps {
  metadata: ObjectMeta
  spec: WidgetSpec
}

export function WidgetComponent(props: WidgetProps): Widget {
  return {
    apiVersion: 'example.com/v1',
    kind: 'Widget',
    metadata: props.metadata,
    spec: props.spec,
  }
}`

const usageCode = `import { WidgetComponent } from '@r8s/crds/example'
import { operators } from '@r8s/crds'

// The component is a 1:1 mapping of the CRD — no simplification, no renamed fields
const widget = WidgetComponent({
  metadata: { name: 'my-widget', namespace: 'default' },
  spec: {
    replicas: 3,
    // ...every field from the upstream CRD schema is typed
  },
})

// Operator declarations come from operators.yaml
const op = operators['my-operator']('1.4.2')`

const recipeCode = `// packages/recipes/src/my-recipe.tsx
import { jsx, Fragment, declareOperator } from '@r8s/core'
import { WidgetComponent } from '@r8s/crds/example'
import { operators } from '@r8s/crds'

export interface MyRecipeProps {
  name: string
  replicas?: number
}

/**
 * @title My Recipe
 * @category Data & Analytics
 *
 * A higher-level pattern composing CRD components.
 *
 * @example
 * <MyRecipe name="cluster" replicas={3} />
 */
export function MyRecipe(props: MyRecipeProps) {
  const { name, replicas = 1 } = props

  return (
    <>
      {declareOperator(operators['my-operator']())}
      {jsx(WidgetComponent, {
        metadata: { name, namespace: 'default' },
        spec: { replicas },
      })}
    </>
  )
}

// Then export from packages/recipes/src/index.ts:
//   export { MyRecipe } from './my-recipe'`

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl tracking-tight">Adding Operators</h1>
        <p className="text-xl text-cloud/80">
          How to add new Kubernetes operator integrations to r8s — CRD-driven, 1:1 with upstream, no
          hand-written type mappings.
        </p>
      </div>

      {/* Principle */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">The Principle</h2>
        <p className="text-cloud/70 leading-relaxed">
          r8s generates TypeScript types and components directly from upstream CRD OpenAPI v3
          schemas. This means 100% fidelity to the operator's API — no renamed fields, no collapsed
          arrays, no invented defaults. If the CRD has a field, r8s has it typed. If the CRD doesn't
          have a field, r8s doesn't either.
        </p>
        <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
          <h3 className="font-serif text-lg mb-2">Two layers, one boundary</h3>
          <ul className="space-y-2 text-sm text-cloud/70">
            <li>
              <strong className="text-moss">@r8s/crds</strong> — generated, 1:1 with CRDs. Types and
              components named exactly as the upstream Kind. Never hand-edited.
            </li>
            <li>
              <strong className="text-moss">@r8s/recipes</strong> — the only place for abstraction.
              Composes generated components into higher-level patterns (App, Platform, Endpoint).
            </li>
          </ul>
        </div>
      </div>

      {/* Structure */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Package Structure</h2>
        <p className="text-cloud/70 leading-relaxed">
          All operator integrations live in a single package: <code>@r8s/crds</code>. CRD YAML files
          are vendored at pinned versions. The generator reads them and produces TypeScript files
          that are committed to the repo.
        </p>
        <CodeBlock code={fileTree} language="bash" />
      </div>

      {/* Step 1: Vendor CRD */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 1 — Vendor the CRD</h2>
        <p className="text-cloud/70 leading-relaxed">
          Download the CRD YAML from the operator's release artifacts. Pin to a specific version —
          the file is committed to the repo so renders are reproducible offline.
        </p>
        <CodeBlock code={vendorCrd} language="bash" />
      </div>

      {/* Step 2: operators.yaml */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 2 — Declare the Operator</h2>
        <p className="text-cloud/70 leading-relaxed">
          Add an entry to <code>operators.yaml</code>. This is the single source of truth for how
          operators are installed — Helm chart, raw manifest, or OLM. The <code>crds</code> list is
          what users see when rendering with <code>--include-operators</code>.
        </p>
        <CodeBlock code={operatorsYaml} language="yaml" />
        <div className="p-6 rounded-lg border border-white/10 bg-white/[0.02]">
          <h3 className="font-serif text-lg mb-2">Version placeholders</h3>
          <p className="text-cloud/70 text-sm leading-relaxed">
            URLs support <code>{'{version}'}</code> and <code>{'{minor}'}</code> placeholders (e.g.
            <code>release-{'{minor}'}</code> expands to <code>release-1.27</code> for version
            1.27.0). This lets you bump a version in one place.
          </p>
        </div>
      </div>

      {/* Step 3: Generate */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Step 3 — Regenerate</h2>
        <p className="text-cloud/70 leading-relaxed">
          The generator extracts the OpenAPI v3 schema from each CRD, produces TypeScript interfaces
          for every nested object, and a component function per Kind. The output goes to{' '}
          <code>src/generated/</code> — one file per API group.
        </p>
        <CodeBlock code={generatedOutput} language="typescript" />
        <p className="text-cloud/70 leading-relaxed">
          The component is intentionally trivial — it sets <code>apiVersion</code> and{' '}
          <code>kind</code>, passes <code>metadata</code> and <code>spec</code> through. No logic,
          no defaults, no place for drift to creep in.
        </p>
      </div>

      {/* Usage */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Using Generated Components</h2>
        <p className="text-cloud/70 leading-relaxed">
          Import per API group file to avoid name collisions (generic nested interfaces like{' '}
          <code>LabelSelector</code> exist in multiple groups):
        </p>
        <CodeBlock code={usageCode} language="typescript" />
      </div>

      {/* Recipes */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Adding a Recipe</h2>
        <p className="text-cloud/70 leading-relaxed">
          Recipes are the only place for abstraction. A recipe composes generated components and raw
          resources into a higher-level pattern. Add one file per recipe in{' '}
          <code>packages/recipes/src/</code>, export it from <code>index.ts</code>, and tag the
          JSDoc with <code>@title</code> and <code>@category</code>.
        </p>
        <CodeBlock code={recipeCode} language="tsx" />
      </div>

      {/* Acceptance criteria */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">What We Look For in Review</h2>
        <p className="text-cloud/70 leading-relaxed">
          A new operator integration is accepted when all of these hold. Reviewers check this list —
          save everyone a round-trip by verifying it yourself first.
        </p>
        <div className="p-6 rounded-lg border border-white/10 space-y-3">
          {[
            'CRD YAML vendored at a pinned upstream version',
            'operators.yaml entry complete: name, source, version, namespace, crds',
            'Generator runs clean: npm run generate -w @r8s/crds produces no warnings',
            'Generated types compile: npx tsc -b passes',
            'Component names match upstream Kinds exactly (no renames)',
            'No hand-written type mappings — everything comes from the CRD schema',
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
          Vendor the CRD, add the operator entry, regenerate, and open a PR — we review within 24
          hours on weekdays. Questions? Open an issue on{' '}
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
