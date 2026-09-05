import { jsx, declareOperator, useContext } from '@r8s/core'
import { Deployment, Service, EnvVar } from '@r8s/k8s-types'
import { OperatorContext, DatabaseContext, SecretContext, useNamespace } from '@r8s/core/defaults'
import { declareIfMissing } from '@r8s/operator-vault-secrets'

export interface SecretRef {
  /** Name of the Kubernetes Secret containing this value */
  secret: string
  /** Key within the secret (defaults to env var name) */
  key?: string
}

export interface VaultSecretRef {
  /** Vault KV mount path */
  mount: string
  /** Secret path in Vault */
  path: string
  /** Key within the Vault secret (defaults to env var name) */
  key?: string
  /** VaultAuth reference name (defaults to 'default') */
  vaultAuthRef?: string
  /** Re-sync interval (e.g. '3600s'). Defaults to the Platform secrets refreshAfter. */
  refreshAfter?: string
  /** Workloads restarted on rotation (rendered as rolloutRestartTargets) */
  rolloutRestartTargets?: { kind?: string; name: string; apiVersion?: string }[]
  /**
   * Destination key → template text, rendered under
   * `destination.transformation.templates`. Use to remap vault key names
   * (e.g. snake_case `encryption_key` → `N8N_ENCRYPTION_KEY`).
   */
  templates?: Record<string, string>
}

export interface ProbeSpec {
  /** HTTP path for httpGet probes */
  path?: string
  /** TCP probe when path is omitted */
  tcp?: boolean
  /** Port for the probe (defaults to the container port) */
  port?: number
  /** Seconds after container start before probing (default: 10) */
  initialDelaySeconds?: number
  /** Seconds between probes (default: 10) */
  periodSeconds?: number
  /** Consecutive failures before giving up (default: 3) */
  failureThreshold?: number
}

export interface WebServiceProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image (e.g., 'myapp/api:v1.2.3') */
  image: string
  /** Container port the app listens on (defaults to 3000) */
  port?: number
  /** Number of pod replicas (defaults to 2) */
  replicas?: number
  /**
   * Probe overrides. Default probes are httpGet /health (liveness) and
   * /ready (readiness) on the container port. Override when the app
   * exposes different endpoints (e.g. { liveness: { path: '/healthz' },
   * readiness: { tcp: true } }). Set both to null to disable.
   */
  probes?: {
    liveness?: ProbeSpec | null
    readiness?: ProbeSpec | null
    /** Startup probe — for slow-booting apps (e.g. migrations, document servers) */
    startup?: ProbeSpec | null
  }
  /** Plain environment variables (non-sensitive) */
  env?: Record<string, string>
  /** Secrets from Kubernetes Secrets — safe by default */
  secrets?: Record<string, SecretRef | string>
  /** Secrets from Vault — creates VaultStaticSecret objects */
  vault?: Record<string, VaultSecretRef>
  /** Container command override (e.g. a worker entrypoint). Defaults to the image's entrypoint */
  command?: string[]
  /** Container args appended to the command */
  args?: string[]
  /** Raw env vars for advanced use cases */
  rawEnv?: EnvVar[]
  /** CPU and memory requests/limits for the app container */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** Container securityContext (runAsNonRoot, capabilities, …) */
  securityContext?: Record<string, unknown>
  /** Pod-level securityContext */
  podSecurityContext?: Record<string, unknown>
  /**
   * Pod tolerations (e.g. faster eviction on node failure:
   * { key: 'node.kubernetes.io/unreachable', effect: 'NoExecute', tolerationSeconds: 60 })
   */
  tolerations?: Record<string, unknown>[]
  /** Pod topologySpreadConstraints (spread replicas across nodes) */
  topologySpreadConstraints?: Record<string, unknown>[]
  /**
   * Deployment update strategy ('Recreate' for RWO-volume/migration apps).
   * Default: 'Recreate' when the pod mounts a PVC volume and replicas=1
   * (RollingUpdate would deadlock on the single-attach volume).
   */
  strategy?:
    | 'Recreate'
    | 'RollingUpdate'
    | {
        type: string
        rollingUpdate?: { maxUnavailable?: string | number; maxSurge?: string | number }
      }
  /** Pod volumes — combine with volumeMounts (e.g. PVCs, emptyDirs, ConfigMaps) */
  volumes?: ({ name: string } & Record<string, unknown>)[]
  /** Volume mounts for the app container */
  volumeMounts?: { name: string; mountPath: string; readOnly?: boolean; subPath?: string }[]
  /**
   * Init containers run before the app starts (chown, schema setup, font
   * installation, …). Pass-through shape: name/image required, the rest
   * follows the Kubernetes container spec.
   */
  initContainers?: ({ name: string; image: string } & Record<string, unknown>)[]
  /** Container lifecycle hooks (e.g. { preStop: { exec: { command: [...] } } }) */
  lifecycle?: Record<string, unknown>
  /**
   * Image pull policy. Default depends on the tag: floating tags
   * (latest/main/master/dev/edge/head/nightly/canary) get 'Always', pinned
   * tags and digests get 'IfNotPresent' (immutable — pointless to re-pull).
   */
  imagePullPolicy?: 'Always' | 'IfNotPresent' | 'Never'
  /** Names of Secrets used to pull private registry images */
  imagePullSecrets?: string[]
}

