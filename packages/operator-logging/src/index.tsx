/**
 * @r8s/operator-logging — Logging Operator for Kubernetes by Banzai Cloud as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (4.2.3); consumers declare
 * `"@r8s/operator-logging": "^4.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The logging-operator operator version this package was cut for. */
export const DEFAULT_LOGGING_VERSION = '4.2.3'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `logging-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function LoggingOperator(
  version: string = DEFAULT_LOGGING_VERSION
): Operator & { namespace: string } {
  return {
    name: 'logging-operator',
    description: 'Logging Operator for Kubernetes by Banzai Cloud',
    source: {
      type: 'helm',
      chart: 'logging-operator',
      repository: 'https://kube-logging.github.io/helm-charts',
      version,
      namespace: '',
    },
    version,
    namespace: 'logging',
    crds: [
      'loggings.logging.banzaicloud.io',
      'flows.logging.banzaicloud.io',
      'clusterflows.logging.banzaicloud.io',
      'outputs.logging.banzaicloud.io',
      'clusteroutputs.logging.banzaicloud.io',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'logging-operator'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = LoggingOperator

/**
 * Declare logging-operator unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'logging-operator')) return []
  return [declareOperator(LoggingOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/logging'
