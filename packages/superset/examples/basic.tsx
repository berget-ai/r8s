import { Superset } from '@r8s/superset'

/**
 * Database credentials come from `passwordSecret` — provisioned by the
 * secrets backend running in the cluster. The admin dashboard key comes
 * from `existingSecret` (a SealedSecret or operator-managed secret).
 * No plaintext credential appears in this file or in the rendered YAML.
 */
export default (
  <Superset
    host="superset.example.com"
    database={{
      host: 'superset-db-rw',
      database: 'superset',
      user: 'superset',
      passwordSecret: 'superset-db-credentials',
      passwordKey: 'password',
    }}
    redis={{ host: 'redis-master' }}
    admin={{ existingSecret: 'superset-admin-credentials' }}
    tls={{ secretName: 'superset-tls', clusterIssuer: 'letsencrypt' }}
  />
)
