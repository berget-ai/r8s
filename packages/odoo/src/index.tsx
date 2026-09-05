import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import type {
  ConfigMap,
  Deployment,
  EnvVar,
  PersistentVolumeClaim,
  Service,
  VolumeMount,
} from '@r8s/k8s-types'
import { Database, Endpoint } from '@r8s/recipes'

export interface OdooProps {
  /** Resource name (defaults to 'odoo') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to '18' — pin a version in production) */
  version?: string
  /** Public hostname for the ERP web UI (required) */
  host: string
  /**
   * Number of replicas. Must stay at 1 — the filestore PVC is
   * ReadWriteOnce and cannot attach to multiple pods (defaults to 1).
   */
  replicas?: number
  /**
   * Size of the filestore PersistentVolumeClaim (defaults to '20Gi').
   * Odoo stores attachments and binary fields here.
   */
  filestore?: string
  /**
   * Odoo process-level worker processes, rendered into odoo.conf
   * (defaults to 2). Rule of thumb: (CPU threads * 2) + 1, accounting
   * for cron workers.
   */
  workers?: number
  /**
   * Name of an existing Secret containing key `masterPassword`. Odoo
   * requires this to manage the super-admin (`/web/database/manager`).
   *
   * Required unless a secrets backend (openbao/vault) is configured on
   * the surrounding Platform — the backend then provisions the password
   * automatically. Plaintext passwords are not supported.
   */
  masterPasswordSecretName?: string
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

const APP_PORT = 8069
const HEALTH_PATH = '/web/health'

type VolumeMountWithSubPath = VolumeMount & { subPath?: string }

const MEMORY_UNIT_BYTES: Record<string, number> = {
  '': 1,
  B: 1,
  K: 1_000,
  KB: 1_000,
  M: 1_000_000,
  MB: 1_000_000,
  G: 1_000_000_000,
  GB: 1_000_000_000,
  T: 1_000_000_000_000,
  TB: 1_000_000_000_000,
  P: 1_000_000_000_000_000,
  PB: 1_000_000_000_000_000,
  E: 1_000_000_000_000_000_000,
  EB: 1_000_000_000_000_000_000,
  KI: 1 << 10,
  MI: 1 << 20,
  GI: 1 << 30,
  TI: 2 ** 40,
  PI: 2 ** 50,
  EI: 2 ** 60,
}

/** Parse a Kubernetes memory quantity ("2Gi", "512Mi", "1G") into bytes. */
function memoryToBytes(memory: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/.exec(memory.trim())
  if (!match) {
    throw new Error(
      `Odoo: cannot parse memory quantity "${memory}" — use quantities like "2Gi" or "512Mi"`
    )
  }
  const amount = Number(match[1])
  const unit = (match[2] ?? '').toUpperCase()
  const multiplier = MEMORY_UNIT_BYTES[unit]
  if (multiplier === undefined) {
    throw new Error(
      `Odoo: unsupported memory unit in "${memory}" — use B, K/Ki, M/Mi, G/Gi, T/Ti, P/Pi or E/Ei`
    )
  }
  return Math.round(amount * multiplier)
}

/**
 * Odoo — open-source ERP / business applications suite.
 *
 * @title Odoo
 * @category Business Applications
 *
 * Composes:
 * - CNPG Postgres cluster (Odoo data model) via the Database recipe
 * - Odoo Deployment + Service + Endpoint (port 8069 — HTTP mode serves
 *   web and websockets on the same port in this image)
 * - odoo.conf ConfigMap mounted at /etc/odoo/odoo.conf (proxy mode,
 *   workers, memory-derived worker limits, request recycling)
 * - Filestore PVC for attachments and binary fields
 * - Master password provisioned through the Platform secrets backend
 *   (openbao / vault), or referenced from an existing Secret
 *
 * The main app is a raw Deployment (not WebService) because Odoo needs
 * the filestore PVC volume-mounted at /var/lib/odoo — the WebService
 * recipe cannot express volume mounts.
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the MASTER_PASSWORD is provisioned for you. Without a backend you
 * must point `masterPasswordSecretName` at a pre-created Secret.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Odoo } from '@r8s/odoo'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Odoo name="erp" host="erp.example.com" workers={4} />
 *   </Platform>
 * )
 *
 * @example
 * import { Odoo } from '@r8s/odoo'
 *
 * export default (
 *   <Odoo
 *     name="erp"
 *     host="erp.example.com"
 *     filestore="100Gi"
 *     masterPasswordSecretName="odoo-master-password"
 *   />
 * )
 */
export function Odoo(props: OdooProps) {
  const {
    name = 'odoo',
    namespace = 'default',
    version = '18',
    host,
    replicas = 1,
    filestore = '20Gi',
    workers = 2,
    masterPasswordSecretName,
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
  const masterSecretName = masterPasswordSecretName ?? `${name}-master-password`
  const configMapName = `${name}-config`
  const filestoreClaim = `${name}-filestore`

  if (replicas > 1) {
    throw new Error(
      `Odoo "${name}" cannot run with replicas: ${replicas}.\n` +
        `\n` +
        `The filestore PersistentVolumeClaim "${filestoreClaim}" is ReadWriteOnce ` +
        `and can only attach to a single pod at a time — every pod beyond the first ` +
        `stays Pending with a Multi-Attach error.\n` +
        `\n` +
        `Fix: keep replicas at 1 (the default), or provide read-write-many shared ` +
        `storage for the filestore and override the claim's accessMode before scaling.`
    )
  }

  // --- Secret provisioning ---------------------------------------------------
  // The Odoo master password unlocks /web/database/manager — never render
  // it as plaintext. With a secrets backend it is provisioned through the
  // backend (key `masterPassword`); otherwise reference a pre-created Secret.
  if (!masterPasswordSecretName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Odoo "${name}" requires a master password.\n` +
          `\n` +
          `Odoo uses MASTER_PASSWORD to manage the super-admin — ` +
          `it must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Odoo name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (key: masterPassword):\n` +
          `  <Odoo name="${name}" host="${host}" masterPasswordSecretName="${name}-master-password" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/master`,
      destination: { create: true, name: masterSecretName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-master-password`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-master-password`, namespace },
            spec,
          })
    )
  }

  // --- Operators --------------------------------------------------------------
  // None declared directly: cnpg comes from the <Database> recipe (which
  // checks OperatorContext and dedupes), routing operators come from
  // <Endpoint>.

  // --- Env wiring ---------------------------------------------------------------
  // Upstream odoo:18 entrypoint env names (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD).
  // Credentials are declared FIRST via secretKeyRef so plain env values could
  // reference them with Kubernetes $(VAR) dependent expansion. No plaintext.
  const env: EnvVar[] = [
    {
      name: 'MASTER_PASSWORD',
      valueFrom: { secretKeyRef: { name: masterSecretName, key: 'masterPassword' } },
    },
    {
      name: 'DB_PASSWORD',
      valueFrom: { secretKeyRef: { name: dbCredentialsName, key: 'password' } },
    },
    { name: 'DB_HOST', value: dbHost },
    { name: 'DB_PORT', value: '5432' },
    { name: 'DB_USER', value: name },
    { name: 'ODOO_DB', value: name },
  ]

  // --- odoo.conf -----------------------------------------------------------------
  // worker memory limits are derived from the container memory limit so the
  // aggregator cannot slowly OOM-kill the pod: soft limit (worker recycled)
  // at 80% of hard (worker killed outright).
  const limitMemoryHard = memoryToBytes(resources.limits?.memory ?? '2Gi')
  const limitMemorySoft = Math.round(limitMemoryHard * 0.8)
  const odooConf = [
    '[options]',
    'proxy_mode = True',
    `workers = ${workers}`,
    `limit_memory_hard = ${limitMemoryHard}`,
    `limit_memory_soft = ${limitMemorySoft}`,
    'max_requests = 80',
    '',
  ].join('\n')

  const configMap: ConfigMap = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: { name: configMapName, namespace, labels: { app: name } },
    data: { 'odoo.conf': odooConf },
  }
  resources_.push(jsx('ConfigMap', configMap))

  // --- Filestore PVC ------------------------------------------------------------
  // Odoo stores attachments and binary fields in the filestore
  // (/var/lib/odoo). This is the whole reason the app is a raw Deployment:
  // WebService cannot mount volumes. ReadWriteOnce keeps a single writer,
  // which is also why replicas must stay at 1 (enforced above).
  const filestorePvc: PersistentVolumeClaim = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: { name: filestoreClaim, namespace, labels: { app: name } },
    spec: {
      accessModes: ['ReadWriteOnce'],
      resources: { requests: { storage: filestore } },
    },
  }
  resources_.push(jsx('PersistentVolumeClaim', filestorePvc))

  // --- Database + Odoo Deployment + Service --------------------------------------
  // <Database> is the parent wrapper so the CNPG operator and the Cluster
  // piggyback on the r8s Database recipe; the raw Deployment references the
  // connection info by convention (host `${name}-rw`, credentials secret
  // `${name}-db-credentials` key `password`).
  const configMount: VolumeMountWithSubPath = {
    name: 'config',
    mountPath: '/etc/odoo/odoo.conf',
    subPath: 'odoo.conf',
  }

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
              name: 'odoo',
              image: `odoo:${version}`,
              ports: [{ name: 'http', containerPort: APP_PORT }],
              env,
              resources,
              livenessProbe: {
                httpGet: { path: HEALTH_PATH, port: APP_PORT },
                initialDelaySeconds: 60,
                periodSeconds: 30,
              },
              readinessProbe: {
                httpGet: { path: HEALTH_PATH, port: APP_PORT },
                initialDelaySeconds: 30,
                periodSeconds: 10,
              },
              volumeMounts: [{ name: 'filestore', mountPath: '/var/lib/odoo' }, configMount],
            },
          ],
          volumes: [
            { name: 'filestore', persistentVolumeClaim: { claimName: filestoreClaim } },
            { name: 'config', configMap: { name: configMapName } },
          ],
        },
      },
    },
  }

  const service: Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name, namespace, labels: { app: name } },
    spec: {
      type: 'ClusterIP',
      selector: { app: name },
      ports: [{ name: 'http', port: APP_PORT, targetPort: APP_PORT }],
    },
  }

  resources_.push(
    jsx(Database, {
      backup: false,
      name,
      namespace,
      storage: '10Gi',
      children: jsx(Fragment, {
        children: [jsx('Deployment', deployment), jsx('Service', service)],
      }),
    })
  )

  // --- Endpoint — public web UI ---------------------------------------------------
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={APP_PORT}
      tls={tls}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
