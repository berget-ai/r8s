import { jsx, Fragment } from '@r8s/core';
import { WebService, type SecretRef, type VaultSecretRef } from './web-service';
import { Ingress } from './ingress';
import { Gateway, HTTPRoute } from '@r8s/envoy';
import { ManagedCertificate } from '@r8s/cert-manager';
import type { TLSConfig } from '@r8s/k8s-types';

export type RoutingMode = 'ingress' | 'gateway';

export interface AppProps {
  name: string;
  namespace?: string;
  image: string;
  port?: number;
  replicas?: number;
  host: string;
  tls?: TLSConfig;
  /**
   * Routing mode: 'ingress' (nginx Ingress, default) or 'gateway' (Envoy Gateway API).
   * Use 'gateway' for clusters that use Envoy Gateway instead of nginx Ingress.
   */
  routing?: RoutingMode;
  /** Gateway class name (only used when routing='gateway', default: 'eg') */
  gatewayClassName?: string;
  /** Plain environment variables (non-sensitive) */
  env?: Record<string, string>;
  /** Secrets from Kubernetes Secrets — safe by default */
  secrets?: Record<string, SecretRef | string>;
  /** Secrets from Vault — creates VaultStaticSecret objects */
  vault?: Record<string, VaultSecretRef>;
  resources?: {
    requests?: { cpu?: string; memory?: string };
    limits?: { cpu?: string; memory?: string };
  };
  children?: unknown;
}

/**
 * Simple application — Deployment + Service + routing.
 *
 * The simplest way to deploy an app to Kubernetes:
 * ```tsx
 * <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" />
 * ```
 *
 * With Envoy Gateway instead of nginx Ingress:
 * ```tsx
 * <App name="myapp" image="myapp/web:v1.2.3" host="myapp.example.com" routing="gateway" />
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
 * With Vault secrets (auto-installs Vault Secrets Operator):
 * ```tsx
 * <App
 *   name="myapp"
 *   image="myapp/web:v1.2.3"
 *   host="myapp.example.com"
 *   vault={{ DATABASE_URL: { mount: 'kv', path: 'db/credentials' } }}
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
    namespace = 'default',
    image,
    port = 3000,
    replicas = 2,
    host,
    tls,
    routing = 'ingress',
    gatewayClassName = 'eg',
    env = {},
    secrets = {},
    vault = {},
    resources,
    children,
  } = props;

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

  if (routing === 'gateway') {
    const secretName = tls?.secretName || `${name}-tls`;
    const issuerName = tls?.clusterIssuer || 'letsencrypt-prod';

    elements.push(
      jsx(ManagedCertificate, {
        name: `${name}-tls`,
        namespace,
        secretName,
        dnsNames: [host],
        issuerName,
      })
    );

    elements.push(
      jsx(Gateway, {
        name: `${name}-gateway`,
        namespace,
        gatewayClassName,
        listeners: [
          {
            name: 'https',
            protocol: 'HTTPS',
            port: 443,
            hostname: host,
            tls: {
              mode: 'Terminate',
              certificateRefs: [{ name: secretName }],
            },
          },
        ],
      })
    );

    elements.push(
      jsx(HTTPRoute, {
        name: `${name}-route`,
        namespace,
        parentRefs: [{ name: `${name}-gateway` }],
        hostnames: [host],
        rules: [
          {
            backendRefs: [{ name, port: 80 }],
          },
        ],
      })
    );
  } else {
    elements.push(
      jsx(Ingress, {
        name: `${name}-ingress`,
        namespace,
        host,
        serviceName: name,
        servicePort: 80,
        tls,
      })
    );
  }

  // Children render as sibling resources (e.g. <BackgroundWorker />).
  // WebService does not currently accept children as a prop, so we keep
  // them as a Fragment sibling for the renderer to flatten.
  if (children) {
    elements.push(jsx(Fragment, { children }));
  }

  return jsx(Fragment, { children: elements });
}
