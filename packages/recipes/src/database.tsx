import { jsx, useContext } from '@r8s/core'
import { Cluster } from '@r8s/crds/postgresql'
import { declareCnpg } from '@r8s/operator-cnpg'
import {
  DatabaseContext,
  SecretContext,
  OperatorContext,
  ClusterContext,
  useNamespace,
} from '@r8s/core/defaults'
import { provisionerForSecretProvider } from './secret-provider'
import { useS3, isBucketElement, resolveBucket } from './s3-provider'
import { StaticSecret } from './static-secret'

/**
 * Continuous + scheduled backup configuration for a dedicated CNPG cluster.
 * Renders `spec.backup.barmanObjectStore` on the Cluster plus a
 * ScheduledBackup resource. Backup is explicit opt-in — nothing renders
 * unless this prop is set.
 */
export interface DatabaseBackupProps {
  /** S3 destination path, e.g. 's3://backups/myapp-cnpg'. Derived from the S3 provider as `s3://<bucket>/<name>-cnpg` when omitted. */
  destinationPath?: string
  /** S3 endpoint URL, e.g. 'https://s3.example.com' (RustFS/Scaleway/…). Derived from the S3 provider when omitted. */
  endpointURL?: string
  /**
   * Name of an existing Secret holding the S3 credentials with CNPG keys
   * `access-key-id` and `secret-access-key`. Resolution order: this prop →
   * the S3 provider's credentialsSecret → the Platform secrets backend
   * provisioner (`<name>-backup-credentials` from
   * `<path>/<name>-s3-credentials`). Without any of the three this throws.
   */
  credentialsSecret?: string
  /** Retention policy for barman backups (default: '30d') */
  retention?: string
  /** Cron schedule for the ScheduledBackup (default: '0 3 * * *') */
  schedule?: string
  /** Data/WAL compression — values valid for both streams (default: 'gzip') */
  compression?: 'gzip' | 'bzip2' | 'snappy'
  /** WAL encryption (default: 'AES256') */
  encryption?: 'AES256' | 'aws:kms'
}

export interface DatabaseProps {
  /** Resource name (also the default database name) */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Number of CNPG instances in the dedicated cluster (defaults to 3) */
  instances?: number
  /**
   * Bootstrap database name (defaults to `name`) — for apps whose schema
   * lives in a database named differently from the cluster resource
   * (e.g. cluster 'harbor-db', database 'registry').
   */
  database?: string
  /** Bootstrap owner role (defaults to `name`; pairs with `database`) */
  owner?: string
  /** Storage size (e.g., '10Gi') for the dedicated cluster data volume */
  storage?: string
  /** Storage class name for the data volume (defaults to cluster default) */
  storageClass?: string
  /** PostgreSQL parameters, e.g. { max_connections: '200' } */
  parameters?: Record<string, string>
  /**
   * Continuous barman backup to S3 object storage + ScheduledBackup.
   * REQUIRED decision point: omit → renderer throws with guidance.
   * `false` → cluster without barman (forks, ephemeral CI).
   * `true`/object → barman WAL + scheduled backups; target and credentials
   * derive from the Platform's S3 provider, explicit object values win.
   */
  backup: DatabaseBackupProps | true | false
  /**
   * Workloads that consume the database credentials. Rendered as
   * `rolloutRestartTargets` on the generated VaultStaticSecret/
   * OpenBaoStaticSecret so pods restart when credentials rotate.
   */
  rolloutRestartTargets?: { kind?: string; name: string; apiVersion?: string }[]
  /** Operator version override. If not set, reads from OperatorContext or uses default. */
  operatorVersion?: string
  /**
   * SQL statements run once after the initial database bootstrap
   * (CNPG `bootstrap.initdb.postInitApplicationSQL`). Use for schema
   * extensions the application requires on a fresh cluster — e.g.
   * creating roles or extensions. Parameterized by the CNPG operator.
   */
  postInitSQL?: string[]
  /**
   * Where database credentials come from. Default `'backend'`: when a
   * secrets backend is configured on the Platform, the credentials secret
   * is provisioned through it (rotation → pod restarts). `'cnpg'` forces
   * CNPG-managed bootstrap credentials **even with a backend** — the
   * operator generates the secret in-cluster (incl. `fqdn-uri`), matching
   * apps that reference the CNPG-generated secret directly.
   */
  credentialsMode?: 'backend' | 'cnpg'
  /** Child components rendered with this database's connection info in context */
  children?: unknown
}

