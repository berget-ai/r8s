import { Element } from '@r8s/element'

export default (
  <Element
    host="chat.example.com"
    homeserverUrl="https://matrix.example.com"
    tls={{ secretName: 'element-tls', clusterIssuer: 'letsencrypt' }}
  />
)
