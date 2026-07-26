// r8s.berget.ai infrastructure
// One file. Everything included.
//
// This manifest deploys:
// - r8s documentation site (2 replicas, nginx)
// - Endpoint (Envoy Gateway via RoutingContext)
// - cert-manager Certificate for TLS
//
// NOTE: Namespace is provisioned by Flux in the infra repo.
// NOTE: Image tag :latest is replaced by CI with commit SHA.

import { App } from '@r8s/recipes';
import { RoutingContext } from '@r8s/core/defaults';

export default (
  <RoutingContext.Provider value={{ mode: 'gateway', gatewayClassName: 'eg' }}>
    <App
      name="r8s-docs"
      namespace="r8s-docs"
      image="ghcr.io/irony/r8s-docs:latest"
      host="r8s.berget.ai"
      replicas={2}
      port={3000}
      tls={{ clusterIssuer: "letsencrypt-prod", secretName: "r8s-docs-tls" }}
      resources={{
        requests: { cpu: "50m", memory: "64Mi" },
        limits: { cpu: "200m", memory: "256Mi" },
      }}
    />
  </RoutingContext.Provider>
);
