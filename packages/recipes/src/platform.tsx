import { jsx, useContext } from '@r8s/core';
import { RoutingContext, Namespace, Labels, OperatorContext } from '@r8s/core/defaults';
import type { Operator } from '@r8s/k8s-types';

export type RoutingMode = 'ingress' | 'gateway';

export interface PlatformProps {
  /**
   * Routing implementation for the cluster.
   * - 'ingress': nginx Ingress (default)
   * - 'gateway': Envoy Gateway (Gateway API)
   */
  routing?: RoutingMode;
  /** Gateway class name (only used when routing='gateway', default: 'eg') */
  gatewayClassName?: string;
  /** Default namespace for all child resources */
  namespace?: string;
  /** Default labels applied to all child resources */
  labels?: Record<string, string>;
  /** Shared operators for all child resources */
  operators?: Operator[];
  /** Child components that inherit the cluster-level configuration this Platform sets */
  children?: unknown;
}

/**
 * Platform — cluster-level configuration wrapper.
 *
 * @title Platform
 * @category Cluster Configuration
 *
 * Sets routing mode, namespace, labels, and shared operators for all
 * child components. Use this once at the top of your manifest instead
 * of manually wiring context providers.
 *
 * @example
 * // Envoy Gateway cluster
 * <Platform routing="gateway" namespace="production">
 *   <App name="api" image="myapp/api:v1" host="api.example.com" />
 *   <App name="web" image="myapp/web:v1" host="app.example.com" />
 * </Platform>
 *
 * @example
 * // nginx Ingress cluster (default)
 * <Platform namespace="production">
 *   <App name="api" image="myapp/api:v1" host="api.example.com" />
 * </Platform>
 *
 * @example
 * // With shared operators
 * <Platform
 *   routing="gateway"
 *   namespace="production"
 *   operators={[cnpgOperator(), certManagerOperator()]}
 * >
 *   <Database name="app-db" storage="10Gi" />
 *   <App name="api" image="myapp/api:v1" host="api.example.com" />
 * </Platform>
 */
export function Platform(props: PlatformProps) {
  const {
    routing = 'ingress',
    gatewayClassName = 'eg',
    namespace,
    labels,
    operators,
    children,
  } = props;

  let result: unknown = children;

  // Apply operators context (outermost so all children share)
  if (operators && operators.length > 0) {
    result = jsx(OperatorContext.Provider, { value: operators, children: result });
  }

  // Apply labels context
  if (labels) {
    result = jsx(Labels.Provider, { value: labels, children: result });
  }

  // Apply namespace context
  if (namespace) {
    result = jsx(Namespace.Provider, { value: namespace, children: result });
  }

  // Apply routing context (innermost — closest to children)
  result = jsx(RoutingContext.Provider, {
    value: { mode: routing, gatewayClassName },
    children: result,
  });

  return result;
}