/**
 * Simple web service (backend or frontend).
 *
 * @title Web Service
 * @category Workloads
 *
 * Creates a Deployment + Service with health checks.
 *
 * @example
 * import { WebService } from '@r8s/recipes'
 *
 * export default <WebService name="api" image="myapp/api:v1" port={3000} env={{ LOG_LEVEL: 'info' }} />
 *
 * @example
 * import { WebService } from '@r8s/recipes'
 *
 * export default (
 *   <WebService
 *     name="api"
 *     image="myapp/api:v1"
 *     env={{ LOG_LEVEL: 'info' }}
 *     secrets={{ DATABASE_URL: 'app-secrets', API_KEY: 'app-secrets' }}
 *   />
 * )
 *
 * @example
 * import { WebService } from '@r8s/recipes'
 *
 * export default (
 *   <WebService
 *     name="api"
 *     image="myapp/api:v1"
 *     env={{ LOG_LEVEL: 'info' }}
 *     vault={{ DATABASE_URL: { mount: 'kv', path: 'db/credentials' } }}
 *   />
 * )
 */
export function WebService(props: WebServiceProps) {
  const {
    name,
    namespace: namespaceProp,
    image,
    port = 3000,
    replicas = 2,
    probes,
    env = {},
    secrets = {},
    vault = {},
    command,
    args,
    rawEnv = [],
    resources,
    securityContext,
    podSecurityContext,
    tolerations,
    topologySpreadConstraints,
    strategy,
    volumes,
    volumeMounts,
    initContainers,
    lifecycle,
    imagePullPolicy,
    imagePullSecrets,
  } = props

  const buildProbe = (spec: ProbeSpec | null | undefined, fallbackPath: string) => {
    if (spec === null) return undefined
    if (!spec)
      return { httpGet: { path: fallbackPath, port }, initialDelaySeconds: 10, periodSeconds: 10 }
    const initialDelaySeconds = spec.initialDelaySeconds ?? 10
    const periodSeconds = spec.periodSeconds ?? 10
    if (spec.tcp) {
      return {
        tcpSocket: { port: spec.port ?? port },
        initialDelaySeconds,
        periodSeconds,
        // !== undefined (not truthy): an explicit 0 must surface as-is so
        // Kubernetes validation fails loudly instead of silently reverting
        // to the default
        ...(spec.failureThreshold !== undefined && { failureThreshold: spec.failureThreshold }),
      }
    }
    return {
      httpGet: { path: spec.path ?? fallbackPath, port: spec.port ?? port },
      initialDelaySeconds,
      periodSeconds,
      ...(spec.failureThreshold !== undefined && { failureThreshold: spec.failureThreshold }),
    }
  }

  const livenessProbe = buildProbe(probes?.liveness, '/health')
  const readinessProbe = buildProbe(probes?.readiness, '/ready')
  const startupProbe = buildProbe(probes?.startup ?? null, '/health')

  // --- Safe defaults derived from the image and storage shape -------------
  // imagePullPolicy: a floating tag must be re-pulled (Always); a pinned tag
  // (or digest) is immutable, so IfNotPresent avoids pointless pulls and
  // makes deploys robust when a registry is slow/unreachable. Explicit prop
  // always wins. Floating set covers the conventional mutables.
  const imageLeaf = image.slice(image.lastIndexOf('/') + 1)
  const imageTag = imageLeaf.includes('@')
    ? imageLeaf.slice(imageLeaf.indexOf('@') + 1)
    : imageLeaf.includes(':')
      ? imageLeaf.slice(imageLeaf.indexOf(':') + 1)
      : 'latest'
  const FLOATING_TAGS = new Set([
    'latest',
    'main',
    'master',
    'dev',
    'edge',
    'head',
    'nightly',
    'canary',
  ])
  const pullPolicy =
    imagePullPolicy ??
    (!imageLeaf.includes('@') && FLOATING_TAGS.has(imageTag.toLowerCase())
      ? 'Always'
      : 'IfNotPresent')

  // strategy: RollingUpdate + a ReadWriteOnce PVC + replicas=1 deadlocks
  // (the new pod cannot attach the volume until the old releases it), and
  // in-place DB-migration apps (n8n, outline) must not run two versions at
  // once. Recreate is always safe at replicas=1 — there is already no HA.
  const hasPvcVolume = (volumes ?? []).some((v) => 'persistentVolumeClaim' in v)
  const derivedStrategy =
    strategy ?? (hasPvcVolume && replicas === 1 ? ('Recreate' as const) : undefined)

  const envVars: EnvVar[] = []
  const vaultResources: ReturnType<typeof jsx>[] = []

  // Secrets from Kubernetes Secrets — pushed before plain env vars so
  // Kubernetes dependent-variable expansion lets env values reference
  // secret-backed vars via $(VAR).
  for (const [envName, ref] of Object.entries(secrets)) {
    if (typeof ref === 'string') {
      // Simple string: secret name, key = env name
      envVars.push({
        name: envName,
        valueFrom: { secretKeyRef: { name: ref, key: envName } },
      })
    } else {
      // Object with explicit secret/key
      envVars.push({
        name: envName,
        valueFrom: { secretKeyRef: { name: ref.secret, key: ref.key || envName } },
      })
    }
  }

  // Plain env vars
  for (const [key, value] of Object.entries(env)) {
    envVars.push({ name: key, value })
  }

  // Vault secrets — create VaultStaticSecret objects
  const namespace = useNamespace(namespaceProp)
  const platformSecrets = useContext(SecretContext)
  for (const [envName, ref] of Object.entries(vault)) {
    const secretName = `${name}-${envName.toLowerCase().replace(/_/g, '-')}-vault`
    const refreshAfter = ref.refreshAfter ?? platformSecrets?.refreshAfter
    const targets = ref.rolloutRestartTargets?.map((t) => ({
      apiVersion: t.apiVersion ?? 'apps/v1',
      kind: t.kind ?? 'Deployment',
      name: t.name,
    }))

    // Create VaultStaticSecret
    vaultResources.push(
      jsx('VaultStaticSecret', {
        apiVersion: 'secrets.hashicorp.com/v1beta1',
        kind: 'VaultStaticSecret',
        metadata: { name: secretName, namespace },
        spec: {
          vaultAuthRef: ref.vaultAuthRef || 'default',
          mount: ref.mount,
          type: 'kv-v2',
          path: ref.path,
          ...(refreshAfter && { refreshAfter }),
          ...(targets && targets.length > 0 && { rolloutRestartTargets: targets }),
          destination: {
            create: true,
            name: secretName,
            ...(ref.templates &&
              Object.keys(ref.templates).length > 0 && {
                transformation: {
                  templates: Object.fromEntries(
                    Object.entries(ref.templates).map(([k, text]) => [k, { text }])
                  ),
                },
              }),
          },
        },
      })
    )

    // Reference the generated secret
    envVars.push({
      name: envName,
      valueFrom: { secretKeyRef: { name: secretName, key: ref.key || envName } },
    })
  }

  // Raw env vars (advanced)
  envVars.push(...rawEnv)

  // Auto-wire DATABASE_URL from DatabaseContext if available
  const dbContext = useContext(DatabaseContext)
  if (dbContext && !envVars.some((e) => e.name === 'DATABASE_URL')) {
    // Build DATABASE_URL from context fields instead of assuming a 'uri' key exists
    const { host, port, database, username, passwordSecret } = dbContext

    // Set individual PostgreSQL env vars for flexibility
    envVars.push(
      { name: 'PGHOST', value: host },
      { name: 'PGPORT', value: String(port || 5432) },
      { name: 'PGDATABASE', value: database },
      { name: 'PGUSER', value: username },
      {
        name: 'PGPASSWORD',
        valueFrom: {
          secretKeyRef: {
            name: passwordSecret.name,
            key: passwordSecret.key || 'password',
          },
        },
      }
    )

    // Set DATABASE_URL as a template referencing the individual vars
    // Kubernetes will expand $(VAR) syntax in env var values
    envVars.push({
      name: 'DATABASE_URL',
      value: `postgresql://$(PGUSER):$(PGPASSWORD)@$(PGHOST):$(PGPORT)/$(PGDATABASE)`,
    })
  }

  // Declare Vault Secrets Operator if vault secrets are used
  if (Object.keys(vault).length > 0) {
    const sharedOperators = useContext(OperatorContext)
    vaultResources.push(...declareIfMissing(sharedOperators))
  }

  const deployment: Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name, namespace, labels: { app: name } },
    spec: {
      replicas,
      ...(derivedStrategy && {
        strategy: typeof derivedStrategy === 'string' ? { type: derivedStrategy } : derivedStrategy,
      }),
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          ...(podSecurityContext && { securityContext: podSecurityContext }),
          ...(tolerations && { tolerations }),
          ...(topologySpreadConstraints && { topologySpreadConstraints }),
          ...(imagePullSecrets &&
            imagePullSecrets.length > 0 && {
              imagePullSecrets: imagePullSecrets.map((name) => ({ name })),
            }),
          ...(initContainers &&
            initContainers.length > 0 && { initContainers: initContainers as never }),
          ...(volumes && volumes.length > 0 && { volumes: volumes as never }),
          containers: [
            {
              name: 'app',
              image,
              imagePullPolicy: pullPolicy,
              ...(command && { command }),
              ...(args && { args }),
              ports: [{ containerPort: port }],
              env: envVars,
              ...(resources && { resources }),
              ...(securityContext && { securityContext }),
              ...(lifecycle && { lifecycle: lifecycle as never }),
              ...(volumeMounts && volumeMounts.length > 0 && { volumeMounts }),
              ...(startupProbe && { startupProbe }),
              ...(livenessProbe && { livenessProbe }),
              ...(readinessProbe && { readinessProbe }),
            },
          ],
        },
      },
    },
  }

  const service: Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: { name, namespace },
    spec: {
      type: 'ClusterIP',
      selector: { app: name },
      // Expose the app port directly (so consumers can reference it) while
      // keeping 80 as a stable backward-compatible alias: existing
      // Endpoints/default servicePort=80 users keep routing during
      // migration to explicit servicePort.
      // Port names are REQUIRED whenever a Service has more than one port —
      // without them the API server rejects the resource (caught by Flux
      // dry-run as "spec.ports[i].name: Required value").
      ports: [
        { name: 'http', port, targetPort: port },
        // eslint-disable-next-line -- 80 alias for legacy servicePort=80 consumers
        ...(port !== 80 ? [{ name: 'http-80', port: 80, targetPort: port }] : []),
      ],
    },
  }

  return [...vaultResources, jsx('Deployment', deployment), jsx('Service', service)]
}
