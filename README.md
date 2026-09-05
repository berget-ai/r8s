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
# ... 3 resources rendered from 1 component
```

> **Batteries included, escape hatches included.** `<App>` above creates a Deployment, Service, and Endpoint — all wired together with sane defaults. Prefer raw Kubernetes? Every API resource is available as a lowercase component: `<deployment>`, `<service>`, `<ingress>`, `<configmap>`, `<secret>`, `<statefulset>`, `<daemonset>`, `<job>`, `<cronjob>`, `<hpa>`, `<pdb>`, `<rbac>` — compose them exactly as you need.

## What is this?

r8s is a **compiler**: TSX source in, Kubernetes YAML out. There is no runtime, no cluster state, no reconciliation loop inside r8s itself — the output is plain YAML you commit and sync with Flux/ArgoCD (or `kubectl apply`), exactly the same artifacts you'd get from Helm or Kustomize, minus the templating language.

Three properties that come with that:

- **Type-safe composition.** Misspelled `containerPort`? TypeScript catches it before `kubectl`. Wrong prop on `<Database>`? Red squiggly in your editor. Components are ordinary typed functions, so ten microservices share one `<Database storage="20Gi" />` import instead of ten copies of hand-tuned YAML.
- **Real code instead of templates.** Conditions, loops, derived values, feature flags: `replicas={env === 'production' ? 3 : 1}`. No Go templates, no `values.yaml` archeology.
- **LLM-friendly by construction.** Typed props and compile-time errors make r8s an unusually safe target for AI code generation: the editor and `r8s validate` reject hallucinated configuration before it ever reaches a cluster. `r8s context` prints a compact, paste-ready context blob for your agent of choice.

## The 30-second tour

```bash
npx r8s init my-infra        # scaffold a project (TS + GitHub Actions workflow)
cd my-infra

# edit k8s/r8s.tsx, then:
npx r8s render --out k8s/manifest.yaml

npx r8s explain App          # what does a component create? resources + operators
npx r8s validate k8s/r8s.tsx # type-check + reference-check (routes→services, volumes→secrets)
npx r8s list                 # every component and operator in the catalog
```

## Ship-the-stack recipes

Beyond the core primitives, r8s ships packages for complete real-world applications — workflows, chat, analytics, registries:

| Package | Component | What you get |
|---|---|---|
| `@r8s/n8n` | `<N8n>` | n8n workflow automation + shared Postgres + Redis queue |
| `@r8s/outline` | `<Outline>` | Outline knowledge base + OIDC auth + object storage |
| `@r8s/paperclip` | `<Paperclip>` | Paperclip agent orchestration (operator-managed Instance CR) |
| `@r8s/eurooffice` | `<EuroOffice>` | Euro-Office DocumentServer with JWT, data volume, graceful shutdown |
| `@r8s/matrix` | `<Matrix>` | Synapse + MAS + Element Web + LiveKit SFU, 5 hosts wired |
| `@r8s/harbor` | `<Harbor>` | Harbor OCI registry via pinned Flux HelmRelease |
| `@r8s/umami` | `<Umami>` | Umami analytics (image pinning enforced per variant) |
| `@r8s/open-webui` | `<OpenWebui>` | Open WebUI for local model frontends |
| `@r8s/librechat` | `<LibreChat>` | LibreChat |
| `@r8s/eneo` | `<Eneo>` | Eneo AI platform |
| `@r8s/supabase` | `<Supabase>` | Supabase |
| `@r8s/nextcloud` | `<Nextcloud>` | Nextcloud |
| `@r8s/odoo` | `<Odoo>` | Odoo ERP |
| `@r8s/chromadb` | `<ChromaDb>` | Chroma vector DB |
| `@r8s/grafana` | `<Grafana>` | Grafana dashboards |
| `@r8s/superset` | `<Superset>` | Apache Superset |
| `@r8s/rustfs` | `<RustFS>` | S3-compatible object storage |
| `@r8s/element` | `<Element>` | Element web client |
| `@r8s/wireguard` | `<WireGuard>` | WireGuard VPN (wg-easy) |

Package versions are **pinned**. These recipes are reverse-engineered from our own production cluster manifests ("facit") and regression-tested against the reference output — the YAML they produce is the YAML we run. Where an up-to-date upstream chart is the better mechanism (e.g. Harbor), the package emits a pinned Flux `HelmRelease` instead of a hand-rolled reimplementation.

Core primitives live in `@r8s/recipes`:

- `<Platform>` — cluster-level config: namespace, routing mode (Ingress/Gateway), secrets backend, shared operators
- `<App>` — web app: Deployment + Service + Endpoint
- `<Database>` — CNPG PostgreSQL (HA, backups, optional shared cluster)
- `<Endpoint>` — cluster-adaptive routing (nginx Ingress or Gateway API)
- `<WebService>` — Deployment + Service with env/secret wiring
- `<Auth>` — Keycloak realms, clients, and identity providers as JSX children
- `<Monitoring>`, `<Backup>` — PodMonitor/ServiceMonitor + Velero-style schedules
- `<StaticSecret>` — project a path in your secrets backend into a Kubernetes Secret

Providers fine-tune the platform: `<OpenBao>` / `<Vault>` / `<SealedSecrets>` / `<ManualSecrets>` for secrets, `<Nginx>` / `<EnvoyGateway>` for routing, `<CertManager>` for certificates, `<ExternalDns>` for DNS.

## Secrets: capability hooks, not identity switches

The pattern that quietly kills most k8s abstractions is "if backend === X … else if backend === Y …" scattered through every component. r8s has exactly **one** identity-aware seam, and it's a lookup table at the top of `@r8s/recipes`. Everything else speaks capability hooks:

```tsx
const myProvider = {
  name: 'external-secrets-operator',
  provision(req: StaticSecretRequest) {
    return <ExternalSecret spec={{ /* …whatever your ESO target looks like… */ }} />
  },
}

