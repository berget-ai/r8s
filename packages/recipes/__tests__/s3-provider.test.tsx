/**
 * S3 provider contracts — what the Platform-level S3 configuration means
 * for its consumers, written up front (before wiring Database/Velero) so
 * the intended behavior including error paths is pinned:
 *
 * 1. <S3Provider> sets the context; useS3() reads it (null without one)
 * 2. CNPG: <Database backup /> derives destinationPath '<bucket>/<name>-cnpg',
 *    endpointURL and credentialsSecret from the context — explicit props win
 * 3. Velero: <Backup /> emits a BackupStorageLocation against the 'velero/'
 *    prefix and points the schedule at it — explicit storageLocation wins
 * 4. without an S3 context, `backup` with no credentials fails with
 *    actionable guidance (never silent plaintext, never a half-wired BSL)
 */
import { describe, expect, it } from 'vitest'
import { render, jsx, Fragment } from '@r8s/core'
import { S3Provider, MinIO, AwsS3, Bucket, useS3, Database, Backup } from '../src'

const s3 = {
  endpoint: 'https://rustfs:9000',
  bucket: 'infra',
  region: 'us-east-1',
  forcePathStyle: true,
  credentialsSecret: 'infra-s3-creds',
}

function WithS3({ children }: { children: unknown }) {
  return jsx(S3Provider as never, { provider: s3, children })
}

describe('S3Provider context', () => {
  it('exposes the config to children via useS3()', () => {
    let seen: unknown = null
    function Probe() {
      seen = useS3()
      return jsx(Fragment, {})
    }
    render(
      <WithS3>
        <Probe />
      </WithS3>
    )
    expect(seen).toEqual(s3)
  })

  it('is null outside a provider', () => {
    let seen: unknown = 'not-run'
    function Probe() {
      seen = useS3()
      return jsx(Fragment, {})
    }
    render(<Probe />)
    expect(seen).toBeNull()
  })
})

describe('convenience configs', () => {
  it('MinIO enables path style and defaults the region', () => {
    expect(MinIO({ endpoint: 'https://rustfs:9000', bucket: 'b', credentialsSecret: 'c' })).toEqual(
      {
        endpoint: 'https://rustfs:9000',
        bucket: 'b',
        credentialsSecret: 'c',
        region: 'us-east-1',
        forcePathStyle: true,
      }
    )
  })

  it('AwsS3 derives the endpoint and uses virtual-hosted style', () => {
    expect(AwsS3({ region: 'eu-north-1', bucket: 'b', credentialsSecret: 'c' })).toMatchObject({
      endpoint: 'https://s3.eu-north-1.amazonaws.com',
      forcePathStyle: false,
      region: 'eu-north-1',
    })
  })
})

