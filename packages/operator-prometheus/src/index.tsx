/**
 * @r8s/operator-prometheus — Prometheus monitoring stack (kube-prometheus-stack) as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (58.4.0); consumers declare
 * `"@r8s/operator-prometheus": "^58.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The prometheus operator version this package was cut for. */
export const DEFAULT_PROMETHEUS_VERSION = '58.4.0'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `prometheus` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function PrometheusOperator(
  version: string = DEFAULT_PROMETHEUS_VERSION
): Operator & { namespace: string } {
  return {
    name: 'prometheus',
    description: 'Prometheus monitoring stack (kube-prometheus-stack)',
    source: {
      type: 'helm',
      chart: 'kube-prometheus-stack',
      repository: 'https://prometheus-community.github.io/helm-charts',
      version,
      namespace: '',
    },
    version,
    namespace: 'monitoring',
    crds: [
      'alertmanagers.monitoring.coreos.com',
      'alertmanagerconfigs.monitoring.coreos.com',
      'podmonitors.monitoring.coreos.com',
      'probes.monitoring.coreos.com',
      'prometheuses.monitoring.coreos.com',
      'prometheusrules.monitoring.coreos.com',
      'scrapeconfigs.monitoring.coreos.com',
      'servicemonitors.monitoring.coreos.com',
      'thanosrulers.monitoring.coreos.com',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'prometheus'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = PrometheusOperator

/**
 * Declare prometheus unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'prometheus')) return []
  return [declareOperator(PrometheusOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/monitoring'
