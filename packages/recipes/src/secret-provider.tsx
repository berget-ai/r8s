import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { SecretContext, type SecretProvider as SecretProviderConfig } from '@r8s/core/defaults'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'

/**
 * OpenBao configuration component.
 *
 * Use as a value in SecretProvider when you need custom configuration:
 * ```tsx
 * <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom" />}>
 * ```
 */
export interface OpenBaoProps {
  /** OpenBao mount path (default: 'secret') */
  mount?: string
  /** Base path for all secrets (e.g., 'infra' → 'infra/app/db') */
  path?: string
  /** Auth reference (OpenBaoAuth name) */
  authRef?: string
}

export function OpenBao(props: OpenBaoProps): SecretProviderConfig {
  return {
    backend: 'openbao',
    mount: props.mount,
    path: props.path,
    authRef: props.authRef,
  }
}

/**
 * Vault configuration component.
 */
export interface VaultProps {
  /** Vault mount path (default: 'secret') */
  mount?: string
  /** Base path for all secrets */
  path?: string
  /** Auth reference (VaultAuth name) */
  authRef?: string
}

export function Vault(props: VaultProps): SecretProviderConfig {
  return {
    backend: 'vault',
    mount: props.mount,
    path: props.path,
    authRef: props.authRef,
  }
}

/**
 * SealedSecrets configuration component.
 */
export interface SealedSecretsProps {
  /** Namespace where sealed-secrets controller runs (default: 'kube-system') */
  namespace?: string
}

export function SealedSecrets(props: SealedSecretsProps): SecretProviderConfig {
  return {
    backend: 'sealed-secrets',
  }
}

/**
 * Kubernetes configuration component (plain Secrets, CNPG-managed).
 */
export interface KubernetesProps {}

export function Kubernetes(props: KubernetesProps): SecretProviderConfig {
  return {
    backend: 'kubernetes',
  }
}

/** Union of all secret provider configurations */
export type SecretProviderValue =
  | 'openbao'
  | 'vault'
  | 'sealed-secrets'
  | 'kubernetes'
  | SecretProviderConfig

export interface SecretProviderProps {
  /**
   * Secrets backend — string for simple cases, component for advanced config.
   *
   * @example
   * // Simple string
   * <SecretProvider provider="openbao">
   *
   * @example
   * // Advanced component
   * <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom" />}>
   */
  provider: SecretProviderValue
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
 * import { SecretProvider, OpenBao, Database } from '@r8s/recipes'
 *
 * // Simple — string provider
 * <SecretProvider provider="openbao">
 *   <Database name="app-db" />
 * </SecretProvider>
 *
 * @example
 * // Advanced — component provider
 * <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom-auth" />}>
 *   <Database name="app-db" />
 * </SecretProvider>
 *
 * @example
 * // Vault with custom mount
 * <SecretProvider provider={<Vault mount="kv" path="apps" />}>
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
  const { provider, children } = props

  const sharedOperators = useContext(OperatorContext)

  // Resolve provider config
  const config: SecretProviderConfig =
    typeof provider === 'string' ? { backend: provider } : provider

  const resources: ReturnType<typeof jsx>[] = []

  // Declare VSO for vault/openbao
  if (config.backend === 'vault' || config.backend === 'openbao') {
    const hasVSO = sharedOperators.some((op) => op.name === 'vault-secrets-operator')
    if (!hasVSO) {
      resources.push(declareOperator(operators['vault-secrets-operator']()))
    }
  }

  return jsx(Fragment, {
    children: [
      ...resources,
      jsx(SecretContext.Provider, { value: config, children }),
    ],
  })
}
