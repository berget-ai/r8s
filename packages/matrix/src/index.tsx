import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import type { EnvVar } from '@r8s/k8s-types'
import { OperatorContext, SecretContext, useNamespace } from '@r8s/core/defaults'
import { ClusterComponent, ScheduledBackupComponent, declareCnpg } from '@r8s/operator-cnpg'
import { useS3, isBucketElement, resolveBucket, type BucketProps } from '@r8s/recipes'
import { Endpoint, StaticSecret } from '@r8s/recipes'

/** HA scheduling defaults learned from a production node-blip incident:
 *  evict within 60s (instead of the 300s default) and spread replicas
 *  across nodes so one node loss never takes an entire component down. */
const HA_TOLERATIONS = [
  {
    key: 'node.kubernetes.io/unreachable',
    operator: 'Exists',
    effect: 'NoExecute',
    tolerationSeconds: 60,
  },
  {
    key: 'node.kubernetes.io/not-ready',
    operator: 'Exists',
    effect: 'NoExecute',
    tolerationSeconds: 60,
  },
]

const haTopologySpread = (app: string) => [
  {
    maxSkew: 1,
    topologyKey: 'kubernetes.io/hostname',
    whenUnsatisfiable: 'ScheduleAnyway',
    // Scope the skew calculation to this component's pods — a constraint
    // without a selector matches every pod in the namespace.
    labelSelector: { matchLabels: { app } },
  },
]

/** URL preview SSRF hardening — block internal/private ranges (production default) */
const URL_PREVIEW_BLACKLIST = {
  url_preview_enabled: true,
  max_spider_size: '10M',
  url_preview_ip_range_blacklist: [
    '0.0.0.0/8',
    '127.0.0.0/8',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '100.64.0.0/10',
    '192.0.0.0/24',
    '192.0.2.0/24',
    '198.51.100.0/24',
    '203.0.113.0/24',
    '224.0.0.0/4',
    '240.0.0.0/4',
    '::/128',
    '::1/128',
    'fe80::/10',
    'fc00::/7',
    '2001:db8::/32',
    'ff00::/8',
    'fec0::/10',
    '169.254.0.0/16',
  ],
}

export interface MatrixSSOProps {
  /** Keycloak/OIDC issuer URL (e.g. https://keycloak.example.com/realms/berget) */
  issuer: string
  /** OIDC client id registered in the realm */
  clientId: string
  /**
   * Name of an existing Secret containing key `clientSecret`. Required unless
   * a secrets backend (openbao/vault) is configured on the surrounding
   * Platform — the backend then provisions `${name}-keycloak-oidc`.
   */
  clientSecretRef?: string
  /** Display name on the MAS login button (default: 'SSO') */
  humanName?: string
  /** OIDC scope (default: 'openid email profile') */
  scope?: string
}

export interface MatrixDatabaseProps {
  /** CNPG instances (default: 2) */
  replicas?: number
  /** Storage size per database (default: '20Gi') */
  storage?: string
  /** StorageClass name (default: cluster default) */
  storageClass?: string
  /**
   * Secure default (same contract as <Database backup>): with an
   * <S3Provider> in scope, backups are ENABLED when omitted — the whole
   * target derives from the provider. Without a provider, omitting throws
   * with guidance. Values:
   * - `<Bucket name="…"/>` descriptor — scoped destination under the S3 provider
   * - explicit object — per-field gaps derive from the surrounding S3Provider
   * - `true` — derive the whole target from the S3Provider
   * - `false` — cluster without barman (explicit opt-out)
   */
  backup?: MatrixBackupProps | true | false | { type: unknown; props: BucketProps }
}

export interface MatrixBackupProps {
  /** S3 destination BASE path per database; e.g. s3://bucket/matrix_backup (synapse-cnpg / mas-cnpg appended) */
  destinationPath?: string
  /** S3 endpoint URL (e.g. https://s3.berget.cloud) — derives from the S3 provider when omitted */
  endpointURL?: string
  /** Existing Secret with keys `access-key-id` + `secret-access-key`. Provider/Secret-backend provide it when omitted. */
  credentialsSecret?: string
  /** Retention policy (default: '30d') */
  retention?: string
  /** Cron schedule for the daily full backup (default: '30 3 * * *') */
  schedule?: string
}

export interface MatrixRTCProps {
  /** Enable MatrixRTC / LiveKit SFU (default: true) */
  enabled?: boolean
  /**
   * External IP for the SFU LoadBalancer — LiveKit needs a real IP (not DNS)
   * for ICE. Leave unset to rely on STUN discovery.
   */
  manualIP?: string
  /** TURN server port on the combined LoadBalancer (default: 30004, 0 disables) */
  turnPort?: number
  /** Extra STUN servers for client NAT traversal */
  stunServers?: string[]
  /** LiveKit image tag (default: v1.10.1 — pinned for the IPv6 ICE URL regression) */
  sfuVersion?: string
}

