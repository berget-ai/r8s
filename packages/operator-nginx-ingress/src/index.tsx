/**
 * @r8s/operator-nginx-ingress — NGINX Ingress Controller as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (1.15.1); consumers declare
 * "@r8s/operator-nginx-ingress": "^1.0.0" as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The nginx-ingress operator version this package was cut for. */
export const DEFAULT_NGINXINGRESS_VERSION = '1.15.1'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{version}', version).replaceAll('{minor}', minor)
}

/**
 * Operator declaration — mirror of the `nginx-ingress` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function NginxIngressOperator(
  version: string = DEFAULT_NGINXINGRESS_VERSION
): Operator & { namespace: string } {
  return {
    name: 'nginx-ingress',
    description: 'NGINX Ingress Controller',
    source: {
      type: 'manifest',
      url: expandVersion(
        'https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v{version}/deploy/static/provider/cloud/deploy.yaml',
        version
      ),
      version,
      namespace: 'ingress-nginx',
    },
    version,
    namespace: 'ingress-nginx',
    crds: ['ingressclassparams.networking.k8s.io'],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'nginx-ingress'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = NginxIngressOperator

/**
 * Declare nginx-ingress unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'nginx-ingress')) return []
  return [declareOperator(NginxIngressOperator(version))]
}
