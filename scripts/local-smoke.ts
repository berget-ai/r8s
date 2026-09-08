/**
 * local-smoke.ts — repeatable smoke test for @r8s packages on a local kind cluster.
 *
 * Renders a package against SOURCE (packages/<pkg>/src, never dist), creates an
 * isolated `<package>-smoke` namespace, applies the rendered resources, waits
 * for readiness, optionally probes a health endpoint through a port-forward,
 * and tears the namespace down again (images stay cached on the node).
 *
 * Usage:
 *
 *     npx tsx scripts/local-smoke.ts <package...>     # e.g. rustfs umami
 *     npx tsx scripts/local-smoke.ts --all-light      # rustfs umami grafana n8n
 *
 * Prerequisites:
 *
 * - A built workspace (`npm run build`). Only the parent CLI half loads the
 *   package entry points through node_modules (dist); the render child
 *   re-resolves every @r8s/* import to packages/<pkg>/src via the esbuild
 *   alias map, so rendering itself is always from source.
 *   scripts/ sits outside the package tsconfig graph — typecheck it
 *   standalone under the ESM flavor tsx runs (`tsc --noEmit` with
 *   module ESNext), strict mode.
 * - A kind cluster named `r8s-local` whose kubeconfig context is loaded
 *   into the merged kubeconfig. The preflight probes
 *   `kubectl --context kind-r8s-local get nodes` and, on failure, runs
 *   `kind export kubeconfig --name r8s-local` once before giving up (a
 *   colima/Docker VM restart drops the context from the merge).
 *
 *   Every kubectl call in this script carries `--context kind-r8s-local`
 *   (hard-coded, never the ambient context, so a production default context
 *   can't receive smoke traffic by accident).
 * - CNPG operator installed in the cluster (for packages that render a
 *   Database — umami, n8n, outline, eneo, open-webui, odoo, paperclip,
 *   nextcloud, and superset via the smoke's companion `superset-db`
 *   render — the package itself has no CNPG stitch).
 *   The opstree redis-operator (ot-container-kit chart 0.22.0) is a second
 *   cluster prerequisite whenever a package renders a Redis CR (outline
 *   with default `cache: true`; nextcloud with default `cache: true`;
 *   superset via `redis.create: true`; open-webui only with `cache`).
 * - Batch-3 requires the paperclip-operator (helm chart v0.19.0 from
 *   oci://ghcr.io/paperclipinc/charts, release namespace paperclip-system)
 *   to own paperclip's Instance CR; without it the apply fails with
 *   "no matches for kind" (recorded as FAIL, not skip).
 * - Enough free disk: image pulls go through the Docker-driver VM. Before
 *   each package the script checks free space and aborts the remaining
 *   batch under `--min-free-mb` (default 2048 — 2 GiB: big images like
 *   open-webui / odoo need headroom to pull without wedging the VM).
 *
 * Design notes:
 *
 * - The PER_PACKAGE table maps package name → how to render it, which dummy
 *   Secrets to pre-create (the forgejo `credentialsSecretName` pattern), which
 *   workload to poll for readiness, and the optional healthz probe. Every
 *   Secret literal in this file is a fake smoke-only value; none is a real
 *   credential.
 * - Packages whose contract secrets have no pre-created-Secret prop (they
 *   need a vault/openbao backend) get `skipReason: 'requires secrets
 *   backend'` and are listed as SKIPPED in the output table — never hacked
 *   around. None of the --all-light packages needs a backend: all four
 *   expose pre-created-Secret props. The same is true for every batch-2
 *   package (outline `secretsName`, eneo `secretsName`, open-webui
 *   `secretsName`, odoo `masterPasswordSecretName`, paperclip
 *   `secretsName` + `apiKeySecretName`); chromadb and element need none.
 * - Batch-2 expected rough edges, recorded in the per-entry notes: feature
 *   CRs whose operators are not installed in kind (paperclip's Instance
 *   CR → apply fails with "no matches for kind") and packages that pass
 *   through Database recipe defaults with no sizing knob (eneo,
 *   open-webui, odoo get 3 CNPG instances + a 10Gi db volume whether you
 *   like it or not). outline's Redis CR is NOT one of those rough edges —
 *   the opstree redis-operator is an installed cluster prerequisite
 *   (above) and outline must run with cache on: it refuses to boot
 *   without REDIS_URL.
 * - Batch-3 contract notes: nextcloud has no dbInstances/dbStorage knob
 *   (db volume hardcoded 10Gi, 3 CNPG replicas by recipe defaults) but
 *   objectStorage is optional — omitted, files live on the html PVC.
 *   superset has NO Database stitch at all (external-Postgres contract) so
 *   the smoke renders a companion CNPG `superset-db` alongside it; the app
 *   is only Ready after `superset db upgrade` + `superset init` complete.
 *   wireguard renders no LB service (ClusterIP default, NodePort opt-in)
 *   and no probes — net-ops work (wg0 + iptables) verified via the 51821
 *   web UI. paperclip's operator IS resolvable from the package metadata
 *   (oci://ghcr.io/paperclipinc/charts) — install it first or expect the
 *   apply to fail on the missing CRD.
 * - Rendering: esbuild bundles a small child module that imports THIS file
 *   (see buildBundle) with @r8s/* alias-mapped to packages/<pkg>/src — the same
 *   alias map as packages/recipes/__tests__/helpers/example-harness.ts. The
 *   render call itself happens inside the bundled child so that every import
 *   (core, recipes, crds, operator packages, subpaths) resolves to SOURCE.
 *   The bundle is kind to itself: the CLI half is guarded by a banner-set
 *   env var so the child's module evaluation does not re-run main().
 * - Aliases extend the harness map with `@r8s/core/defaults`, the operator
 *   packages and `@r8s/operator-nginx-ingress`. The harness map misses those
 *   subpaths; without the extension, umami/n8n silently pull
 *   `@r8s/core/defaults` from DIST while everything else comes from SOURCE
 *   (mixed module instances break context lookups at render time), and
 *   recipes/src/endpoint.tsx pulls `@r8s/operator-nginx-ingress` from dist
 *   in every package that renders an <Endpoint>.
 * - Teardown is `kubectl delete namespace --wait=false`: images stay cached
 *   and deletion finishes in the background while the next package runs.
 *
 * Debugging a failed run: set R8S_SMOKE_KEEP_NAMESPACES=1 to skip teardown,
 * then poke around `kubectl --context kind-r8s-local -n <pkg>-smoke ...`.
 */

