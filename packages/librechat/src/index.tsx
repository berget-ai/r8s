import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext, SecretContext } from '@r8s/core/defaults'
import { WebService, Endpoint } from '@r8s/recipes'
import { RedisReplicationComponent } from '@r8s/crds/redis'
import { declareIfMissing } from '@r8s/operator-redis'
import type { SecretRef } from '@r8s/recipes'
import type { ConfigMap, EnvVar } from '@r8s/k8s-types'

export interface MongoConnection {
  /** MongoDB host (cluster-internal service or external host) */
  host: string
  /** MongoDB port (defaults to 27017) */
  port?: number
  /**
   * Database username. Inlined as a plain env var — usernames are
   * identifiers, not secrets (same convention as the n8n/outline DB
   * recipes). When omitted, the username is read from the password
   * secret (key: `username`).
   */
  username?: string
  /**
   * Name of an existing Secret holding the MongoDB credentials.
   * Keys: `username`, `password`.
   */
  passwordSecret: string
  /**
   * authSource query parameter appended to MONGO_URI when set
   * (e.g. 'admin' for databases authenticating against the admin db).
   */
  authSource?: string
}

export interface LibreChatProps {
  /** Resource name (defaults to 'librechat') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the chat UI (required) */
  host: string
  /** Port the app listens on in-container (defaults to 3080) */
  port?: number
  /** Number of replicas (defaults to 1) */
  replicas?: number
  /**
   * External MongoDB connection (REQUIRED). LibreChat stores users,
   * conversations and messages in MongoDB — this component does NOT
   * provision it. Run MongoDB separately (replica-set StatefulSet,
   * operator or managed service) and point this prop at it.
   */
  mongodb: MongoConnection
  /** Provision a redis replication group for session caching (default: true) */
  cache?: boolean
  /**
   * Add a Meilisearch sidecar service for full-text / RAG search
   * (default: false). MEILI_MASTER_KEY is shared from the app secrets
   * bundle (key: meiliMasterKey). Sets SEARCH=true on the app so it
   * actually queries the meilisearch instance.
   */
  search?: boolean
  /**
   * OIDC SSO client — register LibreChat as a client in Keycloak (the
   * Auth recipe) and reference the client secret through the backend.
   * Uses the upstream OPENID_* env names; ALLOW_SOCIAL_LOGIN plus
   * DOMAIN_SERVER/DOMAIN_CLIENT are set from `host`.
   */
  sso?: {
    issuer: string
    clientId: string
    clientSecretRef: SecretRef
    scopes?: string
  }
  /** OpenAI-compatible API base URL for model calls (defaults to https://api.berget.ai/v1) */
  backend?: string
  /**
   * Name of an existing Secret holding `secretKey`, `modelApiKey`,
   * the multi-user session credentials `jwtSecret`, `jwtRefreshSecret`,
   * `credsKey`, `credsIv` — and `meiliMasterKey` when `search` is enabled.
   *
   * Hex sizing: jwtSecret / jwtRefreshSecret / credsKey are 64 hex chars
   * (32 bytes); credsIv is 32 hex chars (16 bytes — AES-IV).
   *
   * Required unless a secrets backend (openbao/vault) is configured on
   * the surrounding Platform — the backend then provisions them.
   * Plaintext secrets are not supported.
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

/**
 * LibreChat — multi-model AI chat UI with external MongoDB, Redis
 * sessions, optional Meilisearch and OIDC SSO.
 *
 * @title LibreChat
 * @category AI & Chat
 *
 * Composes:
 * - LibreChat Deployment + Service + Endpoint (MongoDB is provisioned
 *   externally — pass its coordinates via the required `mongodb` prop)
 * - Redis replication group for session caching (default on, service
 *   ${name}-redis; USE_REDIS=true points sessions at it)
 * - Optional Meilisearch Deployment + Service for message/RAG search
 *   (SEARCH=true wires the app to it)
 * - SECRET_KEY / OPENAI_API_KEY / JWT + CREDS session credentials /
 *   MEILI_MASTER_KEY provisioned through the Platform secrets backend
 *   (openbao / vault), or referenced from an existing Secret
 * - OIDC SSO against the Keycloak `Auth` recipe
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the app secrets bundle (keys: secretKey, modelApiKey, jwtSecret,
 * jwtRefreshSecret, credsKey, credsIv, meiliMasterKey) is provisioned
 * for you. Without a backend you must point `secretsName` at a
 * pre-created Secret. MongoDB itself is NOT provisioned here — run it
 * separately and connect via `mongodb`.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { LibreChat } from '@r8s/librechat'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <LibreChat
 *       name="chat"
 *       host="chat.example.com"
 *       mongodb={{ host: 'mongo.data.svc.cluster.local', passwordSecret: 'chat-mongodb-credentials' }}
 *       sso={{
 *         issuer: 'https://keycloak.example.com/realms/platform',
 *         clientId: 'librechat',
 *         clientSecretRef: { secret: 'librechat-sso', key: 'clientSecret' },
 *       }}
 *     />
 *   </Platform>
 * )
 */
export function LibreChat(props: LibreChatProps) {
  const {
    name = 'librechat',
    namespace = 'default',
    version = 'latest',
    host,
    port = 3080,
    replicas = 1,
    mongodb,
    cache = true,
    search = false,
    sso,
    backend = 'https://api.berget.ai/v1',
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

  const appSecretsName = secretsName ?? `${name}-secrets`

  // --- Secret provisioning ---------------------------------------------------
  // SECRET_KEY signs sessions, modelApiKey pays for inference, the JWT +
  // CREDS keys carry multi-user login state and meiliMasterKey guards the
  // search index — none of them may be rendered as plaintext. With a
  // secrets backend the bundle (keys: secretKey, modelApiKey, jwtSecret,
  // jwtRefreshSecret, credsKey, credsIv, meiliMasterKey) is provisioned
  // through the backend; otherwise reference a pre-created Secret.
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `LibreChat "${name}" requires application secrets (SECRET_KEY, modelApiKey).\n` +
          `\n` +
          `These must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <LibreChat name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: secretKey, modelApiKey, jwtSecret, jwtRefreshSecret, credsKey, credsIv` +
          `${search ? ', meiliMasterKey' : ''}):\n` +
          `  <LibreChat name="${name}" host="${host}" secretsName="${name}-secrets" />`
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

  // --- Operators --------------------------------------------------------------
  if (cache) {
    resources_.push(...declareIfMissing(sharedOperators))
  }

  // Redis — session cache (OT-Container-Kit operator). A replication group
  // so the single ${name}-redis master service fronts a 3-node set.
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

  // --- Env wiring ----------------------------------------------------------------
  // Every credential is referenced via secretKeyRef — no plaintext and no
  // redundant $(VAR) self-echoes in the manifest. The WebService declares
  // secret-backed vars before plain env vars, so dependent expansion on
  // MONGO_URI resolves.
  const mongoPort = mongodb.port ?? 27017

  const env: Record<string, string> = {
    HOST: '0.0.0.0',
    PORT: String(port),
    // Deterministic parts inlined; credentials arrive via MONGO_USERNAME /
    // MONGO_PASSWORD declared earlier through secretKeyRef
    MONGO_URI:
      `mongodb://$(MONGO_USERNAME):$(MONGO_PASSWORD)@${mongodb.host}:${mongoPort}/${name}` +
      (mongodb.authSource ? `?authSource=${mongodb.authSource}` : ''),
    // LibreChat speaks to OpenAI-compatible backends through its reverse
    // proxy (there is no OPENAI_API_BASE_URL env upstream)
    OPENAI_REVERSE_PROXY: `${backend}/chat/completions`,
    ...(cache ? { USE_REDIS: 'true', REDIS_URI: `redis://${name}-redis:6379` } : {}),
    ...(search
      ? {
          SEARCH: 'true',
          MEILI_HOST: `http://${name}-meilisearch:7700`,
          MEILI_NO_SYNC: 'false',
        }
      : {}),
    ...(sso
      ? {
          ALLOW_SOCIAL_LOGIN: 'true',
          DOMAIN_SERVER: `https://${host}`,
          DOMAIN_CLIENT: `https://${host}`,
          OPENID_ISSUER: sso.issuer,
          OPENID_CLIENT_ID: sso.clientId,
          OPENID_SCOPES: sso.scopes ?? 'openid profile email',
          OPENID_CALLBACK_URL: `https://${host}/oauth/openid/callback`,
        }
      : {}),
  }

  // The username is an identifier, not a secret — when the caller supplies
  // it explicitly it is inlined as plain env; otherwise it is read from the
  // MongoDB credentials secret (key: username) like the password.
  if (mongodb.username) {
    env.MONGO_USERNAME = mongodb.username
  }

  // Credentials delivered via secretKeyRef (runtime injection). JWT_SECRET /
  // JWT_REFRESH_SECRET / CREDS_KEY / CREDS_IV back multi-user sessions:
  // per-user message encryption and refresh-token issuance need shared
  // random values across replicas. Hex sizing: jwtSecret, jwtRefreshSecret
  // and credsKey are 64 hex chars (32 bytes); credsIv is 32 hex chars
  // (16 bytes).
  const secrets: Record<string, SecretRef | string> = {
    ...(mongodb.username
      ? {}
      : { MONGO_USERNAME: { secret: mongodb.passwordSecret, key: 'username' } }),
    MONGO_PASSWORD: { secret: mongodb.passwordSecret, key: 'password' },
    SECRET_KEY: { secret: appSecretsName, key: 'secretKey' },
    OPENAI_API_KEY: { secret: appSecretsName, key: 'modelApiKey' },
    JWT_SECRET: { secret: appSecretsName, key: 'jwtSecret' },
    JWT_REFRESH_SECRET: { secret: appSecretsName, key: 'jwtRefreshSecret' },
    CREDS_KEY: { secret: appSecretsName, key: 'credsKey' },
    CREDS_IV: { secret: appSecretsName, key: 'credsIv' },
    ...(search ? { MEILI_MASTER_KEY: { secret: appSecretsName, key: 'meiliMasterKey' } } : {}),
    ...(sso ? { OPENID_CLIENT_SECRET: sso.clientSecretRef } : {}),
  }

  // --- Runtime config (non-secret) -------------------------------------------
  // REFRESH_TOKEN_EXPIRY is a plain TTL (7 days), not a credential — it is
  // rendered as a ConfigMap and injected via configMapKeyRef, keeping
  // plaintext env wiring (and the no-plaintext-secrets guardrail) clean.
  const configMapName = `${name}-config`
  const configMap: ConfigMap = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: configMapName, namespace },
    data: { REFRESH_TOKEN_EXPIRY: '604800' },
  }
  resources_.push(jsx('ConfigMap', configMap))

