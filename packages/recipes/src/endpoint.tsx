import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { useNamespace } from '@r8s/core/defaults'
import { Ingress } from '@r8s/k8s-types'
import type { BaseRouteProps } from '@r8s/k8s-types'
import { OperatorContext, RoutingContext } from '@r8s/core/defaults'
import { EndpointContext } from './endpoint-provider'
import { nginxIngressOperator } from './operators'
import { operators } from '@r8s/crds'
import { DNSEndpointComponent } from '@r8s/crds/externaldns'
import { DnsContext } from './dns-provider'

export interface EndpointProps extends Omit<BaseRouteProps, 'host'> {
  /** Hostname for the endpoint (required) */
  host: string
  /** Service name to route to */
  serviceName: string
  /** Service port (default: 80) */
  servicePort?: number
  /**
   * Request path to route (default: '/'). Path-based routes are rendered
   * as Prefix paths in Ingress mode AND PathPrefix matches in Gateway
   * (HTTPRoute) mode so one host can serve multiple services.
   */
  path?: string
  /** Ingress pathType when `path` is set (default: 'Prefix') */
  pathType?: 'Prefix' | 'Exact' | 'ImplementationSpecific'
  /** Create a DNS record via ExternalDNS (default: false, or true when DnsProvider is set) */
  dns?: boolean
  /** DNS record TTL in seconds (default: 300) */
  dnsTtl?: number
  /**
   * Reference to an existing shared Gateway instead of creating a new one.
   * Set this to avoid allocating a new LoadBalancer IP per app.
   * When set, only an HTTPRoute is created (no Gateway resource).
   */
  sharedGateway?: { name: string; namespace?: string }
}

/**
 * Endpoint — cluster-adaptive routing for a service.
 *
 * @title Endpoint
 * @category Networking
 *
 * Reads the RoutingContext (set by Platform) to determine whether the
 * cluster uses nginx Ingress or Envoy Gateway (Gateway API), and renders
 * the appropriate resources automatically. Without a Platform, defaults
 * to nginx Ingress.
 *
 * To pin operator versions, pass them at the Platform level.
 *
 * @example
 * import { Endpoint } from '@r8s/recipes'
 *
 * export default <Endpoint name="api" host="api.example.com" serviceName="api" />
 *
 * @example
 * import { Platform, Endpoint } from '@r8s/recipes'
 * import { operators } from '@r8s/crds'
 *
 * export default (
 *   <Platform operators={[operators['cert-manager']('1.18.0')]}>
 *     <Endpoint name="api" host="api.example.com" serviceName="api" />
 *   </Platform>
 * )
 */