import { execFile, spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { KubernetesResource } from '@r8s/k8s-types'

// Value imports used by the render table below. They are evaluated for real
// only inside the esbuild-bundled child (which resolves them to
// packages/<pkg>/src); the parent CLI process never calls component code.
import { RustFS } from '@r8s/rustfs'
import { Umami } from '@r8s/umami'
import { Grafana } from '@r8s/grafana'
import { N8n } from '@r8s/n8n'
import { Outline } from '@r8s/outline'
import { Eneo } from '@r8s/eneo'
import { ChromaDb } from '@r8s/chromadb'
import { OpenWebui } from '@r8s/open-webui'
import { Element } from '@r8s/element'
import { Odoo } from '@r8s/odoo'
import { Paperclip } from '@r8s/paperclip'
import { Nextcloud } from '@r8s/nextcloud'
import { Superset } from '@r8s/superset'
import { WireGuard } from '@r8s/wireguard'
// Value import: the superset smoke renders a companion CNPG cluster — the
// package itself does NOT stitch a Database (see the superset entry).
import { Database } from '@r8s/recipes'
import { Fragment } from '@r8s/core'

// --- Constants ---------------------------------------------------------------

const THIS_FILE = process.env.R8S_LOCAL_SMOKE_SELF ?? fileURLToPath(import.meta.url)
const ROOT = path.resolve(path.dirname(THIS_FILE), '..')
/** Hard-coded safety belt: smoke always runs against this context. */
const KUBE_CONTEXT = 'kind-r8s-local'
const KIND_CLUSTER = 'r8s-local'
/**
 * Abort the remaining batch below this much free disk (2 GiB — image pulls
 * go through the Docker-driver VM, and a wedged pull is worse than a gap
 * in the report).
 */
const MIN_FREE_BYTES = 2048 * 1024 * 1024
/** Warn-only advisory reported before the batch starts. */
const DISK_WARN_BYTES = 2500 * 1024 * 1024
const READY_TIMEOUT_MS = 5 * 60 * 1000
const READY_POLL_MS = 5 * 1000
/**
 * healthz retry-with-reconnect: up to HEALTHZ_ATTEMPTS probes, each with a
 * fresh port-forward and its own poll window, ~30s apart. The old variant
 * polled for 90s on ONE port-forward — healthy packages hard-failed when
 * the tunnel flaked mid-batch (observed on grafana). Reconnecting is the
 * fix; polling a dead socket longer is not.
 */
const HEALTHZ_ATTEMPTS = 3
const HEALTHZ_ATTEMPT_TIMEOUT_MS = 30 * 1000
const HEALTHZ_RETRY_DELAY_MS = 30 * 1000
const HEALTHZ_POLL_MS = 3 * 1000
/** Local side of the port-forward = container port + this offset. */
const PORT_FORWARD_LOCAL_OFFSET = 20000

/**
 * The batch that is safe to run on a laptop kind cluster right now:
 * self-contained packages with pre-created-Secret props and modest images.
 * umami additionally pulls the CNPG postgres image and needs the CNPG
 * operator; the other three pull one image each.
 */
const ALL_LIGHT = ['rustfs', 'umami', 'grafana', 'n8n']

// --- esbuild alias map -------------------------------------------------------

/**
 * Same alias map as packages/recipes/__tests__/helpers/example-harness.ts
 * (ESBUILD_ALIASES), EXTENDED with:
 *
 * - `@r8s/core/defaults` — the harness only aliases the bare package, so any
 *   component doing `from '@r8s/core/defaults'` (umami, n8n, …) silently
 *   loaded DIST context objects while jsx/render came from SOURCE. Mixed
 *   module instances are one of the nastiest failure modes here; the
 *   extension keeps the whole graph on source.
 * - `@r8s/operator-cnpg` / `@r8s/operator-redis` — via node_modules these
 *   would resolve to dist while their CRD surface (@r8s/crds/*) points at
 *   source, skewing operator declarations across module instances.
 */
export function buildAliasMap(): Record<string, string> {
  const aliases: Record<string, string> = {
    '@r8s/core': path.join(ROOT, 'packages/core/src'),
    '@r8s/recipes': path.join(ROOT, 'packages/recipes/src'),
    '@r8s/recipes/auth': path.join(ROOT, 'packages/recipes/src/auth/index.ts'),
    '@r8s/crds': path.join(ROOT, 'packages/crds/src'),
    '@r8s/crds/postgresql': path.join(ROOT, 'packages/crds/src/generated/postgresql.ts'),
    '@r8s/crds/cert-manager': path.join(ROOT, 'packages/crds/src/generated/cert-manager.ts'),
    '@r8s/crds/gateway': path.join(ROOT, 'packages/crds/src/generated/gateway.ts'),
    '@r8s/crds/redis': path.join(ROOT, 'packages/crds/src/generated/redis.ts'),
    '@r8s/crds/velero': path.join(ROOT, 'packages/crds/src/generated/velero.ts'),
    '@r8s/crds/monitoring': path.join(ROOT, 'packages/crds/src/generated/monitoring.ts'),
    '@r8s/crds/keycloak': path.join(ROOT, 'packages/crds/src/generated/keycloak.ts'),
    '@r8s/crds/externaldns': path.join(ROOT, 'packages/crds/src/generated/externaldns.ts'),
    '@r8s/crds/clickhouse': path.join(ROOT, 'packages/crds/src/generated/clickhouse.ts'),
    '@r8s/crds/logging': path.join(ROOT, 'packages/crds/src/generated/logging.ts'),
    '@r8s/crds/loki': path.join(ROOT, 'packages/crds/src/generated/loki.ts'),
    // --- extensions over the harness map (see doc comment) ---
    '@r8s/core/defaults': path.join(ROOT, 'packages/core/src/defaults.ts'),
    '@r8s/operator-cnpg': path.join(ROOT, 'packages/operator-cnpg/src'),
    '@r8s/operator-redis': path.join(ROOT, 'packages/operator-redis/src'),
    // endpoint.tsx imports this from every <Endpoint>-rendering package —
    // without the alias it silently loads dist inside the render graph.
    '@r8s/operator-nginx-ingress': path.join(ROOT, 'packages/operator-nginx-ingress/src'),
  }

  // App packages — every @r8s/* app maps to its source dir (same list the
  // harness maintains via APP_PACKAGES).
  const appPackages = [
    'element',
    'grafana',
    'rustfs',
    'superset',
    'wireguard',
    'n8n',
    'nextcloud',
    'outline',
    'chromadb',
    'supabase',
    'odoo',
    'open-webui',
    'librechat',
    'eurooffice',
    'paperclip',
    'eneo',
    'matrix',
    'harbor',
    'umami',
    'forgejo',
  ]
  for (const name of appPackages) {
    aliases[`@r8s/${name}`] = path.join(ROOT, 'packages', name, 'src')
  }
  return aliases
}

// --- Smoke spec types --------------------------------------------------------

export interface SecretSpec {
  /** Secret name to pre-create before applying manifests */
  name: string
  /** Opaque literal keys — smoke-only values, never real credentials */
  literal: Record<string, string>
}

export interface ReadySpec {
  kind: 'Deployment' | 'StatefulSet'
  name: string
}

export interface HealthzSpec {
  /** Container port to port-forward (local port is derived) */
  port: number
  /** HTTP path expected to return 2xx */
  path: string
}

export interface SmokeSpec {
  /** Import name of the package, e.g. '@r8s/rustfs' */
  package: string
  /** Isolated namespace for this run: `<pkg>-smoke` */
  namespace: string
  /**
   * Render the package with the @r8s/core jsx factory. Invoked inside the
   * bundled child, so components resolve against packages/<pkg>/src.
   */
  render: (jsx: typeof import('@r8s/core').jsx) => unknown
  /** Pre-created Opaque Secrets (the forgejo `credentialsSecretName` pattern) */
  secrets: SecretSpec[]
  /** Workload polled for readiness (5 min budget) */
  ready: ReadySpec
  /** Optional HTTP health probe through a port-forward; null → N/A */
  healthz: HealthzSpec | null
  /** Static skip, e.g. 'requires secrets backend' for backend-bound packages */
  skipReason?: string
}

export type RowStatus = 'pass' | 'fail' | 'skip'

export interface Outcome {
  status: RowStatus
  rendered: string
  ready: string
  healthz: string
  notes: string
}

// --- PER_PACKAGE table -------------------------------------------------------

/**
 * Props are sized for a laptop kind cluster: single instance, 1Gi volumes,
 * backup off (no S3 provider in scope), and every backend-provisioned
 * secret swapped for a pre-created one via that package's pre-created or
 * existing-secret prop.
 *
 * Bootstrap-secret note: every package here that puts its app inside
 * <Database> children references its DB-password Secret via the central
 * credentials contract (databaseCredentialsRef). Without a secrets backend
 * the contract resolves the CNPG-generated `<name>-app` Secret: the
 * rendered Cluster omits bootstrap.initdb.secret and the CNPG operator
 * creates the credentials in-cluster — nothing to pre-create. (CloudNativePG
 * 1.27 does not auto-create a referenced initdb secret, so the smoke
 * previously had to pre-create `<name>-db-credentials` by hand; those
 * entries were dead weight and are gone.) App-contract secrets (encryption
 * keys, JWT bundles, admin passwords, S3 credentials) are pre-created as
 * before.
 */
export const PER_PACKAGE: Record<string, SmokeSpec> = {
  rustfs: {
    package: '@r8s/rustfs',
    namespace: 'rustfs-smoke',
    // Renders its own Secret (rootCredentials.password) — no pre-created
    // secret prop needed at all. Also renders its own Namespace object,
    // which is idempotent against the one this script creates first.
    render: (jsx) =>
      jsx(RustFS, {
        name: 'rustfs',
        namespace: 'rustfs-smoke',
        instances: 1,
        storage: '1Gi',
        rootUser: 'rustfs',
        rootCredentials: { password: 'smoke-only-password' },
        // No host → no Ingress, no ingress-controller dependency.
      }),
    secrets: [],
    ready: { kind: 'StatefulSet', name: 'rustfs' },
    // An S3 store: no documented HTTP health contract; StatefulSet
    // readiness (a live pod on 9000/9001) is the success signal.
    healthz: null,
  },

  umami: {
    package: '@r8s/umami',
    namespace: 'umami-smoke',
    // appSecretRef points at a pre-created Secret, so the package skips its
    // backend-provisioning path. DB credentials are CNPG-managed
    // (credentialsMode 'cnpg' → the operator generates `<dbName>-app`,
    // including the fqdn-uri key) — nothing to pre-create there.
    // Requires the CNPG operator in the cluster.
    render: (jsx) =>
      jsx(Umami, {
        name: 'umami',
        namespace: 'umami-smoke',
        host: 'umami.smoke.test',
        dbInstances: 1,
        dbStorage: '1Gi',
        backup: false,
        appSecretRef: 'umami-smoke-app-secrets',
      }),
    secrets: [
      { name: 'umami-smoke-app-secrets', literal: { 'app-secret': 'smoke-only-app-secret' } },
    ],
    ready: { kind: 'Deployment', name: 'umami' },
    healthz: { port: 3000, path: '/api/heartbeat' },
  },

  grafana: {
    package: '@r8s/grafana',
    namespace: 'grafana-smoke',
    // admin.existingSecret swaps the rendered admin Secret for a pre-created
    // one (keys username + password, mounted at /etc/grafana/admin).
    render: (jsx) =>
      jsx(Grafana, {
        name: 'grafana',
        namespace: 'grafana-smoke',
        storage: '1Gi',
        admin: { existingSecret: 'grafana-smoke-admin' },
        // No host → no Ingress; no datasources → no ConfigMap volume.
      }),
    secrets: [
      {
        name: 'grafana-smoke-admin',
        literal: { username: 'admin', password: 'smoke-only-admin' },
      },
    ],
    ready: { kind: 'Deployment', name: 'grafana' },
    // The rendered Deployment has no readiness/liveness probes, so the pod
    // flips Ready while Grafana is still booting; /api/health may answer 503
    // briefly — the healthz probes retry with reconnects (3 × 30s windows).
    healthz: { port: 3000, path: '/api/health' },
  },

  n8n: {
    package: '@r8s/n8n',
    namespace: 'n8n-smoke',
    // encryptionKeySecretName is the pre-created-Secret prop for the
    // encryption key (key 'encryptionKey'); without it the package demands a
    // vault/openbao backend. DB credentials are CNPG-generated
    // (`<name>-app`, no initdb.secret reference — nothing to pre-create).
    // Requires the CNPG operator in the cluster.
    render: (jsx) =>
      jsx(N8n, {
        name: 'n8n',
        namespace: 'n8n-smoke',
        host: 'n8n.smoke.test',
        storage: '1Gi',
        // Default dbInstances is 3 — three postgres replicas on a 1-node
        // kind VM is waste; one instance is plenty for a smoke probe.
        dbInstances: 1,
        backup: false,
        encryptionKeySecretName: 'n8n-smoke-encryption-key',
        // Ephemeral /home/node/.n8n (no dataStorage PVC) — fine for smoke.
      }),
    secrets: [
      {
        name: 'n8n-smoke-encryption-key',
        literal: { encryptionKey: 'smoke-only-encryption-key-not-a-real-credential' },
      },
    ],
    ready: { kind: 'Deployment', name: 'n8n' },
    healthz: { port: 5678, path: '/healthz' },
  },

  outline: {
    package: '@r8s/outline',
    namespace: 'outline-smoke',
    // secretsName is the pre-created-Secret prop; keys are validated by the
    // app at boot — SECRET_KEY/UTILS_SECRET must be 64-hex (dummy hex is
    // fake, not a real credential). instances (CNPG, default 2) sized down
    // to 1. cache stays ON (default): outline refuses to boot without
    // REDIS_URL, and the opstree redis-operator is a cluster prerequisite
    // (helm install redis-operator ot-container-kit/redis-operator v0.22.0).
    // DB credentials are CNPG-generated (`<name>-app`, no initdb.secret
    // reference — nothing to pre-create).
    render: (jsx) =>
      jsx(Outline, {
        name: 'outline',
        namespace: 'outline-smoke',
        host: 'outline.smoke.test',
        instances: 1,
        storage: '1Gi',
        backup: false,
        secretsName: 'outline-smoke-secrets',
      }),
    secrets: [
      {
        name: 'outline-smoke-secrets',
        literal: {
          // 64-hex dummies (the app rejects shorter/non-hex at boot)
          SECRET_KEY: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          UTILS_SECRET: '38b060a751ac96384bd9ceb2d0606d48a63f2d9c2cfeea0864e67e5e24b9e9e4',
        },
      },
    ],
    ready: { kind: 'Deployment', name: 'outline' },
    // Package probes are tcpSocket-only (WebService probes override) — no
    // HTTP health path is part of this package's contract.
    healthz: null,
  },

  eneo: {
    package: '@r8s/eneo',
    namespace: 'eneo-smoke',
    // secretsName is the pre-created-Secret prop (key appSecret)… +
    // objectStorage is a REQUIRED prop: the dummy bucket reference points
    // at a pre-created credentials Secret — the app pod will fail its S3
    // calls, which is expected smoke noise; readiness only needs the web
    // process. No instances knob: Database defaults to 3 CNPG replicas.
    // DB credentials are CNPG-generated (`<name>-app`, no initdb.secret
    // reference — nothing to pre-create).
    render: (jsx) =>
      jsx(Eneo, {
        name: 'eneo',
        namespace: 'eneo-smoke',
        host: 'eneo.smoke.test',
        replicas: 1,
        dbStorage: '1Gi',
        backup: false,
        secretsName: 'eneo-smoke-secrets',
        objectStorage: {
          endpoint: 'https://s3.smoke.test',
          bucket: 'eneo-corpora',
          credentialsSecret: 'eneo-smoke-s3',
        },
      }),
    secrets: [
      { name: 'eneo-smoke-secrets', literal: { appSecret: 'smoke-only-app-secret' } },
      { name: 'eneo-smoke-s3', literal: { accessKey: 'smoke-access', secretKey: 'smoke-secret' } },
    ],
    ready: { kind: 'Deployment', name: 'eneo' },
    // WebService default probes: httpGet /ready (readiness) + /health
    // (liveness) on the container port — the pod passing readyReplicas is
    // the same contract the probe checks.
    healthz: { port: 3000, path: '/ready' },
  },

  chromadb: {
    package: '@r8s/chromadb',
    namespace: 'chromadb-smoke',
    // pg stays false (default) → pure data plane: PVC + Deployment +
    // Service + Endpoint, NO CNPG cluster. auth off → no secrets at all.
    // Note the raw Deployment pins imagePullPolicy: Always — every run
    // re-pulls (digest may move; that is the package contract, not a bug).
    render: (jsx) =>
      jsx(ChromaDb, {
        name: 'chromadb',
        namespace: 'chromadb-smoke',
        host: 'chromadb.smoke.test',
        storage: '1Gi',
      }),
    secrets: [],
    ready: { kind: 'Deployment', name: 'chromadb' },
    healthz: { port: 8000, path: '/api/v2/heartbeat' },
  },

  'open-webui': {
    package: '@r8s/open-webui',
    namespace: 'open-webui-smoke',
    // secretsName is the pre-created-Secret prop (keys modelApiKey +
    // secretKey). No storage prop → ephemeral /app/backend/data (PVC writes
    // tested by other packages). DB cluster is unconditional — Database
    // defaults apply (10Gi, 3 instances, no sizing knob on this package).
    // DB credentials are CNPG-generated (`<name>-app`, no initdb.secret
    // reference — nothing to pre-create).
    render: (jsx) =>
      jsx(OpenWebui, {
        name: 'open-webui',
        namespace: 'open-webui-smoke',
        host: 'chat.smoke.test',
        backup: false,
        secretsName: 'open-webui-smoke-secrets',
      }),
    secrets: [
      {
        name: 'open-webui-smoke-secrets',
        literal: {
          modelApiKey: 'smoke-only-model-api-key',
          secretKey: 'smoke-only-webui-secret-key',
        },
      },
    ],
    ready: { kind: 'Deployment', name: 'open-webui' },
    // Raw Deployment probes: httpGet /health on 8080 (initialDelay 30s —
    // first boot runs Alembic migrations against Postgres first).
    healthz: { port: 8080, path: '/health' },
  },

  element: {
    package: '@r8s/element',
    namespace: 'element-smoke',
    // Web client only: static nginx pod + config.json — no secrets, no
    // PVC, no operators. homeserverUrl points at a dummy (the client just
    // embeds it in config.json). namespace must be passed explicitly: the
    // package defaults to namespace 'element' and renders it itself.
    render: (jsx) =>
      jsx(Element, {
        name: 'element',
        namespace: 'element-smoke',
        host: 'element.smoke.test',
        homeserverUrl: 'https://matrix.smoke.test',
      }),
    secrets: [],
    ready: { kind: 'Deployment', name: 'element' },
    // No probes in the rendered Deployment at all; element-web's nginx
    // serves / on 80 — a 2xx there proves the server is up.
    healthz: { port: 80, path: '/' },
  },

  odoo: {
    package: '@r8s/odoo',
    namespace: 'odoo-smoke',
    // masterPasswordSecretName is the pre-created-Secret prop (key
    // masterPassword). filestore PVC sized down from 20Gi. No instances
    // knob: Database defaults to 3 CNPG replicas. DB credentials are
    // CNPG-generated (`<name>-app`, no initdb.secret reference — nothing
    // to pre-create).
    render: (jsx) =>
      jsx(Odoo, {
        name: 'odoo',
        namespace: 'odoo-smoke',
        host: 'odoo.smoke.test',
        filestore: '1Gi',
        backup: false,
        masterPasswordSecretName: 'odoo-smoke-master-password',
      }),
    secrets: [
      {
        name: 'odoo-smoke-master-password',
        literal: { masterPassword: 'smoke-only-master-password' },
      },
    ],
    ready: { kind: 'Deployment', name: 'odoo' },
    healthz: { port: 8069, path: '/web/health' },
  },

  paperclip: {
    package: '@r8s/paperclip',
    namespace: 'paperclip-smoke',
    // Renders an Instance CR (paperclip.inc/v1alpha1) that a
    // paperclip-operator chart (v0.19.0, declared via the operators list —
    // NOT applied by this script) is supposed to own. Without that
    // operator in kind the CRD itself is absent, so `kubectl apply` is
    // expected to fail with "no matches for kind"; recorded as FAIL with
    // that precise reason. secretsName (key better-auth-secret) +
    // apiKeySecretName (key api-key) are the pre-created-Secret props;
    // pullSecrets=[] drops the default private-repo pull secret.
    render: (jsx) =>
      jsx(Paperclip, {
        name: 'paperclip',
        namespace: 'paperclip-smoke',
        host: 'paperclip.smoke.test',
        dbInstances: 1,
        dbStorage: '1Gi',
        storage: { size: '1Gi' },
        backup: false,
        appBackup: false,
        heartbeat: false,
        modelCatalog: false,
        pullSecrets: [],
        secretsName: 'paperclip-smoke-secrets',
        apiKeySecretName: 'paperclip-smoke-api-key',
      }),
    secrets: [
      {
        name: 'paperclip-smoke-secrets',
        literal: { 'better-auth-secret': 'smoke-only-better-auth-secret' },
      },
      { name: 'paperclip-smoke-api-key', literal: { 'api-key': 'smoke-only-api-key' } },
    ],
    // Operator-owned StatefulSet — absent unless paperclip-operator runs.
    ready: { kind: 'StatefulSet', name: 'paperclip' },
    // Probes are operator-chart-owned ("probes: type auto") — this repo
    // does not render a concrete path/port to probe.
    healthz: null,
  },

  nextcloud: {
    package: '@r8s/nextcloud',
    namespace: 'nextcloud-smoke',
    // objectStorage is OPTIONAL: omitted → files live on the /var/www/html
    // PVC (sized down from 10Gi) and no S3 credentials secret is needed.
    // secretsName (key `adminPassword`) is the pre-created-Secret prop for
    // the admin bootstrap password: without it the component THROWS at
    // render time (no secrets backend in this smoke), so this entry would
    // be a guaranteed skip without it. No dbInstances/dbStorage knob —
    // Database recipe defaults apply (3 CNPG replicas) and the package
    // hardcodes the db data volume at 10Gi. cache stays ON (default):
    // opstree redis-operator is a cluster prerequisite, and Redis
    // Replication (×3, tiny) is what Nextcloud file locking wants.
    // Requires the CNPG operator in the cluster.
    render: (jsx) =>
      jsx(Nextcloud, {
        name: 'nextcloud',
        namespace: 'nextcloud-smoke',
        host: 'nextcloud.smoke.test',
        storage: '2Gi',
        backup: false,
        secretsName: 'nextcloud-smoke-secrets',
      }),
    secrets: [
      {
        name: 'nextcloud-smoke-secrets',
        literal: { adminPassword: 'smoke-only-admin-password' },
      },
    ],
    // Ready target: the CNPG ordinals (`nextcloud-1/2/3`, Database recipe
    // default, 3 instances) are instance pods owned by the Cluster CR, not
    // the app. The APP is the Deployment `nextcloud` (replicaset-style pod
    // names) — the package renders it outside WebService because it must
    // mount the html claim. (Earlier misdiagnosis: targeting the CNPG
    // StatefulSet `nextcloud` — wrong workload, wrong pods.)
    ready: { kind: 'Deployment', name: 'nextcloud' },
    // Raw Deployment probes: httpGet /status.php on 80 — the image serves
    // status.php from t=0 (reports installed:false until first boot
    // completes), so readiness flips before the admin install finishes.
    healthz: { port: 80, path: '/status.php' },
    // Static skip: the package's html PVC hardcodes accessModes
    // [ReadWriteMany] (functional requirement — the cron job shares the
    // claim), and kind's local-path StorageClass is RWO-only, so the claim
    // can never bind here. Environment limitation, not a package defect.
    skipReason:
      'requires an RWX StorageClass — kind local-path is RWO-only (environment limitation, not a package defect)',
  },

  superset: {
    package: '@r8s/superset',
    namespace: 'superset-smoke',
    // Contract finding: Superset does NOT render a Database —
    // database.* points at an EXTERNAL Postgres and redis.create:true
    // renders an OT-Redis Cluster (redis-operator = cluster prerequisite).
    // The smoke renders a companion CNPG Database next to the app:
    // name 'superset-db' → bootstrap db/owner 'superset-db', CNPG-generated
    // credentials Secret `superset-db-app` (key `password`) — nothing to
    // pre-create for the DB. admin.existingSecret (key `secretKey`) is the
    // package's only pre-created-Secret prop. The app pod serves / on 8088
    // only after `superset db upgrade` + `superset init` finish against
    // that Postgres — expect minutes, not seconds.
    //
    // ENV-CLOBBER FINDING (found by batch-3 run 1): with the default
    // instance name 'superset' the rendered Service injects K8s
    // service-link env `SUPERSET_PORT=tcp://<ip>:80` into the pod, over the
    // image's SUPERSET_PORT=8088; run-server.sh then binds
    // "0.0.0.0:tcp://..." and gunicorn dies instantly with
    // `Error: 'tcp' is not a valid port number.` — deterministic on any
    // cluster (enableServiceLinks defaults on) and unfixable via props.
    // The smoke renders as 'superset-ui' so the injected prefix becomes
    // SUPERSET_UI_PORT (unused by the app). Package upstream fix: set
    // SUPERSET_PORT explicitly in its env, or rename the Service.
    render: (jsx) =>
      jsx(Fragment, {
        children: [
          jsx(Database, {
            name: 'superset-db',
            namespace: 'superset-smoke',
            instances: 1,
            storage: '1Gi',
            backup: false,
          }),
          jsx(Superset, {
            name: 'superset-ui',
            namespace: 'superset-smoke',
            host: 'superset.smoke.test',
            database: {
              host: 'superset-db-rw',
              database: 'superset-db',
              user: 'superset-db',
              passwordSecret: 'superset-db-app',
              passwordKey: 'password',
            },
            redis: { create: true },
            admin: { existingSecret: 'superset-smoke-admin' },
            replicas: 1,
          }),
        ],
      }),
    secrets: [
      {
        name: 'superset-smoke-admin',
        literal: { secretKey: 'smoke-only-superset-secret-key' },
      },
    ],
    ready: { kind: 'Deployment', name: 'superset' },
    // No probes in the rendered Deployment; apache/superset answers / on
    // 8088 (Service maps 80 → 8088) once gunicorn is listening.
    healthz: { port: 8088, path: '/' },
  },

  wireguard: {
    package: '@r8s/wireguard',
    namespace: 'wireguard-smoke',
    // passwordSecret (key `password`) is the pre-created-Secret prop; the
    // package wires it as wg-easy PASSWORD_HASH, i.e. a bcrypt hash —
    // the literal below is a real hash of the throwaway value
    // 'smoke-only-password' (htpasswd -bnBC 10), never a real credential.
    // NET_ADMIN + SYS_MODULE caps (privileged-pod contract) are the kind -
    // tolerated case. Contract-notes vs. expectation: the package renders
    // NO LoadBalancer service — ClusterIP by default, NodePort only with
    // the `nodePort` opt-in (nothing sits Pending on kind); no host prop →
    // no Ingress; the app image is `:latest` (package default, not pinned).
    render: (jsx) =>
      jsx(WireGuard, {
        name: 'wireguard',
        namespace: 'wireguard-smoke',
        storage: '1Gi',
        passwordSecret: 'wireguard-smoke-password',
      }),
    secrets: [
      {
        name: 'wireguard-smoke-password',
        literal: {
          password: '$2y$10$FWqhvS3f8l5ogPWcMFFhaeC.4MoiIT44JaX0eUYjy1AsrH0SV57lu',
        },
      },
    ],
    ready: { kind: 'Deployment', name: 'wireguard' },
    // No probes in the rendered Deployment; the wg-easy web UI answers /
    // on 51821 (login page) once the wg0 + iptables setup succeeded.
    healthz: { port: 51821, path: '/' },
  },
}

// --- kubectl helpers ---------------------------------------------------------

interface ExecResult {
  code: number
  stdout: string
  stderr: string
}

function kubectl(
  args: string[],
  opts: { input?: string; timeoutMs?: number } = {}
): Promise<ExecResult> {
  // Safety belt: EVERY invocation carries the hard-coded context.
  const withContext = ['--context', KUBE_CONTEXT, ...args]
  return new Promise((resolve) => {
    execFile(
      'kubectl',
      withContext,
      { timeout: opts.timeoutMs ?? 30_000, maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout, stderr) => {
        if (!err) {
          resolve({ code: 0, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') })
          return
        }
        const code =
          typeof (err as { code?: unknown }).code === 'number' ? (err as { code: number }).code : 1
        const stderrText = String(stderr ?? '')
        resolve({
          code,
          stdout: String(stdout ?? ''),
          stderr: err.killed ? `kubectl timed out: ${stderrText || args.join(' ')}` : stderrText,
        })
      }
    ).stdin?.end(opts.input ?? '')
  })
}

/** Run a non-kubectl command (kind revive step); same result shape. */
function run(cmd: string, args: string[]): Promise<ExecResult> {
  return new Promise((resolve) => {
    execFile(
      cmd,
      args,
      { timeout: 30_000, maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' },
      (err, stdout, stderr) => {
        const code =
          typeof (err as { code?: unknown }).code === 'number' ? (err as { code: number }).code : 1
        resolve({
          code: err ? code : 0,
          stdout: String(stdout ?? ''),
          // ENOENT etc. arrive with empty stderr — err.message is the detail.
          stderr: String(stderr ?? '') || String(err?.message ?? ''),
        })
      }
    )
  })
}

/**
 * Preflight: the kind-r8s-local context must be usable — both present in the
 * merged kubeconfig AND answered by the API server. A colima/Docker VM
 * restart drops the kind context from the merge, so a failed `get nodes`
 * triggers the canonical revive (`kind export kubeconfig`) once before the
 * script gives up.
 */
async function preflightCluster(): Promise<void> {
  let res = await kubectl(['get', 'nodes'])
  if (res.code === 0) return

  log(
    `context "${KUBE_CONTEXT}" unreachable (${firstLine(res.stderr)}) — ` +
      `reviving with: kind export kubeconfig --name ${KIND_CLUSTER}`
  )
  const revive = await run('kind', ['export', 'kubeconfig', '--name', KIND_CLUSTER])
  if (revive.code !== 0) {
    throw new Error(
      `kind export kubeconfig --name ${KIND_CLUSTER} failed — ${firstLine(revive.stderr)}`
    )
  }
  log(`kubeconfig revived; context "${KUBE_CONTEXT}" present`)

  res = await kubectl(['get', 'nodes'])
  if (res.code !== 0) {
    throw new Error(
      `cluster "${KUBE_CONTEXT}" still unreachable after reviving the kubeconfig — ` +
        `${firstLine(res.stderr)}`
    )
  }
}

async function resetNamespace(ns: string): Promise<void> {
  const get = await kubectl(['get', 'namespace', ns, '-o', 'name'])
  if (get.code !== 0) return // doesn't exist — fresh start
  const del = await kubectl(['delete', 'namespace', ns, '--wait=true', '--timeout=60s'], {
    timeoutMs: 70_000,
  })
  if (del.code === 0) return
  const stillThere = await kubectl(['get', 'namespace', ns, '-o', 'name'])
  if (stillThere.code === 0) {
    throw new Error(
      `leftover namespace ${ns} could not be retired within 60s (finalizer stuck?) — ` +
        `inspect with: kubectl --context ${KUBE_CONTEXT} get ns ${ns}`
    )
  }
}

async function createNamespace(ns: string): Promise<void> {
  const res = await kubectl(['create', 'namespace', ns])
  if (res.code !== 0) {
    throw new Error(`kubectl create namespace ${ns} failed — ${firstLine(res.stderr)}`)
  }
}

async function preCreateSecrets(ns: string, secrets: SecretSpec[]): Promise<void> {
  for (const secret of secrets) {
    const args = ['create', 'secret', 'generic', secret.name, '-n', ns]
    for (const [key, value] of Object.entries(secret.literal)) {
      args.push('--from-literal', `${key}=${value}`)
    }
    const res = await kubectl(args)
    if (res.code !== 0) {
      throw new Error(
        `secret ${secret.name}: kubectl create secret failed — ${firstLine(res.stderr)}`
      )
    }
  }
}

/** Apply rendered resources as a v1/List over stdin (no temp files). */
async function applyResources(ns: string, resources: KubernetesResource[]): Promise<void> {
  const list = { apiVersion: 'v1', kind: 'List', items: resources }
  const res = await kubectl(['apply', '-n', ns, '-f', '-'], {
    input: JSON.stringify(list),
    timeoutMs: 120_000,
  })
  if (res.code !== 0) {
    throw new Error(`kubectl apply failed — ${firstLine(res.stderr)}`)
  }
}

async function teardownNamespace(ns: string): Promise<void> {
  if (process.env.R8S_SMOKE_KEEP_NAMESPACES === '1') {
    log(`(kept — R8S_SMOKE_KEEP_NAMESPACES=1) namespace ${ns} left in place`)
    return
  }
  // --wait=false: images stay cached on the node; the API retires the ns in
  // the background while the next package runs.
  const res = await kubectl(['delete', 'namespace', ns, '--wait=false'], { timeoutMs: 15_000 })
  if (res.code === 0) return
  // kubectl exits 1 for both "already gone" (nothing to do) and real
  // API/RBAC failures — confirm presence before warning.
  const stillThere = await kubectl(['get', 'namespace', ns, '-o', 'name'])
  if (stillThere.code === 0) {
    log(`warn: teardown of ${ns} did not complete (exit ${res.code}): ${firstLine(res.stderr)}`)
  }
}

// --- readiness polling -------------------------------------------------------

async function pollReadiness(
  ns: string,
  ready: ReadySpec
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const resource = ready.kind === 'Deployment' ? 'deploy' : 'statefulset'
  const deadline = Date.now() + READY_TIMEOUT_MS
  let lastReady = '0'
  let replicas = '1'

  for (;;) {
    const res = await kubectl([
      '-n',
      ns,
      'get',
      `${resource}/${ready.name}`,
      '-o',
      'jsonpath={.status.readyReplicas}',
    ])
    if (res.code !== 0) {
      if (/NotFound|not found/i.test(res.stderr)) {
        // Hard, immediate failure: `kubectl apply` just succeeded, so an
        // absent object means the ready target itself is wrong — waiting
        // would only burn the timeout. Never fabricate replica counts for
        // a workload that does not exist.
        return {
          ok: false,
          detail: `workload ${ready.kind}/${ready.name} not found in namespace ${ns}`,
        }
      }
      return {
        ok: false,
        detail: `kubectl get ${resource}/${ready.name} failed — ${firstLine(res.stderr)}`,
      }
    }
    lastReady = res.stdout.trim() || '0'

    const spec = await kubectl([
      '-n',
      ns,
      'get',
      `${resource}/${ready.name}`,
      '-o',
      'jsonpath={.spec.replicas}',
    ])
    if (spec.code === 0 && spec.stdout.trim() !== '') replicas = spec.stdout.trim()

    if (lastReady !== '0' && lastReady === replicas) return { ok: true }

    if (Date.now() > deadline) {
      return { ok: false, detail: await readyTimeoutDiagnostics(ns, ready, replicas) }
    }
    await sleep(READY_POLL_MS)
  }
}

/** Bounded diagnostic blob for a readiness timeout (pod table + events). */
async function readyTimeoutDiagnostics(
  ns: string,
  ready: ReadySpec,
  replicas: string
): Promise<string> {
  const parts: string[] = [`${ready.kind} ${ready.name}: readyReplicas=${replicas} after 5m`]
  const pods = await kubectl(['-n', ns, 'get', 'pods', '-o', 'wide'])
  if (pods.code === 0 && pods.stdout.trim()) {
    parts.push(pods.stdout.trim().split('\n').slice(0, 8).join('\n'))
  }
  const events = await kubectl(['-n', ns, 'get', 'events', '--sort-by=.lastTimestamp'])
  if (events.code === 0 && events.stdout.trim()) {
    const lines = events.stdout.trim().split('\n')
    parts.push('recent events:\n' + lines.slice(-12).join('\n'))
  }
  return truncate(parts.join('\n'), 2000)
}

// --- healthz probe (port-forward + HTTP GET) ---------------------------------

/**
 * Health probe with retry-with-reconnect: each attempt re-resolves the pod
 * (a rollout may have replaced it), spawns a fresh `kubectl port-forward`,
 * polls the HTTP path for its own window, then backs off ~30s before the
 * next attempt — a dead tunnel is re-established, not waited out.
 */
async function probeHealthz(
  ns: string,
  appName: string,
  healthz: HealthzSpec
): Promise<{ ok: boolean; detail: string }> {
  const localPort = PORT_FORWARD_LOCAL_OFFSET + healthz.port
  // HTTP GET via fetch (read-only, no curl subprocess churn); same wired
  // behavior as `kubectl port-forward ... & curl localhost:<port><path>`.
  const url = `http://127.0.0.1:${localPort}${healthz.path}`
  let lastDetail = 'no attempt completed'

  for (let attempt = 1; attempt <= HEALTHZ_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      log(
        `    healthz: attempt ${attempt}/${HEALTHZ_ATTEMPTS} ` +
          `in ${HEALTHZ_RETRY_DELAY_MS / 1000}s (last: ${lastDetail})`
      )
      await sleep(HEALTHZ_RETRY_DELAY_MS)
    }

    const podRes = await kubectl([
      '-n',
      ns,
      'get',
      'pods',
      `--selector=app=${appName}`,
      '-o',
      'jsonpath={.items[0].metadata.name}',
    ])
    if (podRes.code !== 0 || !podRes.stdout.trim()) {
      lastDetail = 'no pod found for app=' + appName
      continue
    }
    const pod = podRes.stdout.trim()

    const pf = spawn(
      'kubectl',
      [
        '--context',
        KUBE_CONTEXT,
        '-n',
        ns,
        'port-forward',
        `pod/${pod}`,
        `${localPort}:${healthz.port}`,
      ],
      { stdio: 'ignore' }
    )
    liveProcesses.add(pf)
    try {
      const deadline = Date.now() + HEALTHZ_ATTEMPT_TIMEOUT_MS
      while (Date.now() < deadline) {
        if (pf.exitCode !== null) {
          // Tunnel died mid-window — reconnect on the next attempt instead
          // of burning the rest of the window on a dead socket.
          lastDetail = `port-forward exited (${pf.exitCode})`
          break
        }
        try {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort(), 5000)
          const res = await fetch(url, { signal: controller.signal })
          clearTimeout(timer)
          if (res.ok) {
            return {
              ok: true,
              detail: `2xx via ${url}${attempt > 1 ? ` (attempt ${attempt}/${HEALTHZ_ATTEMPTS})` : ''}`,
            }
          }
          lastDetail = `HTTP ${res.status}`
        } catch {
          lastDetail = 'connection refused'
        }
        await sleep(HEALTHZ_POLL_MS)
      }
    } finally {
      liveProcesses.delete(pf)
      pf.kill('SIGTERM')
      // port-forward children occasionally outlive SIGTERM — sweep up below.
      setTimeout(() => {
        if (pf.exitCode === null) pf.kill('SIGKILL')
      }, 2000)
    }
  }

  return {
    ok: false,
    detail: `${url} never returned 2xx across ${HEALTHZ_ATTEMPTS} attempts (last: ${lastDetail})`,
  }
}

// --- esbuild bundled child ---------------------------------------------------

/**
 * Bundle a tiny child module that imports THIS file and renders a spec from
 * PER_PACKAGE with @r8s/* aliased to packages/<pkg>/src. format 'cjs' writes a
 * real file on disk, so the only runtime external ('esbuild', kept for the
 * parent CLI half that is bundled along) still resolves through repo
 * node_modules. The banner stamps the child-mode env var BEFORE module
 * evaluation, so the CLI main() guard at the bottom of this file trips.
 */
async function buildBundle(): Promise<string> {
  const esbuild = await import('esbuild')
  const outDir = path.join(ROOT, `.tmp-local-smoke-${process.pid}`)
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'bundle.cjs')

  try {
    await esbuild.build({
      stdin: {
        contents: [
          `const { PER_PACKAGE } = require(${JSON.stringify(THIS_FILE)})`,
          `const { render, jsx } = require('@r8s/core')`,
          `function renderOne(name) {`,
          `  const spec = PER_PACKAGE[name]`,
          `  if (!spec) throw new Error('unknown smoke package: ' + name)`,
          `  return render(spec.render(jsx))`,
          `}`,
          `module.exports = { renderOne }`,
        ].join('\n'),
        loader: 'ts',
        resolveDir: path.dirname(THIS_FILE),
      },
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'es2022',
      write: true,
      outfile: outFile,
      external: ['esbuild'],
      banner: {
        // Must run before module evaluation: the child-mode guard in this file
        // checks the env var, and this file's own path can't come from
        // import.meta inside the cjs bundle (shimmed to {} — .url undefined).
        js:
          `process.env.R8S_LOCAL_SMOKE_CHILD = '1';` +
          `process.env.R8S_LOCAL_SMOKE_SELF = ${JSON.stringify(THIS_FILE)};`,
      },
      alias: buildAliasMap(),
      nodePaths: [path.join(ROOT, 'node_modules')],
      logLevel: 'silent',
    })
  } catch (err) {
    // Don't leak the temp dir when bundling rejects.
    fs.rmSync(outDir, { recursive: true, force: true })
    throw err
  }
  return outFile
}

interface ChildRenderResult {
  resources: KubernetesResource[]
  operators: Array<{ name: string }>
}

/**
 * Render a package through the bundled child (SOURCE-resolved), with the
 * same code path the CLI uses. Exported so offline render checks (typecheck
 * fixtures, CI dry-runs) can exercise the pipeline without a cluster.
 */
export async function renderPackage(name: string): Promise<ChildRenderResult> {
  const bundle = await buildBundle()
  try {
    const child = (await import(bundle)) as unknown as {
      renderOne(name: string): ChildRenderResult
    }
    return child.renderOne(name)
  } finally {
    fs.rmSync(path.dirname(bundle), { recursive: true, force: true })
  }
}

// --- disk guard --------------------------------------------------------------

/**
 * Free space of the volume ROOT lives on. APFS: bavail fluctuates with
 * purgeable space — treat this as a soft guard; the real ceiling for image
 * pulls is the Docker-driver VM's sparse disk.
 */
function freeBytes(): number {
  const stat = fs.statfsSync(ROOT)
  return stat.bsize * stat.bavail
}

function fmtBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`
  return `${Math.round(bytes / (1024 * 1024))} MiB`
}

// --- CLI ---------------------------------------------------------------------

const liveProcesses = new Set<ChildProcess>()

function log(line: string): void {
  process.stdout.write(line + '\n')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function firstLine(text: string): string {
  const line = text.trim().split('\n')[0]
  return line ?? ''
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1) + '…'
}

function pad(value: string, width: number): string {
  return value.length >= width ? value : value + ' '.repeat(width - value.length)
}

async function smokeOne(name: string, spec: SmokeSpec): Promise<Outcome> {
  const ns = spec.namespace
  const outcome: Outcome = { status: 'fail', rendered: '-', ready: '-', healthz: '-', notes: '' }
  const started = Date.now()
  try {
    await resetNamespace(ns)
    await createNamespace(ns)

    const { resources, operators } = await renderPackage(name)
    const operatorCount = operators.length
    outcome.rendered = `${resources.length} resources${
      operatorCount > 0 ? ` (+${operatorCount} operator decl)` : ''
    }`
    if (resources.length === 0) {
      outcome.notes = 'render produced 0 resources — nothing to apply'
      return outcome
    }

    // Drift guard: PER_PACKAGE render props carry namespace literals of
    // their own; a copy-paste drift would apply resources to one namespace
    // while this script polls (and tears down) another. Namespace objects
    // (metadata.name only) are exempt.
    const drifted = resources.filter(
      (r) => (r as { kind?: string }).kind !== 'Namespace' && (r.metadata?.namespace ?? ns) !== ns
    )
    if (drifted.length > 0) {
      outcome.notes = `namespace drift — ${drifted
        .map((r) => `${r.kind}/${r.metadata?.name ?? r.kind} → ${r.metadata?.namespace}`)
        .join(', ')} (expected ${ns})`
      return outcome
    }

    await preCreateSecrets(ns, spec.secrets)
    await applyResources(ns, resources)

    const readiness = await pollReadiness(ns, spec.ready)
    if (!readiness.ok) {
      outcome.ready = 'timeout'
      outcome.notes = truncate(readiness.detail, 300)
      return outcome
    }
    outcome.ready = 'ok'

    if (spec.healthz) {
      const health = await probeHealthz(ns, spec.ready.name, spec.healthz)
      if (health.ok) {
        outcome.healthz = '2xx'
      } else {
        outcome.healthz = 'fail'
        outcome.notes = truncate(health.detail, 300)
        return outcome
      }
    } else {
      outcome.healthz = 'N/A'
    }

    outcome.status = 'pass'
    outcome.notes = `${((Date.now() - started) / 1000).toFixed(0)}s`
    return outcome
  } catch (err) {
    outcome.notes = truncate(err instanceof Error ? err.message : String(err), 300)
    return outcome
  } finally {
    await teardownNamespace(ns)
  }
}

function renderTable(rows: Array<{ name: string; outcome: Outcome }>): void {
  const cols = { pkg: 10, rendered: 32, ready: 9, healthz: 8, notes: 46 }
  log('')
  log(
    pad('PACKAGE', cols.pkg) +
      pad('RENDERED', cols.rendered) +
      pad('READY', cols.ready) +
      pad('HEALTHZ', cols.healthz) +
      'NOTES'
  )
  for (const { name, outcome } of rows) {
    const badge =
      outcome.status === 'pass' ? 'PASS' : outcome.status === 'skip' ? 'SKIPPED' : 'FAIL'
    log(
      pad(name, cols.pkg) +
        pad(outcome.rendered, cols.rendered) +
        pad(outcome.ready, cols.ready) +
        pad(outcome.healthz, cols.healthz) +
        `[${badge}] ${outcome.notes}`
    )
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  if (argv.length === 0) {
    process.stderr.write(
      `Usage: npx tsx scripts/local-smoke.ts <package...> | --all-light\n` +
        `Known packages: ${Object.keys(PER_PACKAGE).join(', ')}\n`
    )
    process.exitCode = 2
    return
  }
  const names = argv.filter((a) => a !== '--all-light')
  const wanted = names.length > 0 ? names : ALL_LIGHT
  const unknown = wanted.filter((name) => !PER_PACKAGE[name])
  if (unknown.length > 0) {
    process.stderr.write(
      `unknown package(s): ${unknown.join(', ')}. Known: ${Object.keys(PER_PACKAGE).join(', ')}\n`
    )
    process.exitCode = 2
    return
  }

  log(`local-smoke: context=${KUBE_CONTEXT} packages=${wanted.join(', ')}`)
  try {
    await preflightCluster()
  } catch (err) {
    process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
    process.exitCode = 2
    return
  }

  const initialFree = freeBytes()
  log(
    `free disk: ${fmtBytes(initialFree)}` +
      (initialFree < DISK_WARN_BYTES
        ? '  (below the 2.5 GiB advisory — pulls may fail or wedges)'
        : '')
  )

  const rows: Array<{ name: string; outcome: Outcome }> = []
  let failures = 0
  let skips = 0
  for (const name of wanted) {
    const spec = PER_PACKAGE[name]

    const free = freeBytes()
    if (free < MIN_FREE_BYTES) {
      rows.push({
        name,
        outcome: {
          status: 'skip',
          rendered: '-',
          ready: '-',
          healthz: '-',
          notes: `aborted before start: only ${fmtBytes(free)} free (< ${fmtBytes(MIN_FREE_BYTES)})`,
        },
      })
      skips++
      log(`--- ${name}: SKIPPED (disk)`)
      continue
    }

    if (spec.skipReason) {
      rows.push({
        name,
        outcome: {
          status: 'skip',
          rendered: '-',
          ready: '-',
          healthz: '-',
          notes: spec.skipReason,
        },
      })
      skips++
      log(`--- ${name}: SKIPPED (${spec.skipReason})`)
      continue
    }

    log(`\n=== ${name} → ${spec.namespace} ===`)
    const outcome = await smokeOne(name, spec)
    rows.push({ name, outcome })
    if (outcome.status === 'fail') {
      failures++
      log(`--- ${name}: FAIL — ${outcome.notes}`)
    } else {
      log(`--- ${name}: PASS (${outcome.notes})`)
    }
  }

  renderTable(rows)
  log(`\nfree disk at end: ${fmtBytes(freeBytes())}`)
  if (failures > 0) process.exitCode = 1
  log(`verdict: ${wanted.length - failures - skips} passed / ${skips} skipped / ${failures} failed`)
}

// Child-mode guard: the esbuild bundle re-evaluates this module file. The
// bundle banner sets the env var before module evaluation, so the CLI boots
// only in the genuine parent run.
if (process.env.R8S_LOCAL_SMOKE_CHILD !== '1') {
  const shutdown = (signal: string): void => {
    for (const child of liveProcesses) child.kill('SIGTERM')
    process.stderr.write(`\n${signal} received — killed in-flight port-forwards\n`)
    process.exit(130)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  main().catch((err) => {
    process.stderr.write(`fatal: ${err instanceof Error ? err.message : String(err)}\n`)
    process.exitCode = 1
  })
}
