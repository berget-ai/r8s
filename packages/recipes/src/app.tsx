import { jsx, Fragment, useContext } from '@r8s/core';
import { WebService, type SecretRef, type VaultSecretRef } from './web-service';
import { Endpoint } from './endpoint';
import { Namespace } from '@r8s/core/defaults';
import type { TLSConfig } from '@r8s/k8s-types';

export interface AppProps {
  /** Resource name */
  name: string;
  /** Kubernetes namespace (defaults to 'default' or the Platform namespace) */
  namespace?: string;
  /** Container image (e.g., 'myapp/api:v1.2.3') */
  image: string;
  /** Container port the app listens on (defaults to 3000) */
  port?: number;
  /** Number of pod replicas (defaults to 2) */
  replicas?: number;
  /** Domain name (e.g., 'api.example.com') the endpoint should accept traffic for */
  host: string;
  /** TLS certificate configuration for HTTPS */
  tls?: TLSConfig;
  /** Plain environment variables (non-sensitive) */
  env?: Record<string, string>;
  /** Secrets from Kubernetes Secrets — safe by default */
  secrets?: Record<string, SecretRef | string>;
  /** Secrets from Vault — creates VaultStaticSecret objects */
  vault?: Record<string, VaultSecretRef>;
  /** CPU and memory requests/limits for the app container */
  resources?: {
    requests?: { cpu?: string; memory?: string };
    limits?: { cpu?: string; memory?: string };
  };
  /** Child components rendered as sibling resources (e.g., a BackgroundWorker) */
  children?: unknown;
}

/**
 * Simple application — Deployment + Service + Endpoint.
 *
 * @title App
 * @category Complete Solution
 *
 * The simplest way to deploy an app to Kubernetes:
 * ```tsx
 * <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" />
 * ```
 *
 * With Envoy Gateway instead of nginx Ingress:
 * ```tsx
 * <Platform routing="gateway" namespace="production">
 *   <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" />
 * </Platform>
 * ```
 *
 * With secrets from Kubernetes Secrets:
 * ```tsx
 * <App
 *   name="myapp"
 *   image="myapp/web:v1.2.3"
 *   host="myapp.example.com"
 *   env={{ LOG_LEVEL: 'info' }}
 *   secrets={{ DATABASE_URL: 'app-secrets' }}
 * />
 * ```
 *
 * Compose with other components for more complex setups:
 * ```tsx
 * <>
 *   <Database name="myapp-db" storage="20Gi" />
 *   <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" tls={{ secretName: "myapp-tls", clusterIssuer: "letsencrypt" }}>
 *     <BackgroundWorker name="myapp-worker" image="myapp/worker:v1.2.3" />
 *   </App>
 * </>
 * ```
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
    children,
  } = props;

  // Inherit namespace from <Platform> context if not explicitly set
  const contextNamespace = useContext(Namespace);
  const namespace = namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default';

  const elements: ReturnType<typeof jsx>[] = [];

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
  );

  elements.push(
    jsx(Endpoint, {
      name: `${name}-endpoint`,
      namespace,
      host,
      serviceName: name,
      servicePort: 80,
      tls,
    })
  );

  // Children render as sibling resources (e.g. <BackgroundWorker />).
  // WebService does not currently accept children as a prop, so we keep
  // them as a Fragment sibling for the renderer to flatten.
  if (children) {
    elements.push(jsx(Fragment, { children }));
  }

  return jsx(Fragment, { children: elements });
}
