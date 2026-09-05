import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'
import { OperatorContext } from '@r8s/core/defaults'
import { declareIfMissing } from '@r8s/operator-cert-manager'

/**
 * CertManager configuration component.
 *
 * Use as a value in CertProvider when you need custom configuration:
 * ```tsx
 * <CertProvider provider={<CertManager clusterIssuer="letsencrypt-prod" />}>
 * ```
 */
export interface CertManagerProps {
  /** Default ClusterIssuer for certificates (default: 'letsencrypt-prod') */
  clusterIssuer?: string
  /** Default certificate duration (default: '2160h' = 90 days) */
  duration?: string
  /** Default renew before expiry (default: '360h' = 15 days) */
  renewBefore?: string
}

export function CertManager(props: CertManagerProps): CertConfig {
  return {
    provider: 'cert-manager',
    settings: {
      clusterIssuer: props.clusterIssuer ?? 'letsencrypt-prod',
      duration: props.duration ?? '2160h',
      renewBefore: props.renewBefore ?? '360h',
    },
  }
}

/** Certificate provider configuration */
export interface CertConfig {
  /** Certificate provider type */
  provider: 'cert-manager'
  /** Provider-specific settings */
  settings: {
    /** Default ClusterIssuer */
    clusterIssuer: string
    /** Default certificate duration */
    duration: string
    /** Default renew before expiry */
    renewBefore: string
  }
}

/** Union of all cert provider configurations */
export type CertProviderValue = 'cert-manager' | CertConfig

export const CertContext = createContext<CertConfig | null>(null)

export interface CertProviderProps {
  /**
   * Certificate provider — string for simple cases, component for advanced config.
   *
   * @example
   * // Simple string
   * <CertProvider provider="cert-manager">
   *
   * @example
   * // Advanced component
   * <CertProvider provider={<CertManager clusterIssuer="letsencrypt-staging" />}>
   */
  provider: CertProviderValue
  /** Child components */
  children?: unknown
}

/**
 * CertProvider — cluster-level certificate management.
 *
 * Sets up cert-manager for TLS certificates. All Endpoint/App children
 * automatically get TLS certificates when tls prop is set.
 *
 * @example
 * // Simple string provider
 * import { CertProvider, App } from '@r8s/recipes'
 *
 * export default (
 *   <CertProvider provider="cert-manager">
 *     <App name="api" image="myapp:v1" host="api.example.com" tls={{ secretName: 'api-tls' }} />
 *   </CertProvider>
 * )
 *
 * @example
 * // Advanced component provider
 * import { CertProvider, CertManager, App } from '@r8s/recipes'
 *
 * export default (
 *   <CertProvider provider={<CertManager clusterIssuer="letsencrypt-staging" duration="168h" />}>
 *     <App name="api" image="myapp:v1" host="api.example.com" tls={{ secretName: 'api-tls' }} />
 *   </CertProvider>
 * )
 */
export function CertProvider(props: CertProviderProps) {
  const { provider, children } = props

  const sharedOperators = useContext(OperatorContext)

  // Resolve provider config
  const config: CertConfig =
    typeof provider === 'string'
      ? {
          provider,
          settings: {
            clusterIssuer: 'letsencrypt-prod',
            duration: '2160h',
            renewBefore: '360h',
          },
        }
      : provider

  const resources: ReturnType<typeof jsx>[] = []

  // Declare cert-manager operator
  resources.push(...declareIfMissing(sharedOperators))

  return jsx(Fragment, {
    children: [...resources, jsx(CertContext.Provider, { value: config, children })],
  })
}
