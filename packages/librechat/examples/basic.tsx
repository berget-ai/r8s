import { Platform } from '@r8s/recipes'
import { LibreChat } from '@r8s/librechat'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <LibreChat
      name="chat"
      host="chat.example.com"
      mongodb={{ host: 'mongo.data.svc.cluster.local', passwordSecret: 'chat-mongodb-credentials' }}
      sso={{
        issuer: 'https://keycloak.example.com/realms/platform',
        clientId: 'librechat',
        clientSecretRef: { secret: 'librechat-sso', key: 'clientSecret' },
      }}
    />
  </Platform>
)