/**
 * CloudNativePG PostgreSQL database.
 *
 * @title Database
 * @category Data & Analytics
 *
 * Creates a dedicated 3-instance HA CloudNativePG cluster for this database.
 * When wrapped in a `<Database backup={false}>` component, child components receive the
 * connection info via DatabaseContext automatically.
 *
 * Credentials are managed by the secrets backend configured on the Platform.
 * Without a backend, credentials are CNPG-managed (bootstrap secret is
 * generated automatically in-cluster). Plaintext password props are NOT
 * supported — rendered YAML is committed to git and applied to clusters,
 * so a plaintext password there is a credential leak.
 *
 * @example
 * import { Database } from '@r8s/recipes'
 *
 * // Required target: explicit S3 settings (credentials from an existing Secret)
 * export default (
 *   <Database
 *     name="app-db"
 *     storage="10Gi"
 *     backup={{
 *       destinationPath: 's3://backups/app-db-cnpg',
 *       endpointURL: 'https://s3.example.com',
 *       credentialsSecret: 'app-db-backup-creds',
 *     }}
 *   />
 * )
 *
 * @example
 * import { Platform, Database, WebService } from '@r8s/recipes'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao' }}>
 *     <Database
 *       name="app-db"
 *       storage="10Gi"
 *       backup={{
 *         destinationPath: 's3://backups/app-db-cnpg',
 *         endpointURL: 'https://s3.example.com',
 *       }}
 *     >
 *       <WebService name="api" image="myapp/api:v1" />
 *     </Database>
 *   </Platform>
 * )
 *
 * @example
 * import { Platform, Database, WebService } from '@r8s/recipes'
 *
 * // HA database with continuous S3 backup — the backend provisions the
 * // backup credentials, pods restart when they rotate.
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps', refreshAfter: '3600s' }}>
 *     <Database
 *       name="app-db"
 *       storage="20Gi"
 *       instances={2}
 *       rolloutRestartTargets={[{ name: 'api' }]}
 *       backup={{
 *         destinationPath: 's3://backups/app-cnpg',
 *         endpointURL: 'https://s3.example.com',
 *       }}
 *     >
 *       <WebService name="api" image="myapp/api:v1" />
 *     </Database>
 *   </Platform>
 * )
 */
