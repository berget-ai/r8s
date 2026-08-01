import { Grafana } from '@r8s/grafana'

export default (
  <Grafana
    name="grafana"
    namespace="monitoring"
    host="grafana.example.com"
    datasources={[{ name: 'Prometheus', type: 'prometheus', url: 'http://prometheus:9090' }]}
  />
)
