import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  WebService,
  Endpoint,
  StaticSecret,
  canProvisionSecrets,
  secretsRequiredError,
  useS3,
  type DatabaseProps,
} from '@r8s/recipes'

export interface ForgejoActionsProps {
  /** Runner replicas (default 1 — runners are stateless, scale freely) */
  replicas?: number
  /** forgejo-runner image tag (default '6.3.1' — pinned, 'latest' rejected) */
  version?: string
  /**
   * Pre-created Secret holding the runner registration token (key:
   * `registration-token`). Copy the token from Forgejo (Site administration
   * → Actions → Runners → Create registration token) into your secrets
   * store at `<path>/<name>/runner-registration-token` — the backend then
   * provisions the Secret — or reference an existing Secret here.
   */
  registrationTokenSecretName?: string
  /** Runner job labels (default: forgejo runner-images ubuntu-latest) */
  labels?: string[]
}

export interface ForgejoProps {
  /** Resource name (defaults to 'forgejo') */
  name?: string
  /** Kubernetes namespace (inherited from <Platform>/<Namespace> unless set) */
  namespace?: string
  /**
   * Forgejo image tag (defaults to '11' — tracks patch releases within the
   * major). PINNED VERSION REQUIRED — 'latest' is rejected.
   */
  version?: string
  /** Public hostname (required) — web UI, git-over-HTTPS and the advertised SSH host */
  host: string
  /**
   * Repository data on an RWO PVC mounted at /data. Defaults to '20Gi'.
   * Pass `false` to manage storage yourself. Forgejo is single-replica:
   * repos, LFS (pvc mode) and attachments live on this volume.
   */
  storage?: string | { size?: string; storageClass?: string } | false
  /** CNPG cluster name (also the database and user name). Defaults to 'forgejo-db' */
  dbName?: string
  /** Number of CNPG instances (defaults to 2) */
  dbInstances?: number
  /** CNPG data volume size (defaults to '20Gi') */
  dbStorage?: string
  /** CNPG storage class (defaults to cluster default) */
  dbStorageClass?: string
  /** CNPG backup passthrough — defaults to **enabled** via the platform's S3Provider; `false` opts out */
  backup?: DatabaseProps['backup']
  /**
   * LFS storage. `'s3'` derives bucket and credentials from the S3Provider
   * (the default when one is in scope), `'pvc'` keeps large files on the
   * data volume (the fallback without an S3Provider), `false` disables LFS.
   */
  lfs?: 's3' | 'pvc' | false
  /**
   * Actions runners — enabled by default (a GitHub-like forge ships
   * Actions). Each runner is a forgejo-runner Deployment with a
   * docker-in-docker sidecar (privileged — run untrusted-code runners in a
   * dedicated namespace/node pool). `false` opts out.
   */
  actions?: ForgejoActionsProps | true | false
  /** Open registration (default false — private forge; open deliberately) */
  registration?: boolean
  /** Expose Prometheus /metrics (default false) */
  metrics?: boolean
  /**
   * Reference a pre-created Secret holding `SECRET_KEY`, `INTERNAL_TOKEN`
   * and `LFS_JWT_SECRET` instead of backend provisioning.
   */
  credentialsSecretName?: string
  /** Extra annotations merged onto the Endpoint */
  endpointAnnotations?: Record<string, string>
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
  /**
   * SSH over a dedicated LoadBalancer Service (default: enabled, port 22).
   * `port` changes the external port AND the port advertised in clone
   * URLs; `annotations` merge onto the Service (MetalLB pools etc.).
   * `false` = git over HTTPS only.
   */
  ssh?: { port?: number; annotations?: Record<string, string> } | false
  /** Operator version override (CNPG) */
  operatorVersion?: string
}

/** Default runner job label — Forgejo's own runner images */
const DEFAULT_RUNNER_LABELS = [
  'docker:docker://code.forgejo.org/forgejo/runner-images:ubuntu-latest',
]

/**
 * Forgejo — self-hosted git forge (GitHub-like: repos, PRs, Actions
 * runners, LFS).
 *
 * @title Forgejo
 * @category Developer Tools
 *
 * Composes:
 * - Forgejo Deployment (single replica + Recreate — repos live on an RWO
 *   PVC at /data) with env-to-ini wiring (FORGEJO__section__KEY)
 * - CNPG Postgres cluster (2 instances) with backups on by default via the
 *   platform S3Provider
 * - LFS on S3 when an S3Provider is in scope (PVC fallback otherwise)
 * - Actions runners by default: forgejo-runner + docker-in-docker sidecar,
 *   registered via a token from the secrets backend
 * - Credential bundle (SECRET_KEY, INTERNAL_TOKEN, LFS_JWT_SECRET)
 *   provisioned through the Platform secrets backend with rotation restart
 * - Endpoint with TLS + generous proxy limits (LFS uploads, repo pushes)
 * - SSH over a dedicated LoadBalancer Service (git clone git@…)
 *
 * @example
 * import { Platform, Namespace, S3Provider, MinIO } from '@r8s/recipes'
 * import { Forgejo } from '@r8s/forgejo'
 *
 * // Backups + LFS derive from the S3Provider; runners ship by default
 * export default (
 *   <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>
 *     <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'forgejo' }}>
 *       <Namespace name="git">
 *         <Forgejo host="git.example.com" />
 *       </Namespace>
 *     </Platform>
 *   </S3Provider>
 * )
 */
