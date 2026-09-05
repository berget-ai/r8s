import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import {
  SecretContext,
  type SecretProvider as SecretProviderConfig,
  type SecretProvisioner,
  type StaticSecretRequest,
} from '@r8s/core/defaults'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'

/**
 * Provisioner resolution — THE single identity-aware point in the platform.
 * Everything downstream codes against the `provision()` capability; new
 * backends plug in by carrying their own provisioner on the context value
 * (or by being registered here — the orchestration point).
 */
export function provisionerForSecretProvider(
  provider: SecretProviderConfig | null | undefined
): SecretProvisioner | undefined {
  if (!provider) return undefined
  if (typeof provider.provision === 'function') return provider.provision
  if (provider.backend === 'vault' || provider.backend === 'openbao') {
    return (req) => builtinProvisionStaticSecret(provider, req)
  }
  return undefined
}

/** Can this provider provision secrets? (capability check, not identity) */
export function canProvisionSecrets(
  provider: SecretProviderConfig | null | undefined
): provider is SecretProviderConfig {
  return provisionerForSecretProvider(provider) !== undefined
}

/** Built-in Vault/OpenBao emission (VaultStaticSecret / OpenBaoStaticSecret) */
function builtinProvisionStaticSecret(provider: SecretProviderConfig, req: StaticSecretRequest) {
  // Two modes: an EXHAUSTIVE bundle (keys/templates given — destination
  // carries exactly those keys, excludeRaw) or a RAW SYNC (empty keys and
  // no templates — destination passes the whole store entry through,
  // legacy Database/operator-contract shape).
  const exhaustive = Object.keys(req.keys).length > 0 || req.templates !== undefined
  const spec = {
    ...(provider.backend === 'vault'
      ? { vaultAuthRef: req.authRef ?? provider.authRef }
      : { openbaoAuthRef: req.authRef ?? provider.authRef }),
    mount: req.mount ?? provider.mount,
    type: 'kv-v2' as const,
    path: req.path,
    refreshAfter: req.refreshAfter ?? provider.refreshAfter ?? (exhaustive ? '1h' : undefined),
    ...(req.restartTargets && req.restartTargets.length > 0
      ? { rolloutRestartTargets: req.restartTargets }
      : {}),
    destination: exhaustive
      ? {
          create: true,
          name: req.secretName ?? req.name,
          overwrite: true,
          transformation: {
            excludeRaw: true,
            templates: {
              ...Object.fromEntries(
                Object.entries(req.keys).map(([dest, src]) => [
                  dest,
                  { text: `{{ .Secrets.${src} }}` },
                ])
              ),
              // Raw passthrough templates (literals, composed templates) win
              // over key-mapped entries on collision
              ...Object.fromEntries(
                Object.entries(req.templates ?? {}).map(([dest, tpl]) => [dest, { text: tpl }])
              ),
            },
          },
        }
      : { create: true, name: req.secretName ?? req.name },
  }
  return provider.backend === 'vault'
    ? jsx('VaultStaticSecret', {
        apiVersion: 'secrets.hashicorp.com/v1beta1',
        kind: 'VaultStaticSecret',
        metadata: { name: req.name, namespace: req.namespace },
        spec,
      })
    : jsx('OpenBaoStaticSecret', {
        apiVersion: 'secrets.openbao.org/v1beta1',
        kind: 'OpenBaoStaticSecret',
        metadata: { name: req.name, namespace: req.namespace },
        spec,
      })
}

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
  /** Re-sync interval for rotation (e.g. '3600s') — rendered as refreshAfter */
  refreshAfter?: string
}

export function OpenBao(props: OpenBaoProps): SecretProviderConfig {
  return {
    backend: 'openbao',
    mount: props.mount,
    path: props.path,
    authRef: props.authRef,
    ...(props.refreshAfter && { refreshAfter: props.refreshAfter }),
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
  /** Re-sync interval for rotation (e.g. '3600s') — rendered as refreshAfter */
  refreshAfter?: string
}

export function Vault(props: VaultProps): SecretProviderConfig {
  return {
    backend: 'vault',
    mount: props.mount,
    path: props.path,
    authRef: props.authRef,
    ...(props.refreshAfter && { refreshAfter: props.refreshAfter }),
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
  'openbao' | 'vault' | 'sealed-secrets' | 'manual-secrets' | SecretProviderConfig

export interface SecretProviderProps {
  /**
   * Secrets backend — string for simple cases, component for advanced config.
   *
   * @example
   * import { SecretProvider, Database } from '@r8s/recipes'
   *
   * export default (
   *   <SecretProvider provider="openbao">
   *     <Database backup={false} name="app-db" />
   *   </SecretProvider>
   * )
   *
   * @example
   * import { SecretProvider, OpenBao, Database } from '@r8s/recipes'
   *
   * export default (
   *   <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom" />}>
   *     <Database backup={false} name="app-db" />
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
 *     <Database backup={false} name="app-db" />
 *   </SecretProvider>
 * )
 *
 * @example
 * import { SecretProvider, OpenBao, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom-auth" />}>
 *     <Database backup={false} name="app-db" />
 *   </SecretProvider>
 * )
 *
 * @example
 * import { SecretProvider, Vault, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider={<Vault mount="kv" path="apps" />}>
 *     <Database backup={false} name="app-db" />
 *   </SecretProvider>
 * )
 *
 * @example
 * import { SecretProvider, Database } from '@r8s/recipes'
 *
 * export default (
 *   <SecretProvider provider="sealed-secrets">
 *     <Database backup={false} name="app-db" />
 *   </SecretProvider>
 * )
 */
export function SecretProvider(props: SecretProviderProps) {
  const { provider, children } = props

  const sharedOperators = useContext(OperatorContext)

  // Resolve provider config
  let config: SecretProviderConfig
  if (typeof provider === 'string') {
    config = { backend: provider }
  } else if ('backend' in provider) {
    config = provider
  } else if (provider && typeof provider === 'object' && 'type' in provider) {
    // r8s JSX element — call the component with its props
    const component = (provider as any).type
    if (component === OpenBao) {
      config = OpenBao((provider as any).props)
    } else if (component === Vault) {
      config = Vault((provider as any).props)
    } else if (component === SealedSecrets) {
      config = SealedSecrets((provider as any).props)
    } else if (component === ManualSecrets) {
      config = ManualSecrets((provider as any).props)
    } else {
      throw new Error(`Unknown secret provider component: ${component.name || component}`)
    }
  } else {
    throw new Error(`Invalid secret provider: ${JSON.stringify(provider)}`)
  }

  const resources: ReturnType<typeof jsx>[] = []

  // Declare VSO for vault/openbao
  if (config.backend === 'vault' || config.backend === 'openbao') {
    const hasVSO = sharedOperators.some((op) => op.name === 'vault-secrets-operator')
    if (!hasVSO) {
      resources.push(declareOperator(operators['vault-secrets-operator']()))
    }
  }

  return jsx(Fragment, {
    children: [...resources, jsx(SecretContext.Provider, { value: config, children })],
  })
}
