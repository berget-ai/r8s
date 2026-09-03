import { Platform } from '@r8s/recipes'
import { OpenWebui } from '@r8s/open-webui'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <OpenWebui name="chat" host="chat.example.com" version="v0.6.5" storage="10Gi" />
  </Platform>
)
