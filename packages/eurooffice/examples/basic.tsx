import { Platform } from '@r8s/recipes'
import { EuroOffice } from '@r8s/eurooffice'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <EuroOffice
      name="docs"
      host="docs.example.com"
      objectStorage={{
        endpoint: 'https://s3.internal.example.com',
        bucket: 'docs-blobs',
        credentialsSecret: 'docs-blobs-credentials',
      }}
      smtp={{ host: 'smtp.example.com', port: 587, from: 'no-reply@${env:MAIL_DOMAIN}' }}
    />
  </Platform>
)
