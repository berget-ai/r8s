import { KubernetesResource } from '@r8s/k8s-types'
import { ValidationError } from './validate'

export interface GuardrailRule {
  /** Unique rule identifier */
  id: string
  /** Human-readable description */
  description: string
  /** Severity level */
  severity: 'error' | 'warning' | 'info'
  /** Test function - returns empty array if rule passes, ValidationError[] if it fails */
  test: (resources: KubernetesResource[]) => ValidationError[]
}

/** Check that all namespaces have NetworkPolicies */
export const requireNetworkPolicies: GuardrailRule = {
  id: 'require-network-policies',
  description: 'All namespaces must have at least one NetworkPolicy',
  severity: 'error',
  test: (resources) => {
    const errors: ValidationError[] = []
    const namespaces = new Set<string>()
    const hasNetworkPolicy = new Set<string>()

    for (const resource of resources as any[]) {
      if (resource.metadata?.namespace) {
        namespaces.add(resource.metadata.namespace)
      }
      if (resource.kind === 'NetworkPolicy' && resource.metadata?.namespace) {
        hasNetworkPolicy.add(resource.metadata.namespace)
      }
    }

    for (const ns of namespaces) {
      if (!hasNetworkPolicy.has(ns)) {
        errors.push({
          code: 'MISSING_NETWORK_POLICY',
          message: `Namespace "${ns}" is missing a NetworkPolicy`,
          resource: 'Namespace',
          field: 'networkPolicy',
          suggestion: `Add a NetworkPolicy for namespace "${ns}" to control ingress/egress traffic`,
        })
      }
    }

    return errors
  },
}

/** Check that all Deployments have resource limits */
/** Workload kinds carrying a pod template with resource needs. */
export const RESOURCE_LIMIT_KINDS = ['Deployment', 'StatefulSet', 'DaemonSet'] as const

function containerResourceErrors(resource: any): ValidationError[] {
  const name = resource.metadata?.name
  return (resource.spec?.template?.spec?.containers || []).flatMap((container: any) => {
    const label = `Container "${container.name}" in ${resource.kind} "${name}"`
    const errors: ValidationError[] = []
    if (!container.resources?.requests) {
      errors.push({
        code: 'MISSING_RESOURCE_REQUESTS',
        message: `${label} is missing resource requests`,
        resource: resource.kind,
        field: 'spec.template.spec.containers[].resources.requests',
        suggestion: 'Add resource.requests with cpu and memory values',
      })
    }
    if (!container.resources?.limits) {
      errors.push({
        code: 'MISSING_RESOURCE_LIMITS',
        message: `${label} is missing resource limits`,
        resource: resource.kind,
        field: 'spec.template.spec.containers[].resources.limits',
        suggestion: 'Add resource.limits with cpu and memory values to prevent resource exhaustion',
      })
    }
    return errors
  })
}

export const requireResourceLimits: GuardrailRule = {
  id: 'require-resource-limits',
  description: 'All containers must have resource requests and limits',
  severity: 'error',
  test: (resources) =>
    (resources as any[])
      .filter((resource) => (RESOURCE_LIMIT_KINDS as readonly string[]).includes(resource.kind))
      .flatMap(containerResourceErrors),
}
/** Check that all resources have required labels */
export const requireLabels = (requiredLabels: string[]): GuardrailRule => ({
  id: `require-labels-${requiredLabels.sort().join('-')}`,
  description: `All resources must have labels: ${requiredLabels.join(', ')}`,
  severity: 'warning',
  test: (resources) => {
    const errors: ValidationError[] = []

    for (const resource of resources as any[]) {
      const labels = resource.metadata?.labels || {}
      for (const label of requiredLabels) {
        if (!labels[label]) {
          errors.push({
            code: 'MISSING_REQUIRED_LABEL',
            message: `${resource.kind} "${resource.metadata?.name}" is missing required label "${label}"`,
            resource: resource.kind,
            field: `metadata.labels.${label}`,
            suggestion: `Add label "${label}" to ${resource.kind} "${resource.metadata?.name}"`,
          })
        }
      }
    }

    return errors
  },
})

