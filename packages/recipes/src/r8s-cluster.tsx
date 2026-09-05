import { jsx, Fragment, useContext } from '@r8s/core'
import { OperatorContext, Labels } from '@r8s/core/defaults'
import {
  operatorFactory as certManagerFactory,
  OPERATOR_KEY as CERT_MANAGER_KEY,
} from '@r8s/operator-cert-manager'
import {
  operatorFactory as externalDnsFactory,
  OPERATOR_KEY as EXTERNAL_DNS_KEY,
} from '@r8s/operator-external-dns'
import {
  operatorFactory as envoyGatewayFactory,
  OPERATOR_KEY as ENVOY_GATEWAY_KEY,
} from '@r8s/operator-envoy-gateway'
import {
  operatorFactory as vaultSecretsFactory,
  OPERATOR_KEY as VAULT_SECRETS_KEY,
} from '@r8s/operator-vault-secrets'
import {
  operatorFactory as prometheusFactory,
  OPERATOR_KEY as PROMETHEUS_KEY,
} from '@r8s/operator-prometheus'
import { operatorFactory as lokiFactory, OPERATOR_KEY as LOKI_KEY } from '@r8s/operator-loki'
import {
  operatorFactory as loggingFactory,
  OPERATOR_KEY as LOGGING_KEY,
} from '@r8s/operator-logging'
import { LokiStackComponent } from '@r8s/crds/loki'
import { LoggingComponent, FlowComponent, OutputComponent } from '@r8s/crds/logging'
import { SecretProvider, OpenBao } from './secret-provider'
import { DnsProvider, ExternalDns } from './dns-provider'
import { EndpointProvider, EnvoyGateway } from './endpoint-provider'
import type { Operator } from '@r8s/k8s-types'

export interface R8sClusterProps {
  /**
   * OpenBao secrets backend configuration. VSO (Vault Secrets Operator)
   * is declared automatically. This context is inherited by all
   * children (App, Database, Auth, etc.) so credentials are managed
   * by VSO — never plaintext.
   */
  secrets: {
    /** OpenBao mount path (e.g., 'secret') */
    mount: string
    /** OpenBao path prefix for this cluster (e.g., 'production') */
    path: string
    /** Optional VSO auth reference name */
    authRef?: string
  }
  /**
   * ExternalDNS configuration with TSIG for secure RFC 2136 updates.
   * The external-dns operator is declared automatically, and a
   * VaultStaticSecret is created for the TSIG key in the external-dns
   * namespace.
   */
  dns: {
    /** RFC 2136 DNS server (e.g., 'ns1.example.com') */
    server: string
    /** DNS zone (e.g., 'example.com') */
    zone: string
    /** TSIG key path in OpenBao (e.g., 'dns/tsig') */
    tsigPath: string
    /** TSIG key name in the secret (default: 'secret') */
    tsigKey?: string
  }
  /**
   * Gateway class name for Envoy Gateway (default: 'eg').
   * The envoy-gateway operator is declared automatically.
   */
  gatewayClassName?: string
  /**
   * Default labels applied to all resources.
   */
  labels?: Record<string, string>
  /**
   * Pre-installed operators. R8sCluster won't re-declare these.
   */
  operators?: Operator[]
  /**
   * Namespace for LokiStack and logging resources (default: 'logging').
   * This is separate from app namespaces — logging infra lives in
   * its own namespace.
   */
  logsNamespace?: string
  /**
   * Storage class for Loki logs (default: 'standard').
   */
  logsStorageClass?: string
  /**
   * Application components (App, Database, Auth, etc.).
   * Children inherit routing, secrets, and DNS contexts.
   * Optional — R8sCluster can be used standalone to set up cluster
   * infrastructure without any apps.
   */
  children?: unknown
}

/**
 * R8sCluster — opinionated cluster foundation with all recommended operators.
 *
 * @title R8sCluster
 * @category Complete Solution
 *
 * Sets up a complete cluster foundation in one component:
 * - **cert-manager** for TLS certificate automation
 * - **external-dns** with TSIG for secure DNS updates
 * - **Envoy Gateway** for Gateway API routing
 * - **OpenBao VSO** for secrets management
 * - **Prometheus** for metrics and alerting
 * - **Loki + FluentBit** for log aggregation of all user pods
 *
 * All operators are declared automatically. Children inherit routing,
 * secrets, and DNS contexts — just add your apps.
 *
 * R8sCluster is cluster-scoped — it does not take a namespace. Operators
 * install to their own namespaces (cert-manager, external-dns, etc.).
 * Logging infrastructure lives in a dedicated namespace (default:
 * 'logging'). App namespaces are managed by Platform or the apps
 * themselves.
 *
 * @example
 * import { R8sCluster, Platform, App, Database } from '@r8s/recipes'
 *
 * export default (
 *   <>
 *     <R8sCluster
 *       secrets={{ mount: 'secret', path: 'production' }}
 *       dns={{ server: 'ns1.example.com', zone: 'example.com', tsigPath: 'dns/tsig' }}
 *     >
 *       <Platform namespace="production">
 *         <Database backup={false} name="api-db" storage="20Gi" />
 *         <App name="api" image="api:v1" host="api.example.com" />
 *       </Platform>
 *     </R8sCluster>
 *   </>
 * )
 */
