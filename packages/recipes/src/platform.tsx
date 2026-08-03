import { jsx, Fragment, useContext } from '@r8s/core'
import {
  RoutingContext,
  Namespace,
  Labels,
  OperatorContext,
  SecretContext,
  type SecretProvider as SecretProviderConfig,
} from '@r8s/core/defaults'
import type { Operator } from '@r8s/k8s-types'
import { SecretProvider, type SecretProviderValue } from './secret-provider'
import { DnsProvider, type DnsProviderValue } from './dns-provider'
import {
  EndpointProvider,
  type EndpointProviderValue,
  type EndpointConfig,
} from './endpoint-provider'

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
   *
   * Use a string for simple cases, or a component for advanced config:
   * `secrets={<OpenBao mount="secret" path="infra" />}`
   */
  secrets?: SecretProviderValue
  /**
   * DNS configuration for all child endpoints. When set, Endpoint/App
   * automatically create DNS records via ExternalDNS.
   *
   * Use a string for simple cases, or a component for advanced config:
   * `dns={<ExternalDns server="ns1.example.com" tsig={{...}} />}`
   */
  dns?: DnsProviderValue
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
 * For finer control, use the individual providers directly:
 * - `<SecretProvider>` for secrets backend
 * - `<DnsProvider>` for DNS configuration
 * - `<EndpointProvider>` for routing
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
 *
 * @example
 * // Full hierarchy with DNS and secrets
 * import { Platform, App } from '@r8s/recipes'
 *
 * export default (
 *   <Platform
 *     namespace="production"
 *     secrets={{ backend: 'openbao', mount: 'secret', path: 'infra' }}
 *     dns={{
 *       provider: 'external-dns',
 *       settings: {
 *         server: 'ns1.example.com',
 *         zone: 'example.com',
 *         tsig: { path: 'dns/tsig', key: 'secret' },
 *       },
 *     }}
 *   >
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
    dns,
    children,
  } = props

  let result: unknown = children

  // Materialize the Namespace resource so rendered output is self-contained.
  // Without this, every resource references a namespace that may not exist.
  if (namespace) {
    result = jsx(Fragment, {
      children: [
        jsx('Namespace', {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: { name: namespace },
        }),
        result,
      ],
    })
  }

  // Apply DNS context via DnsProvider (inside SecretProvider so it can access secrets)
  if (dns) {
    result = jsx(DnsProvider, { provider: dns, children: result })
  }

  // Apply secrets context via SecretProvider (outside DnsProvider)
  if (secrets) {
    result = jsx(SecretProvider, { provider: secrets, children: result })
  }

  // Apply routing context via EndpointProvider
  const endpointProvider: EndpointProviderValue =
    routing === 'gateway' ? { provider: 'envoy-gateway', settings: { gatewayClassName } } : 'nginx'
  result = jsx(EndpointProvider, { provider: endpointProvider, children: result })

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

  return result
}
