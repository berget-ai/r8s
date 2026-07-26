import { jsx, declareOperator, useContext } from '@r8s/core';
import { Cluster, Pooler, ScheduledBackup } from '@r8s/k8s-types';
import { OperatorContext } from '@r8s/core/defaults';
import { cnpgOperator } from './operators';

export interface PostgresProps {
  /** Resource name */
  name: string;
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string;
  /** Initial database name (defaults to 'app') */
  database?: string;
  /** Initial database owner/username (defaults to 'app') */
  user?: string;
  /** Plaintext password for the user — if provided, a Secret is created automatically */
  password?: string;
  /** Name of an existing Kubernetes Secret holding the password (skips auto-creation) */
  passwordSecretName?: string;
  /** Storage size (e.g., '10Gi') for the PostgreSQL data volume */
  storage?: string;
  /** Kubernetes StorageClass to use for the data volume */
  storageClass?: string;
  /** Number of PostgreSQL instances in the HA cluster (defaults to 3) */
  instances?: number;
  /** PostgreSQL container image (defaults to a CNPG-pinned Postgres 16 image) */
  image?: string;
  /** CPU and memory requests/limits for the Postgres pods */
  resources?: {
    requests?: { memory?: string; cpu?: string };
    limits?: { memory?: string; cpu?: string };
  };
  /** Enable PgBouncer connection pooling alongside the cluster */
  enablePooler?: boolean;
  /** Number of PgBouncer pooler replicas */
  poolerInstances?: number;
  /** PgBouncer pooling mode — 'session' keeps a backend per client, 'transaction' multiplexes them */
  poolMode?: 'session' | 'transaction';
  /** Enable scheduled backups of the cluster */
  enableBackup?: boolean;
  /** Cron expression for the backup schedule (defaults to '0 2 * * *' = daily at 2 AM) */
  backupSchedule?: string;
  /** How long to keep backups (e.g., '7d') */
  backupRetention?: string;
  /** Extra postgresql.conf parameters (key/value) applied to the cluster */
  postgresqlParameters?: Record<string, string>;
}

export function Postgres(props: PostgresProps) {
  const {
    name,
    namespace = 'default',
    database = 'app',
    user = 'app',
    password,
    passwordSecretName,
    storage = '10Gi',
    storageClass,
    instances = 3,
    image = 'ghcr.io/cloudnative-pg/postgresql:16.2',
    resources: resourceConfig = {
      requests: { memory: '512Mi', cpu: '500m' },
      limits: { memory: '1Gi', cpu: '1000m' },
    },
    enablePooler = false,
    poolerInstances = 2,
    poolMode = 'transaction',
    enableBackup = false,
    backupSchedule = '0 2 * * *',
    backupRetention = '7d',
    postgresqlParameters = {
      max_connections: '200',
      shared_buffers: '256MB',
    },
  } = props;

  // Use provided secret name or generate one
  const secretName = passwordSecretName || `${name}-credentials`;

  // Declare CNPG operator if not already provided via context
  const sharedOperators = useContext(OperatorContext);
  const hasCNPG = sharedOperators.some((op) => op.name === 'cnpg');

  const cluster: Cluster = {
    apiVersion: 'postgresql.cnpg.io/v1',
    kind: 'Cluster',
    metadata: {
      name,
      namespace,
      labels: { app: name },
    },
    spec: {
      instances,
      imageName: image,
      storage: {
        size: storage,
        ...(storageClass && { storageClass }),
      },
      bootstrap: {
        initdb: {
          database,
          owner: user,
          secret: {
            name: secretName,
          },
        },
      },
      postgresql: {
        parameters: postgresqlParameters,
      },
      resources: resourceConfig,
      affinity: {
        enablePodAntiAffinity: true,
        topologyKey: 'kubernetes.io/hostname',
      },
      failoverSwitchoverDelay: 60,
      ...(enableBackup && {
        backup: {
          enabled: true,
          retentionPolicy: backupRetention,
          schedule: backupSchedule,
        },
      }),
      monitoring: {
        enabled: true,
      },
      replicationSlots: {
        highAvailability: {
          enabled: true,
        },
      },
    },
  };

  const outputResources: ReturnType<typeof jsx>[] = [];

  // Declare CNPG operator if not already provided via context
  if (!hasCNPG) {
    outputResources.push(declareOperator(cnpgOperator()));
  }

  outputResources.push(jsx('Cluster', cluster));

  // Add Secret if password is provided directly
  if (password && !passwordSecretName) {
    outputResources.push(
      jsx('Secret', {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: secretName,
          namespace,
        },
        type: 'Opaque',
        stringData: {
          username: user,
          password,
        },
      })
    );
  }

  // Add Pooler for connection pooling
  if (enablePooler) {
    const pooler: Pooler = {
      apiVersion: 'postgresql.cnpg.io/v1',
      kind: 'Pooler',
      metadata: {
        name: `${name}-pooler`,
        namespace,
      },
      spec: {
        cluster: {
          name,
        },
        instances: poolerInstances,
        type: 'rw',
        pgbouncer: {
          poolMode,
          parameters: {
            max_client_conn: '10000',
            default_pool_size: '25',
          },
        },
      },
    };

    outputResources.push(jsx('Pooler', pooler));
  }

  // Add ScheduledBackup if enabled
  if (enableBackup) {
    const scheduledBackup: ScheduledBackup = {
      apiVersion: 'postgresql.cnpg.io/v1',
      kind: 'ScheduledBackup',
      metadata: {
        name: `${name}-backup`,
        namespace,
      },
      spec: {
        schedule: backupSchedule,
        backupOwnerReference: 'cluster',
        cluster: {
          name,
        },
      },
    };

    outputResources.push(jsx('ScheduledBackup', scheduledBackup));
  }

  return outputResources;
}
