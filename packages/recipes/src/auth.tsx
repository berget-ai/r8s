import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { useNamespace, OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database } from './database'
import { Endpoint } from './endpoint'
import type { TLSConfig } from '@r8s/k8s-types'
import {
  Realm,
  Realms,
  Clients,
  Client,
  EntraID,
  Google,
  type RealmConfig,
  type ClientConfig,
  type IdentityProviderConfig,
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
    namespace: namespaceProp,
    instances = 1,
    storage = '10Gi',
    tls,
    children,
  } = props

  // Inherit namespace from <Platform> context if not explicitly set
  const namespace = useNamespace(namespaceProp)

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
      backup: false,
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

/** Normalize JSX children into an array. */
function childrenOf(children: unknown): any[] {
  if (!children) return []
  return Array.isArray(children) ? children : [children]
}

/** JSX element check — matches the component function reference. */
function isElement(child: unknown, type: unknown): child is { props: any } {
  return !!child && typeof child === 'object' && (child as any).type === type
}

function realmConfigFrom(child: { props: any }): RealmConfig {
  const realmProps = child.props
  // Merge identity providers from both prop and child components
  const identityProviders = [
    ...(realmProps.identityProviders ?? []),
    ...collectIdentityProviders(realmProps.children),
  ]
  const clients = collectClients(realmProps.children)
  return {
    id: realmProps.id,
    displayName: realmProps.displayName,
    enabled: realmProps.enabled,
    identityProviders,
    clients,
  }
}

/** Collect Realm configurations from children */
function collectRealms(children: unknown): RealmConfig[] {
  return childrenOf(children).flatMap((child) => {
    if (isElement(child, Realms)) {
      return childrenOf(child.props.children)
        .filter((realmChild) => isElement(realmChild, Realm))
        .map(realmConfigFrom)
    }
    if (isElement(child, Realm)) return [realmConfigFrom(child)]
    return []
  })
}

/** Collect Client configurations from children */
function collectClients(children: unknown): ClientConfig[] {
  return childrenOf(children).flatMap((child) => {
    if (isElement(child, Clients)) {
      return childrenOf(child.props.children)
        .filter((clientChild) => isElement(clientChild, Client))
        .map((clientChild) => clientChild.props)
    }
    if (isElement(child, Client)) return [(child as any).props]
    return []
  })
}

/** Collect IdentityProvider configurations from children */
function collectIdentityProviders(children: unknown): IdentityProviderConfig[] {
  const identityProviders: IdentityProviderConfig[] = []

  for (const child of childrenOf(children)) {
    if (typeof child === 'object' && child !== null) {
      if (isElement(child, EntraID)) {
        const entraProps = (child as any).props
        identityProviders.push({
          alias: 'entra-id',
          displayName: entraProps.displayName ?? 'Entra ID',
          providerId: 'oidc',
          enabled: entraProps.enabled ?? true,
          trustEmail: entraProps.trustEmail ?? true,
          config: {
            clientId: entraProps.clientId,
            clientSecret: entraProps.clientSecret,
            tokenUrl: `https://login.microsoftonline.com/${entraProps.tenantId}/oauth2/v2.0/token`,
            authorizationUrl: `https://login.microsoftonline.com/${entraProps.tenantId}/oauth2/v2.0/authorize`,
          },
        })
      } else if (child.type === Google) {
        const googleProps = (child as any).props
        identityProviders.push({
          alias: 'google',
          displayName: googleProps.displayName ?? 'Google',
          providerId: 'oidc',
          enabled: googleProps.enabled ?? true,
          trustEmail: googleProps.trustEmail ?? true,
          config: {
            clientId: googleProps.clientId,
            clientSecret: googleProps.clientSecret,
          },
        })
      }
    }
  }

  return identityProviders
}
