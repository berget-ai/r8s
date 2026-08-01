import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { Ingress } from '@r8s/k8s-types'
import type { BaseRouteProps } from '@r8s/k8s-types'
import { OperatorContext, RoutingContext, SecretContext } from '@r8s/core/defaults'
import { nginxIngressOperator } from './operators'
import { operators } from '@r8s/crds'
import { DNSEndpointComponent } from '@r8s/crds/externaldns'

export interface EndpointProps extends Omit<BaseRouteProps, 'host'> {
  /** Hostname for the endpoint (required) */
  host: string
  /** Service name to route to */
  serviceName: string
  /** Service port (default: 80) */
  servicePort?: number
  /** Create a DNS record via ExternalDNS (default: false) */
  dns?: boolean
  /** DNS record TTL in seconds (default: 300) */
  dnsTtl?: number
  /**
   * TSIG secret for RFC 2136 DNS updates. When set, creates a VaultStaticSecret
   * (or OpenBaoStaticSecret) that syncs the TSIG key from Vault/OpenBao to a
   * Kubernetes Secret for ExternalDNS to use.
   *
   * Requires Platform secrets={{ backend: 'vault' | 'openbao' }}.
   */
  dnsTsigSecret?: {
    /** Vault/OpenBao path to the TSIG key (e.g., 'dns/tsig-key') */
    path: string
    /** Key in the Vault/OpenBao secret containing the TSIG key */
    key: string
    /** Kubernetes Secret name to create (default: 'external-dns-tsig') */
    secretName?: string
  }
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
    dns = false,
    dnsTtl = 300,
    dnsTsigSecret,
  } = props

  const routing = useContext(RoutingContext)
  const sharedOperators = useContext(OperatorContext)

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
        ingressClassName: 'nginx',
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
  if (dns) {
    const hasExternalDNS = sharedOperators.some((op) => op.name === 'external-dns')
    if (!hasExternalDNS) {
      resources.push(declareOperator(operators['external-dns']()))
    }

    // TSIG secret via VSO when using vault/openbao backend
    if (dnsTsigSecret) {
      const secrets = useContext(SecretContext)
      if (!secrets || (secrets.backend !== 'vault' && secrets.backend !== 'openbao')) {
        throw new Error(
          `Endpoint "${name}": dnsTsigSecret requires Platform secrets={{ backend: 'vault' | 'openbao' }}. ` +
            `Current backend: ${secrets?.backend ?? 'none'}. ` +
            `Fix: wrap in <Platform secrets={{ backend: 'openbao' }}> or remove dnsTsigSecret.`
        )
      }

      const secretName = dnsTsigSecret.secretName ?? 'external-dns-tsig'
      const mount = secrets.mount ?? 'secret'
      const basePath = secrets.path ?? ''
      const fullPath = basePath ? `${basePath}/${dnsTsigSecret.path}` : dnsTsigSecret.path

      if (secrets.backend === 'openbao') {
        resources.push(
          jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1alpha1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: secretName, namespace },
            spec: {
              mount,
              path: fullPath,
              type: 'kv-v2',
              destination: {
                name: secretName,
                create: true,
              },
              refreshAfter: '1h',
            },
          })
        )
      } else {
        resources.push(
          jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1alpha1',
            kind: 'VaultStaticSecret',
            metadata: { name: secretName, namespace },
            spec: {
              mount,
              path: fullPath,
              type: 'kv-v2',
              destination: {
                name: secretName,
                create: true,
              },
              refreshAfter: '1h',
            },
          })
        )
      }
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
