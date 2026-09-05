/**
 * @r8s/operator-redis — Redis Operator for Kubernetes by OT-Container-Kit as an npm-resolved
 * operator package. The package version mirrors the operator's own
 * version (0.22.0); consumers declare
 * "@r8s/operator-redis": "^0.0.0" as a peerDependency
 * so npm resolves ONE copy per tree and mixed majors fail at install time.
 */
import { declareOperator } from '@r8s/core'
import type { Operator } from '@r8s/k8s-types'

/** The redis-operator operator version this package was cut for. */
export const DEFAULT_REDIS_VERSION = '0.22.0'

/**
 * Operator declaration — mirror of the `redis-operator` entry in
 * packages/crds/operators.yaml (registry stays the CLI metadata source;
 * version parity is enforced by the operator-contracts suite).
 */
export function RedisOperator(
  version: string = DEFAULT_REDIS_VERSION
): Operator & { namespace: string } {
  return {
    name: 'redis-operator',
    description: 'Redis Operator for Kubernetes by OT-Container-Kit',
    source: {
      type: 'helm',
      chart: 'redis-operator',
      repository: 'https://ot-container-kit.github.io/helm-charts/',
      version,
      namespace: 'kube-system',
    },
    version,
    namespace: 'kube-system',
    crds: [
      'redisclusters.redis.redis.opstreelabs.in',
      'redisreplications.redis.redis.opstreelabs.in',
      'redisfailovers.databases.spotahome.com',
    ],
  }
}

/** Registry identity for the operator-contracts mirror checks. */
export const OPERATOR_KEY = 'redis-operator'

/** Same factory, conventional alias so generic suites find it. */
export const operatorFactory = RedisOperator

/**
 * Declare redis-operator unless the surrounding Platform already provides it.
 * Spread into resources: `resources.push(...declareIfMissing(shared))`
 */
export function declareIfMissing(
  shared: Operator[],
  version?: string
): ReturnType<typeof declareOperator>[] {
  if (shared.some((op) => op.name === 'redis-operator')) return []
  return [declareOperator(RedisOperator(version))]
}

// Generated CRD components for this operator — re-exported as the single import path.
export * from '@r8s/crds/redis'
