import { jsx, Fragment, useContext } from '@r8s/core'
import { SecretContext, useNamespace } from '@r8s/core/defaults'
import {
  Database,
  WebService,
  Endpoint,
  StaticSecret,
  canProvisionSecrets,
  secretsRequiredError,
  type DatabaseProps,
} from '@r8s/recipes'

export interface UmamiProps {
  /** Resource name (defaults to 'umami') */
  name?: string
  /** Kubernetes namespace (inherited from <Platform> unless set) */
  namespace?: string
  /**
   * Umami image tag. PINNED by default ('postgresql-v2.17.0') — facit
   * floated on `postgresql-latest` and schema migrations are
   * forward-only, so a surprise major upgrade breaks the install.
   * Pass `version` explicitly to upgrade; `latest` is rejected.
   */
  version?: string
  /** Public hostname (required), e.g. 'umami.berget.ai' */
  host: string
  /**
   * OpenID Connect SSO (Keycloak). The discovery URL may point at any
   * realm — facit uses the Keycloak master realm. Client credentials
   * (keys `client-id` / `client-secret` — hyphenated per the Keycloak
   * convention) are provisioned through the Platform secrets backend
   * unless `clientSecretRef` references a pre-created Secret.
   */
  sso?: {
    /** Full .well-known/openid-configuration URL, e.g. https://keycloak.example.com/realms/master/.well-known/openid-configuration */
    discoveryUrl: string
    /** OIDC client id, e.g. 'umami' */
    clientId: string
    /** Backend path (defaults to `<provider.path>/<name>/keycloak-oidc`) */
    path?: string
    /** Reference a pre-created OIDC Secret (keys: client-id, client-secret) instead of provisioning */
    clientSecretRef?: string
    /** OAuth scope (defaults to 'openid email profile') */
    scope?: string
  }
  /** Reference a pre-created app-secret bundle (key: app-secret) instead of backend provisioning */
  appSecretRef?: string
  /** CNPG cluster name (defaults to `<name>-db`) */
  dbName?: string
  /** Number of CNPG instances (defaults to 2) */
  dbInstances?: number
  /** CNPG data volume size (defaults to '20Gi') */
  dbStorage?: string
  /** CNPG storage class (defaults to cluster default) */
  dbStorageClass?: string
  /**
   * CNPG backup configuration passed through to the Database recipe.
   * Facit targets Scaleway S3 (https://s3.nl-ams.scw.cloud) — the
   * endpoint is therefore a required part of the prop, not a constant.
   */
  backup?: DatabaseProps['backup']
  /** Number of app replicas (defaults to 1 — umami is not horizontally scaled in facit) */
  replicas?: number
  /** App resources (defaults to facit: 256Mi/100m → 512Mi/500m) */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /**
   * Extra Endpoint annotations merged over the default. NOTE:
   * `nginx.ingress.kubernetes.io/configuration-snippet` is disabled by the
   * ingress-nginx admin on this cluster — the package never emits it.
   */
  endpointAnnotations?: Record<string, string>
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Umami — privacy-focused web analytics, facit-aligned.
 *
 * @title Umami
 * @category Data & Analytics
 *
 * Composes:
 * - Umami Deployment + Service (pinned image, `/api/heartbeat` probes with
 *   the app's slow-boot delays)
 * - CNPG Postgres cluster with `credentialsMode: 'cnpg'` — DATABASE_URL
 *   references the operator-generated `<db>-app` secret's `fqdn-uri` key
 *   directly (no vault-stored DB credentials)
 * - App secret + optional OIDC client credentials via the Platform
 *   secrets backend
 * - Endpoint with TLS
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Umami } from '@r8s/umami'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'secret', path: 'umami' }}>
 *     <Umami host="umami.example.com" />
 *   </Platform>
 * )
 */
