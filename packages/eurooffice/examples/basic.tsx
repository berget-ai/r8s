import { Platform } from '@r8s/recipes'
import { EuroOffice } from '@r8s/eurooffice'

export default (
  <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'onlyoffice' }}>
    <EuroOffice host="eurooffice.example.com" exampleEnabled />
  </Platform>
)
