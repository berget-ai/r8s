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
import { RedisReplicationComponent } from '@r8s/crds/redis'

export interface N8nProps {
  /** Resource name (defaults to 'n8n') */
  name?: string
  /** Kubernetes namespace (inherited from Platform context when omitted) */
  namespace?: string
  /**
   * Container image tag (defaults to a pinned release — see
   * https://github.com/n8n-io/n8n/releases when upgrading). Use 'latest'
   * only for throwaway environments.
   */
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
   * Persistent volume for `/home/node/.n8n` (workflow-local state).
   * Pass a size string ('5Gi', the facit default) or an object for more
   * control. When set: a RWO PVC is created, an initContainer fixes
   * ownership (1000:1000), the rollout strategy becomes Recreate, and
   * binary data is stored on the filesystem instead of Postgres.
   */
  dataStorage?: string | { size?: string; storageClass?: string }
  /**
   * CNPG backup configuration passed through to the Database recipe
   * (continuous WAL archiving + scheduled base backups).
   */
  backup?: DatabaseProps['backup']
  /**
   * Number of trusted proxy hops for client IP / rate limiting
   * (N8N_PROXY_HOPS). Defaults to 1 — trust the ingress one hop.
   */
  proxyHops?: number
  /**
   * Execution-data pruning (EXECUTIONS_DATA_PRUNE /
   * EXECUTIONS_DATA_MAX_AGE). Defaults to pruning data older than
   * 168 h (7 days). Set to false to disable.
   */
  pruning?: { maxAgeHours?: number } | false
  /**
   * Opt-in value for NODE_FUNCTION_ALLOW_BUILTIN (e.g. '*'). Deliberately
   * unset by default: granting workflows access to every builtin Node.js
   * module is a security-sensitive choice.
   */
  allowBuiltinNodeFunctions?: string
  /**
   * Tune the backend-provisioned encryption secret: vault path, key name,
   * and refresh/restart behaviour (default: refreshAfter '1h', restarts
   * the editor + workers on rotation).
   */
  encryptionSecret?: {
    path?: string
    key?: string
    refreshAfter?: string
    rolloutRestartTargets?: string[]
  }
  /** Extra annotations merged onto the Endpoint's IngressRoute/Ingress */
  endpointAnnotations?: Record<string, string>
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
    version = '2.35.5',
    host,
    replicas = 1,
    queueMode = false,
    workers = 2,
    storage = '10Gi',
    dataStorage,
    backup,
    proxyHops = 1,
    pruning = { maxAgeHours: 168 },
    allowBuiltinNodeFunctions,
    encryptionSecret,
    endpointAnnotations = {},
    encryptionKeySecretName,
    resources = {
      requests: { memory: '512Mi', cpu: '100m' },
      limits: { memory: '1Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const sharedOperators = useOperators()
  const secretProvider = useContext(SecretContext)
  const namespace = useNamespace(namespaceProp)
  const resources_: ReturnType<typeof jsx>[] = []

  const dbCredentialsName = `${name}-db-credentials`
  const encryptionSecretName = encryptionKeySecretName ?? `${name}-encryption-key`

  const encryptionKeyDestKey = encryptionSecret?.key ?? 'encryptionKey'

  // --- Secret provisioning -------------------------------------------------
  // The encryption key is the crown jewel of an n8n install — never render
  // it as plaintext. With a secrets backend it is provisioned through the
  // backend (key `encryptionKey`); otherwise reference a pre-created Secret.
  if (!encryptionKeySecretName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'N8n',
        name,
        'an encryption key — n8n encrypts all workflow credentials with N8N_ENCRYPTION_KEY',
        {
          propName: 'encryptionKeySecretName',
          exampleValue: `${name}-encryption-key`,
          keys: ['encryptionKey'],
        }
      )
    }

    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-encryption`,
        namespace,
        path: encryptionSecret?.path ?? `${secretProvider.path ?? name}/${name}/encryption`,
        secretName: encryptionSecretName,
        refreshAfter: encryptionSecret?.refreshAfter,
        keys: { [encryptionKeyDestKey]: encryptionKeyDestKey },
        // Rotate-in-place: restart pods on key changes so editors re-read
        // the key (stale keys break credential decryption silently)
        restart: encryptionSecret?.rolloutRestartTargets ?? [
          { kind: 'Deployment', name },
          ...(queueMode ? [{ kind: 'Deployment', name: `${name}-worker` }] : []),
        ],
      })
    )
  }

  // --- Operators ------------------------------------------------------------
  if (queueMode) {
    resources_.push(...maybeOperator('redis-operator', sharedOperators))
  }

  // --- Database (CNPG) — workflows, executions, stored credentials ----------
  const dbHost = `${name}-rw`

  const dataVolumeName = `${name}-data`
  const dataVolumeDef = dataStorage
    ? [{ name: dataVolumeName, persistentVolumeClaim: { claimName: dataVolumeName } }]
    : []
  const dataInitContainer = {
    name: 'fix-data-permissions',
    image: 'busybox:1.36',
    command: ['sh', '-c', 'chown -R 1000:1000 /data'],
    volumeMounts: [{ name: dataVolumeName, mountPath: '/data' }],
  }

  if (dataStorage) {
    const size = typeof dataStorage === 'string' ? dataStorage : (dataStorage.size ?? '5Gi')
    const storageClass = typeof dataStorage === 'object' ? dataStorage.storageClass : undefined
    resources_.push(
      jsx('PersistentVolumeClaim', {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: { name: dataVolumeName, namespace },
        spec: {
          accessModes: ['ReadWriteOnce'],
          ...(storageClass ? { storageClassName: storageClass } : {}),
          resources: { requests: { storage: size } },
        },
      })
    )
  }

  const sharedEnv: Record<string, string> = {
    DB_TYPE: 'postgresdb',
    DB_POSTGRESDB_HOST: dbHost,
    DB_POSTGRESDB_PORT: '5432',
    DB_POSTGRESDB_DATABASE: name,
    DB_POSTGRESDB_USER: name,
    N8N_HOST: host,
    N8N_PORT: '5678',
    N8N_PROTOCOL: 'https',
    WEBHOOK_URL: `https://${host}/`,
    // Trust the ingress (Endpoint/TLS) for client IPs/rate limiting
    N8N_PROXY_HOPS: String(proxyHops),
    // Binary data in Postgres for queue mode (shared across editor+workers);
    // filesystem when a data volume exists; Postgres otherwise (no volume
    // means /home/node/.n8n is ephemeral)
    N8N_DEFAULT_BINARY_DATA_MODE: queueMode ? 'default' : dataStorage ? 'filesystem' : 'default',
    ...(pruning
      ? {
          EXECUTIONS_DATA_PRUNE: 'true',
          EXECUTIONS_DATA_MAX_AGE: String(pruning.maxAgeHours ?? 168),
        }
      : {}),
    ...(allowBuiltinNodeFunctions
      ? { NODE_FUNCTION_ALLOW_BUILTIN: allowBuiltinNodeFunctions }
      : {}),
  }

