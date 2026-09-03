import { Platform } from '@r8s/recipes'
import { N8n } from '@r8s/n8n'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <N8n name="n8n" host="n8n.example.com" queueMode workers={3} />
  </Platform>
)
