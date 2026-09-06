import { Platform, Namespace, S3Provider, MinIO } from '@r8s/recipes'
import { Forgejo } from '@r8s/forgejo'

// Backups + LFS derive from the S3Provider; runners ship by default
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'forgejo' }}>
      <Namespace name="git">
        <Forgejo host="git.example.com" />
      </Namespace>
    </Platform>
  </S3Provider>
)
