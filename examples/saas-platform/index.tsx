/**
 * SaaS Platform — multi-tenant SaaS application
 *
 * Demonstrates: Platform, App, Database, Auth, Superset, RustFS, Endpoint, DNS, TLS
 *
 * A complete SaaS platform with:
 * - Multi-tenant architecture
 * - PostgreSQL (per-tenant databases)
 * - Keycloak (SSO)
 * - Superset (analytics)
 * - RustFS (file storage)
 * - Redis (cache)
 * - TLS certificates
 * - DNS records
 */

import { jsx } from '@r8s/core'
import { Platform, App, Database, Auth, Endpoint } from '@r8s/recipes'
import { Realms, Realm, Clients, Client, Google } from '@r8s/recipes/auth'
import { Superset } from '@r8s/superset'
import { RustFS } from '@r8s/rustfs'

export default (
  <Platform
    namespace="saas"
    routing="gateway"
    secrets={{ backend: 'vault', mount: 'kv', path: 'saas' }}
    dns={{
      provider: 'external-dns',
      settings: {
        server: 'ns1.example.com',
        zone: 'saas.example.com',
        tsig: { path: 'dns/tsig', key: 'secret' },
      },
    }}
  >
    {/* SSO */}
    <Auth
      name="auth"
      host="auth.saas.example.com"
      tls={{ secretName: 'auth-tls', clusterIssuer: 'letsencrypt-prod' }}
    >
      <Realms>
        <Realm id="saas" displayName="SaaS Platform">
          <Google clientId="your-google-client-id" clientSecret="${env:GOOGLE_CLIENT_SECRET}" />
          <Clients>
            <Client id="web" type="public" redirectUris={['https://app.saas.example.com/*']} />
            <Client id="api" type="bearer-only" />
            <Client id="superset" type="confidential" secret="${env:SUPERSET_CLIENT_SECRET}" />
          </Clients>
        </Realm>
      </Realms>
    </Auth>

    {/* Platform database */}
    <Database name="platform-db" storage="50Gi" />

    {/* Analytics database */}
    <Database name="analytics-db" storage="100Gi" />

    {/* File storage */}
    <RustFS
      name="storage"
      namespace="saas"
      instances={4}
      storage="500Gi"
      host="s3.saas.example.com"
      tls={{ secretName: 's3-tls', clusterIssuer: 'letsencrypt-prod' }}
    />

    {/* Analytics — database password comes from passwordSecret
        (provisioned by the Vault backend); the admin dashboard key is
        injected at deploy time via a sealed secret or CI environment. */}
    <Superset
      host="analytics.saas.example.com"
      database={{
        host: 'analytics-db-rw.saas.svc.cluster.local',
        database: 'analytics-db',
        user: 'superset',
        passwordSecret: 'superset-db-credentials',
        passwordKey: 'password',
      }}
      redis={{ create: true }}
      admin={{ existingSecret: 'superset-admin-credentials' }}
      tls={{ secretName: 'superset-tls', clusterIssuer: 'letsencrypt-prod' }}
    />

    {/* API */}
    <App
      name="api"
      image="registry.example.com/saas-api:v2.0.0"
      host="api.saas.example.com"
      tls={{ secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' }}
      env={{
        DATABASE_URL: 'postgresql://platform-db-rw:5432/platform-db',
        S3_ENDPOINT: 'https://s3.saas.example.com',
        KEYCLOAK_URL: 'https://auth.saas.example.com',
      }}
    />

    {/* Web App */}
    <App
      name="web"
      image="registry.example.com/saas-web:v2.0.0"
      host="app.saas.example.com"
      tls={{ secretName: 'web-tls', clusterIssuer: 'letsencrypt-prod' }}
      env={{
        API_URL: 'https://api.saas.example.com',
        KEYCLOAK_URL: 'https://auth.saas.example.com',
      }}
    />
  </Platform>
)
