/**
 * @r8s/example — template for new operator packages.
 *
 * This is a fictional but complete operator integration. Copy this directory,
 * rename it, and replace the marked sections. The full walkthrough lives in
 * the docs: https://r8s.berget.ai/adding-packages
 *
 * A package has three jobs:
 *   1. Declare the operator it needs (how to install it, which CRDs it provides)
 *   2. Export typed components that render the operator's CRDs
 *   3. Prove both with tests
 */

import { jsx, useContext, declareOperator } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import { helmOperator } from '@r8s/k8s-types'

// ─── 1. Operator declaration ─────────────────────────────────────────────────
//
// Every package exports an operator factory with the version pinned as a
// default parameter. Users can override the version, but the default must
// always point at a tested, known-good release.
//
// Use the helper matching how the operator is installed:
//   helmOperator(name, chart, repository, version, options)     — Helm chart
//   manifestOperator(name, url, version, options)               — plain YAML URL
//   olmOperator(name, packageName, channel, version, options)   — OLM/OperatorHub
//
// The `crds` array lists every CRD the operator provides. It powers
// `r8s render --include-operators` and tells users exactly what lands in
// their cluster.

/** Example Operator declaration (fictional — replace with your operator) */
export const exampleOperator = (version = '1.0.0') =>
  helmOperator(
    'example-operator', // operator name — unique across all packages
    'example-operator', // Helm chart name
    'https://charts.example.com/', // Helm repository URL
    version,
    {
      description: 'Example Operator — replace with a real description',
      namespace: 'example-operator-system',
      crds: ['widgets.example.com'],
    }
  )

// ─── 2. Component ────────────────────────────────────────────────────────────
//
// Components are plain TypeScript functions. They:
//   - take a typed props interface (every prop documented with JSDoc —
//     the docs site generates its prop tables from these comments)
//   - declare their operator dependency via declareOperator(), unless it
//     was already provided through <Platform operators={[...]}>
//   - return jsx('KindName', resource) where resource is the CRD manifest
//
// The JSDoc @example block is not decoration: the docs generator renders it
// and shows the resulting YAML on the package page. Keep it runnable.

export interface WidgetProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Number of widget replicas */
  replicas?: number
}

/**
 * Widget — fictional example resource.
 *
 * Declares the example-operator dependency automatically unless already
 * provided via OperatorContext (e.g. inside a <Platform>).
 *
 * @example
 * <Widget name="my-widget" namespace="production" replicas={3} />
 */
export function Widget(props: WidgetProps) {
  const { name, namespace = 'default', replicas = 1 } = props

  // Skip the declaration if the operator is already provided via context —
  // this is what makes <Platform operators={[...]}> deduplication work.
  const sharedOperators = useContext(OperatorContext)
  const hasOperator = sharedOperators.some((op) => op.name === 'example-operator')

  const widget = {
    apiVersion: 'example.com/v1',
    kind: 'Widget',
    metadata: { name, namespace },
    spec: { replicas },
  }

  return [!hasOperator && declareOperator(exampleOperator()), jsx('Widget', widget)]
}
