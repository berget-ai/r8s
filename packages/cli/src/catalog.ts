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

import { operatorMetadata } from '@r8s/crds'

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
    example: `import { operatorMetadata } from '@r8s/crds'
import { App } from '@r8s/recipes'\n\nexport default <App name="api" image="api:v1" host="api.example.com" />`,
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
        name: 'instances',
        type: 'number',
        required: false,
        default: '3',
        description: 'CNPG cluster instances',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        default: "'10Gi'",
        description: 'Storage size',
      },
      {
        name: 'storageClass',
        type: 'string',
        required: false,
        description: 'Storage class for the data volume',
      },
      {
        name: 'parameters',
        type: 'Record<string, string>',
        required: false,
        description: 'PostgreSQL parameters (e.g. { max_connections: "200" })',
      },
      {
        name: 'backup',
        type: '{ destinationPath: string; endpointURL: string; credentialsSecret?: string; retention?: string; schedule?: string; compression?: string; encryption?: string }',
        required: false,
        description:
          'Barman backup to S3 + ScheduledBackup. Secure default: enabled when an S3Provider is in scope (target/credentials derive from it); without one, omitting throws. backup={false} opts out. Credentials from the secrets backend or an existing Secret (keys access-key-id/secret-access-key) — never plaintext.',
      },
      {
        name: 'rolloutRestartTargets',
        type: '{ kind?: string; name: string; apiVersion?: string }[]',
        required: false,
        description:
          'Workloads restarted when credentials rotate (rendered on the credentials static secret)',
      },
      {
        name: 'postInitSQL',
        type: 'string[]',
        required: false,
        description: 'SQL run once after bootstrap (roles, extensions)',
      },
      {
        name: 'operatorVersion',
        type: 'string',
        required: false,
        description: 'CNPG operator version',
      },
      {
        name: 'children',
        type: 'unknown',
        required: false,
        description:
          'App/Database/Auth components (optional — can set up cluster infra standalone)',
      },
    ],
    example: `import { Database } from '@r8s/recipes'\n\nexport default <Database backup={false} name="api-db" storage="20Gi" />`,
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
    example: `import { R8sCluster, Platform, App, Database } from '@r8s/recipes'\n\nexport default (\n  <R8sCluster\n    secrets={{ mount: 'secret', path: 'production' }}\n    dns={{ server: 'ns1.example.com', zone: 'example.com', tsigPath: 'dns/tsig' }}\n  >\n    <Platform namespace="production">\n      <Database backup={false} name="api-db" storage="20Gi" />\n      <App name="api" image="api:v1" host="api.example.com" />\n    </Platform>\n  </R8sCluster>\n)`,
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
    name: 'Namespace',
    package: '@r8s/recipes',
    category: 'Complete Solution',
    description:
      'Namespace scope — composable cluster partitioning. Children inherit the namespace (innermost scope wins; explicit namespace props still override). Emits the v1/Namespace resource by default so rendered output is self-contained.',
    props: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Namespace name — DNS-1123 label (lowercase alphanumerics and -)',
      },
      {
        name: 'create',
        type: 'boolean',
        required: false,
        default: 'true',
        description: 'Emit the v1/Namespace resource (set false when managed elsewhere)',
      },
      {
        name: 'children',
        type: 'unknown',
        required: false,
        description: 'Components scoped to this namespace',
      },
    ],
    example: `import { Platform, Namespace, App, Database } from '@r8s/recipes'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Namespace name="team-a">\n      <App name="api" image="api:v1" host="api.example.com" />\n      <Database backup={false} name="api-db" />\n    </Namespace>\n    <Namespace name="team-b">\n      <App name="billing" image="api:v2" host="billing.example.com" />\n    </Namespace>\n  </Platform>\n)`,
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
  {
    name: 'N8n',
    package: '@r8s/n8n',
    category: 'Apps & Automation',
    description:
      'n8n workflow automation — editor, Postgres persistence, Redis queue mode, webhook endpoints',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'n8n')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: 'Kubernetes namespace (inherited from Platform context when omitted)',
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the editor and webhooks (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description: 'Number of editor replicas when not running in queue mode (defaults to 1)',
      },
      {
        name: 'queueMode',
        type: 'boolean',
        required: false,
        description:
          'Redis-backed queue mode. Adds a Redis master/replica set and a worker Deployment so webhook ingestion and heavy executions scale independently.',
      },
      {
        name: 'workers',
        type: 'number',
        required: false,
        description: 'Queue worker replicas (defaults to 2, only used with queueMode)',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        description: "Storage request for the CNPG Postgres cluster (defaults to '10Gi')",
      },
      {
        name: 'dbInstances',
        type: 'number',
        required: false,
        description: 'Number of CNPG instances (defaults to 3 — shrink for dev/edge clusters)',
      },
      {
        name: 'encryptionKeySecretName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret containing key `encryptionKey`. n8n encrypts all workflow credentials with this key — lose it and every stored credential is unreadable. Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions the key automatically. Plaintext keys are not supported.',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested editor resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform } from '@r8s/recipes'\nimport { N8n } from '@r8s/n8n'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <N8n name=\"n8n\" host=\"n8n.example.com\" queueMode workers={3} />\n  </Platform>\n)",
  },
  {
    name: 'Nextcloud',
    package: '@r8s/nextcloud',
    category: 'Collaboration & Productivity',
    description:
      'Nextcloud file cloud — Postgres file index, Redis cache, S3-compatible primary storage, cron background jobs',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'nextcloud')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to '31-apache' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the web UI and WebDAV (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description:
          'Number of replicas. Safe to scale beyond 1 when file blobs live in S3 (always — `objectStorage` is a required decision derived from the S3Provider) and `cache` is enabled — Nextcloud becomes effectively stateless. Requires a StorageClass with ReadWriteMany support for the /var/www/html claim.',
      },
      {
        name: 'cache',
        type: 'boolean',
        required: false,
        description:
          'Provision a Redis replication set for file locking and caching (default: true)',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        description:
          "Size of the PersistentVolumeClaim backing /var/www/html (defaults to '10Gi'). Apps, config and the data directory all live in this tree.",
      },
      {
        name: 'storageClassName',
        type: 'string',
        required: false,
        description:
          'StorageClass for the /var/www/html PersistentVolumeClaim. Must provide ReadWriteMany when `replicas` > 1 (e.g. NFS or EFS). Defaults to the cluster default StorageClass when omitted.',
      },
      {
        name: 'objectStorage',
        type: '{ endpoint: string; bucket: string; credentialsSecret: string; region?: string; port?: number; ssl?: boolean } | BucketElement',
        required: false,
        description:
          'S3-compatible object storage used as primary storage for files (RustFS in the platform). Resolution order: this prop → a <Bucket name="…"/> descriptor → derived from the surrounding <S3Provider> (omit it entirely there). The descriptor\'s `bucket` override selects the bucket, its `name` is only the logical scope. Credentials live in a Secret (keys: accessKey, secretKey) — never plaintext.',
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding the Nextcloud app secrets (key: adminPassword). Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions them automatically. Plaintext admin passwords are not supported.',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      'import { Platform, S3Provider, MinIO } from \'@r8s/recipes\'\nimport { Nextcloud } from \'@r8s/nextcloud\'\n\n// Backups and objectStorage both default to on — the S3Provider derives targets and credentials\nexport default (\n  <S3Provider\n    provider={\n      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />\n    }\n  >\n    <Platform secrets={{ backend: \'openbao\', mount: \'kv\', path: \'apps\' }}>\n      <Nextcloud name="cloud" host="cloud.example.com" />\n    </Platform>\n  </S3Provider>\n)',
  },
  {
    name: 'Outline',
    package: '@r8s/outline',
    category: 'Collaboration & Productivity',
    description:
      'Outline wiki — Postgres persistence, Redis queue, S3 attachments, OIDC SSO via Keycloak',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'outline')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      { name: 'host', type: 'string', required: true, description: 'Public hostname for the wiki' },
      {
        name: 'storage',
        type: 'string',
        required: false,
        description: "Storage request for the CNPG Postgres cluster (defaults to '10Gi')",
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description: 'Number of replicas (Outline is stateless — scale freely)',
      },
      {
        name: 'cache',
        type: 'boolean',
        required: false,
        description: 'Provision a Redis cluster for the queue and rate limiting (default: true)',
      },
      {
        name: 'objectStorage',
        type: '{ endpoint: string; bucket: string; credentialsSecret: string; region?: string } | BucketElement',
        required: false,
        description:
          'S3-compatible object storage for attachments (RustFS in the platform). Resolution order: this prop → a <Bucket name="…"/> descriptor → derived from the surrounding <S3Provider> (omit it entirely there). The descriptor\'s `bucket` override selects the bucket, its `name` is only the logical scope. Credentials live in a Secret (keys: accessKey, secretKey) — never plaintext.',
      },
      {
        name: 'sso',
        type: '{ issuer: string clientId: string clientSecretRef: SecretRef scopes?: string }',
        required: false,
        description:
          'OIDC SSO client — register Outline as a client in Keycloak (the Auth recipe) and reference the client secret through the backend.',
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding `secretKey` and `utilsSecret`. Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions them.',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform, S3Provider, MinIO } from '@r8s/recipes'\nimport { Outline } from '@r8s/outline'\n\n// Backups and objectStorage both default to on — the S3Provider derives targets and credentials\nexport default (\n  <S3Provider\n    provider={\n      <MinIO endpoint=\"https://rustfs:9000\" bucket=\"infra\" credentialsSecret=\"infra-s3-creds\" />\n    }\n  >\n    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n      <Outline\n        name=\"wiki\"\n        host=\"wiki.example.com\"\n        sso={{\n          issuer: 'https://keycloak.example.com/realms/platform',\n          clientId: 'outline',\n          clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },\n        }}\n      />\n    </Platform>\n  </S3Provider>\n)",
  },
  {
    name: 'ChromaDb',
    package: '@r8s/chromadb',
    category: 'AI & Assistants',
    description:
      'ChromaDB vector database — persistent storage, optional Postgres metadata backend, token auth, CPU autoscaling',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'chromadb')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the vector API (required)',
      },
      {
        name: 'port',
        type: 'number',
        required: false,
        description: 'Port Chroma listens on (defaults to 8000)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description:
          'Number of replicas (defaults to 1). The embedded data PVC is ReadWriteOnce — extra replicas on other nodes cause Multi-Attach errors; scale out only with a ReadWriteMany StorageClass via `storageClassName` (required for `autoscaling`).',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        description: "Persistent storage size for the embedded data volume (defaults to '50Gi')",
      },
      {
        name: 'storageClassName',
        type: 'string',
        required: false,
        description: 'StorageClass for the data PersistentVolumeClaim (optional — cluster default)',
      },
      {
        name: 'probePath',
        type: 'string',
        required: false,
        description:
          "HTTP path for liveness/readiness probes (defaults to '/api/v2/heartbeat' — the current image API). Set '/api/v1/heartbeat' for older images still serving the v1 API.",
      },
      {
        name: 'auth',
        type: 'boolean',
        required: false,
        description: 'Require token authentication for the server (defaults to false)',
      },
      {
        name: 'authTokenSecretName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding key `token` — the Chroma server auth credential. Required when `auth` is true, unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions the token at path `<path>/<name>/auth-token` (key: token). Plaintext credentials are not supported.',
      },
      {
        name: 'autoscaling',
        type: 'boolean',
        required: false,
        description:
          'Autoscale the Deployment via a CPU-based HorizontalPodAutoscaler (defaults to false)',
      },
      {
        name: 'pg',
        type: 'boolean',
        required: false,
        description: 'Provision a CNPG Postgres cluster as the metadata store (defaults to false)',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      'import { ChromaDb } from \'@r8s/chromadb\'\n\nexport default <ChromaDb name="vectors" host="vectors.example.com" />',
  },
  {
    name: 'Supabase',
    package: '@r8s/supabase',
    category: 'Data & Analytics',
    description:
      'Supabase backend platform — Postgres core with GoTrue auth, PostgREST, Realtime, Storage API (S3/RustFS) and ImgProxy. This is Supabase, NOT Apache Superset.',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name — base for every derived resource (defaults to 'supabase')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the REST API root — PostgREST (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description: 'Replicas per service (defaults to 1; PostgREST/GoTrue scale horizontally)',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        description: "Postgres cluster storage size for the Database core (defaults to '10Gi')",
      },
      {
        name: 'storageApi',
        type: 'boolean',
        required: false,
        description:
          'Render the Storage API service (defaults to true). Set false to run a minimal auth + REST-only Supabase.',
      },
      {
        name: 'objectStorage',
        type: '{ endpoint: string; bucket: string; credentialsSecret: string } | BucketElement',
        required: false,
        description:
          'S3-compatible object storage for the Storage API (RustFS in the platform). Resolution order: this prop → a <Bucket name="…"/> descriptor → derived from the surrounding <S3Provider> (omit it entirely there). The descriptor\'s `bucket` override selects the bucket, its `name` is only the logical scope. Credentials live in a Secret (keys: accessKey, secretKey) — never plaintext.',
      },
      {
        name: 'region',
        type: 'string',
        required: false,
        description:
          "S3 region reported to the Storage API (GLOBAL_S3_REGION, defaults to 'us-east-1'). For S3-compatible stores like RustFS any consistent region works — keep it aligned with the provider's default.",
      },
      {
        name: 'jwtSecretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding the Supabase JWT bundle with keys `jwtSecret`, `anonKey`, `serviceRoleKey` and `referrerURLs`. Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions the bundle at path `<path>/<name>/jwt`. Plaintext JWT secrets are not supported.',
      },
      {
        name: 'uriAllowList',
        type: 'string | string[]',
        required: false,
        description:
          "Additional redirect URLs GoTrue may send users to after signup, magic-link or OAuth flows (GOTRUE_URI_ALLOW_LIST). The site URL is always allowed; pass a list (joined with ',') or a pre-joined string.",
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources — applied to every service in the suite',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      'import { Platform, S3Provider, MinIO } from \'@r8s/recipes\'\nimport { Supabase } from \'@r8s/supabase\'\n\n// Backups and objectStorage both default to on — the S3Provider derives targets and credentials\nexport default (\n  <S3Provider\n    provider={\n      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />\n    }\n  >\n    <Platform secrets={{ backend: \'openbao\', mount: \'kv\', path: \'apps\' }}>\n      <Supabase name="backend" host="backend.example.com" />\n    </Platform>\n  </S3Provider>\n)',
  },
  {
    name: 'Odoo',
    package: '@r8s/odoo',
    category: 'Apps & Automation',
    description:
      'Odoo ERP — Postgres persistence, filestore PVC, worker tuning, master password via secrets backend',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'odoo')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to '18' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the ERP web UI (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description:
          'Number of replicas. Must stay at 1 — the filestore PVC is ReadWriteOnce and cannot attach to multiple pods (defaults to 1).',
      },
      {
        name: 'filestore',
        type: 'string',
        required: false,
        description:
          "Size of the filestore PersistentVolumeClaim (defaults to '20Gi'). Odoo stores attachments and binary fields here.",
      },
      {
        name: 'workers',
        type: 'number',
        required: false,
        description:
          'Odoo process-level worker processes, rendered into odoo.conf (defaults to 2). Rule of thumb: (CPU threads * 2) + 1, accounting for cron workers.',
      },
      {
        name: 'masterPasswordSecretName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret containing key `masterPassword`. Odoo requires this to manage the super-admin (`/web/database/manager`). Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions the password automatically. Plaintext passwords are not supported.',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform } from '@r8s/recipes'\nimport { Odoo } from '@r8s/odoo'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Odoo name=\"erp\" host=\"erp.example.com\" workers={4} />\n  </Platform>\n)",
  },
  {
    name: 'OpenWebui',
    package: '@r8s/open-webui',
    category: 'AI & Assistants',
    description:
      'Open WebUI — chat frontend for OpenAI-compatible backends, Postgres persistence, uploads/RAG storage, OIDC SSO, optional Redis cache',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'open-webui')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the chat UI (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description:
          'Number of replicas (defaults to 1). Multiple replicas need a shared object store for uploads/RAG (this recipe errors when `storage` is set with replicas > 1 — its PVC is ReadWriteOnce) and Redis-backed websocket coordination (WEBSOCKET_MANAGER=redis + REDIS_URL).',
      },
      {
        name: 'storage',
        type: 'string',
        required: false,
        description:
          "PVC size for uploads and RAG document storage (e.g. '10Gi'). When set, a `${name}-uploads` PersistentVolumeClaim is rendered and mounted at /app/backend/data. WebService cannot express volume mounts, which is why this component composes a raw Deployment (probes /health:8080). The PVC is ReadWriteOnce — combining this with replicas > 1 throws (single-node attach); multi-replica installs must move files/RAG to an S3-compatible store and set WEBSOCKET_MANAGER=redis.",
      },
      {
        name: 'backend',
        type: 'string',
        required: false,
        description:
          "OpenAI-compatible API base URL for the model backend (defaults to 'https://api.berget.ai/v1'). The key itself is never passed as a prop — it arrives via secretKeyRef from the secrets bundle below.",
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding `modelApiKey` (the key used to call `backend`) and `secretKey` (the WEBUI_SECRET_KEY used to sign auth tokens). Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions both keys automatically. Plaintext keys are not supported.',
      },
      {
        name: 'sso',
        type: "{ /** OIDC discovery issuer, e.g. https://keycloak.example.com/realms/platform */ issuer: string /** Client id registered at the issuer (non-sensitive) */ clientId: string /** Reference to the Kubernetes Secret holding the client secret */ clientSecretRef: SecretRef /** Scope list (defaults to 'openid email profile') */ scopes?: string }",
        required: false,
        description:
          'OAuth/OIDC SSO client — register Open WebUI as a client in Keycloak (the Auth recipe) and reference the client secret through the backend. Uses the upstream OAUTH_* env names; OPENID_PROVIDER_URL carries the issuer (Open WebUI appends /.well-known/openid-configuration itself).',
      },
      {
        name: 'cache',
        type: 'boolean',
        required: false,
        description:
          'Provision a redis-backed replication group for caching/events (default: false)',
      },
      {
        name: 'offline',
        type: 'boolean',
        required: false,
        description:
          'Air-gapped installs: sets OFFLINE_MODE (disable runtime model/param fetches), removes the update checks and disables the native Ollama API — only OpenAI-compatible backends are served (default: false).',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform } from '@r8s/recipes'\nimport { OpenWebui } from '@r8s/open-webui'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <OpenWebui\n      name=\"chat\"\n      host=\"chat.example.com\"\n      version=\"v0.6.5\"\n      storage=\"10Gi\"\n    />\n  </Platform>\n)",
  },
  {
    name: 'LibreChat',
    package: '@r8s/librechat',
    category: 'AI & Assistants',
    description:
      'LibreChat multi-model AI chat — MongoDB (provisioned externally), Redis sessions, optional Meilisearch, OIDC SSO',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'librechat')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the chat UI (required)',
      },
      {
        name: 'port',
        type: 'number',
        required: false,
        description: 'Port the app listens on in-container (defaults to 3080)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description: 'Number of replicas (defaults to 1)',
      },
      {
        name: 'mongodb',
        type: 'MongoConnection',
        required: true,
        description:
          'External MongoDB connection (REQUIRED). LibreChat stores users, conversations and messages in MongoDB — this component does NOT provision it. Run MongoDB separately (replica-set StatefulSet, operator or managed service) and point this prop at it.',
      },
      {
        name: 'cache',
        type: 'boolean',
        required: false,
        description: 'Provision a redis replication group for session caching (default: true)',
      },
      {
        name: 'search',
        type: 'boolean',
        required: false,
        description:
          'Add a Meilisearch sidecar service for full-text / RAG search (default: false). MEILI_MASTER_KEY is shared from the app secrets bundle (key: meiliMasterKey). Sets SEARCH=true on the app so it actually queries the meilisearch instance.',
      },
      {
        name: 'sso',
        type: '{ issuer: string clientId: string clientSecretRef: SecretRef scopes?: string }',
        required: false,
        description:
          'OIDC SSO client — register LibreChat as a client in Keycloak (the Auth recipe) and reference the client secret through the backend. Uses the upstream OPENID_* env names; ALLOW_SOCIAL_LOGIN plus DOMAIN_SERVER/DOMAIN_CLIENT are set from `host`.',
      },
      {
        name: 'backend',
        type: 'string',
        required: false,
        description:
          'OpenAI-compatible API base URL for model calls (defaults to https://api.berget.ai/v1)',
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding `secretKey`, `modelApiKey`, the multi-user session credentials `jwtSecret`, `jwtRefreshSecret`, `credsKey`, `credsIv` — and `meiliMasterKey` when `search` is enabled. Hex sizing: jwtSecret / jwtRefreshSecret / credsKey are 64 hex chars (32 bytes); credsIv is 32 hex chars (16 bytes — AES-IV). Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions them. Plaintext secrets are not supported.',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform } from '@r8s/recipes'\nimport { LibreChat } from '@r8s/librechat'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <LibreChat\n      name=\"chat\"\n      host=\"chat.example.com\"\n      mongodb={{ host: 'mongo.data.svc.cluster.local', passwordSecret: 'chat-mongodb-credentials' }}\n      sso={{\n        issuer: 'https://keycloak.example.com/realms/platform',\n        clientId: 'librechat',\n        clientSecretRef: { secret: 'librechat-sso', key: 'clientSecret' },\n      }}\n    />\n  </Platform>\n)",
  },
  {
    name: 'EuroOffice',
    package: '@r8s/eurooffice',
    category: 'Productivity & Documents',
    description:
      'Euro-Office DocumentServer — self-hosted collaborative document editing (facit-aligned): CNPG persistence, JWT-signed API, WOPI/secure-link data volume, preStop document save, optional brand fonts',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'onlyoffice')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: 'Kubernetes namespace (inherited from <Platform>/<Namespace> unless set)',
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description:
          "DocumentServer image tag (defaults to 'v9.3.2'). Pinned version REQUIRED — 'latest' is rejected (the ghcr repo also carries CI build tags)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the document server (used by Odoo/WOPI integrations)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description:
          'Must be exactly 1: the DocumentServer ships embedded Redis + RabbitMQ and keeps its secure-link secret and WOPI keys on the RWO data volume — it does not scale horizontally',
      },
      {
        name: 'dataStorage',
        type: 'string | { size?: string; storageClass?: string } | false',
        required: false,
        description:
          "RWO data volume at /var/www/euro-office/Data (secure-link secret + WOPI keys). Defaults to '5Gi'; pass false to manage storage yourself",
      },
      {
        name: 'customFonts',
        type: '{ name: string; url: string }[] | false',
        required: false,
        description:
          'Static TTFs baked into the container at boot (curl init container — variable fonts render under the wrong family name). Defaults to the Berget brand set; false disables',
      },
      {
        name: 'jwt',
        type: '{ path?: string; refreshAfter?: string; rolloutRestartTargets?: { kind?: string; name: string; apiVersion?: string }[] }',
        required: false,
        description:
          'JWT securing the document-server API (Odoo integration) — always enabled, provisioned through the Platform secrets backend with pod restart on rotation',
      },
      {
        name: 'jwtSecretName',
        type: 'string',
        required: false,
        description:
          'Reference a pre-created JWT Secret (key: JWT_SECRET) instead of backend provisioning',
      },
      {
        name: 'exampleEnabled',
        type: 'boolean',
        required: false,
        description:
          'Show the /example test UI (EXAMPLE_ENABLED). Defaults to false — enable during bring-up, then turn off',
      },
      {
        name: 'dbName',
        type: 'string',
        required: false,
        description:
          "CNPG cluster name (also the database and user name). Defaults to 'eurooffice-db' — the production cluster name, deliberately distinct to avoid PVC collisions",
      },
      {
        name: 'dbInstances',
        type: 'number',
        required: false,
        description: 'CNPG instances (defaults to 2)',
      },
      {
        name: 'dbStorage',
        type: 'string',
        required: false,
        description: "CNPG data volume size (defaults to '20Gi')",
      },
      {
        name: 'dbStorageClass',
        type: 'string',
        required: false,
        description: 'CNPG storage class (defaults to cluster default)',
      },
      {
        name: 'backup',
        type: '{ destinationPath?: string; endpointURL?: string; credentialsSecret?: string; retention?: string; schedule?: string; compression?: string; encryption?: string } | true | false',
        required: false,
        description:
          "CNPG backup passthrough (continuous WAL + scheduled base backups). Defaults to **enabled** via the platform's S3Provider; `false` opts out",
      },
      {
        name: 'postInitSQL',
        type: 'string[]',
        required: false,
        description:
          'SQL run once on a fresh cluster (CNPG postInitApplicationSQL). v9.3.2 cannot bootstrap an empty database by itself (entrypoint lacks ensure_db_schema) — apply the image createdb.sql here',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string }; limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'App resources (defaults to facit: 1Gi/500m → 4Gi/2)',
      },
      {
        name: 'endpointAnnotations',
        type: 'Record<string, string>',
        required: false,
        description:
          'Extra annotations merged onto the Endpoint (proxy-body-size 100m + 600s proxy timeouts are defaults)',
      },
      {
        name: 'tls',
        type: '{ secretName: string; clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform, S3Provider, MinIO } from '@r8s/recipes'\nimport { EuroOffice } from '@r8s/eurooffice'\n\n// Backups default to on — the S3Provider derives target and credentials\nexport default (\n  <S3Provider provider={<MinIO endpoint=\"https://rustfs:9000\" bucket=\"infra\" credentialsSecret=\"infra-s3-creds\" />}>\n    <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'onlyoffice' }}>\n      <EuroOffice host=\"docs.example.com\" />\n    </Platform>\n  </S3Provider>\n)",
  },
  {
    name: 'Forgejo',
    package: '@r8s/forgejo',
    category: 'Developer Tools',
    description:
      'Forgejo git forge — repos + PRs on an RWO PVC, CNPG persistence with backups on by default, LFS on S3 (PVC fallback), Actions runners by default (forgejo-runner + docker-in-docker), SSH via a dedicated LoadBalancer',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'forgejo')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: 'Kubernetes namespace (inherited from <Platform>/<Namespace> unless set)',
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description:
          "Forgejo image tag (defaults to '11' — tracks patch releases within the major). Pinned version REQUIRED — 'latest' is rejected",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname — web UI, git-over-HTTPS and the advertised SSH host',
      },
      {
        name: 'storage',
        type: 'string | { size?: string; storageClass?: string } | false',
        required: false,
        description:
          "Repository data on an RWO PVC at /data. Defaults to '20Gi'; false manages storage yourself. Forgejo is single-replica",
      },
      {
        name: 'dbName',
        type: 'string',
        required: false,
        description:
          "CNPG cluster name (also the database and user name). Defaults to 'forgejo-db'",
      },
      {
        name: 'dbInstances',
        type: 'number',
        required: false,
        description: 'CNPG instances (defaults to 2)',
      },
      {
        name: 'dbStorage',
        type: 'string',
        required: false,
        description: "CNPG data volume size (defaults to '20Gi')",
      },
      {
        name: 'dbStorageClass',
        type: 'string',
        required: false,
        description: 'CNPG storage class (defaults to cluster default)',
      },
      {
        name: 'backup',
        type: '{ destinationPath?; endpointURL?; credentialsSecret?; retention?; schedule?; compression?; encryption? } | true | false',
        required: false,
        description:
          "CNPG backup passthrough — defaults to **enabled** via the platform's S3Provider; `false` opts out",
      },
      {
        name: 'lfs',
        type: "'s3' | 'pvc' | false",
        required: false,
        description:
          "LFS storage. 's3' derives bucket and credentials from the S3Provider (the default when one is in scope), 'pvc' keeps large files on the data volume (the fallback without an S3Provider), false disables LFS",
      },
      {
        name: 'actions',
        type: '{ replicas?; version?; registrationTokenSecretName?; labels? } | true | false',
        required: false,
        default: 'true',
        description:
          'Actions runners — enabled by default. forgejo-runner Deployment with a docker-in-docker sidecar (privileged — run untrusted-code runners in a dedicated namespace/node pool). The registration token is provisioned from the secrets backend (<path>/<name>/runner-registration-token) or referenced via registrationTokenSecretName',
      },
      {
        name: 'registration',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Open registration (default false — private forge; open deliberately)',
      },
      {
        name: 'metrics',
        type: 'boolean',
        required: false,
        default: 'false',
        description: 'Expose Prometheus /metrics',
      },
      {
        name: 'credentialsSecretName',
        type: 'string',
        required: false,
        description:
          'Reference a pre-created Secret holding SECRET_KEY, INTERNAL_TOKEN and LFS_JWT_SECRET instead of backend provisioning',
      },
      {
        name: 'endpointAnnotations',
        type: 'Record<string, string>',
        required: false,
        description:
          'Extra annotations merged onto the Endpoint (proxy-body-size 512m + 900s proxy timeouts are defaults)',
      },
      {
        name: 'tls',
        type: '{ secretName: string; clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
      {
        name: 'ssh',
        type: '{ port?; annotations? } | false',
        required: false,
        default: 'enabled on port 22',
        description:
          'SSH over a dedicated LoadBalancer Service. port changes the external port AND the port advertised in clone URLs; false = git over HTTPS only',
      },
      {
        name: 'operatorVersion',
        type: 'string',
        required: false,
        description: 'CNPG operator version override',
      },
    ],
    example:
      'import { Platform, Namespace, S3Provider, MinIO } from \'@r8s/recipes\'\nimport { Forgejo } from \'@r8s/forgejo\'\n\n// Backups + LFS derive from the S3Provider; runners ship by default\nexport default (\n  <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n    <Platform secrets={{ backend: \'openbao\', mount: \'kv\', path: \'forgejo\' }}>\n      <Namespace name="git">\n        <Forgejo host="git.example.com" />\n      </Namespace>\n    </Platform>\n  </S3Provider>\n)',
  },
  {
    name: 'Paperclip',
    package: '@r8s/paperclip',
    category: 'Collaboration & Productivity',
    description: "Paperclip — Berget's agent platform (tasks, documents, agent orchestration)",
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'paperclip')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the web app and API (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description: 'Number of app replicas (defaults to 2)',
      },
      {
        name: 'dbStorage',
        type: 'string',
        required: false,
        description: "Storage size for the Postgres cluster (defaults to '10Gi')",
      },
      {
        name: 'websockets',
        type: 'boolean',
        required: false,
        description: 'Enable websockets for live task and agent updates (defaults to false)',
      },
      {
        name: 'agents',
        type: '{ /** Number of sandbox agent replicas (defaults to 2) */ sandboxReplicas?: number /** Sandbox container resources (defaults to requests 256Mi/250m, limits 2Gi/1000m) */ resources?: { requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } } }',
        required: false,
        description:
          'Sandbox agent workers. Workers run the same image with a command override (paperclip agent --sandbox) and share the model API key and database credentials via secretKeyRef. They run with a hardened securityContext (non-root, no privilege escalation, RuntimeDefault seccomp, all capabilities dropped) by default.',
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret containing key `modelApiKey`. Paperclip uses this key to call LLM providers on behalf of agents. Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions the key automatically. Plaintext keys are not supported.',
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested app resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      "import { Platform } from '@r8s/recipes'\nimport { Paperclip } from '@r8s/paperclip'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Paperclip\n      name=\"paperclip\"\n      host=\"paperclip.example.com\"\n      agents={{ sandboxReplicas: 3 }}\n    />\n  </Platform>\n)",
  },
  {
    name: 'Eneo',
    package: '@r8s/eneo',
    category: 'Collaboration & Productivity',
    description:
      'Eneo — open AI platform from Sundsvall municipality (agent workspaces, assistants, document AI)',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'eneo')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: "Kubernetes namespace (defaults to 'default')",
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: "Container image tag (defaults to 'latest' — pin a version in production)",
      },
      {
        name: 'host',
        type: 'string',
        required: true,
        description: 'Public hostname for the Eneo web app (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description: 'Number of app replicas (defaults to 2 — scale freely, the app is stateless)',
      },
      {
        name: 'objectStorage',
        type: '{ endpoint: string; bucket: string; credentialsSecret: string; region?: string } | BucketElement',
        required: false,
        description:
          'S3-compatible object storage for document corpora (RustFS in the platform). Resolution order: this prop → a <Bucket name="…"/> descriptor → derived from the surrounding <S3Provider> (omit it entirely there). The descriptor\'s `bucket` override selects the bucket, its `name` is only the logical scope. Credentials live in a Secret (keys: accessKey, secretKey) — never plaintext.',
      },
      {
        name: 'sso',
        type: '{ issuer: string clientId: string clientSecretRef: SecretRef scopes?: string }',
        required: false,
        description:
          'OIDC SSO client — register Eneo as a client in Keycloak (the Auth recipe) and reference the client secret through the backend.',
      },
      {
        name: 'smtp',
        type: '{ /** SMTP server hostname, e.g. smtp.example.com */ host: string /** SMTP port (defaults to 587) */ port?: number /** From address for outgoing mail, e.g. no-reply@example.com */ from?: string }',
        required: false,
        description:
          'Outgoing SMTP for invitations and notifications (mirror of the EuroOffice recipe). When set, SMTP_HOST / SMTP_PORT / SMTP_FROM are rendered as plain env and SMTP_PASSWORD is delivered via secretKeyRef from the `${name}-secrets` bundle (key: smtpPassword) — never plaintext. The bundle then requires the `smtpPassword` key as well; without `smtp` only `appSecret` is required from the bundle.',
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding `appSecret` (and `smtpPassword` when `smtp` is set). Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions them.',
      },
      {
        name: 'dbStorage',
        type: 'string',
        required: false,
        description:
          "Storage size for the Postgres cluster (defaults to '10Gi'). Document corpora live in object storage (`objectStorage`, S3/RustFS) — Eneo does not persist corpora on a local volume. A local corpus PVC (mounted volumes/sidecars on the app workload) is a v1.1 item.",
      },
      {
        name: 'resources',
        type: '{ requests?: { cpu?: string; memory?: string } limits?: { cpu?: string; memory?: string } }',
        required: false,
        description: 'Requested app resources',
      },
      {
        name: 'tls',
        type: '{ secretName: string clusterIssuer: string }',
        required: false,
        description: 'TLS configuration (defaults to letsencrypt-prod cluster issuer)',
      },
    ],
    example:
      'import { Platform, S3Provider, MinIO } from \'@r8s/recipes\'\nimport { Eneo } from \'@r8s/eneo\'\n\n// Backups and objectStorage both default to on — the S3Provider derives targets and credentials\nexport default (\n  <S3Provider\n    provider={\n      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />\n    }\n  >\n    <Platform secrets={{ backend: \'openbao\', mount: \'kv\', path: \'apps\' }}>\n      <Eneo name="eneo" host="eneo.example.com" />\n    </Platform>\n  </S3Provider>\n)',
  },
  {
    name: 'Matrix',
    package: '@r8s/matrix',
    category: 'Collaboration & Productivity',
    description:
      'Matrix — full Element Server Suite (Synapse, MAS with OIDC SSO, Element Web/Admin, LiveKit SFU) with production HA defaults',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'matrix')",
      },
      {
        name: 'namespace',
        type: 'string',
        required: false,
        description: 'Kubernetes namespace (inherited from Platform when omitted)',
      },
      {
        name: 'domain',
        type: 'string',
        required: true,
        description:
          'Base domain — derives the five public hosts (web: element., synapse: matrix., admin: element-admin., account: matrix-account., rtc: matrix-rtc.)',
      },
      {
        name: 'hosts',
        type: "Partial<Record<'web' | 'synapse' | 'admin' | 'account' | 'rtc', string>>",
        required: false,
        description: 'Per-hostname overrides for the five ingress hosts',
      },
      {
        name: 'serverName',
        type: 'string',
        required: false,
        description: 'Matrix server name used in user IDs (@user:serverName). Defaults to domain.',
      },
      {
        name: 'sso',
        type: '{ issuer: string clientId: string clientSecretRef?: string humanName?: string scope?: string }',
        required: false,
        description:
          'OIDC SSO upstream for MAS (Keycloak from the Auth recipe). Disables local password login when set. Requires a secrets backend or clientSecretRef — never inline secrets.',
      },
      {
        name: 'database',
        type: '{ replicas?: number storage?: string storageClass?: string backup?: { destinationPath: string endpointURL: string credentialsSecret?: string retention?: string schedule?: string } | null }',
        required: false,
        description:
          'Per-database sizing for the two CNPG clusters (synapse-db, mas-db). Backup is explicit opt-in: barman object store with 30d retention + ScheduledBackup.',
      },
      {
        name: 'keysStorage',
        type: 'string | { size?: string storageClass?: string } | false',
        required: false,
        default: "'1Gi'",
        description:
          'Synapse signing-key/data storage: a persistent PVC (<name>-synapse-keys) mounted writable at /data. The signing key is the server identity — it must survive restarts; the pid file rides along. Media has its own dedicated volume (mediaStorage). false = you manage /data yourself.',
      },
      {
        name: 'mediaStorage',
        type: 'string | { size?: string storageClass?: string } | false',
        required: false,
        default: "'20Gi'",
        description:
          "Synapse media-repository storage: a dedicated PVC (<name>-synapse-media) mounted at /data/media_store. Media is the large-growing data of a Matrix server and must not share the small keys volume. homeserver.yaml pins media_store_path to /data/media_store (synapse's /media_store default PermissionErrors on read-only root fs). false = you manage /data/media_store yourself.",
      },
      {
        name: 'rtc',
        type: '{ enabled?: boolean manualIP?: string turnPort?: number stunServers?: string[] sfuVersion?: string }',
        required: false,
        description:
          'LiveKit SFU for Element Call. Renders a combined LoadBalancer service (numeric UDP targetPort 30002 — upstream chart bug workaround). Disable for text-only deployments.',
      },
      {
        name: 'appservices',
        type: '({ name: string; registration: Record<string, unknown> } | { name: string; secretRef: string; key?: string })[]',
        required: false,
        description:
          'Appservice registrations (hookshot, bots). Inline registration renders as a Secret (never ConfigMap — use token placeholders or expect the guardrail to flag live values); secretRef mounts an existing Secret holding registration.yaml.',
      },
      {
        name: 'version',
        type: '{ synapse?: string mas?: string web?: string admin?: string sfu?: string }',
        required: false,
        description:
          "Per-component image tags. Defaults are pinned for known upstream regressions (web v1.12.15 / sfu v1.10.1 / mas 1.24.0 / admin 0.1.13 from oci.element.io — the ghcr repo no longer serves anonymous pulls); floating 'latest' is rejected for mas and admin.",
      },
      {
        name: 'urlPreview',
        type: 'boolean',
        required: false,
        description:
          'Set false to disable the SSRF-hardened url_preview_ip_range_blacklist preset (default: enabled)',
      },
    ],
    example:
      "import { Platform } from '@r8s/recipes'\nimport { Matrix } from '@r8s/matrix'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Matrix\n      domain=\"example.com\"\n      sso={{\n        issuer: 'https://keycloak.example.com/realms/berget',\n        clientId: 'matrix',\n      }}\n      database={{\n        backup: {\n          destinationPath: 's3://backups/matrix-cnpg',\n          endpointURL: 'https://s3.example.com',\n        },\n      }}\n    />\n  </Platform>\n)",
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

// Single source of truth: the generated registry (operators.yaml →
// @r8s/crds operatorMetadata). This list stops drifting from reality.
export const operators: OperatorInfo[] = operatorMetadata.map((meta) => ({
  name: meta.name,
  description: meta.description,
  category: meta.category,
  crds: meta.crds,
}))

export function allComponents(): ComponentInfo[] {
  return [...components, ...authComponents]
}

export function findComponent(name: string): ComponentInfo | undefined {
  return allComponents().find((c) => c.name.toLowerCase() === name.toLowerCase())
}
