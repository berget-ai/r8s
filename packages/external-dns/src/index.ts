import { jsx } from '@r8s/core'
import { DNSEndpoint } from '@r8s/k8s-types'
import { manifestOperator } from '@r8s/k8s-types'

/** ExternalDNS operator declaration */
export const externalDNSOperator = (version = '0.14.0') =>
  manifestOperator(
    'external-dns',
    `https://raw.githubusercontent.com/kubernetes-sigs/external-dns/v${version}/docs/sources/manifest.yaml`,
    version,
    {
      description: 'ExternalDNS for automatic DNS management',
      namespace: 'external-dns',
    }
  )

export interface ExternalDNSRecordProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** DNS name to create (e.g., 'api.example.com') */
  dnsName: string
  /** DNS targets — IPs or hostnames that the record should point to */
  targets: string[]
  /** DNS record type (e.g., 'A', 'CNAME', 'TXT') — defaults to 'A' */
  recordType?: string
  /** Time-to-live for the DNS record in seconds (defaults to 300) */
  ttl?: number
}

/**
 * Creates a DNSEndpoint resource managed by ExternalDNS, supporting
 * A, CNAME, and other DNS record types.
 *
 * @example
 * <ExternalDNSRecord name="app-dns" dnsName="app.example.com" targets={["1.2.3.4"]} recordType="A" />
 */
export function ExternalDNSRecord(props: ExternalDNSRecordProps) {
  const { name, namespace = 'default', dnsName, targets, recordType = 'A', ttl = 300 } = props

  const endpoint: DNSEndpoint = {
    apiVersion: 'externaldns.k8s.io/v1alpha1',
    kind: 'DNSEndpoint',
    metadata: { name, namespace },
    spec: {
      endpoints: [
        {
          dnsName,
          recordType,
          targets,
          recordTTL: ttl,
        },
      ],
    },
  }

  return jsx('DNSEndpoint', endpoint)
}

/**
 * Helper that returns DNS annotations for an Ingress, telling ExternalDNS
 * to create DNS records for the specified domain and targets.
 *
 * @example
 * const annotations = externalDNSAnnotations({ domain: "app.example.com", targets: ["1.2.3.4"] });
 */
export interface ExternalDNSIngressAnnotationProps {
  /** Domain name ExternalDNS should manage (e.g., 'api.example.com') */
  domain: string
  /** DNS targets that should receive traffic for the domain */
  targets: string[]
}

export function externalDNSAnnotations(
  props: ExternalDNSIngressAnnotationProps
): Record<string, string> {
  return {
    'external-dns.alpha.kubernetes.io/hostname': props.domain,
    'external-dns.alpha.kubernetes.io/target': props.targets.join(','),
  }
}
