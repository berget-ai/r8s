import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from 'fs'
import { join, resolve } from 'path'
import * as YAML from 'js-yaml'
import { writeFluxRecipe } from '../src/flux'

const testDir = resolve(__dirname, '../test-temp-flux')

/**
 * Fixture entry: declares @r8s/operator-paperclip's PaperclipOperator and
 * renders one Deployment + Service as the stack resources. The operator
 * resolves through the workspace (esbuild → tsconfig paths/core src) so
 * the test exercises the real npm-resolved operator shape.
 */
const paperclipEntry = `
import { jsx, Fragment, declareOperator } from '@r8s/core';
import { PaperclipOperator } from '@r8s/operator-paperclip';

export default function PaperclipStack() {
  return jsx(Fragment, {
    children: [
      declareOperator(PaperclipOperator()),
      jsx('Deployment', {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'paperclip-api', namespace: 'paperclip' },
        spec: {
          selector: { matchLabels: { app: 'paperclip-api' } },
          template: {
            metadata: { labels: { app: 'paperclip-api' } },
            spec: {
              containers: [{ name: 'api', image: 'example/paperclip:v1' }],
            },
          },
        },
      }),
      jsx('Service', {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: 'paperclip-api', namespace: 'paperclip' },
        spec: {
          selector: { app: 'paperclip-api' },
          ports: [{ port: 8080 }],
        },
      }),
    ],
  });
}
`

/**
 * Fixture entry for the shared operators layer: a synthetic entry that
 * declares one helm operator and no stack resources — exactly what the
 * full-catalog pattern emits once for every package stack to reuse.
 */
const sharedOperatorsEntry = `
import { jsx, Fragment, declareOperator } from '@r8s/core';

export default function SharedOperators() {
  return jsx(Fragment, {
    children: [
      declareOperator({
        name: 'shared-op',
        source: {
          type: 'helm',
          chart: 'shared-op',
          repository: 'oci://ghcr.io/example/charts',
          version: '1.0.0',
          namespace: 'shared-system',
        },
        version: '1.0.0',
      }),
    ],
  });
}
`

const loadAll = (file: string) => YAML.loadAll(readFileSync(file, 'utf-8')) as any[]

