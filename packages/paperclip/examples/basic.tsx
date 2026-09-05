import { Platform } from '@r8s/recipes'
import { Paperclip } from '@r8s/paperclip'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'paperclip' }}>
    <Paperclip
      host="paperclip.example.com"
      backup={{
        destinationPath: 's3://backups/paperclip-cnpg',
        endpointURL: 'https://s3.nl-ams.scw.cloud',
        credentialsSecret: 'scaleway-s3-secret',
      }}
    />
  </Platform>
)
