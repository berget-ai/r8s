import { Platform, S3Provider, MinIO } from '@r8s/recipes'
import { EuroOffice } from '@r8s/eurooffice'

// Backups default to on — the S3Provider derives target and credentials
export default (
  <S3Provider
    provider={
      <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
    }
  >
    <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'onlyoffice' }}>
      <EuroOffice host="eurooffice.example.com" exampleEnabled />
    </Platform>
  </S3Provider>
)
