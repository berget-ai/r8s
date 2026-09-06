import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Outline } from '@r8s/outline'

// Backups default to on — the S3Provider derives target and credentials
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
        objectStorage={{
          endpoint: 'https://s3.internal.example.com',
          bucket: 'wiki-attachments',
          credentialsSecret: 'wiki-attachments-credentials',
        }}
        sso={{
          issuer: 'https://keycloak.example.com/realms/platform',
          clientId: 'outline',
          clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },
        }}
      />
    </Platform>
  </S3Provider>
)
