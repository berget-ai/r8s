import { jsx } from '@r8s/core'
import { helmOperator } from '@r8s/k8s-types'

/** Redis Operator declaration (OT-Container-Kit) */
export const redisOperator = (version = '0.22.0') =>
  helmOperator(
    'redis-operator',
    'redis-operator',
    'https://ot-container-kit.github.io/helm-charts/',
    version,
    {
      description: 'Redis Operator for Kubernetes by OT-Container-Kit',
      namespace: 'kube-system',
      crds: [
        'redisclusters.redis.redis.opstreelabs.in',
        'redisreplications.redis.redis.opstreelabs.in',
        'redissentinels.redis.redis.opstreelabs.in',
      ],
    }
  )

export interface RedisClusterProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Number of Redis pods in the cluster (must match a valid cluster quorum) */
  clusterSize?: number
  /** Whether to enable the Redis exporter sidecar for Prometheus metrics */
  redisExporter?: boolean
  /** Storage size (e.g., '10Gi') */
  storage?: string
  /** Kubernetes StorageClass to use for the Redis data volume */
  storageClassName?: string
  /** Kubernetes Secret (name + key) holding the Redis authentication password */
  redisSecret?: {
    name: string
    key: string
  }
  /** CPU and memory requests/limits for Redis pods */
  resources?: {
    limits?: { cpu?: string; memory?: string }
    requests?: { cpu?: string; memory?: string }
  }
}

/**
 * Redis Cluster using OT-Container-Kit Redis Operator.
 *
 * Declares redis-operator dependency automatically.
 *
 * @example
 * <RedisCluster
 *   name="cache"
 *   namespace="production"
 *   clusterSize={3}
 *   storage="10Gi"
 * />
 */
export function RedisCluster(props: RedisClusterProps) {
  const {
    name,
    namespace = 'default',
    clusterSize = 3,
    redisExporter = true,
    storage,
    storageClassName,
    redisSecret,
    resources = {
      limits: { cpu: '100m', memory: '128Mi' },
      requests: { cpu: '100m', memory: '128Mi' },
    },
  } = props

  const cluster = {
    apiVersion: 'redis.redis.opstreelabs.in/v1beta1',
    kind: 'RedisCluster',
    metadata: { name, namespace },
    spec: {
      clusterSize,
      kubernetesConfig: {
        image: 'quay.io/opstree/redis:v7.0.12',
        imagePullPolicy: 'IfNotPresent',
        resources,
      },
      redisExporter: {
        enabled: redisExporter,
        image: 'quay.io/opstree/redis-exporter:v1.44.0',
      },
      ...(storage && {
        storage: {
          volumeClaimTemplate: {
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage,
                },
              },
              ...(storageClassName && { storageClassName }),
            },
          },
        },
      }),
      ...(redisSecret && {
        redisSecret: {
          name: redisSecret.name,
          key: redisSecret.key,
        },
      }),
    },
  }

  return jsx('RedisCluster', cluster)
}

export interface RedisReplicationProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Number of Redis pods in the master-replica replication setup */
  clusterSize?: number
  /** Whether to enable the Redis exporter sidecar for Prometheus metrics */
  redisExporter?: boolean
  /** Storage size (e.g., '10Gi') */
  storage?: string
  /** Kubernetes StorageClass to use for the Redis data volume */
  storageClassName?: string
}

/**
 * Redis Replication (master-replica) using Redis Operator.
 */
/**
 * Creates a Redis replication setup (primary + replicas) for
 * read scaling and failover.
 *
 * @example
 * <RedisReplication name="cache" replicas={3} storage="5Gi" />
 */
export function RedisReplication(props: RedisReplicationProps) {
  const {
    name,
    namespace = 'default',
    clusterSize = 2,
    redisExporter = true,
    storage,
    storageClassName,
  } = props

  const replication = {
    apiVersion: 'redis.redis.opstreelabs.in/v1beta1',
    kind: 'RedisReplication',
    metadata: { name, namespace },
    spec: {
      clusterSize,
      kubernetesConfig: {
        image: 'quay.io/opstree/redis:v7.0.12',
        imagePullPolicy: 'IfNotPresent',
      },
      redisExporter: {
        enabled: redisExporter,
        image: 'quay.io/opstree/redis-exporter:v1.44.0',
      },
      ...(storage && {
        storage: {
          volumeClaimTemplate: {
            spec: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage,
                },
              },
              ...(storageClassName && { storageClassName }),
            },
          },
        },
      }),
    },
  }

  return jsx('RedisReplication', replication)
}