export interface MatrixProps {
  /** Resource name (defaults to 'matrix') */
  name?: string
  /** Kubernetes namespace (inherited from Platform context when omitted) */
  namespace?: string
  /** Base domain — derives the five public hosts (see `hosts`) */
  domain: string
  /**
   * Host overrides. Defaults:
   * web: `element.<domain>`, synapse: `matrix.<domain>`,
   * admin: `element-admin.<domain>`, account: `matrix-account.<domain>`,
   * rtc: `matrix-rtc.<domain>`
   */
  hosts?: Partial<Record<'web' | 'synapse' | 'admin' | 'account' | 'rtc', string>>
  /** Replicas for the stateless web/admin/mas/haproxy-ish layers (default: 2; synapse and SFU stay at 1 until federation workers land) */
  replicas?: number
  /** Matrix server name — becomes part of user IDs (@user:serverName). Defaults to `domain`. */
  serverName?: string
  /** SSO/OIDC upstream for MAS (Keycloak). Password login disabled when set. */
  sso?: MatrixSSOProps
  /** Per-database sizing + backup for synapse-db and mas-db */
  database?: MatrixDatabaseProps
  /**
   * Synapse signing-key/data storage. The signing key IS the server's
   * identity — it must survive pod restarts (a fresh key silently
   * de-federates rooms and invalidates every existing session), so synapse
   * gets a persistent PVC (`${name}-synapse-keys`) mounted writable at
   * /data. Synapse also writes its pid file there; media does NOT ride
   * along — it has its own dedicated volume (see `mediaStorage`).
   * - string — PVC size (default '1Gi')
   * - { size?, storageClass? } — full control
   * - false — render nothing; you manage /data yourself (e.g. a mutating
   *   policy injects your own volume)
   * @default '1Gi'
   */
  keysStorage?: string | { size?: string; storageClass?: string } | false
  /**
   * Synapse media-repository storage. Media is the large-growing data of a
   * Matrix server (uploads, avatars, thumbnails) — it must NOT share the
   * small keys volume, so it gets a dedicated PVC
   * (`${name}-synapse-media`) mounted at /data/media_store. homeserver.yaml
   * always pins `media_store_path: /data/media_store` — synapse's own
   * default (/media_store, off the container root fs) PermissionErrors on
   * read-only root filesystems.
   * - string — PVC size (default '20Gi')
   * - { size?, storageClass? } — full control
   * - false — render nothing; you manage /data/media_store yourself
   *   (e.g. a mutating policy injects your own volume)
   * @default '20Gi'
   */
  mediaStorage?: string | { size?: string; storageClass?: string } | false
  /** MatrixRTC / LiveKit SFU (Element Call backend) */
  rtc?: MatrixRTCProps
  /**
   * Appservice registrations (hookshot, bots…). Each mounts one
   * `registration.yaml` into Synapse's appservice directory.
   *
   * Two modes per entry:
   * - `registration`: inline YAML data rendered as a **Secret** (never a
   *   ConfigMap — registrations carry as_token/hs_token). Use placeholders
   *   for the tokens and let GitOps fill them, or expect the
   *   noPlaintextSecrets guardrail to flag live token values.
   * - `secretRef`: name of an existing Secret holding `registration.yaml`
   *   (key override via `key`). Nothing rendered — the preferred mode when
   *   the file lives in the secrets backend.
   */
  appservices?: (
    | { name: string; registration: Record<string, unknown>; secretRef?: never; key?: never }
    | { name: string; secretRef: string; key?: string; registration?: never }
  )[]
  /**
   * Version pinning per component (production: pin these — the defaults are
   * already pinned for known upstream regressions, and 'latest' is rejected
   * for mas/admin):
   * web: v1.12.15 (MSC4143 Authorization header fix),
   * sfu: v1.10.1 (IPv6 ICE URL fix),
   * mas: 1.24.0 (the floating 'latest' drifted from the config schema —
   *   listener resources renamed oauthapi/compatapi → oauth/compat),
   * admin: 0.1.13 (served from oci.element.io — the ghcr repo does not
   *   serve anonymous pulls)
   */
  version?: {
    synapse?: string
    mas?: string
    web?: string
    admin?: string
    sfu?: string
  }
  /** Disable the URL-preview SSRF blacklist preset (default: enabled, hardened) */
  urlPreview?: boolean
}

/**
 * Matrix — full Element Server Suite: Synapse homeserver, MAS with Keycloak
 * OIDC, Element Web + Admin, MatrixRTC/LiveKit SFU.
 *
 * @title Matrix (Element Server Suite)
 * @category Collaboration & Productivity
 *
 * Renders the whole suite with production HA defaults: two CNPG databases
 * (optional barman backups), a persistent keys volume for the Synapse
 * signing key (server identity — must survive restarts) plus a dedicated
 * media-store PVC (media is the large-growing data), 60s node-failure
 * tolerations + topology spread (learned from a real node-blip incident),
 * SSRF-hardened URL previews, and pinned component versions.
 *
 * Secrets arrive via the Platform secrets backend (openbao/vault) or the
 * `clientSecretRef`/`credentialsSecret` escape hatches — never inline.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Matrix } from '@r8s/matrix'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'matrix' }}>
 *     <Matrix
 *       domain="example.com"
 *       sso={{ issuer: 'https://keycloak.example.com/realms/berget', clientId: 'matrix' }}
 *       database={{ backup: { destinationPath: 's3://backups/matrix-cnpg', endpointURL: 'https://s3.example.com' } }}
 *     />
 *   </Platform>
 * )
 */

// ---------------------------------------------------------------------------
// Pure config builders — one per workload. The Matrix component composes
// them; keeping them pure (props in, plain object out) makes defaults easy
// to unit-test without rendering the whole tree.
// ---------------------------------------------------------------------------

function buildSynapseConfig(opts: {
  name: string
  server: string
  synapseHost: string
  urlPreview: boolean
  rtcEnabled: boolean
  appservices: NonNullable<MatrixProps['appservices']>
}): Record<string, unknown> {
  const { name, server, synapseHost, urlPreview, rtcEnabled, appservices } = opts
  return {
    server_name: server,
    public_baseurl: `https://${synapseHost}/`,
    pid_file: '/data/homeserver.pid',
    // Media always lives under /data — on the dedicated media PVC when
    // rendered (mediaStorage default), else on whatever the user manages at
    // /data. Synapse's own default (/media_store, off the container root fs)
    // PermissionErrors on read-only root filesystems (dogfood smoke round 2).
    media_store_path: '/data/media_store',
    listeners: [
      {
        port: 8008,
        tls: false,
        bind_addresses: ['::'],
        type: 'http',
        x_forwarded: true,
        resources: [
          { names: ['client', 'federation'], compress: false },
          { names: ['health'], compress: false },
        ],
      },
    ],
    database: {
      name: 'psycopg2',
      args: {
        host: `${name}-synapse-db-rw`,
        port: 5432,
        database: 'synapse',
        user: 'synapse',
        password_file: '/secrets/db/password',
        sslmode: 'prefer',
      },
    },
    report_stats: false,
    enable_registration: false,
    ...(urlPreview ? { ...URL_PREVIEW_BLACKLIST } : { url_preview_enabled: false }),
    ...(rtcEnabled && {
      experimental_features: { msc4143_rtc_transports: true },
      matrix_rtc: {
        transports: [
          {
            type: 'livekit',
            livekit_service_url: `http://${name}-sfu:7880`,
          },
        ],
      },
    }),
    appservice_config_files: appservices.map((a) => `/appservices/${a.name}.yaml`),
  }
}

