import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { Database } from './database'
import { Endpoint } from './endpoint'
import type { TLSConfig } from '@r8s/k8s-types'

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
 * import { Auth } from '@r8s/recipes'
 *
 * export default <Auth name="auth" host="auth.example.com" />
 *
 * @example
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
 * import { Platform, Auth } from '@r8s/recipes'
 * import { KeycloakRealmImportComponent } from '@r8s/crds/keycloak'
 *
 * // Auth with EntraID federation — secrets from OpenBao, nothing in git.
 * export default (
 *   <Platform
 *     name="auth"
 *     namespace="auth"
 *     secrets={{ backend: 'openbao', mount: 'secret', path: 'auth' }}
 *     operators={['cnpg', 'keycloak-operator']}
 *   >
 *     <Auth name="keycloak" host="auth.example.com" />
 *     <KeycloakRealmImportComponent
 *       metadata={{ name: 'company-realm' }}
 *       spec={{
 *         keycloakCRName: 'keycloak',
 *         realm: {
 *           realm: 'company',
 *           enabled: true,
 *           identityProviders: [
 *             {
 *               alias: 'entra-id',
 *               displayName: 'Entra ID',
 *               providerId: 'oidc',
 *               enabled: true,
 *               trustEmail: true,
 *               config: {
 *                 clientId: '${env:ENTRA_CLIENT_ID}',
 *                 clientSecret: '${env:ENTRA_CLIENT_SECRET}',
 *                 tokenUrl: 'https://login.microsoftonline.com/${env:ENTRA_TENANT_ID}/oauth2/v2.0/token',
 *                 authorizationUrl: 'https://login.microsoftonline.com/${env:ENTRA_TENANT_ID}/oauth2/v2.0/authorize',
 *               },
 *             },
 *           ],
 *           clients: [
 *             {
 *               clientId: 'app-alpha',
 *               name: 'App Alpha (SPA)',
 *               publicClient: true,
 *               standardFlowEnabled: true,
 *               redirectUris: ['https://alpha.example.com/*'],
 *             },
 *             {
 *               clientId: 'app-beta',
 *               name: 'App Beta (Backend)',
 *               publicClient: false,
 *               serviceAccountsEnabled: true,
 *               secret: '${env:APP_BETA_CLIENT_SECRET}',
 *             },
 *           ],
 *         },
 *       }}
 *     />
 *   </Platform>
 * )
 */
export function Auth(props: AuthProps) {
  const { name, host, namespace = 'default', instances = 1, storage = '10Gi', tls } = props

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

  return jsx(Fragment, { children: resources })
}
