import { Database, WebService, Endpoint } from '@r8s/recipes'

/**
 * Production environment.
 *
 * Production credentials should come from a secrets backend — wrap the
 * tree in a Platform with a backend when you deploy for real:
 *
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'production' }}>
 *     ...
 *   </Platform>
 *
 * CNPG generates the bootstrap secret in-cluster either way; plaintext
 * passwords never appear in this file or in the rendered YAML.
 */
export default function ProductionApp() {
  return (
    <Database name="app-db" namespace="production" storage="50Gi">
      <WebService name="app" image="myapp/app:v1.2.3" port={3000} replicas={5} />

      <Endpoint
        name="app-ingress"
        namespace="production"
        host="app.example.com"
        serviceName="app"
        servicePort={80}
        tls={{ secretName: 'app-tls', clusterIssuer: 'letsencrypt-prod' }}
      />
    </Database>
  )
}
