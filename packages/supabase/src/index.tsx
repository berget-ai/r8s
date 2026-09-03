import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { Database, WebService, Endpoint } from '@r8s/recipes'

export interface SupabaseProps {
  /** Resource name — base for every derived resource (defaults to 'supabase') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Public hostname for the REST API root — PostgREST (required) */
  host: string
  /** Replicas per service (defaults to 1; PostgREST/GoTrue scale horizontally) */
  replicas?: number
  /** Postgres cluster storage size for the Database core (defaults to '10Gi') */
  storage?: string
  /**
   * Render the Storage API service (defaults to true). Set false to run a
   * minimal auth + REST-only Supabase. The S3 objectStorage prop is always
   * required so a bucket is declared for the platform.
   */
  storageApi?: boolean
  /**
   * S3-compatible object storage for the Storage API (RustFS in the platform).
   * Reference a bucket whose credentials live in a Secret provisioned by
   * the secrets backend (keys: accessKey, secretKey) — never plaintext.
   */
  objectStorage: {
    /** S3 endpoint URL, e.g. https://s3.internal.example.com */
    endpoint: string
    /** Bucket for uploads and stored files */
    bucket: string
    /** Name of the Secret holding accessKey / secretKey */
    credentialsSecret: string
  }
  /**
   * S3 region reported to the Storage API (GLOBAL_S3_REGION, defaults to
   * 'us-east-1'). For S3-compatible stores like RustFS any consistent
   * region works — keep it aligned with the provider's default.
   */
  region?: string
  /**
   * Name of an existing Secret holding the Supabase JWT bundle with keys
   * `jwtSecret`, `anonKey`, `serviceRoleKey` and `referrerURLs`. Required
   * unless a secrets backend (openbao/vault) is configured on the
   * surrounding Platform — the backend then provisions the bundle at
   * path `<path>/<name>/jwt`. Plaintext JWT secrets are not supported.
   */
  jwtSecretsName?: string
  /**
   * Additional redirect URLs GoTrue may send users to after signup,
   * magic-link or OAuth flows (GOTRUE_URI_ALLOW_LIST). The site URL is
   * always allowed; pass a list (joined with ',') or a pre-joined string.
   */
  uriAllowList?: string | string[]
  /** Requested resources — applied to every service in the suite */
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

/**
 * Supabase — open-source Firebase alternative: auth, REST, realtime and
 * storage on Postgres. This is the Supabase backend platform, NOT Apache
 * Superset (which ships in the separate r8s/superset package).
 *
 * @title Supabase
 * @category Backend Platforms
 *
 * Composes:
 * - CNPG Postgres cluster (the Supabase database core) bootstrapped with
 *   the Supabase roles (anon, authenticated, service_role, authenticator),
 *   extensions (pgcrypto, pgjwt) and schemas (auth, storage, realtime)
 * - GoTrue auth service (`${name}-gotrue`, port 9999)
 * - PostgREST REST API (`${name}-postgrest`, port 3000)
 * - Realtime websockets service (`${name}-realtime`, port 4000)
 * - Storage API on S3/RustFS (`${name}-storage-api`, port 5000)
 * - ImgProxy image transform service (`${name}-imgproxy`, port 8080)
 * - Endpoints on one host: `/rest/v1` (PostgREST), `/auth/v1` (GoTrue),
 *   `/realtime/v1` (Realtime, with WebSocket-friendly nginx annotations)
 *   and `/storage/v1` (Storage API), plus the REST root at `/`
 * - JWT bundle (jwtSecret, anonKey, serviceRoleKey, referrerURLs)
 *   provisioned through the Platform secrets backend (openbao / vault),
 *   or referenced from an existing Secret
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the `${name}-jwt` bundle is provisioned for you. Without a backend you
 * must point `jwtSecretsName` at a pre-created Secret.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Supabase } from '@r8s/supabase'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Supabase
 *       name="backend"
 *       host="backend.example.com"
 *       objectStorage={{
 *         endpoint: 'https://s3.internal.example.com',
 *         bucket: 'backend-uploads',
 *         credentialsSecret: 'backend-object-store-credentials',
 *       }}
 *     />
 *   </Platform>
 * )
 *
 * @example
 * // Reference a pre-created JWT bundle instead of provisioning one
 * import { Supabase } from '@r8s/supabase'
 *
 * export default (
 *   <Supabase
 *     host="backend.example.com"
 *     jwtSecretsName="backend-jwt"
 *     objectStorage={{
 *       endpoint: 'https://s3.internal.example.com',
 *       bucket: 'backend-uploads',
 *       credentialsSecret: 'backend-object-store-credentials',
 *     }}
 *   />
 * )
 */
export function Supabase(props: SupabaseProps) {
  const {
    name = 'supabase',
    namespace = 'default',
    host,
    replicas = 1,
    storage = '10Gi',
    storageApi = true,
    region = 'us-east-1',
    objectStorage,
    jwtSecretsName,
    uriAllowList,
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const dbHost = `${name}-rw`
  const dbCredentialsName = `${name}-db-credentials`
  const jwtBundleName = jwtSecretsName ?? `${name}-jwt`
  // Static parts only — the password arrives via $(PGPASSWORD), which every
  // service declares through secretKeyRef (WebService resolves secrets
  // before plain env, so Kubernetes dependent expansion sees it).
  const dbUri = `postgresql://${name}:$(PGPASSWORD)@${dbHost}:5432/${name}`

  // --- Bootstrap SQL ---------------------------------------------------------
  // Minimal Supabase bootstrap applied once by CNPG after initdb
  // (bootstrap.initdb.postInitApplicationSQL). Every statement is
  // idempotent where the SQL grammar allows it.
  const postInitSQL = [
    'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
    'CREATE EXTENSION IF NOT EXISTS pgjwt;',
    'CREATE ROLE anon NOLOGIN;',
    'CREATE ROLE authenticated NOLOGIN;',
    'CREATE ROLE service_role NOLOGIN;',
    'CREATE ROLE authenticator NOLOGIN;',
    'GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;',
    'CREATE SCHEMA IF NOT EXISTS auth;',
    'CREATE SCHEMA IF NOT EXISTS storage;',
    'CREATE SCHEMA IF NOT EXISTS realtime;',
    'GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;',
    'GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;',
    'GRANT USAGE ON SCHEMA realtime TO anon, authenticated, service_role;',
    'GRANT anon TO authenticator;',
    'GRANT authenticated TO authenticator;',
    'GRANT service_role TO authenticator;',
  ]

  // --- JWT bundle provisioning ----------------------------------------------
  // GoTrue, PostgREST and Storage API all verify Supabase JWTs. The bundle
  // (jwtSecret, anonKey, serviceRoleKey, referrerURLs) must never be
  // rendered as plaintext: with a secrets backend it is provisioned through
  // the backend (keys live at <path>/<name>/jwt); otherwise reference a
  // pre-created Secret.
  if (!jwtSecretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Supabase "${name}" requires a JWT secret bundle (keys: jwtSecret, anonKey, serviceRoleKey, referrerURLs).\n` +
          `\n` +
          `GoTrue, PostgREST and Storage API verify Supabase JWTs — the bundle ` +
          `must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform holding the bundle ` +
          `at path <mount-path>/${name}/jwt:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Supabase name="${name}" host="${host}" objectStorage={{ endpoint: '...', bucket: '...', credentialsSecret: '...' }} />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: jwtSecret, anonKey, serviceRoleKey, referrerURLs):\n` +
          `  <Supabase name="${name}" host="${host}" jwtSecretsName="${name}-jwt" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/jwt`,
      destination: { create: true, name: jwtBundleName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-jwt`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-jwt`, namespace },
            spec,
          })
    )
  }

  // --- Database (CNPG) — the Postgres core -----------------------------------
  // Wraps every Postgres-backed service so credentials stay consistent with
  // the r8s Database recipe (CNPG dedicated cluster provisions the secret).
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage,
      postInitSQL,
      children: (
        <>
          <WebService
            name={`${name}-gotrue`}
            namespace={namespace}
            image="supabase/gotrue:v2"
            port={9999}
            replicas={replicas}
            resources={resources}
            probes={{
              liveness: { path: '/health', initialDelaySeconds: 15 },
              readiness: { path: '/health', initialDelaySeconds: 15 },
            }}
            env={{
              GOTRUE_API_HOST: '0.0.0.0',
              GOTRUE_API_PORT: '9999',
              GOTRUE_SITE_URL: `https://${host}`,
              API_EXTERNAL_URL: `https://${host}`,
              GOTRUE_DB_DRIVER: 'postgres',
              GOTRUE_DB_DATABASE_URL: dbUri,
              GOTRUE_JWT_ISSUER: `https://${host}/auth/v1`,
              GOTRUE_JWT_ADMIN_ROLES: 'service_role',
              GOTRUE_JWT_AUD: 'authenticated',
              GOTRUE_JWT_DEFAULT_GROUP_NAME: 'authenticated',
              GOTRUE_JWT_EXP: '3600',
              ...(uriAllowList && {
                GOTRUE_URI_ALLOW_LIST: Array.isArray(uriAllowList)
                  ? uriAllowList.join(',')
                  : uriAllowList,
              }),
            }}
            secrets={{
              PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
              GOTRUE_JWT_SECRET: { secret: jwtBundleName, key: 'jwtSecret' },
            }}
          />
          <WebService
            name={`${name}-postgrest`}
            namespace={namespace}
            image="postgrest/postgrest:v12"
            port={3000}
            replicas={replicas}
            resources={resources}
            probes={{
              liveness: { path: '/' },
              readiness: { path: '/' },
            }}
            env={{
              PGRST_SERVER_PORT: '3000',
              PGRST_DB_URI: dbUri,
              PGRST_DB_SCHEMAS: 'public,storage,graphql_public',
              PGRST_DB_ANON_ROLE: 'anon',
              PGRST_DB_USE_LEGACY_GUCS: 'false',
            }}
            secrets={{
              PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
              PGRST_JWT_SECRET: { secret: jwtBundleName, key: 'jwtSecret' },
            }}
          />
          <WebService
            name={`${name}-realtime`}
            namespace={namespace}
            image="supabase/realtime:v2"
            port={4000}
            replicas={replicas}
            resources={resources}
            probes={{
              liveness: { path: '/health' },
              readiness: { path: '/health' },
            }}
            env={{
              PORT: '4000',
              DB_HOST: dbHost,
              DB_PORT: '5432',
              DB_USER: name,
              DB_NAME: name,
              DB_ENC_KEY: 'supabaserealtime',
              SECURE_CHANNELS: 'true',
            }}
            secrets={{
              DB_PASSWORD: { secret: dbCredentialsName, key: 'password' },
              API_JWT_SECRET: { secret: jwtBundleName, key: 'jwtSecret' },
            }}
          />
          {storageApi && (
            <WebService
              name={`${name}-storage-api`}
              namespace={namespace}
              image="supabase/storage-api:v0"
              port={5000}
              replicas={replicas}
              resources={resources}
              probes={{
                liveness: { path: '/status' },
                readiness: { path: '/status' },
              }}
              env={{
                PORT: '5000',
                DATABASE_URL: dbUri,
                STORAGE_BACKEND: 's3',
                GLOBAL_S3_BUCKET: objectStorage.bucket,
                GLOBAL_S3_ENDPOINT: objectStorage.endpoint,
                GLOBAL_S3_REGION: region,
                GLOBAL_S3_FORCE_PATH_STYLE: 'true',
                IMGPROXY_URL: `http://${name}-imgproxy:8080`,
                FILE_SIZE_LIMIT: '50GiB',
              }}
              secrets={{
                PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
                PGRST_JWT_SECRET: { secret: jwtBundleName, key: 'jwtSecret' },
                ANON_KEY: { secret: jwtBundleName, key: 'anonKey' },
                SERVICE_KEY: { secret: jwtBundleName, key: 'serviceRoleKey' },
                GLOBAL_S3_ACCESS_KEY: {
                  secret: objectStorage.credentialsSecret,
                  key: 'accessKey',
                },
                GLOBAL_S3_SECRET_KEY: {
                  secret: objectStorage.credentialsSecret,
                  key: 'secretKey',
                },
              }}
            />
          )}
        </>
      ),
    })
  )

  // --- ImgProxy — image transforms for the Storage API ------------------------
  // Stateful-free image resizer; no database or secrets needed.
  resources_.push(
    <WebService
      name={`${name}-imgproxy`}
      namespace={namespace}
      image="darthsim/imgproxy:v3"
      port={8080}
      replicas={replicas}
      resources={resources}
      probes={{
        liveness: { path: '/health' },
        readiness: { path: '/health' },
      }}
      env={{
        IMGPROXY_ALLOW_ORIGIN: '*',
        IMGPROXY_ENABLE_WEBP_DETECTION: 'true',
        IMGPROXY_MAX_SRC_RESOLUTION: '50',
      }}
    />
  )

  // --- Endpoints — one host, path-based routes --------------------------------
  // The REST root (PostgREST) serves `/`; GoTrue, Realtime and Storage API
  // are exposed as Prefix routes on the same host so clients use a single
  // origin (`/auth/v1`, `/rest/v1`, `/realtime/v1`, `/storage/v1`).
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={`${name}-postgrest`}
      servicePort={3000}
      tls={tls}
    />,
    <Endpoint
      name={`${name}-auth-endpoint`}
      namespace={namespace}
      host={host}
      path="/auth/v1"
      serviceName={`${name}-gotrue`}
      servicePort={9999}
      tls={tls}
    />,
    <Endpoint
      name={`${name}-rest-endpoint`}
      namespace={namespace}
      host={host}
      path="/rest/v1"
      serviceName={`${name}-postgrest`}
      servicePort={3000}
      tls={tls}
    />,
    <Endpoint
      name={`${name}-realtime-endpoint`}
      namespace={namespace}
      host={host}
      path="/realtime/v1"
      serviceName={`${name}-realtime`}
      servicePort={4000}
      tls={tls}
      annotations={{
        'nginx.ingress.kubernetes.io/proxy-buffering': 'off',
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '3600',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '3600',
      }}
    />,
    storageApi && (
      <Endpoint
        name={`${name}-storage-endpoint`}
        namespace={namespace}
        host={host}
        path="/storage/v1"
        serviceName={`${name}-storage-api`}
        servicePort={5000}
        tls={tls}
      />
    )
  )

  return jsx(Fragment, { children: resources_ })
}
