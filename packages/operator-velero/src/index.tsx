/**
 * @r8s/operator-velero — Velero backup and disaster recovery as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (1.13.0); consumers declare
 * `"@r8s/operator-velero": "^1.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The velero operator version this package was cut for. */
export const DEFAULT_VELERO_VERSION = '1.13.0'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `velero` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function VeleroOperator(
  version: string = DEFAULT_VELERO_VERSION
): Operator & { namespace: string } {
  return {
    name: 'velero',
    description: 'Velero backup and disaster recovery',
    source: {
      type: 'manifest',
      url: expandVersion(
        'https://raw.githubusercontent.com/vmware-tanzu/velero/v${version}/config/crd/v1/bases/velero.io_backups.yaml',
        version
      ),
      version,
      namespace: '',
    },
    version,
    namespace: 'velero',
    crds: [
      'backups.velero.io',
      'restores.velero.io',
      'schedules.velero.io',
      'backupstoragelocations.velero.io',
      'volumesnapshotlocations.velero.io',
      'deletebackuprequests.velero.io',
      'downloadrequests.velero.io',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'velero'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = VeleroOperator

/**
 * Declare velero unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'velero')) return []
  return [declareOperator(VeleroOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/velero'
