/**
 * Static catalog of r8s components, recipes, and operators.
 *
 * Used by `r8s list`, `r8s info <name>`, and `r8s context` so an LLM
 * (or human) can discover what's available without reading the docs.
 */

export interface ComponentInfo {
  name: string
  package: string
  category: string
  description: string
  props: PropInfo[]
  example: string
}

export interface PropInfo {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export interface OperatorInfo {
  name: string
  description: string
  category: string
  crds: string[]
}

export const components: ComponentInfo[] = [
  {
    name: 'App',
    package: '@r8s/recipes',
    category: 'Complete Solution',
    description:
      'Deployment + Service + Endpoint (Ingress or Gateway). The simplest way to deploy an app.',
    props: [
      { name: 'name', type: 'string', required: true, description: 'Resource name' },
      { name: 'image', type: 'string', required: true, description: 'Container image' },
      { name: 'host', type: 'string', required: true, description: 'Domain name for routing' },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'default'",
        description: 'Kubernetes namespace (inherits from Platform if set)',
      },
      {
        name: 'port',
        type: 'number',
        required: false,
        default: '3000',
        description: 'Container port',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        default: '2',
        description: 'Pod replicas',
      },
      {
        name: 'tls',
        type: '{ secretName, clusterIssuer }',
        required: false,
        description: 'TLS certificate config',
      },
      {
        name: 'env',
        type: 'Record<string, string>',
        required: false,
        description: 'Plain env vars',
      },
      {
        name: 'secrets',
        type: 'Record<string, SecretRef>',
        required: false,
        description: 'Secrets from K8s Secrets',
      },
      {
        name: 'vault',
        type: 'Record<string, VaultSecretRef>',
        required: false,
        description: 'Secrets from Vault',
      },
      {
        name: 'resources',
        type: '{ requests, limits }',
        required: false,
        description: 'CPU/memory',
      },
      {
        name: 'cache',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Add a Redis cache',
      },
      {
        name: 'dns',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Create DNS record',
      },
      { name: 'children', type: 'unknown', required: false, description: 'Child components' },
    ],
    example: `import { App } from '@r8s/recipes'\n\nexport default <App name="api" image="api:v1" host="api.example.com" />`,
  },
  {
    name: 'Database',
    package: '@r8s/recipes',
    category: 'Data',
    description: 'PostgreSQL cluster via CloudNativePG operator + credentials secret.',
    props: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Cluster name (creates <name>-rw service)',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'default'",
        description: 'Kubernetes namespace',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        default: "'10Gi'",
        description: 'Storage size',
      },
      {
        name: 'operatorVersion',
        type: 'string',
        required: false,
        description: 'CNPG operator version',
      },
      {
        name: 'password',
        type: 'string',
        required: false,
        description: 'Explicit password (else auto-generated)',
      },
      {
        name: 'children',
        type: 'unknown',
        required: false,
        description:
          'App/Database/Auth components (optional — can set up cluster infra standalone)',
      },
    ],
    example: `import { Database } from '@r8s/recipes'\n\nexport default <Database name="api-db" storage="20Gi" />`,
  },
  {
    name: 'Endpoint',
    package: '@r8s/recipes',
    category: 'Networking',
    description: 'Routing (Ingress or Gateway+HTTPRoute) + TLS cert + DNS. Used internally by App.',
    props: [
      { name: 'name', type: 'string', required: true, description: 'Resource name' },
      { name: 'host', type: 'string', required: true, description: 'Domain name' },
      { name: 'serviceName', type: 'string', required: true, description: 'Backend Service name' },
      {
        name: 'servicePort',
        type: 'number',
        required: false,
        default: '80',
        description: 'Backend port',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'default'",
        description: 'Namespace',
      },
      {
        name: 'tls',
        type: '{ secretName, clusterIssuer }',
        required: false,
        description: 'TLS config',
      },
      { name: 'dns', type: 'boolean', required: false, description: 'Override DNS creation' },
    ],
    example: `import { Endpoint } from '@r8s/recipes'\n\nexport default <Endpoint name="api" host="api.example.com" serviceName="api" />`,
  },
  {
    name: 'R8sCluster',
    package: '@r8s/recipes',
    category: 'Complete Solution',
    description:
      'Opinionated cluster foundation: cert-manager, external-dns (TSIG), Envoy Gateway, OpenBao VSO, Prometheus, Loki + FluentBit. All operators declared automatically.',
    props: [
      {
        name: 'secrets',
        type: '{ mount, path, authRef? }',
        required: true,
        description: 'OpenBao secrets backend config',
      },
      {
        name: 'dns',
        type: '{ server, zone, tsigPath, tsigKey? }',
        required: true,
        description: 'ExternalDNS with TSIG for RFC 2136',
      },
      {
        name: 'gatewayClassName',
        type: 'string',
        required: false,
        default: "'eg'",
        description: 'Envoy Gateway class name',
      },
      {
        name: 'labels',
        type: 'Record<string, string>',
        required: false,
        description: 'Default labels',
      },
      {
        name: 'operators',
        type: 'Operator[]',
        required: false,
        description: 'Pre-installed operators (skip auto-declare)',
      },
      {
        name: 'logsNamespace',
        type: 'string',
        required: false,
        default: "'logging'",
        description: 'Namespace for LokiStack and logging resources',
      },
      {
        name: 'logsStorageClass',
        type: 'string',
        required: false,
        default: "'standard'",
        description: 'Storage class for Loki logs',
      },
      {
        name: 'children',
        type: 'unknown',
        required: true,
        description: 'App/Database/Auth components',
      },
    ],
    example: `import { R8sCluster, Platform, App, Database } from '@r8s/recipes'\n\nexport default (\n  <R8sCluster\n    secrets={{ mount: 'secret', path: 'production' }}\n    dns={{ server: 'ns1.example.com', zone: 'example.com', tsigPath: 'dns/tsig' }}\n  >\n    <Platform namespace="production">\n      <Database name="api-db" storage="20Gi" />\n      <App name="api" image="api:v1" host="api.example.com" />\n    </Platform>\n  </R8sCluster>\n)`,
  },
  {
    name: 'Platform',
    package: '@r8s/recipes',
    category: 'Complete Solution',
    description:
      'Wraps children with shared contexts: namespace, routing, secrets, DNS, operators.',
    props: [
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: 'Default namespace (materializes Namespace resource)',
      },
      {
        name: 'routing',
        type: "'ingress' | 'gateway'",
        required: false,
        default: "'ingress'",
        description: 'nginx Ingress or Envoy Gateway API',
      },
      {
        name: 'gatewayClassName',
        type: 'string',
        required: false,
        default: "'eg'",
        description: 'Gateway class (gateway mode)',
      },
      {
        name: 'secrets',
        type: 'string | { backend, mount, path }',
        required: false,
        description: 'Secrets backend (openbao/vault/sealed-secrets)',
      },
      {
        name: 'dns',
        type: 'string | { provider, settings }',
        required: false,
        description: 'DNS provider (external-dns)',
      },
      {
        name: 'operators',
        type: 'Operator[]',
        required: false,
        description: 'Pre-installed operators (skip auto-declare)',
      },
      {
        name: 'labels',
        type: 'Record<string, string>',
        required: false,
        description: 'Default labels',
      },
      {
        name: 'children',
        type: 'unknown',
        required: true,
        description: 'App/Database/Auth components',
      },
    ],
    example: `import { Platform, App } from '@r8s/recipes'\n\nexport default (\n  <Platform namespace="prod" routing="gateway">\n    <App name="api" image="api:v1" host="api.example.com" />\n  </Platform>\n)`,
  },
  {
    name: 'Auth',
    package: '@r8s/recipes',
    category: 'Identity',
    description:
      'Keycloak (operator CR) + database + endpoint + KeycloakRealmImport from Realm children.',
    props: [
      { name: 'name', type: 'string', required: true, description: 'Keycloak CR name' },
      { name: 'host', type: 'string', required: true, description: 'Keycloak hostname' },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'default'",
        description: 'Namespace',
      },
      {
        name: 'instances',
        type: 'number',
        required: false,
        default: '1',
        description: 'Keycloak replicas',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        default: "'10Gi'",
        description: 'DB storage',
      },
      {
        name: 'tls',
        type: '{ secretName, clusterIssuer }',
        required: false,
        description: 'TLS config',
      },
      { name: 'children', type: 'Realms', required: true, description: 'Realm configuration' },
    ],
    example: `import { Auth } from '@r8s/recipes'\nimport { Realms, Realm, Clients, Client } from '@r8s/recipes/auth'\n\nexport default (\n  <Auth name="auth" host="auth.example.com">\n    <Realms><Realm id="myapp"><Clients><Client id="web" type="public" /></Clients></Realm></Realms>\n  </Auth>\n)`,
  },
  {
    name: 'Monitoring',
    package: '@r8s/recipes',
    category: 'Observability',
    description: 'ServiceMonitor + Prometheus operator declaration.',
    props: [
      { name: 'name', type: 'string', required: true, description: 'ServiceMonitor name' },
      {
        name: 'selector',
        type: 'Record<string, string>',
        required: true,
        description: 'Label selector for target Services',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'default'",
        description: 'Namespace',
      },
      {
        name: 'port',
        type: 'string',
        required: false,
        default: "'metrics'",
        description: 'Metrics port name',
      },
      {
        name: 'path',
        type: 'string',
        required: false,
        default: "'/metrics'",
        description: 'Metrics path',
      },
      {
        name: 'interval',
        type: 'string',
        required: false,
        default: "'30s'",
        description: 'Scrape interval',
      },
    ],
    example: `import { Monitoring } from '@r8s/recipes'\n\nexport default <Monitoring name="api-mon" selector={{ app: 'api' }} />`,
  },
  {
    name: 'Backup',
    package: '@r8s/recipes',
    category: 'Data',
    description: 'Velero backup schedule.',
    props: [
      { name: 'name', type: 'string', required: true, description: 'Schedule name' },
      { name: 'schedule', type: 'string', required: true, description: 'Cron expression' },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'velero'",
        description: 'Namespace',
      },
      {
        name: 'includedNamespaces',
        type: 'string[]',
        required: false,
        description: 'Namespaces to back up',
      },
    ],
    example: `import { Backup } from '@r8s/recipes'\n\nexport default <Backup name="daily" schedule="0 2 * * *" />`,
  },
  {
    name: 'Grafana',
    package: '@r8s/grafana',
    category: 'Observability',
    description:
      'Grafana Deployment + Service + PVC + admin Secret + datasources ConfigMap + Ingress.',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: "'grafana'",
        description: 'Resource name',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'monitoring'",
        description: 'Namespace',
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        default: "'10.3.0'",
        description: 'Grafana version',
      },
      {
        name: 'admin',
        type: '{ password?, existingSecret? }',
        required: false,
        description: 'Admin credentials (creates Secret by default)',
      },
      {
        name: 'datasources',
        type: 'Array<{ name, type, url }>',
        required: false,
        description: 'Datasource configs',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        default: "'10Gi'",
        description: 'PVC size',
      },
      { name: 'host', type: 'string', required: false, description: 'Ingress host' },
      {
        name: 'tls',
        type: '{ secretName, clusterIssuer }',
        required: false,
        description: 'TLS config',
      },
    ],
    example: `import { Grafana } from '@r8s/grafana'\n\nexport default <Grafana host="grafana.example.com" datasources={[{ name: 'Prom', type: 'prometheus', url: 'http://prom:9090' }]} />`,
  },
  {
    name: 'Superset',
    package: '@r8s/superset',
    category: 'Data',
    description: 'Apache Superset + ConfigMap + optional managed Redis cluster.',
    props: [
      { name: 'host', type: 'string', required: true, description: 'Ingress host' },
      {
        name: 'database',
        type: '{ host, database, user, passwordSecret }',
        required: true,
        description: 'DB connection',
      },
      {
        name: 'redis',
        type: '{ host } | { create: true }',
        required: true,
        description: 'External or managed Redis',
      },
      {
        name: 'admin',
        type: '{ password? } | { existingSecret? }',
        required: true,
        description: 'Admin credentials (creates Secret by default)',
      },
      {
        name: 'name',
        type: 'string',
        required: false,
        default: "'superset'",
        description: 'Resource name',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'superset'",
        description: 'Namespace',
      },
      {
        name: 'tls',
        type: '{ secretName, clusterIssuer }',
        required: false,
        description: 'TLS config',
      },
    ],
    example: `import { Superset } from '@r8s/superset'\n\nexport default <Superset host="analytics.example.com" database={{ host: 'db-rw', database: 'superset', user: 'superset', passwordSecret: 'superset-db', passwordKey: 'password' }} redis={{ create: true }} admin={{ existingSecret: 'superset-admin-credentials' }} />`,
  },
  {
    name: 'RustFS',
    package: '@r8s/rustfs',
    category: 'Storage',
    description: 'S3-compatible object storage (StatefulSet + Services + root credentials Secret).',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: "'rustfs'",
        description: 'Resource name',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'rustfs'",
        description: 'Namespace',
      },
      { name: 'instances', type: 'number', required: false, default: '4', description: 'Replicas' },
      {
        name: 'storage',
        type: 'string',
        required: false,
        default: "'100Gi'",
        description: 'Storage per instance',
      },
      {
        name: 'rootCredentials',
        type: '{ password?, existingSecret? }',
        required: false,
        description: 'Root credentials (creates Secret by default)',
      },
      { name: 'host', type: 'string', required: false, description: 'Ingress host' },
      {
        name: 'tls',
        type: '{ secretName, clusterIssuer }',
        required: false,
        description: 'TLS config',
      },
    ],
    example: `import { RustFS } from '@r8s/rustfs'\n\nexport default <RustFS name="storage" host="s3.example.com" storage="500Gi" />`,
  },
  {
    name: 'WireGuard',
    package: '@r8s/wireguard',
    category: 'Networking',
    description: 'WireGuard VPN server.',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        default: "'wireguard'",
        description: 'Resource name',
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        default: "'wireguard'",
        description: 'Namespace',
      },
      { name: 'host', type: 'string', required: true, description: 'VPN endpoint host' },
      {
        name: 'peers',
        type: 'number',
        required: false,
        default: '1',
        description: 'Number of peers',
      },
    ],
    example: `import { WireGuard } from '@r8s/wireguard'\n\nexport default <WireGuard host="vpn.example.com" peers={3} />`,
  },
]

