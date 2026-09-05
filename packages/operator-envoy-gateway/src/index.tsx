/**
 * @r8s/operator-envoy-gateway — Envoy Gateway — Kubernetes Gateway API implementation as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (1.7.0); consumers declare
 * "@r8s/operator-envoy-gateway": "^1.0.0" as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The envoy-gateway operator version this package was cut for. */
export const DEFAULT_ENVOYGATEWAY_VERSION = '1.7.0'

/**
 * Operator declaration — mirror of the `envoy-gateway` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function EnvoyGatewayOperator(
  version: string = DEFAULT_ENVOYGATEWAY_VERSION
): Operator & { namespace: string } {
  return {
    name: 'envoy-gateway',
    description: 'Envoy Gateway \u2014 Kubernetes Gateway API implementation',
    source: {
      type: 'helm',
      chart: 'gateway-helm',
      repository: 'oci://docker.io/envoyproxy',
      version,
      namespace: 'envoy-gateway-system',
    },
    version,
    namespace: 'envoy-gateway-system',
    crds: [
      'gatewayclasses.gateway.networking.k8s.io',
      'gateways.gateway.networking.k8s.io',
      'httproutes.gateway.networking.k8s.io',
      'grpcroutes.gateway.networking.k8s.io',
      'tlsroutes.gateway.networking.k8s.io',
      'tcproutes.gateway.networking.k8s.io',
      'udproutes.gateway.networking.k8s.io',
      'envoyproxies.gateway.envoyproxy.io',
      'backendtrafficpolicies.gateway.envoyproxy.io',
      'clienttrafficpolicies.gateway.envoyproxy.io',
      'securitypolicies.gateway.envoyproxy.io',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'envoy-gateway'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = EnvoyGatewayOperator

/**
 * Declare envoy-gateway unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'envoy-gateway')) return []
  return [declareOperator(EnvoyGatewayOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/gateway'
