import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { RedisClusterComponent } from '@r8s/crds/redis'

export interface SupersetProps {
  /** Resource name */
  name?: string
  /** Kubernetes namespace */
  namespace?: string
  /** Superset version (default: 4.0.0) */
  version?: string
  /** Hostname for Superset */
  host: string
  /** Database connection */
  database: {
    host: string
    database: string
    user: string
    /** Name of the Secret containing the DB password */
    passwordSecret: string
    passwordKey?: string
    /** If set, the Secret is created with this password. Otherwise the
     * Secret must already exist. */
    password?: string
  }
  /**
   * Redis connection. Either point at an existing Redis (`host`) or let
   * the component create a managed RedisCluster (`create: true`).
   */
  redis:
    { host: string; port?: number; create?: false } | { create: true; host?: string; port?: number }
  /** Admin credentials. If `existingSecret` is set, that Secret must
   * already exist (with a `secretKey` key). Otherwise a Secret named
   * `<name>-admin` is created with a generated secret key. */
  admin: { existingSecret: string } | { password?: string }
  /** Number of replicas (default: 1) */
  replicas?: number
  /** Resources */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** TLS config */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
  /** OAuth config for Keycloak */
  oauth?: {
    clientId: string
    clientSecret: string
    keycloakUrl: string
    realm?: string
  }
}

/**
 * Apache Superset analytics and visualization platform.
 * Deploys without operator — native Kubernetes resources only.
 *
 * @example
 * <Superset
 *   host="superset.example.com"
 *   database={{ host: "superset-db-rw", database: "superset", user: "superset", passwordSecret: "superset-db-credentials" }}
 *   redis={{ host: "redis-master" }}
 *   admin={{ password: "change-me" }}
 *   tls={{ secretName: "superset-tls", clusterIssuer: "letsencrypt" }}
 * />
 */
