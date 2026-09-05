import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  WebService,
  Endpoint,
  StaticSecret,
  useOperators,
  maybeOperator,
  canProvisionSecrets,
  secretsRequiredError,
  type DatabaseProps,
} from '@r8s/recipes'
import type { SecretRef } from '@r8s/recipes'

export interface OutlineProps {
  /** Resource name (defaults to 'outline') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /**
   * Container image tag (defaults to a pinned release — see
   * https://github.com/outline/outline/releases when upgrading).
   */
  version?: string
  /** Public hostname for the wiki */
  host: string
  /** Storage request for the CNPG Postgres cluster (defaults to '20Gi') */
  storage?: string
  /** Number of CNPG instances (defaults to 2 — facit production sizing) */
  instances?: number
  /**
   * CNPG backup configuration passed through to the Database recipe
   * (continuous WAL archiving + scheduled base backups). Attachments
   * durability belongs to the object store (erasure-coded RustFS),
   * NOT to Velero — CNPG barman is the backup path.
   */
  backup?: DatabaseProps['backup']
  /**
   * Number of replicas. Defaults to 1 with strategy Recreate: Outline runs
   * DB migrations at boot and two concurrent migrating pods corrupt state.
   * Scale via WEB_CONCURRENCY inside the pod instead.
   */
  replicas?: number
  /** Provision a standalone Redis (caching + websockets) — default on */
  cache?: boolean
  /** Redis shape (standalone by facit default; opt out with cache: false) */
  redis?: {
    /** Redis image (default 'redis:7.0.12') */
    image?: string
    /** PVC size (default '1Gi') */
    storage?: string
    /** storageClassName (default cluster default) */
    storageClass?: string
    /** Promote metrics via redis-exporter sidecar (default true) */
    exporter?: boolean
  }
  /**
   * S3-compatible object storage for attachments (RustFS in the platform).
   * Reference a bucket whose credentials live in a Secret provisioned by
   * the secrets backend (keys: accessKey, secretKey) — never plaintext.
   */
  objectStorage?: {
    /** S3 endpoint URL, e.g. https://s3.internal.example.com */
    endpoint: string
    /** Bucket name for attachments */
    bucket: string
    /** Name of the Secret holding accessKey / secretKey */
    credentialsSecret: string
    /** Region string for Outline's S3 client (defaults to 'us-east-1') */
    region?: string
  }
  /**
   * OIDC SSO client — register Outline as a client in Keycloak (the
   * Auth recipe). With a secrets backend, client id/secret are taken
   * from the provisioned bundle (keys oidc_client_id/oidc_client_secret)
   * unless clientSecretRef is given.
   */
  sso?: {
    issuer: string
    /** Optional when the backend bundle carries oidc_client_id */
    clientId?: string
    /** Optional when the backend bundle carries oidc_client_secret */
    clientSecretRef?: SecretRef
    scopes?: string
    /** OIDC_DISPLAY_NAME — login-button label (default 'SSO') */
    displayName?: string
    /** OIDC_USERNAME_CLAIM (default 'preferred_username') */
    usernameClaim?: string
    /** OIDC_LOGOUT_URI — optional full logout URL */
    logoutUri?: string
  }
  /**
   * Name of an existing Secret holding `SECRET_KEY`/`UTILS_SECRET`
   * (and OIDC_* when using bundled SSO). Required unless a secrets
   * backend (openbao/vault) is configured on the surrounding
   * Platform — the backend then provisions them.
   */
  secretsName?: string
  /** Requested resources */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** Extra env for the app container (merged last — escape hatch) */
  env?: Record<string, string>
  /** Extra annotations merged onto the Endpoint */
  endpointAnnotations?: Record<string, string>
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Outline — team wiki with Postgres, Redis, S3 attachments and OIDC SSO.
 *
 * @title Outline
 * @category Knowledge & Documentation
 *
 * Composes:
 * - CNPG Postgres cluster (documents, revisions, users)
 * - Redis cluster for queue + rate limiting (default on)
 * - Outline Deployment + Service + Endpoint
 * - S3/RustFS bucket reference for attachments
 * - SECRET_KEY / UTILS_SECRET provisioned by the Platform secrets
 *   backend (openbao / vault), or referenced from an existing Secret
 * - OIDC SSO against the Keycloak `Auth` recipe
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Outline } from '@r8s/outline'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Outline
 *       name="wiki"
 *       host="wiki.example.com"
 *       objectStorage={{
 *         endpoint: 'https://s3.internal.example.com',
 *         bucket: 'wiki-attachments',
 *         credentialsSecret: 'wiki-attachments-credentials',
 *       }}
 *       sso={{
 *         issuer: 'https://keycloak.example.com/realms/platform',
 *         clientId: 'outline',
 *         clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },
 *       }}
 *     />
 *   </Platform>
 * )
 */
