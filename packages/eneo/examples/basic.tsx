import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Eneo } from '@r8s/eneo'

// Backups and objectStorage both default to on — the S3Provider derives
// targets and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <Eneo name="eneo" host="eneo.example.com" />
    </Platform>
  </S3Provider>
)