/**
 * Keys whose value is a credential when they appear with these endings
 * (normalized: lowercased, `-`/`_`/`.` removed).
 */
const SECRET_KEY_SUFFIXES = [
  'password',
  'passwd',
  'pwd',
  'secretkey',
  'secretaccesskey',
  'accesskey',
  'accesskeyid',
  'privatekey',
  'clientsecret',
  'apikey',
  'token', // bare token: csrf/as/hs/api tokens are all credentials
  'authtoken',
  'connectionstring',
]

/** Key endings that hold the *name* of a secret, not a credential value. */
const SECRET_REFERENCE_SUFFIXES = [
  'secretname',
  'secretref',
  'passwordsecret',
  'passwordkey',
  'passwordref',
  'passwordname',
  'secretkeyref',
  'secretkeyname',
  'tokenname',
  'tokenref',
  'keyref',
  'keyname',
  'credentialsref',
]

/**
 * Key prefixes that name a reference to an existing secret (chart
 * convention), not credential values — e.g. the Harbor/Bitnami
 * `existingSecretAdminPassword`, `existingSecretSecretKey` parameters.
 */
const SECRET_REFERENCE_PREFIXES = ['existingsecret']

/** Does this normalized key hold a reference rather than a credential? */
function isReferenceKey(normalized: string): boolean {
  return (
    SECRET_REFERENCE_SUFFIXES.some((s) => normalized.endsWith(s)) ||
    SECRET_REFERENCE_PREFIXES.some((s) => normalized.startsWith(s))
  )
}

/** Env var names that suggest the value is a credential. */
const SECRET_ENV_NAME_PATTERN =
  /(password|passwd|pwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|credential|client[_-]?secret)/i

/** Env var names that carry policy/lifetime metadata, not credentials
 *  (e.g. REFRESH_TOKEN_EXPIRY, ACCESS_TOKEN_TTL, JWT_LIFESPAN). */
const NON_SECRET_ENV_NAME_PATTERN =
  /(_expiry|_expires(_at|_in)?$|_ttl$|max[_-]age|lifespan|_timeout$|_url|_uri|_endpoint$|_provider$|_issuer$|_audience$|_header$|_transport$)/i

/** Matches scheme://[user[:password]@]host — a credentials-bearing URI. */
const CONNECTION_STRING_RE = /[a-z][a-z0-9+.-]*:\/\/([^/\s:@]*):([^@/\s]+)@/i

/** Secret types that hold non-credential material (TLS certs, SA tokens managed in-cluster). */
const EXEMPT_SECRET_TYPES = [
  'kubernetes.io/tls',
  'kubernetes.io/ssl',
  'kubernetes.io/service-account-token',
  'bootstrap.kubernetes.io/token',
  'helm.sh/release.v1',
]

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_.]/g, '')
}

/** Values that are references/placeholders rather than live credentials. */
function looksLikeReference(value: string): boolean {
  return (
    value.includes('$(') ||
    /^\$\{.+\}/.test(value) ||
    value.startsWith('${') ||
    value.startsWith('$') ||
    value.startsWith('file://')
  )
}

/** "Fill in via GitOps"-style placeholder values — not live credentials. */
const PLACEHOLDER_VALUE_RE = /^(replace|provide|change|todo|fixme|your[_-]|xxx+|<|\.\.\.|\*+)/i

/**
 * Credential-looking `key: value` / `key=value` / `export key=value` lines
 * inside multi-line text — embedded YAML/INI/dotenv payloads in ConfigMap
 * data and Secret stringData blobs.
 */
const EMBEDDED_CREDENTIAL_LINE_RE =
  /^[ \t]*(?:export[ \t]+)?([A-Za-z0-9_.-]*?(?:token|password|passwd|secret|secretaccesskey|private[_-]?key|api[_-]?key|access[_-]?key|client[_-]?secret|authtoken)[A-Za-z0-9_.-]*?)\s*[:=]\s*['"]?([^\s'"]{8,})['"]?[ \t]*$/gim

