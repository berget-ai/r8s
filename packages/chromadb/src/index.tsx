import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { Database, Endpoint } from '@r8s/recipes'

export interface ChromaDbProps {
  /** Resource name (defaults to 'chromadb') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the vector API (required) */
  host: string
  /** Port Chroma listens on (defaults to 8000) */
  port?: number
  /**
   * Number of replicas (defaults to 1). The embedded data PVC is
   * ReadWriteOnce — extra replicas on other nodes cause Multi-Attach
   * errors; scale out only with a ReadWriteMany StorageClass via
   * `storageClassName` (required for `autoscaling`).
   */
  replicas?: number
  /** Persistent storage size for the embedded data volume (defaults to '50Gi') */
  storage?: string
  /** StorageClass for the data PersistentVolumeClaim (optional — cluster default) */
  storageClassName?: string
  /**
   * HTTP path for liveness/readiness probes (defaults to
   * '/api/v2/heartbeat' — the current image API). Set '/api/v1/heartbeat'
   * for older images still serving the v1 API.
   */
  probePath?: string
  /** Require token authentication for the server (defaults to false) */
  auth?: boolean
  /**
   * Name of an existing Secret holding key `token` — the Chroma server
   * auth credential. Required when `auth` is true, unless a secrets
   * backend (openbao/vault) is configured on the surrounding Platform —
   * the backend then provisions the token at path
   * `<path>/<name>/auth-token` (key: token). Plaintext credentials are
   * not supported.
   */
  authTokenSecretName?: string
  /** Autoscale the Deployment via a CPU-based HorizontalPodAutoscaler (defaults to false) */
  autoscaling?: boolean
  /** Provision a CNPG Postgres cluster as the metadata store (defaults to false) */
  pg?: boolean
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
 * ChromaDB — open-source vector database for AI embeddings.
 *
 * @title ChromaDb
 * @category AI & Embeddings
 *
 * Composes:
 * - PersistentVolumeClaim (`<name>-data`) mounted at /data for embedded
 *   persistence (Chroma's default persist directory in the official image)
 * - Chroma Deployment + Service (port 8000, heartbeat health checks,
 *   /api/v2/heartbeat by default — override with `probePath` for older
 *   v1-API images)
 * - Endpoint (nginx Ingress or Envoy Gateway depending on RoutingContext)
 * - Optional CNPG Postgres cluster for the metadata store (`pg`)
 * - Optional CPU-based HorizontalPodAutoscaler (`autoscaling`) — requires
 *   a ReadWriteMany StorageClass (`storageClassName` ending in 'rwx')
 * - Optional token auth (`auth`): provisioned at path
 *   `<path>/<name>/auth-token` through the Platform secrets backend
 *   (openbao / vault), or referenced from an existing Secret (key: token)
 *
 * ChromaDB has no dedicated operator — it runs as a plain Deployment.
 *
 * @example
 * import { ChromaDb } from '@r8s/chromadb'
 *
 * export default <ChromaDb name="vectors" host="vectors.example.com" />
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { ChromaDb } from '@r8s/chromadb'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'ai' }}>
 *     <ChromaDb
 *       name="vectors"
 *       host="vectors.example.com"
 *       storage="50Gi"
 *       replicas={2}
 *       storageClassName="nfs-rwx"
 *       pg
 *       autoscaling
 *       auth
 *     />
 *   </Platform>
 * )
 */
