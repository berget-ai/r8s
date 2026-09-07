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
import { useS3, isBucketElement, resolveBucket, type BucketProps } from './s3-provider'

/**
 * Continuous + scheduled backup configuration for a dedicated CNPG cluster.
 * Renders `spec.backup.barmanObjectStore` on the Cluster plus a
 * ScheduledBackup resource. With an <S3Provider> in scope, backups are on
 * by default — this prop only needs setting for an explicit target or to
 * opt out (`false`).
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
   * Secure default: with an <S3Provider> in scope, backups are ENABLED
   * when omitted — target and credentials derive from the provider.
   * Without a provider there is no valid default target, so omitting
   * throws with guidance. `false` → cluster without barman (forks,
   * ephemeral CI) — the only way to run unbacked. `true`/object → barman
   * WAL + scheduled backups; explicit object values win over derived ones.
   */
  backup?: DatabaseBackupProps | true | false | { type: unknown; props: BucketProps }
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
   * provisioning secrets backend is configured on the Platform, the
   * credentials secret (`<name>-db-credentials`) is provisioned through
   * it (rotation → pod restarts) and CNPG adopts it via
   * `bootstrap.initdb.secret` — see `databaseCredentialsRef` for the
   * exact resolution contract. `'cnpg'` forces CNPG-managed bootstrap
   * credentials **even with a backend** — the operator generates the
   * secret in-cluster (incl. `fqdn-uri`), matching apps that reference
   * the CNPG-generated secret directly.
   *
   * Without a backend (or under passive backends that render no
   * referenceable credentials Secret) the contract is the CNPG-generated
   * `<name>-app` secret: `bootstrap.initdb.secret` is omitted and the
   * operator generates the credentials in-cluster. App packages resolve
   * the password secret through `databaseCredentialsRef` — never hardcode
   * a `-db-credentials` name.
   */
  credentialsMode?: 'backend' | 'cnpg'
  /** Child components rendered with this database's connection info in context */
  children?: unknown
}

/**
 * Does this Platform secrets backend render a Secret that the Database
 * bootstrap reference can point at (the `<name>-db-credentials`
 * destination createSecretResources renders)? Single source for the
 * "provisioning" notion shared by `databaseCredentialsRef` and the
 * backend switch in `createSecretResources` — keep the two aligned, a
 * drift silently flips app references between the backend-provisioned
 * Secret and the CNPG-generated `<name>-app`.
 */
function provisionsBootstrapSecret(secretProvider: { backend: string } | null): boolean {
  return (
    secretProvider !== null &&
    (secretProvider.backend === 'openbao' ||
      secretProvider.backend === 'vault' ||
      secretProvider.backend === 'sealed-secrets')
  )
}

/**
 * Resolve the bootstrap credentials Secret for a CNPG `Database` — the
 * single resolution contract for app packages. Every DB-password
 * `secretKeyRef` must point at the Secret this helper resolves, never at
 * a hardcoded name.
 *
 * Resolution rule:
 *
 * | secrets backend                | credentialsMode | resolved Secret          | provisioned by |
 * |--------------------------------|-----------------|--------------------------|----------------|
 * | openbao / vault                | 'backend'       | `<name>-db-credentials`  | the backend (CNPG adopts it via `bootstrap.initdb.secret`; rotation → pod restarts) |
 * | sealed-secrets                 | 'backend'       | `<name>-db-credentials`  | the `SealedSecret` the Database recipe renders (sealed by the operator) |
 * | none                           | (any)           | `<name>-app`             | CNPG generates it in-cluster (`bootstrap.initdb.secret` is omitted) |
 * | openbao / vault / sealed-secrets | 'cnpg'        | `<name>-app`             | CNPG generates it in-cluster |
 * | kubernetes / manual-secrets (passive) | 'backend' | `<name>-app`           | CNPG generates it in-cluster — nothing provisions a referenceable Secret |
 *
 * **Shared clusters** (a surrounding `<Cluster>` recipe instead of a
 * dedicated CNPG cluster) always resolve `<name>-db-credentials` when a
 * provisioning backend is in scope: CNPG only generates credentials for
 * dedicated clusters, so the backend is the only provisioner there — an
 * explicit `credentialsMode: 'cnpg'` cannot be honored and resolves as
 * `'backend'` (`createSecretResources` throws without a backend).
 *
 * The name resolution matters because CloudNativePG (≥ 1.20, verified on
 * 1.27) does **not** auto-create a Secret referenced from
 * `bootstrap.initdb.secret` — referencing `<name>-db-credentials` without
 * a backend that provisions it is a guaranteed
 * `CreateContainerConfigError` on every consuming pod. When the helper
 * resolves `<name>-app`, the `Database` recipe omits `initdb.secret` so
 * the operator natively generates the credentials Secret (including the
 * `fqdn-uri` key).
 *
 * `key` is always `'password'` — apps that instead read the operator
 * bundle (e.g. `fqdn-uri`) use the resolved `name` with their own key.
 *
 * @param name Database (CNPG Cluster) resource name
 * @param secretProvider The `SecretContext` value (null without a Platform secrets backend)
 * @param credentialsMode The Database's `credentialsMode` (defaults to 'backend')
 */
