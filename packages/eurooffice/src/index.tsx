import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  WebService,
  Endpoint,
  StaticSecret,
  canProvisionSecrets,
  secretsRequiredError,
  type DatabaseProps,
} from '@r8s/recipes'

export interface EuroOfficeProps {
  /** Resource name (defaults to 'onlyoffice') */
  name?: string
  /** Kubernetes namespace (inherited from <Platform> unless set) */
  namespace?: string
  /**
   * DocumentServer image tag (defaults to 'v9.3.2').
   * PINNED VERSION REQUIRED — the ghcr.io/euro-office/documentserver repo
   * also carries CI build tags, so 'latest' is rejected.
   */
  version?: string
  /** Public hostname for the document server (required) — used by Odoo/WOPI integrations */
  host: string
  /**
   * Number of app replicas. Must be exactly 1: the DocumentServer ships
   * with embedded Redis + RabbitMQ and keeps its secure-link secret and
   * WOPI keys on the RWO data volume — it does not scale horizontally.
   */
  replicas?: number
  /**
   * RWO data volume at /var/www/euro-office/Data (subPath `data`) holding
   * the auto-generated secure-link secret and WOPI keys. Defaults to
   * '5Gi'. Pass `false` to manage storage yourself.
   */
  dataStorage?: string | { size?: string; storageClass?: string } | false
  /**
   * Custom UI fonts baked into the container at boot (curlimages/curl
   * init container downloads static TTFs into core-fonts/berget — variable
   * TTFs render under the wrong family name, so statics are used).
   * Defaults to the Berget brand set (DM Sans Regular/Medium/Bold + Ovo).
   * Pass `false` to disable.
   */
  customFonts?: { name: string; url: string }[] | false
  /**
   * JWT securing the document-server API (Odoo integration). Enabled
   * always (JWT_ENABLED=true, JWT_HEADER=Authorization); the secret is
   * provisioned through the Platform secrets backend with a 1h refresh
   * and pod restart on rotation, unless `jwtSecretName` references a
   * pre-created Secret (key: JWT_SECRET).
   */
  jwt?: {
    /** Backend path (defaults to `<provider.path>/<name>/jwt`) */
    path?: string
    /** Re-sync interval (defaults to the provider's, else '1h') */
    refreshAfter?: string
    /** Explicit pod restart targets on rotation (defaults to this Deployment) */
    rolloutRestartTargets?: { kind?: string; name: string; apiVersion?: string }[]
  }
  /** Reference a pre-created JWT Secret (keys: JWT_SECRET) instead of backend provisioning */
  jwtSecretName?: string
  /** Show the /example test UI (EXAMPLE_ENABLED). Defaults to false — enable during bring-up, then turn off */
  exampleEnabled?: boolean
  /**
   * CNPG cluster name (also the database and user name). Defaults to
   * 'eurooffice-db' — the production cluster name, deliberately distinct
   * from older naming to avoid PVC collisions.
   */
  dbName?: string
  /** Number of CNPG instances (defaults to 2) */
  dbInstances?: number
  /** CNPG data volume size (defaults to '20Gi') */
  dbStorage?: string
  /** CNPG storage class (defaults to cluster default) */
  dbStorageClass?: string
  /** CNPG backup configuration passed through to the Database recipe (continuous WAL + scheduled base backups) */
  backup?: DatabaseProps['backup']
  /**
   * SQL statements run once on a fresh cluster (CNPG postInitApplicationSQL).
   * Note: v9.3.2 cannot bootstrap an empty database by itself (entrypoint
   * lacks ensure_db_schema) — on a NEW cluster apply the image's
   * createdb.sql, or provide it here so the package handles it for you.
   */
  postInitSQL?: string[]
  /** Requested app resources (defaults to facit: 1Gi/500m → 4Gi/2) */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** Extra annotations merged onto the Endpoint (proxy-body-size 100m + 600s timeouts are defaults) */
  endpointAnnotations?: Record<string, string>
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

// Berget brand fonts — static TTFs (variable fonts render under the wrong
// family name inside the document server). Downloaded by an init container
// into an emptyDir mounted over core-fonts/berget.
const DEFAULT_FONT_URLS = [
  {
    name: 'DMSans-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf',
  },
  {
    name: 'DMSans-Medium.ttf',
    url: 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAkJxhTg.ttf',
  },
  {
    name: 'DMSans-Bold.ttf',
    url: 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthTg.ttf',
  },
  {
    name: 'Ovo-Regular.ttf',
    url: 'https://fonts.gstatic.com/s/ovo/v18/yYLl0h7Wyfzjyw.ttf',
  },
]

/**
 * EuroOffice — Euro-Office DocumentServer (self-hosted collaborative
 * document editing, facit-aligned).
 *
 * @title EuroOffice
 * @category Productivity & Documents
 *
 * Composes:
 * - DocumentServer Deployment + Service (port 80, `/healthcheck` probes,
 *   startup probe tolerating the ~10-minute first boot: schema + fonts)
 * - CNPG Postgres cluster (default 2 instances, facit-tuned parameters)
 * - RWO data volume for the secure-link secret + WOPI keys
 * - JWT secret provisioned through the Platform secrets backend (or a
 *   referenced pre-created Secret) with pod restart on rotation
 * - preStop lifecycle hook (documentserver-prepare4shutdown.sh — saves
 *   open documents and disconnects sessions before shutdown)
 * - Optional brand-font init container
 * - Endpoint with 100m body-size + 600s proxy timeouts
 *
 * The DocumentServer is strictly single-replica (embedded Redis +
 * RabbitMQ, RWO volume) — `replicas` other than 1 is rejected.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { EuroOffice } from '@r8s/eurooffice'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <EuroOffice host="docs.example.com" exampleEnabled />
 *   </Platform>
 * )
 */
export function EuroOffice(props: EuroOfficeProps) {
  const {
    name = 'onlyoffice',
    namespace: namespaceProp,
    version = 'v9.3.2',
    host,
    replicas = 1,
    dataStorage = '5Gi',
    customFonts,
    jwt,
    jwtSecretName,
    exampleEnabled = false,
    dbName = 'eurooffice-db',
    dbInstances = 2,
    dbStorage = '20Gi',
    dbStorageClass,
    backup,
    postInitSQL,
    resources = {
      requests: { memory: '1Gi', cpu: '500m' },
      limits: { memory: '4Gi', cpu: '2' },
    },
    endpointAnnotations = {},
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  if (version === 'latest') {
    throw new Error(
      `EuroOffice "${name}" requires a pinned version.\n` +
        `\n` +
        `The ghcr.io/euro-office/documentserver repo also carries CI build tags —\n` +
        `'latest' may resolve to an untested build and break document editing.\n` +
        `\n` +
        `Fix: <EuroOffice version="v9.3.2" ... />`
    )
  }

  if (replicas !== 1) {
    throw new Error(
      `EuroOffice "${name}" requires replicas=1.\n` +
        `\n` +
        `The DocumentServer ships embedded Redis + RabbitMQ and keeps its\n` +
        `secure-link secret and WOPI keys on the RWO data volume — it does\n` +
        `not scale horizontally (received replicas=${replicas}).`
    )
  }

  // --- JWT secret (core of the Odoo/WOPI integration) ------------------------
  const jwtSecretResourceName = jwtSecretName ?? `${name}-jwt-secret`
  if (!jwtSecretName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'EuroOffice',
        name,
        'a JWT secret — it signs every document-server API call (Odoo integration)',
        {
          propName: 'jwtSecretName',
          exampleValue: `${name}-jwt-secret`,
          keys: ['JWT_SECRET'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-jwt`,
        namespace,
        path: jwt?.path ?? `${secretProvider.path ?? name}/${name}/jwt`,
        secretName: jwtSecretResourceName,
        refreshAfter: jwt?.refreshAfter,
        keys: ['JWT_SECRET'],
        restart: jwt?.rolloutRestartTargets ?? [{ kind: 'Deployment', name }],
      })
    )
  }

  // --- Data volume (secure-link secret + WOPI keys) --------------------------
  const dataVolumeName = `${name}-data`
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

  // --- Fonts -----------------------------------------------------------------
  const fonts = customFonts === undefined ? DEFAULT_FONT_URLS : customFonts
  const fontsEnabled = fonts !== false && fonts.length > 0

  // --- Database (CNPG) — document metadata, sessions --------------------------
  const dbHost = `${dbName}-rw.${namespace}.svc.cluster.local`
  const dbCredentialsName = `${dbName}-db-credentials`

  // --- Env wiring --------------------------------------------------------------
  // Every credential is delivered via secretKeyRef — no plaintext in the
  // manifest. DB_* uses the DocumentServer's own variable names (it does
  // not read DATABASE_URL), so no WebService/Database auto-wiring.
  const env: Record<string, string> = {
    DB_TYPE: 'postgres',
    DB_HOST: dbHost,
    DB_PORT: '5432',
    DB_NAME: dbName,
    DB_USER: dbName,
    JWT_ENABLED: 'true',
    JWT_HEADER: 'Authorization',
    ...(exampleEnabled ? { EXAMPLE_ENABLED: 'true' } : {}),
  }

  const secrets = {
    DB_PWD: { secret: dbCredentialsName, key: 'password' },
    JWT_SECRET: { secret: jwtSecretResourceName, key: 'JWT_SECRET' },
  }

  const volumes: ({ name: string } & Record<string, unknown>)[] = [
    ...(dataStorage
      ? [{ name: 'data', persistentVolumeClaim: { claimName: dataVolumeName } }]
      : []),
    ...(fontsEnabled ? [{ name: 'custom-fonts', emptyDir: {} }] : []),
  ]
  const volumeMounts = [
    ...(dataStorage
      ? [{ name: 'data', mountPath: '/var/www/euro-office/Data', subPath: 'data' }]
      : []),
    ...(fontsEnabled
      ? [
          {
            name: 'custom-fonts',
            mountPath: '/var/www/euro-office/documentserver/core-fonts/berget',
          },
        ]
      : []),
  ]
  const fontScript = fontsEnabled
    ? [
        'set -e',
        'mkdir -p /fonts',
        ...fonts.map((f) => `curl -fsSL -o /fonts/${f.name} "${f.url}"`),
        'echo "Downloaded fonts:"',
        'ls -la /fonts/',
      ].join('\n')
    : undefined

  resources_.push(
    jsx(Database, {
      name: dbName,
      namespace,
      instances: dbInstances,
      storage: dbStorage,
      ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
      parameters: {
        shared_buffers: '256MB',
        max_connections: '200',
        work_mem: '8MB',
        maintenance_work_mem: '128MB',
        effective_cache_size: '768MB',
      },
      ...(backup ? { backup } : {}),
      ...(postInitSQL && postInitSQL.length > 0 ? { postInitSQL } : {}),
    }),
    jsx(WebService, {
      name,
      namespace,
      image: `ghcr.io/euro-office/documentserver:${version}`,
      port: 80,
      replicas: 1,
      strategy: 'Recreate',
      resources,
      env,
      secrets,
      volumes,
      volumeMounts,
      ...(fontsEnabled
        ? {
            initContainers: [
              {
                name: 'custom-fonts',
                image: 'curlimages/curl:8.12.0',
                command: ['sh', '-c'],
                args: [fontScript],
                volumeMounts: [{ name: 'custom-fonts', mountPath: '/fonts' }],
              },
            ],
          }
        : {}),
      // Graceful shutdown: save open documents and disconnect sessions
      // before the pod goes away
      lifecycle: {
        preStop: {
          exec: {
            command: [
              'sh',
              '-c',
              'command -v documentserver-prepare4shutdown.sh >/dev/null 2>&1 && documentserver-prepare4shutdown.sh || true',
            ],
          },
        },
      },
      probes: {
        // First boot runs schema migration + font refresh — up to ~10 min
        startup: { path: '/healthcheck', periodSeconds: 10, failureThreshold: 60 },
        readiness: { path: '/healthcheck', periodSeconds: 15, failureThreshold: 3 },
        liveness: { path: '/healthcheck', periodSeconds: 30, failureThreshold: 3 },
      },
    }),
    jsx(Endpoint, {
      name: `${name}-endpoint`,
      namespace,
      host,
      serviceName: name,
      servicePort: 80,
      annotations: {
        'nginx.ingress.kubernetes.io/proxy-body-size': '100m',
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '600',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '600',
        ...endpointAnnotations,
      },
      tls,
    })
  )

  return jsx(Fragment, { children: resources_ })
}
