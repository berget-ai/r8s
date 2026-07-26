import { jsx, Fragment, useContext, declareOperator } from '@r8s/core';
import { Ingress } from '@r8s/k8s-types';
import type { BaseRouteProps, TLSConfig } from '@r8s/k8s-types';
import { OperatorContext, RoutingContext } from '@r8s/core/defaults';
import { nginxIngressOperator } from './operators';
import { certManagerOperator, ManagedCertificate } from '@r8s/cert-manager';
import { Gateway, HTTPRoute, envoyGatewayOperator } from '@r8s/envoy';

export interface EndpointProps extends BaseRouteProps {
  /** Service name to route to */
  serviceName: string;
  /** Service port (default: 80) */
  servicePort?: number;
  /** cert-manager version override */
  certManagerVersion?: string;
  /** nginx-ingress version override (only used when mode='ingress') */
  nginxIngressVersion?: string;
  /** envoy-gateway version override (only used when mode='gateway') */
  envoyGatewayVersion?: string;
}

/**
 * Endpoint — cluster-adaptive routing for a service.
 *
 * Reads the RoutingContext to determine whether the cluster uses
 * nginx Ingress or Envoy Gateway (Gateway API), and renders the
 * appropriate resources automatically.
 *
 * Set the routing mode once at the top of the tree:
 * ```tsx
 * import { RoutingContext } from '@r8s/core/defaults';
 *
 * <RoutingContext.Provider value={{ mode: 'gateway', gatewayClassName: 'eg' }}>
 *   <Endpoint name="api" host="api.example.com" serviceName="api" />
 * </RoutingContext.Provider>
 * ```
 *
 * Without a provider, defaults to nginx Ingress.
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
    certManagerVersion,
    nginxIngressVersion,
    envoyGatewayVersion,
  } = props;

  const routing = useContext(RoutingContext);
  const sharedOperators = useContext(OperatorContext);

  const resources: ReturnType<typeof jsx>[] = [];

  if (routing.mode === 'gateway') {
    const gatewayClassName = routing.gatewayClassName || 'eg';
    const secretName = tls?.secretName || `${name}-tls`;
    const issuerName = tls?.clusterIssuer || 'letsencrypt-prod';

    const hasCertManager = sharedOperators.some((op) => op.name === 'cert-manager');
    const hasEnvoyGateway = sharedOperators.some((op) => op.name === 'envoy-gateway');

    if (tls && !hasCertManager) {
      resources.push(declareOperator(certManagerOperator(certManagerVersion)));
    }
    if (!hasEnvoyGateway) {
      resources.push(declareOperator(envoyGatewayOperator(envoyGatewayVersion)));
    }

    if (tls) {
      resources.push(
        jsx(ManagedCertificate, {
          name: `${name}-tls`,
          namespace,
          secretName,
          dnsNames: [host!],
          issuerName,
        })
      );
    }

    resources.push(
      jsx(Gateway, {
        name: `${name}-gateway`,
        namespace,
        gatewayClassName,
        listeners: [
          {
            name: 'https',
            protocol: 'HTTPS',
            port: 443,
            hostname: host,
            ...(tls && {
              tls: {
                mode: 'Terminate',
                certificateRefs: [{ name: secretName }],
              },
            }),
          },
        ],
      })
    );

    resources.push(
      jsx(HTTPRoute, {
        name: `${name}-route`,
        namespace,
        parentRefs: [{ name: `${name}-gateway` }],
        hostnames: [host!],
        rules: [
          {
            backendRefs: [{ name: serviceName, port: servicePort }],
          },
        ],
      })
    );
  } else {
    const hasNginxIngress = sharedOperators.some((op) => op.name === 'nginx-ingress');
    const hasCertManager = sharedOperators.some((op) => op.name === 'cert-manager');

    if (!hasNginxIngress) {
      resources.push(declareOperator(nginxIngressOperator(nginxIngressVersion)));
    }
    if (tls && !hasCertManager) {
      resources.push(declareOperator(certManagerOperator(certManagerVersion)));
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
        ...(tls?.secretName &&
          host && {
            tls: [
              {
                hosts: [host],
                secretName: tls.secretName,
              },
            ],
          }),
      },
    };

    resources.push(jsx('Ingress', ingress));
  }

  return jsx(Fragment, { children: resources });
}
