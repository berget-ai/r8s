# r8s

**Kubernetes manifests as TypeScript components. Write TSX, get production-grade YAML.**

[![CI](https://github.com/berget-ai/r8s/actions/workflows/ci.yaml/badge.svg)](https://github.com/berget-ai/r8s/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-r8s.berget.ai-green.svg)](https://r8s.berget.ai)
[![GitHub release](https://img.shields.io/github/v/release/berget-ai/r8s)](https://github.com/berget-ai/r8s/releases)

Stop writing YAML. Start composing infrastructure.

```tsx
// k8s/r8s.tsx
import { App } from '@r8s/recipes'

export default () => (
  <App name="api" image="myapp/api:v1.2.3" host="api.example.com" />
)
```

```bash
$ npx r8s render
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
---
apiVersion: v1
kind: Service
metadata:
  name: api
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-endpoint
# 3 resources from 1 component
```

r8s is a **compiler**: TSX source in, Kubernetes YAML out. No runtime, no cluster state, no reconciliation loop — the output is plain YAML you commit and sync with Flux/ArgoCD (or `kubectl apply`). Same artifacts Helm or Kustomize would give you, minus the templating language. Typed props mean misspelled `containerPort` is caught by TypeScript before `kubectl` — which also makes r8s an unusually safe target for **AI-generated infrastructure**: hallucinated config fails to compile. Components are ordinary functions, so ten microservices share one `<Database />` import instead of ten copies of hand-tuned YAML.

## The 30-second tour

```bash
npx r8s init my-infra        # scaffold a project (TS + GitHub Actions workflow)
npx r8s render --out k8s/manifest.yaml

npx r8s explain App          # what resources + operators does a component create?
npx r8s validate k8s/r8s.tsx # type-check + reference-check rendered output
npx r8s list                 # the full component catalog
npx r8s context              # compact context blob, made for LLM prompts
```

## A complete platform in one file

Providers nest around your apps and decide how everything below them is wired — certificates, secrets, DNS, routing — and each child automatically consumes the whole stack:

```tsx
import { CertProvider, SecretProvider, OpenBao, DnsProvider, EndpointProvider, EnvoyGateway, App } from '@r8s/recipes'
import { Supabase } from '@r8s/supabase'

export default (
  <CertProvider provider="cert-manager">
    <SecretProvider provider={<OpenBao mount="secret" path="infra" />}>
      <DnsProvider provider="external-dns">
        <EndpointProvider provider={<EnvoyGateway tls={{ clusterIssuer: 'letsencrypt' }} />}>
          <>
            <App name="web" image="myorg/web:v2" host="app.example.com" />
            <Supabase
              name="supabase"
              host="db.example.com"
              objectStorage={{
                endpoint: 'https://s3.example.com',
                bucket: 'supabase-files',
                credentialsSecret: 'supabase-s3-creds',
              }}
            />
          </>
        </EndpointProvider>
      </DnsProvider>
    </SecretProvider>
  </CertProvider>
)
```

One `render` → all Deployments, Services, Gateway listeners + HTTPRoutes, cert-manager wiring, DNSEndpoint records, and OpenBao-provisioned Secrets — plus the pinned install manifests for every operator involved, emitted by `r8s operators`. Swap `EnvoyGateway` for `Nginx` on the EndpointProvider line and every endpoint reroutes; nothing below changes.

## Ship-the-stack recipes

Complete real-world applications as packages — **pinned versions, derived from our own production manifests and regression-tested against that reference output**:

| Package | Stack | Package | Stack |
|---|---|---|---|
| `@r8s/n8n` | Workflow automation | `@r8s/librechat` | Multi-provider chat UI |
| `@r8s/outline` | Knowledge base | `@r8s/eneo` | AI platform |
| `@r8s/paperclip` | Agent orchestration | `@r8s/supabase` | Postgres backend-as-a-service |
| `@r8s/eurooffice` | Browser office suite | `@r8s/nextcloud` | File sync & groupware |
| `@r8s/matrix` | Full Matrix stack + SFU | `@r8s/odoo` | Odoo ERP |
| `@r8s/harbor` | OCI registry | `@r8s/chromadb` | Vector DB |
| `@r8s/umami` | Analytics | `@r8s/grafana` · `@r8s/superset` | Dashboards |
| `@r8s/open-webui` | Model frontend | `@r8s/rustfs` · `@r8s/wireguard` · `@r8s/element` | S3 store · VPN · Matrix web client |

Core primitives (`@r8s/recipes`): `<Platform>`, `<App>`, `<Database>` (CNPG PostgreSQL), `<Endpoint>`, `<WebService>`, `<Auth>` (Keycloak), `<Monitoring>`, `<Backup>` (Velero), `<StaticSecret>`, and the providers shown in the example above.

## Design decisions that hold up under pressure

**Secrets via capability hooks — not identity switches.** One lookup at the top of recipes; everything below speaks `provision(req)`:

```tsx
import { jsx } from '@r8s/core'

const myProvider = {
  provision(req: StaticSecretRequest) {
    // Any element with apiVersion + kind renders as a raw resource —
    // here an External Secrets Operator target.
    return jsx('ExternalSecret', {
      apiVersion: 'external-secrets.io/v1beta1',
      kind: 'ExternalSecret',
      metadata: { name: req.name, namespace: req.namespace },
      spec: {
        refreshInterval: '1h',
        secretStoreRef: { name: 'cluster-store', kind: 'ClusterSecretStore' },
        data: Object.entries(req.keys).map(([dest, source]) => ({
          secretKey: dest,
          remoteRef: { key: `${req.path}/${source}`, property: source },
        })),
      },
    })
  },
}
// Every recipe in every package consumes your provider without knowing what it is.
```

Same seam for routing: `RoutingConfig.route` lets you emit IngressRoute/HTTPRoute/whatever while `<Endpoint>` keeps the contract.

**Plaintext credentials don't compile.** Every render scans Secrets, ConfigMaps, env vars, and nested CRD fields for credential values — and understands *values vs references* (`secretKeyRef`, `$(VAR)`, `existingSecret*`, `_FROM_FILE` are fine). Hard fail in CI with a suggested fix. Also bundled: network policies, resource limits, required labels, TLS on Ingress, no-root-containers.

**Operators are explicit dependencies.** Declaring components, deduplicated at render, versions pinned in [operators.yaml](packages/crds/operators.yaml), install manifests via `r8s operators`. Also: `useOperators()` + `maybeOperator('cnpg', shared)` for "declare only if the Platform doesn't already run it."

## Testable infrastructure

```tsx
import { render } from '@r8s/core'
import { App } from '@r8s/recipes'

it('creates a 3-replica deployment', () => {
  const result = render(<App name="api" image="myapp/api:v1" host="api.example.com" replicas={3} />)
  expect(result.resources.find((r) => r.kind === 'Deployment').spec.replicas).toBe(3)
})
```

The repo runs ~900 such tests across 46 suites — including a provider-matrix suite rendering every package under every secrets-backend × routing-mode combination.

## GitOps

Two strategies, scaffolded by `r8s init`:

- `github-actions` (default): CI renders TSX → committed YAML → Flux/ArgoCD syncs. Reviewable diffs.
- `flux-controller`: push TSX; render in-cluster via the source controller. No CI build step.

## Comparison

| | Raw YAML | Helm | Kustomize | Pulumi | **r8s** |
|:---|:---|:---|:---|:---|:---|
| **Composition** | ❌ copy-paste | ⚠️ templates | ❌ patches | ✅ code | ✅ **typed components** |
| **Type safety** | ❌ | ❌ | ❌ | ✅ | ✅ **full TS** |
| **Operator tracking** | ❌ | ⚠️ subcharts | ❌ | ✅ | ✅ **explicit + renderable** |
| **Credential linting** | ❌ | ❌ | ❌ | ⚠️ | ✅ **built-in guardrails** |
| **Learning curve** | low | medium | low | high | **low** |
| **Output** | YAML | YAML | YAML | API | **YAML (GitOps-native)** |

## Status

**v0.3.0** — core, CLI and the recipes are stable and in daily production use at Berget AI. The 0.3.0 line switched operators to npm-resolved packages (one `@r8s/operator-*` per operator, version-mirrored, peer-contract deduplicated) and made backups a required decision on `<Database>`/`<Matrix>`. Migrations: [CHANGELOG.md](CHANGELOG.md).

## Contributing

Missing a component? It's a typed function + (optionally) a line in `operators.yaml`. Copy `@r8s/wireguard` as a skeleton, add tests, open a PR — AI review + CI within minutes, human review within 24h. Details: [CONTRIBUTING.md](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

## License

[MIT](LICENSE) — © Berget AI AB