export function Superset(props: SupersetProps) {
  const {
    name = 'superset',
    namespace = 'superset',
    version = '4.0.0',
    host,
    database,
    redis,
    admin,
    replicas = 1,
    resources = {
      requests: { cpu: '250m', memory: '1Gi' },
      limits: { cpu: '1000m', memory: '2Gi' },
    },
    tls,
    oauth,
  } = props

  const adminSecretName = 'existingSecret' in admin ? admin.existingSecret : `${name}-admin`
  const resources_list: ReturnType<typeof jsx>[] = []

  // Namespace
  resources_list.push(
    jsx('Namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name: namespace },
    })
  )

  // Admin Secret — created unless the user points at an existing one.
  if (!('existingSecret' in admin)) {
    resources_list.push(
      jsx('Secret', {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: adminSecretName, namespace },
        type: 'Opaque',
        stringData: {
          secretKey: admin.password ?? 'change-me-superset-secret-key',
        },
      })
    )
  }

  // Database credentials Secret — the user provides the name via
  // database.passwordSecret; if it doesn't exist in the output we
  // create it with the given password.
  if (database.password) {
    resources_list.push(
      jsx('Secret', {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: database.passwordSecret, namespace },
        type: 'Opaque',
        stringData: {
          password: database.password,
        },
      })
    )
  }

  // Managed Redis — without this the Superset config references a Redis
  // host that doesn't exist and the pod crash-loops.
  let redisHost: string
  let redisPort: number
  if ('create' in redis && redis.create) {
    const sharedOperators = useContext(OperatorContext)
    const hasRedis = sharedOperators.some((op) => op.name === 'redis-operator')
    if (!hasRedis) {
      resources_list.push(declareOperator(operators['redis-operator']()))
    }
    const redisName = `${name}-redis`
    resources_list.push(
      RedisClusterComponent({
        metadata: { name: redisName, namespace },
        spec: {
          clusterSize: 3,
          kubernetesConfig: { image: 'redis:7.2-alpine' },
          storage: {
            volumeClaimTemplate: {
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: { requests: { storage: '1Gi' } },
              },
            },
          },
        },
      })
    )
    // OT-Container-Kit Redis operator creates services named
    // <redisName>-master and <redisName>-headless.
    redisHost = redis.host ?? `${redisName}-master.${namespace}.svc.cluster.local`
    redisPort = redis.port ?? 6379
  } else {
    redisHost = (redis as { host: string }).host
    redisPort = redis.port ?? 6379
  }

  // ConfigMap for superset_config.py
  const configScript = `
import os

SECRET_KEY = os.environ.get('SUPERSET_SECRET_KEY', 'change-me')
SQLALCHEMY_DATABASE_URI = f"postgresql://{os.environ['DB_USER']}:{os.environ['DB_PASS']}@{os.environ['DB_HOST']}/{os.environ['DB_NAME']}"
CACHE_CONFIG = {
    'CACHE_TYPE': 'RedisCache',
    'CACHE_DEFAULT_TIMEOUT': 300,
    'CACHE_KEY_PREFIX': 'superset_',
    'CACHE_REDIS_HOST': os.environ.get('REDIS_HOST', 'localhost'),
    'CACHE_REDIS_PORT': int(os.environ.get('REDIS_PORT', '6379')),
}
`

  resources_list.push(
    jsx('ConfigMap', {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: `${name}-config`, namespace },
      data: {
        'superset_config.py': configScript,
      },
    })
  )

  // Deployment
  resources_list.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name, namespace },
      spec: {
        replicas,
        selector: { matchLabels: { app: name } },
        template: {
          metadata: { labels: { app: name } },
          spec: {
            containers: [
              {
                name: 'superset',
                image: `apache/superset:${version}`,
                ports: [{ containerPort: 8088, name: 'http' }],
                env: [
                  {
                    name: 'SUPERSET_SECRET_KEY',
                    valueFrom: { secretKeyRef: { name: adminSecretName, key: 'secretKey' } },
                  },
                  { name: 'DB_HOST', value: database.host },
                  { name: 'DB_NAME', value: database.database },
                  { name: 'DB_USER', value: database.user },
                  {
                    name: 'DB_PASS',
                    valueFrom: {
                      secretKeyRef: {
                        name: database.passwordSecret,
                        key: database.passwordKey || 'password',
                      },
                    },
                  },
                  { name: 'REDIS_HOST', value: redisHost },
                  { name: 'REDIS_PORT', value: String(redisPort) },
                  ...(oauth
                    ? [
                        { name: 'KEYCLOAK_CLIENT_ID', value: oauth.clientId },
                        { name: 'KEYCLOAK_CLIENT_SECRET', value: oauth.clientSecret },
                        { name: 'KEYCLOAK_BASE_URL', value: oauth.keycloakUrl },
                      ]
                    : []),
                ],
                volumeMounts: [{ name: 'config', mountPath: '/app/pythonpath', readOnly: true }],
                resources,
              },
            ],
            volumes: [{ name: 'config', configMap: { name: `${name}-config` } }],
          },
        },
      },
    })
  )

  // Service
  resources_list.push(
    jsx('Service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name, namespace },
      spec: {
        selector: { app: name },
        ports: [{ port: 80, targetPort: 8088 }],
      },
    })
  )

  // Ingress
  const ingressSpec: Record<string, unknown> = {
    rules: [
      {
        host,
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: { name, port: { number: 80 } },
              },
            },
          ],
        },
      },
    ],
  }

  if (tls) {
    ingressSpec.tls = [
      {
        hosts: [host],
        secretName: tls.secretName,
      },
    ]
  }

  resources_list.push(
    jsx('Ingress', {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name,
        namespace,
        annotations: tls
          ? {
              'cert-manager.io/cluster-issuer': tls.clusterIssuer,
              'nginx.ingress.kubernetes.io/proxy-body-size': '50m',
              'nginx.ingress.kubernetes.io/proxy-read-timeout': '300',
            }
          : undefined,
      },
      spec: ingressSpec,
    })
  )

  return jsx(Fragment, { children: resources_list })
}
