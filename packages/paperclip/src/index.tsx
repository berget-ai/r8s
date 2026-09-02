import { jsx, Fragment, useContext } from '@r8s/core'
import { Namespace, SecretContext } from '@r8s/core/defaults'
import { Database, WebService, Endpoint } from '@r8s/recipes'
import type { SecretRef } from '@r8s/recipes'

export interface PaperclipProps {
  /** Resource name (defaults to 'paperclip') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the web app and API (required) */
  host: string
  /** Number of app replicas (defaults to 2) */
  replicas?: number
  /** Storage size for the Postgres cluster (defaults to '10Gi') */
  dbStorage?: string
  /** Enable websockets for live task and agent updates (defaults to false) */
  websockets?: boolean
  /**
   * Sandbox agent workers. Workers run the same image with a command
   * override (paperclip agent --sandbox) and share the model API key
   * and database credentials via secretKeyRef. They run with a hardened
   * securityContext (non-root, no privilege escalation, RuntimeDefault
   * seccomp, all capabilities dropped) by default.
   */
  agents?: {
    /** Number of sandbox agent replicas (defaults to 2) */
    sandboxReplicas?: number
    /** Sandbox container resources (defaults to requests 256Mi/250m, limits 2Gi/1000m) */
    resources?: {
      requests?: { cpu?: string; memory?: string }
      limits?: { cpu?: string; memory?: string }
    }
  }
  /**
   * Name of an existing Secret containing key `modelApiKey`. Paperclip
   * uses this key to call LLM providers on behalf of agents.
   *
   * Required unless a secrets backend (openbao/vault) is configured on
   * the surrounding Platform — the backend then provisions the key
   * automatically. Plaintext keys are not supported.
   */
  secretsName?: string
  /** Requested app resources */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Paperclip — Berget's agent platform (tasks, documents, agent orchestration).
 *
 * @title Paperclip
 * @category Agent Platforms
 *
 * Composes:
 * - CNPG Postgres cluster (tasks, documents, agent state; size via
 *   `dbStorage`)
 * - Paperclip Deployment + Service + Endpoint
 * - Optional sandbox agent workers (same image, command override) sharing
 *   the model API key via secretKeyRef — hardened with a non-root,
 *   no-privilege-escalation securityContext, RuntimeDefault seccomp and
 *   all capabilities dropped, with explicit resources by default
 * - Model API key provisioned through the Platform secrets backend
 *   (openbao / vault), or referenced from an existing Secret
 * - Optional websockets support (WEBSOCKETS_ENABLED)
 *
 * Probing: the Paperclip image contract does not publish HTTP health
 * endpoints, so both workloads default to TCP socket probes on the
 * container port (3000) to avoid crash-looping on unknown /health /ready
 * paths. If your image serves HTTP /health and /ready — or another
 * readiness endpoint — override `probes` on the workload for stricter
 * checks.
 *
 * The namespace is inherited from the surrounding `<Platform>` (via the
 * Namespace context) unless set explicitly.
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the MODEL_API_KEY is provisioned for you. Without a backend you must
 * point `secretsName` at a pre-created Secret.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Paperclip } from '@r8s/paperclip'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Paperclip
 *       name="paperclip"
 *       host="paperclip.example.com"
 *       agents={{ sandboxReplicas: 3 }}
 *     />
 *   </Platform>
 * )
 *
 * @example
 * // Existing Secret holding the model API key (key: modelApiKey)
 * import { Paperclip } from '@r8s/paperclip'
 *
 * export default (
 *   <Paperclip name="paperclip" host="paperclip.example.com" secretsName="paperclip-secrets" />
 * )
 */
export function Paperclip(props: PaperclipProps) {
  const {
    name = 'paperclip',
    namespace: namespaceProp,
    version = 'latest',
    host,
    replicas = 2,
    dbStorage = '10Gi',
    websockets = false,
    agents,
    secretsName,
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  // Inherit namespace from <Platform> context if not explicitly set
  const contextNamespace = useContext(Namespace)
  const namespace =
    namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'

  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const image = `ghcr.io/berget-ai/paperclip:${version}`
  const appSecretsName = secretsName ?? `${name}-secrets`
  const sandboxReplicas = agents?.sandboxReplicas ?? 2
  // Sandbox workers run untrusted code — never let them float without
  // explicit container resources.
  const sandboxResources = agents?.resources ?? {
    requests: { cpu: '250m', memory: '256Mi' },
    limits: { cpu: '1000m', memory: '2Gi' },
  }
  // The internal image's probe contract is unknown — probe the TCP port
  // so pods don't crash-loop on missing HTTP /health /ready endpoints.
  const tcpProbes = {
    liveness: { tcp: true } as const,
    readiness: { tcp: true } as const,
  }

  // --- Secret provisioning -------------------------------------------------
  // The model API key lets Paperclip call LLM providers — never render
  // it as plaintext. With a secrets backend it is provisioned through the
  // backend (key `modelApiKey`); otherwise reference a pre-created Secret.
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Paperclip "${name}" requires a model API key (MODEL_API_KEY).\n` +
          `\n` +
          `Paperclip calls LLM providers with a model API key — ` +
          `it must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Paperclip name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (key: modelApiKey):\n` +
          `  <Paperclip name="${name}" host="${host}" secretsName="${name}-secrets" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/secrets`,
      destination: { create: true, name: appSecretsName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-secrets`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-secrets`, namespace },
            spec,
          })
    )
  }

  // --- Env wiring ------------------------------------------------------------
  // Every credential is referenced via secretKeyRef (declared before plain
  // env vars by WebService, so dependent $(VAR) expansion resolves).
  // DATABASE_URL is auto-wired from DatabaseContext inside the wrapper.
  const appEnv: Record<string, string> = {
    PORT: '3000',
    ...(websockets ? { WEBSOCKETS_ENABLED: 'true' } : {}),
  }

  const appSecrets: Record<string, SecretRef> = {
    MODEL_API_KEY: { secret: appSecretsName, key: 'modelApiKey' },
  }

  // --- Database (CNPG) + app + sandbox agents --------------------------------
  // Database wraps both the main app and the sandbox workers so database
  // credentials stay consistent with the r8s Database recipe (CNPG dedicated
  // cluster provisions the secret).
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage: dbStorage,
      children: (
        <>
          <WebService
            name={name}
            namespace={namespace}
            image={image}
            port={3000}
            replicas={replicas}
            probes={tcpProbes}
            resources={resources}
            env={appEnv}
            secrets={appSecrets}
          />
          {agents ? (
            <WebService
              name={`${name}-agent-sandbox`}
              namespace={namespace}
              image={image}
              port={3000}
              replicas={sandboxReplicas}
              command={['paperclip', 'agent', '--sandbox']}
              probes={tcpProbes}
              secrets={appSecrets}
              securityContext={{
                runAsNonRoot: true,
                allowPrivilegeEscalation: false,
                seccompProfile: { type: 'RuntimeDefault' },
                capabilities: { drop: ['ALL'] },
              }}
              podSecurityContext={{ seccompProfile: { type: 'RuntimeDefault' } }}
              resources={sandboxResources}
            />
          ) : null}
        </>
      ),
    })
  )

  // --- Endpoint ---------------------------------------------------------------
  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={3000}
      tls={tls}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
