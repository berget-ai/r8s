import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  StaticSecret,
  canProvisionSecrets,
  secretsRequiredError,
  databaseCredentialsRef,
  type DatabaseProps,
} from '@r8s/recipes'

/**
 * Keycloak is the documented IdP (docs.netbird.io → Self-hosted → Identity
 * providers → Keycloak): a dedicated `netbird` realm with a confidential
 * OIDC client `netbird`. The
 * management store uses client credentials (`client_credentials` grant) —
 * render that client with `<Client groupsClaim>` (the Auth recipe) so
 * Keycloak puts group memberships in the JWT `groups` claim for
 * user-group sync; netbird reads the claim, this package only carries the
 * identity endpoints derived from `issuer`.
 */
export interface NetbirdIdpProps {
  /**
   * OIDC issuer, e.g. 'https://auth.example.com/realms/netbird'. Token,
   * JWKS, device-authorize and authorize endpoints are derived from it
   * (Keycloak realm layout: <issuer>/protocol/openid-connect/...).
   *
   * Alternative: pass `realm` + `host` instead and the issuer is derived
   * as `https://<host>/realms/<realm>` — the Auth recipe's layout. The
   * two forms are mutually exclusive.
   */
  issuer?: string
  /** OIDC client id — the confidential `netbird` client in the realm */
  clientId: string
  /**
   * Reference a pre-created Secret holding the client secret (key:
   * `client-secret`). Payload: the OIDC client's secret from the
   * Keycloak realm (Clients → netbird → Credentials). Without it the
   * secrets backend provisions `${name}-oidc` from the store path.
   */
  clientSecretRef?: string
  /**
   * Keycloak realm name — with `host`, derives the issuer as
   * `https://<host>/realms/<realm>` (mirrors <Realm id="netbird"> in the
   * Auth recipe on the same host). Mutually exclusive with `issuer`.
   */
  realm?: string
  /**
   * Auth hostname (the AUTH host, NOT <Netbird host>) — with `realm`,
   * derives the issuer as `https://<host>/realms/<realm>`. Mutually
   * exclusive with `issuer`.
   */
  host?: string
}

