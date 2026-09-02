import { jsx, declareOperator, useContext } from '@r8s/core'
import { Deployment, Service, EnvVar } from '@r8s/k8s-types'
import { OperatorContext, DatabaseContext } from '@r8s/core/defaults'
import { vaultSecretsOperator } from './operators'

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
    namespace = 'default',
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
  } = props

  const buildProbe = (spec: ProbeSpec | null | undefined, fallbackPath: string) => {
    if (spec === null) return undefined
    if (!spec)
      return { httpGet: { path: fallbackPath, port }, initialDelaySeconds: 10, periodSeconds: 10 }
    const initialDelaySeconds = spec.initialDelaySeconds ?? 10
    const periodSeconds = spec.periodSeconds ?? 10
    if (spec.tcp) {
      return { tcpSocket: { port: spec.port ?? port }, initialDelaySeconds, periodSeconds }
    }
    return {
      httpGet: { path: spec.path ?? fallbackPath, port: spec.port ?? port },
      initialDelaySeconds,
      periodSeconds,
      ...(spec.failureThreshold && { failureThreshold: spec.failureThreshold }),
    }
  }

  const livenessProbe = buildProbe(probes?.liveness, '/health')
  const readinessProbe = buildProbe(probes?.readiness, '/ready')

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
  for (const [envName, ref] of Object.entries(vault)) {
    const secretName = `${name}-${envName.toLowerCase().replace(/_/g, '-')}-vault`

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
          destination: {
            create: true,
            name: secretName,
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
    const hasVSO = sharedOperators.some((op) => op.name === 'vault-secrets-operator')
    if (!hasVSO) {
      vaultResources.push(declareOperator(vaultSecretsOperator()))
    }
  }

  const deployment: Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name, namespace, labels: { app: name } },
    spec: {
      replicas,
      selector: { matchLabels: { app: name } },
      template: {
        metadata: { labels: { app: name } },
        spec: {
          ...(podSecurityContext && { securityContext: podSecurityContext }),
          containers: [
            {
              name: 'app',
              image,
              imagePullPolicy: 'Always',
              ...(command && { command }),
              ...(args && { args }),
              ports: [{ containerPort: port }],
              env: envVars,
              ...(resources && { resources }),
              ...(securityContext && { securityContext }),
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
      // migration to explicit servicePort
      ports: [
        { port, targetPort: port },
        // eslint-disable-next-line -- 80 alias for legacy servicePort=80 consumers
        ...(port !== 80 ? [{ port: 80, targetPort: port }] : []),
      ],
    },
  }

  return [...vaultResources, jsx('Deployment', deployment), jsx('Service', service)]
}
