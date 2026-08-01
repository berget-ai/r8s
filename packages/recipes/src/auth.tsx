import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database } from './database'
import { Endpoint } from './endpoint'
import type { TLSConfig } from '@r8s/k8s-types'
import {
  Realm,
  Realms,
  Clients,
  Client,
  type RealmConfig,
  type ClientConfig,
} from './auth/components'

export interface AuthProps {
  /** Resource name */
  name: string
  /** Public hostname for the identity provider (e.g., 'auth.example.com') */
  host: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Number of Keycloak replicas (defaults to 1) */
  instances?: number
  /** Database storage size (defaults to '10Gi') */
  storage?: string
  /** TLS certificate configuration */
  tls?: TLSConfig
  /** Child components (Realms) */
  children?: unknown
}

/**
 * Identity and access management — Keycloak with database, TLS, and routing.
 *
 * @title Auth
 * @category Security & Identity
 *
 * Composes Keycloak (identity provider), CNPG (PostgreSQL database),
 * cert-manager (TLS), and routing (Ingress/Gateway) into a single
 * identity solution with good defaults.
 *
 * The database is auto-wired: Keycloak connects to its own PostgreSQL
 * cluster. Credentials are managed by CNPG's bootstrap secret.
 *
 * @example
 * // Simple Keycloak instance
 * import { Auth } from '@r8s/recipes'
 *
 * export default <Auth name="auth" host="auth.example.com" />
 *
 * @example
 * // Keycloak with custom storage and TLS
 * import { Auth } from '@r8s/recipes'
 *
 * export default (
 *   <Auth
 *     name="auth"
 *     host="auth.example.com"
 *     instances={2}
 *     storage="20Gi"
 *     tls={{ secretName: 'auth-tls', clusterIssuer: 'letsencrypt-prod' }}
 *   />
 * )
 *
 * @example
 * // Keycloak with realms and clients
 * import { Auth } from '@r8s/recipes'
 * import { Realms, Realm, Clients, Client } from '@r8s/recipes/auth'
 *
 * export default (
 *   <Auth name="auth" host="auth.example.com">
 *     <Realms>
 *       <Realm id="company" displayName="Company">
 *         <Clients>
 *           <Client id="web" type="public" redirectUris={['https://app.example.com/*']} />
 *           <Client id="api" type="bearer-only" />
 *         </Clients>
 *       </Realm>
 *     </Realms>
 *   </Auth>
 * )
 *
 * @example
 * // Keycloak with EntraID federation
 * import { Auth } from '@r8s/recipes'
 * import { Realms, Realm, Clients, Client, EntraID } from '@r8s/recipes/auth'
 *
 * export default (
 *   <Auth name="auth" host="auth.example.com">
 *     <Realms>
 *       <Realm id="company" displayName="Company">
 *         <EntraID
 *           tenantId="your-tenant-id"
 *           clientId="your-client-id"
 *           clientSecret="${env:ENTRA_CLIENT_SECRET}"
 *         />
 *         <Clients>
 *           <Client id="web" type="public" redirectUris={['https://app.example.com/*']} />
 *         </Clients>
 *       </Realm>
 *     </Realms>
 *   </Auth>
 * )
 */
