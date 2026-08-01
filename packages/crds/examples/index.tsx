/**
 * Hand-written examples for @r8s/crds components.
 *
 * Each file exports named examples as TSX strings. The docs generator
 * reads these and renders them to YAML for display on the package page.
 *
 * Convention: one file per API group, named to match the generated
 * group file (e.g. postgresql.ts → examples/postgresql.tsx).
 *
 * Example names should be descriptive: `basicCluster`, `withBackup`, etc.
 * These become the labels shown on the docs page.
 */

export const postgresqlExamples = {
  basicCluster: `
import { ClusterComponent } from '@r8s/crds/postgresql'

<ClusterComponent
  metadata={{ name: 'app-db', namespace: 'default' }}
  spec={{
    instances: 3,
    storage: { size: '10Gi' },
    bootstrap: { initdb: { database: 'app' } },
  }}
/>
`,

  withBackup: `
import { ClusterComponent, ScheduledBackupComponent } from '@r8s/crds/postgresql'

<>
  <ClusterComponent
    metadata={{ name: 'prod-db', namespace: 'default' }}
    spec={{
      instances: 3,
      storage: { size: '50Gi' },
      bootstrap: { initdb: { database: 'app' } },
      backup: { barmanObjectStore: { destinationPath: 's3://backups/' } },
    }}
  />
  <ScheduledBackupComponent
    metadata={{ name: 'prod-db-backup', namespace: 'default' }}
    spec={{
      schedule: '0 2 * * *',
      cluster: { name: 'prod-db' },
    }}
  />
</>
`,

  withPooler: `
import { ClusterComponent, PoolerComponent } from '@r8s/crds/postgresql'

<>
  <ClusterComponent
    metadata={{ name: 'app-db', namespace: 'default' }}
    spec={{
      instances: 3,
      storage: { size: '10Gi' },
      bootstrap: { initdb: { database: 'app' } },
    }}
  />
  <PoolerComponent
    metadata={{ name: 'app-db-pooler', namespace: 'default' }}
    spec={{
      cluster: { name: 'app-db' },
      instances: 2,
      type: 'rw',
      pgbouncer: { poolMode: 'transaction' },
    }}
  />
</>
`,
}

export const certManagerExamples = {
  certificate: `
import { CertificateComponent } from '@r8s/crds/cert-manager'

<CertificateComponent
  metadata={{ name: 'app-tls', namespace: 'default' }}
  spec={{
    secretName: 'app-tls',
    dnsNames: ['app.example.com'],
    issuerRef: { name: 'letsencrypt-prod', kind: 'ClusterIssuer' },
  }}
/>
`,

  clusterIssuer: `
import { ClusterIssuerComponent } from '@r8s/crds/cert-manager'

<ClusterIssuerComponent
  metadata={{ name: 'letsencrypt-prod' }}
  spec={{
    acme: {
      server: 'https://acme-v02.api.letsencrypt.org/directory',
      email: 'admin@example.com',
      privateKeySecretRef: { name: 'letsencrypt-prod-key' },
      solvers: [{ http01: { ingress: { class: 'nginx' } } }],
    },
  }}
/>
`,
}

export const gatewayExamples = {
  gateway: `
import { GatewayComponent } from '@r8s/crds/gateway'

<GatewayComponent
  metadata={{ name: 'public-gateway', namespace: 'envoy-gateway-system' }}
  spec={{
    gatewayClassName: 'eg',
    listeners: [
      { name: 'https', protocol: 'HTTPS', port: 443, hostname: 'api.example.com' },
    ],
  }}
/>
`,

  httpRoute: `
import { HTTPRouteComponent } from '@r8s/crds/gateway'

<HTTPRouteComponent
  metadata={{ name: 'api-route', namespace: 'default' }}
  spec={{
    parentRefs: [{ name: 'public-gateway', namespace: 'envoy-gateway-system' }],
    hostnames: ['api.example.com'],
    rules: [{ backendRefs: [{ name: 'api', port: 80 }] }],
  }}
/>
`,
}

export const redisExamples = {
  cluster: `
import { RedisClusterComponent } from '@r8s/crds/redis'

<RedisClusterComponent
  metadata={{ name: 'cache', namespace: 'default' }}
  spec={{
    size: 3,
    kubernetesConfig: { image: 'quay.io/opstree/redis:v7.0.12' },
    storage: { volumeClaimTemplate: { spec: { resources: { requests: { storage: '5Gi' } } } } },
  }}
/>
`,
}

export const veleroExamples = {
  backup: `
import { BackupComponent } from '@r8s/crds/velero'

<BackupComponent
  metadata={{ name: 'app-backup', namespace: 'velero' }}
  spec={{
    includedNamespaces: ['default', 'production'],
    storageLocation: 'default',
  }}
/>
`,

  schedule: `
import { ScheduleComponent } from '@r8s/crds/velero'

<ScheduleComponent
  metadata={{ name: 'daily-backup', namespace: 'velero' }}
  spec={{
    schedule: '0 2 * * *',
    template: {
      includedNamespaces: ['default'],
      storageLocation: 'default',
    },
  }}
/>
`,
}

export const monitoringExamples = {
  serviceMonitor: `
import { ServiceMonitorComponent } from '@r8s/crds/monitoring'

<ServiceMonitorComponent
  metadata={{ name: 'app-monitor', namespace: 'default', labels: { app: 'api' } }}
  spec={{
    selector: { matchLabels: { app: 'api' } },
    endpoints: [{ port: 'metrics', path: '/metrics', interval: '30s' }],
  }}
/>
`,
}

export const keycloakExamples = {
  keycloak: `
import { KeycloakComponent } from '@r8s/crds/keycloak'

<KeycloakComponent
  metadata={{ name: 'keycloak', namespace: 'default' }}
  spec={{
    instances: 1,
    hostname: { hostname: 'auth.example.com' },
    proxy: { headers: 'xforwarded' },
  }}
/>
`,
}

export const externaldnsExamples = {
  dnsEndpoint: `
import { DNSEndpointComponent } from '@r8s/crds/externaldns'

<DNSEndpointComponent
  metadata={{ name: 'app-dns', namespace: 'default' }}
  spec={{
    endpoints: [
      { dnsName: 'app.example.com', recordType: 'A', targets: ['10.0.0.1'], recordTTL: 300 },
    ],
  }}
/>
`,
}