export function Database(props: DatabaseProps) {
  const {
    name,
    namespace: namespaceProp,
    instances = 3,
    database: databaseName = name,
    owner: ownerName = name,
    storage = '10Gi',
    storageClass,
    parameters,
    credentialsMode = 'backend',
    backup: backupProp,
    rolloutRestartTargets,
    operatorVersion,
    postInitSQL,
    children,
  } = props

  // Plaintext password props are forbidden. This also catches untyped/JS
  // callers that pass `password` to Database regardless of backend — the
  // rendered Secret would leak the credential into git and cluster state.
  const legacyPassword = (props as { password?: unknown }).password
  if (legacyPassword !== undefined && legacyPassword !== null && legacyPassword !== '') {
    throw new Error(
      `Database "${name}" received a plaintext password. ` +
        `Plaintext credentials in rendered manifests are no longer supported — ` +
        `the YAML is committed to git and applied to clusters, which leaks the credential.\n` +
        `\n` +
        `Fix: configure a secrets backend on the Platform and let it manage credentials:\n` +
        `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
        `    <Database name="${name}" backup={false} />\n` +
        `  </Platform>\n` +
        `\n` +
        `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'`
    )
  }

  // Inherit namespace from <Platform> context if not explicitly set
  const namespace = useNamespace(namespaceProp)

  // Backups are a REQUIRED decision: no barman archive means stalled WAL
  // recycling fills the data PVC over time. Passing nothing is a bug the
  // renderer must catch, not a silent default.
  const s3 = useS3()
  if (backupProp === undefined) {
    throw new Error(
      `Database "${name}": backup is a required decision.\n` +
        `\n` +
        `WAL segments accumulate until they are archived — a cluster without\n` +
        `working backups slowly fills its PVC.\n` +
        `\n` +
        `Enable backups (derives target/credentials from the platform's S3Provider):\n` +
        `  <Database name="${name}" backup />\n` +
        `\n` +
        `or pass the full target explicitly:\n` +
        `  backup={{ destinationPath: 's3://backups/${name}-cnpg', endpointURL: 'https://s3.example.com' }}\n` +
        `\n` +
        `To explicitly run without backups (forks, ephemeral CI databases):\n` +
        `  <Database name="${name}" backup={false} />`
    )
  }
  let backup = backupProp
  if (backupProp && typeof backupProp === 'object' && isBucketElement(backupProp)) {
    const target = resolveBucket(backupProp, s3)
    backup = {
      endpointURL: target.s3.endpoint,
      destinationPath: `${target.root}/${name}-cnpg`,
      credentialsSecret: target.s3.credentialsSecret,
    }
  } else if (backupProp && typeof backupProp === 'object' && 'type' in (backupProp as never)) {
    throw new Error(
      `Database "${name}": backup element must be a <Bucket name="…" /> descriptor — got another component`
    )
  }
  const backupSpec: DatabaseBackupProps | false | undefined =
    backup === false ? false : backup === true ? {} : { ...(backup as DatabaseBackupProps) }
  if (backupSpec) {
    if (backupSpec.endpointURL === undefined) backupSpec.endpointURL = s3?.endpoint
    if (backupSpec.credentialsSecret === undefined)
      backupSpec.credentialsSecret = s3?.credentialsSecret
    if (backupSpec.destinationPath === undefined && s3) {
      const base = s3.prefix ? `${s3.prefix}/` : ''
      backupSpec.destinationPath = `s3://${s3.bucket}/${base}${name}-cnpg`
    }
  }

  // With no S3 provider and no explicit target there is nothing valid to
  // render — fail with the two ways out instead of half a barman spec.
  if (backupSpec && (!backupSpec.endpointURL || !backupSpec.destinationPath)) {
    throw new Error(
      `Database "${name}" has backup configured without an S3 target.\n` +
        `\n` +
        `Add an <S3Provider> to the Platform — endpoint, bucket and credentials are derived from it:\n` +
        `  <Platform>\n` +
        `    <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n` +
        `      <Database name="${name}" backup />\n` +
        `  </Platform>\n` +
        `\n` +
        `or pass the target explicitly:\n` +
        `  backup={{ endpointURL: 'https://s3.example.com', destinationPath: 's3://backups/${name}-cnpg' }}\n` +
        `\n` +
        `Missing: ${[!backupSpec.endpointURL && 'endpointURL', !backupSpec.destinationPath && 'destinationPath'].filter(Boolean).join(', ')}`
    )
  }

  const clusterConfig = useContext(ClusterContext)
  const secretProvider = useContext(SecretContext)
  const sharedOperators = useContext(OperatorContext)
  const secretName = `${name}-db-credentials`

  const resources: ReturnType<typeof jsx>[] = []

  if (clusterConfig) {
    // Shared cluster — reuse connection info from the surrounding Cluster
    const connection = {
      host: clusterConfig.host,
      port: 5432,
      database: databaseName,
      username: ownerName,
      passwordSecret: { name: secretName, key: 'password' },
      passwordKey: 'password',
      vendor: 'postgres' as const,
    }

    resources.push(
      ...createSecretResources(name, namespace, secretName, secretProvider, 'shared', undefined)
    )

    if (children) {
      resources.push(jsx(DatabaseContext.Provider, { value: connection, children }))
    }
  } else {
    // Dedicated cluster — create full CNPG cluster
    const hasCNPG = sharedOperators.some((op) => op.name === 'cnpg')

    // Backup credentials: explicit existing Secret, or provisioned by the
    // secrets backend. Plaintext is never rendered.
    let backupCredentials: string | undefined
    if (backupSpec) {
      if (backupSpec.credentialsSecret) {
        backupCredentials = backupSpec.credentialsSecret
      } else if (
        secretProvider &&
        (secretProvider.backend === 'openbao' || secretProvider.backend === 'vault')
      ) {
        backupCredentials = `${name}-backup-credentials`
      } else {
        throw new Error(
          `Database "${name}" has backup configured without backup credentials.\n` +
            `\n` +
            `Add an <S3Provider> to the Platform — backup endpoint, bucket and credentials are derived from it.\n` +
            `\n` +
            `\n` +
            `Set an existing Secret holding keys 'access-key-id' and 'secret-access-key':\n` +
            `  backup={{ ..., credentialsSecret: 'my-backup-creds' }}\n` +
            `\n` +
            `or let the Platform secrets backend provision them from '<path>/${name}-s3-credentials':\n` +
            `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>`
        )
      }
    }

    const cluster: Cluster = {
      apiVersion: 'postgresql.cnpg.io/v1',
      kind: 'Cluster',
      metadata: { name, namespace },
      spec: {
        instances,
        storage: {
          size: storage,
          ...(storageClass && { storageClass }),
        },
        bootstrap: {
          initdb: {
            database: databaseName,
            owner: ownerName,
            // 'cnpg' credentialsMode: let CNPG default to '<cluster>-app'
            // (the native credentials secret incl. fqdn-uri references)
            ...(credentialsMode === 'cnpg' ? {} : { secret: { name: secretName } }),
            // Roles/extensions the application needs on a fresh cluster —
            // applied once by CNPG after the initial bootstrap.
            ...(postInitSQL && postInitSQL.length > 0
              ? { postInitApplicationSQL: postInitSQL }
              : {}),
          },
        },
        monitoring: { enablePodMonitor: true },
        ...(parameters && { postgresql: { parameters } }),
        ...(backupSpec && backupCredentials
          ? {
              backup: {
                retentionPolicy: backupSpec.retention ?? '30d',
                barmanObjectStore: {
                  destinationPath: backupSpec.destinationPath!,
                  endpointURL: backupSpec.endpointURL!,
                  s3Credentials: {
                    accessKeyId: { name: backupCredentials, key: 'access-key-id' },
                    secretAccessKey: { name: backupCredentials, key: 'secret-access-key' },
                  },
                  data: { compression: backupSpec.compression ?? 'gzip' },
                  wal: {
                    compression: backupSpec.compression ?? 'gzip',
                    encryption: backupSpec.encryption ?? 'AES256',
                  },
                },
              },
            }
          : {}),
      },
    }

    const connection = {
      host: `${name}-rw`,
      port: 5432,
      database: databaseName,
      username: ownerName,
      passwordSecret: { name: secretName, key: 'password' },
      passwordKey: 'password',
      vendor: 'postgres' as const,
    }

    if (!hasCNPG) {
      resources.push(...declareCnpg(sharedOperators, operatorVersion))
    }

    resources.push(jsx('Cluster', cluster))

    if (backup && backupCredentials) {
      resources.push(
        jsx('ScheduledBackup', {
          apiVersion: 'postgresql.cnpg.io/v1',
          kind: 'ScheduledBackup',
          metadata: { name: `${name}-backup`, namespace },
          spec: {
            cluster: { name },
            schedule: backupSpec && backupSpec.schedule ? backupSpec.schedule : '0 3 * * *',
            backupOwnerReference: 'self',
          },
        } as Parameters<typeof jsx>[1])
      )

      // Backend-provisioned S3 credentials for barman
      if (backupSpec && !backupSpec.credentialsSecret && secretProvider) {
        resources.push(
          ...createStaticSecretResource(
            `${name}-backup-credentials`,
            `${name}-backup-credentials`,
            namespace,
            secretProvider,
            `${secretProvider.path}/${name}-s3-credentials`,
            undefined
          )
        )
      }
    }

    // For dedicated clusters with a secrets backend, the backend manages
    // credentials. For kubernetes/manual-secrets backend, CNPG manages the
    // bootstrap secret automatically — no plaintext Secret is rendered.
    // 'cnpg' credentialsMode: the operator generates the bootstrap secret
    // in-cluster (incl. fqdn-uri) even when a secrets backend is present —
    // apps referencing the CNPG-generated secret directly (e.g. paperclip's
    // externalURLSecretRef) work without vault-stored DB credentials.
    if (secretProvider && credentialsMode === 'backend') {
      resources.push(
        ...createSecretResources(
          name,
          namespace,
          secretName,
          secretProvider,
          'dedicated',
          rolloutRestartTargets
        )
      )
    }

    if (children) {
      resources.push(jsx(DatabaseContext.Provider, { value: connection, children }))
    }
  }

  return resources
}

