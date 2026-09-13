import { Platform, S3Provider, MinIO, Auth } from '@r8s/recipes'
import { Realms, Realm, Clients, Client } from '@r8s/recipes/auth'
import { Netbird } from '@r8s/netbird'

// Compose with the Auth recipe — realm-level group sync for policies.
// groupsClaim puts Keycloak group memberships in the JWT `groups` claim —
// Netbird auto-creates groups from it (map Netbird policies to those
// groups). Netbird's group/user reads authenticate via client_credentials —
// grant the netbird client's service account realm-management
// view-users/view-groups; `netbird-manager` is the upstream pattern for
// splitting those reads onto separate credentials. localhost:53000 is the
// netbird CLI/desktop PKCE redirect; the auth host gets TLS so the https
// issuer is reachable. CNPG backups derive from the S3Provider; the IdP
// client secret + relay/datastore credentials provision from the openbao
// store.
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'apps' }}>
      <Auth
        name="auth"
        host="auth.example.com"
        tls={{ secretName: 'auth-tls', clusterIssuer: 'letsencrypt-prod' }}
      >
        <Realms>
          <Realm id="netbird" displayName="Netbird">
            <Clients>
              <Client
                id="netbird"
                type="confidential"
                redirectUris={['https://netbird.example.com/*', 'http://localhost:53000']}
                groupsClaim
              />
              <Client id="netbird-manager" type="confidential" />
            </Clients>
          </Realm>
        </Realms>
      </Auth>
      <Netbird
        host="netbird.example.com"
        idp={{
          issuer: 'https://auth.example.com/realms/netbird',
          clientId: 'netbird',
          clientSecretRef: 'netbird-oidc',
        }}
      />
    </Platform>
  </S3Provider>
)
