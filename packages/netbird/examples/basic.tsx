import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Netbird } from '@r8s/netbird'

// CNPG backups derive from the S3Provider; the IdP client secret +
// relay/datastore credentials provision from the openbao store
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'apps' }}>
      <Netbird
        host="netbird.example.com"
        idp={{
          issuer: 'https://auth.example.com/realms/netbird',
          clientId: 'netbird',
        }}
      />
    </Platform>
  </S3Provider>
)
