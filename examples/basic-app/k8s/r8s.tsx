import { Database, WebService, Endpoint } from '@r8s/recipes'

/**
 * Basic app — a PostgreSQL database and a web service.
 *
 * Credentials are NOT included in this file. The `<WebService>` inside
 * `<Database>` receives connection info via DatabaseContext and injects
 * PGPASSWORD via secretKeyRef. With no secrets backend configured, CNPG
 * generates the bootstrap secret in-cluster — plaintext passwords never
 * appear in this source or in the rendered YAML.
 *
 * For production, configure a secrets backend on the Platform:
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 */
export default function App() {
  return (
    <Database name="myapp-db" namespace="production" storage="20Gi">
      <WebService name="myapp-web" image="myapp/web:v1.2.3" port={3000} replicas={3} />

      <Endpoint
        name="myapp-ingress"
        namespace="production"
        host="myapp.example.com"
        serviceName="myapp-web"
        servicePort={80}
        tls={{ secretName: 'myapp-tls', clusterIssuer: 'letsencrypt-prod' }}
        annotations={{
          'nginx.ingress.kubernetes.io/rate-limit': '100',
        }}
      />
    </Database>
  )
}
