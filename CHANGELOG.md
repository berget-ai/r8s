# Changelog

All notable changes to r8s are documented here. Versions follow semver; while pre-1.0, breaking changes bump the minor.

## 0.3.8

### Fixed

- **Identity-mapped StaticSecret keys render as raw passthrough (#162).** VSO names each transformation template after the *destination* key, and Go template names reject dashes — paperclip's `berget-api-key` bundle (dest key `berget-api-key`) died with `parse error: bad character U+002D` and never synced. A pure identity map (dest === src for every key, no templates) is semantically identical to a raw passthrough, so the `VaultStaticSecret` destination now skips the `transformation` entirely in that case, keeping `refreshAfter` + `rolloutRestartTargets`. Exhaustive maps that rename keys (or add templates) still render explicit templates.

### Migration note (0.3.7 → 0.3.8)

Routine bump — all 27 packages on the 0.3.7 line move 0.3.8. Operator packages publish as-is at this tag (each mirrors its operator's tracked version; guarded by the operator-contracts suite). Rendered output changes only where a StackSecret request used identity-mapped keys: its `VaultStaticSecret` loses the no-op `transformation` block and gains nothing else — behaviour is identical, minus the template-parse failure.

## 0.3.7

### Fixed

- **Dry-run-valid renders — outline + paperclip (#159).** Dogfood dry-runs rejected both renders: outline's Deployment carried duplicate `SECRET_KEY`/`UTILS_SECRET` env entries (the secret-ref path and an inline path both emitted them) and paperclip's Instance CR rendered explicit null `heartbeat`/`backup` fields where the CRD requires objects. The secret ref is now the single env source (env names are unique per container), and absent props omit the CR fields entirely.
- **external-dns RBAC — pods+nodes read (#160).** The native `ExternalDns` workload's ClusterRole mirrored the chart's source rules but omitted pods/nodes: the controller lists Pods during boot for endpoint target resolution and dies FATAL (`failed to sync *v1.Pod after 1m0s`) without them — seen live as a CrashLoopBackOff (19 restarts) on dogfood. Both resources are now granted; regression tests assert the rules and the secretKeyRef wiring.

### Migration note (0.3.6 → 0.3.7)

All 27 packages on the 0.3.6 line ride the routine 0.3.7 bump. `@r8s/operator-external-dns` floats to 1.21.3 — a component-only package patch (the componentOnly float advances one patch per r8s-side component release; the tracked cut stays chart 1.21.1, whose latest upstream is 1.22.0 and was not adopted) — consumers on `^1.21.2` receive it unchanged. All other operator packages publish as-is at this tag.

## 0.3.6

### Added

- **Helm-free operator installs — manifest sources + native workloads (#156).** The envoy-gateway, reloader and paperclip operator packages switch to upstream static install manifests (fetched at render time by the flux recipe — no HelmRepository/HelmRelease emitted); redis stays helm (documented straggler — no upstream static YAML). The envoy mirror tracks upstream 1.7.1. external-dns grows the native `ExternalDns` component (ServiceAccount + ClusterRole/Binding + Deployment; Route53 credentials via `awsSecretRef` secretKeyRefs), the Vault Secrets Operator grows native `VaultConnection`/`VaultAuth` CR components (install the chart with its `defaultVaultConnection`/`defaultAuthMethod` defaults OFF and render the CRs natively), and the new `@r8s/operator-openbao` package renders `OpenBaoServer` (raft StatefulSet + config ConfigMap + Services). Operator packages whose only change is a native component float exactly one package patch above their tracked cut (`@r8s/operator-external-dns` 1.21.2, `@r8s/operator-vault-secrets` 0.5.1) — the mirror invariant keeps pinning the tracked version; with these additions the shared operators layer can drop HelmRepository/HelmRelease entirely.
- **Flux smoke harness additions (#151).** The local smoke bootstrap phase installs declared operators through the r8s flux recipe, validating the shared operators layer end to end on kind.

### Migration note (0.3.5 → 0.3.6)

Consumers declaring `@r8s/operator-external-dns`/`@r8s/operator-vault-secrets` bump to `^1.21.2`/`^0.5.1` to receive the native components; the tracked operator cuts (chart 1.21.1 / 0.5.0) and the rendered helm sources for those two factories are unchanged. `@r8s/operator-reloader` corrects its mirror to the app release it tracks (1.4.22 — chart 2.2.17 == app v1.4.22) and `@r8s/operator-paperclip` re-publishes at 0.19.1 — repos depending on `^2.2.17`/`^0.19.0` move to the corrected versions. All other publishable packages ride the routine 0.3.6 bump.

## 0.3.5

### Added

- **Secret-triggered rollouts — workloads restart when OpenBao/Vault secrets rotate (#155).** Stakater Reloader joins the operator registry (`@r8s/operator-reloader`, chart `reloader` 2.2.17 from stakater-charts, namespace `reloader`, no CRDs). `SecretProvider` declares it alongside the Vault Secrets Operator for the rotation-capable backends (`openbao` | `vault`) — VSO re-syncs Secrets in place, so a consumer only picks up rotated values when their pods restart, and Reloader performs exactly that restart. Under those backends, App/WebService render `reloader.stakater.com/auto: "true"` on every Deployment pod template (covers explicit `secrets`, `vault` refs, and backend-provisioned credentials wired via DatabaseContext — e.g. the auto-wired `DATABASE_URL`). The annotation is inert without Reloader installed. CNPG clusters are deliberately excluded — the operator manages its own credential rollouts.

### Migration note (0.3.4 → 0.3.5)

The first apply after re-rendering triggers a one-time rollout for two workload groups: every App/WebService under an `openbao`/`vault` backend, and standalone WebServices using `vault` refs without a Platform (those imply the Vault Secrets Operator and are annotated too). Both gain the new `reloader.stakater.com/auto: "true"` pod-template annotation, so the next `kubectl apply` / Flux reconcile rolls them — once, even without Reloader installed and without an actual rotation. CLIs don't restart: only workloads whose re-rendered spec changes. The rollout is safe and idempotent (it also picks up any Secret values that changed on disk since the pods started), and nothing else in the rendered output changes — no data or configuration migration is involved.

## 0.3.4

### Added

- **`r8s flux` — the two-Kustomization stack recipe (#152).** The stateless-install promise as an artifact: `r8s flux <entry> --out <dir>` emits operators first (HelmRepository + HelmRelease per declared operator), then the stack resources, wired as two Flux Kustomizations with dependsOn, wait and healthChecks — the full recipe for a fresh cluster.
- **`r8s flux` shared-operators mode (#153).** Full-catalog installs need ONE operators Kustomization that every package stack dependsOn — per-stack operators layers collide on HelmRelease names under prune. `--operators-only` emits the shared operators stack; `--shared-operators <name>` points a package stack at it (dependsOn names the shared Kustomization explicitly, name + namespace). Default per-stack output is byte-identical to 0.3.3.
- **`@r8s/netbird` — mesh VPN package (#144)**, replacing `@r8s/wireguard` (see Removed): WireGuard-based *mesh* — management + signal + relay + dashboard behind one hostname, Flux HelmRelease + CNPG Postgres + Keycloak OIDC. Structured `LoginFlag` for the IdP contract (#150).
- **`groupsClaim` (#145) — group sync for netbird (and any OIDC app).** `<Client groupsClaim>` renders a client-scope with an `oidc-group-membership-mapper` (JWT `groups` claim), default-assigned — the path Netbird uses to sync IdP groups into mesh policies. Confidential clients declaring `redirectUris` render `standardFlowEnabled: true`; declared `clientScopes` render as bare realm scopes (deduped; a client's own groupsClaim scope wins on name collision and is not repeated as optional) so modern Keycloak's `invalid_scope` answers don't break PKCE flows naming unregistered scopes.
- Runtime-validation record (#141): `docs/validation.json` records which packages/recipes are runtime-validated on kind and the dogfood rke2 cluster, with dates; `scripts/local-smoke.ts` updates it on every PASS and docs detail pages render the validation line — live data, not hand-written JSDoc.

### Changed

- **`objectStorage` derives from the `S3Provider` (#133).** supabase, outline, eneo and nextcloud no longer require an explicit `objectStorage` under an `<S3Provider>`: explicit object wins, a `<Bucket>` descriptor resolves via `resolveBucket`, omitted + provider → derived (the provider's region carries through), omitted without → actionable throw naming both fixes. Plus the error-ergonomics suite: every throw must answer what failed (component + instance), why, and how to fix (copy-pasteable snippet).
- **eurooffice gets a 20-minute startup budget for first-boot migrations (#134)** — fresh-boot readiness polls no longer time out mid-migration.
- Local smoke harness grows a batch-3 wave and hardens: nextcloud/superset ready targets name the real workloads, readiness polls fail loudly on workload NotFound instead of reporting a fabricated `readyReplicas=1`, RWX-only claims skip with reason (#131, #132); eurooffice records skip-on-kind as environment-limited (#135); matrix-mas-secrets provisioning + multi-target smoke gate (#143, #147).

### Fixed

- **matrix rounds 5–9** — six successive smoke iterations on kind + rke2: synapse signing-key volume (`${name}-synapse-keys` PVC, `keysStorage` prop follows the forgejo-style storage-prop shape), MAS pin + config schema + admin image (#136); media store volume + MAS listener binds (#137); synapse config rendering + MAS `public_base` (#139); YAML 1.1 array quoting + MAS secrets (#142); MAS `matrix.homeserver` section (#146); ULID provider ids (#147); MAS web listener must carry the health resource (#148).
- **`r8s init` first-run friction (#138)** — entrypoint, pins, gitignore, flux auth.
- **paperclip defaults to the official public image (#140)** — the private ghcr image 401s without `pullSecrets`.

### Removed

- **`@r8s/wireguard` (wg-easy single-server VPN) is removed**, replaced by **`@r8s/netbird`** — a WireGuard-based *mesh* VPN (management + signal + relay + dashboard behind one hostname, Flux HelmRelease + CNPG Postgres + Keycloak OIDC). wg-easy and Netbird are different product classes (single-server VPN concentrator vs. peer-to-peer mesh); there is no data or configuration migration between them — a Netbird deployment enrolls peers separately. If you still need the old component, pin the previous r8s release (`0.3.3`).

## 0.3.3

### Changed

- **Database credentials contract — rendering without a Platform now works.** `Database` with default `credentialsMode: 'backend'` and NO secrets backend rendered an `initdb.secret` reference that nothing creates — every app package hit `CreateContainerConfigError` (found by the local kind smoke runs). New resolution helper `databaseCredentialsRef()`: backend + 'backend' mode → `<name>-db-credentials` (backend-provisioned, CNPG adopts it); no backend, 'cnpg' mode or passive backends → `<cluster>-app` (CNPG generates it, `initdb.secret` omitted). `DatabaseContext.passwordSecret` now always reflects the real bootstrap secret (fixes a latent 'cnpg'-mode bug). 14 app packages consume the helper instead of hardcoding.
- **`databaseCredentialsRef(name, secretProvider, credentialsMode?)`** — new exported helper in `@r8s/recipes`, the single resolution point for the DB-password Secret. Backend + 'backend' mode → `<name>-db-credentials` (backend-provisioned; openbao/vault/sealed-secrets); no backend or 'cnpg' mode → `<cluster>-app` (CNPG-generated). App packages consume it instead of hardcoding a name.
- App packages (`n8n`, `outline`, `eneo`, `open-webui`, `odoo`, `umami`, `eurooffice`, `forgejo`, `chromadb` (pg mode), `supabase`, `harbor`, `paperclip`, `nextcloud`) now resolve their DB-password refs through `databaseCredentialsRef`.
- `scripts/local-smoke.ts` no longer pre-creates `<name>-db-credentials` for no-backend packages — the CNPG-generated `-app` Secret is the contract (app-contract secrets like encryption keys and JWT bundles are still pre-created).

### Migration note

Clusters **already bootstrapped** keep their state: CNPG runs `bootstrap.initdb` only at cluster creation and ignores bootstrap changes on a healthy cluster — deleting the now-omitted `initdb.secret` from the rendered spec does not re-bootstrap or disturb existing data. Deployments upgraded from the old contract keep pointing pods at their existing `-db-credentials` Secret only until their app manifests are re-rendered; after re-render, references move to the CNPG-generated `<cluster>-app` Secret. Note that `<cluster>-app` only carries a *usable* password for clusters that were bootstrapped without `initdb.secret`: for a cluster bootstrapped against a hand-provisioned `-db-credentials` Secret, CNPG creates `<cluster>-app` with a fresh random password on the next reconcile that is **not** synced into the owner role. For such clusters, before rolling consuming pods either restore/keep a provisioning secrets backend that owns `-db-credentials`, or align the credentials manually (`ALTER ROLE <owner>` to the password in the freshly generated `<cluster>-app`).

### Fixed

- **odoo never reached its database**: the package rendered `DB_HOST`/`DB_USER`/`DB_PASSWORD` but the official odoo:18 entrypoint reads `HOST`/`USER`/`PASSWORD` — odoo dialed the default hostname `db` (caught by the local kind smoke run).
- **odoo never went Ready on first boot**: `/web/health` returns 500 until the base modules are installed — the container now boots with `-d <name> -i base --without-demo=all` (idempotent) and a startupProbe gives the module install a 10-minute budget. Rolling an upgrade re-runs base's update path on existing databases once (cheap for `base`; a one-shot initContainer is a planned refinement).

### Added

- `scripts/local-smoke.ts` covers 11 packages — renders from source, applies to a local kind cluster, polls readiness + healthz, tears down per package; 9 packages validated end-to-end so far.

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
