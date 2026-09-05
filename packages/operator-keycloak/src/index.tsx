/**
 * @r8s/operator-keycloak — Keycloak identity and access management operator as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (24.0.0); consumers declare
 * `"@r8s/operator-keycloak": "^24.0.0"` as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The keycloak-operator operator version this package was cut for. */
export const DEFAULT_KEYCLOAK_VERSION = '24.0.0'

function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{{version}}', version).replaceAll('{{minor}}', minor)
}

/**
 * Operator declaration — mirror of the `keycloak-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function KeycloakOperator(
  version: string = DEFAULT_KEYCLOAK_VERSION
): Operator & { namespace: string } {
  return {
    name: 'keycloak-operator',
    description: 'Keycloak identity and access management operator',
    source: {
      type: 'olm',
      package: 'keycloak-operator',
      channel: 'fast',
      version,
    },
    version,
    namespace: '',
    crds: ['keycloaks.k8s.keycloak.org', 'keycloakrealmimports.k8s.keycloak.org'],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'keycloak-operator'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = KeycloakOperator

/**
 * Declare keycloak-operator unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'keycloak-operator')) return []
  return [declareOperator(KeycloakOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/keycloak'
