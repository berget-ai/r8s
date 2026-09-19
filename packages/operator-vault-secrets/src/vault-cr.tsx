/**
 * VSO connection/auth CRs — r8s-rendered (helm-free).
 *
 * The Vault Secrets Operator chart used to render these two Cluster
 * foundation CRs from the `defaultVaultConnection` / `defaultAuthMethod`
 * values. With the helm-free direction they are ordinary components: the
 * chart is installed with the defaults OFF (`defaultVaultConnection.enabled=false`,
 * `defaultAuthMethod.enabled=false`) and r8s renders the CRs natively from
 * typed props — auditable, greppable, no values-escalation.
 *
 * Shapes mirror the secrets.hashicorp.com/v1beta1 VaultConnection and
 * VaultAuth CRDs shipped with the chart this package was cut for
 * (vault-secrets-operator 0.5.0 — HashiCorp repo, not the generated
 * @r8s/crds ones, which do not cover VSO yet).
 */
import { jsx, Fragment } from '@r8s/core'

/** CA certificate reference — a Secret holding a PEM chain. */
export interface VaultCaCertRef {
  /** Secret name (same namespace as the VaultConnection). */
  name: string
  /** Key inside the Secret (default: 'ca.crt'). */
  key?: string
}

export interface VaultConnectionProps {
  /** Connection name — referenced later as vaultConnectionRef (default: 'default'). */
  name?: string
  /** Namespace to install in — the operator's namespace (default: 'vault-secrets-operator'). */
  namespace?: string
  /** Vault/OpenBao server address (required). */
  address: string
  /** Skip TLS verification (default: false). */
  skipTLSVerify?: boolean
  /** Secret holding the trusted PEM CA chain (default key: 'ca.crt'). */
  caCertSecretRef?: VaultCaCertRef
  /** SNI host for TLS connections. */
  tlsServerName?: string
}

export interface VaultAuthProps {
  /** Auth method CR name (default: 'default'). */
  name?: string
  /** Namespace to install in — the operator's namespace (default: 'vault-secrets-operator'). */
  namespace?: string
  /** VaultConnection reference (default: 'default'). */
  vaultConnectionRef?: string
  /** Auth method (default: 'kubernetes'). */
  method?: 'kubernetes'
  /** Auth backend mount (default: 'kubernetes'). */
  mount?: string
  /** Vault kubernetes auth role (required). */
  role: string
  /** ServiceAccount whose token authenticates (default: 'vault-secrets-operator'). */
  serviceAccount?: string
  /** Token audiences to request. */
  audiences?: string[]
  /** Namespaces the auth method may be consumed from (VSO allowedNamespaces). */
  allowedNamespaces?: string[]
}

/**
 * VaultConnection — point the operator at the Vault/OpenBao server.
 * The CR the chart's defaultVaultConnection block rendered.
 *
 * @example
 * import { VaultConnection } from '@r8s/operator-vault-secrets'
 *
 * export default <VaultConnection address="https://openbao.openbao.svc.cluster.local:8200" />
 */
export function VaultConnection(props: VaultConnectionProps) {
  const {
    name = 'default',
    namespace = 'vault-secrets-operator',
    address,
    skipTLSVerify = false,
    caCertSecretRef,
    tlsServerName,
  } = props

  return jsx(Fragment, {
    children: [
      jsx('VaultConnection', {
        apiVersion: 'secrets.hashicorp.com/v1beta1',
        kind: 'VaultConnection',
        metadata: { name, namespace },
        spec: {
          address,
          skipTLSVerify,
          ...(caCertSecretRef
            ? {
                caCertSecretRef: {
                  name: caCertSecretRef.name,
                  key: caCertSecretRef.key ?? 'ca.crt',
                },
              }
            : {}),
          ...(tlsServerName ? { tlsServerName } : {}),
        },
      }),
    ],
  })
}

/**
 * VaultAuth — the kubernetes auth method binding: Vault role + the
 * ServiceAccount the operator authenticates as. The CR the chart's
 * defaultAuthMethod block rendered.
 *
 * @example
 * import { VaultAuth } from '@r8s/operator-vault-secrets'
 *
 * export default <VaultAuth role="vault-secrets-operator" />
 */
export function VaultAuth(props: VaultAuthProps) {
  const {
    name = 'default',
    namespace = 'vault-secrets-operator',
    vaultConnectionRef = 'default',
    method = 'kubernetes',
    mount = 'kubernetes',
    role,
    serviceAccount = 'vault-secrets-operator',
    audiences = [],
    allowedNamespaces,
  } = props

  if (!role) {
    throw new Error(
      `VaultAuth "${name}" requires a Vault kubernetes auth role — configure the role in ` +
        `Vault/OpenBao first and pass role="..." to this component.`
    )
  }

  return jsx(Fragment, {
    children: [
      jsx('VaultAuth', {
        apiVersion: 'secrets.hashicorp.com/v1beta1',
        kind: 'VaultAuth',
        metadata: { name, namespace },
        spec: {
          vaultConnectionRef,
          method,
          mount,
          ...(allowedNamespaces ? { allowedNamespaces } : {}),
          kubernetes: {
            role,
            ...(serviceAccount ? { serviceAccount } : {}),
            ...(audiences.length > 0 ? { audiences } : {}),
          },
        },
      }),
    ],
  })
}