function buildMasConfig(name: string, sso?: MatrixSSOProps): Record<string, unknown> {
  return {
    database: {
      uri: `postgresql://mas:$(MASPASSWORD)@${name}-mas-db-rw:5432/mas?sslmode=prefer`,
    },
    http: {
      listeners: [
        {
          name: 'web',
          // Resource names per the pinned MAS image's config schema
          // (crates/config/src/sections/http.rs — variants are lowercased):
          // the pre-rename names oauthapi/compatapi CrashLoop any current
          // image with "unknown variant ... expected one of 'oauth', 'compat'"
          resources: [
            { name: 'discovery' },
            { name: 'oauth' },
            { name: 'compat' },
            { name: 'graphql' },
          ],
          // MAS 1.24.0 requires per-listener socket binds — the pre-1.24
          // top-level port/host fields no longer parse ("missing field
          // `binds` for key default.http.listeners.0", dogfood smoke round
          // 2). Verified against the pinned release's schema
          // (crates/config/src/sections/http.rs @ v1.24.0): ListenerConfig
          // only defaults proxy_protocol/tls/prefix — `binds` is required,
          // and each entry is the untagged BindConfig enum (Listen { host?,
          // port } | Address { address: host:port } | Unix | FileDescriptor).
          // The Listen variant below reproduces the exact socket the old
          // host/port fields produced.
          binds: [{ host: '0.0.0.0', port: 8080 }],
        },
      ],
    },
    ...(sso && {
      upstream_oauth2: {
        providers: [
          {
            id: 'sso',
            issuer: sso.issuer,
            human_name: sso.humanName ?? 'SSO',
            client_id: sso.clientId,
            client_secret: '$MAS_OIDC_CLIENT_SECRET',
            token_endpoint_auth_method: 'client_secret_basic',
            scope: sso.scope ?? 'openid email profile',
            claims_imports: {
              localpart: { action: 'suggest', template: '{{ user.preferred_username }}' },
              displayname: { action: 'suggest', template: '{{ user.name }}' },
              email: { action: 'suggest', template: '{{ user.email }}' },
            },
          },
        ],
      },
      passwords: { enabled: false },
    }),
  }
}

function buildElementWebConfig(server: string, hosts: { synapse: string; rtc: string }) {
  return {
    default_server_config: {
      'm.homeserver': {
        base_url: `https://${hosts.synapse}`,
        server_name: server,
      },
      'org.matrix.msc4143.rtc_session': {
        focused_element: { focus_url: `https://${hosts.rtc}` },
      },
    },
    brand: 'Element',
    default_country_code: 'SE',
    show_labs_settings: true,
  }
}

function buildRtcConfig(rtc: MatrixRTCProps, rtcHost: string) {
  return {
    port: 7880,
    log_level: 'info',
    rtc: {
      tcp_port: 30001,
      muxed_udp_port: 30002,
      ...(rtc.manualIP
        ? { node_ip: rtc.manualIP, use_external_ip: false }
        : { use_external_ip: true }),
      ...(rtc.stunServers?.length && { stun_servers: rtc.stunServers }),
      packet_buffer_size_video: 1000,
      packet_buffer_size_audio: 400,
      batch_io: { batch_size: 256, max_flush_interval: '1ms' },
    },
    audio: { active_red_encoding: true },
    ...(rtc.turnPort !== 0 && {
      turn: {
        enabled: true,
        domain: rtcHost,
        tls_port: 0,
        udp_port: rtc.turnPort ?? 30004,
      },
    }),
    keys: 'livekit-key: $(LIVEKIT_API_SECRET)',
  }
}

function buildMasEnv(name: string, keycloakSecretName?: string): EnvVar[] {
  return [
    {
      name: 'MASPASSWORD',
      valueFrom: { secretKeyRef: { name: `${name}-mas-db-app`, key: 'password' } },
    },
    ...(keycloakSecretName
      ? [
          {
            name: 'MAS_OIDC_CLIENT_SECRET',
            valueFrom: { secretKeyRef: { name: keycloakSecretName, key: 'clientSecret' } },
          } as EnvVar,
        ]
      : []),
    {
      name: 'MAS_CONFIG_FILE',
      value: '/config/config.yaml',
    },
  ]
}

// ---------------------------------------------------------------------------
// Workload/infra resource builders — pure JSX element factories used by Matrix.
// ---------------------------------------------------------------------------

function matrixDatabaseResources(opts: {
  name: string
  namespace: string
  database: NonNullable<MatrixProps['database']>
  /** Normalized backup decision (see Matrix) — destinationPath is the per-database BASE */
  backup: MatrixBackupProps | undefined
  backupCredsSecret: string | undefined
}): ReturnType<typeof jsx>[] {
  const { name, namespace, database, backup, backupCredsSecret } = opts
  const resources: ReturnType<typeof jsx>[] = []
  const dbSpecs: {
    id: string
    roleComment: string
    params: Record<string, string>
    resources: unknown
  }[] = [
    {
      id: 'synapse',
      roleComment: 'Synapse Matrix homeserver',
      params: {
        shared_buffers: '512MB',
        max_connections: '200',
        work_mem: '16MB',
        maintenance_work_mem: '256MB',
        effective_cache_size: '1536MB',
      },
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '2Gi', cpu: '2000m' },
      },
    },
    {
      id: 'mas',
      roleComment: 'Matrix Authentication Service',
      params: {
        shared_buffers: '256MB',
        max_connections: '100',
        work_mem: '8MB',
        maintenance_work_mem: '128MB',
        effective_cache_size: '768MB',
      },
      resources: {
        requests: { memory: '512Mi', cpu: '250m' },
        limits: { memory: '1Gi', cpu: '1000m' },
      },
    },
  ]

  const backupSpecVal = backup
  for (const db of dbSpecs) {
    const clusterName = `${name}-${db.id}-db`
    const backup = backupSpecVal
      ? {
          barmanObjectStore: {
            destinationPath: `${backupSpecVal.destinationPath}/${db.id}-cnpg`,
            endpointURL: backupSpecVal.endpointURL,
            s3Credentials: {
              accessKeyId: { name: backupCredsSecret!, key: 'access-key-id' },
              secretAccessKey: { name: backupCredsSecret!, key: 'secret-access-key' },
            },
            wal: { compression: 'gzip', encryption: 'AES256', maxParallel: 2 },
            data: { compression: 'gzip', encryption: 'AES256', jobs: 2 },
          },
          retentionPolicy: backupSpecVal.retention ?? '30d',
        }
      : undefined

    resources.push(
      jsx(ClusterComponent, {
        metadata: { name: clusterName, namespace },
        spec: {
          instances: database.replicas ?? 2,
          bootstrap: {
            initdb: {
              database: db.id,
              owner: db.id,
              encoding: 'UTF8',
              localeCollate: 'C',
              localeCType: 'C',
            },
          },
          managed: {
            roles: [
              {
                name: db.id,
                ensure: 'present',
                comment: db.roleComment,
                login: true,
                superuser: false,
                createdb: false,
                createrole: false,
                inherit: true,
                replication: false,
                bypassrls: false,
              },
            ],
          },
          monitoring: { enablePodMonitor: true },
          postgresql: { parameters: db.params },
          resources: db.resources,
          storage: {
            size: database.storage ?? '20Gi',
            ...(database.storageClass && { storageClass: database.storageClass }),
          },
          ...(backup && { backup }),
        },
      })
    )

    if (backupSpecVal) {
      resources.push(
        jsx(ScheduledBackupComponent, {
          metadata: { name: `${clusterName}-backup`, namespace },
          spec: {
            cluster: { name: clusterName },
            schedule: backupSpecVal.schedule ?? '30 3 * * *',
            backupOwnerReference: 'none',
            method: 'barmanObjectStore',
          },
        })
      )
    }
  }

  return resources
}

