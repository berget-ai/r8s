import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { Backup, Schedule, BackupStorageLocation, veleroOperator } from '../src/index'

describe('veleroOperator', () => {
  it('should declare the operator with a pinned default version', () => {
    const op = veleroOperator()
    expect(op.name).toBe('velero')
    expect(op.source.type).toBe('manifest')
    expect(op.version).toBe('1.13.0')
    expect(op.crds).toContain('backups.velero.io')
    expect(op.crds).toContain('schedules.velero.io')
    expect(op.crds).toContain('backupstoragelocations.velero.io')
  })

  it('should allow overriding the version', () => {
    expect(veleroOperator('1.14.0').version).toBe('1.14.0')
  })
})

describe('Backup', () => {
  it('should render a Backup with defaults', () => {
    const result = render(jsx(Backup, { name: 'daily-backup' }))

    const backup = result.resources.find((r) => r.kind === 'Backup') as any
    expect(backup.apiVersion).toBe('velero.io/v1')
    expect(backup.metadata.name).toBe('daily-backup')
    expect(backup.metadata.namespace).toBe('velero')
    expect(backup.spec.snapshotVolumes).toBe(true)
    expect(backup.spec.ttl).toBe('720h')
    expect(backup.spec.storageLocation).toBe('default')
  })

  it('should render with namespace filters and label selector', () => {
    const result = render(
      jsx(Backup, {
        name: 'app-backup',
        includedNamespaces: ['default', 'production'],
        labelSelector: { app: 'web' },
      })
    )

    const backup = result.resources.find((r) => r.kind === 'Backup') as any
    expect(backup.spec.includedNamespaces).toEqual(['default', 'production'])
    expect(backup.spec.labelSelector.matchLabels).toEqual({ app: 'web' })
  })

  it('should declare the velero operator', () => {
    const result = render(jsx(Backup, { name: 'daily-backup' }))
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('velero')
  })

  it('should not re-declare the operator when provided via context', () => {
    const result = render(
      jsx(OperatorContext.Provider, {
        value: [veleroOperator()],
        children: jsx(Backup, { name: 'daily-backup' }),
      })
    )
    expect(result.operators).toHaveLength(1)
  })
})

describe('Schedule', () => {
  it('should render a Schedule with a backup template', () => {
    const result = render(
      jsx(Schedule, {
        name: 'daily-backup',
        schedule: '0 2 * * *',
        backupTemplate: { includedNamespaces: ['default'] },
      })
    )

    const schedule = result.resources.find((r) => r.kind === 'Schedule') as any
    expect(schedule.apiVersion).toBe('velero.io/v1')
    expect(schedule.metadata.name).toBe('daily-backup')
    expect(schedule.spec.schedule).toBe('0 2 * * *')
    expect(schedule.spec.template.includedNamespaces).toEqual(['default'])
    expect(schedule.spec.template.snapshotVolumes).toBe(true)
    expect(schedule.spec.template.ttl).toBe('720h')
  })

  it('should declare the velero operator', () => {
    const result = render(jsx(Schedule, { name: 's', schedule: '0 2 * * *', backupTemplate: {} }))
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('velero')
  })
})

describe('BackupStorageLocation', () => {
  it('should render a BackupStorageLocation', () => {
    const result = render(
      jsx(BackupStorageLocation, {
        name: 'default',
        provider: 'aws',
        bucket: 'my-backups',
        region: 'eu-north-1',
      })
    )

    const bsl = result.resources.find((r) => r.kind === 'BackupStorageLocation') as any
    expect(bsl.apiVersion).toBe('velero.io/v1')
    expect(bsl.metadata.name).toBe('default')
    expect(bsl.metadata.namespace).toBe('velero')
    expect(bsl.spec.provider).toBe('aws')
    expect(bsl.spec.objectStorage.bucket).toBe('my-backups')
    expect(bsl.spec.config.region).toBe('eu-north-1')
  })

  it('should support prefix, s3Url and credentials', () => {
    const result = render(
      jsx(BackupStorageLocation, {
        name: 'minio',
        provider: 'minio',
        bucket: 'backups',
        prefix: 'cluster-a',
        s3Url: 'https://s3.example.com',
        credential: { name: 'velero-credentials', key: 'cloud' },
      })
    )

    const bsl = result.resources.find((r) => r.kind === 'BackupStorageLocation') as any
    expect(bsl.spec.objectStorage.prefix).toBe('cluster-a')
    expect(bsl.spec.config.s3Url).toBe('https://s3.example.com')
    expect(bsl.spec.credential.name).toBe('velero-credentials')
  })

  it('should declare the velero operator', () => {
    const result = render(
      jsx(BackupStorageLocation, { name: 'default', provider: 'aws', bucket: 'b' })
    )
    expect(result.operators).toHaveLength(1)
    expect(result.operators[0].name).toBe('velero')
  })
})
