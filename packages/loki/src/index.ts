import { jsx } from '@r8s/core'
import { helmOperator } from '@r8s/k8s-types'

/** Grafana Loki declaration */
export const lokiOperator = (version = '5.47.0') =>
  helmOperator('loki', 'loki', 'https://grafana.github.io/helm-charts', version, {
    description: 'Grafana Loki - horizontally-scalable, highly-available log aggregation system',
    namespace: 'loki',
    crds: [
      'alertingrules.loki.grafana.com',
      'recordingrules.loki.grafana.com',
      'rulerconfigs.loki.grafana.com',
    ],
  })

export interface LokiStackProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace where Loki resources live (defaults to 'loki') */
  namespace?: string
  /** Where logs are stored — object storage (S3/GCS/Azure) or local filesystem */
  storage?: {
    type: 's3' | 'gcs' | 'azure' | 'filesystem'
    bucket?: string
    region?: string
    endpoint?: string
  }
  /** Replication settings — how many copies of each log stream to keep for durability */
  replication?: {
    factor?: number
  }
  /** Ingestion rate-limits and retention policy */
  limits?: {
    ingestion?: {
      rate?: string
      burstSize?: string
    }
    retention?: {
      period?: string
    }
  }
  /** CPU and memory requests/limits for Loki pods */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
}

/**
 * Grafana Loki log aggregation stack.
 *
 * Creates a LokiStack resource with object storage (S3/GCS/Azure) or
 * filesystem backend, replication factor, ingestion rate limits, and
 * retention policy. Pair with a Flow/Output from @r8s/logging-operator
 * or a Grafana datasource to query logs.
 *
 * @example
 * <LokiStack
 *   name="loki"
 *   namespace="loki"
 *   storage={{ type: 's3', bucket: 'my-loki-bucket', region: 'eu-north-1' }}
 * />
 */
export function LokiStack(props: LokiStackProps) {
  const { name, namespace = 'loki', storage, replication, limits, resources } = props

  const stack = {
    apiVersion: 'loki.grafana.com/v1',
    kind: 'LokiStack',
    metadata: { name, namespace },
    spec: {
      size: '1x.extra-small',
      storage: {
        schemas: [
          {
            version: 'v13',
            effectiveDate: '2024-01-01',
          },
        ],
        ...(storage && {
          type: storage.type,
          ...(storage.bucket && { bucket: storage.bucket }),
          ...(storage.region && { region: storage.region }),
          ...(storage.endpoint && { endpoint: storage.endpoint }),
        }),
      },
      ...(replication && {
        replication: {
          factor: replication.factor || 1,
        },
      }),
      ...(limits && {
        limits: {
          ...(limits.ingestion && {
            ingestion: {
              ...(limits.ingestion.rate && { rate: limits.ingestion.rate }),
              ...(limits.ingestion.burstSize && { burstSize: limits.ingestion.burstSize }),
            },
          }),
          ...(limits.retention && {
            retention: {
              ...(limits.retention.period && { period: limits.retention.period }),
            },
          }),
        },
      }),
      ...(resources && {
        template: {
          compactor: { spec: { resources } },
          distributor: { spec: { resources } },
          indexGateway: { spec: { resources } },
          ingester: { spec: { resources } },
          querier: { spec: { resources } },
          queryFrontend: { spec: { resources } },
        },
      }),
    },
  }

  return jsx('LokiStack', stack)
}

export interface AlertingRuleProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace where the rules live (defaults to 'loki') */
  namespace?: string
  /** Alert groups — each group contains named rules with LogQL expressions and labels */
  groups: Array<{
    name: string
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
 * AlertingRule for Loki-based alerting.
 */
/**
 * Creates a Loki alerting rule group evaluated by the Loki ruler.
 *
 * @example
 * <AlertingRule name="high-error-rate" groups={[{ name: "errors", rules: [{ alert: "HighErrorRate", expr: 'rate({app="api"}[5m]) > 0.1', for: "5m" }] }]} />
 */
export function AlertingRule(props: AlertingRuleProps) {
  const { name, namespace = 'loki', groups } = props

  const rule = {
    apiVersion: 'loki.grafana.com/v1',
    kind: 'AlertingRule',
    metadata: { name, namespace },
    spec: {
      groups: groups.map((g) => ({
        name: g.name,
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

  return jsx('AlertingRule', rule)
}
