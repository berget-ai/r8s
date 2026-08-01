import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'
import { OperatorContext, SecretContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'

/**
 * DNS provider configuration.
 *
 * Currently supports ExternalDNS with RFC 2136 (TSIG) or cloud providers
 * (Route53, Cloudflare, Google Cloud DNS).
 */
export interface DnsConfig {
  /** DNS provider type */
  provider: 'external-dns'
  /** ExternalDNS-specific settings */
  settings: {
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
      /** Provider-specific options (e.g., { project: 'my-project' } for Google) */
      options?: Record<string, string>
    }
  }
}

export const DnsContext = createContext<DnsConfig | null>(null)

export interface DnsProviderProps {
  /** DNS configuration */
  config: DnsConfig
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
 * import { DnsProvider, SecretProvider } from '@r8s/recipes'
 *
 * // RFC 2136 with TSIG from OpenBao
 * <SecretProvider provider="openbao" mount="secret" path="infra">
 *   <DnsProvider
 *     provider="external-dns"
 *     settings={{
 *       server: 'ns1.example.com',
 *       zone: 'example.com',
 *       tsig: { path: 'dns/tsig', key: 'secret' },
 *     }}
 *   >
 *     <App name="api" image="myapp:v1" host="api.example.com" />
 *   </DnsProvider>
 * </SecretProvider>
 *
 * @example
 * // Google Cloud DNS
 * <DnsProvider
 *   provider="external-dns"
 *   settings={{
 *     cloud: { provider: 'google', options: { project: 'my-project' } },
 *   }}
 * >
 *   <App name="api" image="myapp:v1" host="api.example.com" />
 * </DnsProvider>
 */
export function DnsProvider(props: DnsProviderProps) {
  const { config, children } = props

  const sharedOperators = useContext(OperatorContext)
  const secrets = useContext(SecretContext)

  const resources: ReturnType<typeof jsx>[] = []

  // Declare external-dns operator
  const hasExternalDNS = sharedOperators.some((op) => op.name === 'external-dns')
  if (!hasExternalDNS) {
    resources.push(declareOperator(operators['external-dns']()))
  }

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
        apiVersion: 'secrets.hashicorp.com/v1alpha1',
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
    children: [
      ...resources,
      jsx(DnsContext.Provider, { value: config, children }),
    ],
  })
}