// Auth sub-components (from @r8s/recipes/auth)
export const authComponents: ComponentInfo[] = [
  {
    name: 'Realms',
    package: '@r8s/recipes/auth',
    category: 'Auth',
    description: 'Container for Realm components. Use as child of <Auth>.',
    props: [
      {
        name: 'children',
        type: 'Realm | Realm[]',
        required: true,
        description: 'Realm configurations',
      },
    ],
    example: `<Realms><Realm id="myapp">...</Realm></Realms>`,
  },
  {
    name: 'Realm',
    package: '@r8s/recipes/auth',
    category: 'Auth',
    description: 'A Keycloak realm with clients and identity providers.',
    props: [
      { name: 'id', type: 'string', required: true, description: 'Realm ID' },
      { name: 'displayName', type: 'string', required: false, description: 'Display name' },
      {
        name: 'enabled',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Realm enabled',
      },
      {
        name: 'identityProviders',
        type: 'IdentityProviderConfig[]',
        required: false,
        description: 'IdP configs (prop form)',
      },
      {
        name: 'children',
        type: 'Clients | Client | EntraID | Google',
        required: false,
        description: 'Clients and IdPs as JSX',
      },
    ],
    example: `<Realm id="myapp" displayName="My App"><Clients><Client id="web" type="public" /></Clients></Realm>`,
  },
  {
    name: 'Clients',
    package: '@r8s/recipes/auth',
    category: 'Auth',
    description: 'Container for Client components.',
    props: [
      {
        name: 'children',
        type: 'Client | Client[]',
        required: true,
        description: 'Client configs',
      },
    ],
    example: `<Clients><Client id="web" type="public" /></Clients>`,
  },
  {
    name: 'Client',
    package: '@r8s/recipes/auth',
    category: 'Auth',
    description: 'A Keycloak client (OAuth app).',
    props: [
      { name: 'id', type: 'string', required: true, description: 'Client ID' },
      {
        name: 'type',
        type: "'public' | 'confidential' | 'bearer-only'",
        required: true,
        description: 'Client type',
      },
      { name: 'name', type: 'string', required: false, description: 'Display name' },
      { name: 'redirectUris', type: 'string[]', required: false, description: 'Redirect URIs' },
      {
        name: 'secret',
        type: 'string',
        required: false,
        description: 'Client secret (confidential)',
      },
    ],
    example: `<Client id="web" type="public" redirectUris={['https://app.example.com/*']} />`,
  },
  {
    name: 'EntraID',
    package: '@r8s/recipes/auth',
    category: 'Auth',
    description: 'Microsoft Entra ID (Azure AD) identity provider. Use as child of <Realm>.',
    props: [
      { name: 'tenantId', type: 'string', required: true, description: 'Entra tenant ID' },
      { name: 'clientId', type: 'string', required: true, description: 'Entra client ID' },
      { name: 'clientSecret', type: 'string', required: true, description: 'Entra client secret' },
      {
        name: 'displayName',
        type: 'string',
        required: false,
        default: "'Entra ID'",
        description: 'Display name',
      },
    ],
    example: `<EntraID tenantId="..." clientId="..." clientSecret="..." />`,
  },
  {
    name: 'Google',
    package: '@r8s/recipes/auth',
    category: 'Auth',
    description: 'Google identity provider. Use as child of <Realm>.',
    props: [
      { name: 'clientId', type: 'string', required: true, description: 'Google client ID' },
      { name: 'clientSecret', type: 'string', required: true, description: 'Google client secret' },
      {
        name: 'displayName',
        type: 'string',
        required: false,
        default: "'Google'",
        description: 'Display name',
      },
    ],
    example: `<Google clientId="..." clientSecret="..." />`,
  },
]

