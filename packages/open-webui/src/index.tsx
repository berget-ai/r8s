import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext, SecretContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database, Endpoint } from '@r8s/recipes'
import type { SecretRef } from '@r8s/recipes'
import { RedisReplicationComponent } from '@r8s/crds/redis'
import { Deployment, Service, EnvVar, PersistentVolumeClaim } from '@r8s/k8s-types'

export interface OpenWebuiProps {
  /** Resource name (defaults to 'open-webui') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the chat UI (required) */
  host: string
  /**
   * Number of replicas (defaults to 1). Multiple replicas need a shared
   * object store for uploads/RAG (this recipe errors when `storage` is
   * set with replicas > 1 — its PVC is ReadWriteOnce) and Redis-backed
   * websocket coordination (WEBSOCKET_MANAGER=redis + REDIS_URL).
   */
  replicas?: number
  /**
   * PVC size for uploads and RAG document storage (e.g. '10Gi'). When set,
   * a `${name}-uploads` PersistentVolumeClaim is rendered and mounted at
   * /app/backend/data. WebService cannot express volume mounts, which is
   * why this component composes a raw Deployment (probes /health:8080).
   * The PVC is ReadWriteOnce — combining this with replicas > 1 throws
   * (single-node attach); multi-replica installs must move files/RAG to
   * an S3-compatible store and set WEBSOCKET_MANAGER=redis.
   */
  storage?: string
  /**
   * OpenAI-compatible API base URL for the model backend (defaults to
   * 'https://api.berget.ai/v1'). The key itself is never passed as a
   * prop — it arrives via secretKeyRef from the secrets bundle below.
   */
  backend?: string
  /**
   * Name of an existing Secret holding `modelApiKey` (the key used to
   * call `backend`) and `secretKey` (the WEBUI_SECRET_KEY used to sign
   * auth tokens). Required unless a secrets backend (openbao/vault) is
   * configured on the surrounding Platform — the backend then provisions
   * both keys automatically. Plaintext keys are not supported.
   */
  secretsName?: string
  /**
   * OAuth/OIDC SSO client — register Open WebUI as a client in Keycloak
   * (the Auth recipe) and reference the client secret through the backend.
   * Uses the upstream OAUTH_* env names; OPENID_PROVIDER_URL carries the
   * issuer (Open WebUI appends /.well-known/openid-configuration itself).
   */
  sso?: {
    /** OIDC discovery issuer, e.g. https://keycloak.example.com/realms/platform */
    issuer: string
    /** Client id registered at the issuer (non-sensitive) */
    clientId: string
    /** Reference to the Kubernetes Secret holding the client secret */
    clientSecretRef: SecretRef
    /** Scope list (defaults to 'openid email profile') */
    scopes?: string
  }
  /** Provision a redis-backed replication group for caching/events (default: false) */
  cache?: boolean
  /**
   * Air-gapped installs: sets OFFLINE_MODE (disable runtime model/param
   * fetches), removes the update checks and disables the native Ollama
   * API — only OpenAI-compatible backends are served (default: false).
   */
  offline?: boolean
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
 * Open WebUI — self-hosted chat frontend for OpenAI-compatible backends.
 *
 * @title OpenWebui
 * @category AI & Chat
 *
 * Composes:
 * - CNPG Postgres cluster (users, chats, presets) via the Database recipe
 * - Open WebUI Deployment + Service + Endpoint (websocket-friendly
 *   proxy annotations; works through Ingress or Envoy Gateway)
 * - Optional PVC for uploaded files and RAG documents
 *   (`${name}-uploads` mounted at /app/backend/data)
 * - Optional redis replication group for caching (`cache`,
 *   service ${name}-redis)
 * - Model API key + WEBUI_SECRET_KEY provisioned through the Platform
 *   secrets backend (openbao / vault), or referenced from an existing
 *   Secret
 * - OAuth/OIDC SSO against the Keycloak `Auth` recipe
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the OPENAI_API_KEY / WEBUI_SECRET_KEY pair is provisioned for you.
 * Without a backend you must point `secretsName` at a pre-created Secret.
 * The Perplexity-style "search the web" extras are not wired — only
 * OPENAI-models via the OpenAI-compatible `backend`.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { OpenWebui } from '@r8s/open-webui'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <OpenWebui
 *       name="chat"
 *       host="chat.example.com"
 *       version="v0.6.5"
 *       storage="10Gi"
 *     />
 *   </Platform>
 * )
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { OpenWebui } from '@r8s/open-webui'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <OpenWebui
 *       name="chat"
 *       host="chat.example.com"
 *       storage="10Gi"
 *       cache
 *       sso={{
 *         issuer: 'https://keycloak.example.com/realms/platform',
 *         clientId: 'open-webui',
 *         clientSecretRef: { secret: 'chat-sso', key: 'clientSecret' },
 *       }}
 *     />
 *   </Platform>
 * )
 */
