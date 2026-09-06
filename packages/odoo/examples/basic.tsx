import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Odoo } from '@r8s/odoo'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <Odoo name="erp" host="erp.example.com" workers={4} />
    </Platform>
  </S3Provider>
)
