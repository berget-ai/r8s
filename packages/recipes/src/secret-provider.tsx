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
 * ManualSecrets configuration component (plain Kubernetes Secrets, CNPG-managed).
 *
 * Use for simple deployments or development. CNPG creates and manages
 * bootstrap secrets automatically. No external secrets backend required.
 */
export interface ManualSecretsProps {}

export function ManualSecrets(props: ManualSecretsProps): SecretProviderConfig {
  return {
    backend: 'manual-secrets',
  }
}

/** Union of all secret provider configurations */
export type SecretProviderValue =
  | 'openbao'
  | 'vault'
  | 'sealed-secrets'
  | 'manual-secrets'
  | SecretProviderConfig

export interface SecretProviderProps {
  /**
   * Secrets backend — string for simple cases, component for advanced config.
   *
   * @example
   * import { SecretProvider, Database } from '@r8s/recipes'
   *
   * export default (
   *   <SecretProvider provider="openbao">
   *     <Database name="app-db" />
   *   </SecretProvider>
   * )
   *
   * @example
   * import { SecretProvider, OpenBao, Database } from '@r8s/recipes'
   *
   * export default (
   *   <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom" />}>
   *     <Database name="app-db" />
   *   </SecretProvider>
   * )
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
 * import { SecretProvider, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider="openbao">
 *     <Database name="app-db" />
 *   </SecretProvider>
 * )
 *
 * @example
 * import { SecretProvider, OpenBao, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom-auth" />}>
 *     <Database name="app-db" />
 *   </SecretProvider>
 * )
 *
 * @example
 * import { SecretProvider, Vault, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider={<Vault mount="kv" path="apps" />}>
 *     <Database name="app-db" />
 *   </SecretProvider>
 * )
 *
 * @example
 * import { SecretProvider, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider="sealed-secrets">
 *     <Database name="app-db" password="supersecret" />
 *   </SecretProvider>
 * )
 */
export function SecretProvider(props: SecretProviderProps) {
  const { provider, children } = props

  const sharedOperators = useContext(OperatorContext)

  // Resolve provider config
  const config: SecretProviderConfig =
    typeof provider === 'string'
      ? { backend: provider }
      : 'backend' in provider
        ? provider
        : { backend: 'openbao', mount: (provider as any).mount, path: (provider as any).path, authRef: (provider as any).authRef }

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
