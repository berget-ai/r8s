/**
 * GENERATED from monitoring CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

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

export interface PrometheusRule {
  apiVersion: 'monitoring.coreos.com/v1'
  kind: 'PrometheusRule'
  metadata: ObjectMeta
  spec: PrometheusRuleSpec
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

export interface AttachMetadata {
  /** When set to true, Prometheus must have the `get` permission on the `Nodes` objects. */
  "node"?: boolean
}

export interface NamespaceSelector {
  /** Boolean describing whether all namespaces are selected in contrast to a list restricting them. */
  "any"?: boolean
  /** List of namespace names to select from. */
  "matchNames"?: string[]
}

export interface Credentials {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Authorization {
  /** Selects a key of a Secret in the namespace that contains the credentials for authentication. */
  "credentials"?: Credentials
  /** Defines the authentication type. The value is case-insensitive.   "Basic" is not a supported value.   Default: "Bearer" */
  "type"?: string
}

export interface Password {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Username {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface BasicAuth {
  /** `password` specifies a key of a Secret containing the password for authentication. */
  "password"?: Password
  /** `username` specifies a key of a Secret containing the username for authentication. */
  "username"?: Username
}

export interface BearerTokenSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface MetricRelabelingsItem {
  /** Action to perform based on the regex matching.   `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0.   Default: "Replace" */
  "action"?: string
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

export interface ConfigMap {
  /** The key to select. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the ConfigMap or its key must be defined */
  "optional"?: boolean
}

export interface Secret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ClientId {
  /** ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface ClientSecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Oauth2 {
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
  "action"?: string
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

export interface Ca {
  /** ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface Cert {
  /** ConfigMap containing data to use for the targets. */
  "configMap"?: ConfigMap
  /** Secret containing data to use for the targets. */
  "secret"?: Secret
}

export interface KeySecret {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface TlsConfig {
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
  "oauth2"?: Oauth2
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
  "scheme"?: string
  /** Timeout after which Prometheus considers the scrape to be failed.   If empty, Prometheus uses the global scrape timeout unless it is less than the target's scrape interval value in which the latter is used. */
  "scrapeTimeout"?: string
  /** Name or number of the target port of the `Pod` object behind the Service, the port must be specified with container port property.   Deprecated: use 'port' instead. */
  "targetPort"?: number | string
  /** TLS configuration to use when scraping the target. */
  "tlsConfig"?: TlsConfig
  /** `trackTimestampsStaleness` defines whether Prometheus tracks staleness of the metrics that have an explicit timestamp present in scraped data. Has no effect if `honorTimestamps` is false.   It requires Prometheus >= v2.48.0. */
  "trackTimestampsStaleness"?: boolean
}

export interface MatchExpressionsItem {
  /** key is the label key that the selector applies to. */
  "key": string
  /** operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. */
  "operator": string
  /** values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. */
  "values"?: string[]
}

export interface Selector {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
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
  "namespaceSelector"?: NamespaceSelector
  /** List of endpoints part of this PodMonitor. */
  "podMetricsEndpoints"?: PodMetricsEndpointsItem[]
  /** `podTargetLabels` defines the labels which are transferred from the associated Kubernetes `Pod` object onto the ingested metrics. */
  "podTargetLabels"?: string[]
  /** `sampleLimit` defines a per-scrape limit on the number of scraped samples that will be accepted. */
  "sampleLimit"?: number
  /** The scrape class to apply. */
  "scrapeClass"?: string
  /** `scrapeProtocols` defines the protocols to negotiate during a scrape. It tells clients the protocols supported by Prometheus in order of preference (from most to least preferred).   If unset, Prometheus uses its default value.   It requires Prometheus >= v2.49.0. */
  "scrapeProtocols"?: string[]
  /** Label selector to select the Kubernetes `Pod` objects. */
  "selector": Selector
  /** `targetLimit` defines a limit on the number of scraped targets that will be accepted. */
  "targetLimit"?: number
}

export interface RulesItem {
  /** Name of the alert. Must be a valid label value. Only one of `record` and `alert` must be set. */
  "alert"?: string
  /** Annotations to add to each alert. Only valid for alerting rules. */
  "annotations"?: Record<string, unknown>
  /** PromQL expression to evaluate. */
  "expr": number | string
  /** Alerts are considered firing once they have been returned for this long. */
  "for"?: string
  /** KeepFiringFor defines how long an alert will continue firing after the condition that triggered it has cleared. */
  "keep_firing_for"?: string
  /** Labels to add or overwrite. */
  "labels"?: Record<string, unknown>
  /** Name of the time series to output to. Must be a valid metric name. Only one of `record` and `alert` must be set. */
  "record"?: string
}

export interface GroupsItem {
  /** Interval determines how often rules in the group are evaluated. */
  "interval"?: string
  /** Limit the number of alerts an alerting rule and series a recording rule can produce. Limit is supported starting with Prometheus >= 2.31 and Thanos Ruler >= 0.24. */
  "limit"?: number
  /** Name of the rule group. */
  "name": string
  /** PartialResponseStrategy is only used by ThanosRuler and will be ignored by Prometheus instances. More info: https://github.com/thanos-io/thanos/blob/main/docs/components/rule.md#partial-response */
  "partial_response_strategy"?: string
  /** List of alerting and recording rules. */
  "rules"?: RulesItem[]
}

export interface PrometheusRuleSpec {
  /** Content of Prometheus rule file */
  "groups"?: GroupsItem[]
}

export interface TlsConfig2 {
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
  "oauth2"?: Oauth2
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
  "scheme"?: string
  /** Timeout after which Prometheus considers the scrape to be failed.   If empty, Prometheus uses the global scrape timeout unless it is less than the target's scrape interval value in which the latter is used. */
  "scrapeTimeout"?: string
  /** Name or number of the target port of the `Pod` object behind the Service. The port must be specified with the container's port property. */
  "targetPort"?: number | string
  /** TLS configuration to use when scraping the target. */
  "tlsConfig"?: TlsConfig2
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
  "namespaceSelector"?: NamespaceSelector
  /** `podTargetLabels` defines the labels which are transferred from the associated Kubernetes `Pod` object onto the ingested metrics. */
  "podTargetLabels"?: string[]
  /** `sampleLimit` defines a per-scrape limit on the number of scraped samples that will be accepted. */
  "sampleLimit"?: number
  /** The scrape class to apply. */
  "scrapeClass"?: string
  /** `scrapeProtocols` defines the protocols to negotiate during a scrape. It tells clients the protocols supported by Prometheus in order of preference (from most to least preferred).   If unset, Prometheus uses its default value.   It requires Prometheus >= v2.49.0. */
  "scrapeProtocols"?: string[]
  /** Label selector to select the Kubernetes `Endpoints` objects. */
  "selector": Selector
  /** `targetLabels` defines the labels which are transferred from the associated Kubernetes `Service` object onto the ingested metrics. */
  "targetLabels"?: string[]
  /** `targetLimit` defines a limit on the number of scraped targets that will be accepted. */
  "targetLimit"?: number
}