function synapseDeployment(opts: {
  name: string
  namespace: string
  appservices: NonNullable<MatrixProps['appservices']>
  synapseVersion: string
  /** `${name}-synapse-keys` PVC claim when the keys volume is rendered (default) */
  keysClaimName: string | undefined
  /** `${name}-synapse-media` PVC claim when the media volume is rendered (default) */
  mediaClaimName: string | undefined
}): ReturnType<typeof jsx> {
  const { name, namespace, appservices, synapseVersion, keysClaimName, mediaClaimName } = opts
  const synapseEnv: EnvVar[] = [{ name: 'SYNAPSE_CONFIG_PATH', value: '/data/homeserver.yaml' }]

  return jsx('Deployment', {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: `${name}-synapse`, namespace },
    spec: {
      replicas: 1, // federation workers land separately — single writer for now
      strategy: { type: 'Recreate' },
      selector: { matchLabels: { app: `${name}-synapse` } },
      template: {
        metadata: { labels: { app: `${name}-synapse` } },
        spec: {
          tolerations: HA_TOLERATIONS,
          topologySpreadConstraints: haTopologySpread(`${name}-synapse`),
          securityContext: { fsGroup: 991, fsGroupChangePolicy: 'OnRootMismatch' },
          containers: [
            {
              name: 'synapse',
              image: `matrixdotorg/synapse:${synapseVersion}`,
              imagePullPolicy: 'IfNotPresent',
              ports: [{ containerPort: 8008, name: 'client' }],
              env: synapseEnv,
              // /data must be writable — synapse generates its signing key
              // (the server identity) there on first boot and writes the
              // pid file + media store alongside. The homeserver.yaml
              // subPath file mount layers ON TOP of the PVC mount, keeping
              // the config immutable while the keys stay persistent.
              // /tmp must be writable — readOnlyRootFilesystem + Twisted
              // tempfile buffering breaks media uploads otherwise (upstream
              // matrix-stack 26.9.0 regression)
              volumeMounts: [
                ...(keysClaimName ? [{ name: 'keys', mountPath: '/data' }] : []),
                // Dedicated media PVC layered on top of the keys volume —
                // media is the large-growing data of a Matrix server and
                // must not fill the small keys PVC (matches
                // `media_store_path` in the rendered homeserver.yaml)
                ...(mediaClaimName ? [{ name: 'media', mountPath: '/data/media_store' }] : []),
                {
                  name: 'config',
                  mountPath: '/data/homeserver.yaml',
                  subPath: 'homeserver.yaml',
                  readOnly: true,
                },
                { name: 'db-credentials', mountPath: '/secrets/db', readOnly: true },
                { name: 'tmp', mountPath: '/tmp' },
                ...appservices.map((a) => ({
                  name: `appservice-${a.name}`,
                  mountPath: `/appservices/${a.name}.yaml`,
                  subPath: a.key ?? 'registration.yaml',
                  readOnly: true,
                })),
              ],
              livenessProbe: {
                httpGet: { path: '/health', port: 8008 },
                periodSeconds: 30,
                timeoutSeconds: 5,
              },
              readinessProbe: {
                httpGet: { path: '/health', port: 8008 },
                periodSeconds: 10,
                timeoutSeconds: 3,
              },
              resources: {
                requests: { memory: '1Gi', cpu: '500m' },
                limits: { memory: '2Gi', cpu: '2000m' },
              },
            },
          ],
          volumes: [
            // CNPG generates the database credentials Secret (<cluster>-app)
            { name: 'db-credentials', secret: { secretName: `${name}-synapse-db-app` } },
            ...(keysClaimName
              ? [{ name: 'keys', persistentVolumeClaim: { claimName: keysClaimName } }]
              : []),
            ...(mediaClaimName
              ? [{ name: 'media', persistentVolumeClaim: { claimName: mediaClaimName } }]
              : []),
            { name: 'config', configMap: { name: `${name}-synapse-config` } },
            { name: 'tmp', emptyDir: { sizeLimit: '1Gi' } },
            ...appservices.map((a) => ({
              name: `appservice-${a.name}`,
              secret: {
                secretName: a.secretRef ?? `${name}-appservice-${a.name}`,
              },
            })),
          ],
        },
      },
    },
  })
}

function masDeployment(opts: {
  name: string
  namespace: string
  replicas: number
  masVersion: string
  keycloakSecretName: string | undefined
}): ReturnType<typeof jsx> {
  const { name, namespace, replicas, masVersion, keycloakSecretName } = opts
  const masEnv = buildMasEnv(name, keycloakSecretName)

  return jsx('Deployment', {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: `${name}-mas`, namespace },
    spec: {
      replicas,
      strategy: { type: 'RollingUpdate', rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } },
      selector: { matchLabels: { app: `${name}-mas` } },
      template: {
        metadata: { labels: { app: `${name}-mas` } },
        spec: {
          tolerations: HA_TOLERATIONS,
          topologySpreadConstraints: haTopologySpread(`${name}-mas`),
          containers: [
            {
              name: 'mas',
              image: `ghcr.io/element-hq/matrix-authentication-service:${masVersion}`,
              imagePullPolicy: 'IfNotPresent',
              args: ['server', '--config', '/config/config.yaml'],
              ports: [{ containerPort: 8080, name: 'http' }],
              env: masEnv,
              volumeMounts: [{ name: 'config', mountPath: '/config', readOnly: true }],
              livenessProbe: {
                httpGet: { path: '/health', port: 8080 },
                periodSeconds: 30,
                timeoutSeconds: 5,
              },
              readinessProbe: {
                httpGet: { path: '/health', port: 8080 },
                periodSeconds: 10,
                timeoutSeconds: 3,
              },
              resources: {
                requests: { memory: '256Mi', cpu: '100m' },
                limits: { memory: '512Mi', cpu: '500m' },
              },
            },
          ],
          volumes: [{ name: 'config', configMap: { name: `${name}-mas-config` } }],
        },
      },
    },
  })
}