/**
 * Create the secret resources for a database based on the active secrets
 * backend. Plaintext credentials are never rendered — backends either
 * reference credentials stored externally (openbao/vault), hold
 * user-sealed ciphertext (sealed-secrets), or delegate to CNPG's
 * in-cluster bootstrap secret generation (kubernetes/manual-secrets on
 * dedicated clusters).
 */
function createSecretResources(
  name: string,
  namespace: string,
  secretName: string,
  secretProvider: {
    backend: string
    mount?: string
    path?: string
    authRef?: string
    refreshAfter?: string
  } | null,
  mode: 'shared' | 'dedicated',
  rolloutRestartTargets: { kind?: string; name: string; apiVersion?: string }[] | undefined
): ReturnType<typeof jsx>[] {
  const resources: ReturnType<typeof jsx>[] = []

  if (!secretProvider) {
    if (mode === 'dedicated') {
      // CNPG generates the bootstrap secret in-cluster — no credential
      // in the rendered manifest at all.
      return resources
    }
    throw new Error(
      `Database "${name}" is attached to a shared Cluster without a secrets backend.\n` +
        `\n` +
        `CNPG only provisions credentials for databases on dedicated clusters, so a ` +
        `shared-cluster database needs a managed secrets backend:\n` +
        `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
        `    <Database name="${name}" backup={false} />\n` +
        `  </Platform>\n` +
        `\n` +
        `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'`
    )
  }

  switch (secretProvider.backend) {
    case 'vault':
    case 'openbao':
      resources.push(
        ...createStaticSecretResource(
          `${name}-db-secret`,
          secretName,
          namespace,
          secretProvider,
          `${secretProvider.path}/${name}`,
          rolloutRestartTargets
        )
      )
      break

    case 'sealed-secrets':
      // Sealed Secrets: the user provides a sealed secret that was encrypted
      // with the cluster's public key. We reference it — we never see the
      // plaintext. The user must pre-create the SealedSecret.
      resources.push(
        jsx('SealedSecret', {
          apiVersion: 'bitnami.com/v1alpha1',
          kind: 'SealedSecret',
          metadata: { name: secretName, namespace },
          spec: {
            encryptedData: {
              // Placeholder — the user replaces this with their sealed value
              password: 'REPLACE_WITH_SEALED_VALUE',
            },
          },
        })
      )
      break

    case 'kubernetes':
    case 'manual-secrets':
      // Plain Kubernetes Secrets — but the credential itself must never be
      // in the rendered manifest. On dedicated clusters CNPG generates the
      // bootstrap secret in-cluster; on shared clusters there is nothing to
      // generate the credential, so a managed backend is required.
      if (mode === 'shared') {
        throw new Error(
          `Database "${name}" uses the '${secretProvider.backend}' secrets backend on a shared Cluster.\n` +
            `\n` +
            `Credentials for shared-cluster databases cannot be provisioned automatically. ` +
            `Use a managed backend instead:\n` +
            `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
            `    <Database name="${name}" backup={false} />\n` +
            `  </Platform>\n` +
            `\n` +
            `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'`
        )
      }
      break

    default:
      throw new Error(
        `Database "${name}" has an unknown secrets backend "${secretProvider.backend}".\n` +
          `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'`
      )
  }

  return resources
}

