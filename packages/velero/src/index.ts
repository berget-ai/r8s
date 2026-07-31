import { jsx, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { manifestOperator } from '@r8s/k8s-types'

/** Velero operator declaration */
export const veleroOperator = (version = '1.13.0') =>
  manifestOperator(
    'velero',
    `https://github.com/vmware-tanzu/velero/releases/download/v${version}/velero-v${version}-linux-amd64.tar.gz`,
    version,
    {
      description: 'Velero backup and disaster recovery',
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
  )

export interface BackupProps {
  name: string
  namespace?: string
  /** Included namespaces (default: all) */
  includedNamespaces?: string[]
  /** Excluded namespaces */
  excludedNamespaces?: string[]
  /** Included resources (default: all) */
  includedResources?: string[]
  /** Excluded resources */
  excludedResources?: string[]
  /** Snapshot volumes (default: true) */
  snapshotVolumes?: boolean
  /** TTL for backup (default: 720h = 30 days) */
  ttl?: string
  /** Storage location name */
  storageLocation?: string
  /** Volume snapshot location */
  volumeSnapshotLocations?: string[]
  /** Labels to include */
  labelSelector?: Record<string, string>
}

/**
 * Velero on-demand backup.
 *
 * @example
 * <Backup name="daily-backup" includedNamespaces={['default']} />
 */
export function Backup(props: BackupProps) {
  const {
    name,
    namespace = 'velero',
    includedNamespaces,
    excludedNamespaces,
    includedResources,
    excludedResources,
    snapshotVolumes = true,
    ttl = '720h',
    storageLocation = 'default',
    volumeSnapshotLocations,
    labelSelector,
  } = props

  const sharedOperators = useContext(OperatorContext)
  const hasVelero = sharedOperators.some((op) => op.name === 'velero')

  const spec: Record<string, unknown> = {
    snapshotVolumes,
    ttl,
    storageLocation,
    ...(includedNamespaces && { includedNamespaces }),
    ...(excludedNamespaces && { excludedNamespaces }),
    ...(includedResources && { includedResources }),
    ...(excludedResources && { excludedResources }),
    ...(volumeSnapshotLocations && { volumeSnapshotLocations }),
    ...(labelSelector && {
      labelSelector: {
        matchLabels: labelSelector,
      },
    }),
  }

  return [
    !hasVelero && declareOperator(veleroOperator()),
    jsx('Backup', {
      apiVersion: 'velero.io/v1',
      kind: 'Backup',
      metadata: { name, namespace },
      spec,
    }),
  ]
}

export interface ScheduleProps {
  name: string
  namespace?: string
  /** Cron expression for schedule */
  schedule: string
  /** Backup template */
  backupTemplate: Omit<BackupProps, 'name' | 'namespace'>
}

/**
 * Velero scheduled backup.
 *
 * @example
 * <Schedule
 *   name="daily-backup"
 *   schedule="0 2 * * *"
 *   backupTemplate={{ includedNamespaces: ['default'] }}
 * />
 */
export function Schedule(props: ScheduleProps) {
  const { name, namespace = 'velero', schedule, backupTemplate } = props

  const sharedOperators = useContext(OperatorContext)
  const hasVelero = sharedOperators.some((op) => op.name === 'velero')

  const {
    includedNamespaces,
    excludedNamespaces,
    includedResources,
    excludedResources,
    snapshotVolumes = true,
    ttl = '720h',
    storageLocation = 'default',
    volumeSnapshotLocations,
    labelSelector,
  } = backupTemplate

  const template: Record<string, unknown> = {
    snapshotVolumes,
    ttl,
    storageLocation,
    ...(includedNamespaces && { includedNamespaces }),
    ...(excludedNamespaces && { excludedNamespaces }),
    ...(includedResources && { includedResources }),
    ...(excludedResources && { excludedResources }),
    ...(volumeSnapshotLocations && { volumeSnapshotLocations }),
    ...(labelSelector && {
      labelSelector: {
        matchLabels: labelSelector,
      },
    }),
  }

  return [
    !hasVelero && declareOperator(veleroOperator()),
    jsx('Schedule', {
      apiVersion: 'velero.io/v1',
      kind: 'Schedule',
      metadata: { name, namespace },
      spec: {
        schedule,
        template,
      },
    }),
  ]
}

export interface BackupStorageLocationProps {
  name: string
  namespace?: string
  /** Provider (e.g., 'aws', 'azure', 'gcp', 'minio') */
  provider: string
  /** Bucket name */
  bucket: string
  /** Prefix for backups */
  prefix?: string
  /** Region */
  region?: string
  /** S3 URL endpoint (for MinIO) */
  s3Url?: string
  /** Config object */
  config?: Record<string, string>
  /** Credential secret reference */
  credential?: {
    name: string
    key: string
  }
}

/**
 * Velero backup storage location.
 *
 * @example
 * <BackupStorageLocation
 *   name="default"
 *   provider="aws"
 *   bucket="my-backups"
 *   region="eu-north-1"
 * />
 */
export function BackupStorageLocation(props: BackupStorageLocationProps) {
  const {
    name,
    namespace = 'velero',
    provider,
    bucket,
    prefix,
    region,
    s3Url,
    config = {},
    credential,
  } = props

  const sharedOperators = useContext(OperatorContext)
  const hasVelero = sharedOperators.some((op) => op.name === 'velero')

  const objectStorage: Record<string, unknown> = { bucket }
  if (prefix) objectStorage.prefix = prefix

  const providerConfig: Record<string, string> = { ...config }
  if (region) providerConfig.region = region
  if (s3Url) providerConfig.s3Url = s3Url

  const spec: Record<string, unknown> = {
    provider,
    objectStorage,
    config: providerConfig,
  }

  if (credential) {
    spec.credential = {
      name: credential.name,
      key: credential.key,
    }
  }

  return [
    !hasVelero && declareOperator(veleroOperator()),
    jsx('BackupStorageLocation', {
      apiVersion: 'velero.io/v1',
      kind: 'BackupStorageLocation',
      metadata: { name, namespace },
      spec,
    }),
  ]
}
