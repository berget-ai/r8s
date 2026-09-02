import { jsx, Fragment, useContext } from '@r8s/core'
import { Namespace, SecretContext } from '@r8s/core/defaults'
import { Database, WebService, Endpoint } from '@r8s/recipes'
import type { SecretRef } from '@r8s/recipes'

export interface EneoProps {
  /** Resource name (defaults to 'eneo') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the Eneo web app (required) */
  host: string
  /** Number of app replicas (defaults to 2 — scale freely, the app is stateless) */
  replicas?: number
  /**
   * S3-compatible object storage for document corpora (RustFS in the
   * platform). Required. Reference a bucket whose credentials live in a
   * Secret provisioned by the secrets backend (keys: accessKey, secretKey)
   * — never plaintext.
   */
  objectStorage: {
    /** S3 endpoint URL, e.g. https://s3.internal.example.com */
    endpoint: string
    /** Bucket holding document corpora */
    bucket: string
    /** Name of the Secret holding accessKey / secretKey */
    credentialsSecret: string
    /** Region string for the S3 client (defaults to 'us-east-1') */
    region?: string
  }
  /**
   * OIDC SSO client — register Eneo as a client in Keycloak (the Auth
   * recipe) and reference the client secret through the backend.
   */
  sso?: {
    issuer: string
    clientId: string
    clientSecretRef: SecretRef
    scopes?: string
  }
  /**
   * Outgoing SMTP for invitations and notifications (mirror of the
   * EuroOffice recipe). When set, SMTP_HOST / SMTP_PORT / SMTP_FROM are
   * rendered as plain env and SMTP_PASSWORD is delivered via secretKeyRef
   * from the `${name}-secrets` bundle (key: smtpPassword) — never
   * plaintext. The bundle then requires the `smtpPassword` key as well;
   * without `smtp` only `appSecret` is required from the bundle.
   */
  smtp?: {
    /** SMTP server hostname, e.g. smtp.example.com */
    host: string
    /** SMTP port (defaults to 587) */
    port?: number
    /** From address for outgoing mail, e.g. no-reply@example.com */
    from?: string
  }
  /**
   * Name of an existing Secret holding `appSecret` (and `smtpPassword`
   * when `smtp` is set). Required unless a secrets backend
   * (openbao/vault) is configured on the surrounding Platform — the
   * backend then provisions them.
   */
  secretsName?: string
  /**
   * Storage size for the Postgres cluster (defaults to '10Gi').
   *
   * Document corpora live in object storage (`objectStorage`, S3/RustFS)
   * — Eneo does not persist corpora on a local volume. A local corpus
   * PVC (mounted volumes/sidecars on the app workload) is a v1.1 item.
   */
  dbStorage?: string
  /** Requested app resources */
  resources?: {
    requests?: { cpu?: string; memory?: string }
    limits?: { cpu?: string; memory?: string }
  }
  /** TLS configuration (defaults to letsencrypt-prod cluster issuer) */
  tls?: {
    secretName: string
    clusterIssuer: string
  }
}

/**
 * Eneo — open AI platform from Sundsvall municipality (agent workspaces,
 * assistants, document AI).
 *
 * @title Eneo
 * @category Agent Platforms
 *
 * Composes:
 * - CNPG Postgres cluster (conversations, workspaces, document metadata;
 *   size via `dbStorage`)
 * - Eneo Deployment + Service + Endpoint (DATABASE_URL auto-wired)
 * - S3/RustFS bucket reference for document corpora (required) — corpora
 *   do not use local volumes; a local corpus PVC is a v1.1 item
 * - App secrets (appSecret, plus smtpPassword when `smtp` is set)
 *   provisioned by the Platform secrets backend (openbao / vault), or
 *   referenced from an existing Secret
 * - Optional SMTP delivery; password via the `${name}-secrets` bundle
 * - OIDC SSO against the Keycloak `Auth` recipe
 *
 * The namespace is inherited from the surrounding `<Platform>` (via the
 * Namespace context) unless set explicitly.
 *
 * Wrap the component in `<Platform secrets={{ backend: 'openbao' }}>` and
 * the app secrets bundle is provisioned for you. Without a backend you
 * must point `secretsName` at a pre-created Secret.
 *
 * @example
 * import { Platform } from '@r8s/recipes'
 * import { Eneo } from '@r8s/eneo'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <Eneo
 *       name="eneo"
 *       host="eneo.example.com"
 *       objectStorage={{
 *         endpoint: 'https://s3.internal.example.com',
 *         bucket: 'eneo-corpora',
 *         credentialsSecret: 'eneo-object-storage',
 *       }}
 *     />
 *   </Platform>
 * )
 */