/**
 * Render a VaultStaticSecret / OpenBaoStaticSecret syncing one backend entry
 * into a Kubernetes Secret. Rotation semantics are first-class:
 * `refreshAfter` comes from the provider (Platform secrets config),
 * `rolloutRestartTargets` restarts consuming workloads on rotation.
 * The secret content itself is never rendered into the manifest.
 *
 * Delegates to the shared provisioner in raw-sync mode (empty keys → the
 * destination passes the whole store entry through — byte-identical to
 * the legacy inline emission). Identity awareness lives ONLY in
 * `secret-provider.tsx`.
 */
function createStaticSecretResource(
  resourceName: string,
  destinationName: string,
  namespace: string,
  secretProvider: {
    backend: string
    mount?: string
    path?: string
    authRef?: string
    refreshAfter?: string
  },
  vaultPath: string,
  rolloutRestartTargets: { kind?: string; name: string; apiVersion?: string }[] | undefined
): ReturnType<typeof jsx>[] {
  const targets = rolloutRestartTargets?.map((t) => ({
    apiVersion: t.apiVersion ?? 'apps/v1',
    kind: t.kind ?? 'Deployment',
    name: t.name,
  }))

  const el = provisionerForSecretProvider(secretProvider as never)!({
    name: resourceName,
    namespace,
    path: vaultPath,
    // Raw sync: callers (DB credentials, backup creds) don't enumerate
    // store keys at render time — pass the whole entry through
    keys: {},
    secretName: destinationName,
    refreshAfter: secretProvider.refreshAfter,
    restartTargets: targets,
  })
  return Array.isArray(el) ? el : [el as ReturnType<typeof jsx>]
}

/**
 * @deprecated CNPG's barman destination derivation now lives inside
 * <Database> (S3 provider + <Bucket> descriptors cover the layout).
 * Kept for one minor as a compat shim.
 *
 * @example
 * import { cnpgBackupFromS3 } from '@r8s/recipes'
 *
 * export const target = cnpgBackupFromS3(s3Config, 'api-db')
 */
export function cnpgBackupFromS3(s3: import('./s3-provider').S3Config, name: string) {
  const base = s3.prefix ? `${s3.prefix}/` : ''
  return {
    endpointURL: s3.endpoint,
    destinationPath: `s3://${s3.bucket}/${base}${name}-cnpg`,
    credentialsSecret: s3.credentialsSecret,
  }
}

/**
 * @deprecated Emit S3 credentials via the Database recipe or the secrets
 * backend directly — moved out of the provider layer.
 *
 * @example
 * import { SecretProvider, DatabaseS3Credentials } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider="openbao" mount="kv" path="infra">
 *     <DatabaseS3Credentials name="my-creds" path="infra/s3" />
 *   </SecretProvider>
 * )
 */
export function DatabaseS3Credentials(props: {
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
