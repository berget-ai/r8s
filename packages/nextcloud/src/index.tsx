import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import type { Deployment, EnvVar, PersistentVolumeClaim, Service } from '@r8s/k8s-types'
import { OperatorContext, SecretContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database, Endpoint } from '@r8s/recipes'
import { RedisReplicationComponent } from '@r8s/crds/redis'
import type { SecretRef } from '@r8s/recipes'

export interface NextcloudProps {
  /** Resource name (defaults to 'nextcloud') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to '31-apache' — pin a version in production) */
  version?: string
  /** Public hostname for the web UI and WebDAV (required) */
  host: string
  /**
   * Number of replicas. Safe to scale beyond 1 when `objectStorage` is
   * configured (file blobs live in S3) and `cache` is enabled — Nextcloud
   * becomes effectively stateless. Requires a StorageClass with
   * ReadWriteMany support for the /var/www/html claim.
   */
  replicas?: number
  /** Provision a Redis replication set for file locking and caching (default: true) */
  cache?: boolean
  /**
   * Size of the PersistentVolumeClaim backing /var/www/html (defaults to
   * '10Gi'). Apps, config and the data directory all live in this tree.
   */
  storage?: string
  /**
   * StorageClass for the /var/www/html PersistentVolumeClaim. Must provide
   * ReadWriteMany when `replicas` > 1 (e.g. NFS or EFS). Defaults to the
   * cluster default StorageClass when omitted.
   */
  storageClassName?: string
  /**
   * S3-compatible object storage used as primary storage for files
   * (RustFS in the platform). Reference a bucket whose credentials live
   * in a Secret provisioned by the secrets backend (keys: accessKey,
   * secretKey) — never plaintext.
   */
  objectStorage?: {
    /** S3 host WITHOUT protocol/scheme, e.g. s3.internal.example.com */
    endpoint: string
    /** Bucket used for user files */
    bucket: string
    /** Name of the Secret holding accessKey / secretKey */
    credentialsSecret: string
    /** Region string for the S3 client (defaults to 'us-east-1') */
    region?: string
    /** TCP port of the S3 endpoint (defaults to the provider default, typically 443) */
    port?: number
    /** Use TLS against the S3 endpoint (default: true) */
    ssl?: boolean
  }
  /**
   * Name of an existing Secret holding the Nextcloud app secrets
   * (key: adminPassword). Required unless a secrets backend
   * (openbao/vault) is configured on the surrounding Platform — the
   * backend then provisions them automatically. Plaintext admin
   * passwords are not supported.
   */
  secretsName?: string
  /** Requested resources */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

const OPERATOR_REDIS = 'redis-operator'
const HTML_MOUNT = '/var/www/html'
const STATUS_PATH = '/status.php'

/**
 * Nextcloud — self-hosted file cloud with Postgres, Redis, S3 primary
 * storage and background cron jobs.
 *
 * @title Nextcloud
 * @category File & Collaboration
 *
 * Composes:
 * - CNPG Postgres cluster (file index, shares, user data)
 * - Redis replication set for file locking and caching (default on)
 * - PersistentVolumeClaim backing /var/www/html (ReadWriteMany)
 * - Nextcloud Deployment + Service + Endpoint (nextcloud:31-apache,
 *   probed via /status.php)
 * - CronJob running `php -f /var/www/html/cron.php` every 5 minutes on
 *   the same claim (concurrency forbidden)
 * - S3/RustFS bucket reference for primary file storage
 * - Admin bootstrap password provisioned by the Platform secrets
 *   backend (openbao / vault), or referenced from an existing Secret
 *
 * The main app is a raw Deployment (not WebService) because Nextcloud
 * needs the /var/www/html claim volume-mounted; the CronJob shares the
 * same claim so background jobs operate on the live data tree.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Nextcloud } from '@r8s/nextcloud'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Nextcloud
 *       name="cloud"
 *       host="cloud.example.com"
 *       objectStorage={{
 *         endpoint: 's3.internal.example.com',
 *         bucket: 'cloud-files',
 *         credentialsSecret: 'cloud-files-credentials',
 *       }}
 *     />
 *   </Platform>
 * )
 * @example
 * import { Nextcloud } from '@r8s/nextcloud'
 *
 * export default (
 *   <Nextcloud
 *     name="cloud"
 *     host="${env:CLOUD_HOST}"
 *     secretsName="cloud-app-secrets"
 *     objectStorage={{
 *       endpoint: '${env:S3_ENDPOINT}',
 *       bucket: 'cloud-files',
 *       credentialsSecret: 'cloud-files-credentials',
 *     }}
 *   />
 * )
 */
export function Nextcloud(props: NextcloudProps) {
  const {
    name = 'nextcloud',
    namespace = 'default',
    version = '31-apache',
    host,
    replicas = 1,
    cache = true,
    storage = '10Gi',
    storageClassName,
    objectStorage,
    secretsName,
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const sharedOperators = useContext(OperatorContext)
  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const dbHost = `${name}-rw`
  const dbCredentialsName = `${name}-db-credentials`
  const appSecretsName = secretsName ?? `${name}-app-secrets`
  const htmlClaim = `${name}-html`
  const image = `nextcloud:${version}`
  const cronSchedule = '*/5 * * * *'

  // --- App secrets provisioning ---------------------------------------------
  // The admin bootstrap password must never be rendered as plaintext. With a
  // secrets backend it is provisioned through the backend (key `adminPassword`);
  // otherwise reference a pre-created Secret.
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Nextcloud "${name}" requires application secrets (NEXTCLOUD_ADMIN_PASSWORD).\n` +
          `\n` +
          `Nextcloud bootstraps its admin account from this password — it must not ` +
          `be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Nextcloud name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (key: adminPassword):\n` +
          `  <Nextcloud name="${name}" host="${host}" secretsName="${name}-app-secrets" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/secrets`,
      destination: { create: true, name: appSecretsName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-secrets`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-secrets`, namespace },
            spec,
          })
    )
  }

  // --- Operators -------------------------------------------------------------
  if (cache && !sharedOperators.some((op) => op.name === OPERATOR_REDIS)) {
    resources_.push(declareOperator(operators[OPERATOR_REDIS]()))
  }

  // Redis — file locking + caching (OT-Container-Kit operator). A
  // RedisReplication (master/replica) is what Nextcloud's locking needs;
  // cluster mode is overkill and the `${name}-redis` service fronts it.
  if (cache) {
    resources_.push(
      RedisReplicationComponent({
        metadata: { name: `${name}-redis`, namespace },
        spec: {
          clusterSize: 3,
          kubernetesConfig: { image: 'redis:7.2-alpine' },
        },
      })
    )
  }

  // --- /var/www/html persistence ----------------------------------------------
  // Apps, config and the data directory live under /var/www/html and must
  // survive pod restarts. ReadWriteMany lets the cron job share the same
  // tree and keeps replicas > 1 viable (requires an RWX StorageClass).
  const htmlPvc: PersistentVolumeClaim = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: { name: htmlClaim, namespace, labels: { app: name } },
    spec: {
      accessModes: ['ReadWriteMany'],
      resources: { requests: { storage } },
      ...(storageClassName && { storageClassName }),
    },
  }
  resources_.push(jsx('PersistentVolumeClaim', htmlPvc))

  // --- Env wiring --------------------------------------------------------------
  // Every credential is referenced with $(VAR) expansion or secretKeyRef —
  // no plaintext in the manifest. Secret-backed vars are declared BEFORE
  // plain env vars so dependent $(VAR) expansion resolves. Nextcloud
  // natively reads POSTGRES_* and OBJECTSTORE_S3_*; the S3 keys/secrets are
  // expanded from the AWS_* secret-backed vars. (Nextcloud ignores
  // DATABASE_URL — do not add it back.)
  const secrets: Record<string, SecretRef | string> = {
    PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
    NEXTCLOUD_ADMIN_PASSWORD: { secret: appSecretsName, key: 'adminPassword' },
    ...(objectStorage
      ? {
          AWS_ACCESS_KEY_ID: { secret: objectStorage.credentialsSecret, key: 'accessKey' },
          AWS_SECRET_ACCESS_KEY: { secret: objectStorage.credentialsSecret, key: 'secretKey' },
        }
      : {}),
  }

  const env: Record<string, string> = {
    POSTGRES_HOST: dbHost,
    POSTGRES_PORT: '5432',
    POSTGRES_DB: name,
    POSTGRES_USER: name,
    POSTGRES_PASSWORD: '$(PGPASSWORD)',
    NEXTCLOUD_ADMIN_USER: 'admin',
    NEXTCLOUD_TRUSTED_DOMAINS: host,
    OVERWRITEHOST: host,
    OVERWRITEPROTOCOL: 'https',
    OVERWRITECLIURL: `https://${host}`,
    ...(cache ? { REDIS_HOST: `${name}-redis`, REDIS_HOST_PORT: '6379' } : {}),
    ...(objectStorage
      ? {
          OBJECTSTORE_S3_HOST: objectStorage.endpoint,
          OBJECTSTORE_S3_BUCKET: objectStorage.bucket,
          OBJECTSTORE_S3_REGION: objectStorage.region ?? 'us-east-1',
          OBJECTSTORE_S3_SSL: (objectStorage.ssl ?? true) ? 'true' : 'false',
          ...(objectStorage.port !== undefined && {
            OBJECTSTORE_S3_PORT: String(objectStorage.port),
          }),
          OBJECTSTORE_S3_USEPATH_STYLE: 'true',
          OBJECTSTORE_S3_AUTOCREATE: 'true',
          OBJECTSTORE_S3_KEY: '$(AWS_ACCESS_KEY_ID)',
          OBJECTSTORE_S3_SECRET: '$(AWS_SECRET_ACCESS_KEY)',
        }
      : {}),
  }

  const envVars: EnvVar[] = Object.entries(secrets).map(([envName, ref]) => ({
    name: envName,
    valueFrom: {
      secretKeyRef:
        typeof ref === 'string'
          ? { name: ref, key: envName }
          : { name: ref.secret, key: ref.key || envName },
    },
  }))
  envVars.push(...Object.entries(env).map(([envName, value]) => ({ name: envName, value })))

  // --- Database (CNPG) + app + endpoint ------------------------------------------
  // <Database> is the parent wrapper so the CNPG operator and the Cluster
  // piggyback on the r8s Database recipe (connect info stays by convention:
  // host `${name}-rw`, secret `${name}-db-credentials` key `password`). The
  // app is a raw Deployment because WebService cannot mount volumes.
  const app: Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name, namespace, labels: { app: name } },
    spec: {
      replicas,
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          containers: [
            {
              name: 'app',
              image,
              imagePullPolicy: 'Always',
              ports: [{ containerPort: 80 }],
              env: envVars,
              resources,
              livenessProbe: {
                httpGet: { path: STATUS_PATH, port: 80 },
                initialDelaySeconds: 30,
                periodSeconds: 10,
              },
              readinessProbe: {
                httpGet: { path: STATUS_PATH, port: 80 },
                initialDelaySeconds: 20,
                periodSeconds: 10,
                failureThreshold: 5,
              },
              volumeMounts: [{ name: 'html', mountPath: HTML_MOUNT }],
            },
          ],
          volumes: [{ name: 'html', persistentVolumeClaim: { claimName: htmlClaim } }],
        },
      },
    },
  }

  const appService: Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name, namespace },
    spec: {
      type: 'ClusterIP',
      selector: { app: name },
      ports: [{ port: 80, targetPort: 80 }],
    },
  }

  resources_.push(
    jsx(Database, {
      backup: false,
      name,
      namespace,
      storage: '10Gi',
      children: jsx(Fragment, {
        children: [jsx('Deployment', app), jsx('Service', appService)],
      }),
    })
  )

  // --- CronJob — background jobs (php -f cron.php) --------------------------------
  // WebService cannot express a separate scheduled workload, so the cron job
  // is a raw CronJob that mounts the SAME `${name}-html` claim and runs the
  // image's own php. It cannot see DatabaseContext: host/user are hardcoded
  // by convention and the DB password arrives via secretKeyRef.
  resources_.push(
    jsx('CronJob', {
      apiVersion: 'batch/v1',
      kind: 'CronJob',
      metadata: { name: `${name}-cron`, namespace },
      spec: {
        schedule: cronSchedule,
        concurrencyPolicy: 'Forbid',
        successfulJobsHistoryLimit: 1,
        failedJobsHistoryLimit: 1,
        jobTemplate: {
          spec: {
            backoffLimit: 2,
            template: {
              metadata: { labels: { app: `${name}-cron` } },
              spec: {
                restartPolicy: 'OnFailure',
                containers: [
                  {
                    name: 'nextcloud-cron',
                    image,
                    command: ['php', '-f', '/var/www/html/cron.php'],
                    env: [
                      { name: 'POSTGRES_HOST', value: dbHost },
                      { name: 'POSTGRES_PORT', value: '5432' },
                      { name: 'POSTGRES_DB', value: name },
                      { name: 'POSTGRES_USER', value: name },
                      {
                        name: 'PGPASSWORD',
                        valueFrom: {
                          secretKeyRef: { name: dbCredentialsName, key: 'password' },
                        },
                      },
                      ...(cache ? [{ name: 'REDIS_HOST', value: `${name}-redis` }] : []),
                    ],
                    resources: {
                      requests: { memory: '128Mi', cpu: '100m' },
                      limits: { memory: '512Mi', cpu: '500m' },
                    },
                    volumeMounts: [{ name: 'html', mountPath: HTML_MOUNT }],
                  },
                ],
                volumes: [{ name: 'html', persistentVolumeClaim: { claimName: htmlClaim } }],
              },
            },
          },
        },
      },
    })
  )

  // --- Endpoint — web UI and WebDAV share the host --------------------------------
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={80}
      tls={tls}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
