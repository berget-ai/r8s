// r8s.berget.ai infrastructure
// One file. Everything included.
//
// This manifest deploys:
// - r8s documentation site (2 replicas, nginx)
// - Endpoint (Envoy Gateway via Platform routing="gateway")
// - cert-manager Certificate for TLS
//
// NOTE: Namespace is provisioned by Flux in the infra repo.
// NOTE: The image tag comes from the IMAGE_TAG env var at render time.
// Locally it falls back to :latest; in the deploy workflow it is the
// short commit SHA the image was tagged with — the changing tag is
// what triggers Flux rollouts on merge.

import { Platform, App } from '@r8s/recipes'

const imageTag = process.env.IMAGE_TAG?.slice(0, 7) ?? 'latest'

export default (
  <Platform routing="gateway" namespace="r8s-docs">
    <App
      name="r8s-docs"
      image={`ghcr.io/berget-ai/r8s-docs:${imageTag}`}
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
