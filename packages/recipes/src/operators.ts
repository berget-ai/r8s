/**
 * Operator declarations re-exported from @r8s/crds.
 *
 * The canonical source is packages/crds/operators.yaml. These wrappers
 * exist for backwards compatibility with recipes that import from here.
 */
import { operators } from '@r8s/crds'
import { useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import type { Operator } from '@r8s/k8s-types'

/**
 * Read the operators already declared by the Platform tree. Packages call
 * this once (unconditionally) and pass the result to maybeOperator() —
 * no sharedOperators.some(...) boilerplate in every package.
 */
export function useOperators(): Operator[] {
  return useContext(OperatorContext)
}

/**
 * Declare an operator unless the Platform already provides it. Returns
 * [] (nothing to add) or a one-element array — spread into resources:
 * `resources_.push(...maybeOperator('redis-operator', shared))`
 */
export function maybeOperator(
  name: string,
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === name)) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const factory = (operators as Record<string, ((v?: string) => unknown) | undefined>)[name]
  if (!factory) throw new Error(`Unknown operator '${name}' — check packages/crds/operators.yaml`)
  return [declareOperator(factory(version) as never)]
}

/** CloudNativePG operator declaration */
export const cnpgOperator = operators['cnpg']

/** NGINX Ingress Controller operator declaration (not in operators.yaml — nginx-specific) */
export const nginxIngressOperator = (version = '1.15.1') => ({
  name: 'nginx-ingress',
  description: 'NGINX Ingress Controller',
  source: {
    type: 'manifest' as const,
    url: `https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v${version}/deploy/static/provider/cloud/deploy.yaml`,
    version,
    namespace: 'ingress-nginx',
  },
  version,
  namespace: 'ingress-nginx',
  installCommand: `kubectl apply --server-side -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v${version}/deploy/static/provider/cloud/deploy.yaml`,
})

/** Vault Secrets Operator declaration */
export const vaultSecretsOperator = operators['vault-secrets-operator']
