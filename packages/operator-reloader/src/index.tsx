/**
 * @r8s/operator-reloader — Stakater Reloader as an npm-resolved operator
 * package. The package version tracks the Reloader APPLICATION release tag
 * (v1.4.22 — the app the release artifacts ship); the Helm chart that
 * historically drove the version axis was chart 2.2.17 with appVersion
 * v1.4.22, and the static install manifest lives under the app tag.
 * Consumers declare "@r8s/operator-reloader": "^<major>.0.0" as a
 * peerDependency so npm resolves ONE copy per tree and mixed majors fail
 * at install time.
 *
 * Reloader watches Secrets and ConfigMaps and rolling-restarts the
 * Deployments/StatefulSets annotated `reloader.stakater.com/auto: "true"`.
 * The recipes layer pairs it with the rotation-capable secrets backends
 * (openbao/vault): the Vault Secrets Operator re-syncs Secrets in place,
 * so consumers only see rotated values after a pod restart — Reloader
 * performs exactly that restart when the observed Secret changes.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The reloader application release tag this package was cut for. */
export const DEFAULT_RELOADER_VERSION = '1.4.22'

/** Upstream static install manifest, expanded from the version. */
const RELOADER_MANIFEST_URL =
  'https://raw.githubusercontent.com/stakater/Reloader/v{version}/deployments/kubernetes/reloader.yaml'

/**
 * Operator declaration — mirror of the `reloader` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 *
 * Helm-free install: Stakater publishes a rendered Deployment + RBAC
 * manifest per release tag (the same content the reloader chart renders),
 * fetched at render time by the recipes/flux pipeline — no
 * HelmRepository needed.
 */
export function ReloaderOperator(
  version: string = DEFAULT_RELOADER_VERSION
): Operator & { namespace: string } {
  return {
    name: 'reloader',
    description: 'Stakater Reloader — rolls workloads when their Secrets or ConfigMaps change',
    source: {
      type: 'manifest',
      url: RELOADER_MANIFEST_URL.replaceAll('{version}', version),
      version,
      namespace: 'reloader',
    },
    version,
    namespace: 'reloader',
    // Reloader is a Deployment + RBAC — it defines no custom resources.
    crds: [],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'reloader'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = ReloaderOperator

/**
 * The pod-template annotation that opts a workload into Reloader's
 * rollout-on-change behavior. Rendered by WebService/App under the
 * rotation-capable secrets backends (see packages/recipes/src/web-service.tsx).
 */
export const RELOADER_ANNOTATION = 'reloader.stakater.com/auto'

/**
 * Declare reloader unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'reloader')) return []
  return [declareOperator(ReloaderOperator(version))]
}

// Reloader ships no CRDs — the declaration + install manifest is the whole
// contract; nothing to re-export from @r8s/crds.
