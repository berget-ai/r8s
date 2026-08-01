import { RustFS } from '@r8s/rustfs'

export default (
  <RustFS
    name="storage"
    namespace="rustfs"
    instances={4}
    storage="500Gi"
    host="s3.example.com"
    tls={{ secretName: 's3-tls', clusterIssuer: 'letsencrypt' }}
  />
)
