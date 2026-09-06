import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Nextcloud } from '@r8s/nextcloud'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <Nextcloud
        name="cloud"
        host="cloud.example.com"
        objectStorage={{
          endpoint: 's3.internal.example.com',
          bucket: 'cloud-files',
          credentialsSecret: 'cloud-files-credentials',
        }}
      />
    </Platform>
  </S3Provider>
)