/**
 * Embedded keys whose value is metadata about a credential, not the
 * credential itself (token_endpoint, password_file, secret_name, …).
 */
const EMBEDDED_KEY_EXCLUDE_SUFFIXES = [
  'endpoint',
  'url',
  'uri',
  'ttl',
  'expiry',
  'expires',
  'maxage',
  'lifespan',
  'timeout',
  'header',
  'name',
  'type',
  'ref',
  'file',
  'path',
  'algorithm',
  'alg',
  'issuer',
  'audience',
  'provider',
  'transport',
  'rotation',
  'method', // e.g. token_endpoint_auth_method — OIDC metadata, not a credential
]

/** Find live credential values embedded in multi-line config text. */
function embeddedCredentialLines(text: string): { key: string; value: string }[] {
  const hits: { key: string; value: string }[] = []
  for (const match of text.matchAll(EMBEDDED_CREDENTIAL_LINE_RE)) {
    const [, key, value] = match
    const normalized = normalizeKey(key)
    if (EMBEDDED_KEY_EXCLUDE_SUFFIXES.some((suffix) => normalized.endsWith(suffix))) continue
    if (looksLikeReference(value)) continue
    if (PLACEHOLDER_VALUE_RE.test(value)) continue
    // Paths and URLs point at credentials; they are not credentials
    if (value.startsWith('/') || /^[a-z][a-z0-9+.-]*:\/\//i.test(value)) continue
    hits.push({ key, value })
  }
  return hits
}

function connectionStringPassword(value: string): string | null {
  const match = value.match(CONNECTION_STRING_RE)
  if (!match) return null
  const [, , password] = match
  // Kubernetes $(VAR) expansion and env interpolation — the credential is
  // injected at runtime, not embedded in the manifest.
  if (password.includes('$(') || password.includes('${')) return null
  return password
}

/** Collect pod containers from any workload-shaped resource. */
function workloadsContainers(resource: KubernetesResource): any[] {
  const anyResource = resource as any
  const kind: string = anyResource.kind
  if (kind === 'CronJob') {
    return [
      ...(anyResource.spec?.jobTemplate?.spec?.template?.spec?.containers ?? []),
      ...(anyResource.spec?.jobTemplate?.spec?.template?.spec?.initContainers ?? []),
    ]
  }
  const podSpec = anyResource.spec?.template?.spec ?? anyResource.spec ?? {}
  return [...(podSpec.containers ?? []), ...(podSpec.initContainers ?? [])]
}

type SecretScanPush = (kind: string, where: string, field: string, suggestion: string) => void
type SecretScanValue = (resourceKind: string, where: string, field: string, value: unknown) => void
interface SecretScanCtx {
  push: SecretScanPush
  scanValue: SecretScanValue
}

const CREDENTIAL_VALUE_SUGGESTION =
  'Use a secrets backend (openbao/vault/sealed-secrets) or let the operator provision the credential'
const SEALED_FILE_SUGGESTION =
  'Move the credential into a secrets backend and reference it, or render this file as a sealed secret'
const CONFIGMAP_SUGGESTION =
  'ConfigMaps carry no protection — render credentials as a Secret (from a secrets backend or sealed secret) instead'

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/** Does this key name look like it holds a credential value (not a reference)? */
function isCredentialKeyName(normalized: string, extraExclusions: string[] = []): boolean {
  return (
    SECRET_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix)) &&
    !isReferenceKey(normalized) &&
    !extraExclusions.some((suffix) => normalized.endsWith(suffix))
  )
}

