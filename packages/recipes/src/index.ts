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

// Operator declarations for components in this package
export { cnpgOperator, nginxIngressOperator, vaultSecretsOperator } from './operators'