describe('r8s flux — two-Kustomization stack recipe', () => {
  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('emits the full layout with the stack name defaulting to the entry basename', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')

    const outDir = join(testDir, 'flux-out')
    const result = await writeFluxRecipe(entryFile, { out: outDir })

    expect(result.name).toBe('paperclip-stack')
    expect(result.cluster).toBe('default')
    for (const file of result.files) {
      expect(existsSync(join(outDir, file))).toBe(true)
    }
    expect(result.files).toEqual([
      'stacks/paperclip-stack/operators/kustomization.yaml',
      'stacks/paperclip-stack/operators/manifests.yaml',
      'stacks/paperclip-stack/stack/kustomization.yaml',
      'stacks/paperclip-stack/stack/manifests.yaml',
      'clusters/default/stacks/paperclip-stack.yaml',
    ])
  })

  it('renders HelmRepository (type: oci) + HelmRelease in the operators layer', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    const docs = loadAll(join(outDir, 'stacks/paperclip-stack/operators/manifests.yaml'))

    const repository = docs.find((d) => d.kind === 'HelmRepository')
    expect(repository).toBeDefined()
    // oci:// URLs get the type: oci marker so source-controller uses the
    // registry instead of expecting a Helm index.
    expect(repository.spec.type).toBe('oci')
    expect(repository.spec.url).toBe('oci://ghcr.io/paperclipinc/charts')
    expect(repository.spec.interval).toBe('5m')
    expect(repository.metadata).toEqual({
      name: 'paperclip-operator',
      namespace: 'paperclip-system',
    })

    const release = docs.find((d) => d.kind === 'HelmRelease')
    expect(release).toBeDefined()
    expect(release.apiVersion).toBe('helm.toolkit.fluxcd.io/v2')
    expect(release.spec.interval).toBe('5m')
    expect(release.spec.chart.spec.chart).toBe('paperclip-operator')
    expect(release.spec.chart.spec.version).toBe('0.19.0')
    expect(release.spec.chart.spec.sourceRef).toEqual({
      kind: 'HelmRepository',
      name: 'paperclip-operator',
      namespace: 'paperclip-system',
    })
    // chart values pass through (operator defaults)
    expect(release.spec.values).toEqual(
      expect.objectContaining({ leaderElection: { enabled: false } })
    )
  })

  it('renders plain HTTP repositories without the oci type marker', async () => {
    const entryFile = join(testDir, 'http-op-stack.tsx')
    writeFileSync(
      entryFile,
      `
import { jsx, Fragment, declareOperator } from '@r8s/core';

export default function Stack() {
  return jsx(Fragment, {
    children: [
      declareOperator({
        name: 'cert-manager',
        source: {
          type: 'helm',
          chart: 'cert-manager',
          repository: 'https://charts.jetstack.io',
          version: '1.14.5',
          namespace: 'cert-manager',
        },
        version: '1.14.5',
      }),
      jsx('Deployment', {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'app', namespace: 'apps' },
        spec: {
          selector: { matchLabels: { app: 'app' } },
          template: {
            metadata: { labels: { app: 'app' } },
            spec: { containers: [{ name: 'app', image: 'app:v1' }] },
          },
        },
      }),
    ],
  });
}
`,
      'utf-8'
    )
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    const docs = loadAll(join(outDir, 'stacks/http-op-stack/operators/manifests.yaml'))
    const repository = docs.find((d) => d.kind === 'HelmRepository')
    expect(repository.spec).not.toHaveProperty('type')
    expect(repository.spec.url).toBe('https://charts.jetstack.io')
  })

  it('renders the package resources into the stack layer', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    const docs = loadAll(join(outDir, 'stacks/paperclip-stack/stack/manifests.yaml'))
    const kinds = docs.map((d) => d.kind)
    expect(kinds).toEqual(expect.arrayContaining(['Deployment', 'Service']))
    const deployment = docs.find((d) => d.kind === 'Deployment')
    expect(deployment.metadata.name).toBe('paperclip-api')
    expect(deployment.spec.template.spec.containers[0].image).toBe('example/paperclip:v1')
  })

  it('wires the two Flux Kustomizations with dependsOn + healthChecks', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, {
      out: outDir,
      name: 'paperclip',
      source: 'my-repo',
      sourceNamespace: 'gitops',
    })

    const [operators, stack] = loadAll(join(outDir, 'clusters/default/stacks/paperclip.yaml'))

    expect(operators.kind).toBe('Kustomization')
    expect(operators.apiVersion).toBe('kustomize.toolkit.fluxcd.io/v1')
    expect(operators.metadata).toEqual({ name: 'paperclip-operators', namespace: 'gitops' })
    expect(operators.spec.path).toBe('stacks/paperclip/operators')
    expect(operators.spec.prune).toBe(true)
    expect(operators.spec.wait).toBe(true)
    expect(operators.spec.timeout).toBe('8m')
    expect(operators.spec.sourceRef).toEqual({
      kind: 'GitRepository',
      name: 'my-repo',
      namespace: 'gitops',
    })

    expect(stack.metadata).toEqual({ name: 'paperclip-stack', namespace: 'gitops' })
    expect(stack.spec.path).toBe('stacks/paperclip/stack')
    expect(stack.spec.timeout).toBe('12m')
    expect(stack.spec.dependsOn).toEqual([{ name: 'paperclip-operators' }])
    // One healthCheck per distinct workload in the rendered resources
    expect(stack.spec.healthChecks).toEqual([
      { apiVersion: 'apps/v1', kind: 'Deployment', name: 'paperclip-api', namespace: 'paperclip' },
    ])
    // The operators Kustomization waits but carries no healthChecks list
    expect(operators.spec.dependsOn).toBeUndefined()
    expect(operators.spec.healthChecks).toBeUndefined()
  })

  it('operators-only emits only the shared operators layer and a single CR without dependsOn', async () => {
    const entryFile = join(testDir, 'shared-operators.tsx')
    writeFileSync(entryFile, sharedOperatorsEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')

    const result = await writeFluxRecipe(entryFile, {
      out: outDir,
      name: 'catalog',
      operatorsOnly: true,
    })

    // Only the operators layer + one CR — no stack dir.
    expect(result.files).toEqual([
      'stacks/catalog/operators/kustomization.yaml',
      'stacks/catalog/operators/manifests.yaml',
      'clusters/default/stacks/catalog.yaml',
    ])
    expect(existsSync(join(outDir, 'stacks/catalog/stack'))).toBe(false)

    const operatorsK = loadAll(join(outDir, 'stacks/catalog/operators/kustomization.yaml'))[0]
    expect(operatorsK).toEqual({
      apiVersion: 'kustomize.config.k8s.io/v1beta1',
      kind: 'Kustomization',
      resources: ['manifests.yaml'],
    })
    const operators = loadAll(join(outDir, 'stacks/catalog/operators/manifests.yaml'))
    expect(operators.map((d) => d.kind)).toEqual(['HelmRepository', 'HelmRelease'])
    expect(operators.find((d) => d.kind === 'HelmRepository')?.spec.type).toBe('oci')

    // The single CR is the operators Kustomization — the name package
    // stacks reference with --shared-operators.
    const docs = loadAll(join(outDir, 'clusters/default/stacks/catalog.yaml'))
    expect(docs).toHaveLength(1)
    const [operatorsCr] = docs
    expect(operatorsCr.metadata).toEqual({ name: 'catalog-operators', namespace: 'flux-system' })
    expect(operatorsCr.spec.path).toBe('stacks/catalog/operators')
    expect(operatorsCr.spec.interval).toBe('5m')
    expect(operatorsCr.spec.prune).toBe(true)
    expect(operatorsCr.spec.wait).toBe(true)
    expect(operatorsCr.spec.timeout).toBe('8m')
    expect(operatorsCr.spec.sourceRef).toEqual({
      kind: 'GitRepository',
      name: 'flux-system',
      namespace: 'flux-system',
    })
    expect(operatorsCr.spec.dependsOn).toBeUndefined()
    expect(operatorsCr.spec.healthChecks).toBeUndefined()
  })

  it('shared-operators emits only the stack layer, depending on the shared Kustomization', async () => {
    const entryFile = join(testDir, 'cnpg-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')
    // The paperclip entry declares an operator — shared-operators mode
    // must warn and skip it (the shared layer owns operator installation).
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await writeFluxRecipe(entryFile, {
      out: outDir,
      name: 'cnpg',
      sharedOperators: 'catalog-operators',
      source: 'my-repo',
      sourceNamespace: 'gitops',
    })

    expect(errorSpy.mock.calls.join('\n')).toMatch(
      /--shared-operators "catalog-operators".*paperclip-operator.*skipped/s
    )

    // Only the stack layer + one CR — no operators dir. The CR lives in
    // the 'default' cluster dir (--cluster is separate from --source-namespace).
    expect(result.files).toEqual([
      'stacks/cnpg/stack/kustomization.yaml',
      'stacks/cnpg/stack/manifests.yaml',
      'clusters/default/stacks/cnpg.yaml',
    ])
    expect(existsSync(join(outDir, 'stacks/cnpg/operators'))).toBe(false)

    const stackK = loadAll(join(outDir, 'stacks/cnpg/stack/kustomization.yaml'))[0]
    expect(stackK.resources).toEqual(['manifests.yaml'])
    const stackDocs = loadAll(join(outDir, 'stacks/cnpg/stack/manifests.yaml'))
    expect(stackDocs.map((d) => d.kind)).toEqual(expect.arrayContaining(['Deployment', 'Service']))

    // The single CR points at the shared operators Kustomization instead
    // of the per-stack <cnpg>-operators one, and keeps the healthChecks.
    const docs = loadAll(join(outDir, 'clusters/default/stacks/cnpg.yaml'))
    expect(docs).toHaveLength(1)
    const [stackCr] = docs
    expect(stackCr.metadata).toEqual({ name: 'cnpg-stack', namespace: 'gitops' })
    expect(stackCr.spec.path).toBe('stacks/cnpg/stack')
    expect(stackCr.spec.timeout).toBe('12m')
    // dependsOn names the shared Kustomization explicitly, namespace
    // included — both runs must share the same --source-namespace.
    expect(stackCr.spec.dependsOn).toEqual([{ name: 'catalog-operators', namespace: 'gitops' }])
    expect(stackCr.spec.sourceRef).toEqual({
      kind: 'GitRepository',
      name: 'my-repo',
      namespace: 'gitops',
    })
    expect(stackCr.spec.healthChecks).toEqual([
      { apiVersion: 'apps/v1', kind: 'Deployment', name: 'paperclip-api', namespace: 'paperclip' },
    ])
  })

  it('warns that --operators-only drops rendered resources', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await writeFluxRecipe(entryFile, {
      out: outDir,
      name: 'catalog',
      operatorsOnly: true,
    })

    expect(errorSpy.mock.calls.join('\n')).toMatch(/dropped in --operators-only mode/)

    // The resources are dropped, but the operators layer is intact.
    expect(existsSync(join(outDir, 'stacks/catalog/stack'))).toBe(false)
    const operators = loadAll(join(outDir, 'stacks/catalog/operators/manifests.yaml'))
    expect(operators).toHaveLength(2)
  })

  it('rejects a --shared-operators name that is not a DNS label', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')

    await expect(
      writeFluxRecipe(entryFile, {
        out: join(testDir, 'flux-out'),
        sharedOperators: 'catalog_operators',
      })
    ).rejects.toThrow(/Invalid --shared-operators name "catalog_operators"/)
  })

  it('rejects combining --operators-only with --shared-operators', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')

    await expect(
      writeFluxRecipe(entryFile, {
        out: join(testDir, 'flux-out'),
        operatorsOnly: true,
        sharedOperators: 'catalog-operators',
      })
    ).rejects.toThrow(/--operators-only and --shared-operators are mutually exclusive/)
  })

  it('caps healthChecks at five distinct workloads', async () => {
    const entryFile = join(testDir, 'many-workloads.tsx')
    writeFileSync(
      entryFile,
      `
import { jsx, Fragment } from '@r8s/core';

export default function Stack() {
  return jsx(Fragment, {
    children: Array.from({ length: 7 }, (_, i) =>
      jsx('Deployment', {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: 'app-' + i, namespace: 'apps' },
        spec: {
          selector: { matchLabels: { app: 'app-' + i } },
          template: {
            metadata: { labels: { app: 'app-' + i } },
            spec: { containers: [{ name: 'app', image: 'app:v1' }] },
          },
        },
      })
    ),
  });
}
`,
      'utf-8'
    )
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    const [, stack] = loadAll(join(outDir, 'clusters/default/stacks/many-workloads.yaml'))
    expect(stack.spec.healthChecks).toHaveLength(5)
    expect(stack.spec.healthChecks[0].name).toBe('app-0')
    expect(stack.spec.healthChecks[4].name).toBe('app-4')
  })

  it('omits healthChecks when the package renders no workloads', async () => {
    const entryFile = join(testDir, 'config-only.tsx')
    writeFileSync(
      entryFile,
      `
import { jsx } from '@r8s/core';

export default function Stack() {
  return jsx('ConfigMap', {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: 'config', namespace: 'apps' },
    data: { mode: 'plain' },
  });
}
`,
      'utf-8'
    )
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    const [, stack] = loadAll(join(outDir, 'clusters/default/stacks/config-only.yaml'))
    expect(stack.spec.healthChecks).toBeUndefined()
  })

  it('lists manifests.yaml in both layer kustomizations', async () => {
    const entryFile = join(testDir, 'paperclip-stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    const operatorsK = loadAll(
      join(outDir, 'stacks/paperclip-stack/operators/kustomization.yaml')
    )[0]
    const stackK = loadAll(join(outDir, 'stacks/paperclip-stack/stack/kustomization.yaml'))[0]

    expect(operatorsK).toEqual({
      apiVersion: 'kustomize.config.k8s.io/v1beta1',
      kind: 'Kustomization',
      resources: ['manifests.yaml'],
    })
    expect(stackK.resources).toEqual(['manifests.yaml'])
  })

  it('drops the resources list from the operators layer when no operators are declared', async () => {
    const entryFile = join(testDir, 'no-operators.tsx')
    writeFileSync(
      entryFile,
      `
import { jsx } from '@r8s/core';

export default function Stack() {
  return jsx('Deployment', {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: 'app', namespace: 'apps' },
    spec: {
      selector: { matchLabels: { app: 'app' } },
      template: {
        metadata: { labels: { app: 'app' } },
        spec: { containers: [{ name: 'app', image: 'app:v1' }] },
      },
    },
  });
}
`,
      'utf-8'
    )
    const outDir = join(testDir, 'flux-out')

    await writeFluxRecipe(entryFile, { out: outDir })

    // An unlisted empty manifests.yaml keeps kustomize valid — the empty
    // operators layer reconciles to Ready immediately.
    const operatorsK = loadAll(join(outDir, 'stacks/no-operators/operators/kustomization.yaml'))[0]
    expect(operatorsK).not.toHaveProperty('resources')
    expect(
      readFileSync(join(outDir, 'stacks/no-operators/operators/manifests.yaml'), 'utf-8')
    ).toBe('')

    // The stack layer still lists its manifests...
    const stackK = loadAll(join(outDir, 'stacks/no-operators/stack/kustomization.yaml'))[0]
    expect(stackK.resources).toEqual(['manifests.yaml'])
    // ...and the dependency wiring is intact (operators Kustomization
    // reconciles empty, then the stack proceeds).
    const [, stack] = loadAll(join(outDir, 'clusters/default/stacks/no-operators.yaml'))
    expect(stack.spec.dependsOn).toEqual([{ name: 'no-operators-operators' }])
  })

  it('customizes the cluster directory via the cluster option', async () => {
    const entryFile = join(testDir, 'custom-cluster.tsx')
    writeFileSync(
      entryFile,
      `
import { jsx } from '@r8s/core';

export default function Stack() {
  return jsx('Deployment', {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: 'app', namespace: 'apps' },
    spec: {
      selector: { matchLabels: { app: 'app' } },
      template: {
        metadata: { labels: { app: 'app' } },
        spec: { containers: [{ name: 'app', image: 'app:v1' }] },
      },
    },
  });
}
`,
      'utf-8'
    )
    const outDir = join(testDir, 'flux-out')

    const result = await writeFluxRecipe(entryFile, { out: outDir, cluster: 'staging' })

    expect(result.cluster).toBe('staging')
    expect(existsSync(join(outDir, 'clusters/staging/stacks/custom-cluster.yaml'))).toBe(true)
  })

  it('rejects stack names that are not DNS labels', async () => {
    const entryFile = join(testDir, 'my.stack.tsx')
    writeFileSync(entryFile, paperclipEntry, 'utf-8')

    await expect(writeFluxRecipe(entryFile, { out: join(testDir, 'flux-out') })).rejects.toThrow(
      /Invalid stack name "my\.stack"/
    )
  })
})
