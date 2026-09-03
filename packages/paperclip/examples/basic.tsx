import { Platform } from '@r8s/recipes'
import { Paperclip } from '@r8s/paperclip'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <Paperclip name="paperclip" host="paperclip.example.com" agents={{ sandboxReplicas: 3 }} />
  </Platform>
)
