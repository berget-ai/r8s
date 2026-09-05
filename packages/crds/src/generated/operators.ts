/**
 * GENERATED from operators.yaml — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { Operator } from '@r8s/k8s-types'
function expandVersion(url: string, version: string): string {
  const minor = version.split('.').slice(0, 2).join('.')
  return url.replaceAll('{version}', version).replaceAll('{minor}', minor)
}
export const operators: Record<string, (version?: string) => Operator> = {
  "cert-manager": (version = "1.18.0") => ({
    name: "cert-manager",
    description: "cert-manager for TLS certificate automation",
    source: { type: 'manifest', url: expandVersion("https://github.com/cert-manager/cert-manager/releases/download/v{version}/cert-manager.yaml", version), version, namespace: "cert-manager" },
    version,
    namespace: "cert-manager",
    crds: ["certificates.cert-manager.io","certificaterequests.cert-manager.io","issuers.cert-manager.io","clusterissuers.cert-manager.io"],
  }),
  "clickhouse-operator": (version = "0.25.0") => ({
    name: "clickhouse-operator",
    description: "ClickHouse Operator for Kubernetes by Altinity",
    source: { type: 'helm', chart: "clickhouse-operator-helm", repository: "https://docs.altinity.com/clickhouse-operator/", version, namespace: "clickhouse-operator-system" },
    version,
    namespace: "clickhouse-operator-system",
    crds: ["clickhouseinstallations.clickhouse.altinity.com","clickhouseinstallationtemplates.clickhouse.altinity.com","clickhouseoperatorconfigurations.clickhouse.altinity.com","clickhousekeeperinstallations.clickhouse-keeper.altinity.com"],
  }),
  "cnpg": (version = "1.27.0") => ({
    name: "cnpg",
    description: "CloudNativePG PostgreSQL operator",
    source: { type: 'manifest', url: expandVersion("https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-{minor}/releases/cnpg-{version}.yaml", version), version, namespace: "cnpg-system" },
    version,
    namespace: "cnpg-system",
    crds: ["clusters.postgresql.cnpg.io","poolers.postgresql.cnpg.io","scheduledbackups.postgresql.cnpg.io"],
  }),
  "envoy-gateway": (version = "1.7.0") => ({
    name: "envoy-gateway",
    description: "Envoy Gateway — Kubernetes Gateway API implementation",
    source: { type: 'helm', chart: "gateway-helm", repository: "oci://docker.io/envoyproxy", version, namespace: "envoy-gateway-system" },
    version,
    namespace: "envoy-gateway-system",
    crds: ["gatewayclasses.gateway.networking.k8s.io","gateways.gateway.networking.k8s.io","httproutes.gateway.networking.k8s.io","grpcroutes.gateway.networking.k8s.io","tlsroutes.gateway.networking.k8s.io","tcproutes.gateway.networking.k8s.io","udproutes.gateway.networking.k8s.io","envoyproxies.gateway.envoyproxy.io","backendtrafficpolicies.gateway.envoyproxy.io","clienttrafficpolicies.gateway.envoyproxy.io","securitypolicies.gateway.envoyproxy.io"],
  }),
  "external-dns": (version = "1.21.1") => ({
    name: "external-dns",
    description: "ExternalDNS for automatic DNS management",
    source: { type: 'helm', chart: "external-dns", repository: "https://kubernetes-sigs.github.io/external-dns/", version, namespace: "external-dns" },
    version,
    namespace: "external-dns",
    crds: ["dnsendpoints.externaldns.k8s.io"],
  }),
  "keycloak-operator": (version = "24.0.0") => ({
    name: "keycloak-operator",
    description: "Keycloak identity and access management operator",
    source: { type: 'olm', package: "keycloak-operator", channel: "fast", version },
    version,
    crds: ["keycloaks.k8s.keycloak.org","keycloakrealmimports.k8s.keycloak.org"],
  }),
  "logging-operator": (version = "4.2.3") => ({
    name: "logging-operator",
    description: "Logging Operator for Kubernetes by Banzai Cloud",
    source: { type: 'helm', chart: "logging-operator", repository: "https://kube-logging.github.io/helm-charts", version, namespace: "logging" },
    version,
    namespace: "logging",
    crds: ["loggings.logging.banzaicloud.io","flows.logging.banzaicloud.io","clusterflows.logging.banzaicloud.io","outputs.logging.banzaicloud.io","clusteroutputs.logging.banzaicloud.io"],
  }),
  "loki": (version = "5.47.0") => ({
    name: "loki",
    description: "Grafana Loki — horizontally-scalable, highly-available log aggregation",
    source: { type: 'helm', chart: "loki", repository: "https://grafana.github.io/helm-charts", version, namespace: "loki" },
    version,
    namespace: "loki",
    crds: ["lokistacks.loki.grafana.com","alertingrules.loki.grafana.com","recordingrules.loki.grafana.com","rulerconfigs.loki.grafana.com"],
  }),
  "prometheus": (version = "58.4.0") => ({
    name: "prometheus",
    description: "Prometheus monitoring stack (kube-prometheus-stack)",
    source: { type: 'helm', chart: "kube-prometheus-stack", repository: "https://prometheus-community.github.io/helm-charts", version, namespace: "monitoring" },
    version,
    namespace: "monitoring",
    crds: ["alertmanagers.monitoring.coreos.com","alertmanagerconfigs.monitoring.coreos.com","podmonitors.monitoring.coreos.com","probes.monitoring.coreos.com","prometheuses.monitoring.coreos.com","prometheusrules.monitoring.coreos.com","scrapeconfigs.monitoring.coreos.com","servicemonitors.monitoring.coreos.com","thanosrulers.monitoring.coreos.com"],
  }),
  "redis-operator": (version = "0.22.0") => ({
    name: "redis-operator",
    description: "Redis Operator for Kubernetes by OT-Container-Kit",
    source: { type: 'helm', chart: "redis-operator", repository: "https://ot-container-kit.github.io/helm-charts/", version, namespace: "kube-system" },
    version,
    namespace: "kube-system",
    crds: ["redisclusters.redis.redis.opstreelabs.in","redisreplications.redis.redis.opstreelabs.in","redisfailovers.databases.spotahome.com"],
  }),
  "vault-secrets-operator": (version = "0.5.0") => ({
    name: "vault-secrets-operator",
    description: "HashiCorp Vault Secrets Operator",
    source: { type: 'helm', chart: "vault-secrets-operator", repository: "https://helm.releases.hashicorp.com", version, namespace: "vault-secrets-operator" },
    version,
    namespace: "vault-secrets-operator",
    crds: ["vaultstaticsecrets.secrets.hashicorp.com","vaultdynamicsecrets.secrets.hashicorp.com","vaultauths.secrets.hashicorp.com","vaultconnections.secrets.hashicorp.com"],
  }),
  "velero": (version = "1.13.0") => ({
    name: "velero",
    description: "Velero backup and disaster recovery",
    source: { type: 'manifest', url: expandVersion("https://raw.githubusercontent.com/vmware-tanzu/velero/v{version}/config/crd/v1/bases/velero.io_backups.yaml", version), version, namespace: "velero" },
    version,
    namespace: "velero",
    crds: ["backups.velero.io","restores.velero.io","schedules.velero.io","backupstoragelocations.velero.io","volumesnapshotlocations.velero.io","deletebackuprequests.velero.io","downloadrequests.velero.io"],
  }),
  "nginx-ingress": (version = "1.15.1") => ({
    name: "nginx-ingress",
    description: "NGINX Ingress Controller",
    source: { type: 'manifest', url: expandVersion("https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v{version}/deploy/static/provider/cloud/deploy.yaml", version), version, namespace: "ingress-nginx" },
    version,
    namespace: "ingress-nginx",
    crds: ["ingressclassparams.networking.k8s.io"],
  }),
  "paperclip-operator": (version = "0.19.0") => ({
    name: "paperclip-operator",
    description: "Paperclip agent orchestration operator",
    source: { type: 'helm', chart: "paperclip-operator", repository: "oci://ghcr.io/paperclipinc/charts", version, namespace: "paperclip-system", values: {"metrics":{"enabled":true,"serviceMonitor":{"enabled":false}},"leaderElection":{"enabled":false}} },
    version,
    namespace: "paperclip-system",
    crds: ["instances.paperclip.inc"],
  }),
}

/**
 * GENERATED operator metadata for docs — do not edit by hand.
 */
