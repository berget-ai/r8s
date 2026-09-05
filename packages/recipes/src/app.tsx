import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { WebService, type SecretRef, type VaultSecretRef } from './web-service'
import { Endpoint } from './endpoint'
import { useNamespace, OperatorContext } from '@r8s/core/defaults'
import type { TLSConfig } from '@r8s/k8s-types'
import { operators } from '@r8s/crds'
import { RedisClusterComponent } from '@r8s/crds/redis'

export interface AppProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default' or the Platform namespace) */
  namespace?: string
  /** Container image (e.g., 'myapp/api:v1.2.3') */
  image: string
  /** Container port the app listens on (defaults to 3000) */
  port?: number
  /** Number of pod replicas (defaults to 2) */
  replicas?: number
  /** Domain name (e.g., 'api.example.com') the endpoint should accept traffic for.
   *  When omitted, no Endpoint/Ingress/Gateway is created (useful for manual routing). */
  host?: string
  /** TLS certificate configuration for HTTPS */
  tls?: TLSConfig
  /** Plain environment variables (non-sensitive) */
  env?: Record<string, string>
  /** Secrets from Kubernetes Secrets — safe by default */
  secrets?: Record<string, SecretRef | string>
  /** Secrets from Vault — creates VaultStaticSecret objects */
  vault?: Record<string, VaultSecretRef>
  /** CPU and memory requests/limits for the app container */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** Add a Redis cache for this app (session store, cache, queue) */
  cache?: boolean
  /** Create a DNS record via ExternalDNS (default: false) */
  dns?: boolean
  /**
   * Reference to a shared Gateway instead of creating a per-app Gateway.
   * Avoids allocating a new LoadBalancer IP per app.
   */
  sharedGateway?: { name: string; namespace?: string }
  /** Child components rendered as sibling resources (e.g., a BackgroundWorker) */
  children?: unknown
}

/**
 * Simple application — Deployment + Service + Endpoint.
 *
 * @title App
 * @category Complete Solution
 *
 * The simplest way to deploy an app to Kubernetes — Deployment, Service,
 * and routing (Ingress or Gateway) with TLS.
 *
 * @example
 * import { App } from '@r8s/recipes'
 *
 * export default <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" />
 *
 * @example
 * import { Platform, App } from '@r8s/recipes'
 *
 * export default (
 *   <Platform routing="gateway" namespace="production">
 *     <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" />
 *   </Platform>
 * )
 *
 * @example
 * import { App } from '@r8s/recipes'
 *
 * export default (
 *   <App
 *     name="myapp"
 *     image="myapp/web:v1.2.3"
 *     host="myapp.example.com"
 *     env={{ LOG_LEVEL: 'info' }}
 *     secrets={{ DATABASE_URL: 'app-secrets' }}
 *   />
 * )
 *
 * @example
 * import { Database, App } from '@r8s/recipes'
 *
 * export default (
 *   <>
 *     <Database name="myapp-db" storage="20Gi" />
 *     <App
 *       name="myapp"
 *       image="myapp/web:v1.2.3"
 *       host="myapp.example.com"
 *       tls={{ secretName: 'myapp-tls', clusterIssuer: 'letsencrypt' }}
 *     />
 *   </>
 * )
 */
export function App(props: AppProps) {
  const {
    name,
    namespace: namespaceProp,
    image,
    port = 3000,
    replicas = 2,
    host,
    tls,
    env = {},
    secrets = {},
    vault = {},
    resources,
    cache = false,
    dns,
    sharedGateway,
    children,
  } = props

  // Inherit namespace from <Platform> context if not explicitly set
  const namespace = useNamespace(namespaceProp)

  const elements: ReturnType<typeof jsx>[] = []

  elements.push(
    jsx(WebService, {
      name,
      namespace,
      image,
      port,
      replicas,
      env,
      secrets,
      vault,
      resources,
    })
  )

  // Only create Endpoint if host is provided
  if (host) {
    elements.push(
      jsx(Endpoint, {
        name: `${name}-endpoint`,
        namespace,
        host,
        serviceName: name,
        servicePort: 80,
        tls,
        dns,
        ...(sharedGateway && { sharedGateway }),
      })
    )
  }

  // Redis cache
  if (cache) {
    const sharedOperators = useContext(OperatorContext)
    const hasRedis = sharedOperators.some((op) => op.name === 'redis-operator')
    if (!hasRedis) {
      elements.push(declareOperator(operators['redis-operator']()))
    }
    elements.push(
      RedisClusterComponent({
        metadata: { name: `${name}-cache`, namespace },
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
    // Auto-wire REDIS_URL env var
    env.REDIS_URL = `redis://${name}-cache-leader.${namespace}.svc.cluster.local:6379`
  }

  // Children render as sibling resources (e.g. <BackgroundWorker />).
  // WebService does not currently accept children as a prop, so we keep
  // them as a Fragment sibling for the renderer to flatten.
  if (children) {
    elements.push(jsx(Fragment, { children }))
  }

  return jsx(Fragment, { children: elements })
}
