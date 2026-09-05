import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { useS3, isBucketElement, resolveBucket } from './s3-provider'

export interface BackupProps {
  /** Resource name */
  name: string
  /** Default namespace to back up (used when `namespaces` is not set) */
  namespace?: string
  /** Cron schedule for backups (defaults to daily at 2 AM) */
  schedule?: string
  /** Namespaces to include in backups (defaults to the current namespace) */
  namespaces?: string[]
  /**
   * Velero storage location name. With an S3 provider on the Platform this
   * defaults to this component's name (the emitted BackupStorageLocation);
   * without one, 'default' (an externally-managed location must exist).
   */

  storageLocation?: string
  /** Backup retention (e.g., '720h' for 30 days) */
  ttl?: string
}

/**
 * Backup — scheduled cluster backups with Velero.
 *
 * @title Backup
 * @category Security & Identity
 *
 * Creates a Velero Schedule that backs up your namespaces on a cron
 * schedule. Pair with a BackupStorageLocation (S3/GCS/Azure) for
 * off-cluster storage.
 *
 * The Velero operator is declared as a dependency.
 *
 * @example
 * import { Backup } from '@r8s/recipes'
 *
 * export default <Backup name="daily" />
 *
 * @example
 * import { Backup } from '@r8s/recipes'
 *
 * export default (
 *   <Backup
 *     name="weekly"
 *     schedule="0 3 * * 0"
 *     namespaces={['production', 'staging']}
 *     ttl="720h"
 *   />
 * )
 */
export function Backup(props: BackupProps & { bucket?: unknown }) {
  const {
    name,
    namespace = 'default',
    schedule = '0 2 * * *',
    namespaces,
    storageLocation,
    bucket: bucketProp,
    ttl = '720h',
  } = props

  const sharedOperators = useContext(OperatorContext)
  const s3 = useS3()
  const bucketDesc =
    bucketProp && isBucketElement(bucketProp) ? resolveBucket(bucketProp, s3) : undefined
  const effectiveS3 = bucketDesc ? bucketDesc.s3 : s3
  const hasVelero = sharedOperators.some((op) => op.name === 'velero')

  const resources: ReturnType<typeof jsx>[] = []

  if (!hasVelero) {
    resources.push(declareOperator(operators['velero']()))
  }

  // S3 provider: emit the BackupStorageLocation against the 'velero/'
  // prefix of the platform bucket and point the schedule at it. Without a
  // provider the schedule references 'default' — a storage location the
  // cluster is expected to manage itself.
  const locationName = effectiveS3 && !storageLocation ? name : (storageLocation ?? 'default')

  if (effectiveS3 && !storageLocation) {
    resources.push(
      jsx('BackupStorageLocation', {
        apiVersion: 'velero.io/v1',
        kind: 'BackupStorageLocation',
        metadata: { name, namespace: 'velero' },
        spec: {
          // no `default: true` — two <Backup> components must not fight over
          // it; each Schedule pins its storageLocation explicitly
          provider: 'aws',
          objectStorage: {
            bucket: effectiveS3.bucket,
            prefix: bucketDesc ? `${bucketDesc.prefix}/velero` : 'velero',
          },
          config: {
            region: effectiveS3.region ?? 'us-east-1',
            ...(effectiveS3.forcePathStyle !== false && { s3ForcePathStyle: 'true' }),
            s3Url: effectiveS3.endpoint,
          },
          ...(effectiveS3.veleroCredentialKey && {
            credential: {
              name: effectiveS3.credentialsSecret,
              key: effectiveS3.veleroCredentialKey,
            },
          }),
        },
      })
    )
  }

  resources.push(
    jsx('Schedule', {
      apiVersion: 'velero.io/v1',
      kind: 'Schedule',
      metadata: { name, namespace: 'velero' },
      spec: {
        schedule,
        template: {
          includedNamespaces: namespaces ?? [namespace],
          storageLocation: locationName,
          ttl,
        },
      },
    })
  )

  return jsx(Fragment, { children: resources })
}
