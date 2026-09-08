import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Outline } from '@r8s/outline'

// Backups and objectStorage both default to on — the S3Provider derives
// targets and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <Outline
        name="wiki"
        host="wiki.example.com"
        sso={{
          issuer: 'https://keycloak.example.com/realms/platform',
          clientId: 'outline',
          clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },
        }}
      />
    </Platform>
  </S3Provider>
)