<StaticSecret name="api-keys" path="kv/api" keys={{ ANTHROPIC_API_KEY: 'anthropic' }} />
//           renders YOUR resource — nothing in r8s needed a new identity byte
```

Any `<Platform>` can carry a custom provider via context; any of the 19 app recipes consumes it without knowing what it is. The same mechanism routes traffic: `RoutingConfig.route` lets you emit an `IngressRoute`, a `HTTPRoute`, or something cluster-specific while `<Endpoint>` handles the contract.

## It refuses to commit plaintext credentials

Every render runs a guardrail pipeline. The no-plaintext-secrets rule scans Secrets, ConfigMaps, workload `env`, and arbitrary nested CRD fields for credential-looking keys, connection-string passwords, and PEM private keys — and understands the difference between a *value* and a *reference* (`valueFrom.secretKeyRef`, `$(VAR)` expansions, `existingSecret*` names, `X_FROM_FILE` styles are all fine). Fails hard in CI, with suggestions:

```
Plaintext credential in Secret "matrix-appservice-signal" (stringData.registration.yaml) — embedded key "as_token"
suggestion: Use a secrets backend (openbao/vault/sealed-secrets) or let the operator provision the credential
```

Also bundled: network-policy presence, resource requests/limits, required labels, TLS on Ingress, no root containers. `--skip-secret-guardrails` exists for local debugging and masks output on stdout — it never writes real credentials to a log channel.

## Operators are explicit dependencies

Components declare the cluster operators they need (CNPG, cert-manager, external-dns, …). The renderer deduplicates and reports them; `r8s operators` renders their install manifests (helm/manifest/OLM) pinned to versions from the central [operators.yaml](packages/crds/operators.yaml) registry. No more "forgot cert-manager on the new cluster" pages.

```tsx
import { useOperators, maybeOperator } from '@r8s/recipes'

const [operatorResources, declares] = useOperators(['cnpg', 'cert-manager'])
```

## Testable infrastructure

Components are plain functions — test them with Vitest before anything reaches a cluster:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@r8s/core'
import { App, Database } from '@r8s/recipes'

it('creates a 3-replica deployment', () => {
  const result = render(
    <App name="api" image="myapp/api:v1" host="api.example.com" replicas={3} />
  )
  const deployment = result.resources.find((r) => r.kind === 'Deployment')
  expect(deployment.spec.replicas).toBe(3)
})

it('declares cnpg when a database is used', () => {
  const result = render(<Database name="app-db" storage="10Gi" />)
  expect(result.operators[0].name).toBe('cnpg')
})
```

The r8s repo itself runs 1300+ such tests, including a provider-matrix suite that renders every package under every secrets-backend × routing-mode combination, and a validation suite that compiles every documented example against the real package sources.

## GitOps integration

Two strategies, scaffolded by `r8s init`:

- **`--strategy github-actions`** (default): CI renders `k8s/r8s.tsx` → committed `manifest.yaml` → Flux/ArgoCD syncs. Simple, reviewable diffs.
- **`--strategy flux-controller`**: push the TSX itself; the accompanying source controller renders it in-cluster as a Flux source artifact. No build step in CI at all.

Both paths feed the same YAML consumers — Flux, ArgoCD, `kubectl apply`.

## Comparison

| | Raw YAML | Helm | Kustomize | Pulumi | **r8s** |
|:---|:---|:---|:---|:---|:---|
| **Composition** | ❌ copy-paste | ⚠️ templates | ❌ patches only | ✅ code | ✅ **typed components** |
| **Type safety** | ❌ | ❌ | ❌ | ✅ | ✅ **full TS** |
| **DRY** | ❌ | ⚠️ values files | ⚠️ bases | ✅ | ✅ **import & reuse** |
| **Operator tracking** | ❌ | ⚠️ subcharts | ❌ | ✅ | ✅ **explicit + renderable** |
| **Credential linting** | ❌ | ❌ | ❌ | ⚠️ | ✅ **built-in guardrails** |
| **Learning curve** | low | medium | low | high | **low** |
| **Output** | YAML | YAML | YAML | direct API | **YAML (GitOps-native)** |

## Repo layout

```
packages/
  core/           JSX factory, renderer, contexts, guardrails
  k8s-types/      Generated TypeScript interfaces from the K8s OpenAPI spec
  crds/           Generated CRD components + operators.yaml registry
  recipes/        Core recipes + providers (Platform, App, Database, …)
  cli/            r8s CLI (init/render/validate/explain/…)
  r8s-controller/ In-cluster TSX rendering controller (GitOps strategy 2)
  flux-controller/FluxCD source controller
  <19 app packages: n8n, outline, matrix, harbor, …>
docs/             Documentation site (Vike + React) — r8s.berget.ai
examples/         basic-app, blueprint, fluxcd, microservices, saas-platform, …
```

## Status

v0.2.x — pre-1.0 but steadily stabilizing. The CLI and core recipes are stable; app recipes are actively derived from production reference deployments, so expect back-to-back improvements as more stacks are modeled. Breaking changes are called out per release.

## Contributing

Missing a component? It's a TypeScript function + an operator declaration:

1. Create a package under `packages/` (copy `@r8s/wireguard` as a skeleton)
2. Export your components as TSX functions; add tests in `__tests__/`
3. Open a PR — AI review + CI within minutes, human review within 24h

Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) — © Berget AI AB
