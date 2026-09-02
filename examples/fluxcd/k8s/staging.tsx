import { Database, WebService, Endpoint } from '@r8s/recipes'

/**
 * Staging environment.
 *
 * Credentials are managed outside the manifest: CNPG generates the
 * bootstrap secret in-cluster, and `<WebService>` inside `<Database>`
 * injects PGPASSWORD via secretKeyRef. Nothing sensitive lives in this
 * file or in the rendered YAML.
 */
export default function StagingApp() {
  return (
    <Database name="app-db" namespace="staging" storage="5Gi">
      <WebService name="app" image="myapp/app:staging" port={3000} replicas={1} />

      <Endpoint
        name="app-ingress"
        namespace="staging"
        host="staging-app.example.com"
        serviceName="app"
        servicePort={80}
        tls={{ secretName: 'app-tls-staging', clusterIssuer: 'letsencrypt-staging' }}
      />
    </Database>
  )
}
