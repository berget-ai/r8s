// r8s.berget.ai infrastructure
// One file. Everything included.
//
// This manifest deploys:
// - r8s documentation site (2 replicas, nginx)
// - Endpoint (Envoy Gateway via Platform routing="gateway")
// - cert-manager Certificate for TLS
//
// NOTE: Namespace is provisioned by Flux in the infra repo.
// NOTE: Keep the image tag as :latest here — the deploy workflow bumps
// k8s/package.json (0.1.0-rc.N per main push), tags the image with that
// version, and pins the rendered manifest to it. The changing tag is
// what triggers Flux rollouts on merge.

import { Platform, App } from '@r8s/recipes'

export default (
  <Platform routing="gateway" namespace="r8s-docs">
    <App
      name="r8s-docs"
      image="ghcr.io/berget-ai/r8s-docs:latest"
      host="r8s.berget.ai"
      replicas={2}
      port={3000}
      tls={{ clusterIssuer: 'letsencrypt-prod', secretName: 'r8s-docs-tls' }}
      resources={{
        requests: { cpu: '50m', memory: '64Mi' },
        limits: { cpu: '200m', memory: '256Mi' },
      }}
    />
  </Platform>
)
