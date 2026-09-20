import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, OperatorContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  WebService,
  Endpoint,
  databaseCredentialsRef,
  resolveObjectStorage,
  useS3,
  type BucketProps,
  type DatabaseProps,
} from '@r8s/recipes'
import type { SecretRef } from '@r8s/recipes'
import { RedisReplicationComponent } from '@r8s/crds/redis'
import { declareIfMissing } from '@r8s/operator-redis'

/**
 * Image tag applied to BOTH eneo-ai images (backend + frontend).
 * Pinned by default — the first r8s render pulled `ghcr.io/berget-ai/eneo:latest`
 * (a private registry) and sat in ImagePullBackOff; public pinning is the fix.
 */
const DEFAULT_VERSION = '2.1.1'

/** The backend image (FastAPI/gunicorn) binds 0.0.0.0:8000 — fixed by run.sh. */
const BACKEND_PORT = 8000

/** The frontend image (SvelteKit) listens on 3000. */
const FRONTEND_PORT = 3000

/** Redis needed by the backend image's pydantic Settings (required fields). */
const REDIS_PORT = 6379

/** Probe path on the backend: FastAPI's OpenAPI schema — dependency-free. */
const BACKEND_PROBE_PATH = '/openapi.json'

/**
 * Host-level path prefixes the upstream Traefik contract routes to the
 * backend (docs/deployment/docker-compose.yml) — the catch-all host goes
 * to the frontend UI.
 */
const API_PATH_PREFIXES = ['/api', '/docs', '/openapi.json', '/version'] as const

export interface EneoProps {
  /** Resource name (defaults to 'eneo') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /**
   * Image tag applied to BOTH images — ghcr.io/eneo-ai/eneo-backend and
   * ghcr.io/eneo-ai/eneo-frontend (defaults to '2.1.1', pinned and public).
   */
  version?: string
  /** Public hostname for the Eneo web app (required) */
  host: string
  /**
   * Number of replicas for EACH deployment — backend and frontend
   * (defaults to 2). Both apps are stateless. The backend runs Alembic
   * migrations on pod start, so a cold scale-up rolls two concurrent
   * `alembic upgrade head` runs; upstream's migrations are idempotent.
   */
  replicas?: number
  /**
   * S3-compatible object storage for document corpora (RustFS in the
   * platform). Resolution order: this prop → a `<Bucket name="…" />`
   * descriptor → derived from the surrounding `<S3Provider>` (omit it
   * entirely there — corpora storage and database backups then share one
   * declared source).
   *
   * Storage-API-style consumers take a BUCKET NAME, not a prefixed path:
   * a descriptor's `bucket` override selects the bucket, its `name` is
   * only the logical scope (prefix). The bucket's credentials must live
   * in a Secret provisioned by the secrets backend (keys: accessKey,
   * secretKey) — never plaintext.
   *
   * Note: Eneo 2.1.1 persists uploads as database blobs (pgvector
   * Postgres); the S3_* env wiring follows the platform's shared corpora
   * contract and is inert-but-correct for builds that consume them.
   */
  objectStorage?:
    | {
        /** S3 endpoint URL, e.g. https://s3.internal.example.com */
        endpoint: string
        /** Bucket holding document corpora */
        bucket: string
        /** Name of the Secret holding accessKey / secretKey */
        credentialsSecret: string
        /** Region string for the S3 client (defaults to 'us-east-1') */
        region?: string
      }
    | { type: unknown; props: BucketProps }
  /**
   * OIDC SSO client — register Eneo as a client in Keycloak (the Auth
   * recipe). Rendered as OIDC_DISCOVERY_ENDPOINT / OIDC_CLIENT_ID /
   * OIDC_CLIENT_SECRET on BOTH the backend and the frontend (the upstream
   * images' shared single-tenant OIDC contract); the client secret is
   * delivered via secretKeyRef — never plaintext.
   */
  sso?: {
    issuer: string
    clientId: string
    clientSecretRef: SecretRef
    scopes?: string
  }
  /**
   * Outgoing SMTP for invitations and notifications (mirror of the
   * EuroOffice recipe). When set, SMTP_HOST / SMTP_PORT / SMTP_FROM are
   * rendered as plain env and SMTP_PASSWORD is delivered via secretKeyRef
   * from the `${name}-secrets` bundle (key: smtpPassword) — never
   * plaintext. The bundle then requires the `smtpPassword` key as well;
   * without `smtp` only `appSecret` is required from the bundle.
   *
   * Note: Eneo 2.1.1 has no SMTP settings in its backend Settings — the
   * wiring is retained for forward compatibility (pydantic `extra=allow`
   * silently accepts the vars).
   */
  smtp?: {
    /** SMTP server hostname, e.g. smtp.example.com */
    host: string
    /** SMTP port (defaults to 587) */
    port?: number
    /** From address for outgoing mail, e.g. no-reply@example.com */
    from?: string
  }
  /**
   * Name of an existing Secret holding `appSecret` (and `smtpPassword`
   * when `smtp` is set). Required unless a secrets backend
   * (openbao/vault) is configured on the surrounding Platform — the
   * backend then provisions them. `appSecret` feeds JWT_SECRET on both
   * the backend and the frontend (the cookie-signing keys must match).
   */
  secretsName?: string
  /**
   * Storage size for the Postgres cluster (defaults to '10Gi').
   *
   * Eneo keeps uploaded documents as blobs IN the database (pgvector) —
   * size generously; document corpora on object storage (`objectStorage`/
   * S3) target S3-capable builds. A local corpus PVC is a v1.1 item.
   */
  dbStorage?: string
  /** Requested resources — applied to both the backend and frontend pods */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
  /**
   * Backup decision for the backing CNPG cluster — defaults to **enabled**
   * (barman WAL + scheduled backups derived from the platform's S3Provider).
   * Pass `false` to opt out explicitly.
   */
  backup?: DatabaseProps['backup']
}

