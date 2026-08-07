import { jsx, Fragment, useContext, declareOperator } from '@r8s/core'
import { OperatorContext, Namespace, Labels, Domain } from '@r8s/core/defaults'
import { operators } from '@r8s/crds'
import { LokiStackComponent } from '@r8s/crds/loki'
import { LoggingComponent, FlowComponent, OutputComponent } from '@r8s/crds/logging'
import { SecretProvider, OpenBao } from './secret-provider'
import { DnsProvider, ExternalDns } from './dns-provider'
import { EndpointProvider, EnvoyGateway } from './endpoint-provider'
import type { Operator } from '@r8s/k8s-types'

export interface StackProps {
  /**
   * Default namespace for all child resources. A Namespace resource is
   * materialized so the rendered output is self-contained.
   */
  namespace: string
  /**
   * Base domain for the cluster (e.g., 'example.com'). Endpoints derive
   * their hostnames from this unless overridden.
   */
  domain?: string
  /**
   * OpenBao secrets backend configuration. VSO (Vault Secrets Operator)
   * is declared automatically.
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
   * VaultStaticSecret is created for the TSIG key.
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
   * Pre-installed operators. Stack won't re-declare these.
   */
  operators?: Operator[]
  /**
   * Storage class for Loki logs (default: 'standard').
   */
  logsStorageClass?: string
  /**
   * Log retention period (default: '168h' = 7 days).
   */
  logsRetention?: string
  /**
   * Application components (App, Database, Auth, etc.).
   */
  children: unknown
}

/**
 * Stack — opinionated cluster foundation with all recommended operators.
 *
 * @title Stack
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
 * All operators are declared automatically. Children inherit namespace,
 * routing, secrets, and DNS contexts — just add your apps.
 *
 * @example
 * import { Stack } from '@r8s/recipes'
 * import { App, Database } from '@r8s/recipes'
 *
 * export default (
 *   <Stack
 *     namespace="production"
 *     domain="example.com"
 *     secrets={{ mount: 'secret', path: 'production' }}
 *     dns={{ server: 'ns1.example.com', zone: 'example.com', tsigPath: 'dns/tsig' }}
 *   >
 *     <Database name="api-db" storage="20Gi" />
 *     <App name="api" image="api:v1" host="api.example.com" />
 *   </Stack>
 * )
 */
export function Stack(props: StackProps) {
  const {
    namespace,
    domain,
    secrets,
    dns,
    gatewayClassName = 'eg',
    labels,
    operators: preinstalled = [],
    logsStorageClass = 'standard',
    logsRetention = '168h',
    children,
  } = props

  // Build the operator list — Stack declares all cluster operators
  // so children don't have to. Children can still declare more (e.g.
  // cnpg, keycloak) via their own logic.
  const sharedOperators = useContext(OperatorContext)
  const declared: Operator[] = []
  const clusterOperators = [
    'cert-manager',
    'external-dns',
    'envoy-gateway',
    'vault-secrets-operator',
    'prometheus',
    'loki',
    'logging-operator',
  ]

  for (const opName of clusterOperators) {
    const alreadyDeclared =
      sharedOperators.some((op) => op.name === opName) ||
      preinstalled.some((op) => op.name === opName) ||
      declared.some((op) => op.name === opName)
    if (!alreadyDeclared && operators[opName]) {
      declared.push(operators[opName]())
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

  // Cluster-level logging: FluentBit collects logs from ALL pods in
  // the namespace and ships to Loki. A ClusterFlow matches everything.
  const loggingName = `${namespace}-logging`
  const lokiName = `${namespace}-loki`
  const lokiOutputName = `${namespace}-loki-output`
  const lokiStorageSecret = `${namespace}-loki-storage`

  const clusterResources: ReturnType<typeof jsx>[] = []

  // LokiStack — log aggregation backend
  clusterResources.push(
    LokiStackComponent({
      metadata: { name: lokiName, namespace },
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
  clusterResources.push(
    LoggingComponent({
      metadata: { name: loggingName, namespace },
      spec: {
        fluentd: {},
        fluentbit: {},
        controlNamespace: namespace,
      },
    })
  )

  // Output — ship all logs to Loki
  clusterResources.push(
    OutputComponent({
      metadata: { name: lokiOutputName, namespace },
      spec: {
        loki: {
          url: `http://loki-gateway.${namespace}.svc.cluster.local`,
          tenant: 'application',
        },
      },
    })
  )

  // Flow — match ALL pods in the namespace
  clusterResources.push(
    FlowComponent({
      metadata: { name: `${namespace}-flow`, namespace },
      spec: {
        match: [{ select: { labels: {} } }],
        localOutputRefs: [lokiOutputName],
      },
    })
  )

  // Assemble the full context stack (same pattern as Platform, but
  // with all providers pre-configured).
  let result: unknown = children

  // Materialize Namespace + cluster-level resources first
  result = jsx(Fragment, {
    children: [
      jsx('Namespace', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: { name: namespace },
      }),
      ...clusterResources,
      result,
    ],
  })

  // Apply DNS context (inside SecretProvider so it can access TSIG secret)
  result = jsx(DnsProvider, { provider: dnsProvider, children: result })

  // Apply secrets context (OpenBao VSO)
  result = jsx(SecretProvider, { provider: secretProvider, children: result })

  // Apply routing context (Envoy Gateway)
  result = jsx(EndpointProvider, { provider: endpointProvider, children: result })

  // Apply operators context (all declared + preinstalled)
  const allOperators = [...preinstalled, ...declared]
  if (allOperators.length > 0) {
    result = jsx(OperatorContext.Provider, { value: allOperators, children: result })
  }

  // Apply labels context
  if (labels) {
    result = jsx(Labels.Provider, { value: labels, children: result })
  }

  // Apply namespace context
  result = jsx(Namespace.Provider, { value: namespace, children: result })

  // Apply domain context if set
  if (domain) {
    result = jsx(Domain.Provider, { value: domain, children: result })
  }

  return result
}
