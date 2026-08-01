import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'

export interface BackupProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Cron schedule for backups (defaults to daily at 2 AM) */
  schedule?: string
  /** Namespaces to include in backups (defaults to the current namespace) */
  namespaces?: string[]
  /** Velero storage location name (defaults to 'default') */
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
 * // Daily backups of the current namespace
 * <Backup name="daily" />
 *
 * @example
 * // Weekly backups of multiple namespaces with 30-day retention
 * <Backup
 *   name="weekly"
 *   schedule="0 3 * * 0"
 *   namespaces={['production', 'staging']}
 *   ttl="720h"
 * />
 */
export function Backup(props: BackupProps) {
  const {
    name,
    namespace = 'default',
    schedule = '0 2 * * *',
    namespaces,
    storageLocation = 'default',
    ttl = '720h',
  } = props

  const sharedOperators = useContext(OperatorContext)
  const hasVelero = sharedOperators.some((op) => op.name === 'velero')

  const resources: ReturnType<typeof jsx>[] = []

  if (!hasVelero) {
    resources.push(declareOperator(operators['velero']()))
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
          storageLocation,
          ttl,
        },
      },
    })
  )

  return jsx(Fragment, { children: resources })
}
