import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { OpenWebui } from '@r8s/open-webui'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <OpenWebui name="chat" host="chat.example.com" version="v0.6.5" storage="10Gi" />
    </Platform>
  </S3Provider>
)
