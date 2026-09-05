import { createContext } from './context'
import { useContext } from './renderer'
import type { Operator } from '@r8s/k8s-types'

/** Database connection info passed via context */
export interface DatabaseConnection {
  host: string
  port: number
  database: string
  username: string
  passwordSecret: { name: string; key: string }
  /** Key for the password within the secret (defaults to 'password') */
  passwordKey?: string
  vendor?: string
}

/** Secret provider configuration */
export interface SecretProvider {
  backend: 'vault' | 'openbao' | 'sealed-secrets' | 'manual-secrets' | 'kubernetes' | (string & {})
  /**
   * Custom provisioner hook. Built-in backends (vault/openbao) get one
   * attached by the recipes' SecretProvider; anything carrying
   * `provision()` is treated as provisioning-capable regardless of
   * backend identity — orgs can plug ESO/Infisical/CSI without touching
   * packages.
   */
  provision?: SecretProvisioner
  mount?: string
  path?: string
  authRef?: string
  /**
   * How often the secrets operator re-syncs from the backend (e.g. '3600s'),
   * rendered as `refreshAfter` on every generated
   * VaultStaticSecret/OpenBaoStaticSecret. Enables credential rotation —
   * combine with `rolloutRestartTargets` on consumers so pods pick up
   * rotated values.
   */
  refreshAfter?: string
}

/**
 * Default contexts for shared infrastructure properties.
 *
 * These contexts allow properties to be inherited down the component tree,
 * eliminating the need to pass the same values to every component.
 *
 * @example
 * ```tsx
 * import { Namespace, Labels } from '@r8s/core/defaults';
 *
 * export default function App() {
 *   return (
 *     <Namespace.Provider value="production">
 *       <Labels.Provider value={{ app: 'myapp', team: 'platform' }}>
 *         <Database name="app-db" />
 *         <WebService name="api" image="myapp/api:v1" />
 *       </Labels.Provider>
 *     </Namespace.Provider>
 *   );
 * }
 * ```
 */

/** Inherits namespace to all child resources */
export const Namespace = createContext<string>('default')

/**
 * Resolve the effective namespace: explicit prop wins, otherwise inherit
 * from the Platform tree, otherwise 'default'. Replaces the inline
 * `namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace :
 * undefined) ?? 'default'` formula that was copied through every recipe
 * and package — namespace policy lives here now.
 */
export function useNamespace(override?: string): string {
  const contextNamespace = useContext(Namespace)
  return override ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'
}

// --- Capability hooks -------------------------------------------------------
// Context values may carry a provisioner/route hook. Callers code against
// the capability, never the provider's identity — new backends (external
// secrets operators, cloud secret stores, custom ingress classes) plug in
// without touching any recipe or package.

/** One bundle to provision through a secrets backend */
export interface StaticSecretRequest {
  /** Resource name (usually equals the destination Secret name) */
  name: string
  namespace: string
  /** KV path in the secret store */
  path: string
  /** Destination→source key mapping (env-case destination, snake_case source) */
  keys: Record<string, string>
  /** Provisioned Kubernetes Secret name (defaults to name) */
  secretName?: string
  /** Store mount path */
  mount?: string
  /** Auth reference override (defaults to the provider's authRef) */
  authRef?: string
  /** Re-sync interval */
  refreshAfter?: string
  /** Workloads restarted after rotation (already field-normalized) */
  restartTargets?: { kind?: string; name: string; apiVersion?: string }[]
}

/**
 * Provisioner hook: given a request, produce the backend-specific resources
 * (e.g. VaultStaticSecret, OpenBaoStaticSecret, ExternalSecret, …).
 * Elements are flattened into the render result.
 */
export type SecretProvisioner = (req: StaticSecretRequest) => unknown

/** Route request handed to a custom routing provisioner */
export interface RouteRequest {
  name: string
  namespace: string
  host: string
  serviceName: string
  servicePort: number
  pathPrefix?: string
  annotations?: Record<string, string>
  additionalAnnotations?: Record<string, string>
  tls?: {
    secretName?: string
    clusterIssuer?: string
    wildcardSecretName?: string
    ingressClassName?: string
  }
}

/**
 * Route provisioner hook: given a request, produce the backend-specific
 * route resources (Ingress/HTTPRoute/… + any supporting objects).
 */
export type RouteProvisioner = (req: RouteRequest) => unknown

/** Inherits labels to all child resources */
export const Labels = createContext<Record<string, string>>({})

/** Inherits annotations to all child resources */
export const Annotations = createContext<Record<string, string>>({})

/** Inherits environment variables to all child containers */
export const Environment = createContext<Array<{ name: string; value: string }>>([])

/** Inherits resource requests/limits to all child containers */
export const Resources = createContext<{
  requests?: Record<string, string>
  limits?: Record<string, string>
}>({})

/** Inherits service account name to all child pods */
export const ServiceAccount = createContext<string>('default')

/** Inherits image registry prefix (e.g., 'ghcr.io/myorg') */
export const ImageRegistry = createContext<string>('')

/** Inherits domain suffix for ingresses */
export const Domain = createContext<string>('')

