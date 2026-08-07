import { Superset } from '@r8s/superset'

export default (
  <Superset
    host="superset.example.com"
    database={{
      host: 'superset-db-rw',
      database: 'superset',
      user: 'superset',
      passwordSecret: 'superset-db-credentials',
      password: 'change-me',
    }}
    redis={{ host: 'redis-master' }}
    admin={{ password: 'change-me' }}
    tls={{ secretName: 'superset-tls', clusterIssuer: 'letsencrypt' }}
  />
)
