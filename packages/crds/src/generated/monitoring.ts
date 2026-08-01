/**
 * GENERATED from monitoring CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface Alertmanager {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'Alertmanager'
  metadata: ObjectMeta
  spec: AlertmanagerSpec
  status?: AlertmanagerStatus
}

/** Props for the {@link Alertmanager} component — a 1:1 mapping of the monitoring.coreos.com/v1 CRD. */
export interface AlertmanagerProps {
  metadata: ObjectMeta
  spec: AlertmanagerSpec
}

/** Render a Alertmanager (monitoring.coreos.com/v1) exactly as defined by its CRD. */
export function AlertmanagerComponent(props: AlertmanagerProps) {
  return jsx('Alertmanager', {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'Alertmanager',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface PodMonitor {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'PodMonitor'
  metadata: ObjectMeta
  spec: PodMonitorSpec
}

/** Props for the {@link PodMonitor} component — a 1:1 mapping of the monitoring.coreos.com/v1 CRD. */
export interface PodMonitorProps {
  metadata: ObjectMeta
  spec: PodMonitorSpec
}

/** Render a PodMonitor (monitoring.coreos.com/v1) exactly as defined by its CRD. */
export function PodMonitorComponent(props: PodMonitorProps) {
  return jsx('PodMonitor', {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'PodMonitor',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Prometheus {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'Prometheus'
  metadata: ObjectMeta
  spec: PrometheusSpec
  status?: PrometheusStatus
}

/** Props for the {@link Prometheus} component — a 1:1 mapping of the monitoring.coreos.com/v1 CRD. */
export interface PrometheusProps {
  metadata: ObjectMeta
  spec: PrometheusSpec
}

/** Render a Prometheus (monitoring.coreos.com/v1) exactly as defined by its CRD. */
export function PrometheusComponent(props: PrometheusProps) {
  return jsx('Prometheus', {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'Prometheus',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface PrometheusRule {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'PrometheusRule'
  metadata: ObjectMeta
  spec: PrometheusRuleSpec
  status?: PrometheusRuleStatus
}

/** Props for the {@link PrometheusRule} component — a 1:1 mapping of the monitoring.coreos.com/v1 CRD. */
export interface PrometheusRuleProps {
  metadata: ObjectMeta
  spec: PrometheusRuleSpec
}

/** Render a PrometheusRule (monitoring.coreos.com/v1) exactly as defined by its CRD. */
export function PrometheusRuleComponent(props: PrometheusRuleProps) {
  return jsx('PrometheusRule', {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'PrometheusRule',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface ScrapeConfig {
  apiVersion: 'monitoring.coreos.com/v1alpha1'
  kind: 'ScrapeConfig'
  metadata: ObjectMeta
  spec: ScrapeConfigSpec
  status?: ScrapeConfigStatus
}

/** Props for the {@link ScrapeConfig} component — a 1:1 mapping of the monitoring.coreos.com/v1alpha1 CRD. */
export interface ScrapeConfigProps {
  metadata: ObjectMeta
  spec: ScrapeConfigSpec
}

/** Render a ScrapeConfig (monitoring.coreos.com/v1alpha1) exactly as defined by its CRD. */
export function ScrapeConfigComponent(props: ScrapeConfigProps) {
  return jsx('ScrapeConfig', {
    apiVersion: 'monitoring.coreos.com/v1alpha1',
    kind: 'ScrapeConfig',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface ServiceMonitor {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'ServiceMonitor'
  metadata: ObjectMeta
  spec: ServiceMonitorSpec
}

/** Props for the {@link ServiceMonitor} component — a 1:1 mapping of the monitoring.coreos.com/v1 CRD. */
export interface ServiceMonitorProps {
  metadata: ObjectMeta
  spec: ServiceMonitorSpec
}

/** Render a ServiceMonitor (monitoring.coreos.com/v1) exactly as defined by its CRD. */
export function ServiceMonitorComponent(props: ServiceMonitorProps) {
  return jsx('ServiceMonitor', {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'ServiceMonitor',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface ThanosRuler {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'ThanosRuler'
  metadata: ObjectMeta
  spec: ThanosRulerSpec
  status?: ThanosRulerStatus
}

/** Props for the {@link ThanosRuler} component — a 1:1 mapping of the monitoring.coreos.com/v1 CRD. */
export interface ThanosRulerProps {
  metadata: ObjectMeta
  spec: ThanosRulerSpec
}

/** Render a ThanosRuler (monitoring.coreos.com/v1) exactly as defined by its CRD. */
export function ThanosRulerComponent(props: ThanosRulerProps) {
  return jsx('ThanosRuler', {
    apiVersion: 'monitoring.coreos.com/v1',
    kind: 'ThanosRuler',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface AdditionalArgsItem {
  /** name of the argument, e.g. "scrape.discovery-reload-interval". */
  "name": string
  /** value defines the argument value, e.g. 30s. Can be empty for name-only arguments (e.g. --storage.tsdb.no-lockfile) */
  "value"?: string
}

export interface MatchExpressionsItem {
  /** The label key that the selector applies to. */
  "key": string
  /** Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt. */
  "operator": string
  /** An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch. */
  "values"?: string[]
}

export interface MatchFieldsItem {
  /** The label key that the selector applies to. */
  "key": string
  /** Represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists, DoesNotExist. Gt, and Lt. */
  "operator": string
  /** An array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. If the operator is Gt or Lt, the values array must have a single element, which will be interpreted as an integer. This array is replaced during a strategic merge patch. */
  "values"?: string[]
}

export interface Preference {
  /** A list of node selector requirements by node's labels. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** A list of node selector requirements by node's fields. */
  "matchFields"?: MatchFieldsItem[]
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem {
  /** A node selector term, associated with the corresponding weight. */
  "preference": Preference
  /** Weight associated with matching the corresponding nodeSelectorTerm, in the range 1-100. */
  "weight": number
}

export interface NodeSelectorTermsItem {
  /** A list of node selector requirements by node's labels. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** A list of node selector requirements by node's fields. */
  "matchFields"?: MatchFieldsItem[]
}

export interface RequiredDuringSchedulingIgnoredDuringExecution {
  /** Required. A list of node selector terms. The terms are ORed. */
  "nodeSelectorTerms": NodeSelectorTermsItem[]
}

export interface NodeAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node matches the corresponding matchExpressions; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  /** If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to an update), the system may or may not try to eventually evict the pod from its node. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecution
}

export interface LabelSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface NamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface PodAffinityTerm {
  /** A label query over a set of resources, in this case pods. If it's null, this PodAffinityTerm matches with no Pods. */
  "labelSelector"?: LabelSelector
  /** MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. */
  "matchLabelKeys"?: string[]
  /** MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. */
  "mismatchLabelKeys"?: string[]
  /** A label query over the set of namespaces that the term applies to. The term is applied to the union of the namespaces selected by this field and the ones listed in the namespaces field. null selector and null or empty namespaces list means "this pod's namespace". An empty selector ({}) matches all namespaces. */
  "namespaceSelector"?: NamespaceSelector
  /** namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". */
  "namespaces"?: string[]
  /** This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. */
  "topologyKey": string
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem2 {
  /** Required. A pod affinity term, associated with the corresponding weight. */
  "podAffinityTerm": PodAffinityTerm
  /** weight associated with matching the corresponding podAffinityTerm, in the range 1-100. */
  "weight": number
}

export interface RequiredDuringSchedulingIgnoredDuringExecutionItem {
  /** A label query over a set of resources, in this case pods. If it's null, this PodAffinityTerm matches with no Pods. */
  "labelSelector"?: LabelSelector
  /** MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both matchLabelKeys and labelSelector. Also, matchLabelKeys cannot be set when labelSelector isn't set. */
  "matchLabelKeys"?: string[]
  /** MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `labelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both mismatchLabelKeys and labelSelector. Also, mismatchLabelKeys cannot be set when labelSelector isn't set. */
  "mismatchLabelKeys"?: string[]
  /** A label query over the set of namespaces that the term applies to. The term is applied to the union of the namespaces selected by this field and the ones listed in the namespaces field. null selector and null or empty namespaces list means "this pod's namespace". An empty selector ({}) matches all namespaces. */
  "namespaceSelector"?: NamespaceSelector
  /** namespaces specifies a static list of namespace names that the term applies to. The term is applied to the union of the namespaces listed in this field and the ones selected by namespaceSelector. null or empty namespaces list and null namespaceSelector means "this pod's namespace". */
  "namespaces"?: string[]
  /** This pod should be co-located (affinity) or not co-located (anti-affinity) with the pods matching the labelSelector in the specified namespaces, where co-located is defined as running on a node whose value of the label with key topologyKey matches that of any node on which any of the selected pods is running. Empty topologyKey is not allowed. */
  "topologyKey": string
}

export interface PodAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem2[]
  /** If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface PodAntiAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and subtracting "weight" from the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem2[]
  /** If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface Affinity {
  /** Describes node affinity scheduling rules for the pod. */
  "nodeAffinity"?: NodeAffinity
  /** Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)). */
  "podAffinity"?: PodAffinity
  /** Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)). */
  "podAntiAffinity"?: PodAntiAffinity
}

export interface AlertmanagerConfigMatcherStrategy {
  /** type defines the strategy used by AlertmanagerConfig objects to match alerts in the routes and inhibition rules. The default value is `OnNamespace`. */
  "type"?: "OnNamespace" | "OnNamespaceExceptForAlertmanagerNamespace" | "None"
}

export interface AlertmanagerConfigNamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface AlertmanagerConfigSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface Credentials {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Authorization {
  /** credentials defines a key of a Secret in the namespace that contains the credentials for authentication. */
  "credentials"?: Credentials
  /** type defines the authentication type. The value is case-insensitive. "Basic" is not a supported value. Default: "Bearer" */
  "type"?: string
}

export interface Password {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Username {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface BasicAuth {
  /** password defines a key of a Secret containing the password for authentication. */
  "password"?: Password
  /** username defines a key of a Secret containing the username for authentication. */
  "username"?: Username
}

export interface BearerTokenSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ConfigMap {
  /** The key to select. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the ConfigMap or its key must be defined */
  "optional"?: boolean
}

export interface Secret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ClientId {
  /** configMap defines the ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** secret defines the Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface ClientSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Ca {
  /** configMap defines the ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** secret defines the Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface Cert {
  /** configMap defines the ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** secret defines the Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface KeySecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface TlsConfig {
  /** ca defines the Certificate authority used when verifying server certificates. */
  "ca"?: Ca
  /** cert defines the Client certificate to present when doing client-authentication. */
  "cert"?: Cert
  /** insecureSkipVerify defines how to disable target certificate validation. */
  "insecureSkipVerify"?: boolean
  /** keySecret defines the Secret containing the client key file for the targets. */
  "keySecret"?: KeySecret
  /** maxVersion defines the maximum acceptable TLS version. It requires Prometheus >= v2.41.0 or Thanos >= v0.31.0. */
  "maxVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** minVersion defines the minimum acceptable TLS version. It requires Prometheus >= v2.35.0 or Thanos >= v0.28.0. */
  "minVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** serverName is used to verify the hostname for the targets. */
  "serverName"?: string
}

export interface Oauth2 {
  /** clientId defines a key of a Secret or ConfigMap containing the OAuth2 client's ID. */
  "clientId": ClientId
  /** clientSecret defines a key of a Secret containing the OAuth2 client's secret. */
  "clientSecret": ClientSecret
  /** endpointParams configures the HTTP parameters to append to the token URL. */
  "endpointParams"?: Record<string, unknown>
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** scopes defines the OAuth2 scopes used for the token request. */
  "scopes"?: string[]
  /** tlsConfig defines the TLS configuration to use when connecting to the OAuth2 server. It requires Prometheus >= v2.43.0. */
  "tlsConfig"?: TlsConfig
  /** tokenUrl defines the URL to fetch the token from. */
  "tokenUrl": string
}

export interface HttpConfig {
  /** authorization configures the Authorization header credentials used by the client. Cannot be set at the same time as `basicAuth`, `bearerTokenSecret` or `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines the Basic Authentication credentials used by the client. Cannot be set at the same time as `authorization`, `bearerTokenSecret` or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** bearerTokenSecret defines a key of a Secret containing the bearer token used by the client for authentication. The secret needs to be in the same namespace as the custom resource and readable by the Prometheus Operator. Cannot be set at the same time as `authorization`, `basicAuth` or `oauth2`. Deprecated: use `authorization` instead. */
  "bearerTokenSecret"?: BearerTokenSecret
  /** enableHttp2 can be used to disable HTTP2. */
  "enableHttp2"?: boolean
  /** followRedirects defines whether the client should follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the OAuth2 settings used by the client. It requires Prometheus >= 2.27.0. Cannot be set at the same time as `authorization`, `basicAuth` or `bearerTokenSecret`. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** tlsConfig defines the TLS configuration used by the client. */
  "tlsConfig"?: TlsConfig
}

export interface Jira {
  /** apiURL defines the default Jira API URL. It requires Alertmanager >= v0.28.0. */
  "apiURL"?: string
}

export interface WebhookURL {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Mattermost {
  /** webhookURL defines the default Mattermost Webhook URL. It requires Alertmanager >= v0.32.0. */
  "webhookURL"?: WebhookURL
}

export interface OpsGenieApiKey {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface OpsGenieApiUrl {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Token {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface TokenID {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface RocketChat {
  /** apiURL defines the default Rocket Chat API URL. It requires Alertmanager >= v0.28.0. */
  "apiURL"?: string
  /** token defines the default Rocket Chat token. It requires Alertmanager >= v0.28.0. */
  "token"?: Token
  /** tokenID defines the default Rocket Chat Token ID. It requires Alertmanager >= v0.28.0. */
  "tokenID"?: TokenID
}

export interface SlackApiUrl {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface AuthPassword {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface AuthSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface SmartHost {
  /** host defines the host's address, it can be a DNS name or a literal IP address. */
  "host": string
  /** port defines the host's port, it can be a literal port number or a port name. */
  "port": string
}

export interface Smtp {
  /** authIdentity represents SMTP Auth using PLAIN */
  "authIdentity"?: string
  /** authPassword represents SMTP Auth using LOGIN and PLAIN. */
  "authPassword"?: AuthPassword
  /** authSecret represents SMTP Auth using CRAM-MD5. */
  "authSecret"?: AuthSecret
  /** authUsername represents SMTP Auth using CRAM-MD5, LOGIN and PLAIN. If empty, Alertmanager doesn't authenticate to the SMTP server. */
  "authUsername"?: string
  /** forceImplicitTLS defines whether to force use of implicit TLS (direct TLS connection) for better security. true: force use of implicit TLS (direct TLS connection on any port) false: force disable implicit TLS (use explicit TLS/STARTTLS if required) nil (default): auto-detect based on port (465=implicit, other=explicit) for backward compatibility It requires Alertmanager >= v0.31.0. */
  "forceImplicitTLS"?: boolean
  /** from defines the default SMTP From header field. */
  "from"?: string
  /** hello defines the default hostname to identify to the SMTP server. */
  "hello"?: string
  /** requireTLS defines the default SMTP TLS requirement. Note that Go does not support unencrypted connections to remote SMTP endpoints. */
  "requireTLS"?: boolean
  /** smartHost defines the default SMTP smarthost used for sending emails. */
  "smartHost"?: SmartHost
  /** tlsConfig defines the default TLS configuration for SMTP receivers */
  "tlsConfig"?: TlsConfig
}

export interface Telegram {
  /** apiURL defines he default Telegram API URL. It requires Alertmanager >= v0.24.0. */
  "apiURL"?: string
}

export interface ApiKey {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Victorops {
  /** apiKey defines the default VictorOps API Key. */
  "apiKey"?: ApiKey
  /** apiURL defines the default VictorOps API URL. */
  "apiURL"?: string
}

export interface Webex {
  /** apiURL defines the is the default Webex API URL. It requires Alertmanager >= v0.25.0. */
  "apiURL"?: string
}

export interface ApiSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Wechat {
  /** apiCorpID defines the default WeChat API Corporate ID. */
  "apiCorpID"?: string
  /** apiSecret defines the default WeChat API Secret. */
  "apiSecret"?: ApiSecret
  /** apiURL defines he default WeChat API URL. The default value is "https://qyapi.weixin.qq.com/cgi-bin/" */
  "apiURL"?: string
}

export interface Global {
  /** httpConfig defines the default HTTP configuration. */
  "httpConfig"?: HttpConfig
  /** jira defines the default configuration for Jira. */
  "jira"?: Jira
  /** mattermost defines the default Mattermost Config */
  "mattermost"?: Mattermost
  /** opsGenieApiKey defines the default OpsGenie API Key. */
  "opsGenieApiKey"?: OpsGenieApiKey
  /** opsGenieApiUrl defines the default OpsGenie API URL. */
  "opsGenieApiUrl"?: OpsGenieApiUrl
  /** pagerdutyUrl defines the default Pagerduty URL. */
  "pagerdutyUrl"?: string
  /** resolveTimeout defines the default value used by alertmanager if the alert does not include EndsAt, after this time passes it can declare the alert as resolved if it has not been updated. This has no impact on alerts from Prometheus, as they always include EndsAt. */
  "resolveTimeout"?: string
  /** rocketChat defines the default configuration for Rocket Chat. */
  "rocketChat"?: RocketChat
  /** slackApiUrl defines the default Slack API URL. */
  "slackApiUrl"?: SlackApiUrl
  /** smtp defines global SMTP parameters. */
  "smtp"?: Smtp
  /** telegram defines the default Telegram config */
  "telegram"?: Telegram
  /** victorops defines the default configuration for VictorOps. */
  "victorops"?: Victorops
  /** webex defines the default configuration for Webex. */
  "webex"?: Webex
  /** wechat defines the default WeChat Config */
  "wechat"?: Wechat
}

export interface TemplatesItem {
  /** configMap defines the ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** secret defines the Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface AlertmanagerConfiguration {
  /** global defines the global parameters of the Alertmanager configuration. */
  "global"?: Global
  /** name defines the name of the AlertmanagerConfig custom resource which is used to generate the Alertmanager configuration. It must be defined in the same namespace as the Alertmanager object. The operator will not enforce a `namespace` label for routes and inhibition rules. */
  "name"?: string
  /** templates defines the custom notification templates. */
  "templates"?: TemplatesItem[]
}

export interface Client {
  /** ca defines the Certificate authority used when verifying server certificates. */
  "ca"?: Ca
  /** cert defines the Client certificate to present when doing client-authentication. */
  "cert"?: Cert
  /** insecureSkipVerify defines how to disable target certificate validation. */
  "insecureSkipVerify"?: boolean
  /** keySecret defines the Secret containing the client key file for the targets. */
  "keySecret"?: KeySecret
  /** maxVersion defines the maximum acceptable TLS version. It requires Prometheus >= v2.41.0 or Thanos >= v0.31.0. */
  "maxVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** minVersion defines the minimum acceptable TLS version. It requires Prometheus >= v2.35.0 or Thanos >= v0.28.0. */
  "minVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** serverName is used to verify the hostname for the targets. */
  "serverName"?: string
}

export interface ClientCa {
  /** configMap defines the ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** secret defines the Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface Server {
  /** cert defines the Secret or ConfigMap containing the TLS certificate for the web server. Either `keySecret` or `keyFile` must be defined. It is mutually exclusive with `certFile`. */
  "cert"?: Cert
  /** certFile defines the path to the TLS certificate file in the container for the web server. Either `keySecret` or `keyFile` must be defined. It is mutually exclusive with `cert`. */
  "certFile"?: string
  /** cipherSuites defines the list of supported cipher suites for TLS versions up to TLS 1.2. If not defined, the Go default cipher suites are used. Available cipher suites are documented in the Go documentation: https://golang.org/pkg/crypto/tls/#pkg-constants */
  "cipherSuites"?: string[]
  /** client_ca defines the Secret or ConfigMap containing the CA certificate for client certificate authentication to the server. It is mutually exclusive with `clientCAFile`. */
  "client_ca"?: ClientCa
  /** clientAuthType defines the server policy for client TLS authentication. For more detail on clientAuth options: https://golang.org/pkg/crypto/tls/#ClientAuthType */
  "clientAuthType"?: string
  /** clientCAFile defines the path to the CA certificate file for client certificate authentication to the server. It is mutually exclusive with `client_ca`. */
  "clientCAFile"?: string
  /** curvePreferences defines elliptic curves that will be used in an ECDHE handshake, in preference order. Available curves are documented in the Go documentation: https://golang.org/pkg/crypto/tls/#CurveID */
  "curvePreferences"?: string[]
  /** keyFile defines the path to the TLS private key file in the container for the web server. If defined, either `cert` or `certFile` must be defined. It is mutually exclusive with `keySecret`. */
  "keyFile"?: string
  /** keySecret defines the secret containing the TLS private key for the web server. Either `cert` or `certFile` must be defined. It is mutually exclusive with `keyFile`. */
  "keySecret"?: KeySecret
  /** maxVersion defines the Maximum TLS version that is acceptable. */
  "maxVersion"?: string
  /** minVersion defines the minimum TLS version that is acceptable. */
  "minVersion"?: string
  /** preferServerCipherSuites defines whether the server selects the client's most preferred cipher suite, or the server's most preferred cipher suite. If true then the server's preference, as expressed in the order of elements in cipherSuites, is used. */
  "preferServerCipherSuites"?: boolean
}

export interface ClusterTLS {
  /** client defines the client-side configuration for mutual TLS. */
  "client": Client
  /** server defines the server-side configuration for mutual TLS. */
  "server": Server
}

export interface ConfigMapKeyRef {
  /** The key to select. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the ConfigMap or its key must be defined */
  "optional"?: boolean
}

export interface FieldRef {
  /** Version of the schema the FieldPath is written in terms of, defaults to "v1". */
  "apiVersion"?: string
  /** Path of the field to select in the specified API version. */
  "fieldPath": string
}

export interface FileKeyRef {
  /** The key within the env file. An invalid key will prevent the pod from starting. The keys defined within a source may consist of any printable ASCII characters except '='. During Alpha stage of the EnvFiles feature gate, the key size is limited to 128 characters. */
  "key": string
  /** Specify whether the file or its key must be defined. If the file or key does not exist, then the env var is not published. If optional is set to true and the specified key does not exist, the environment variable will not be set in the Pod's containers. If optional is set to false and the specified key does not exist, an error will be returned during Pod creation. */
  "optional"?: boolean
  /** The path within the volume from which to select the file. Must be relative and may not contain the '..' path or start with '..'. */
  "path": string
  /** The name of the volume mount containing the env file. */
  "volumeName": string
}

export interface ResourceFieldRef {
  /** Container name: required for volumes, optional for env vars */
  "containerName"?: string
  /** Specifies the output format of the exposed resources, defaults to "1" */
  "divisor"?: number | string
  /** Required: resource to select */
  "resource": string
}

export interface SecretKeyRef {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ValueFrom {
  /** Selects a key of a ConfigMap. */
  "configMapKeyRef"?: ConfigMapKeyRef
  /** Selects a field of the pod: supports metadata.name, metadata.namespace, `metadata.labels['<KEY>']`, `metadata.annotations['<KEY>']`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs. */
  "fieldRef"?: FieldRef
  /** FileKeyRef selects a key of the env file. Requires the EnvFiles feature gate to be enabled. */
  "fileKeyRef"?: FileKeyRef
  /** Selects a resource of the container: only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported. */
  "resourceFieldRef"?: ResourceFieldRef
  /** Selects a key of a secret in the pod's namespace */
  "secretKeyRef"?: SecretKeyRef
}

export interface EnvItem {
  /** Name of the environment variable. May consist of any printable ASCII characters except '='. */
  "name": string
  /** Variable references $(VAR_NAME) are expanded using the previously defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "". */
  "value"?: string
  /** Source for the environment variable's value. Cannot be used if value is not empty. */
  "valueFrom"?: ValueFrom
}

export interface ConfigMapRef {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the ConfigMap must be defined */
  "optional"?: boolean
}

export interface SecretRef {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret must be defined */
  "optional"?: boolean
}

export interface EnvFromItem {
  /** The ConfigMap to select from */
  "configMapRef"?: ConfigMapRef
  /** Optional text to prepend to the name of each environment variable. May consist of any printable ASCII characters except '='. */
  "prefix"?: string
  /** The Secret to select from */
  "secretRef"?: SecretRef
}

export interface Exec {
  /** Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. */
  "command"?: string[]
}

export interface HttpHeadersItem {
  /** The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header. */
  "name": string
  /** The header field value */
  "value": string
}

export interface HttpGet {
  /** Host name to connect to, defaults to the pod IP. You probably want to set "Host" in httpHeaders instead. */
  "host"?: string
  /** Custom headers to set in the request. HTTP allows repeated headers. */
  "httpHeaders"?: HttpHeadersItem[]
  /** Path to access on the HTTP server. */
  "path"?: string
  /** Name or number of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. */
  "port": number | string
  /** Scheme to use for connecting to the host. Defaults to HTTP. */
  "scheme"?: string
}

export interface Sleep {
  /** Seconds is the number of seconds to sleep. */
  "seconds": number
}

export interface TcpSocket {
  /** Optional: Host name to connect to, defaults to the pod IP. */
  "host"?: string
  /** Number or name of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. */
  "port": number | string
}

export interface PostStart {
  /** Exec specifies a command to execute in the container. */
  "exec"?: Exec
  /** HTTPGet specifies an HTTP GET request to perform. */
  "httpGet"?: HttpGet
  /** Sleep represents a duration that the container should sleep. */
  "sleep"?: Sleep
  /** Deprecated. TCPSocket is NOT supported as a LifecycleHandler and kept for backward compatibility. There is no validation of this field and lifecycle hooks will fail at runtime when it is specified. */
  "tcpSocket"?: TcpSocket
}

export interface PreStop {
  /** Exec specifies a command to execute in the container. */
  "exec"?: Exec
  /** HTTPGet specifies an HTTP GET request to perform. */
  "httpGet"?: HttpGet
  /** Sleep represents a duration that the container should sleep. */
  "sleep"?: Sleep
  /** Deprecated. TCPSocket is NOT supported as a LifecycleHandler and kept for backward compatibility. There is no validation of this field and lifecycle hooks will fail at runtime when it is specified. */
  "tcpSocket"?: TcpSocket
}

export interface Lifecycle {
  /** PostStart is called immediately after a container is created. If the handler fails, the container is terminated and restarted according to its restart policy. Other management of the container blocks until the hook completes. More info: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/#container-hooks */
  "postStart"?: PostStart
  /** PreStop is called immediately before a container is terminated due to an API request or management event such as liveness/startup probe failure, preemption, resource contention, etc. The handler is not called if the container crashes or exits. The Pod's termination grace period countdown begins before the PreStop hook is executed. Regardless of the outcome of the handler, the container will eventually terminate within the Pod's termination grace period (unless delayed by finalizers). Other management of the container blocks until the hook completes or until the termination grace period is reached. More info: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/#container-hooks */
  "preStop"?: PreStop
  /** StopSignal defines which signal will be sent to a container when it is being stopped. If not specified, the default is defined by the container runtime in use. StopSignal can only be set for Pods with a non-empty .spec.os.name */
  "stopSignal"?: string
}

export interface Grpc {
  /** Port number of the gRPC service. Number must be in the range 1 to 65535. */
  "port": number
  /** Service is the name of the service to place in the gRPC HealthCheckRequest (see https://github.com/grpc/grpc/blob/master/doc/health-checking.md). If this is not specified, the default behavior is defined by gRPC. */
  "service"?: string
}

export interface LivenessProbe {
  /** Exec specifies a command to execute in the container. */
  "exec"?: Exec
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** GRPC specifies a GRPC HealthCheckRequest. */
  "grpc"?: Grpc
  /** HTTPGet specifies an HTTP GET request to perform. */
  "httpGet"?: HttpGet
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** TCPSocket specifies a connection to a TCP port. */
  "tcpSocket"?: TcpSocket
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
}

export interface PortsItem {
  /** Number of port to expose on the pod's IP address. This must be a valid port number, 0 < x < 65536. */
  "containerPort": number
  /** What host IP to bind the external port to. */
  "hostIP"?: string
  /** Number of port to expose on the host. If specified, this must be a valid port number, 0 < x < 65536. If HostNetwork is specified, this must match ContainerPort. Most containers do not need this. */
  "hostPort"?: number
  /** If specified, this must be an IANA_SVC_NAME and unique within the pod. Each named port in a pod must have a unique name. Name for the port that can be referred to by services. */
  "name"?: string
  /** Protocol for port. Must be UDP, TCP, or SCTP. Defaults to "TCP". */
  "protocol"?: string
}

export interface ReadinessProbe {
  /** Exec specifies a command to execute in the container. */
  "exec"?: Exec
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** GRPC specifies a GRPC HealthCheckRequest. */
  "grpc"?: Grpc
  /** HTTPGet specifies an HTTP GET request to perform. */
  "httpGet"?: HttpGet
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** TCPSocket specifies a connection to a TCP port. */
  "tcpSocket"?: TcpSocket
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
}

export interface ResizePolicyItem {
  /** Name of the resource to which this resource resize policy applies. Supported values: cpu, memory. */
  "resourceName": string
  /** Restart policy to apply when specified resource is resized. If not specified, it defaults to NotRequired. */
  "restartPolicy": string
}

export interface ClaimsItem {
  /** Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. */
  "name": string
  /** Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request. */
  "request"?: string
}

export interface Resources {
  /** Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container. This field depends on the DynamicResourceAllocation feature gate. This field is immutable. It can only be set for containers. */
  "claims"?: ClaimsItem[]
  /** Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "limits"?: Record<string, unknown>
  /** Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "requests"?: Record<string, unknown>
}

export interface ExitCodes {
  /** Represents the relationship between the container exit code(s) and the specified values. Possible values are: - In: the requirement is satisfied if the container exit code is in the   set of specified values. - NotIn: the requirement is satisfied if the container exit code is   not in the set of specified values. */
  "operator": string
  /** Specifies the set of values to check for container exit codes. At most 255 elements are allowed. */
  "values"?: number[]
}

export interface RestartPolicyRulesItem {
  /** Specifies the action taken on a container exit if the requirements are satisfied. The only possible value is "Restart" to restart the container. */
  "action": string
  /** Represents the exit codes to check on container exits. */
  "exitCodes"?: ExitCodes
}

export interface AppArmorProfile {
  /** localhostProfile indicates a profile loaded on the node that should be used. The profile must be preconfigured on the node to work. Must match the loaded name of the profile. Must be set if and only if type is "Localhost". */
  "localhostProfile"?: string
  /** type indicates which kind of AppArmor profile will be applied. Valid options are:   Localhost - a profile pre-loaded on the node.   RuntimeDefault - the container runtime's default profile.   Unconfined - no AppArmor enforcement. */
  "type": string
}

export interface Capabilities {
  /** Added capabilities */
  "add"?: string[]
  /** Removed capabilities */
  "drop"?: string[]
}

export interface SeLinuxOptions {
  /** Level is SELinux level label that applies to the container. */
  "level"?: string
  /** Role is a SELinux role label that applies to the container. */
  "role"?: string
  /** Type is a SELinux type label that applies to the container. */
  "type"?: string
  /** User is a SELinux user label that applies to the container. */
  "user"?: string
}

export interface SeccompProfile {
  /** localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type. */
  "localhostProfile"?: string
  /** type indicates which kind of seccomp profile will be applied. Valid options are: Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied. */
  "type": string
}

export interface WindowsOptions {
  /** GMSACredentialSpec is where the GMSA admission webhook (https://github.com/kubernetes-sigs/windows-gmsa) inlines the contents of the GMSA credential spec named by the GMSACredentialSpecName field. */
  "gmsaCredentialSpec"?: string
  /** GMSACredentialSpecName is the name of the GMSA credential spec to use. */
  "gmsaCredentialSpecName"?: string
  /** HostProcess determines if a container should be run as a 'Host Process' container. All of a Pod's containers must have the same effective HostProcess value (it is not allowed to have a mix of HostProcess containers and non-HostProcess containers). In addition, if HostProcess is true then HostNetwork must also be set to true. */
  "hostProcess"?: boolean
  /** The UserName in Windows to run the entrypoint of the container process. Defaults to the user specified in image metadata if unspecified. May also be set in PodSecurityContext. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. */
  "runAsUserName"?: string
}

export interface SecurityContext {
  /** AllowPrivilegeEscalation controls whether a process can gain more privileges than its parent process. This bool directly controls if the no_new_privs flag will be set on the container process. AllowPrivilegeEscalation is true always when the container is: 1) run as Privileged 2) has CAP_SYS_ADMIN Note that this field cannot be set when spec.os.name is windows. */
  "allowPrivilegeEscalation"?: boolean
  /** appArmorProfile is the AppArmor options to use by this container. If set, this profile overrides the pod's appArmorProfile. Note that this field cannot be set when spec.os.name is windows. */
  "appArmorProfile"?: AppArmorProfile
  /** The capabilities to add/drop when running containers. Defaults to the default set of capabilities granted by the container runtime. Note that this field cannot be set when spec.os.name is windows. */
  "capabilities"?: Capabilities
  /** Run container in privileged mode. Processes in privileged containers are essentially equivalent to root on the host. Defaults to false. Note that this field cannot be set when spec.os.name is windows. */
  "privileged"?: boolean
  /** procMount denotes the type of proc mount to use for the containers. The default value is Default which uses the container runtime defaults for readonly paths and masked paths. Note that this field cannot be set when spec.os.name is windows. */
  "procMount"?: string
  /** Whether this container has a read-only root filesystem. Default is false. Note that this field cannot be set when spec.os.name is windows. */
  "readOnlyRootFilesystem"?: boolean
  /** The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. */
  "runAsGroup"?: number
  /** Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. */
  "runAsNonRoot"?: boolean
  /** The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. */
  "runAsUser"?: number
  /** The SELinux context to be applied to the container. If unspecified, the container runtime will allocate a random SELinux context for each container.  May also be set in PodSecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is windows. */
  "seLinuxOptions"?: SeLinuxOptions
  /** The seccomp options to use by this container. If seccomp options are provided at both the pod & container level, the container options override the pod options. Note that this field cannot be set when spec.os.name is windows. */
  "seccompProfile"?: SeccompProfile
  /** The Windows specific settings applied to all containers. If unspecified, the options from the PodSecurityContext will be used. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is linux. */
  "windowsOptions"?: WindowsOptions
}

export interface StartupProbe {
  /** Exec specifies a command to execute in the container. */
  "exec"?: Exec
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** GRPC specifies a GRPC HealthCheckRequest. */
  "grpc"?: Grpc
  /** HTTPGet specifies an HTTP GET request to perform. */
  "httpGet"?: HttpGet
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** TCPSocket specifies a connection to a TCP port. */
  "tcpSocket"?: TcpSocket
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
}

export interface VolumeDevicesItem {
  /** devicePath is the path inside of the container that the device will be mapped to. */
  "devicePath": string
  /** name must match the name of a persistentVolumeClaim in the pod */
  "name": string
}

export interface VolumeMountsItem {
  /** Path within the container at which the volume should be mounted.  Must not contain ':'. */
  "mountPath": string
  /** mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationNone is used. This field is beta in 1.10. When RecursiveReadOnly is set to IfPossible or to Enabled, MountPropagation must be None or unspecified (which defaults to None). */
  "mountPropagation"?: string
  /** This must match the Name of a Volume. */
  "name": string
  /** Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false. */
  "readOnly"?: boolean
  /** RecursiveReadOnly specifies whether read-only mounts should be handled recursively. If ReadOnly is false, this field has no meaning and must be unspecified. If ReadOnly is true, and this field is set to Disabled, the mount is not made recursively read-only.  If this field is set to IfPossible, the mount is made recursively read-only, if it is supported by the container runtime.  If this field is set to Enabled, the mount is made recursively read-only if it is supported by the container runtime, otherwise the pod will not be started and an error will be generated to indicate the reason. If this field is set to IfPossible or Enabled, MountPropagation must be set to None (or be unspecified, which defaults to None). If this field is not specified, it is treated as an equivalent of Disabled. */
  "recursiveReadOnly"?: string
  /** Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root). */
  "subPath"?: string
  /** Expanded path within the volume from which the container's volume should be mounted. Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment. Defaults to "" (volume's root). SubPathExpr and SubPath are mutually exclusive. */
  "subPathExpr"?: string
}

export interface ContainersItem {
  /** Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell */
  "args"?: string[]
  /** Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell */
  "command"?: string[]
  /** List of environment variables to set in the container. Cannot be updated. */
  "env"?: EnvItem[]
  /** List of sources to populate environment variables in the container. The keys defined within a source may consist of any printable ASCII characters except '='. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated. */
  "envFrom"?: EnvFromItem[]
  /** Container image name. More info: https://kubernetes.io/docs/concepts/containers/images This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. */
  "image"?: string
  /** Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: https://kubernetes.io/docs/concepts/containers/images#updating-images */
  "imagePullPolicy"?: string
  /** Actions that the management system should take in response to container lifecycle events. Cannot be updated. */
  "lifecycle"?: Lifecycle
  /** Periodic probe of container liveness. Container will be restarted if the probe fails. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "livenessProbe"?: LivenessProbe
  /** Name of the container specified as a DNS_LABEL. Each container in a pod must have a unique name (DNS_LABEL). Cannot be updated. */
  "name": string
  /** List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See https://github.com/kubernetes/kubernetes/issues/108255. Cannot be updated. */
  "ports"?: PortsItem[]
  /** Periodic probe of container service readiness. Container will be removed from service endpoints if the probe fails. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "readinessProbe"?: ReadinessProbe
  /** Resources resize policy for the container. This field cannot be set on ephemeral containers. */
  "resizePolicy"?: ResizePolicyItem[]
  /** Compute Resources required by this container. Cannot be updated. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "resources"?: Resources
  /** RestartPolicy defines the restart behavior of individual containers in a pod. This overrides the pod-level restart policy. When this field is not specified, the restart behavior is defined by the Pod's restart policy and the container type. Additionally, setting the RestartPolicy as "Always" for the init container will have the following effect: this init container will be continually restarted on exit until all regular containers have terminated. Once all regular containers have completed, all init containers with restartPolicy "Always" will be shut down. This lifecycle differs from normal init containers and is often referred to as a "sidecar" container. Although this init container still starts in the init container sequence, it does not wait for the container to complete before proceeding to the next init container. Instead, the next init container starts immediately after this init container is started, or after any startupProbe has successfully completed. */
  "restartPolicy"?: string
  /** Represents a list of rules to be checked to determine if the container should be restarted on exit. The rules are evaluated in order. Once a rule matches a container exit condition, the remaining rules are ignored. If no rule matches the container exit condition, the Container-level restart policy determines the whether the container is restarted or not. Constraints on the rules: - At most 20 rules are allowed. - Rules can have the same action. - Identical rules are not forbidden in validations. When rules are specified, container MUST set RestartPolicy explicitly even it if matches the Pod's RestartPolicy. */
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  /** SecurityContext defines the security options the container should be run with. If set, the fields of SecurityContext override the equivalent fields of PodSecurityContext. More info: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ */
  "securityContext"?: SecurityContext
  /** StartupProbe indicates that the Pod has successfully initialized. If specified, no other probes are executed until this completes successfully. If this probe fails, the Pod will be restarted, just as if the livenessProbe failed. This can be used to provide different probe parameters at the beginning of a Pod's lifecycle, when it might take a long time to load data or warm a cache, than during steady-state operation. This cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "startupProbe"?: StartupProbe
  /** Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false. */
  "stdin"?: boolean
  /** Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false */
  "stdinOnce"?: boolean
  /** Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated. */
  "terminationMessagePath"?: string
  /** Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated. */
  "terminationMessagePolicy"?: string
  /** Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false. */
  "tty"?: boolean
  /** volumeDevices is the list of block devices to be used by the container. */
  "volumeDevices"?: VolumeDevicesItem[]
  /** Pod volumes to mount into the container's filesystem. Cannot be updated. */
  "volumeMounts"?: VolumeMountsItem[]
  /** Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated. */
  "workingDir"?: string
}

export interface OptionsItem {
  /** name is required and must be unique. */
  "name": string
  /** value is optional. */
  "value"?: string
}

export interface DnsConfig {
  /** nameservers defines the list of DNS name server IP addresses. This will be appended to the base nameservers generated from DNSPolicy. */
  "nameservers"?: string[]
  /** options defines the list of DNS resolver options. This will be merged with the base options generated from DNSPolicy. Resolution options given in Options will override those that appear in the base DNSPolicy. */
  "options"?: OptionsItem[]
  /** searches defines the list of DNS search domains for host-name lookup. This will be appended to the base search paths generated from DNSPolicy. */
  "searches"?: string[]
}

export interface HostAliasesItem {
  /** hostnames defines hostnames for the above IP address. */
  "hostnames": string[]
  /** ip defines the IP address of the host file entry. */
  "ip": string
}

export interface ImagePullSecretsItem {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
}

export interface InitContainersItem {
  /** Arguments to the entrypoint. The container image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell */
  "args"?: string[]
  /** Entrypoint array. Not executed within a shell. The container image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell */
  "command"?: string[]
  /** List of environment variables to set in the container. Cannot be updated. */
  "env"?: EnvItem[]
  /** List of sources to populate environment variables in the container. The keys defined within a source may consist of any printable ASCII characters except '='. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated. */
  "envFrom"?: EnvFromItem[]
  /** Container image name. More info: https://kubernetes.io/docs/concepts/containers/images This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. */
  "image"?: string
  /** Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: https://kubernetes.io/docs/concepts/containers/images#updating-images */
  "imagePullPolicy"?: string
  /** Actions that the management system should take in response to container lifecycle events. Cannot be updated. */
  "lifecycle"?: Lifecycle
  /** Periodic probe of container liveness. Container will be restarted if the probe fails. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "livenessProbe"?: LivenessProbe
  /** Name of the container specified as a DNS_LABEL. Each container in a pod must have a unique name (DNS_LABEL). Cannot be updated. */
  "name": string
  /** List of ports to expose from the container. Not specifying a port here DOES NOT prevent that port from being exposed. Any port which is listening on the default "0.0.0.0" address inside a container will be accessible from the network. Modifying this array with strategic merge patch may corrupt the data. For more information See https://github.com/kubernetes/kubernetes/issues/108255. Cannot be updated. */
  "ports"?: PortsItem[]
  /** Periodic probe of container service readiness. Container will be removed from service endpoints if the probe fails. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "readinessProbe"?: ReadinessProbe
  /** Resources resize policy for the container. This field cannot be set on ephemeral containers. */
  "resizePolicy"?: ResizePolicyItem[]
  /** Compute Resources required by this container. Cannot be updated. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "resources"?: Resources
  /** RestartPolicy defines the restart behavior of individual containers in a pod. This overrides the pod-level restart policy. When this field is not specified, the restart behavior is defined by the Pod's restart policy and the container type. Additionally, setting the RestartPolicy as "Always" for the init container will have the following effect: this init container will be continually restarted on exit until all regular containers have terminated. Once all regular containers have completed, all init containers with restartPolicy "Always" will be shut down. This lifecycle differs from normal init containers and is often referred to as a "sidecar" container. Although this init container still starts in the init container sequence, it does not wait for the container to complete before proceeding to the next init container. Instead, the next init container starts immediately after this init container is started, or after any startupProbe has successfully completed. */
  "restartPolicy"?: string
  /** Represents a list of rules to be checked to determine if the container should be restarted on exit. The rules are evaluated in order. Once a rule matches a container exit condition, the remaining rules are ignored. If no rule matches the container exit condition, the Container-level restart policy determines the whether the container is restarted or not. Constraints on the rules: - At most 20 rules are allowed. - Rules can have the same action. - Identical rules are not forbidden in validations. When rules are specified, container MUST set RestartPolicy explicitly even it if matches the Pod's RestartPolicy. */
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  /** SecurityContext defines the security options the container should be run with. If set, the fields of SecurityContext override the equivalent fields of PodSecurityContext. More info: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ */
  "securityContext"?: SecurityContext
  /** StartupProbe indicates that the Pod has successfully initialized. If specified, no other probes are executed until this completes successfully. If this probe fails, the Pod will be restarted, just as if the livenessProbe failed. This can be used to provide different probe parameters at the beginning of a Pod's lifecycle, when it might take a long time to load data or warm a cache, than during steady-state operation. This cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "startupProbe"?: StartupProbe
  /** Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false. */
  "stdin"?: boolean
  /** Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false */
  "stdinOnce"?: boolean
  /** Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated. */
  "terminationMessagePath"?: string
  /** Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated. */
  "terminationMessagePolicy"?: string
  /** Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false. */
  "tty"?: boolean
  /** volumeDevices is the list of block devices to be used by the container. */
  "volumeDevices"?: VolumeDevicesItem[]
  /** Pod volumes to mount into the container's filesystem. Cannot be updated. */
  "volumeMounts"?: VolumeMountsItem[]
  /** Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated. */
  "workingDir"?: string
}

export interface Limits {
  /** maxPerSilenceBytes defines the maximum size of an individual silence as stored on disk. This corresponds to the Alertmanager's `--silences.max-per-silence-bytes` flag. It requires Alertmanager >= v0.28.0. */
  "maxPerSilenceBytes"?: string
  /** maxSilences defines the maximum number active and pending silences. This corresponds to the Alertmanager's `--silences.max-silences` flag. It requires Alertmanager >= v0.28.0. */
  "maxSilences"?: number
}

export interface PersistentVolumeClaimRetentionPolicy {
  /** WhenDeleted specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is deleted. The default policy of `Retain` causes PVCs to not be affected by StatefulSet deletion. The `Delete` policy causes those PVCs to be deleted. */
  "whenDeleted"?: string
  /** WhenScaled specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is scaled down. The default policy of `Retain` causes PVCs to not be affected by a scaledown. The `Delete` policy causes the associated PVCs for any excess pods above the replica count to be deleted. */
  "whenScaled"?: string
}

export interface PodMetadata {
  /** annotations defines an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/ */
  "annotations"?: Record<string, unknown>
  /** labels define the map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/ */
  "labels"?: Record<string, unknown>
  /** name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/ */
  "name"?: string
}

export interface SysctlsItem {
  /** Name of a property to set */
  "name": string
  /** Value of a property to set */
  "value": string
}

export interface SecurityContext2 {
  /** appArmorProfile is the AppArmor options to use by the containers in this pod. Note that this field cannot be set when spec.os.name is windows. */
  "appArmorProfile"?: AppArmorProfile
  /** A special supplemental group that applies to all containers in a pod. Some volume types allow the Kubelet to change the ownership of that volume to be owned by the pod: 1. The owning GID will be the FSGroup 2. The setgid bit is set (new files created in the volume will be owned by FSGroup) 3. The permission bits are OR'd with rw-rw---- If unset, the Kubelet will not modify the ownership and permissions of any volume. Note that this field cannot be set when spec.os.name is windows. */
  "fsGroup"?: number
  /** fsGroupChangePolicy defines behavior of changing ownership and permission of the volume before being exposed inside Pod. This field will only apply to volume types which support fsGroup based ownership(and permissions). It will have no effect on ephemeral volume types such as: secret, configmaps and emptydir. Valid values are "OnRootMismatch" and "Always". If not specified, "Always" is used. Note that this field cannot be set when spec.os.name is windows. */
  "fsGroupChangePolicy"?: string
  /** The GID to run the entrypoint of the container process. Uses runtime default if unset. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows. */
  "runAsGroup"?: number
  /** Indicates that the container must run as a non-root user. If true, the Kubelet will validate the image at runtime to ensure that it does not run as UID 0 (root) and fail to start the container if it does. If unset or false, no such validation will be performed. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. */
  "runAsNonRoot"?: boolean
  /** The UID to run the entrypoint of the container process. Defaults to user specified in image metadata if unspecified. May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows. */
  "runAsUser"?: number
  /** seLinuxChangePolicy defines how the container's SELinux label is applied to all volumes used by the Pod. It has no effect on nodes that do not support SELinux or to volumes does not support SELinux. Valid values are "MountOption" and "Recursive". "Recursive" means relabeling of all files on all Pod volumes by the container runtime. This may be slow for large volumes, but allows mixing privileged and unprivileged Pods sharing the same volume on the same node. "MountOption" mounts all eligible Pod volumes with `-o context` mount option. This requires all Pods that share the same volume to use the same SELinux label. It is not possible to share the same volume among privileged and unprivileged Pods. Eligible volumes are in-tree FibreChannel and iSCSI volumes, and all CSI volumes whose CSI driver announces SELinux support by setting spec.seLinuxMount: true in their CSIDriver instance. Other volumes are always re-labelled recursively. "MountOption" value is allowed only when SELinuxMount feature gate is enabled. If not specified and SELinuxMount feature gate is enabled, "MountOption" is used. If not specified and SELinuxMount feature gate is disabled, "MountOption" is used for ReadWriteOncePod volumes and "Recursive" for all other volumes. This field affects only Pods that have SELinux label set, either in PodSecurityContext or in SecurityContext of all containers. All Pods that use the same volume should use the same seLinuxChangePolicy, otherwise some pods can get stuck in ContainerCreating state. Note that this field cannot be set when spec.os.name is windows. */
  "seLinuxChangePolicy"?: string
  /** The SELinux context to be applied to all containers. If unspecified, the container runtime will allocate a random SELinux context for each container.  May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows. */
  "seLinuxOptions"?: SeLinuxOptions
  /** The seccomp options to use by the containers in this pod. Note that this field cannot be set when spec.os.name is windows. */
  "seccompProfile"?: SeccompProfile
  /** A list of groups applied to the first process run in each container, in addition to the container's primary GID and fsGroup (if specified).  If the SupplementalGroupsPolicy feature is enabled, the supplementalGroupsPolicy field determines whether these are in addition to or instead of any group memberships defined in the container image. If unspecified, no additional groups are added, though group memberships defined in the container image may still be used, depending on the supplementalGroupsPolicy field. Note that this field cannot be set when spec.os.name is windows. */
  "supplementalGroups"?: number[]
  /** Defines how supplemental groups of the first container processes are calculated. Valid values are "Merge" and "Strict". If not specified, "Merge" is used. (Alpha) Using the field requires the SupplementalGroupsPolicy feature gate to be enabled and the container runtime must implement support for this feature. Note that this field cannot be set when spec.os.name is windows. */
  "supplementalGroupsPolicy"?: string
  /** Sysctls hold a list of namespaced sysctls used for the pod. Pods with unsupported sysctls (by the container runtime) might fail to launch. Note that this field cannot be set when spec.os.name is windows. */
  "sysctls"?: SysctlsItem[]
  /** The Windows specific settings applied to all containers. If unspecified, the options within a container's SecurityContext will be used. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is linux. */
  "windowsOptions"?: WindowsOptions
}

export interface EmptyDir {
  /** medium represents what type of storage medium should back this directory. The default is "" which means to use the node's default medium. Must be an empty string (default) or Memory. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "medium"?: string
  /** sizeLimit is the total amount of local storage required for this EmptyDir volume. The size limit is also applicable for memory medium. The maximum usage on memory medium EmptyDir would be the minimum value between the SizeLimit specified here and the sum of memory limits of all containers in a pod. The default is nil which means that the limit is undefined. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "sizeLimit"?: number | string
}

export interface DataSource {
  /** APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. */
  "apiGroup"?: string
  /** Kind is the type of resource being referenced */
  "kind": string
  /** Name is the name of resource being referenced */
  "name": string
}

export interface DataSourceRef {
  /** APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. */
  "apiGroup"?: string
  /** Kind is the type of resource being referenced */
  "kind": string
  /** Name is the name of resource being referenced */
  "name": string
  /** Namespace is the namespace of resource being referenced Note that when a namespace is specified, a gateway.networking.k8s.io/ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. (Alpha) This field requires the CrossNamespaceVolumeDataSource feature gate to be enabled. */
  "namespace"?: string
}

export interface Resources2 {
  /** Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "limits"?: Record<string, unknown>
  /** Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "requests"?: Record<string, unknown>
}

export interface Selector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface Spec {
  /** accessModes contains the desired access modes the volume should have. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1 */
  "accessModes"?: string[]
  /** dataSource field can be used to specify either: * An existing VolumeSnapshot object (snapshot.storage.k8s.io/VolumeSnapshot) * An existing PVC (PersistentVolumeClaim) If the provisioner or an external controller can support the specified data source, it will create a new volume based on the contents of the specified data source. When the AnyVolumeDataSource feature gate is enabled, dataSource contents will be copied to dataSourceRef, and dataSourceRef contents will be copied to dataSource when dataSourceRef.namespace is not specified. If the namespace is specified, then dataSourceRef will not be copied to dataSource. */
  "dataSource"?: DataSource
  /** dataSourceRef specifies the object from which to populate the volume with data, if a non-empty volume is desired. This may be any object from a non-empty API group (non core object) or a PersistentVolumeClaim object. When this field is specified, volume binding will only succeed if the type of the specified object matches some installed volume populator or dynamic provisioner. This field will replace the functionality of the dataSource field and as such if both fields are non-empty, they must have the same value. For backwards compatibility, when namespace isn't specified in dataSourceRef, both fields (dataSource and dataSourceRef) will be set to the same value automatically if one of them is empty and the other is non-empty. When namespace is specified in dataSourceRef, dataSource isn't set to the same value and must be empty. There are three important differences between dataSource and dataSourceRef: * While dataSource only allows two specific types of objects, dataSourceRef   allows any non-core object, as well as PersistentVolumeClaim objects. * While dataSource ignores disallowed values (dropping them), dataSourceRef   preserves all values, and generates an error if a disallowed value is   specified. * While dataSource only allows local objects, dataSourceRef allows objects   in any namespaces. (Beta) Using this field requires the AnyVolumeDataSource feature gate to be enabled. (Alpha) Using the namespace field of dataSourceRef requires the CrossNamespaceVolumeDataSource feature gate to be enabled. */
  "dataSourceRef"?: DataSourceRef
  /** resources represents the minimum resources the volume should have. Users are allowed to specify resource requirements that are lower than previous value but must still be higher than capacity recorded in the status field of the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#resources */
  "resources"?: Resources2
  /** selector is a label query over volumes to consider for binding. */
  "selector"?: Selector
  /** storageClassName is the name of the StorageClass required by the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1 */
  "storageClassName"?: string
  /** volumeAttributesClassName may be used to set the VolumeAttributesClass used by this claim. If specified, the CSI driver will create or update the volume with the attributes defined in the corresponding VolumeAttributesClass. This has a different purpose than storageClassName, it can be changed after the claim is created. An empty string or nil value indicates that no VolumeAttributesClass will be applied to the claim. If the claim enters an Infeasible error state, this field can be reset to its previous value (including nil) to cancel the modification. If the resource referred to by volumeAttributesClass does not exist, this PersistentVolumeClaim will be set to a Pending state, as reflected by the modifyVolumeStatus field, until such as a resource exists. More info: https://kubernetes.io/docs/concepts/storage/volume-attributes-classes/ */
  "volumeAttributesClassName"?: string
  /** volumeMode defines what type of volume is required by the claim. Value of Filesystem is implied when not included in claim spec. */
  "volumeMode"?: string
  /** volumeName is the binding reference to the PersistentVolume backing this claim. */
  "volumeName"?: string
}

export interface VolumeClaimTemplate {
  /** May contain labels and annotations that will be copied into the PVC when creating it. No other fields are allowed and will be rejected during validation. */
  "metadata"?: Record<string, unknown>
  /** The specification for the PersistentVolumeClaim. The entire content is copied unchanged into the PVC that gets created from this template. The same fields as in a PersistentVolumeClaim are also valid here. */
  "spec": Spec
}

export interface Ephemeral {
  /** Will be used to create a stand-alone PVC to provision the volume. The pod in which this EphemeralVolumeSource is embedded will be the owner of the PVC, i.e. the PVC will be deleted together with the pod.  The name of the PVC will be `<pod name>-<volume name>` where `<volume name>` is the name from the `PodSpec.Volumes` array entry. Pod validation will reject the pod if the concatenated name is not valid for a PVC (for example, too long). An existing PVC with that name that is not owned by the pod will *not* be used for the pod to avoid using an unrelated volume by mistake. Starting the pod is then blocked until the unrelated PVC is removed. If such a pre-created PVC is meant to be used by the pod, the PVC has to updated with an owner reference to the pod once the pod exists. Normally this should not be necessary, but it may be useful when manually reconstructing a broken cluster. This field is read-only and no changes will be made by Kubernetes to the PVC after it has been created. Required, must not be nil. */
  "volumeClaimTemplate"?: VolumeClaimTemplate
}

export interface Metadata {
  /** annotations defines an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/ */
  "annotations"?: Record<string, unknown>
  /** labels define the map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/ */
  "labels"?: Record<string, unknown>
  /** name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/ */
  "name"?: string
}

export interface ConditionsItem {
  /** lastProbeTime is the time we probed the condition. */
  "lastProbeTime"?: string
  /** lastTransitionTime is the time the condition transitioned from one status to another. */
  "lastTransitionTime"?: string
  /** message is the human-readable message indicating details about last transition. */
  "message"?: string
  /** reason is a unique, this should be a short, machine understandable string that gives the reason for condition's last transition. If it reports "Resizing" that means the underlying persistent volume is being resized. */
  "reason"?: string
  /** Status is the status of the condition. Can be True, False, Unknown. More info: https://kubernetes.io/docs/reference/kubernetes-api/config-and-storage-resources/persistent-volume-claim-v1/#:~:text=state%20of%20pvc-,conditions.status,-(string)%2C%20required */
  "status": string
  /** Type is the type of the condition. More info: https://kubernetes.io/docs/reference/kubernetes-api/config-and-storage-resources/persistent-volume-claim-v1/#:~:text=set%20to%20%27ResizeStarted%27.-,PersistentVolumeClaimCondition,-contains%20details%20about */
  "type": string
}

export interface ModifyVolumeStatus {
  /** status is the status of the ControllerModifyVolume operation. It can be in any of following states:  - Pending    Pending indicates that the PersistentVolumeClaim cannot be modified due to unmet requirements, such as    the specified VolumeAttributesClass not existing.  - InProgress    InProgress indicates that the volume is being modified.  - Infeasible   Infeasible indicates that the request has been rejected as invalid by the CSI driver. To 	  resolve the error, a valid VolumeAttributesClass needs to be specified. Note: New statuses can be added in the future. Consumers should check for unknown statuses and fail appropriately. */
  "status": string
  /** targetVolumeAttributesClassName is the name of the VolumeAttributesClass the PVC currently being reconciled */
  "targetVolumeAttributesClassName"?: string
}

export interface Status {
  /** accessModes contains the actual access modes the volume backing the PVC has. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1 */
  "accessModes"?: string[]
  /** allocatedResourceStatuses stores status of resource being resized for the given PVC. Key names follow standard Kubernetes label syntax. Valid values are either: 	* Un-prefixed keys: 		- storage - the capacity of the volume. 	* Custom resources must use implementation-defined prefixed names such as "example.com/my-custom-resource" Apart from above values - keys that are unprefixed or have kubernetes.io prefix are considered reserved and hence may not be used. ClaimResourceStatus can be in any of following states: 	- ControllerResizeInProgress: 		State set when resize controller starts resizing the volume in control-plane. 	- ControllerResizeFailed: 		State set when resize has failed in resize controller with a terminal error. 	- NodeResizePending: 		State set when resize controller has finished resizing the volume but further resizing of 		volume is needed on the node. 	- NodeResizeInProgress: 		State set when kubelet starts resizing the volume. 	- NodeResizeFailed: 		State set when resizing has failed in kubelet with a terminal error. Transient errors don't set 		NodeResizeFailed. For example: if expanding a PVC for more capacity - this field can be one of the following states: 	- pvc.status.allocatedResourceStatus['storage'] = "ControllerResizeInProgress"      - pvc.status.allocatedResourceStatus['storage'] = "ControllerResizeFailed"      - pvc.status.allocatedResourceStatus['storage'] = "NodeResizePending"      - pvc.status.allocatedResourceStatus['storage'] = "NodeResizeInProgress"      - pvc.status.allocatedResourceStatus['storage'] = "NodeResizeFailed" When this field is not set, it means that no resize operation is in progress for the given PVC. A controller that receives PVC update with previously unknown resourceName or ClaimResourceStatus should ignore the update for the purpose it was designed. For example - a controller that only is responsible for resizing capacity of the volume, should ignore PVC updates that change other valid resources associated with PVC. */
  "allocatedResourceStatuses"?: Record<string, unknown>
  /** allocatedResources tracks the resources allocated to a PVC including its capacity. Key names follow standard Kubernetes label syntax. Valid values are either: 	* Un-prefixed keys: 		- storage - the capacity of the volume. 	* Custom resources must use implementation-defined prefixed names such as "example.com/my-custom-resource" Apart from above values - keys that are unprefixed or have kubernetes.io prefix are considered reserved and hence may not be used. Capacity reported here may be larger than the actual capacity when a volume expansion operation is requested. For storage quota, the larger value from allocatedResources and PVC.spec.resources is used. If allocatedResources is not set, PVC.spec.resources alone is used for quota calculation. If a volume expansion capacity request is lowered, allocatedResources is only lowered if there are no expansion operations in progress and if the actual volume capacity is equal or lower than the requested capacity. A controller that receives PVC update with previously unknown resourceName should ignore the update for the purpose it was designed. For example - a controller that only is responsible for resizing capacity of the volume, should ignore PVC updates that change other valid resources associated with PVC. */
  "allocatedResources"?: Record<string, unknown>
  /** capacity represents the actual resources of the underlying volume. */
  "capacity"?: Record<string, unknown>
  /** conditions is the current Condition of persistent volume claim. If underlying persistent volume is being resized then the Condition will be set to 'Resizing'. */
  "conditions"?: ConditionsItem[]
  /** currentVolumeAttributesClassName is the current name of the VolumeAttributesClass the PVC is using. When unset, there is no VolumeAttributeClass applied to this PersistentVolumeClaim */
  "currentVolumeAttributesClassName"?: string
  /** ModifyVolumeStatus represents the status object of ControllerModifyVolume operation. When this is unset, there is no ModifyVolume operation being attempted. */
  "modifyVolumeStatus"?: ModifyVolumeStatus
  /** phase represents the current phase of PersistentVolumeClaim. */
  "phase"?: string
}

export interface VolumeClaimTemplate2 {
  /** APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources */
  "apiVersion"?: string
  /** Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds */
  "kind"?: string
  /** metadata defines EmbeddedMetadata contains metadata relevant to an EmbeddedResource. */
  "metadata"?: Metadata
  /** spec defines the specification of the  characteristics of a volume requested by a pod author. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "spec"?: Spec
  /** status is deprecated: this field is never set. */
  "status"?: Status
}

export interface Storage {
  /** disableMountSubPath deprecated: subPath usage will be removed in a future release. */
  "disableMountSubPath"?: boolean
  /** emptyDir to be used by the StatefulSet. If specified, it takes precedence over `ephemeral` and `volumeClaimTemplate`. More info: https://kubernetes.io/docs/concepts/storage/volumes/#emptydir */
  "emptyDir"?: EmptyDir
  /** ephemeral to be used by the StatefulSet. This is a beta field in k8s 1.21 and GA in 1.15. For lower versions, starting with k8s 1.19, it requires enabling the GenericEphemeralVolume feature gate. More info: https://kubernetes.io/docs/concepts/storage/ephemeral-volumes/#generic-ephemeral-volumes */
  "ephemeral"?: Ephemeral
  /** volumeClaimTemplate defines the PVC spec to be used by the Prometheus StatefulSets. The easiest way to use a volume that cannot be automatically provisioned is to use a label selector alongside manually created PersistentVolumes. */
  "volumeClaimTemplate"?: VolumeClaimTemplate2
}

export interface TolerationsItem {
  /** Effect indicates the taint effect to match. Empty means match all taint effects. When specified, allowed values are NoSchedule, PreferNoSchedule and NoExecute. */
  "effect"?: string
  /** Key is the taint key that the toleration applies to. Empty means match all taint keys. If the key is empty, operator must be Exists; this combination means to match all values and all keys. */
  "key"?: string
  /** Operator represents a key's relationship to the value. Valid operators are Exists, Equal, Lt, and Gt. Defaults to Equal. Exists is equivalent to wildcard for value, so that a pod can tolerate all taints of a particular category. Lt and Gt perform numeric comparisons (requires feature gate TaintTolerationComparisonOperators). */
  "operator"?: string
  /** TolerationSeconds represents the period of time the toleration (which must be of effect NoExecute, otherwise this field is ignored) tolerates the taint. By default, it is not set, which means tolerate the taint forever (do not evict). Zero and negative values will be treated as 0 (evict immediately) by the system. */
  "tolerationSeconds"?: number
  /** Value is the taint value the toleration matches to. If the operator is Exists, the value should be empty, otherwise just a regular string. */
  "value"?: string
}

export interface TopologySpreadConstraintsItem {
  /** LabelSelector is used to find matching pods. Pods that match this label selector are counted to determine the number of pods in their corresponding topology domain. */
  "labelSelector"?: LabelSelector
  /** MatchLabelKeys is a set of pod label keys to select the pods over which spreading will be calculated. The keys are used to lookup values from the incoming pod labels, those key-value labels are ANDed with labelSelector to select the group of existing pods over which spreading will be calculated for the incoming pod. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. MatchLabelKeys cannot be set when LabelSelector isn't set. Keys that don't exist in the incoming pod labels will be ignored. A null or empty list means only match against labelSelector. This is a beta field and requires the MatchLabelKeysInPodTopologySpread feature gate to be enabled (enabled by default). */
  "matchLabelKeys"?: string[]
  /** MaxSkew describes the degree to which pods may be unevenly distributed. When `whenUnsatisfiable=DoNotSchedule`, it is the maximum permitted difference between the number of matching pods in the target topology and the global minimum. The global minimum is the minimum number of matching pods in an eligible domain or zero if the number of eligible domains is less than MinDomains. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 2/2/1: In this case, the global minimum is 1. | zone1 | zone2 | zone3 | |  P P  |  P P  |   P   | - if MaxSkew is 1, incoming pod can only be scheduled to zone3 to become 2/2/2; scheduling it onto zone1(zone2) would make the ActualSkew(3-1) on zone1(zone2) violate MaxSkew(1). - if MaxSkew is 2, incoming pod can be scheduled onto any zone. When `whenUnsatisfiable=ScheduleAnyway`, it is used to give higher precedence to topologies that satisfy it. It's a required field. Default value is 1 and 0 is not allowed. */
  "maxSkew": number
  /** MinDomains indicates a minimum number of eligible domains. When the number of eligible domains with matching topology keys is less than minDomains, Pod Topology Spread treats "global minimum" as 0, and then the calculation of Skew is performed. And when the number of eligible domains with matching topology keys equals or greater than minDomains, this value has no effect on scheduling. As a result, when the number of eligible domains is less than minDomains, scheduler won't schedule more than maxSkew Pods to those domains. If value is nil, the constraint behaves as if MinDomains is equal to 1. Valid values are integers greater than 0. When value is not nil, WhenUnsatisfiable must be DoNotSchedule. For example, in a 3-zone cluster, MaxSkew is set to 2, MinDomains is set to 5 and pods with the same labelSelector spread as 2/2/2: | zone1 | zone2 | zone3 | |  P P  |  P P  |  P P  | The number of domains is less than 5(MinDomains), so "global minimum" is treated as 0. In this situation, new pod with the same labelSelector cannot be scheduled, because computed skew will be 3(3 - 0) if new Pod is scheduled to any of the three zones, it will violate MaxSkew. */
  "minDomains"?: number
  /** NodeAffinityPolicy indicates how we will treat Pod's nodeAffinity/nodeSelector when calculating pod topology spread skew. Options are: - Honor: only nodes matching nodeAffinity/nodeSelector are included in the calculations. - Ignore: nodeAffinity/nodeSelector are ignored. All nodes are included in the calculations. If this value is nil, the behavior is equivalent to the Honor policy. */
  "nodeAffinityPolicy"?: string
  /** NodeTaintsPolicy indicates how we will treat node taints when calculating pod topology spread skew. Options are: - Honor: nodes without taints, along with tainted nodes for which the incoming pod has a toleration, are included. - Ignore: node taints are ignored. All nodes are included. If this value is nil, the behavior is equivalent to the Ignore policy. */
  "nodeTaintsPolicy"?: string
  /** TopologyKey is the key of node labels. Nodes that have a label with this key and identical values are considered to be in the same topology. We consider each <key, value> as a "bucket", and try to put balanced number of pods into each bucket. We define a domain as a particular instance of a topology. Also, we define an eligible domain as a domain whose nodes meet the requirements of nodeAffinityPolicy and nodeTaintsPolicy. e.g. If TopologyKey is "kubernetes.io/hostname", each Node is a domain of that topology. And, if TopologyKey is "topology.kubernetes.io/zone", each zone is a domain of that topology. It's a required field. */
  "topologyKey": string
  /** WhenUnsatisfiable indicates how to deal with a pod if it doesn't satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,   but giving higher precedence to topologies that would help reduce the   skew. A constraint is considered "Unsatisfiable" for an incoming pod if and only if every possible node assignment for that pod would violate "MaxSkew" on some topology. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 3/1/1: | zone1 | zone2 | zone3 | | P P P |   P   |   P   | If WhenUnsatisfiable is set to DoNotSchedule, incoming pod can only be scheduled to zone2(zone3) to become 3/2/1(3/1/2) as ActualSkew(2-1) on zone2(zone3) satisfies MaxSkew(1). In other words, the cluster can still be imbalanced, but scheduler won't make it *more* imbalanced. It's a required field. */
  "whenUnsatisfiable": string
}

export interface RollingUpdate {
  /** maxUnavailable is the maximum number of pods that can be unavailable during the update. The value can be an absolute number (ex: 5) or a percentage of desired pods (ex: 10%). Absolute number is calculated from percentage by rounding up. This can not be 0.  Defaults to 1. This field is alpha-level and is only honored by servers that enable the MaxUnavailableStatefulSet feature. The field applies to all pods in the range 0 to Replicas-1.  That means if there is any unavailable pod in the range 0 to Replicas-1, it will be counted towards MaxUnavailable. */
  "maxUnavailable"?: number | string
}

export interface UpdateStrategy {
  /** rollingUpdate is used to communicate parameters when type is RollingUpdate. */
  "rollingUpdate"?: RollingUpdate
  /** type indicates the type of the StatefulSetUpdateStrategy. Default is RollingUpdate. */
  "type": "OnDelete" | "RollingUpdate"
}

export interface AwsElasticBlockStore {
  /** fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore */
  "fsType"?: string
  /** partition is the partition in the volume that you want to mount. If omitted, the default is to mount by volume name. Examples: For volume /dev/sda1, you specify the partition as "1". Similarly, the volume partition for /dev/sda is "0" (or you can leave the property empty). */
  "partition"?: number
  /** readOnly value true will force the readOnly setting in VolumeMounts. More info: https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore */
  "readOnly"?: boolean
  /** volumeID is unique ID of the persistent disk resource in AWS (Amazon EBS volume). More info: https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore */
  "volumeID": string
}

export interface AzureDisk {
  /** cachingMode is the Host Caching mode: None, Read Only, Read Write. */
  "cachingMode"?: string
  /** diskName is the Name of the data disk in the blob storage */
  "diskName": string
  /** diskURI is the URI of data disk in the blob storage */
  "diskURI": string
  /** fsType is Filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** kind expected values are Shared: multiple blob disks per storage account  Dedicated: single blob disk per storage account  Managed: azure managed data disk (only in managed availability set). defaults to shared */
  "kind"?: string
  /** readOnly Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
}

export interface AzureFile {
  /** readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** secretName is the  name of secret that contains Azure Storage Account Name and Key */
  "secretName": string
  /** shareName is the azure share Name */
  "shareName": string
}

export interface SecretRef2 {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
}

export interface Cephfs {
  /** monitors is Required: Monitors is a collection of Ceph monitors More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it */
  "monitors": string[]
  /** path is Optional: Used as the mounted root, rather than the full Ceph tree, default is / */
  "path"?: string
  /** readOnly is Optional: Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it */
  "readOnly"?: boolean
  /** secretFile is Optional: SecretFile is the path to key ring for User, default is /etc/ceph/user.secret More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it */
  "secretFile"?: string
  /** secretRef is Optional: SecretRef is reference to the authentication secret for User, default is empty. More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it */
  "secretRef"?: SecretRef2
  /** user is optional: User is the rados user name, default is admin More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it */
  "user"?: string
}

export interface Cinder {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "fsType"?: string
  /** readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "readOnly"?: boolean
  /** secretRef is optional: points to a secret object containing parameters used to connect to OpenStack. */
  "secretRef"?: SecretRef2
  /** volumeID used to identify the volume in cinder. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "volumeID": string
}

export interface ItemsItem {
  /** key is the key to project. */
  "key": string
  /** mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "mode"?: number
  /** path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. */
  "path": string
}

export interface ConfigMap2 {
  /** defaultMode is optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** optional specify whether the ConfigMap or its keys must be defined */
  "optional"?: boolean
}

export interface NodePublishSecretRef {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
}

export interface Csi {
  /** driver is the name of the CSI driver that handles this volume. Consult with your admin for the correct name as registered in the cluster. */
  "driver": string
  /** fsType to mount. Ex. "ext4", "xfs", "ntfs". If not provided, the empty value is passed to the associated CSI driver which will determine the default filesystem to apply. */
  "fsType"?: string
  /** nodePublishSecretRef is a reference to the secret object containing sensitive information to pass to the CSI driver to complete the CSI NodePublishVolume and NodeUnpublishVolume calls. This field is optional, and  may be empty if no secret is required. If the secret object contains more than one secret, all secret references are passed. */
  "nodePublishSecretRef"?: NodePublishSecretRef
  /** readOnly specifies a read-only configuration for the volume. Defaults to false (read/write). */
  "readOnly"?: boolean
  /** volumeAttributes stores driver-specific properties that are passed to the CSI driver. Consult your driver's documentation for supported values. */
  "volumeAttributes"?: Record<string, unknown>
}

export interface ItemsItem2 {
  /** Required: Selects a field of the pod: only annotations, labels, name, namespace and uid are supported. */
  "fieldRef"?: FieldRef
  /** Optional: mode bits used to set permissions on this file, must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "mode"?: number
  /** Required: Path is  the relative path name of the file to be created. Must not be absolute or contain the '..' path. Must be utf-8 encoded. The first item of the relative path must not start with '..' */
  "path": string
  /** Selects a resource of the container: only resources limits and requests (limits.cpu, limits.memory, requests.cpu and requests.memory) are currently supported. */
  "resourceFieldRef"?: ResourceFieldRef
}

export interface DownwardAPI {
  /** Optional: mode bits to use on created files by default. Must be a Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** Items is a list of downward API volume file */
  "items"?: ItemsItem2[]
}

export interface Fc {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** lun is Optional: FC target lun number */
  "lun"?: number
  /** readOnly is Optional: Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** targetWWNs is Optional: FC target worldwide names (WWNs) */
  "targetWWNs"?: string[]
  /** wwids Optional: FC volume world wide identifiers (wwids) Either wwids or combination of targetWWNs and lun must be set, but not both simultaneously. */
  "wwids"?: string[]
}

export interface FlexVolume {
  /** driver is the name of the driver to use for this volume. */
  "driver": string
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". The default filesystem depends on FlexVolume script. */
  "fsType"?: string
  /** options is Optional: this field holds extra command options if any. */
  "options"?: Record<string, unknown>
  /** readOnly is Optional: defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** secretRef is Optional: secretRef is reference to the secret object containing sensitive information to pass to the plugin scripts. This may be empty if no secret object is specified. If the secret object contains more than one secret, all secrets are passed to the plugin scripts. */
  "secretRef"?: SecretRef2
}

export interface Flocker {
  /** datasetName is Name of the dataset stored as metadata -> name on the dataset for Flocker should be considered as deprecated */
  "datasetName"?: string
  /** datasetUUID is the UUID of the dataset. This is unique identifier of a Flocker dataset */
  "datasetUUID"?: string
}

export interface GcePersistentDisk {
  /** fsType is filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk */
  "fsType"?: string
  /** partition is the partition in the volume that you want to mount. If omitted, the default is to mount by volume name. Examples: For volume /dev/sda1, you specify the partition as "1". Similarly, the volume partition for /dev/sda is "0" (or you can leave the property empty). More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk */
  "partition"?: number
  /** pdName is unique name of the PD resource in GCE. Used to identify the disk in GCE. More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk */
  "pdName": string
  /** readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk */
  "readOnly"?: boolean
}

export interface GitRepo {
  /** directory is the target directory name. Must not contain or start with '..'.  If '.' is supplied, the volume directory will be the git repository.  Otherwise, if specified, the volume will contain the git repository in the subdirectory with the given name. */
  "directory"?: string
  /** repository is the URL */
  "repository": string
  /** revision is the commit hash for the specified revision. */
  "revision"?: string
}

export interface Glusterfs {
  /** endpoints is the endpoint name that details Glusterfs topology. */
  "endpoints": string
  /** path is the Glusterfs volume path. More info: https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod */
  "path": string
  /** readOnly here will force the Glusterfs volume to be mounted with read-only permissions. Defaults to false. More info: https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod */
  "readOnly"?: boolean
}

export interface HostPath {
  /** path of the directory on the host. If the path is a symlink, it will follow the link to the real path. More info: https://kubernetes.io/docs/concepts/storage/volumes#hostpath */
  "path": string
  /** type for HostPath Volume Defaults to "" More info: https://kubernetes.io/docs/concepts/storage/volumes#hostpath */
  "type"?: string
}

export interface Image {
  /** Policy for pulling OCI objects. Possible values are: Always: the kubelet always attempts to pull the reference. Container creation will fail If the pull fails. Never: the kubelet never pulls the reference and only uses a local image or artifact. Container creation will fail if the reference isn't present. IfNotPresent: the kubelet pulls if the reference isn't already present on disk. Container creation will fail if the reference isn't present and the pull fails. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. */
  "pullPolicy"?: string
  /** Required: Image or artifact reference to be used. Behaves in the same way as pod.spec.containers[*].image. Pull secrets will be assembled in the same way as for the container image by looking up node credentials, SA image pull secrets, and pod spec image pull secrets. More info: https://kubernetes.io/docs/concepts/containers/images This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. */
  "reference"?: string
}

export interface Iscsi {
  /** chapAuthDiscovery defines whether support iSCSI Discovery CHAP authentication */
  "chapAuthDiscovery"?: boolean
  /** chapAuthSession defines whether support iSCSI Session CHAP authentication */
  "chapAuthSession"?: boolean
  /** fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: https://kubernetes.io/docs/concepts/storage/volumes#iscsi */
  "fsType"?: string
  /** initiatorName is the custom iSCSI Initiator Name. If initiatorName is specified with iscsiInterface simultaneously, new iSCSI interface <target portal>:<volume name> will be created for the connection. */
  "initiatorName"?: string
  /** iqn is the target iSCSI Qualified Name. */
  "iqn": string
  /** iscsiInterface is the interface Name that uses an iSCSI transport. Defaults to 'default' (tcp). */
  "iscsiInterface"?: string
  /** lun represents iSCSI Target Lun number. */
  "lun": number
  /** portals is the iSCSI Target Portal List. The portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260). */
  "portals"?: string[]
  /** readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. */
  "readOnly"?: boolean
  /** secretRef is the CHAP Secret for iSCSI target and initiator authentication */
  "secretRef"?: SecretRef2
  /** targetPortal is iSCSI Target Portal. The Portal is either an IP or ip_addr:port if the port is other than default (typically TCP ports 860 and 3260). */
  "targetPortal": string
}

export interface Nfs {
  /** path that is exported by the NFS server. More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs */
  "path": string
  /** readOnly here will force the NFS export to be mounted with read-only permissions. Defaults to false. More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs */
  "readOnly"?: boolean
  /** server is the hostname or IP address of the NFS server. More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs */
  "server": string
}

export interface PersistentVolumeClaim {
  /** claimName is the name of a PersistentVolumeClaim in the same namespace as the pod using this volume. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "claimName": string
  /** readOnly Will force the ReadOnly setting in VolumeMounts. Default false. */
  "readOnly"?: boolean
}

export interface PhotonPersistentDisk {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** pdID is the ID that identifies Photon Controller persistent disk */
  "pdID": string
}

export interface PortworxVolume {
  /** fSType represents the filesystem type to mount Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** volumeID uniquely identifies a Portworx volume */
  "volumeID": string
}

export interface ClusterTrustBundle {
  /** Select all ClusterTrustBundles that match this label selector.  Only has effect if signerName is set.  Mutually-exclusive with name.  If unset, interpreted as "match nothing".  If set but empty, interpreted as "match everything". */
  "labelSelector"?: LabelSelector
  /** Select a single ClusterTrustBundle by object name.  Mutually-exclusive with signerName and labelSelector. */
  "name"?: string
  /** If true, don't block pod startup if the referenced ClusterTrustBundle(s) aren't available.  If using name, then the named ClusterTrustBundle is allowed not to exist.  If using signerName, then the combination of signerName and labelSelector is allowed to match zero ClusterTrustBundles. */
  "optional"?: boolean
  /** Relative path from the volume root to write the bundle. */
  "path": string
  /** Select all ClusterTrustBundles that match this signer name. Mutually-exclusive with name.  The contents of all selected ClusterTrustBundles will be unified and deduplicated. */
  "signerName"?: string
}

export interface ConfigMap3 {
  /** items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** optional specify whether the ConfigMap or its keys must be defined */
  "optional"?: boolean
}

export interface DownwardAPI2 {
  /** Items is a list of DownwardAPIVolume file */
  "items"?: ItemsItem2[]
}

export interface PodCertificate {
  /** Write the certificate chain at this path in the projected volume. Most applications should use credentialBundlePath.  When using keyPath and certificateChainPath, your application needs to check that the key and leaf certificate are consistent, because it is possible to read the files mid-rotation. */
  "certificateChainPath"?: string
  /** Write the credential bundle at this path in the projected volume. The credential bundle is a single file that contains multiple PEM blocks. The first PEM block is a PRIVATE KEY block, containing a PKCS#8 private key. The remaining blocks are CERTIFICATE blocks, containing the issued certificate chain from the signer (leaf and any intermediates). Using credentialBundlePath lets your Pod's application code make a single atomic read that retrieves a consistent key and certificate chain.  If you project them to separate files, your application code will need to additionally check that the leaf certificate was issued to the key. */
  "credentialBundlePath"?: string
  /** Write the key at this path in the projected volume. Most applications should use credentialBundlePath.  When using keyPath and certificateChainPath, your application needs to check that the key and leaf certificate are consistent, because it is possible to read the files mid-rotation. */
  "keyPath"?: string
  /** The type of keypair Kubelet will generate for the pod. Valid values are "RSA3072", "RSA4096", "ECDSAP256", "ECDSAP384", "ECDSAP521", and "ED25519". */
  "keyType": string
  /** maxExpirationSeconds is the maximum lifetime permitted for the certificate. Kubelet copies this value verbatim into the PodCertificateRequests it generates for this projection. If omitted, kube-apiserver will set it to 86400(24 hours). kube-apiserver will reject values shorter than 3600 (1 hour).  The maximum allowable value is 7862400 (91 days). The signer implementation is then free to issue a certificate with any lifetime *shorter* than MaxExpirationSeconds, but no shorter than 3600 seconds (1 hour).  This constraint is enforced by kube-apiserver. `kubernetes.io` signers will never issue certificates with a lifetime longer than 24 hours. */
  "maxExpirationSeconds"?: number
  /** Kubelet's generated CSRs will be addressed to this signer. */
  "signerName": string
  /** userAnnotations allow pod authors to pass additional information to the signer implementation.  Kubernetes does not restrict or validate this metadata in any way. These values are copied verbatim into the `spec.unverifiedUserAnnotations` field of the PodCertificateRequest objects that Kubelet creates. Entries are subject to the same validation as object metadata annotations, with the addition that all keys must be domain-prefixed. No restrictions are placed on values, except an overall size limitation on the entire field. Signers should document the keys and values they support. Signers should deny requests that contain keys they do not recognize. */
  "userAnnotations"?: Record<string, unknown>
}

export interface Secret2 {
  /** items if unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** optional field specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ServiceAccountToken {
  /** audience is the intended audience of the token. A recipient of a token must identify itself with an identifier specified in the audience of the token, and otherwise should reject the token. The audience defaults to the identifier of the apiserver. */
  "audience"?: string
  /** expirationSeconds is the requested duration of validity of the service account token. As the token approaches expiration, the kubelet volume plugin will proactively rotate the service account token. The kubelet will start trying to rotate the token if the token is older than 80 percent of its time to live or if the token is older than 24 hours.Defaults to 1 hour and must be at least 10 minutes. */
  "expirationSeconds"?: number
  /** path is the path relative to the mount point of the file to project the token into. */
  "path": string
}

export interface SourcesItem {
  /** ClusterTrustBundle allows a pod to access the `.spec.trustBundle` field of ClusterTrustBundle objects in an auto-updating file. Alpha, gated by the ClusterTrustBundleProjection feature gate. ClusterTrustBundle objects can either be selected by name, or by the combination of signer name and a label selector. Kubelet performs aggressive normalization of the PEM contents written into the pod filesystem.  Esoteric PEM features such as inter-block comments and block headers are stripped.  Certificates are deduplicated. The ordering of certificates within the file is arbitrary, and Kubelet may change the order over time. */
  "clusterTrustBundle"?: ClusterTrustBundle
  /** configMap information about the configMap data to project */
  "configMap"?: ConfigMap3
  /** downwardAPI information about the downwardAPI data to project */
  "downwardAPI"?: DownwardAPI2
  /** Projects an auto-rotating credential bundle (private key and certificate chain) that the pod can use either as a TLS client or server. Kubelet generates a private key and uses it to send a PodCertificateRequest to the named signer.  Once the signer approves the request and issues a certificate chain, Kubelet writes the key and certificate chain to the pod filesystem.  The pod does not start until certificates have been issued for each podCertificate projected volume source in its spec. Kubelet will begin trying to rotate the certificate at the time indicated by the signer using the PodCertificateRequest.Status.BeginRefreshAt timestamp. Kubelet can write a single file, indicated by the credentialBundlePath field, or separate files, indicated by the keyPath and certificateChainPath fields. The credential bundle is a single file in PEM format.  The first PEM entry is the private key (in PKCS#8 format), and the remaining PEM entries are the certificate chain issued by the signer (typically, signers will return their certificate chain in leaf-to-root order). Prefer using the credential bundle format, since your application code can read it atomically.  If you use keyPath and certificateChainPath, your application must make two separate file reads. If these coincide with a certificate rotation, it is possible that the private key and leaf certificate you read may not correspond to each other.  Your application will need to check for this condition, and re-read until they are consistent. The named signer controls chooses the format of the certificate it issues; consult the signer implementation's documentation to learn how to use the certificates it issues. */
  "podCertificate"?: PodCertificate
  /** secret information about the secret data to project */
  "secret"?: Secret2
  /** serviceAccountToken is information about the serviceAccountToken data to project */
  "serviceAccountToken"?: ServiceAccountToken
}

export interface Projected {
  /** defaultMode are the mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** sources is the list of volume projections. Each entry in this list handles one source. */
  "sources"?: SourcesItem[]
}

export interface Quobyte {
  /** group to map volume access to Default is no group */
  "group"?: string
  /** readOnly here will force the Quobyte volume to be mounted with read-only permissions. Defaults to false. */
  "readOnly"?: boolean
  /** registry represents a single or multiple Quobyte Registry services specified as a string as host:port pair (multiple entries are separated with commas) which acts as the central registry for volumes */
  "registry": string
  /** tenant owning the given Quobyte volume in the Backend Used with dynamically provisioned Quobyte volumes, value is set by the plugin */
  "tenant"?: string
  /** user to map volume access to Defaults to serivceaccount user */
  "user"?: string
  /** volume is a string that references an already created Quobyte volume by name. */
  "volume": string
}

export interface Rbd {
  /** fsType is the filesystem type of the volume that you want to mount. Tip: Ensure that the filesystem type is supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: https://kubernetes.io/docs/concepts/storage/volumes#rbd */
  "fsType"?: string
  /** image is the rados image name. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "image": string
  /** keyring is the path to key ring for RBDUser. Default is /etc/ceph/keyring. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "keyring"?: string
  /** monitors is a collection of Ceph monitors. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "monitors": string[]
  /** pool is the rados pool name. Default is rbd. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "pool"?: string
  /** readOnly here will force the ReadOnly setting in VolumeMounts. Defaults to false. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "readOnly"?: boolean
  /** secretRef is name of the authentication secret for RBDUser. If provided overrides keyring. Default is nil. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "secretRef"?: SecretRef2
  /** user is the rados user name. Default is admin. More info: https://examples.k8s.io/volumes/rbd/README.md#how-to-use-it */
  "user"?: string
}

export interface ScaleIO {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Default is "xfs". */
  "fsType"?: string
  /** gateway is the host address of the ScaleIO API Gateway. */
  "gateway": string
  /** protectionDomain is the name of the ScaleIO Protection Domain for the configured storage. */
  "protectionDomain"?: string
  /** readOnly Defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** secretRef references to the secret for ScaleIO user and other sensitive information. If this is not provided, Login operation will fail. */
  "secretRef": SecretRef2
  /** sslEnabled Flag enable/disable SSL communication with Gateway, default false */
  "sslEnabled"?: boolean
  /** storageMode indicates whether the storage for a volume should be ThickProvisioned or ThinProvisioned. Default is ThinProvisioned. */
  "storageMode"?: string
  /** storagePool is the ScaleIO Storage Pool associated with the protection domain. */
  "storagePool"?: string
  /** system is the name of the storage system as configured in ScaleIO. */
  "system": string
  /** volumeName is the name of a volume already created in the ScaleIO system that is associated with this volume source. */
  "volumeName"?: string
}

export interface Secret3 {
  /** defaultMode is Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** items If unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** optional field specify whether the Secret or its keys must be defined */
  "optional"?: boolean
  /** secretName is the name of the secret in the pod's namespace to use. More info: https://kubernetes.io/docs/concepts/storage/volumes#secret */
  "secretName"?: string
}

export interface Storageos {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** secretRef specifies the secret to use for obtaining the StorageOS API credentials.  If not specified, default values will be attempted. */
  "secretRef"?: SecretRef2
  /** volumeName is the human-readable name of the StorageOS volume.  Volume names are only unique within a namespace. */
  "volumeName"?: string
  /** volumeNamespace specifies the scope of the volume within StorageOS.  If no namespace is specified then the Pod's namespace will be used.  This allows the Kubernetes name scoping to be mirrored within StorageOS for tighter integration. Set VolumeName to any name to override the default behaviour. Set to "default" if you are not using namespaces within StorageOS. Namespaces that do not pre-exist within StorageOS will be created. */
  "volumeNamespace"?: string
}

export interface VsphereVolume {
  /** fsType is filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** storagePolicyID is the storage Policy Based Management (SPBM) profile ID associated with the StoragePolicyName. */
  "storagePolicyID"?: string
  /** storagePolicyName is the storage Policy Based Management (SPBM) profile name. */
  "storagePolicyName"?: string
  /** volumePath is the path that identifies vSphere volume vmdk */
  "volumePath": string
}

export interface VolumesItem {
  /** awsElasticBlockStore represents an AWS Disk resource that is attached to a kubelet's host machine and then exposed to the pod. Deprecated: AWSElasticBlockStore is deprecated. All operations for the in-tree awsElasticBlockStore type are redirected to the ebs.csi.aws.com CSI driver. More info: https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore */
  "awsElasticBlockStore"?: AwsElasticBlockStore
  /** azureDisk represents an Azure Data Disk mount on the host and bind mount to the pod. Deprecated: AzureDisk is deprecated. All operations for the in-tree azureDisk type are redirected to the disk.csi.azure.com CSI driver. */
  "azureDisk"?: AzureDisk
  /** azureFile represents an Azure File Service mount on the host and bind mount to the pod. Deprecated: AzureFile is deprecated. All operations for the in-tree azureFile type are redirected to the file.csi.azure.com CSI driver. */
  "azureFile"?: AzureFile
  /** cephFS represents a Ceph FS mount on the host that shares a pod's lifetime. Deprecated: CephFS is deprecated and the in-tree cephfs type is no longer supported. */
  "cephfs"?: Cephfs
  /** cinder represents a cinder volume attached and mounted on kubelets host machine. Deprecated: Cinder is deprecated. All operations for the in-tree cinder type are redirected to the cinder.csi.openstack.org CSI driver. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "cinder"?: Cinder
  /** configMap represents a configMap that should populate this volume */
  "configMap"?: ConfigMap2
  /** csi (Container Storage Interface) represents ephemeral storage that is handled by certain external CSI drivers. */
  "csi"?: Csi
  /** downwardAPI represents downward API about the pod that should populate this volume */
  "downwardAPI"?: DownwardAPI
  /** emptyDir represents a temporary directory that shares a pod's lifetime. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "emptyDir"?: EmptyDir
  /** ephemeral represents a volume that is handled by a cluster storage driver. The volume's lifecycle is tied to the pod that defines it - it will be created before the pod starts, and deleted when the pod is removed. Use this if: a) the volume is only needed while the pod runs, b) features of normal volumes like restoring from snapshot or capacity    tracking are needed, c) the storage driver is specified through a storage class, and d) the storage driver supports dynamic volume provisioning through    a PersistentVolumeClaim (see EphemeralVolumeSource for more    information on the connection between this volume type    and PersistentVolumeClaim). Use PersistentVolumeClaim or one of the vendor-specific APIs for volumes that persist for longer than the lifecycle of an individual pod. Use CSI for light-weight local ephemeral volumes if the CSI driver is meant to be used that way - see the documentation of the driver for more information. A pod can use both types of ephemeral volumes and persistent volumes at the same time. */
  "ephemeral"?: Ephemeral
  /** fc represents a Fibre Channel resource that is attached to a kubelet's host machine and then exposed to the pod. */
  "fc"?: Fc
  /** flexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin. Deprecated: FlexVolume is deprecated. Consider using a CSIDriver instead. */
  "flexVolume"?: FlexVolume
  /** flocker represents a Flocker volume attached to a kubelet's host machine. This depends on the Flocker control service being running. Deprecated: Flocker is deprecated and the in-tree flocker type is no longer supported. */
  "flocker"?: Flocker
  /** gcePersistentDisk represents a GCE Disk resource that is attached to a kubelet's host machine and then exposed to the pod. Deprecated: GCEPersistentDisk is deprecated. All operations for the in-tree gcePersistentDisk type are redirected to the pd.csi.storage.gke.io CSI driver. More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk */
  "gcePersistentDisk"?: GcePersistentDisk
  /** gitRepo represents a git repository at a particular revision. Deprecated: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container. */
  "gitRepo"?: GitRepo
  /** glusterfs represents a Glusterfs mount on the host that shares a pod's lifetime. Deprecated: Glusterfs is deprecated and the in-tree glusterfs type is no longer supported. */
  "glusterfs"?: Glusterfs
  /** hostPath represents a pre-existing file or directory on the host machine that is directly exposed to the container. This is generally used for system agents or other privileged things that are allowed to see the host machine. Most containers will NOT need this. More info: https://kubernetes.io/docs/concepts/storage/volumes#hostpath */
  "hostPath"?: HostPath
  /** image represents an OCI object (a container image or artifact) pulled and mounted on the kubelet's host machine. The volume is resolved at pod startup depending on which PullPolicy value is provided: - Always: the kubelet always attempts to pull the reference. Container creation will fail If the pull fails. - Never: the kubelet never pulls the reference and only uses a local image or artifact. Container creation will fail if the reference isn't present. - IfNotPresent: the kubelet pulls if the reference isn't already present on disk. Container creation will fail if the reference isn't present and the pull fails. The volume gets re-resolved if the pod gets deleted and recreated, which means that new remote content will become available on pod recreation. A failure to resolve or pull the image during pod startup will block containers from starting and may add significant latency. Failures will be retried using normal volume backoff and will be reported on the pod reason and message. The types of objects that may be mounted by this volume are defined by the container runtime implementation on a host machine and at minimum must include all valid types supported by the container image field. The OCI object gets mounted in a single directory (spec.containers[*].volumeMounts.mountPath) by merging the manifest layers in the same way as for container images. The volume will be mounted read-only (ro). Sub path mounts for containers are not supported (spec.containers[*].volumeMounts.subpath) before 1.33. The field spec.securityContext.fsGroupChangePolicy has no effect on this volume type. */
  "image"?: Image
  /** iscsi represents an ISCSI Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes/#iscsi */
  "iscsi"?: Iscsi
  /** name of the volume. Must be a DNS_LABEL and unique within the pod. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name": string
  /** nfs represents an NFS mount on the host that shares a pod's lifetime More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs */
  "nfs"?: Nfs
  /** persistentVolumeClaimVolumeSource represents a reference to a PersistentVolumeClaim in the same namespace. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "persistentVolumeClaim"?: PersistentVolumeClaim
  /** photonPersistentDisk represents a PhotonController persistent disk attached and mounted on kubelets host machine. Deprecated: PhotonPersistentDisk is deprecated and the in-tree photonPersistentDisk type is no longer supported. */
  "photonPersistentDisk"?: PhotonPersistentDisk
  /** portworxVolume represents a portworx volume attached and mounted on kubelets host machine. Deprecated: PortworxVolume is deprecated. All operations for the in-tree portworxVolume type are redirected to the pxd.portworx.com CSI driver. */
  "portworxVolume"?: PortworxVolume
  /** projected items for all in one resources secrets, configmaps, and downward API */
  "projected"?: Projected
  /** quobyte represents a Quobyte mount on the host that shares a pod's lifetime. Deprecated: Quobyte is deprecated and the in-tree quobyte type is no longer supported. */
  "quobyte"?: Quobyte
  /** rbd represents a Rados Block Device mount on the host that shares a pod's lifetime. Deprecated: RBD is deprecated and the in-tree rbd type is no longer supported. */
  "rbd"?: Rbd
  /** scaleIO represents a ScaleIO persistent volume attached and mounted on Kubernetes nodes. Deprecated: ScaleIO is deprecated and the in-tree scaleIO type is no longer supported. */
  "scaleIO"?: ScaleIO
  /** secret represents a secret that should populate this volume. More info: https://kubernetes.io/docs/concepts/storage/volumes#secret */
  "secret"?: Secret3
  /** storageOS represents a StorageOS volume attached and mounted on Kubernetes nodes. Deprecated: StorageOS is deprecated and the in-tree storageos type is no longer supported. */
  "storageos"?: Storageos
  /** vsphereVolume represents a vSphere volume attached and mounted on kubelets host machine. Deprecated: VsphereVolume is deprecated. All operations for the in-tree vsphereVolume type are redirected to the csi.vsphere.vmware.com CSI driver. */
  "vsphereVolume"?: VsphereVolume
}

export interface Headers {
  /** contentSecurityPolicy defines the Content-Security-Policy header to HTTP responses. Unset if blank. */
  "contentSecurityPolicy"?: string
  /** strictTransportSecurity defines the Strict-Transport-Security header to HTTP responses. Unset if blank. Please make sure that you use this with care as this header might force browsers to load Prometheus and the other applications hosted on the same domain and subdomains over HTTPS. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security */
  "strictTransportSecurity"?: string
  /** xContentTypeOptions defines the X-Content-Type-Options header to HTTP responses. Unset if blank. Accepted value is nosniff. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options */
  "xContentTypeOptions"?: "" | "NoSniff"
  /** xFrameOptions defines the X-Frame-Options header to HTTP responses. Unset if blank. Accepted values are deny and sameorigin. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options */
  "xFrameOptions"?: "" | "Deny" | "SameOrigin"
  /** xXSSProtection defines the X-XSS-Protection header to all responses. Unset if blank. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection */
  "xXSSProtection"?: string
}

export interface HttpConfig2 {
  /** headers defines a list of headers that can be added to HTTP responses. */
  "headers"?: Headers
  /** http2 enable HTTP/2 support. Note that HTTP/2 is only supported with TLS. When TLSConfig is not configured, HTTP/2 will be disabled. Whenever the value of the field changes, a rolling update will be triggered. */
  "http2"?: boolean
}

export interface TlsConfig2 {
  /** cert defines the Secret or ConfigMap containing the TLS certificate for the web server. Either `keySecret` or `keyFile` must be defined. It is mutually exclusive with `certFile`. */
  "cert"?: Cert
  /** certFile defines the path to the TLS certificate file in the container for the web server. Either `keySecret` or `keyFile` must be defined. It is mutually exclusive with `cert`. */
  "certFile"?: string
  /** cipherSuites defines the list of supported cipher suites for TLS versions up to TLS 1.2. If not defined, the Go default cipher suites are used. Available cipher suites are documented in the Go documentation: https://golang.org/pkg/crypto/tls/#pkg-constants */
  "cipherSuites"?: string[]
  /** client_ca defines the Secret or ConfigMap containing the CA certificate for client certificate authentication to the server. It is mutually exclusive with `clientCAFile`. */
  "client_ca"?: ClientCa
  /** clientAuthType defines the server policy for client TLS authentication. For more detail on clientAuth options: https://golang.org/pkg/crypto/tls/#ClientAuthType */
  "clientAuthType"?: string
  /** clientCAFile defines the path to the CA certificate file for client certificate authentication to the server. It is mutually exclusive with `client_ca`. */
  "clientCAFile"?: string
  /** curvePreferences defines elliptic curves that will be used in an ECDHE handshake, in preference order. Available curves are documented in the Go documentation: https://golang.org/pkg/crypto/tls/#CurveID */
  "curvePreferences"?: string[]
  /** keyFile defines the path to the TLS private key file in the container for the web server. If defined, either `cert` or `certFile` must be defined. It is mutually exclusive with `keySecret`. */
  "keyFile"?: string
  /** keySecret defines the secret containing the TLS private key for the web server. Either `cert` or `certFile` must be defined. It is mutually exclusive with `keyFile`. */
  "keySecret"?: KeySecret
  /** maxVersion defines the Maximum TLS version that is acceptable. */
  "maxVersion"?: string
  /** minVersion defines the minimum TLS version that is acceptable. */
  "minVersion"?: string
  /** preferServerCipherSuites defines whether the server selects the client's most preferred cipher suite, or the server's most preferred cipher suite. If true then the server's preference, as expressed in the order of elements in cipherSuites, is used. */
  "preferServerCipherSuites"?: boolean
}

export interface Web {
  /** getConcurrency defines the maximum number of GET requests processed concurrently. This corresponds to the Alertmanager's `--web.get-concurrency` flag. */
  "getConcurrency"?: number
  /** httpConfig defines HTTP parameters for web server. */
  "httpConfig"?: HttpConfig2
  /** timeout for HTTP requests. This corresponds to the Alertmanager's `--web.timeout` flag. */
  "timeout"?: number
  /** tlsConfig defines the TLS parameters for HTTPS. */
  "tlsConfig"?: TlsConfig2
}

export interface AlertmanagerSpec {
  /** additionalArgs allows setting additional arguments for the 'Alertmanager' container. It is intended for e.g. activating hidden flags which are not supported by the dedicated configuration options yet. The arguments are passed as-is to the Alertmanager container which may cause issues if they are invalid or not supported by the given Alertmanager version. */
  "additionalArgs"?: AdditionalArgsItem[]
  /** additionalPeers allows injecting a set of additional Alertmanagers to peer with to form a highly available cluster. */
  "additionalPeers"?: string[]
  /** affinity defines the pod's scheduling constraints. */
  "affinity"?: Affinity
  /** alertmanagerConfigMatcherStrategy defines how AlertmanagerConfig objects process incoming alerts. */
  "alertmanagerConfigMatcherStrategy"?: AlertmanagerConfigMatcherStrategy
  /** alertmanagerConfigNamespaceSelector defines the namespaces to be selected for AlertmanagerConfig discovery. If nil, only check own namespace. */
  "alertmanagerConfigNamespaceSelector"?: AlertmanagerConfigNamespaceSelector
  /** alertmanagerConfigSelector defines the selector to be used for to merge and configure Alertmanager with. */
  "alertmanagerConfigSelector"?: AlertmanagerConfigSelector
  /** alertmanagerConfiguration defines the configuration of Alertmanager. If defined, it takes precedence over the `configSecret` field. This is an *experimental feature*, it may change in any upcoming release in a breaking way. */
  "alertmanagerConfiguration"?: AlertmanagerConfiguration
  /** automountServiceAccountToken defines whether a service account token should be automatically mounted in the pod. If the service account has `automountServiceAccountToken: true`, set the field to `false` to opt out of automounting API credentials. */
  "automountServiceAccountToken"?: boolean
  /** baseImage that is used to deploy pods, without tag. Deprecated: use 'image' instead. */
  "baseImage"?: string
  /** clusterAdvertiseAddress defines the explicit address to advertise in cluster. Needs to be provided for non RFC1918 [1] (public) addresses. [1] RFC1918: https://tools.ietf.org/html/rfc1918 */
  "clusterAdvertiseAddress"?: string
  /** clusterGossipInterval defines the interval between gossip attempts. */
  "clusterGossipInterval"?: string
  /** clusterLabel defines the identifier that uniquely identifies the Alertmanager cluster. You should only set it when the Alertmanager cluster includes Alertmanager instances which are external to this Alertmanager resource. In practice, the addresses of the external instances are provided via the `.spec.additionalPeers` field. */
  "clusterLabel"?: string
  /** clusterPeerTimeout defines the timeout for cluster peering. */
  "clusterPeerTimeout"?: string
  /** clusterPushpullInterval defines the interval between pushpull attempts. */
  "clusterPushpullInterval"?: string
  /** clusterTLS defines the mutual TLS configuration for the Alertmanager cluster's gossip protocol. It requires Alertmanager >= 0.24.0. */
  "clusterTLS"?: ClusterTLS
  /** configMaps defines a list of ConfigMaps in the same namespace as the Alertmanager object, which shall be mounted into the Alertmanager Pods. Each ConfigMap is added to the StatefulSet definition as a volume named `configmap-<configmap-name>`. The ConfigMaps are mounted into `/etc/alertmanager/configmaps/<configmap-name>` in the 'alertmanager' container. */
  "configMaps"?: string[]
  /** configSecret defines the name of a Kubernetes Secret in the same namespace as the Alertmanager object, which contains the configuration for this Alertmanager instance. If empty, it defaults to `alertmanager-<alertmanager-name>`. The Alertmanager configuration should be available under the `alertmanager.yaml` key. Additional keys from the original secret are copied to the generated secret and mounted into the `/etc/alertmanager/config` directory in the `alertmanager` container. If either the secret or the `alertmanager.yaml` key is missing, the operator provisions a minimal Alertmanager configuration with one empty receiver (effectively dropping alert notifications). */
  "configSecret"?: string
  /** containers allows injecting additional containers or modifying operator generated containers. This can be used to allow adding an authentication proxy to the Pods or to change the behavior of an operator generated container. Containers described here modify an operator generated container if they share the same name and modifications are done via a strategic merge patch. The names of containers managed by the operator are: * `alertmanager` * `config-reloader` * `thanos-sidecar` Overriding containers which are managed by the operator require careful testing, especially when upgrading to a new version of the operator. */
  "containers"?: ContainersItem[]
  /** dnsConfig defines the DNS configuration for the pods. */
  "dnsConfig"?: DnsConfig
  /** dnsPolicy defines the DNS policy for the pods. */
  "dnsPolicy"?: "ClusterFirstWithHostNet" | "ClusterFirst" | "Default" | "None"
  /** enableFeatures defines the Alertmanager's feature flags. By default, no features are enabled. Enabling features which are disabled by default is entirely outside the scope of what the maintainers will support and by doing so, you accept that this behaviour may break at any time without notice. It requires Alertmanager >= 0.27.0. */
  "enableFeatures"?: string[]
  /** enableServiceLinks defines whether information about services should be injected into pod's environment variables */
  "enableServiceLinks"?: boolean
  /** externalUrl defines the URL used to access the Alertmanager web service. This is necessary to generate correct URLs. This is necessary if Alertmanager is not served from root of a DNS name. */
  "externalUrl"?: string
  /** forceEnableClusterMode ensures Alertmanager does not deactivate the cluster mode when running with a single replica. Use case is e.g. spanning an Alertmanager cluster across Kubernetes clusters with a single replica in each. */
  "forceEnableClusterMode"?: boolean
  /** hostAliases Pods configuration */
  "hostAliases"?: HostAliasesItem[]
  /** hostNetwork controls whether the pod may use the node network namespace. Make sure to understand the security implications if you want to enable it (https://kubernetes.io/docs/concepts/configuration/overview/). When hostNetwork is enabled, this will set the DNS policy to `ClusterFirstWithHostNet` automatically (unless `.spec.dnsPolicy` is set to a different value). */
  "hostNetwork"?: boolean
  /** hostUsers supports the user space in Kubernetes. More info: https://kubernetes.io/docs/tasks/configure-pod-container/user-namespaces/ The feature requires at least Kubernetes 1.28 with the `UserNamespacesSupport` feature gate enabled. Starting Kubernetes 1.33, the feature is enabled by default. */
  "hostUsers"?: boolean
  /** image if specified has precedence over baseImage, tag and sha combinations. Specifying the version is still necessary to ensure the Prometheus Operator knows what version of Alertmanager is being configured. */
  "image"?: string
  /** imagePullPolicy for the 'alertmanager', 'init-config-reloader' and 'config-reloader' containers. See https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy for more details. */
  "imagePullPolicy"?: "" | "Always" | "Never" | "IfNotPresent"
  /** imagePullSecrets An optional list of references to secrets in the same namespace to use for pulling prometheus and alertmanager images from registries see https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/ */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** initContainers allows injecting initContainers to the Pod definition. Those can be used to e.g.  fetch secrets for injection into the Prometheus configuration from external sources. Any errors during the execution of an initContainer will lead to a restart of the Pod. More info: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ InitContainers described here modify an operator generated init containers if they share the same name and modifications are done via a strategic merge patch. The names of init container name managed by the operator are: * `init-config-reloader`. Overriding init containers which are managed by the operator require careful testing, especially when upgrading to a new version of the operator. */
  "initContainers"?: InitContainersItem[]
  /** limits defines the limits command line flags when starting Alertmanager. */
  "limits"?: Limits
  /** listenLocal defines the Alertmanager server listen on loopback, so that it does not bind against the Pod IP. Note this is only for the Alertmanager UI, not the gossip communication. */
  "listenLocal"?: boolean
  /** logFormat for Alertmanager to be configured with. */
  "logFormat"?: "" | "logfmt" | "json"
  /** logLevel for Alertmanager to be configured with. */
  "logLevel"?: "" | "debug" | "info" | "warn" | "error"
  /** minReadySeconds defines the minimum number of seconds for which a newly created pod should be ready without any of its container crashing for it to be considered available. If unset, pods will be considered available as soon as they are ready. When the Alertmanager version is greater than or equal to v0.30.0, the duration is also used to delay the first flush of the aggregation groups. This delay helps ensuring that all alerts have been resent by the Prometheus instances to Alertmanager after a roll-out. It is possible to override this behavior passing a custom value via `.spec.additionalArgs`. */
  "minReadySeconds"?: number
  /** nodeSelector defines which Nodes the Pods are scheduled on. */
  "nodeSelector"?: Record<string, unknown>
  /** paused if set to true all actions on the underlying managed objects are not going to be performed, except for delete actions. */
  "paused"?: boolean
  /** persistentVolumeClaimRetentionPolicy controls if and how PVCs are deleted during the lifecycle of a StatefulSet. The default behavior is all PVCs are retained. This is an alpha field from kubernetes 1.23 until 1.26 and a beta field from 1.26. It requires enabling the StatefulSetAutoDeletePVC feature gate. */
  "persistentVolumeClaimRetentionPolicy"?: PersistentVolumeClaimRetentionPolicy
  /** podManagementPolicy defines the policy for creating/deleting pods when scaling up and down. Unlike the default StatefulSet behavior, the default policy is `Parallel` to avoid manual intervention in case a pod gets stuck during a rollout. Note that updating this value implies the recreation of the StatefulSet which incurs a service outage. */
  "podManagementPolicy"?: "OrderedReady" | "Parallel"
  /** podMetadata defines labels and annotations which are propagated to the Alertmanager pods. The following items are reserved and cannot be overridden: * "alertmanager" label, set to the name of the Alertmanager instance. * "app.kubernetes.io/instance" label, set to the name of the Alertmanager instance. * "app.kubernetes.io/managed-by" label, set to "prometheus-operator". * "app.kubernetes.io/name" label, set to "alertmanager". * "app.kubernetes.io/version" label, set to the Alertmanager version. * "kubectl.kubernetes.io/default-container" annotation, set to "alertmanager". */
  "podMetadata"?: PodMetadata
  /** portName defines the port's name for the pods and governing service. Defaults to `web`. */
  "portName"?: string
  /** priorityClassName assigned to the Pods */
  "priorityClassName"?: string
  /** replicas defines the expected size of the alertmanager cluster. The controller will eventually make the size of the running cluster equal to the expected size. */
  "replicas"?: number
  /** resources defines the resource requests and limits of the Pods. */
  "resources"?: Resources
  /** retention defines the time duration Alertmanager shall retain data for. Default is '120h', and must match the regular expression `[0-9]+(ms|s|m|h)` (milliseconds seconds minutes hours). */
  "retention"?: string
  /** routePrefix Alertmanager registers HTTP handlers for. This is useful, if using ExternalURL and a proxy is rewriting HTTP routes of a request, and the actual ExternalURL is still true, but the server serves requests under a different route prefix. For example for use with `kubectl proxy`. */
  "routePrefix"?: string
  /** schedulerName defines the scheduler to use for Pod scheduling. If not specified, the default scheduler is used. */
  "schedulerName"?: string
  /** secrets is a list of Secrets in the same namespace as the Alertmanager object, which shall be mounted into the Alertmanager Pods. Each Secret is added to the StatefulSet definition as a volume named `secret-<secret-name>`. The Secrets are mounted into `/etc/alertmanager/secrets/<secret-name>` in the 'alertmanager' container. */
  "secrets"?: string[]
  /** securityContext holds pod-level security attributes and common container settings. This defaults to the default PodSecurityContext. */
  "securityContext"?: SecurityContext2
  /** serviceAccountName is the name of the ServiceAccount to use to run the Prometheus Pods. */
  "serviceAccountName"?: string
  /** serviceName defines the service name used by the underlying StatefulSet(s) as the governing service. If defined, the Service  must be created before the Alertmanager resource in the same namespace and it must define a selector that matches the pod labels. If empty, the operator will create and manage a headless service named `alertmanager-operated` for Alertmanager resources. When deploying multiple Alertmanager resources in the same namespace, it is recommended to specify a different value for each. See https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id for more details. */
  "serviceName"?: string
  /** sha of Alertmanager container image to be deployed. Defaults to the value of `version`. Similar to a tag, but the SHA explicitly deploys an immutable container image. Version and Tag are ignored if SHA is set. Deprecated: use 'image' instead. The image digest can be specified as part of the image URL. */
  "sha"?: string
  /** storage defines the definition of how storage will be used by the Alertmanager instances. */
  "storage"?: Storage
  /** tag of Alertmanager container image to be deployed. Defaults to the value of `version`. Version is ignored if Tag is set. Deprecated: use 'image' instead. The image tag can be specified as part of the image URL. */
  "tag"?: string
  /** terminationGracePeriodSeconds defines the Optional duration in seconds the pod needs to terminate gracefully. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down) which may lead to data corruption. Defaults to 120 seconds. */
  "terminationGracePeriodSeconds"?: number
  /** tolerations defines the pod's tolerations. */
  "tolerations"?: TolerationsItem[]
  /** topologySpreadConstraints defines the Pod's topology spread constraints. */
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  /** updateStrategy indicates the strategy that will be employed to update Pods in the StatefulSet when a revision is made to statefulset's Pod Template. The default strategy is RollingUpdate. */
  "updateStrategy"?: UpdateStrategy
  /** version the cluster should be on. */
  "version"?: string
  /** volumeMounts allows configuration of additional VolumeMounts on the output StatefulSet definition. VolumeMounts specified will be appended to other VolumeMounts in the alertmanager container, that are generated as a result of StorageSpec objects. */
  "volumeMounts"?: VolumeMountsItem[]
  /** volumes allows configuration of additional volumes on the output StatefulSet definition. Volumes specified will be appended to other volumes that are generated as a result of StorageSpec objects. */
  "volumes"?: VolumesItem[]
  /** web defines the web command line flags when starting Alertmanager. */
  "web"?: Web
}

export interface ConditionsItem2 {
  /** lastTransitionTime is the time of the last update to the current status property. */
  "lastTransitionTime": string
  /** message defines human-readable message indicating details for the condition's last transition. */
  "message"?: string
  /** observedGeneration defines the .metadata.generation that the condition was set based upon. For instance, if `.metadata.generation` is currently 12, but the `.status.conditions[].observedGeneration` is 9, the condition is out of date with respect to the current state of the instance. */
  "observedGeneration"?: number
  /** reason for the condition's last transition. */
  "reason"?: string
  /** status of the condition. */
  "status": string
  /** type of the condition being reported. */
  "type": string
}

export interface AlertmanagerStatus {
  /** availableReplicas defines the total number of available pods (ready for at least minReadySeconds) targeted by this Alertmanager cluster. */
  "availableReplicas"?: number
  /** conditions defines the current state of the Alertmanager object. */
  "conditions"?: ConditionsItem2[]
  /** paused defines whether any actions on the underlying managed objects are being performed. Only delete actions will be performed. */
  "paused"?: boolean
  /** replicas defines the total number of non-terminated pods targeted by this Alertmanager object (their labels match the selector). */
  "replicas"?: number
  /** selector used to match the pods targeted by this Alertmanager object. */
  "selector"?: string
  /** unavailableReplicas defines the total number of unavailable pods targeted by this Alertmanager object. */
  "unavailableReplicas"?: number
  /** updatedReplicas defines the total number of non-terminated pods targeted by this Alertmanager object that have the desired version spec. */
  "updatedReplicas"?: number
}

export interface AttachMetadata {
  /** When set to true, Prometheus must have the `get` permission on the `Nodes` objects. */
  "node"?: boolean
}

export interface NamespaceSelector2 {
  /** Boolean describing whether all namespaces are selected in contrast to a list restricting them. */
  "any"?: boolean
  /** List of namespace names to select from. */
  "matchNames"?: string[]
}

export interface MetricRelabelingsItem {
  /** Action to perform based on the regex matching.   `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0.   Default: "Replace" */
  "action"?: "replace" | "Replace" | "keep" | "Keep" | "drop" | "Drop" | "hashmod" | "HashMod" | "labelmap" | "LabelMap" | "labeldrop" | "LabelDrop" | "labelkeep" | "LabelKeep" | "lowercase" | "Lowercase" | "uppercase" | "Uppercase" | "keepequal" | "KeepEqual" | "dropequal" | "DropEqual"
  /** Modulus to take of the hash of the source label values.   Only applicable when the action is `HashMod`. */
  "modulus"?: number
  /** Regular expression against which the extracted value is matched. */
  "regex"?: string
  /** Replacement value against which a Replace action is performed if the regular expression matches.   Regex capture groups are available. */
  "replacement"?: string
  /** Separator is the string between concatenated SourceLabels. */
  "separator"?: string
  /** The source labels select values from existing labels. Their content is concatenated using the configured Separator and matched against the configured regular expression. */
  "sourceLabels"?: string[]
  /** Label to which the resulting string is written in a replacement.   It is mandatory for `Replace`, `HashMod`, `Lowercase`, `Uppercase`, `KeepEqual` and `DropEqual` actions.   Regex capture groups are available. */
  "targetLabel"?: string
}

export interface Oauth22 {
  /** `clientId` specifies a key of a Secret or ConfigMap containing the OAuth2 client's ID. */
  "clientId": ClientId
  /** `clientSecret` specifies a key of a Secret containing the OAuth2 client's secret. */
  "clientSecret": ClientSecret
  /** `endpointParams` configures the HTTP parameters to append to the token URL. */
  "endpointParams"?: Record<string, unknown>
  /** `scopes` defines the OAuth2 scopes used for the token request. */
  "scopes"?: string[]
  /** `tokenURL` configures the URL to fetch the token from. */
  "tokenUrl": string
}

export interface RelabelingsItem {
  /** Action to perform based on the regex matching.   `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0.   Default: "Replace" */
  "action"?: "replace" | "Replace" | "keep" | "Keep" | "drop" | "Drop" | "hashmod" | "HashMod" | "labelmap" | "LabelMap" | "labeldrop" | "LabelDrop" | "labelkeep" | "LabelKeep" | "lowercase" | "Lowercase" | "uppercase" | "Uppercase" | "keepequal" | "KeepEqual" | "dropequal" | "DropEqual"
  /** Modulus to take of the hash of the source label values.   Only applicable when the action is `HashMod`. */
  "modulus"?: number
  /** Regular expression against which the extracted value is matched. */
  "regex"?: string
  /** Replacement value against which a Replace action is performed if the regular expression matches.   Regex capture groups are available. */
  "replacement"?: string
  /** Separator is the string between concatenated SourceLabels. */
  "separator"?: string
  /** The source labels select values from existing labels. Their content is concatenated using the configured Separator and matched against the configured regular expression. */
  "sourceLabels"?: string[]
  /** Label to which the resulting string is written in a replacement.   It is mandatory for `Replace`, `HashMod`, `Lowercase`, `Uppercase`, `KeepEqual` and `DropEqual` actions.   Regex capture groups are available. */
  "targetLabel"?: string
}

export interface TlsConfig3 {
  /** Certificate authority used when verifying server certificates. */
  "ca"?: Ca
  /** Client certificate to present when doing client-authentication. */
  "cert"?: Cert
  /** Disable target certificate validation. */
  "insecureSkipVerify"?: boolean
  /** Secret containing the client key file for the targets. */
  "keySecret"?: KeySecret
  /** Used to verify the hostname for the targets. */
  "serverName"?: string
}

export interface PodMetricsEndpointsItem {
  /** `authorization` configures the Authorization header credentials to use when scraping the target.   Cannot be set at the same time as `basicAuth`, or `oauth2`. */
  "authorization"?: Authorization
  /** `basicAuth` configures the Basic Authentication credentials to use when scraping the target.   Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** `bearerTokenSecret` specifies a key of a Secret containing the bearer token for scraping targets. The secret needs to be in the same namespace as the PodMonitor object and readable by the Prometheus Operator.   Deprecated: use `authorization` instead. */
  "bearerTokenSecret"?: BearerTokenSecret
  /** `enableHttp2` can be used to disable HTTP2 when scraping the target. */
  "enableHttp2"?: boolean
  /** When true, the pods which are not running (e.g. either in Failed or Succeeded state) are dropped during the target discovery.   If unset, the filtering is enabled.   More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase */
  "filterRunning"?: boolean
  /** `followRedirects` defines whether the scrape requests should follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** When true, `honorLabels` preserves the metric's labels when they collide with the target's labels. */
  "honorLabels"?: boolean
  /** `honorTimestamps` controls whether Prometheus preserves the timestamps when exposed by the target. */
  "honorTimestamps"?: boolean
  /** Interval at which Prometheus scrapes the metrics from the target.   If empty, Prometheus uses the global scrape interval. */
  "interval"?: string
  /** `metricRelabelings` configures the relabeling rules to apply to the samples before ingestion. */
  "metricRelabelings"?: MetricRelabelingsItem[]
  /** `oauth2` configures the OAuth2 settings to use when scraping the target.   It requires Prometheus >= 2.27.0.   Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth22
  /** `params` define optional HTTP URL parameters. */
  "params"?: Record<string, unknown>
  /** HTTP path from which to scrape for metrics.   If empty, Prometheus uses the default value (e.g. `/metrics`). */
  "path"?: string
  /** Name of the Pod port which this endpoint refers to.   It takes precedence over `targetPort`. */
  "port"?: string
  /** `proxyURL` configures the HTTP Proxy URL (e.g. "http://proxyserver:2195") to go through when scraping the target. */
  "proxyUrl"?: string
  /** `relabelings` configures the relabeling rules to apply the target's metadata labels.   The Operator automatically adds relabelings for a few standard Kubernetes fields.   The original scrape job's name is available via the `__tmp_prometheus_job_name` label.   More info: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config */
  "relabelings"?: RelabelingsItem[]
  /** HTTP scheme to use for scraping.   `http` and `https` are the expected values unless you rewrite the `__scheme__` label via relabeling.   If empty, Prometheus uses the default value `http`. */
  "scheme"?: "http" | "https"
  /** Timeout after which Prometheus considers the scrape to be failed.   If empty, Prometheus uses the global scrape timeout unless it is less than the target's scrape interval value in which the latter is used. */
  "scrapeTimeout"?: string
  /** Name or number of the target port of the `Pod` object behind the Service, the port must be specified with container port property.   Deprecated: use 'port' instead. */
  "targetPort"?: number | string
  /** TLS configuration to use when scraping the target. */
  "tlsConfig"?: TlsConfig3
  /** `trackTimestampsStaleness` defines whether Prometheus tracks staleness of the metrics that have an explicit timestamp present in scraped data. Has no effect if `honorTimestamps` is false.   It requires Prometheus >= v2.48.0. */
  "trackTimestampsStaleness"?: boolean
}

export interface PodMonitorSpec {
  /** `attachMetadata` defines additional metadata which is added to the discovered targets.   It requires Prometheus >= v2.37.0. */
  "attachMetadata"?: AttachMetadata
  /** The label to use to retrieve the job name from. `jobLabel` selects the label from the associated Kubernetes `Pod` object which will be used as the `job` label for all metrics.   For example if `jobLabel` is set to `foo` and the Kubernetes `Pod` object is labeled with `foo: bar`, then Prometheus adds the `job="bar"` label to all ingested metrics.   If the value of this field is empty, the `job` label of the metrics defaults to the namespace and name of the PodMonitor object (e.g. `<namespace>/<name>`). */
  "jobLabel"?: string
  /** Per-scrape limit on the number of targets dropped by relabeling that will be kept in memory. 0 means no limit.   It requires Prometheus >= v2.47.0. */
  "keepDroppedTargets"?: number
  /** Per-scrape limit on number of labels that will be accepted for a sample.   It requires Prometheus >= v2.27.0. */
  "labelLimit"?: number
  /** Per-scrape limit on length of labels name that will be accepted for a sample.   It requires Prometheus >= v2.27.0. */
  "labelNameLengthLimit"?: number
  /** Per-scrape limit on length of labels value that will be accepted for a sample.   It requires Prometheus >= v2.27.0. */
  "labelValueLengthLimit"?: number
  /** Selector to select which namespaces the Kubernetes `Pods` objects are discovered from. */
  "namespaceSelector"?: NamespaceSelector2
  /** List of endpoints part of this PodMonitor. */
  "podMetricsEndpoints"?: PodMetricsEndpointsItem[]
  /** `podTargetLabels` defines the labels which are transferred from the associated Kubernetes `Pod` object onto the ingested metrics. */
  "podTargetLabels"?: string[]
  /** `sampleLimit` defines a per-scrape limit on the number of scraped samples that will be accepted. */
  "sampleLimit"?: number
  /** The scrape class to apply. */
  "scrapeClass"?: string
  /** `scrapeProtocols` defines the protocols to negotiate during a scrape. It tells clients the protocols supported by Prometheus in order of preference (from most to least preferred).   If unset, Prometheus uses its default value.   It requires Prometheus >= v2.49.0. */
  "scrapeProtocols"?: ("PrometheusProto" | "OpenMetricsText0.0.1" | "OpenMetricsText1.0.0" | "PrometheusText0.0.4")[]
  /** Label selector to select the Kubernetes `Pod` objects. */
  "selector": Selector
  /** `targetLimit` defines a limit on the number of scraped targets that will be accepted. */
  "targetLimit"?: number
}

export interface AdditionalAlertManagerConfigs {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface AdditionalAlertRelabelConfigs {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface AdditionalScrapeConfigs {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface AlertRelabelingsItem {
  /** action to perform based on the regex matching. `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0. Default: "Replace" */
  "action"?: "replace" | "Replace" | "keep" | "Keep" | "drop" | "Drop" | "hashmod" | "HashMod" | "labelmap" | "LabelMap" | "labeldrop" | "LabelDrop" | "labelkeep" | "LabelKeep" | "lowercase" | "Lowercase" | "uppercase" | "Uppercase" | "keepequal" | "KeepEqual" | "dropequal" | "DropEqual"
  /** modulus to take of the hash of the source label values. Only applicable when the action is `HashMod`. */
  "modulus"?: number
  /** regex defines the regular expression against which the extracted value is matched. */
  "regex"?: string
  /** replacement value against which a Replace action is performed if the regular expression matches. Regex capture groups are available. */
  "replacement"?: string
  /** separator defines the string between concatenated SourceLabels. */
  "separator"?: string
  /** sourceLabels defines the source labels select values from existing labels. Their content is concatenated using the configured Separator and matched against the configured regular expression. */
  "sourceLabels"?: string[]
  /** targetLabel defines the label to which the resulting string is written in a replacement. It is mandatory for `Replace`, `HashMod`, `Lowercase`, `Uppercase`, `KeepEqual` and `DropEqual` actions. Regex capture groups are available. */
  "targetLabel"?: string
}

export interface AccessKey {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface SecretKey {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Sigv4 {
  /** accessKey defines the AWS API key. If not specified, the environment variable `AWS_ACCESS_KEY_ID` is used. */
  "accessKey"?: AccessKey
  /** externalId defines the external ID used when assuming an AWS role. Can only be used with roleArn. It requires Prometheus >= v3.11.0 or Alertmanager >= v0.33.0. Currently not supported by Thanos. */
  "externalId"?: string
  /** profile defines the named AWS profile used to authenticate. */
  "profile"?: string
  /** region defines the AWS region. If blank, the region from the default credentials chain used. */
  "region"?: string
  /** roleArn defines the named AWS profile used to authenticate. */
  "roleArn"?: string
  /** secretKey defines the AWS API secret. If not specified, the environment variable `AWS_SECRET_ACCESS_KEY` is used. */
  "secretKey"?: SecretKey
  /** useFIPSSTSEndpoint defines the FIPS mode for the AWS STS endpoint. It requires Prometheus >= v2.54.0. */
  "useFIPSSTSEndpoint"?: boolean
}

export interface TlsConfig4 {
  /** ca defines the Certificate authority used when verifying server certificates. */
  "ca"?: Ca
  /** caFile defines the path to the CA cert in the Prometheus container to use for the targets. */
  "caFile"?: string
  /** cert defines the Client certificate to present when doing client-authentication. */
  "cert"?: Cert
  /** certFile defines the path to the client cert file in the Prometheus container for the targets. */
  "certFile"?: string
  /** insecureSkipVerify defines how to disable target certificate validation. */
  "insecureSkipVerify"?: boolean
  /** keyFile defines the path to the client key file in the Prometheus container for the targets. */
  "keyFile"?: string
  /** keySecret defines the Secret containing the client key file for the targets. */
  "keySecret"?: KeySecret
  /** maxVersion defines the maximum acceptable TLS version. It requires Prometheus >= v2.41.0 or Thanos >= v0.31.0. */
  "maxVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** minVersion defines the minimum acceptable TLS version. It requires Prometheus >= v2.35.0 or Thanos >= v0.28.0. */
  "minVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** serverName is used to verify the hostname for the targets. */
  "serverName"?: string
}

export interface AlertmanagersItem {
  /** alertRelabelings defines the relabeling configs applied before sending alerts to a specific Alertmanager. It requires Prometheus >= v2.51.0. */
  "alertRelabelings"?: AlertRelabelingsItem[]
  /** apiVersion defines the version of the Alertmanager API that Prometheus uses to send alerts. It can be "V1" or "V2". The field has no effect for Prometheus >= v3.0.0 because only the v2 API is supported. */
  "apiVersion"?: "v1" | "V1" | "v2" | "V2"
  /** authorization section for Alertmanager. Cannot be set at the same time as `basicAuth`, `bearerTokenFile` or `sigv4`. */
  "authorization"?: Authorization
  /** basicAuth configuration for Alertmanager. Cannot be set at the same time as `bearerTokenFile`, `authorization` or `sigv4`. */
  "basicAuth"?: BasicAuth
  /** bearerTokenFile defines the file to read bearer token for Alertmanager. Cannot be set at the same time as `basicAuth`, `authorization`, or `sigv4`. Deprecated: this will be removed in a future release. Prefer using `authorization`. */
  "bearerTokenFile"?: string
  /** enableHttp2 defines whether to enable HTTP2. */
  "enableHttp2"?: boolean
  /** name of the Endpoints object in the namespace. */
  "name": string
  /** namespace of the Endpoints object. If not set, the object will be discovered in the namespace of the Prometheus object. */
  "namespace"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** pathPrefix defines the prefix for the HTTP path alerts are pushed to. */
  "pathPrefix"?: string
  /** port on which the Alertmanager API is exposed. */
  "port": number | string
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** relabelings defines the relabel configuration applied to the discovered Alertmanagers. */
  "relabelings"?: RelabelingsItem[]
  /** scheme defines the HTTP scheme to use when sending alerts. */
  "scheme"?: "http" | "https" | "HTTP" | "HTTPS"
  /** sigv4 defines AWS's Signature Verification 4 for the URL. It requires Prometheus >= v2.48.0. Cannot be set at the same time as `basicAuth`, `bearerTokenFile` or `authorization`. */
  "sigv4"?: Sigv4
  /** timeout defines a per-target Alertmanager timeout when pushing alerts. */
  "timeout"?: string
  /** tlsConfig to use for Alertmanager. */
  "tlsConfig"?: TlsConfig4
}

export interface Alerting {
  /** alertmanagers endpoints where Prometheus should send alerts to. */
  "alertmanagers": AlertmanagersItem[]
}

export interface Authorization2 {
  /** credentials defines a key of a Secret in the namespace that contains the credentials for authentication. */
  "credentials"?: Credentials
  /** credentialsFile defines the file to read a secret from, mutually exclusive with `credentials`. */
  "credentialsFile"?: string
  /** type defines the authentication type. The value is case-insensitive. "Basic" is not a supported value. Default: "Bearer" */
  "type"?: string
}

export interface ApiserverConfig {
  /** authorization section for the API server. Cannot be set at the same time as `basicAuth`, `bearerToken`, or `bearerTokenFile`. */
  "authorization"?: Authorization2
  /** basicAuth configuration for the API server. Cannot be set at the same time as `authorization`, `bearerToken`, or `bearerTokenFile`. */
  "basicAuth"?: BasicAuth
  /** bearerToken is deprecated: this will be removed in a future release.  *Warning: this field shouldn't be used because the token value appears in clear-text. Prefer using `authorization`.* */
  "bearerToken"?: string
  /** bearerTokenFile defines the file to read bearer token for accessing apiserver. Cannot be set at the same time as `basicAuth`, `authorization`, or `bearerToken`. Deprecated: this will be removed in a future release. Prefer using `authorization`. */
  "bearerTokenFile"?: string
  /** host defines the Kubernetes API address consisting of a hostname or IP address followed by an optional port number. */
  "host": string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** tlsConfig to use for the API server. */
  "tlsConfig"?: TlsConfig4
}

export interface ArbitraryFSAccessThroughSMs {
  /** deny prevents service monitors from accessing arbitrary files on the file system. When true, service monitors cannot use file-based configurations like BearerTokenFile that could potentially access sensitive files. When false (default), such access is allowed. Setting this to true enhances security by preventing potential credential theft attacks. */
  "deny"?: boolean
}

export interface ExcludedFromEnforcementItem {
  /** group of the referent. When not specified, it defaults to `monitoring.coreos.com` */
  "group"?: "monitoring.coreos.com"
  /** name of the referent. When not set, all resources in the namespace are matched. */
  "name"?: string
  /** namespace of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/ */
  "namespace": string
  /** resource of the referent. */
  "resource": "prometheusrules" | "servicemonitors" | "podmonitors" | "probes" | "scrapeconfigs"
}

export interface Exemplars {
  /** maxSize defines the maximum number of exemplars stored in memory for all series. exemplar-storage itself must be enabled using the `spec.enableFeature` option for exemplars to be scraped in the first place. If not set, Prometheus uses its default value. A value of zero or less than zero disables the storage. */
  "maxSize"?: number
}

export interface Otlp {
  /** convertHistogramsToNHCB defines optional translation of OTLP explicit bucket histograms into native histograms with custom buckets. It requires Prometheus >= v3.4.0. */
  "convertHistogramsToNHCB"?: boolean
  /** ignoreResourceAttributes defines the list of OpenTelemetry resource attributes to ignore when `promoteAllResourceAttributes` is true. It requires `promoteAllResourceAttributes` to be true. It requires Prometheus >= v3.5.0. */
  "ignoreResourceAttributes"?: string[]
  /** keepIdentifyingResourceAttributes enables adding `service.name`, `service.namespace` and `service.instance.id` resource attributes to the `target_info` metric, on top of converting them into the `instance` and `job` labels. It requires Prometheus >= v3.1.0. */
  "keepIdentifyingResourceAttributes"?: boolean
  /** labelNamePreserveMultipleUnderscores enables preserving of multiple consecutive underscores in label names when translation_strategy uses underscore escaping. When true (default), multiple consecutive underscores are preserved during label name sanitization. Notice: This one has no impact if `nameEscapingScheme` is `AllowUTF8`. It requires Prometheus >= v3.8.0. */
  "labelNamePreserveMultipleUnderscores"?: boolean
  /** labelNameUnderscoreSanitization controls whether to enable prepending of 'key_' to labels starting with '_'. Reserved labels starting with '__' are not modified. This is only relevant when translation_strategy uses underscore escaping (e.g., "UnderscoreEscapingWithSuffixes" or "UnderscoreEscapingWithoutSuffixes"). Notice: This one has no impact if `nameEscapingScheme` is `AllowUTF8`. It requires Prometheus >= v3.8.0. */
  "labelNameUnderscoreSanitization"?: boolean
  /** promoteAllResourceAttributes promotes all resource attributes to metric labels except the ones defined in `ignoreResourceAttributes`. Cannot be true when `promoteResourceAttributes` is defined. It requires Prometheus >= v3.5.0. */
  "promoteAllResourceAttributes"?: boolean
  /** promoteResourceAttributes defines the list of OpenTelemetry Attributes that should be promoted to metric labels, defaults to none. Cannot be defined when `promoteAllResourceAttributes` is true. */
  "promoteResourceAttributes"?: string[]
  /** promoteScopeMetadata controls whether to promote OpenTelemetry scope metadata (i.e. name, version, schema URL, and attributes) to metric labels. As per the OpenTelemetry specification, the aforementioned scope metadata should be identifying, i.e. made into metric labels. It requires Prometheus >= v3.6.0. */
  "promoteScopeMetadata"?: boolean
  /** translationStrategy defines how the OTLP receiver endpoint translates the incoming metrics. It requires Prometheus >= v3.0.0. */
  "translationStrategy"?: "NoUTF8EscapingWithSuffixes" | "UnderscoreEscapingWithSuffixes" | "NoTranslation" | "UnderscoreEscapingWithoutSuffixes"
}

export interface PodMonitorNamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface PodMonitorSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface ProbeNamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface ProbeSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface PrometheusRulesExcludedFromEnforceItem {
  /** ruleName defines the name of the excluded PrometheusRule object. */
  "ruleName": string
  /** ruleNamespace defines the namespace of the excluded PrometheusRule object. */
  "ruleNamespace": string
}

export interface Query {
  /** lookbackDelta defines the delta difference allowed for retrieving metrics during expression evaluations. */
  "lookbackDelta"?: string
  /** maxConcurrency defines the number of concurrent queries that can be run at once. */
  "maxConcurrency"?: number
  /** maxSamples defines the maximum number of samples a single query can load into memory. Note that queries will fail if they would load more samples than this into memory, so this also limits the number of samples a query can return. */
  "maxSamples"?: number
  /** timeout defines the maximum time a query may take before being aborted. */
  "timeout"?: string
}

export interface RemoteReadItem {
  /** authorization section for the URL. It requires Prometheus >= v2.26.0. Cannot be set at the same time as `basicAuth`, or `oauth2`. */
  "authorization"?: Authorization2
  /** basicAuth configuration for the URL. Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** bearerToken is deprecated: this will be removed in a future release. *Warning: this field shouldn't be used because the token value appears in clear-text. Prefer using `authorization`.* */
  "bearerToken"?: string
  /** bearerTokenFile defines the file from which to read the bearer token for the URL. Deprecated: this will be removed in a future release. Prefer using `authorization`. */
  "bearerTokenFile"?: string
  /** filterExternalLabels defines whether to use the external labels as selectors for the remote read endpoint. It requires Prometheus >= v2.34.0. */
  "filterExternalLabels"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. It requires Prometheus >= v2.26.0. */
  "followRedirects"?: boolean
  /** headers defines the custom HTTP headers to be sent along with each remote read request. Be aware that headers that are set by Prometheus itself can't be overwritten. Only valid in Prometheus versions 2.26.0 and newer. */
  "headers"?: Record<string, unknown>
  /** name of the remote read queue, it must be unique if specified. The name is used in metrics and logging in order to differentiate read configurations. It requires Prometheus >= v2.15.0. */
  "name"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 configuration for the URL. It requires Prometheus >= v2.27.0. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** readRecent defines whether reads should be made for queries for time ranges that the local storage should have complete data for. */
  "readRecent"?: boolean
  /** remoteTimeout defines the timeout for requests to the remote read endpoint. */
  "remoteTimeout"?: string
  /** requiredMatchers defines an optional list of equality matchers which have to be present in a selector to query the remote read endpoint. */
  "requiredMatchers"?: Record<string, unknown>
  /** tlsConfig to use for the URL. */
  "tlsConfig"?: TlsConfig4
  /** url defines the URL of the endpoint to query from. It must use the HTTP or HTTPS scheme. */
  "url": string
}

export interface ManagedIdentity {
  /** clientId defines the Azure User-assigned Managed identity. For Prometheus >= 3.5.0 and Thanos >= 0.40.0, this field is allowed to be empty to support system-assigned managed identities. */
  "clientId"?: string
}

export interface Oauth {
  /** clientId defines the clientId of the Azure Active Directory application that is being used to authenticate. */
  "clientId": string
  /** clientSecret specifies a key of a Secret containing the client secret of the Azure Active Directory application that is being used to authenticate. */
  "clientSecret": ClientSecret
  /** tenantId is the tenant ID of the Azure Active Directory application that is being used to authenticate. */
  "tenantId": string
}

export interface Sdk {
  /** tenantId defines the tenant ID of the azure active directory application that is being used to authenticate. */
  "tenantId"?: string
}

export interface WorkloadIdentity {
  /** clientId is the clientID of the Azure Active Directory application. */
  "clientId": string
  /** tenantId is the tenant ID of the Azure Active Directory application. */
  "tenantId": string
}

export interface AzureAd {
  /** cloud defines the Azure Cloud. Options are 'AzurePublic', 'AzureChina', or 'AzureGovernment'. */
  "cloud"?: "AzureChina" | "AzureGovernment" | "AzurePublic"
  /** managedIdentity defines the Azure User-assigned Managed identity. Cannot be set at the same time as `oauth`, `sdk` or `workloadIdentity`. */
  "managedIdentity"?: ManagedIdentity
  /** oauth defines the oauth config that is being used to authenticate. Cannot be set at the same time as `managedIdentity`, `sdk` or `workloadIdentity`. It requires Prometheus >= v2.48.0 or Thanos >= v0.31.0. */
  "oauth"?: Oauth
  /** scope is the custom OAuth 2.0 scope to request when acquiring tokens. It requires Prometheus >= 3.9.0. Currently not supported by Thanos. */
  "scope"?: string
  /** sdk defines the Azure SDK config that is being used to authenticate. See https://learn.microsoft.com/en-us/azure/developer/go/azure-sdk-authentication Cannot be set at the same time as `oauth`, `managedIdentity` or `workloadIdentity`. It requires Prometheus >= v2.52.0 or Thanos >= v0.36.0. */
  "sdk"?: Sdk
  /** workloadIdentity defines the Azure Workload Identity authentication. Cannot be set at the same time as `oauth`, `managedIdentity`, or `sdk`. It requires Prometheus >= 3.7.0. Currently not supported by Thanos. */
  "workloadIdentity"?: WorkloadIdentity
}

export interface MetadataConfig {
  /** maxSamplesPerSend defines the maximum number of metadata samples per send. It requires Prometheus >= v2.29.0. */
  "maxSamplesPerSend"?: number
  /** send defines whether metric metadata is sent to the remote storage or not. The setting is ignored when Remote Write message's version 2.0 is used. */
  "send"?: boolean
  /** sendInterval defines how frequently metric metadata is sent to the remote storage. */
  "sendInterval"?: string
}

export interface QueueConfig {
  /** batchSendDeadline defines the maximum time a sample will wait in buffer. */
  "batchSendDeadline"?: string
  /** capacity defines the number of samples to buffer per shard before we start dropping them. */
  "capacity"?: number
  /** maxBackoff defines the maximum retry delay. */
  "maxBackoff"?: string
  /** maxRetries defines the maximum number of times to retry a batch on recoverable errors. */
  "maxRetries"?: number
  /** maxSamplesPerSend defines the maximum number of samples per send. */
  "maxSamplesPerSend"?: number
  /** maxShards defines the maximum number of shards, i.e. amount of concurrency. */
  "maxShards"?: number
  /** minBackoff defines the initial retry delay. Gets doubled for every retry. */
  "minBackoff"?: string
  /** minShards defines the minimum number of shards, i.e. amount of concurrency. */
  "minShards"?: number
  /** retryOnRateLimit defines the retry upon receiving a 429 status code from the remote-write storage. This is an *experimental feature*, it may change in any upcoming release in a breaking way. */
  "retryOnRateLimit"?: boolean
  /** sampleAgeLimit drops samples older than the limit. It requires Prometheus >= v2.50.0 or Thanos >= v0.32.0. */
  "sampleAgeLimit"?: string
}

export interface WriteRelabelConfigsItem {
  /** action to perform based on the regex matching. `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0. Default: "Replace" */
  "action"?: "replace" | "Replace" | "keep" | "Keep" | "drop" | "Drop" | "hashmod" | "HashMod" | "labelmap" | "LabelMap" | "labeldrop" | "LabelDrop" | "labelkeep" | "LabelKeep" | "lowercase" | "Lowercase" | "uppercase" | "Uppercase" | "keepequal" | "KeepEqual" | "dropequal" | "DropEqual"
  /** modulus to take of the hash of the source label values. Only applicable when the action is `HashMod`. */
  "modulus"?: number
  /** regex defines the regular expression against which the extracted value is matched. */
  "regex"?: string
  /** replacement value against which a Replace action is performed if the regular expression matches. Regex capture groups are available. */
  "replacement"?: string
  /** separator defines the string between concatenated SourceLabels. */
  "separator"?: string
  /** sourceLabels defines the source labels select values from existing labels. Their content is concatenated using the configured Separator and matched against the configured regular expression. */
  "sourceLabels"?: string[]
  /** targetLabel defines the label to which the resulting string is written in a replacement. It is mandatory for `Replace`, `HashMod`, `Lowercase`, `Uppercase`, `KeepEqual` and `DropEqual` actions. Regex capture groups are available. */
  "targetLabel"?: string
}

export interface RemoteWriteItem {
  /** authorization section for the URL. It requires Prometheus >= v2.26.0 or Thanos >= v0.24.0. Cannot be set at the same time as `sigv4`, `basicAuth`, `oauth2`, or `azureAd`. */
  "authorization"?: Authorization2
  /** azureAd for the URL. It requires Prometheus >= v2.45.0 or Thanos >= v0.31.0. Cannot be set at the same time as `authorization`, `basicAuth`, `oauth2`, or `sigv4`. */
  "azureAd"?: AzureAd
  /** basicAuth configuration for the URL. Cannot be set at the same time as `sigv4`, `authorization`, `oauth2`, or `azureAd`. */
  "basicAuth"?: BasicAuth
  /** bearerToken is deprecated: this will be removed in a future release. *Warning: this field shouldn't be used because the token value appears in clear-text. Prefer using `authorization`.* */
  "bearerToken"?: string
  /** bearerTokenFile defines the file from which to read bearer token for the URL. Deprecated: this will be removed in a future release. Prefer using `authorization`. */
  "bearerTokenFile"?: string
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. It requires Prometheus >= v2.26.0 or Thanos >= v0.24.0. */
  "followRedirects"?: boolean
  /** headers defines the custom HTTP headers to be sent along with each remote write request. Be aware that headers that are set by Prometheus itself can't be overwritten. It requires Prometheus >= v2.25.0 or Thanos >= v0.24.0. */
  "headers"?: Record<string, unknown>
  /** messageVersion defines the Remote Write message's version to use when writing to the endpoint. `Version1.0` corresponds to the `prometheus.WriteRequest` protobuf message introduced in Remote Write 1.0. `Version2.0` corresponds to the `io.prometheus.write.v2.Request` protobuf message introduced in Remote Write 2.0. When `Version2.0` is selected, Prometheus will automatically be configured to append the metadata of scraped metrics to the WAL. Before setting this field, consult with your remote storage provider what message version it supports. It requires Prometheus >= v2.54.0 or Thanos >= v0.37.0. */
  "messageVersion"?: "V1.0" | "V2.0"
  /** metadataConfig defines how to send a series metadata to the remote storage. When the field is empty, **no metadata** is sent. But when the field is null, metadata is sent. */
  "metadataConfig"?: MetadataConfig
  /** name of the remote write queue, it must be unique if specified. The name is used in metrics and logging in order to differentiate queues. It requires Prometheus >= v2.15.0 or Thanos >= 0.24.0. */
  "name"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 configuration for the URL. It requires Prometheus >= v2.27.0 or Thanos >= v0.24.0. Cannot be set at the same time as `sigv4`, `authorization`, `basicAuth`, or `azureAd`. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** queueConfig allows tuning of the remote write queue parameters. */
  "queueConfig"?: QueueConfig
  /** remoteTimeout defines the timeout for requests to the remote write endpoint. */
  "remoteTimeout"?: string
  /** roundRobinDNS controls the DNS resolution behavior for remote-write connections. When enabled:   - The remote-write mechanism will resolve the hostname via DNS.   - It will randomly select one of the resolved IP addresses and connect to it. When disabled (default behavior):   - The Go standard library will handle hostname resolution.   - It will attempt connections to each resolved IP address sequentially. Note: The connection timeout applies to the entire resolution and connection process. 	If disabled, the timeout is distributed across all connection attempts. It requires Prometheus >= v3.1.0 or Thanos >= v0.38.0. */
  "roundRobinDNS"?: boolean
  /** sendExemplars enables sending of exemplars over remote write. Note that exemplar-storage itself must be enabled using the `spec.enableFeatures` option for exemplars to be scraped in the first place. It requires Prometheus >= v2.27.0 or Thanos >= v0.24.0. */
  "sendExemplars"?: boolean
  /** sendNativeHistograms enables sending of native histograms, also known as sparse histograms over remote write. It requires Prometheus >= v2.40.0 or Thanos >= v0.30.0. */
  "sendNativeHistograms"?: boolean
  /** sigv4 defines the AWS's Signature Verification 4 for the URL. It requires Prometheus >= v2.26.0 or Thanos >= v0.24.0. Cannot be set at the same time as `authorization`, `basicAuth`, `oauth2`, or `azureAd`. */
  "sigv4"?: Sigv4
  /** tlsConfig to use for the URL. */
  "tlsConfig"?: TlsConfig4
  /** url defines the URL of the endpoint to send samples to. It must use the HTTP or HTTPS scheme. */
  "url": string
  /** writeRelabelConfigs defines the list of remote write relabel configurations. */
  "writeRelabelConfigs"?: WriteRelabelConfigsItem[]
}

export interface RuleNamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface RuleSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface Alert {
  /** forGracePeriod defines the minimum duration between alert and restored 'for' state. This is maintained only for alerts with a configured 'for' time greater than the grace period. */
  "forGracePeriod"?: string
  /** forOutageTolerance defines the max time to tolerate prometheus outage for restoring 'for' state of alert. */
  "forOutageTolerance"?: string
  /** resendDelay defines the minimum amount of time to wait before resending an alert to Alertmanager. */
  "resendDelay"?: string
}

export interface Rules {
  /** alert defines the parameters of the Prometheus rules' engine. Any update to these parameters trigger a restart of the pods. */
  "alert"?: Alert
}

export interface Runtime {
  /** goGC defines the Go garbage collection target percentage. Lowering this number may increase the CPU usage. See: https://tip.golang.org/doc/gc-guide#GOGC */
  "goGC"?: number
}

export interface ScrapeClassesItem {
  /** attachMetadata defines additional metadata to the discovered targets. When the scrape object defines its own configuration, it takes precedence over the scrape class configuration. */
  "attachMetadata"?: AttachMetadata
  /** authorization section for the ScrapeClass. It will only apply if the scrape resource doesn't specify any Authorization. */
  "authorization"?: Authorization2
  /** default defines that the scrape applies to all scrape objects that don't configure an explicit scrape class name. Only one scrape class can be set as the default. */
  "default"?: boolean
  /** fallbackScrapeProtocol defines the protocol to use if a scrape returns blank, unparseable, or otherwise invalid Content-Type. It will only apply if the scrape resource doesn't specify any FallbackScrapeProtocol It requires Prometheus >= v3.0.0. */
  "fallbackScrapeProtocol"?: "PrometheusProto" | "OpenMetricsText0.0.1" | "OpenMetricsText1.0.0" | "PrometheusText0.0.4" | "PrometheusText1.0.0"
  /** metricRelabelings defines the relabeling rules to apply to all samples before ingestion. The Operator adds the scrape class metric relabelings defined here. Then the Operator adds the target-specific metric relabelings defined in ServiceMonitors, PodMonitors, Probes and ScrapeConfigs. Then the Operator adds namespace enforcement relabeling rule, specified in '.spec.enforcedNamespaceLabel'. More info: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#metric_relabel_configs */
  "metricRelabelings"?: MetricRelabelingsItem[]
  /** name of the scrape class. */
  "name": string
  /** relabelings defines the relabeling rules to apply to all scrape targets. The Operator automatically adds relabelings for a few standard Kubernetes fields like `__meta_kubernetes_namespace` and `__meta_kubernetes_service_name`. Then the Operator adds the scrape class relabelings defined here. Then the Operator adds the target-specific relabelings defined in the scrape object. More info: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config */
  "relabelings"?: RelabelingsItem[]
  /** tlsConfig defines the TLS settings to use for the scrape. When the scrape objects define their own CA, certificate and/or key, they take precedence over the corresponding scrape class fields. For now only the `caFile`, `certFile` and `keyFile` fields are supported. */
  "tlsConfig"?: TlsConfig4
}

export interface ScrapeConfigNamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface ScrapeConfigSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface ServiceMonitorNamespaceSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface ServiceMonitorSelector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface Retain {
  /** retentionPeriod defines how long the scaled-down shard(s) need to be kept before being deleted. */
  "retentionPeriod": string
}

export interface ShardRetentionPolicy {
  /** retain defines the config for retention when the retention policy is set to `Retain`. If not defined, the operator will use the retention duration configured for the Prometheus data. If the resource uses size-based retention, the shard(s) are kept forever (unless manually deleted). */
  "retain"?: Retain
  /** whenScaled defines the retention policy when the Prometheus shards are scaled down. * `Delete`, the operator will delete the pods from the scaled-down shard(s). * `Retain`, the operator will keep the pods from the scaled-down shard(s), so the data can still be queried. If not defined, the operator assumes the `Delete` value. */
  "whenScaled"?: "Retain" | "Delete"
}

export interface Topology {
  /** externalLabelName defines the name of the Prometheus external label used to communicate the topology zone assigned to the Prometheus instance. If not defined, it defaults to "zone". If set to the empty string, no external label is added to the Prometheus configuration. */
  "externalLabelName"?: string
  /** values defines the list of topology values (e.g. zone names) to be used for sharding. The configured number of shards must be greater than or equal to the number of values. */
  "values"?: string[]
}

export interface ShardingStrategy {
  /** mode defines the sharding mode. Can be 'Address' or 'Topology'. 'Address' is the default mode and distributes targets across shards based on a hash of the target address. 'Topology' enables zone-aware sharding where each shard is assigned to a specific topology zone and only scrapes targets in that zone. (Alpha) Using the 'Topology' mode requires the `PrometheusTopologySharding` feature gate to be enabled. */
  "mode"?: "Address" | "Topology"
  /** topology defines the configuration for topology-aware sharding. This field is only valid when mode is set to 'Topology'. */
  "topology"?: Topology
}

export interface GrpcServerTlsConfig {
  /** ca defines the Certificate authority used when verifying server certificates. */
  "ca"?: Ca
  /** caFile defines the path to the CA cert in the Prometheus container to use for the targets. */
  "caFile"?: string
  /** cert defines the Client certificate to present when doing client-authentication. */
  "cert"?: Cert
  /** certFile defines the path to the client cert file in the Prometheus container for the targets. */
  "certFile"?: string
  /** cipherSuites defines the list of supported cipher suites for TLS versions up to TLS 1.2. If not defined, the Go default cipher suites are used. Available cipher suites are documented in the Go documentation: https://golang.org/pkg/crypto/tls/#pkg-constants It requires Thanos >= v0.42.0. Note that the operator doesn't verify if the Thanos version supports the provided values. */
  "cipherSuites"?: string[]
  /** curves defines the list of preferred elliptic curves for TLS handshakes. If not defined, the Go default curves are used. Available curves are documented in the Go documentation: https://golang.org/pkg/crypto/tls/#CurveID It requires Thanos >= v0.42.0. Note that the operator doesn't verify if the Thanos version supports the provided values. */
  "curves"?: string[]
  /** insecureSkipVerify defines how to disable target certificate validation. */
  "insecureSkipVerify"?: boolean
  /** keyFile defines the path to the client key file in the Prometheus container for the targets. */
  "keyFile"?: string
  /** keySecret defines the Secret containing the client key file for the targets. */
  "keySecret"?: KeySecret
  /** maxVersion defines the maximum acceptable TLS version. It requires Prometheus >= v2.41.0 or Thanos >= v0.31.0. */
  "maxVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** minVersion defines the minimum acceptable TLS version. It requires Prometheus >= v2.35.0 or Thanos >= v0.28.0. */
  "minVersion"?: "TLS10" | "TLS11" | "TLS12" | "TLS13"
  /** serverName is used to verify the hostname for the targets. */
  "serverName"?: string
}

export interface ObjectStorageConfig {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface TracingConfig {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Thanos {
  /** additionalArgs allows setting additional arguments for the Thanos container. The arguments are passed as-is to the Thanos container which may cause issues if they are invalid or not supported the given Thanos version. In case of an argument conflict (e.g. an argument which is already set by the operator itself) or when providing an invalid argument, the reconciliation will fail and an error will be logged. */
  "additionalArgs"?: AdditionalArgsItem[]
  /** baseImage is deprecated: use 'image' instead. */
  "baseImage"?: string
  /** blockSize controls the size of TSDB blocks produced by Prometheus. The default value is 2h to match the upstream Prometheus defaults. WARNING: Changing the block duration can impact the performance and efficiency of the entire Prometheus/Thanos stack due to how it interacts with memory and Thanos compactors. It is recommended to keep this value set to a multiple of 120 times your longest scrape or rule interval. For example, 30s * 120 = 1h. */
  "blockSize"?: string
  /** getConfigInterval defines how often to retrieve the Prometheus configuration. */
  "getConfigInterval"?: string
  /** getConfigTimeout defines the maximum time to wait when retrieving the Prometheus configuration. */
  "getConfigTimeout"?: string
  /** grpcListenLocal defines when true, the Thanos sidecar listens on the loopback interface instead of the Pod IP's address for the gRPC endpoints. It has no effect if `listenLocal` is true. */
  "grpcListenLocal"?: boolean
  /** grpcServerTlsConfig defines the TLS parameters for the gRPC server providing the StoreAPI. Note: Currently only the `minVersion`, `caFile`, `certFile`, `keyFile`, `cipherSuites` and `curves` fields are supported. */
  "grpcServerTlsConfig"?: GrpcServerTlsConfig
  /** httpListenLocal when true, the Thanos sidecar listens on the loopback interface instead of the Pod IP's address for the HTTP endpoints. It has no effect if `listenLocal` is true. */
  "httpListenLocal"?: boolean
  /** image defines the container image name for Thanos. If specified, it takes precedence over the `spec.thanos.baseImage`, `spec.thanos.tag` and `spec.thanos.sha` fields. Specifying `spec.thanos.version` is still necessary to ensure the Prometheus Operator knows which version of Thanos is being configured. If neither `spec.thanos.image` nor `spec.thanos.baseImage` are defined, the operator will use the latest upstream version of Thanos available at the time when the operator was released. */
  "image"?: string
  /** listenLocal is deprecated: use `grpcListenLocal` and `httpListenLocal` instead. */
  "listenLocal"?: boolean
  /** logFormat for the Thanos sidecar. */
  "logFormat"?: "" | "logfmt" | "json"
  /** logLevel for the Thanos sidecar. */
  "logLevel"?: "" | "debug" | "info" | "warn" | "error"
  /** minTime defines the start of time range limit served by the Thanos sidecar's StoreAPI. The field's value should be a constant time in RFC3339 format or a time duration relative to current time, such as -1d or 2h45m. Valid duration units are ms, s, m, h, d, w, y. */
  "minTime"?: string
  /** objectStorageConfig defines the Thanos sidecar's configuration to upload TSDB blocks to object storage. More info: https://thanos.io/tip/thanos/storage.md/ objectStorageConfigFile takes precedence over this field. */
  "objectStorageConfig"?: ObjectStorageConfig
  /** objectStorageConfigFile defines the Thanos sidecar's configuration file to upload TSDB blocks to object storage. More info: https://thanos.io/tip/thanos/storage.md/ This field takes precedence over objectStorageConfig. */
  "objectStorageConfigFile"?: string
  /** readyTimeout defines the maximum time that the Thanos sidecar will wait for Prometheus to start. */
  "readyTimeout"?: string
  /** resources defines the resources requests and limits of the Thanos sidecar. */
  "resources"?: Resources
  /** sha is deprecated: use 'image' instead.  The image digest can be specified as part of the image name. */
  "sha"?: string
  /** tag is deprecated: use 'image' instead. The image's tag can be specified as as part of the image name. */
  "tag"?: string
  /** tracingConfig defines the tracing configuration for the Thanos sidecar. `tracingConfigFile` takes precedence over this field. More info: https://thanos.io/tip/thanos/tracing.md/ This is an *experimental feature*, it may change in any upcoming release in a breaking way. */
  "tracingConfig"?: TracingConfig
  /** tracingConfigFile defines the tracing configuration file for the Thanos sidecar. This field takes precedence over `tracingConfig`. More info: https://thanos.io/tip/thanos/tracing.md/ This is an *experimental feature*, it may change in any upcoming release in a breaking way. */
  "tracingConfigFile"?: string
  /** version of Thanos being deployed. The operator uses this information to generate the Prometheus StatefulSet + configuration files. If not specified, the operator assumes the latest upstream release of Thanos available at the time when the version of the operator was released. */
  "version"?: string
  /** volumeMounts allows configuration of additional VolumeMounts for Thanos. VolumeMounts specified will be appended to other VolumeMounts in the 'thanos-sidecar' container. */
  "volumeMounts"?: VolumeMountsItem[]
}

export interface TopologySpreadConstraintsItem2 {
  /** additionalLabelSelectors Defines what Prometheus Operator managed labels should be added to labelSelector on the topologySpreadConstraint. */
  "additionalLabelSelectors"?: "OnResource" | "OnShard"
  /** LabelSelector is used to find matching pods. Pods that match this label selector are counted to determine the number of pods in their corresponding topology domain. */
  "labelSelector"?: LabelSelector
  /** MatchLabelKeys is a set of pod label keys to select the pods over which spreading will be calculated. The keys are used to lookup values from the incoming pod labels, those key-value labels are ANDed with labelSelector to select the group of existing pods over which spreading will be calculated for the incoming pod. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. MatchLabelKeys cannot be set when LabelSelector isn't set. Keys that don't exist in the incoming pod labels will be ignored. A null or empty list means only match against labelSelector. This is a beta field and requires the MatchLabelKeysInPodTopologySpread feature gate to be enabled (enabled by default). */
  "matchLabelKeys"?: string[]
  /** MaxSkew describes the degree to which pods may be unevenly distributed. When `whenUnsatisfiable=DoNotSchedule`, it is the maximum permitted difference between the number of matching pods in the target topology and the global minimum. The global minimum is the minimum number of matching pods in an eligible domain or zero if the number of eligible domains is less than MinDomains. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 2/2/1: In this case, the global minimum is 1. | zone1 | zone2 | zone3 | |  P P  |  P P  |   P   | - if MaxSkew is 1, incoming pod can only be scheduled to zone3 to become 2/2/2; scheduling it onto zone1(zone2) would make the ActualSkew(3-1) on zone1(zone2) violate MaxSkew(1). - if MaxSkew is 2, incoming pod can be scheduled onto any zone. When `whenUnsatisfiable=ScheduleAnyway`, it is used to give higher precedence to topologies that satisfy it. It's a required field. Default value is 1 and 0 is not allowed. */
  "maxSkew": number
  /** MinDomains indicates a minimum number of eligible domains. When the number of eligible domains with matching topology keys is less than minDomains, Pod Topology Spread treats "global minimum" as 0, and then the calculation of Skew is performed. And when the number of eligible domains with matching topology keys equals or greater than minDomains, this value has no effect on scheduling. As a result, when the number of eligible domains is less than minDomains, scheduler won't schedule more than maxSkew Pods to those domains. If value is nil, the constraint behaves as if MinDomains is equal to 1. Valid values are integers greater than 0. When value is not nil, WhenUnsatisfiable must be DoNotSchedule. For example, in a 3-zone cluster, MaxSkew is set to 2, MinDomains is set to 5 and pods with the same labelSelector spread as 2/2/2: | zone1 | zone2 | zone3 | |  P P  |  P P  |  P P  | The number of domains is less than 5(MinDomains), so "global minimum" is treated as 0. In this situation, new pod with the same labelSelector cannot be scheduled, because computed skew will be 3(3 - 0) if new Pod is scheduled to any of the three zones, it will violate MaxSkew. */
  "minDomains"?: number
  /** NodeAffinityPolicy indicates how we will treat Pod's nodeAffinity/nodeSelector when calculating pod topology spread skew. Options are: - Honor: only nodes matching nodeAffinity/nodeSelector are included in the calculations. - Ignore: nodeAffinity/nodeSelector are ignored. All nodes are included in the calculations. If this value is nil, the behavior is equivalent to the Honor policy. */
  "nodeAffinityPolicy"?: string
  /** NodeTaintsPolicy indicates how we will treat node taints when calculating pod topology spread skew. Options are: - Honor: nodes without taints, along with tainted nodes for which the incoming pod has a toleration, are included. - Ignore: node taints are ignored. All nodes are included. If this value is nil, the behavior is equivalent to the Ignore policy. */
  "nodeTaintsPolicy"?: string
  /** TopologyKey is the key of node labels. Nodes that have a label with this key and identical values are considered to be in the same topology. We consider each <key, value> as a "bucket", and try to put balanced number of pods into each bucket. We define a domain as a particular instance of a topology. Also, we define an eligible domain as a domain whose nodes meet the requirements of nodeAffinityPolicy and nodeTaintsPolicy. e.g. If TopologyKey is "kubernetes.io/hostname", each Node is a domain of that topology. And, if TopologyKey is "topology.kubernetes.io/zone", each zone is a domain of that topology. It's a required field. */
  "topologyKey": string
  /** WhenUnsatisfiable indicates how to deal with a pod if it doesn't satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,   but giving higher precedence to topologies that would help reduce the   skew. A constraint is considered "Unsatisfiable" for an incoming pod if and only if every possible node assignment for that pod would violate "MaxSkew" on some topology. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 3/1/1: | zone1 | zone2 | zone3 | | P P P |   P   |   P   | If WhenUnsatisfiable is set to DoNotSchedule, incoming pod can only be scheduled to zone2(zone3) to become 3/2/1(3/1/2) as ActualSkew(2-1) on zone2(zone3) satisfies MaxSkew(1). In other words, the cluster can still be imbalanced, but scheduler won't make it *more* imbalanced. It's a required field. */
  "whenUnsatisfiable": string
}

export interface TracingConfig2 {
  /** clientType defines the client used to export the traces. Supported values are `HTTP` and `GRPC`. */
  "clientType"?: "http" | "grpc" | "HTTP" | "GRPC"
  /** compression key for supported compression types. The only supported value is `Gzip`. */
  "compression"?: "gzip" | "Gzip"
  /** endpoint to send the traces to. Should be provided in format <host>:<port>. */
  "endpoint": string
  /** headers defines the key-value pairs to be used as headers associated with gRPC or HTTP requests. */
  "headers"?: Record<string, unknown>
  /** insecure if disabled, the client will use a secure connection. */
  "insecure"?: boolean
  /** samplingFraction defines the probability a given trace will be sampled. Must be a float from 0 through 1. */
  "samplingFraction"?: number | string
  /** timeout defines the maximum time the exporter will wait for each batch export. */
  "timeout"?: string
  /** tlsConfig to use when sending traces. */
  "tlsConfig"?: TlsConfig4
}

export interface ChunkEncoding {
  /** floats selects the encoding used for float chunks. Valid values are "Xor" and "Xor2". Notice:  * Setting "Xor" is incompatible with --enable-feature=st-storage (XOR chunks do not store start timestamps).  * Setting "Xor2" automatically adds the `xor2-encoding` feature flag. It requires Prometheus >= v3.13.0. */
  "floats"?: "Xor" | "Xor2"
}

export interface Tsdb {
  /** chunkEncoding configures per-chunk-type encoding overrides. It requires Prometheus >= v3.13.0. Notice: Setting "Xor" is incompatible with --enable-feature=st-storage (XOR chunks do not store start timestamps). */
  "chunkEncoding"?: ChunkEncoding
  /** outOfOrderTimeWindow defines how old an out-of-order/out-of-bounds sample can be with respect to the TSDB max time. An out-of-order/out-of-bounds sample is ingested into the TSDB as long as the timestamp of the sample is >= (TSDB.MaxTime - outOfOrderTimeWindow). This is an *experimental feature*, it may change in any upcoming release in a breaking way. It requires Prometheus >= v2.39.0 or PrometheusAgent >= v2.54.0. */
  "outOfOrderTimeWindow"?: string
  /** staleSeriesCompactionThreshold configures the trigger point for compacting stale series from memory into persistent blocks and removing those stale series from memory. The threshold is a number between 0.0 and 1.0. It represents the ratio of stale series in memory to the total series in memory. The stale series compaction is triggered when this ratio crosses the configured threshold. It may not trigger the stale series compaction if the usual head compaction is about to happen soon. If set to 0, stale series compaction is disabled. It requires Prometheus >= v3.10.0. */
  "staleSeriesCompactionThreshold"?: number | string
}

export interface Web2 {
  /** httpConfig defines HTTP parameters for web server. */
  "httpConfig"?: HttpConfig2
  /** maxConnections defines the maximum number of simultaneous connections A zero value means that Prometheus doesn't accept any incoming connection. */
  "maxConnections"?: number
  /** pageTitle defines the prometheus web page title. */
  "pageTitle"?: string
  /** tlsConfig defines the TLS parameters for HTTPS. */
  "tlsConfig"?: TlsConfig2
}

export interface PrometheusSpec {
  /** additionalAlertManagerConfigs defines a key of a Secret containing additional Prometheus Alertmanager configurations. The Alertmanager configurations are appended to the configuration generated by the Prometheus Operator. They must be formatted according to the official Prometheus documentation: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alertmanager_config The user is responsible for making sure that the configurations are valid Note that using this feature may expose the possibility to break upgrades of Prometheus. It is advised to review Prometheus release notes to ensure that no incompatible AlertManager configs are going to break Prometheus after the upgrade. */
  "additionalAlertManagerConfigs"?: AdditionalAlertManagerConfigs
  /** additionalAlertRelabelConfigs defines a key of a Secret containing additional Prometheus alert relabel configurations. The alert relabel configurations are appended to the configuration generated by the Prometheus Operator. They must be formatted according to the official Prometheus documentation: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alert_relabel_configs The user is responsible for making sure that the configurations are valid Note that using this feature may expose the possibility to break upgrades of Prometheus. It is advised to review Prometheus release notes to ensure that no incompatible alert relabel configs are going to break Prometheus after the upgrade. */
  "additionalAlertRelabelConfigs"?: AdditionalAlertRelabelConfigs
  /** additionalArgs allows setting additional arguments for the 'prometheus' container. It is intended for e.g. activating hidden flags which are not supported by the dedicated configuration options yet. The arguments are passed as-is to the Prometheus container which may cause issues if they are invalid or not supported by the given Prometheus version. In case of an argument conflict (e.g. an argument which is already set by the operator itself) or when providing an invalid argument, the reconciliation will fail and an error will be logged. */
  "additionalArgs"?: AdditionalArgsItem[]
  /** additionalScrapeConfigs allows specifying a key of a Secret containing additional Prometheus scrape configurations. Scrape configurations specified are appended to the configurations generated by the Prometheus Operator. Job configurations specified must have the form as specified in the official Prometheus documentation: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config. As scrape configs are appended, the user is responsible to make sure it is valid. Note that using this feature may expose the possibility to break upgrades of Prometheus. It is advised to review Prometheus release notes to ensure that no incompatible scrape configs are going to break Prometheus after the upgrade. */
  "additionalScrapeConfigs"?: AdditionalScrapeConfigs
  /** affinity defines the Pods' affinity scheduling rules if specified. */
  "affinity"?: Affinity
  /** alerting defines the settings related to Alertmanager. */
  "alerting"?: Alerting
  /** allowOverlappingBlocks enables vertical compaction and vertical query merge in Prometheus. Deprecated: this flag has no effect for Prometheus >= 2.39.0 where overlapping blocks are enabled by default. */
  "allowOverlappingBlocks"?: boolean
  /** apiserverConfig allows specifying a host and auth methods to access the Kuberntees API server. If null, Prometheus is assumed to run inside of the cluster: it will discover the API servers automatically and use the Pod's CA certificate and bearer token file at /var/run/secrets/kubernetes.io/serviceaccount/. */
  "apiserverConfig"?: ApiserverConfig
  /** arbitraryFSAccessThroughSMs when true, ServiceMonitor, PodMonitor and Probe object are forbidden to reference arbitrary files on the file system of the 'prometheus' container. When a ServiceMonitor's endpoint specifies a `bearerTokenFile` value (e.g.  '/var/run/secrets/kubernetes.io/serviceaccount/token'), a malicious target can get access to the Prometheus service account's token in the Prometheus' scrape request. Setting `spec.arbitraryFSAccessThroughSM` to 'true' would prevent the attack. Users should instead provide the credentials using the `spec.bearerTokenSecret` field. */
  "arbitraryFSAccessThroughSMs"?: ArbitraryFSAccessThroughSMs
  /** automountServiceAccountToken defines whether a service account token should be automatically mounted in the pod. If the field isn't set, the operator mounts the service account token by default. **Warning:** be aware that by default, Prometheus requires the service account token for Kubernetes service discovery. It is possible to use strategic merge patch to project the service account token into the 'prometheus' container. */
  "automountServiceAccountToken"?: boolean
  /** baseImage is deprecated: use 'spec.image' instead. */
  "baseImage"?: string
  /** bodySizeLimit defines per-scrape on response body size. Only valid in Prometheus versions 2.45.0 and newer. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedBodySizeLimit. */
  "bodySizeLimit"?: string
  /** configMaps defines a list of ConfigMaps in the same namespace as the Prometheus object, which shall be mounted into the Prometheus Pods. Each ConfigMap is added to the StatefulSet definition as a volume named `configmap-<configmap-name>`. The ConfigMaps are mounted into /etc/prometheus/configmaps/<configmap-name> in the 'prometheus' container. */
  "configMaps"?: string[]
  /** containers allows injecting additional containers or modifying operator generated containers. This can be used to allow adding an authentication proxy to the Pods or to change the behavior of an operator generated container. Containers described here modify an operator generated container if they share the same name and modifications are done via a strategic merge patch. The names of containers managed by the operator are: * `prometheus` * `config-reloader` * `thanos-sidecar` Overriding containers which are managed by the operator require careful testing, especially when upgrading to a new version of the operator. */
  "containers"?: ContainersItem[]
  /** convertClassicHistogramsToNHCB defines whether to convert all scraped classic histograms into a native histogram with custom buckets. It requires Prometheus >= v3.4.0. */
  "convertClassicHistogramsToNHCB"?: boolean
  /** disableCompaction when true, the Prometheus compaction is disabled. When `spec.thanos.objectStorageConfig` or `spec.thanos.objectStorageConfigFile` are defined, the operator's default handling depends on the Prometheus and Thanos sidecar versions:   - With Prometheus < v3.9.0 or a Thanos sidecar < v0.41.0, block compaction is disabled to avoid race     conditions during block uploads (as the Thanos documentation recommends).   - With Prometheus >= v3.9.0 and a Thanos sidecar >= v0.41.0, local compaction is kept enabled and coordinated     with the sidecar through the shipper meta file (`--storage.tsdb.delay-compact-file.path`), so blocks are only     compacted after they have been uploaded. Setting this field to true always disables local compaction regardless of the versions. */
  "disableCompaction"?: boolean
  /** dnsConfig defines the DNS configuration for the pods. */
  "dnsConfig"?: DnsConfig
  /** dnsPolicy defines the DNS policy for the pods. */
  "dnsPolicy"?: "ClusterFirstWithHostNet" | "ClusterFirst" | "Default" | "None"
  /** enableAdminAPI defines access to the Prometheus web admin API. WARNING: Enabling the admin APIs enables mutating endpoints, to delete data, shutdown Prometheus, and more. Enabling this should be done with care and the user is advised to add additional authentication authorization via a proxy to ensure only clients authorized to perform these actions can do so. For more information: https://prometheus.io/docs/prometheus/latest/querying/api/#tsdb-admin-apis */
  "enableAdminAPI"?: boolean
  /** enableFeatures enables access to Prometheus feature flags. By default, no features are enabled. Enabling features which are disabled by default is entirely outside the scope of what the maintainers will support and by doing so, you accept that this behaviour may break at any time without notice. For more information see https://prometheus.io/docs/prometheus/latest/feature_flags/ */
  "enableFeatures"?: string[]
  /** enableOTLPReceiver defines the Prometheus to be used as a receiver for the OTLP Metrics protocol. Note that the OTLP receiver endpoint is automatically enabled if `.spec.otlpConfig` is defined. It requires Prometheus >= v2.47.0. */
  "enableOTLPReceiver"?: boolean
  /** enableRemoteWriteReceiver defines the Prometheus to be used as a receiver for the Prometheus remote write protocol. WARNING: This is not considered an efficient way of ingesting samples. Use it with caution for specific low-volume use cases. It is not suitable for replacing the ingestion via scraping and turning Prometheus into a push-based metrics collection system. For more information see https://prometheus.io/docs/prometheus/latest/querying/api/#remote-write-receiver It requires Prometheus >= v2.33.0. */
  "enableRemoteWriteReceiver"?: boolean
  /** enableServiceLinks defines whether information about services should be injected into pod's environment variables */
  "enableServiceLinks"?: boolean
  /** enforcedBodySizeLimit when defined specifies a global limit on the size of uncompressed response body that will be accepted by Prometheus. Targets responding with a body larger than this many bytes will cause the scrape to fail. It requires Prometheus >= v2.28.0. When both `enforcedBodySizeLimit` and `bodySizeLimit` are defined and greater than zero, the following rules apply: * Scrape objects without a defined bodySizeLimit value will inherit the global bodySizeLimit value (Prometheus >= 2.45.0) or the enforcedBodySizeLimit value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedBodySizeLimit` is greater than the `bodySizeLimit`, the `bodySizeLimit` will be set to `enforcedBodySizeLimit`. * Scrape objects with a bodySizeLimit value less than or equal to enforcedBodySizeLimit keep their specific value. * Scrape objects with a bodySizeLimit value greater than enforcedBodySizeLimit are set to enforcedBodySizeLimit. */
  "enforcedBodySizeLimit"?: string
  /** enforcedKeepDroppedTargets when defined specifies a global limit on the number of targets dropped by relabeling that will be kept in memory. The value overrides any `spec.keepDroppedTargets` set by ServiceMonitor, PodMonitor, Probe objects unless `spec.keepDroppedTargets` is greater than zero and less than `spec.enforcedKeepDroppedTargets`. It requires Prometheus >= v2.47.0. When both `enforcedKeepDroppedTargets` and `keepDroppedTargets` are defined and greater than zero, the following rules apply: * Scrape objects without a defined keepDroppedTargets value will inherit the global keepDroppedTargets value (Prometheus >= 2.45.0) or the enforcedKeepDroppedTargets value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedKeepDroppedTargets` is greater than the `keepDroppedTargets`, the `keepDroppedTargets` will be set to `enforcedKeepDroppedTargets`. * Scrape objects with a keepDroppedTargets value less than or equal to enforcedKeepDroppedTargets keep their specific value. * Scrape objects with a keepDroppedTargets value greater than enforcedKeepDroppedTargets are set to enforcedKeepDroppedTargets. */
  "enforcedKeepDroppedTargets"?: number
  /** enforcedLabelLimit when defined specifies a global limit on the number of labels per sample. The value overrides any `spec.labelLimit` set by ServiceMonitor, PodMonitor, Probe objects unless `spec.labelLimit` is greater than zero and less than `spec.enforcedLabelLimit`. It requires Prometheus >= v2.27.0. When both `enforcedLabelLimit` and `labelLimit` are defined and greater than zero, the following rules apply: * Scrape objects without a defined labelLimit value will inherit the global labelLimit value (Prometheus >= 2.45.0) or the enforcedLabelLimit value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedLabelLimit` is greater than the `labelLimit`, the `labelLimit` will be set to `enforcedLabelLimit`. * Scrape objects with a labelLimit value less than or equal to enforcedLabelLimit keep their specific value. * Scrape objects with a labelLimit value greater than enforcedLabelLimit are set to enforcedLabelLimit. */
  "enforcedLabelLimit"?: number
  /** enforcedLabelNameLengthLimit when defined specifies a global limit on the length of labels name per sample. The value overrides any `spec.labelNameLengthLimit` set by ServiceMonitor, PodMonitor, Probe objects unless `spec.labelNameLengthLimit` is greater than zero and less than `spec.enforcedLabelNameLengthLimit`. It requires Prometheus >= v2.27.0. When both `enforcedLabelNameLengthLimit` and `labelNameLengthLimit` are defined and greater than zero, the following rules apply: * Scrape objects without a defined labelNameLengthLimit value will inherit the global labelNameLengthLimit value (Prometheus >= 2.45.0) or the enforcedLabelNameLengthLimit value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedLabelNameLengthLimit` is greater than the `labelNameLengthLimit`, the `labelNameLengthLimit` will be set to `enforcedLabelNameLengthLimit`. * Scrape objects with a labelNameLengthLimit value less than or equal to enforcedLabelNameLengthLimit keep their specific value. * Scrape objects with a labelNameLengthLimit value greater than enforcedLabelNameLengthLimit are set to enforcedLabelNameLengthLimit. */
  "enforcedLabelNameLengthLimit"?: number
  /** enforcedLabelValueLengthLimit when not null defines a global limit on the length of labels value per sample. The value overrides any `spec.labelValueLengthLimit` set by ServiceMonitor, PodMonitor, Probe objects unless `spec.labelValueLengthLimit` is greater than zero and less than `spec.enforcedLabelValueLengthLimit`. It requires Prometheus >= v2.27.0. When both `enforcedLabelValueLengthLimit` and `labelValueLengthLimit` are defined and greater than zero, the following rules apply: * Scrape objects without a defined labelValueLengthLimit value will inherit the global labelValueLengthLimit value (Prometheus >= 2.45.0) or the enforcedLabelValueLengthLimit value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedLabelValueLengthLimit` is greater than the `labelValueLengthLimit`, the `labelValueLengthLimit` will be set to `enforcedLabelValueLengthLimit`. * Scrape objects with a labelValueLengthLimit value less than or equal to enforcedLabelValueLengthLimit keep their specific value. * Scrape objects with a labelValueLengthLimit value greater than enforcedLabelValueLengthLimit are set to enforcedLabelValueLengthLimit. */
  "enforcedLabelValueLengthLimit"?: number
  /** enforcedNamespaceLabel when not empty, a label will be added to: 1. All metrics scraped from `ServiceMonitor`, `PodMonitor`, `Probe` and `ScrapeConfig` objects. 2. All metrics generated from recording rules defined in `PrometheusRule` objects. 3. All alerts generated from alerting rules defined in `PrometheusRule` objects. 4. All vector selectors of PromQL expressions defined in `PrometheusRule` objects. The label will not added for objects referenced in `spec.excludedFromEnforcement`. The label's name is this field's value. The label's value is the namespace of the `ServiceMonitor`, `PodMonitor`, `Probe`, `PrometheusRule` or `ScrapeConfig` object. */
  "enforcedNamespaceLabel"?: string
  /** enforcedSampleLimit when defined specifies a global limit on the number of scraped samples that will be accepted. This overrides any `spec.sampleLimit` set by ServiceMonitor, PodMonitor, Probe objects unless `spec.sampleLimit` is greater than zero and less than `spec.enforcedSampleLimit`. It is meant to be used by admins to keep the overall number of samples/series under a desired limit. When both `enforcedSampleLimit` and `sampleLimit` are defined and greater than zero, the following rules apply: * Scrape objects without a defined sampleLimit value will inherit the global sampleLimit value (Prometheus >= 2.45.0) or the enforcedSampleLimit value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedSampleLimit` is greater than the `sampleLimit`, the `sampleLimit` will be set to `enforcedSampleLimit`. * Scrape objects with a sampleLimit value less than or equal to enforcedSampleLimit keep their specific value. * Scrape objects with a sampleLimit value greater than enforcedSampleLimit are set to enforcedSampleLimit. */
  "enforcedSampleLimit"?: number
  /** enforcedTargetLimit when defined specifies a global limit on the number of scraped targets. The value overrides any `spec.targetLimit` set by ServiceMonitor, PodMonitor, Probe objects unless `spec.targetLimit` is greater than zero and less than `spec.enforcedTargetLimit`. It is meant to be used by admins to to keep the overall number of targets under a desired limit. When both `enforcedTargetLimit` and `targetLimit` are defined and greater than zero, the following rules apply: * Scrape objects without a defined targetLimit value will inherit the global targetLimit value (Prometheus >= 2.45.0) or the enforcedTargetLimit value (Prometheus < v2.45.0).   If Prometheus version is >= 2.45.0 and the `enforcedTargetLimit` is greater than the `targetLimit`, the `targetLimit` will be set to `enforcedTargetLimit`. * Scrape objects with a targetLimit value less than or equal to enforcedTargetLimit keep their specific value. * Scrape objects with a targetLimit value greater than enforcedTargetLimit are set to enforcedTargetLimit. */
  "enforcedTargetLimit"?: number
  /** evaluationInterval defines the interval between rule evaluations. Default: "30s" */
  "evaluationInterval"?: string
  /** excludedFromEnforcement defines the list of references to PodMonitor, ServiceMonitor, Probe and PrometheusRule objects to be excluded from enforcing a namespace label of origin. It is only applicable if `spec.enforcedNamespaceLabel` set to true. */
  "excludedFromEnforcement"?: ExcludedFromEnforcementItem[]
  /** exemplars related settings that are runtime reloadable. It requires to enable the `exemplar-storage` feature flag to be effective. */
  "exemplars"?: Exemplars
  /** externalLabels defines the labels to add to any time series or alerts when communicating with external systems (federation, remote storage, Alertmanager). Labels defined by `spec.replicaExternalLabelName` and `spec.prometheusExternalLabelName` take precedence over this list. */
  "externalLabels"?: Record<string, unknown>
  /** externalUrl defines the external URL under which the Prometheus service is externally available. This is necessary to generate correct URLs (for instance if Prometheus is accessible behind an Ingress resource). */
  "externalUrl"?: string
  /** hostAliases defines the optional list of hosts and IPs that will be injected into the Pod's hosts file if specified. */
  "hostAliases"?: HostAliasesItem[]
  /** hostNetwork defines the host's network namespace if true. Make sure to understand the security implications if you want to enable it (https://kubernetes.io/docs/concepts/configuration/overview/ ). When hostNetwork is enabled, this will set the DNS policy to `ClusterFirstWithHostNet` automatically (unless `.spec.DNSPolicy` is set to a different value). */
  "hostNetwork"?: boolean
  /** hostUsers supports the user space in Kubernetes. More info: https://kubernetes.io/docs/tasks/configure-pod-container/user-namespaces/ The feature requires at least Kubernetes 1.28 with the `UserNamespacesSupport` feature gate enabled. Starting Kubernetes 1.33, the feature is enabled by default. */
  "hostUsers"?: boolean
  /** ignoreNamespaceSelectors when true, `spec.namespaceSelector` from all PodMonitor, ServiceMonitor and Probe objects will be ignored. They will only discover targets within the namespace of the PodMonitor, ServiceMonitor and Probe object. */
  "ignoreNamespaceSelectors"?: boolean
  /** image defines the container image name for Prometheus. If specified, it takes precedence over the `spec.baseImage`, `spec.tag` and `spec.sha` fields. Specifying `spec.version` is still necessary to ensure the Prometheus Operator knows which version of Prometheus is being configured. If neither `spec.image` nor `spec.baseImage` are defined, the operator will use the latest upstream version of Prometheus available at the time when the operator was released. */
  "image"?: string
  /** imagePullPolicy defines the image pull policy for the 'prometheus', 'init-config-reloader' and 'config-reloader' containers. See https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy for more details. */
  "imagePullPolicy"?: "" | "Always" | "Never" | "IfNotPresent"
  /** imagePullSecrets defines an optional list of references to Secrets in the same namespace to use for pulling images from registries. See http://kubernetes.io/docs/user-guide/images#specifying-imagepullsecrets-on-a-pod */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** initContainers allows injecting initContainers to the Pod definition. Those can be used to e.g. fetch secrets for injection into the Prometheus configuration from external sources. Any errors during the execution of an initContainer will lead to a restart of the Pod. More info: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ InitContainers described here modify an operator generated init containers if they share the same name and modifications are done via a strategic merge patch. The names of init container name managed by the operator are: * `init-config-reloader`. Overriding init containers which are managed by the operator require careful testing, especially when upgrading to a new version of the operator. */
  "initContainers"?: InitContainersItem[]
  /** keepDroppedTargets defines the per-scrape limit on the number of targets dropped by relabeling that will be kept in memory. 0 means no limit. It requires Prometheus >= v2.47.0. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedKeepDroppedTargets. */
  "keepDroppedTargets"?: number
  /** labelLimit defines per-scrape limit on number of labels that will be accepted for a sample. Only valid in Prometheus versions 2.45.0 and newer. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedLabelLimit. */
  "labelLimit"?: number
  /** labelNameLengthLimit defines the per-scrape limit on length of labels name that will be accepted for a sample. Only valid in Prometheus versions 2.45.0 and newer. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedLabelNameLengthLimit. */
  "labelNameLengthLimit"?: number
  /** labelValueLengthLimit defines the per-scrape limit on length of labels value that will be accepted for a sample. Only valid in Prometheus versions 2.45.0 and newer. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedLabelValueLengthLimit. */
  "labelValueLengthLimit"?: number
  /** listenLocal when true, the Prometheus server listens on the loopback address instead of the Pod IP's address. */
  "listenLocal"?: boolean
  /** logFormat for Log level for Prometheus and the config-reloader sidecar. */
  "logFormat"?: "" | "logfmt" | "json"
  /** logLevel for Prometheus and the config-reloader sidecar. */
  "logLevel"?: "" | "debug" | "info" | "warn" | "error"
  /** maximumStartupDurationSeconds defines the maximum time that the `prometheus` container's startup probe will wait before being considered failed. The startup probe will return success after the WAL replay is complete. If set, the value should be greater than 60 (seconds). Otherwise it will be equal to 900 seconds (15 minutes). */
  "maximumStartupDurationSeconds"?: number
  /** minReadySeconds defines the minimum number of seconds for which a newly created Pod should be ready without any of its container crashing for it to be considered available. If unset, pods will be considered available as soon as they are ready. */
  "minReadySeconds"?: number
  /** nameEscapingScheme defines the character escaping scheme that will be requested when scraping for metric and label names that do not conform to the legacy Prometheus character set. It requires Prometheus >= v3.4.0. */
  "nameEscapingScheme"?: "AllowUTF8" | "Underscores" | "Dots" | "Values"
  /** nameValidationScheme defines the validation scheme for metric and label names. It requires Prometheus >= v2.55.0. */
  "nameValidationScheme"?: "UTF8" | "Legacy"
  /** nodeSelector defines on which Nodes the Pods are scheduled. */
  "nodeSelector"?: Record<string, unknown>
  /** otlp defines the settings related to the OTLP receiver feature. It requires Prometheus >= v2.55.0. */
  "otlp"?: Otlp
  /** overrideHonorLabels when true, Prometheus resolves label conflicts by renaming the labels in the scraped data  to “exported_” for all targets created from ServiceMonitor, PodMonitor and ScrapeConfig objects. Otherwise the HonorLabels field of the service or pod monitor applies. In practice,`OverrideHonorLabels:true` enforces `honorLabels:false` for all ServiceMonitor, PodMonitor and ScrapeConfig objects. */
  "overrideHonorLabels"?: boolean
  /** overrideHonorTimestamps when true, Prometheus ignores the timestamps for all the targets created from service and pod monitors. Otherwise the HonorTimestamps field of the service or pod monitor applies. */
  "overrideHonorTimestamps"?: boolean
  /** paused defines when a Prometheus deployment is paused, no actions except for deletion will be performed on the underlying objects. */
  "paused"?: boolean
  /** persistentVolumeClaimRetentionPolicy defines the field controls if and how PVCs are deleted during the lifecycle of a StatefulSet. The default behavior is all PVCs are retained. This is an alpha field from kubernetes 1.23 until 1.26 and a beta field from 1.26. It requires enabling the StatefulSetAutoDeletePVC feature gate. */
  "persistentVolumeClaimRetentionPolicy"?: PersistentVolumeClaimRetentionPolicy
  /** podManagementPolicy defines the policy for creating/deleting pods when scaling up and down. Unlike the default StatefulSet behavior, the default policy is `Parallel` to avoid manual intervention in case a pod gets stuck during a rollout. Note that updating this value implies the recreation of the StatefulSet which incurs a service outage. */
  "podManagementPolicy"?: "OrderedReady" | "Parallel"
  /** podMetadata defines labels and annotations which are propagated to the Prometheus pods. The following items are reserved and cannot be overridden: * "prometheus" label, set to the name of the Prometheus object. * "app.kubernetes.io/instance" label, set to the name of the Prometheus object. * "app.kubernetes.io/managed-by" label, set to "prometheus-operator". * "app.kubernetes.io/name" label, set to "prometheus". * "app.kubernetes.io/version" label, set to the Prometheus version. * "operator.prometheus.io/name" label, set to the name of the Prometheus object. * "operator.prometheus.io/shard" label, set to the shard number of the Prometheus object. * "kubectl.kubernetes.io/default-container" annotation, set to "prometheus". */
  "podMetadata"?: PodMetadata
  /** podMonitorNamespaceSelector defines the namespaces to match for PodMonitors discovery. An empty label selector matches all namespaces. A null label selector (default value) matches the current namespace only. */
  "podMonitorNamespaceSelector"?: PodMonitorNamespaceSelector
  /** podMonitorSelector defines the podMonitors to be selected for target discovery. An empty label selector matches all objects. A null label selector matches no objects. If `spec.serviceMonitorSelector`, `spec.podMonitorSelector`, `spec.probeSelector` and `spec.scrapeConfigSelector` are null, the Prometheus configuration is unmanaged. The Prometheus operator will ensure that the Prometheus configuration's Secret exists, but it is the responsibility of the user to provide the raw gzipped Prometheus configuration under the `prometheus.yaml.gz` key. This behavior is *deprecated* and will be removed in the next major version of the custom resource definition. It is recommended to use `spec.additionalScrapeConfigs` instead. */
  "podMonitorSelector"?: PodMonitorSelector
  /** podTargetLabels are appended to the `spec.podTargetLabels` field of all PodMonitor and ServiceMonitor objects. */
  "podTargetLabels"?: string[]
  /** portName used for the pods and governing service. Default: "web" */
  "portName"?: string
  /** priorityClassName assigned to the Pods. */
  "priorityClassName"?: string
  /** probeNamespaceSelector defines the namespaces to match for Probe discovery. An empty label selector matches all namespaces. A null label selector matches the current namespace only. */
  "probeNamespaceSelector"?: ProbeNamespaceSelector
  /** probeSelector defines the probes to be selected for target discovery. An empty label selector matches all objects. A null label selector matches no objects. If `spec.serviceMonitorSelector`, `spec.podMonitorSelector`, `spec.probeSelector` and `spec.scrapeConfigSelector` are null, the Prometheus configuration is unmanaged. The Prometheus operator will ensure that the Prometheus configuration's Secret exists, but it is the responsibility of the user to provide the raw gzipped Prometheus configuration under the `prometheus.yaml.gz` key. This behavior is *deprecated* and will be removed in the next major version of the custom resource definition. It is recommended to use `spec.additionalScrapeConfigs` instead. */
  "probeSelector"?: ProbeSelector
  /** prometheusExternalLabelName defines the name of Prometheus external label used to denote the Prometheus instance name. The external label will _not_ be added when the field is set to the empty string (`""`). Default: "prometheus" */
  "prometheusExternalLabelName"?: string
  /** prometheusRulesExcludedFromEnforce defines the list of PrometheusRule objects to which the namespace label enforcement doesn't apply. This is only relevant when `spec.enforcedNamespaceLabel` is set to true. Deprecated: use `spec.excludedFromEnforcement` instead. */
  "prometheusRulesExcludedFromEnforce"?: PrometheusRulesExcludedFromEnforceItem[]
  /** query defines the configuration of the Prometheus query service. */
  "query"?: Query
  /** queryLogFile specifies where the file to which PromQL queries are logged. If the filename has an empty path, e.g. 'query.log', The Prometheus Pods will mount the file into an emptyDir volume at `/var/log/prometheus`. If a full path is provided, e.g. '/var/log/prometheus/query.log', you must mount a volume in the specified directory and it must be writable. This is because the prometheus container runs with a read-only root filesystem for security reasons. Alternatively, the location can be set to a standard I/O stream, e.g. `/dev/stdout`, to log query information to the default Prometheus log stream. */
  "queryLogFile"?: string
  /** reloadStrategy defines the strategy used to reload the Prometheus configuration. If not specified, the configuration is reloaded using the /-/reload HTTP endpoint. */
  "reloadStrategy"?: "HTTP" | "ProcessSignal"
  /** remoteRead defines the list of remote read configurations. */
  "remoteRead"?: RemoteReadItem[]
  /** remoteWrite defines the list of remote write configurations. */
  "remoteWrite"?: RemoteWriteItem[]
  /** remoteWriteReceiverMessageVersions list of the protobuf message versions to accept when receiving the remote writes. It requires Prometheus >= v2.54.0. */
  "remoteWriteReceiverMessageVersions"?: ("V1.0" | "V2.0")[]
  /** replicaExternalLabelName defines the name of Prometheus external label used to denote the replica name. The external label will _not_ be added when the field is set to the empty string (`""`). Default: "prometheus_replica" */
  "replicaExternalLabelName"?: string
  /** replicas defines the number of replicas of each shard to deploy for a Prometheus deployment. `spec.replicas` multiplied by `spec.shards` is the total number of Pods created. Default: 1 */
  "replicas"?: number
  /** resources defines the resources requests and limits of the 'prometheus' container. */
  "resources"?: Resources
  /** retention defines how long to retain the Prometheus data. Default: "24h" if `spec.retention` and `spec.retentionSize` are empty. */
  "retention"?: string
  /** retentionSize defines the maximum number of bytes used by the Prometheus data. */
  "retentionSize"?: string
  /** routePrefix defines the route prefix Prometheus registers HTTP handlers for. This is useful when using `spec.externalURL`, and a proxy is rewriting HTTP routes of a request, and the actual ExternalURL is still true, but the server serves requests under a different route prefix. For example for use with `kubectl proxy`. */
  "routePrefix"?: string
  /** ruleNamespaceSelector defines the namespaces to match for PrometheusRule discovery. An empty label selector matches all namespaces. A null label selector matches the current namespace only. */
  "ruleNamespaceSelector"?: RuleNamespaceSelector
  /** ruleQueryOffset defines the offset the rule evaluation timestamp of this particular group by the specified duration into the past. It requires Prometheus >= v2.53.0. */
  "ruleQueryOffset"?: string
  /** ruleSelector defines the prometheusRule objects to be selected for rule evaluation. An empty label selector matches all objects. A null label selector matches no objects. */
  "ruleSelector"?: RuleSelector
  /** rules defines the configuration of the Prometheus rules' engine. */
  "rules"?: Rules
  /** runtime defines the values for the Prometheus process behavior */
  "runtime"?: Runtime
  /** sampleLimit defines per-scrape limit on number of scraped samples that will be accepted. Only valid in Prometheus versions 2.45.0 and newer. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedSampleLimit. */
  "sampleLimit"?: number
  /** schedulerName defines the scheduler to use for Pod scheduling. If not specified, the default scheduler is used. */
  "schedulerName"?: string
  /** scrapeClasses defines the list of scrape classes to expose to scraping objects such as PodMonitors, ServiceMonitors, Probes and ScrapeConfigs. This is an *experimental feature*, it may change in any upcoming release in a breaking way. */
  "scrapeClasses"?: ScrapeClassesItem[]
  /** scrapeClassicHistograms defines whether to scrape a classic histogram that is also exposed as a native histogram. Notice: `scrapeClassicHistograms` corresponds to the `always_scrape_classic_histograms` field in the Prometheus configuration. It requires Prometheus >= v3.5.0. */
  "scrapeClassicHistograms"?: boolean
  /** scrapeConfigNamespaceSelector defines the namespaces to match for ScrapeConfig discovery. An empty label selector matches all namespaces. A null label selector matches the current namespace only. Note that the ScrapeConfig custom resource definition is currently at Alpha level and will be graduated to Beta in a future release. */
  "scrapeConfigNamespaceSelector"?: ScrapeConfigNamespaceSelector
  /** scrapeConfigSelector defines the scrapeConfigs to be selected for target discovery. An empty label selector matches all objects. A null label selector matches no objects. If `spec.serviceMonitorSelector`, `spec.podMonitorSelector`, `spec.probeSelector` and `spec.scrapeConfigSelector` are null, the Prometheus configuration is unmanaged. The Prometheus operator will ensure that the Prometheus configuration's Secret exists, but it is the responsibility of the user to provide the raw gzipped Prometheus configuration under the `prometheus.yaml.gz` key. This behavior is *deprecated* and will be removed in the next major version of the custom resource definition. It is recommended to use `spec.additionalScrapeConfigs` instead. Note that the ScrapeConfig custom resource definition is currently at Alpha level and will be graduated to Beta in a future release. */
  "scrapeConfigSelector"?: ScrapeConfigSelector
  /** scrapeFailureLogFile defines the file to which scrape failures are logged. Reloading the configuration will reopen the file. If the filename has an empty path, e.g. 'file.log', The Prometheus Pods will mount the file into an emptyDir volume at `/var/log/prometheus`. If a full path is provided, e.g. '/var/log/prometheus/file.log', you must mount a volume in the specified directory and it must be writable. It requires Prometheus >= v2.55.0. */
  "scrapeFailureLogFile"?: string
  /** scrapeInterval defines interval between consecutive scrapes. Default: "30s" */
  "scrapeInterval"?: string
  /** scrapeNativeHistograms defines whether to enable scraping of native histograms. It requires Prometheus >= v3.8.0. */
  "scrapeNativeHistograms"?: boolean
  /** scrapeProtocols defines the protocols to negotiate during a scrape. It tells clients the protocols supported by Prometheus in order of preference (from most to least preferred). If unset, Prometheus uses its default value. It requires Prometheus >= v2.49.0. `PrometheusText1.0.0` requires Prometheus >= v3.0.0. */
  "scrapeProtocols"?: ("PrometheusProto" | "OpenMetricsText0.0.1" | "OpenMetricsText1.0.0" | "PrometheusText0.0.4" | "PrometheusText1.0.0")[]
  /** scrapeTimeout defines the number of seconds to wait until a scrape request times out. The value cannot be greater than the scrape interval otherwise the operator will reject the resource. */
  "scrapeTimeout"?: string
  /** secrets defines a list of Secrets in the same namespace as the Prometheus object, which shall be mounted into the Prometheus Pods. Each Secret is added to the StatefulSet definition as a volume named `secret-<secret-name>`. The Secrets are mounted into /etc/prometheus/secrets/<secret-name> in the 'prometheus' container. */
  "secrets"?: string[]
  /** securityContext holds pod-level security attributes and common container settings. This defaults to the default PodSecurityContext. */
  "securityContext"?: SecurityContext2
  /** serviceAccountName is the name of the ServiceAccount to use to run the Prometheus Pods. */
  "serviceAccountName"?: string
  /** serviceDiscoveryRole defines the service discovery role used to discover targets from `ServiceMonitor` objects and Alertmanager endpoints. If set, the value should be either "Endpoints" or "EndpointSlice". If unset, the operator assumes the "Endpoints" role. */
  "serviceDiscoveryRole"?: "Endpoints" | "EndpointSlice"
  /** serviceMonitorNamespaceSelector defines the namespaces to match for ServicedMonitors discovery. An empty label selector matches all namespaces. A null label selector (default value) matches the current namespace only. */
  "serviceMonitorNamespaceSelector"?: ServiceMonitorNamespaceSelector
  /** serviceMonitorSelector defines the serviceMonitors to be selected for target discovery. An empty label selector matches all objects. A null label selector matches no objects. If `spec.serviceMonitorSelector`, `spec.podMonitorSelector`, `spec.probeSelector` and `spec.scrapeConfigSelector` are null, the Prometheus configuration is unmanaged. The Prometheus operator will ensure that the Prometheus configuration's Secret exists, but it is the responsibility of the user to provide the raw gzipped Prometheus configuration under the `prometheus.yaml.gz` key. This behavior is *deprecated* and will be removed in the next major version of the custom resource definition. It is recommended to use `spec.additionalScrapeConfigs` instead. */
  "serviceMonitorSelector"?: ServiceMonitorSelector
  /** serviceName defines the name of the service name used by the underlying StatefulSet(s) as the governing service. If defined, the Service  must be created before the Prometheus/PrometheusAgent resource in the same namespace and it must define a selector that matches the pod labels. If empty, the operator will create and manage a headless service named `prometheus-operated` for Prometheus resources, or `prometheus-agent-operated` for PrometheusAgent resources. When deploying multiple Prometheus/PrometheusAgent resources in the same namespace, it is recommended to specify a different value for each. See https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id for more details. */
  "serviceName"?: string
  /** sha is deprecated: use 'spec.image' instead. The image's digest can be specified as part of the image name. */
  "sha"?: string
  /** shardRetentionPolicy defines the retention policy for the Prometheus shards. (Beta) Using this mode requires the `PrometheusShardRetentionPolicy` feature gate (enabled by default). */
  "shardRetentionPolicy"?: ShardRetentionPolicy
  /** shardingStrategy defines the sharding strategy for distributing scraped targets across Prometheus shards. When not defined, the operator defaults to the 'Address' mode which distributes targets based on a hash of the target address. */
  "shardingStrategy"?: ShardingStrategy
  /** shards defines the number of shards to distribute the scraped targets onto. `spec.replicas` multiplied by `spec.shards` is the total number of Pods being created. When not defined, the operator assumes only one shard. Note that scaling down shards will not reshard data onto the remaining instances, it must be manually moved. Increasing shards will not reshard data either but it will continue to be available from the same instances. To query globally, use either * Thanos sidecar + querier for query federation and Thanos Ruler for rules. * Remote-write to send metrics to a central location. By default, the sharding of targets is performed on: * The `__address__` target's metadata label for PodMonitor, ServiceMonitor and ScrapeConfig resources. * The `__param_target__` label for Probe resources. Users can define their own sharding implementation by setting the `__tmp_hash` label during the target discovery with relabeling configuration (either in the monitoring resources or via scrape class). You can also disable sharding on a specific target by setting the `__tmp_disable_sharding` label with relabeling configuration. When the label value isn't empty, all Prometheus shards will scrape the target. Default: 1 */
  "shards"?: number
  /** storage defines the storage used by Prometheus. */
  "storage"?: Storage
  /** tag is deprecated: use 'spec.image' instead. The image's tag can be specified as part of the image name. */
  "tag"?: string
  /** targetLimit defines a limit on the number of scraped targets that will be accepted. Only valid in Prometheus versions 2.45.0 and newer. Note that the global limit only applies to scrape objects that don't specify an explicit limit value. If you want to enforce a maximum limit for all scrape objects, refer to enforcedTargetLimit. */
  "targetLimit"?: number
  /** terminationGracePeriodSeconds defines the optional duration in seconds the pod needs to terminate gracefully. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down) which may lead to data corruption. Defaults to 600 seconds. */
  "terminationGracePeriodSeconds"?: number
  /** thanos defines the configuration of the optional Thanos sidecar. */
  "thanos"?: Thanos
  /** tolerations defines the Pods' tolerations if specified. */
  "tolerations"?: TolerationsItem[]
  /** topologySpreadConstraints defines the pod's topology spread constraints if specified. */
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem2[]
  /** tracingConfig defines tracing in Prometheus. This is an *experimental feature*, it may change in any upcoming release in a breaking way. */
  "tracingConfig"?: TracingConfig2
  /** tsdb defines the runtime reloadable configuration of the timeseries database(TSDB). It requires Prometheus >= v2.39.0 or PrometheusAgent >= v2.54.0. */
  "tsdb"?: Tsdb
  /** updateStrategy indicates the strategy that will be employed to update Pods in the StatefulSet when a revision is made to statefulset's Pod Template. The default strategy is RollingUpdate. */
  "updateStrategy"?: UpdateStrategy
  /** version of Prometheus being deployed. The operator uses this information to generate the Prometheus StatefulSet + configuration files. If not specified, the operator assumes the latest upstream version of Prometheus available at the time when the version of the operator was released. */
  "version"?: string
  /** volumeMounts allows the configuration of additional VolumeMounts. VolumeMounts will be appended to other VolumeMounts in the 'prometheus' container, that are generated as a result of StorageSpec objects. */
  "volumeMounts"?: VolumeMountsItem[]
  /** volumes allows the configuration of additional volumes on the output StatefulSet definition. Volumes specified will be appended to other volumes that are generated as a result of StorageSpec objects. */
  "volumes"?: VolumesItem[]
  /** walCompression defines the compression of the write-ahead log (WAL) using Snappy. WAL compression is enabled by default for Prometheus >= 2.20.0 Requires Prometheus v2.11.0 and above. */
  "walCompression"?: boolean
  /** web defines the configuration of the Prometheus web server. */
  "web"?: Web2
}

export interface ShardStatusesItem {
  /** availableReplicas defines the total number of available pods (ready for at least minReadySeconds) targeted by this shard. */
  "availableReplicas": number
  /** replicas defines the total number of pods targeted by this shard. */
  "replicas": number
  /** shardID defines the identifier of the shard. */
  "shardID": string
  /** unavailableReplicas defines the Total number of unavailable pods targeted by this shard. */
  "unavailableReplicas": number
  /** updatedReplicas defines the total number of non-terminated pods targeted by this shard that have the desired spec. */
  "updatedReplicas": number
}

export interface PrometheusStatus {
  /** availableReplicas defines the total number of available pods (ready for at least minReadySeconds) targeted by this Prometheus deployment. */
  "availableReplicas"?: number
  /** conditions defines the current state of the Prometheus deployment. */
  "conditions"?: ConditionsItem2[]
  /** paused defines whether any actions on the underlying managed objects are being performed. Only delete actions will be performed. */
  "paused"?: boolean
  /** replicas defines the total number of non-terminated pods targeted by this Prometheus deployment (their labels match the selector). */
  "replicas"?: number
  /** selector used to match the pods targeted by this Prometheus resource. */
  "selector"?: string
  /** shardStatuses defines the list has one entry per shard. Each entry provides a summary of the shard status. */
  "shardStatuses"?: ShardStatusesItem[]
  /** shards defines the most recently observed number of shards. */
  "shards"?: number
  /** unavailableReplicas defines the total number of unavailable pods targeted by this Prometheus deployment. */
  "unavailableReplicas"?: number
  /** updatedReplicas defines the total number of non-terminated pods targeted by this Prometheus deployment that have the desired version spec. */
  "updatedReplicas"?: number
}

export interface RulesItem {
  /** alert defines the name of the alert. Must be a valid label value. Only one of `record` and `alert` must be set. */
  "alert"?: string
  /** annotations defines annotations to add to each alert. Only valid for alerting rules. */
  "annotations"?: Record<string, unknown>
  /** expr defines the PromQL expression to evaluate. */
  "expr": number | string
  /** for defines how alerts are considered firing once they have been returned for this long. */
  "for"?: string
  /** keep_firing_for defines how long an alert will continue firing after the condition that triggered it has cleared. */
  "keep_firing_for"?: string
  /** labels defines labels to add or overwrite. */
  "labels"?: Record<string, unknown>
  /** record defines the name of the time series to output to. Must be a valid metric name. Only one of `record` and `alert` must be set. */
  "record"?: string
}

export interface GroupsItem {
  /** interval defines how often rules in the group are evaluated. */
  "interval"?: string
  /** labels define the labels to add or overwrite before storing the result for its rules. The labels defined at the rule level take precedence. It requires Prometheus >= 3.0.0. The field is ignored for Thanos Ruler. */
  "labels"?: Record<string, unknown>
  /** limit defines the number of alerts an alerting rule and series a recording rule can produce. Limit is supported starting with Prometheus >= 2.31 and Thanos Ruler >= 0.24. */
  "limit"?: number
  /** name defines the name of the rule group. */
  "name": string
  /** partial_response_strategy is only used by ThanosRuler and will be ignored by Prometheus instances. More info: https://github.com/thanos-io/thanos/blob/main/docs/components/rule.md#partial-response */
  "partial_response_strategy"?: string
  /** query_offset defines the offset the rule evaluation timestamp of this particular group by the specified duration into the past. It requires Prometheus >= v2.53.0. It is not supported for ThanosRuler. */
  "query_offset"?: string
  /** rules defines the list of alerting and recording rules. */
  "rules"?: RulesItem[]
}

export interface PrometheusRuleSpec {
  /** groups defines the content of Prometheus rule file */
  "groups"?: GroupsItem[]
}

export interface BindingsItem {
  /** conditions defines the current state of the configuration resource when bound to the referenced Workload object. */
  "conditions"?: ConditionsItem2[]
  /** group defines the group of the referenced resource. */
  "group": "monitoring.coreos.com"
  /** name defines the name of the referenced object. */
  "name": string
  /** namespace defines the namespace of the referenced object. */
  "namespace": string
  /** resource defines the type of resource being referenced (e.g. Prometheus, PrometheusAgent, ThanosRuler or Alertmanager). */
  "resource": "prometheuses" | "prometheusagents" | "thanosrulers" | "alertmanagers"
}

export interface PrometheusRuleStatus {
  /** bindings defines the list of workload resources (Prometheus, PrometheusAgent, ThanosRuler or Alertmanager) which select the configuration resource. */
  "bindings"?: BindingsItem[]
}

export interface AzureSDConfigsItem {
  /** authenticationMethod defines the authentication method, either `OAuth` or `ManagedIdentity` or `SDK`. See https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview SDK authentication method uses environment variables by default. See https://learn.microsoft.com/en-us/azure/developer/go/azure-sdk-authentication */
  "authenticationMethod"?: "OAuth" | "ManagedIdentity" | "SDK" | "WorkloadIdentity"
  /** authorization defines the authorization header configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `oAuth2`, or `basicAuth`. */
  "authorization"?: Authorization
  /** basicAuth defines the information to authenticate against the target HTTP endpoint. More info: https://prometheus.io/docs/operating/configuration/#endpoints Cannot be set at the same time as `authorization`, or `oAuth2`. */
  "basicAuth"?: BasicAuth
  /** clientID defines client ID. Only required with the OAuth authentication method. */
  "clientID"?: string
  /** clientSecret defines client secret. Only required with the OAuth authentication method. */
  "clientSecret"?: ClientSecret
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** environment defines the Azure environment. */
  "environment"?: string
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must instead be specified in the relabeling rule. */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** resourceGroup defines resource group name. Limits discovery to this resource group. Requires  Prometheus v2.35.0 and above */
  "resourceGroup"?: string
  /** subscriptionID defines subscription ID. Always required. */
  "subscriptionID": string
  /** tenantID defines tenant ID. Only required with the OAuth authentication method. */
  "tenantID"?: string
  /** tlsConfig defines the TLS configuration applying to the target HTTP endpoint. */
  "tlsConfig"?: TlsConfig
}

export interface TokenRef {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ConsulSDConfigsItem {
  /** allowStale Consul results (see https://www.consul.io/api/features/consistency.html). Will reduce load on Consul. If unset, Prometheus uses its default value. */
  "allowStale"?: boolean
  /** authorization defines the header configuration to authenticate against the Consul Server. Cannot be set at the same time as `basicAuth`, or `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines the information to authenticate against the Consul Server. More info: https://prometheus.io/docs/operating/configuration/#endpoints Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** datacenter defines the consul Datacenter name, if not provided it will use the local Consul Agent Datacenter. */
  "datacenter"?: string
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** filter defines the filter expression used to filter the catalog results. See https://developer.hashicorp.com/consul/api-docs/catalog#filtering It requires Prometheus >= 3.0.0. */
  "filter"?: string
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** healthFilter defines the filter expression used to filter the health results. See https://developer.hashicorp.com/consul/api-docs/health#filtering It requires Prometheus >= 3.11.2. */
  "healthFilter"?: string
  /** namespace are only supported in Consul Enterprise. It requires Prometheus >= 2.28.0. */
  "namespace"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** nodeMeta defines the node metadata key/value pairs to filter nodes for a given service. Starting with Consul 1.14, it is recommended to use `filter` with the `NodeMeta` selector instead. */
  "nodeMeta"?: Record<string, unknown>
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** partition defines the admin Partitions are only supported in Consul Enterprise. */
  "partition"?: string
  /** pathPrefix defines the prefix for URIs for when consul is behind an API gateway (reverse proxy). It requires Prometheus >= 2.45.0. */
  "pathPrefix"?: string
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** scheme defines the HTTP Scheme. */
  "scheme"?: "http" | "https" | "HTTP" | "HTTPS"
  /** server defines the consul server address. A valid string consisting of a hostname or IP followed by an optional port number. */
  "server": string
  /** services defines a list of services for which targets are retrieved. If omitted, all services are scraped. */
  "services"?: string[]
  /** tagSeparator defines the string by which Consul tags are joined into the tag label. If unset, Prometheus uses its default value. */
  "tagSeparator"?: string
  /** tags defines an optional list of tags used to filter nodes for a given service. Services must contain all tags in the list. Starting with Consul 1.14, it is recommended to use `filter` with the `ServiceTags` selector instead. */
  "tags"?: string[]
  /** tlsConfig defines the TLS configuration to connect to the Consul API. */
  "tlsConfig"?: TlsConfig
  /** tokenRef defines the consul ACL TokenRef, if not provided it will use the ACL from the local Consul Agent. */
  "tokenRef"?: TokenRef
}

export interface DigitalOceanSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the DigitalOcean API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** tlsConfig defines the TLS configuration to connect to the DigitalOcean API. */
  "tlsConfig"?: TlsConfig
}

export interface DnsSDConfigsItem {
  /** names defines a list of DNS domain names to be queried. */
  "names": string[]
  /** port defines the port to scrape metrics from. If using the public IP address, this must Ignored for SRV records */
  "port"?: number
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** type defines the type of DNS query to perform. One of SRV, A, AAAA, MX or NS. If not set, Prometheus uses its default value. When set to NS, it requires Prometheus >= v2.49.0. When set to MX, it requires Prometheus >= v2.38.0 */
  "type"?: "A" | "AAAA" | "MX" | "NS" | "SRV"
}

export interface FiltersItem {
  /** name of the Filter. */
  "name": string
  /** values defines values to filter on. */
  "values": string[]
}

export interface DockerSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the Docker daemon. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** filters defines filters to limit the discovery process to a subset of the available resources. */
  "filters"?: FiltersItem[]
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** host defines the address of the docker daemon. */
  "host": string
  /** hostNetworkingHost defines the host to use if the container is in host networking mode. */
  "hostNetworkingHost"?: string
  /** matchFirstNetwork defines whether to match the first network if the container has multiple networks defined. If unset, Prometheus uses true by default. It requires Prometheus >= v2.54.1. */
  "matchFirstNetwork"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** tlsConfig defines the TLS configuration to connect to the Docker daemon. */
  "tlsConfig"?: TlsConfig
}

export interface DockerSwarmSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the Docker Swarm API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** filters defines the filters to limit the discovery process to a subset of available resources. The available filters are listed in the upstream documentation: Services: https://docs.docker.com/engine/api/v1.40/#operation/ServiceList Tasks: https://docs.docker.com/engine/api/v1.40/#operation/TaskList Nodes: https://docs.docker.com/engine/api/v1.40/#operation/NodeList */
  "filters"?: FiltersItem[]
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** host defines the address of the Docker daemon */
  "host": string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must tasks and services that don't have published ports. */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** role of the targets to retrieve. Must be `Services`, `Tasks`, or `Nodes`. */
  "role": "Services" | "Tasks" | "Nodes"
  /** tlsConfig defines the TLS configuration to connect to the Docker Swarm daemon. */
  "tlsConfig"?: TlsConfig
}

export interface Ec2SDConfigsItem {
  /** accessKey defines the AWS API key. */
  "accessKey"?: AccessKey
  /** enableHTTP2 defines whether to enable HTTP2. It requires Prometheus >= v2.41.0 */
  "enableHTTP2"?: boolean
  /** filters can be used optionally to filter the instance list by other criteria. Available filter criteria can be found here: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html Filter API documentation: https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_Filter.html It requires Prometheus >= v2.3.0 */
  "filters"?: FiltersItem[]
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. It requires Prometheus >= v2.41.0 */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** port defines the port to scrape metrics from. If using the public IP address, this must instead be specified in the relabeling rule. */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** region defines the AWS region. */
  "region"?: string
  /** roleARN defines an alternative to using AWS API keys. */
  "roleARN"?: string
  /** secretKey defines the AWS API secret. */
  "secretKey"?: SecretKey
  /** tlsConfig defines the TLS configuration to connect to the EC2 API. It requires Prometheus >= v2.41.0 */
  "tlsConfig"?: TlsConfig
}

export interface EurekaSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the Eureka server. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines the BasicAuth information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** server defines the URL to connect to the Eureka server. */
  "server": string
  /** tlsConfig defines the TLS configuration to connect to the Eureka server. */
  "tlsConfig"?: TlsConfig
}

export interface FileSDConfigsItem {
  /** files defines the list of files to be used for file discovery. Recommendation: use absolute paths. While relative paths work, the prometheus-operator project makes no guarantees about the working directory where the configuration file is stored. Files must be mounted using Prometheus.ConfigMaps or Prometheus.Secrets. */
  "files": string[]
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
}

export interface GceSDConfigsItem {
  /** filter defines the filter that can be used optionally to filter the instance list by other criteria Syntax of this filter is described in the filter query parameter section: https://cloud.google.com/compute/docs/reference/latest/instances/list */
  "filter"?: string
  /** port defines the port to scrape metrics from. If using the public IP address, this must instead be specified in the relabeling rule. */
  "port"?: number
  /** project defines the Google Cloud Project ID */
  "project": string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** tagSeparator defines the tag separator is used to separate the tags on concatenation */
  "tagSeparator"?: string
  /** zone defines the zone of the scrape targets. If you need multiple zones use multiple GCESDConfigs. */
  "zone": string
}

export interface HetznerSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the Hetzner API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** labelSelector defines the label selector used to filter the servers when fetching them from the API. It requires Prometheus >= v3.5.0. */
  "labelSelector"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** role defines the Hetzner role of entities that should be discovered. */
  "role": "hcloud" | "Hcloud" | "robot" | "Robot"
  /** tlsConfig defines the TLS configuration to connect to the Hetzner API. */
  "tlsConfig"?: TlsConfig
}

export interface HttpSDConfigsItem {
  /** authorization defines the authorization header configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `oAuth2`, or `basicAuth`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. More info: https://prometheus.io/docs/operating/configuration/#endpoints Cannot be set at the same time as `authorization`, or `oAuth2`. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** tlsConfig defines the TLS configuration applying to the target HTTP endpoint. */
  "tlsConfig"?: TlsConfig
  /** url defines the URL from which the targets are fetched. */
  "url": string
}

export interface IonosSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the IONOS API. Cannot be set at the same time as `oauth2`. */
  "authorization": Authorization
  /** datacenterID defines the unique ID of the IONOS data center. */
  "datacenterID": string
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** tlsConfig defines the TLS configuration to connect to the IONOS API. */
  "tlsConfig"?: TlsConfig
}

export interface Namespaces {
  /** names defines a list of namespaces where to watch for resources. If empty and `ownNamespace` isn't true, Prometheus watches for resources in all namespaces. */
  "names"?: string[]
  /** ownNamespace includes the namespace in which the Prometheus pod runs to the list of watched namespaces. */
  "ownNamespace"?: boolean
}

export interface SelectorsItem {
  /** field defines an optional field selector to limit the service discovery to resources which have fields with specific values. e.g: `metadata.name=foobar` */
  "field"?: string
  /** label defines an optional label selector to limit the service discovery to resources with specific labels and label values. e.g: `node.kubernetes.io/instance-type=master` */
  "label"?: string
  /** role defines the type of Kubernetes resource to limit the service discovery to. Accepted values are: Node, Pod, Endpoints, EndpointSlice, Service, Ingress. */
  "role": "Pod" | "Endpoints" | "Ingress" | "Service" | "Node" | "EndpointSlice"
}

export interface KubernetesSDConfigsItem {
  /** apiServer defines the API server address consisting of a hostname or IP address followed by an optional port number. If left empty, Prometheus is assumed to run inside of the cluster. It will discover API servers automatically and use the pod's CA certificate and bearer token file at /var/run/secrets/kubernetes.io/serviceaccount/. */
  "apiServer"?: string
  /** attachMetadata defines the metadata to attach to discovered targets. It requires Prometheus >= v2.35.0 when using the `Pod` role and Prometheus >= v2.37.0 for `Endpoints` and `Endpointslice` roles. */
  "attachMetadata"?: AttachMetadata
  /** authorization defines the authorization header to use on every scrape request. Cannot be set at the same time as `basicAuth`, or `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** namespaces defines the namespace discovery. If omitted, Prometheus discovers targets across all namespaces. */
  "namespaces"?: Namespaces
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** role defines the Kubernetes role of the entities that should be discovered. Role `Endpointslice` requires Prometheus >= v2.21.0 */
  "role": "Pod" | "Endpoints" | "Ingress" | "Service" | "Node" | "EndpointSlice"
  /** selectors defines the selector to select objects. It requires Prometheus >= v2.17.0 */
  "selectors"?: SelectorsItem[]
  /** tlsConfig defines the TLS configuration to connect to the Kubernetes API. */
  "tlsConfig"?: TlsConfig
}

export interface KumaSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the Kuma control plane. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** clientID is used by Kuma Control Plane to compute Monitoring Assignment for specific Prometheus backend. It requires Prometheus >= v2.50.0. */
  "clientID"?: string
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** fetchTimeout defines the time after which the monitoring assignments are refreshed. */
  "fetchTimeout"?: string
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** server defines the address of the Kuma Control Plane's MADS xDS server. */
  "server": string
  /** tlsConfig defines the TLS configuration to connect to the Kuma control plane. */
  "tlsConfig"?: TlsConfig
}

export interface LightSailSDConfigsItem {
  /** accessKey defines the AWS API key. */
  "accessKey"?: AccessKey
  /** authorization defines the header configuration to authenticate against the Lightsail API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** endpoint defines the custom endpoint to be used. */
  "endpoint"?: string
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** region defines the AWS region. */
  "region"?: string
  /** roleARN defines the AWS Role ARN, an alternative to using AWS API keys. */
  "roleARN"?: string
  /** secretKey defines the AWS API secret. */
  "secretKey"?: SecretKey
  /** tlsConfig defines the TLS configuration to connect to the Lightsail API. */
  "tlsConfig"?: TlsConfig
}

export interface LinodeSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the Linode API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** region defines the region to filter on. */
  "region"?: string
  /** tagSeparator defines the string by which Linode Instance tags are joined into the tag label.el. */
  "tagSeparator"?: string
  /** tlsConfig defines the TLS configuration to connect to the Linode API. */
  "tlsConfig"?: TlsConfig
}

export interface NomadSDConfigsItem {
  /** allowStale defines the information to access the Nomad API. It is to be defined as the Nomad documentation requires. */
  "allowStale"?: boolean
  /** authorization defines the header configuration to authenticate against the Nomad API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** namespace defines the Nomad namespace to query for service discovery. When specified, only resources within this namespace will be discovered. */
  "namespace"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** region defines the Nomad region to query for service discovery. When specified, only resources within this region will be discovered. */
  "region"?: string
  /** server defines the Nomad server address to connect to for service discovery. This should be the full URL including protocol (e.g., "https://nomad.example.com:4646"). */
  "server": string
  /** tagSeparator defines the separator used to join multiple tags. This determines how Nomad service tags are concatenated into Prometheus labels. */
  "tagSeparator"?: string
  /** tlsConfig defines the TLS configuration to connect to the Nomad API. */
  "tlsConfig"?: TlsConfig
}

export interface ApplicationCredentialSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface OpenstackSDConfigsItem {
  /** allTenants defines whether the service discovery should list all instances for all projects. It is only relevant for the 'instance' role and usually requires admin permissions. */
  "allTenants"?: boolean
  /** applicationCredentialId defines the OpenStack applicationCredentialId. */
  "applicationCredentialId"?: string
  /** applicationCredentialName defines the ApplicationCredentialID or ApplicationCredentialName fields are required if using an application credential to authenticate. Some providers allow you to create an application credential to authenticate rather than a password. */
  "applicationCredentialName"?: string
  /** applicationCredentialSecret defines the required field if using an application credential to authenticate. */
  "applicationCredentialSecret"?: ApplicationCredentialSecret
  /** availability defines the availability of the endpoint to connect to. */
  "availability"?: "Public" | "public" | "Admin" | "admin" | "Internal" | "internal"
  /** domainID defines The OpenStack domainID. */
  "domainID"?: string
  /** domainName defines at most one of domainId and domainName that must be provided if using username with Identity V3. Otherwise, either are optional. */
  "domainName"?: string
  /** identityEndpoint defines the HTTP endpoint that is required to work with the Identity API of the appropriate version. */
  "identityEndpoint"?: string
  /** password defines the password for the Identity V2 and V3 APIs. Consult with your provider's control panel to discover your account's preferred method of authentication. */
  "password"?: Password
  /** port defines the port to scrape metrics from. If using the public IP address, this must instead be specified in the relabeling rule. */
  "port"?: number
  /** projectID defines the OpenStack projectID. */
  "projectID"?: string
  /** projectName defines an optional field for the Identity V2 API. Some providers allow you to specify a ProjectName instead of the ProjectId. Some require both. Your provider's authentication policies will determine how these fields influence authentication. */
  "projectName"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** region defines the OpenStack Region. */
  "region": string
  /** role defines the OpenStack role of entities that should be discovered. Note: The `LoadBalancer` role requires Prometheus >= v3.2.0. */
  "role": "Instance" | "Hypervisor" | "LoadBalancer"
  /** tlsConfig defines the TLS configuration applying to the target HTTP endpoint. */
  "tlsConfig"?: TlsConfig
  /** userid defines the OpenStack userid. */
  "userid"?: string
  /** username defines the username required if using Identity V2 API. Consult with your provider's control panel to discover your account's username. In Identity V3, either userid or a combination of username and domainId or domainName are needed */
  "username"?: string
}

export interface ApplicationSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ConsumerKey {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface OvhcloudSDConfigsItem {
  /** applicationKey defines the access key to use for OVHCloud API authentication. This is obtained from the OVHCloud API credentials at https://api.ovh.com. */
  "applicationKey": string
  /** applicationSecret defines the secret key for OVHCloud API authentication. This contains the application secret obtained during OVHCloud API credential creation. */
  "applicationSecret": ApplicationSecret
  /** consumerKey defines the consumer key for OVHCloud API authentication. This is the third component of OVHCloud's three-key authentication system. */
  "consumerKey": ConsumerKey
  /** endpoint defines a custom API endpoint to be used. When not specified, defaults to the standard OVHCloud API endpoint for the region. */
  "endpoint"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** service defines the service type of the targets to retrieve. Must be either `VPS` or `DedicatedServer` to specify which OVHCloud resources to discover. */
  "service": "VPS" | "DedicatedServer"
}

export interface PuppetDBSDConfigsItem {
  /** authorization defines the header configuration to authenticate against the PuppetDB API. Cannot be set at the same time as `oauth2`. */
  "authorization"?: Authorization
  /** basicAuth defines information to use on every scrape request. Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** includeParameters defines whether to include the parameters as meta labels. Note: Enabling this exposes parameters in the Prometheus UI and API. Make sure that you don't have secrets exposed as parameters if you enable this. */
  "includeParameters"?: boolean
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** oauth2 defines the optional OAuth 2.0 configuration to authenticate against the target HTTP endpoint. Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth2
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** query defines the Puppet Query Language (PQL) query. Only resources are supported. https://puppet.com/docs/puppetdb/latest/api/query/v4/pql.html */
  "query": string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** tlsConfig defines the TLS configuration to connect to the PuppetDB server. */
  "tlsConfig"?: TlsConfig
  /** url defines the URL of the PuppetDB root query endpoint. */
  "url": string
}

export interface ScalewaySDConfigsItem {
  /** accessKey defines the access key to use. https://console.scaleway.com/project/credentials */
  "accessKey": string
  /** apiURL defines the API URL to use when doing the server listing requests. */
  "apiURL"?: string
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** followRedirects defines whether HTTP requests follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** nameFilter defines a name filter (works as a LIKE) to apply on the server listing request. */
  "nameFilter"?: string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** port defines the port to scrape metrics from. If using the public IP address, this must */
  "port"?: number
  /** projectID defines the Project ID of the targets. */
  "projectID": string
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** refreshInterval defines the time after which the provided names are refreshed. If not set, Prometheus uses its default value. */
  "refreshInterval"?: string
  /** role defines the service of the targets to retrieve. Must be `Instance` or `Baremetal`. */
  "role": "Instance" | "Baremetal"
  /** secretKey defines the secret key to use when listing targets. */
  "secretKey": SecretKey
  /** tagsFilter defines a tag filter (a server needs to have all defined tags to be listed) to apply on the server listing request. */
  "tagsFilter"?: string[]
  /** tlsConfig defines the TLS configuration to connect to the Scaleway API. */
  "tlsConfig"?: TlsConfig
  /** zone defines the availability zone of your targets (e.g. fr-par-1). */
  "zone"?: string
}

export interface StaticConfigsItem {
  /** labels defines labels assigned to all metrics scraped from the targets. */
  "labels"?: Record<string, unknown>
  /** targets defines the list of targets for this static configuration. */
  "targets": string[]
}

export interface ScrapeConfigSpec {
  /** authorization defines the header to use on every scrape request. */
  "authorization"?: Authorization
  /** azureSDConfigs defines a list of Azure service discovery configurations. */
  "azureSDConfigs"?: AzureSDConfigsItem[]
  /** basicAuth defines information to use on every scrape request. */
  "basicAuth"?: BasicAuth
  /** bodySizeLimit defines a per-scrape limit on the size of the uncompressed response body that will be accepted by Prometheus. Targets responding with a body larger than this many bytes will cause the scrape to fail. It requires Prometheus >= v2.28.0. */
  "bodySizeLimit"?: string
  /** consulSDConfigs defines a list of Consul service discovery configurations. */
  "consulSDConfigs"?: ConsulSDConfigsItem[]
  /** convertClassicHistogramsToNHCB defines whether to convert all scraped classic histograms into a native histogram with custom buckets. It requires Prometheus >= v3.0.0. */
  "convertClassicHistogramsToNHCB"?: boolean
  /** digitalOceanSDConfigs defines a list of DigitalOcean service discovery configurations. */
  "digitalOceanSDConfigs"?: DigitalOceanSDConfigsItem[]
  /** dnsSDConfigs defines a list of DNS service discovery configurations. */
  "dnsSDConfigs"?: DnsSDConfigsItem[]
  /** dockerSDConfigs defines a list of Docker service discovery configurations. */
  "dockerSDConfigs"?: DockerSDConfigsItem[]
  /** dockerSwarmSDConfigs defines a list of Dockerswarm service discovery configurations. */
  "dockerSwarmSDConfigs"?: DockerSwarmSDConfigsItem[]
  /** ec2SDConfigs defines a list of EC2 service discovery configurations. */
  "ec2SDConfigs"?: Ec2SDConfigsItem[]
  /** enableCompression when false, Prometheus will request uncompressed response from the scraped target. It requires Prometheus >= v2.49.0. If unset, Prometheus uses true by default. */
  "enableCompression"?: boolean
  /** enableHTTP2 defines whether to enable HTTP2. */
  "enableHTTP2"?: boolean
  /** eurekaSDConfigs defines a list of Eureka service discovery configurations. */
  "eurekaSDConfigs"?: EurekaSDConfigsItem[]
  /** fallbackScrapeProtocol defines the protocol to use if a scrape returns blank, unparseable, or otherwise invalid Content-Type. It requires Prometheus >= v3.0.0. */
  "fallbackScrapeProtocol"?: "PrometheusProto" | "OpenMetricsText0.0.1" | "OpenMetricsText1.0.0" | "PrometheusText0.0.4" | "PrometheusText1.0.0"
  /** fileSDConfigs defines a list of file service discovery configurations. */
  "fileSDConfigs"?: FileSDConfigsItem[]
  /** gceSDConfigs defines a list of GCE service discovery configurations. */
  "gceSDConfigs"?: GceSDConfigsItem[]
  /** hetznerSDConfigs defines a list of Hetzner service discovery configurations. */
  "hetznerSDConfigs"?: HetznerSDConfigsItem[]
  /** honorLabels defines when true the metric's labels when they collide with the target's labels. */
  "honorLabels"?: boolean
  /** honorTimestamps defines whether Prometheus preserves the timestamps when exposed by the target. */
  "honorTimestamps"?: boolean
  /** httpSDConfigs defines a list of HTTP service discovery configurations. */
  "httpSDConfigs"?: HttpSDConfigsItem[]
  /** ionosSDConfigs defines a list of IONOS service discovery configurations. */
  "ionosSDConfigs"?: IonosSDConfigsItem[]
  /** jobName defines the value of the `job` label assigned to the scraped metrics by default. The `job_name` field in the rendered scrape configuration is always controlled by the operator to prevent duplicate job names, which Prometheus does not allow. Instead the `job` label is set by means of relabeling configs. */
  "jobName"?: string
  /** keepDroppedTargets defines the per-scrape limit on the number of targets dropped by relabeling that will be kept in memory. 0 means no limit. It requires Prometheus >= v2.47.0. */
  "keepDroppedTargets"?: number
  /** kubernetesSDConfigs defines a list of Kubernetes service discovery configurations. */
  "kubernetesSDConfigs"?: KubernetesSDConfigsItem[]
  /** kumaSDConfigs defines a list of Kuma service discovery configurations. */
  "kumaSDConfigs"?: KumaSDConfigsItem[]
  /** labelLimit defines the per-scrape limit on number of labels that will be accepted for a sample. Only valid in Prometheus versions 2.27.0 and newer. */
  "labelLimit"?: number
  /** labelNameLengthLimit defines the per-scrape limit on length of labels name that will be accepted for a sample. Only valid in Prometheus versions 2.27.0 and newer. */
  "labelNameLengthLimit"?: number
  /** labelValueLengthLimit defines the per-scrape limit on length of labels value that will be accepted for a sample. Only valid in Prometheus versions 2.27.0 and newer. */
  "labelValueLengthLimit"?: number
  /** lightSailSDConfigs defines a list of Lightsail service discovery configurations. */
  "lightSailSDConfigs"?: LightSailSDConfigsItem[]
  /** linodeSDConfigs defines a list of Linode service discovery configurations. */
  "linodeSDConfigs"?: LinodeSDConfigsItem[]
  /** metricRelabelings defines the metricRelabelings to apply to samples before ingestion. */
  "metricRelabelings"?: MetricRelabelingsItem[]
  /** metricsPath defines the HTTP path to scrape for metrics. If empty, Prometheus uses the default value (e.g. /metrics). */
  "metricsPath"?: string
  /** nameEscapingScheme defines the metric name escaping mode to request through content negotiation. It requires Prometheus >= v3.4.0. */
  "nameEscapingScheme"?: "AllowUTF8" | "Underscores" | "Dots" | "Values"
  /** nameValidationScheme defines the validation scheme for metric and label names. It requires Prometheus >= v3.0.0. */
  "nameValidationScheme"?: "UTF8" | "Legacy"
  /** nativeHistogramBucketLimit defines ff there are more than this many buckets in a native histogram, buckets will be merged to stay within the limit. It requires Prometheus >= v2.45.0. */
  "nativeHistogramBucketLimit"?: number
  /** nativeHistogramMinBucketFactor defines if the growth factor of one bucket to the next is smaller than this, buckets will be merged to increase the factor sufficiently. It requires Prometheus >= v2.50.0. */
  "nativeHistogramMinBucketFactor"?: number | string
  /** noProxy defines a comma-separated string that can contain IPs, CIDR notation, domain names that should be excluded from proxying. IP and domain names can contain port numbers. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "noProxy"?: string
  /** nomadSDConfigs defines a list of Nomad service discovery configurations. */
  "nomadSDConfigs"?: NomadSDConfigsItem[]
  /** oauth2 defines the configuration to use on every scrape request. */
  "oauth2"?: Oauth2
  /** openstackSDConfigs defines a list of OpenStack service discovery configurations. */
  "openstackSDConfigs"?: OpenstackSDConfigsItem[]
  /** ovhcloudSDConfigs defines a list of OVHcloud service discovery configurations. */
  "ovhcloudSDConfigs"?: OvhcloudSDConfigsItem[]
  /** params defines optional HTTP URL parameters */
  "params"?: Record<string, unknown>
  /** proxyConnectHeader optionally specifies headers to send to proxies during CONNECT requests. It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyConnectHeader"?: Record<string, unknown>
  /** proxyFromEnvironment defines whether to use the proxy configuration defined by environment variables (HTTP_PROXY, HTTPS_PROXY, and NO_PROXY). It requires Prometheus >= v2.43.0, Alertmanager >= v0.25.0 or Thanos >= v0.32.0. */
  "proxyFromEnvironment"?: boolean
  /** proxyUrl defines the HTTP proxy server to use. */
  "proxyUrl"?: string
  /** puppetDBSDConfigs defines a list of PuppetDB service discovery configurations. */
  "puppetDBSDConfigs"?: PuppetDBSDConfigsItem[]
  /** relabelings defines how to rewrite the target's labels before scraping. Prometheus Operator automatically adds relabelings for a few standard Kubernetes fields. The original scrape job's name is available via the `__tmp_prometheus_job_name` label. More info: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config */
  "relabelings"?: RelabelingsItem[]
  /** sampleLimit defines per-scrape limit on number of scraped samples that will be accepted. */
  "sampleLimit"?: number
  /** scalewaySDConfigs defines a list of Scaleway instances and baremetal service discovery configurations. */
  "scalewaySDConfigs"?: ScalewaySDConfigsItem[]
  /** scheme defines the protocol scheme used for requests. */
  "scheme"?: "http" | "https" | "HTTP" | "HTTPS"
  /** scrapeClass defines the scrape class to apply. */
  "scrapeClass"?: string
  /** scrapeClassicHistograms defines whether to scrape a classic histogram that is also exposed as a native histogram. It requires Prometheus >= v2.45.0. Notice: `scrapeClassicHistograms` corresponds to the `always_scrape_classic_histograms` field in the Prometheus configuration. */
  "scrapeClassicHistograms"?: boolean
  /** scrapeInterval defines the interval between consecutive scrapes. */
  "scrapeInterval"?: string
  /** scrapeNativeHistograms defines whether to enable scraping of native histograms. It requires Prometheus >= v3.8.0. */
  "scrapeNativeHistograms"?: boolean
  /** scrapeProtocols defines the protocols to negotiate during a scrape. It tells clients the protocols supported by Prometheus in order of preference (from most to least preferred). If unset, Prometheus uses its default value. It requires Prometheus >= v2.49.0. */
  "scrapeProtocols"?: ("PrometheusProto" | "OpenMetricsText0.0.1" | "OpenMetricsText1.0.0" | "PrometheusText0.0.4" | "PrometheusText1.0.0")[]
  /** scrapeTimeout defines the number of seconds to wait until a scrape request times out. The value cannot be greater than the scrape interval otherwise the operator will reject the resource. */
  "scrapeTimeout"?: string
  /** staticConfigs defines a list of static targets with a common label set. */
  "staticConfigs"?: StaticConfigsItem[]
  /** targetLimit defines a limit on the number of scraped targets that will be accepted. */
  "targetLimit"?: number
  /** tlsConfig defines the TLS configuration to use on every scrape request */
  "tlsConfig"?: TlsConfig
  /** trackTimestampsStaleness defines whether Prometheus tracks staleness of the metrics that have an explicit timestamp present in scraped data. Has no effect if `honorTimestamps` is false. It requires Prometheus >= v2.48.0. */
  "trackTimestampsStaleness"?: boolean
}

export interface ScrapeConfigStatus {
  /** bindings defines the list of workload resources (Prometheus, PrometheusAgent, ThanosRuler or Alertmanager) which select the configuration resource. */
  "bindings"?: BindingsItem[]
}

export interface TlsConfig5 {
  /** Certificate authority used when verifying server certificates. */
  "ca"?: Ca
  /** Path to the CA cert in the Prometheus container to use for the targets. */
  "caFile"?: string
  /** Client certificate to present when doing client-authentication. */
  "cert"?: Cert
  /** Path to the client cert file in the Prometheus container for the targets. */
  "certFile"?: string
  /** Disable target certificate validation. */
  "insecureSkipVerify"?: boolean
  /** Path to the client key file in the Prometheus container for the targets. */
  "keyFile"?: string
  /** Secret containing the client key file for the targets. */
  "keySecret"?: KeySecret
  /** Used to verify the hostname for the targets. */
  "serverName"?: string
}

export interface EndpointsItem {
  /** `authorization` configures the Authorization header credentials to use when scraping the target.   Cannot be set at the same time as `basicAuth`, or `oauth2`. */
  "authorization"?: Authorization
  /** `basicAuth` configures the Basic Authentication credentials to use when scraping the target.   Cannot be set at the same time as `authorization`, or `oauth2`. */
  "basicAuth"?: BasicAuth
  /** File to read bearer token for scraping the target.   Deprecated: use `authorization` instead. */
  "bearerTokenFile"?: string
  /** `bearerTokenSecret` specifies a key of a Secret containing the bearer token for scraping targets. The secret needs to be in the same namespace as the ServiceMonitor object and readable by the Prometheus Operator.   Deprecated: use `authorization` instead. */
  "bearerTokenSecret"?: BearerTokenSecret
  /** `enableHttp2` can be used to disable HTTP2 when scraping the target. */
  "enableHttp2"?: boolean
  /** When true, the pods which are not running (e.g. either in Failed or Succeeded state) are dropped during the target discovery.   If unset, the filtering is enabled.   More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase */
  "filterRunning"?: boolean
  /** `followRedirects` defines whether the scrape requests should follow HTTP 3xx redirects. */
  "followRedirects"?: boolean
  /** When true, `honorLabels` preserves the metric's labels when they collide with the target's labels. */
  "honorLabels"?: boolean
  /** `honorTimestamps` controls whether Prometheus preserves the timestamps when exposed by the target. */
  "honorTimestamps"?: boolean
  /** Interval at which Prometheus scrapes the metrics from the target.   If empty, Prometheus uses the global scrape interval. */
  "interval"?: string
  /** `metricRelabelings` configures the relabeling rules to apply to the samples before ingestion. */
  "metricRelabelings"?: MetricRelabelingsItem[]
  /** `oauth2` configures the OAuth2 settings to use when scraping the target.   It requires Prometheus >= 2.27.0.   Cannot be set at the same time as `authorization`, or `basicAuth`. */
  "oauth2"?: Oauth22
  /** params define optional HTTP URL parameters. */
  "params"?: Record<string, unknown>
  /** HTTP path from which to scrape for metrics.   If empty, Prometheus uses the default value (e.g. `/metrics`). */
  "path"?: string
  /** Name of the Service port which this endpoint refers to.   It takes precedence over `targetPort`. */
  "port"?: string
  /** `proxyURL` configures the HTTP Proxy URL (e.g. "http://proxyserver:2195") to go through when scraping the target. */
  "proxyUrl"?: string
  /** `relabelings` configures the relabeling rules to apply the target's metadata labels.   The Operator automatically adds relabelings for a few standard Kubernetes fields.   The original scrape job's name is available via the `__tmp_prometheus_job_name` label.   More info: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config */
  "relabelings"?: RelabelingsItem[]
  /** HTTP scheme to use for scraping.   `http` and `https` are the expected values unless you rewrite the `__scheme__` label via relabeling.   If empty, Prometheus uses the default value `http`. */
  "scheme"?: "http" | "https"
  /** Timeout after which Prometheus considers the scrape to be failed.   If empty, Prometheus uses the global scrape timeout unless it is less than the target's scrape interval value in which the latter is used. */
  "scrapeTimeout"?: string
  /** Name or number of the target port of the `Pod` object behind the Service. The port must be specified with the container's port property. */
  "targetPort"?: number | string
  /** TLS configuration to use when scraping the target. */
  "tlsConfig"?: TlsConfig5
  /** `trackTimestampsStaleness` defines whether Prometheus tracks staleness of the metrics that have an explicit timestamp present in scraped data. Has no effect if `honorTimestamps` is false.   It requires Prometheus >= v2.48.0. */
  "trackTimestampsStaleness"?: boolean
}

export interface ServiceMonitorSpec {
  /** `attachMetadata` defines additional metadata which is added to the discovered targets.   It requires Prometheus >= v2.37.0. */
  "attachMetadata"?: AttachMetadata
  /** List of endpoints part of this ServiceMonitor. */
  "endpoints"?: EndpointsItem[]
  /** `jobLabel` selects the label from the associated Kubernetes `Service` object which will be used as the `job` label for all metrics.   For example if `jobLabel` is set to `foo` and the Kubernetes `Service` object is labeled with `foo: bar`, then Prometheus adds the `job="bar"` label to all ingested metrics.   If the value of this field is empty or if the label doesn't exist for the given Service, the `job` label of the metrics defaults to the name of the associated Kubernetes `Service`. */
  "jobLabel"?: string
  /** Per-scrape limit on the number of targets dropped by relabeling that will be kept in memory. 0 means no limit.   It requires Prometheus >= v2.47.0. */
  "keepDroppedTargets"?: number
  /** Per-scrape limit on number of labels that will be accepted for a sample.   It requires Prometheus >= v2.27.0. */
  "labelLimit"?: number
  /** Per-scrape limit on length of labels name that will be accepted for a sample.   It requires Prometheus >= v2.27.0. */
  "labelNameLengthLimit"?: number
  /** Per-scrape limit on length of labels value that will be accepted for a sample.   It requires Prometheus >= v2.27.0. */
  "labelValueLengthLimit"?: number
  /** Selector to select which namespaces the Kubernetes `Endpoints` objects are discovered from. */
  "namespaceSelector"?: NamespaceSelector2
  /** `podTargetLabels` defines the labels which are transferred from the associated Kubernetes `Pod` object onto the ingested metrics. */
  "podTargetLabels"?: string[]
  /** `sampleLimit` defines a per-scrape limit on the number of scraped samples that will be accepted. */
  "sampleLimit"?: number
  /** The scrape class to apply. */
  "scrapeClass"?: string
  /** `scrapeProtocols` defines the protocols to negotiate during a scrape. It tells clients the protocols supported by Prometheus in order of preference (from most to least preferred).   If unset, Prometheus uses its default value.   It requires Prometheus >= v2.49.0. */
  "scrapeProtocols"?: ("PrometheusProto" | "OpenMetricsText0.0.1" | "OpenMetricsText1.0.0" | "PrometheusText0.0.4")[]
  /** Label selector to select the Kubernetes `Endpoints` objects. */
  "selector": Selector
  /** `targetLabels` defines the labels which are transferred from the associated Kubernetes `Service` object onto the ingested metrics. */
  "targetLabels"?: string[]
  /** `targetLimit` defines a limit on the number of scraped targets that will be accepted. */
  "targetLimit"?: number
}

export interface AlertRelabelConfigs {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface AlertmanagersConfig {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface QueryConfig {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Web3 {
  /** httpConfig defines HTTP parameters for web server. */
  "httpConfig"?: HttpConfig2
  /** tlsConfig defines the TLS parameters for HTTPS. */
  "tlsConfig"?: TlsConfig2
}

export interface ThanosRulerSpec {
  /** additionalArgs defines how to add additional arguments for the ThanosRuler container. It is intended for e.g. activating hidden flags which are not supported by the dedicated configuration options yet. The arguments are passed as-is to the ThanosRuler container which may cause issues if they are invalid or not supported by the given ThanosRuler version. In case of an argument conflict (e.g. an argument which is already set by the operator itself) or when providing an invalid argument the reconciliation will fail and an error will be logged. */
  "additionalArgs"?: AdditionalArgsItem[]
  /** affinity defines when specified, the pod's scheduling constraints. */
  "affinity"?: Affinity
  /** alertDropLabels defines the label names which should be dropped in Thanos Ruler alerts. The replica label `thanos_ruler_replica` will always be dropped from the alerts. */
  "alertDropLabels"?: string[]
  /** alertQueryUrl defines how Thanos Ruler will set in the 'Source' field of all alerts. Maps to the '--alert.query-url' CLI arg. */
  "alertQueryUrl"?: string
  /** alertRelabelConfigFile defines the path to the alert relabeling configuration file. Alert relabel configuration must have the form as specified in the official Prometheus documentation: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alert_relabel_configs The operator performs no validation of the configuration file. This field takes precedence over `alertRelabelConfig`. */
  "alertRelabelConfigFile"?: string
  /** alertRelabelConfigs defines the alert relabeling in Thanos Ruler. Alert relabel configuration must have the form as specified in the official Prometheus documentation: https://prometheus.io/docs/prometheus/latest/configuration/configuration/#alert_relabel_configs The operator performs no validation of the configuration. `alertRelabelConfigFile` takes precedence over this field. */
  "alertRelabelConfigs"?: AlertRelabelConfigs
  /** alertmanagersConfig defines the list of Alertmanager endpoints to send alerts to. The configuration format is defined at https://thanos.io/tip/components/rule.md/#alertmanager. It requires Thanos >= v0.10.0. The operator performs no validation of the configuration. This field takes precedence over `alertmanagersUrl`. */
  "alertmanagersConfig"?: AlertmanagersConfig
  /** alertmanagersUrl defines the list of Alertmanager endpoints to send alerts to. For Thanos >= v0.10.0, it is recommended to use `alertmanagersConfig` instead. `alertmanagersConfig` takes precedence over this field. */
  "alertmanagersUrl"?: string[]
  /** containers allows injecting additional containers or modifying operator generated containers. This can be used to allow adding an authentication proxy to the Pods or to change the behavior of an operator generated container. Containers described here modify an operator generated container if they share the same name and modifications are done via a strategic merge patch. The names of containers managed by the operator are: * `thanos-ruler` * `config-reloader` Overriding containers which are managed by the operator require careful testing, especially when upgrading to a new version of the operator. */
  "containers"?: ContainersItem[]
  /** dnsConfig defines Defines the DNS configuration for the pods. */
  "dnsConfig"?: DnsConfig
  /** dnsPolicy defines the DNS policy for the pods. */
  "dnsPolicy"?: "ClusterFirstWithHostNet" | "ClusterFirst" | "Default" | "None"
  /** enableFeatures defines how to setup Thanos Ruler feature flags. By default, no features are enabled. Enabling features which are disabled by default is entirely outside the scope of what the maintainers will support and by doing so, you accept that this behaviour may break at any time without notice. For more information see https://thanos.io/tip/components/rule.md/ It requires Thanos >= 0.39.0. */
  "enableFeatures"?: string[]
  /** enableServiceLinks defines whether information about services should be injected into pod's environment variables */
  "enableServiceLinks"?: boolean
  /** enforcedNamespaceLabel enforces adding a namespace label of origin for each alert and metric that is user created. The label value will always be the namespace of the object that is being created. */
  "enforcedNamespaceLabel"?: string
  /** evaluationInterval defines the interval between consecutive evaluations. */
  "evaluationInterval"?: string
  /** excludedFromEnforcement defines the list of references to PrometheusRule objects to be excluded from enforcing a namespace label of origin. Applies only if enforcedNamespaceLabel set to true. */
  "excludedFromEnforcement"?: ExcludedFromEnforcementItem[]
  /** externalPrefix defines the Thanos Ruler instances will be available under. This is necessary to generate correct URLs. This is necessary if Thanos Ruler is not served from root of a DNS name. */
  "externalPrefix"?: string
  /** grpcServerTlsConfig defines the gRPC server from which Thanos Querier reads recorded rule data. Note: Currently only the `minVersion`, `caFile`, `certFile`, `keyFile`, `cipherSuites` and `curves` fields are supported. */
  "grpcServerTlsConfig"?: GrpcServerTlsConfig
  /** hostAliases defines pods' hostAliases configuration */
  "hostAliases"?: HostAliasesItem[]
  /** hostUsers supports the user space in Kubernetes. More info: https://kubernetes.io/docs/tasks/configure-pod-container/user-namespaces/ The feature requires at least Kubernetes 1.28 with the `UserNamespacesSupport` feature gate enabled. Starting Kubernetes 1.33, the feature is enabled by default. */
  "hostUsers"?: boolean
  /** image defines Thanos container image URL. */
  "image"?: string
  /** imagePullPolicy defines for the 'thanos', 'init-config-reloader' and 'config-reloader' containers. See https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy for more details. */
  "imagePullPolicy"?: "" | "Always" | "Never" | "IfNotPresent"
  /** imagePullSecrets defines an optional list of references to secrets in the same namespace to use for pulling thanos images from registries see http://kubernetes.io/docs/user-guide/images#specifying-imagepullsecrets-on-a-pod */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** initContainers allows injecting initContainers to the Pod definition. Those can be used to e.g. fetch secrets for injection into the configuration from external sources. Any errors during the execution of an initContainer will lead to a restart of the Pod. More info: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ */
  "initContainers"?: InitContainersItem[]
  /** labels defines the external label pairs of the ThanosRuler resource. A default replica label `thanos_ruler_replica` will be always added as a label with the value of the pod's name. */
  "labels"?: Record<string, unknown>
  /** listenLocal defines the Thanos ruler listen on loopback, so that it does not bind against the Pod IP. */
  "listenLocal"?: boolean
  /** logFormat for ThanosRuler to be configured with. */
  "logFormat"?: "" | "logfmt" | "json"
  /** logLevel for ThanosRuler to be configured with. */
  "logLevel"?: "" | "debug" | "info" | "warn" | "error"
  /** minReadySeconds defines the minimum number of seconds for which a newly created pod should be ready without any of its container crashing for it to be considered available. If unset, pods will be considered available as soon as they are ready. */
  "minReadySeconds"?: number
  /** nodeSelector defines which Nodes the Pods are scheduled on. */
  "nodeSelector"?: Record<string, unknown>
  /** objectStorageConfig defines the configuration format is defined at https://thanos.io/tip/thanos/storage.md/#configuring-access-to-object-storage The operator performs no validation of the configuration. `objectStorageConfigFile` takes precedence over this field. */
  "objectStorageConfig"?: ObjectStorageConfig
  /** objectStorageConfigFile defines the path of the object storage configuration file. The configuration format is defined at https://thanos.io/tip/thanos/storage.md/#configuring-access-to-object-storage The operator performs no validation of the configuration file. This field takes precedence over `objectStorageConfig`. */
  "objectStorageConfigFile"?: string
  /** paused defines when a ThanosRuler deployment is paused, no actions except for deletion will be performed on the underlying objects. */
  "paused"?: boolean
  /** podManagementPolicy defines the policy for creating/deleting pods when scaling up and down. Unlike the default StatefulSet behavior, the default policy is `Parallel` to avoid manual intervention in case a pod gets stuck during a rollout. Note that updating this value implies the recreation of the StatefulSet which incurs a service outage. */
  "podManagementPolicy"?: "OrderedReady" | "Parallel"
  /** podMetadata defines labels and annotations which are propagated to the ThanosRuler pods. The following items are reserved and cannot be overridden: * "app.kubernetes.io/name" label, set to "thanos-ruler". * "app.kubernetes.io/managed-by" label, set to "prometheus-operator". * "app.kubernetes.io/instance" label, set to the name of the ThanosRuler instance. * "thanos-ruler" label, set to the name of the ThanosRuler instance. * "kubectl.kubernetes.io/default-container" annotation, set to "thanos-ruler". */
  "podMetadata"?: PodMetadata
  /** portName defines the port name used for the pods and governing service. Defaults to `web`. */
  "portName"?: string
  /** priorityClassName defines the priority class assigned to the Pods */
  "priorityClassName"?: string
  /** prometheusRulesExcludedFromEnforce defines a list of Prometheus rules to be excluded from enforcing of adding namespace labels. Works only if enforcedNamespaceLabel set to true. Make sure both ruleNamespace and ruleName are set for each pair Deprecated: use excludedFromEnforcement instead. */
  "prometheusRulesExcludedFromEnforce"?: PrometheusRulesExcludedFromEnforceItem[]
  /** queryConfig defines the list of Thanos Query endpoints from which to query metrics. The configuration format is defined at https://thanos.io/tip/components/rule.md/#query-api It requires Thanos >= v0.11.0. The operator performs no validation of the configuration. This field takes precedence over `queryEndpoints`. */
  "queryConfig"?: QueryConfig
  /** queryEndpoints defines the list of Thanos Query endpoints from which to query metrics. For Thanos >= v0.11.0, it is recommended to use `queryConfig` instead. `queryConfig` takes precedence over this field. */
  "queryEndpoints"?: string[]
  /** remoteWrite defines the list of remote write configurations. When the list isn't empty, the ruler is configured with stateless mode. It requires Thanos >= 0.24.0. */
  "remoteWrite"?: RemoteWriteItem[]
  /** replicas defines the number of thanos ruler instances to deploy. */
  "replicas"?: number
  /** resendDelay defines the minimum amount of time to wait before resending an alert to Alertmanager. */
  "resendDelay"?: string
  /** resources defines the resource requirements for single Pods. If not provided, no requests/limits will be set */
  "resources"?: Resources
  /** retention defines the time duration ThanosRuler shall retain data for. Default is '24h', and must match the regular expression `[0-9]+(ms|s|m|h|d|w|y)` (milliseconds seconds minutes hours days weeks years). The field has no effect when remote-write is configured since the Ruler operates in stateless mode. */
  "retention"?: string
  /** routePrefix defines the route prefix ThanosRuler registers HTTP handlers for. This allows thanos UI to be served on a sub-path. */
  "routePrefix"?: string
  /** ruleConcurrentEval defines how many rules can be evaluated concurrently. It requires Thanos >= v0.37.0. */
  "ruleConcurrentEval"?: number
  /** ruleGracePeriod defines the minimum duration between alert and restored "for" state. This is maintained only for alerts with configured "for" time greater than grace period. It requires Thanos >= v0.30.0. */
  "ruleGracePeriod"?: string
  /** ruleNamespaceSelector defines the namespaces to be selected for Rules discovery. If unspecified, only the same namespace as the ThanosRuler object is in is used. */
  "ruleNamespaceSelector"?: RuleNamespaceSelector
  /** ruleOutageTolerance defines the max time to tolerate prometheus outage for restoring "for" state of alert. It requires Thanos >= v0.30.0. */
  "ruleOutageTolerance"?: string
  /** ruleQueryOffset defines the default rule group's query offset duration to use. It requires Thanos >= v0.38.0. */
  "ruleQueryOffset"?: string
  /** ruleSelector defines the PrometheusRule objects to be selected for rule evaluation. An empty label selector matches all objects. A null label selector matches no objects. */
  "ruleSelector"?: RuleSelector
  /** schedulerName defines the scheduler to use for Pod scheduling. If not specified, the default scheduler is used. */
  "schedulerName"?: string
  /** securityContext defines the pod-level security attributes and common container settings. This defaults to the default PodSecurityContext. */
  "securityContext"?: SecurityContext2
  /** serviceAccountName defines the name of the ServiceAccount to use to run the Thanos Ruler Pods. */
  "serviceAccountName"?: string
  /** serviceName defines the name of the service name used by the underlying StatefulSet(s) as the governing service. If defined, the Service  must be created before the ThanosRuler resource in the same namespace and it must define a selector that matches the pod labels. If empty, the operator will create and manage a headless service named `thanos-ruler-operated` for ThanosRuler resources. When deploying multiple ThanosRuler resources in the same namespace, it is recommended to specify a different value for each. See https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-network-id for more details. */
  "serviceName"?: string
  /** storage defines the specification of how storage shall be used. */
  "storage"?: Storage
  /** terminationGracePeriodSeconds defines the optional duration in seconds the pod needs to terminate gracefully. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down) which may lead to data corruption. Defaults to 120 seconds. */
  "terminationGracePeriodSeconds"?: number
  /** tolerations defines when specified, the pod's tolerations. */
  "tolerations"?: TolerationsItem[]
  /** topologySpreadConstraints defines the pod's topology spread constraints. */
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  /** tracingConfig defines the tracing configuration. The configuration format is defined at https://thanos.io/tip/thanos/tracing.md/#configuration This is an *experimental feature*, it may change in any upcoming release in a breaking way. The operator performs no validation of the configuration. `tracingConfigFile` takes precedence over this field. */
  "tracingConfig"?: TracingConfig
  /** tracingConfigFile defines the path of the tracing configuration file. The configuration format is defined at https://thanos.io/tip/thanos/tracing.md/#configuration This is an *experimental feature*, it may change in any upcoming release in a breaking way. The operator performs no validation of the configuration file. This field takes precedence over `tracingConfig`. */
  "tracingConfigFile"?: string
  /** updateStrategy indicates the strategy that will be employed to update Pods in the StatefulSet when a revision is made to statefulset's Pod Template. The default strategy is RollingUpdate. */
  "updateStrategy"?: UpdateStrategy
  /** version of Thanos to be deployed. */
  "version"?: string
  /** volumeMounts defines how the configuration of additional VolumeMounts on the output StatefulSet definition. VolumeMounts specified will be appended to other VolumeMounts in the ruler container, that are generated as a result of StorageSpec objects. */
  "volumeMounts"?: VolumeMountsItem[]
  /** volumes defines how configuration of additional volumes on the output StatefulSet definition. Volumes specified will be appended to other volumes that are generated as a result of StorageSpec objects. */
  "volumes"?: VolumesItem[]
  /** web defines the configuration of the ThanosRuler web server. */
  "web"?: Web3
}

export interface ThanosRulerStatus {
  /** availableReplicas defines the total number of available pods (ready for at least minReadySeconds) targeted by this ThanosRuler deployment. */
  "availableReplicas"?: number
  /** conditions defines the current state of the ThanosRuler object. */
  "conditions"?: ConditionsItem2[]
  /** paused defines whether any actions on the underlying managed objects are being performed. Only delete actions will be performed. */
  "paused"?: boolean
  /** replicas defines the total number of non-terminated pods targeted by this ThanosRuler deployment (their labels match the selector). */
  "replicas"?: number
  /** unavailableReplicas defines the total number of unavailable pods targeted by this ThanosRuler deployment. */
  "unavailableReplicas"?: number
  /** updatedReplicas defines the total number of non-terminated pods targeted by this ThanosRuler deployment that have the desired version spec. */
  "updatedReplicas"?: number
}
