import { jsx, useContext } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'
import { RoutingContext } from '@r8s/core/defaults'

/**
 * Endpoint provider configuration.
 *
 * Determines how endpoints are exposed: nginx Ingress or Envoy Gateway.
 */
export interface EndpointConfig {
  /** Routing implementation */
  provider: 'nginx' | 'envoy-gateway'
  /** Provider-specific settings */
  settings?: {
    /** Gateway class name (envoy-gateway only, default: 'eg') */
    gatewayClassName?: string
    /** Ingress class name (nginx only, default: 'nginx') */
    ingressClassName?: string
    /** Default TLS configuration */
    tls?: {
      /** ClusterIssuer for cert-manager */
      clusterIssuer?: string
      /** Default secret name pattern (e.g., '{name}-tls') */
      secretNamePattern?: string
    }
  }
}

export const EndpointContext = createContext<EndpointConfig>({ provider: 'nginx' })

export interface EndpointProviderProps {
  /** Endpoint configuration */
  config: EndpointConfig
  /** Child components */
  children?: unknown
}

/**
 * EndpointProvider — cluster-level routing configuration.
 *
 * Sets whether endpoints use nginx Ingress or Envoy Gateway (Gateway API).
 * All Endpoint/App children read this context.
 *
 * @example
 * import { EndpointProvider } from '@r8s/recipes'
 *
 * // nginx Ingress (default)
 * <EndpointProvider provider="nginx">
 *   <App name="api" image="myapp:v1" host="api.example.com" />
 * </EndpointProvider>
 *
 * @example
 * // Envoy Gateway with TLS
 * <EndpointProvider
 *   provider="envoy-gateway"
 *   settings={{
 *     gatewayClassName: 'eg',
 *     tls: { clusterIssuer: 'letsencrypt-prod' },
 *   }}
 * >
 *   <App name="api" image="myapp:v1" host="api.example.com" />
 * </EndpointProvider>
 */
export function EndpointProvider(props: EndpointProviderProps) {
  const { config, children } = props

  // Map to RoutingContext for backward compatibility
  const routing = {
    mode: config.provider === 'envoy-gateway' ? ('gateway' as const) : ('ingress' as const),
    gatewayClassName: config.settings?.gatewayClassName ?? 'eg',
  }

  return jsx(RoutingContext.Provider, {
    value: routing,
    children: jsx(EndpointContext.Provider, { value: config, children }),
  })
}