export function OpenWebui(props: OpenWebuiProps) {
  const {
    name = 'open-webui',
    namespace = 'default',
    version = 'latest',
    host,
    replicas = 1,
    storage,
    backend = 'https://api.berget.ai/v1',
    secretsName,
    sso,
    cache = false,
    offline = false,
    resources = {
      requests: { memory: '1Gi', cpu: '500m' },
      limits: { memory: '4Gi', cpu: '2000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const sharedOperators = useContext(OperatorContext)
  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  // --- Validation -----------------------------------------------------------
  // The uploads PVC is ReadWriteOnce: a single volume can only be attached
  // to one node at a time, so extra replicas with `storage` set would
  // crash-loop. Multi-replica installs are viable only with a shared
  // S3-compatible object store and WEBSOCKET_MANAGER=redis for socket
  // fan-out.
  if (storage && replicas > 1) {
    throw new Error(
      `OpenWebui "${name}" cannot combine storage with replicas > 1.\n` +
        `\n` +
        `The ${name}-uploads PVC is ReadWriteOnce and Open WebUI keeps ` +
        `uploads/RAG on it — mounting it on multiple nodes is impossible, ` +
        `so extra replicas would stay Unschedulable or crash-loop. ` +
        `Multi-replica deployments also need WEBSOCKET_MANAGER=redis plus a ` +
        `REDIS_URL for socket coordination.\n` +
        `\n` +
        `Fix: either run a single replica alongside the PVC:\n` +
        `  <OpenWebui name="${name}" host="${host}" storage="${storage}" replicas={1} />\n` +
        `\n` +
        `Or drop the storage prop and move uploads to S3-compatible storage ` +
        `with a Redis instance (cache) before scaling out:\n` +
        `  <OpenWebui name="${name}" host="${host}" replicas={3} cache />`
    )
  }

  const dbHost = `${name}-rw`
  const dbCredentialsName = `${name}-db-credentials`
  const appSecretsName = secretsName ?? `${name}-secrets`

  // --- Secret provisioning -------------------------------------------------
  // The model API key and the WEBUI_SECRET_KEY are the crown jewels of an
  // Open WebUI install — never render them as plaintext. With a secrets
  // backend they are provisioned through the backend (keys `modelApiKey`
  // and `secretKey`); otherwise reference a pre-created Secret.
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `OpenWebui "${name}" requires application secrets (OPENAI_API_KEY, WEBUI_SECRET_KEY).\n` +
          `\n` +
          `The model API key for "${backend}" and the auth-token signing key must ` +
          `not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <OpenWebui name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: modelApiKey, secretKey):\n` +
          `  <OpenWebui name="${name}" host="${host}" secretsName="${name}-secrets" />`
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

  // --- Operators ------------------------------------------------------------
  if (cache && !sharedOperators.some((op) => op.name === OPERATOR_REDIS)) {
    resources_.push(declareOperator(operators[OPERATOR_REDIS]()))
  }

  // Redis — caching (OT-Container-Kit operator). A replication group so
  // the single ${name}-redis master service fronts a 3-node replication
  // set (1 master + 2 replicas) instead of a lone stateful pod.
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

  // --- Uploads/RAG PVC --------------------------------------------------------
  // WebService cannot mount volumes, so the app controller below is a raw
  // Deployment. The PVC is rendered alongside and bound when `storage` is
  // set. Without it, uploaded files and RAG documents are lost on restart.
  if (storage) {
    const pvc: PersistentVolumeClaim = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: `${name}-uploads`, namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage } },
      },
    }
    resources_.push(jsx('PersistentVolumeClaim', pvc))
  }

  // --- Env wiring --------------------------------------------------------------
  // Every credential arrives via secretKeyRef — declared BEFORE plain env
  // vars in the container env array, so Kubernetes dependent-variable
  // expansion resolves the $(VAR) templates below at runtime.
  const secretRefs: Record<string, SecretRef | string> = {
    PGPASSWORD: { secret: dbCredentialsName, key: 'password' },
    OPENAI_API_KEY: { secret: appSecretsName, key: 'modelApiKey' },
    WEBUI_SECRET_KEY: { secret: appSecretsName, key: 'secretKey' },
    ...(sso ? { OAUTH_CLIENT_SECRET: sso.clientSecretRef } : {}),
  }

  const envVars: EnvVar[] = []
  for (const [envName, ref] of Object.entries(secretRefs)) {
    const typed = typeof ref === 'string' ? { secret: ref } : ref
    envVars.push({
      name: envName,
      valueFrom: { secretKeyRef: { name: typed.secret, key: typed.key ?? envName } },
    })
  }

  const env: Record<string, string> = {
    WEBUI_URL: `https://${host}`,
    ENABLE_OPENAI_API: 'true',
    // This recipe targets OpenAI-compatible backends only — the native
    // Ollama API discovery stays off (offline mode forces the same).
    ENABLE_OLLAMA_API: 'false',
    OPENAI_API_BASE_URL: backend,
    // Deterministic parts inlined; the password arrives via $(PGPASSWORD)
    // (secret-backed var declared first in the env array).
    DATABASE_URL: `postgresql://${name}:$(PGPASSWORD)@${dbHost}:5432/${name}`,
    ...(cache ? { REDIS_URL: `redis://${name}-redis:6379` } : {}),
    // Upstream OAUTH_* names; ENABLE_OAUTH_SIGNUP (default true) governs
    // whether local-password login is offered alongside the SSO flow.
    ...(sso
      ? {
          ENABLE_OAUTH_SIGNUP: 'true',
          OPENID_PROVIDER_URL: sso.issuer,
          OAUTH_CLIENT_ID: sso.clientId,
          OPENID_REDIRECT_URI: `https://${host}/oauth/oidc/callback`,
          OAUTH_SCOPES: sso.scopes ?? 'openid email profile',
        }
      : {}),
    ...(offline
      ? {
          OFFLINE_MODE: 'true',
          ENABLE_UPDATE_CHECK: 'false',
        }
      : {}),
  }
  for (const [key, value] of Object.entries(env)) {
    envVars.push({ name: key, value })
  }

  // --- App controller (raw Deployment — WebService cannot mount volumes) -----
  // Generous probe delays/failures: first-boot runs Alembic migrations
  // against Postgres before /health starts answering.
  const deployment: Deployment = {
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
              name: 'open-webui',
              image: `ghcr.io/open-webui/open-webui:${version}`,
              imagePullPolicy: 'Always',
              ports: [{ containerPort: 8080 }],
              env: envVars,
              resources,
              livenessProbe: {
                httpGet: { path: '/health', port: 8080 },
                initialDelaySeconds: 30,
                periodSeconds: 10,
                failureThreshold: 6,
              },
              readinessProbe: {
                httpGet: { path: '/health', port: 8080 },
                initialDelaySeconds: 30,
                periodSeconds: 5,
                failureThreshold: 6,
              },
              ...(storage && {
                volumeMounts: [{ name: 'uploads', mountPath: '/app/backend/data' }],
              }),
            },
          ],
          ...(storage && {
            volumes: [{ name: 'uploads', persistentVolumeClaim: { claimName: `${name}-uploads` } }],
          }),
        },
      },
    },
  }

  // Database parent wraps the app so the CNPG cluster, its credentials
  // secret (${name}-db-credentials) and connection conventions stay
  // consistent with the r8s Database recipe. The raw Deployment sets
  // DATABASE_URL statically (the WebService auto-PG block does not apply).
  resources_.push(
    jsx(Database, { backup: false, name, namespace, storage: '10Gi', children: jsx('Deployment', deployment) })
  )

  // --- Service -----------------------------------------------------------------
  const service: Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name, namespace },
    spec: {
      type: 'ClusterIP',
      selector: { app: name },
      ports: [{ port: 8080, targetPort: 8080 }],
    },
  }
  resources_.push(jsx('Service', service))

  // --- Endpoint — websocket-friendly proxy timeouts ------------------------------
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={8080}
      tls={tls}
      annotations={{
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '300',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '300',
      }}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
