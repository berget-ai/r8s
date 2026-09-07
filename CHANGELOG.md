# Changelog

All notable changes to r8s are documented here. Versions follow semver; while pre-1.0, breaking changes bump the minor.

## Unreleased

### Changed

- **Database credentials contract** — `Database` without a secrets backend (or with `credentialsMode: 'cnpg'`, or under passive backends that render no referenceable credentials Secret) now relies on the CNPG-generated `<cluster>-app` Secret: `bootstrap.initdb.secret` is omitted and the operator creates the bootstrap credentials in-cluster. Previously the default `credentialsMode: 'backend'` unconditionally rendered `bootstrap.initdb.secret` pointing at `<name>-db-credentials` — a Secret nothing creates without a backend, so every app package rendered without a Platform hit `CreateContainerConfigError` (found by the local kind smoke runs; CloudNativePG 1.27 does not auto-create referenced initdb secrets).
- **`databaseCredentialsRef(name, secretProvider, credentialsMode?)`** — new exported helper in `@r8s/recipes`, the single resolution point for the DB-password Secret. Backend + 'backend' mode → `<name>-db-credentials` (backend-provisioned; openbao/vault/sealed-secrets); no backend or 'cnpg' mode → `<cluster>-app` (CNPG-generated). App packages consume it instead of hardcoding a name.
- App packages (`n8n`, `outline`, `eneo`, `open-webui`, `odoo`, `umami`, `eurooffice`, `forgejo`, `chromadb` (pg mode), `supabase`, `harbor`, `paperclip`) now resolve their DB-password refs through `databaseCredentialsRef`.
- `DatabaseContext.passwordSecret` now always reflects the real bootstrap Secret — fixes a latent bug where `credentialsMode: 'cnpg'` still put `-db-credentials` in the child context while the Cluster actually generated `<cluster>-app`.
- `scripts/local-smoke.ts` no longer pre-creates `<name>-db-credentials` for no-backend packages — the CNPG-generated `-app` Secret is the contract (app-contract secrets like encryption keys and JWT bundles are still pre-created).

## 0.3.2

### Added

