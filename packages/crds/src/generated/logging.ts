/**
 * GENERATED from logging CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface Flow {
  apiVersion: 'logging.banzaicloud.io/v1beta1'
  kind: 'Flow'
  metadata: ObjectMeta
  spec: FlowSpec
  status?: FlowStatus
}

/** Props for the {@link Flow} component — a 1:1 mapping of the logging.banzaicloud.io/v1beta1 CRD. */
export interface FlowProps {
  metadata: ObjectMeta
  spec: FlowSpec
}

/** Render a Flow (logging.banzaicloud.io/v1beta1) exactly as defined by its CRD. */
export function FlowComponent(props: FlowProps) {
  return jsx('Flow', {
    apiVersion: 'logging.banzaicloud.io/v1beta1',
    kind: 'Flow',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Logging {
  apiVersion: 'logging.banzaicloud.io/v1beta1'
  kind: 'Logging'
  metadata: ObjectMeta
  spec: LoggingSpec
  status?: LoggingStatus
}

/** Props for the {@link Logging} component — a 1:1 mapping of the logging.banzaicloud.io/v1beta1 CRD. */
export interface LoggingProps {
  metadata: ObjectMeta
  spec: LoggingSpec
}

/** Render a Logging (logging.banzaicloud.io/v1beta1) exactly as defined by its CRD. */
export function LoggingComponent(props: LoggingProps) {
  return jsx('Logging', {
    apiVersion: 'logging.banzaicloud.io/v1beta1',
    kind: 'Logging',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Output {
  apiVersion: 'logging.banzaicloud.io/v1beta1'
  kind: 'Output'
  metadata: ObjectMeta
  spec: OutputSpec
  status?: OutputStatus
}

/** Props for the {@link Output} component — a 1:1 mapping of the logging.banzaicloud.io/v1beta1 CRD. */
export interface OutputProps {
  metadata: ObjectMeta
  spec: OutputSpec
}

/** Render a Output (logging.banzaicloud.io/v1beta1) exactly as defined by its CRD. */
export function OutputComponent(props: OutputProps) {
  return jsx('Output', {
    apiVersion: 'logging.banzaicloud.io/v1beta1',
    kind: 'Output',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Concat {
  "continuous_line_regexp"?: string
  "flush_interval"?: number
  "keep_partial_key"?: boolean
  "keep_partial_metadata"?: string
  "key"?: string
  "multiline_end_regexp"?: string
  "multiline_start_regexp"?: string
  "n_lines"?: number
  "partial_cri_logtag_key"?: string
  "partial_cri_stream_key"?: string
  "partial_key"?: string
  "partial_metadata_format"?: string
  "partial_value"?: string
  "separator"?: string
  "stream_identity_key"?: string
  "timeout_label"?: string
  "use_first_timestamp"?: boolean
  "use_partial_cri_logtag"?: boolean
  "use_partial_metadata"?: string
}

export interface Dedot {
  "de_dot_nested"?: boolean
  "de_dot_separator"?: string
}

export interface DetectExceptions {
  "force_line_breaks"?: boolean
  "languages"?: string[]
  "match_tag"?: string
  "max_bytes"?: number
  "max_lines"?: number
  "message"?: string
  "multiline_flush_interval"?: string
  "remove_tag_prefix"?: string
  "stream"?: string
}

export interface ElasticsearchGenid {
  "hash_id_key"?: string
  "hash_type"?: string
  "include_tag_in_seed"?: boolean
  "include_time_in_seed"?: boolean
  "record_keys"?: string
  "separator"?: string
  "use_entire_record"?: boolean
  "use_record_as_seed"?: boolean
}

export interface Geoip {
  "backend_library"?: string
  "geoip_database"?: string
  "geoip_lookup_keys"?: string
  "geoip2_database"?: string
  "records"?: Record<string, unknown>[]
  "skip_adding_null_record"?: boolean
}

export interface ExcludeItem {
  "key": string
  "pattern": string
}

export interface RegexpItem {
  "key": string
  "pattern": string
}

export interface AndItem {
  "exclude"?: ExcludeItem[]
  "regexp"?: RegexpItem[]
}

export interface OrItem {
  "exclude"?: ExcludeItem[]
  "regexp"?: RegexpItem[]
}

export interface Grep {
  "and"?: AndItem[]
  "exclude"?: ExcludeItem[]
  "or"?: OrItem[]
  "regexp"?: RegexpItem[]
}

export interface KubeEventsTimestamp {
  "mapped_time_key"?: string
  "timestamp_fields"?: string[]
}

export interface SecretKeyRef {
  "key": string
  "name"?: string
  "optional"?: boolean
}

export interface MountFrom {
  "secretKeyRef"?: SecretKeyRef
}

export interface ValueFrom {
  "secretKeyRef"?: SecretKeyRef
}

export interface CustomPatternPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface GrokPatternsItem {
  "keep_time_key"?: boolean
  "name"?: string
  "pattern": string
  "time_format"?: string
  "time_key"?: string
  "timezone"?: string
}

export interface PatternsItem {
  "custom_pattern_path"?: CustomPatternPath
  "estimate_current_event"?: boolean
  "expression"?: string
  "format"?: string
  "format_name"?: string
  "grok_failure_key"?: string
  "grok_name_key"?: string
  "grok_pattern"?: string
  "grok_patterns"?: GrokPatternsItem[]
  "keep_time_key"?: boolean
  "local_time"?: boolean
  "multiline_start_regexp"?: string
  "null_empty_string"?: boolean
  "null_value_pattern"?: string
  "time_format"?: string
  "time_key"?: string
  "time_type"?: string
  "timezone"?: string
  "type"?: string
  "types"?: string
  "utc"?: boolean
}

export interface Parse {
  "custom_pattern_path"?: CustomPatternPath
  "delimiter"?: string
  "delimiter_pattern"?: string
  "estimate_current_event"?: boolean
  "expression"?: string
  "format"?: string
  "format_firstline"?: string
  "format_key"?: string
  "grok_failure_key"?: string
  "grok_name_key"?: string
  "grok_pattern"?: string
  "grok_patterns"?: GrokPatternsItem[]
  "keep_time_key"?: boolean
  "keys"?: string
  "label_delimiter"?: string
  "local_time"?: boolean
  "multiline"?: string[]
  "multiline_start_regexp"?: string
  "null_empty_string"?: boolean
  "null_value_pattern"?: string
  "patterns"?: PatternsItem[]
  "time_format"?: string
  "time_key"?: string
  "time_type"?: string
  "timezone"?: string
  "type"?: string
  "types"?: string
  "utc"?: boolean
}

export interface ParsersItem {
  "custom_pattern_path"?: CustomPatternPath
  "delimiter"?: string
  "delimiter_pattern"?: string
  "estimate_current_event"?: boolean
  "expression"?: string
  "format"?: string
  "format_firstline"?: string
  "format_key"?: string
  "grok_failure_key"?: string
  "grok_name_key"?: string
  "grok_pattern"?: string
  "grok_patterns"?: GrokPatternsItem[]
  "keep_time_key"?: boolean
  "keys"?: string
  "label_delimiter"?: string
  "local_time"?: boolean
  "multiline"?: string[]
  "multiline_start_regexp"?: string
  "null_empty_string"?: boolean
  "null_value_pattern"?: string
  "patterns"?: PatternsItem[]
  "time_format"?: string
  "time_key"?: string
  "time_type"?: string
  "timezone"?: string
  "type"?: string
  "types"?: string
  "utc"?: boolean
}

export interface Parser {
  "emit_invalid_record_to_error"?: boolean
  "hash_value_field"?: string
  "inject_key_prefix"?: string
  "key_name"?: string
  "parse"?: Parse
  "parsers"?: ParsersItem[]
  "remove_key_name_field"?: boolean
  "replace_invalid_sequence"?: boolean
  "reserve_data"?: boolean
  "reserve_time"?: boolean
}

export interface MetricsItem {
  "buckets"?: string
  "desc": string
  "key"?: string
  "labels"?: Record<string, unknown>
  "name": string
  "type": string
}

export interface Prometheus {
  "labels"?: Record<string, unknown>
  "metrics"?: MetricsItem[]
}

export interface Raw {
  "config"?: string
}

export interface ReplacesItem {
  "expression": string
  "key": string
  "replace": string
}

export interface RecordModifier {
  "char_encoding"?: string
  "prepare_value"?: string
  "records"?: Record<string, unknown>[]
  "remove_keys"?: string
  "replaces"?: ReplacesItem[]
  "whitelist_keys"?: string
}

export interface RecordTransformer {
  "auto_typecast"?: boolean
  "enable_ruby"?: boolean
  "keep_keys"?: string
  "records"?: Record<string, unknown>[]
  "remove_keys"?: string
  "renew_record"?: boolean
  "renew_time_key"?: string
}

export interface Stdout {
  "output_type"?: string
}

export interface TagNormaliser {
  "format"?: string
  "match_tag"?: string
}

export interface Throttle {
  "group_bucket_limit"?: number
  "group_bucket_period_s"?: number
  "group_drop_logs"?: boolean
  "group_key"?: string
  "group_reset_rate_s"?: number
  "group_warning_delay_s"?: number
}

export interface Useragent {
  "delete_key"?: boolean
  "flatten"?: boolean
  "key_name"?: string
  "out_key"?: string
}

export interface FiltersItem {
  "concat"?: Concat
  "dedot"?: Dedot
  "detectExceptions"?: DetectExceptions
  "elasticsearch_genid"?: ElasticsearchGenid
  "geoip"?: Geoip
  "grep"?: Grep
  "kube_events_timestamp"?: KubeEventsTimestamp
  "parser"?: Parser
  "prometheus"?: Prometheus
  "raw"?: Raw
  "record_modifier"?: RecordModifier
  "record_transformer"?: RecordTransformer
  "stdout"?: Stdout
  "tag_normaliser"?: TagNormaliser
  "throttle"?: Throttle
  "useragent"?: Useragent
}

export interface Exclude {
  "container_names"?: string[]
  "hosts"?: string[]
  "labels"?: Record<string, unknown>
  "namespace_labels"?: Record<string, unknown>
}

export interface Select {
  "container_names"?: string[]
  "hosts"?: string[]
  "labels"?: Record<string, unknown>
}

export interface MatchItem {
  "exclude"?: Exclude
  "select"?: Select
}

export interface FlowSpec {
  "filters"?: FiltersItem[]
  "flowLabel"?: string
  "globalOutputRefs"?: string[]
  "includeLabelInRouter"?: boolean
  "localOutputRefs"?: string[]
  "loggingRef"?: string
  "match"?: MatchItem[]
  "outputRefs"?: string[]
  "selectors"?: Record<string, unknown>
}

export interface FlowStatus {
  "active"?: boolean
  "problems"?: string[]
  "problemsCount"?: number
}

export interface ConfigCheck {
  "labels"?: Record<string, unknown>
  "strategy"?: string
  "timeoutSeconds"?: number
}

export interface DefaultFlow {
  "filters"?: FiltersItem[]
  "flowLabel"?: string
  "globalOutputRefs"?: string[]
  "includeLabelInRouter"?: boolean
  "outputRefs"?: string[]
}

export interface MatchExpressionsItem {
  "key": string
  "operator": string
  "values"?: string[]
}

export interface MatchFieldsItem {
  "key": string
  "operator": string
  "values"?: string[]
}

export interface Preference {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchFields"?: MatchFieldsItem[]
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem {
  "preference": Preference
  "weight": number
}

export interface NodeSelectorTermsItem {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchFields"?: MatchFieldsItem[]
}

export interface RequiredDuringSchedulingIgnoredDuringExecution {
  "nodeSelectorTerms": NodeSelectorTermsItem[]
}

export interface NodeAffinity {
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecution
}

export interface LabelSelector {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchLabels"?: Record<string, unknown>
}

export interface NamespaceSelector {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchLabels"?: Record<string, unknown>
}

export interface PodAffinityTerm {
  "labelSelector"?: LabelSelector
  "matchLabelKeys"?: string[]
  "mismatchLabelKeys"?: string[]
  "namespaceSelector"?: NamespaceSelector
  "namespaces"?: string[]
  "topologyKey": string
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem2 {
  "podAffinityTerm": PodAffinityTerm
  "weight": number
}

export interface RequiredDuringSchedulingIgnoredDuringExecutionItem {
  "labelSelector"?: LabelSelector
  "matchLabelKeys"?: string[]
  "mismatchLabelKeys"?: string[]
  "namespaceSelector"?: NamespaceSelector
  "namespaces"?: string[]
  "topologyKey": string
}

export interface PodAffinity {
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem2[]
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface PodAntiAffinity {
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem2[]
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface Affinity {
  "nodeAffinity"?: NodeAffinity
  "podAffinity"?: PodAffinity
  "podAntiAffinity"?: PodAntiAffinity
}

export interface BufferStorage {
  "storage.backlog.flush_on_shutdown"?: string
  "storage.backlog.mem_limit"?: string
  "storage.checksum"?: string
  "storage.delete_irrecoverable_chunks"?: string
  "storage.max_chunks_up"?: number
  "storage.metrics"?: string
  "storage.path"?: string
  "storage.sync"?: string
}

export interface ItemsItem {
  "key": string
  "mode"?: number
  "path": string
}

export interface ConfigMap {
  "defaultMode"?: number
  "items"?: ItemsItem[]
  "name"?: string
  "optional"?: boolean
}

export interface EmptyDir {
  "medium"?: string
  "sizeLimit"?: number | string
}

export interface HostPath {
  "path": string
  "type"?: string
}

export interface Source {
  "claimName": string
  "readOnly"?: boolean
}

export interface DataSource {
  "apiGroup"?: string
  "kind": string
  "name": string
}

export interface DataSourceRef {
  "apiGroup"?: string
  "kind": string
  "name": string
  "namespace"?: string
}

export interface Resources {
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface Selector {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchLabels"?: Record<string, unknown>
}

export interface Spec {
  "accessModes"?: string[]
  "dataSource"?: DataSource
  "dataSourceRef"?: DataSourceRef
  "resources"?: Resources
  "selector"?: Selector
  "storageClassName"?: string
  "volumeAttributesClassName"?: string
  "volumeMode"?: string
  "volumeName"?: string
}

export interface Pvc {
  "annotations"?: Record<string, unknown>
  "labels"?: Record<string, unknown>
  "source"?: Source
  "spec"?: Spec
}

export interface Secret {
  "defaultMode"?: number
  "items"?: ItemsItem[]
  "optional"?: boolean
  "secretName"?: string
}

export interface BufferStorageVolume {
  "configMap"?: ConfigMap
  "emptyDir"?: EmptyDir
  "host_path"?: HostPath
  "hostPath"?: HostPath
  "pvc"?: Pvc
  "secret"?: Secret
}

export interface ImagePullSecretsItem {
  "name"?: string
}

export interface BufferVolumeImage {
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "pullPolicy"?: string
  "repository"?: string
  "tag"?: string
}

export interface Exec {
  "command"?: string[]
}

export interface Grpc {
  "port": number
  "service"?: string
}

export interface HttpHeadersItem {
  "name": string
  "value": string
}

export interface HttpGet {
  "host"?: string
  "httpHeaders"?: HttpHeadersItem[]
  "path"?: string
  "port": number | string
  "scheme"?: string
}

export interface TcpSocket {
  "host"?: string
  "port": number | string
}

export interface BufferVolumeLivenessProbe {
  "exec"?: Exec
  "failureThreshold"?: number
  "grpc"?: Grpc
  "httpGet"?: HttpGet
  "initialDelaySeconds"?: number
  "periodSeconds"?: number
  "successThreshold"?: number
  "tcpSocket"?: TcpSocket
  "terminationGracePeriodSeconds"?: number
  "timeoutSeconds"?: number
}

export interface PrometheusRulesOverrideItem {
  "alert"?: string
  "annotations"?: Record<string, unknown>
  "expr"?: number | string
  "for"?: string
  "keep_firing_for"?: string
  "labels"?: Record<string, unknown>
  "record"?: string
}

export interface MetricRelabelingsItem {
  "action"?: string
  "modulus"?: number
  "regex"?: string
  "replacement"?: string
  "separator"?: string
  "sourceLabels"?: string[]
  "targetLabel"?: string
}

export interface RelabelingsItem {
  "action"?: string
  "modulus"?: number
  "regex"?: string
  "replacement"?: string
  "separator"?: string
  "sourceLabels"?: string[]
  "targetLabel"?: string
}

export interface ConfigMap2 {
  "key": string
  "name"?: string
  "optional"?: boolean
}

export interface Secret2 {
  "key": string
  "name"?: string
  "optional"?: boolean
}

export interface Ca {
  "configMap"?: ConfigMap2
  "secret"?: Secret2
}

export interface Cert {
  "configMap"?: ConfigMap2
  "secret"?: Secret2
}

export interface KeySecret {
  "key": string
  "name"?: string
  "optional"?: boolean
}

export interface TlsConfig {
  "ca"?: Ca
  "caFile"?: string
  "cert"?: Cert
  "certFile"?: string
  "insecureSkipVerify"?: boolean
  "keyFile"?: string
  "keySecret"?: KeySecret
  "maxVersion"?: string
  "minVersion"?: string
  "serverName"?: string
}

export interface ServiceMonitorConfig {
  "additionalLabels"?: Record<string, unknown>
  "honorLabels"?: boolean
  "metricRelabelings"?: MetricRelabelingsItem[]
  "relabelings"?: RelabelingsItem[]
  "scheme"?: string
  "tlsConfig"?: TlsConfig
}

export interface BufferVolumeMetrics {
  "enabled"?: boolean
  "interval"?: string
  "path"?: string
  "port"?: number
  "prometheusAnnotations"?: boolean
  "prometheusRules"?: boolean
  "prometheusRulesLabels"?: Record<string, unknown>
  "prometheusRulesOverride"?: PrometheusRulesOverrideItem[]
  "serviceMonitor"?: boolean
  "serviceMonitorConfig"?: ServiceMonitorConfig
  "timeout"?: string
}

export interface ClaimsItem {
  "name": string
  "request"?: string
}

export interface BufferVolumeResources {
  "claims"?: ClaimsItem[]
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface Image {
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "pullPolicy"?: string
  "repository"?: string
  "tag"?: string
}

export interface Resources2 {
  "claims"?: ClaimsItem[]
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface ConfigHotReload {
  "image"?: Image
  "resources"?: Resources2
}

export interface OptionsItem {
  "name"?: string
  "value"?: string
}

export interface DnsConfig {
  "nameservers"?: string[]
  "options"?: OptionsItem[]
  "searches"?: string[]
}

export interface ConfigMapKeyRef {
  "key": string
  "name"?: string
  "optional"?: boolean
}

export interface FieldRef {
  "apiVersion"?: string
  "fieldPath": string
}

export interface FileKeyRef {
  "key": string
  "optional"?: boolean
  "path": string
  "volumeName": string
}

export interface ResourceFieldRef {
  "containerName"?: string
  "divisor"?: number | string
  "resource": string
}

export interface ValueFrom2 {
  "configMapKeyRef"?: ConfigMapKeyRef
  "fieldRef"?: FieldRef
  "fileKeyRef"?: FileKeyRef
  "resourceFieldRef"?: ResourceFieldRef
  "secretKeyRef"?: SecretKeyRef
}

export interface EnvVarsItem {
  "name": string
  "value"?: string
  "valueFrom"?: ValueFrom2
}

export interface ExtraVolumeMountsItem {
  "destination": string
  "readOnly"?: boolean
  "source": string
}

export interface FilterAws {
  "Match"?: string
  "account_id"?: boolean
  "ami_id"?: boolean
  "az"?: boolean
  "ec2_instance_id"?: boolean
  "ec2_instance_type"?: boolean
  "hostname"?: boolean
  "imds_version"?: string
  "private_ip"?: boolean
  "vpc_id"?: boolean
}

export interface FilterGrep {
  "Exclude"?: string[]
  "LogicalOp"?: string
  "Match"?: string
  "Regex"?: string[]
}

export interface FilterKubernetes {
  "Annotations"?: string
  "Buffer_Size"?: string
  "Cache_Use_Docker_Id"?: string
  "DNS_Retries"?: string
  "DNS_Wait_Time"?: string
  "Dummy_Meta"?: string
  "K8S-Logging.Exclude"?: string
  "K8S-Logging.Parser"?: string
  "Keep_Log"?: string
  "Kube_CA_File"?: string
  "Kube_CA_Path"?: string
  "Kube_Meta_Cache_TTL"?: string
  "Kube_Tag_Prefix"?: string
  "Kube_Token_File"?: string
  "Kube_Token_TTL"?: string
  "Kube_URL"?: string
  "Kube_meta_preload_cache_dir"?: string
  "Kubelet_Host"?: string
  "Kubelet_Port"?: string
  "Labels"?: string
  "Match"?: string
  "Merge_Log"?: string
  "Merge_Log_Key"?: string
  "Merge_Log_Trim"?: string
  "Merge_Parser"?: string
  "Regex_Parser"?: string
  "Use_Journal"?: string
  "Use_Kubelet"?: string
  "kube_meta_namespace_cache_ttl"?: string
  "namespace_annotations"?: string
  "namespace_labels"?: string
  "tls.debug"?: string
  "tls.verify"?: string
}

export interface AKeyMatches {
  "key"?: string
}

export interface KeyDoesNotExist {
  "key"?: string
  "value"?: string
}

export interface KeyExists {
  "key"?: string
}

export interface KeyValueDoesNotEqual {
  "key"?: string
  "value"?: string
}

export interface KeyValueDoesNotMatch {
  "key"?: string
  "value"?: string
}

export interface KeyValueEquals {
  "key"?: string
  "value"?: string
}

export interface KeyValueMatches {
  "key"?: string
  "value"?: string
}

export interface MatchingKeysDoNotHaveMatchingValues {
  "key"?: string
  "value"?: string
}

export interface MatchingKeysHaveMatchingValues {
  "key"?: string
  "value"?: string
}

export interface NoKeyMatches {
  "key"?: string
}

export interface ConditionsItem {
  "A_key_matches"?: AKeyMatches
  "Key_does_not_exist"?: KeyDoesNotExist
  "Key_exists"?: KeyExists
  "Key_value_does_not_equal"?: KeyValueDoesNotEqual
  "Key_value_does_not_match"?: KeyValueDoesNotMatch
  "Key_value_equals"?: KeyValueEquals
  "Key_value_matches"?: KeyValueMatches
  "Matching_keys_do_not_have_matching_values"?: MatchingKeysDoNotHaveMatchingValues
  "Matching_keys_have_matching_values"?: MatchingKeysHaveMatchingValues
  "No_key_matches"?: NoKeyMatches
}

export interface Add {
  "key"?: string
  "value"?: string
}

export interface Copy {
  "key"?: string
  "value"?: string
}

export interface HardCopy {
  "key"?: string
  "value"?: string
}

export interface HardRename {
  "key"?: string
  "value"?: string
}

export interface Remove {
  "key"?: string
}

export interface RemoveRegex {
  "key"?: string
}

export interface RemoveWildcard {
  "key"?: string
}

export interface Rename {
  "key"?: string
  "value"?: string
}

export interface Set {
  "key"?: string
  "value"?: string
}

export interface RulesItem {
  "Add"?: Add
  "Copy"?: Copy
  "Hard_copy"?: HardCopy
  "Hard_rename"?: HardRename
  "Remove"?: Remove
  "Remove_regex"?: RemoveRegex
  "Remove_wildcard"?: RemoveWildcard
  "Rename"?: Rename
  "Set"?: Set
}

export interface FilterModifyItem {
  "conditions"?: ConditionsItem[]
  "rules"?: RulesItem[]
}

export interface ForwardOptions {
  "Require_ack_response"?: boolean
  "Retain_Metadata_In_Forward_Mode"?: boolean
  "Retry_Limit"?: string
  "Send_options"?: boolean
  "Tag"?: string
  "Time_as_Integer"?: boolean
  "Workers"?: number
  "storage.total_limit_size"?: string
}

export interface HealthCheck {
  "hcErrorsCount"?: number
  "hcPeriod"?: number
  "hcRetryFailureCount"?: number
}

export interface InputTail {
  "Buffer_Chunk_Size"?: string
  "Buffer_Max_Size"?: string
  "DB"?: string
  "DB.journal_mode"?: string
  "DB.locking"?: boolean
  "DB_Sync"?: string
  "Docker_Mode"?: string
  "Docker_Mode_Flush"?: string
  "Docker_Mode_Parser"?: string
  "Exclude_Path"?: string
  "File_Cache_Advise"?: string
  "Ignore_Older"?: string
  "Key"?: string
  "Mem_Buf_Limit"?: string
  "Multiline"?: string
  "Multiline_Flush"?: string
  "Parser"?: string
  "Parser_Firstline"?: string
  "Parser_N"?: string[]
  "Path"?: string
  "Path_Key"?: string
  "Read_From_Head"?: boolean
  "Refresh_Interval"?: string
  "Rotate_Wait"?: string
  "Skip_Long_Lines"?: string
  "Tag"?: string
  "Tag_Regex"?: string
  "multiline.parser"?: string[]
  "storage.pause_on_chunks_overlimit"?: string
  "storage.type"?: string
}

export interface LivenessProbe {
  "exec"?: Exec
  "failureThreshold"?: number
  "grpc"?: Grpc
  "httpGet"?: HttpGet
  "initialDelaySeconds"?: number
  "periodSeconds"?: number
  "successThreshold"?: number
  "tcpSocket"?: TcpSocket
  "terminationGracePeriodSeconds"?: number
  "timeoutSeconds"?: number
}

export interface Metrics {
  "enabled"?: boolean
  "interval"?: string
  "path"?: string
  "port"?: number
  "prometheusAnnotations"?: boolean
  "prometheusRules"?: boolean
  "prometheusRulesLabels"?: Record<string, unknown>
  "prometheusRulesOverride"?: PrometheusRulesOverrideItem[]
  "serviceMonitor"?: boolean
  "serviceMonitorConfig"?: ServiceMonitorConfig
  "timeout"?: string
}

export interface Network {
  "connectTimeout"?: number
  "connectTimeoutLogError"?: boolean
  "dnsMode"?: string
  "dnsPreferIpv4"?: boolean
  "dnsResolver"?: string
  "keepalive"?: boolean
  "keepaliveIdleTimeout"?: number
  "keepaliveMaxRecycle"?: number
  "maxWorkerConnections"?: number
  "sourceAddress"?: string
}

export interface PositionDb {
  "configMap"?: ConfigMap
  "emptyDir"?: EmptyDir
  "host_path"?: HostPath
  "hostPath"?: HostPath
  "pvc"?: Pvc
  "secret"?: Secret
}

export interface Positiondb {
  "configMap"?: ConfigMap
  "emptyDir"?: EmptyDir
  "host_path"?: HostPath
  "hostPath"?: HostPath
  "pvc"?: Pvc
  "secret"?: Secret
}

export interface ReadinessProbe {
  "exec"?: Exec
  "failureThreshold"?: number
  "grpc"?: Grpc
  "httpGet"?: HttpGet
  "initialDelaySeconds"?: number
  "periodSeconds"?: number
  "successThreshold"?: number
  "tcpSocket"?: TcpSocket
  "terminationGracePeriodSeconds"?: number
  "timeoutSeconds"?: number
}

export interface AppArmorProfile {
  "localhostProfile"?: string
  "type": string
}

export interface SeLinuxOptions {
  "level"?: string
  "role"?: string
  "type"?: string
  "user"?: string
}

export interface SeccompProfile {
  "localhostProfile"?: string
  "type": string
}

export interface SysctlsItem {
  "name": string
  "value": string
}

export interface WindowsOptions {
  "gmsaCredentialSpec"?: string
  "gmsaCredentialSpecName"?: string
  "hostProcess"?: boolean
  "runAsUserName"?: string
}

export interface PodSecurityContext {
  "appArmorProfile"?: AppArmorProfile
  "fsGroup"?: number
  "fsGroupChangePolicy"?: string
  "runAsGroup"?: number
  "runAsNonRoot"?: boolean
  "runAsUser"?: number
  "seLinuxChangePolicy"?: string
  "seLinuxOptions"?: SeLinuxOptions
  "seccompProfile"?: SeccompProfile
  "supplementalGroups"?: number[]
  "supplementalGroupsPolicy"?: string
  "sysctls"?: SysctlsItem[]
  "windowsOptions"?: WindowsOptions
}

export interface Capabilities {
  "add"?: string[]
  "drop"?: string[]
}

export interface SecurityContext {
  "allowPrivilegeEscalation"?: boolean
  "appArmorProfile"?: AppArmorProfile
  "capabilities"?: Capabilities
  "privileged"?: boolean
  "procMount"?: string
  "readOnlyRootFilesystem"?: boolean
  "runAsGroup"?: number
  "runAsNonRoot"?: boolean
  "runAsUser"?: number
  "seLinuxOptions"?: SeLinuxOptions
  "seccompProfile"?: SeccompProfile
  "windowsOptions"?: WindowsOptions
}

export interface Security {
  "createOpenShiftSCC"?: boolean
  "podSecurityContext"?: PodSecurityContext
  "podSecurityPolicyCreate"?: boolean
  "roleBasedAccessControlCreate"?: boolean
  "securityContext"?: SecurityContext
  "serviceAccount"?: string
}

export interface Metadata {
  "annotations"?: Record<string, unknown>
  "labels"?: Record<string, unknown>
}

export interface SecretsItem {
  "apiVersion"?: string
  "fieldPath"?: string
  "kind"?: string
  "name"?: string
  "namespace"?: string
  "resourceVersion"?: string
  "uid"?: string
}

export interface ServiceAccount {
  "automountServiceAccountToken"?: boolean
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "metadata"?: Metadata
  "secrets"?: SecretsItem[]
}

export interface SyslogngOutput {
  "Retry_Limit"?: string
  "Workers"?: number
  "json_date_format"?: string
  "json_date_key"?: string
}

export interface Tls {
  "enabled": boolean
  "secretName"?: string
  "sharedKey"?: string
}

export interface TolerationsItem {
  "effect"?: string
  "key"?: string
  "operator"?: string
  "tolerationSeconds"?: number
  "value"?: string
}

export interface RollingUpdate {
  "maxSurge"?: number | string
  "maxUnavailable"?: number | string
}

export interface UpdateStrategy {
  "rollingUpdate"?: RollingUpdate
  "type"?: string
}

export interface Fluentbit {
  "HostNetwork"?: boolean
  "affinity"?: Affinity
  "annotations"?: Record<string, unknown>
  "bufferStorage"?: BufferStorage
  "bufferStorageVolume"?: BufferStorageVolume
  "bufferVolumeArgs"?: string[]
  "bufferVolumeImage"?: BufferVolumeImage
  "bufferVolumeLivenessProbe"?: BufferVolumeLivenessProbe
  "bufferVolumeMetrics"?: BufferVolumeMetrics
  "bufferVolumeResources"?: BufferVolumeResources
  "configHotReload"?: ConfigHotReload
  "coroStackSize"?: number
  "customConfigSecret"?: string
  "customParsers"?: string
  "daemonsetAnnotations"?: Record<string, unknown>
  "disableKubernetesFilter"?: boolean
  "disableVarLibDockerContainers"?: boolean
  "disableVarLog"?: boolean
  "dnsConfig"?: DnsConfig
  "dnsPolicy"?: string
  "enableUpstream"?: boolean
  "enabledIPv6"?: boolean
  "envVars"?: EnvVarsItem[]
  "extraVolumeMounts"?: ExtraVolumeMountsItem[]
  "filterAws"?: FilterAws
  "filterGrep"?: FilterGrep
  "filterKubernetes"?: FilterKubernetes
  "filterModify"?: FilterModifyItem[]
  "flush"?: number
  "forceHotReloadAfterGrace"?: boolean
  "forwardOptions"?: ForwardOptions
  "grace"?: number
  "healthCheck"?: HealthCheck
  "image"?: Image
  "inputTail"?: InputTail
  "labels"?: Record<string, unknown>
  "livenessDefaultCheck"?: boolean
  "livenessProbe"?: LivenessProbe
  "logLevel"?: string
  "loggingRef"?: string
  "metrics"?: Metrics
  "mountPath"?: string
  "network"?: Network
  "nodeSelector"?: Record<string, unknown>
  "parser"?: string
  "podPriorityClassName"?: string
  "position_db"?: PositionDb
  "positiondb"?: Positiondb
  "readinessProbe"?: ReadinessProbe
  "resources"?: Resources2
  "security"?: Security
  "serviceAccount"?: ServiceAccount
  "syslogng_output"?: SyslogngOutput
  "targetHost"?: string
  "targetPort"?: number
  "terminationGracePeriodSeconds"?: number
  "tls"?: Tls
  "tolerations"?: TolerationsItem[]
  "updateStrategy"?: UpdateStrategy
}

export interface ConfigCheckResources {
  "claims"?: ClaimsItem[]
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface ConfigReloaderImage {
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "pullPolicy"?: string
  "repository"?: string
  "tag"?: string
}

export interface ConfigReloaderResources {
  "claims"?: ClaimsItem[]
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface Volume {
  "configMap"?: ConfigMap
  "emptyDir"?: EmptyDir
  "host_path"?: HostPath
  "hostPath"?: HostPath
  "pvc"?: Pvc
  "secret"?: Secret
}

export interface ExtraVolumesItem {
  "containerName"?: string
  "path"?: string
  "volume"?: Volume
  "volumeName"?: string
}

export interface FluentOutLogrotate {
  "age"?: string
  "enabled": boolean
  "path"?: string
  "size"?: string
}

export interface FluentdPvcSpec {
  "configMap"?: ConfigMap
  "emptyDir"?: EmptyDir
  "host_path"?: HostPath
  "hostPath"?: HostPath
  "pvc"?: Pvc
  "secret"?: Secret
}

export interface Security2 {
  "allow_anonymous_source"?: boolean
  "self_hostname": string
  "shared_key": string
  "user_auth"?: boolean
}

export interface Transport {
  "ca_cert_path"?: string
  "ca_path"?: string
  "ca_private_key_passphrase"?: string
  "ca_private_key_path"?: string
  "cert_path"?: string
  "ciphers"?: string
  "client_cert_auth"?: boolean
  "insecure"?: boolean
  "private_key_passphrase"?: string
  "private_key_path"?: string
  "protocol"?: string
  "version"?: string
}

export interface ForwardInputConfig {
  "add_tag_prefix"?: string
  "bind"?: string
  "chunk_size_limit"?: string
  "chunk_size_warn_limit"?: string
  "deny_keepalive"?: boolean
  "linger_timeout"?: number
  "port"?: string
  "resolve_hostname"?: boolean
  "security"?: Security2
  "send_keepalive_packet"?: boolean
  "skip_invalid_event"?: boolean
  "source_address_key"?: string
  "sourceHostnameKey"?: string
  "tag"?: string
  "transport"?: Transport
}

export interface Pdb {
  "maxUnavailable"?: number | string
  "minAvailable"?: number | string
  "unhealthyPodEvictionPolicy"?: string
}

export interface ReadinessDefaultCheck {
  "bufferFileNumber"?: boolean
  "bufferFileNumberMax"?: number
  "bufferFreeSpace"?: boolean
  "bufferFreeSpaceThreshold"?: number
  "failureThreshold"?: number
  "initialDelaySeconds"?: number
  "periodSeconds"?: number
  "successThreshold"?: number
  "timeoutSeconds"?: number
}

export interface PauseImage {
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "pullPolicy"?: string
  "repository"?: string
  "tag"?: string
}

export interface Drain {
  "annotations"?: Record<string, unknown>
  "deleteVolume"?: boolean
  "enabled"?: boolean
  "image"?: Image
  "labels"?: Record<string, unknown>
  "pauseImage"?: PauseImage
  "resources"?: Resources2
  "securityContext"?: SecurityContext
}

export interface Scaling {
  "drain"?: Drain
  "podManagementPolicy"?: string
  "replicas"?: number
}

export interface PortsItem {
  "appProtocol"?: string
  "name"?: string
  "nodePort"?: number
  "port": number
  "protocol"?: string
  "targetPort"?: number | string
}

export interface ClientIP {
  "timeoutSeconds"?: number
}

export interface SessionAffinityConfig {
  "clientIP"?: ClientIP
}

export interface Spec2 {
  "allocateLoadBalancerNodePorts"?: boolean
  "clusterIP"?: string
  "clusterIPs"?: string[]
  "externalIPs"?: string[]
  "externalName"?: string
  "externalTrafficPolicy"?: string
  "healthCheckNodePort"?: number
  "internalTrafficPolicy"?: string
  "ipFamilies"?: string[]
  "ipFamilyPolicy"?: string
  "loadBalancerClass"?: string
  "loadBalancerIP"?: string
  "loadBalancerSourceRanges"?: string[]
  "ports"?: PortsItem[]
  "publishNotReadyAddresses"?: boolean
  "selector"?: Record<string, unknown>
  "sessionAffinity"?: string
  "sessionAffinityConfig"?: SessionAffinityConfig
  "trafficDistribution"?: string
  "type"?: string
}

export interface Service {
  "metadata"?: Metadata
  "spec"?: Spec2
}

export interface EnvItem {
  "name": string
  "value"?: string
  "valueFrom"?: ValueFrom2
}

export interface ConfigMapRef {
  "name"?: string
  "optional"?: boolean
}

export interface SecretRef {
  "name"?: string
  "optional"?: boolean
}

export interface EnvFromItem {
  "configMapRef"?: ConfigMapRef
  "prefix"?: string
  "secretRef"?: SecretRef
}

export interface Sleep {
  "seconds": number
}

export interface PostStart {
  "exec"?: Exec
  "httpGet"?: HttpGet
  "sleep"?: Sleep
  "tcpSocket"?: TcpSocket
}

export interface PreStop {
  "exec"?: Exec
  "httpGet"?: HttpGet
  "sleep"?: Sleep
  "tcpSocket"?: TcpSocket
}

export interface Lifecycle {
  "postStart"?: PostStart
  "preStop"?: PreStop
  "stopSignal"?: string
}

export interface PortsItem2 {
  "containerPort": number
  "hostIP"?: string
  "hostPort"?: number
  "name"?: string
  "protocol"?: string
}

export interface ResizePolicyItem {
  "resourceName": string
  "restartPolicy": string
}

export interface ExitCodes {
  "operator": string
  "values"?: number[]
}

export interface RestartPolicyRulesItem {
  "action": string
  "exitCodes"?: ExitCodes
}

export interface StartupProbe {
  "exec"?: Exec
  "failureThreshold"?: number
  "grpc"?: Grpc
  "httpGet"?: HttpGet
  "initialDelaySeconds"?: number
  "periodSeconds"?: number
  "successThreshold"?: number
  "tcpSocket"?: TcpSocket
  "terminationGracePeriodSeconds"?: number
  "timeoutSeconds"?: number
}

export interface VolumeDevicesItem {
  "devicePath": string
  "name": string
}

export interface VolumeMountsItem {
  "mountPath": string
  "mountPropagation"?: string
  "name": string
  "readOnly"?: boolean
  "recursiveReadOnly"?: string
  "subPath"?: string
  "subPathExpr"?: string
}

export interface SidecarContainersItem {
  "args"?: string[]
  "command"?: string[]
  "env"?: EnvItem[]
  "envFrom"?: EnvFromItem[]
  "image"?: string
  "imagePullPolicy"?: string
  "lifecycle"?: Lifecycle
  "livenessProbe"?: LivenessProbe
  "name": string
  "ports"?: PortsItem2[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources2
  "restartPolicy"?: string
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  "securityContext"?: SecurityContext
  "startupProbe"?: StartupProbe
  "stdin"?: boolean
  "stdinOnce"?: boolean
  "terminationMessagePath"?: string
  "terminationMessagePolicy"?: string
  "tty"?: boolean
  "volumeDevices"?: VolumeDevicesItem[]
  "volumeMounts"?: VolumeMountsItem[]
  "workingDir"?: string
}

export interface TopologySpreadConstraintsItem {
  "labelSelector"?: LabelSelector
  "matchLabelKeys"?: string[]
  "maxSkew": number
  "minDomains"?: number
  "nodeAffinityPolicy"?: string
  "nodeTaintsPolicy"?: string
  "topologyKey": string
  "whenUnsatisfiable": string
}

export interface VolumeModImage {
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "pullPolicy"?: string
  "repository"?: string
  "tag"?: string
}

export interface Fluentd {
  "affinity"?: Affinity
  "annotations"?: Record<string, unknown>
  "bufferStorageVolume"?: BufferStorageVolume
  "bufferVolumeArgs"?: string[]
  "bufferVolumeImage"?: BufferVolumeImage
  "bufferVolumeLivenessProbe"?: BufferVolumeLivenessProbe
  "bufferVolumeMetrics"?: BufferVolumeMetrics
  "bufferVolumeResources"?: BufferVolumeResources
  "compressConfigFile"?: boolean
  "configCheck"?: ConfigCheck
  "configCheckAnnotations"?: Record<string, unknown>
  "configCheckResources"?: ConfigCheckResources
  "configReloaderImage"?: ConfigReloaderImage
  "configReloaderResources"?: ConfigReloaderResources
  "configReloaderUseGracefulReloadWebhook"?: boolean
  "disablePvc"?: boolean
  "dnsConfig"?: DnsConfig
  "dnsPolicy"?: string
  "enableMsgpackTimeSupport"?: boolean
  "enabledIPv6"?: boolean
  "envVars"?: EnvVarsItem[]
  "extraArgs"?: string[]
  "extraVolumes"?: ExtraVolumesItem[]
  "fluentLogDestination"?: string
  "fluentOutLogrotate"?: FluentOutLogrotate
  "fluentdPvcSpec"?: FluentdPvcSpec
  "forwardInputConfig"?: ForwardInputConfig
  "ignoreRepeatedLogInterval"?: string
  "ignoreSameLogInterval"?: string
  "image"?: Image
  "labels"?: Record<string, unknown>
  "livenessDefaultCheck"?: boolean
  "livenessProbe"?: LivenessProbe
  "logFormat"?: string
  "logLevel"?: string
  "metrics"?: Metrics
  "nodeSelector"?: Record<string, unknown>
  "pdb"?: Pdb
  "podPriorityClassName"?: string
  "port"?: number
  "readinessDefaultCheck"?: ReadinessDefaultCheck
  "readinessProbe"?: ReadinessProbe
  "resources"?: Resources2
  "rootDir"?: string
  "scaling"?: Scaling
  "security"?: Security
  "service"?: Service
  "serviceAccount"?: ServiceAccount
  "sidecarContainers"?: SidecarContainersItem[]
  "statefulsetAnnotations"?: Record<string, unknown>
  "terminationGracePeriodSeconds"?: number
  "tls"?: Tls
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  "volumeModImage"?: VolumeModImage
  "volumeMountChmod"?: boolean
  "workers"?: number
}

export interface GlobalFiltersItem {
  "concat"?: Concat
  "dedot"?: Dedot
  "detectExceptions"?: DetectExceptions
  "elasticsearch_genid"?: ElasticsearchGenid
  "geoip"?: Geoip
  "grep"?: Grep
  "kube_events_timestamp"?: KubeEventsTimestamp
  "parser"?: Parser
  "prometheus"?: Prometheus
  "raw"?: Raw
  "record_modifier"?: RecordModifier
  "record_transformer"?: RecordTransformer
  "stdout"?: Stdout
  "tag_normaliser"?: TagNormaliser
  "throttle"?: Throttle
  "useragent"?: Useragent
}

export interface RouteConfig {
  "disableLoggingRoute"?: boolean
  "enableTelemetryControllerRoute"?: boolean
  "tenantLabels"?: Record<string, unknown>
}

export interface BufferVolumeMetrics2 {
  "enabled"?: boolean
  "interval"?: string
  "mount_name"?: string
  "path"?: string
  "port"?: number
  "prometheusAnnotations"?: boolean
  "prometheusRules"?: boolean
  "prometheusRulesLabels"?: Record<string, unknown>
  "prometheusRulesOverride"?: PrometheusRulesOverrideItem[]
  "serviceMonitor"?: boolean
  "serviceMonitorConfig"?: ServiceMonitorConfig
  "timeout"?: string
}

export interface BufferVolumeMetricsImage {
  "repository"?: string
  "tag"?: string
}

export interface BufferVolumeMetricsLivenessProbe {
  "exec"?: Exec
  "failureThreshold"?: number
  "grpc"?: Grpc
  "httpGet"?: HttpGet
  "initialDelaySeconds"?: number
  "periodSeconds"?: number
  "successThreshold"?: number
  "tcpSocket"?: TcpSocket
  "terminationGracePeriodSeconds"?: number
  "timeoutSeconds"?: number
}

export interface BufferVolumeMetricsResources {
  "claims"?: ClaimsItem[]
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface BufferVolumeMetricsService {
  "metadata"?: Metadata
  "spec"?: Spec2
}

export interface ContainersItem {
  "args"?: string[]
  "command"?: string[]
  "env"?: EnvItem[]
  "envFrom"?: EnvFromItem[]
  "image"?: string
  "imagePullPolicy"?: string
  "lifecycle"?: Lifecycle
  "livenessProbe"?: LivenessProbe
  "name": string
  "ports"?: PortsItem2[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources2
  "restartPolicy"?: string
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  "securityContext"?: SecurityContext
  "startupProbe"?: StartupProbe
  "stdin"?: boolean
  "stdinOnce"?: boolean
  "terminationMessagePath"?: string
  "terminationMessagePolicy"?: string
  "tty"?: boolean
  "volumeDevices"?: VolumeDevicesItem[]
  "volumeMounts"?: VolumeMountsItem[]
  "workingDir"?: string
}

export interface EphemeralContainersItem {
  "args"?: string[]
  "command"?: string[]
  "env"?: EnvItem[]
  "envFrom"?: EnvFromItem[]
  "image"?: string
  "imagePullPolicy"?: string
  "lifecycle"?: Lifecycle
  "livenessProbe"?: LivenessProbe
  "name": string
  "ports"?: PortsItem2[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources2
  "restartPolicy"?: string
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  "securityContext"?: SecurityContext
  "startupProbe"?: StartupProbe
  "stdin"?: boolean
  "stdinOnce"?: boolean
  "targetContainerName"?: string
  "terminationMessagePath"?: string
  "terminationMessagePolicy"?: string
  "tty"?: boolean
  "volumeDevices"?: VolumeDevicesItem[]
  "volumeMounts"?: VolumeMountsItem[]
  "workingDir"?: string
}

export interface HostAliasesItem {
  "hostnames"?: string[]
  "ip": string
}

export interface InitContainersItem {
  "args"?: string[]
  "command"?: string[]
  "env"?: EnvItem[]
  "envFrom"?: EnvFromItem[]
  "image"?: string
  "imagePullPolicy"?: string
  "lifecycle"?: Lifecycle
  "livenessProbe"?: LivenessProbe
  "name": string
  "ports"?: PortsItem2[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources2
  "restartPolicy"?: string
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  "securityContext"?: SecurityContext
  "startupProbe"?: StartupProbe
  "stdin"?: boolean
  "stdinOnce"?: boolean
  "terminationMessagePath"?: string
  "terminationMessagePolicy"?: string
  "tty"?: boolean
  "volumeDevices"?: VolumeDevicesItem[]
  "volumeMounts"?: VolumeMountsItem[]
  "workingDir"?: string
}

export interface ReadinessGatesItem {
  "conditionType": string
}

export interface SecurityContext2 {
  "appArmorProfile"?: AppArmorProfile
  "fsGroup"?: number
  "fsGroupChangePolicy"?: string
  "runAsGroup"?: number
  "runAsNonRoot"?: boolean
  "runAsUser"?: number
  "seLinuxChangePolicy"?: string
  "seLinuxOptions"?: SeLinuxOptions
  "seccompProfile"?: SeccompProfile
  "supplementalGroups"?: number[]
  "supplementalGroupsPolicy"?: string
  "sysctls"?: SysctlsItem[]
  "windowsOptions"?: WindowsOptions
}

export interface AwsElasticBlockStore {
  "fsType"?: string
  "partition"?: number
  "readOnly"?: boolean
  "volumeID": string
}

export interface AzureDisk {
  "cachingMode"?: string
  "diskName": string
  "diskURI": string
  "fsType"?: string
  "kind"?: string
  "readOnly"?: boolean
}

export interface AzureFile {
  "readOnly"?: boolean
  "secretName": string
  "shareName": string
}

export interface SecretRef2 {
  "name"?: string
}

export interface Cephfs {
  "monitors": string[]
  "path"?: string
  "readOnly"?: boolean
  "secretFile"?: string
  "secretRef"?: SecretRef2
  "user"?: string
}

export interface Cinder {
  "fsType"?: string
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "volumeID": string
}

export interface NodePublishSecretRef {
  "name"?: string
}

export interface Csi {
  "driver": string
  "fsType"?: string
  "nodePublishSecretRef"?: NodePublishSecretRef
  "readOnly"?: boolean
  "volumeAttributes"?: Record<string, unknown>
}

export interface ItemsItem2 {
  "fieldRef"?: FieldRef
  "mode"?: number
  "path": string
  "resourceFieldRef"?: ResourceFieldRef
}

export interface DownwardAPI {
  "defaultMode"?: number
  "items"?: ItemsItem2[]
}

export interface VolumeClaimTemplate {
  "metadata"?: Record<string, unknown>
  "spec": Spec
}

export interface Ephemeral {
  "volumeClaimTemplate"?: VolumeClaimTemplate
}

export interface Fc {
  "fsType"?: string
  "lun"?: number
  "readOnly"?: boolean
  "targetWWNs"?: string[]
  "wwids"?: string[]
}

export interface FlexVolume {
  "driver": string
  "fsType"?: string
  "options"?: Record<string, unknown>
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
}

export interface Flocker {
  "datasetName"?: string
  "datasetUUID"?: string
}

export interface GcePersistentDisk {
  "fsType"?: string
  "partition"?: number
  "pdName": string
  "readOnly"?: boolean
}

export interface GitRepo {
  "directory"?: string
  "repository": string
  "revision"?: string
}

export interface Glusterfs {
  "endpoints": string
  "path": string
  "readOnly"?: boolean
}

export interface Image2 {
  "pullPolicy"?: string
  "reference"?: string
}

export interface Iscsi {
  "chapAuthDiscovery"?: boolean
  "chapAuthSession"?: boolean
  "fsType"?: string
  "initiatorName"?: string
  "iqn": string
  "iscsiInterface"?: string
  "lun": number
  "portals"?: string[]
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "targetPortal": string
}

export interface Nfs {
  "path": string
  "readOnly"?: boolean
  "server": string
}

export interface PersistentVolumeClaim {
  "claimName": string
  "readOnly"?: boolean
}

export interface PhotonPersistentDisk {
  "fsType"?: string
  "pdID": string
}

export interface PortworxVolume {
  "fsType"?: string
  "readOnly"?: boolean
  "volumeID": string
}

export interface ClusterTrustBundle {
  "labelSelector"?: LabelSelector
  "name"?: string
  "optional"?: boolean
  "path": string
  "signerName"?: string
}

export interface ConfigMap3 {
  "items"?: ItemsItem[]
  "name"?: string
  "optional"?: boolean
}

export interface DownwardAPI2 {
  "items"?: ItemsItem2[]
}

export interface PodCertificate {
  "certificateChainPath"?: string
  "credentialBundlePath"?: string
  "keyPath"?: string
  "keyType": string
  "maxExpirationSeconds"?: number
  "signerName": string
  "userAnnotations"?: Record<string, unknown>
}

export interface Secret3 {
  "items"?: ItemsItem[]
  "name"?: string
  "optional"?: boolean
}

export interface ServiceAccountToken {
  "audience"?: string
  "expirationSeconds"?: number
  "path": string
}

export interface SourcesItem {
  "clusterTrustBundle"?: ClusterTrustBundle
  "configMap"?: ConfigMap3
  "downwardAPI"?: DownwardAPI2
  "podCertificate"?: PodCertificate
  "secret"?: Secret3
  "serviceAccountToken"?: ServiceAccountToken
}

export interface Projected {
  "defaultMode"?: number
  "sources"?: SourcesItem[]
}

export interface Quobyte {
  "group"?: string
  "readOnly"?: boolean
  "registry": string
  "tenant"?: string
  "user"?: string
  "volume": string
}

export interface Rbd {
  "fsType"?: string
  "image": string
  "keyring"?: string
  "monitors": string[]
  "pool"?: string
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "user"?: string
}

export interface ScaleIO {
  "fsType"?: string
  "gateway": string
  "protectionDomain"?: string
  "readOnly"?: boolean
  "secretRef": SecretRef2
  "sslEnabled"?: boolean
  "storageMode"?: string
  "storagePool"?: string
  "system": string
  "volumeName"?: string
}

export interface Storageos {
  "fsType"?: string
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "volumeName"?: string
  "volumeNamespace"?: string
}

export interface VsphereVolume {
  "fsType"?: string
  "storagePolicyID"?: string
  "storagePolicyName"?: string
  "volumePath": string
}

export interface VolumesItem {
  "awsElasticBlockStore"?: AwsElasticBlockStore
  "azureDisk"?: AzureDisk
  "azureFile"?: AzureFile
  "cephfs"?: Cephfs
  "cinder"?: Cinder
  "configMap"?: ConfigMap
  "csi"?: Csi
  "downwardAPI"?: DownwardAPI
  "emptyDir"?: EmptyDir
  "ephemeral"?: Ephemeral
  "fc"?: Fc
  "flexVolume"?: FlexVolume
  "flocker"?: Flocker
  "gcePersistentDisk"?: GcePersistentDisk
  "gitRepo"?: GitRepo
  "glusterfs"?: Glusterfs
  "hostPath"?: HostPath
  "image"?: Image2
  "iscsi"?: Iscsi
  "name": string
  "nfs"?: Nfs
  "persistentVolumeClaim"?: PersistentVolumeClaim
  "photonPersistentDisk"?: PhotonPersistentDisk
  "portworxVolume"?: PortworxVolume
  "projected"?: Projected
  "quobyte"?: Quobyte
  "rbd"?: Rbd
  "scaleIO"?: ScaleIO
  "secret"?: Secret
  "storageos"?: Storageos
  "vsphereVolume"?: VsphereVolume
}

export interface ConfigCheckPod {
  "activeDeadlineSeconds"?: number
  "affinity"?: Affinity
  "automountServiceAccountToken"?: boolean
  "containers"?: ContainersItem[]
  "dnsConfig"?: DnsConfig
  "dnsPolicy"?: string
  "enableServiceLinks"?: boolean
  "ephemeralContainers"?: EphemeralContainersItem[]
  "hostAliases"?: HostAliasesItem[]
  "hostIPC"?: boolean
  "hostNetwork"?: boolean
  "hostPID"?: boolean
  "hostname"?: string
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "initContainers"?: InitContainersItem[]
  "nodeName"?: string
  "nodeSelector"?: Record<string, unknown>
  "overhead"?: Record<string, unknown>
  "preemptionPolicy"?: string
  "priority"?: number
  "priorityClassName"?: string
  "readinessGates"?: ReadinessGatesItem[]
  "restartPolicy"?: string
  "runtimeClassName"?: string
  "schedulerName"?: string
  "securityContext"?: SecurityContext2
  "serviceAccountName"?: string
  "setHostnameAsFQDN"?: boolean
  "shareProcessNamespace"?: boolean
  "subdomain"?: string
  "terminationGracePeriodSeconds"?: number
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  "volumes"?: VolumesItem[]
}

export interface ConfigReloadImage {
  "repository"?: string
  "tag"?: string
}

export interface Stats {
  "freq"?: number
  "level"?: number
}

export interface GlobalOptions {
  "log_level"?: string
  "log_msg_size"?: number
  "stats"?: Stats
  "stats_freq"?: number
  "stats_level"?: number
}

export interface MetricsExporterImage {
  "repository"?: string
  "tag"?: string
}

export interface MetricsService {
  "metadata"?: Metadata
  "spec"?: Spec2
}

export interface SourceDateParser {
  "format"?: string
  "template"?: string
}

export interface SourceMetricsItem {
  "key"?: string
  "labels"?: Record<string, unknown>
  "level"?: number
}

export interface Spec4 {
  "activeDeadlineSeconds"?: number
  "affinity"?: Affinity
  "automountServiceAccountToken"?: boolean
  "containers"?: ContainersItem[]
  "dnsConfig"?: DnsConfig
  "dnsPolicy"?: string
  "enableServiceLinks"?: boolean
  "ephemeralContainers"?: EphemeralContainersItem[]
  "hostAliases"?: HostAliasesItem[]
  "hostIPC"?: boolean
  "hostNetwork"?: boolean
  "hostPID"?: boolean
  "hostname"?: string
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "initContainers"?: InitContainersItem[]
  "nodeName"?: string
  "nodeSelector"?: Record<string, unknown>
  "overhead"?: Record<string, unknown>
  "preemptionPolicy"?: string
  "priority"?: number
  "priorityClassName"?: string
  "readinessGates"?: ReadinessGatesItem[]
  "restartPolicy"?: string
  "runtimeClassName"?: string
  "schedulerName"?: string
  "securityContext"?: SecurityContext2
  "serviceAccountName"?: string
  "setHostnameAsFQDN"?: boolean
  "shareProcessNamespace"?: boolean
  "subdomain"?: string
  "terminationGracePeriodSeconds"?: number
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  "volumes"?: VolumesItem[]
}

export interface Template {
  "metadata"?: Metadata
  "spec"?: Spec4
}

export interface Metadata2 {
  "annotations"?: Record<string, unknown>
  "labels"?: Record<string, unknown>
  "name"?: string
}

export interface VolumeClaimTemplatesItem {
  "metadata"?: Metadata2
  "spec"?: Spec
}

export interface Spec3 {
  "podManagementPolicy"?: string
  "replicas"?: number
  "revisionHistoryLimit"?: number
  "selector"?: Selector
  "serviceName"?: string
  "template"?: Template
  "updateStrategy"?: UpdateStrategy
  "volumeClaimTemplates"?: VolumeClaimTemplatesItem[]
}

export interface StatefulSet {
  "metadata"?: Metadata
  "spec"?: Spec3
}

export interface SyslogNGImage {
  "repository"?: string
  "tag"?: string
}

export interface SyslogNG {
  "bufferVolumeMetrics"?: BufferVolumeMetrics2
  "bufferVolumeMetricsImage"?: BufferVolumeMetricsImage
  "bufferVolumeMetricsLivenessProbe"?: BufferVolumeMetricsLivenessProbe
  "bufferVolumeMetricsResources"?: BufferVolumeMetricsResources
  "bufferVolumeMetricsService"?: BufferVolumeMetricsService
  "configCheck"?: ConfigCheck
  "configCheckPod"?: ConfigCheckPod
  "configReloadImage"?: ConfigReloadImage
  "enabledIPv6"?: boolean
  "globalOptions"?: GlobalOptions
  "jsonKeyDelim"?: string
  "jsonKeyPrefix"?: string
  "logIWSize"?: number
  "maxConnections"?: number
  "metrics"?: Metrics
  "metricsExporterImage"?: MetricsExporterImage
  "metricsService"?: MetricsService
  "readinessDefaultCheck"?: ReadinessDefaultCheck
  "service"?: Service
  "serviceAccount"?: ServiceAccount
  "skipRBACCreate"?: boolean
  "sourceDateParser"?: SourceDateParser
  "sourceMetrics"?: SourceMetricsItem[]
  "statefulSet"?: StatefulSet
  "syslogNGImage"?: SyslogNGImage
  "terminationGracePeriodSeconds"?: number
  "tls"?: Tls
}

export interface WatchNamespaceSelector {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchLabels"?: Record<string, unknown>
}

export interface LoggingSpec {
  "allowClusterResourcesFromAllNamespaces"?: boolean
  "clusterDomain"?: string
  "configCheck"?: ConfigCheck
  "controlNamespace": string
  "defaultFlow"?: DefaultFlow
  "enableDockerParserCompatibilityForCRI"?: boolean
  "enableRawFluentdFilter"?: boolean
  "enableRecreateWorkloadOnImmutableFieldChange"?: boolean
  "errorOutputRef"?: string
  "flowConfigCheckDisabled"?: boolean
  "flowConfigOverride"?: string
  "fluentBitAgentNamespace"?: string
  "fluentbit"?: Fluentbit
  "fluentd"?: Fluentd
  "globalFilters"?: GlobalFiltersItem[]
  "loggingRef"?: string
  "routeConfig"?: RouteConfig
  "skipInvalidResources"?: boolean
  "syslogNG"?: SyslogNG
  "watchNamespaceSelector"?: WatchNamespaceSelector
  "watchNamespaces"?: string[]
}

export interface LoggingStatus {
  "configCheckResults"?: Record<string, unknown>
  "fluentdConfigName"?: string
  "problems"?: string[]
  "problemsCount"?: number
  "syslogNGConfigName"?: string
  "watchNamespaces"?: string[]
}

export interface ApiKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Buffer {
  "chunk_full_threshold"?: string
  "chunk_limit_records"?: number
  "chunk_limit_size"?: string
  "compress"?: string
  "delayed_commit_timeout"?: string
  "disable_chunk_backup"?: boolean
  "disabled"?: boolean
  "flush_at_shutdown"?: boolean
  "flush_interval"?: string
  "flush_mode"?: string
  "flush_thread_burst_interval"?: string
  "flush_thread_count"?: number
  "flush_thread_interval"?: string
  "overflow_action"?: string
  "path"?: string
  "queue_limit_length"?: number
  "queued_chunks_limit_size"?: number
  "retry_exponential_backoff_base"?: string
  "retry_forever"?: boolean
  "retry_max_interval"?: string
  "retry_max_times"?: number
  "retry_randomize"?: boolean
  "retry_secondary_threshold"?: string
  "retry_timeout"?: string
  "retry_type"?: string
  "retry_wait"?: string
  "tags"?: string
  "timekey"?: string
  "timekey_use_utc"?: boolean
  "timekey_wait"?: string
  "timekey_zone"?: string
  "total_limit_size"?: string
  "type"?: string
}

export interface CaFile {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface ClientCert {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface ClientKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface ClientKeyPass {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AccessKeyId {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AssumeRoleArn {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AssumeRoleSessionName {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AssumeRoleWebIdentityTokenFile {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface EcsContainerCredentialsRelativeUri {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface SecretAccessKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface StsCredentialsRegion {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Endpoint {
  "access_key_id"?: AccessKeyId
  "assume_role_arn"?: AssumeRoleArn
  "assume_role_session_name"?: AssumeRoleSessionName
  "assume_role_web_identity_token_file"?: AssumeRoleWebIdentityTokenFile
  "ecs_container_credentials_relative_uri"?: EcsContainerCredentialsRelativeUri
  "region"?: string
  "secret_access_key"?: SecretAccessKey
  "sts_credentials_region"?: StsCredentialsRegion
  "url"?: string
}

export interface Format {
  "add_newline"?: boolean
  "message_key"?: string
  "type"?: string
}

export interface Password {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TemplateFile {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AwsElasticsearch {
  "api_key"?: ApiKey
  "application_name"?: string
  "buffer"?: Buffer
  "bulk_message_request_threshold"?: string
  "ca_file"?: CaFile
  "client_cert"?: ClientCert
  "client_key"?: ClientKey
  "client_key_pass"?: ClientKeyPass
  "compression_level"?: string
  "content_type"?: string
  "custom_headers"?: string
  "customize_template"?: string
  "data_stream_enable"?: boolean
  "data_stream_ilm_name"?: string
  "data_stream_ilm_policy"?: string
  "data_stream_ilm_policy_overwrite"?: boolean
  "data_stream_name"?: string
  "data_stream_template_name"?: string
  "data_stream_template_use_index_patterns_wildcard"?: boolean
  "default_elasticsearch_version"?: string
  "deflector_alias"?: string
  "enable_ilm"?: boolean
  "endpoint"?: Endpoint
  "exception_backup"?: boolean
  "fail_on_detecting_es_version_retry_exceed"?: boolean
  "fail_on_putting_template_retry_exceed"?: boolean
  "flatten_hashes"?: boolean
  "flatten_hashes_separator"?: string
  "flush_interval"?: string
  "format"?: Format
  "host"?: string
  "hosts"?: string
  "http_backend"?: string
  "id_key"?: string
  "ignore_exceptions"?: string
  "ilm_policy"?: string
  "ilm_policy_id"?: string
  "ilm_policy_overwrite"?: boolean
  "include_index_in_url"?: boolean
  "include_tag_key"?: boolean
  "include_timestamp"?: boolean
  "index_date_pattern"?: string
  "index_name"?: string
  "index_prefix"?: string
  "log_es_400_reason"?: boolean
  "logstash_dateformat"?: string
  "logstash_format"?: boolean
  "logstash_prefix"?: string
  "logstash_prefix_separator"?: string
  "max_retry_get_es_version"?: string
  "max_retry_putting_template"?: string
  "password"?: Password
  "path"?: string
  "pipeline"?: string
  "port"?: number
  "prefer_oj_serializer"?: boolean
  "reconnect_on_error"?: boolean
  "reload_after"?: string
  "reload_connections"?: boolean
  "reload_on_failure"?: boolean
  "remove_keys"?: string
  "remove_keys_on_update"?: string
  "remove_keys_on_update_key"?: string
  "request_timeout"?: string
  "resurrect_after"?: string
  "retry_tag"?: string
  "rollover_index"?: boolean
  "routing_key"?: string
  "scheme"?: string
  "slow_flush_log_threshold"?: string
  "sniffer_class_name"?: string
  "ssl_max_version"?: string
  "ssl_min_version"?: string
  "ssl_verify"?: boolean
  "ssl_version"?: string
  "suppress_doc_wrap"?: boolean
  "suppress_type_name"?: boolean
  "tag_key"?: string
  "target_index_key"?: string
  "target_type_key"?: string
  "template_file"?: TemplateFile
  "template_name"?: string
  "template_overwrite"?: boolean
  "templates"?: string
  "time_key"?: string
  "time_key_format"?: string
  "time_parse_error_tag"?: string
  "time_precision"?: string
  "type_name"?: string
  "unrecoverable_error_types"?: string
  "use_legacy_template"?: boolean
  "user"?: string
  "utc_index"?: boolean
  "validate_client_version"?: boolean
  "verify_es_version_at_startup"?: boolean
  "with_transporter_log"?: boolean
  "write_operation"?: string
}

export interface AzureStorageAccessKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AzureStorageAccount {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AzureStorageSasToken {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Azurestorage {
  "auto_create_container"?: boolean
  "azure_cloud"?: string
  "azure_container": string
  "azure_imds_api_version"?: string
  "azure_object_key_format"?: string
  "azure_storage_access_key"?: AzureStorageAccessKey
  "azure_storage_account": AzureStorageAccount
  "azure_storage_sas_token"?: AzureStorageSasToken
  "buffer"?: Buffer
  "format"?: string
  "path"?: string
  "slow_flush_log_threshold"?: string
}

export interface AwsKeyId {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AwsSecKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Cloudwatch {
  "auto_create_stream"?: boolean
  "aws_instance_profile_credentials_retries"?: number
  "aws_key_id"?: AwsKeyId
  "aws_sec_key"?: AwsSecKey
  "aws_sts_role_arn"?: string
  "aws_sts_session_name"?: string
  "aws_use_sts"?: boolean
  "buffer"?: Buffer
  "concurrency"?: number
  "endpoint"?: string
  "format"?: Format
  "http_proxy"?: string
  "include_time_key"?: boolean
  "json_handler"?: string
  "localtime"?: boolean
  "log_group_aws_tags"?: string
  "log_group_aws_tags_key"?: string
  "log_group_name"?: string
  "log_group_name_key"?: string
  "log_rejected_request"?: string
  "log_stream_name"?: string
  "log_stream_name_key"?: string
  "max_events_per_batch"?: number
  "max_message_length"?: number
  "message_keys"?: string
  "put_log_events_disable_retry_limit"?: boolean
  "put_log_events_retry_limit"?: number
  "put_log_events_retry_wait"?: string
  "region": string
  "remove_log_group_aws_tags_key"?: string
  "remove_log_group_name_key"?: string
  "remove_log_stream_name_key"?: string
  "remove_retention_in_days"?: string
  "retention_in_days"?: string
  "retention_in_days_key"?: string
  "slow_flush_log_threshold"?: string
  "use_tag_as_group"?: boolean
  "use_tag_as_stream"?: boolean
}

export interface Datadog {
  "api_key": ApiKey
  "buffer"?: Buffer
  "compression_level"?: string
  "dd_hostname"?: string
  "dd_source"?: string
  "dd_sourcecategory"?: string
  "dd_tags"?: string
  "host"?: string
  "include_tag_key"?: boolean
  "max_backoff"?: string
  "max_retries"?: string
  "no_ssl_validation"?: boolean
  "port"?: string
  "service"?: string
  "slow_flush_log_threshold"?: string
  "ssl_port"?: string
  "tag_key"?: string
  "timestamp_key"?: string
  "use_compression"?: boolean
  "use_http"?: boolean
  "use_json"?: boolean
  "use_ssl"?: boolean
}

export interface Elasticsearch {
  "api_key"?: ApiKey
  "application_name"?: string
  "buffer"?: Buffer
  "bulk_message_request_threshold"?: string
  "ca_file"?: CaFile
  "client_cert"?: ClientCert
  "client_key"?: ClientKey
  "client_key_pass"?: ClientKeyPass
  "compression_level"?: string
  "content_type"?: string
  "custom_headers"?: string
  "customize_template"?: string
  "data_stream_enable"?: boolean
  "data_stream_ilm_name"?: string
  "data_stream_ilm_policy"?: string
  "data_stream_ilm_policy_overwrite"?: boolean
  "data_stream_name"?: string
  "data_stream_template_name"?: string
  "data_stream_template_use_index_patterns_wildcard"?: boolean
  "default_elasticsearch_version"?: string
  "deflector_alias"?: string
  "enable_ilm"?: boolean
  "exception_backup"?: boolean
  "fail_on_detecting_es_version_retry_exceed"?: boolean
  "fail_on_putting_template_retry_exceed"?: boolean
  "flatten_hashes"?: boolean
  "flatten_hashes_separator"?: string
  "host"?: string
  "hosts"?: string
  "http_backend"?: string
  "id_key"?: string
  "ignore_exceptions"?: string
  "ilm_policy"?: string
  "ilm_policy_id"?: string
  "ilm_policy_overwrite"?: boolean
  "include_index_in_url"?: boolean
  "include_tag_key"?: boolean
  "include_timestamp"?: boolean
  "index_date_pattern"?: string
  "index_name"?: string
  "index_prefix"?: string
  "log_es_400_reason"?: boolean
  "logstash_dateformat"?: string
  "logstash_format"?: boolean
  "logstash_prefix"?: string
  "logstash_prefix_separator"?: string
  "max_retry_get_es_version"?: string
  "max_retry_putting_template"?: string
  "password"?: Password
  "path"?: string
  "pipeline"?: string
  "port"?: number
  "prefer_oj_serializer"?: boolean
  "reconnect_on_error"?: boolean
  "reload_after"?: string
  "reload_connections"?: boolean
  "reload_on_failure"?: boolean
  "remove_keys"?: string
  "remove_keys_on_update"?: string
  "remove_keys_on_update_key"?: string
  "request_timeout"?: string
  "resurrect_after"?: string
  "retry_tag"?: string
  "rollover_index"?: boolean
  "routing_key"?: string
  "scheme"?: string
  "slow_flush_log_threshold"?: string
  "sniffer_class_name"?: string
  "ssl_max_version"?: string
  "ssl_min_version"?: string
  "ssl_verify"?: boolean
  "ssl_version"?: string
  "suppress_doc_wrap"?: boolean
  "suppress_type_name"?: boolean
  "tag_key"?: string
  "target_index_key"?: string
  "target_type_key"?: string
  "template_file"?: TemplateFile
  "template_name"?: string
  "template_overwrite"?: boolean
  "templates"?: string
  "time_key"?: string
  "time_key_format"?: string
  "time_parse_error_tag"?: string
  "time_precision"?: string
  "type_name"?: string
  "unrecoverable_error_types"?: string
  "use_legacy_template"?: boolean
  "user"?: string
  "utc_index"?: boolean
  "validate_client_version"?: boolean
  "verify_es_version_at_startup"?: boolean
  "with_transporter_log"?: boolean
  "write_operation"?: string
}

export interface File {
  "add_path_suffix"?: boolean
  "append"?: boolean
  "buffer"?: Buffer
  "compress"?: string
  "format"?: Format
  "path": string
  "path_suffix"?: string
  "recompress"?: boolean
  "slow_flush_log_threshold"?: string
  "symlink_path"?: boolean
}

export interface SharedKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Username {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface ServersItem {
  "host": string
  "name"?: string
  "password"?: Password
  "port"?: number
  "shared_key"?: SharedKey
  "standby"?: boolean
  "username"?: Username
  "weight"?: number
}

export interface TlsCertPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TlsClientCertPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TlsClientPrivateKeyPassphrase {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TlsClientPrivateKeyPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Forward {
  "ack_response_timeout"?: number
  "buffer"?: Buffer
  "compress"?: string
  "connect_timeout"?: number
  "dns_round_robin"?: boolean
  "expire_dns_cache"?: number
  "hard_timeout"?: number
  "heartbeat_interval"?: number
  "heartbeat_type"?: string
  "ignore_network_errors_at_startup"?: boolean
  "keepalive"?: boolean
  "keepalive_timeout"?: number
  "phi_failure_detector"?: boolean
  "phi_threshold"?: number
  "recover_wait"?: number
  "require_ack_response"?: boolean
  "security"?: Security2
  "send_timeout"?: number
  "servers": ServersItem[]
  "slow_flush_log_threshold"?: string
  "time_as_integer"?: boolean
  "tls_allow_self_signed_cert"?: boolean
  "tls_cert_logical_store_name"?: string
  "tls_cert_path"?: TlsCertPath
  "tls_cert_thumbprint"?: string
  "tls_cert_use_enterprise_store"?: boolean
  "tls_ciphers"?: string
  "tls_client_cert_path"?: TlsClientCertPath
  "tls_client_private_key_passphrase"?: TlsClientPrivateKeyPassphrase
  "tls_client_private_key_path"?: TlsClientPrivateKeyPath
  "tls_insecure_mode"?: boolean
  "tls_verify_hostname"?: boolean
  "tls_version"?: string
  "transport"?: string
  "verify_connection_at_startup"?: boolean
}

export interface CredentialsJson {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface ObjectMetadataItem {
  "key": string
  "value": string
}

export interface Gcs {
  "acl"?: string
  "auto_create_bucket"?: boolean
  "bucket": string
  "buffer"?: Buffer
  "client_retries"?: number
  "client_timeout"?: number
  "credentials_json"?: CredentialsJson
  "encryption_key"?: string
  "format"?: Format
  "hex_random_length"?: number
  "keyfile"?: string
  "object_key_format"?: string
  "object_metadata"?: ObjectMetadataItem[]
  "overwrite"?: boolean
  "path"?: string
  "project": string
  "slow_flush_log_threshold"?: string
  "storage_class"?: string
  "store_as"?: string
  "transcoding"?: boolean
}

export interface Gelf {
  "buffer"?: Buffer
  "host": string
  "max_bytes"?: number
  "port": number
  "protocol"?: string
  "tls"?: boolean
  "tls_options"?: Record<string, unknown>
  "udp_transport_type"?: string
}

export interface Auth {
  "password": Password
  "username": Username
}

export interface TlsCaCertPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TlsPrivateKeyPassphrase {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TlsPrivateKeyPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Http {
  "auth"?: Auth
  "buffer"?: Buffer
  "compress"?: string
  "content_type"?: string
  "endpoint": string
  "error_response_as_unrecoverable"?: boolean
  "format"?: Format
  "headers"?: Record<string, unknown>
  "headers_from_placeholders"?: Record<string, unknown>
  "http_method"?: string
  "json_array"?: boolean
  "open_timeout"?: number
  "proxy"?: string
  "read_timeout"?: number
  "retryable_response_codes"?: number[]
  "reuse_connections"?: boolean
  "slow_flush_log_threshold"?: string
  "ssl_timeout"?: number
  "tls_ca_cert_path"?: TlsCaCertPath
  "tls_ciphers"?: string
  "tls_client_cert_path"?: TlsClientCertPath
  "tls_private_key_passphrase"?: TlsPrivateKeyPassphrase
  "tls_private_key_path"?: TlsPrivateKeyPath
  "tls_verify_mode"?: string
  "tls_version"?: string
}

export interface Keytab {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface RdkafkaOptions {
  "allow.auto.create.topics"?: boolean
  "api.version.fallback.ms"?: number
  "api.version.request"?: boolean
  "api.version.request.timeout.ms"?: number
  "background_event_cb"?: string
  "bootstrap.servers"?: string
  "broker.address.family"?: string
  "broker.address.ttl"?: number
  "broker.version.fallback"?: string
  "builtin.features"?: string
  "client.id"?: string
  "closesocket_cb"?: string
  "connect_cb"?: string
  "connections.max.idle.ms"?: number
  "debug"?: string
  "default_topic_conf"?: string
  "enable.random.seed"?: boolean
  "enable.sasl.oauthbearer.unsecure.jwt"?: boolean
  "enable.ssl.certificate.verification"?: boolean
  "enabled_events"?: number
  "error_cb"?: string
  "interceptors"?: string
  "internal.termination.signal"?: number
  "log.connection.close"?: boolean
  "log.queue"?: boolean
  "log.thread.name"?: boolean
  "log_cb"?: string
  "log_level"?: number
  "max.in.flight"?: number
  "max.in.flight.requests.per.connection"?: number
  "message.copy.max.bytes"?: number
  "message.max.bytes"?: number
  "metadata.broker.list"?: string
  "metadata.max.age.ms"?: number
  "oauthbearer_token_refresh_cb"?: string
  "opaque"?: string
  "open_cb"?: string
  "plugin.library.paths"?: string
  "receive.message.max.bytes"?: number
  "reconnect.backoff.max.ms"?: number
  "reconnect.backoff.ms"?: number
  "resolve_cb"?: string
  "sasl.kerberos.keytab"?: string
  "sasl.kerberos.kinit.cmd"?: string
  "sasl.kerberos.min.time.before.relogin"?: number
  "sasl.kerberos.principal"?: string
  "sasl.kerberos.service.name"?: string
  "sasl.mechanisms"?: string
  "sasl.oauthbearer.client.id"?: string
  "sasl.oauthbearer.client.secret"?: string
  "sasl.oauthbearer.config"?: string
  "sasl.oauthbearer.extensions"?: string
  "sasl.oauthbearer.method"?: string
  "sasl.oauthbearer.scope"?: string
  "sasl.oauthbearer.token.endpoint.url"?: string
  "sasl.password"?: string
  "sasl.username"?: string
  "security.protocol"?: string
  "socket.blocking.max.ms"?: number
  "socket.connection.setup.timeout.ms"?: number
  "socket.keepalive.enable"?: boolean
  "socket.max.fails"?: number
  "socket.nagle.disable"?: boolean
  "socket.receive.buffer.bytes"?: number
  "socket.send.buffer.bytes"?: number
  "socket.timeout.ms"?: number
  "socket_cb"?: string
  "ssl.ca.location"?: string
  "ssl.ca.pem"?: string
  "ssl.certificate.location"?: string
  "ssl.certificate.pem"?: string
  "ssl.cipher.suites"?: string
  "ssl.crl.location"?: string
  "ssl.curves.list"?: string
  "ssl.endpoint.identification.algorithm"?: string
  "ssl.engine.id"?: string
  "ssl.engine.location"?: string
  "ssl.key.location"?: string
  "ssl.key.password"?: string
  "ssl.key.pem"?: string
  "ssl.keystore.location"?: string
  "ssl.keystore.password"?: string
  "ssl.providers"?: string
  "ssl.sigalgs.list"?: string
  "statistics.interval.ms"?: number
  "stats_cb"?: string
  "throttle_cb"?: string
  "topic.blacklist"?: string
  "topic.metadata.propagation.max.ms"?: number
  "topic.metadata.refresh.fast.interval.ms"?: number
  "topic.metadata.refresh.interval.ms"?: number
  "topic.metadata.refresh.sparse"?: boolean
}

export interface SslCaCert {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface SslClientCert {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface SslClientCertChain {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface SslClientCertKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Kafka {
  "ack_timeout"?: number
  "brokers": string
  "buffer"?: Buffer
  "client_id"?: string
  "compression_codec"?: string
  "default_message_key"?: string
  "default_partition_key"?: string
  "default_topic"?: string
  "discard_kafka_delivery_failed"?: boolean
  "exclude_partion_key"?: boolean
  "exclude_topic_key"?: boolean
  "format": Format
  "get_kafka_client_log"?: boolean
  "headers"?: Record<string, unknown>
  "headers_from_record"?: Record<string, unknown>
  "idempotent"?: boolean
  "kafka_agg_max_bytes"?: number
  "kafka_agg_max_messages"?: number
  "keytab"?: Keytab
  "max_send_limit_bytes"?: number
  "max_send_retries"?: number
  "message_key_key"?: string
  "partition_key"?: string
  "partition_key_key"?: string
  "password"?: Password
  "principal"?: string
  "rdkafka_options"?: RdkafkaOptions
  "required_acks"?: number
  "sasl_over_ssl"?: boolean
  "scram_mechanism"?: string
  "share_producer"?: boolean
  "slow_flush_log_threshold"?: string
  "ssl_ca_cert"?: SslCaCert
  "ssl_ca_certs_from_system"?: boolean
  "ssl_client_cert"?: SslClientCert
  "ssl_client_cert_chain"?: SslClientCertChain
  "ssl_client_cert_key"?: SslClientCertKey
  "ssl_verify_hostname"?: boolean
  "topic_key"?: string
  "use_default_for_unknown_topic"?: boolean
  "use_rdkafka"?: boolean
  "username"?: Username
}

export interface AssumeRoleCredentials {
  "duration_seconds"?: string
  "external_id"?: string
  "policy"?: string
  "role_arn": string
  "role_session_name": string
}

export interface AwsSesToken {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface ProcessCredentials {
  "process": string
}

export interface KinesisFirehose {
  "append_new_line"?: boolean
  "assume_role_credentials"?: AssumeRoleCredentials
  "aws_iam_retries"?: number
  "aws_key_id"?: AwsKeyId
  "aws_sec_key"?: AwsSecKey
  "aws_ses_token"?: AwsSesToken
  "batch_request_max_count"?: number
  "batch_request_max_size"?: number
  "buffer"?: Buffer
  "delivery_stream_name": string
  "format"?: Format
  "process_credentials"?: ProcessCredentials
  "region"?: string
  "reset_backoff_if_success"?: boolean
  "retries_on_batch_request"?: number
  "slow_flush_log_threshold"?: string
}

export interface KinesisStream {
  "assume_role_credentials"?: AssumeRoleCredentials
  "aws_iam_retries"?: number
  "aws_key_id"?: AwsKeyId
  "aws_sec_key"?: AwsSecKey
  "aws_ses_token"?: AwsSesToken
  "batch_request_max_count"?: number
  "batch_request_max_size"?: number
  "buffer"?: Buffer
  "format"?: Format
  "partition_key"?: string
  "process_credentials"?: ProcessCredentials
  "region"?: string
  "reset_backoff_if_success"?: boolean
  "retries_on_batch_request"?: number
  "slow_flush_log_threshold"?: string
  "stream_name": string
}

export interface AccessId {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface AccessKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface BearerToken {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface LmLogs {
  "access_id"?: AccessId
  "access_key"?: AccessKey
  "bearer_token"?: BearerToken
  "buffer"?: Buffer
  "company_domain"?: string
  "company_name": string
  "debug"?: boolean
  "device_less_logs"?: boolean
  "flush_interval"?: string
  "force_encoding"?: string
  "format"?: Format
  "http_proxy"?: string
  "include_metadata"?: boolean
  "resource_mapping"?: string
}

export interface Logdna {
  "api_key": string
  "app"?: string
  "buffer"?: Buffer
  "hostname": string
  "ingester_domain"?: string
  "ingester_endpoint"?: string
  "request_timeout"?: string
  "slow_flush_log_threshold"?: string
  "tags"?: string
}

export interface Token {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Endpoint2 {
  "port"?: number
  "token"?: Token
  "url"?: string
}

export interface Logz {
  "buffer"?: Buffer
  "bulk_limit"?: number
  "bulk_limit_warning_limit"?: number
  "endpoint": Endpoint2
  "gzip"?: boolean
  "http_idle_timeout"?: number
  "output_include_tags"?: boolean
  "output_include_time"?: boolean
  "retry_count"?: number
  "retry_sleep"?: number
  "slow_flush_log_threshold"?: string
}

export interface CaCert {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Cert2 {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Key {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Loki {
  "buffer"?: Buffer
  "ca_cert"?: CaCert
  "cert"?: Cert2
  "configure_kubernetes_labels"?: boolean
  "drop_single_key"?: boolean
  "extra_labels"?: Record<string, unknown>
  "extract_kubernetes_labels"?: boolean
  "include_thread_label"?: boolean
  "insecure_tls"?: boolean
  "key"?: Key
  "labels"?: Record<string, unknown>
  "line_format"?: string
  "password"?: Password
  "remove_keys"?: string[]
  "slow_flush_log_threshold"?: string
  "tenant"?: string
  "url"?: string
  "username"?: Username
}

export interface CaPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface WebhookUrl {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Mattermost {
  "ca_path"?: CaPath
  "channel_id"?: string
  "enable_tls"?: boolean
  "message"?: string
  "message_color"?: string
  "message_title"?: string
  "webhook_url": WebhookUrl
}

export interface LicenseKey {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Newrelic {
  "api_key"?: ApiKey
  "base_uri"?: string
  "buffer"?: Buffer
  "format"?: Format
  "license_key"?: LicenseKey
}

export interface Nullout {
  "never_flush"?: boolean
}

export interface Opensearch {
  "application_name"?: string
  "buffer"?: Buffer
  "bulk_message_request_threshold"?: string
  "ca_file"?: CaFile
  "catch_transport_exception_on_retry"?: boolean
  "client_cert"?: ClientCert
  "client_key"?: ClientKey
  "client_key_pass"?: ClientKeyPass
  "compression_level"?: string
  "custom_headers"?: string
  "customize_template"?: string
  "data_stream_enable"?: boolean
  "data_stream_name"?: string
  "data_stream_template_name"?: string
  "default_opensearch_version"?: number
  "emit_error_for_missing_id"?: boolean
  "emit_error_label_event"?: boolean
  "endpoint"?: Endpoint
  "exception_backup"?: boolean
  "fail_on_detecting_os_version_retry_exceed"?: boolean
  "fail_on_putting_template_retry_exceed"?: boolean
  "flatten_hashes"?: boolean
  "flatten_hashes_separator"?: string
  "host"?: string
  "hosts"?: string
  "http_backend"?: string
  "http_backend_excon_nonblock"?: boolean
  "id_key"?: string
  "ignore_exceptions"?: string
  "include_index_in_url"?: boolean
  "include_tag_key"?: boolean
  "include_timestamp"?: boolean
  "index_date_pattern"?: string
  "index_name"?: string
  "index_separator"?: string
  "log_os_400_reason"?: boolean
  "logstash_dateformat"?: string
  "logstash_format"?: boolean
  "logstash_prefix"?: string
  "logstash_prefix_separator"?: string
  "max_retry_get_os_version"?: number
  "max_retry_putting_template"?: string
  "parent_key"?: string
  "password"?: Password
  "path"?: string
  "pipeline"?: string
  "port"?: number
  "prefer_oj_serializer"?: boolean
  "reconnect_on_error"?: boolean
  "reload_after"?: string
  "reload_connections"?: boolean
  "reload_on_failure"?: boolean
  "remove_keys"?: string
  "remove_keys_on_update"?: string
  "remove_keys_on_update_key"?: string
  "request_timeout"?: string
  "resurrect_after"?: string
  "retry_tag"?: string
  "routing_key"?: string
  "scheme"?: string
  "selector_class_name"?: string
  "slow_flush_log_threshold"?: string
  "sniffer_class_name"?: string
  "ssl_verify"?: boolean
  "ssl_version"?: string
  "suppress_doc_wrap"?: boolean
  "suppress_type_name"?: boolean
  "tag_key"?: string
  "target_index_affinity"?: boolean
  "target_index_key"?: string
  "template_file"?: TemplateFile
  "template_name"?: string
  "template_overwrite"?: boolean
  "templates"?: string
  "time_key"?: string
  "time_key_exclude_timestamp"?: boolean
  "time_key_format"?: string
  "time_parse_error_tag"?: string
  "time_precision"?: string
  "truncate_caches_interval"?: string
  "unrecoverable_error_types"?: string
  "unrecoverable_record_types"?: string
  "use_legacy_template"?: boolean
  "user"?: string
  "utc_index"?: boolean
  "validate_client_version"?: boolean
  "verify_os_version_at_startup"?: boolean
  "with_transporter_log"?: boolean
  "write_operation"?: string
}

export interface AccessKeySecret {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Oss {
  "access_key_id": AccessKeyId
  "access_key_secret": AccessKeySecret
  "auto_create_bucket"?: boolean
  "bucket": string
  "buffer"?: Buffer
  "check_bucket"?: boolean
  "check_object"?: boolean
  "download_crc_enable"?: boolean
  "endpoint": string
  "format"?: Format
  "hex_random_length"?: number
  "index_format"?: string
  "key_format"?: string
  "open_timeout"?: number
  "oss_sdk_log_dir"?: string
  "overwrite"?: boolean
  "path"?: string
  "read_timeout"?: number
  "slow_flush_log_threshold"?: string
  "store_as"?: string
  "upload_crc_enable"?: boolean
  "warn_for_delay"?: string
}

export interface Pass {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface User {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Rabbitmq {
  "app_id"?: string
  "auth_mechanism"?: string
  "automatically_recover"?: boolean
  "buffer"?: Buffer
  "connection_timeout"?: number
  "content_encoding"?: string
  "content_type"?: string
  "continuation_timeout"?: number
  "exchange": string
  "exchange_durable"?: boolean
  "exchange_no_declare"?: boolean
  "exchange_type": string
  "expiration"?: number
  "format"?: Format
  "frame_max"?: number
  "heartbeat"?: string
  "host"?: string
  "hosts"?: string[]
  "id_key"?: string
  "message_type"?: string
  "network_recovery_interval"?: number
  "pass"?: Pass
  "persistent"?: boolean
  "port"?: number
  "priority"?: number
  "recovery_attempts"?: number
  "routing_key"?: string
  "timestamp"?: boolean
  "tls"?: boolean
  "tls_ca_certificates"?: string[]
  "tls_cert"?: string
  "tls_key"?: string
  "user"?: User
  "verify_peer"?: boolean
  "vhost"?: string
}

export interface Redis {
  "allow_duplicate_key"?: boolean
  "buffer"?: Buffer
  "db_number"?: number
  "format"?: Format
  "host"?: string
  "insert_key_prefix"?: string
  "password"?: Password
  "port"?: number
  "slow_flush_log_threshold"?: string
  "strftime_format"?: string
  "ttl"?: number
}

export interface Relabel {
  "label": string
}

export interface Compress {
  "parquet_compression_codec"?: string
  "parquet_page_size"?: string
  "parquet_row_group_size"?: string
  "record_type"?: string
  "schema_file"?: string
  "schema_type"?: string
}

export interface InstanceProfileCredentials {
  "http_open_timeout"?: string
  "http_read_timeout"?: string
  "ip_address"?: string
  "port"?: string
  "retries"?: string
}

export interface SharedCredentials {
  "path"?: string
  "profile_name"?: string
}

export interface S3 {
  "acl"?: string
  "assume_role_credentials"?: AssumeRoleCredentials
  "auto_create_bucket"?: string
  "aws_iam_retries"?: string
  "aws_key_id"?: AwsKeyId
  "aws_sec_key"?: AwsSecKey
  "buffer"?: Buffer
  "check_apikey_on_start"?: string
  "check_bucket"?: string
  "check_object"?: string
  "clustername"?: string
  "compress"?: Compress
  "compute_checksums"?: string
  "enable_transfer_acceleration"?: string
  "force_path_style"?: string
  "format"?: Format
  "grant_full_control"?: string
  "grant_read"?: string
  "grant_read_acp"?: string
  "grant_write_acp"?: string
  "hex_random_length"?: string
  "index_format"?: string
  "instance_profile_credentials"?: InstanceProfileCredentials
  "oneeye_format"?: boolean
  "overwrite"?: string
  "path"?: string
  "proxy_uri"?: string
  "s3_bucket": string
  "s3_endpoint"?: string
  "s3_metadata"?: string
  "s3_object_key_format"?: string
  "s3_region"?: string
  "shared_credentials"?: SharedCredentials
  "signature_version"?: string
  "slow_flush_log_threshold"?: string
  "sse_customer_algorithm"?: string
  "sse_customer_key"?: string
  "sse_customer_key_md5"?: string
  "ssekms_key_id"?: string
  "ssl_ca_bundle"?: string
  "ssl_ca_directory"?: string
  "ssl_verify_peer"?: string
  "storage_class"?: string
  "store_as"?: string
  "use_bundled_cert"?: string
  "use_server_side_encryption"?: string
  "warn_for_delay"?: string
}

export interface HecToken {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface SplunkHec {
  "buffer"?: Buffer
  "ca_file"?: CaFile
  "ca_path"?: CaPath
  "client_cert"?: ClientCert
  "client_key"?: ClientKey
  "coerce_to_utf8"?: boolean
  "data_type"?: string
  "fields"?: Record<string, unknown>
  "format"?: Format
  "hec_host": string
  "hec_port"?: number
  "hec_token": HecToken
  "host"?: string
  "host_key"?: string
  "idle_timeout"?: number
  "index"?: string
  "index_key"?: string
  "insecure_ssl"?: boolean
  "keep_keys"?: boolean
  "metric_name_key"?: string
  "metric_value_key"?: string
  "metrics_from_event"?: boolean
  "non_utf8_replacement_string"?: string
  "open_timeout"?: number
  "protocol"?: string
  "read_timeout"?: number
  "slow_flush_log_threshold"?: string
  "source"?: string
  "source_key"?: string
  "sourcetype"?: string
  "sourcetype_key"?: string
  "ssl_ciphers"?: string
}

export interface Sqs {
  "aws_key_id"?: AwsKeyId
  "aws_sec_key"?: AwsSecKey
  "buffer"?: Buffer
  "create_queue"?: boolean
  "delay_seconds"?: number
  "include_tag"?: boolean
  "message_group_id"?: string
  "queue_name"?: string
  "region"?: string
  "slow_flush_log_threshold"?: string
  "sqs_url"?: string
  "tag_property_name"?: string
}

export interface ClientCertPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Format2 {
  "app_name_field"?: string
  "hostname_field"?: string
  "log_field"?: string
  "message_id_field"?: string
  "proc_id_field"?: string
  "rfc6587_message_size"?: boolean
  "structured_data_field"?: string
  "type"?: string
}

export interface PrivateKeyPassphrase {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface PrivateKeyPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface TrustedCaPath {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Syslog {
  "allow_self_signed_cert"?: boolean
  "buffer"?: Buffer
  "client_cert_path"?: ClientCertPath
  "enable_system_cert_store"?: boolean
  "format"?: Format2
  "fqdn"?: string
  "host": string
  "insecure"?: boolean
  "port"?: number
  "private_key_passphrase"?: PrivateKeyPassphrase
  "private_key_path"?: PrivateKeyPath
  "slow_flush_log_threshold"?: string
  "transport"?: string
  "trusted_ca_path"?: TrustedCaPath
  "verify_fqdn"?: boolean
  "version"?: string
}

export interface VmwareLogInsight {
  "agent_id"?: string
  "authentication"?: string
  "buffer"?: Buffer
  "ca_file"?: CaFile
  "config_param"?: Record<string, unknown>
  "flatten_hashes"?: boolean
  "flatten_hashes_separator"?: string
  "host"?: string
  "http_conn_debug"?: boolean
  "http_method"?: string
  "log_text_keys"?: string[]
  "max_batch_size"?: number
  "password"?: Password
  "path"?: string
  "port"?: number
  "raise_on_error"?: boolean
  "rate_limit_msec"?: number
  "request_retries"?: number
  "request_timeout"?: number
  "scheme"?: string
  "serializer"?: string
  "shorten_keys"?: Record<string, unknown>
  "ssl_verify"?: boolean
  "username"?: Username
}

export interface Authorization {
  "mountFrom"?: MountFrom
  "value"?: string
  "valueFrom"?: ValueFrom
}

export interface Headers {
  "authorization": Authorization
  "content_type": string
  "structure": string
}

export interface VmwareLogIntelligence {
  "buffer"?: Buffer
  "endpoint_url": string
  "format"?: Format
  "headers": Headers
  "http_compress"?: boolean
  "verify_ssl": boolean
}

export interface OutputSpec {
  "awsElasticsearch"?: AwsElasticsearch
  "azurestorage"?: Azurestorage
  "cloudwatch"?: Cloudwatch
  "datadog"?: Datadog
  "elasticsearch"?: Elasticsearch
  "file"?: File
  "forward"?: Forward
  "gcs"?: Gcs
  "gelf"?: Gelf
  "http"?: Http
  "kafka"?: Kafka
  "kinesisFirehose"?: KinesisFirehose
  "kinesisStream"?: KinesisStream
  "lmLogs"?: LmLogs
  "logdna"?: Logdna
  "loggingRef"?: string
  "logz"?: Logz
  "loki"?: Loki
  "mattermost"?: Mattermost
  "newrelic"?: Newrelic
  "nullout"?: Nullout
  "opensearch"?: Opensearch
  "oss"?: Oss
  "rabbitmq"?: Rabbitmq
  "redis"?: Redis
  "relabel"?: Relabel
  "s3"?: S3
  "splunkHec"?: SplunkHec
  "sqs"?: Sqs
  "syslog"?: Syslog
  "vmwareLogInsight"?: VmwareLogInsight
  "vmwareLogIntelligence"?: VmwareLogIntelligence
}

export interface OutputStatus {
  "active"?: boolean
  "problems"?: string[]
  "problemsCount"?: number
}
