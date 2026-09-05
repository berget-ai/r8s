import { jsx, Fragment, useContext } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'
import { StaticSecret } from './static-secret'

/**
 * Shared S3 (or S3-compatible) object storage configuration.
 *
 * Consumers (CNPG Database backups, Velero, app packages) read this context
 * and derive their own prefixes — the provider owns endpoint/bucket/region
 * and credentials; the consumer owns its layout (e.g. WAL under
 * `<bucket>/<name>-cnpg`, cluster snapshots under `velero/`).
 */
export interface S3Config {
  /** Endpoint URL incl. scheme (e.g. 'https://s3.example.com') */
  endpoint: string
  /** Bucket holding all consumer prefixes */
  bucket: string
  /**
   * Optional path prefix scoping every consumer destination inside the
   * bucket (set via <Bucket name="…"> — one path segment, no slashes).
   */
  prefix?: string
  /** Region (default: 'us-east-1' — the convention for MinIO/RustFS) */
  region?: string
  /**
   * Path-style addressing (default: true — virtually every non-AWS store
   * requires it; AWS sets it via the AwsS3 convenience component)
   */
  forcePathStyle?: boolean
  /**
   * Existing Secret holding the access keys. Expected keys:
   * 'access-key-id' and 'secret-access-key' (the CNPG barman convention);
   * velero additionally reads `veleroCredentialKey` when set. Must live in
   * each consumer's namespace — CNPG barman and the Velero BSL credential
   * reference Secrets namespace-locally.
   */
  credentialsSecret: string
  /**
   * Key inside credentialsSecret holding a velero-format cloud credentials
   * file (e.g. 'cloud'). Omit for workload-identity / IRSA clusters.
   */
  veleroCredentialKey?: string
}

/**
 * MinIO / RustFS convenience config — path style on, region default.
 *
 * @example
 * import { S3Provider, MinIO, Database } from '@r8s/recipes'
 *
 * export default (
 *   <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>
 *     <Database name="api-db" backup />
 *   </S3Provider>
 * )
 */
export function MinIO(props: Omit<S3Config, 'forcePathStyle'>): S3Config {
  return { region: 'us-east-1', forcePathStyle: true, ...props }
}

/**
 * AWS S3 convenience config — virtual-hosted style, endpoint derived from region.
 *
 * @example
 * import { S3Provider, AwsS3, Database } from '@r8s/recipes'
 *
 * export default (
 *   <S3Provider provider={<AwsS3 region="eu-north-1" bucket="infra-backups" credentialsSecret="aws-creds" />}>
 *     <Database name="api-db" backup />
 *   </S3Provider>
 * )
 */
export function AwsS3(props: {
  region: string
  bucket: string
  credentialsSecret: string
  endpoint?: string
  veleroCredentialKey?: string
}): S3Config {
  const { region, endpoint, ...rest } = props
  return {
    endpoint: endpoint ?? `https://s3.${region}.amazonaws.com`,
    region,
    forcePathStyle: false,
    ...rest,
  }
}

export const S3Context = createContext<S3Config | null>(null)

/** Read the surrounding S3 configuration (null when no provider is set). */
export function useS3(): S3Config | null {
  return useContext(S3Context)
}

export interface S3ProviderProps {
  /**
   * S3 configuration — the plain config object, or choose the convenience
   * components <MinIO /> / <AwsS3 /> which are themselves S3Config values.
   *
   * @example
   * <S3Provider provider={{ endpoint: 'https://s3.example.com', bucket: 'infra', credentialsSecret: 's3-creds' }}>
   *   <Database name="api-db" backup />
   * </S3Provider>
   */
  provider: S3Config
  /** Child components */
  children?: unknown
}

/**
 * S3Provider — platform-wide S3-compatible object storage.
 *
 * Sets the S3Config context consumed by:
 * - <Database backup={…} /> — CNPG barman WAL + scheduled backups derive
 *   endpointURL/destinationPath (`<bucket>/<name>-cnpg`) and credentials
 * - <Backup /> — Velero emits a BackupStorageLocation + Schedule targeting
 *   the `velero/` prefix of the provider bucket
 * - application packages (matrix, harbor, …) reading the same context
 *
 * Explicit per-consumer values always win over the provider.
 *
 * @example
 * import { S3Provider, MinIO, Database, Backup } from '@r8s/recipes'
 *
 * export default (
 *   <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>
 *     <>
 *       <Database name="api-db" backup={{} as never} />
 *       <Backup name="nightly" />
 *     </>
 *   </S3Provider>
 * )
 */