export function Eneo(props: EneoProps) {
  const {
    name = 'eneo',
    namespace: namespaceProp,
    version = 'latest',
    host,
    replicas = 2,
    objectStorage,
    sso,
    smtp,
    secretsName,
    dbStorage = '10Gi',
    resources = {
      requests: { memory: '512Mi', cpu: '250m' },
      limits: { memory: '2Gi', cpu: '1000m' },
    },
    tls = { secretName: `${name}-tls`, clusterIssuer: 'letsencrypt-prod' },
  } = props

  // Inherit namespace from <Platform> context if not explicitly set
  const contextNamespace = useContext(Namespace)
  const namespace =
    namespaceProp ?? (contextNamespace !== 'default' ? contextNamespace : undefined) ?? 'default'

  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const platformSecretsName = secretsName ?? `${name}-secrets`

  // --- App secrets (appSecret / smtpPassword) -------------------------------
  // Session signing and SMTP delivery credentials are the crown jewels of an
  // Eneo install — never render them as plaintext. With a secrets backend
  // they are provisioned through the backend; otherwise reference a
  // pre-created Secret. smtpPassword is only required from the bundle when
  // the `smtp` prop is configured.
  const requiredSecretKeys = smtp ? 'appSecret, smtpPassword' : 'appSecret'
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `Eneo "${name}" requires application secrets (${requiredSecretKeys}).\n` +
          `\n` +
          `These must not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <Eneo name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: ${requiredSecretKeys}):\n` +
          `  <Eneo name="${name}" host="${host}" secretsName="${name}-secrets" />`
      )
    }

    const spec = {
      ...(secretProvider.backend === 'vault'
        ? { vaultAuthRef: secretProvider.authRef }
        : { openbaoAuthRef: secretProvider.authRef }),
      mount: secretProvider.mount,
      type: 'kv-v2' as const,
      path: `${secretProvider.path ?? name}/${name}/secrets`,
      destination: { create: true, name: platformSecretsName },
    }
    resources_.push(
      secretProvider.backend === 'vault'
        ? jsx('VaultStaticSecret', {
            apiVersion: 'secrets.hashicorp.com/v1beta1',
            kind: 'VaultStaticSecret',
            metadata: { name: `${name}-secrets`, namespace },
            spec,
          })
        : jsx('OpenBaoStaticSecret', {
            apiVersion: 'secrets.openbao.org/v1beta1',
            kind: 'OpenBaoStaticSecret',
            metadata: { name: `${name}-secrets`, namespace },
            spec,
          })
    )
  }

  // --- Env wiring --------------------------------------------------------------
  // Every credential is referenced with $(VAR) expansion or secretKeyRef —
  // no plaintext in the manifest. The WebService declares secret-backed
  // vars before plain env vars, so dependent expansion resolves. DATABASE_URL
  // and PG* vars are auto-wired from the Database context (see below).
  const env: Record<string, string> = {
    PORT: '3000',
    BASE_URL: `https://${host}`,
    S3_ENDPOINT: objectStorage.endpoint,
    S3_BUCKET: objectStorage.bucket,
    AWS_REGION: objectStorage.region ?? 'us-east-1',
    ...(sso
      ? {
          OIDC_ISSUER: sso.issuer,
          OIDC_CLIENT_ID: sso.clientId,
          OIDC_SCOPES: sso.scopes ?? 'openid email profile',
          OIDC_AUTH_URI: '$(OIDC_ISSUER)/protocol/openid-connect/auth',
          OIDC_TOKEN_URI: '$(OIDC_ISSUER)/protocol/openid-connect/token',
          OIDC_USERINFO_URI: '$(OIDC_ISSUER)/protocol/openid-connect/userinfo',
        }
      : {}),
    ...(smtp
      ? {
          SMTP_HOST: smtp.host,
          SMTP_PORT: String(smtp.port ?? 587),
          ...(smtp.from && { SMTP_FROM: smtp.from }),
        }
      : {}),
  }

  // Credentials delivered via secretKeyRef (runtime injection).
  // OIDC_CLIENT_SECRET comes from sso.clientSecretRef — do NOT also render
  // it as a plain $(VAR) env entry: duplicate env names are rejected by
  // Kubernetes.
  const secrets: Record<string, SecretRef | string> = {
    APP_SECRET: { secret: platformSecretsName, key: 'appSecret' },
    ...(smtp
      ? { SMTP_PASSWORD: { secret: platformSecretsName, key: 'smtpPassword' as const } }
      : {}),
    AWS_ACCESS_KEY_ID: { secret: objectStorage.credentialsSecret, key: 'accessKey' },
    AWS_SECRET_ACCESS_KEY: { secret: objectStorage.credentialsSecret, key: 'secretKey' },
    ...(sso ? { OIDC_CLIENT_SECRET: sso.clientSecretRef } : {}),
  }

  // --- Database + app + endpoint ------------------------------------------------
  // Database wraps the app so credentials stay consistent with the r8s
  // Database recipe (CNPG dedicated cluster provisions the secret) and the
  // WebService auto-wires PG* + DATABASE_URL from DatabaseContext.
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage: dbStorage,
      children: (
        <WebService
          name={name}
          namespace={namespace}
          image={`ghcr.io/berget-ai/eneo:${version}`}
          port={3000}
          replicas={replicas}
          resources={resources}
          env={env}
          secrets={secrets}
        />
      ),
    })
  )

  resources_.push(
    <Endpoint
      name={`${name}-endpoint`}
      namespace={namespace}
      host={host}
      serviceName={name}
      servicePort={3000}
      tls={tls}
    />
  )

  return jsx(Fragment, { children: resources_ })
}
