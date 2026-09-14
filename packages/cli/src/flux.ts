/**
 * `r8s flux` — emit the two-Kustomization stack recipe for a fresh cluster.
 *
 * The stateless-install promise as an artifact: an operators Kustomization
 * (HelmRepository + HelmRelease per declared operator — CRDs installed,
 * operator Ready) and a stack Kustomization carrying the package resources,
 * wired together with dependsOn + wait + healthChecks so Flux reconciles
 * them in order (operators first, stack only once the operators are Ready).
 *
 * Rendered layout (output dir, default mode):
 *   stacks/<name>/operators/kustomization.yaml + manifests.yaml
 *   stacks/<name>/stack/kustomization.yaml      + manifests.yaml
 *   clusters/<cluster>/stacks/<name>.yaml       # the two Flux Kustomizations
 *
 * Two composable single-layer modes for full-catalog installs, where ~20
 * package stacks would otherwise collide per-stack on HelmRelease names
 * under prune — so ONE shared operators layer is emitted once and every
 * package stack dependsOn it:
 *   --operators-only                only the operators layer + the single
 *                                   <name>-operators Kustomization CR
 *   --shared-operators <kustomization-name>
 *                                   only the stack layer + the single
 *                                   <name>-stack CR depending on <name>
 *                                   instead of <name>-operators
 */
import * as yaml from 'js-yaml'
import { mkdirSync, writeFileSync } from 'fs'
import { basename, dirname, join, resolve } from 'path'
import type { Operator } from '@r8s/k8s-types'
import { fetchOperatorManifests, maskSecretValues } from '@r8s/core'
import { bundleAndRender, enforceSecretGuardrails, type RenderOptions } from './renderer'

export interface FluxRecipeOptions extends RenderOptions {
  /** Output directory for the recipe (files land in stacks/ + clusters/). */
  out: string
  /** Stack name — defaults to the entry file basename without extension. */
  name?: string
  /** GitRepository name the Kustomizations reconcile from (flux bootstrap's default). */
  source?: string
  /** Namespace of the GitRepository — also home of the Kustomization CRs. */
  sourceNamespace?: string
  /** Fallback namespace for Helm resources when an operator declares none. */
  namespace?: string
  /** Cluster directory under clusters/ — 'default' when omitted. */
  cluster?: string
  /**
   * Emit only the shared operators layer — `stacks/<name>/operators/` +
   * the single `<name>-operators` Kustomization CR. Use with a synthetic
   * entry that declares every operator a full-catalog install shares.
   * Mutually exclusive with `sharedOperators`.
   */
  operatorsOnly?: boolean
  /**
   * Emit only the package stack layer, depending on the named shared
   * operators Kustomization (instead of the per-stack `<name>-operators`).
   * Operators declared in the entry are skipped — they belong to the
   * shared layer. Mutually exclusive with `operatorsOnly`.
   */
  sharedOperators?: string
}

export interface FluxRecipeResult {
  name: string
  cluster: string
  /** Paths written, relative to the output directory. */
  files: string[]
}

const RECONCILE_INTERVAL = '5m'
const OPERATORS_TIMEOUT = '8m'
const STACK_TIMEOUT = '12m'
const MAX_HEALTH_CHECKS = 5

const DNS_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

/**
 * HelmRepository + HelmRelease per declared helm operator — the Flux
 * translation of the operator's `source: { type: 'helm', ... }` shape.
 * The operator name doubles as the repo/release name; OCI repositories
 * carry the `type: oci` marker, plain HTTP ones do not.
 */
function helmOperatorDocs(operators: Operator[], fallbackNamespace?: string): any[] {
  const docs: any[] = []

  for (const op of operators) {
    if (op.source.type !== 'helm') continue
    // Helm resources must land in a namespace — the operator's declared
    // one, or the caller's default. (source-controller requires it.)
    const namespace = op.source.namespace ?? fallbackNamespace ?? 'default'
    const isOci = op.source.repository.startsWith('oci://')

    docs.push({
      apiVersion: 'source.toolkit.fluxcd.io/v1',
      kind: 'HelmRepository',
      metadata: { name: op.name, namespace },
      spec: {
        // OCI repos need type: oci so source-controller authenticates
        // against the registry instead of fetching a Helm index.
        ...(isOci ? { type: 'oci' } : {}),
        url: op.source.repository,
        interval: RECONCILE_INTERVAL,
      },
    })

    docs.push({
      apiVersion: 'helm.toolkit.fluxcd.io/v2',
      kind: 'HelmRelease',
      metadata: { name: op.name, namespace },
      spec: {
        interval: RECONCILE_INTERVAL,
        chart: {
          spec: {
            chart: op.source.chart,
            version: op.source.version,
            sourceRef: { kind: 'HelmRepository', name: op.name, namespace },
          },
        },
        ...(op.source.values ? { values: op.source.values } : {}),
      },
    })
  }

  return docs
}

