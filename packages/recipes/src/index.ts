// Core recipes — the only place for abstraction in r8s.
// Each recipe composes generated CRD components into a higher-level pattern
// with good defaults. Named after what the user wants to achieve, not the
// underlying tools.

export { Platform, type PlatformProps, type RoutingMode } from './platform'
export { R8sCluster, type R8sClusterProps } from './r8s-cluster'
export { App, type AppProps } from './app'
export { Database, type DatabaseProps } from './database'
export { Endpoint, type EndpointProps } from './endpoint'
export {
  WebService,
  type WebServiceProps,
  type SecretRef,
  type VaultSecretRef,
} from './web-service'
export { Auth, type AuthProps } from './auth'
export { Monitoring, type MonitoringProps } from './monitoring'
export { Backup, type BackupProps } from './backup'

// Provider components — fine-grained control over cluster configuration
export {
  SecretProvider,
  type SecretProviderProps,
  type SecretProviderValue,
  OpenBao,
  type OpenBaoProps,
  Vault,
  type VaultProps,
  SealedSecrets,
  type SealedSecretsProps,
  ManualSecrets,
  type ManualSecretsProps,
  provisionerForSecretProvider,
  canProvisionSecrets,
} from './secret-provider'
export {
  DnsProvider,
  type DnsProviderProps,
  type DnsProviderValue,
  type DnsConfig,
  DnsContext,
  ExternalDns,
  type ExternalDnsProps,
} from './dns-provider'
export {
  EndpointProvider,
  type EndpointProviderProps,
  type EndpointProviderValue,
  type EndpointConfig,
  EndpointContext,
  Nginx,
  type NginxProps,
  EnvoyGateway,
  type EnvoyGatewayProps,
} from './endpoint-provider'
export {
  CertProvider,
  type CertProviderProps,
  type CertProviderValue,
  type CertConfig,
  CertContext,
  CertManager,
  type CertManagerProps,
} from './cert-provider'

// Operator declarations for components in this package
export { cnpgOperator, nginxIngressOperator, vaultSecretsOperator } from './operators'

export { StaticSecret, type StaticSecretProps } from './static-secret'

// Composition helpers — loose building blocks for packages
export { useOperators, maybeOperator } from './operators'
export { secretsRequiredError, type SecretsRequiredOptions } from './errors'
