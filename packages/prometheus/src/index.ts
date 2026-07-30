import { jsx } from '@r8s/core'
import { helmOperator } from '@r8s/k8s-types'

/** Prometheus Operator (kube-prometheus-stack) declaration */
export const prometheusOperator = (version = '0.72.0') =>
  helmOperator(
    'prometheus',
    'kube-prometheus-stack',
    'https://prometheus-community.github.io/helm-charts',
    version,
    {
      description: 'Prometheus monitoring stack with Grafana and Alertmanager',
      namespace: 'monitoring',
      crds: [
        'alertmanagers.monitoring.coreos.com',
        'podmonitors.monitoring.coreos.com',
        'probes.monitoring.coreos.com',
        'prometheuses.monitoring.coreos.com',
        'prometheusrules.monitoring.coreos.com',
        'servicemonitors.monitoring.coreos.com',
        'thanosrulers.monitoring.coreos.com',
      ],
    }
  )

export interface ServiceMonitorProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Extra labels attached to the ServiceMonitor (often used for Prometheus discovery) */
  labels?: Record<string, string>
  /** Label selector that picks the Service(s) whose endpoints should be scraped */
  selector: {
    matchLabels: Record<string, string>
  }
  /** Endpoints to scrape — each entry names a port and optional path/interval */
  endpoints: Array<{
    port: string
    path?: string
    interval?: string
    scrapeTimeout?: string
  }>
}

/**
 * ServiceMonitor for Prometheus scraping.
 *
 * Requires Prometheus Operator to be installed.
 *
 * @example
 * <ServiceMonitor
 *   name="api-metrics"
 *   namespace="production"
 *   selector={{ matchLabels: { app: 'api' } }}
 *   endpoints={[{ port: 'metrics', path: '/metrics' }]}
 * />
 */
export function ServiceMonitor(props: ServiceMonitorProps) {
  const { name, namespace = 'default', labels, selector, endpoints } = props

  const monitor = {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'ServiceMonitor',
    metadata: { name, namespace, labels },
    spec: {
      selector,
      endpoints: endpoints.map((e) => ({
        port: e.port,
        ...(e.path && { path: e.path }),
        ...(e.interval && { interval: e.interval }),
        ...(e.scrapeTimeout && { scrapeTimeout: e.scrapeTimeout }),
      })),
    },
  }

  return jsx('ServiceMonitor', monitor)
}

export interface PrometheusRuleProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Alert groups — each contains a name, optional interval, and a list of alerting rules */
  groups: Array<{
    name: string
    interval?: string
    rules: Array<{
      alert: string
      expr: string
      for?: string
      labels?: Record<string, string>
      annotations?: Record<string, string>
    }>
  }>
}

/**
 * PrometheusRule for alerting rules.
 */
/**
 * Creates a PrometheusRule with alerting groups and rules evaluated by Prometheus.
 *
 * @example
 * <PrometheusRule name="api-alerts" groups={[{ name: "api", rules: [{ alert: "HighErrorRate", expr: 'rate(http_requests_total{status=~"5.."}[5m]) > 0.1', for: "5m" }] }]} />
 */
export function PrometheusRule(props: PrometheusRuleProps) {
  const { name, namespace = 'default', groups } = props

  const rule = {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'PrometheusRule',
    metadata: { name, namespace },
    spec: {
      groups: groups.map((g) => ({
        name: g.name,
        ...(g.interval && { interval: g.interval }),
        rules: g.rules.map((r) => ({
          alert: r.alert,
          expr: r.expr,
          ...(r.for && { for: r.for }),
          ...(r.labels && { labels: r.labels }),
          ...(r.annotations && { annotations: r.annotations }),
        })),
      })),
    },
  }

  return jsx('PrometheusRule', rule)
}

export interface PodMonitorProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Extra labels attached to the PodMonitor (often used for Prometheus discovery) */
  labels?: Record<string, string>
  /** Label selector that picks which pods should be scraped */
  selector: {
    matchLabels: Record<string, string>
  }
  /** Pod metric endpoints to scrape — each names a port and optional path/interval */
  podMetricsEndpoints: Array<{
    port: string
    path?: string
    interval?: string
  }>
}

/**
 * PodMonitor for scraping pods directly (without Service).
 */
/**
 * Creates a PodMonitor that tells Prometheus to scrape pod metrics directly.
 *
 * @example
 * <PodMonitor name="worker-metrics" selector={{ matchLabels: { app: "worker" } }} podMetricsEndpoints={[{ port: "metrics", path: "/metrics", interval: "30s" }]} />
 */
export function PodMonitor(props: PodMonitorProps) {
  const { name, namespace = 'default', labels, selector, podMetricsEndpoints } = props

  const monitor = {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'PodMonitor',
    metadata: { name, namespace, labels },
    spec: {
      selector,
      podMetricsEndpoints: podMetricsEndpoints.map((e) => ({
        port: e.port,
        ...(e.path && { path: e.path }),
        ...(e.interval && { interval: e.interval }),
      })),
    },
  }

  return jsx('PodMonitor', monitor)
}
