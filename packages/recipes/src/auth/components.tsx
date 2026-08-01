import { jsx, Fragment, useContext } from '@r8s/core'
import { createContext } from '@r8s/core/defaults'

/**
 * Realm configuration for Keycloak.
 *
 * A realm manages a set of users, credentials, roles, and groups.
 * Realms are isolated from one another and can only manage users
 * that belong to them.
 */
export interface RealmConfig {
  /** Realm name (e.g., 'company', 'customer') */
  id: string
  /** Display name shown in login screens */
  displayName?: string
  /** Whether the realm is enabled */
  enabled?: boolean
  /** Identity providers for federation (e.g., EntraID, Google) */
  identityProviders?: IdentityProviderConfig[]
  /** Clients in this realm */
  clients?: ClientConfig[]
}

export interface IdentityProviderConfig {
  /** Provider alias (e.g., 'entra-id', 'google') */
  alias: string
  /** Display name */
  displayName: string
  /** Provider type (e.g., 'oidc', 'saml') */
  providerId: string
  /** Whether the provider is enabled */
  enabled?: boolean
  /** Trust email from this provider */
  trustEmail?: boolean
  /** Provider-specific configuration */
  config: Record<string, string>
}

/**
 * EntraID (Azure AD) identity provider configuration.
 *
 * @example
 * import { Realm, EntraID } from '@r8s/recipes/auth'
 *
 * <Realm id="company">
 *   <EntraID
 *     tenantId="your-tenant-id"
 *     clientId="your-client-id"
 *     clientSecret="${env:ENTRA_CLIENT_SECRET}"
 *   />
 * </Realm>
 */
export interface EntraIDConfig {
  /** Azure AD tenant ID */
  tenantId: string
  /** Application (client) ID */
  clientId: string
  /** Client secret (from secrets backend) */
  clientSecret: string
  /** Display name (defaults to 'Entra ID') */
  displayName?: string
  /** Whether the provider is enabled (defaults to true) */
  enabled?: boolean
  /** Trust email from this provider (defaults to true) */
  trustEmail?: boolean
}

export interface EntraIDProps extends EntraIDConfig {}

/**
 * EntraID — Microsoft Entra ID (Azure AD) identity provider.
 *
 * Adds EntraID as an identity provider to the parent Realm.
 */
export function EntraID(props: EntraIDProps) {
  return jsx(Fragment, {})
}

export interface GoogleConfig {
  /** Google OAuth client ID */
  clientId: string
  /** Google OAuth client secret */
  clientSecret: string
  /** Display name (defaults to 'Google') */
  displayName?: string
  /** Whether the provider is enabled (defaults to true) */
  enabled?: boolean
  /** Trust email from this provider (defaults to true) */
  trustEmail?: boolean
}

export interface GoogleProps extends GoogleConfig {}

/**
 * Google — Google OAuth identity provider.
 *
 * Adds Google as an identity provider to the parent Realm.
 */
export function Google(props: GoogleProps) {
  return jsx(Fragment, {})
}

export const RealmContext = createContext<RealmConfig[]>([])

export interface RealmProps extends RealmConfig {
  /** Child components (Clients) */
  children?: unknown
}

/**
 * Realm — a security domain in Keycloak.
 *
 * @example
 * import { Realm, Clients, Client } from '@r8s/recipes'
 *
 * <Realm id="company" displayName="Company">
 *   <Clients>
 *     <Client id="api" type="bearer-only" />
 *     <Client id="web" type="public" redirectUris={['https://app.example.com/*']} />
 *   </Clients>
 * </Realm>
 */
export function Realm(props: RealmProps) {
  const { id, displayName, enabled = true, children } = props

  // Collect clients and identity providers from children
  const clients: ClientConfig[] = []
  const identityProviders: IdentityProviderConfig[] = []
  const childArray = Array.isArray(children) ? children : [children]

  for (const child of childArray) {
    if (child && typeof child === 'object' && 'type' in child) {
      // Collect Clients
      if (child.type === Clients) {
        const clientsProps = (child as any).props
        const clientChildren = Array.isArray(clientsProps.children)
          ? clientsProps.children
          : [clientsProps.children]
        for (const clientChild of clientChildren) {
          if (clientChild && typeof clientChild === 'object' && 'type' in clientChild && clientChild.type === Client) {
            clients.push((clientChild as any).props)
          }
        }
      }
      // Collect EntraID
      if (child.type === EntraID) {
        const entraProps = (child as any).props as EntraIDProps
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
      }
      // Collect Google
      if (child.type === Google) {
        const googleProps = (child as any).props as GoogleProps
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

  const realm: RealmConfig = {
    id,
    displayName,
    enabled,
    identityProviders,
  }

  // Store realm with clients in context for Auth to collect
  const existingRealms = useContext(RealmContext)
  const allRealms = [...existingRealms, { ...realm, clients }]

  return jsx(RealmContext.Provider, { value: allRealms, children: null })
}

export interface ClientsProps {
  /** Child components (Client) */
  children?: unknown
}

/**
 * Clients — container for Client components.
 */
export function Clients(props: ClientsProps) {
  return jsx(Fragment, { children: props.children })
}

/**
 * Client configuration for Keycloak.
 *
 * Clients are applications and services that can request authentication
 * of a user. Types:
 * - 'public': SPA, mobile app (no secret, PKCE recommended)
 * - 'confidential': Backend service (requires secret)
 * - 'bearer-only': API service (only validates tokens)
 */
export interface ClientConfig {
  /** Client ID */
  id: string
  /** Client name */
  name?: string
  /** Client type */
  type: 'public' | 'confidential' | 'bearer-only'
  /** Redirect URIs for the client */
  redirectUris?: string[]
  /** Web origins for CORS */
  webOrigins?: string[]
  /** Service account enabled (for confidential clients) */
  serviceAccountsEnabled?: boolean
  /** Direct access grants enabled */
  directAccessGrantsEnabled?: boolean
  /** Client secret (from secrets backend) */
  secret?: string
}

export interface ClientProps extends ClientConfig {}

/**
 * Client — an application that authenticates via Keycloak.
 *
 * @example
 * <Client id="api" type="bearer-only" />
 * <Client id="web" type="public" redirectUris={['https://app.example.com/*']} />
 * <Client id="backend" type="confidential" secret="${env:BACKEND_SECRET}" />
 */
export function Client(props: ClientProps) {
  return jsx(Fragment, {})
}

export interface RealmsProps {
  /** Child components (Realm) */
  children?: unknown
}

/**
 * Realms — container for Realm components.
 */
export function Realms(props: RealmsProps) {
  return jsx(Fragment, { children: props.children })
}