function webDeployment(opts: {
  name: string
  namespace: string
  replicas: number
  webVersion: string
}): ReturnType<typeof jsx> {
  const { name, namespace, replicas, webVersion } = opts
  return jsx('Deployment', {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: `${name}-web`, namespace },
    spec: {
      replicas,
      selector: { matchLabels: { app: `${name}-web` } },
      template: {
        metadata: { labels: { app: `${name}-web` } },
        spec: {
          tolerations: HA_TOLERATIONS,
          topologySpreadConstraints: haTopologySpread(`${name}-web`),
          containers: [
            {
              name: 'web',
              image: `vectorim/element-web:${webVersion}`,
              imagePullPolicy: 'IfNotPresent',
              ports: [{ containerPort: 80, name: 'http' }],
              volumeMounts: [
                {
                  name: 'config',
                  mountPath: '/app/config.json',
                  subPath: 'config.json',
                  readOnly: true,
                },
              ],
              livenessProbe: { httpGet: { path: '/', port: 80 }, periodSeconds: 30 },
              readinessProbe: { httpGet: { path: '/', port: 80 }, periodSeconds: 10 },
              resources: {
                requests: { memory: '64Mi', cpu: '50m' },
                limits: { memory: '256Mi', cpu: '200m' },
              },
            },
          ],
          volumes: [{ name: 'config', configMap: { name: `${name}-web-config` } }],
        },
      },
    },
  })
}

function adminDeployment(opts: {
  name: string
  namespace: string
  replicas: number
  adminVersion: string
}): ReturnType<typeof jsx> {
  const { name, namespace, replicas, adminVersion } = opts
  return jsx('Deployment', {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: { name: `${name}-admin`, namespace },
    spec: {
      replicas,
      selector: { matchLabels: { app: `${name}-admin` } },
      template: {
        metadata: { labels: { app: `${name}-admin` } },
        spec: {
          tolerations: HA_TOLERATIONS,
          topologySpreadConstraints: haTopologySpread(`${name}-admin`),
          containers: [
            {
              name: 'admin',
              // ghcr.io/element-hq/element-admin does not serve anonymous
              // pulls (registry: not found / 403 → ImagePullBackOff, caught
              // by the kind smoke run). Element publishes the image on its
              // public registry — the same image ess-helm ships by default.
              image: `oci.element.io/element-admin:${adminVersion}`,
              imagePullPolicy: 'IfNotPresent',
              ports: [{ containerPort: 8080, name: 'http' }],
              livenessProbe: { httpGet: { path: '/', port: 8080 }, periodSeconds: 30 },
              readinessProbe: { httpGet: { path: '/', port: 8080 }, periodSeconds: 10 },
              resources: {
                requests: { memory: '64Mi', cpu: '50m' },
                limits: { memory: '256Mi', cpu: '200m' },
              },
            },
          ],
        },
      },
    },
  })
}

function sfuResources(opts: {
  name: string
  namespace: string
  rtc: MatrixRTCProps
  sfuVersion: string
}): ReturnType<typeof jsx>[] {
  const { name, namespace, rtc, sfuVersion } = opts
  const resources: ReturnType<typeof jsx>[] = []

  resources.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: `${name}-sfu`, namespace },
      spec: {
        replicas: 1,
        strategy: { type: 'Recreate' },
        selector: { matchLabels: { app: `${name}-sfu` } },
        template: {
          metadata: { labels: { app: `${name}-sfu` } },
          spec: {
            tolerations: HA_TOLERATIONS,
            containers: [
              {
                name: 'sfu',
                image: `livekit/livekit-server:${sfuVersion}`,
                imagePullPolicy: 'IfNotPresent',
                args: ['--config', '/etc/livekit.yaml'],
                ports: [
                  { containerPort: 7880, name: 'api' },
                  { containerPort: 30001, name: 'rtc-tcp' },
                  // LiveKit listens on UDP here even though some Helm charts
                  // declare TCP — the Service below routes numerically anyway
                  { containerPort: 30002, name: 'rtc-muxed-udp', protocol: 'UDP' },
                  { containerPort: rtc.turnPort ?? 30004, name: 'turn-udp', protocol: 'UDP' },
                ],
                env: [
                  {
                    name: 'LIVEKIT_API_SECRET',
                    valueFrom: { secretKeyRef: { name: `${name}-rtc-auth`, key: 'secret' } },
                  },
                ],
                volumeMounts: [{ name: 'config', mountPath: '/etc', readOnly: true }],
                livenessProbe: { httpGet: { path: '/', port: 7880 }, periodSeconds: 30 },
                readinessProbe: { httpGet: { path: '/', port: 7880 }, periodSeconds: 10 },
                resources: {
                  requests: { memory: '512Mi', cpu: '500m' },
                  limits: { memory: '2Gi', cpu: '2000m' },
                },
              },
            ],
            volumes: [{ name: 'config', configMap: { name: `${name}-sfu-config` } }],
          },
        },
      },
    })
  )

  // Combined LoadBalancer for all SFU traffic — one external IP for
  // TCP+UDP (Harvester CCM shares the pool IP via ipam annotation).
  // Always LoadBalancer: as ClusterIP the UDP/TURN ports are unreachable,
  // which silently breaks MatrixRTC.
  // Numeric targetPorts: the pod's muxed-UDP port is sometimes declared
  // TCP by charts — numeric bypasses that entirely.
  resources.push(
    jsx('Service', {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: `${name}-sfu`,
        namespace,
        annotations: {
          'cloudprovider.harvesterhci.io/ipam': 'pool',
        },
      },
      spec: {
        type: 'LoadBalancer',
        externalTrafficPolicy: 'Local',
        ...(rtc.manualIP && { loadBalancerIP: rtc.manualIP }),
        selector: { app: `${name}-sfu` },
        ports: [
          { name: 'api', port: 7880, targetPort: 7880, protocol: 'TCP' },
          { name: 'rtc-tcp', port: 30001, targetPort: 30001, protocol: 'TCP' },
          { name: 'rtc-muxed-udp', port: 30002, targetPort: 30002, protocol: 'UDP' },
          {
            name: 'turn-udp',
            port: rtc.turnPort ?? 30004,
            targetPort: rtc.turnPort ?? 30004,
            protocol: 'UDP',
          },
        ],
      },
    })
  )

  return resources
}

