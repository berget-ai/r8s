/**
 * @r8s/operator-vault-secrets — HashiCorp Vault Secrets Operator as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (0.5.0); consumers declare
 * "@r8s/operator-vault-secrets": "^0.0.0" as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The vault-secrets-operator operator version this package was cut for. */
export const DEFAULT_VAULTSECRETS_VERSION = '0.5.0'

/**
 * Operator declaration — mirror of the `vault-secrets-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function VaultSecretsOperator(
  version: string = DEFAULT_VAULTSECRETS_VERSION
): Operator & { namespace: string } {
  return {
    name: 'vault-secrets-operator',
    description: 'HashiCorp Vault Secrets Operator',
    source: {
      type: 'helm',
      chart: 'vault-secrets-operator',
      repository: 'https://helm.releases.hashicorp.com',
      version,
      namespace: 'vault-secrets-operator',
    },
    version,
    namespace: 'vault-secrets-operator',
    crds: [
      'vaultstaticsecrets.secrets.hashicorp.com',
      'vaultdynamicsecrets.secrets.hashicorp.com',
      'vaultauths.secrets.hashicorp.com',
      'vaultconnections.secrets.hashicorp.com',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'vault-secrets-operator'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = VaultSecretsOperator

/**
 * Declare vault-secrets-operator unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'vault-secrets-operator')) return []
  return [declareOperator(VaultSecretsOperator(version))]
}

// CRDs for this operator are not generated yet — declaration + install manifest only.