/**
 * Eneo — open AI platform from Sundsvall municipality (agent workspaces,
 * assistants, document AI).
 *
 * @title Eneo
 * @category Agent Platforms
 *
 * Composes:
 * - CNPG Postgres cluster with pgvector (conversations, workspaces,
 *   document blobs; size via `dbStorage`; the vector extension is created
 *   at bootstrap via postInitApplicationSQL — CNPG std images ship
 *   pgvector, and those SQL runs execute as superuser)
 * - Redis replication set for the ARQ background-queue (the backend
 *   image's Settings hard-require REDIS_HOST/PORT — the job manager
 *   connects at startup, so no boot without it)
 * - `eneo-backend` Deployment (ghcr.io/eneo-ai/eneo-backend, API on 8000)
 *   inside the Database context — POSTGRES_* wired from the CNPG
 *   credentials contract, DATABASE_URL/PG* auto-wired by the recipe
 * - `eneo-frontend` Deployment (ghcr.io/eneo-ai/eneo-frontend, UI on
 *   3000) — ENEO_BACKEND_SERVER_URL points at the in-cluster backend
 *   Service, browser/SSR URLs point at the public host
 * - Endpoint: the host routes to the FRONTEND; the upstream API prefixes
 *   (`/api`, `/docs`, `/openapi.json`, `/version`) route to the backend
 * - S3/RustFS bucket reference for document corpora (derived from the
 *   platform's S3Provider)
 * - App secrets (appSecret, plus smtpPassword when `smtp` is set)
 *   provisioned by the Platform secrets backend (openbao / vault), or
 *   referenced from an existing Secret
 * - OIDC SSO against the Keycloak `Auth` recipe
 *
 * Deliberately not rendered (v1.1): the ARQ **worker** container (same
 * backend image with `RUN_AS_WORKER=true`) that upstream compose adds for
 * crawls/document processing — without it queued background jobs wait
 * until one is added.
 *
 * Under an `<S3Provider>` both the database backups and the document
 * corpora's object storage derive from it — `objectStorage` can be omitted
 * entirely. Pass it only to target a different bucket than the provider's,
 * either as a plain object or as `<Bucket name="…" bucket="…" />` (the
 * descriptor's `bucket` selects the bucket; `name` is the logical scope).
 *
 * The namespace is inherited from the surrounding `<Platform>` (via the
 * Namespace context) unless set explicitly.
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the app secrets bundle is provisioned for you. Without a backend you
 * must point `secretsName` at a pre-created Secret.
 *
 * @example
 * import { Platform, S3Provider, MinIO } from '@r8s/recipes'
 * import { Eneo } from '@r8s/eneo'
 *
 * // Backups default to on, objectStorage derives — the S3Provider
 * // supplies both targets and credentials
 * export default (
 *   <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>
 *     <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *       <Eneo name="eneo" host="eneo.example.com" />
 *     </Platform>
 *   </S3Provider>
 * )
 */
