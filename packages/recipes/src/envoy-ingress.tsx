import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import type { TLSConfig } from '@r8s/k8s-types'

export interface EnvoyIngressProps {
  name: string
  namespace?: string
  /** Hostname for routing */
  host: string
  /** Service name to route to */
  serviceName: string
  /** Service port (default: 80) */
  servicePort?: number
  /** Path prefix (default: /) */
  path?: string
  /** TLS configuration */
  tls?: TLSConfig
  /** Gateway name (default: shared-gateway) */
  gatewayName?: string
  /** Gateway namespace (default: envoy-gateway-system) */
  gatewayNamespace?: string
  /** Envoy Gateway version override */
  envoyGatewayVersion?: string
  /** cert-manager version override */
  certManagerVersion?: string
}

/**
 * Simple Envoy Gateway ingress — one host → one service.
 *
 * @title Envoy Ingress
 * @category Networking
 *
 * Creates a Gateway (if not exists) and HTTPRoute.
 * Much simpler than raw Gateway API resources.
 *
 * @example
 * <EnvoyIngress
 *   name="app"
 *   host="app.example.com"
 *   serviceName="frontend"
 * />
 *
 * @example
 * <EnvoyIngress
 *   name="api"
 *   host="api.example.com"
 *   serviceName="api"
 *   servicePort={8080}
 *   tls={{ secretName: "api-tls", clusterIssuer: "letsencrypt" }}
 * />
 */
export function EnvoyIngress(props: EnvoyIngressProps) {
  const {
    name,
    namespace = 'default',
    host,
    serviceName,
    servicePort = 80,
    path = '/',
    tls,
    gatewayName = 'shared-gateway',
    gatewayNamespace = 'envoy-gateway-system',
    envoyGatewayVersion,
    certManagerVersion,
  } = props

  const sharedOperators = useContext(OperatorContext)
  const hasEnvoyGateway = sharedOperators.some((op) => op.name === 'envoy-gateway')
  const hasCertManager = sharedOperators.some((op) => op.name === 'cert-manager')

  const resources: ReturnType<typeof jsx>[] = []

  // Declare Envoy Gateway operator if not already provided
  if (!hasEnvoyGateway) {
    resources.push(declareOperator(operators['envoy-gateway'](envoyGatewayVersion)))
  }

  // Declare cert-manager operator if TLS is enabled and not already provided
  if (tls && !hasCertManager) {
    resources.push(declareOperator(operators['cert-manager'](certManagerVersion)))
  }

  // Gateway resource
  resources.push(
    jsx('Gateway', {
      apiVersion: 'gateway.networking.k8s.io/v1',
      kind: 'Gateway',
      metadata: {
        name: gatewayName,
        namespace: gatewayNamespace,
      },
      spec: {
        gatewayClassName: 'eg',
        listeners: [
          {
            name: 'http',
            protocol: 'HTTP',
            port: 80,
            ...(host && { hostname: host }),
          },
          ...(tls
            ? [
                {
                  name: 'https',
                  protocol: 'HTTPS',
                  port: 443,
                  ...(host && { hostname: host }),
                  tls: {
                    mode: 'Terminate',
                    certificateRefs: [
                      {
                        name: tls.secretName,
                      },
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    })
  )

  // HTTPRoute
  resources.push(
    jsx('HTTPRoute', {
      apiVersion: 'gateway.networking.k8s.io/v1',
      kind: 'HTTPRoute',
      metadata: { name, namespace },
      spec: {
        parentRefs: [
          {
            name: gatewayName,
            namespace: gatewayNamespace,
          },
        ],
        ...(host && { hostnames: [host] }),
        rules: [
          {
            matches: [
              {
                path: {
                  type: 'PathPrefix',
                  value: path,
                },
              },
            ],
            backendRefs: [
              {
                name: serviceName,
                port: servicePort,
              },
            ],
          },
        ],
      },
    })
  )

  return jsx(Fragment, { children: resources })
}
