/**
 * GENERATED from loki CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface LokiStack {
  apiVersion: 'loki.grafana.com/v1'
  kind: 'LokiStack'
  metadata: ObjectMeta
  spec: LokiStackSpec
  status?: LokiStackStatus
}

/** Props for the {@link LokiStack} component — a 1:1 mapping of the loki.grafana.com/v1 CRD. */
export interface LokiStackProps {
  metadata: ObjectMeta
  spec: LokiStackSpec
}

/** Render a LokiStack (loki.grafana.com/v1) exactly as defined by its CRD. */
export function LokiStackComponent(props: LokiStackProps) {
  return jsx('LokiStack', {
    apiVersion: 'loki.grafana.com/v1',
    kind: 'LokiStack',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Memberlist {
  /** EnableIPv6 enables IPv6 support for the memberlist based hash ring. Currently this also forces the instanceAddrType to podIP to avoid local address lookup for the memberlist. */
  "enableIPv6"?: boolean
  /** InstanceAddrType defines the type of address to use to advertise to the ring. Defaults to the first address from any private network interfaces of the current pod. Alternatively the public pod IP can be used in case private networks (RFC 1918 and RFC 6598) are not available. */
  "instanceAddrType"?: string
}

export interface HashRing {
  /** MemberList configuration spec */
  "memberlist"?: Memberlist
  /** Type of hash ring implementation that should be used */
  "type": string
}

export interface Ingestion {
  /** IngestionBurstSize defines the local rate-limited sample size per distributor replica. It should be set to the set at least to the maximum logs size expected in a single push request. */
  "ingestionBurstSize"?: number
  /** IngestionRate defines the sample size per second. Units MB. */
  "ingestionRate"?: number
  /** MaxGlobalStreamsPerTenant defines the maximum number of active streams per tenant, across the cluster. */
  "maxGlobalStreamsPerTenant"?: number
  /** MaxLabelNameLength defines the maximum number of characters allowed for label keys in log streams. */
  "maxLabelNameLength"?: number
  /** MaxLabelNamesPerSeries defines the maximum number of label names per series in each log stream. */
  "maxLabelNamesPerSeries"?: number
  /** MaxLabelValueLength defines the maximum number of characters allowed for label values in log streams. */
  "maxLabelValueLength"?: number
  /** MaxLineSize defines the maximum line size on ingestion path. Units in Bytes. */
  "maxLineSize"?: number
  /** PerStreamDesiredRate defines the desired ingestion rate per second that LokiStack should target applying automatic stream sharding. Units MB. */
  "perStreamDesiredRate"?: number
  /** PerStreamRateLimit defines the maximum byte rate per second per stream. Units MB. */
  "perStreamRateLimit"?: number
  /** PerStreamRateLimitBurst defines the maximum burst bytes per stream. Units MB. */
  "perStreamRateLimitBurst"?: number
}

export interface LogAttributesItem {
  /** Name contains either a verbatim name of an attribute or a regular expression matching many attributes. */
  "name": string
  /** If Regex is true, then Name is treated as a regular expression instead of as a verbatim attribute name. */
  "regex"?: boolean
}

export interface ResourceAttributesItem {
  /** Name contains either a verbatim name of an attribute or a regular expression matching many attributes. */
  "name": string
  /** If Regex is true, then Name is treated as a regular expression instead of as a verbatim attribute name. */
  "regex"?: boolean
}

export interface ScopeAttributesItem {
  /** Name contains either a verbatim name of an attribute or a regular expression matching many attributes. */
  "name": string
  /** If Regex is true, then Name is treated as a regular expression instead of as a verbatim attribute name. */
  "regex"?: boolean
}

export interface Drop {
  /** LogAttributes lists the names of log attributes that should be included in structured metadata. */
  "logAttributes"?: LogAttributesItem[]
  /** ResourceAttributes lists the names of resource attributes that should be included in structured metadata. */
  "resourceAttributes"?: ResourceAttributesItem[]
  /** ScopeAttributes lists the names of scope attributes that should be included in structured metadata. */
  "scopeAttributes"?: ScopeAttributesItem[]
}

export interface StreamLabels {
  /** ResourceAttributes lists the names of the resource attributes that should be converted into Loki stream labels. */
  "resourceAttributes"?: ResourceAttributesItem[]
}

export interface Otlp {
  /** Drop configures which attributes are dropped from the log entry. */
  "drop"?: Drop
  /** StreamLabels configures which resource attributes are converted to Loki stream labels. */
  "streamLabels"?: StreamLabels
}

export interface Queries {
  /** CardinalityLimit defines the cardinality limit for index queries. */
  "cardinalityLimit"?: number
  /** MaxChunksPerQuery defines the maximum number of chunks that can be fetched by a single query. */
  "maxChunksPerQuery"?: number
  /** MaxEntriesLimitPerQuery defines the maximum number of log entries that will be returned for a query. */
  "maxEntriesLimitPerQuery"?: number
  /** MaxQuerySeries defines the maximum of unique series that is returned by a metric query. */
  "maxQuerySeries"?: number
  /** MaxVolumeSeries defines the maximum number of aggregated series in a log-volume response */
  "maxVolumeSeries"?: number
  /** Timeout when querying ingesters or storage during the execution of a query request. */
  "queryTimeout"?: string
}

export interface StreamsItem {
  /** Days contains the number of days logs are kept. */
  "days": number
  /** Priority defines the priority of this selector compared to other retention rules. */
  "priority"?: number
  /** Selector contains the LogQL query used to define the log stream. */
  "selector": string
}

export interface Retention {
  /** Days contains the number of days logs are kept. */
  "days": number
  /** Stream defines the log stream. */
  "streams"?: StreamsItem[]
}

export interface Global {
  /** IngestionLimits defines the limits applied on ingested log streams. */
  "ingestion"?: Ingestion
  /** OTLP to configure which resource, scope and log attributes are stored as stream labels or structured metadata. Tenancy modes can provide a default OTLP configuration, when no custom OTLP configuration is set or even enforce the use of some required attributes. */
  "otlp"?: Otlp
  /** QueryLimits defines the limit applied on querying log streams. */
  "queries"?: Queries
  /** Retention defines how long logs are kept in storage. */
  "retention"?: Retention
}

export interface Limits {
  /** Global defines the limits applied globally across the cluster. */
  "global"?: Global
  /** Tenants defines the limits applied per tenant. */
  "tenants"?: Record<string, unknown>
}

export interface NetworkPolicies {
  /** RuleSet determines which of the pre-defined sets of NetworkPolicy rules is used for this LokiStack. */
  "ruleSet": string
}

export interface Proxy {
  /** HTTPProxy configures the HTTP_PROXY/http_proxy env variable. */
  "httpProxy"?: string
  /** HTTPSProxy configures the HTTPS_PROXY/https_proxy env variable. */
  "httpsProxy"?: string
  /** NoProxy configures the NO_PROXY/no_proxy env variable. */
  "noProxy"?: string
}

export interface ZonesItem {
  /** MaxSkew describes the maximum degree to which Pods can be unevenly distributed. */
  "maxSkew": number
  /** TopologyKey is the key that defines a topology in the Nodes' labels. */
  "topologyKey": string
}

export interface Replication {
  /** Factor defines the policy for log stream replication. */
  "factor"?: number
  /** Zones defines an array of ZoneSpec that the scheduler will try to satisfy. IMPORTANT: Make sure that the replication factor defined is less than or equal to the number of available zones. */
  "zones"?: ZonesItem[]
}

export interface MatchExpressionsItem {
  /** key is the label key that the selector applies to. */
  "key": string
  /** operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. */
  "operator": string
  /** values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. */
  "values"?: string[]
}

export interface NamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface Selector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface Rules {
  /** Enabled defines a flag to enable/disable the ruler component */
  "enabled": boolean
  /** Namespaces to be selected for PrometheusRules discovery. If unspecified, only the same namespace as the LokiStack object is in is used. */
  "namespaceSelector"?: NamespaceSelector
  /** A selector to select which LokiRules to mount for loading alerting/recording rules from. */
  "selector"?: Selector
}

export interface SchemasItem {
  /** EffectiveDate contains a date in YYYY-MM-DD format which is interpreted in the UTC time zone. The configuration always needs at least one schema that is currently valid. This means that when creating a new LokiStack it is recommended to add a schema with the latest available version and an effective date of "yesterday". New schema versions added to the configuration always needs to be placed "in the future", so that Loki can start using it once the day rolls over. */
  "effectiveDate": string
  /** Version for writing and reading logs. */
  "version": string
}

export interface Secret {
  /** CredentialMode can be used to set the desired credential mode for authenticating with the object storage. If this is not set, then the operator tries to infer the credential mode from the provided secret and its own configuration. */
  "credentialMode"?: string
  /** Name of a secret in the namespace configured for object storage secrets. */
  "name": string
  /** Type of object storage that should be used */
  "type": string
}

export interface Tls {
  /** Key is the data key of a ConfigMap containing a CA certificate. It needs to be in the same namespace as the LokiStack custom resource. If empty, it defaults to "service-ca.crt". */
  "caKey"?: string
  /** CA is the name of a ConfigMap containing a CA certificate. It needs to be in the same namespace as the LokiStack custom resource. */
  "caName": string
}

export interface Storage {
  /** Schemas for reading and writing logs. */
  "schemas"?: SchemasItem[]
  /** Secret for object storage authentication. Name of a secret in the same namespace as the LokiStack custom resource. */
  "secret": Secret
  /** TLS configuration for reaching the object storage endpoint. */
  "tls"?: Tls
}

export interface LabelSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface PodAffinityTerm {
  /** A label query over a set of resources, in this case pods. */
  "labelSelector"?: LabelSelector
  /** A label query over the set of namespaces that the term applies to. The term is applied to the union of the namespaces selected by this field and the ones listed in the namespaces field. null selector and null or empty namespaces list means "this pod's namespace". An empty selector ({}) matches all namespaces. */
  "namespaceSelector"?: NamespaceSelector
  /** namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". */
  "namespaces"?: string[]
  /** This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. */
  "topologyKey": string
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem {
  /** Required. A pod affinity term, associated with the corresponding weight. */
  "podAffinityTerm": PodAffinityTerm
  /** weight associated with matching the corresponding podAffinityTerm, in the range 1-100. */
  "weight": number
}

export interface RequiredDuringSchedulingIgnoredDuringExecutionItem {
  /** A label query over a set of resources, in this case pods. */
  "labelSelector"?: LabelSelector
  /** A label query over the set of namespaces that the term applies to. The term is applied to the union of the namespaces selected by this field and the ones listed in the namespaces field. null selector and null or empty namespaces list means "this pod's namespace". An empty selector ({}) matches all namespaces. */
  "namespaceSelector"?: NamespaceSelector
  /** namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". */
  "namespaces"?: string[]
  /** This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. */
  "topologyKey": string
}

export interface PodAntiAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  /** If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface TolerationsItem {
  /** Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute. */
  "effect"?: string
  /** Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys. */
  "key"?: string
  /** Operator represents a key's relationship to the value. Valid operators are Exists and Equal. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category. */
  "operator"?: string
  /** TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system. */
  "tolerationSeconds"?: number
  /** Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string. */
  "value"?: string
}

export interface Compactor {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface Distributor {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface Gateway {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface IndexGateway {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface Ingester {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface Querier {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface QueryFrontend {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface Ruler {
  /** NodeSelector defines the labels required by a node to schedule the component onto it. */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinity defines the pod anti affinity scheduling rules to schedule pods of a component. */
  "podAntiAffinity"?: PodAntiAffinity
  /** Replicas defines the number of replica pods of the component. */
  "replicas"?: number
  /** Tolerations defines the tolerations required by a node to schedule the component onto it. */
  "tolerations"?: TolerationsItem[]
}

export interface Template {
  /** Compactor defines the compaction component spec. */
  "compactor"?: Compactor
  /** Distributor defines the distributor component spec. */
  "distributor"?: Distributor
  /** Gateway defines the lokistack gateway component spec. */
  "gateway"?: Gateway
  /** IndexGateway defines the index gateway component spec. */
  "indexGateway"?: IndexGateway
  /** Ingester defines the ingester component spec. */
  "ingester"?: Ingester
  /** Querier defines the querier component spec. */
  "querier"?: Querier
  /** QueryFrontend defines the query frontend component spec. */
  "queryFrontend"?: QueryFrontend
  /** Ruler defines the ruler component spec. */
  "ruler"?: Ruler
  /** When UseRequestsAsLimits is true, the operand Pods are configured to have resource limits equal to the resource requests. This imposes a hard limit on resource usage of the LokiStack, but limits its ability to react to load spikes, whether on the ingestion or query side. Note: This is currently a tech-preview feature. */
  "useRequestsAsLimits"?: boolean
}

export interface Ca {
  /** Key is the data key of a ConfigMap containing a CA certificate. It needs to be in the same namespace as the LokiStack custom resource. If empty, it defaults to "service-ca.crt". */
  "caKey"?: string
  /** CA is the name of a ConfigMap containing a CA certificate. It needs to be in the same namespace as the LokiStack custom resource. */
  "caName": string
}

export interface MTLS {
  /** CA defines the spec for the custom CA for tenant's authentication. */
  "ca": Ca
}

export interface IssuerCA {
  /** Key is the data key of a ConfigMap containing a CA certificate. It needs to be in the same namespace as the LokiStack custom resource. If empty, it defaults to "service-ca.crt". */
  "caKey"?: string
  /** CA is the name of a ConfigMap containing a CA certificate. It needs to be in the same namespace as the LokiStack custom resource. */
  "caName": string
}

export interface Secret2 {
  /** Name of a secret in the namespace configured for tenant secrets. */
  "name": string
}

export interface Oidc {
  /** Group claim field from ID Token */
  "groupClaim"?: string
  /** IssuerCA defines the spec for the issuer CA for tenant's authentication. */
  "issuerCA"?: IssuerCA
  /** IssuerURL defines the URL for issuer. */
  "issuerURL": string
  /** RedirectURL defines the URL for redirect. */
  "redirectURL"?: string
  /** Secret defines the spec for the clientID and clientSecret for tenant's authentication. */
  "secret": Secret2
  /** User claim field from ID Token */
  "usernameClaim"?: string
}

export interface AuthenticationItem {
  /** TLSConfig defines the spec for the mTLS tenant's authentication. */
  "mTLS"?: MTLS
  /** OIDC defines the spec for the OIDC tenant's authentication. */
  "oidc"?: Oidc
  /** TenantID defines the id of the tenant. */
  "tenantId": string
  /** TenantName defines the name of the tenant. */
  "tenantName": string
}

export interface Opa {
  /** URL defines the third-party endpoint for authorization. */
  "url": string
}

export interface SubjectsItem {
  /** SubjectKind is a kind of LokiStack Gateway RBAC subject. */
  "kind": string
  "name": string
}

export interface RoleBindingsItem {
  "name": string
  "roles": string[]
  "subjects": SubjectsItem[]
}

export interface RolesItem {
  "name": string
  "permissions": string[]
  "resources": string[]
  "tenants": string[]
}

export interface Authorization {
  /** OPA defines the spec for the third-party endpoint for tenant's authorization. */
  "opa"?: Opa
  /** RoleBindings defines configuration to bind a set of roles to a set of subjects. */
  "roleBindings"?: RoleBindingsItem[]
  /** Roles defines a set of permissions to interact with a tenant. */
  "roles"?: RolesItem[]
}

export interface Ca2 {
  /** ConfigMapName contains the name of the ConfigMap containing the referenced value. */
  "configMapName"?: string
  /** Name of the key used to get the value in either the referenced ConfigMap or Secret. */
  "key": string
  /** SecretName contains the name of the Secret containing the referenced value. */
  "secretName"?: string
}

export interface Certificate {
  /** ConfigMapName contains the name of the ConfigMap containing the referenced value. */
  "configMapName"?: string
  /** Name of the key used to get the value in either the referenced ConfigMap or Secret. */
  "key": string
  /** SecretName contains the name of the Secret containing the referenced value. */
  "secretName"?: string
}

export interface PrivateKey {
  /** Key contains the name of the key inside the referenced Secret. */
  "key": string
  /** SecretName contains the name of the Secret containing the referenced value. */
  "secretName": string
}

export interface Tls2 {
  /** CA can be used to specify a custom list of trusted certificate authorities. */
  "ca"?: Ca2
  /** Certificate points to the server certificate to use. */
  "certificate"?: Certificate
  /** PrivateKey points to the private key of the server certificate. */
  "privateKey"?: PrivateKey
}

export interface Gateway2 {
  /** TLS defines the TLS configuration for the Gateway server. */
  "tls"?: Tls2
}

export interface Otlp2 {
  /** EnableConsoleLabels can be used to add a set of additional stream labels to the OTLP input. These labels are currently used by the logs console in OpenShift. This is not different from manually adding some or all of the attributes to the set of stream labels using the normal OTLP configuration. The additional attributes which are converted to stream labels are:  - k8s.container.name  - k8s.cronjob.name  - k8s.daemonset.name  - k8s.deployment.name  - k8s.job.name  - k8s.node.name  - k8s.pod.name  - k8s.statefulset.name  - kubernetes.container_name  - kubernetes.host  - kubernetes.pod_name  - service.name See also: https://github.com/rhobs/observability-data-model/blob/main/cluster-logging.md#attributes */
  "enableConsoleLabels"?: boolean
}

export interface Openshift {
  /** AdminGroups defines a list of groups, whose members are considered to have admin-privileges by the Loki Operator. Setting this to an empty array disables admin groups. By default the following groups are considered admin-groups:  - system:cluster-admins  - cluster-admin  - dedicated-admin */
  "adminGroups"?: string[]
  /** OTLP contains settings for ingesting data using OTLP in the OpenShift tenancy mode. */
  "otlp"?: Otlp2
}

export interface Passthrough {
  /** CA can be used to specify a custom list of trusted certificate authorities. That will be used to validate the certificates of the clients that interact with the gateway */
  "ca"?: Ca2
  /** DefaultTenant defines the default tenant ID to use when X-Scope-OrgID header is not set. If not set, requests without X-Scope-OrgID are rejected. */
  "defaultTenant"?: string
}

export interface Tenants {
  /** Authentication defines the lokistack-gateway component authentication configuration spec per tenant. */
  "authentication"?: AuthenticationItem[]
  /** Authorization defines the lokistack-gateway component authorization configuration spec per tenant. */
  "authorization"?: Authorization
  /** DisableIngress disables automatic creation of external access resources (Route / Ingress). When true, no Route or Ingress will be created for the gateway. */
  "disableIngress"?: boolean
  /** Gateway defines the configuration specific to Gateway server */
  "gateway"?: Gateway2
  /** Mode defines the mode in which lokistack-gateway component will be configured. */
  "mode": string
  /** Openshift defines the configuration specific to Openshift modes. */
  "openshift"?: Openshift
  /** Passthrough defines the configuration specific to Passthrough mode. */
  "passthrough"?: Passthrough
}

export interface LokiStackSpec {
  /** HashRing defines the spec for the distributed hash ring configuration. */
  "hashRing"?: HashRing
  /** Limits defines the limits to be applied to log stream processing. */
  "limits"?: Limits
  /** ManagementState defines if the CR should be managed by the operator or not. Default is managed. */
  "managementState"?: string
  /** NetworkPolicies defines the NetworkPolicies configuration for LokiStack components. When enabled, the operator creates NetworkPolicies to control ingress/egress between Loki components and related services. */
  "networkPolicies"?: NetworkPolicies
  /** Proxy defines the spec for the object proxy to configure cluster proxy information. */
  "proxy"?: Proxy
  /** Replication defines the configuration for Loki data replication. */
  "replication"?: Replication
  /** Deprecated: Please use replication.factor instead. This field will be removed in future versions of this CRD. ReplicationFactor defines the policy for log stream replication. */
  "replicationFactor"?: number
  /** Rules defines the spec for the ruler component. */
  "rules"?: Rules
  /** Size defines one of the support Loki deployment scale out sizes. */
  "size": string
  /** Storage defines the spec for the object storage endpoint to store logs. */
  "storage": Storage
  /** Storage class name defines the storage class for ingester/querier PVCs. */
  "storageClassName": string
  /** Template defines the resource/limits/tolerations/nodeselectors per component. */
  "template"?: Template
  /** Tenants defines the per-tenant authentication and authorization spec for the lokistack-gateway component. */
  "tenants"?: Tenants
}

export interface Components {
  /** Compactor is a map to the pod status of the compactor pod. */
  "compactor"?: Record<string, unknown>
  /** Distributor is a map to the per pod status of the distributor deployment */
  "distributor"?: Record<string, unknown>
  /** Gateway is a map to the per pod status of the lokistack gateway deployment. */
  "gateway"?: Record<string, unknown>
  /** IndexGateway is a map to the per pod status of the index gateway statefulset */
  "indexGateway"?: Record<string, unknown>
  /** Ingester is a map to the per pod status of the ingester statefulset */
  "ingester"?: Record<string, unknown>
  /** Querier is a map to the per pod status of the querier deployment */
  "querier"?: Record<string, unknown>
  /** QueryFrontend is a map to the per pod status of the query frontend deployment */
  "queryFrontend"?: Record<string, unknown>
  /** Ruler is a map to the per pod status of the lokistack ruler statefulset. */
  "ruler"?: Record<string, unknown>
}

export interface ConditionsItem {
  /** lastTransitionTime is the last time the condition transitioned from one status to another. This should be when the underlying condition changed.  If that is not known, then using the time when the API field changed is acceptable. */
  "lastTransitionTime": string
  /** message is a human readable message indicating details about the transition. This may be an empty string. */
  "message": string
  /** observedGeneration represents the .metadata.generation that the condition was set based upon. For instance, if .metadata.generation is currently 12, but the .status.conditions[x].observedGeneration is 9, the condition is out of date with respect to the current state of the instance. */
  "observedGeneration"?: number
  /** reason contains a programmatic identifier indicating the reason for the condition's last transition. Producers of specific condition types may define expected values and meanings for this field, and whether the values are considered a guaranteed API. The value should be a CamelCase string. This field may not be empty. */
  "reason": string
  /** status of the condition, one of True, False, Unknown. */
  "status": string
  /** type of condition in CamelCase or in foo.example.com/CamelCase. */
  "type": string
}

export interface Storage2 {
  /** CredentialMode contains the authentication mode used for accessing the object storage. */
  "credentialMode"?: string
  /** Schemas is a list of schemas which have been applied to the LokiStack. */
  "schemas"?: SchemasItem[]
}

export interface LokiStackStatus {
  /** Components provides summary of all Loki pod status grouped per component. */
  "components"?: Components
  /** Conditions of the Loki deployment health. */
  "conditions"?: ConditionsItem[]
  /** NetworkPolicyRuleSet indicates which NetworkPolicies ruleset was applied by the operator for this LokiStack. */
  "networkPolicyRuleSet"?: string
  /** Storage provides summary of all changes that have occurred to the storage configuration. */
  "storage"?: Storage2
}
