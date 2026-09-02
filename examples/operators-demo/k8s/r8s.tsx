import { Platform, Database, WebService, Endpoint } from '@r8s/recipes'
import { KeycloakRealm } from '@r8s/crds/keycloak'

/**
 * Operators demo — declarative operators + managed secrets.
 *
 * All credentials flow through the secrets backend configured at the
 * Platform level (OpenBao here). Nothing in this file — or in the
 * rendered YAML — contains a plaintext credential:
 *
 * - Database credentials are provisioned by the backend
 *   (OpenBaoStaticSecret per database).
 * - Client secrets use the ${env:VAR} reference pattern — resolved by
 *   the Keycloak operator at reconcile time, never stored in manifests:
 *     <Client id="superset" type="confidential" secret="${env:SUPERSET_CLIENT_SECRET}" />
 */
export default function PlatformInfrastructure() {
  return (
    <Platform namespace="auth" secrets={{ backend: 'openbao', mount: 'kv', path: 'platform' }}>
      {/* Database — credentials provisioned by OpenBao
          (OpenBaoStaticSecret → keycloak-db-credentials) */}
      <Database name="keycloak-db" storage="10Gi" />

      {/* Keycloak realm demo — client config only. User passwords are
          provisioned by the backend / Keycloak admin console, never
          written into realm manifests. */}
      <KeycloakRealm
        name="main-realm"
        namespace="auth"
        keycloakName="keycloak"
        realmName="example"
        displayName="Example Organization"
        clients={[
          {
            clientId: 'web-app',
            name: 'Web Application',
            redirectUris: ['https://app.example.com/*'],
            webOrigins: ['https://app.example.com'],
            publicClient: true,
          },
          {
            clientId: 'api-service',
            name: 'API Service',
            redirectUris: ['https://api.example.com/*'],
            serviceAccountsEnabled: true,
            publicClient: false,
          },
        ]}
      />

      {/* App wired to the database credentials managed by the backend */}
      <Database name="app-db" storage="10Gi">
        <WebService name="api" image="myapp/api:v2.0.0" port={3000} />
      </Database>

      <Endpoint
        name="api-endpoint"
        host="api.example.com"
        serviceName="api"
        servicePort={3000}
        tls={{ secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' }}
      />
    </Platform>
  )
}
