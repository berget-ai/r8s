/**
 * Web Shop — complete e-commerce platform
 *
 * Demonstrates: Platform, App, Database, Auth, Endpoint, DNS, TLS
 *
 * A typical web shop with:
 * - Frontend (React SPA)
 * - API (Node.js backend)
 * - PostgreSQL database
 * - Keycloak authentication
 * - Redis cache
 * - TLS certificates
 * - DNS records
 *
 * Required operators (install separately):
 * - cnpg (manifest — auto-fetched)
 * - cert-manager (manifest — auto-fetched)
 * - keycloak-operator (manifest — auto-fetched)
 * - external-dns (helm — install manually)
 * - vault-secrets-operator (helm — install manually)
 */

import { jsx } from '@r8s/core'
import { Platform, App, Database, Auth, Endpoint } from '@r8s/recipes'
import { Realms, Realm, Clients, Client, EntraID } from '@r8s/recipes/auth'

export default (
  <Platform
    namespace="web-shop"
    routing="gateway"
    secrets={{ backend: 'openbao', mount: 'secret', path: 'web-shop' }}
    dns={{
      provider: 'external-dns',
      settings: {
        server: 'ns1.example.com',
        zone: 'example.com',
      },
    }}
  >
    {/* Identity Provider */}
    <Auth
      name="auth"
      host="auth.shop.example.com"
      tls={{ secretName: 'auth-tls', clusterIssuer: 'letsencrypt-prod' }}
    >
      <Realms>
        <Realm id="shop" displayName="Web Shop">
          <EntraID
            tenantId="your-tenant-id"
            clientId="your-client-id"
            clientSecret="${env:ENTRA_CLIENT_SECRET}"
          />
          <Clients>
            <Client id="web" type="public" redirectUris={['https://shop.example.com/*']} />
            <Client id="api" type="bearer-only" />
          </Clients>
        </Realm>
      </Realms>
    </Auth>

    {/* Database */}
    <Database backup={false} name="shop-db" storage="20Gi" />

    {/* API Backend */}
    <App
      name="api"
      image="registry.example.com/web-shop-api:v1.2.3"
      host="api.shop.example.com"
      tls={{ secretName: 'api-tls', clusterIssuer: 'letsencrypt-prod' }}
      env={{
        DATABASE_URL: 'postgresql://shop-db-rw:5432/shop-db',
        KEYCLOAK_URL: 'https://auth.shop.example.com',
        KEYCLOAK_REALM: 'shop',
        KEYCLOAK_CLIENT_ID: 'api',
      }}
    />

    {/* Frontend */}
    <App
      name="web"
      image="registry.example.com/web-shop-web:v1.2.3"
      host="shop.example.com"
      tls={{ secretName: 'web-tls', clusterIssuer: 'letsencrypt-prod' }}
      env={{
        API_URL: 'https://api.shop.example.com',
        KEYCLOAK_URL: 'https://auth.shop.example.com',
        KEYCLOAK_REALM: 'shop',
        KEYCLOAK_CLIENT_ID: 'web',
      }}
    />
  </Platform>
)