export function S3Provider(props: S3ProviderProps) {
  const { provider, children } = props

  // Resolve the provider value: JSX elements of the convenience factories
  // are invoked with their props; plain S3Config objects pass through.
  let config: S3Config
  if (
    provider &&
    typeof provider === 'object' &&
    'type' in provider &&
    typeof (provider as { type: unknown }).type === 'function'
  ) {
    config = (provider as unknown as { type: (p: never) => S3Config }).type(
      (provider as unknown as { props: never }).props
    )
  } else {
    config = provider as S3Config
  }

  return jsx(S3Context.Provider, { value: config, children })
}

/**
 * Bucket — scope S3 destinations for its children inside the surrounding
 * S3Provider. Backups land under `s3://<bucket>/<name>/…` instead of the
 * bucket root, so layouts stay readable and movable:
 *
 * <S3Provider …>
 *   <Bucket name="matrix_backup">   →  s3://bucket/matrix_backup/matrix-db-cnpg
 *     <Matrix …/>
 *   <Bucket name="velero">          →  s3://bucket/velero/…
 *     <Backup name="daily" />
 *
 * Consumers append their own conventional suffix (-cnpg, …); explicit
 * backup props still win over anything derived. Optionally re-scopes
 * bucket/endpoint/credentials for children that need another store.
 *
 * @example
 * import { S3Provider, MinIO, Bucket, Database, Backup } from '@r8s/recipes'
 *
 * export default (
 *   <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>
 *     <Bucket name="matrix_backup">
 *       <Database name="matrix-db" backup />
 *     </Bucket>
 *     <Backup name="daily" />
 *   </S3Provider>
 * )
 */
export function Bucket(props: {
  /** Prefix segment for children (single path segment, no slashes) */
  name: string
  /** Re-scope children to another bucket */
  bucket?: string
  /** Re-scope children to another endpoint */
  endpoint?: string
  /** Re-scope children to another credentials Secret */
  credentialsSecret?: string
  children?: unknown
}) {
  const { name, bucket, endpoint, credentialsSecret, children } = props
  if (!name || name.includes('/') || name.includes('..')) {
    throw new Error(
      `Bucket name "${name}" must be a single path segment without slashes or '..' — it becomes the prefix under s3://<bucket>/`
    )
  }
  const parent = useS3()
  if (!parent && !endpoint) {
    throw new Error(
      `Bucket "${name}" needs a surrounding <S3Provider> (or an explicit endpoint prop) — there is no object store to scope against`
    )
  }
  const scoped: S3Config = {
    ...parent!,
    ...(endpoint !== undefined && { endpoint }),
    ...(bucket !== undefined && { bucket }),
    ...(credentialsSecret !== undefined && { credentialsSecret }),
    prefix: name,
  }
  return jsx(S3Context.Provider, { value: scoped, children })
}

/**
 * Emit a backend-provisioned S3 credentials Secret via the static-secret
 * capability hook (openbao/vault/sealed-secrets/custom provision()). The
 * destination Secret carries the CNPG-style keys 'access-key-id' and
 * 'secret-access-key' (+ an optional velero-format `cloud` entry given as
 * templates by the caller).
 */
export function S3BackendCredentials(props: {
  /** Kubernetes Secret name to create */
  name: string
  /** Path in the secrets backend holding access_key_id / secret_access_key */
  path: string
  namespace?: string
  /** Extra static-secret templates (e.g. a velero 'cloud' file) */
  templates?: Record<string, string>
}) {
  return jsx(StaticSecret, {
    name: props.name,
    namespace: props.namespace,
    path: props.path,
    keys: { 'access-key-id': 'access_key_id', 'secret-access-key': 'secret_access_key' },
    templates: props.templates,
    refreshAfter: '3600s',
  })
}

/** CNPG barman backup config derived from an S3 context (`<bucket>/<name>-cnpg`). */
export function cnpgBackupFromS3(s3: S3Config, name: string) {
  const base = s3.prefix ? `${s3.prefix}/` : ''
  return {
    endpointURL: s3.endpoint,
    destinationPath: `s3://${s3.bucket}/${base}${name}-cnpg`,
    credentialsSecret: s3.credentialsSecret,
  }
}
