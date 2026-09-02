import { jsx, useContext, declareOperator } from '@r8s/core'
import { Cluster } from '@r8s/crds/postgresql'
import {
  DatabaseContext,
  SecretContext,
  OperatorContext,
  ClusterContext,
  Namespace,
} from '@r8s/core/defaults'
import { cnpgOperator } from './operators'

export interface DatabaseProps {
  /** Resource name (also the default database name) */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Storage size (e.g., '10Gi') for the dedicated cluster data volume */
  storage?: string
  /** Operator version override. If not set, reads from OperatorContext or uses default. */
  operatorVersion?: string
  /**
   * SQL statements run once after the initial database bootstrap
   * (CNPG `bootstrap.initdb.postInitApplicationSQL`). Use for schema
   * extensions the application requires on a fresh cluster — e.g.
   * creating roles or extensions. Parameterized by the CNPG operator.
   */
  postInitSQL?: string[]
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
 * When wrapped in a `<Database>` component, child components receive the
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
 * export default <Database name="app-db" storage="10Gi" />
 *
 * @example
 * import { Platform, Database, WebService } from '@r8s/recipes'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao' }}>
 *     <Database name="app-db" storage="10Gi">
 *       <WebService name="api" image="myapp/api:v1" />
 *     </Database>
 *   </Platform>
 * )
 */
export function Database(props: DatabaseProps) {
  const {
    name,
    namespace: namespaceProp,
    storage = '10Gi',
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
        `    <Database name="${name}" />\n` +
        `  </Platform>\n` +
        `\n` +
        `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'`
    )
  }

  // Inherit namespace from <Platform> context if not explicitly set
  const contextNamespace = useContext(Namespace)
  const namespace =
    namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'

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
      database: name,
      username: name,
      passwordSecret: { name: secretName, key: 'password' },
      passwordKey: 'password',
      vendor: 'postgres' as const,
    }

    resources.push(...createSecretResources(name, namespace, secretName, secretProvider, 'shared'))

    if (children) {
      resources.push(jsx(DatabaseContext.Provider, { value: connection, children }))
    }
  } else {
    // Dedicated cluster — create full CNPG cluster
    const hasCNPG = sharedOperators.some((op) => op.name === 'cnpg')

    const cluster: Cluster = {
      apiVersion: 'postgresql.cnpg.io/v1',
      kind: 'Cluster',
      metadata: { name, namespace },
      spec: {
        instances: 3,
        storage: { size: storage },
        bootstrap: {
          initdb: {
            database: name,
            owner: name,
            secret: { name: secretName },
            // Roles/extensions the application needs on a fresh cluster —
            // applied once by CNPG after the initial bootstrap.
            ...(postInitSQL && postInitSQL.length > 0
              ? { postInitApplicationSQL: postInitSQL }
              : {}),
          },
        },
        monitoring: { enablePodMonitor: true },
      },
    }

    const connection = {
      host: `${name}-rw`,
      port: 5432,
      database: name,
      username: name,
      passwordSecret: { name: secretName, key: 'password' },
      passwordKey: 'password',
      vendor: 'postgres' as const,
    }

    if (!hasCNPG) {
      resources.push(declareOperator(cnpgOperator(operatorVersion)))
    }

    resources.push(jsx('Cluster', cluster))

    // For dedicated clusters with a secrets backend, the backend manages
    // credentials. For kubernetes/manual-secrets backend, CNPG manages the
    // bootstrap secret automatically — no plaintext Secret is rendered.
    if (secretProvider) {
      resources.push(
        ...createSecretResources(name, namespace, secretName, secretProvider, 'dedicated')
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
  secretProvider: { backend: string; mount?: string; path?: string; authRef?: string } | null,
  mode: 'shared' | 'dedicated'
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
        `    <Database name="${name}" />\n` +
        `  </Platform>\n` +
        `\n` +
        `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes', 'manual-secrets'`
    )
  }

  switch (secretProvider.backend) {
    case 'vault':
      resources.push(
        jsx('VaultStaticSecret', {
          apiVersion: 'secrets.hashicorp.com/v1beta1',
          kind: 'VaultStaticSecret',
          metadata: { name: `${name}-db-secret`, namespace },
          spec: {
            vaultAuthRef: secretProvider.authRef,
            mount: secretProvider.mount,
            type: 'kv-v2',
            path: `${secretProvider.path}/${name}`,
            destination: { create: true, name: secretName },
          },
        })
      )
      break

    case 'openbao':
      resources.push(
        jsx('OpenBaoStaticSecret', {
          apiVersion: 'secrets.openbao.org/v1beta1',
          kind: 'OpenBaoStaticSecret',
          metadata: { name: `${name}-db-secret`, namespace },
          spec: {
            openbaoAuthRef: secretProvider.authRef,
            mount: secretProvider.mount,
            type: 'kv-v2',
            path: `${secretProvider.path}/${name}`,
            destination: { create: true, name: secretName },
          },
        })
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
            `    <Database name="${name}" />\n` +
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
