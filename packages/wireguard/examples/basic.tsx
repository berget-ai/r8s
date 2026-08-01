import { WireGuard } from '@r8s/wireguard'

export default (
  <WireGuard
    host="vpn.example.com"
    passwordSecret="wg-password"
    nodePort={31820}
    tls={{ secretName: 'wg-tls', clusterIssuer: 'letsencrypt' }}
  />
)
