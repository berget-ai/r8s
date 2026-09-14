/**
 * `r8s flux` — emit the two-Kustomization stack recipe for a fresh cluster.
 *
 * The stateless-install promise as an artifact: an operators Kustomization
 * (HelmRepository + HelmRelease per declared operator — CRDs installed,
 * operator Ready) and a stack Kustomization carrying the package resources,
 * wired together with dependsOn + wait + healthChecks so Flux reconciles
 * them in order (operators first, stack only once the operators are Ready).
 *
 * Rendered layout (output dir):
 *   stacks/<name>/operators/kustomization.yaml + manifests.yaml
 *   stacks/<name>/stack/kustomization.yaml      + manifests.yaml
 *   clusters/<cluster>/stacks/<name>.yaml       # the two Flux Kustomizations
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
 * The two Flux Kustomizations: `<name>-operators` (wait: true so CRDs are
 * installed and the operator Ready) and `<name>-stack`, which dependsOn the
 * operators Kustomization and carries the workload healthChecks.
 */
function fluxKustomizationDocs(
  name: string,
  options: FluxRecipeOptions,
  healthChecks: { apiVersion: string; kind: string; name: string; namespace?: string }[]
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

  return [
    {
      apiVersion: 'kustomize.toolkit.fluxcd.io/v1',
      kind: 'Kustomization',
      metadata: { name: `${name}-operators`, namespace: sourceNamespace },
      spec: { ...shared, path: `stacks/${name}/operators`, timeout: OPERATORS_TIMEOUT },
    },
    {
      apiVersion: 'kustomize.toolkit.fluxcd.io/v1',
      kind: 'Kustomization',
      metadata: { name: `${name}-stack`, namespace: sourceNamespace },
      spec: {
        ...shared,
        path: `stacks/${name}/stack`,
        timeout: STACK_TIMEOUT,
        dependsOn: [{ name: `${name}-operators` }],
        ...(healthChecks.length > 0 ? { healthChecks } : {}),
      },
    },
  ]
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
  const outDir = resolve(options.out)
  const cluster = options.cluster ?? 'default'
  const name = options.name ?? basename(entryFile).replace(/\.(tsx|ts|jsx|js)$/, '')

  if (!DNS_LABEL_RE.test(name)) {
    throw new Error(
      `Invalid stack name "${name}" — must be a DNS label (lowercase alphanumerics and '-'). Pass --name <name>.`
    )
  }

  const renderResult = await bundleAndRender(entryFile)

  if (renderResult.resources.length === 0) {
    throw new Error(
      `No Kubernetes resources rendered from ${entryFile}. ` +
        `Ensure your component returns resources with 'apiVersion' and 'kind'.`
    )
  }

  const operatorDocs = helmOperatorDocs(renderResult.operators, options.namespace)

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
  const fetchedManifests =
    renderResult.operators.some((op) => op.source.type === 'manifest') === true
      ? await fetchOperatorManifests(renderResult.operators)
      : []

  // Guardrails run over BOTH layers before anything is serialized — the
  // stack resources and the helm chart values inside the HelmReleases
  // (plain fetched operator manifests are external content, same policy
  // as `r8s operators`).
  enforceSecretGuardrails(operatorDocs, options)
  enforceSecretGuardrails(renderResult.resources, options)

  const redact = (docs: any[]): any[] =>
    options.redactSecrets ? docs.map((doc) => maskSecretValues(doc)) : docs

  const operatorYaml = [dumpDocs(redact(operatorDocs)), ...fetchedManifests]
    .filter(Boolean)
    .join('---\n')

  const sourceNamespace = options.sourceNamespace ?? 'flux-system'
  const kustomizationDocs = fluxKustomizationDocs(
    name,
    { ...options, sourceNamespace },
    pickHealthChecks(renderResult.resources)
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

  const repoName = options.source ?? 'flux-system'
  console.log(`\nr8s flux recipe: ${name} (cluster: ${cluster})`)
  for (const relPath of files) console.log(`  ${relPath}`)
  console.log(
    `\nApply to a fresh cluster (Flux bootstrapped, GitRepository "${repoName}" in ${sourceNamespace}):`
  )
  console.log(`  kubectl apply -f clusters/${cluster}/stacks/${name}.yaml`)

  return { name, cluster, files }
}
