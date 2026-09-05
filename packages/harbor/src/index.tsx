import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  StaticSecret,
  canProvisionSecrets,
  secretsRequiredError,
  type DatabaseProps,
} from '@r8s/recipes'

export interface HarborProps {
  /** Release / chart name (defaults to 'harbor') */
  name?: string
  /** Kubernetes namespace for the release + data (inherited from <Platform> unless set) */
  namespace?: string
  /** Public registry hostname (required), e.g. 'registry.berget.ai' */
  host: string
  /**
   * Harbor chart version (defaults to the pinned '1.18.3'). Flux applies
   * chart upgrades automatically on the repo interval — bump deliberately.
   */
  chartVersion?: string
  /** HelmRepository URL (defaults to https://helm.goharbor.io) */
  repoUrl?: string
  /** Namespace the HelmRepository lives in (defaults to 'flux-system') */
  repoNamespace?: string
  /**
   * S3 (RustFS-compatible) registry blob storage — required. The Docker
   * registry protocol cannot follow S3 307 redirects: `disableredirect`
   * and path-style access (`VIRTUAL_HOSTED_STYLE=false`) are encoded
   * unconditionally, and the credentials bundle carries both the
   * `REGISTRY_STORAGE_S3_*` and `AWS_*` key aliases the chart/registry
   * each read. Credentials are provisioned through the Platform secrets
   * backend unless `credentialsSecret` references a pre-created Secret.
   */
  s3: {
    bucket: string
    region: string
    endpoint: string
    /** Backend path (defaults to `<provider.path>/<name>`) */
    path?: string
    /** Reference a pre-created credentials Secret instead of provisioning */
    credentialsSecret?: string
  }
  /**
   * CNPG cluster name (defaults to 'harbor-db'). The bootstrap database
   * is 'registry' owned by 'harbor' — chart `existingSecret` gets the
   * CNPG-managed `<db>-app` secret (credentialsMode 'cnpg').
   */
  dbName?: string
  /** Number of CNPG instances (defaults to 2) */
  dbInstances?: number
  /** CNPG data volume size (defaults to '40Gi' — registry metadata grows with blob count) */
  dbStorage?: string
  /** CNPG storage class (defaults to cluster default) */
  dbStorageClass?: string
  /**
   * CNPG backup configuration. Credential provisioning differs from the
   * Database recipe default: the store holds keys `accesskey`/`secretkey`
   * which the bundled remap turns into the CNPG-required
   * `access-key-id`/`secret-access-key` — path defaults to
   * `<provider.path>/berget-internal-cnpg` (facit). Set
   * `credentialsSecret` to reference an existing, correctly-keyed Secret
   * instead.
   */
  backup?: Omit<DatabaseProps['backup'], 'credentialsSecret'> & {
    credentialsSecret?: string
    /** Backend path for the remapped backup creds (defaults to `<provider.path>/berget-internal-cnpg`) */
    credentialsPath?: string
  }
  /** Reference a pre-created admin password Secret (key: HARBOR_ADMIN_PASSWORD) instead of provisioning */
  adminPasswordSecretRef?: string
  /**
   * Reference a pre-created HTTP secret-key bundle (key: secretKey,
   * EXACTLY 16 chars) instead of provisioning. The chart rejects
   * other lengths — keep the constraint when generating.
   */
  secretKeySecretRef?: string
  /**
   * OIDC client credentials for Keycloak login. NOTE: Harbor has no
   * declarative OIDC — provisioning this Secret is preparatory; apply the
   * actual OIDC configuration via the Harbor UI/API after deploy.
   */
  oidc?: { path?: string }
  /** Reference a pre-created OIDC Secret (keys: oidc-client-id, oidc-client-secret) */
  oidcSecretRef?: string
  /** Scanner (trivy) settings — enabled by default with facit resources */
  trivy?: {
    enabled?: boolean
    resources?: {
      requests?: { cpu?: string; memory?: string }
      limits?: { cpu?: string; memory?: string }
    }
  }
  /** Metrics: /metrics on port 8001 for core/registry/jobservice/exporter. `serviceMonitor` stays OFF — the cluster has no Prometheus CRDs. */
  metrics?: { enabled?: boolean; serviceMonitor?: boolean }
  /** TLS secret for the chart ingress (defaults to `harbor-tls` via letsencrypt-prod) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Harbor — OCI artifact registry, facit-aligned via the official chart.
 *
 * @title Harbor
 * @category Security & Identity
 *
 * The chart owns all app workloads (core/portal/registry/jobservice/redis/
 * trivy/nginx ingress). This package owns the platform contract around it:
 * - Flux `HelmRepository` + `HelmRelease` (pinned chart, facit values)
 * - external CNPG cluster (`credentialsMode: 'cnpg'`; `<db>-app` secret is
 *   the chart's `existingSecret`) + optional scheduled backups
 * - S3 blob-storage credentials bundle with REGISTRY_STORAGE_S3_* + AWS_*
 *   aliases, literal endpoint + path-style keys (RustFS trap: the registry
 *   protocol cannot follow 307 redirects)
 * - admin/secret-key/(optional) OIDC bundles via the Platform secrets
 *   backend
 *
 * Encoded traps (learned from incidents — do not "fix" these):
 * - `database.external.port` is the QUOTED STRING "5432" (chart bug)
 * - ingress `proxy-body-size: "0"` — unlimited, large image layers
 * - `updateStrategy.type: Recreate` — RWO jobLog PVC deadlocks rolling updates
 * - `metrics.serviceMonitor.enabled: false` — no Prometheus CRDs on-cluster
 * - OIDC is a manual post-deploy step; no declarative alternative exists
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Harbor } from '@r8s/harbor'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'rustfs' }}>
 *     <Harbor
 *       host="registry.example.com"
 *       s3={{ bucket: 'harbor-registry', region: 'berget-cloud', endpoint: 'https://s3.example.com' }}
 *     />
 *   </Platform>
 * )
 */
export function Harbor(props: HarborProps) {
  const {
    name = 'harbor',
    namespace: namespaceProp,
    host,
    chartVersion = '1.18.3',
    repoUrl = 'https://helm.goharbor.io',
    repoNamespace = 'flux-system',
    s3,
    dbName = 'harbor-db',
    dbInstances = 2,
    dbStorage = '40Gi',
    dbStorageClass,
    backup,
    adminPasswordSecretRef,
    secretKeySecretRef,
    oidc,
    oidcSecretRef,
    trivy,
    metrics,
    tls = { secretName: 'harbor-tls', clusterIssuer: 'letsencrypt-prod' },
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  // --- S3 credentials bundle (chart + registry read DIFFERENT key sets) ------
  const s3CredentialsName = s3.credentialsSecret ?? `${name}-s3-credentials`
  if (!s3.credentialsSecret) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Harbor',
        name,
        'S3 credentials for registry blob storage (keys accesskey/secretkey in the store)',
        {
          propName: 's3.credentialsSecret',
          exampleValue: `${name}-s3-credentials`,
          keys: ['REGISTRY_STORAGE_S3_ACCESSKEY', 'REGISTRY_STORAGE_S3_SECRETKEY'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-rustfs-s3-credentials`,
        namespace,
        path: s3.path ?? `${secretProvider.path ?? 'rustfs'}/${name}`,
        secretName: s3CredentialsName,
        // Chart needs REGISTRY_STORAGE_S3_*; registry tooling needs AWS_* —
        // both map from the same store keys; endpoint + path-style are
        // LITERAL templates (RustFS: no 307 redirects, no vhost buckets)
        keys: {
          REGISTRY_STORAGE_S3_ACCESSKEY: 'accesskey',
          REGISTRY_STORAGE_S3_SECRETKEY: 'secretkey',
          AWS_ACCESS_KEY_ID: 'accesskey',
          AWS_SECRET_ACCESS_KEY: 'secretkey',
        },
        templates: {
          AWS_ENDPOINTS: s3.endpoint,
          VIRTUAL_HOSTED_STYLE: 'false',
        },
        refreshAfter: '3600s',
      })
    )
  }

  // --- Admin + http secret key -------------------------------------------------
  const adminSecretName = adminPasswordSecretRef ?? `${name}-admin-secret`
  if (!adminPasswordSecretRef) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError('Harbor', name, 'an admin password (key HARBOR_ADMIN_PASSWORD)', {
        propName: 'adminPasswordSecretRef',
        exampleValue: `${name}-admin-secret`,
        keys: ['HARBOR_ADMIN_PASSWORD'],
      })
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-admin-secret`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/admin`,
        secretName: adminSecretName,
        keys: ['HARBOR_ADMIN_PASSWORD'],
      })
    )
  }

  const secretKeySecretName = secretKeySecretRef ?? `${name}-secret`
  if (!secretKeySecretRef) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Harbor',
        name,
        'an HTTP secret key (key secretKey — EXACTLY 16 chars, the chart rejects other lengths)',
        {
          propName: 'secretKeySecretRef',
          exampleValue: `${name}-secret`,
          keys: ['secretKey'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-secret`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/secret`,
        secretName: secretKeySecretName,
        keys: ['secretKey'],
      })
    )
  }

  // --- OIDC bundle (manual post-deploy config on the Harbor side) -------------
  if (oidc && !oidcSecretRef) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Harbor',
        name,
        'OIDC client credentials because oidc is requested (keys oidc-client-id/oidc-client-secret)',
        {
          propName: 'oidcSecretRef',
          exampleValue: `${name}-keycloak-oidc`,
          keys: ['oidc-client-id', 'oidc-client-secret'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-keycloak-oidc`,
        namespace,
        path: oidc.path ?? `${secretProvider.path ?? name}/${name}/keycloak-oidc`,
        secretName: `${name}-keycloak-oidc`,
        keys: ['oidc-client-id', 'oidc-client-secret'],
      })
    )
  }