export function ChromaDb(props: ChromaDbProps) {
  const {
    name = 'chromadb',
    namespace = 'default',
    version = 'latest',
    host,
    port = 8000,
    replicas = 1,
    storage = '50Gi',
    storageClassName,
    probePath = '/api/v2/heartbeat',
    auth = false,
    authTokenSecretName,
    autoscaling = false,
    pg = false,
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const tokenSecretName = authTokenSecretName ?? `${name}-auth-token`

  // --- Autoscaling coherence --------------------------------------------------
  // The data PVC is ReadWriteOnce: a HorizontalPodAutoscaler scaling to
  // replicas on other nodes triggers Multi-Attach errors. Scaling out is
  // only safe on a ReadWriteMany StorageClass.
  if (autoscaling && !(storageClassName && storageClassName.toLowerCase().endsWith('rwx'))) {
    throw new Error(
      `ChromaDb "${name}" cannot autoscale on ReadWriteOnce storage.\n` +
        `\n` +
        `The data PVC uses ReadWriteOnce — scaling to replicas beyond one node ` +
        `triggers Kubernetes Multi-Attach errors. A HorizontalPodAutoscaler ` +
        `needs a ReadWriteMany (RWX) StorageClass.\n` +
        `\n` +
        `Fix: point storageClassName at a ReadWriteMany StorageClass ` +
        `(its name must end with 'rwx'):\n` +
        `  <ChromaDb name="${name}" host="${host}" storageClassName="nfs-rwx" autoscaling />`
    )
  }

  // --- Auth token — provisioned through the backend or referenced -------------
  // The token authenticates every request to the vector store — it must
  // never be rendered as plaintext.
  if (auth && !authTokenSecretName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `ChromaDb "${name}" requires an auth token (key: token).\n` +
          `\n` +
          `The CHROMA_SERVER_AUTH_CREDENTIALS token authenticates every request ` +
          `to the vector store — it must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform holding the token ` +
          `at path <mount-path>/${name}/auth-token:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'ai' }}>\n` +
          `    <ChromaDb name="${name}" host="${host}" auth={true} />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (key: token):\n` +
          `  <ChromaDb name="${name}" host="${host}" auth={true} authTokenSecretName="${name}-auth-token" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/auth-token`,
      destination: { create: true, name: tokenSecretName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-auth-token`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-auth-token`, namespace },
            spec,
          })
    )
  }

  // --- Env wiring -------------------------------------------------------------
  // Only CHROMA_* env vars — every credential arrives via secretKeyRef at
  // runtime (pushed first so dependent $(VAR) expansion resolves).
  const envVars: {
    name: string
    value?: string
    valueFrom?: { secretKeyRef: { name: string; key: string } }
  }[] = []

  // The listener port must track the `port` prop or the server ignores it
  // and binds the image default (8000), breaking the Service and probes.
  envVars.push({ name: 'CHROMA_SERVER_HTTP_PORT', value: String(port) })

  if (pg) {
    // Metadata store: CNPG cluster provisioned as `${name}-meta`. Its
    // connection info follows the Database recipe convention.
    const dbHost = `${name}-meta-rw`
    envVars.push(
      { name: 'CHROMA_POSTGRES_HOST', value: dbHost },
      { name: 'CHROMA_POSTGRES_PORT', value: '5432' },
      { name: 'CHROMA_POSTGRES_DATABASE', value: `${name}-meta` },
      { name: 'CHROMA_POSTGRES_USER', value: `${name}-meta` },
      {
        name: 'CHROMA_POSTGRES_PASSWORD',
        valueFrom: {
          secretKeyRef: { name: `${name}-meta-db-credentials`, key: 'password' },
        },
      }
    )
  }

  if (auth) {
    envVars.push(
      {
        name: 'CHROMA_SERVER_AUTH_CREDENTIALS',
        valueFrom: { secretKeyRef: { name: tokenSecretName, key: 'token' } },
      },
      {
        name: 'CHROMA_SERVER_AUTH_PROVIDER',
        value: 'chromadb.auth.token.TokenAuthenticationServerProvider',
      }
    )
  }

  // --- Data-plane resources ----------------------------------------------------
  // WebService cannot mount volumes, so the app runs as a raw Deployment
  // with heartbeat probes. Chroma persists to /data by default in the
  // official image.
  const dataPlane: ReturnType<typeof jsx>[] = []

  dataPlane.push(
    jsx('PersistentVolumeClaim', {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: `${name}-data`, namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        ...(storageClassName && { storageClassName }),
        resources: { requests: { storage } },
      },
    })
  )

  // --- Deployment + Service (raw jsx — WebService lacks volume mounts) --------
  dataPlane.push(
    jsx('Deployment', {
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
                name: 'chroma',
                image: `ghcr.io/chroma-core/chroma:${version}`,
                imagePullPolicy: 'Always',
                ports: [{ containerPort: port }],
                env: envVars,
                ...(resources && { resources }),
                volumeMounts: [{ name: 'data', mountPath: '/data' }],
                livenessProbe: {
                  httpGet: { path: probePath, port },
                  initialDelaySeconds: 10,
                  periodSeconds: 10,
                },
                readinessProbe: {
                  httpGet: { path: probePath, port },
                  initialDelaySeconds: 5,
                  periodSeconds: 5,
                },
              },
            ],
            volumes: [{ name: 'data', persistentVolumeClaim: { claimName: `${name}-data` } }],
          },
        },
      },
    }),
    jsx('Service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name, namespace },
      spec: {
        type: 'ClusterIP',
        selector: { app: name },
        ports: [{ name: 'http', port, targetPort: port, protocol: 'TCP' }],
      },
    })
  )

  // --- Metadata store (CNPG) — wraps the data-plane resources so connection
  // info stays consistent with the Database recipe convention -----------------
  if (pg) {
    resources_.push(
      jsx(Database, {
        backup: false,
        name: `${name}-meta`,
        namespace,
        storage: '10Gi',
        children: jsx(Fragment, { children: dataPlane }),
      })
    )
  } else {
    resources_.push(...dataPlane)
  }

  // --- Autoscaling --------------------------------------------------------------
  if (autoscaling) {
    resources_.push(
      jsx('HorizontalPodAutoscaler', {
        apiVersion: 'autoscaling/v2',
        kind: 'HorizontalPodAutoscaler',
        metadata: { name: `${name}-hpa`, namespace },
        spec: {
          scaleTargetRef: { apiVersion: 'apps/v1', kind: 'Deployment', name },
          minReplicas: replicas,
          maxReplicas: replicas * 3,
          metrics: [
            {
              type: 'Resource',
              resource: {
                name: 'cpu',
                target: { type: 'Utilization', averageUtilization: 70 },
              },
            },
          ],
        },
      })
    )
  }

  // --- Endpoint ------------------------------------------------------------------
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={port}
      tls={tls}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
