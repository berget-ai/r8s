/**
 * Actionable errors for the recurring "app needs secrets but no
 * provisioning backend exists" case. Packages reference this factory
 * instead of hand-writing the same 15-line guidance block per app —
 * the advice lives in one place.
 */
export interface SecretsRequiredOptions {
  /** Prop that carries the fallback pre-created Secret name */
  propName?: string
  /** Example Secret name to suggest */
  exampleValue?: string
  /** Expected keys on the pre-created Secret */
  keys?: string[]
}

export function secretsRequiredError(
  app: string,
  resourceName: string,
  what: string,
  opts: SecretsRequiredOptions = {}
): Error {
  const { propName = 'secretsName', exampleValue = `${resourceName}-secrets`, keys } = opts
  return new Error(
    `${app} "${resourceName}" requires ${what}\n` +
      `\n` +
      `Secrets must never be rendered as plaintext.\n` +
      `\n` +
      `Fix: configure a provisioning secrets backend on the Platform\n` +
      `(openbao, vault, or any provider with a provision() hook):\n` +
      `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
      `    <${app} name="${resourceName}" />\n` +
      `  </Platform>\n` +
      `\n` +
      `Or reference a pre-created Secret${keys ? ` (keys: ${keys.join(', ')})` : ''}:\n` +
      `  ${propName}: "${exampleValue}"`
  )
}
