import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import {
  RoutingContext,
  Namespace,
  Labels,
  OperatorContext,
  SecretContext,
  type SecretProvider,
} from '@r8s/core/defaults'
import type { Operator } from '@r8s/k8s-types'
import { operators as operatorRegistry } from '@r8s/crds'

export type RoutingMode = 'ingress' | 'gateway'

export interface PlatformProps {
  /**
   * Routing implementation for the cluster.
   * - 'ingress': nginx Ingress (default)
   * - 'gateway': Envoy Gateway (Gateway API)
   */
  routing?: RoutingMode
  /** Gateway class name (only used when routing='gateway', default: 'eg') */
  gatewayClassName?: string
  /** Default namespace for all child resources */
  namespace?: string
  /** Default labels applied to all child resources */
  labels?: Record<string, string>
  /** Shared operators for all child resources */
  operators?: Operator[]
  /**
   * Secrets backend for all child resources. When set, Database and other
   * recipes generate credentials through this backend instead of requiring
   * plaintext passwords.
   *
   * - 'openbao': OpenBao Vault Secrets Operator (default when omitted)
   * - 'vault': HashiCorp Vault Secrets Operator
   * - 'sealed-secrets': Bitnami Sealed Secrets
   * - 'kubernetes': plain Kubernetes Secrets (CNPG-managed, no plaintext)
   */
  secrets?: SecretProvider
  /** Child components that inherit the cluster-level configuration this Platform sets */
  children?: unknown
}

/**
 * Platform — cluster-level configuration wrapper.
 *
 * @title Platform
 * @category Cluster Configuration
 *
 * Sets routing mode, namespace, labels, and shared operators for all
 * child components. Use this once at the top of your manifest instead
 * of manually wiring context providers.
 *
 * @example
 * import { Platform, App } from '@r8s/recipes'
 *
 * export default (
 *   <Platform routing="gateway" namespace="production">
 *     <App name="api" image="myapp/api:v1" host="api.example.com" />
 *     <App name="web" image="myapp/web:v1" host="app.example.com" />
 *   </Platform>
 * )
 *
 * @example
 * import { Platform, App } from '@r8s/recipes'
 *
 * export default (
 *   <Platform namespace="production">
 *     <App name="api" image="myapp/api:v1" host="api.example.com" />
 *   </Platform>
 * )
 *
 * @example
 * import { Platform, App, Database, cnpgOperator } from '@r8s/recipes'
 * import { operators } from '@r8s/crds'
 *
 * export default (
 *   <Platform
 *     routing="gateway"
 *     namespace="production"
 *     operators={[cnpgOperator(), operators['cert-manager']()]}
 *   >
 *     <Database name="app-db" storage="10Gi" />
 *     <App name="api" image="myapp/api:v1" host="api.example.com" />
 *   </Platform>
 * )
 */
export function Platform(props: PlatformProps) {
  const {
    routing = 'ingress',
    gatewayClassName = 'eg',
    namespace,
    labels,
    operators,
    secrets,
    children,
  } = props

  let result: unknown = children

  // Declare vault-secrets-operator when using vault/openbao backend
  const resources: ReturnType<typeof jsx>[] = []
  if (secrets?.backend === 'vault' || secrets?.backend === 'openbao') {
    const sharedOperators = useContext(OperatorContext)
    const hasVaultSecrets = sharedOperators.some((op) => op.name === 'vault-secrets-operator')
    if (!hasVaultSecrets) {
      resources.push(declareOperator(operatorRegistry['vault-secrets-operator']()))
    }
  }

  // Apply secrets context (outermost so all children share)
  if (secrets) {
    result = jsx(SecretContext.Provider, { value: secrets, children: result })
  }

  // Apply operators context
  if (operators && operators.length > 0) {
    result = jsx(OperatorContext.Provider, { value: operators, children: result })
  }

  // Apply labels context
  if (labels) {
    result = jsx(Labels.Provider, { value: labels, children: result })
  }

  // Apply namespace context
  if (namespace) {
    result = jsx(Namespace.Provider, { value: namespace, children: result })
  }

  // Apply routing context (innermost — closest to children)
  result = jsx(RoutingContext.Provider, {
    value: { mode: routing, gatewayClassName },
    children: result,
  })

  // Return operator declarations + wrapped children
  if (resources.length > 0) {
    return jsx(Fragment, { children: [...resources, result] })
  }
  return result
}
