import { Platform } from '@r8s/recipes'
import { Harbor } from '@r8s/harbor'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'rustfs' }}>
    <Harbor
      host="registry.example.com"
      s3={{
        bucket: 'harbor-registry',
        region: 'berget-cloud',
        endpoint: 'https://s3.berget.cloud',
      }}
      backup={{
        destinationPath: 's3://backups/harbor-cnpg',
        endpointURL: 'https://s3.berget.cloud',
      }}
    />
  </Platform>
)
