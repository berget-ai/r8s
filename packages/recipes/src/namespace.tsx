import { jsx, useContext } from '@r8s/core'
// The raw context shares the component's name (same word, different module).
// The alias keeps this file unambiguous; users never see it — they write
// <Namespace name="…"> from @r8s/recipes or Namespace.Provider from core.
import { Namespace as NamespaceContext } from '@r8s/core/defaults'

/**
 * DNS-1123 label: lowercase alphanumeric or '-', start/end alphanumeric,
 * max 63 chars (RFC 1123 — the constraint Kubernetes applies to namespace
 * names).
 */
const DNS1123_LABEL = /^[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?$/

export interface NamespaceProps {
  /** Namespace name — DNS-1123 label (lowercase alphanumerics and '-') */
  name: string
  /**
   * Emit the `v1/Namespace` resource so the rendered output is
   * self-contained (kubectl apply / Flux creates the namespace as part of
   * the same manifest). Default: true. Set false when the namespace is
   * managed elsewhere (GitOps repo convention, existing tenant setup).
   */
  create?: boolean
  /** Components scoped to this namespace */
  children?: unknown
}

/**
 * Namespace scope — composable cluster partitioning.
 *
 * Everything below inherits the namespace: <App>, <Database>, <WebService>,
 * <Endpoint>, <Auth>, <StaticSecret> and every app package read it through
 * useNamespace(). Nest to partition a cluster — the innermost scope wins,
 * explicit `namespace` props on a component still override the scope:
 *
 * @example
 * import { Platform, Namespace, App, Database } from '@r8s/recipes'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Namespace name="team-a">
 *       <App name="api" image="myorg/api:v1" host="api.example.com" />
 *       <Database name="api-db" backup={false} />
 *     </Namespace>
 *     <Namespace name="team-b">
 *       <App name="billing" image="myorg/billing:v2" host="billing.example.com" />
 *     </Namespace>
 *   </Platform>
 * )
 *
 * @title Namespace
 * @category Cluster Foundation
 */
export function Namespace(props: NamespaceProps) {
  const { name, create = true, children } = props
  const ambient = useContext(NamespaceContext)

  // Guard the type as well as the shape: a non-string (e.g. `undefined` from a
  // mistyped caller) would marshal through String() and could sneak past the
  // regexp as a bogus literal.
  if (typeof name !== 'string' || !DNS1123_LABEL.test(name)) {
    const suggestion =
      typeof name === 'string'
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 63) || 'my-namespace'
        : 'my-namespace'
    throw new Error(
      `Namespace "${String(name)}" is not a valid DNS-1123 label.\n` +
        `\n` +
        `Namespace names must be lowercase alphanumeric or '-', start and end\n` +
        `with an alphanumeric, and be at most 63 characters.\n` +
        `\n` +
        `Fix: <Namespace name="${suggestion}" />`
    )
  }

  const scoped = jsx(NamespaceContext.Provider, { value: name, children })

  if (!create || ambient === name) {
    // Opt-out, the always-existing 'default', or an enclosing scope with the
    // same name already emits it — the renderer does not dedupe and Flux
    // rejects duplicate resource ids.
    return [scoped]
  }

  return [
    jsx('Namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name },
    }),
    scoped,
  ]
}