  const sharedSecrets = {
    DB_POSTGRESDB_PASSWORD: { secret: dbCredentialsName, key: 'password' },
    N8N_ENCRYPTION_KEY: { secret: encryptionSecretName, key: encryptionKeyDestKey },
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
      backup: backup ?? false,
      children: (
        <WebService
          name={name}
          namespace={namespace}
          image={`docker.n8n.io/n8nio/n8n:${version}`}
          // Pinned tags are immutable — no need to re-pull on every start
          imagePullPolicy={version === 'latest' ? 'Always' : 'IfNotPresent'}
          port={5678}
          replicas={queueMode ? 1 : replicas}
          resources={resources}
          // RWO volume + in-place DB migrations on boot roll → Recreate
          strategy={dataStorage ? 'Recreate' : undefined}
          volumes={dataVolumeDef.length > 0 ? dataVolumeDef : undefined}
          volumeMounts={
            dataVolumeDef.length > 0
              ? [{ name: dataVolumeName, mountPath: '/home/node/.n8n' }]
              : undefined
          }
          initContainers={dataVolumeDef.length > 0 ? [dataInitContainer] : undefined}
          probes={{
            // n8n boots slowly after code upgrades (DB migrations); facit
            // probe timing keeps the pod alive through them
            liveness: { path: '/healthz', initialDelaySeconds: 60, periodSeconds: 30 },
            readiness: { path: '/healthz', initialDelaySeconds: 15, failureThreshold: 6 },
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
        imagePullPolicy={version === 'latest' ? 'Always' : 'IfNotPresent'}
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
      annotations={{
        // Long-lived webhook/queue connections (editor SSE, waiting webhooks)
        // die at the default 60 s proxy timeout — facit sets one hour
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '3600',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '3600',
        ...endpointAnnotations,
      }}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
