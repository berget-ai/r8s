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
export const requireResourceLimits: GuardrailRule = {
  id: 'require-resource-limits',
  description: 'All containers must have resource requests and limits',
  severity: 'error',
  test: (resources) => {
    const errors: ValidationError[] = []

    for (const resource of resources as any[]) {
      if (
        resource.kind === 'Deployment' ||
        resource.kind === 'StatefulSet' ||
        resource.kind === 'DaemonSet'
      ) {
        const containers = resource.spec?.template?.spec?.containers || []
        for (const container of containers) {
          if (!container.resources?.requests) {
            errors.push({
              code: 'MISSING_RESOURCE_REQUESTS',
              message: `Container "${container.name}" in ${resource.kind} "${resource.metadata?.name}" is missing resource requests`,
              resource: resource.kind,
              field: 'spec.template.spec.containers[].resources.requests',
              suggestion: 'Add resource.requests with cpu and memory values',
            })
          }
          if (!container.resources?.limits) {
            errors.push({
              code: 'MISSING_RESOURCE_LIMITS',
              message: `Container "${container.name}" in ${resource.kind} "${resource.metadata?.name}" is missing resource limits`,
              resource: resource.kind,
              field: 'spec.template.spec.containers[].resources.limits',
              suggestion:
                'Add resource.limits with cpu and memory values to prevent resource exhaustion',
            })
          }
        }
      }
    }

    return errors
  },
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

/**
 * Check that no credentials are rendered as plaintext. Covers:
 * - Secret stringData/data values for credential keys, connection-string
 *   URIs, and PEM private keys (encryptedData from sealed-secrets and
 *   system TLS/service-account secrets are exempt)
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

    const push = (kind: string, where: string, field: string, suggestion: string) => {
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

    const scanValue = (where: string, field: string, value: unknown) => {
      if (typeof value !== 'string' || value.length === 0) return
      if (connectionStringPassword(value) !== null) {
        push(
          'Secret',
          where,
          field,
          'Connection string embeds a password. Inject the credential at runtime via secretKeyRef or $(VAR) expansion instead'
        )
      } else if (value.startsWith('-----BEGIN') && value.includes('PRIVATE KEY')) {
        push(
          'Secret',
          where,
          field,
          'PEM private key is embedded in the manifest. Store it in a secrets backend or a sealed secret instead'
        )
      }
    }

    for (const resource of resources) {
      const kindName = `${resource.kind} "${resource.metadata?.name ?? '?'}"`
      const anyResource = resource as any

      // 1. Kubernetes Secret resources
      if (resource.kind === 'Secret') {
        const secretType = (anyResource.type as string) || ''
        const isEncrypted = anyResource.encryptedData !== undefined
        const exempt = EXEMPT_SECRET_TYPES.includes(secretType)

        if (!exempt && !isEncrypted) {
          for (const map of ['stringData', 'data'] as const) {
            const data = anyResource[map]
            if (!data || typeof data !== 'object') continue
            for (const [key, value] of Object.entries(data)) {
              const normalized = normalizeKey(key)
              const isCredentialKey =
                SECRET_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix)) &&
                !SECRET_REFERENCE_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
              if (isCredentialKey && typeof value === 'string' && value.length > 0) {
                push(
                  'Secret',
                  `Secret "${resource.metadata?.name}" (${map}.${key})`,
                  `${map}.${key}`,
                  'Use a secrets backend (openbao/vault/sealed-secrets) or let the operator provision the credential'
                )
              }
              scanValue(
                `Secret "${resource.metadata?.name}" (${map}.${key})`,
                `${map}.${key}`,
                value
              )
            }
          }
        }
        continue
      }

      // 2. Workload env vars
      for (const container of workloadsContainers(resource)) {
        for (const env of container.env ?? []) {
          if (!env || typeof env !== 'object' || !env.name) continue
          // Only `value` embeds the credential — valueFrom is a reference.
          if (env.value === undefined || env.valueFrom) continue
          if (typeof env.value !== 'string') continue
          const isSecretName =
            SECRET_ENV_NAME_PATTERN.test(env.name) && !NON_SECRET_ENV_NAME_PATTERN.test(env.name)
          const hasConnectionString = connectionStringPassword(env.value) !== null
          if (isSecretName && !looksLikeReference(env.value)) {
            push(
              resource.kind,
              `${kindName} container "${container.name}" env "${env.name}"`,
              `spec.template.spec.containers[].env[name=${env.name}].value`,
              'Use valueFrom.secretKeyRef, a Vault/OpenBao secret reference, or $(VAR) expansion'
            )
          }
          if (hasConnectionString) {
            push(
              resource.kind,
              `${kindName} container "${container.name}" env "${env.name}"`,
              `spec.template.spec.containers[].env[name=${env.name}].value`,
              'Connection string embeds a password. Split into individual vars and reference the secret'
            )
          }
        }
      }

      // 3. Nested fields — credentials anywhere in the resource tree
      const walk = (node: unknown, path: string) => {
        if (Array.isArray(node)) {
          node.forEach((item, i) => walk(item, `${path}[${i}]`))
          return
        }
        if (!node || typeof node !== 'object') {
          if (typeof node === 'string') scanValue(`${kindName} (${path})`, path, node)
          return
        }
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          // sealed-secrets ciphertext is encrypted with the cluster key
          if (key === 'encryptedData') continue
          const normalized = normalizeKey(key)
          const isCredentialKey =
            SECRET_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix)) &&
            !SECRET_REFERENCE_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
          if (
            isCredentialKey &&
            typeof value === 'string' &&
            value.length > 0 &&
            !looksLikeReference(value)
          ) {
            push(
              resource.kind,
              `${kindName} (${path}.${key})`,
              `${path}.${key}`,
              'Move the credential into a secrets backend and reference it by name'
            )
          }
          // Recurse into child objects/arrays so credentials are caught at
          // every depth (pod templates, CRD specs, realm users, …); leaf
          // strings are scanned for connection strings / PEM keys
          if (value && typeof value === 'object') {
            walk(value, `${path}.${key}`)
          } else {
            scanValue(`${kindName} (${path}.${key})`, `${path}.${key}`, value)
          }
        }
      }
      walk(anyResource.spec, 'spec')
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
export const noRootContainers: GuardrailRule = {
  id: 'no-root-containers',
  description: 'Containers should not run as root user',
  severity: 'error',
  test: (resources) => {
    const errors: ValidationError[] = []

    for (const resource of resources as any[]) {
      if (
        resource.kind === 'Deployment' ||
        resource.kind === 'StatefulSet' ||
        resource.kind === 'DaemonSet' ||
        resource.kind === 'Pod'
      ) {
        const podSpec = resource.spec?.template?.spec || resource.spec || {}
        const securityContext = podSpec.securityContext || {}

        if (securityContext.runAsUser === 0 || securityContext.runAsRoot === true) {
          errors.push({
            code: 'CONTAINER_RUNS_AS_ROOT',
            message: `${resource.kind} "${resource.metadata?.name}" is configured to run as root`,
            resource: resource.kind,
            field: 'spec.template.spec.securityContext.runAsUser',
            suggestion: 'Set runAsUser to a non-zero UID and runAsRoot to false',
          })
        }

        for (const container of podSpec.containers || []) {
          const containerSecurity = container.securityContext || {}
          if (containerSecurity.runAsUser === 0 || containerSecurity.runAsRoot === true) {
            errors.push({
              code: 'CONTAINER_RUNS_AS_ROOT',
              message: `Container "${container.name}" in ${resource.kind} "${resource.metadata?.name}" runs as root`,
              resource: resource.kind,
              field: 'spec.template.spec.containers[].securityContext.runAsUser',
              suggestion: 'Set securityContext.runAsUser to a non-zero UID',
            })
          }
        }
      }
    }

    return errors
  },
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
