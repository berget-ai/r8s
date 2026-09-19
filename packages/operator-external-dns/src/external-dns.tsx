/**
 * ExternalDns — r8s-rendered ExternalDNS workload (helm-free).
 *
 * The flux-free equivalent of the external-dns Helm chart: a ServiceAccount,
 * the ClusterRole/ClusterRoleBinding the controller needs to read the
 * workload sources it publishes as DNS records, and a single-replica
 * Deployment with the provider wiring (AWS Region + Route53 credentials via
 * secretKeyRef). With this component there is no HelmRepository/HelmRelease
 * for external-dns — the shared operators layer (or a platform entry)
 * renders a plain, auditable Kubernetes manifest.
 *
 * The image pin (registry.k8s.io/external-dns/external-dns:v0.21.0) is the
 * appVersion of the kubernetes-sigs chart 1.21.1 that
 * @r8s/operator-external-dns was cut against.
 */
import { jsx, Fragment } from '@r8s/core'

/** AWS credentials sourced from an existing Kubernetes Secret. */
export interface AwsSecretRef {
  /** Secret name in the same namespace as the Deployment. */
  name: string
  /** Key holding the AWS access key ID (default: 'access-key-id'). */
  accessKeyId?: string
  /** Key holding the AWS secret access key (default: 'secret-access-key'). */
  secretAccessKey?: string
}

export interface ExternalDnsProps {
  /** Resource name (default: 'external-dns'). */
  name?: string
  /** Kubernetes namespace (default: 'external-dns'). */
  namespace?: string
  /** Container image (default: registry.k8s.io/external-dns/external-dns:v0.21.0). */
  image?: string
  /** AWS Region used by the route53 provider (default: 'eu-north-1'). */
  awsRegion?: string
  /**
   * Secret carrying the Route53 credentials — required for the aws
   * provider. Rendered as secretKeyRef env vars on the container
   * (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY); the names never leak
   * as literals.
   */
  awsSecretRef?: AwsSecretRef
  /** TXT registry owner id — isolates record ownership (default: the name). */
  txtOwnerId?: string
  /** Domains external-dns is allowed to manage. */
  domainFilters?: string[]
  /**
   * Workload sources to publish (default:
   * ['ingress', 'service', 'gateway-httproute']).
   */
  sources?: string[]
  /** DNS record change policy (default: 'sync'). */
  policy?: 'sync' | 'upsert-only' | 'create-only'
}

/** Defaults for ExternalDns — mirrored in the rendered args/env. */
const DEFAULT_SOURCES = ['ingress', 'service', 'gateway-httproute']
const DEFAULT_IMAGE = 'registry.k8s.io/external-dns/external-dns:v0.21.0'
const DEFAULT_POLICY = 'sync'

/**
 * ExternalDns — render the ExternalDNS Deployment + RBAC natively, without
 * Helm. Declares nothing: pair it with the platform's operator wiring, or
 * drop the helm-source operator entirely and render only this.
 *
 * @example
 * import { ExternalDns } from '@r8s/operator-external-dns'
 *
 * export default <ExternalDns
 *   txtOwnerId="production"
 *   domainFilters={['example.com', 'berget.cloud']}
 *   awsSecretRef={{ name: 'route53-credentials' }}
 * />
 */
export function ExternalDns(props: ExternalDnsProps) {
  const {
    name = 'external-dns',
    namespace = 'external-dns',
    image = DEFAULT_IMAGE,
    awsRegion = 'eu-north-1',
    awsSecretRef,
    txtOwnerId = name,
    domainFilters = [],
    sources = DEFAULT_SOURCES,
    policy = DEFAULT_POLICY,
  } = props

  const labels = { app: name }

  const args: string[] = []
  for (const source of sources) args.push(`--source=${source}`)
  args.push('--provider=aws', `--policy=${policy}`, '--registry=txt')
  args.push(`--txt-owner-id=${txtOwnerId}`)
  for (const filter of domainFilters) args.push(`--domain-filter=${filter}`)

  // AWS credentials stay in a Secret — reference, never inline.
  const keyId = awsSecretRef?.accessKeyId ?? 'access-key-id'
  const keySecret = awsSecretRef?.secretAccessKey ?? 'secret-access-key'

  return jsx(Fragment, {
    children: [
      jsx('ServiceAccount', {
        apiVersion: 'v1',
        kind: 'ServiceAccount',
        metadata: { name, namespace, labels },
      }),
      jsx('ClusterRole', {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'ClusterRole',
        metadata: { name, labels },
        rules: [
          {
            apiGroups: [''],
            resources: ['services', 'endpoints', 'namespaces'],
            verbs: ['get', 'list', 'watch'],
          },
          {
            apiGroups: ['discovery.k8s.io'],
            resources: ['endpointslices'],
            verbs: ['get', 'list', 'watch'],
          },
          {
            apiGroups: ['networking.k8s.io'],
            resources: ['ingresses'],
            verbs: ['get', 'list', 'watch'],
          },
          {
            apiGroups: ['gateway.networking.k8s.io'],
            resources: ['gateways', 'httproutes', 'grpcroutes', 'tlsroutes'],
            verbs: ['get', 'list', 'watch'],
          },
          {
            apiGroups: ['externaldns.k8s.io'],
            resources: ['dnsendpoints'],
            verbs: ['get', 'list', 'watch'],
          },
          {
            apiGroups: ['externaldns.k8s.io'],
            resources: ['dnsendpoints/status'],
            verbs: ['get', 'patch', 'update'],
          },
        ],
      }),
      jsx('ClusterRoleBinding', {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'ClusterRoleBinding',
        metadata: { name, labels },
        roleRef: { apiGroup: 'rbac.authorization.k8s.io', kind: 'ClusterRole', name },
        subjects: [{ kind: 'ServiceAccount', name, namespace }],
      }),
      jsx('Deployment', {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name, namespace, labels },
        spec: {
          replicas: 1,
          selector: { matchLabels: labels },
          template: {
            metadata: { labels },
            spec: {
              serviceAccountName: name,
              containers: [
                {
                  name,
                  image,
                  args,
                  env: [
                    { name: 'AWS_REGION', value: awsRegion },
                    // Route53 credentials via secretKeyRef — no plaintext
                    ...(awsSecretRef
                      ? [
                          {
                            name: 'AWS_ACCESS_KEY_ID',
                            valueFrom: {
                              secretKeyRef: { name: awsSecretRef.name, key: keyId },
                            },
                          },
                          {
                            name: 'AWS_SECRET_ACCESS_KEY',
                            valueFrom: {
                              secretKeyRef: { name: awsSecretRef.name, key: keySecret },
                            },
                          },
                        ]
                      : []),
                  ],
                },
              ],
            },
          },
        },
      }),
    ],
  })
}
