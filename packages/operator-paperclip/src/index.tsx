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
export const DEFAULT_PAPERCLIP_VERSION = '0.19.0'

/**
 * Operator declaration — mirror of the `paperclip-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function PaperclipOperator(
  version: string = DEFAULT_PAPERCLIP_VERSION
): Operator & { namespace: string } {
  return {
    name: 'paperclip-operator',
    description: 'Paperclip agent orchestration operator',
    source: {
      type: 'helm',
      chart: 'paperclip-operator',
      repository: 'oci://ghcr.io/paperclipinc/charts',
      version,
      namespace: 'paperclip-system',
      values: {
        metrics: { enabled: true, serviceMonitor: { enabled: false } },
        leaderElection: { enabled: false },
      },
    },
    version,
    namespace: 'paperclip-system',
    crds: ['instances.paperclip.inc'],
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
