import { Platform } from '@r8s/recipes'
import { Eneo } from '@r8s/eneo'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <Eneo
      name="eneo"
      host="eneo.example.com"
      objectStorage={{
        endpoint: 'https://s3.internal.example.com',
        bucket: 'eneo-corpora',
        credentialsSecret: 'eneo-object-storage',
      }}
    />
  </Platform>
)
