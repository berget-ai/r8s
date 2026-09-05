/**
 * @r8s/operator-external-dns — ExternalDNS for automatic DNS management as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (1.21.1); consumers declare
 * "@r8s/operator-external-dns": "^1.0.0" as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The external-dns operator version this package was cut for. */
export const DEFAULT_EXTERNALDNS_VERSION = '1.21.1'

/**
 * Operator declaration — mirror of the `external-dns` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function ExternalDnsOperator(
  version: string = DEFAULT_EXTERNALDNS_VERSION
): Operator & { namespace: string } {
  return {
    name: 'external-dns',
    description: 'ExternalDNS for automatic DNS management',
    source: {
      type: 'helm',
      chart: 'external-dns',
      repository: 'https://kubernetes-sigs.github.io/external-dns/',
      version,
      namespace: 'external-dns',
    },
    version,
    namespace: 'external-dns',
    crds: ['dnsendpoints.externaldns.k8s.io'],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'external-dns'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = ExternalDnsOperator

/**
 * Declare external-dns unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'external-dns')) return []
  return [declareOperator(ExternalDnsOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/externaldns'
