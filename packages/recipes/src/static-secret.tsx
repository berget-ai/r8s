import { jsx, useContext } from '@r8s/core'
import { Namespace, SecretContext } from '@r8s/core/defaults'

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
  restart?: { kind?: string; name: string }[]
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
 * <StaticSecret
 *   name="myapp-secrets"
 *   path="myapp/app"
 *   keys={{
 *     SECRET_KEY: 'secret_key',
 *     OIDC_CLIENT_ID: 'oidc_client_id',
 *     OIDC_CLIENT_SECRET: 'oidc_client_secret',
 *   }}
 *   restart={[{ kind: 'Deployment', name: 'myapp' }]}
 * />
 *
 * @example
 * // backup creds: read at use time — never restart workloads
 * <StaticSecret name="myapp-backup-creds" path="rustfs/myapp"
 *   keys={['accesskey', 'secretkey']} />
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
  const contextNamespace = useContext(Namespace)
  const namespace =
    namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'

  if (
    !secretProvider ||
    (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
  ) {
    throw new Error(
      `StaticSecret "${name}" requires a provisioning secrets backend (openbao or vault).\n` +
        `\n` +
        `Fix: configure a backend on the Platform:\n` +
        `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
        `    <StaticSecret name="${name}" path="${path}" keys={...} />\n` +
        `  </Platform>\n` +
        `\n` +
        `On passive backends (manual-secrets, sealed-secrets), create the Secret\n` +
        `out of band and reference it directly instead of rendering this component.`
    )
  }

  const mapping: Record<string, string> = Array.isArray(keys)
    ? Object.fromEntries(keys.map((k) => [k, k]))
    : keys

  const spec = {
    ...(secretProvider.backend === 'vault'
      ? { vaultAuthRef: authRef ?? secretProvider.authRef }
      : { openbaoAuthRef: authRef ?? secretProvider.authRef }),
    mount: secretProvider.mount,
    type: 'kv-v2' as const,
    path,
    refreshAfter: refreshAfter ?? secretProvider.refreshAfter ?? '1h',
    ...(restart && restart.length > 0 ? { rolloutRestartTargets: restart } : {}),
    destination: {
      create: true,
      name: secretName ?? name,
      overwrite: true,
      transformation: {
        excludeRaw: true,
        templates: Object.fromEntries(
          Object.entries(mapping).map(([dest, src]) => [dest, { text: `{{ .Secrets.${src} }}` }])
        ),
      },
    },
  }

  return secretProvider.backend === 'vault'
    ? jsx('VaultStaticSecret', {
        apiVersion: 'secrets.hashicorp.com/v1beta1',
        kind: 'VaultStaticSecret',
        metadata: { name, namespace },
        spec,
      })
    : jsx('OpenBaoStaticSecret', {
        apiVersion: 'secrets.openbao.org/v1beta1',
        kind: 'OpenBaoStaticSecret',
        metadata: { name, namespace },
        spec,
      })
}