export function Forgejo(props: ForgejoProps) {
  const {
    name = 'forgejo',
    namespace: namespaceProp,
    version = '11',
    host,
    storage = '20Gi',
    dbName = 'forgejo-db',
    dbInstances = 2,
    dbStorage = '20Gi',
    dbStorageClass,
    backup,
    lfs,
    actions = true,
    registration = false,
    metrics = false,
    credentialsSecretName,
    endpointAnnotations = {},
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
    ssh = {},
    operatorVersion,
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const s3 = useS3()
  const resources_: ReturnType<typeof jsx>[] = []

  if (version === 'latest') {
    throw new Error(
      `Forgejo "${name}" requires a pinned version.\n` +
        `\n` +
        `A git forge holds your entire history — an untested floating tag can\n` +
        `break migrations on upgrade.\n` +
        `\n` +
        `Fix: <Forgejo version="11" ... />`
    )
  }

  // --- Credential bundle (SECRET_KEY, INTERNAL_TOKEN, LFS_JWT_SECRET) --------
  const credentialsName = credentialsSecretName ?? `${name}-credentials`
  if (!credentialsSecretName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Forgejo',
        name,
        'the instance credential bundle (SECRET_KEY, INTERNAL_TOKEN, LFS_JWT_SECRET)',
        {
          propName: 'credentialsSecretName',
          exampleValue: `${name}-credentials`,
          keys: ['SECRET_KEY', 'INTERNAL_TOKEN', 'LFS_JWT_SECRET'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-credentials`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}`,
        secretName: credentialsName,
        keys: ['SECRET_KEY', 'INTERNAL_TOKEN', 'LFS_JWT_SECRET'],
        restart: [{ kind: 'Deployment', name }],
      })
    )
  }

  // --- LFS storage: S3 when a provider is in scope, PVC otherwise ------------
  const lfsMode = lfs === undefined ? (s3 ? 's3' : 'pvc') : lfs
  if (lfsMode === 's3' && !s3) {
    throw new Error(
      `Forgejo "${name}": lfs='s3' requires an <S3Provider> in scope.\n` +
        `\n` +
        `Add one to the Platform (bucket and credentials derive from it):\n` +
        `  <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n` +
        `\n` +
        `or keep LFS on the data volume: <Forgejo lfs="pvc" />`
    )
  }
  if (lfsMode === 's3' && !s3!.credentialsSecret) {
    throw new Error(
      `Forgejo "${name}": the S3Provider has no credentialsSecret — LFS on S3 needs the bucket credentials.`
    )
  }
  if (lfsMode === 'pvc' && !storage) {
    throw new Error(
      `Forgejo "${name}": lfs='pvc' with storage={false} writes LFS files to ephemeral\n` +
        `container storage — they would be lost on pod restart. LFS on PVC lives on the /data volume.\n` +
        `\n` +
        `Fix: give the instance storage (<Forgejo storage="20Gi" />),\n` +
        `put LFS on S3 via an <S3Provider>, or disable LFS explicitly:\n` +
        `  <Forgejo storage={false} lfs={false} />`
    )
  }
  const lfsEnabled = lfsMode !== false
  // MinIO clients want host:port without scheme + an explicit SSL flag
  const minioEndpoint = s3 ? s3.endpoint.replace(/^https?:\/\//, '') : ''
  const minioUseSsl = s3 ? (s3.endpoint.startsWith('https') ? 'true' : 'false') : 'false'

  // --- Actions runners (default on) ------------------------------------------
  const actionsEnabled = actions !== false
  const actionsCfg = actions === true || actions === false ? {} : actions
  const runnerName = `${name}-runner`
  const runnerTokenSecret = actionsCfg.registrationTokenSecretName ?? `${name}-runner-registration`
  if (actionsEnabled && !actionsCfg.registrationTokenSecretName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Forgejo',
        name,
        'an Actions runner registration token (Forgejo admin UI → Actions → Runners → Create registration token)',
        {
          propName: 'actions.registrationTokenSecretName',
          exampleValue: `${name}-runner-registration`,
          keys: ['registration-token'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-runner-registration`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/runner-registration-token`,
        secretName: runnerTokenSecret,
        keys: ['registration-token'],
      })
    )
  }

  // --- Env-to-ini wiring -------------------------------------------------------
  // Every credential is delivered via secretKeyRef — no plaintext in the
  // manifest. FORGEJO__section__KEY maps onto app.ini at boot.
  const sshEnabled = ssh !== false
  const sshCfg = ssh === false ? {} : ssh
  const env: Record<string, string> = {
    FORGEJO__server__DOMAIN: host,
    FORGEJO__server__ROOT_URL: `https://${host}`,
    FORGEJO__server__HTTP_PORT: '3000',
    ...(sshEnabled
      ? {
          FORGEJO__server__SSH_DOMAIN: host,
          FORGEJO__server__SSH_LISTEN_PORT: '22',
          FORGEJO__server__SSH_PORT: String(sshCfg.port ?? 22),
        }
      : { FORGEJO__server__DISABLE_SSH: 'true' }),
    FORGEJO__database__DB_TYPE: 'postgres',
    FORGEJO__database__HOST: `${dbName}-rw.${namespace}.svc.cluster.local:5432`,
    FORGEJO__database__NAME: dbName,
    FORGEJO__database__USER: dbName,
    FORGEJO__database__SSL_MODE: 'disable',
    FORGEJO__security__INSTALL_LOCK: 'true',
    FORGEJO__service__DISABLE_REGISTRATION: registration ? 'false' : 'true',
    ...(lfsEnabled ? { FORGEJO__lfs__ENABLED: 'true' } : {}),
    ...(lfsMode === 's3'
      ? {
          'FORGEJO__storage.lfs__STORAGE_TYPE': 'minio',
          'FORGEJO__storage.lfs__MINIO_ENDPOINT': minioEndpoint,
          'FORGEJO__storage.lfs__MINIO_USE_SSL': minioUseSsl,
          'FORGEJO__storage.lfs__MINIO_BUCKET_LOOKUP_TYPE': s3!.forcePathStyle ? 'path' : 'dns',
          'FORGEJO__storage.lfs__MINIO_BUCKET': s3!.bucket,
        }
      : {}),
    ...(metrics ? { FORGEJO__metrics__ENABLED: 'true' } : {}),
    ...(actionsEnabled ? { FORGEJO__actions__ENABLED: 'true' } : {}),
  }

  const secrets: Record<string, { secret: string; key: string }> = {
    FORGEJO__database__PASSWD: { secret: `${dbName}-db-credentials`, key: 'password' },
    FORGEJO__security__SECRET_KEY: { secret: credentialsName, key: 'SECRET_KEY' },
    FORGEJO__security__INTERNAL_TOKEN: { secret: credentialsName, key: 'INTERNAL_TOKEN' },
    ...(lfsEnabled
      ? { FORGEJO__lfs__LFS_JWT_SECRET: { secret: credentialsName, key: 'LFS_JWT_SECRET' } }
      : {}),
    ...(lfsMode === 's3'
      ? {
          'FORGEJO__storage.lfs__MINIO_ACCESS_KEY_ID': {
            secret: s3!.credentialsSecret!,
            key: 'access-key-id',
          },
          'FORGEJO__storage.lfs__MINIO_SECRET_ACCESS_KEY': {
            secret: s3!.credentialsSecret!,
            key: 'secret-access-key',
          },
        }
      : {}),
  }

  // --- Repository data volume --------------------------------------------------
  if (storage) {
    const size = typeof storage === 'string' ? storage : (storage.size ?? '20Gi')
    const storageClass = typeof storage === 'object' ? storage.storageClass : undefined
    resources_.push(
      jsx('PersistentVolumeClaim', {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: { name: `${name}-data`, namespace },
        spec: {
          accessModes: ['ReadWriteOnce'],
          ...(storageClass ? { storageClassName: storageClass } : {}),
          resources: { requests: { storage: size } },
        },
      })
    )
  }

  resources_.push(
    jsx(Database, {
      name: dbName,
      namespace,
      instances: dbInstances,
      storage: dbStorage,
      ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
      backup: backup ?? true,
      operatorVersion,
    }),
    jsx(WebService, {
      name,
      namespace,
      image: `codeberg.org/forgejo/forgejo:${version}`,
      port: 3000,
      replicas: 1,
      strategy: 'Recreate',
      resources: {
        requests: { memory: '512Mi', cpu: '250m' },
        limits: { memory: '2Gi', cpu: '2' },
      },
      env,
      secrets,
      volumes: storage
        ? [{ name: 'data', persistentVolumeClaim: { claimName: `${name}-data` } }]
        : [],
      volumeMounts: storage ? [{ name: 'data', mountPath: '/data' }] : [],
      probes: {
        // Upgrades run schema migrations — give the startup probe room
        startup: { path: '/api/healthz', periodSeconds: 5, failureThreshold: 60 },
        readiness: { path: '/api/healthz', periodSeconds: 10, failureThreshold: 3 },
        liveness: { path: '/api/healthz', periodSeconds: 30, failureThreshold: 3 },
      },
    }),
    jsx(Endpoint, {
      name: `${name}-endpoint`,
      namespace,
      host,
      serviceName: name,
      servicePort: 80,
      annotations: {
        // LFS uploads and repo pushes can be large and slow
        'nginx.ingress.kubernetes.io/proxy-body-size': '512m',
        'nginx.ingress.kubernetes.io/proxy-read-timeout': '900',
        'nginx.ingress.kubernetes.io/proxy-send-timeout': '900',
        ...endpointAnnotations,
      },
      tls,
    })
  )

  // --- SSH over a dedicated LoadBalancer (git clone git@…) ---------------------
  if (sshEnabled) {
    resources_.push(
      jsx('Service', {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${name}-ssh`,
          namespace,
          ...(sshCfg.annotations ? { annotations: sshCfg.annotations } : {}),
        },
        spec: {
          type: 'LoadBalancer',
          selector: { app: name },
          ports: [{ name: 'ssh', port: sshCfg.port ?? 22, targetPort: 22, protocol: 'TCP' }],
        },
      })
    )
  }

  // --- Actions runner: forgejo-runner + docker-in-docker ----------------------------
  if (actionsEnabled) {
    const runnerLabels = actionsCfg.labels ?? DEFAULT_RUNNER_LABELS
    const runnerConfig = [
      'runner:',
      '  file: /runner/.runner',
      '  capacity: 2',
      '  timeout: 3h',
      '  labels:',
      ...runnerLabels.map((l) => `    - '${l}'`),
      'container:',
      '  docker_host: unix:///var/run/docker.sock',
      '  privileged: false',
    ].join('\n')

    resources_.push(
      jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: `${name}-runner-config`, namespace },
        data: { 'config.yaml': runnerConfig },
      }),
      jsx('Deployment', {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: { name: runnerName, namespace },
        spec: {
          replicas: actionsCfg.replicas ?? 1,
          selector: { matchLabels: { app: runnerName } },
          template: {
            metadata: { labels: { app: runnerName } },
            spec: {
              // the runner talks to Forgejo over HTTPS, never the kube API —
              // don't hand a privileged (dind) pod API credentials for free
              automountServiceAccountToken: false,
              volumes: [
                { name: 'runner', emptyDir: {} },
                { name: 'config', configMap: { name: `${name}-runner-config` } },
                { name: 'docker-sock', emptyDir: {} },
              ],
              initContainers: [
                {
                  name: 'runner-register',
                  image: `code.forgejo.org/forgejo/runner:${actionsCfg.version ?? '6.3.1'}`,
                  command: ['sh', '-c'],
                  args: [
                    'forgejo-runner register --instance "$INSTANCE_URL" --token "$REGISTRATION_TOKEN" --name "$RUNNER_NAME" --no-interactive',
                  ],
                  env: [
                    { name: 'INSTANCE_URL', value: `https://${host}` },
                    {
                      name: 'RUNNER_NAME',
                      valueFrom: { fieldRef: { fieldPath: 'metadata.name' } },
                    },
                    {
                      name: 'REGISTRATION_TOKEN',
                      valueFrom: {
                        secretKeyRef: { name: runnerTokenSecret, key: 'registration-token' },
                      },
                    },
                  ],
                  workingDir: '/runner',
                  volumeMounts: [{ name: 'runner', mountPath: '/runner' }],
                },
              ],
              containers: [
                {
                  name: 'runner',
                  image: `code.forgejo.org/forgejo/runner:${actionsCfg.version ?? '6.3.1'}`,
                  command: ['forgejo-runner', 'daemon', '--config', '/runner-config/config.yaml'],
                  env: [{ name: 'DOCKER_HOST', value: 'unix:///var/run/docker.sock' }],
                  volumeMounts: [
                    { name: 'runner', mountPath: '/runner' },
                    { name: 'config', mountPath: '/runner-config' },
                    { name: 'docker-sock', mountPath: '/var/run' },
                  ],
                  resources: {
                    requests: { memory: '256Mi', cpu: '100m' },
                    limits: { memory: '1Gi', cpu: '1' },
                  },
                },
                {
                  name: 'dind',
                  image: 'docker:27-dind',
                  env: [{ name: 'DOCKER_TLS_CERTDIR', value: '' }],
                  securityContext: { privileged: true },
                  volumeMounts: [{ name: 'docker-sock', mountPath: '/var/run' }],
                  resources: {
                    requests: { memory: '512Mi', cpu: '250m' },
                    limits: { memory: '4Gi', cpu: '2' },
                  },
                },
              ],
            },
          },
        },
      })
    )
  }

  return jsx(Fragment, { children: resources_ })
}
