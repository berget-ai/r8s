import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { declareIfMissing as declarePrometheus } from '@r8s/operator-prometheus'
import { declareIfMissing as declareLoki } from '@r8s/operator-loki'
import { declareIfMissing as declareLogging } from '@r8s/operator-logging'
import { LokiStackComponent } from '@r8s/crds/loki'
import { LoggingComponent, FlowComponent, OutputComponent } from '@r8s/crds/logging'

export interface MonitoringProps {
  /** Resource name (used for ServiceMonitor labels) */
  name: string
  /** Kubernetes namespace where the app runs (defaults to 'default') */
  namespace?: string
  /** Labels matching the Kubernetes Service to monitor (e.g., { app: 'api' }) */
  selector: Record<string, string>
  /** Metrics endpoint port name (defaults to 'metrics') */
  port?: string
  /** Metrics path (defaults to '/metrics') */
  path?: string
  /** Scrape interval (defaults to '30s') */
  interval?: string
  /** Enable log aggregation with Loki (default: false) */
  logs?: boolean
  /** Loki storage size (default: '10Gi') */
  logsStorage?: string
}

/**
 * Application monitoring — Prometheus ServiceMonitor for your app.
 *
 * @title Monitoring
 * @category Observability
 *
 * Creates a ServiceMonitor that tells Prometheus to scrape your app's
 * metrics endpoint. Pair with a Grafana dashboard for visualization.
 *
 * The Prometheus operator (kube-prometheus-stack) is declared as a
 * dependency — it installs Prometheus, Grafana, and Alertmanager.
 *
 * @example
 * import { Monitoring } from '@r8s/recipes'
 *
 * export default <Monitoring name="api-monitor" selector={{ app: 'api' }} />
 *
 * @example
 * import { Monitoring } from '@r8s/recipes'
 *
 * export default (
 *   <Monitoring
 *     name="api-monitor"
 *     selector={{ app: 'api' }}
 *     path="/actuator/prometheus"
 *     interval="15s"
 *   />
 * )
 */
export function Monitoring(props: MonitoringProps) {
  const {
    name,
    namespace = 'default',
    selector,
    port = 'metrics',
    path = '/metrics',
    interval = '30s',
    logs = false,
    logsStorage = '10Gi',
  } = props

  const sharedOperators = useContext(OperatorContext)
  const resources: ReturnType<typeof jsx>[] = []

  resources.push(...declarePrometheus(sharedOperators))

  resources.push(
    jsx('ServiceMonitor', {
      apiVersion: 'monitoring.coreos.com/v1',
      kind: 'ServiceMonitor',
      metadata: {
        name,
        namespace,
        labels: { release: 'prometheus' },
      },
      spec: {
        selector: { matchLabels: selector },
        endpoints: [{ port, path, interval }],
      },
    })
  )

  // Log aggregation with Loki
  if (logs) {
    resources.push(...declareLoki(sharedOperators))
    resources.push(...declareLogging(sharedOperators))

    resources.push(
      LokiStackComponent({
        metadata: { name: `${name}-loki`, namespace },
        spec: {
          size: '1x.small',
          storage: {
            schemas: [{ version: 'v13', effectiveDate: '2024-01-01' }],
            secret: { name: `${name}-loki-storage`, type: 's3' },
          },
          storageClassName: 'standard',
          tenants: {
            mode: 'static',
            authentication: [{ tenantName: 'application', tenantId: 'app' }],
            authorization: {
              roles: [
                {
                  name: 'app-reader',
                  permissions: ['read'],
                  resources: ['logs'],
                  tenants: ['application'],
                },
              ],
              roleBindings: [
                {
                  name: 'app-reader-binding',
                  roles: ['app-reader'],
                  subjects: [{ kind: 'group', name: 'system:authenticated' }],
                },
              ],
            },
          },
        },
      })
    )

    resources.push(
      LoggingComponent({
        metadata: { name: `${name}-logging`, namespace },
        spec: {
          fluentd: {},
          fluentbit: {},
          controlNamespace: namespace,
        },
      })
    )

    resources.push(
      OutputComponent({
        metadata: { name: `${name}-loki-output`, namespace },
        spec: {
          loki: {
            url: 'http://loki-gateway.loki.svc.cluster.local',
            tenant: 'application',
          },
        },
      })
    )

    resources.push(
      FlowComponent({
        metadata: { name: `${name}-flow`, namespace },
        spec: {
          match: [{ select: { labels: selector } }],
          localOutputRefs: [`${name}-loki-output`],
        },
      })
    )
  }

  return jsx(Fragment, { children: resources })
}
