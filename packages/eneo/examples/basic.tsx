import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { Eneo } from '@r8s/eneo'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
      <Eneo
        name="eneo"
        host="eneo.example.com"
        objectStorage={{
          endpoint: 'https://s3.internal.example.com',
          bucket: 'eneo-corpora',
          credentialsSecret: 'eneo-object-storage',
        }}
      />
    </Platform>
  </S3Provider>
)
