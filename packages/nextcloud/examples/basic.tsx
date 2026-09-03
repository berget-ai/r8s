import { Platform } from '@r8s/recipes'
import { Nextcloud } from '@r8s/nextcloud'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <Nextcloud
      name="cloud"
      host="cloud.example.com"
      objectStorage={{
        endpoint: 's3.internal.example.com',
        bucket: 'cloud-files',
        credentialsSecret: 'cloud-files-credentials',
      }}
    />
  </Platform>
)
