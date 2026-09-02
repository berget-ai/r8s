import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database, WebService, Endpoint } from '@r8s/recipes'
import { RedisReplicationComponent } from '@r8s/crds/redis'

export interface N8nProps {
  /** Resource name (defaults to 'n8n') */
  name?: string
  /** Kubernetes namespace (inherited from Platform context when omitted) */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the editor and webhooks (required) */
  host: string
  /** Number of editor replicas when not running in queue mode (defaults to 1) */
  replicas?: number
  /**
   * Redis-backed queue mode. Adds a Redis master/replica set and a worker
   * Deployment so webhook ingestion and heavy executions scale independently.
   */
  queueMode?: boolean
  /** Queue worker replicas (defaults to 2, only used with queueMode) */
  workers?: number
  /** Storage request for the CNPG Postgres cluster (defaults to '10Gi') */
  storage?: string
  /**
   * Name of an existing Secret containing key `encryptionKey`. n8n
   * encrypts all workflow credentials with this key — lose it and every
   * stored credential is unreadable.
   *
   * Required unless a secrets backend (openbao/vault) is configured on
   * the surrounding Platform — the backend then provisions the key
   * automatically. Plaintext keys are not supported.
   */
  encryptionKeySecretName?: string
  /** Requested editor resources */
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
 * n8n — fair-code workflow automation.
 *
 * @title N8n
 * @category Automation
 *
 * Composes:
 * - CNPG Postgres cluster (workflows, executions, stored credentials)
 * - n8n editor Deployment + Service + Endpoint (webhooks share the host)
 * - Redis cluster + worker Deployment in queue mode
 * - Encryption key provisioned through the Platform secrets backend
 *   (openbao / vault), or referenced from an existing Secret
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the N8N_ENCRYPTION_KEY is provisioned for you. Without a backend you
 * must point `encryptionKeySecretName` at a pre-created Secret.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { N8n } from '@r8s/n8n'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <N8n name="n8n" host="n8n.example.com" queueMode workers={3} />
 *   </Platform>
 * )
 */
export function N8n(props: N8nProps) {
  const {
    name = 'n8n',
    namespace: namespaceProp,
    version = 'latest',
    host,
    replicas = 1,
    queueMode = false,
    workers = 2,
    storage = '10Gi',
    encryptionKeySecretName,
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

  const dbCredentialsName = `${name}-db-credentials`
  const encryptionSecretName = encryptionKeySecretName ?? `${name}-encryption-key`

  // --- Secret provisioning -------------------------------------------------
  // The encryption key is the crown jewel of an n8n install — never render
  // it as plaintext. With a secrets backend it is provisioned through the
  // backend (key `encryptionKey`); otherwise reference a pre-created Secret.
  if (!encryptionKeySecretName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `N8n "${name}" requires an encryption key.\n` +
          `\n` +
          `n8n encrypts all workflow credentials with N8N_ENCRYPTION_KEY — ` +
          `it must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'n8n' }}>\n` +
          `    <N8n name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (key: encryptionKey):\n` +
          `  <N8n name="${name}" host="${host}" encryptionKeySecretName="${name}-encryption-key" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/encryption`,
      destination: { create: true, name: encryptionSecretName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-encryption`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-encryption`, namespace },
            spec,
          })
    )
  }

  // --- Operators ------------------------------------------------------------
  if (queueMode && !sharedOperators.some((op) => op.name === OPERATOR_REDIS)) {
    resources_.push(declareOperator(operators[OPERATOR_REDIS]()))
  }

  // --- Database (CNPG) — workflows, executions, stored credentials ----------
  const dbHost = `${name}-rw`

  const sharedEnv = {
    DB_TYPE: 'postgresdb',
    DB_POSTGRESDB_HOST: dbHost,
    DB_POSTGRESDB_PORT: '5432',
    DB_POSTGRESDB_DATABASE: name,
    DB_POSTGRESDB_USER: name,
    N8N_HOST: host,
    N8N_PORT: '5678',
    N8N_PROTOCOL: 'https',
    WEBHOOK_URL: `https://${host}/`,
    NODE_FUNCTION_ALLOW_BUILTIN: '*',
    // Binary data must live in Postgres in queue mode — the filesystem
    // backend is not shared across editors/workers and is unsupported.
    N8N_DEFAULT_BINARY_DATA_MODE: 'default',
  }

  const sharedSecrets = {
    DB_POSTGRESDB_PASSWORD: { secret: dbCredentialsName, key: 'password' },
    N8N_ENCRYPTION_KEY: { secret: encryptionSecretName, key: 'encryptionKey' },
  }

  if (queueMode) {
    Object.assign(sharedEnv, {
      EXECUTIONS_MODE: 'queue',
      QUEUE_BULL_REDIS_HOST: `${name}-redis`,
      QUEUE_BULL_REDIS_PORT: '6379',
    })
  }

  if (!queueMode && replicas > 1) {
    throw new Error(
      `N8n "${name}" requested replicas={${replicas}} without queue mode.\n` +
        `\n` +
        `Multiple main instances without Redis queue mode run every trigger ` +
        `execution once per replica (duplicated webhooks and schedules).\n` +
        `\n` +
        `Fix: enable queue mode:\n` +
        `  <N8n name="${name}" host="${host}" queueMode workers={${replicas}} />\n` +
        `\n` +
        `Or keep a single main instance (workers handle executions in queue mode).`
    )
  }

  // Database wraps the editor so credentials stay consistent with the
  // r8s Database recipe (CNPG dedicated cluster provisions the secret).
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage,
      children: (
        <WebService
          name={name}
          namespace={namespace}
          image={`docker.n8n.io/n8nio/n8n:${version}`}
          port={5678}
          replicas={queueMode ? 1 : replicas}
          resources={resources}
          probes={{
            liveness: { path: '/healthz' },
            readiness: { path: '/healthz', initialDelaySeconds: 15 },
          }}
          env={{ ...sharedEnv, ...(queueMode ? {} : { N8N_CONCURRENCY_PRODUCTION_LIMIT: '10' }) }}
          secrets={sharedSecrets}
        />
      ),
    })
  )

  // --- Queue mode: Redis + workers ------------------------------------------
  if (queueMode) {
    // Bull (n8n's queue backend) speaks plain Redis protocol — use a
    // master/replica topology, not a Redis cluster (no MOVED-safe client)
    resources_.push(
      RedisReplicationComponent({
        metadata: { name: `${name}-redis`, namespace },
        spec: {
          clusterSize: 3,
          kubernetesConfig: { image: 'redis:7.2-alpine' },
        },
      })
    )

    resources_.push(
      <WebService
        name={`${name}-worker`}
        namespace={namespace}
        image={`docker.n8n.io/n8nio/n8n:${version}`}
        port={5678}
        replicas={workers}
        command={['n8n', 'worker', '--concurrency=10']}
        resources={{
          requests: { memory: '512Mi', cpu: '250m' },
          limits: { memory: '2Gi', cpu: '2000m' },
        }}
        probes={{
          liveness: { path: '/healthz' },
          readiness: { path: '/healthz', initialDelaySeconds: 20 },
        }}
        env={{ ...sharedEnv, QUEUE_HEALTH_CHECK_ACTIVE: 'true' }}
        secrets={sharedSecrets}
      />
    )
  }

  // --- Endpoint — webhooks share the editor host -----------------------------
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={5678}
      tls={tls}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
