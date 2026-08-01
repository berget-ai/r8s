import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { SecretContext, type SecretProvider as SecretProviderConfig } from '@r8s/core/defaults'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'

export interface SecretProviderProps {
  /** Secrets backend */
  provider: 'openbao' | 'vault' | 'sealed-secrets' | 'kubernetes'
  /** Vault/OpenBao mount path (default: 'secret') */
  mount?: string
  /** Base path for all secrets (e.g., 'infra' → 'infra/app/db') */
  path?: string
  /** Auth reference (VaultAuth/OpenBaoAuth name) */
  authRef?: string
  /** Child components */
  children?: unknown
}

/**
 * SecretProvider — cluster-level secrets backend.
 *
 * All Database, Auth, and other secret-consuming children use this backend.
 * Automatically declares the required operator (VSO for vault/openbao).
 *
 * @example
 * import { SecretProvider } from '@r8s/recipes'
 *
 * // OpenBao (default)
 * <SecretProvider provider="openbao" mount="secret" path="infra">
 *   <Database name="app-db" />
 * </SecretProvider>
 *
 * @example
 * // HashiCorp Vault
 * <SecretProvider provider="vault" mount="kv" path="apps" authRef="vault-auth">
 *   <Database name="app-db" />
 * </SecretProvider>
 *
 * @example
 * // Sealed Secrets (no operator needed)
 * <SecretProvider provider="sealed-secrets">
 *   <Database name="app-db" password="supersecret" />
 * </SecretProvider>
 */
export function SecretProvider(props: SecretProviderProps) {
  const { provider, mount, path, authRef, children } = props

  const sharedOperators = useContext(OperatorContext)

  const resources: ReturnType<typeof jsx>[] = []

  // Declare VSO for vault/openbao
  if (provider === 'vault' || provider === 'openbao') {
    const hasVSO = sharedOperators.some((op) => op.name === 'vault-secrets-operator')
    if (!hasVSO) {
      resources.push(declareOperator(operators['vault-secrets-operator']()))
    }
  }

  const config: SecretProviderConfig = {
    backend: provider,
    mount,
    path,
    authRef,
  }

  return jsx(Fragment, {
    children: [
      ...resources,
      jsx(SecretContext.Provider, { value: config, children }),
    ],
  })
}
