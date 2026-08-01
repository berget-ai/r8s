import { Superset } from '@r8s/superset'

export default (
  <Superset
    host="superset.example.com"
    database={{
      host: 'superset-db-rw',
      database: 'superset',
      user: 'superset',
      passwordSecret: 'superset-db-credentials',
    }}
    redis={{ host: 'redis-master' }}
    adminSecret="superset-admin"
    tls={{ secretName: 'superset-tls', clusterIssuer: 'letsencrypt' }}
  />
)
