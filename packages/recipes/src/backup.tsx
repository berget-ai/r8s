import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { declareIfMissing } from '@r8s/operator-velero'
import { useS3, isBucketElement, resolveBucket, type BucketProps } from './s3-provider'
import type { r8sElement } from '@r8s/core'

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
  /**
   * <Bucket name="…"/> descriptor element — scopes the BackupStorageLocation
   * to that prefix (`<name>/velero`) of the surrounding provider's bucket.
   */
  bucket?: r8sElement
  /**
   * Key inside the store's credentials Secret holding a velero-format
   * cloud credentials file (`[default] aws_access_key_id = …`). Omit on
   * workload-identity / IRSA clusters.
   */
  credentialKey?: string
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
export function Backup(props: BackupProps) {
  const {
    name,
    namespace = 'default',
    schedule = '0 2 * * *',
    namespaces,
    storageLocation,
    bucket: bucketProp,
    credentialKey: credentialKeyProp,
    ttl = '720h',
  } = props

  const sharedOperators = useContext(OperatorContext)
  const s3 = useS3()
  let bucketDesc: ReturnType<typeof resolveBucket> | undefined
  if (bucketProp) {
    if (!isBucketElement(bucketProp)) {
      throw new Error(
        'Backup "bucket" prop takes a <Bucket name="…" /> descriptor — got ' +
          (typeof bucketProp === 'object' ? 'another element/object' : `a ${typeof bucketProp}`)
      )
    }
    bucketDesc = resolveBucket(bucketProp, s3)
  }
  if (storageLocation && (bucketProp || credentialKeyProp)) {
    throw new Error(
      `<Backup "${name}">: storageLocation points at an externally-managed
` +
        `BackupStorageLocation — bucket/credentialKey would be ignored.\n` +
        `\n` +
        `Remove storageLocation to target the platform S3 store, or drop\n` +
        `bucket/credentialKey to keep the external location.`
    )
  }
  const storeS3 = bucketDesc ? bucketDesc.s3 : s3
  const storePrefix = bucketDesc ? bucketDesc.prefix : undefined
  const resources: ReturnType<typeof jsx>[] = []

  resources.push(...declareIfMissing(sharedOperators))

  // S3 provider: emit the BackupStorageLocation against the 'velero/'
  // prefix of the platform bucket and point the schedule at it. Without a
  // provider the schedule references 'default' — a storage location the
  // cluster is expected to manage itself.
  const locationName = storeS3 && !storageLocation ? name : (storageLocation ?? 'default')

  if (storeS3 && !storageLocation) {
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
            bucket: storeS3.bucket,
            prefix: storePrefix ? `${storePrefix}/velero` : 'velero',
          },
          config: {
            region: storeS3.region ?? 'us-east-1',
            ...(storeS3.forcePathStyle !== false && { s3ForcePathStyle: 'true' }),
            s3Url: storeS3.endpoint,
          },
          // Velero owns how it reads the credential — its key inside the
          // store's Secret. Omit on workload-identity/IRSA clusters.
          ...(credentialKeyProp && {
            credential: { name: storeS3.credentialsSecret, key: credentialKeyProp },
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
