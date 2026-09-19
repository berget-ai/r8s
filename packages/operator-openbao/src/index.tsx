/**
 * @r8s/operator-openbao — the OpenBao secrets server, natively rendered
 * (helm-free). The openbao-helm chart's value is templating; a single-server
 * raft deployment is a known, static shape: a ConfigMap with the server HCL,
 * a StatefulSet mounting it, and the 8200/8201 Services.
 *
 * Consumers declare "@r8s/operator-openbao" as a peerDependency so npm
 * resolves ONE copy per tree.
 */
import { jsx, Fragment } from '@r8s/core'

export interface OpenBaoServerProps {
  /** Resource name (default: 'openbao'). */
  name?: string
  /** Kubernetes namespace (default: 'openbao'). */
  namespace?: string
  /** Container image (default: 'openbao/openbao:2.6.2'). */
  image?: string
  /** Raft data PVC size (default: '5Gi'). */
  storage?: string
  /** StorageClass for the raft PVC (default: cluster default). */
  storageClass?: string
  /** Enable the web UI (default: true). */
  ui?: boolean
  /** Replicas — raft peers (default: 1; a single server unseals with 1 key). */
  replicas?: number
}

/** The server HCL — raft integrated storage, plain-HTTP listener (in-cluster
 * only; TLS is a hardening follow-up), UI per props. */
function serverHcl(ui: boolean): string {
  return `ui = ${ui ? 'true' : 'false'}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

storage "raft" {
  path = "/openbao/data"
}

disable_mlock = true
api_addr       = "http://$(POD_IP):8200"
`
}

export function OpenBaoServer(props: OpenBaoServerProps = {}) {
  const {
    name = 'openbao',
    namespace = 'openbao',
    image = 'openbao/openbao:2.6.2',
    storage = '5Gi',
    storageClass,
    ui = true,
    replicas = 1,
  } = props
  const labels = { 'app.kubernetes.io/name': name, 'app.kubernetes.io/part-of': 'openbao' }

  return jsx(Fragment, {
    children: [
      jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: `${name}-server-config`, namespace, labels },
        data: { 'server.hcl': serverHcl(ui) },
      }),
      jsx('Service', {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name, namespace, labels },
        spec: {
          selector: labels,
          ports: [
            { name: 'api', port: 8200, targetPort: 8200 },
            { name: 'cluster', port: 8201, targetPort: 8201 },
          ],
        },
      }),
      jsx('StatefulSet', {
        apiVersion: 'apps/v1',
        kind: 'StatefulSet',
        metadata: { name, namespace, labels },
        spec: {
          serviceName: name,
          replicas,
          selector: { matchLabels: labels },
          template: {
            metadata: { labels },
            spec: {
              containers: [
                {
                  name: 'server',
                  image,
                  args: ['server', '-config=/openbao/config/server.hcl'],
                  env: [{ name: 'POD_IP', valueFrom: { fieldRef: { fieldPath: 'status.podIP' } } }],
                  ports: [
                    { name: 'api', containerPort: 8200 },
                    { name: 'cluster', containerPort: 8201 },
                  ],
                  readinessProbe: {
                    httpGet: { path: '/v1/sys/health', port: 8200 },
                    initialDelaySeconds: 5,
                    periodSeconds: 10,
                  },
                  volumeMounts: [
                    { name: 'config', mountPath: '/openbao/config', readOnly: true },
                    { name: 'data', mountPath: '/openbao/data' },
                  ],
                  securityContext: { capabilities: { add: ['IPC_LOCK'] } },
                },
              ],
              volumes: [{ name: 'config', configMap: { name: `${name}-server-config` } }],
            },
          },
          volumeClaimTemplates: [
            {
              metadata: { name: 'data', labels },
              spec: {
                accessModes: ['ReadWriteOnce'],
                ...(storageClass ? { storageClassName: storageClass } : {}),
                resources: { requests: { storage } },
              },
            },
          ],
        },
      }),
    ],
  })
}
