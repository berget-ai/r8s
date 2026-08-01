import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'

export interface MonitoringProps {
  /** Resource name (used for ServiceMonitor labels) */
  name: string
  /** Kubernetes namespace where the app runs (defaults to 'default') */
  namespace?: string
  /** Labels matching the app pods to monitor (e.g., { app: 'api' }) */
  selector: Record<string, string>
  /** Metrics endpoint port name (defaults to 'metrics') */
  port?: string
  /** Metrics path (defaults to '/metrics') */
  path?: string
  /** Scrape interval (defaults to '30s') */
  interval?: string
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
 * // Monitor an app with default settings
 * <Monitoring name="api-monitor" selector={{ app: 'api' }} />
 *
 * @example
 * // Custom metrics path and interval
 * <Monitoring
 *   name="api-monitor"
 *   selector={{ app: 'api' }}
 *   path="/actuator/prometheus"
 *   interval="15s"
 * />
 */
export function Monitoring(props: MonitoringProps) {
  const {
    name,
    namespace = 'default',
    selector,
    port = 'metrics',
    path = '/metrics',
    interval = '30s',
  } = props

  const sharedOperators = useContext(OperatorContext)
  const hasPrometheus = sharedOperators.some((op) => op.name === 'prometheus')

  const resources: ReturnType<typeof jsx>[] = []

  if (!hasPrometheus) {
    resources.push(declareOperator(operators['prometheus']()))
  }

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

  return jsx(Fragment, { children: resources })
}