  // --- App + optional Meilisearch + endpoint --------------------------------------
  resources_.push(
    <WebService
      name={name}
      namespace={namespace}
      image={`ghcr.io/danny-avila/librechat:${version}`}
      port={port}
      replicas={replicas}
      resources={resources}
      env={env}
      secrets={secrets}
      rawEnv={[
        {
          name: 'REFRESH_TOKEN_EXPIRY',
          valueFrom: { configMapKeyRef: { name: configMapName, key: 'REFRESH_TOKEN_EXPIRY' } },
        } as EnvVar,
      ]}
    />
  )

  if (search) {
    resources_.push(
      <WebService
        name={`${name}-meilisearch`}
        namespace={namespace}
        image="getmeili/meilisearch:v1.6"
        port={7700}
        replicas={1}
        env={{ MEILI_NO_ANALYTICS: 'true', MEILI_ENV: 'production' }}
        secrets={{ MEILI_MASTER_KEY: { secret: appSecretsName, key: 'meiliMasterKey' } }}
        probes={{ liveness: { path: '/health' }, readiness: { path: '/health' } }}
        resources={{
          requests: { memory: '256Mi', cpu: '100m' },
          limits: { memory: '1Gi', cpu: '500m' },
        }}
      />
    )
  }

  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={port}
      tls={tls}
      annotations={{
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '300',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '300',
        'nginx.ingress.kubernetes.io/proxy-buffering': 'off',
      }}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