/** Inherits TLS configuration */
export const TLS = createContext<{
  enabled: boolean
  issuer?: string
  secretName?: string
}>({ enabled: false })

/**
 * Cluster context for shared PostgreSQL clusters.
 *
 * When multiple databases should share the same CNPG cluster,
 * wrap them in a Cluster component. Each Database reads this
 * context and reuses the shared cluster's connection info instead
 * of creating a dedicated cluster.
 *
 * @example
 * ```tsx
 * import { Cluster } from '@r8s/recipes';
 *
 * <Cluster name="main" storage="100Gi">
 *   <Database name="user-db" />
 *   <Database name="order-db" />
 * </Cluster>
 * ```
 */
export interface ClusterConfig {
  name: string
  namespace: string
  storage: string
  host: string
  secretName: string
  /**
   * Reference to the Kubernetes Secret holding the shared cluster's password.
   * Optional because the `Cluster` component itself does not create a Secret —
   * CNPG provisions secrets automatically with its own naming. Consumers that
   * need an explicit reference should set this when they know the secret name
   * (e.g. when a `<Database />` child creates its own credentials secret).
   */
  passwordSecret?: { name: string; key: string }
}

export const ClusterContext = createContext<ClusterConfig | null>(null)

/**
 * Database connection context for component composition.
 *
 * When a Database component renders, it sets this context so that
 * downstream components can automatically wire up their connections.
 *
 * @example
 * ```tsx
 * import { DatabaseContext } from '@r8s/core/defaults';
 *
 * export default function Platform() {
 *   return (
 *     <Database name="keycloak-db" storage="10Gi">
 *       <KeycloakInstance name="keycloak" hostname="auth.example.com" />
 *     </Database>
 *   );
 * }
 * ```
 */
export const DatabaseContext = createContext<DatabaseConnection | null>(null)

/**
 * Secret provider context for pluggable secret management.
 *
 * Components read this to determine how credentials should be stored:
 * - Vault: Creates VaultStaticSecret + VaultAuth (VSO)
 * - OpenBao: Creates OpenBaoStaticSecret + OpenBaoAuth
 * - Kubernetes: Plain Kubernetes Secret
 *
 * @example
 * ```tsx
 * import { SecretContext } from '@r8s/core/defaults';
 *
 * // Use Vault for all secrets in this subtree
 * <SecretContext.Provider value={{ backend: 'vault', mount: 'secret', path: 'app/db', authRef: 'vault-auth' }}>
 *   <Database name="app-db" storage="10Gi" />
 *   <KeycloakInstance name="keycloak" hostname="auth.example.com" />
 * </SecretContext.Provider>
 * ```
 */
export const SecretContext = createContext<SecretProvider | null>(null)

/**
 * Operator context for declaring Kubernetes operator dependencies.
 *
 * Components that require operators (CNPG, cert-manager, etc.) can either:
 * 1. Read operators from this context (shared operators)
 * 2. Create their own operator instances and return them as resources
 *
 * The renderer collects all operators so the deployment pipeline can
 * install them before applying application resources.
 *
 * @example
 * ```tsx
 * import { OperatorContext } from '@r8s/core/defaults';
 * import { cnpgOperator } from '@r8s/recipes';
 * import { certManagerOperator } from '@r8s/cert-manager';
 *
 * // Shared operators for entire stack
 * <OperatorContext.Provider value={[
 *   cnpgOperator('1.22.5'),
 *   certManagerOperator('1.14.0'),
 * ]}>
 *   <Database name="app-db" storage="10Gi" />
 *   <App name="myapp" host="myapp.example.com" tls={{ secretName: "myapp-tls", clusterIssuer: "letsencrypt" }} />
 * </OperatorContext.Provider>
 * ```
 */
export const OperatorContext = createContext<Operator[]>([])

/**
 * Routing context for cluster-wide routing implementation.
 *
 * Set this once at the top of the tree to tell <Endpoint /> and <App />
 * whether the cluster uses nginx Ingress or Envoy Gateway (Gateway API).
 * Components read this and render the appropriate resources.
 *
 * @example
 * ```tsx
 * import { RoutingContext } from '@r8s/core/defaults';
 *
 * // Envoy Gateway cluster
 * <RoutingContext.Provider value={{ mode: 'gateway', gatewayClassName: 'eg' }}>
 *   <App name="myapp" host="myapp.example.com" />
 * </RoutingContext.Provider>
 *
 * // nginx Ingress cluster (default, no provider needed)
 * <App name="myapp" host="myapp.example.com" />
 * ```
 */
export interface RoutingConfig {
  /** Routing implementation: 'ingress' (nginx) or 'gateway' (Envoy Gateway API) */
  mode: 'ingress' | 'gateway' | (string & {})
  /** Gateway class name (only used when mode='gateway', default: 'eg') */
  gatewayClassName?: string
  /**
   * Custom route provisioner hook. When set, <Endpoint/> delegates the
   * whole route render to it and ignores mode — orgs can plug a custom
   * ingress controller / L7 stack without touching recipes or packages.
   */
  route?: RouteProvisioner
}

export const RoutingContext = createContext<RoutingConfig>({ mode: 'ingress' })

// Re-export createContext for provider components in recipes
export { createContext } from './context'
