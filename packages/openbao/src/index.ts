import { jsx } from '@r8s/core'
import { VaultConnection, VaultAuth, VaultDynamicSecret, VaultStaticSecret } from '@r8s/k8s-types'
import { manifestOperator } from '@r8s/k8s-types'

/** Vault Secrets Operator declaration */
export const vaultSecretsOperator = (version = '0.5.0') =>
  manifestOperator(
    'vault-secrets-operator',
    `https://raw.githubusercontent.com/hashicorp/vault-secrets-operator/v${version}/config/default/deploy.yaml`,
    version,
    {
      description: 'HashiCorp Vault Secrets Operator',
      namespace: 'vault-secrets-operator',
      crds: ['vaultstaticsecrets.secrets.hashicorp.com', 'vaultauths.secrets.hashicorp.com'],
    }
  )

export interface VaultConnectionConfigProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Vault/OpenBao server address, e.g. 'https://vault.example.com:8200' */
  address: string
  /** Name of the Kubernetes Secret containing the CA certificate used to verify Vault TLS */
  caCertSecretRef?: string
  /** Skip TLS certificate verification (insecure — don't use in production) */
  skipTLSVerify?: boolean
}

/**
 * Creates a VaultConnection resource telling the Vault Secrets Operator
 * how to reach the OpenBao/Vault server.
 *
 * @example
 * <VaultConnectionConfig name="default" address="https://vault.example.com:8200" />
 */
export function VaultConnectionConfig(props: VaultConnectionConfigProps) {
  const { name, namespace = 'default', address, caCertSecretRef, skipTLSVerify = false } = props

  const connection: VaultConnection = {
    apiVersion: 'secrets.hashicorp.com/v1beta1',
    kind: 'VaultConnection',
    metadata: { name, namespace },
    spec: {
      address,
      ...(caCertSecretRef && { caCertSecretRef }),
      skipTLSVerify,
    },
  }

  return jsx('VaultConnection', connection)
}

export interface VaultKubernetesAuthProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace for the VaultAuth — required */
  namespace: string
  /** Name of the VaultConnection resource this auth uses (defaults to 'default' on Vault side) */
  vaultConnectionRef?: string
  /** Vault role this Kubernetes service account is allowed to assume */
  role: string
  /** Kubernetes service account used to authenticate to Vault */
  serviceAccount: string
  /** Vault auth method mount path (defaults to 'kubernetes') */
  mount?: string
}

/**
 * Creates a VaultAuth resource configuring Kubernetes-based authentication
 * for the Vault Secrets Operator.
 *
 * @example
 * <VaultKubernetesAuth name="default" mount="kubernetes" role="secrets" serviceAccount="default" />
 */
export function VaultKubernetesAuth(props: VaultKubernetesAuthProps) {
  const { name, namespace, vaultConnectionRef, role, serviceAccount, mount = 'kubernetes' } = props

  const auth: VaultAuth = {
    apiVersion: 'secrets.hashicorp.com/v1beta1',
    kind: 'VaultAuth',
    metadata: { name, namespace },
    spec: {
      method: 'kubernetes',
      mount,
      kubernetes: { role, serviceAccount },
      ...(vaultConnectionRef && { vaultConnectionRef }),
    },
  }

  return jsx('VaultAuth', auth)
}

export interface VaultDatabaseSecretProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace for the VaultDynamicSecret — required */
  namespace: string
  /** Name of the VaultAuth resource used to authenticate to Vault */
  vaultAuthRef: string
  /** Vault mount path of the database secrets engine (e.g., 'database') */
  mount: string
  /** Vault role/path describing the database credential to lease */
  path: string
  /** Name of the Kubernetes Secret Vault will write the leased credentials into */
  secretName: string
  /** When credentials rotate, the operator restarts this target (kind + name) so pods pick up the new secret */
  rolloutRestartTarget?: { kind: string; name: string }
}

/**
 * Creates a VaultDynamicSecret that dynamically provisions short-lived
 * credentials (e.g., database passwords) from OpenBao/Vault.
 *
 * @example
 * <VaultDatabaseSecret name="db-creds" vaultAuthRef="default" mount="database" path="postgres/creds/app" destination={{ create: true, name: "db-creds" }} />
 */
export function VaultDatabaseSecret(props: VaultDatabaseSecretProps) {
  const { name, namespace, vaultAuthRef, mount, path, secretName, rolloutRestartTarget } = props

  const dynamicSecret: VaultDynamicSecret = {
    apiVersion: 'secrets.hashicorp.com/v1beta1',
    kind: 'VaultDynamicSecret',
    metadata: { name, namespace },
    spec: {
      vaultAuthRef,
      mount,
      path,
      destination: {
        create: true,
        name: secretName,
      },
      ...(rolloutRestartTarget && {
        rolloutRestartTargets: [rolloutRestartTarget],
      }),
    },
  }

  return jsx('VaultDynamicSecret', dynamicSecret)
}

export interface VaultKVSecretProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace for the VaultStaticSecret — required */
  namespace: string
  /** Name of the VaultAuth resource used to authenticate to Vault */
  vaultAuthRef: string
  /** Vault KV mount path (e.g., 'secret' or 'kv') */
  mount: string
  /** Path within the mount to the KV secret (e.g., 'myapp/config') */
  path: string
  /** Name of the Kubernetes Secret Vault will create with the KV values */
  secretName: string
  /** KV engine version — 'kv-v1' or 'kv-v2' (defaults to 'kv-v2') */
  type?: 'kv-v1' | 'kv-v2'
  /** When the KV secret changes, the operator restarts this target (kind + name) so pods pick up the new secret */
  rolloutRestartTarget?: { kind: string; name: string }
}

/**
 * Creates a VaultStaticSecret that syncs a static key-value secret from
 * OpenBao/Vault into a Kubernetes Secret.
 *
 * @example
 * <VaultKVSecret name="api-key" vaultAuthRef="default" mount="secret" path="api/key" destination={{ create: true, name: "api-key" }} />
 */
export function VaultKVSecret(props: VaultKVSecretProps) {
  const {
    name,
    namespace,
    vaultAuthRef,
    mount,
    path,
    secretName,
    type = 'kv-v2',
    rolloutRestartTarget,
  } = props

  const staticSecret: VaultStaticSecret = {
    apiVersion: 'secrets.hashicorp.com/v1beta1',
    kind: 'VaultStaticSecret',
    metadata: { name, namespace },
    spec: {
      vaultAuthRef,
      mount,
      type,
      path,
      destination: {
        create: true,
        name: secretName,
      },
      ...(rolloutRestartTarget && {
        rolloutRestartTargets: [rolloutRestartTarget],
      }),
    },
  }

  return jsx('VaultStaticSecret', staticSecret)
}
