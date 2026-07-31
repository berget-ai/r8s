import { jsx, Fragment } from '@r8s/core'

export interface ElementProps {
  /** Resource name */
  name?: string
  /** Kubernetes namespace */
  namespace?: string
  /** Element Web version (default: latest) */
  version?: string
  /** Hostname for Element */
  host: string
  /** Matrix homeserver URL */
  homeserverUrl: string
  /** TLS config */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Element Matrix chat client (web UI).
 * Deploys without operator — native Kubernetes resources only.
 *
 * @example
 * <Element
 *   host="chat.example.com"
 *   homeserverUrl="https://matrix.example.com"
 *   tls={{ secretName: "element-tls", clusterIssuer: "letsencrypt" }}
 * />
 */
export function Element(props: ElementProps) {
  const {
    name = 'element',
    namespace = 'element',
    version = 'latest',
    host,
    homeserverUrl,
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

  // ConfigMap for config.json
  const config = {
    default_server_config: {
      'm.homeserver': {
        base_url: homeserverUrl,
        server_name: host,
      },
    },
    brand: 'Element',
    integrations_ui_url: 'https://scalar.vector.im/',
    integrations_rest_url: 'https://scalar.vector.im/api',
    integrations_widgets_urls: [
      'https://scalar.vector.im/_matrix/integrations/v1',
      'https://scalar.vector.im/api',
      'https://scalar-staging.vector.im/_matrix/integrations/v1',
      'https://scalar-staging.vector.im/api',
    ],
    bug_report_endpoint_url: 'https://element.io/bugreports/submit',
    uisi_autorageshared_sigs: true,
    show_labs_settings: true,
    room_directory: {
      servers: [host],
    },
  }

  resources.push(
    jsx('ConfigMap', {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: `${name}-config`, namespace },
      data: {
        'config.json': JSON.stringify(config, null, 2),
      },
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
                name: 'element',
                image: `vectorim/element-web:${version}`,
                ports: [{ containerPort: 80, name: 'http' }],
                volumeMounts: [
                  {
                    name: 'config',
                    mountPath: '/app/config.json',
                    subPath: 'config.json',
                    readOnly: true,
                  },
                ],
                resources: {
                  requests: { memory: '64Mi', cpu: '50m' },
                  limits: { memory: '256Mi', cpu: '200m' },
                },
              },
            ],
            volumes: [{ name: 'config', configMap: { name: `${name}-config` } }],
          },
        },
      },
    })
  )

  // Service
  resources.push(
    jsx('Service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name, namespace },
      spec: {
        selector: { app: name },
        ports: [{ port: 80, targetPort: 80 }],
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

  return jsx(Fragment, { children: resources })
}
