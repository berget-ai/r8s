import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import type { EnvVar } from '@r8s/k8s-types'
import { Namespace, OperatorContext, SecretContext } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { ClusterComponent, ScheduledBackupComponent } from '@r8s/crds/postgresql'
import { Endpoint } from '@r8s/recipes'

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
   * Backup configuration — barman object store + scheduled full backups.
   * Set to false to disable. Defaults to off unless specified (explicit opt-in
   * so you can't forget: a disk-full WAL incident is exactly what this prevents).
   */
  backup?: {
    /** S3 destination path, e.g. s3://bucket/matrix-cnpg */
    destinationPath: string
    /** S3 endpoint URL (e.g. https://s3.berget.cloud) */
    endpointURL: string
    /** Existing Secret with keys `access-key-id` + `secret-access-key`. Provisioned by the secrets backend when not given. */
    credentialsSecret?: string
    /** Retention policy (default: '30d') */
    retention?: string
    /** Cron schedule for the daily full backup (default: '30 3 * * *') */
    schedule?: string
  } | null
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
   * already pinned for known upstream regressions):
   * web: v1.12.15 (MSC4143 Authorization header fix),
   * sfu: v1.10.1 (IPv6 ICE URL fix)
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
 * (optional barman backups), 60s node-failure tolerations + topology spread
 * (learned from a real node-blip incident), SSRF-hardened URL previews, and
 * pinned component versions.
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
    rtc = {},
    appservices = [],
    version = {},
    urlPreview = true,
  } = props

  const contextNamespace = useContext(Namespace)
  const namespace =
    namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'
  const secretProvider = useContext(SecretContext)
  const sharedOperators = useContext(OperatorContext)

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
  if (database.backup && !database.backup.credentialsSecret && !hasBackend) {
    throw new Error(
      `Matrix "${name}": database.backup.credentialsSecret is required unless a secrets backend (openbao/vault) is configured.\n\n` +
        `Fix: wrap in <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'matrix' }}>\n` +
        `     or pass database={{ backup: { ..., credentialsSecret: '${name}-backup-credentials' } }}`
    )
  }

  const resources: ReturnType<typeof jsx>[] = []

  // CNPG operator for the two databases
  if (!sharedOperators.some((op) => op.name === 'cnpg')) {
    resources.push(declareOperator(operators['cnpg']()))
  }

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
    if (database.backup && !database.backup.credentialsSecret) {
      secretSecretDefs.push({
        name: `${name}-backup-credentials`,
        path: `${secretProvider!.path ?? name}/${name}/backup`,
        keys: { 'access-key-id': 'access-key-id', 'secret-access-key': 'secret-access-key' },
      })
    }
  }

  const StaticSecretComponent = backend === 'openbao' ? 'OpenBaoStaticSecret' : 'VaultStaticSecret'
  const staticSecretApiVersion =
    backend === 'openbao' ? 'secrets.openbao.org/v1beta1' : 'secrets.hashicorp.com/v1beta1'
  for (const def of secretSecretDefs) {
    resources.push(
      jsx(StaticSecretComponent, {
        apiVersion: staticSecretApiVersion,
        kind: StaticSecretComponent,
        metadata: { name: def.name, namespace },
        spec: {
          ...(backend === 'openbao'
            ? { openbaoAuthRef: secretProvider!.authRef ?? 'openbao-auth' }
            : { vaultAuthRef: secretProvider!.authRef ?? 'vault-auth' }),
          mount: secretProvider!.mount ?? 'secret',
          type: 'kv-v2',
          path: def.path,
          refreshAfter: '3600s',
          destination: { create: true, name: def.name },
        },
      })
    )
  }

  const keycloakSecretName = sso?.clientSecretRef ?? (sso ? `${name}-keycloak-oidc` : undefined)
  const backupCredsSecret =
    database.backup?.credentialsSecret ??
    (database.backup ? `${name}-backup-credentials` : undefined)

  // --- CNPG databases --------------------------------------------------------
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

  for (const db of dbSpecs) {
    const clusterName = `${name}-${db.id}-db`
    const backup = database.backup
      ? {
          barmanObjectStore: {
            destinationPath: `${database.backup.destinationPath}/${db.id}-cnpg`,
            endpointURL: database.backup.endpointURL,
            s3Credentials: {
              accessKeyId: { name: backupCredsSecret!, key: 'access-key-id' },
              secretAccessKey: { name: backupCredsSecret!, key: 'secret-access-key' },
            },
            wal: { compression: 'gzip', encryption: 'AES256', maxParallel: 2 },
            data: { compression: 'gzip', encryption: 'AES256', jobs: 2 },
          },
          retentionPolicy: database.backup.retention ?? '30d',
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

    if (database.backup) {
      resources.push(
        jsx(ScheduledBackupComponent, {
          metadata: { name: `${clusterName}-backup`, namespace },
          spec: {
            cluster: { name: clusterName },
            schedule: database.backup.schedule ?? '30 3 * * *',
            backupOwnerReference: 'none',
            method: 'barmanObjectStore',
          },
        })
      )
    }
  }

  // --- Config Maps -----------------------------------------------------------
  const synapseConfig: Record<string, unknown> = {
    server_name: server,
    public_baseurl: `https://${host.synapse}/`,
    pid_file: '/data/homeserver.pid',
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
    ...(rtc.enabled !== false && {
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

  const masConfig: Record<string, unknown> = {
    database: {
      uri: `postgresql://mas:$(MASPASSWORD)@${name}-mas-db-rw:5432/mas?sslmode=prefer`,
    },
    http: {
      listeners: [
        {
          name: 'web',
          resources: [
            { name: 'discovery' },
            { name: 'oauthapi' },
            { name: 'compatapi' },
            { name: 'graphql' },
          ],
          port: 8080,
          host: '0.0.0.0',
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

  const elementWebConfig = {
    default_server_config: {
      'm.homeserver': {
        base_url: `https://${host.synapse}`,
        server_name: server,
      },
      'org.matrix.msc4143.rtc_session': {
        focused_element: { focus_url: `https://${host.rtc}` },
      },
    },
    brand: 'Element',
    default_country_code: 'SE',
    show_labs_settings: true,
  }

  resources.push(
    jsx('ConfigMap', {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name: `${name}-web-config`, namespace },
      data: { 'config.json': JSON.stringify(elementWebConfig, null, 2) },
    })
  )

  if (rtc.enabled !== false) {
    const rtcConfig = {
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
          domain: host.rtc,
          tls_port: 0,
          udp_port: rtc.turnPort ?? 30004,
        },
      }),
      keys: 'livekit-key: $(LIVEKIT_API_SECRET)',
    }

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

  // --- Deployments ------------------------------------------------------------
  const synapseVersion = version.synapse ?? 'v1.99.0'
  const masVersion = version.mas ?? 'latest'
  const webVersion = version.web ?? 'v1.12.15'
  const adminVersion = version.admin ?? 'latest'
  const sfuVersion = version.sfu ?? rtc.sfuVersion ?? 'v1.10.1'

  const synapseEnv: EnvVar[] = [
    {
      name: 'SYNAPSE_CONFIG_PATH',
      value: '/data/homeserver.yaml',
    },
  ]

  resources.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: `${name}-synapse`, namespace },
      spec: {
        replicas: 1, // federation workers land separately — single writer for now
        strategy: { type: 'Recreate' },
        selector: { matchLabels: { app: `${name}-synapse` } },
        template: {
          metadata: { labels: { app: `-synapse` } },
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
                // /tmp must be writable — readOnlyRootFilesystem + Twisted
                // tempfile buffering breaks media uploads otherwise (upstream
                // matrix-stack 26.9.0 regression)
                volumeMounts: [
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
              { name: 'config', configMap: { name: `${name}-synapse-config` } },
              // CNPG generates the database credentials Secret (<cluster>-app)
              { name: 'db-credentials', secret: { secretName: `${name}-synapse-db-app` } },
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
  )

  const masEnv: EnvVar[] = [
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

  resources.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: `${name}-mas`, namespace },
      spec: {
        replicas,
        strategy: { type: 'RollingUpdate', rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } },
        selector: { matchLabels: { app: `${name}-mas` } },
        template: {
          metadata: { labels: { app: `-mas` } },
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
  )

  resources.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: `${name}-web`, namespace },
      spec: {
        replicas,
        selector: { matchLabels: { app: `${name}-web` } },
        template: {
          metadata: { labels: { app: `-web` } },
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
  )

  resources.push(
    jsx('Deployment', {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: `${name}-admin`, namespace },
      spec: {
        replicas,
        selector: { matchLabels: { app: `${name}-admin` } },
        template: {
          metadata: { labels: { app: `-admin` } },
          spec: {
            tolerations: HA_TOLERATIONS,
            topologySpreadConstraints: haTopologySpread(`${name}-admin`),
            containers: [
              {
                name: 'admin',
                image: `ghcr.io/element-hq/element-admin:${adminVersion}`,
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
  )

  if (rtc.enabled !== false) {
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
  }

  // --- ClusterIP services -----------------------------------------------------
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

  // --- Endpoints (5 hosts) ----------------------------------------------------
  const endpointDefs: { host: string; serviceName: string; servicePort: number; suffix: string }[] =
    [
      { host: host.web, serviceName: `${name}-web`, servicePort: 80, suffix: 'web' },
      { host: host.synapse, serviceName: `${name}-synapse`, servicePort: 8008, suffix: 'synapse' },
      { host: host.admin, serviceName: `${name}-admin`, servicePort: 8080, suffix: 'admin' },
      { host: host.account, serviceName: `${name}-mas`, servicePort: 8080, suffix: 'account' },
    ]
  if (rtc.enabled !== false) {
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
