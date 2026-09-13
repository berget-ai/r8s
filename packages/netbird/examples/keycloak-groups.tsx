import { Platform, S3Provider, MinIO, Auth } from '@r8s/recipes'
import { Realms, Realm, Clients, Client } from '@r8s/recipes/auth'
import { Netbird } from '@r8s/netbird'

// Compose with the Auth recipe — realm-level group sync for policies.
// groupsClaim puts Keycloak group memberships in the JWT `groups` claim —
// Netbird auto-creates groups from it (map Netbird policies to those
// groups). The manager client (client_credentials) is what netbird
// management uses to read groups/users from the Keycloak API. CNPG
// backups derive from the S3Provider; the IdP client secret +
// relay/datastore credentials provision from the openbao store.
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'apps' }}>
      <Auth name="auth" host="auth.example.com">
        <Realms>
          <Realm id="netbird" displayName="Netbird">
            <Clients>
              <Client
                id="netbird"
                type="confidential"
                redirectUris={['https://netbird.example.com/*']}
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