export function Eneo(props: EneoProps) {
  const {
    name = 'eneo',
    namespace: namespaceProp,
    version = DEFAULT_VERSION,
    host,
    replicas = 2,
    objectStorage,
    sso,
    smtp,
    secretsName,
    dbStorage = '10Gi',
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
    backup,
  } = props

  const namespace = useNamespace(namespaceProp)

  const secretProvider = useContext(SecretContext)
  const sharedOperators = useContext(OperatorContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const backendName = `${name}-backend`
  const frontendName = `${name}-frontend`
  const redisName = `${name}-redis`
  const origin = `https://${host}`
  const platformSecretsName = secretsName ?? `${name}-secrets`

  // --- App secrets (appSecret / smtpPassword) -------------------------------
  // Session signing and SMTP delivery credentials are the crown jewels of an
  // Eneo install — never render them as plaintext. With a secrets backend
  // they are provisioned through the backend; otherwise reference a
  // pre-created Secret. smtpPassword is only required from the bundle when
  // the `smtp` prop is configured.
  const requiredSecretKeys = smtp ? 'appSecret, smtpPassword' : 'appSecret'
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Eneo "${name}" requires application secrets (${requiredSecretKeys}).\n` +
          `\n` +
          `These must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Eneo name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: ${requiredSecretKeys}):\n` +
          `  <Eneo name="${name}" host="${host}" secretsName="${name}-secrets" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/secrets`,
      destination: { create: true, name: platformSecretsName },
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

  // --- Object storage (document corpora) — derived from the S3Provider ------
  // Same resolution contract as Database's backup decision (#115): an
  // explicit object wins, a <Bucket/> descriptor points the corpora at
  // another store, and omission under an <S3Provider> derives everything.
  const s3 = useS3()
  const store = resolveObjectStorage(
    'Eneo',
    name,
    'document corpora are stored in an S3 bucket',
    objectStorage,
    s3
  )

  // --- Redis (background-queue infrastructure) --------------------------------
  // The upstream backend's pydantic Settings require REDIS_HOST/REDIS_PORT and
  // the FastAPI lifespan connects to Redis on boot (job_manager.create_pool) —
  // the API cannot start without it, so a replication set renders
  // unconditionally (same OT-Container-Kit pattern as nextcloud/librechat;
  // the `${name}-redis` master service fronts it).
  resources_.push(
    ...declareIfMissing(sharedOperators),
    RedisReplicationComponent({
      metadata: { name: redisName, namespace },
      spec: {
        clusterSize: 3,
        kubernetesConfig: { image: 'redis:7.2-alpine' },
      },
    })
  )

  // --- Env wiring --------------------------------------------------------------
  // Every credential is referenced with $(VAR) expansion or secretKeyRef —
  // no plaintext in the manifest. The WebService declares secret-backed
  // vars before plain env vars, so dependent expansion resolves. Both the
  // POSTGRES_* contract (backend Settings, required fields) and the
  // recipe's DATABASE_URL/PG* auto-wire are delivered to the backend.
  // OIDC discovery follows the standard issuer + /.well-known/openid-configuration
  // mapping (exactly the URL shape the upstream template documents for
  // Keycloak/Auth0).
  const discoveryEndpointFor = (issuer: string) =>
    `${issuer.replace(/\/+$/, '')}/.well-known/openid-configuration`

  const backendEnv: Record<string, string> = {
    PUBLIC_ORIGIN: origin,
    POSTGRES_HOST: `${name}-rw`,
    POSTGRES_PORT: '5432',
    POSTGRES_DB: name,
    POSTGRES_USER: name,
    REDIS_HOST: redisName,
    REDIS_PORT: String(REDIS_PORT),
    // JWT / API surface — required fields with no defaults in the image's
    // Settings; values mirror the upstream env_backend.template.
    API_PREFIX: '/api/v1',
    API_KEY_LENGTH: '64',
    API_KEY_HEADER_NAME: 'X-API-Key',
    JWT_AUDIENCE: '*',
    JWT_ISSUER: 'ENEO',
    JWT_EXPIRY_TIME: '86400',
    JWT_ALGORITHM: 'HS256',
    JWT_TOKEN_PREFIX: 'Bearer',
    // Required by Settings (no default); shipped empty by the upstream
    // template too — integrations (SharePoint URL signing) set it later.
    URL_SIGNING_KEY: '',
    // Upload limits — required fields, upstream template defaults (10MB).
    UPLOAD_FILE_TO_SESSION_MAX_SIZE: '10485760',
    UPLOAD_IMAGE_TO_SESSION_MAX_SIZE: '10485760',
    UPLOAD_MAX_FILE_SIZE: '10485760',
    TRANSCRIPTION_MAX_FILE_SIZE: '10485760',
    // Document corpora (r8s platform S3 contract)
    S3_ENDPOINT: store.endpoint,
    S3_BUCKET: store.bucket,
    AWS_REGION: store.region ?? 'us-east-1',
    ...(sso
      ? {
          OIDC_DISCOVERY_ENDPOINT: discoveryEndpointFor(sso.issuer),
          OIDC_CLIENT_ID: sso.clientId,
        }
      : {}),
    ...(smtp
      ? {
          SMTP_HOST: smtp.host,
          SMTP_PORT: String(smtp.port ?? 587),
          ...(smtp.from && { SMTP_FROM: smtp.from }),
        }
      : {}),
  }

  const frontendEnv: Record<string, string> = {
    // Server-side + browser backend base — both go through the public host,
    // whose /api prefix routes to the backend Service (see Endpoints).
    ENEO_BACKEND_URL: origin,
    PUBLIC_ENEO_BACKEND_URL: origin,
    // In-cluster SSR calls hit the backend Service directly (skips the edge).
    ENEO_BACKEND_SERVER_URL: `http://${backendName}:${BACKEND_PORT}`,
    // Cookie/CORS origin + OIDC redirect base (must match the backend).
    ORIGIN: origin,
    PUBLIC_ORIGIN: origin,
    NODE_ENV: 'production',
    ...(sso
      ? {
          OIDC_DISCOVERY_ENDPOINT: discoveryEndpointFor(sso.issuer),
          OIDC_CLIENT_ID: sso.clientId,
        }
      : {}),
  }

  // Credentials delivered via secretKeyRef (runtime injection).
  // JWT_SECRET (appSecret) MUST match between backend and frontend — the
  // frontend validates the backend's signed cookies. The POSTGRES_PASSWORD
  // reference uses the central databaseCredentialsRef contract (never a
  // hardcoded secret name) and lands in the same container as the
  // recipe's auto-wired PGPASSWORD — both point at the same Secret.
  const dbCredentials = databaseCredentialsRef(name, secretProvider)
  const backendSecrets: Record<string, SecretRef | string> = {
    JWT_SECRET: { secret: platformSecretsName, key: 'appSecret' },
    POSTGRES_PASSWORD: { secret: dbCredentials.name, key: dbCredentials.key },
    AWS_ACCESS_KEY_ID: { secret: store.credentialsSecret, key: 'accessKey' },
    AWS_SECRET_ACCESS_KEY: { secret: store.credentialsSecret, key: 'secretKey' },
    ...(sso ? { OIDC_CLIENT_SECRET: sso.clientSecretRef } : {}),
    ...(smtp
      ? { SMTP_PASSWORD: { secret: platformSecretsName, key: 'smtpPassword' as const } }
      : {}),
  }

  const frontendSecrets: Record<string, SecretRef | string> = {
    JWT_SECRET: { secret: platformSecretsName, key: 'appSecret' },
    ...(sso ? { OIDC_CLIENT_SECRET: sso.clientSecretRef } : {}),
  }

  // --- Database + backend + frontend + endpoints --------------------------------
  // Database wraps the backend so credentials stay consistent with the r8s
  // Database recipe (CNPG dedicated cluster provisions the secret) and the
  // WebService auto-wires PG* + DATABASE_URL from DatabaseContext. pgvector
  // is created at bootstrap (runs as superuser; CNPG std images ship it).
  // The frontend renders OUTSIDE the database context — it never touches
  // Postgres.
  resources_.push(
    jsx(Database, {
      backup: backup ?? true,
      name,
      namespace,
      storage: dbStorage,
      postInitSQL: ['CREATE EXTENSION IF NOT EXISTS vector;'],
      children: (
        <WebService
          name={backendName}
          namespace={namespace}
          image={`ghcr.io/eneo-ai/eneo-backend:${version}`}
          port={BACKEND_PORT}
          replicas={replicas}
          resources={resources}
          env={backendEnv}
          secrets={backendSecrets}
          probes={{
            liveness: { path: BACKEND_PROBE_PATH, port: BACKEND_PORT },
            readiness: { path: BACKEND_PROBE_PATH, port: BACKEND_PORT },
          }}
          // The image runs as a fixed non-root UID (1000). The spool paths the
          // upstream compose mounts (/app/data, /tmp — upload_tmp_dir and audit
          // exports) are emptyDirs here; fsGroup mirrors the container UID so
          // the non-root process can write into them.
          podSecurityContext={{ fsGroup: 1000 }}
          volumes={[
            { name: 'data', emptyDir: {} },
            { name: 'tmp', emptyDir: {} },
          ]}
          volumeMounts={[
            { name: 'data', mountPath: '/app/data' },
            { name: 'tmp', mountPath: '/tmp' },
          ]}
        />
      ),
    })
  )

  resources_.push(
    <WebService
      name={frontendName}
      namespace={namespace}
      image={`ghcr.io/eneo-ai/eneo-frontend:${version}`}
      port={FRONTEND_PORT}
      replicas={replicas}
      resources={resources}
      env={frontendEnv}
      secrets={frontendSecrets}
      probes={{
        liveness: { path: '/', port: FRONTEND_PORT },
        readiness: { path: '/', port: FRONTEND_PORT },
      }}
    />
  )

  // --- Endpoint: host → frontend, API prefixes → backend ------------------------
  // The upstream Traefik reference routes the bare host to the frontend UI
  // and only /api, /docs, /openapi.json and /version to the backend. The
  // main Endpoint owns the Gateway/certificate; every path route attaches
  // to that same gateway so one shared listener serves the whole host (in
  // nginx mode the per-path Ingresses merge into the host's TLS server
  // block). DNS is declared once on the main endpoint.
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={frontendName}
      servicePort={FRONTEND_PORT}
      tls={tls}
    />
  )

  for (const prefix of API_PATH_PREFIXES) {
    resources_.push(
      <Endpoint
        name={`${name}-${prefix.slice(1).replace(/[/.]/g, '-')}-endpoint`}
        namespace={namespace}
        host={host}
        path={prefix}
        serviceName={backendName}
        servicePort={BACKEND_PORT}
        dns={false}
        sharedGateway={{ name: `${name}-endpoint-gateway` }}
      />
    )
  }

  return jsx(Fragment, { children: resources_ })
}