export function Auth(props: AuthProps) {
  const {
    name,
    host,
    namespace = 'default',
    instances = 1,
    storage = '10Gi',
    tls,
    children,
  } = props

  const sharedOperators = useContext(OperatorContext)
  const hasKeycloak = sharedOperators.some((op) => op.name === 'keycloak-operator')
  const hasCNPG = sharedOperators.some((op) => op.name === 'cnpg')

  const resources: ReturnType<typeof jsx>[] = []

  // Declare operators if not already provided
  if (!hasKeycloak) {
    resources.push(declareOperator(operators['keycloak-operator']()))
  }
  if (!hasCNPG) {
    resources.push(declareOperator(operators['cnpg']()))
  }

  // Database for Keycloak — auto-wired via DatabaseContext.
  // Credentials are managed by the secrets backend configured on the Platform.
  resources.push(
    jsx(Database, {
      name: `${name}-db`,
      namespace,
      storage,
      children: jsx('Keycloak', {
        apiVersion: 'k8s.keycloak.org/v2alpha1',
        kind: 'Keycloak',
        metadata: { name, namespace },
        spec: {
          instances,
          hostname: {
            hostname: host,
            strict: false,
            strictBackchannel: false,
          },
          proxy: {
            headers: 'xforwarded',
          },
          ingress: {
            enabled: false, // We use our own Endpoint for routing
          },
          transaction: {
            xaEnabled: false,
          },
        },
      }),
    })
  )

  // Endpoint for public access
  resources.push(
    jsx(Endpoint, {
      name: `${name}-endpoint`,
      namespace,
      host,
      serviceName: `${name}-service`,
      servicePort: 8080,
      tls,
    })
  )

  // Process children (Realms) to create KeycloakRealmImport resources
  const realms = collectRealms(children)
  for (const realm of realms) {
    resources.push(
      jsx('KeycloakRealmImport', {
        apiVersion: 'k8s.keycloak.org/v2alpha1',
        kind: 'KeycloakRealmImport',
        metadata: { name: `${name}-${realm.id}`, namespace },
        spec: {
          keycloakCRName: name,
          realm: {
            realm: realm.id,
            displayName: realm.displayName,
            enabled: realm.enabled ?? true,
            identityProviders: realm.identityProviders?.map((idp) => ({
              alias: idp.alias,
              displayName: idp.displayName,
              providerId: idp.providerId,
              enabled: idp.enabled ?? true,
              trustEmail: idp.trustEmail ?? false,
              config: idp.config,
            })),
            clients: realm.clients?.map((client) => ({
              clientId: client.id,
              name: client.name ?? client.id,
              publicClient: client.type === 'public',
              standardFlowEnabled: client.type === 'public',
              bearerOnly: client.type === 'bearer-only',
              serviceAccountsEnabled: client.type === 'confidential' ? true : undefined,
              secret: client.secret,
              redirectUris: client.redirectUris,
              webOrigins: client.webOrigins,
              directAccessGrantsEnabled: client.directAccessGrantsEnabled ?? false,
            })),
          },
        },
      })
    )
  }

  return jsx(Fragment, { children: resources })
}

/** Collect Realm configurations from children */
function collectRealms(children: unknown): RealmConfig[] {
  const realms: RealmConfig[] = []

  if (!children) return realms

  const childArray = Array.isArray(children) ? children : [children]
  for (const child of childArray) {
    if (child && typeof child === 'object' && 'type' in child) {
      if (child.type === Realms) {
        const realmsProps = (child as any).props
        const realmChildren = Array.isArray(realmsProps.children)
          ? realmsProps.children
          : [realmsProps.children]
        for (const realmChild of realmChildren) {
          if (
            realmChild &&
            typeof realmChild === 'object' &&
            'type' in realmChild &&
            realmChild.type === Realm
          ) {
            const realmProps = (realmChild as any).props
            const clients = collectClients(realmProps.children)
            realms.push({
              id: realmProps.id,
              displayName: realmProps.displayName,
              enabled: realmProps.enabled,
              identityProviders: realmProps.identityProviders,
              clients,
            })
          }
        }
      } else if (child.type === Realm) {
        const realmProps = (child as any).props
        const clients = collectClients(realmProps.children)
        realms.push({
          id: realmProps.id,
          displayName: realmProps.displayName,
          enabled: realmProps.enabled,
          identityProviders: realmProps.identityProviders,
          clients,
        })
      }
    }
  }

  return realms
}

/** Collect Client configurations from children */
function collectClients(children: unknown): ClientConfig[] {
  const clients: ClientConfig[] = []

  if (!children) return clients

  const childArray = Array.isArray(children) ? children : [children]
  for (const child of childArray) {
    if (child && typeof child === 'object' && 'type' in child) {
      if (child.type === Clients) {
        const clientsProps = (child as any).props
        const clientChildren = Array.isArray(clientsProps.children)
          ? clientsProps.children
          : [clientsProps.children]
        for (const clientChild of clientChildren) {
          if (
            clientChild &&
            typeof clientChild === 'object' &&
            'type' in clientChild &&
            clientChild.type === Client
          ) {
            clients.push((clientChild as any).props)
          }
        }
      } else if (child.type === Client) {
        clients.push((child as any).props)
      }
    }
  }

  return clients
}