/**
 * healthChecks for the stack Kustomization: one apps/v1 ref per distinct
 * Deployment/StatefulSet in the rendered resources, capped — the CR stays
 * readable and Flux health assessment stays targeted. Empty when the
 * package renders no long-running workloads.
 */
function pickHealthChecks(resources: any[]): {
  apiVersion: string
  kind: string
  name: string
  namespace?: string
}[] {
  const seen = new Map<string, Record<string, string>>()

  for (const r of resources) {
    if (r?.kind !== 'Deployment' && r?.kind !== 'StatefulSet') continue
    if (!r?.metadata?.name) continue
    const ns = r.metadata.namespace
    const key = `${ns ?? ''}/${r.kind}/${r.metadata.name}`
    if (!seen.has(key)) {
      seen.set(key, {
        apiVersion: 'apps/v1',
        kind: r.kind,
        name: r.metadata.name,
        ...(ns ? { namespace: ns } : {}),
      })
    }
    if (seen.size >= MAX_HEALTH_CHECKS) break
  }

  return Array.from(seen.values()) as {
    apiVersion: string
    kind: string
    name: string
    namespace?: string
  }[]
}

/**
 * Which layers the recipe emits: both (default), only the shared operators
 * layer, or only the package stack layer.
 */
export type FluxRecipeMode = 'default' | 'operators-only' | 'shared-operators'

/**
 * The Flux Kustomization CRs per mode. Default: the `<name>-operators` /
 * `<name>-stack` pair wired with dependsOn. Operators-only: just the
 * `<name>-operators` CR — the shared layer every package stack points at
 * with `--shared-operators <name>-operators`. Shared-operators: just the
 * `<name>-stack` CR, depending on the named shared operators Kustomization
 * instead of the per-stack one.
 */
function fluxKustomizationDocs(
  name: string,
  options: FluxRecipeOptions,
  mode: FluxRecipeMode,
  sharedOperatorsName: string | undefined,
  healthChecks: { apiVersion: string; kind: string; name: string; namespace?: string }[] = []
): any[] {
  const sourceNamespace = options.sourceNamespace ?? 'flux-system'
  const sourceRef = {
    kind: 'GitRepository',
    name: options.source ?? 'flux-system',
    namespace: sourceNamespace,
  }
  const shared = {
    interval: RECONCILE_INTERVAL,
    prune: true,
    wait: true,
    sourceRef,
  }

  const operatorsDoc = {
    apiVersion: 'kustomize.toolkit.fluxcd.io/v1',
    kind: 'Kustomization',
    metadata: { name: `${name}-operators`, namespace: sourceNamespace },
    spec: { ...shared, path: `stacks/${name}/operators`, timeout: OPERATORS_TIMEOUT },
  }

  const dependsOnName =
    mode === 'shared-operators' ? (sharedOperatorsName as string) : `${name}-operators`
  const stackDoc = {
    apiVersion: 'kustomize.toolkit.fluxcd.io/v1',
    kind: 'Kustomization',
    metadata: { name: `${name}-stack`, namespace: sourceNamespace },
    spec: {
      ...shared,
      path: `stacks/${name}/stack`,
      timeout: STACK_TIMEOUT,
      dependsOn: [{ name: dependsOnName }],
      ...(healthChecks.length > 0 ? { healthChecks } : {}),
    },
  }

  if (mode === 'operators-only') return [operatorsDoc]
  if (mode === 'shared-operators') return [stackDoc]
  return [operatorsDoc, stackDoc]
}

function dumpDocs(docs: unknown[]): string {
  return docs
    .map((doc) =>
      yaml.dump(doc, {
        sortKeys: false,
        noRefs: true,
        lineWidth: -1,
      })
    )
    .join('---\n')
}

