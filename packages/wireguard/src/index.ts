import { jsx, Fragment } from '@r8s/core'

export interface WireGuardProps {
  name?: string
  namespace?: string
  /** wg-easy version (default: latest) */
  version?: string
  /** Hostname for the web UI */
  host?: string
  /** WireGuard port (default: 51820) */
  wgPort?: number
  /** Web UI port (default: 51821) */
  webPort?: number
  /** Admin password secret name */
  passwordSecret?: string
  /** Persistent storage (default: 1Gi) */
  storage?: string
  /** Node port for UDP (if using NodePort) */
  nodePort?: number
  /** TLS config for web UI */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * WireGuard VPN server (wg-easy).
 * Deploys without operator — native Kubernetes resources only.
 *
 * @example
 * <WireGuard
 *   host="vpn.example.com"
 *   passwordSecret="wg-password"
 *   nodePort={31820}
 *   tls={{ secretName: "wg-tls", clusterIssuer: "letsencrypt" }}
 * />
 */
export function WireGuard(props: WireGuardProps) {
  const {
    name = 'wireguard',
    namespace = 'wireguard',
    version = 'latest',
    host,
    wgPort = 51820,
    webPort = 51821,
    passwordSecret = `${name}-password`,
    storage = '1Gi',
    nodePort,
    tls,
  } = props

  const resources: ReturnType<typeof jsx>[] = []

  // Namespace
  resources.push(
    jsx('Namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name: namespace },
    })
  )

  // Deployment
  resources.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name, namespace },
      spec: {
        replicas: 1,
        selector: { matchLabels: { app: name } },
        template: {
          metadata: { labels: { app: name } },
          spec: {
            containers: [
              {
                name: 'wg-easy',
                image: `ghcr.io/wg-easy/wg-easy:${version}`,
                ports: [
                  { containerPort: wgPort, protocol: 'UDP', name: 'wg' },
                  { containerPort: webPort, name: 'web' },
                ],
                env: [
                  { name: 'WG_HOST', value: host || `${name}.${namespace}.svc.cluster.local` },
                  {
                    name: 'PASSWORD_HASH',
                    valueFrom: { secretKeyRef: { name: passwordSecret, key: 'password' } },
                  },
                  { name: 'WG_PORT', value: String(wgPort) },
                  { name: 'WG_DEFAULT_ADDRESS', value: '10.8.0.x' },
                  { name: 'WG_DEFAULT_DNS', value: '1.1.1.1, 8.8.8.8' },
                  { name: 'UI_TRAFFIC_STATS', value: 'true' },
                  { name: 'UI_CHART_TYPE', value: '2' },
                ],
                volumeMounts: [{ name: 'data', mountPath: '/etc/wireguard' }],
                securityContext: {
                  capabilities: {
                    add: ['NET_ADMIN', 'SYS_MODULE'],
                  },
                },
                resources: {
                  requests: { memory: '64Mi', cpu: '50m' },
                  limits: { memory: '256Mi', cpu: '200m' },
                },
              },
            ],
            volumes: [{ name: 'data', persistentVolumeClaim: { claimName: `${name}-pvc` } }],
          },
        },
      },
    })
  )

  // Service (UDP for WireGuard + TCP for web UI)
  resources.push(
    jsx('Service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name, namespace },
      spec: {
        type: nodePort ? 'NodePort' : 'ClusterIP',
        selector: { app: name },
        ports: [
          {
            port: wgPort,
            targetPort: wgPort,
            protocol: 'UDP',
            name: 'wg',
            ...(nodePort && { nodePort }),
          },
          {
            port: webPort,
            targetPort: webPort,
            name: 'web',
          },
        ],
      },
    })
  )

  // PVC
  resources.push(
    jsx('PersistentVolumeClaim', {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name: `${name}-pvc`, namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage } },
      },
    })
  )

  // Ingress for web UI
  if (host) {
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
                  service: { name, port: { number: webPort } },
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

    resources.push(
      jsx('Ingress', {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
          name,
          namespace,
          annotations: tls
            ? {
                'cert-manager.io/cluster-issuer': tls.clusterIssuer,
              }
            : undefined,
        },
        spec: ingressSpec,
      })
    )
  }

  return jsx(Fragment, { children: resources })
}
