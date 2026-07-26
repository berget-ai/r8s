import { jsx, useContext, declareOperator } from '@r8s/core';
import type { Cluster as ClusterType } from '@r8s/k8s-types';
import { ClusterContext, OperatorContext } from '@r8s/core/defaults';
import { cnpgOperator } from './operators';

export interface ClusterProps {
  /** Resource name */
  name: string;
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string;
  /** Storage size (e.g., '50Gi') for the shared PostgreSQL data volume */
  storage?: string;
  /** Database components rendered as children will share this cluster */
  children?: unknown;
}

/**
 * Shared PostgreSQL cluster for multiple databases.
 *
 * @title Database Cluster
 * @category Data & Analytics
 *
 * Wrap multiple Database components to share one CNPG cluster,
 * reducing resource usage and simplifying management.
 *
 * @example
 * // Shared cluster with multiple databases
 * <Cluster name="main" storage="100Gi">
 *   <Database name="user-db" />
 *   <Database name="order-db" />
 *   <Database name="inventory-db" />
 * </Cluster>
 *
 * @example
 * // Each app gets its own cluster (default behavior)
 * <Database name="user-db" storage="10Gi" />
 * <Database name="order-db" storage="10Gi" />
 */
export function Cluster(props: ClusterProps) {
  const { name, namespace = 'default', storage = '50Gi', children } = props;

  const sharedOperators = useContext(OperatorContext);
  const hasCNPG = sharedOperators.some((op) => op.name === 'cnpg');

  const secretName = `${name}-db-credentials`;

  const cluster: ClusterType = {
    apiVersion: 'postgresql.cnpg.io/v1',
    kind: 'Cluster',
    metadata: { name, namespace },
    spec: {
      instances: 3,
      storage: {
        size: storage,
      },
      monitoring: {
        enabled: true,
      },
    },
  };

  const resources: ReturnType<typeof jsx>[] = [];

  if (!hasCNPG) {
    resources.push(declareOperator(cnpgOperator()));
  }

  resources.push(jsx('Cluster', cluster));

  if (children) {
    resources.push(
      jsx(ClusterContext.Provider, {
        value: {
          name,
          namespace,
          storage,
          host: `${name}-rw`,
          secretName,
          passwordSecret: { name: secretName, key: 'password' },
        },
        children,
      })
    );
  }

  return resources;
}