/** Multi-line values may embed YAML/INI payloads holding credential keys (e.g. appservice registration.yaml). */
function pushEmbeddedCredentialHits(
  ctx: SecretScanCtx,
  hitInfo: { kind: string; where: string; field: string; value: unknown; suggestion: string }
): void {
  const { kind, where, field, value, suggestion } = hitInfo
  if (typeof value !== 'string' || !value.includes('\n')) return
  for (const hit of embeddedCredentialLines(value)) {
    ctx.push(kind, `${where} — embedded key "${hit.key}"`, field, suggestion)
  }
}

/** One stringData/data entry: credential keys, connection strings, PEM keys, embedded payloads. */
function scanSecretEntry(
  ctx: SecretScanCtx,
  entry: { name: string | undefined; map: string; key: string; value: unknown }
): void {
  const { name, map, key, value } = entry
  const where = `Secret "${name}" (${map}.${key})`
  const field = `${map}.${key}`
  if (isCredentialKeyName(normalizeKey(key)) && isNonEmptyString(value)) {
    ctx.push('Secret', where, field, CREDENTIAL_VALUE_SUGGESTION)
  }
  ctx.scanValue('Secret', where, field, value)
  pushEmbeddedCredentialHits(ctx, {
    kind: 'Secret',
    where,
    field,
    value,
    suggestion: SEALED_FILE_SUGGESTION,
  })
}

/** Secret stringData/data maps of a non-exempt Secret. */
function scanSecretResource(resource: KubernetesResource, ctx: SecretScanCtx): void {
  const anyResource = resource as any
  const secretType = (anyResource.type as string) || ''
  if (EXEMPT_SECRET_TYPES.includes(secretType) || anyResource.encryptedData !== undefined) return

  for (const map of ['stringData', 'data'] as const) {
    const data = anyResource[map]
    if (!data || typeof data !== 'object') continue
    for (const [key, value] of Object.entries(data)) {
      scanSecretEntry(ctx, { name: resource.metadata?.name, map, key, value })
    }
  }
}

/** ConfigMap data — same exposure as Secrets when credentials are embedded. */
function scanConfigMapResource(resource: KubernetesResource, ctx: SecretScanCtx): void {
  const { push, scanValue } = ctx
  const data = (resource as any).data
  if (!data || typeof data !== 'object') return
  const name = resource.metadata?.name
  for (const [key, value] of Object.entries(data)) {
    if (!isNonEmptyString(value)) continue
    const where = `ConfigMap "${name}" (data.${key})`
    const field = `data.${key}`
    const isCredentialKey =
      isCredentialKeyName(normalizeKey(key), EMBEDDED_KEY_EXCLUDE_SUFFIXES) &&
      !looksLikeReference(value) &&
      !PLACEHOLDER_VALUE_RE.test(value)
    if (isCredentialKey) push('ConfigMap', where, field, CONFIGMAP_SUGGESTION)
    pushEmbeddedCredentialHits(ctx, {
      kind: 'ConfigMap',
      where,
      field,
      value,
      suggestion: CONFIGMAP_SUGGESTION,
    })
    scanValue('ConfigMap', where, field, value)
  }
}

/** Env entries that embed a literal string via `value` (valueFrom is a reference, not exposure). */
function hasPlainValue(env: any): env is { name: string; value: string } {
  return (
    !!env &&
    typeof env === 'object' &&
    typeof env.name === 'string' &&
    typeof env.value === 'string' &&
    env.valueFrom === undefined
  )
}

function envIsSecretNamed(name: string): boolean {
  return SECRET_ENV_NAME_PATTERN.test(name) && !NON_SECRET_ENV_NAME_PATTERN.test(name)
}