  // --- CNPG cluster (CNPG-managed credentials: the chart's existingSecret) -----
  resources_.push(
    jsx(Database, {
      backup: false,name: dbName,
      namespace,
      database: 'registry',
      owner: 'harbor',
      instances: dbInstances,
      storage: dbStorage,
      ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
      parameters: {
        shared_buffers: '256MB',
        max_connections: '200',
        work_mem: '8MB',
        maintenance_work_mem: '128MB',
        effective_cache_size: '768MB',
      },
      credentialsMode: 'cnpg',
      ...(backup
        ? {
            backup: {
              ...backup,
              // Explicit reference wins; otherwise the package provisions
              // the remapped bundle below
              credentialsSecret: backup.credentialsSecret ?? `${name}-cnpg-backup`,
            },
          }
        : {}),
    })
  )

  if (backup && !backup.credentialsSecret) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Harbor',
        name,
        'backup credentials (store keys accesskey/secretkey → CNPG access-key-id/secret-access-key)',
        {
          propName: 'backup.credentialsSecret',
          exampleValue: `${name}-cnpg-backup`,
          keys: ['access-key-id', 'secret-access-key'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-cnpg-backup`,
        namespace,
        path: backup.credentialsPath ?? `${secretProvider.path}/berget-internal-cnpg`,
        secretName: `${name}-cnpg-backup`,
        // The store uses camelCase keys; CNPG requires kebab-case
        keys: { 'access-key-id': 'accesskey', 'secret-access-key': 'secretkey' },
        refreshAfter: '3600s',
        // No restart targets — barman reads credentials per backup run
      })
    )
  }

  // --- Flux: HelmRepository + HelmRelease (facit values, traps encoded) --------
  resources_.push(
    jsx('HelmRepository', {
      apiVersion: 'source.toolkit.fluxcd.io/v1',
      kind: 'HelmRepository',
      metadata: { name, namespace: repoNamespace },
      spec: { interval: '24h', url: repoUrl },
    }),
    jsx('HelmRelease', {
      apiVersion: 'helm.toolkit.fluxcd.io/v2',
      kind: 'HelmRelease',
      metadata: { name, namespace },
      spec: {
        interval: '30m',
        chart: {
          spec: {
            chart: 'harbor',
            version: chartVersion,
            sourceRef: { kind: 'HelmRepository', name, namespace: repoNamespace },
            interval: '12h',
          },
        },
        values: {
          externalURL: `https://${host}`,
          expose: {
            type: 'ingress',
            tls: { enabled: true, certSource: 'secret', secret: { secretName: tls.secretName } },
            ingress: {
              hosts: { core: host },
              className: 'nginx',
              annotations: {
                'cert-manager.io/cluster-issuer': tls.clusterIssuer,
                'external-dns.alpha.kubernetes.io/hostname': host,
                'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
                // TRAP: "0" = unlimited — large image layers; any size
                // limit breaks `docker push` with 413
                'nginx.ingress.kubernetes.io/proxy-body-size': '0',
              },
            },
          },
          existingSecretAdminPassword: adminSecretName,
          existingSecretAdminPasswordKey: 'HARBOR_ADMIN_PASSWORD',
          existingSecretSecretKey: secretKeySecretName,
          persistence: {
            enabled: true,
            resourcePolicy: 'keep',
            imageChartStorage: {
              type: 's3',
              // TRAP: the registry protocol cannot follow S3 307 redirects —
              // stream blobs server-side (RustFS requirement)
              disableredirect: true,
              s3: {
                region: s3.region,
                bucket: s3.bucket,
                regionendpoint: s3.endpoint,
                secure: true,
                v4auth: true,
                existingSecret: s3CredentialsName,
              },
            },
            // PVCs only for jobLog/redis/trivy — registry blobs live in S3,
            // database lives in CNPG (by design)
            persistentVolumeClaim: {
              jobservice: {
                jobLog: {
                  size: '5Gi',
                  ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
                },
              },
              redis: { size: '2Gi', ...(dbStorageClass ? { storageClass: dbStorageClass } : {}) },
              trivy: { size: '10Gi', ...(dbStorageClass ? { storageClass: dbStorageClass } : {}) },
            },
          },
          database: {
            type: 'external',
            external: {
              host: `${dbName}-rw`,
              // TRAP: must be a QUOTED string — numeric breaks the chart
              // template (renders unquoted)
              port: String(5432),
              username: 'harbor',
              password: '',
              coreDatabase: 'registry',
              existingSecret: `${dbName}-app`,
              sslmode: 'disable',
            },
          },
          redis: { type: 'internal' },
          core: { replicas: 1 },
          portal: { replicas: 1 },
          registry: { replicas: 1 },
          jobservice: { replicas: 1 },
          // TRAP: RWO jobLog PVC deadlocks rolling updates on multi-node
          updateStrategy: { type: 'Recreate' },
          trivy: {
            enabled: trivy?.enabled !== false,
            replicas: 1,
            resources: trivy?.resources ?? {
              requests: { cpu: '200m', memory: '512Mi' },
              limits: { cpu: '1', memory: '1Gi' },
            },
          },
          metrics: {
            enabled: metrics?.enabled !== false,
            core: { path: '/metrics', port: 8001 },
            registry: { path: '/metrics', port: 8001 },
            jobservice: { path: '/metrics', port: 8001 },
            exporter: { path: '/metrics', port: 8001 },
            // TRAP: Prometheus CRDs (ServiceMonitor) are absent on-cluster
            serviceMonitor: { enabled: metrics?.serviceMonitor === true },
          },
          ipFamily: 'ipv4',
          logLevel: 'info',
        },
      },
    })
  )

  return jsx(Fragment, { children: resources_ })
}