describe('Database backup via S3 context', () => {
  const findCluster = (result: ReturnType<typeof render>) =>
    result.resources.find((r) => r.kind === 'Cluster')

  it('derives barman settings + ScheduledBackup from the context', () => {
    const result = render(
      <WithS3>
        <Database name="api-db" backup />
      </WithS3>
    )
    const backup = (findCluster(result) as any).spec.backup
    expect(backup.barmanObjectStore.destinationPath).toBe('s3://infra/api-db-cnpg')
    expect(backup.barmanObjectStore.endpointURL).toBe('https://rustfs:9000')
    expect(backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe('infra-s3-creds')
    const schedules = result.resources.filter((r) => r.kind === 'ScheduledBackup')
    expect(schedules).toHaveLength(1)
  })

  it('explicit backup values win over the context', () => {
    const result = render(
      <WithS3>
        <Database
          name="api-db"
          backup={{
            destinationPath: 's3://other/explicit',
            endpointURL: 'https://explicit:9000',
            credentialsSecret: 'explicit-creds',
          }}
        />
      </WithS3>
    )
    const backup = (findCluster(result) as any).spec.backup
    expect(backup.barmanObjectStore.destinationPath).toBe('s3://other/explicit')
    expect(backup.barmanObjectStore.endpointURL).toBe('https://explicit:9000')
    expect(backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe('explicit-creds')
  })

  it('throws the required-decision guidance when backup is omitted entirely', () => {
    expect(() => render(<Database name="api-db" />)).toThrow(
      /backup is a required decision[\s\S]*backup=\{false\}/
    )
  })

  it('fails with S3 guidance when pointing at one without credentials', () => {
    expect(() => render(<Database name="api-db" backup />)).toThrow(/s3/i)
  })
})

describe('Bucket descriptor (backup={<Bucket … />} )', () => {
  it('points the backup at <bucket>/<name>/<consumer>-suffix', () => {
    const result = render(
      <WithS3>
        <Database name="api-db" backup={<Bucket name="matrix_backup" />} />
      </WithS3>
    )
    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://infra/matrix_backup/api-db-cnpg'
    )
    expect(cluster.spec.backup.barmanObjectStore.endpointURL).toBe('https://rustfs:9000')
    expect(cluster.spec.backup.barmanObjectStore.s3Credentials.accessKeyId.name).toBe(
      'infra-s3-creds'
    )
    const schedules = result.resources.filter((r) => r.kind === 'ScheduledBackup')
    expect(schedules).toHaveLength(1)
  })

  it('inherits endpoint/credentials from the surrounding provider and lets the descriptor override', () => {
    const result = render(
      <WithS3>
        <Database
          name="cold-db"
          backup={<Bucket name="cold" bucket="cold-storage" credentialsSecret="cold-creds" />}
        />
      </WithS3>
    )
    const barman = (result.resources.find((r) => r.kind === 'Cluster') as any).spec.backup
      .barmanObjectStore
    expect(barman.destinationPath).toBe('s3://cold-storage/cold/cold-db-cnpg')
    expect(barman.endpointURL).toBe('https://rustfs:9000')
    expect(barman.s3Credentials.accessKeyId.name).toBe('cold-creds')
  })

  it('a descriptor outside any S3Provider must carry the full store config', () => {
    const result = render(
      <Database
        name="solo-db"
        backup={
          <Bucket
            name="solo"
            bucket="standalone"
            endpoint="https://s3.example.com"
            credentialsSecret="solo-creds"
          />
        }
      />
    )
    const barman = (result.resources.find((r) => r.kind === 'Cluster') as any).spec.backup
      .barmanObjectStore
    expect(barman.destinationPath).toBe('s3://standalone/solo/solo-db-cnpg')
    expect(barman.s3Credentials.accessKeyId.name).toBe('solo-creds')
  })

  it('a partial descriptor outside a provider fails with guidance', () => {
    expect(() => render(<Database name="api-db" backup={<Bucket name="orphan" />} />)).toThrow(
      /S3Provider/
    )
  })

  it('Velero composes the descriptor prefix: <name>/velero', () => {
    const result = render(
      <WithS3>
        <Backup name="daily" bucket={<Bucket name="cluster-dumps" />} />
      </WithS3>
    )
    const bsl = result.resources.find((r) => r.kind === 'BackupStorageLocation') as any
    expect(bsl.spec.objectStorage).toMatchObject({
      bucket: 'infra',
      prefix: 'cluster-dumps/velero',
    })
    const schedule = result.resources.find((r) => r.kind === 'Schedule') as any
    expect(schedule.spec.template.storageLocation).toBe(bsl.metadata.name)
  })

  it('composes context prefix + descriptor name', () => {
    // hand-built provider with its own scope prefix (source-controller style)
    const result = render(
      <S3Provider provider={{ ...s3, prefix: 'tenant-a' } as never}>
        <Database name="db" backup={<Bucket name="nightly" />} />
      </S3Provider>
    )
    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://infra/tenant-a/nightly/db-cnpg'
    )
  })

  it('credential override drops the provider veleroCredentialKey (different Secret)', () => {
    const result = render(
      <S3Provider provider={{ ...s3, veleroCredentialKey: 'cloud' } as never}>
        <Backup name="daily" bucket={<Bucket name="dumps" credentialsSecret="other-creds" />} />
      </S3Provider>
    )
    const bsl = result.resources.find((r) => r.kind === 'BackupStorageLocation') as any
    expect(bsl.spec.credential).toBeUndefined()
  })

  it('direct-rendering <Bucket /> fails loudly instead of recursing', () => {
    expect(() => render(<Bucket name="oops" />)).toThrow(/descriptor/)
  })

  it('rejects names that would escape the prefix', () => {
    expect(() => render(<Database name="x" backup={<Bucket name="a/b" />} />)).toThrow(
      /single path segment/
    )
  })
})

describe('Velero Backup via S3 context', () => {
  it('emits a BackupStorageLocation on the velero/ prefix and references it', () => {
    const result = render(
      <WithS3>
        <Backup name="nightly" />
      </WithS3>
    )
    const bsl = result.resources.find((r) => r.kind === 'BackupStorageLocation')
    expect(bsl).toBeTruthy()
    expect(bsl.spec.objectStorage).toMatchObject({ bucket: 'infra', prefix: 'velero' })
    expect(bsl.spec.config.s3Url).toBe('https://rustfs:9000')
    expect(bsl.spec.config.s3ForcePathStyle).toBe('true')
    expect(bsl.metadata.namespace).toBe('velero')

    const schedule = result.resources.find((r) => r.kind === 'Schedule')
    expect(schedule.spec.template.storageLocation).toBe(bsl.metadata.name)
  })

  it('credentials appear only via veleroCredentialKey (workload identity otherwise)', () => {
    const withCreds = render(
      jsx(S3Provider as never, {
        provider: { ...s3, veleroCredentialKey: 'cloud' },
        children: jsx(Backup as never, { name: 'nightly' }),
      })
    )
    const bsl = withCreds.resources.find((r) => r.kind === 'BackupStorageLocation') as any
    expect(bsl.spec.credential).toEqual({ name: 'infra-s3-creds', key: 'cloud' })

    const without = render(
      <WithS3>
        <Backup name="nightly" />
      </WithS3>
    )
    const plain = without.resources.find((r) => r.kind === 'BackupStorageLocation') as any
    expect(plain.spec.credential).toBeUndefined()
  })

  it('explicit storageLocation wins — no BSL is emitted', () => {
    const result = render(
      <WithS3>
        <Backup name="nightly" storageLocation="existing" />
      </WithS3>
    )
    const bsls = result.resources.filter((r) => r.kind === 'BackupStorageLocation')
    expect(bsls).toHaveLength(0)
    const schedule = result.resources.find((r) => r.kind === 'Schedule')
    expect(schedule.spec.template.storageLocation).toBe('existing')
  })
})
