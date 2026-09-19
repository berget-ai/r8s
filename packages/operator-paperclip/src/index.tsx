/**
 * @r8s/operator-paperclip — Paperclip agent orchestration operator as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (0.19.0); consumers declare
 * "@r8s/operator-paperclip": "^0.0.0" as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The paperclip-operator operator version this package was cut for. */
export const DEFAULT_PAPERCLIP_VERSION = '0.19.1'

/** Upstream static install manifest, expanded from the version. */
const PAPERCLIP_MANIFEST_URL =
  'https://github.com/paperclipinc/paperclip-operator/releases/download/v{version}/install.yaml'

/**
 * Operator declaration — mirror of the `paperclip-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 *
 * Helm-free install: paperclipinc attaches the fully rendered install.yaml
 * (Namespace, CRDs, RBAC, Deployment, Service) to every GitHub release —
 * fetched at render time by the recipes/flux pipeline, no OCI chart access.
 *
 * The static manifest deploys into `paperclip-operator-system` (the chart
 * defaulted to `paperclip-system`) and carries all three CRDs the operator
 * owns, not just `instances.paperclip.inc`. The previous chart tuning
 * values (metrics serviceMonitor off, leaderElection off) do not apply —
 * the manifest ships its own metrics Service and single-replica manager.
 */
export function PaperclipOperator(
  version: string = DEFAULT_PAPERCLIP_VERSION
): Operator & { namespace: string } {
  return {
    name: 'paperclip-operator',
    description: 'Paperclip agent orchestration operator',
    source: {
      type: 'manifest',
      url: PAPERCLIP_MANIFEST_URL.replaceAll('{version}', version),
      version,
      namespace: 'paperclip-operator-system',
    },
    version,
    namespace: 'paperclip-operator-system',
    crds: [
      'instances.paperclip.inc',
      'paperclipclusterdefaults.paperclip.inc',
      'paperclipselfconfigs.paperclip.inc',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'paperclip-operator'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = PaperclipOperator

/**
 * Declare paperclip-operator unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'paperclip-operator')) return []
  return [declareOperator(PaperclipOperator(version))]
}
