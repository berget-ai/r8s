# Changelog

All notable changes to r8s are documented here. Versions follow semver; while pre-1.0, breaking changes bump the minor.

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