export function Umami(props: UmamiProps) {
  const {
    name = 'umami',
    namespace: namespaceProp,
    version = 'postgresql-v2.17.0',
    host,
    sso,
    appSecretRef,
    dbName = `${name}-db`,
    dbInstances = 2,
    dbStorage = '20Gi',
    dbStorageClass,
    backup,
    replicas = 1,
    resources = {
      requests: { memory: '256Mi', cpu: '100m' },
      limits: { memory: '512Mi', cpu: '500m' },
    },
    endpointAnnotations = {},
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  const namespace = useNamespace(namespaceProp)
  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  if (version === 'latest' || version.endsWith('-latest')) {
    throw new Error(
      `Umami "${name}" requires a pinned version.\n` +
        `\n` +
        `Facit floated on 'postgresql-latest' — umami schema migrations are\n` +
        `forward-only, so a surprise major upgrade breaks the install.\n` +
        `\n` +
        `Fix: <Umami version="postgresql-v2.17.0" ... />`
    )
  }

  // --- App secret (session signing) -------------------------------------------
  const appSecretsName = appSecretRef ?? `${name}-secrets`
  if (!appSecretRef) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Umami',
        name,
        'an app secret (APP_SECRET) — it signs all sessions',
        { propName: 'appSecretRef', exampleValue: `${name}-secrets`, keys: ['app-secret'] }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-secrets`,
        namespace,
        path: `${secretProvider.path ?? name}/${name}/app`,
        secretName: appSecretsName,
        keys: ['app-secret'],
        restart: [{ kind: 'Deployment', name }],
      })
    )
  }

  // --- OIDC (Keycloak) ----------------------------------------------------------
  const oidcSecretsName = sso?.clientSecretRef ?? `${name}-keycloak-oidc`
  if (sso && !sso.clientSecretRef) {
    if (!canProvisionSecrets(secretProvider)) {
      throw secretsRequiredError(
        'Umami',
        name,
        'OIDC client credentials (client-id, client-secret) because sso is configured',
        {
          propName: 'sso.clientSecretRef',
          exampleValue: `${name}-keycloak-oidc`,
          keys: ['client-id', 'client-secret'],
        }
      )
    }
    resources_.push(
      jsx(StaticSecret, {
        name: `${name}-keycloak-oidc`,
        namespace,
        path: sso.path ?? `${secretProvider.path ?? name}/${name}/keycloak-oidc`,
        secretName: oidcSecretsName,
        keys: ['client-id', 'client-secret'],
        restart: [{ kind: 'Deployment', name }],
      })
    )
  }

  // --- Database (CNPG; CNPG-managed credentials incl. fqdn-uri) -----------------
  resources_.push(
    jsx(Database, {
      name: dbName,
      namespace,
      instances: dbInstances,
      storage: dbStorage,
      ...(dbStorageClass ? { storageClass: dbStorageClass } : {}),
      parameters: {
        shared_buffers: '256MB',
        max_connections: '100',
        work_mem: '8MB',
        maintenance_work_mem: '128MB',
        effective_cache_size: '768MB',
      },
      credentialsMode: 'cnpg',
      ...(backup ? { backup } : {}),
    })
  )

  // --- App -----------------------------------------------------------------------
  resources_.push(
    jsx(WebService, {
      name,
      namespace,
      image: `ghcr.io/umami-software/umami:${version}`,
      port: 3000,
      replicas,
      resources,
      env: {
        ...(sso
          ? {
              OAUTH_DISCOVERY_URL: sso.discoveryUrl,
              OAUTH_REDIRECT_URL: `https://${host}/api/auth/callback/openid`,
              OAUTH_SCOPE: sso.scope ?? 'openid email profile',
              OAUTH_USERNAME_CLAIM: 'preferred_username',
              OAUTH_EMAIL_CLAIM: 'email',
              OAUTH_NAME_CLAIM: 'name',
            }
          : {}),
      },
      secrets: {
        // CNPG-generated `<db>-app` carries fqdn-uri — use it directly
        DATABASE_URL: { secret: `${dbName}-app`, key: 'fqdn-uri' },
        APP_SECRET: { secret: appSecretsName, key: 'app-secret' },
        ...(sso
          ? {
              OAUTH_CLIENT_ID: { secret: oidcSecretsName, key: 'client-id' },
              OAUTH_CLIENT_SECRET: { secret: oidcSecretsName, key: 'client-secret' },
            }
          : {}),
      },
      probes: {
        readiness: { path: '/api/heartbeat', initialDelaySeconds: 30, periodSeconds: 10 },
        liveness: { path: '/api/heartbeat', initialDelaySeconds: 60, periodSeconds: 30 },
      },
    }),
    jsx(Endpoint, {
      name: `${name}-endpoint`,
      namespace,
      host,
      serviceName: name,
      servicePort: 80,
      annotations: endpointAnnotations,
      tls,
    })
  )

  return jsx(Fragment, { children: resources_ })
}
