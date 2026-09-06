import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { N8n } from '@r8s/n8n'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <N8n name="n8n" host="n8n.example.com" queueMode workers={3} />
    </Platform>
  </S3Provider>
)
