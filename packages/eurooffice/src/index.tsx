import { jsx, Fragment, useContext } from '@r8s/core'
import { Namespace, SecretContext } from '@r8s/core/defaults'
import { Database, WebService, Endpoint } from '@r8s/recipes'
import type { SecretRef } from '@r8s/recipes'

export interface EuroOfficeProps {
  /** Resource name (defaults to 'eurooffice') */
  name?: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Container image tag (defaults to 'latest' — pin a version in production) */
  version?: string
  /** Public hostname for the document suite (required) */
  host: string
  /**
   * Number of app replicas.
   *
   * With `websockets` enabled (the default) this defaults to **1**:
   * websocket sessions are pinned to the pod that accepted the
   * connection and the workload has no session affinity, so >1 replicas
   * means collaborators on different pods stop seeing each other live.
   * An explicitly set `replicas` is rendered as asked — pair it with a
   * sticky-session (source-IP) ingress strategy for live co-editing.
   * With `websockets: false` the default is 2 (the app is stateless —
   * scale freely).
   */
  replicas?: number
  /**
   * Collaborative editing over websockets (default: true). Disable only
   * for single-user or read-only deployments — document presence,
   * cursor sharing and live co-editing all rely on websockets.
   */
  websockets?: boolean
  /**
   * S3-compatible object storage for document blobs and attachments
   * (RustFS in the platform). Required — reference a bucket whose
   * credentials live in a Secret provisioned by the secrets backend
   * (keys: accessKey, secretKey) — never plaintext.
   */
  objectStorage: {
    /** S3 endpoint URL, e.g. https://s3.internal.example.com */
    endpoint: string
    /** Bucket name for document blobs */
    bucket: string
    /** Name of the Secret holding accessKey / secretKey */
    credentialsSecret: string
    /** Region string for the S3 client (defaults to 'us-east-1') */
    region?: string
  }
  /**
   * Outgoing SMTP for invitations and notifications. The SMTP password is
   * delivered via secretKeyRef from the `${name}-secrets` bundle
   * (key: smtpPassword) — never plaintext.
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
   * LibreOffice headless document-conversion workers (same app image,
   * which must include soffice). Adds a `${name}-soffice` Deployment +
   * Service; the app reaches it at SOFFICE_HOST:SOFFICE_PORT. Workers
   * serve the UNO socket (TCP), not HTTP — their probes probe the socket.
   */
  conversions?: boolean
  /** LibreOffice conversion worker replicas (defaults to 1, only used with conversions) */
  conversionWorkers?: number
  /**
   * Name of an existing Secret holding `secretKey` and `smtpPassword`.
   * Required unless a secrets backend (openbao/vault) is configured on
   * the surrounding Platform — the backend then provisions them.
   * Plaintext values are not supported.
   */
  secretsName?: string
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
 * EuroOffice — collaborative document suite.
 *
 * @title EuroOffice
 * @category Productivity & Documents
 *
 * Composes:
 * - CNPG Postgres cluster (documents, revisions, users; DATABASE_URL is
 *   auto-wired from the DatabaseContext — no manual connection string)
 * - EuroOffice Deployment + Service + Endpoint (websockets enabled by
 *   default for live co-editing)
 * - Required S3/RustFS object storage for document blobs
 * - Optional LibreOffice headless conversion workers (same image; probed
 *   on their UNO TCP socket)
 * - Optional SMTP delivery; password via the `${name}-secrets` bundle
 * - APP_SECRET (and SMTP_PASSWORD) provisioned through the Platform
 *   secrets backend (openbao / vault), or referenced from an existing
 *   Secret via `secretsName`
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
 * import { EuroOffice } from '@r8s/eurooffice'
 *
 * export default (
 *   <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>
 *     <EuroOffice
 *       name="docs"
 *       host="docs.example.com"
 *       objectStorage={{
 *         endpoint: 'https://s3.internal.example.com',
 *         bucket: 'docs-blobs',
 *         credentialsSecret: 'docs-blobs-credentials',
 *       }}
 *       smtp={{ host: 'smtp.example.com', port: 587, from: 'no-reply@${env:MAIL_DOMAIN}' }}
 *     />
 *   </Platform>
 * )
 */
export function EuroOffice(props: EuroOfficeProps) {
  const {
    name = 'eurooffice',
    namespace: namespaceProp,
    version = 'latest',
    host,
    replicas: replicasProp,
    websockets = true,
    objectStorage,
    smtp,
    conversions = false,
    conversionWorkers = 1,
    secretsName,
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

  // Live co-editing runs over websockets pinned to a single pod (no session
  // affinity) — default to 1 replica unless the caller explicitly scales.
  const replicas = replicasProp ?? (websockets ? 1 : 2)

  const secretProvider = useContext(SecretContext)
  const resources_: ReturnType<typeof jsx>[] = []

  const platformSecretsName = secretsName ?? `${name}-secrets`

  // --- App secrets (APP_SECRET / SMTP_PASSWORD) -----------------------------
  // The app secret signs sessions and collaborator tokens — never render
  // it as plaintext. With a secrets backend the bundle is provisioned
  // through the backend (keys: secretKey, smtpPassword); otherwise
  // reference a pre-created Secret.
  if (!secretsName) {
    if (
      !secretProvider ||
      (secretProvider.backend !== 'vault' && secretProvider.backend !== 'openbao')
    ) {
      throw new Error(
        `EuroOffice "${name}" requires application secrets (APP_SECRET, SMTP_PASSWORD).\n` +
          `\n` +
          `The app secret signs sessions and collaborator tokens — it must ` +
          `not be rendered as plaintext.\n` +
          `\n` +
          `Fix: configure a secrets backend on the Platform:\n` +
          `  <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'apps' }}>\n` +
          `    <EuroOffice name="${name}" host="${host}" />\n` +
          `  </Platform>\n` +
          `\n` +
          `Or reference a pre-created Secret (keys: secretKey, smtpPassword):\n` +
          `  <EuroOffice name="${name}" host="${host}" secretsName="${name}-secrets" />`
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

  // --- Env wiring -------------------------------------------------------------
  // Every credential is delivered via secretKeyRef — no plaintext in the
  // manifest. DATABASE_URL is auto-wired by WebService from the
  // DatabaseContext (PG* vars + $(VAR) template), so it is not declared here.
  const env: Record<string, string> = {
    PORT: '3000',
    APP_URL: `https://${host}`,
    WEBSOCKETS_ENABLED: websockets ? 'true' : 'false',
    AWS_REGION: objectStorage.region ?? 'us-east-1',
    AWS_S3_UPLOAD_BUCKET_URL: `${objectStorage.endpoint}/${objectStorage.bucket}`,
    AWS_S3_UPLOAD_BUCKET_NAME: objectStorage.bucket,
    AWS_S3_ENDPOINT: objectStorage.endpoint,
    AWS_S3_FORCE_PATH_STYLE: 'true',
    ...(smtp
      ? {
          SMTP_HOST: smtp.host,
          SMTP_PORT: String(smtp.port ?? 587),
          ...(smtp.from && { SMTP_FROM: smtp.from }),
        }
      : {}),
    ...(conversions
      ? {
          SOFFICE_HOST: `${name}-soffice`,
          SOFFICE_PORT: '2002',
        }
      : {}),
  }

  // Credentials delivered via secretKeyRef (runtime injection)
  const secrets: Record<string, SecretRef | string> = {
    APP_SECRET: { secret: platformSecretsName, key: 'secretKey' },
    ...(smtp
      ? { SMTP_PASSWORD: { secret: platformSecretsName, key: 'smtpPassword' as const } }
      : {}),
    AWS_ACCESS_KEY_ID: { secret: objectStorage.credentialsSecret, key: 'accessKey' },
    AWS_SECRET_ACCESS_KEY: { secret: objectStorage.credentialsSecret, key: 'secretKey' },
  }

  // --- Database + app + conversions + endpoint --------------------------------
  // Database wraps the app so credentials stay consistent with the r8s
  // Database recipe (CNPG dedicated cluster provisions the secret) and
  // WebService auto-wires DATABASE_URL from the DatabaseContext.
  resources_.push(
    jsx(Database, {
      name,
      namespace,
      storage: '10Gi',
      children: (
        <WebService
          name={name}
          namespace={namespace}
          image={`ghcr.io/berget-ai/eurooffice:${version}`}
          port={3000}
          replicas={replicas}
          resources={resources}
          env={env}
          secrets={secrets}
        />
      ),
    })
  )

  // LibreOffice headless conversion workers — same app image (must include
  // soffice), listening for UNO socket connections. The workers know HTTP
  // health endpoints no better than we do, so probe the UNO TCP socket
  // directly (httpGet /health would crash-loop them).
  if (conversions) {
    resources_.push(
      <WebService
        name={`${name}-soffice`}
        namespace={namespace}
        image={`ghcr.io/berget-ai/eurooffice:${version}`}
        port={2002}
        replicas={conversionWorkers}
        command={[
          'soffice',
          '--headless',
          '--norestore',
          '--accept=socket,host=0.0.0.0,port=2002;urp;',
        ]}
        env={{ SOFFICE_MODE: 'worker' }}
        probes={{
          liveness: { tcp: true, port: 2002 },
          readiness: { tcp: true, port: 2002, initialDelaySeconds: 20 },
        }}
      />
    )
  }

  // --- Endpoint — collaborative editing shares the app host -------------------
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
