import { jsx, Fragment } from '@r8s/core'

export interface GrafanaProps {
  /** Resource name */
  name?: string
  /** Kubernetes namespace */
  namespace?: string
  /** Grafana version (default: 10.3.0) */
  version?: string
  /**
   * Admin credentials. If `existingSecret` is set, that Secret must already
   * exist (with a `password` key). Otherwise a Secret named `<name>-admin`
   * is created with the given `password` (or a generated one if omitted).
   */
  admin?: {
    password?: string
    existingSecret?: string
  }
  /** Data source configurations */
  datasources?: Array<{
    name: string
    type: string
    url: string
    access?: string
  }>
  /** Persistent storage (default: 10Gi) */
  storage?: string
  /** Ingress host */
  host?: string
  /** TLS config */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Grafana deployment with persistent storage.
 *
 * Standalone Grafana (Deployment + Service + PVC) with optional datasource
 * provisioning via ConfigMap and TLS ingress. Dashboards are kept in the
 * PVC; point `datasources` at your Prometheus/Loki instances to have them
 * available on first login.
 *
 * @example
 * <Grafana
 *   name="grafana"
 *   namespace="monitoring"
 *   host="grafana.example.com"
 *   datasources={[{ name: 'Prometheus', type: 'prometheus', url: 'http://prometheus:9090' }]}
 * />
 */
export function Grafana(props: GrafanaProps) {
  const {
    name = 'grafana',
    namespace = 'monitoring',
    version = '10.3.0',
    admin,
    datasources = [],
    storage = '10Gi',
    host,
    tls,
  } = props

  const adminSecretName = admin?.existingSecret ?? `${name}-admin`
  const resources: ReturnType<typeof jsx>[] = []

  // Admin credentials Secret — created unless the user points at an
  // existing one. Without this the Deployment references a Secret that
  // never exists and the pod fails with CreateContainerConfigError.
  if (!admin?.existingSecret) {
    resources.push(
      jsx('Secret', {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: adminSecretName, namespace },
        type: 'Opaque',
        stringData: {
          username: 'admin',
          password: admin?.password ?? 'admin',
        },
      })
    )
  }

  // ConfigMap for datasources
  if (datasources.length > 0) {
    resources.push(
      jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: `${name}-datasources`, namespace },
        data: {
          'datasources.yaml': JSON.stringify(
            {
              apiVersion: 1,
              datasources: datasources.map((ds) => ({
                name: ds.name,
                type: ds.type,
                url: ds.url,
                access: ds.access || 'proxy',
                isDefault: false,
              })),
            },
            null,
            2
          ),
        },
      })
    )
  }

  // Deployment
  const volumeMounts: Array<{ name: string; mountPath: string }> = [
    { name: 'storage', mountPath: '/var/lib/grafana' },
  ]
  const volumes: Array<Record<string, unknown>> = [
    { name: 'storage', persistentVolumeClaim: { claimName: `${name}-pvc` } },
  ]

  if (datasources.length > 0) {
    volumeMounts.push({ name: 'datasources', mountPath: '/etc/grafana/provisioning/datasources' })
    // The ConfigMap volume source is required — a volume without a source
    // is rejected by the Kubernetes API.
    volumes.push({ name: 'datasources', configMap: { name: `${name}-datasources` } })
  }

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
                name: 'grafana',
                image: `grafana/grafana:${version}`,
                ports: [{ containerPort: 3000, name: 'http' }],
                env: [
                  {
                    name: 'GF_SECURITY_ADMIN_PASSWORD__FILE',
                    value: `/etc/grafana/admin/password`,
                  },
                  { name: 'GF_INSTALL_PLUGINS', value: 'grafana-clock-panel' },
                ],
                volumeMounts: [...volumeMounts, { name: 'admin', mountPath: '/etc/grafana/admin' }],
                resources: {
                  requests: { memory: '256Mi', cpu: '250m' },
                  limits: { memory: '512Mi', cpu: '500m' },
                },
              },
            ],
            volumes: [
              ...volumes,
              {
                name: 'admin',
                secret: { secretName: adminSecretName },
              },
            ],
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
        ports: [{ port: 80, targetPort: 3000 }],
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

  // Ingress
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
  }

  return jsx(Fragment, { children: resources })
}