export interface OperatorMeta {
  name: string
  description: string
  category: string
  version: string
  crds: string[]
}

export const operatorMetadata: OperatorMeta[] = [
  {
    name: "cert-manager",
    description: "cert-manager for TLS certificate automation",
    category: "Security & Identity",
    version: "1.18.0",
    crds: ["certificates.cert-manager.io","certificaterequests.cert-manager.io","issuers.cert-manager.io","clusterissuers.cert-manager.io"],
  },
  {
    name: "clickhouse-operator",
    description: "ClickHouse Operator for Kubernetes by Altinity",
    category: "Data & Analytics",
    version: "0.25.0",
    crds: ["clickhouseinstallations.clickhouse.altinity.com","clickhouseinstallationtemplates.clickhouse.altinity.com","clickhouseoperatorconfigurations.clickhouse.altinity.com","clickhousekeeperinstallations.clickhouse-keeper.altinity.com"],
  },
  {
    name: "cnpg",
    description: "CloudNativePG PostgreSQL operator",
    category: "Data & Analytics",
    version: "1.27.0",
    crds: ["clusters.postgresql.cnpg.io","poolers.postgresql.cnpg.io","scheduledbackups.postgresql.cnpg.io"],
  },
  {
    name: "envoy-gateway",
    description: "Envoy Gateway — Kubernetes Gateway API implementation",
    category: "Networking",
    version: "1.7.0",
    crds: ["gatewayclasses.gateway.networking.k8s.io","gateways.gateway.networking.k8s.io","httproutes.gateway.networking.k8s.io","grpcroutes.gateway.networking.k8s.io","tlsroutes.gateway.networking.k8s.io","tcproutes.gateway.networking.k8s.io","udproutes.gateway.networking.k8s.io","envoyproxies.gateway.envoyproxy.io","backendtrafficpolicies.gateway.envoyproxy.io","clienttrafficpolicies.gateway.envoyproxy.io","securitypolicies.gateway.envoyproxy.io"],
  },
  {
    name: "external-dns",
    description: "ExternalDNS for automatic DNS management",
    category: "Networking",
    version: "1.21.1",
    crds: ["dnsendpoints.externaldns.k8s.io"],
  },
  {
    name: "keycloak-operator",
    description: "Keycloak identity and access management operator",
    category: "Security & Identity",
    version: "24.0.0",
    crds: ["keycloaks.k8s.keycloak.org","keycloakrealmimports.k8s.keycloak.org"],
  },
  {
    name: "logging-operator",
    description: "Logging Operator for Kubernetes by Banzai Cloud",
    category: "Observability",
    version: "4.2.3",
    crds: ["loggings.logging.banzaicloud.io","flows.logging.banzaicloud.io","clusterflows.logging.banzaicloud.io","outputs.logging.banzaicloud.io","clusteroutputs.logging.banzaicloud.io"],
  },
  {
    name: "loki",
    description: "Grafana Loki — horizontally-scalable, highly-available log aggregation",
    category: "Observability",
    version: "5.47.0",
    crds: ["lokistacks.loki.grafana.com","alertingrules.loki.grafana.com","recordingrules.loki.grafana.com","rulerconfigs.loki.grafana.com"],
  },
  {
    name: "prometheus",
    description: "Prometheus monitoring stack (kube-prometheus-stack)",
    category: "Observability",
    version: "58.4.0",
    crds: ["alertmanagers.monitoring.coreos.com","alertmanagerconfigs.monitoring.coreos.com","podmonitors.monitoring.coreos.com","probes.monitoring.coreos.com","prometheuses.monitoring.coreos.com","prometheusrules.monitoring.coreos.com","scrapeconfigs.monitoring.coreos.com","servicemonitors.monitoring.coreos.com","thanosrulers.monitoring.coreos.com"],
  },
  {
    name: "redis-operator",
    description: "Redis Operator for Kubernetes by OT-Container-Kit",
    category: "Data & Analytics",
    version: "0.22.0",
    crds: ["redisclusters.redis.redis.opstreelabs.in","redisreplications.redis.redis.opstreelabs.in","redisfailovers.databases.spotahome.com"],
  },
  {
    name: "vault-secrets-operator",
    description: "HashiCorp Vault Secrets Operator",
    category: "Security & Identity",
    version: "0.5.0",
    crds: ["vaultstaticsecrets.secrets.hashicorp.com","vaultdynamicsecrets.secrets.hashicorp.com","vaultauths.secrets.hashicorp.com","vaultconnections.secrets.hashicorp.com"],
  },
  {
    name: "velero",
    description: "Velero backup and disaster recovery",
    category: "Security & Identity",
    version: "1.13.0",
    crds: ["backups.velero.io","restores.velero.io","schedules.velero.io","backupstoragelocations.velero.io","volumesnapshotlocations.velero.io","deletebackuprequests.velero.io","downloadrequests.velero.io"],
  },
  {
    name: "nginx-ingress",
    description: "NGINX Ingress Controller",
    category: "Networking",
    version: "1.15.1",
    crds: ["ingressclassparams.networking.k8s.io"],
  },
  {
    name: "paperclip-operator",
    description: "Paperclip agent orchestration operator",
    category: "Data & Analytics",
    version: "0.19.0",
    crds: ["instances.paperclip.inc"],
  },
]
