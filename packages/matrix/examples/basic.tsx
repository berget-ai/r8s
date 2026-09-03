import { Platform } from '@r8s/recipes'
import { Matrix } from '@r8s/matrix'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'matrix' }}>
    <Matrix
      domain="example.com"
      sso={{ issuer: 'https://keycloak.example.com/realms/berget', clientId: 'matrix' }}
      database={{
        backup: {
          destinationPath: 's3://backups/matrix-cnpg',
          endpointURL: 'https://s3.example.com',
        },
      }}
      rtc={{ manualIP: '203.0.113.10' }}
      appservices={[
        {
          name: 'hookshot',
          registration: {
            id: 'hookshot',
            as_token: 'PROVIDED_VIA_GITOPS',
            hs_token: 'PROVIDED_VIA_GITOPS',
            namespaces: { users: [{ regex: '@hookshot:example.com', exclusive: true }] },
            url: 'http://hookshot:9000',
          },
        },
      ]}
    />
  </Platform>
)
