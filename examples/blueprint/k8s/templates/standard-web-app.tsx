// Platform team's "Golden Path" template
// Teams just fill in the blanks — everything else is standardized

import { Database, WebService, Endpoint } from '@r8s/recipes'

interface StandardWebAppProps {
  // Required: What the team controls
  name: string
  image: string
  domain: string

  // Optional: Sensible defaults provided
  namespace?: string
  port?: number
  replicas?: number
  dbName?: string
  enableMonitoring?: boolean
  enableTracing?: boolean
}

/**
 * Golden Path template for web apps with a database.
 *
 * Credentials are never passed through the template: `<WebService>`
 * inside `<Database>` gets PG* env vars wired automatically with
 * PGPASSWORD via secretKeyRef, and CNPG provisions the bootstrap secret
 * in-cluster (or the platform Platform-level secrets backend does).
 */
export function StandardWebApp(props: StandardWebAppProps) {
  const {
    name,
    image,
    domain,
    namespace = 'default',
    port = 3000,
    replicas = 2,
    dbName = name,
    enableMonitoring = true,
    enableTracing = true,
  } = props

  return (
    <Database name={`${name}-db`} namespace={namespace} storage="10Gi">
      {/* Standard: Web service with platform defaults */}
      <WebService
        name={name}
        namespace={namespace}
        image={image}
        port={port}
        replicas={replicas}
        env={{
          METRICS_ENABLED: enableMonitoring ? 'true' : 'false',
          TRACING_ENABLED: enableTracing ? 'true' : 'false',
        }}
        resources={{
          requests: { memory: '128Mi', cpu: '100m' },
          limits: { memory: '256Mi', cpu: '200m' },
        }}
      />

      {/* Standard: Ingress with TLS */}
      <Endpoint
        name={`${name}-ingress`}
        namespace={namespace}
        host={domain}
        serviceName={name}
        servicePort={80}
        tls={{ secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' }}
        annotations={{
          'nginx.ingress.kubernetes.io/rate-limit': '100',
          'nginx.ingress.kubernetes.io/enable-cors': 'true',
        }}
      />
    </Database>
  )
}
