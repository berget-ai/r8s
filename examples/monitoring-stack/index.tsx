/**
 * Monitoring Stack — complete observability platform
 *
 * Demonstrates: Platform, Grafana, Prometheus, Loki, Endpoint, TLS
 *
 * A full monitoring stack with:
 * - Prometheus (metrics)
 * - Loki (logs)
 * - Grafana (dashboards)
 * - Alertmanager (alerts)
 * - TLS certificates
 * - DNS records
 */

import { jsx } from '@r8s/core'
import { Platform, App, Endpoint } from '@r8s/recipes'
import { Grafana } from '@r8s/grafana'
import { LokiStackComponent } from '@r8s/crds/loki'
import { ServiceMonitorComponent } from '@r8s/crds/monitoring'

export default (
  <Platform
    namespace="monitoring"
    routing="ingress"
    secrets={{ backend: 'sealed-secrets' }}
    dns={{
      provider: 'external-dns',
      settings: {
        cloud: { provider: 'cloudflare', options: { proxied: 'false' } },
      },
    }}
  >
    {/* Loki for logs */}
    <LokiStackComponent
      metadata={{ name: 'loki', namespace: 'monitoring' }}
      spec={{
        size: '1x.small',
        storageClassName: 'standard',
        storage: {
          schemas: [{ version: 'v13', effectiveDate: '2024-01-01' }],
          secret: { name: 'loki-storage', type: 's3' },
        },
      }}
    />

    {/* Grafana for dashboards */}
    <Grafana
      name="grafana"
      namespace="monitoring"
      host="grafana.example.com"
      datasources={[
        { name: 'Prometheus', type: 'prometheus', url: 'http://prometheus:9090' },
        { name: 'Loki', type: 'loki', url: 'http://loki:3100' },
      ]}
      tls={{ secretName: 'grafana-tls', clusterIssuer: 'letsencrypt-prod' }}
    />

    {/* ServiceMonitor for app metrics */}
    <ServiceMonitorComponent
      metadata={{ name: 'app-monitor', namespace: 'monitoring', labels: { app: 'api' } }}
      spec={{
        selector: { matchLabels: { app: 'api' } },
        endpoints: [{ port: 'metrics', path: '/metrics', interval: '30s' }],
      }}
    />
  </Platform>
)