export interface NetbirdProps {
  /** Release / chart name (defaults to 'netbird'; also the namespace-internal resource prefix) */
  name?: string
  /** Kubernetes namespace for the release + data (inherited from <Platform> unless set) */
  namespace?: string
  /**
   * Single public hostname: dashboard, management API/gRPC, signal and
   * relay are all routed on it (ingress-nginx merges the rules; TLS via
   * one shared certificate).
   */
  host: string
  /**
   * Keycloak OIDC identity provider wired into the management config.
   *
   * Group sync with the Auth recipe: give the realm's `netbird` client
   * <Client groupsClaim> so Keycloak puts group memberships in the JWT
   * `groups` claim — Netbird auto-creates groups from it (map Netbird
   * policies to those groups). The manager client (client_credentials,
   * e.g. `netbird-manager`) is what netbird management uses to read
   * groups/users from the Keycloak API. See the compose example below.
   */
  idp: NetbirdIdpProps
  /**
   * Expose the relay Service as a raw LoadBalancer on this TCP port in
   * addition to the `rels://host:443/relay` ingress path. The chart's
   * relay is the TCP websocket relay — it does NOT speak UDP, and the
   * chart ships no coturn: add an external STUN/TURN server (+ its own
   * LoadBalancer) separately if peers need it.
   */
  relayPort?: number
  /**
   * Chart version (defaults to the pinned '1.9.0'). Flux applies chart
   * upgrades automatically on the repo interval — bump deliberately.
   */
  chartVersion?: string
  /** HelmRepository URL (defaults to https://netbirdio.github.io/helms — the gh-pages index of netbirdio/helms) */
  repoUrl?: string
  /** Namespace the HelmRepository lives in (defaults to 'flux-system') */
  repoNamespace?: string
  /**
   * Image tag for the three core services (management, signal, relay —
   * netbirdio/{management,signal,relay}). Defaults to '0.46.0', the
   * chart 1.9.0 appVersion the management.json template is written
   * against — newer netbird images may expect a different config shape,
   * so bump chart + images together. PINNED — 'latest' is rejected. The
   * dashboard keeps its own chart default (v2.13.1, also pinned).
   */
  imageTag?: string
  /**
   * Management data PVC sizing. The chart only needs it for the sqlite
   * store — with the CNPG Postgres contract below the management data
   * dir is disposable, so the PVC is DISABLED by default. Pass a size
   * (e.g. '1Gi') to keep it, or `false` to disable it explicitly.
   */
  storage?: string | false
  /** CNPG cluster name (defaults to 'netbird-db'). Database + owner are 'netbird'. */
  dbName?: string
  /** Number of CNPG instances (defaults to 2) */
  dbInstances?: number
  /** CNPG data volume size (defaults to '10Gi' — management store, small) */
  dbStorage?: string
  /** CNPG storage class (defaults to cluster default) */
  dbStorageClass?: string
  /** CNPG backup passthrough — defaults to **enabled** via the platform S3Provider; `false` opts out */
  backup?: DatabaseProps['backup']
  /**
   * Reference a pre-created Secret holding the relay auth secret + the
   * datastore encryption key (keys `relay-secret`,
   * `datastore-encryption-key`) instead of backend provisioning. The
   * relay secret also travels to peers in management.json — rotating it
   * restarts management + relay.
   */
  credentialsSecretName?: string
  /** User-ID claim netbird matches accounts on (e.g. 'preferred_username' — depends on the IdP mapper) */
  userIdClaim?: string
  /** TLS: one shared cert for every ingress the chart creates (defaults to `netbird-tls` via letsencrypt-prod). The cert-manager annotation sits on the dashboard catch-all ingress only — the other ingresses reference the same secret without triggering duplicate issuances (LE duplicate-cert limit is 5/week). */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * One env entry backed by a secretKeyRef (the chart's `envRaw` contract —
 * structured valueFrom objects, the plaintext-free way to inject secrets).
 */
function secretEnv(name: string, secretName: string, key: string) {
  return {
    name,
    valueFrom: { secretKeyRef: { name: secretName, key } },
  }
}

/**
 * Netbird — WireGuard-based mesh VPN (management + signal + relay +
 * dashboard behind one hostname), facit-aligned via the official chart.
 *
 * @title Netbird
 * @category Networking
 *
 * The chart owns all app workloads (management/signal/relay/dashboard +
 * their services and ingresses). This package owns the platform contract
 * around it:
 * - Flux `HelmRepository` + `HelmRelease` (pinned chart, facit values).
 *   netbirdio publishes packaged chart .tgz releases against a gh-pages
 *   Helm index (no OCI artifact exists) — a plain HelmRepository works.
 * - external CNPG cluster (`credentialsMode: 'cnpg'`): the management
 *   store reads the DSN from the CNPG-generated `<db>-app` secret's
 *   `fqdn-uri` key via `management.envFromSecret` — the raw DSN never
 *   appears in rendered YAML beyond its secretKeyRef
 * - management.json rendered into the chart's `management.configmap`
 *   with `{{ .VAR }}` env placeholders (netbird ≥ 0.30.1 substitutes
 *   them from process env — the chart's own IdP examples rely on it)
 * - IdP credentials + relay secret + datastore encryption key via the
 *   Platform secrets backend (pre-created Secret references win)
 * - cert-manager TLS on the dashboard catch-all ingress; the management/
 *   gRPC/signal/relay ingresses reference the same TLS secret
 * - optional raw LoadBalancer face for the relay via `relayPort`
 *
 * Encoded decisions (do not "fix" these):
 * - NO Stuns/TURNConfig entries: the chart deploys no coturn server and
 *   pointing peers at a dead `host:3478` is worse than none — peers
 *   connect via the relay (rels://host:443/relay); add an external
 *   STUN/TURN server if you need direct hairpin/wifi-less connectivity
 * - `useBackwardsGrpcService: true` (the chart's own tested example):
 *   the management gRPC ingress routes to the dedicated 33073 listener
 * - `persistentVolume.enabled: false` (facit: postgres-backed store —
 *   the docker-compose template also ships `"Datadir": ""` for postgres)
 * - images pinned to the chart appVersion (0.46.0); chart 1.9.0's
 *   management.json schema matches that generation — bump together
 *
 * @example
 * import { Platform, S3Provider, MinIO } from '@r8s/recipes'
 * import { Netbird } from '@r8s/netbird'
 *
 * // CNPG backups derive from the S3Provider; the IdP client secret +
 * // relay/datastore credentials provision from the openbao store
 * export default (
 *   <S3Provider
 *     provider={
 *       <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
 *     }
 *   >
 *     <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'apps' }}>
 *       <Netbird
 *         host="netbird.example.com"
 *         idp={{
 *           issuer: 'https://auth.example.com/realms/netbird',
 *           clientId: 'netbird',
 *         }}
 *       />
 *     </Platform>
 *   </S3Provider>
 * )
 *
 * @example
 * // Compose with the Auth recipe — realm-level group sync for policies
 * import { Platform, S3Provider, MinIO, Auth } from '@r8s/recipes'
 * import { Realms, Realm, Clients, Client } from '@r8s/recipes/auth'
 * import { Netbird } from '@r8s/netbird'
 *
 * // groupsClaim puts Keycloak group memberships in the JWT `groups`
 * // claim — Netbird auto-creates groups from it (map Netbird policies
 * // to those groups). The manager client (client_credentials) is what
 * // netbird management uses to read groups/users from the Keycloak API.
 * export default (
 *   <S3Provider
 *     provider={
 *       <MinIO endpoint="https://rustfs:9000" bucket="infra" credentialsSecret="infra-s3-creds" />
 *     }
 *   >
 *     <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'apps' }}>
 *       <Auth name="auth" host="auth.example.com">
 *         <Realms>
 *           <Realm id="netbird" displayName="Netbird">
 *             <Clients>
 *               <Client
 *                 id="netbird"
 *                 type="confidential"
 *                 redirectUris={['https://netbird.example.com/*']}
 *                 groupsClaim
 *               />
 *               <Client id="netbird-manager" type="confidential" />
 *             </Clients>
 *           </Realm>
 *         </Realms>
 *       </Auth>
 *       <Netbird
 *         host="netbird.example.com"
 *         idp={{
 *           issuer: 'https://auth.example.com/realms/netbird',
 *           clientId: 'netbird',
 *           clientSecretRef: 'netbird-oidc',
 *         }}
 *       />
 *     </Platform>
 *   </S3Provider>
 * )
 */
export function Netbird(props: NetbirdProps) {
  const {
    name = 'netbird',
    namespace: namespaceProp,
    host,
    idp,
    relayPort,
    chartVersion = '1.9.0',
    repoUrl = 'https://netbirdio.github.io/helms',
    repoNamespace = 'flux-system',
    imageTag = '0.46.0',
    storage,
    dbName = 'netbird-db',
    dbInstances = 2,
    dbStorage = '10Gi',
    dbStorageClass,
    backup,
    credentialsSecretName,
    userIdClaim = '',
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  // --- IdP issuer (explicit, or derived from the Auth recipe's realm layout) ---
  if (idp.issuer && (idp.realm || idp.host)) {
    throw new Error(
      `Netbird "${name}": idp.issuer and idp.realm + idp.host are mutually exclusive.\n` +
        `\n` +
        `Both describe the same Keycloak OIDC issuer — mixing them is\n` +
        `ambiguous about which realm actually backs the mesh.\n` +
        `\n` +
        `Fix: keep one form —\n` +
        `  idp={{ issuer: 'https://auth.example.com/realms/netbird', ... }}  or\n` +
        `  idp={{ realm: 'netbird', host: 'auth.example.com', ... }}`
    )
  }
  if (!idp.issuer && !(idp.realm && idp.host)) {
    throw new Error(
      `Netbird "${name}": the OIDC issuer is required — give idp.issuer, or\n` +
        `idp.realm + idp.host to derive it as https://<host>/realms/<realm>\n` +
        `(the Auth recipe's <Realm id=...> on the <Auth host>).\n` +
        `\n` +
        `Fix: idp={{ realm: 'netbird', host: 'auth.example.com', clientId: 'netbird' }}`
    )
  }
  const issuer = idp.issuer ?? `https://${idp.host}/realms/${idp.realm}`

  // --- Pinned-version policy ---------------------------------------------------
  if (chartVersion === 'latest') {
    throw new Error(
      `Netbird "${name}" requires a pinned chartVersion.\n` +
        `\n` +
        `A rejected floating chart breaks the pinned-images invariant (the\n` +
        `chart's management.json template moves with its appVersion) and an\n` +
        `untested upgrade can strand every peer.\n` +
        `\n` +
        `Fix: <Netbird chartVersion="1.9.0" ... />  (pin the imageTag to match)`
    )
  }
  if (imageTag === 'latest') {
    throw new Error(
      `Netbird "${name}" requires a pinned imageTag.\n` +
        `\n` +
        `Chart ${chartVersion} renders management.json for its appVersion\n` +
        `generation — floating netbird images can expect a different config\n` +
        `shape on the next pull.\n` +
        `\n` +
        `Fix: <Netbird imageTag="0.46.0" ... />  (bump chart + images together)`
    )
  }
  if (
    storage !== undefined &&
    storage !== false &&
    // k8s quantity suffixes: binary (Ki/Mi/Gi/Ti/Pi/Ei) + decimal
    // (k/M/G/T/P/E — note decimal kilo is LOWERCASE k; 'K' is invalid)
    !/^\d+(\.\d+)?(Ei|Pi|Ti|Gi|Mi|Ki|E|P|T|G|M|k)$/.test(storage)
  ) {
    throw new Error(
      `Netbird "${name}": storage must be a Kubernetes (binary or decimal) quantity\n` +
        `(e.g. '1Gi', '1G', '100M', '2.5Ti'), got "${storage}".`
    )
  }

  // --- IdP client secret (pre-created wins; else backend provisions) ----------
  const oidcSecretName = idp.clientSecretRef ?? `${name}-oidc`
  if (!idp.clientSecretRef) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Netbird',
        name,
        'the OIDC client secret for the Keycloak netbird client (key client-secret)',
        {
          propName: 'idp.clientSecretRef',
          exampleValue: `${name}-oidc`,
          keys: ['client-secret'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-oidc`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/oidc`,
        secretName: oidcSecretName,
        keys: { 'client-secret': 'client_secret' },
        restart: [{ kind: 'Deployment', name: `${name}-management` }],
      })
    )
  }

