import { jsx, useContext } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'
import { RoutingContext } from '@r8s/core/defaults'

/**
 * Nginx Ingress configuration component.
 *
 * Use as a value in EndpointProvider when you need custom configuration:
 * ```tsx
 * <EndpointProvider provider={<Nginx className="nginx-internal" />}>
 * ```
 */
export interface NginxProps {
  /** Ingress class name (default: 'nginx') */
  className?: string
  /** Default TLS configuration */
  tls?: {
    /** ClusterIssuer for cert-manager */
    clusterIssuer?: string
  }
}

export function Nginx(props: NginxProps): EndpointConfig {
  return {
    provider: 'nginx',
    settings: {
      ingressClassName: props.className ?? 'nginx',
      tls: props.tls,
    },
  }
}

/**
 * Envoy Gateway configuration component.
 *
 * Use as a value in EndpointProvider when you need custom configuration:
 * ```tsx
 * <EndpointProvider provider={<EnvoyGateway className="eg" tls={{ clusterIssuer: 'letsencrypt' }} />}>
 * ```
 */
export interface EnvoyGatewayProps {
  /** Gateway class name (default: 'eg') */
  className?: string
  /** Default TLS configuration */
  tls?: {
    /** ClusterIssuer for cert-manager */
    clusterIssuer?: string
  }
}

export function EnvoyGateway(props: EnvoyGatewayProps): EndpointConfig {
  return {
    provider: 'envoy-gateway',
    settings: {
      gatewayClassName: props.className ?? 'eg',
      tls: props.tls,
    },
  }
}

/** Endpoint provider configuration */
export interface EndpointConfig {
  /** Routing implementation */
  provider: 'nginx' | 'envoy-gateway'
  /** Provider-specific settings */
  settings?: {
    /** Gateway class name (envoy-gateway only) */
    gatewayClassName?: string
    /** Ingress class name (nginx only) */
    ingressClassName?: string
    /** Default TLS configuration */
    tls?: {
      clusterIssuer?: string
    }
  }
}

/** Union of all endpoint provider configurations */
export type EndpointProviderValue = 'nginx' | 'envoy-gateway' | EndpointConfig

export const EndpointContext = createContext<EndpointConfig>({ provider: 'nginx' })

export interface EndpointProviderProps {
  /**
   * Endpoint provider — string for simple cases, component for advanced config.
   *
   * @example
   * // Simple string provider
   * import { EndpointProvider, App } from '@r8s/recipes'
   *
   * export default (
   *   <EndpointProvider provider="nginx">
   *     <App name="api" image="myapp:v1" host="api.example.com" />
   *   </EndpointProvider>
   * )
   *
   * @example
   * // Advanced component provider
   * import { EndpointProvider, Nginx, App } from '@r8s/recipes'
   *
   * export default (
   *   <EndpointProvider provider={<Nginx className="nginx-internal" />}>
   *     <App name="api" image="myapp:v1" host="api.example.com" />
   *   </EndpointProvider>
   * )
   */
  provider: EndpointProviderValue
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
 * // Simple string provider
 * import { EndpointProvider, App } from '@r8s/recipes'
 *
 * export default (
 *   <EndpointProvider provider="nginx">
 *     <App name="api" image="myapp:v1" host="api.example.com" />
 *   </EndpointProvider>
 * )
 *
 * @example
 * // Nginx with custom class and TLS
 * import { EndpointProvider, Nginx, App } from '@r8s/recipes'
 *
 * export default (
 *   <EndpointProvider provider={<Nginx className="nginx-internal" tls={{ clusterIssuer: 'letsencrypt' }} />}>
 *     <App name="api" image="myapp:v1" host="api.example.com" />
 *   </EndpointProvider>
 * )
 *
 * @example
 * // Envoy Gateway with TLS
 * import { EndpointProvider, EnvoyGateway, App } from '@r8s/recipes'
 *
 * export default (
 *   <EndpointProvider provider={<EnvoyGateway className="eg" tls={{ clusterIssuer: 'letsencrypt-prod' }} />}>
 *     <App name="api" image="myapp:v1" host="api.example.com" />
 *   </EndpointProvider>
 * )
 */
export function EndpointProvider(props: EndpointProviderProps) {
  const { provider, children } = props

  // Resolve provider config
  const config: EndpointConfig = typeof provider === 'string' ? { provider } : provider

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
