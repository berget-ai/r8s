import { Platform } from '@r8s/recipes'
import { Supabase } from '@r8s/supabase'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <Supabase
      name="backend"
      host="backend.example.com"
      objectStorage={{
        endpoint: 'https://s3.internal.example.com',
        bucket: 'backend-uploads',
        credentialsSecret: 'backend-object-store-credentials',
      }}
    />
  </Platform>
)
