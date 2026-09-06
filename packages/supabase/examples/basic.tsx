import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Supabase } from '@r8s/supabase'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <Supabase
        name="backend"
        host="backend.example.com"
        objectStorage={{
          endpoint: 'https://s3.internal.example.com',
          bucket: 'backend-uploads',
          credentialsSecret: 'backend-object-store-credentials',
        }}
      />
    </Platform>
  </S3Provider>
)