export function databaseCredentialsRef(
  name: string,
  secretProvider: { backend: string } | null,
  credentialsMode: 'backend' | 'cnpg' = 'backend'
): { name: string; key: string } {
  const backendProvisions = credentialsMode !== 'cnpg' && provisionsBootstrapSecret(secretProvider)
  return {
    name: backendProvisions ? `${name}-db-credentials` : `${name}-app`,
    key: 'password',
  }
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
 * Without a backend, credentials are CNPG-managed: `bootstrap.initdb.secret`
 * is omitted and the operator generates the `<name>-app` credentials Secret
 * in-cluster — apps resolve the password Secret through
 * `databaseCredentialsRef(name, secretProvider, credentialsMode)` instead of
 * hardcoding a name. Plaintext password props are NOT
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

  // Backups default to SECURE: with an S3 provider in scope, omitting the
  // decision enables backups (target/credentials derive from the provider
  // below). Without a provider there is no valid default target — the
  // decision stays required, and running unbacked is always an explicit
  // `backup={false}`. No barman archive means stalled WAL recycling fills
  // the data PVC over time, so silence must never mean "unbacked".
  const s3 = useS3()
  let backup = backupProp
  if (backup === undefined) {
    if (!s3) {
      throw new Error(
        `Database "${name}": backup is a required decision.\n` +
          `\n` +
          `WAL segments accumulate until they are archived — a cluster without\n` +
          `working backups slowly fills its PVC.\n` +
          `\n` +
          `There is no <S3Provider> in scope, so backups cannot be defaulted on.\n` +
          `Add one in scope (inside a <Platform> or stand-alone) and backups\n` +
          `enable automatically:\n` +
          `  import { Database, S3Provider, MinIO } from '@r8s/recipes'\n` +
          `  <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n` +
          `    <Database name="${name}" />\n` +
          `  </S3Provider>\n` +
          `\n` +
          `or pass the full target explicitly:\n` +
          `  backup={{ destinationPath: 's3://backups/${name}-cnpg', endpointURL: 'https://s3.example.com' }}\n` +
          `\n` +
          `To explicitly run without backups (forks, ephemeral CI databases):\n` +
          `  <Database name="${name}" backup={false} />`
      )
    }
    backup = true
  }
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
  // Provisioning destination for backend-provisioned credentials (the name
  // createSecretResources renders). The bootstrap REF consumers use is the
  // resolved credentialsRef below — the two names coincide exactly when a
  // provisioning backend is active.
  const secretName = `${name}-db-credentials`

  // Central credentials contract (see databaseCredentialsRef): the Secret
  // the bootstrap password lives in and every consumer must reference.
  // Shared clusters have no CNPG bootstrap generation (CNPG only
  // provisions for dedicated clusters and createSecretResources throws
  // without a backend), so the backend always provisions there.
  const credentialsRef = clusterConfig
    ? databaseCredentialsRef(name, secretProvider, 'backend')
    : databaseCredentialsRef(name, secretProvider, credentialsMode)

  const resources: ReturnType<typeof jsx>[] = []

  if (clusterConfig) {
    // Shared cluster — reuse connection info from the surrounding Cluster
    const connection = {
      host: clusterConfig.host,
      port: 5432,
      database: databaseName,
      username: ownerName,
      passwordSecret: credentialsRef,
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
    const needsCnpg = declareCnpg(sharedOperators).length > 0

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
            // Reference the provisioned bootstrap secret ONLY when the
            // contract resolves to it (see databaseCredentialsRef) — CNPG
            // does not auto-create a referenced Secret, so every other
            // combination omits initdb.secret and the operator generates
            // the native credentials secret (`<name>-app`, incl. fqdn-uri
            // references) in-cluster.
            ...(credentialsRef.name === secretName
              ? { secret: { name: credentialsRef.name } }
              : {}),
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
      passwordSecret: credentialsRef,
      passwordKey: 'password',
      vendor: 'postgres' as const,
    }

    if (needsCnpg) {
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

    // Backend-provisioned credentials: whenever the active backend renders
    // a Secret for the bootstrap reference (openbao/vault static sync,
    // sealed-secrets bundle — the exact set databaseCredentialsRef
    // resolves to `<name>-db-credentials`), it is created here. Passive
    // backends render nothing on dedicated clusters and
    // 'cnpg' credentialsMode skips provisioning entirely — in both cases
    // the operator generates the bootstrap secret in-cluster (incl.
    // fqdn-uri); apps referencing the CNPG-generated secret directly
    // (e.g. paperclip's externalURLSecretRef) work without vault-stored
    // DB credentials.
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
    // 'vault'/'openbao' render the static sync and 'sealed-secrets' the
    // SealedSecret — both into the same `<name>-db-credentials` destination
    // (secretName). These cases are exactly the set
    // provisionsBootstrapSecret() recognizes for the credentials contract;
    // keep them in sync with it.
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
