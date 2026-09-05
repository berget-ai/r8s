import { Platform } from '@r8s/recipes'
import { Umami } from '@r8s/umami'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'umami' }}>
    <Umami
      host="umami.example.com"
      sso={{
        discoveryUrl: 'https://keycloak.example.com/realms/master/.well-known/openid-configuration',
        clientId: 'umami',
      }}
      backup={{
        destinationPath: 's3://backups/umami-cnpg',
        endpointURL: 'https://s3.nl-ams.scw.cloud',
        credentialsSecret: 'scaleway-s3-secret',
      }}
    />
  </Platform>
)
