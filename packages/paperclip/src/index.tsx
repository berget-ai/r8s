import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  StaticSecret,
  canProvisionSecrets,
  secretsRequiredError,
  useOperators,
  type DatabaseProps,
} from '@r8s/recipes'
import type { Operator } from '@r8s/k8s-types'

export interface PaperclipProps {
  /** Resource name / Instance CR name (defaults to 'paperclip') */
  name?: string
  /** Kubernetes namespace (inherited from <Platform> unless set) */
  namespace?: string
  /**
   * App image tag (defaults to 'sso-oidc' — the Berget fork branch build
   * for SSO/OIDC work; a named moving tag, Always-pulled on purpose).
   */
  version?: string
  /** Image repository (defaults to the Berget fork) */
  repository?: string
  /** Public hostname for the web app and API (required) */
  host: string
  /**
   * Manual image pull secrets for the private ghcr image (defaults to
   * ['ghcr-pull-secret'] — a fine-grained PAT read:packages Secret that
   * is deliberately managed OUTSIDE Flux: rotate it by delete+recreate)
   */
  pullSecrets?: string[]
  /**
   * Operator chart version for the paperclip-operator (defaults to
   * '0.19.0'). The operator owns the StatefulSet/PVC/ingress/probes —
   * the Instance CR is the entire app definition.
   */
  operatorVersion?: string
  /**
   * CNPG cluster name holding paperclip's data (defaults to 'paperclip-db').
   * Credentials are CNPG-managed: the Instance references the generated
   * `<db>-app` secret's `fqdn-uri` key (requires CNPG ≥ 1.20).
   */
  dbName?: string
  /** Number of CNPG instances (defaults to 2) */
  dbInstances?: number
  /** CNPG data volume size (defaults to '20Gi') */
  dbStorage?: string
  /** CNPG storage class (defaults to cluster default) */
  dbStorageClass?: string
  /** CNPG backup configuration passed through to the Database recipe (continuous WAL + scheduled base backups to Scaleway in facit) */
  backup?: DatabaseProps['backup']
  /**
   * App-native database backups (sql dumps on the persistence volume).
   * Defaults to facit: enabled, hourly, 7 days retention.
   */
  appBackup?: { enabled?: boolean; intervalMinutes?: number; retentionDays?: number } | false
  /**
   * Operator-managed persistence volume at /paperclip (storage dir
   * /paperclip/storage, native backups /paperclip/backups).
   * Defaults to 10Gi; storageClass optional.
   */
  storage?: { size?: string; storageClass?: string } | false
  /** Heartbeat scheduler (defaults to facit: every 30s) */
  heartbeat?: { enabled?: boolean; intervalMS?: number } | false
  /**
   * LLM access via the Berget gateway. `baseUrl` defaults to
   * https://api.berget.ai/v1. The API key is provisioned through the
   * Platform secrets backend (path `<path>/<name>/berget-ai`, key
   * `api-key`) unless `apiKeySecretName` references a pre-created
   * Secret (key: api-key). Rotation restarts the StatefulSet.
   */
  llm?: { baseUrl?: string; path?: string; refreshAfter?: string }
  /** Reference a pre-created LLM API key Secret (key: api-key) instead of backend provisioning */
  apiKeySecretName?: string
  /**
   * Better Auth secret — session signing. Provisioned through the
   * Platform secrets backend (path `<path>/<name>/app`, key
   * `better-auth-secret`) unless `secretsName` references a pre-created
   * Secret (key: better-auth-secret). Rotation restarts the StatefulSet.
   */
  auth?: { path?: string; refreshAfter?: string; disableSignUp?: boolean }
  /** Reference a pre-created app secrets bundle (key: better-auth-secret) instead of backend provisioning */
  secretsName?: string
  /**
   * Berget model catalog env vars (OPENCODE_CONFIG_CONTENT +
   * PAPERCLIP_ADAPTER_MODELS) wiring Paperclip to the Berget gateway.
   * Defaults to the facit catalog (Kimi K3/K2.6, GLM-5.2/4.7, GPT-OSS
   * 120B, Mistral Medium/Small, Qwen3.8 27B, Gemma 4 31B). Pass `false`
   * to omit both vars.
   */
  modelCatalog?: { opencodeConfig?: string; adapterModels?: string } | false
  /** Extra ingress annotations merged over the facit defaults (body-size 50m, 300s timeouts, ssl-redirect) */
  ingressAnnotations?: Record<string, string>
  /** Additional hostnames accepted by the deployment (defaults to [host]) */
  allowedHostnames?: string[]
  /** Requested resources for the app StatefulSet (defaults to facit: 512Mi/250m → 12Gi/2) */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** TLS secret for ingress (defaults to `${name}-tls` via letsencrypt-prod) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

const DEFAULT_RESOURCES = {
  requests: { memory: '512Mi', cpu: '250m' },
  limits: { memory: '12Gi', cpu: '2' },
}

const DEFAULT_OPENCODE_CONFIG =
  '{"provider":{"berget":{"npm":"@ai-sdk/openai-compatible","name":"Berget","options":{"baseURL":"https://api.berget.ai/v1","apiKey":"{env:OPENAI_API_KEY}"},"models":{"moonshotai/Kimi-K3":{"name":"Kimi K3"},"moonshotai/Kimi-K2.6":{"name":"Kimi K2.6"},"zai-org/GLM-5.2":{"name":"GLM-5.2"},"zai-org/GLM-4.7-FP8":{"name":"GLM-4.7"},"openai/gpt-oss-120b":{"name":"GPT-OSS 120B"},"mistralai/Mistral-Medium-3.5-128B":{"name":"Mistral Medium 3.5"},"mistralai/Mistral-Small-3.2-24B-Instruct-2506":{"name":"Mistral Small"},"Qwen/Qwen3.8-27B-FP8":{"name":"Qwen3.8 27B"},"google/gemma-4-31B-it":{"name":"Gemma 4 31B"}}}}}'

const DEFAULT_ADAPTER_MODELS =
  '{"opencode_local":[{"id":"berget/moonshotai/Kimi-K3","label":"Kimi K3"},{"id":"berget/moonshotai/Kimi-K2.6","label":"Kimi K2.6"},{"id":"berget/zai-org/GLM-5.2","label":"GLM-5.2"},{"id":"berget/zai-org/GLM-4.7-FP8","label":"GLM-4.7"},{"id":"berget/openai/gpt-oss-120b","label":"GPT-OSS 120B"},{"id":"berget/mistralai/Mistral-Medium-3.5-128B","label":"Mistral Medium 3.5"},{"id":"berget/mistralai/Mistral-Small-3.2-24B-Instruct-2506","label":"Mistral Small"},{"id":"berget/Qwen/Qwen3.8-27B-FP8","label":"Qwen3.8 27B"},{"id":"berget/google/gemma-4-31B-it","label":"Gemma 4 31B"}]}'

/**
 * Paperclip — Berget's agent platform (tasks, documents, agent orchestration),
 * facit-aligned on the paperclip-operator.
 *
 * @title Paperclip
 * @category Agent Platforms
 *
 * The operator owns the workload: app instance → StatefulSet with PVC,
 * ingress, probes, security context, heartbeat and app-native backups.
 * This package declares the operator and owns everything AROUND it:
 * - the external CNPG cluster (`credentialsMode: 'cnpg'` — the Instance
 *   references the operator-generated `<db>-app` `fqdn-uri` like facit)
 * - the app secrets (better-auth) + LLM gateway key via the Platform
 *   secrets backend with rotation restart of the StatefulSet
 * - the `paperclip.inc/v1alpha1` `Instance` CR with facit spec
 *
 * The image is private: `pullSecrets` defaults to `['ghcr-pull-secret']`
 * — a fine-grained PAT (read:packages) Secret managed manually outside
 * Flux (rotate by delete+recreate).
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Paperclip } from '@r8s/paperclip'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'paperclip' }}>
 *     <Paperclip host="paperclip.example.com" />
 *   </Platform>
 * )
 */
export function Paperclip(props: PaperclipProps) {
  const {
    name = 'paperclip',
    namespace: namespaceProp,
    version = 'sso-oidc',
    repository = 'ghcr.io/berget-ai/paperclip',
    host,
    pullSecrets = ['ghcr-pull-secret'],
    operatorVersion = '0.19.0',
    dbName = 'paperclip-db',
    dbInstances = 2,
    dbStorage = '20Gi',
    dbStorageClass,
    backup,
    appBackup,
    storage,
    heartbeat,
    llm,
    apiKeySecretName,
    auth,
    secretsName,
    modelCatalog,
    ingressAnnotations = {},
    allowedHostnames,
    resources = DEFAULT_RESOURCES,
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const sharedOperators = useOperators()
  const resources_: ReturnType<typeof jsx>[] = []

  // --- Operator declaration (stateful workload owner) -----------------------
  if (!sharedOperators.some((op) => op.name === 'paperclip-operator')) {
    const paperclipOperator: Operator = {
      name: 'paperclip-operator',
      version: operatorVersion,
      description: 'Paperclip operator — Instance CR → StatefulSet + PVC + ingress',
      source: {
        type: 'helm',
        chart: 'paperclip-operator',
        repository: 'oci://ghcr.io/paperclipinc/charts',
        version: operatorVersion,
        values: {
          operator: {
            resources: {
              limits: { cpu: '500m', memory: '512Mi' },
              requests: { cpu: '100m', memory: '128Mi' },
            },
          },
          metrics: { enabled: true, serviceMonitor: { enabled: false } },
          leaderElection: { enabled: false },
        },
      },
      crds: ['instances.paperclip.inc'],
    }
    resources_.push(declareOperator(paperclipOperator))
  }

  // --- App secrets (better-auth) + LLM key ----------------------------------
  const appSecretsName = secretsName ?? `${name}-secrets`
  const apiKeyName = apiKeySecretName ?? 'berget-api-key'

  if (!secretsName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Paperclip',
        name,
        'a Better Auth secret — it signs every user session',
        {
          propName: 'secretsName',
          exampleValue: `${name}-secrets`,
          keys: ['better-auth-secret'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-secrets`,
        namespace,
        path: auth?.path ?? `${secretProvider.path ?? name}/${name}/app`,
        secretName: appSecretsName,
        refreshAfter: auth?.refreshAfter,
        keys: ['better-auth-secret'],
        // The operator-managed workload is a StatefulSet, not a Deployment
        restart: [{ kind: 'StatefulSet', name }],
      })
    )
  }

  if (!apiKeySecretName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Paperclip',
        name,
        'an LLM API key for the Berget gateway (agents call models on behalf of users)',
        {
          propName: 'apiKeySecretName',
          exampleValue: 'berget-api-key',
          keys: ['api-key'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `berget-api-key`,
        namespace,
        path: llm?.path ?? `${secretProvider.path ?? name}/${name}/berget-ai`,
        secretName: apiKeyName,
        refreshAfter: llm?.refreshAfter ?? '3600s',
        keys: ['api-key'],
        restart: [{ kind: 'StatefulSet', name }],
      })
    )
  }

  // --- External database (CNPG-managed credentials: `<db>-app` fqdn-uri) ----
  resources_.push(
    jsx(Database, {
      name: dbName,
      namespace,
      instances: dbInstances,
      storage: dbStorage,
      ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
      parameters: { max_connections: '200', effective_cache_size: '768MB' },
      credentialsMode: 'cnpg',
      ...(backup ? { backup } : {}),
    })
  )

  // --- App env (facit contract) ----------------------------------------------
  const llmBaseUrl = llm?.baseUrl ?? 'https://api.berget.ai/v1'
  const appNative = appBackup === false ? undefined : (appBackup ?? {})
  const hb = heartbeat === false ? undefined : (heartbeat ?? {})
  const store = storage === false ? undefined : (storage ?? {})
  const catalog = modelCatalog === false ? undefined : (modelCatalog ?? {})

  const env = [
    { name: 'PAPERCLIP_TELEMETRY_DISABLED', value: '1' },
    { name: 'OPENAI_BASE_URL', value: llmBaseUrl },
    {
      name: 'OPENAI_API_KEY',
      valueFrom: { secretKeyRef: { name: apiKeyName, key: 'api-key' } },
    },
    { name: 'PAPERCLIP_SECRETS_PROVIDER', value: 'local_encrypted' },
    { name: 'PAPERCLIP_STORAGE_PROVIDER', value: 'local_disk' },
    { name: 'PAPERCLIP_STORAGE_LOCAL_DIR', value: '/paperclip/storage' },
    ...(hb?.enabled !== false ? [{ name: 'HEARTBEAT_SCHEDULER_ENABLED', value: 'true' }] : []),
    ...(appNative?.enabled !== false
      ? [
          { name: 'PAPERCLIP_DB_BACKUP_ENABLED', value: 'true' },
          { name: 'PAPERCLIP_DB_BACKUP_DIR', value: '/paperclip/backups' },
        ]
      : []),
    { name: 'PAPERCLIP_AUTH_BASE_URL_MODE', value: 'explicit' },
    { name: 'PAPERCLIP_AUTH_PUBLIC_BASE_URL', value: `https://${host}` },
    ...(catalog
      ? [
          {
            name: 'OPENCODE_CONFIG_CONTENT',
            value: catalog.opencodeConfig ?? DEFAULT_OPENCODE_CONFIG,
          },
          {
            name: 'PAPERCLIP_ADAPTER_MODELS',
            value: catalog.adapterModels ?? DEFAULT_ADAPTER_MODELS,
          },
        ]
      : []),
  ]

  // --- Instance CR — the entire app definition (operator-owned) --------------
  resources_.push(
    jsx('Instance', {
      apiVersion: 'paperclip.inc/v1alpha1',
      kind: 'Instance',
      metadata: { name, namespace, labels: { app: name } },
      spec: {
        image: {
          repository,
          tag: version,
          pullPolicy: 'Always',
          pullSecrets: pullSecrets.map((n) => ({ name: n })),
        },
        deployment: {
          mode: 'authenticated',
          exposure: 'public',
          publicURL: `https://${host}`,
          allowedHostnames: allowedHostnames ?? [host],
        },
        auth: {
          disableSignUp: auth?.disableSignUp !== false,
          secretRef: { name: appSecretsName, key: 'better-auth-secret' },
        },
        database: {
          mode: 'external',
          externalURLSecretRef: { name: `${dbName}-app`, key: 'fqdn-uri' },
        },
        adapters: { apiKeysSecretRef: { name: apiKeyName } },
        storage: {
          persistence: {
            enabled: storage !== false,
            size: store?.size ?? '10Gi',
            ...(store?.storageClass ? { storageClass: store.storageClass } : {}),
          },
        },
        resources,
        networking: {
          service: { type: 'ClusterIP', port: 3100 },
          ingress: {
            enabled: true,
            ingressClassName: 'nginx',
            hosts: [host],
            tls: [{ hosts: [host], secretName: tls.secretName }],
            annotations: {
              'cert-manager.io/cluster-issuer': tls.clusterIssuer,
              'external-dns.alpha.kubernetes.io/hostname': host,
              'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
              'nginx.ingress.kubernetes.io/proxy-body-size': '50m',
              'nginx.ingress.kubernetes.io/proxy-read-timeout': '300',
              'nginx.ingress.kubernetes.io/proxy-send-timeout': '300',
              'nginx.ingress.kubernetes.io/proxy-http-version': '1.1',
              ...ingressAnnotations,
            },
          },
        },
        probes: { type: 'auto' },
        heartbeat:
          hb && hb.enabled !== false ? { enabled: true, intervalMS: hb.intervalMS ?? 30000 } : null,
        backup:
          appNative && appNative.enabled !== false
            ? {
                appNative: {
                  enabled: true,
                  intervalMinutes: appNative.intervalMinutes ?? 60,
                  retentionDays: appNative.retentionDays ?? 7,
                },
              }
            : null,
        security: {
          networkPolicy: { enabled: false },
          seLinuxRelabel: false,
          podSecurityContext: { fsGroup: 1000 },
          containerSecurityContext: {
            // The image runs as root — runAsNonRoot would crash-loop it
            allowPrivilegeEscalation: false,
            capabilities: { drop: ['ALL'] },
            runAsNonRoot: false,
            runAsUser: 0,
          },
        },
        env,
      },
    })
  )

  return jsx(Fragment, { children: resources_ })
}