export const operators: OperatorInfo[] = [
  {
    name: 'cnpg',
    description: 'CloudNativePG PostgreSQL operator',
    category: 'Data',
    crds: ['clusters.postgresql.cnpg.io'],
  },
  {
    name: 'cert-manager',
    description: 'TLS certificate automation',
    category: 'Security',
    crds: ['certificates.cert-manager.io'],
  },
  {
    name: 'envoy-gateway',
    description: 'Envoy Gateway API implementation',
    category: 'Networking',
    crds: ['gateways.gateway.networking.k8s.io'],
  },
  {
    name: 'external-dns',
    description: 'Automatic DNS management',
    category: 'Networking',
    crds: ['dnsendpoints.externaldns.k8s.io'],
  },
  {
    name: 'keycloak-operator',
    description: 'Keycloak identity and access management',
    category: 'Identity',
    crds: ['keycloaks.k8s.keycloak.org'],
  },
  {
    name: 'redis-operator',
    description: 'Redis Operator by OT-Container-Kit',
    category: 'Data',
    crds: ['redisclusters.redis.redis.opstreelabs.in'],
  },
  {
    name: 'prometheus',
    description: 'kube-prometheus-stack monitoring',
    category: 'Observability',
    crds: ['prometheuses.monitoring.coreos.com'],
  },
  {
    name: 'loki',
    description: 'Grafana Loki log aggregation',
    category: 'Observability',
    crds: ['lokistacks.loki.grafana.com'],
  },
  {
    name: 'vault-secrets-operator',
    description: 'HashiCorp Vault Secrets Operator',
    category: 'Security',
    crds: ['vaultstaticsecrets.secrets.hashicorp.com'],
  },
  {
    name: 'velero',
    description: 'Backup and disaster recovery',
    category: 'Data',
    crds: ['schedules.velero.io'],
  },
  {
    name: 'clickhouse-operator',
    description: 'ClickHouse Operator by Altinity',
    category: 'Data',
    crds: ['clickhouseinstallations.clickhouse.altinity.com'],
  },
  {
    name: 'logging-operator',
    description: 'Logging Operator by Banzai Cloud',
    category: 'Observability',
    crds: ['flows.logging.banzaicloud.io'],
  },
]

export function allComponents(): ComponentInfo[] {
  return [...components, ...authComponents]
}

export function findComponent(name: string): ComponentInfo | undefined {
  return allComponents().find((c) => c.name.toLowerCase() === name.toLowerCase())
}