/** Workload env vars: only `value` embeds the credential — valueFrom is a reference. */
function scanWorkloadEnv(
  resource: KubernetesResource,
  kindName: string,
  push: SecretScanPush
): void {
  for (const container of workloadsContainers(resource)) {
    for (const env of (container.env ?? []).filter(hasPlainValue)) {
      const where = `${kindName} container "${container.name}" env "${env.name}"`
      const field = `spec.template.spec.containers[].env[name=${env.name}].value`
      if (envIsSecretNamed(env.name) && !looksLikeReference(env.value)) {
        push(
          resource.kind,
          where,
          field,
          'Use valueFrom.secretKeyRef, a Vault/OpenBao secret reference, or $(VAR) expansion'
        )
      }
      if (connectionStringPassword(env.value) !== null) {
        push(
          resource.kind,
          where,
          field,
          'Connection string embeds a password. Split into individual vars and reference the secret'
        )
      }
    }
  }
}

/** Nested fields — credentials anywhere in the resource tree (CRD specs, realm users, …). */
function walkNestedFields(
  resource: KubernetesResource,
  kindName: string,
  ctx: SecretScanCtx
): void {
  const { push, scanValue } = ctx

  const leafScan = (value: unknown, path: string): void => {
    if (typeof value === 'string') scanValue(resource.kind, `${kindName} (${path})`, path, value)
  }

  const reportCredentialKey = (key: string, value: unknown, path: string): void => {
    if (!isCredentialKeyName(normalizeKey(key))) return
    if (!isNonEmptyString(value) || looksLikeReference(value)) return
    push(
      resource.kind,
      `${kindName} (${path}.${key})`,
      `${path}.${key}`,
      'Move the credential into a secrets backend and reference it by name'
    )
  }

  const walkObject = (obj: Record<string, unknown>, path: string): void => {
    for (const [key, value] of Object.entries(obj)) {
      // sealed-secrets ciphertext is encrypted with the cluster key
      if (key === 'encryptedData') continue
      reportCredentialKey(key, value, path)
      // Recurse into child objects/arrays so credentials are caught at every
      // depth; leaf strings are scanned for connection strings / PEM keys
      if (value && typeof value === 'object') walk(value, `${path}.${key}`)
      else leafScan(value, `${path}.${key}`)
    }
  }

  const walk = (node: unknown, path: string): void => {
    if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}[${i}]`))
      return
    }
    if (!node || typeof node !== 'object') {
      leafScan(node, path)
      return
    }
    walkObject(node as Record<string, unknown>, path)
  }

  walk((resource as any).spec, 'spec')
}

/**
 * Check that no credentials are rendered as plaintext. Covers:
 * - Secret stringData/data values for credential keys, connection-string
 *   URIs, and PEM private keys (encryptedData from sealed-secrets and
 *   system TLS/service-account secrets are exempt)
 * - ConfigMap data — flat credential keys and credential-looking
 *   `key: value` lines inside embedded YAML/INI payloads (e.g. appservice
 *   registrations holding as_token/hs_token)
 * - Workload env vars that embed credentials via `value` (secretKeyRef or
 *   $(VAR) runtime expansion are fine)
 * - Any nested field (CRD specs, realm users, …) holding a plaintext
 *   credential value
 */
export const noPlaintextSecrets: GuardrailRule = {
  id: 'no-plaintext-secrets',
  description: 'Manifests must not contain plaintext credentials',
  severity: 'error',
  test: (resources) => {
    const errors: ValidationError[] = []
    const seen = new Set<string>()

    const push: SecretScanPush = (kind, where, field, suggestion) => {
      const dedupeKey = `${where}:${field}`
      if (seen.has(dedupeKey)) return
      seen.add(dedupeKey)
      errors.push({
        code: 'PLAINTEXT_SECRET',
        message: `Plaintext credential in ${where}`,
        resource: kind,
        field,
        suggestion,
      })
    }

    const scanValue: SecretScanValue = (resourceKind, where, field, value) => {
      if (typeof value !== 'string' || value.length === 0) return
      if (connectionStringPassword(value) !== null) {
        push(
          resourceKind,
          where,
          field,
          'Connection string embeds a password. Inject the credential at runtime via secretKeyRef or $(VAR) expansion instead'
        )
      } else if (value.startsWith('-----BEGIN') && value.includes('PRIVATE KEY')) {
        push(
          resourceKind,
          where,
          field,
          'PEM private key is embedded in the manifest. Store it in a secrets backend or a sealed secret instead'
        )
      }
    }

    const ctx: SecretScanCtx = { push, scanValue }
    for (const resource of resources) {
      const kindName = `${resource.kind} "${resource.metadata?.name ?? '?'}"`
      if (resource.kind === 'Secret') {
        scanSecretResource(resource, ctx)
        continue
      }
      if (resource.kind === 'ConfigMap') {
        scanConfigMapResource(resource, ctx)
        continue
      }
      scanWorkloadEnv(resource, kindName, push)
      walkNestedFields(resource, kindName, ctx)
    }

    return errors
  },
}

/** Check that Ingresses have TLS configured */
export const requireTLS: GuardrailRule = {
  id: 'require-tls',
  description: 'All Ingress resources must have TLS configured',
  severity: 'warning',
  test: (resources) => {
    const errors: ValidationError[] = []

    for (const resource of resources) {
      if (resource.kind === 'Ingress') {
        const spec = (resource as any).spec || {}
        if (!spec.tls || spec.tls.length === 0) {
          errors.push({
            code: 'MISSING_TLS',
            message: `Ingress "${resource.metadata?.name}" is missing TLS configuration`,
            resource: 'Ingress',
            field: 'spec.tls',
            suggestion:
              'Add TLS configuration with secretName and optionally cert-manager clusterIssuer',
          })
        }
      }
    }

    return errors
  },
}

/** Check that Pods don't run as root */
function runsAsRoot(securityContext: any): boolean {
  return securityContext?.runAsUser === 0 || securityContext?.runAsRoot === true
}

function rootContainerErrors(resource: any): ValidationError[] {
  const podSpec = resource.spec?.template?.spec || resource.spec || {}
  const name = resource.metadata?.name
  const errors: ValidationError[] = []
  if (runsAsRoot(podSpec.securityContext ?? {})) {
    errors.push({
      code: 'CONTAINER_RUNS_AS_ROOT',
      message: `${resource.kind} "${name}" is configured to run as root`,
      resource: resource.kind,
      field: 'spec.template.spec.securityContext.runAsUser',
      suggestion: 'Set runAsUser to a non-zero UID and runAsRoot to false',
    })
  }
  for (const container of podSpec.containers || []) {
    if (runsAsRoot(container.securityContext ?? {})) {
      errors.push({
        code: 'CONTAINER_RUNS_AS_ROOT',
        message: `Container "${container.name}" in ${resource.kind} "${name}" runs as root`,
        resource: resource.kind,
        field: 'spec.template.spec.containers[].securityContext.runAsUser',
        suggestion: 'Set securityContext.runAsUser to a non-zero UID',
      })
    }
  }
  return errors
}

export const noRootContainers: GuardrailRule = {
  id: 'no-root-containers',
  description: 'Containers should not run as root user',
  severity: 'error',
  test: (resources) =>
    (resources as any[])
      .filter((resource) =>
        ([...RESOURCE_LIMIT_KINDS, 'Pod'] as readonly string[]).includes(resource.kind)
      )
      .flatMap(rootContainerErrors),
}
/** Default set of guardrails for production use */
export const defaultGuardrails: GuardrailRule[] = [
  requireNetworkPolicies,
  requireResourceLimits,
  noPlaintextSecrets,
  requireTLS,
  noRootContainers,
]

/** Run all guardrail rules against a set of resources */
export function runGuardrails(
  resources: KubernetesResource[],
  rules: GuardrailRule[] = defaultGuardrails
): {
  passed: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
} {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const info: ValidationError[] = []

  for (const rule of rules) {
    const ruleErrors = rule.test(resources)
    for (const error of ruleErrors) {
      if (rule.severity === 'error') {
        errors.push(error)
      } else if (rule.severity === 'warning') {
        warnings.push(error)
      } else if (rule.severity === 'info') {
        info.push(error)
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    info,
  }
}
