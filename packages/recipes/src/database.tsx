import { jsx, useContext, declareOperator } from '@r8s/core'
import { Cluster } from '@r8s/crds/postgresql'
import { DatabaseContext, SecretContext, OperatorContext, ClusterContext } from '@r8s/core/defaults'
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
   * Password for the database. Only needed when no secrets backend is
   * configured on the Platform. When a secrets backend (openbao, vault,
   * sealed-secrets) is active, credentials are managed automatically.
   */
  password?: string
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
 * Without a secrets backend, CNPG manages the bootstrap secret automatically.
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
    namespace = 'default',
    storage = '10Gi',
    operatorVersion,
    password,
    children,
  } = props

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

    resources.push(
      ...createSecretResources(
        name,
        namespace,
        secretName,
        secretProvider,
        password,
        clusterConfig.host
      )
    )

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
    // credentials. For kubernetes backend, CNPG manages the bootstrap secret
    // automatically — but we still validate that a password was provided
    // when kubernetes backend is explicitly chosen.
    if (secretProvider) {
      resources.push(
        ...createSecretResources(
          name,
          namespace,
          secretName,
          secretProvider,
          password,
          `${name}-rw`
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
 * backend. Throws a descriptive error when a password is needed but not
 * provided, or when the backend is not configured.
 */
function createSecretResources(
  name: string,
  namespace: string,
  secretName: string,
  secretProvider: { backend: string; mount?: string; path?: string; authRef?: string } | null,
  password: string | undefined,
  host: string
): ReturnType<typeof jsx>[] {
  const resources: ReturnType<typeof jsx>[] = []

  if (!secretProvider) {
    if (!password) {
      throw new Error(
        `Database "${name}" has no secrets backend configured and no password provided.\n` +
          `\n` +
          `Fix: either set a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao' }}>\n` +
          `    <Database name="${name}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or provide a password directly (not recommended for production):\n` +
          `  <Database name="${name}" password="..." />`
      )
    }
    resources.push(
      jsx('Secret', {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: secretName, namespace },
        stringData: {
          password,
          username: name,
          uri: `postgresql://${name}:${password}@${host}:5432/${name}`,
        },
      })
    )
    return resources
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
      if (!password) {
        throw new Error(
          `Database "${name}" uses the 'kubernetes' secrets backend, which requires a password.\n` +
            `\n` +
            `The kubernetes backend stores credentials as plain Kubernetes Secrets.\n` +
            `For production, use a managed backend instead:\n` +
            `  <Platform secrets={{ backend: 'openbao' }}>\n` +
            `\n` +
            `Or provide a password explicitly:\n` +
            `  <Database name="${name}" password="..." />`
        )
      }
      resources.push(
        jsx('Secret', {
          apiVersion: 'v1',
          kind: 'Secret',
          metadata: { name: secretName, namespace },
          stringData: {
            password,
            username: name,
            uri: `postgresql://${name}:${password}@${host}:5432/${name}`,
          },
        })
      )
      break

    default:
      throw new Error(
        `Database "${name}" has an unknown secrets backend "${secretProvider.backend}".\n` +
          `Supported backends: 'openbao', 'vault', 'sealed-secrets', 'kubernetes'`
      )
  }

  return resources
}
