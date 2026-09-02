import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database, WebService, Endpoint } from '@r8s/recipes'
import { RedisReplicationComponent } from '@r8s/crds/redis'
import type { SecretRef } from '@r8s/recipes'

export interface OutlineProps {
  /** Resource name (defaults to 'outline') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the wiki */
  host: string
  /** Storage request for the CNPG Postgres cluster (defaults to '10Gi') */
  storage?: string
  /** Number of replicas (Outline is stateless — scale freely) */
  replicas?: number
  /** Provision a Redis cluster for the queue and rate limiting (default: true) */
  cache?: boolean
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
   * Auth recipe) and reference the client secret through the backend.
   */
  sso?: {
    issuer: string
    clientId: string
    clientSecretRef: SecretRef
    scopes?: string
  }
  /**
   * Name of an existing Secret holding `secretKey` and `utilsSecret`.
   * Required unless a secrets backend (openbao/vault) is configured on
   * the surrounding Platform — the backend then provisions them.
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
    version = 'latest',
    host,
    storage = '10Gi',
    replicas = 1,
    cache = true,
    objectStorage,
    sso,
    secretsName,
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const sharedOperators = useContext(OperatorContext)
  const secretProvider = useContext(SecretContext)
  // Inherit namespace from <Platform> context — mirrors recipes/database.tsx
  const contextNamespace = useContext(Namespace)
  const namespace =
    namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'
  const resources_: ReturnType<typeof jsx>[] = []

  const dbHost = `${name}-rw`
  const dbCredentialsName = `${name}-db-credentials`
  const platformSecretsName = secretsName ?? `${name}-app-secrets`

  // --- App secrets (SECRET_KEY / UTILS_SECRET) ------------------------------
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Outline "${name}" requires application secrets (SECRET_KEY, UTILS_SECRET).\n` +
          `\n` +
          `These must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Outline name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: secretKey, utilsSecret):\n` +
          `  <Outline name="${name}" host="${host}" secretsName="${name}-app-secrets" />`
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

  // --- Operators -------------------------------------------------------------
  if (cache && !sharedOperators.some((op) => op.name === OPERATOR_REDIS)) {
    resources_.push(declareOperator(operators[OPERATOR_REDIS]()))
  }

  // Redis — queue + rate limiting (OT-Container-Kit operator)
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

  // --- Env wiring --------------------------------------------------------------
  // Every credential is referenced with $(VAR) expansion or secretKeyRef —
  // no plaintext in the manifest. The WebService declares secret-backed
  // vars before plain env vars, so dependent expansion resolves.
  const env: Record<string, string> = {
    PORT: '3000',
    // Deterministic parts inlined; password arrives via PGPASSWORD
    DATABASE_URL: `postgresql://${name}:$(PGPASSWORD)@${dbHost}:5432/${name}`,
    SECRET_KEY: '$(SECRET_KEY)',
    UTILS_SECRET: '$(UTILS_SECRET)',
    URL: `https://${host}`,
    APP_URL: `https://${host}`,
    PROXY_HEADERS_TRUSTED: 'true',
    ...(cache ? { REDIS_URL: `redis://${name}-redis:6379` } : {}),
    ...(objectStorage
      ? {
          FILE_STORAGE: 's3',
          AWS_REGION: objectStorage.region ?? 'us-east-1',
          AWS_S3_UPLOAD_BUCKET_URL: `${objectStorage.endpoint}/${objectStorage.bucket}`,
          AWS_S3_UPLOAD_BUCKET_NAME: objectStorage.bucket,
          AWS_S3_FORCE_PATH_STYLE: 'true',
          AWS_S3_ACL: 'private',
        }
      : {}),
    ...(sso
      ? {
          OIDC_ISSUER: sso.issuer,
          OIDC_CLIENT_ID: sso.clientId,
          OIDC_CLIENT_SECRET: '$(OIDC_CLIENT_SECRET)',
          OIDC_SCOPES: sso.scopes ?? 'openid email profile',
          OIDC_AUTH_URI: '$(OIDC_ISSUER)/protocol/openid-connect/auth',
          OIDC_TOKEN_URI: '$(OIDC_ISSUER)/protocol/openid-connect/token',
          OIDC_USERINFO_URI: '$(OIDC_ISSUER)/protocol/openid-connect/userinfo',
        }
      : {}),
  }

  // Credentials delivered via secretKeyRef (runtime injection)
  const secrets: Record<string, SecretRef | string> = {
    SECRET_KEY: { secret: platformSecretsName, key: 'secretKey' },
    UTILS_SECRET: { secret: platformSecretsName, key: 'utilsSecret' },
    PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
    ...(objectStorage
      ? {
          AWS_ACCESS_KEY_ID: { secret: objectStorage.credentialsSecret, key: 'accessKey' },
          AWS_SECRET_ACCESS_KEY: { secret: objectStorage.credentialsSecret, key: 'secretKey' },
        }
      : {}),
    ...(sso ? { OIDC_CLIENT_SECRET: sso.clientSecretRef } : {}),
  }

  // --- Database + app + endpoint ------------------------------------------------
  // Database wraps the app so credentials stay consistent with the r8s
  // Database recipe (CNPG dedicated cluster provisions the secret).
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage,
      children: (
        <WebService
          name={name}
          namespace={namespace}
          image={`outlinewiki/outline:${version}`}
          port={3000}
          replicas={replicas}
          resources={resources}
          probes={{ liveness: { tcp: true }, readiness: { tcp: true, initialDelaySeconds: 15 } }}
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
    />
  )

  return jsx(Fragment, { children: resources_ })
}