- **`@r8s/forgejo`** — self-hosted git forge (GitHub-like): repos on an RWO PVC, CNPG persistence with backups on by default via the platform S3Provider, LFS on S3 (PVC fallback without one), Actions runners shipped by default (`forgejo-runner` + docker-in-docker, registered through a token from the secrets backend), SSH via a dedicated LoadBalancer Service. Pinned-version policy: 'latest' rejected.
- `n8n` gains `dbInstances` (default 3 unchanged) — shrink the CNPG cluster for dev/edge installs.
- `scripts/local-smoke.ts` — repeatable local kind smoke test: renders packages from source, applies to the cluster, polls readiness + healthz, tears down per package (`npx tsx scripts/local-smoke.ts --all-light`).
- README code blocks join the CI net — every ```tsx block with an `export default` must compile, render and pass the plaintext-credential guardrails.

### Fixed

- **forgejo runner could not start**: the docker-in-docker sidecar creates the socket as root while the runner runs as a non-root uid — dind now opens the socket once it appears. The runner also registers against the in-cluster Service URL instead of the external host (no ingress DNS / LB hairpin dependency).
- **eurooffice CLI catalog + package metadata still described the pre-remodel product** — phantom props (websockets/objectStorage/smtp/conversions) and a wrong default name; `r8s explain EuroOffice` now matches the real component.
- Example harness resolved `@r8s/core/defaults` and the operator packages to dist (mixed source/dist module instances) — now source.

## 0.3.1

### Added

- **`<Namespace name="…" create?>`** — composable cluster partitioning. Children inherit the namespace through `useNamespace()` (innermost scope wins, explicit `namespace` props still override); the `v1/Namespace` resource is emitted by default so output stays self-contained (`create={false}` opts out; enclosing scopes with the same name don't double-emit); names are validated as DNS-1123 labels with actionable guidance. `<Platform namespace="…">` delegates to it — one code path for emission + scoping + validation. The recipe component and the raw `@r8s/core/defaults` context share the `Namespace` name (different modules; the component aliases the context internally) — `<Namespace>` reads the same at every level.
- App packages (`matrix`, `eneo`, `odoo`, `nextcloud`, `supabase`, `chromadb`, `librechat`, `open-webui`, …) resolved off the copied inline namespace formula onto the shared `useNamespace()` hook — every app package now honors the surrounding `<Namespace>`/`<Platform>` scope.

### Changed

- **Secure backup default (#115)** — omitting `backup` no longer throws when an `S3Provider` is in scope: the target and credentials derive from the provider and backups turn on (a missing backup bucket/Secret surfaces as provisioning errors on apply, not at render). Without a provider the decision stays required (throw with guidance); `backup={false}` remains the only explicit opt-out. Amends the 0.3.0 "required decision" rule that made `backup` a mandatory decision at every call site.

### Fixed

- Docs image fix: workspace manifests are copied before `npm ci` in `k8s/Dockerfile` — bare-specifier imports without a tsconfig `paths` entry (e.g. `@r8s/operator-nginx-ingress`) resolve again; deploys green after the #112 regression.

## 0.3.0

Breaking release: the operator capability model finishes and S3 becomes a platform primitive. **Nobody is expected to migrate from 0.2.x without reading this — no consumer code exists in the wild yet.**

### Breaking

- **`<Database>` / `<Matrix>` backups are a required decision.** Omitting `backup` throws with guidance. Enable via the platform `S3Provider` (`backup` / `backup={true}` / `backup={<Bucket name="…" />}`) or pass an explicit target; `backup={false}` is the explicit opt-out (forks, ephemeral CI). Rationale: unarchived WAL slowly fills the data PVC.
- **Operator name/ID coupling is gone from runtime.** Packages no longer say `operators['cert-manager']()` or `maybeOperator('redis-operator', …)`. Every consumer imports its `@r8s/operator-*` package and calls `declareIfMissing(shared)`. The generic name-param helper `maybeOperator` and the recipes alias exports (`cnpgOperator`, `nginxIngressOperator`, `vaultSecretsOperator`) are **removed** — import `@r8s/operator-cnpg` (etc) directly.
- **`S3Config.credentialsNamespace` removed** (CNPG barman + Velero BSL reference Secrets namespace-locally; the field was a lie).
- **`veleroCredentialKey` removed from the S3 provider interface** — Velero owns how it reads its credential: `<Backup credentialKey="cloud" />`.
- Mix operator-package majors across packages and `npm install` now fails (peerDependencies `^<operator-major>.0.0`) — the mixed-operator tree never reaches a cluster.

### Added

- **`<S3Provider>`** (MinIO/RustFS/AWS convenience configs) + `<Bucket>` descriptor — declare once, every consumer derives destinations; scoping, overrides and the `<name>-cnpg` / `velero/` conventions live with the consumers.
- **`<Backup>`** (Velero) emits a `BackupStorageLocation` against the provider bucket and pins its Schedule to it.
- **14 operator packages** — every operator in the registry mirrors its own version 1:1 (`@r8s/operator-cnpg@1.27.0`, `@r8s/operator-velero@1.13.0`, …), carrying its declaration factory, `declareIfMissing()` and generated CRD components.
- **CodeScene health pass** — CLI (5.0→9.01), guardrails, flux-controller serialize, auth collectors, matrix component split.
- npm publish rebuilt as verify-job + per-package matrix (fail-fast off, retry-safe), with a dist-existence guard fixing the 0.2.0 source-only tarballs.

## 0.2.1

- Complete dist tarballs for every published package (`files: ["dist"]`, publish-time dist guard, matrix publish workflow replacing the ORDER loop).
- `@r8s/paperclip@0.19.0`-values, `umami` and `harbor` now on npm.

## 0.2.0

- Facit-derived app packages: n8n, outline, paperclip (operator Instance CR), eurooffice (DocumentServer), umami, harbor.
- `Database.credentialsMode='cnpg'`, `StaticSecret` recipe, capability hooks core (provision/route), provider-matrix test suite.