export function R8sCluster(props: R8sClusterProps) {
  const {
    secrets,
    dns,
    gatewayClassName = 'eg',
    labels,
    operators: preinstalled = [],
    logsNamespace = 'logging',
    logsStorageClass = 'standard',
    children,
  } = props

  // Build the operator list — R8sCluster declares all cluster operators
  // so children don't have to. Children can still declare more (e.g.
  // cnpg, keycloak) via their own logic.
  const sharedOperators = useContext(OperatorContext)
  const declared: Operator[] = []
  // R8sCluster's standard stack — each operator package's factory + its
  // OPERATOR_KEY (the name lives in the package, not here). Seeds the
  // children's OperatorContext so they never re-declare.
  const clusterStack = [
    [certManagerFactory, CERT_MANAGER_KEY],
    [externalDnsFactory, EXTERNAL_DNS_KEY],
    [envoyGatewayFactory, ENVOY_GATEWAY_KEY],
    [vaultSecretsFactory, VAULT_SECRETS_KEY],
    [prometheusFactory, PROMETHEUS_KEY],
    [lokiFactory, LOKI_KEY],
    [loggingFactory, LOGGING_KEY],
  ] as const
  for (const [factory, key] of clusterStack) {
    const alreadyDeclared =
      sharedOperators.some((op) => op.name === key) ||
      preinstalled.some((op) => op.name === key) ||
      declared.some((op) => op.name === key)
    if (!alreadyDeclared) {
      declared.push(factory())
    }
  }

  // Build the secrets provider (OpenBao VSO)
  const secretProvider = OpenBao({
    mount: secrets.mount,
    path: secrets.path,
    authRef: secrets.authRef,
  })

  // Build the DNS provider (ExternalDNS with TSIG)
  const dnsProvider = ExternalDns({
    server: dns.server,
    zone: dns.zone,
    tsig: {
      path: dns.tsigPath,
      key: dns.tsigKey ?? 'secret',
    },
  })

  // Build the endpoint provider (Envoy Gateway)
  const endpointProvider = EnvoyGateway({ className: gatewayClassName })

  // Cluster-level logging: FluentBit collects logs from ALL pods
  // and ships to Loki. Resources live in the logs namespace.
  const loggingName = 'cluster-logging'
  const lokiName = 'cluster-loki'
  const lokiOutputName = 'cluster-loki-output'
  const lokiStorageSecret = 'cluster-loki-storage'

  const clusterResources: ReturnType<typeof jsx>[] = []

  // LokiStack — log aggregation backend (in logs namespace)
  clusterResources.push(
    LokiStackComponent({
      metadata: { name: lokiName, namespace: logsNamespace },
      spec: {
        size: '1x.small',
        storageClassName: logsStorageClass,
        storage: {
          schemas: [{ version: 'v13', effectiveDate: '2024-01-01' }],
          secret: { name: lokiStorageSecret, type: 's3' },
        },
        tenants: {
          mode: 'static',
          authentication: [{ tenantName: 'application', tenantId: 'app' }],
          authorization: {
            roles: [
              {
                name: 'app-reader',
                permissions: ['read'],
                resources: ['logs'],
                tenants: ['application'],
              },
            ],
            roleBindings: [
              {
                name: 'app-reader-binding',
                roles: ['app-reader'],
                subjects: [{ kind: 'group', name: 'system:authenticated' }],
              },
            ],
          },
        },
      },
    })
  )

  // Logging — Banzai Cloud Logging Operator with FluentBit
  // FluentBit runs as a DaemonSet on every node, collecting all
  // container logs from /var/log/containers/.
  clusterResources.push(
    LoggingComponent({
      metadata: { name: loggingName, namespace: logsNamespace },
      spec: {
        fluentd: {},
        fluentbit: {},
        controlNamespace: logsNamespace,
      },
    })
  )

  // Output — ship logs to Loki gateway
  clusterResources.push(
    OutputComponent({
      metadata: { name: lokiOutputName, namespace: logsNamespace },
      spec: {
        loki: {
          url: `http://loki-gateway.${logsNamespace}.svc.cluster.local`,
          tenant: 'application',
        },
      },
    })
  )

  // Flow — match ALL pods (empty selector = match everything)
  clusterResources.push(
    FlowComponent({
      metadata: { name: 'cluster-flow', namespace: logsNamespace },
      spec: {
        match: [{ select: { labels: {} } }],
        localOutputRefs: [lokiOutputName],
      },
    })
  )

  // Assemble the full context stack. R8sCluster does NOT set a namespace
  // context — it's cluster-scoped. Children (or Platform) handle
  // app namespaces.
  let result: unknown = children

  // Cluster-level resources first (LokiStack, Logging, Flow, Output)
  result = jsx(Fragment, {
    children: [...clusterResources, result],
  })

  // Apply DNS context (inside SecretProvider so it can access TSIG secret)
  result = jsx(DnsProvider, { provider: dnsProvider, children: result })

  // Apply secrets context (OpenBao VSO)
  result = jsx(SecretProvider, { provider: secretProvider, children: result })

  // Apply routing context (Envoy Gateway)
  result = jsx(EndpointProvider, { provider: endpointProvider, children: result })

  // Apply operators context — merge parent operators + preinstalled + declared
  const allOperators = [...sharedOperators, ...preinstalled, ...declared]
  if (allOperators.length > 0) {
    result = jsx(OperatorContext.Provider, { value: allOperators, children: result })
  }

  // Apply labels context
  if (labels) {
    result = jsx(Labels.Provider, { value: labels, children: result })
  }

  return result
}
