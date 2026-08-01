import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
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
  /** Create a DNS record via ExternalDNS (default: false, or true when DnsProvider is set) */
  dns?: boolean
  /** DNS record TTL in seconds (default: 300) */
  dnsTtl?: number
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
    namespace = 'default',
    host,
    serviceName,
    servicePort = 80,
    tls,
    annotations = {},
    dns,
    dnsTtl = 300,
  } = props

  const routing = useContext(RoutingContext)
  const endpointConfig = useContext(EndpointContext)
  const sharedOperators = useContext(OperatorContext)
  const dnsConfig = useContext(DnsContext)

  // DNS defaults to true when DnsProvider is set, unless explicitly disabled
  const createDnsRecord = dns ?? (dnsConfig !== null)

  const resources: ReturnType<typeof jsx>[] = []

  if (routing.mode === 'gateway') {
    const gatewayClassName = routing.gatewayClassName || 'eg'
    const secretName = tls?.secretName || `${name}-tls`
    const issuerName = tls?.clusterIssuer || 'letsencrypt-prod'

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
    resources.push(
      jsx('Gateway', {
        apiVersion: 'gateway.networking.k8s.io/v1',
        kind: 'Gateway',
        metadata: {
          name: `${name}-gateway`,
          namespace,
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

    resources.push(
      jsx('HTTPRoute', {
        apiVersion: 'gateway.networking.k8s.io/v1',
        kind: 'HTTPRoute',
        metadata: { name: `${name}-route`, namespace },
        spec: {
          parentRefs: [{ name: `${name}-gateway` }],
          hostnames: [host],
          rules: [
            {
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
          'nginx.ingress.kubernetes.io/rewrite-target': '/',
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
                  path: '/',
                  pathType: 'Prefix',
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

  // DNS record via ExternalDNS
  if (createDnsRecord) {
    const hasExternalDNS = sharedOperators.some((op) => op.name === 'external-dns')
    if (!hasExternalDNS) {
      resources.push(declareOperator(operators['external-dns']()))
    }

    resources.push(
      DNSEndpointComponent({
        metadata: { name: `${name}-dns`, namespace },
        spec: {
          endpoints: [
            {
              dnsName: host,
              recordType: 'A',
              targets: [], // Populated by ExternalDNS from Ingress/Gateway status
              recordTTL: dnsTtl,
            },
          ],
        },
      })
    )
  }

  return jsx(Fragment, { children: resources })
}
