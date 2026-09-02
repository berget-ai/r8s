/**
 * Redaction helpers — scrub credential material from error messages,
 * logs and rendered output so secrets don't leak through secondary
 * channels (CI logs, CRD status, support tickets).
 */

/**
 * Mask credentials embedded in connection strings:
 *   postgresql://app:staging-password@db:5432/app
 *     → postgresql://app:*****@db:5432/app
 */
export function redactConnectionStrings(text: string): string {
  return text.replace(
    /([a-z][a-z0-9+.-]*:\/\/[^/\s:@]*):([^@/\s]+)@/gi,
    (_match, schemeAndUser: string) => `${schemeAndUser}:*****@`
  )
}

/**
 * Mask PEM private key blocks:
 *   -----BEGIN RSA PRIVATE KEY-----
 *   ...
 *   -----END RSA PRIVATE KEY-----
 *     → [REDACTED PRIVATE KEY]
 */
export function redactPrivateKeys(text: string): string {
  return text.replace(
    /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,
    '[REDACTED PRIVATE KEY]'
  )
}

/** Keys (normalized) whose value in a Secret map is a credential. */
const SECRET_DATA_KEY_SUFFIXES = [
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

/**
 * Return a copy of a resource with plaintext credential values masked:
 * - Secret stringData/data values for credential keys → '*****'
 * - Connection-string passwords anywhere → '*****'
 * - PEM private key blocks → '[REDACTED PRIVATE KEY]'
 *
 * Used when rendered output is written to logs/stdout so committed or
 * displayed YAML never carries live credentials.
 */
export function maskSecretValues<T>(resource: T): T {
  return maskNode(resource) as T
}

function maskNode(node: unknown): unknown {
  if (typeof node === 'string') {
    let masked = redactPrivateKeys(node)
    masked = redactConnectionStrings(masked)
    return masked
  }
  if (Array.isArray(node)) {
    return node.map(maskNode)
  }
  if (node && typeof node === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      const normalized = key.toLowerCase().replace(/[-_.]/g, '')
      if (normalized === 'data' || normalized === 'stringdata') {
        result[key] = maskSecretMap(value)
      } else {
        result[key] = maskNode(value)
      }
    }
    return result
  }
  return node
}

function maskSecretMap(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return maskNode(value)
  }
  const result: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const normalized = key.toLowerCase().replace(/[-_.]/g, '')
    if (
      typeof entry === 'string' &&
      entry.length > 0 &&
      SECRET_DATA_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
    ) {
      result[key] = '*****'
    } else {
      result[key] = maskNode(entry)
    }
  }
  return result
}

/**
 * Best-effort sanitization for error messages, logs and CRD status.
 * Masks connection-string credentials and private key blocks. Framework
 * errors are value-free by design (they reference the location of a
 * credential, never its value); this covers messages produced by
 * external tooling (kubectl, kubernetes API, esbuild source excerpts).
 */
export function sanitizeErrorMessage(text: string): string {
  return redactPrivateKeys(redactConnectionStrings(text))
}