  // --- Relay secret + datastore encryption key bundle ---------------------------
  const credentialsName = credentialsSecretName ?? `${name}-credentials`
  if (!credentialsSecretName) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Netbird',
        name,
        'the relay auth secret + datastore encryption key (keys relay-secret, datastore-encryption-key)',
        {
          propName: 'credentialsSecretName',
          exampleValue: `${name}-credentials`,
          keys: ['relay-secret', 'datastore-encryption-key'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-credentials`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/credentials`,
        secretName: credentialsName,
        keys: {
          'relay-secret': 'relay_secret',
          'datastore-encryption-key': 'datastore_encryption_key',
        },
        restart: [
          { kind: 'Deployment', name: `${name}-management` },
          { kind: 'Deployment', name: `${name}-relay` },
        ],
      })
    )
  }

  // --- CNPG cluster (CNPG-managed credentials: the -app fqdn-uri is the DSN) ---
  const dbCredentialsRef = databaseCredentialsRef(dbName, secretProvider, 'cnpg')
  resources_.push(
    jsx(Database, {
      backup: backup ?? true,
      name: dbName,
      namespace,
      database: 'netbird',
      owner: 'netbird',
      instances: dbInstances,
      storage: dbStorage,
      ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
      parameters: {
        shared_buffers: '128MB',
        max_connections: '100',
      },
      credentialsMode: 'cnpg',
    })
  )

  // --- Derived identity endpoints (Keycloak realm layout) -----------------------
  const jwks = `${issuer.replace(/\/$/, '')}/protocol/openid-connect/certs`
  const tokenEndpoint = `${issuer.replace(/\/$/, '')}/protocol/openid-connect/token`
  const oidcConfigEndpoint = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`

  // management.json — {{ .VAR }} placeholders are substituted by the
  // management binary from process env (netbird ≥ 0.30.1), the mechanism
  // the chart's own IdP examples rely on. Secrets stay env-only: the
  // rendered configmap carries placeholders, never values.
  const managementConfig = JSON.stringify(
    {
      Stuns: [],
      TURNConfig: {
        Turns: [],
        CredentialsTTL: '12h0m0s',
        Secret: 'secret',
        TimeBasedCredentials: false,
      },
      Relay: {
        // The chart's relay ingress terminates TLS at host:443
        Addresses: [`rels://${host}:443/relay`],
        CredentialsTTL: '24h',
        Secret: '{{ .RELAY_PASSWORD }}',
      },
      Signal: {
        Proto: 'https',
        URI: `${host}:443`,
        Username: '',
        Password: '',
      },
      ReverseProxy: {
        TrustedHTTPProxies: null,
        TrustedHTTPProxiesCount: 0,
        TrustedPeers: null,
      },
      Datadir: '',
      DataStoreEncryptionKey: '{{ .DATASTORE_ENCRYPTION_KEY }}',
      StoreConfig: {
        // external CNPG Postgres — the DSN travels via env only
        Engine: 'postgres',
      },
      HttpConfig: {
        LetsEncryptDomain: '',
        CertFile: '',
        CertKey: '',
        AuthAudience: '{{ .IDP_CLIENT_ID }}',
        AuthIssuer: '{{ .NETBIRD_AUTH_ISSUER }}',
        AuthUserIDClaim: userIdClaim,
        AuthKeysLocation: '{{ .NETBIRD_AUTH_JWT_CERTS }}',
        IdpSignKeyRefreshEnabled: false,
        OIDCConfigEndpoint: '{{ .NETBIRD_AUTH_OIDC_CONFIGURATION_ENDPOINT }}',
      },
      IdpManagerConfig: {
        ManagerType: 'keycloak',
        ClientConfig: {
          Issuer: '{{ .NETBIRD_AUTH_ISSUER }}',
          TokenEndpoint: '{{ .NETBIRD_AUTH_TOKEN_ENDPOINT }}',
          ClientID: '{{ .IDP_CLIENT_ID }}',
          ClientSecret: '{{ .IDP_CLIENT_SECRET }}',
          GrantType: 'client_credentials',
        },
        KeycloakClientCredentials: {
          ClientID: '{{ .IDP_CLIENT_ID }}',
          ClientSecret: '{{ .IDP_CLIENT_SECRET }}',
          GrantType: 'client_credentials',
        },
        ExtraConfig: null,
        Auth0ClientCredentials: null,
        AzureClientCredentials: null,
        ZitadelClientCredentials: null,
      },
      DeviceAuthorizationFlow: {
        Provider: 'hosted',
        ProviderConfig: {
          ClientID: '{{ .IDP_CLIENT_ID }}',
          ClientSecret: '',
          Domain: '',
          Audience: '{{ .IDP_CLIENT_ID }}',
          TokenEndpoint: '{{ .NETBIRD_AUTH_TOKEN_ENDPOINT }}',
          DeviceAuthEndpoint: `${issuer.replace(/\/$/, '')}/protocol/openid-connect/auth/device`,
          AuthorizationEndpoint: '',
          Scope: 'openid',
          UseIDToken: false,
          RedirectURLs: null,
        },
      },
      PKCEAuthorizationFlow: {
        Provider: 'hosted',
        ProviderConfig: {
          ClientID: '{{ .IDP_CLIENT_ID }}',
          ClientSecret: '{{ .IDP_CLIENT_SECRET }}',
          Domain: '',
          Audience: '{{ .IDP_CLIENT_ID }}',
          TokenEndpoint: '{{ .NETBIRD_AUTH_TOKEN_ENDPOINT }}',
          DeviceAuthEndpoint: '',
          AuthorizationEndpoint: `${issuer.replace(/\/$/, '')}/protocol/openid-connect/auth`,
          Scope: 'openid profile email offline_access api',
          UseIDToken: false,
          DisablePromptLogin: true,
          LoginFlag: false,
          RedirectURLs: ['http://localhost:53000'],
        },
      },
    },
    null,
    '  '
  )

  // --- Common ingress config -----------------------------------------------------
  const grpcTimeouts = {
    'nginx.ingress.kubernetes.io/backend-protocol': 'GRPC',
    'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
    'nginx.ingress.kubernetes.io/proxy-read-timeout': '3600',
    'nginx.ingress.kubernetes.io/proxy-send-timeout': '3600',
  }
  const tlsEntry = [{ secretName: tls.secretName, hosts: [host] }]

  // --- Flux: HelmRepository + HelmRelease (facit values, decisions encoded) ------
  resources_.push(
    jsx('HelmRepository', {
      apiVersion: 'source.toolkit.fluxcd.io/v1',
      kind: 'HelmRepository',
      metadata: { name, namespace: repoNamespace },
      spec: { interval: '24h', url: repoUrl },
    }),
    jsx('HelmRelease', {
      apiVersion: 'helm.toolkit.fluxcd.io/v2',
      kind: 'HelmRelease',
      metadata: { name, namespace },
      spec: {
        interval: '30m',
        chart: {
          spec: {
            chart: 'netbird',
            version: chartVersion,
            sourceRef: { kind: 'HelmRepository', name, namespace: repoNamespace },
            interval: '12h',
          },
        },
        values: {
          management: {
            ...(storage
              ? {
                  persistentVolume: {
                    enabled: true,
                    size: storage,
                    accessModes: ['ReadWriteOnce'],
                  },
                }
              : { persistentVolume: { enabled: false } }),
            useBackwardsGrpcService: true,
            // The dashboard catch-all carries the cert-manager annotation —
            // one Certificate for the host; the remaining ingresses only
            // reference the same secret (5 identical LE orders = at the
            // duplicate-cert rate limit the chart's tested example dodges)
            ingress: {
              enabled: true,
              className: 'nginx',
              annotations: {
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
              hosts: [{ host, paths: [{ path: '/api', pathType: 'ImplementationSpecific' }] }],
              tls: tlsEntry,
            },
            ingressGrpc: {
              enabled: true,
              className: 'nginx',
              annotations: {
                ...grpcTimeouts,
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
              hosts: [
                {
                  host,
                  paths: [
                    { path: '/management.ManagementService', pathType: 'ImplementationSpecific' },
                  ],
                },
              ],
              tls: tlsEntry,
            },
            configmap: managementConfig,
            env: {
              NETBIRD_DOMAIN: host,
              NETBIRD_AUTH_ISSUER: issuer,
              NETBIRD_AUTH_JWT_CERTS: jwks,
              NETBIRD_AUTH_TOKEN_ENDPOINT: tokenEndpoint,
              NETBIRD_AUTH_OIDC_CONFIGURATION_ENDPOINT: oidcConfigEndpoint,
              IDP_CLIENT_ID: idp.clientId,
            },
            // envRaw = the chart's structured-var block (standard
            // valueFrom.secretKeyRef contract — the DSN and every secret
            // value stays reference-only, never a rendered literal)
            envRaw: [
              secretEnv('IDP_CLIENT_SECRET', oidcSecretName, 'client-secret'),
              secretEnv('DATASTORE_ENCRYPTION_KEY', credentialsName, 'datastore-encryption-key'),
              secretEnv('RELAY_PASSWORD', credentialsName, 'relay-secret'),
              // CNPG generates <db>-app incl. the full fqdn-uri DSN —
              // netbird's postgres store reads it via this env var
              secretEnv('NETBIRD_STORE_ENGINE_POSTGRES_DSN', dbCredentialsRef.name, 'fqdn-uri'),
            ],
            image: {
              repository: 'netbirdio/management',
              tag: imageTag,
              pullPolicy: 'IfNotPresent',
            },
          },
          signal: {
            enabled: true,
            ingress: {
              enabled: true,
              className: 'nginx',
              annotations: {
                ...grpcTimeouts,
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
              hosts: [
                {
                  host,
                  paths: [
                    {
                      path: '/signalexchange.SignalExchange',
                      pathType: 'ImplementationSpecific',
                    },
                  ],
                },
              ],
              tls: tlsEntry,
            },
            image: {
              repository: 'netbirdio/signal',
              tag: imageTag,
              pullPolicy: 'IfNotPresent',
            },
          },
          relay: {
            enabled: true,
            env: {
              NB_LOG_LEVEL: 'info',
              NB_LISTEN_ADDRESS: ':33080',
              NB_EXPOSED_ADDRESS: `rels://${host}:443/relay`,
            },
            envRaw: [secretEnv('NB_AUTH_SECRET', credentialsName, 'relay-secret')],
            ...(relayPort
              ? { service: { type: 'LoadBalancer', port: relayPort, name: 'http' } }
              : {}),
            ingress: {
              enabled: true,
              className: 'nginx',
              annotations: {
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
              hosts: [{ host, paths: [{ path: '/relay', pathType: 'ImplementationSpecific' }] }],
              tls: tlsEntry,
            },
            image: {
              repository: 'netbirdio/relay',
              tag: imageTag,
              pullPolicy: 'IfNotPresent',
            },
          },
          dashboard: {
            enabled: true,
            ingress: {
              enabled: true,
              className: 'nginx',
              annotations: {
                // Sole cert-manager annotation — the shared secret's issuer
                'cert-manager.io/cluster-issuer': tls.clusterIssuer,
                'external-dns.alpha.kubernetes.io/hostname': host,
              },
              hosts: [{ host, paths: [{ path: '/', pathType: 'ImplementationSpecific' }] }],
              tls: tlsEntry,
            },
            env: {
              NETBIRD_MGMT_API_ENDPOINT: `https://${host}`,
              NETBIRD_MGMT_GRPC_API_ENDPOINT: `https://${host}`,
              AUTH_AUTHORITY: issuer,
              AUTH_CLIENT_ID: idp.clientId,
              AUTH_AUDIENCE: idp.clientId,
              AUTH_SUPPORTED_SCOPES: 'openid profile email offline_access api',
              NETBIRD_TOKEN_SOURCE: 'accessToken',
              USE_AUTH0: 'false',
            },
            image: {
              repository: 'netbirdio/dashboard',
              tag: 'v2.13.1',
              pullPolicy: 'IfNotPresent',
            },
          },
        },
      },
    })
  )

  return jsx(Fragment, { children: resources_ })
}
