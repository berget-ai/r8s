// Core recipes — the only place for abstraction in r8s.
// Each recipe composes generated CRD components into a higher-level pattern
// with good defaults. Named after what the user wants to achieve, not the
// underlying tools.

export { Platform, type PlatformProps, type RoutingMode } from './platform'
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
  Kubernetes,
  type KubernetesProps,
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

// Operator declarations for components in this package
export { cnpgOperator, nginxIngressOperator, vaultSecretsOperator } from './operators'
