import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'
import { OperatorContext, SecretContext } from '@r8s/core/defaults'
import { declareIfMissing } from '@r8s/operator-external-dns'

/**
 * ExternalDNS configuration component.
 *
 * Use as a value in DnsProvider when you need custom configuration:
 * ```tsx
 * <DnsProvider provider={<ExternalDns server="ns1.example.com" tsig={{ path: 'dns/tsig', key: 'secret' }} />}>
 * ```
 */
export interface ExternalDnsProps {
  /** DNS server for RFC 2136 updates (e.g., 'ns1.example.com') */
  server?: string
  /** DNS zone name (e.g., 'example.com') */
  zone?: string
  /** TSIG secret for secure updates */
  tsig?: {
    /** Vault/OpenBao path to the TSIG key */
    path: string
    /** Key in the Vault/OpenBao secret */
    key: string
    /** Kubernetes Secret name to create (default: 'external-dns-tsig') */
    secretName?: string
  }
  /** Cloud provider config (alternative to RFC 2136) */
  cloud?: {
    provider: 'aws' | 'google' | 'cloudflare'
    /** Provider-specific options */
    options?: Record<string, string>
  }
  /**
   * Explicit DNS targets (IPs or hostnames) for DNSEndpoint records.
   * When set, Endpoint components create DNSEndpoint CRs with these targets.
   * When omitted, Endpoints annotate Gateway/Ingress instead and let
   * ExternalDNS discover hostnames via its gateway/ingress source.
   */
  targets?: string[]
}

export function ExternalDns(props: ExternalDnsProps): DnsConfig {
  return {
    provider: 'external-dns',
    settings: props,
  }
}

/** DNS provider configuration */
export interface DnsConfig {
  /** DNS provider type */
  provider: 'external-dns'
  /** Provider-specific settings */
  settings: ExternalDnsProps
}

/** Union of all DNS provider configurations */
export type DnsProviderValue = 'external-dns' | DnsConfig

export const DnsContext = createContext<DnsConfig | null>(null)

export interface DnsProviderProps {
  /**
   * DNS provider — string for simple cases, component for advanced config.
   *
   * @example
   * // Simple string
   * <DnsProvider provider="external-dns">
   *
   * @example
   * // Advanced component
   * <DnsProvider provider={<ExternalDns server="ns1.example.com" tsig={{ path: 'dns/tsig', key: 'secret' }} />}>
   */
  provider: DnsProviderValue
  /** Child components */
  children?: unknown
}

/**
 * DnsProvider — cluster-level DNS configuration.
 *
 * Sets up ExternalDNS with the specified provider and credentials.
 * All Endpoint/App children automatically create DNS records.
 *
 * @example
 * import { DnsProvider, SecretProvider, App } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider="openbao">
 *     <DnsProvider provider="external-dns">
 *       <App name="api" image="myapp:v1" host="api.example.com" />
 *     </DnsProvider>
 *   </SecretProvider>
 * )
 *
 * @example
 * import { DnsProvider, ExternalDns, SecretProvider, App } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider="openbao">
 *     <DnsProvider provider={
 *       <ExternalDns
 *         server="ns1.example.com"
 *         zone="example.com"
 *         tsig={{ path: 'dns/tsig', key: 'secret' }}
 *       />
 *     }>
 *       <App name="api" image="myapp:v1" host="api.example.com" />
 *     </DnsProvider>
 *   </SecretProvider>
 * )
 *
 * @example
 * import { DnsProvider, ExternalDns, App } from '@r8s/recipes'
 *
 * export default (
 *   <DnsProvider provider={
 *     <ExternalDns cloud={{ provider: 'google', options: { project: 'my-project' } }} />
 *   }>
 *     <App name="api" image="myapp:v1" host="api.example.com" />
 *   </DnsProvider>
 * )
 */
export function DnsProvider(props: DnsProviderProps) {
  const { provider, children } = props

  const sharedOperators = useContext(OperatorContext)
  const secrets = useContext(SecretContext)

  // Resolve provider config
  let config: DnsConfig
  if (typeof provider === 'string') {
    config = { provider, settings: {} }
  } else if ('settings' in provider) {
    config = provider
  } else if (
    provider &&
    typeof provider === 'object' &&
    'type' in provider &&
    (provider as any).type === ExternalDns
  ) {
    // r8s JSX element — call the component with its props
    config = ExternalDns((provider as any).props)
  } else {
    config = { provider: 'external-dns', settings: provider }
  }

  const resources: ReturnType<typeof jsx>[] = []

  // Declare external-dns operator
  resources.push(...declareIfMissing(sharedOperators))

  // TSIG secret via VSO
  if (config.settings.tsig) {
    if (!secrets || (secrets.backend !== 'vault' && secrets.backend !== 'openbao')) {
      throw new Error(
        `DnsProvider: tsig requires SecretProvider with backend 'vault' or 'openbao'. ` +
          `Current: ${secrets?.backend ?? 'none'}. ` +
          `Fix: wrap in <SecretProvider provider="openbao"> or remove tsig.`
      )
    }

    const secretName = config.settings.tsig.secretName ?? 'external-dns-tsig'
    const mount = secrets.mount ?? 'secret'
    const basePath = secrets.path ?? ''
    const fullPath = basePath
      ? `${basePath}/${config.settings.tsig.path}`
      : config.settings.tsig.path

    const SecretKind = secrets.backend === 'openbao' ? 'OpenBaoStaticSecret' : 'VaultStaticSecret'
    resources.push(
      jsx(SecretKind, {
        apiVersion: 'secrets.hashicorp.com/v1beta1',
        kind: SecretKind,
        metadata: { name: secretName, namespace: 'external-dns' },
        spec: {
          mount,
          path: fullPath,
          type: 'kv-v2',
          destination: { name: secretName, create: true },
          refreshAfter: '1h',
        },
      })
    )
  }

  return jsx(Fragment, {
    children: [...resources, jsx(DnsContext.Provider, { value: config, children })],
  })
}
