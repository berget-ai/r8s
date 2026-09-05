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
export interface MinIOProps {
  endpoint: string
  bucket: string
  credentialsSecret: string
  region?: string
}

export function MinIO(props: MinIOProps): S3Config {
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
export interface AwsS3Props {
  region: string
  bucket: string
  credentialsSecret: string
  endpoint?: string
  veleroCredentialKey?: string
}

export function AwsS3(props: AwsS3Props): S3Config {
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

export interface BucketProps {
  /** Prefix segment under the bucket (single path segment, no slashes) */
  name: string
  /** Point at another bucket than the surrounding provider's */
  bucket?: string
  /** Point at another endpoint than the surrounding provider's */
  endpoint?: string
  /** Point at another credentials Secret than the surrounding provider's */
  credentialsSecret?: string
}

/**
 * Bucket — a declarative pointer at an S3 destination to pass into
 * consumers' backup/bucket props:
 *
 *   <Database name="api-db" backup={<Bucket name="matrix_backup" />} />
 *
 * Endpoint/credentials resolve from the surrounding S3Provider unless the
 * descriptor overrides them, so the call site shows exactly where data
 * goes without repeating store config. Consumers append their own
 * conventional suffix (`-cnpg`, `velero`, …).
 *
 * @example
 * import { S3Provider, MinIO, Bucket, Database, Backup } from '@r8s/recipes'
 *
 * export default (
 *   <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>
 *     <Database name="matrix-db" backup={<Bucket name="matrix_backup" />} />
 *     <Backup name="daily" bucket={<Bucket name="cluster-dumps" />} />
 *   </S3Provider>
 * )
 */
export function Bucket(props: BucketProps) {
  // Descriptors are VALUES — the renderer only reaches this body if someone
  // renders <Bucket /> directly. Fail loudly instead of recursing.
  throw new Error(
    'Bucket is a descriptor, not a renderable component — pass it to consumers:' +
      ` <Database backup={<Bucket name="${props?.name ?? '…'}" />} />`
  )
}

export interface ResolvedBucket {
  /** Effective store config after descriptor overrides */
  s3: S3Config
  /** Prefix under the bucket the consumer composes with */
  prefix: string
  /** Destination root including prefix (no consumer suffix) */
  root: string
}

/** Element check for the Bucket descriptor. */
export function isBucketElement(value: unknown): value is { props: BucketProps } {
  return (
    !!value &&
    typeof value === 'object' &&
    'type' in (value as any) &&
    (value as any).type === Bucket
  )
}

/**
 * Resolve a Bucket descriptor against the enclosing S3Provider (or its own
 * full overrides) — children never need to know which half came from where.
 */
export function resolveBucket(
  element: { props: BucketProps },
  s3: S3Config | null
): ResolvedBucket {
  const { name, bucket, endpoint, credentialsSecret } = element.props
  if (!name || name.includes('/') || name.includes('..')) {
    throw new Error(
      `Bucket name "${name}" must be a single path segment without slashes or '..' — it becomes the prefix under s3://<bucket>/`
    )
  }
  const effective: Partial<S3Config> = {
    ...s3,
    ...(endpoint !== undefined && { endpoint }),
    ...(bucket !== undefined && { bucket }),
    ...(credentialsSecret !== undefined && { credentialsSecret }),
  }
  // The original Secret's velero-format `cloud` entry belongs to the
  // original credential — an override almost certainly lacks it.
  if (credentialsSecret !== undefined) delete effective.veleroCredentialKey
  if (!effective.endpoint || !effective.bucket || !effective.credentialsSecret) {
    throw new Error(
      `Bucket "${name}" cannot resolve its store config:\n` +
        `\n` +
        `Wrap the consumer in an <S3Provider> (endpoint/credentials derive from it)\n` +
        `or give the descriptor the full config:\n` +
        `  <Bucket name="${name}" bucket="…" endpoint="https://…" credentialsSecret="…" />`
    )
  }
  const prefix = [s3?.prefix, name].filter(Boolean).join('/')
  return {
    s3: effective as S3Config,
    prefix,
    root: `s3://${effective.bucket}/${prefix}`,
  }
}

/**
 * Emit a backend-provisioned S3 credentials Secret via the static-secret
 * capability hook (openbao/vault/sealed-secrets/custom provision()). The
 * destination Secret carries the CNPG-style keys 'access-key-id' and
 * 'secret-access-key' (+ an optional velero-format `cloud` entry given as
 * templates by the caller).
 */
export interface S3BackendCredentialsProps {
  /** Kubernetes Secret name to create */
  name: string
  /** Path in the secrets backend holding access_key_id / secret_access_key */
  path: string
  namespace?: string
  /** Extra static-secret templates (e.g. a velero 'cloud' file) */
  templates?: Record<string, string>
}

export function S3BackendCredentials(props: S3BackendCredentialsProps) {
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