function clusterIPServices(name: string, namespace: string): ReturnType<typeof jsx>[] {
  const resources: ReturnType<typeof jsx>[] = []
  for (const svc of [
    { svcName: `${name}-synapse`, port: 8008, app: `${name}-synapse` },
    { svcName: `${name}-mas`, port: 8080, app: `${name}-mas` },
    { svcName: `${name}-web`, port: 80, app: `${name}-web` },
    { svcName: `${name}-admin`, port: 8080, app: `${name}-admin` },
  ]) {
    resources.push(
      jsx('Service', {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: { name: svc.svcName, namespace },
        spec: {
          type: 'ClusterIP',
          selector: { app: svc.app },
          ports: [{ port: svc.port, targetPort: svc.port }],
        },
      })
    )
  }

  return resources
}

function matrixEndpoints(
  name: string,
  namespace: string,
  host: { web: string; synapse: string; admin: string; account: string; rtc: string },
  rtcEnabled: boolean
): ReturnType<typeof jsx>[] {
  const resources: ReturnType<typeof jsx>[] = []
  const endpointDefs: { host: string; serviceName: string; servicePort: number; suffix: string }[] =
    [
      { host: host.web, serviceName: `${name}-web`, servicePort: 80, suffix: 'web' },
      { host: host.synapse, serviceName: `${name}-synapse`, servicePort: 8008, suffix: 'synapse' },
      { host: host.admin, serviceName: `${name}-admin`, servicePort: 8080, suffix: 'admin' },
      { host: host.account, serviceName: `${name}-mas`, servicePort: 8080, suffix: 'account' },
    ]
  if (rtcEnabled) {
    endpointDefs.push({
      host: host.rtc,
      serviceName: `${name}-sfu`,
      servicePort: 7880,
      suffix: 'rtc',
    })
  }

  for (const ep of endpointDefs) {
    resources.push(
      jsx(Endpoint, {
        name: `${name}-${ep.suffix}`,
        namespace,
        host: ep.host,
        serviceName: ep.serviceName,
        servicePort: ep.servicePort,
        tls: { secretName: `${name}-${ep.suffix}-tls`, clusterIssuer: 'letsencrypt-prod' },
      })
    )
  }

  return resources
}

