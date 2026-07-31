/**
 * GENERATED from externaldns CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'

export interface DNSEndpoint {
  apiVersion: 'externaldns.k8s.io/v1alpha1'
  kind: 'DNSEndpoint'
  metadata: ObjectMeta
  spec: DNSEndpointSpec
  status?: DNSEndpointStatus
}

/** Props for the {@link DNSEndpoint} component — a 1:1 mapping of the externaldns.k8s.io/v1alpha1 CRD. */
export interface DNSEndpointProps {
  metadata: ObjectMeta
  spec: DNSEndpointSpec
}

/** Render a DNSEndpoint (externaldns.k8s.io/v1alpha1) exactly as defined by its CRD. */
export function DNSEndpointComponent(props: DNSEndpointProps): DNSEndpoint {
  return {
    apiVersion: 'externaldns.k8s.io/v1alpha1',
    kind: 'DNSEndpoint',
    metadata: props.metadata,
    spec: props.spec,
  }
}

export interface ProviderSpecificItem {
  "name"?: string
  "value"?: string
}

export interface EndpointsItem {
  /** The hostname of the DNS record */
  "dnsName"?: string
  /** Labels stores labels defined for the Endpoint */
  "labels"?: Record<string, unknown>
  /** ProviderSpecific stores provider specific config */
  "providerSpecific"?: ProviderSpecificItem[]
  /** TTL for the record */
  "recordTTL"?: number
  /** RecordType type of record, e.g. CNAME, A, SRV, TXT etc */
  "recordType"?: string
  /** Identifier to distinguish multiple records with the same name and type (e.g. Route53 records with routing policies other than 'simple') */
  "setIdentifier"?: string
  /** The targets the DNS record points to */
  "targets"?: string[]
}

export interface DNSEndpointSpec {
  "endpoints"?: EndpointsItem[]
}

export interface DNSEndpointStatus {
  /** The generation observed by the external-dns controller. */
  "observedGeneration"?: number
}
