/**
 * @r8s/operator-loki — Grafana Loki — horizontally-scalable, highly-available log aggregation as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (5.47.0); consumers declare
 * `"@r8s/operator-loki": "^5.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The loki operator version this package was cut for. */
export const DEFAULT_LOKI_VERSION = '5.47.0'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `loki` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function LokiOperator(
  version: string = DEFAULT_LOKI_VERSION
): Operator & { namespace: string } {
  return {
    name: 'loki',
    description: 'Grafana Loki \u2014 horizontally-scalable, highly-available log aggregation',
    source: {
      type: 'helm',
      chart: 'loki',
      repository: 'https://grafana.github.io/helm-charts',
      version,
      namespace: '',
    },
    version,
    namespace: 'loki',
    crds: [
      'lokistacks.loki.grafana.com',
      'alertingrules.loki.grafana.com',
      'recordingrules.loki.grafana.com',
      'rulerconfigs.loki.grafana.com',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'loki'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = LokiOperator

/**
 * Declare loki unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'loki')) return []
  return [declareOperator(LokiOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/loki'
