export { Database, type DatabaseProps } from './database'
export { Cluster, type ClusterProps } from './cluster'
export {
  WebService,
  type WebServiceProps,
  type SecretRef,
  type VaultSecretRef,
} from './web-service'
export { Ingress, type IngressProps } from './ingress'
export { Endpoint, type EndpointProps } from './endpoint'
export { App, type AppProps } from './app'
export { Platform, type PlatformProps, type RoutingMode } from './platform'

// Operator declarations for components in this package
export { cnpgOperator, nginxIngressOperator, vaultSecretsOperator } from './operators'

// Legacy exports for backwards compatibility
export { Postgres, type PostgresProps } from './postgres'
export { CustomIngress, type CustomIngressProps } from './ingress-legacy'
