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
          'Number of replicas. Safe to scale beyond 1 when `objectStorage` is configured (file blobs live in S3) and `cache` is enabled — Nextcloud becomes effectively stateless. Requires a StorageClass with ReadWriteMany support for the /var/www/html claim.',
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
        type: "{ /** S3 host WITHOUT protocol/scheme, e.g. s3.internal.example.com */ endpoint: string /** Bucket used for user files */ bucket: string /** Name of the Secret holding accessKey / secretKey */ credentialsSecret: string /** Region string for the S3 client (defaults to 'us-east-1') */ region?: string /** TCP port of the S3 endpoint (defaults to the provider default, typically 443) */ port?: number /** Use TLS against the S3 endpoint (default: true) */ ssl?: boolean }",
        required: false,
        description:
          'S3-compatible object storage used as primary storage for files (RustFS in the platform). Reference a bucket whose credentials live in a Secret provisioned by the secrets backend (keys: accessKey, secretKey) — never plaintext.',
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
      "import { Platform } from '@r8s/recipes'\nimport { Nextcloud } from '@r8s/nextcloud'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Nextcloud\n      name=\"cloud\"\n      host=\"cloud.example.com\"\n      objectStorage={{\n        endpoint: 's3.internal.example.com',\n        bucket: 'cloud-files',\n        credentialsSecret: 'cloud-files-credentials',\n      }}\n    />\n  </Platform>\n)",
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
        type: "{ /** S3 endpoint URL, e.g. https://s3.internal.example.com */ endpoint: string /** Bucket name for attachments */ bucket: string /** Name of the Secret holding accessKey / secretKey */ credentialsSecret: string /** Region string for Outline's S3 client (defaults to 'us-east-1') */ region?: string }",
        required: false,
        description:
          'S3-compatible object storage for attachments (RustFS in the platform). Reference a bucket whose credentials live in a Secret provisioned by the secrets backend (keys: accessKey, secretKey) — never plaintext.',
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
      "import { Platform } from '@r8s/recipes'\nimport { Outline } from '@r8s/outline'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Outline\n      name=\"wiki\"\n      host=\"wiki.example.com\"\n      objectStorage={{\n        endpoint: 'https://s3.internal.example.com',\n        bucket: 'wiki-attachments',\n        credentialsSecret: 'wiki-attachments-credentials',\n      }}\n      sso={{\n        issuer: 'https://keycloak.example.com/realms/platform',\n        clientId: 'outline',\n        clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },\n      }}\n    />\n  </Platform>\n)",
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
          'Render the Storage API service (defaults to true). Set false to run a minimal auth + REST-only Supabase. The S3 objectStorage prop is always required so a bucket is declared for the platform.',
      },
      {
        name: 'objectStorage',
        type: '{ /** S3 endpoint URL, e.g. https://s3.internal.example.com */ endpoint: string /** Bucket for uploads and stored files */ bucket: string /** Name of the Secret holding accessKey / secretKey */ credentialsSecret: string }',
        required: true,
        description:
          'S3-compatible object storage for the Storage API (RustFS in the platform). Reference a bucket whose credentials live in a Secret provisioned by the secrets backend (keys: accessKey, secretKey) — never plaintext.',
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
      "import { Platform } from '@r8s/recipes'\nimport { Supabase } from '@r8s/supabase'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Supabase\n      name=\"backend\"\n      host=\"backend.example.com\"\n      objectStorage={{\n        endpoint: 'https://s3.internal.example.com',\n        bucket: 'backend-uploads',\n        credentialsSecret: 'backend-object-store-credentials',\n      }}\n    />\n  </Platform>\n)",
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
    category: 'Collaboration & Productivity',
    description:
      'EuroOffice collaborative document suite — Postgres persistence, S3 blob storage, LibreOffice conversions, SMTP delivery and websocket collaboration',
    props: [
      {
        name: 'name',
        type: 'string',
        required: false,
        description: "Resource name (defaults to 'eurooffice')",
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
        description: 'Public hostname for the document suite (required)',
      },
      {
        name: 'replicas',
        type: 'number',
        required: false,
        description:
          'Number of app replicas. With `websockets` enabled (the default) this defaults to **1**: websocket sessions are pinned to the pod that accepted the connection and the workload has no session affinity, so >1 replicas means collaborators on different pods stop seeing each other live. An explicitly set `replicas` is rendered as asked — pair it with a sticky-session (source-IP) ingress strategy for live co-editing. With `websockets: false` the default is 2 (the app is stateless — scale freely).',
      },
      {
        name: 'websockets',
        type: 'boolean',
        required: false,
        description:
          'Collaborative editing over websockets (default: true). Disable only for single-user or read-only deployments — document presence, cursor sharing and live co-editing all rely on websockets.',
      },
      {
        name: 'objectStorage',
        type: "{ /** S3 endpoint URL, e.g. https://s3.internal.example.com */ endpoint: string /** Bucket name for document blobs */ bucket: string /** Name of the Secret holding accessKey / secretKey */ credentialsSecret: string /** Region string for the S3 client (defaults to 'us-east-1') */ region?: string }",
        required: true,
        description:
          'S3-compatible object storage for document blobs and attachments (RustFS in the platform). Required — reference a bucket whose credentials live in a Secret provisioned by the secrets backend (keys: accessKey, secretKey) — never plaintext.',
      },
      {
        name: 'smtp',
        type: '{ /** SMTP server hostname, e.g. smtp.example.com */ host: string /** SMTP port (defaults to 587) */ port?: number /** From address for outgoing mail, e.g. no-reply@example.com */ from?: string }',
        required: false,
        description:
          'Outgoing SMTP for invitations and notifications. The SMTP password is delivered via secretKeyRef from the `${name}-secrets` bundle (key: smtpPassword) — never plaintext.',
      },
      {
        name: 'conversions',
        type: 'boolean',
        required: false,
        description:
          'LibreOffice headless document-conversion workers (same app image, which must include soffice). Adds a `${name}-soffice` Deployment + Service; the app reaches it at SOFFICE_HOST:SOFFICE_PORT. Workers serve the UNO socket (TCP), not HTTP — their probes probe the socket.',
      },
      {
        name: 'conversionWorkers',
        type: 'number',
        required: false,
        description:
          'LibreOffice conversion worker replicas (defaults to 1, only used with conversions)',
      },
      {
        name: 'secretsName',
        type: 'string',
        required: false,
        description:
          'Name of an existing Secret holding `secretKey` and `smtpPassword`. Required unless a secrets backend (openbao/vault) is configured on the surrounding Platform — the backend then provisions them. Plaintext values are not supported.',
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
      "import { Platform } from '@r8s/recipes'\nimport { EuroOffice } from '@r8s/eurooffice'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <EuroOffice\n      name=\"docs\"\n      host=\"docs.example.com\"\n      objectStorage={{\n        endpoint: 'https://s3.internal.example.com',\n        bucket: 'docs-blobs',\n        credentialsSecret: 'docs-blobs-credentials',\n      }}\n      smtp={{ host: 'smtp.example.com', port: 587, from: 'no-reply@${env:MAIL_DOMAIN}' }}\n    />\n  </Platform>\n)",
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
        type: "{ /** S3 endpoint URL, e.g. https://s3.internal.example.com */ endpoint: string /** Bucket holding document corpora */ bucket: string /** Name of the Secret holding accessKey / secretKey */ credentialsSecret: string /** Region string for the S3 client (defaults to 'us-east-1') */ region?: string }",
        required: true,
        description:
          'S3-compatible object storage for document corpora (RustFS in the platform). Required. Reference a bucket whose credentials live in a Secret provisioned by the secrets backend (keys: accessKey, secretKey) — never plaintext.',
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
      "import { Platform } from '@r8s/recipes'\nimport { Eneo } from '@r8s/eneo'\n\nexport default (\n  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n    <Eneo\n      name=\"eneo\"\n      host=\"eneo.example.com\"\n      objectStorage={{\n        endpoint: 'https://s3.internal.example.com',\n        bucket: 'eneo-corpora',\n        credentialsSecret: 'eneo-object-storage',\n      }}\n    />\n  </Platform>\n)",
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
        type: '{ issuer: string clientId: string clientSecretRef?: SecretRef }',
        required: false,
        description:
          'OIDC SSO upstream for MAS (Keycloak from the Auth recipe). Disables local password login when set. Requires a secrets backend or clientSecretRef — never inline secrets.',
      },
      {
        name: 'database',
        type: '{ instances?: number storage?: string backup?: { destinationPath: string endpointURL: string credentialsSecret?: string } }',
        required: false,
        description:
          'Per-database sizing for the two CNPG clusters (synapse-db, mas-db). Backup is explicit opt-in: barman object store with 30d retention + ScheduledBackup.',
      },
      {
        name: 'rtc',
        type: '{ enabled?: boolean manualIP?: string }',
        required: false,
        description:
          'LiveKit SFU for Element Call. Renders a combined LoadBalancer service (numeric UDP targetPort 30002 — upstream chart bug workaround). Disable for text-only deployments.',
      },
      {
        name: 'appservices',
        type: '{ name: string registration: Record<string, unknown> }[]',
        required: false,
        description:
          'Appservice registrations (hookshot, bots). Each becomes a ConfigMap with registration.yaml mounted into Synapse.',
      },
      {
        name: 'version',
        type: '{ synapse?: string mas?: string web?: string admin?: string sfu?: string }',
        required: false,
        description:
          'Per-component image tags. Defaults are pinned for known upstream regressions (web v1.12.15 / sfu v1.10.1) — override only with intent.',
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