export function Endpoint(props: EndpointProps) {
  const {
    name,
    namespace: namespaceProp,
    host,
    serviceName,
    servicePort = 80,
    path,
    pathType,
    tls,
    annotations = {},
    dns,
    dnsTtl = 300,
    sharedGateway,
  } = props

  const namespace = useNamespace(namespaceProp)
  const routing = useContext(RoutingContext)
  const endpointConfig = useContext(EndpointContext)
  const sharedOperators = useContext(OperatorContext)
  const dnsConfig = useContext(DnsContext)

  // DNS defaults to true when DnsProvider is set, unless explicitly disabled
  const createDnsRecord = dns ?? dnsConfig !== null

  // Custom route provisioner hook: a RoutingConfig carrying route() owns the
  // whole render for this endpoint (custom ingress controllers / L7 stacks)
  if (routing.route) {
    const el = routing.route({
      name,
      namespace,
      host,
      serviceName,
      servicePort,
      pathPrefix: path,
      annotations,
      tls,
    })
    return Array.isArray(el) ? jsx(Fragment, { children: el }) : el
  }

  // Mode resolution: the Platform RoutingContext describes the cluster, but
  // an explicit EndpointProvider with <EnvoyGateway /> opts this endpoint
  // into Gateway API even without a Platform (or CLI route-level default)
  const gatewayMode = routing.mode === 'gateway' || endpointConfig.provider === 'envoy-gateway'

  const resources: ReturnType<typeof jsx>[] = []

  if (gatewayMode) {
    const gatewayClassName =
      endpointConfig.settings?.gatewayClassName ?? routing.gatewayClassName ?? 'eg'
    const secretName = tls?.secretName || `${name}-tls`
    const issuerName =
      tls?.clusterIssuer ?? endpointConfig.settings?.tls?.clusterIssuer ?? 'letsencrypt-prod'

    const hasCertManager = sharedOperators.some((op) => op.name === 'cert-manager')
    const hasEnvoyGateway = sharedOperators.some((op) => op.name === 'envoy-gateway')

    if (tls && !hasCertManager) {
      resources.push(declareOperator(operators['cert-manager']()))
    }
    if (!hasEnvoyGateway) {
      resources.push(declareOperator(operators['envoy-gateway']()))
    }

    if (tls) {
      resources.push(
        jsx('Certificate', {
          apiVersion: 'cert-manager.io/v1',
          kind: 'Certificate',
          metadata: {
            name: `${name}-tls`,
            namespace,
          },
          spec: {
            secretName,
            dnsNames: [host],
            issuerRef: {
              name: issuerName,
              kind: 'ClusterIssuer',
            },
          },
        })
      )
    }

    // HTTPS listener with TLS, HTTP listener without
    const useHttps = !!tls

    // Only create a Gateway when no sharedGateway is provided.
    // When sharedGateway is set, attach an HTTPRoute to the existing
    // gateway instead of allocating a new LoadBalancer IP.
    if (!sharedGateway) {
      resources.push(
        jsx('Gateway', {
          apiVersion: 'gateway.networking.k8s.io/v1',
          kind: 'Gateway',
          metadata: {
            name: `${name}-gateway`,
            namespace,
            // ExternalDNS gateway source picks up hostnames from this annotation
            ...(createDnsRecord && {
              annotations: {
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
            }),
          },
          spec: {
            gatewayClassName,
            listeners: [
              {
                name: useHttps ? 'https' : 'http',
                protocol: useHttps ? 'HTTPS' : 'HTTP',
                port: useHttps ? 443 : 80,
                hostname: host,
                ...(tls && {
                  tls: {
                    mode: 'Terminate',
                    certificateRefs: [{ name: secretName }],
                  },
                }),
              },
            ],
          },
        })
      )
    }

    const parentRef = sharedGateway
      ? {
          name: sharedGateway.name,
          ...(sharedGateway.namespace && { namespace: sharedGateway.namespace }),
        }
      : { name: `${name}-gateway` }

    resources.push(
      jsx('HTTPRoute', {
        apiVersion: 'gateway.networking.k8s.io/v1',
        kind: 'HTTPRoute',
        metadata: {
          name: `${name}-route`,
          namespace,
          // ExternalDNS picks up hostnames from HTTPRoute annotations
          ...(createDnsRecord &&
            sharedGateway && {
              annotations: {
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
            }),
        },
        spec: {
          parentRefs: [parentRef],
          hostnames: [host],
          rules: [
            {
              ...(path && {
                matches: [
                  {
                    path: {
                      type: 'PathPrefix',
                      value: path,
                    },
                  },
                ],
              }),
              backendRefs: [{ name: serviceName, port: servicePort }],
            },
          ],
        },
      })
    )
  } else {
    const hasNginxIngress = sharedOperators.some((op) => op.name === 'nginx-ingress')
    const hasCertManager = sharedOperators.some((op) => op.name === 'cert-manager')

    if (!hasNginxIngress) {
      resources.push(declareOperator(nginxIngressOperator()))
    }
    if (tls && !hasCertManager) {
      resources.push(declareOperator(operators['cert-manager']()))
    }

    const ingress: Ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name,
        namespace,
        annotations: {
          // NOTE: no rewrite-target on host-level routes — setting it to
          // '/' rewrites EVERY request path to '/' and breaks path-based
          // upstreams (webhooks, APIs, OAuth callbacks). Set annotations
          // explicitly when a captured-regex path needs one.
          // ExternalDNS ingress source picks up hostnames from this annotation
          ...(createDnsRecord ? { 'external-dns.alpha.kubernetes.io/hostname': host } : {}),
          ...(tls?.clusterIssuer
            ? {
                'cert-manager.io/cluster-issuer': tls.clusterIssuer,
              }
            : {}),
          ...annotations,
        },
      },
      spec: {
        ingressClassName: endpointConfig.settings?.ingressClassName ?? 'nginx',
        rules: [
          {
            host,
            http: {
              paths: [
                {
                  path: path ?? '/',
                  pathType: pathType ?? 'Prefix',
                  backend: {
                    service: {
                      name: serviceName,
                      port: { number: servicePort },
                    },
                  },
                },
              ],
            },
          },
        ],
        ...(tls?.secretName && {
          tls: [
            {
              hosts: [host],
              secretName: tls.secretName,
            },
          ],
        }),
      },
    }

    resources.push(jsx('Ingress', ingress))
  }

  // DNS record via ExternalDNS.
  //
  // Two modes:
  // 1. Explicit targets (dnsTargets prop or dnsConfig.settings.targets):
  //    create a DNSEndpoint CR with those targets (ExternalDNS crd source).
  // 2. No targets: annotate the Gateway/Ingress with the hostname and let
  //    ExternalDNS pick it up via its gateway/ingress source. Creating a
  //    DNSEndpoint with empty targets would produce a DNS record pointing
  //    nowhere, so we deliberately skip the CR in that case.
  const dnsTargets = dnsConfig?.settings?.targets as string[] | undefined
  if (createDnsRecord) {
    const hasExternalDNS = sharedOperators.some((op) => op.name === 'external-dns')
    if (!hasExternalDNS) {
      resources.push(declareOperator(operators['external-dns']()))
    }

    if (dnsTargets && dnsTargets.length > 0) {
      resources.push(
        DNSEndpointComponent({
          metadata: { name: `${name}-dns`, namespace },
          spec: {
            endpoints: [
              {
                dnsName: host,
                recordType: 'A',
                targets: dnsTargets,
                recordTTL: dnsTtl,
              },
            ],
          },
        })
      )
    }
    // else: no targets known at render time — rely on ExternalDNS
    // gateway/ingress source instead of creating an empty DNSEndpoint.
  }

  return jsx(Fragment, { children: resources })
}
