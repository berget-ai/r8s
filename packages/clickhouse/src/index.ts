import { jsx } from '@r8s/core';
import { helmOperator } from '@r8s/k8s-types';

/** ClickHouse Operator declaration */
export const clickhouseOperator = (version = '0.23.0') =>
  helmOperator(
    'clickhouse-operator',
    'clickhouse-operator-helm',
    'https://docs.altinity.com/clickhouse-operator/',
    version,
    {
      description: 'ClickHouse Operator for Kubernetes by Altinity',
      namespace: 'clickhouse-operator-system',
      crds: [
        'clickhouseinstallations.clickhouse.altinity.com',
        'clickhouseinstallationtemplates.clickhouse.altinity.com',
        'clickhouseoperatorconfigurations.clickhouse.altinity.com',
      ],
    }
  );

export interface ClickHouseClusterProps {
  /** Resource name */
  name: string;
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string;
  /** Cluster topology — number of shards and replicas per shard */
  cluster?: {
    layout?: {
      shardsCount?: number;
      replicasCount?: number;
    };
  };
  /** ZooKeeper cluster used for ClickHouse replication and coordination */
  zookeeper?: {
    nodes?: Array<{ host: string; port?: number }>;
  };
  /** ClickHouse users to create, keyed by username (each can have password, profile, quota, and grants) */
  users?: Record<
    string,
    {
      password?: string;
      profile?: string;
      quota?: string;
      networks?: { ip?: string[] };
      grants?: { query?: string[] };
    }
  >;
  /** ClickHouse user profiles (settings) keyed by profile name */
  profiles?: Record<string, Record<string, string>>;
  /** ClickHouse quotas keyed by quota name */
  quotas?: Record<string, Record<string, string>>;
  /** Pod and persistent-volume templates for customizing how ClickHouse pods run and store data */
  templates?: {
    podTemplates?: Array<{
      name: string;
      spec: {
        containers: Array<{
          name: string;
          image: string;
          resources?: {
            requests?: { cpu?: string; memory?: string };
            limits?: { cpu?: string; memory?: string };
          };
        }>;
      };
    }>;
    volumeClaimTemplates?: Array<{
      name: string;
      spec: {
        accessModes: string[];
        resources: {
          requests: { storage: string };
        };
      };
    }>;
  };
}

/**
 * ClickHouse cluster using ClickHouse Operator.
 *
 * @example
 * <ClickHouseCluster
 *   name="analytics"
 *   namespace="production"
 *   cluster={{
 *     layout: { shardsCount: 2, replicasCount: 2 }
 *   }}
 * />
 */
export function ClickHouseCluster(props: ClickHouseClusterProps) {
  const {
    name,
    namespace = 'default',
    cluster,
    zookeeper,
    users,
    profiles,
    quotas,
    templates,
  } = props;

  const chi = {
    apiVersion: 'clickhouse.altinity.com/v1',
    kind: 'ClickHouseInstallation',
    metadata: { name, namespace },
    spec: {
      configuration: {
        ...(cluster && {
          clusters: [
            {
              name: 'cluster',
              ...(cluster.layout && {
                layout: cluster.layout,
              }),
            },
          ],
        }),
        ...(zookeeper && {
          zookeeper: {
            nodes: zookeeper.nodes,
          },
        }),
        ...(users && { users }),
        ...(profiles && { profiles }),
        ...(quotas && { quotas }),
      },
      ...(templates && {
        templates: {
          ...(templates.podTemplates && {
            podTemplates: templates.podTemplates,
          }),
          ...(templates.volumeClaimTemplates && {
            volumeClaimTemplates: templates.volumeClaimTemplates,
          }),
        },
      }),
    },
  };

  return jsx('ClickHouseInstallation', chi);
}