/**
 * Render `<entryFile>` and write the full Flux stack recipe under
 * `options.out`. Exported for tests — the CLI wraps it with arg parsing.
 */
export async function writeFluxRecipe(
  entryFile: string,
  options: FluxRecipeOptions
): Promise<FluxRecipeResult> {
  if (options.operatorsOnly && options.sharedOperators) {
    throw new Error(
      '--operators-only and --shared-operators are mutually exclusive — ' +
        'emit the shared operators layer as its own stack (one r8s flux run ' +
        'with --operators-only), then point each package stack at it with --shared-operators.'
    )
  }

  if (options.sharedOperators && !DNS_LABEL_RE.test(options.sharedOperators)) {
    throw new Error(
      `Invalid --shared-operators name "${options.sharedOperators}" — must be a DNS label ` +
        `(lowercase alphanumerics and '-'). It is the Kustomization CR name the stack dependsOn.`
    )
  }

  const mode: FluxRecipeMode = options.operatorsOnly
    ? 'operators-only'
    : options.sharedOperators
      ? 'shared-operators'
      : 'default'

  const outDir = resolve(options.out)
  const cluster = options.cluster ?? 'default'
  const name = options.name ?? basename(entryFile).replace(/\.(tsx|ts|jsx|js)$/, '')

  if (!DNS_LABEL_RE.test(name)) {
    throw new Error(
      `Invalid stack name "${name}" — must be a DNS label (lowercase alphanumerics and '-'). Pass --name <name>.`
    )
  }

  const renderResult = await bundleAndRender(entryFile)

  // A synthetic shared-operators entry may declare only operators, so the
  // no-resources requirement applies to stack-carrying modes only.
  if (mode !== 'operators-only' && renderResult.resources.length === 0) {
    throw new Error(
      `No Kubernetes resources rendered from ${entryFile}. ` +
        `Ensure your component returns resources with 'apiVersion' and 'kind'.`
    )
  }

  // Operators-only IS the shared operators layer — nothing to reconcile
  // unless the entry declares operators a stack can depend on.
  if (
    mode === 'operators-only' &&
    !renderResult.operators.some((op) => op.source.type === 'helm' || op.source.type === 'manifest')
  ) {
    throw new Error(
      `No operators declared in ${entryFile}. ` +
        `--operators-only emits the shared operators layer, so the entry must declare operators (helm or manifest sources).`
    )
  }

  const emitOperatorsLayer = mode !== 'shared-operators'
  const emitStackLayer = mode !== 'operators-only'

  const operatorDocs = emitOperatorsLayer
    ? helmOperatorDocs(renderResult.operators, options.namespace)
    : []

  if (emitOperatorsLayer) {
    // Helm operators translate to HelmRepository + HelmRelease above. Raw
    // (manifest) operators keep the existing fetch-at-render path — their
    // manifests are committed into the operators layer next to the Flux
    // docs. OLM/flux-source operators have no recipe translation yet; say
    // so instead of silently dropping them.
    const unsupported = renderResult.operators.filter(
      (op) => op.source.type !== 'helm' && op.source.type !== 'manifest'
    )
    for (const op of unsupported) {
      console.error(
        `⚠️  Operator "${op.name}" declares source type "${op.source.type}" — not supported by the flux recipe yet, skipped.`
      )
    }
  } else {
    // package stack pointing at the shared layer: the shared operators
    // layer owns operator installation — anything declared here would
    // collide with it under prune (same HelmRelease names). Name them,
    // skip them.
    if (renderResult.operators.length > 0) {
      const declared = renderResult.operators.map((op) => op.name).join(', ')
      console.error(
        `⚠️  --shared-operators "${options.sharedOperators}": operators [${declared}] declared in the entry are skipped — the shared operators layer owns operator installation.`
      )
    }
  }

  const fetchedManifests =
    emitOperatorsLayer &&
    renderResult.operators.some((op) => op.source.type === 'manifest') === true
      ? await fetchOperatorManifests(renderResult.operators)
      : []

  // Guardrails run over BOTH layers before anything is serialized — the
  // stack resources and the helm chart values inside the HelmReleases
  // (plain fetched operator manifests are external content, same policy
  // as `r8s operators`). Per mode, only over the layers being emitted.
  if (emitOperatorsLayer) enforceSecretGuardrails(operatorDocs, options)
  if (emitStackLayer) enforceSecretGuardrails(renderResult.resources, options)

  const redact = (docs: any[]): any[] =>
    options.redactSecrets ? docs.map((doc) => maskSecretValues(doc)) : docs

  const operatorYaml = [dumpDocs(redact(operatorDocs)), ...fetchedManifests]
    .filter(Boolean)
    .join('---\n')

  const sourceNamespace = options.sourceNamespace ?? 'flux-system'
  const kustomizationDocs = fluxKustomizationDocs(
    name,
    { ...options, sourceNamespace },
    mode,
    options.sharedOperators,
    emitStackLayer ? pickHealthChecks(renderResult.resources) : []
  )

  const layerKustomization = (hasManifests: boolean) => ({
    apiVersion: 'kustomize.config.k8s.io/v1beta1',
    kind: 'Kustomization',
    // An empty operators layer (stack declares no operators) builds to an
    // empty set — valid kustomize, Flux reconciles it to Ready at once.
    ...(hasManifests ? { resources: ['manifests.yaml'] } : {}),
  })

  const files: string[] = []
  const write = (relPath: string, content: string) => {
    const absolute = join(outDir, relPath)
    mkdirSync(dirname(absolute), { recursive: true })
    writeFileSync(absolute, content, 'utf-8')
    files.push(relPath)
  }

  if (mode === 'operators-only') {
    write(
      `stacks/${name}/operators/kustomization.yaml`,
      dumpDocs([layerKustomization(operatorYaml.length > 0)])
    )
    write(`stacks/${name}/operators/manifests.yaml`, operatorYaml)
    write(`clusters/${cluster}/stacks/${name}.yaml`, dumpDocs(kustomizationDocs))
  } else if (mode === 'shared-operators') {
    write(
      `stacks/${name}/stack/kustomization.yaml`,
      dumpDocs([layerKustomization(renderResult.resources.length > 0)])
    )
    write(`stacks/${name}/stack/manifests.yaml`, dumpDocs(redact(renderResult.resources)))
    write(`clusters/${cluster}/stacks/${name}.yaml`, dumpDocs(kustomizationDocs))
  } else {
    write(
      `stacks/${name}/operators/kustomization.yaml`,
      dumpDocs([layerKustomization(operatorYaml.length > 0)])
    )
    write(`stacks/${name}/operators/manifests.yaml`, operatorYaml)
    write(
      `stacks/${name}/stack/kustomization.yaml`,
      dumpDocs([layerKustomization(renderResult.resources.length > 0)])
    )
    write(`stacks/${name}/stack/manifests.yaml`, dumpDocs(redact(renderResult.resources)))
    write(`clusters/${cluster}/stacks/${name}.yaml`, dumpDocs(kustomizationDocs))
  }

  const repoName = options.source ?? 'flux-system'
  if (mode === 'operators-only') {
    console.log(`\nr8s flux shared operators recipe: ${name} (cluster: ${cluster})`)
    for (const relPath of files) console.log(`  ${relPath}`)
    console.log(
      `\nApply to a fresh cluster (Flux bootstrapped, GitRepository "${repoName}" in ${sourceNamespace}):`
    )
    console.log(`  kubectl apply -f clusters/${cluster}/stacks/${name}.yaml`)
    console.log(
      `\nPackage stacks point at this layer with: r8s flux <entry.tsx> --out <dir> --shared-operators ${name}-operators`
    )
  } else if (mode === 'shared-operators') {
    console.log(`\nr8s flux package stack recipe: ${name} (cluster: ${cluster})`)
    for (const relPath of files) console.log(`  ${relPath}`)
    console.log(
      `\nApply to a fresh cluster (Flux bootstrapped, GitRepository "${repoName}" in ${sourceNamespace}):`
    )
    console.log(`  kubectl apply -f clusters/${cluster}/stacks/${name}.yaml`)
    console.log(
      `The stack reconciles only once the "${options.sharedOperators}" Kustomization is Ready (dependsOn + wait).`
    )
  } else {
    console.log(`\nr8s flux recipe: ${name} (cluster: ${cluster})`)
    for (const relPath of files) console.log(`  ${relPath}`)
    console.log(
      `\nApply to a fresh cluster (Flux bootstrapped, GitRepository "${repoName}" in ${sourceNamespace}):`
    )
    console.log(`  kubectl apply -f clusters/${cluster}/stacks/${name}.yaml`)
  }

  return { name, cluster, files }
}
