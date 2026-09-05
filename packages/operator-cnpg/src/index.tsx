/**
 * @r8s/operator-cnpg — CloudNativePG as an npm-resolved operator package.
 *
 * Version policy: the PACKAGE version tracks the CNPG operator's own
 * version (1:1) — v1.27.x of this package ships CNPG 1.27.x. App packages
 * declare `"peerDependencies": { "@r8s/operator-cnpg": "^1.27.0" }`, so npm
 * resolves ONE compatible copy per dependency tree and rejects mixed
 * majors at install time (`npm install` fails instead of the cluster).
 *
 * The package carries two things:
 * 1. the generated CNPG CRD components (re-exported from @r8s/crds for now —
 *    generation split lands in phase 2 of the operator-packages work)
 * 2. the operator install declaration (`cnpgOperator`) + `declareCnpg`,
 *    the maybeOperator-shaped "declare unless the Platform provides it"
 */

import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The CNPG operator version this package was cut for. */
export const DEFAULT_CNPG_VERSION = '1.27.0'

/**
 * Operator declaration with the release manifest URL expanded from the
 * version. Mirror of the `cnpg` entry in packages/crds/operators.yaml —
 * that registry remains the CLI's metadata source until phase 2. Deep
 * equality with the generated entry is enforced by operator-contracts.
 */
export function cnpgOperator(version: string = DEFAULT_CNPG_VERSION): Operator & { namespace: string } {
  const minor = version.split('.').slice(0, 2).join('.')
  return {
    name: 'cnpg',
    description: 'CloudNativePG PostgreSQL operator',
    source: {
      type: 'manifest',
      url: `https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-${minor}/releases/cnpg-${version}.yaml`,
      version,
      namespace: 'cnpg-system',
    },
    version,
    namespace: 'cnpg-system',
    crds: [
      'clusters.postgresql.cnpg.io',
      'poolers.postgresql.cnpg.io',
      'scheduledbackups.postgresql.cnpg.io',
    ],
  }
}

/**
 * Declare CNPG unless the surrounding Platform already provides it.
 * Returns [] (nothing to add) or a one-element array — spread:
 * `resources.push(...declareCnpg(sharedOperators))`
 */
export function declareCnpg(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'cnpg')) return []
  return [declareOperator(cnpgOperator(version))]
}

// Generated CNPG CRD components (re-exported — the single import path for
// every consumer; the generator's own split comes in phase 2).
export {
  ClusterComponent,
  type ClusterProps,
  PoolerComponent,
  type PoolerProps,
  ScheduledBackupComponent,
  type ScheduledBackupProps,
} from '@r8s/crds/postgresql'
