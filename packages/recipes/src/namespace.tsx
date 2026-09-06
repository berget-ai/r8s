import { jsx } from '@r8s/core'
import { NamespaceContext } from '@r8s/core/defaults'

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

  if (!DNS1123_LABEL.test(name)) {
    throw new Error(
      `Namespace "${name}" is not a valid DNS-1123 label.\n` +
        `\n` +
        `Namespace names must be lowercase alphanumeric or '-', start and end\n` +
        `with an alphanumeric, and be at most 63 characters.\n` +
        `\n` +
        `Fix: <Namespace name="${
          name
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 63) || 'my-namespace'
        }" />`
    )
  }

  const scoped = jsx(NamespaceContext.Provider, { value: name, children })

  if (!create) {
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
