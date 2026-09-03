import { Platform } from '@r8s/recipes'
import { Outline } from '@r8s/outline'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <Outline
      name="wiki"
      host="wiki.example.com"
      objectStorage={{
        endpoint: 'https://s3.internal.example.com',
        bucket: 'wiki-attachments',
        credentialsSecret: 'wiki-attachments-credentials',
      }}
      sso={{
        issuer: 'https://keycloak.example.com/realms/platform',
        clientId: 'outline',
        clientSecretRef: { secret: 'outline-sso', key: 'clientSecret' },
      }}
    />
  </Platform>
)