export function Matrix(props: MatrixProps) {
  const {
    name = 'matrix',
    namespace: namespaceProp,
    domain,
    hosts,
    replicas = 2,
    serverName,
    sso,
    database = {},
    keysStorage = '1Gi',
    mediaStorage = '20Gi',
    rtc = {},
    appservices = [],
    version = {},
    urlPreview = true,
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const sharedOperators = useContext(OperatorContext)

  // Pinned-version policy (house pattern: forgejo/eurooffice) — both
  // rejections come straight out of the kind smoke run:
  // - floating `mas: 'latest'` drifted from the config builder and
  //   CrashLooped the suite (listener resources were renamed upstream)
  // - floating `admin: 'latest'` pointed at a ghcr repo that no longer
  //   serves anonymous pulls at all (403 → ImagePullBackOff)
  if (version.mas === 'latest') {
    throw new Error(
      `Matrix "${name}": version.mas must be a pinned tag — 'latest' is rejected.\n` +
        `\n` +
        `MAS is the identity provider for every account — a floating tag can\n` +
        `drift from the config schema and CrashLoop the whole suite (upstream\n` +
        `renamed its listener resources; oauthapi/compatapi → oauth/compat).\n` +
        `\n` +
        `Fix: <Matrix version={{ mas: '1.24.0' }} ... /> (or drop the override — 1.24.0 is the pinned default)`
    )
  }
  if (version.admin === 'latest') {
    throw new Error(
      `Matrix "${name}": version.admin must be a pinned tag — 'latest' is rejected.\n` +
        `\n` +
        `The admin console image no longer resolves at\n` +
        `ghcr.io/element-hq/element-admin:latest — anonymous pulls are refused\n` +
        `(ImagePullBackOff on every deploy).\n` +
        `\n` +
        `Fix: <Matrix version={{ admin: '0.1.13' }} ... /> (or drop the override — 0.1.13 is the pinned default)`
    )
  }

  const baseDomain = domain
  const server = serverName ?? baseDomain
  const host = {
    web: hosts?.web ?? `element.${baseDomain}`,
    synapse: hosts?.synapse ?? `matrix.${baseDomain}`,
    admin: hosts?.admin ?? `element-admin.${baseDomain}`,
    account: hosts?.account ?? `matrix-account.${baseDomain}`,
    rtc: hosts?.rtc ?? `matrix-rtc.${baseDomain}`,
  }

  // --- secrets: backend or explicit refs ------------------------------------
  const backend = secretProvider?.backend
  const hasBackend = backend === 'openbao' || backend === 'vault'

  if (sso && !sso.clientSecretRef && !hasBackend) {
    throw new Error(
      `Matrix "${name}": sso.clientSecretRef is required unless a secrets backend (openbao/vault) is configured on the surrounding Platform.\n\n` +
        `Fix: wrap in <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'matrix' }}>\n` +
        `     or pass sso={{ ..., clientSecretRef: '${name}-keycloak-oidc' }} (a pre-created Secret with key 'clientSecret')`
    )
  }
  // Same secure default as <Database backup>: with an S3 provider in scope,
  // omitting the decision enables backups (target/credentials derive from
  // the provider below). Without a provider the decision stays required —
  // running unbacked is always an explicit `backup: false`.
  const s3 = useS3()
  if (database.backup === undefined && !s3) {
    throw new Error(
      `Matrix "${name}": database.backup is a required decision.\n` +
        `\n` +
        `WAL segments accumulate until they are archived — a cluster without\n` +
        `working backups slowly fills its PVC.\n` +
        `\n` +
        `There is no <S3Provider> in scope, so backups cannot be defaulted on.\n` +
        `Fix: point the backups at the platform S3 store:\n` +
        `  <S3Provider …>\n` +
        `    <Matrix name="${name}" database={{ backup: <Bucket name="matrix_backup" /> }} />\n` +
        `\n` +
        `or pass the target explicitly:\n` +
        `  backup={{ destinationPath: 's3://backups/matrix', endpointURL: 'https://s3.example.com' }}\n` +
        `\n` +
        `To explicitly run without backups (ephemeral test clusters):\n` +
        `  database={{ backup: false }}`
    )
  }

  // Resolve the backup decision into a per-database base spec. Explicit
  // fields win; gaps derive from the surrounding S3Provider; a <Bucket>
  // descriptor points at a scoped destination (matrix name composed under
  // its prefix so several stacks can share a bucket cleanly).
  let backupSpec: MatrixBackupProps | false = false
  // Omitted + S3 provider in scope = the secure default (enabled, derived).
  // The throw above guarantees s3 exists whenever rawBackup is undefined.
  const rawBackup = database.backup ?? (s3 ? true : false)
  if (rawBackup !== false) {
    let destinationBase: string | undefined
    let endpointURL: string | undefined
    let credentialsSecret: string | undefined
    let retention: string | undefined
    let schedule: string | undefined

    if (rawBackup === true) {
      destinationBase = s3
        ? `s3://${s3.bucket}${s3.prefix ? `/${s3.prefix}` : ''}/${name}-backup`
        : undefined
      endpointURL = s3?.endpoint
      credentialsSecret = s3?.credentialsSecret
    } else if (rawBackup && typeof rawBackup === 'object' && isBucketElement(rawBackup)) {
      const target = resolveBucket(rawBackup, s3)
      destinationBase = `${target.root}/${name}-backup`
      endpointURL = target.s3.endpoint
      credentialsSecret = target.s3.credentialsSecret
    } else if (rawBackup && typeof rawBackup === 'object') {
      const spec = rawBackup as MatrixBackupProps
      destinationBase =
        spec.destinationPath ??
        (s3 ? `s3://${s3.bucket}${s3.prefix ? `/${s3.prefix}` : ''}/${name}-backup` : undefined)
      endpointURL = spec.endpointURL ?? s3?.endpoint
      credentialsSecret = spec.credentialsSecret ?? s3?.credentialsSecret
      retention = spec.retention
      schedule = spec.schedule
    }

    if (!destinationBase || !endpointURL) {
      throw new Error(
        `Matrix "${name}": backup needs an S3 target.\n` +
          `\n` +
          `Fix: add an <S3Provider> so backup destinations (and credentials) derive from it:\n` +
          `  <S3Provider provider={<MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />}>\n` +
          `     <Matrix name="${name}" database={{ backup: <Bucket name="matrix_backup" /> }} />\n` +
          `\n` +
          `or pass the target explicitly:\n` +
          `  backup={{ destinationPath: 's3://backups/matrix', endpointURL: 'https://s3.example.com' }}\n` +
          `\n` +
          `Missing: ${[!destinationBase && 'destinationPath', !endpointURL && 'endpointURL'].filter(Boolean).join(', ')}`
      )
    }
    backupSpec = {
      destinationPath: destinationBase,
      endpointURL,
      credentialsSecret,
      retention,
      schedule,
    }
  }

  if (backupSpec && !backupSpec.credentialsSecret && !hasBackend) {
    throw new Error(
      `Matrix "${name}": backup credentials missing.\n\n` +
        `Fix: the <S3Provider> credentials Secret is used automatically — give it keys access-key-id + secret-access-key\n` +
        `     or pass database={{ backup: { ..., credentialsSecret: '${name}-backup-credentials' } }}\n` +
        `     or configure a secrets backend (openbao/vault) to provision '<path>/${name}/backup'`
    )
  }

  const resources: ReturnType<typeof jsx>[] = []

  // CNPG operator for the two databases
  resources.push(...declareCnpg(sharedOperators))

  // --- Secrets via backend (OpenBao/Vault static secret bundles) -------------
  const secretSecretDefs: { name: string; path: string; keys: Record<string, string> }[] = []
  if (hasBackend) {
    if (sso && !sso.clientSecretRef) {
      secretSecretDefs.push({
        name: `${name}-keycloak-oidc`,
        path: `${secretProvider!.path ?? name}/${name}/keycloak-oidc`,
        keys: { clientSecret: 'clientSecret' },
      })
    }
    if (backupSpec && !backupSpec.credentialsSecret) {
      secretSecretDefs.push({
        name: `${name}-backup-credentials`,
        path: `${secretProvider!.path ?? name}/${name}/backup`,
        keys: { 'access-key-id': 'access-key-id', 'secret-access-key': 'secret-access-key' },
      })
    }
  }

  // Shared StaticSecret recipe (#89) — the destination Secret carries
  // exactly the mapped keys (excludeRaw); content is identical to the
  // previous inline emission. `keys` is used for the mapping (it was
  // declared but unused in the raw-sync predecessor).
  for (const def of secretSecretDefs) {
    resources.push(
      jsx(StaticSecret, {
        name: def.name,
        namespace,
        path: def.path,
        keys: def.keys,
        refreshAfter: '3600s',
        authRef: secretProvider!.authRef ?? `${backend}-auth`,
      })
    )
  }

  const keycloakSecretName = sso?.clientSecretRef ?? (sso ? `${name}-keycloak-oidc` : undefined)
  // From the resolved spec (provider/descriptor/explicit) — falls back to
  // the secrets-backend provisioned Secret when a backend is configured.
  const backupCredsSecret =
    backupSpec && backupSpec.credentialsSecret
      ? backupSpec.credentialsSecret
      : backupSpec
        ? `${name}-backup-credentials`
        : undefined

  resources.push(
    ...matrixDatabaseResources({
      name,
      namespace,
      database,
      backup: backupSpec || (undefined as never),
      backupCredsSecret,
    })
  )

  // --- Synapse keys PVC -------------------------------------------------------
  // The signing key IS the server identity: a fresh key on every pod start
  // de-federates rooms and invalidates every session. The first boot needs
  // /data writable for synapse to GENERATE the key (PermissionError was the
  // fresh-boot blocker in the kind smoke run — the deployment previously
  // mounted only the read-only config file). One RWO PVC keeps the key
  // across restarts; the Deployment already rolls Recreate.
  const keysClaimName = keysStorage ? `${name}-synapse-keys` : (undefined as string | undefined)
  if (keysStorage) {
    const size = typeof keysStorage === 'string' ? keysStorage : (keysStorage.size ?? '1Gi')
    const storageClass = typeof keysStorage === 'object' ? keysStorage.storageClass : undefined
    resources.push(
      jsx('PersistentVolumeClaim', {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: { name: keysClaimName!, namespace },
        spec: {
          accessModes: ['ReadWriteOnce'],
          ...(storageClass ? { storageClassName: storageClass } : {}),
          resources: { requests: { storage: size } },
        },
      })
    )
  }

  // --- Synapse media PVC -------------------------------------------------------
  // Media is the large-growing data of a Matrix server (uploads, avatars,
  // thumbnails) — it gets its own PVC, never the small keys volume. The
  // claimName rides into the Deployment at /data/media_store, matching the
  // `media_store_path` pinned in homeserver.yaml above. mediaStorage: false
  // = bring your own /data/media_store (mirrors keysStorage: false).
  const mediaClaimName = mediaStorage ? `${name}-synapse-media` : (undefined as string | undefined)
  if (mediaStorage) {
    const size = typeof mediaStorage === 'string' ? mediaStorage : (mediaStorage.size ?? '20Gi')
    const storageClass = typeof mediaStorage === 'object' ? mediaStorage.storageClass : undefined
    resources.push(
      jsx('PersistentVolumeClaim', {
        apiVersion: 'v1',
        kind: 'PersistentVolumeClaim',
        metadata: { name: mediaClaimName!, namespace },
        spec: {
          accessModes: ['ReadWriteOnce'],
          ...(storageClass ? { storageClassName: storageClass } : {}),
          resources: { requests: { storage: size } },
        },
      })
    )
  }

  // --- Config Maps -----------------------------------------------------------
  const synapseConfig = buildSynapseConfig({
    name,
    server,
    synapseHost: host.synapse,
    urlPreview,
    rtcEnabled: rtc.enabled !== false,
    appservices,
  })

  resources.push(
    jsx('ConfigMap', {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: `${name}-synapse-config`, namespace },
      data: {
        'homeserver.yaml': '# Generated by @r8s/matrix\n' + toYaml(synapseConfig),
      },
    })
  )

  const masConfig = buildMasConfig(name, sso)

  resources.push(
    jsx('ConfigMap', {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: `${name}-mas-config`, namespace },
      data: {
        'config.yaml': '# Generated by @r8s/matrix\n' + toYaml(masConfig),
      },
    })
  )

  const elementWebConfig = buildElementWebConfig(server, host)

  resources.push(
    jsx('ConfigMap', {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: `${name}-web-config`, namespace },
      data: { 'config.json': JSON.stringify(elementWebConfig, null, 2) },
    })
  )

  if (rtc.enabled !== false) {
    const rtcConfig = buildRtcConfig(rtc, host.rtc)

    resources.push(
      jsx('ConfigMap', {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: { name: `${name}-sfu-config`, namespace },
        data: { 'livekit.yaml': '# Generated by @r8s/matrix\n' + toYaml(rtcConfig) },
      })
    )
  }

  // --- Appservice registrations ---------------------------------------------
  // Registrations carry as_token/hs_token — they render as Secrets, never
  // ConfigMaps. Prefer `secretRef` (existing Secret from the secrets backend)
  // or placeholders; the noPlaintextSecrets guardrail flags live token values.
  for (const appservice of appservices) {
    if (!appservice.secretRef) {
      resources.push(
        jsx('Secret', {
          apiVersion: 'v1',
          kind: 'Secret',
          metadata: { name: `${name}-appservice-${appservice.name}`, namespace },
          stringData: { 'registration.yaml': toYaml(appservice.registration ?? {}) },
        })
      )
    }
  }

  // --- Deployments + services ------------------------------------------------
  resources.push(
    synapseDeployment({
      name,
      namespace,
      appservices,
      synapseVersion: version.synapse ?? 'v1.99.0',
      keysClaimName,
      mediaClaimName,
    })
  )

  resources.push(
    masDeployment({
      name,
      namespace,
      replicas,
      // MAS config-schema drift fixed the hard way: the floating 'latest'
      // renamed its listener resources and CrashLooped (smoke run). Pin to
      // a current stable release; 'latest' is rejected above.
      masVersion: version.mas ?? '1.24.0',
      keycloakSecretName,
    })
  )

  resources.push(
    webDeployment({
      name,
      namespace,
      replicas,
      webVersion: version.web ?? 'v1.12.15',
    })
  )

  resources.push(
    adminDeployment({
      name,
      namespace,
      replicas,
      // Pinned to the current ESS release (ess-helm elementAdmin.image.tag
      // 0.1.13) served from oci.element.io — 'latest' is rejected above.
      adminVersion: version.admin ?? '0.1.13',
    })
  )

  if (rtc.enabled !== false) {
    resources.push(
      ...sfuResources({
        name,
        namespace,
        rtc,
        sfuVersion: version.sfu ?? rtc.sfuVersion ?? 'v1.10.1',
      })
    )
  }

  resources.push(...clusterIPServices(name, namespace))

  resources.push(...matrixEndpoints(name, namespace, host, rtc.enabled !== false))

  return jsx(Fragment, { children: resources })
}

/** Minimal YAML serialiser for the embedded configs (the stack is
 *  configuration-heavy; embedding a full YAML dep just for these is overkill) */
function toYaml(value: unknown, indent = 0): string {
  const pad = ' '.repeat(indent)
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const inner = toYaml(item, indent + 2)
          return `${pad}-\n${inner}`
        }
        return `${pad}- ${item}`
      })
      .join('\n')
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          return `${pad}${key}:\n${toYaml(val, indent + 2)}`
        }
        return `${pad}${key}: ${yamlScalar(val)}`
      })
      .join('\n')
  }
  return `${pad}${yamlScalar(value)}`
}

function yamlScalar(value: unknown): string {
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value === null || value === undefined) return 'null'
  const str = String(value)
  if (/[:#\s'"{}[\],&*!|>%@`]/.test(str) || str === '' || str.startsWith('$')) {
    return `'${str.replace(/'/g, "''")}'`
  }
  return str
}
