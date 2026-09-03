import { Platform } from '@r8s/recipes'
import { Odoo } from '@r8s/odoo'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
    <Odoo name="erp" host="erp.example.com" workers={4} />
  </Platform>
)