export function Outline(props: OutlineProps) {
  const {
    name = 'outline',
    namespace: namespaceProp,
    version = '1.9.2',
    host,
    storage = '20Gi',
    instances = 2,
    backup,
    replicas = 1,
    cache = true,
    redis = {},
    objectStorage,
    sso,
    secretsName,
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    env: extraEnv = {},
    endpointAnnotations = {},
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const sharedOperators = useOperators()
  const secretProvider = useContext(SecretContext)
  const namespace = useNamespace(namespaceProp)
  const resources_: ReturnType<typeof jsx>[] = []

  const dbHost = `${name}-rw`
  const dbCredentialsName = `${name}-db-credentials`
  const platformSecretsName = secretsName ?? `${name}-app-secrets`

  // --- App secrets (SECRET_KEY / UTILS_SECRET) ------------------------------
  if (!secretsName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Outline',
        name,
        'application secrets (SECRET_KEY, UTILS_SECRET)',
        {
          propName: 'secretsName',
          exampleValue: `${name}-app-secrets`,
          keys: ['SECRET_KEY', 'UTILS_SECRET'],
        }
      )
    }

    // Facit bundle: vault keys are snake_case, the destination carries
    // env-case names so Outline reads SECRET_KEY/UTILS_SECRET/OIDC_* directly.
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-secrets`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/app`,
        secretName: platformSecretsName,
        // Facit interval; rotation of SECRET_KEY/OIDC invalidates sessions —
        // restart the single Deployment so the pod re-reads fresh values
        refreshAfter: '3600s',
        keys: {
          SECRET_KEY: 'secret_key',
          UTILS_SECRET: 'utils_secret',
          ...(sso
            ? { OIDC_CLIENT_ID: 'oidc_client_id', OIDC_CLIENT_SECRET: 'oidc_client_secret' }
            : {}),
        },
        restart: [{ kind: 'Deployment', name }],
      })
    )
  }

  // --- Operators -------------------------------------------------------------
  if (cache) {
    resources_.push(...maybeOperator('redis-operator', sharedOperators))
  }

  // Redis — caching + websockets. Standalone is the facit shape: durable via
  // a 1Gi PVC, observable via the exporter sidecar, sized 100m/256Mi→250m/512Mi.
  // (A Replication topology exists for durable queues; Outline's cache can
  // simply rebuild after pod loss — no need to spend three pods here.)
  if (cache) {
    const exporter = redis.exporter ?? true
    resources_.push(
      jsx('Redis', {
        apiVersion: 'redis.redis.opstreelabs.in/v1beta2',
        kind: 'Redis',
        metadata: {
          name: `${name}-redis`,
          namespace,
          // Scrape annotations only make sense when the exporter sidecar runs
          ...(exporter
            ? {
                annotations: {
                  'prometheus.io/scrape': 'true',
                  'prometheus.io/port': '9121',
                },
              }
            : {}),
        },
        spec: {
          kubernetesConfig: {
            image: redis.image ?? 'redis:7.0.12',
            imagePullPolicy: 'IfNotPresent',
            resources: {
              requests: { cpu: '100m', memory: '256Mi' },
              limits: { cpu: '250m', memory: '512Mi' },
            },
          },
          storage: {
            volumeClaimTemplate: {
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: { requests: { storage: redis.storage ?? '1Gi' } },
                ...(redis.storageClass ? { storageClassName: redis.storageClass } : {}),
              },
            },
          },
          ...(exporter
            ? {
                redisExporter: {
                  enabled: true,
                  image: 'quay.io/opstree/redis-exporter:v1.44.0',
                  resources: {
                    requests: { cpu: '50m', memory: '64Mi' },
                    limits: { cpu: '100m', memory: '128Mi' },
                  },
                },
              }
            : {}),
        },
      })
    )
  }

  // --- Env wiring --------------------------------------------------------------
  // Every credential is referenced with $(VAR) expansion or secretKeyRef —
  // no plaintext in the manifest. The WebService declares secret-backed
  // vars before plain env vars, so dependent expansion resolves.
  const env: Record<string, string> = {
    NODE_ENV: 'production',
    PORT: '3000',
    HOST: '0.0.0.0',
    // One in-process worker: scaling happens via WEB_CONCURRENCY/resources
    // inside the pod, while replicas stays 1 (boot-time DB migrations must
    // never run concurrently — see the Recreate strategy)
    WEB_CONCURRENCY: '1',
    // Deterministic parts inlined; password arrives via PGPASSWORD
    DATABASE_URL: `postgresql://${name}:$(PGPASSWORD)@${dbHost}:5432/${name}`,
    // Outline (Sequelize) cannot do SSL to the in-cluster CNPG service
    PGSSLMODE: 'disable',
    SECRET_KEY: '$(SECRET_KEY)',
    UTILS_SECRET: '$(UTILS_SECRET)',
    URL: `https://${host}`,
    FORCE_HTTPS: 'true',
    RATE_LIMITER_ENABLED: 'true',
    // Self-hosted: no in-app upgrade prompts (image is pinned + deliberate)
    ENABLE_UPDATES: 'false',
    LOG_LEVEL: 'info',
    ...(cache ? { REDIS_URL: `redis://${name}-redis:6379` } : {}),
    ...(objectStorage
      ? {
          FILE_STORAGE: 's3',
          AWS_REGION: objectStorage.region ?? 'us-east-1',
          // Facit semantics: this is the ENDPOINT only, not endpoint/bucket
          AWS_S3_UPLOAD_BUCKET_URL: objectStorage.endpoint,
          AWS_S3_UPLOAD_BUCKET_NAME: objectStorage.bucket,
          AWS_S3_FORCE_PATH_STYLE: 'true',
          AWS_S3_ACL: 'private',
        }
      : {}),
    ...(sso
      ? {
          OIDC_DISPLAY_NAME: sso.displayName ?? 'SSO',
          OIDC_USERNAME_CLAIM: sso.usernameClaim ?? 'preferred_username',
          OIDC_ISSUER: sso.issuer,
          // OIDC_CLIENT_ID/SECRET arrive via secretKeyRef (below) unless a
          // literal clientId is given — no duplicating expansion vars
          ...(sso.clientId ? { OIDC_CLIENT_ID: sso.clientId } : {}),
          OIDC_SCOPES: sso.scopes ?? 'openid email profile',
          OIDC_AUTH_URI: '$(OIDC_ISSUER)/protocol/openid-connect/auth',
          OIDC_TOKEN_URI: '$(OIDC_ISSUER)/protocol/openid-connect/token',
          OIDC_USERINFO_URI: '$(OIDC_ISSUER)/protocol/openid-connect/userinfo',
          ...(sso.logoutUri ? { OIDC_LOGOUT_URI: sso.logoutUri } : {}),
        }
      : {}),
    ...extraEnv,
  }

  // Credentials delivered via secretKeyRef (runtime injection). OIDC reads
  // from the bundle unless an explicit clientSecretRef is given (a
  // user-supplied secretsName Secret is expected to carry the same keys).
  const secrets: Record<string, SecretRef | string> = {
    SECRET_KEY: { secret: platformSecretsName, key: 'SECRET_KEY' },
    UTILS_SECRET: { secret: platformSecretsName, key: 'UTILS_SECRET' },
    PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
    ...(objectStorage
      ? {
          AWS_ACCESS_KEY_ID: { secret: objectStorage.credentialsSecret, key: 'accessKey' },
          AWS_SECRET_ACCESS_KEY: { secret: objectStorage.credentialsSecret, key: 'secretKey' },
        }
      : {}),
    ...(sso
      ? {
          OIDC_CLIENT_SECRET: sso.clientSecretRef ?? {
            secret: platformSecretsName,
            key: 'OIDC_CLIENT_SECRET',
          },
          ...(!sso.clientId
            ? { OIDC_CLIENT_ID: { secret: platformSecretsName, key: 'OIDC_CLIENT_ID' } }
            : {}),
        }
      : {}),
  }

  // --- Database + app + endpoint ------------------------------------------------
  // Database wraps the app so credentials stay consistent with the r8s
  // Database recipe (CNPG dedicated cluster provisions the secret).
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage,
      instances,
      ...(backup ? { backup } : {}),
      children: (
        <WebService
          name={name}
          namespace={namespace}
          image={`docker.getoutline.com/outlinewiki/outline:${version}`}
          port={3000}
          replicas={replicas}
          // DB migrations run at boot — never run two migrating pods at once
          strategy="Recreate"
          resources={resources}
          probes={{
            // Outline boots slowly (assets + migrations): facit probe timings
            readiness: { tcp: true, initialDelaySeconds: 30, failureThreshold: 6 },
            liveness: { tcp: true, initialDelaySeconds: 90, periodSeconds: 30 },
          }}
          env={env}
          secrets={secrets}
        />
      ),
    })
  )

  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={3000}
      tls={tls}
      annotations={{
        // Websockets keep realtime-collab connections open — facit sets 1h
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '3600',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '3600',
        ...endpointAnnotations,
      }}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
