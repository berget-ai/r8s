import { jsx, Fragment } from '@r8s/core'

export interface RustFSProps {
  /** Resource name */
  name?: string
  /** Kubernetes namespace */
  namespace?: string
  /** Number of instances (default: 4) */
  instances?: number
  /** Storage per instance (default: 100Gi) */
  storage?: string
  /** Storage class */
  storageClass?: string
  /** Root user (default: rustfs) */
  rootUser?: string
  /** Root password secret */
  rootPasswordSecret?: string
  /** Ingress host for S3 API */
  host?: string
  /** TLS config */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * RustFS S3-compatible object storage cluster.
 * Deploys without operator — native Kubernetes resources only.
 *
 * @example
 * <RustFS
 *   name="storage"
 *   namespace="rustfs"
 *   instances={4}
 *   storage="500Gi"
 *   host="s3.example.com"
 *   tls={{ secretName: "s3-tls", clusterIssuer: "letsencrypt" }}
 * />
 */
export function RustFS(props: RustFSProps) {
  const {
    name = 'rustfs',
    namespace = 'rustfs',
    instances = 4,
    storage = '100Gi',
    storageClass,
    rootUser = 'rustfs',
    rootPasswordSecret = `${name}-root-password`,
    host,
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

  // Headless service for StatefulSet
  resources.push(
    jsx('Service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: `${name}-headless`, namespace },
      spec: {
        clusterIP: 'None',
        selector: { app: name },
        ports: [
          { port: 9000, name: 's3' },
          { port: 9001, name: 'console' },
        ],
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
        ports: [
          { port: 80, targetPort: 9000, name: 's3' },
          { port: 9001, targetPort: 9001, name: 'console' },
        ],
      },
    })
  )

  // StatefulSet
  const pvcTemplate = {
    metadata: { name: 'data' },
    spec: {
      accessModes: ['ReadWriteOnce'],
      resources: { requests: { storage } },
      ...(storageClass && { storageClassName: storageClass }),
    },
  }

  resources.push(
    jsx('StatefulSet', {
      apiVersion: 'apps/v1',
      kind: 'StatefulSet',
      metadata: { name, namespace },
      spec: {
        serviceName: `${name}-headless`,
        replicas: instances,
        selector: { matchLabels: { app: name } },
        template: {
          metadata: { labels: { app: name } },
          spec: {
            containers: [
              {
                name: 'rustfs',
                image: 'rustfs/rustfs:latest',
                ports: [
                  { containerPort: 9000, name: 's3' },
                  { containerPort: 9001, name: 'console' },
                ],
                env: [
                  { name: 'RUSTFS_ROOT_USER', value: rootUser },
                  {
                    name: 'RUSTFS_ROOT_PASSWORD',
                    valueFrom: {
                      secretKeyRef: { name: rootPasswordSecret, key: 'password' },
                    },
                  },
                ],
                volumeMounts: [{ name: 'data', mountPath: '/data' }],
                resources: {
                  requests: { memory: '1Gi', cpu: '500m' },
                  limits: { memory: '4Gi', cpu: '2000m' },
                },
              },
            ],
          },
        },
        volumeClaimTemplates: [pvcTemplate],
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
