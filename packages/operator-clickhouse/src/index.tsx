/**
 * @r8s/operator-clickhouse — ClickHouse Operator for Kubernetes by Altinity as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (0.25.0); consumers declare
 * `"@r8s/operator-clickhouse": "^0.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The clickhouse-operator operator version this package was cut for. */
export const DEFAULT_CLICKHOUSE_VERSION = '0.25.0'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `clickhouse-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function ClickhouseOperator(
  version: string = DEFAULT_CLICKHOUSE_VERSION
): Operator & { namespace: string } {
  return {
    name: 'clickhouse-operator',
    description: 'ClickHouse Operator for Kubernetes by Altinity',
    source: {
      type: 'helm',
      chart: 'clickhouse-operator-helm',
      repository: 'https://docs.altinity.com/clickhouse-operator/',
      version,
      namespace: '',
    },
    version,
    namespace: 'clickhouse-operator-system',
    crds: [
      'clickhouseinstallations.clickhouse.altinity.com',
      'clickhouseinstallationtemplates.clickhouse.altinity.com',
      'clickhouseoperatorconfigurations.clickhouse.altinity.com',
      'clickhousekeeperinstallations.clickhouse-keeper.altinity.com',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'clickhouse-operator'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = ClickhouseOperator

/**
 * Declare clickhouse-operator unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'clickhouse-operator')) return []
  return [declareOperator(ClickhouseOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/clickhouse'
