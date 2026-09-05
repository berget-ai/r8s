import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import { provisionerForSecretProvider } from './secret-provider'

export interface StaticSecretProps {
  /**
   * Resource name (also the default for the provisioned Kubernetes
   * Secret's name — override with secretName).
   */
  name: string
  /** Kubernetes namespace (inherited from Platform context when omitted) */
  namespace?: string
  /**
   * Vault/OpenBao KV v2 path holding the source keys, e.g. 'outline/app'.
   * Build it from the provider's base path when composing:
   * `${secretProvider.path}/myapp/credentials`.
   */
  path: string
  /**
   * Destination→source key mapping. The destination carries env-case
   * names consumed by the app; the vault/store keys stay snake_case:
   *   keys={{ SECRET_KEY: 'secret_key', UTILS_SECRET: 'utils_secret' }}
   * A string array is shorthand for identity mappings ({ KEY: 'KEY' }).
   *
   * Rendered as destination.transformation.templates + excludeRaw —
   * the destination holds ONLY these keys.
   */
  keys: Record<string, string> | string[]
  /** Provisioned Kubernetes Secret name (defaults to name) */
  secretName?: string
  /**
   * Re-sync interval rendered as refreshAfter. Defaults to the provider's
   * refreshAfter, else '1h'.
   */
  refreshAfter?: string
  /**
   * Workloads restarted after rotation (rolloutRestartTargets). Pass the
   * workloads consuming these values so a rotation actually takes effect —
   * pod env vars do not update in place.
   *
   * Deliberately has no default: some consumers read the Secret at use
   * time (e.g. CNPG barman backup credentials are read when a backup
   * runs, and the Cluster CRD is not a supported restart target), so an
   * automatic restart is wrong for them.
   */
  restart?: { kind?: string; name: string; apiVersion?: string }[]
  /**
   * Auth reference override (defaults to the provider's authRef).
   * Rendered as vaultAuthRef / openbaoAuthRef per backend.
   */
  authRef?: string
}

/**
 * StaticSecret — provision a Kubernetes Secret from Vault/OpenBao,
 * with rotation semantics that actually reach the workloads.
 *
 * Wraps VaultStaticSecret / OpenBaoStaticSecret with the platform's
 * conventions baked in:
 * - snake_case source keys templated to env-case destination keys
 *   (excludeRaw: only the declared keys land in the Secret)
 * - destination create + overwrite (idempotent sync)
 * - hourly refresh by default, inheriting the provider's refreshAfter
 * - explicit, per-bundle restart semantics (app creds restart pods;
 *   backup creds read at use time never restart)
 *
 * Requires an active secrets backend (openbao or vault) — passive
 * backends (manual-secrets, sealed-secrets) cannot provision: reference
 * a pre-created Secret instead.
 *
 * @example
 * import { Platform, StaticSecret } from '@r8s/recipes'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <StaticSecret
 *       name="myapp-secrets"
 *       path="myapp/app"
 *       keys={{
 *         SECRET_KEY: 'secret_key',
 *         OIDC_CLIENT_ID: 'oidc_client_id',
 *         OIDC_CLIENT_SECRET: 'oidc_client_secret',
 *       }}
 *       restart={[{ kind: 'Deployment', name: 'myapp' }]}
 *     />
 *   </Platform>
 * )
 *
 * @example
 * import { Platform, StaticSecret } from '@r8s/recipes'
 *
 * // backup creds: read at use time — never restart workloads
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <StaticSecret name="myapp-backup-creds" path="rustfs/myapp"
 *       keys={['accesskey', 'secretkey']} />
 *   </Platform>
 * )
 */
export function StaticSecret(props: StaticSecretProps) {
  const {
    name,
    namespace: namespaceProp,
    path,
    keys,
    secretName,
    refreshAfter,
    restart,
    authRef,
  } = props

  const secretProvider = useContext(SecretContext)
  const namespace = useNamespace(namespaceProp)
  const provisioner = provisionerForSecretProvider(secretProvider)

  if (!provisioner) {
    throw new Error(
      `StaticSecret "${name}" requires a provisioning secrets backend (openbao, vault,\n` +
        `or any provider carrying a provision() hook).\n` +
        `\n` +
        `Fix: configure a backend on the Platform:\n` +
        `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
        `    <StaticSecret name="${name}" path="${path}" keys={...} />\n` +
        `  </Platform>\n` +
        `\n` +
        `On passive backends (manual-secrets, sealed-secrets, kubernetes), create the Secret\n` +
        `out of band and reference it directly instead of rendering this component.`
    )
  }

  const mapping: Record<string, string> = Object.fromEntries(
    (Array.isArray(keys) ? keys.map((k) => [k, k]) : Object.entries(keys)) as [string, string][]
  )

  // Default missing fields (consistent with Database/WebService restart
  // target conventions)
  const restartTargets = restart?.map((t) => ({ kind: 'Deployment', ...t }))

  const el = provisioner({
    name,
    namespace,
    path,
    keys: mapping,
    secretName,
    authRef,
    refreshAfter,
    restartTargets,
  })
  return Array.isArray(el) ? jsx(Fragment, { children: el }) : (el as ReturnType<typeof jsx>)
}
