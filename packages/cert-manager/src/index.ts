import { jsx } from '@r8s/core'
import { ClusterIssuer, Certificate } from '@r8s/k8s-types'
import { manifestOperator } from '@r8s/k8s-types'

/** cert-manager operator declaration */
export const certManagerOperator = (version = '1.14.0') =>
  manifestOperator(
    'cert-manager',
    `https://github.com/cert-manager/cert-manager/releases/download/v${version}/cert-manager.yaml`,
    version,
    {
      description: 'cert-manager for TLS certificate automation',
      namespace: 'cert-manager',
      crds: [
        'certificates.cert-manager.io',
        'certificaterequests.cert-manager.io',
        'issuers.cert-manager.io',
        'clusterissuers.cert-manager.io',
        'challenges.acme.cert-manager.io',
        'orders.acme.cert-manager.io',
      ],
    }
  )

export interface LetsEncryptIssuerProps {
  /** Resource name */
  name: string
  /** Email address used by Let's Encrypt for certificate expiry notices */
  email: string
  /** Let's Encrypt environment to use — 'production' (real, rate-limited certs) or 'staging' (test certs) */
  server?: 'production' | 'staging'
  /** Ingress controller class (e.g., 'nginx') that cert-manager should use for HTTP-01 challenges */
  ingressClass?: string
}

/**
 * Creates a Let's Encrypt ClusterIssuer for automatic TLS certificates.
 *
 * @example
 * <LetsEncryptIssuer name="letsencrypt" email="admin@example.com" server="production" />
 */
export function LetsEncryptIssuer(props: LetsEncryptIssuerProps) {
  const { name, email, server = 'production', ingressClass = 'nginx' } = props

  const acmeServer =
    server === 'production'
      ? 'https://acme-v02.api.letsencrypt.org/directory'
      : 'https://acme-staging-v02.api.letsencrypt.org/directory'

  const issuer: ClusterIssuer = {
    apiVersion: 'cert-manager.io/v1',
    kind: 'ClusterIssuer',
    metadata: { name },
    spec: {
      acme: {
        server: acmeServer,
        email,
        privateKeySecretRef: { name: `${name}-account-key` },
        solvers: [
          {
            http01: {
              ingress: { class: ingressClass },
            },
          },
        ],
      },
    },
  }

  return jsx('ClusterIssuer', issuer)
}

export interface ManagedCertificateProps {
  /** Resource name */
  name: string
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string
  /** Name of the Kubernetes Secret holding the TLS certificate */
  secretName: string
  /** Name of the cert-manager Issuer or ClusterIssuer to request the certificate from */
  issuerName: string
  /** Domain names the certificate should be valid for */
  dnsNames: string[]
  /** How long the certificate is valid (e.g., '2160h' for 90 days) */
  duration?: string
  /** When cert-manager should start renewing the certificate before it expires (e.g., '360h' for 15 days) */
  renewBefore?: string
}

/**
 * Creates a cert-manager Certificate resource that automatically provisions
 * and renews a TLS certificate from the specified ClusterIssuer.
 *
 * @example
 * <ManagedCertificate name="app-tls" secretName="app-tls" issuerName="letsencrypt-prod" dnsNames={["app.example.com"]} />
 */
export function ManagedCertificate(props: ManagedCertificateProps) {
  const {
    name,
    namespace = 'default',
    secretName,
    issuerName,
    dnsNames,
    duration = '2160h', // 90 days
    renewBefore = '360h', // 15 days
  } = props

  const certificate: Certificate = {
    apiVersion: 'cert-manager.io/v1',
    kind: 'Certificate',
    metadata: { name, namespace },
    spec: {
      secretName,
      issuerRef: {
        name: issuerName,
        kind: 'ClusterIssuer',
      },
      dnsNames,
      duration,
      renewBefore,
    },
  }

  return jsx('Certificate', certificate)
}
