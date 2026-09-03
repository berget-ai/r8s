import { Grafana } from '@r8s/grafana'

export default (
  <Grafana
    name="grafana"
    namespace="monitoring"
    host="grafana.example.com"
    admin={{ existingSecret: 'grafana-admin-credentials' }}
    datasources={[{ name: 'Prometheus', type: 'prometheus', url: 'http://prometheus:9090' }]}
  />
)
