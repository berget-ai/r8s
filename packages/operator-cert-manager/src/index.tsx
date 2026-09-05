/**
 * @r8s/operator-cert-manager — cert-manager for TLS certificate automation as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (1.18.0); consumers declare
 * `"@r8s/operator-cert-manager": "^1.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The cert-manager operator version this package was cut for. */
export const DEFAULT_CERTMANAGER_VERSION = '1.18.0'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `cert-manager` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function CertManagerOperator(
  version: string = DEFAULT_CERTMANAGER_VERSION
): Operator & { namespace: string } {
  return {
    name: 'cert-manager',
    description: 'cert-manager for TLS certificate automation',
    source: {
      type: 'manifest',
      url: expandVersion(
        'https://github.com/cert-manager/cert-manager/releases/download/v${version}/cert-manager.yaml',
        version
      ),
      version,
      namespace: '',
    },
    version,
    namespace: 'cert-manager',
    crds: [
      'certificates.cert-manager.io',
      'certificaterequests.cert-manager.io',
      'issuers.cert-manager.io',
      'clusterissuers.cert-manager.io',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'cert-manager'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = CertManagerOperator

/**
 * Declare cert-manager unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'cert-manager')) return []
  return [declareOperator(CertManagerOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/cert-manager'
