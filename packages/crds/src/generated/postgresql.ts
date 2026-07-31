/**
 * GENERATED from postgresql CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface Cluster {
  apiVersion: 'postgresql.cnpg.io/v1'
  kind: 'Cluster'
  metadata: ObjectMeta
  spec: ClusterSpec
  status?: ClusterStatus
}

/** Props for the {@link Cluster} component — a 1:1 mapping of the postgresql.cnpg.io/v1 CRD. */
export interface ClusterProps {
  metadata: ObjectMeta
  spec: ClusterSpec
}

/** Render a Cluster (postgresql.cnpg.io/v1) exactly as defined by its CRD. */
export function ClusterComponent(props: ClusterProps) {
  return jsx('Cluster', {
    apiVersion: 'postgresql.cnpg.io/v1',
    kind: 'Cluster',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Pooler {
  apiVersion: 'postgresql.cnpg.io/v1'
  kind: 'Pooler'
  metadata: ObjectMeta
  spec: PoolerSpec
  status?: PoolerStatus
}

/** Props for the {@link Pooler} component — a 1:1 mapping of the postgresql.cnpg.io/v1 CRD. */
export interface PoolerProps {
  metadata: ObjectMeta
  spec: PoolerSpec
}

/** Render a Pooler (postgresql.cnpg.io/v1) exactly as defined by its CRD. */
export function PoolerComponent(props: PoolerProps) {
  return jsx('Pooler', {
    apiVersion: 'postgresql.cnpg.io/v1',
    kind: 'Pooler',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface ScheduledBackup {
  apiVersion: 'postgresql.cnpg.io/v1'
  kind: 'ScheduledBackup'
  metadata: ObjectMeta
  spec: ScheduledBackupSpec
  status?: ScheduledBackupStatus
}

/** Props for the {@link ScheduledBackup} component — a 1:1 mapping of the postgresql.cnpg.io/v1 CRD. */
export interface ScheduledBackupProps {
  metadata: ObjectMeta
  spec: ScheduledBackupSpec
}

/** Render a ScheduledBackup (postgresql.cnpg.io/v1) exactly as defined by its CRD. */
export function ScheduledBackupComponent(props: ScheduledBackupProps) {
  return jsx('ScheduledBackup', {
    apiVersion: 'postgresql.cnpg.io/v1',
    kind: 'ScheduledBackup',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface MatchExpressionsItem {
  /** key is the label key that the selector applies to. */
  "key": string
  /** operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist. */
  "operator": string
  /** values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch. */
  "values"?: string[]
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

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem {
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

export interface AdditionalPodAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  /** If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface AdditionalPodAntiAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and subtracting "weight" from the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  /** If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
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

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem2 {
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
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem2[]
  /** If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to an update), the system may or may not try to eventually evict the pod from its node. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecution
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

export interface Affinity {
  /** AdditionalPodAffinity allows to specify pod affinity terms to be passed to all the cluster's pods. */
  "additionalPodAffinity"?: AdditionalPodAffinity
  /** AdditionalPodAntiAffinity allows to specify pod anti-affinity terms to be added to the ones generated by the operator if EnablePodAntiAffinity is set to true (default) or to be used exclusively if set to false. */
  "additionalPodAntiAffinity"?: AdditionalPodAntiAffinity
  /** Activates anti-affinity for the pods. The operator will define pods anti-affinity unless this field is explicitly set to false */
  "enablePodAntiAffinity"?: boolean
  /** NodeAffinity describes node affinity scheduling rules for the pod. More info: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity */
  "nodeAffinity"?: NodeAffinity
  /** NodeSelector is map of key-value pairs used to define the nodes on which the pods can run. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ */
  "nodeSelector"?: Record<string, unknown>
  /** PodAntiAffinityType allows the user to decide whether pod anti-affinity between cluster instance has to be considered a strong requirement during scheduling or not. Allowed values are: "preferred" (default if empty) or "required". Setting it to "required", could lead to instances remaining pending until new kubernetes nodes are added if all the existing nodes don't match the required pod anti-affinity rule. More info: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity */
  "podAntiAffinityType"?: string
  /** Tolerations is a list of Tolerations that should be set for all the pods, in order to allow them to run on tainted nodes. More info: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ */
  "tolerations"?: TolerationsItem[]
  /** TopologyKey to use for anti-affinity configuration. See k8s documentation for more info on that */
  "topologyKey"?: string
}

export interface ConnectionString {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface StorageAccount {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface StorageKey {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface StorageSasToken {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface AzureCredentials {
  /** The connection string to be used */
  "connectionString"?: ConnectionString
  /** Use the Azure AD based authentication without providing explicitly the keys. */
  "inheritFromAzureAD"?: boolean
  /** The storage account where to upload data */
  "storageAccount"?: StorageAccount
  /** The storage account key to be used in conjunction with the storage account name */
  "storageKey"?: StorageKey
  /** A shared-access-signature to be used in conjunction with the storage account name */
  "storageSasToken"?: StorageSasToken
  /** Use the default Azure authentication flow, which includes DefaultAzureCredential. This allows authentication using environment variables and managed identities. */
  "useDefaultAzureCredentials"?: boolean
}

export interface Data {
  /** AdditionalCommandArgs represents additional arguments that can be appended to the 'barman-cloud-backup' command-line invocation. These arguments provide flexibility to customize the backup process further according to specific requirements or configurations. Example: In a scenario where specialized backup options are required, such as setting a specific timeout or defining custom behavior, users can use this field to specify additional command arguments. Note: It's essential to ensure that the provided arguments are valid and supported by the 'barman-cloud-backup' command, to avoid potential errors or unintended behavior during execution. */
  "additionalCommandArgs"?: string[]
  /** Compress a backup file (a tar file per tablespace) while streaming it to the object store. Available options are empty string (no compression, default), `gzip`, `bzip2`, and `snappy`. */
  "compression"?: string
  /** Whenever to force the encryption of files (if the bucket is not already configured for that). Allowed options are empty string (use the bucket policy, default), `AES256` and `aws:kms` */
  "encryption"?: string
  /** Control whether the I/O workload for the backup initial checkpoint will be limited, according to the `checkpoint_completion_target` setting on the PostgreSQL server. If set to true, an immediate checkpoint will be used, meaning PostgreSQL will complete the checkpoint as soon as possible. `false` by default. */
  "immediateCheckpoint"?: boolean
  /** The number of parallel jobs to be used to upload the backup, defaults to 2 */
  "jobs"?: number
}

export interface EndpointCA {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface ApplicationCredentials {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface GoogleCredentials {
  /** The secret containing the Google Cloud Storage JSON file with the credentials */
  "applicationCredentials"?: ApplicationCredentials
  /** If set to true, will presume that it's running inside a GKE environment, default to false. */
  "gkeEnvironment"?: boolean
}

export interface AccessKeyId {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface Region {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface SecretAccessKey {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface SessionToken {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface S3Credentials {
  /** The reference to the access key id */
  "accessKeyId"?: AccessKeyId
  /** Use the role based authentication without providing explicitly the keys. */
  "inheritFromIAMRole"?: boolean
  /** The reference to the secret containing the region name */
  "region"?: Region
  /** The reference to the secret access key */
  "secretAccessKey"?: SecretAccessKey
  /** The references to the session key */
  "sessionToken"?: SessionToken
}

export interface Wal {
  /** Additional arguments that can be appended to the 'barman-cloud-wal-archive' command-line invocation. These arguments provide flexibility to customize the WAL archive process further, according to specific requirements or configurations. Example: In a scenario where specialized backup options are required, such as setting a specific timeout or defining custom behavior, users can use this field to specify additional command arguments. Note: It's essential to ensure that the provided arguments are valid and supported by the 'barman-cloud-wal-archive' command, to avoid potential errors or unintended behavior during execution. */
  "archiveAdditionalCommandArgs"?: string[]
  /** Compress a WAL file before sending it to the object store. Available options are empty string (no compression, default), `gzip`, `bzip2`, `lz4`, `snappy`, `xz`, and `zstd`. */
  "compression"?: string
  /** Whenever to force the encryption of files (if the bucket is not already configured for that). Allowed options are empty string (use the bucket policy, default), `AES256` and `aws:kms` */
  "encryption"?: string
  /** Number of WAL files to be either archived in parallel (when the PostgreSQL instance is archiving to a backup object store) or restored in parallel (when a PostgreSQL standby is fetching WAL files from a recovery object store). If not specified, WAL files will be processed one at a time. It accepts a positive integer as a value - with 1 being the minimum accepted value. */
  "maxParallel"?: number
  /** Additional arguments that can be appended to the 'barman-cloud-wal-restore' command-line invocation. These arguments provide flexibility to customize the WAL restore process further, according to specific requirements or configurations. Example: In a scenario where specialized backup options are required, such as setting a specific timeout or defining custom behavior, users can use this field to specify additional command arguments. Note: It's essential to ensure that the provided arguments are valid and supported by the 'barman-cloud-wal-restore' command, to avoid potential errors or unintended behavior during execution. */
  "restoreAdditionalCommandArgs"?: string[]
}

export interface BarmanObjectStore {
  /** The credentials to use to upload data to Azure Blob Storage */
  "azureCredentials"?: AzureCredentials
  /** The configuration to be used to backup the data files When not defined, base backups files will be stored uncompressed and may be unencrypted in the object store, according to the bucket default policy. */
  "data"?: Data
  /** The path where to store the backup (i.e. s3://bucket/path/to/folder) this path, with different destination folders, will be used for WALs and for data */
  "destinationPath": string
  /** EndpointCA store the CA bundle of the barman endpoint. Useful when using self-signed certificates to avoid errors with certificate issuer and barman-cloud-wal-archive */
  "endpointCA"?: EndpointCA
  /** Endpoint to be used to upload data to the cloud, overriding the automatic endpoint discovery */
  "endpointURL"?: string
  /** The credentials to use to upload data to Google Cloud Storage */
  "googleCredentials"?: GoogleCredentials
  /** HistoryTags is a list of key value pairs that will be passed to the Barman --history-tags option. */
  "historyTags"?: Record<string, unknown>
  /** The credentials to use to upload data to S3 */
  "s3Credentials"?: S3Credentials
  /** The server name on S3, the cluster name is used if this parameter is omitted */
  "serverName"?: string
  /** Tags is a list of key value pairs that will be passed to the Barman --tags option. */
  "tags"?: Record<string, unknown>
  /** The configuration for the backup of the WAL stream. When not defined, WAL files will be stored uncompressed and may be unencrypted in the object store, according to the bucket default policy. */
  "wal"?: Wal
}

export interface OnlineConfiguration {
  /** Control whether the I/O workload for the backup initial checkpoint will be limited, according to the `checkpoint_completion_target` setting on the PostgreSQL server. If set to true, an immediate checkpoint will be used, meaning PostgreSQL will complete the checkpoint as soon as possible. `false` by default. */
  "immediateCheckpoint"?: boolean
  /** If false, the function will return immediately after the backup is completed, without waiting for WAL to be archived. This behavior is only useful with backup software that independently monitors WAL archiving. Otherwise, WAL required to make the backup consistent might be missing and make the backup useless. By default, or when this parameter is true, pg_backup_stop will wait for WAL to be archived when archiving is enabled. On a standby, this means that it will wait only when archive_mode = always. If write activity on the primary is low, it may be useful to run pg_switch_wal on the primary in order to trigger an immediate segment switch. */
  "waitForArchive"?: boolean
}

export interface VolumeSnapshot {
  /** Annotations key-value pairs that will be added to .metadata.annotations snapshot resources. */
  "annotations"?: Record<string, unknown>
  /** ClassName specifies the Snapshot Class to be used for PG_DATA PersistentVolumeClaim. It is the default class for the other types if no specific class is present */
  "className"?: string
  /** Labels are key-value pairs that will be added to .metadata.labels snapshot resources. */
  "labels"?: Record<string, unknown>
  /** Whether the default type of backup with volume snapshots is online/hot (`true`, default) or offline/cold (`false`) */
  "online"?: boolean
  /** Configuration parameters to control the online/hot backup with volume snapshots */
  "onlineConfiguration"?: OnlineConfiguration
  /** SnapshotOwnerReference indicates the type of owner reference the snapshot should have */
  "snapshotOwnerReference"?: string
  /** TablespaceClassName specifies the Snapshot Class to be used for the tablespaces. defaults to the PGDATA Snapshot Class, if set */
  "tablespaceClassName"?: Record<string, unknown>
  /** WalClassName specifies the Snapshot Class to be used for the PG_WAL PersistentVolumeClaim. */
  "walClassName"?: string
}

export interface Backup {
  /** The configuration for the barman-cloud tool suite */
  "barmanObjectStore"?: BarmanObjectStore
  /** RetentionPolicy is the retention policy to be used for backups and WALs (i.e. '60d'). The retention policy is expressed in the form of `XXu` where `XX` is a positive integer and `u` is in `[dwm]` - days, weeks, months. It's currently only applicable when using the BarmanObjectStore method. */
  "retentionPolicy"?: string
  /** The policy to decide which instance should perform backups. Available options are empty string, which will default to `prefer-standby` policy, `primary` to have backups run always on primary instances, `prefer-standby` to have backups run preferably on the most updated standby, if available. */
  "target"?: string
  /** VolumeSnapshot provides the configuration for the execution of volume snapshot backups. */
  "volumeSnapshot"?: VolumeSnapshot
}

export interface Source {
  /** The name of the externalCluster used for import */
  "externalCluster": string
}

export interface Import {
  /** The databases to import */
  "databases": string[]
  /** List of custom options to pass to the `pg_dump` command. IMPORTANT: Use these options with caution and at your own risk, as the operator does not validate their content. Be aware that certain options may conflict with the operator's intended functionality or design. */
  "pgDumpExtraOptions"?: string[]
  /** List of custom options to pass to the `pg_restore` command. IMPORTANT: Use these options with caution and at your own risk, as the operator does not validate their content. Be aware that certain options may conflict with the operator's intended functionality or design. */
  "pgRestoreExtraOptions"?: string[]
  /** List of SQL queries to be executed as a superuser in the application database right after is imported - to be used with extreme care (by default empty). Only available in microservice type. */
  "postImportApplicationSQL"?: string[]
  /** The roles to import */
  "roles"?: string[]
  /** When set to true, only the `pre-data` and `post-data` sections of `pg_restore` are invoked, avoiding data import. Default: `false`. */
  "schemaOnly"?: boolean
  /** The source of the import */
  "source": Source
  /** The import type. Can be `microservice` or `monolith`. */
  "type": string
}

export interface ConfigMapRefsItem {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface SecretRefsItem {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface PostInitApplicationSQLRefs {
  /** ConfigMapRefs holds a list of references to ConfigMaps */
  "configMapRefs"?: ConfigMapRefsItem[]
  /** SecretRefs holds a list of references to Secrets */
  "secretRefs"?: SecretRefsItem[]
}

export interface PostInitSQLRefs {
  /** ConfigMapRefs holds a list of references to ConfigMaps */
  "configMapRefs"?: ConfigMapRefsItem[]
  /** SecretRefs holds a list of references to Secrets */
  "secretRefs"?: SecretRefsItem[]
}

export interface PostInitTemplateSQLRefs {
  /** ConfigMapRefs holds a list of references to ConfigMaps */
  "configMapRefs"?: ConfigMapRefsItem[]
  /** SecretRefs holds a list of references to Secrets */
  "secretRefs"?: SecretRefsItem[]
}

export interface Secret {
  /** Name of the referent. */
  "name": string
}

export interface Initdb {
  /** Specifies the locale name when the builtin provider is used. This option requires `localeProvider` to be set to `builtin`. Available from PostgreSQL 17. */
  "builtinLocale"?: string
  /** Whether the `-k` option should be passed to initdb, enabling checksums on data pages (default: `false`) */
  "dataChecksums"?: boolean
  /** Name of the database used by the application. Default: `app`. */
  "database"?: string
  /** The value to be passed as option `--encoding` for initdb (default:`UTF8`) */
  "encoding"?: string
  /** Specifies the ICU locale when the ICU provider is used. This option requires `localeProvider` to be set to `icu`. Available from PostgreSQL 15. */
  "icuLocale"?: string
  /** Specifies additional collation rules to customize the behavior of the default collation. This option requires `localeProvider` to be set to `icu`. Available from PostgreSQL 16. */
  "icuRules"?: string
  /** Bootstraps the new cluster by importing data from an existing PostgreSQL instance using logical backup (`pg_dump` and `pg_restore`) */
  "import"?: Import
  /** Sets the default collation order and character classification in the new database. */
  "locale"?: string
  /** The value to be passed as option `--lc-ctype` for initdb (default:`C`) */
  "localeCType"?: string
  /** The value to be passed as option `--lc-collate` for initdb (default:`C`) */
  "localeCollate"?: string
  /** This option sets the locale provider for databases created in the new cluster. Available from PostgreSQL 16. */
  "localeProvider"?: string
  /** The list of options that must be passed to initdb when creating the cluster. Deprecated: This could lead to inconsistent configurations, please use the explicit provided parameters instead. If defined, explicit values will be ignored. */
  "options"?: string[]
  /** Name of the owner of the database in the instance to be used by applications. Defaults to the value of the `database` key. */
  "owner"?: string
  /** List of SQL queries to be executed as a superuser in the application database right after the cluster has been created - to be used with extreme care (by default empty) */
  "postInitApplicationSQL"?: string[]
  /** List of references to ConfigMaps or Secrets containing SQL files to be executed as a superuser in the application database right after the cluster has been created. The references are processed in a specific order: first, all Secrets are processed, followed by all ConfigMaps. Within each group, the processing order follows the sequence specified in their respective arrays. (by default empty) */
  "postInitApplicationSQLRefs"?: PostInitApplicationSQLRefs
  /** List of SQL queries to be executed as a superuser in the `postgres` database right after the cluster has been created - to be used with extreme care (by default empty) */
  "postInitSQL"?: string[]
  /** List of references to ConfigMaps or Secrets containing SQL files to be executed as a superuser in the `postgres` database right after the cluster has been created. The references are processed in a specific order: first, all Secrets are processed, followed by all ConfigMaps. Within each group, the processing order follows the sequence specified in their respective arrays. (by default empty) */
  "postInitSQLRefs"?: PostInitSQLRefs
  /** List of SQL queries to be executed as a superuser in the `template1` database right after the cluster has been created - to be used with extreme care (by default empty) */
  "postInitTemplateSQL"?: string[]
  /** List of references to ConfigMaps or Secrets containing SQL files to be executed as a superuser in the `template1` database right after the cluster has been created. The references are processed in a specific order: first, all Secrets are processed, followed by all ConfigMaps. Within each group, the processing order follows the sequence specified in their respective arrays. (by default empty) */
  "postInitTemplateSQLRefs"?: PostInitTemplateSQLRefs
  /** Name of the secret containing the initial credentials for the owner of the user database. If empty a new secret will be created from scratch */
  "secret"?: Secret
  /** The value in megabytes (1 to 1024) to be passed to the `--wal-segsize` option for initdb (default: empty, resulting in PostgreSQL default: 16MB) */
  "walSegmentSize"?: number
}

export interface PgBasebackup {
  /** Name of the database used by the application. Default: `app`. */
  "database"?: string
  /** Name of the owner of the database in the instance to be used by applications. Defaults to the value of the `database` key. */
  "owner"?: string
  /** Name of the secret containing the initial credentials for the owner of the user database. If empty a new secret will be created from scratch */
  "secret"?: Secret
  /** The name of the server of which we need to take a physical backup */
  "source": string
}

export interface Backup2 {
  /** EndpointCA store the CA bundle of the barman endpoint. Useful when using self-signed certificates to avoid errors with certificate issuer and barman-cloud-wal-archive. */
  "endpointCA"?: EndpointCA
  /** Name of the referent. */
  "name": string
}

export interface RecoveryTarget {
  /** The ID of the backup from which to start the recovery process. If empty (default) the operator will automatically detect the backup based on targetTime or targetLSN if specified. Otherwise use the latest available backup in chronological order. */
  "backupID"?: string
  /** Set the target to be exclusive. If omitted, defaults to false, so that in Postgres, `recovery_target_inclusive` will be true */
  "exclusive"?: boolean
  /** End recovery as soon as a consistent state is reached */
  "targetImmediate"?: boolean
  /** The target LSN (Log Sequence Number) */
  "targetLSN"?: string
  /** The target name (to be previously created with `pg_create_restore_point`) */
  "targetName"?: string
  /** The target timeline ("latest" or a positive integer) */
  "targetTLI"?: string
  /** The target time as a timestamp in RFC3339 format or PostgreSQL timestamp format. Timestamps without an explicit timezone are interpreted as UTC. */
  "targetTime"?: string
  /** The target transaction ID */
  "targetXID"?: string
}

export interface Storage {
  /** APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. */
  "apiGroup"?: string
  /** Kind is the type of resource being referenced */
  "kind": string
  /** Name is the name of resource being referenced */
  "name": string
}

export interface WalStorage {
  /** APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. */
  "apiGroup"?: string
  /** Kind is the type of resource being referenced */
  "kind": string
  /** Name is the name of resource being referenced */
  "name": string
}

export interface VolumeSnapshots {
  /** Configuration of the storage of the instances */
  "storage": Storage
  /** Configuration of the storage for PostgreSQL tablespaces */
  "tablespaceStorage"?: Record<string, unknown>
  /** Configuration of the storage for PostgreSQL WAL (Write-Ahead Log) */
  "walStorage"?: WalStorage
}

export interface Recovery {
  /** The backup object containing the physical base backup from which to initiate the recovery procedure. Mutually exclusive with `source` and `volumeSnapshots`. */
  "backup"?: Backup2
  /** Name of the database used by the application. Default: `app`. */
  "database"?: string
  /** Name of the owner of the database in the instance to be used by applications. Defaults to the value of the `database` key. */
  "owner"?: string
  /** By default, the recovery process applies all the available WAL files in the archive (full recovery). However, you can also end the recovery as soon as a consistent state is reached or recover to a point-in-time (PITR) by specifying a `RecoveryTarget` object, as expected by PostgreSQL (i.e., timestamp, transaction Id, LSN, ...). More info: https://www.postgresql.org/docs/current/runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET */
  "recoveryTarget"?: RecoveryTarget
  /** Name of the secret containing the initial credentials for the owner of the user database. If empty a new secret will be created from scratch */
  "secret"?: Secret
  /** The external cluster whose backup we will restore. This is also used as the name of the folder under which the backup is stored, so it must be set to the name of the source cluster Mutually exclusive with `backup`. */
  "source"?: string
  /** The static PVC data source(s) from which to initiate the recovery procedure. Currently supporting `VolumeSnapshot` and `PersistentVolumeClaim` resources that map an existing PVC group, compatible with CloudNativePG, and taken with a cold backup copy on a fenced Postgres instance (limitation which will be removed in the future when online backup will be implemented). Mutually exclusive with `backup`. */
  "volumeSnapshots"?: VolumeSnapshots
}

export interface Bootstrap {
  /** Bootstrap the cluster via initdb */
  "initdb"?: Initdb
  /** Bootstrap the cluster taking a physical backup of another compatible PostgreSQL instance */
  "pg_basebackup"?: PgBasebackup
  /** Bootstrap the cluster from a backup */
  "recovery"?: Recovery
}

export interface Certificates {
  /** The secret containing the Client CA certificate. If not defined, a new secret will be created with a self-signed CA and will be used to generate all the client certificates.<br /> <br /> Contains:<br /> <br /> - `ca.crt`: CA that should be used to validate the client certificates, used as `ssl_ca_file` of all the instances.<br /> - `ca.key`: key used to generate client certificates, if ReplicationTLSSecret is provided, this can be omitted.<br /> */
  "clientCASecret"?: string
  /** The secret of type kubernetes.io/tls containing the client certificate to authenticate as the `streaming_replica` user. If not defined, ClientCASecret must provide also `ca.key`, and a new secret will be created using the provided CA. */
  "replicationTLSSecret"?: string
  /** The list of the server alternative DNS names to be added to the generated server TLS certificates, when required. */
  "serverAltDNSNames"?: string[]
  /** The secret containing the Server CA certificate. If not defined, a new secret will be created with a self-signed CA and will be used to generate the TLS certificate ServerTLSSecret.<br /> <br /> Contains:<br /> <br /> - `ca.crt`: CA that should be used to validate the server certificate, used as `sslrootcert` in client connection strings.<br /> - `ca.key`: key used to generate Server SSL certs, if ServerTLSSecret is provided, this can be omitted.<br /> */
  "serverCASecret"?: string
  /** The secret of type kubernetes.io/tls containing the server TLS certificate and key that will be set as `ssl_cert_file` and `ssl_key_file` so that clients can connect to postgres securely. If not defined, ServerCASecret must provide also `ca.key` and a new secret will be created using the provided CA. */
  "serverTLSSecret"?: string
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

export interface Resources {
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
  "resources"?: Resources
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

export interface EphemeralVolumeSource {
  /** Will be used to create a stand-alone PVC to provision the volume. The pod in which this EphemeralVolumeSource is embedded will be the owner of the PVC, i.e. the PVC will be deleted together with the pod.  The name of the PVC will be `<pod name>-<volume name>` where `<volume name>` is the name from the `PodSpec.Volumes` array entry. Pod validation will reject the pod if the concatenated name is not valid for a PVC (for example, too long). An existing PVC with that name that is not owned by the pod will *not* be used for the pod to avoid using an unrelated volume by mistake. Starting the pod is then blocked until the unrelated PVC is removed. If such a pre-created PVC is meant to be used by the pod, the PVC has to updated with an owner reference to the pod once the pod exists. Normally this should not be necessary, but it may be useful when manually reconstructing a broken cluster. This field is read-only and no changes will be made by Kubernetes to the PVC after it has been created. Required, must not be nil. */
  "volumeClaimTemplate"?: VolumeClaimTemplate
}

export interface EphemeralVolumesSizeLimit {
  /** Shm is the size limit of the shared memory volume */
  "shm"?: number | string
  /** TemporaryData is the size limit of the temporary data volume */
  "temporaryData"?: number | string
}

export interface Password {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface Plugin {
  /** Enabled is true if this plugin will be used */
  "enabled"?: boolean
  /** Marks the plugin as the WAL archiver. At most one plugin can be designated as a WAL archiver. This cannot be enabled if the `.spec.backup.barmanObjectStore` configuration is present. */
  "isWALArchiver"?: boolean
  /** Name is the plugin name */
  "name": string
  /** Parameters is the configuration of the plugin */
  "parameters"?: Record<string, unknown>
}

export interface SslCert {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface SslKey {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface SslRootCert {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ExternalClustersItem {
  /** The configuration for the barman-cloud tool suite */
  "barmanObjectStore"?: BarmanObjectStore
  /** The list of connection parameters, such as dbname, host, username, etc */
  "connectionParameters"?: Record<string, unknown>
  /** The server name, required */
  "name": string
  /** The reference to the password to be used to connect to the server. If a password is provided, CloudNativePG creates a PostgreSQL passfile at `/controller/external/NAME/pass` (where "NAME" is the cluster's name). This passfile is automatically referenced in the connection string when establishing a connection to the remote PostgreSQL server from the current PostgreSQL `Cluster`. This ensures secure and efficient password management for external clusters. */
  "password"?: Password
  /** The configuration of the plugin that is taking care of WAL archiving and backups for this external cluster */
  "plugin"?: Plugin
  /** The reference to an SSL certificate to be used to connect to this instance */
  "sslCert"?: SslCert
  /** The reference to an SSL private key to be used to connect to this instance */
  "sslKey"?: SslKey
  /** The reference to an SSL CA public key to be used to connect to this instance */
  "sslRootCert"?: SslRootCert
}

export interface ImageCatalogRef {
  /** APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. */
  "apiGroup"?: string
  /** Kind is the type of resource being referenced */
  "kind": string
  /** The major version of PostgreSQL we want to use from the ImageCatalog */
  "major": number
  /** Name is the name of resource being referenced */
  "name": string
}

export interface ImagePullSecretsItem {
  /** Name of the referent. */
  "name": string
}

export interface InheritedMetadata {
  "annotations"?: Record<string, unknown>
  "labels"?: Record<string, unknown>
}

export interface PasswordSecret {
  /** Name of the referent. */
  "name": string
}

export interface RolesItem {
  /** Whether a role bypasses every row-level security (RLS) policy. Default is `false`. */
  "bypassrls"?: boolean
  /** Description of the role */
  "comment"?: string
  /** If the role can log in, this specifies how many concurrent connections the role can make. `-1` (the default) means no limit. */
  "connectionLimit"?: number
  /** When set to `true`, the role being defined will be allowed to create new databases. Specifying `false` (default) will deny a role the ability to create databases. */
  "createdb"?: boolean
  /** Whether the role will be permitted to create, alter, drop, comment on, change the security label for, and grant or revoke membership in other roles. Default is `false`. */
  "createrole"?: boolean
  /** DisablePassword indicates that a role's password should be set to NULL in Postgres */
  "disablePassword"?: boolean
  /** Ensure the role is `present` or `absent` - defaults to "present" */
  "ensure"?: string
  /** List of one or more existing roles to which this role will be immediately added as a new member. Default empty. */
  "inRoles"?: string[]
  /** Whether a role "inherits" the privileges of roles it is a member of. Defaults is `true`. */
  "inherit"?: boolean
  /** Whether the role is allowed to log in. A role having the `login` attribute can be thought of as a user. Roles without this attribute are useful for managing database privileges, but are not users in the usual sense of the word. Default is `false`. */
  "login"?: boolean
  /** Name of the role */
  "name": string
  /** Secret containing the password of the role (if present) If null, the password will be ignored unless DisablePassword is set */
  "passwordSecret"?: PasswordSecret
  /** Whether a role is a replication role. A role must have this attribute (or be a superuser) in order to be able to connect to the server in replication mode (physical or logical replication) and in order to be able to create or drop replication slots. A role having the `replication` attribute is a very highly privileged role, and should only be used on roles actually used for replication. Default is `false`. */
  "replication"?: boolean
  /** Whether the role is a `superuser` who can override all access restrictions within the database - superuser status is dangerous and should be used only when really needed. You must yourself be a superuser to create a new superuser. Defaults is `false`. */
  "superuser"?: boolean
  /** Date and time after which the role's password is no longer valid. When omitted, the password will never expire (default). */
  "validUntil"?: string
}

export interface Metadata {
  /** Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. More info: http://kubernetes.io/docs/user-guide/annotations */
  "annotations"?: Record<string, unknown>
  /** Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. More info: http://kubernetes.io/docs/user-guide/labels */
  "labels"?: Record<string, unknown>
  /** The name of the resource. Only supported for certain types */
  "name"?: string
}

export interface PortsItem {
  /** The application protocol for this port. This is used as a hint for implementations to offer richer behavior for protocols that they understand. This field follows standard Kubernetes label syntax. Valid values are either: * Un-prefixed protocol names - reserved for IANA standard service names (as per RFC-6335 and https://www.iana.org/assignments/service-names). * Kubernetes-defined prefixed names:   * 'kubernetes.io/h2c' - HTTP/2 prior knowledge over cleartext as described in https://www.rfc-editor.org/rfc/rfc9113.html#name-starting-http-2-with-prior-   * 'kubernetes.io/ws'  - WebSocket over cleartext as described in https://www.rfc-editor.org/rfc/rfc6455   * 'kubernetes.io/wss' - WebSocket over TLS as described in https://www.rfc-editor.org/rfc/rfc6455 * Other protocols should use implementation-defined prefixed names such as mycompany.com/my-custom-protocol. */
  "appProtocol"?: string
  /** The name of this port within the service. This must be a DNS_LABEL. All ports within a ServiceSpec must have unique names. When considering the endpoints for a Service, this must match the 'name' field in the EndpointPort. Optional if only one ServicePort is defined on this service. */
  "name"?: string
  /** The port on each node on which this service is exposed when type is NodePort or LoadBalancer.  Usually assigned by the system. If a value is specified, in-range, and not in use it will be used, otherwise the operation will fail.  If not specified, a port will be allocated if this Service requires one.  If this field is specified when creating a Service which does not need it, creation will fail. This field will be wiped when updating a Service to no longer need it (e.g. changing type from NodePort to ClusterIP). More info: https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport */
  "nodePort"?: number
  /** The port that will be exposed by this service. */
  "port": number
  /** The IP protocol for this port. Supports "TCP", "UDP", and "SCTP". Default is TCP. */
  "protocol"?: string
  /** Number or name of the port to access on the pods targeted by the service. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. If this is a string, it will be looked up as a named port in the target Pod's container ports. If this is not specified, the value of the 'port' field is used (an identity map). This field is ignored for services with clusterIP=None, and should be omitted or set equal to the 'port' field. More info: https://kubernetes.io/docs/concepts/services-networking/service/#defining-a-service */
  "targetPort"?: number | string
}

export interface ClientIP {
  /** timeoutSeconds specifies the seconds of ClientIP type session sticky time. The value must be >0 && <=86400(for 1 day) if ServiceAffinity == "ClientIP". Default value is 10800(for 3 hours). */
  "timeoutSeconds"?: number
}

export interface SessionAffinityConfig {
  /** clientIP contains the configurations of Client IP based session affinity. */
  "clientIP"?: ClientIP
}

export interface Spec2 {
  /** allocateLoadBalancerNodePorts defines if NodePorts will be automatically allocated for services with type LoadBalancer.  Default is "true". It may be set to "false" if the cluster load-balancer does not rely on NodePorts.  If the caller requests specific NodePorts (by specifying a value), those requests will be respected, regardless of this field. This field may only be set for services with type LoadBalancer and will be cleared if the type is changed to any other type. */
  "allocateLoadBalancerNodePorts"?: boolean
  /** clusterIP is the IP address of the service and is usually assigned randomly. If an address is specified manually, is in-range (as per system configuration), and is not in use, it will be allocated to the service; otherwise creation of the service will fail. This field may not be changed through updates unless the type field is also being changed to ExternalName (which requires this field to be blank) or the type field is being changed from ExternalName (in which case this field may optionally be specified, as describe above).  Valid values are "None", empty string (""), or a valid IP address. Setting this to "None" makes a "headless service" (no virtual IP), which is useful when direct endpoint connections are preferred and proxying is not required.  Only applies to types ClusterIP, NodePort, and LoadBalancer. If this field is specified when creating a Service of type ExternalName, creation will fail. This field will be wiped when updating a Service to type ExternalName. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies */
  "clusterIP"?: string
  /** ClusterIPs is a list of IP addresses assigned to this service, and are usually assigned randomly.  If an address is specified manually, is in-range (as per system configuration), and is not in use, it will be allocated to the service; otherwise creation of the service will fail. This field may not be changed through updates unless the type field is also being changed to ExternalName (which requires this field to be empty) or the type field is being changed from ExternalName (in which case this field may optionally be specified, as describe above).  Valid values are "None", empty string (""), or a valid IP address.  Setting this to "None" makes a "headless service" (no virtual IP), which is useful when direct endpoint connections are preferred and proxying is not required.  Only applies to types ClusterIP, NodePort, and LoadBalancer. If this field is specified when creating a Service of type ExternalName, creation will fail. This field will be wiped when updating a Service to type ExternalName.  If this field is not specified, it will be initialized from the clusterIP field.  If this field is specified, clients must ensure that clusterIPs[0] and clusterIP have the same value. This field may hold a maximum of two entries (dual-stack IPs, in either order). These IPs must correspond to the values of the ipFamilies field. Both clusterIPs and ipFamilies are governed by the ipFamilyPolicy field. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies */
  "clusterIPs"?: string[]
  /** externalIPs is a list of IP addresses for which nodes in the cluster will also accept traffic for this service.  These IPs are not managed by Kubernetes.  The user is responsible for ensuring that traffic arrives at a node with this IP.  A common example is external load-balancers that are not part of the Kubernetes system. */
  "externalIPs"?: string[]
  /** externalName is the external reference that discovery mechanisms will return as an alias for this service (e.g. a DNS CNAME record). No proxying will be involved.  Must be a lowercase RFC-1123 hostname (https://tools.ietf.org/html/rfc1123) and requires `type` to be "ExternalName". */
  "externalName"?: string
  /** externalTrafficPolicy describes how nodes distribute service traffic they receive on one of the Service's "externally-facing" addresses (NodePorts, ExternalIPs, and LoadBalancer IPs). If set to "Local", the proxy will configure the service in a way that assumes that external load balancers will take care of balancing the service traffic between nodes, and so each node will deliver traffic only to the node-local endpoints of the service, without masquerading the client source IP. (Traffic mistakenly sent to a node with no endpoints will be dropped.) The default value, "Cluster", uses the standard behavior of routing to all endpoints evenly (possibly modified by topology and other features). Note that traffic sent to an External IP or LoadBalancer IP from within the cluster will always get "Cluster" semantics, but clients sending to a NodePort from within the cluster may need to take traffic policy into account when picking a node. */
  "externalTrafficPolicy"?: string
  /** healthCheckNodePort specifies the healthcheck nodePort for the service. This only applies when type is set to LoadBalancer and externalTrafficPolicy is set to Local. If a value is specified, is in-range, and is not in use, it will be used.  If not specified, a value will be automatically allocated.  External systems (e.g. load-balancers) can use this port to determine if a given node holds endpoints for this service or not.  If this field is specified when creating a Service which does not need it, creation will fail. This field will be wiped when updating a Service to no longer need it (e.g. changing type). This field cannot be updated once set. */
  "healthCheckNodePort"?: number
  /** InternalTrafficPolicy describes how nodes distribute service traffic they receive on the ClusterIP. If set to "Local", the proxy will assume that pods only want to talk to endpoints of the service on the same node as the pod, dropping the traffic if there are no local endpoints. The default value, "Cluster", uses the standard behavior of routing to all endpoints evenly (possibly modified by topology and other features). */
  "internalTrafficPolicy"?: string
  /** IPFamilies is a list of IP families (e.g. IPv4, IPv6) assigned to this service. This field is usually assigned automatically based on cluster configuration and the ipFamilyPolicy field. If this field is specified manually, the requested family is available in the cluster, and ipFamilyPolicy allows it, it will be used; otherwise creation of the service will fail. This field is conditionally mutable: it allows for adding or removing a secondary IP family, but it does not allow changing the primary IP family of the Service. Valid values are "IPv4" and "IPv6".  This field only applies to Services of types ClusterIP, NodePort, and LoadBalancer, and does apply to "headless" services. This field will be wiped when updating a Service to type ExternalName. This field may hold a maximum of two entries (dual-stack families, in either order).  These families must correspond to the values of the clusterIPs field, if specified. Both clusterIPs and ipFamilies are governed by the ipFamilyPolicy field. */
  "ipFamilies"?: string[]
  /** IPFamilyPolicy represents the dual-stack-ness requested or required by this Service. If there is no value provided, then this field will be set to SingleStack. Services can be "SingleStack" (a single IP family), "PreferDualStack" (two IP families on dual-stack configured clusters or a single IP family on single-stack clusters), or "RequireDualStack" (two IP families on dual-stack configured clusters, otherwise fail). The ipFamilies and clusterIPs fields depend on the value of this field. This field will be wiped when updating a service to type ExternalName. */
  "ipFamilyPolicy"?: string
  /** loadBalancerClass is the class of the load balancer implementation this Service belongs to. If specified, the value of this field must be a label-style identifier, with an optional prefix, e.g. "internal-vip" or "example.com/internal-vip". Unprefixed names are reserved for end-users. This field can only be set when the Service type is 'LoadBalancer'. If not set, the default load balancer implementation is used, today this is typically done through the cloud provider integration, but should apply for any default implementation. If set, it is assumed that a load balancer implementation is watching for Services with a matching class. Any default load balancer implementation (e.g. cloud providers) should ignore Services that set this field. This field can only be set when creating or updating a Service to type 'LoadBalancer'. Once set, it can not be changed. This field will be wiped when a service is updated to a non 'LoadBalancer' type. */
  "loadBalancerClass"?: string
  /** Only applies to Service Type: LoadBalancer. This feature depends on whether the underlying cloud-provider supports specifying the loadBalancerIP when a load balancer is created. This field will be ignored if the cloud-provider does not support the feature. Deprecated: This field was under-specified and its meaning varies across implementations. Using it is non-portable and it may not support dual-stack. Users are encouraged to use implementation-specific annotations when available. */
  "loadBalancerIP"?: string
  /** If specified and supported by the platform, this will restrict traffic through the cloud-provider load-balancer will be restricted to the specified client IPs. This field will be ignored if the cloud-provider does not support the feature." More info: https://kubernetes.io/docs/tasks/access-application-cluster/create-external-load-balancer/ */
  "loadBalancerSourceRanges"?: string[]
  /** The list of ports that are exposed by this service. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies */
  "ports"?: PortsItem[]
  /** publishNotReadyAddresses indicates that any agent which deals with endpoints for this Service should disregard any indications of ready/not-ready. The primary use case for setting this field is for a StatefulSet's Headless Service to propagate SRV DNS records for its Pods for the purpose of peer discovery. The Kubernetes controllers that generate Endpoints and EndpointSlice resources for Services interpret this to mean that all endpoints are considered "ready" even if the Pods themselves are not. Agents which consume only Kubernetes generated endpoints through the Endpoints or EndpointSlice resources can safely assume this behavior. */
  "publishNotReadyAddresses"?: boolean
  /** Route service traffic to pods with label keys and values matching this selector. If empty or not present, the service is assumed to have an external process managing its endpoints, which Kubernetes will not modify. Only applies to types ClusterIP, NodePort, and LoadBalancer. Ignored if type is ExternalName. More info: https://kubernetes.io/docs/concepts/services-networking/service/ */
  "selector"?: Record<string, unknown>
  /** Supports "ClientIP" and "None". Used to maintain session affinity. Enable client IP based session affinity. Must be ClientIP or None. Defaults to None. More info: https://kubernetes.io/docs/concepts/services-networking/service/#virtual-ips-and-service-proxies */
  "sessionAffinity"?: string
  /** sessionAffinityConfig contains the configurations of session affinity. */
  "sessionAffinityConfig"?: SessionAffinityConfig
  /** TrafficDistribution offers a way to express preferences for how traffic is distributed to Service endpoints. Implementations can use this field as a hint, but are not required to guarantee strict adherence. If the field is not set, the implementation will apply its default routing strategy. If set to "PreferClose", implementations should prioritize endpoints that are in the same zone. */
  "trafficDistribution"?: string
  /** type determines how the Service is exposed. Defaults to ClusterIP. Valid options are ExternalName, ClusterIP, NodePort, and LoadBalancer. "ClusterIP" allocates a cluster-internal IP address for load-balancing to endpoints. Endpoints are determined by the selector or if that is not specified, by manual construction of an Endpoints object or EndpointSlice objects. If clusterIP is "None", no virtual IP is allocated and the endpoints are published as a set of endpoints rather than a virtual IP. "NodePort" builds on ClusterIP and allocates a port on every node which routes to the same endpoints as the clusterIP. "LoadBalancer" builds on NodePort and creates an external load-balancer (if supported in the current cloud) which routes to the same endpoints as the clusterIP. "ExternalName" aliases this service to the specified externalName. Several other fields do not apply to ExternalName services. More info: https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types */
  "type"?: string
}

export interface ServiceTemplate {
  /** Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata */
  "metadata"?: Metadata
  /** Specification of the desired behavior of the service. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status */
  "spec"?: Spec2
}

export interface AdditionalItem {
  /** SelectorType specifies the type of selectors that the service will have. Valid values are "rw", "r", and "ro", representing read-write, read, and read-only services. */
  "selectorType": string
  /** ServiceTemplate is the template specification for the service. */
  "serviceTemplate": ServiceTemplate
  /** UpdateStrategy describes how the service differences should be reconciled */
  "updateStrategy"?: string
}

export interface Services {
  /** Additional is a list of additional managed services specified by the user. */
  "additional"?: AdditionalItem[]
  /** DisabledDefaultServices is a list of service types that are disabled by default. Valid values are "r", and "ro", representing read, and read-only services. */
  "disabledDefaultServices"?: string[]
}

export interface Managed {
  /** Database roles managed by the `Cluster` */
  "roles"?: RolesItem[]
  /** Services roles managed by the `Cluster` */
  "services"?: Services
}

export interface CustomQueriesConfigMapItem {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface CustomQueriesSecretItem {
  /** The key to select */
  "key": string
  /** Name of the referent. */
  "name": string
}

export interface PodMonitorMetricRelabelingsItem {
  /** action to perform based on the regex matching. `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0. Default: "Replace" */
  "action"?: string
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

export interface PodMonitorRelabelingsItem {
  /** action to perform based on the regex matching. `Uppercase` and `Lowercase` actions require Prometheus >= v2.36.0. `DropEqual` and `KeepEqual` actions require Prometheus >= v2.41.0. Default: "Replace" */
  "action"?: string
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

export interface Tls {
  /** Enable TLS for the monitoring endpoint. Changing this option will force a rollout of all instances. */
  "enabled"?: boolean
}

export interface Monitoring {
  /** The list of config maps containing the custom queries */
  "customQueriesConfigMap"?: CustomQueriesConfigMapItem[]
  /** The list of secrets containing the custom queries */
  "customQueriesSecret"?: CustomQueriesSecretItem[]
  /** Whether the default queries should be injected. Set it to `true` if you don't want to inject default queries into the cluster. Default: false. */
  "disableDefaultQueries"?: boolean
  /** Enable or disable the `PodMonitor` Deprecated: This feature will be removed in an upcoming release. If you need this functionality, you can create a PodMonitor manually. */
  "enablePodMonitor"?: boolean
  /** The list of metric relabelings for the `PodMonitor`. Applied to samples before ingestion. Deprecated: This feature will be removed in an upcoming release. If you need this functionality, you can create a PodMonitor manually. */
  "podMonitorMetricRelabelings"?: PodMonitorMetricRelabelingsItem[]
  /** The list of relabelings for the `PodMonitor`. Applied to samples before scraping. Deprecated: This feature will be removed in an upcoming release. If you need this functionality, you can create a PodMonitor manually. */
  "podMonitorRelabelings"?: PodMonitorRelabelingsItem[]
  /** Configure TLS communication for the metrics endpoint. Changing tls.enabled option will force a rollout of all instances. */
  "tls"?: Tls
}

export interface NodeMaintenanceWindow {
  /** Is there a node maintenance activity in progress? */
  "inProgress"?: boolean
  /** Reuse the existing PVC (wait for the node to come up again) or not (recreate it elsewhere - when `instances` >1) */
  "reusePVC"?: boolean
}

export interface PluginsItem {
  /** Enabled is true if this plugin will be used */
  "enabled"?: boolean
  /** Marks the plugin as the WAL archiver. At most one plugin can be designated as a WAL archiver. This cannot be enabled if the `.spec.backup.barmanObjectStore` configuration is present. */
  "isWALArchiver"?: boolean
  /** Name is the plugin name */
  "name": string
  /** Parameters is the configuration of the plugin */
  "parameters"?: Record<string, unknown>
}

export interface EnvItem2 {
  /** Name of the environment variable to be injected into the PostgreSQL process. */
  "name": string
  /** Value of the environment variable. CloudNativePG performs a direct replacement of this value, with support for placeholder expansion. The ${`image_root`} placeholder resolves to the absolute mount path of the extension's volume (e.g., `/extensions/my-extension`). This is particularly useful for allowing applications or libraries to locate specific directories within the mounted image. Unrecognized placeholders are rejected. To include a literal ${...} in the value, escape it as $${...}. */
  "value": string
}

export interface Image {
  /** Policy for pulling OCI objects. Possible values are: Always: the kubelet always attempts to pull the reference. Container creation will fail If the pull fails. Never: the kubelet never pulls the reference and only uses a local image or artifact. Container creation will fail if the reference isn't present. IfNotPresent: the kubelet pulls if the reference isn't already present on disk. Container creation will fail if the reference isn't present and the pull fails. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. */
  "pullPolicy"?: string
  /** Required: Image or artifact reference to be used. Behaves in the same way as pod.spec.containers[*].image. Pull secrets will be assembled in the same way as for the container image by looking up node credentials, SA image pull secrets, and pod spec image pull secrets. More info: https://kubernetes.io/docs/concepts/containers/images This field is optional to allow higher level config management to default or override container images in workload controllers like Deployments and StatefulSets. */
  "reference"?: string
}

export interface ExtensionsItem {
  /** A list of directories within the image to be appended to the PostgreSQL process's `PATH` environment variable. */
  "bin_path"?: string[]
  /** The list of directories inside the image which should be added to dynamic_library_path. If not defined, defaults to "/lib". */
  "dynamic_library_path"?: string[]
  /** Env is a list of custom environment variables to be set in the PostgreSQL process for this extension. It is the responsibility of the cluster administrator to ensure the variables are correct for the specific extension. Note that changes to these variables require a manual cluster restart to take effect. */
  "env"?: EnvItem2[]
  /** The list of directories inside the image which should be added to extension_control_path. If not defined, defaults to "/share". */
  "extension_control_path"?: string[]
  /** The image containing the extension. */
  "image"?: Image
  /** The list of directories inside the image which should be added to ld_library_path. */
  "ld_library_path"?: string[]
  /** The name of the extension, required */
  "name": string
}

export interface BindAsAuth {
  /** Prefix for the bind authentication option */
  "prefix"?: string
  /** Suffix for the bind authentication option */
  "suffix"?: string
}

export interface BindPassword {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface BindSearchAuth {
  /** Root DN to begin the user search */
  "baseDN"?: string
  /** DN of the user to bind to the directory */
  "bindDN"?: string
  /** Secret with the password for the user to bind to the directory */
  "bindPassword"?: BindPassword
  /** Attribute to match against the username */
  "searchAttribute"?: string
  /** Search filter to use when doing the search+bind authentication */
  "searchFilter"?: string
}

export interface Ldap {
  /** Bind as authentication configuration */
  "bindAsAuth"?: BindAsAuth
  /** Bind+Search authentication configuration */
  "bindSearchAuth"?: BindSearchAuth
  /** LDAP server port */
  "port"?: number
  /** LDAP schema to be used, possible options are `ldap` and `ldaps` */
  "scheme"?: string
  /** LDAP hostname or IP address */
  "server"?: string
  /** Set to 'true' to enable LDAP over TLS. 'false' is default */
  "tls"?: boolean
}

export interface SyncReplicaElectionConstraint {
  /** This flag enables the constraints for sync replicas */
  "enabled": boolean
  /** A list of node labels values to extract and compare to evaluate if the pods reside in the same topology or not */
  "nodeLabelsAntiAffinity"?: string[]
}

export interface Synchronous {
  /** If set to "required", data durability is strictly enforced. Write operations with synchronous commit settings (`on`, `remote_write`, or `remote_apply`) will block if there are insufficient healthy replicas, ensuring data persistence. If set to "preferred", data durability is maintained when healthy replicas are available, but the required number of instances will adjust dynamically if replicas become unavailable. This setting relaxes strict durability enforcement to allow for operational continuity. This setting is only applicable if both `standbyNamesPre` and `standbyNamesPost` are unset (empty). */
  "dataDurability"?: string
  /** Specifies the maximum number of local cluster pods that can be automatically included in the `synchronous_standby_names` option in PostgreSQL. */
  "maxStandbyNamesFromCluster"?: number
  /** Method to select synchronous replication standbys from the listed servers, accepting 'any' (quorum-based synchronous replication) or 'first' (priority-based synchronous replication) as values. */
  "method": string
  /** Specifies the number of synchronous standby servers that transactions must wait for responses from. */
  "number": number
  /** A user-defined list of application names to be added to `synchronous_standby_names` after local cluster pods (the order is only useful for priority-based synchronous replication). */
  "standbyNamesPost"?: string[]
  /** A user-defined list of application names to be added to `synchronous_standby_names` before local cluster pods (the order is only useful for priority-based synchronous replication). */
  "standbyNamesPre"?: string[]
}

export interface Postgresql {
  /** If this parameter is true, the user will be able to invoke `ALTER SYSTEM` on this CloudNativePG Cluster. This should only be used for debugging and troubleshooting. Defaults to false. */
  "enableAlterSystem"?: boolean
  /** The configuration of the extensions to be added */
  "extensions"?: ExtensionsItem[]
  /** Options to specify LDAP configuration */
  "ldap"?: Ldap
  /** PostgreSQL configuration options (postgresql.conf) */
  "parameters"?: Record<string, unknown>
  /** PostgreSQL Host Based Authentication rules (lines to be appended to the pg_hba.conf file) */
  "pg_hba"?: string[]
  /** PostgreSQL User Name Maps rules (lines to be appended to the pg_ident.conf file) */
  "pg_ident"?: string[]
  /** Specifies the maximum number of seconds to wait when promoting an instance to primary. Default value is 40000000, greater than one year in seconds, big enough to simulate an infinite timeout */
  "promotionTimeout"?: number
  /** Lists of shared preload libraries to add to the default ones */
  "shared_preload_libraries"?: string[]
  /** Requirements to be met by sync replicas. This will affect how the "synchronous_standby_names" parameter will be set up. */
  "syncReplicaElectionConstraint"?: SyncReplicaElectionConstraint
  /** Configuration of the PostgreSQL synchronous replication feature */
  "synchronous"?: Synchronous
}

export interface IsolationCheck {
  /** Timeout in milliseconds for connections during the primary isolation check */
  "connectionTimeout"?: number
  /** Whether primary isolation checking is enabled for the liveness probe */
  "enabled"?: boolean
  /** Timeout in milliseconds for requests during the primary isolation check */
  "requestTimeout"?: number
}

export interface Liveness {
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** Configure the feature that extends the liveness probe for a primary instance. In addition to the basic checks, this verifies whether the primary is isolated from the Kubernetes API server and from its replicas, ensuring that it can be safely shut down if network partition or API unavailability is detected. Enabled by default. */
  "isolationCheck"?: IsolationCheck
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
}

export interface Readiness {
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** Lag limit. Used only for `streaming` strategy */
  "maximumLag"?: number | string
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
  /** The probe strategy */
  "type"?: string
}

export interface Startup {
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** Lag limit. Used only for `streaming` strategy */
  "maximumLag"?: number | string
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
  /** The probe strategy */
  "type"?: string
}

export interface Probes {
  /** The liveness probe configuration */
  "liveness"?: Liveness
  /** The readiness probe configuration */
  "readiness"?: Readiness
  /** The startup probe configuration */
  "startup"?: Startup
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

export interface ItemsItem {
  /** key is the key to project. */
  "key": string
  /** mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "mode"?: number
  /** path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. */
  "path": string
}

export interface ConfigMap {
  /** items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** optional specify whether the ConfigMap or its keys must be defined */
  "optional"?: boolean
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
  "configMap"?: ConfigMap
  /** downwardAPI information about the downwardAPI data to project */
  "downwardAPI"?: DownwardAPI
  /** Projects an auto-rotating credential bundle (private key and certificate chain) that the pod can use either as a TLS client or server. Kubelet generates a private key and uses it to send a PodCertificateRequest to the named signer.  Once the signer approves the request and issues a certificate chain, Kubelet writes the key and certificate chain to the pod filesystem.  The pod does not start until certificates have been issued for each podCertificate projected volume source in its spec. Kubelet will begin trying to rotate the certificate at the time indicated by the signer using the PodCertificateRequest.Status.BeginRefreshAt timestamp. Kubelet can write a single file, indicated by the credentialBundlePath field, or separate files, indicated by the keyPath and certificateChainPath fields. The credential bundle is a single file in PEM format.  The first PEM entry is the private key (in PKCS#8 format), and the remaining PEM entries are the certificate chain issued by the signer (typically, signers will return their certificate chain in leaf-to-root order). Prefer using the credential bundle format, since your application code can read it atomically.  If you use keyPath and certificateChainPath, your application must make two separate file reads. If these coincide with a certificate rotation, it is possible that the private key and leaf certificate you read may not correspond to each other.  Your application will need to check for this condition, and re-read until they are consistent. The named signer controls chooses the format of the certificate it issues; consult the signer implementation's documentation to learn how to use the certificates it issues. */
  "podCertificate"?: PodCertificate
  /** secret information about the secret data to project */
  "secret"?: Secret2
  /** serviceAccountToken is information about the serviceAccountToken data to project */
  "serviceAccountToken"?: ServiceAccountToken
}

export interface ProjectedVolumeTemplate {
  /** defaultMode are the mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** sources is the list of volume projections. Each entry in this list handles one source. */
  "sources"?: SourcesItem[]
}

export interface Replica {
  /** If replica mode is enabled, this cluster will be a replica of an existing cluster. Replica cluster can be created from a recovery object store or via streaming through pg_basebackup. Refer to the Replica clusters page of the documentation for more information. */
  "enabled"?: boolean
  /** When replica mode is enabled, this parameter allows you to replay transactions only when the system time is at least the configured time past the commit time. This provides an opportunity to correct data loss errors. Note that when this parameter is set, a promotion token cannot be used. */
  "minApplyDelay"?: string
  /** Primary defines which Cluster is defined to be the primary in the distributed PostgreSQL cluster, based on the topology specified in externalClusters */
  "primary"?: string
  /** A demotion token generated by an external cluster used to check if the promotion requirements are met. */
  "promotionToken"?: string
  /** Self defines the name of this cluster. It is used to determine if this is a primary or a replica cluster, comparing it with `primary` */
  "self"?: string
  /** The name of the external cluster which is the replication origin */
  "source": string
}

export interface HighAvailability {
  /** If enabled (default), the operator will automatically manage replication slots on the primary instance and use them in streaming replication connections with all the standby instances that are part of the HA cluster. If disabled, the operator will not take advantage of replication slots in streaming connections with the replicas. This feature also controls replication slots in replica cluster, from the designated primary to its cascading replicas. */
  "enabled"?: boolean
  /** Prefix for replication slots managed by the operator for HA. It may only contain lower case letters, numbers, and the underscore character. This can only be set at creation time. By default set to `_cnpg_`. */
  "slotPrefix"?: string
  /** When enabled, the operator automatically manages synchronization of logical decoding (replication) slots across high-availability clusters. Requires one of the following conditions: - PostgreSQL version 17 or later - PostgreSQL version < 17 with pg_failover_slots extension enabled */
  "synchronizeLogicalDecoding"?: boolean
}

export interface SynchronizeReplicas {
  /** When set to true, every replication slot that is on the primary is synchronized on each standby */
  "enabled": boolean
  /** List of regular expression patterns to match the names of replication slots to be excluded (by default empty) */
  "excludePatterns"?: string[]
}

export interface ReplicationSlots {
  /** Replication slots for high availability configuration */
  "highAvailability"?: HighAvailability
  /** Configures the synchronization of the user defined physical replication slots */
  "synchronizeReplicas"?: SynchronizeReplicas
  /** Standby will update the status of the local replication slots every `updateInterval` seconds (default 30). */
  "updateInterval"?: number
}

export interface ClaimsItem {
  /** Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. */
  "name": string
  /** Request is the name chosen for a request in the referenced claim. If empty, everything from the claim is made available, otherwise only the result of this request. */
  "request"?: string
}

export interface Resources2 {
  /** Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container. This field depends on the DynamicResourceAllocation feature gate. This field is immutable. It can only be set for containers. */
  "claims"?: ClaimsItem[]
  /** Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "limits"?: Record<string, unknown>
  /** Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "requests"?: Record<string, unknown>
}

export interface SeccompProfile {
  /** localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type. */
  "localhostProfile"?: string
  /** type indicates which kind of seccomp profile will be applied. Valid options are: Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied. */
  "type": string
}

export interface ServiceAccountTemplate {
  /** Metadata are the metadata to be used for the generated service account */
  "metadata": Metadata
}

export interface PvcTemplate {
  /** accessModes contains the desired access modes the volume should have. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#access-modes-1 */
  "accessModes"?: string[]
  /** dataSource field can be used to specify either: * An existing VolumeSnapshot object (snapshot.storage.k8s.io/VolumeSnapshot) * An existing PVC (PersistentVolumeClaim) If the provisioner or an external controller can support the specified data source, it will create a new volume based on the contents of the specified data source. When the AnyVolumeDataSource feature gate is enabled, dataSource contents will be copied to dataSourceRef, and dataSourceRef contents will be copied to dataSource when dataSourceRef.namespace is not specified. If the namespace is specified, then dataSourceRef will not be copied to dataSource. */
  "dataSource"?: DataSource
  /** dataSourceRef specifies the object from which to populate the volume with data, if a non-empty volume is desired. This may be any object from a non-empty API group (non core object) or a PersistentVolumeClaim object. When this field is specified, volume binding will only succeed if the type of the specified object matches some installed volume populator or dynamic provisioner. This field will replace the functionality of the dataSource field and as such if both fields are non-empty, they must have the same value. For backwards compatibility, when namespace isn't specified in dataSourceRef, both fields (dataSource and dataSourceRef) will be set to the same value automatically if one of them is empty and the other is non-empty. When namespace is specified in dataSourceRef, dataSource isn't set to the same value and must be empty. There are three important differences between dataSource and dataSourceRef: * While dataSource only allows two specific types of objects, dataSourceRef   allows any non-core object, as well as PersistentVolumeClaim objects. * While dataSource ignores disallowed values (dropping them), dataSourceRef   preserves all values, and generates an error if a disallowed value is   specified. * While dataSource only allows local objects, dataSourceRef allows objects   in any namespaces. (Beta) Using this field requires the AnyVolumeDataSource feature gate to be enabled. (Alpha) Using the namespace field of dataSourceRef requires the CrossNamespaceVolumeDataSource feature gate to be enabled. */
  "dataSourceRef"?: DataSourceRef
  /** resources represents the minimum resources the volume should have. Users are allowed to specify resource requirements that are lower than previous value but must still be higher than capacity recorded in the status field of the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#resources */
  "resources"?: Resources
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

export interface Storage2 {
  /** Template to be used to generate the Persistent Volume Claim */
  "pvcTemplate"?: PvcTemplate
  /** Resize existent PVCs, defaults to true */
  "resizeInUseVolumes"?: boolean
  /** Size of the storage. Required if not already specified in the PVC template. Changes to this field are automatically reapplied to the created PVCs. Size cannot be decreased. */
  "size"?: string
  /** StorageClass to use for PVCs. Applied after evaluating the PVC template, if available. If not specified, the generated PVCs will use the default storage class */
  "storageClass"?: string
}

export interface SuperuserSecret {
  /** Name of the referent. */
  "name": string
}

export interface Owner {
  "name"?: string
}

export interface TablespacesItem {
  /** The name of the tablespace */
  "name": string
  /** Owner is the PostgreSQL user owning the tablespace */
  "owner"?: Owner
  /** The storage configuration for the tablespace */
  "storage": Storage2
  /** When set to true, the tablespace will be added as a `temp_tablespaces` entry in PostgreSQL, and will be available to automatically house temp database objects, or other temporary files. Please refer to PostgreSQL documentation for more information on the `temp_tablespaces` GUC. */
  "temporary"?: boolean
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

export interface WalStorage2 {
  /** Template to be used to generate the Persistent Volume Claim */
  "pvcTemplate"?: PvcTemplate
  /** Resize existent PVCs, defaults to true */
  "resizeInUseVolumes"?: boolean
  /** Size of the storage. Required if not already specified in the PVC template. Changes to this field are automatically reapplied to the created PVCs. Size cannot be decreased. */
  "size"?: string
  /** StorageClass to use for PVCs. Applied after evaluating the PVC template, if available. If not specified, the generated PVCs will use the default storage class */
  "storageClass"?: string
}

export interface ClusterSpec {
  /** Affinity/Anti-affinity rules for Pods */
  "affinity"?: Affinity
  /** The configuration to be used for backups */
  "backup"?: Backup
  /** Instructions to bootstrap this cluster */
  "bootstrap"?: Bootstrap
  /** The configuration for the CA and related certificates */
  "certificates"?: Certificates
  /** Description of this PostgreSQL cluster */
  "description"?: string
  /** Manage the `PodDisruptionBudget` resources within the cluster. When configured as `true` (default setting), the pod disruption budgets will safeguard the primary node from being terminated. Conversely, setting it to `false` will result in the absence of any `PodDisruptionBudget` resource, permitting the shutdown of all nodes hosting the PostgreSQL cluster. This latter configuration is advisable for any PostgreSQL cluster employed for development/staging purposes. */
  "enablePDB"?: boolean
  /** When this option is enabled, the operator will use the `SuperuserSecret` to update the `postgres` user password (if the secret is not present, the operator will automatically create one). When this option is disabled, the operator will ignore the `SuperuserSecret` content, delete it when automatically created, and then blank the password of the `postgres` user by setting it to `NULL`. Disabled by default. */
  "enableSuperuserAccess"?: boolean
  /** Env follows the Env format to pass environment variables to the pods created in the cluster */
  "env"?: EnvItem[]
  /** EnvFrom follows the EnvFrom format to pass environment variables sources to the pods to be used by Env */
  "envFrom"?: EnvFromItem[]
  /** EphemeralVolumeSource allows the user to configure the source of ephemeral volumes. */
  "ephemeralVolumeSource"?: EphemeralVolumeSource
  /** EphemeralVolumesSizeLimit allows the user to set the limits for the ephemeral volumes */
  "ephemeralVolumesSizeLimit"?: EphemeralVolumesSizeLimit
  /** The list of external clusters which are used in the configuration */
  "externalClusters"?: ExternalClustersItem[]
  /** The amount of time (in seconds) to wait before triggering a failover after the primary PostgreSQL instance in the cluster was detected to be unhealthy */
  "failoverDelay"?: number
  /** Defines the major PostgreSQL version we want to use within an ImageCatalog */
  "imageCatalogRef"?: ImageCatalogRef
  /** Name of the container image, supporting both tags (`<image>:<tag>`) and digests for deterministic and repeatable deployments (`<image>:<tag>@sha256:<digestValue>`) */
  "imageName"?: string
  /** Image pull policy. One of `Always`, `Never` or `IfNotPresent`. If not defined, it defaults to `IfNotPresent`. Cannot be updated. More info: https://kubernetes.io/docs/concepts/containers/images#updating-images */
  "imagePullPolicy"?: string
  /** The list of pull secrets to be used to pull the images */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** Metadata that will be inherited by all objects related to the Cluster */
  "inheritedMetadata"?: InheritedMetadata
  /** Number of instances required in the cluster */
  "instances": number
  /** LivenessProbeTimeout is the time (in seconds) that is allowed for a PostgreSQL instance to successfully respond to the liveness probe (default 30). The Liveness probe failure threshold is derived from this value using the formula: ceiling(livenessProbe / 10). */
  "livenessProbeTimeout"?: number
  /** The instances' log level, one of the following values: error, warning, info (default), debug, trace */
  "logLevel"?: string
  /** The configuration that is used by the portions of PostgreSQL that are managed by the instance manager */
  "managed"?: Managed
  /** The target value for the synchronous replication quorum, that can be decreased if the number of ready standbys is lower than this. Undefined or 0 disable synchronous replication. */
  "maxSyncReplicas"?: number
  /** Minimum number of instances required in synchronous replication with the primary. Undefined or 0 allow writes to complete when no standby is available. */
  "minSyncReplicas"?: number
  /** The configuration of the monitoring infrastructure of this cluster */
  "monitoring"?: Monitoring
  /** Define a maintenance window for the Kubernetes nodes */
  "nodeMaintenanceWindow"?: NodeMaintenanceWindow
  /** The plugins configuration, containing any plugin to be loaded with the corresponding configuration */
  "plugins"?: PluginsItem[]
  /** The GID of the `postgres` user inside the image, defaults to `26` */
  "postgresGID"?: number
  /** The UID of the `postgres` user inside the image, defaults to `26` */
  "postgresUID"?: number
  /** Configuration of the PostgreSQL server */
  "postgresql"?: Postgresql
  /** Method to follow to upgrade the primary server during a rolling update procedure, after all replicas have been successfully updated: it can be with a switchover (`switchover`) or in-place (`restart` - default) */
  "primaryUpdateMethod"?: string
  /** Deployment strategy to follow to upgrade the primary server during a rolling update procedure, after all replicas have been successfully updated: it can be automated (`unsupervised` - default) or manual (`supervised`) */
  "primaryUpdateStrategy"?: string
  /** Name of the priority class which will be used in every generated Pod, if the PriorityClass specified does not exist, the pod will not be able to schedule.  Please refer to https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/#priorityclass for more information */
  "priorityClassName"?: string
  /** The configuration of the probes to be injected in the PostgreSQL Pods. */
  "probes"?: Probes
  /** Template to be used to define projected volumes, projected volumes will be mounted under `/projected` base folder */
  "projectedVolumeTemplate"?: ProjectedVolumeTemplate
  /** Replica cluster configuration */
  "replica"?: Replica
  /** Replication slots management configuration */
  "replicationSlots"?: ReplicationSlots
  /** Resources requirements of every generated Pod. Please refer to https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ for more information. */
  "resources"?: Resources2
  /** If specified, the pod will be dispatched by specified Kubernetes scheduler. If not specified, the pod will be dispatched by the default scheduler. More info: https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/ */
  "schedulerName"?: string
  /** The SeccompProfile applied to every Pod and Container. Defaults to: `RuntimeDefault` */
  "seccompProfile"?: SeccompProfile
  /** Configure the generation of the service account */
  "serviceAccountTemplate"?: ServiceAccountTemplate
  /** The time in seconds that controls the window of time reserved for the smart shutdown of Postgres to complete. Make sure you reserve enough time for the operator to request a fast shutdown of Postgres (that is: `stopDelay` - `smartShutdownTimeout`). Default is 180 seconds. */
  "smartShutdownTimeout"?: number
  /** The time in seconds that is allowed for a PostgreSQL instance to successfully start up (default 3600). The startup probe failure threshold is derived from this value using the formula: ceiling(startDelay / 10). */
  "startDelay"?: number
  /** The time in seconds that is allowed for a PostgreSQL instance to gracefully shutdown (default 1800) */
  "stopDelay"?: number
  /** Configuration of the storage of the instances */
  "storage"?: Storage2
  /** The secret containing the superuser password. If not defined a new secret will be created with a randomly generated password */
  "superuserSecret"?: SuperuserSecret
  /** The time in seconds that is allowed for a primary PostgreSQL instance to gracefully shutdown during a switchover. Default value is 3600 seconds (1 hour). */
  "switchoverDelay"?: number
  /** The tablespaces configuration */
  "tablespaces"?: TablespacesItem[]
  /** TopologySpreadConstraints specifies how to spread matching pods among the given topology. More info: https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/ */
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  /** Configuration of the storage for PostgreSQL WAL (Write-Ahead Log) */
  "walStorage"?: WalStorage2
}

export interface AvailableArchitecturesItem {
  /** GoArch is the name of the executable architecture */
  "goArch": string
  /** Hash is the hash of the executable */
  "hash": string
}

export interface Certificates2 {
  /** The secret containing the Client CA certificate. If not defined, a new secret will be created with a self-signed CA and will be used to generate all the client certificates.<br /> <br /> Contains:<br /> <br /> - `ca.crt`: CA that should be used to validate the client certificates, used as `ssl_ca_file` of all the instances.<br /> - `ca.key`: key used to generate client certificates, if ReplicationTLSSecret is provided, this can be omitted.<br /> */
  "clientCASecret"?: string
  /** Expiration dates for all certificates. */
  "expirations"?: Record<string, unknown>
  /** The secret of type kubernetes.io/tls containing the client certificate to authenticate as the `streaming_replica` user. If not defined, ClientCASecret must provide also `ca.key`, and a new secret will be created using the provided CA. */
  "replicationTLSSecret"?: string
  /** The list of the server alternative DNS names to be added to the generated server TLS certificates, when required. */
  "serverAltDNSNames"?: string[]
  /** The secret containing the Server CA certificate. If not defined, a new secret will be created with a self-signed CA and will be used to generate the TLS certificate ServerTLSSecret.<br /> <br /> Contains:<br /> <br /> - `ca.crt`: CA that should be used to validate the server certificate, used as `sslrootcert` in client connection strings.<br /> - `ca.key`: key used to generate Server SSL certs, if ServerTLSSecret is provided, this can be omitted.<br /> */
  "serverCASecret"?: string
  /** The secret of type kubernetes.io/tls containing the server TLS certificate and key that will be set as `ssl_cert_file` and `ssl_key_file` so that clients can connect to postgres securely. If not defined, ServerCASecret must provide also `ca.key` and a new secret will be created using the provided CA. */
  "serverTLSSecret"?: string
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

export interface ConfigMapResourceVersion {
  /** A map with the versions of all the config maps used to pass metrics. Map keys are the config map names, map values are the versions */
  "metrics"?: Record<string, unknown>
}

export interface ManagedRolesStatus {
  /** ByStatus gives the list of roles in each state */
  "byStatus"?: Record<string, unknown>
  /** CannotReconcile lists roles that cannot be reconciled in PostgreSQL, with an explanation of the cause */
  "cannotReconcile"?: Record<string, unknown>
  /** PasswordStatus gives the last transaction id and password secret version for each managed role */
  "passwordStatus"?: Record<string, unknown>
}

export interface PgDataImageInfo {
  /** Image is the image name */
  "image": string
  /** MajorVersion is the major version of the image */
  "majorVersion": number
}

export interface PluginStatusItem {
  /** BackupCapabilities are the list of capabilities of the plugin regarding the Backup management */
  "backupCapabilities"?: string[]
  /** Capabilities are the list of capabilities of the plugin */
  "capabilities"?: string[]
  /** Name is the name of the plugin */
  "name": string
  /** OperatorCapabilities are the list of capabilities of the plugin regarding the reconciler */
  "operatorCapabilities"?: string[]
  /** RestoreJobHookCapabilities are the list of capabilities of the plugin regarding the RestoreJobHook management */
  "restoreJobHookCapabilities"?: string[]
  /** Status contain the status reported by the plugin through the SetStatusInCluster interface */
  "status"?: string
  /** Version is the version of the plugin loaded by the latest reconciliation loop */
  "version": string
  /** WALCapabilities are the list of capabilities of the plugin regarding the WAL management */
  "walCapabilities"?: string[]
}

export interface PgBouncerIntegration {
  "secrets"?: string[]
}

export interface PoolerIntegrations {
  /** PgBouncerIntegrationStatus encapsulates the needed integration for the pgbouncer poolers referencing the cluster */
  "pgBouncerIntegration"?: PgBouncerIntegration
}

export interface SecretsResourceVersion {
  /** The resource version of the "app" user secret */
  "applicationSecretVersion"?: string
  /** The resource version of the Barman Endpoint CA if provided */
  "barmanEndpointCA"?: string
  /** Unused. Retained for compatibility with old versions. */
  "caSecretVersion"?: string
  /** The resource version of the PostgreSQL client-side CA secret version */
  "clientCaSecretVersion"?: string
  /** The resource versions of the external cluster secrets */
  "externalClusterSecretVersion"?: Record<string, unknown>
  /** The resource versions of the managed roles secrets */
  "managedRoleSecretVersion"?: Record<string, unknown>
  /** A map with the versions of all the secrets used to pass metrics. Map keys are the secret names, map values are the versions */
  "metrics"?: Record<string, unknown>
  /** The resource version of the "streaming_replica" user secret */
  "replicationSecretVersion"?: string
  /** The resource version of the PostgreSQL server-side CA secret version */
  "serverCaSecretVersion"?: string
  /** The resource version of the PostgreSQL server-side secret version */
  "serverSecretVersion"?: string
  /** The resource version of the "postgres" user secret */
  "superuserSecretVersion"?: string
}

export interface SwitchReplicaClusterStatus {
  /** InProgress indicates if there is an ongoing procedure of switching a cluster to a replica cluster. */
  "inProgress"?: boolean
}

export interface TablespacesStatusItem {
  /** Error is the reconciliation error, if any */
  "error"?: string
  /** Name is the name of the tablespace */
  "name": string
  /** Owner is the PostgreSQL user owning the tablespace */
  "owner"?: string
  /** State is the latest reconciliation state */
  "state": string
}

export interface Topology {
  /** Instances contains the pod topology of the instances */
  "instances"?: Record<string, unknown>
  /** NodesUsed represents the count of distinct nodes accommodating the instances. A value of '1' suggests that all instances are hosted on a single node, implying the absence of High Availability (HA). Ideally, this value should be the same as the number of instances in the Postgres HA cluster, implying shared nothing architecture on the compute side. */
  "nodesUsed"?: number
  /** SuccessfullyExtracted indicates if the topology data was extract. It is useful to enact fallback behaviors in synchronous replica election in case of failures */
  "successfullyExtracted"?: boolean
}

export interface ClusterStatus {
  /** AvailableArchitectures reports the available architectures of a cluster */
  "availableArchitectures"?: AvailableArchitecturesItem[]
  /** The configuration for the CA and related certificates, initialized with defaults. */
  "certificates"?: Certificates2
  /** The commit hash number of which this operator running */
  "cloudNativePGCommitHash"?: string
  /** The hash of the binary of the operator */
  "cloudNativePGOperatorHash"?: string
  /** Conditions for cluster object */
  "conditions"?: ConditionsItem[]
  /** The list of resource versions of the configmaps, managed by the operator. Every change here is done in the interest of the instance manager, which will refresh the configmap data */
  "configMapResourceVersion"?: ConfigMapResourceVersion
  /** Current primary instance */
  "currentPrimary"?: string
  /** The timestamp when the primary was detected to be unhealthy This field is reported when `.spec.failoverDelay` is populated or during online upgrades */
  "currentPrimaryFailingSinceTimestamp"?: string
  /** The timestamp when the last actual promotion to primary has occurred */
  "currentPrimaryTimestamp"?: string
  /** List of all the PVCs created by this cluster and still available which are not attached to a Pod */
  "danglingPVC"?: string[]
  /** DemotionToken is a JSON token containing the information from pg_controldata such as Database system identifier, Latest checkpoint's TimeLineID, Latest checkpoint's REDO location, Latest checkpoint's REDO WAL file, and Time of latest checkpoint */
  "demotionToken"?: string
  /** The first recoverability point, stored as a date in RFC3339 format. This field is calculated from the content of FirstRecoverabilityPointByMethod. Deprecated: the field is not set for backup plugins. */
  "firstRecoverabilityPoint"?: string
  /** The first recoverability point, stored as a date in RFC3339 format, per backup method type. Deprecated: the field is not set for backup plugins. */
  "firstRecoverabilityPointByMethod"?: Record<string, unknown>
  /** List of all the PVCs not dangling nor initializing */
  "healthyPVC"?: string[]
  /** Image contains the image name used by the pods */
  "image"?: string
  /** List of all the PVCs that are being initialized by this cluster */
  "initializingPVC"?: string[]
  /** List of instance names in the cluster */
  "instanceNames"?: string[]
  /** The total number of PVC Groups detected in the cluster. It may differ from the number of existing instance pods. */
  "instances"?: number
  /** The reported state of the instances during the last reconciliation loop */
  "instancesReportedState"?: Record<string, unknown>
  /** InstancesStatus indicates in which status the instances are */
  "instancesStatus"?: Record<string, unknown>
  /** How many Jobs have been created by this cluster */
  "jobCount"?: number
  /** Last failed backup, stored as a date in RFC3339 format. Deprecated: the field is not set for backup plugins. */
  "lastFailedBackup"?: string
  /** LastPromotionToken is the last verified promotion token that was used to promote a replica cluster */
  "lastPromotionToken"?: string
  /** Last successful backup, stored as a date in RFC3339 format. This field is calculated from the content of LastSuccessfulBackupByMethod. Deprecated: the field is not set for backup plugins. */
  "lastSuccessfulBackup"?: string
  /** Last successful backup, stored as a date in RFC3339 format, per backup method type. Deprecated: the field is not set for backup plugins. */
  "lastSuccessfulBackupByMethod"?: Record<string, unknown>
  /** ID of the latest generated node (used to avoid node name clashing) */
  "latestGeneratedNode"?: number
  /** ManagedRolesStatus reports the state of the managed roles in the cluster */
  "managedRolesStatus"?: ManagedRolesStatus
  /** OnlineUpdateEnabled shows if the online upgrade is enabled inside the cluster */
  "onlineUpdateEnabled"?: boolean
  /** PGDataImageInfo contains the details of the latest image that has run on the current data directory. */
  "pgDataImageInfo"?: PgDataImageInfo
  /** Current phase of the cluster */
  "phase"?: string
  /** Reason for the current phase */
  "phaseReason"?: string
  /** PluginStatus is the status of the loaded plugins */
  "pluginStatus"?: PluginStatusItem[]
  /** The integration needed by poolers referencing the cluster */
  "poolerIntegrations"?: PoolerIntegrations
  /** How many PVCs have been created by this cluster */
  "pvcCount"?: number
  /** Current list of read pods */
  "readService"?: string
  /** The total number of ready instances in the cluster. It is equal to the number of ready instance pods. */
  "readyInstances"?: number
  /** List of all the PVCs that have ResizingPVC condition. */
  "resizingPVC"?: string[]
  /** The list of resource versions of the secrets managed by the operator. Every change here is done in the interest of the instance manager, which will refresh the secret data */
  "secretsResourceVersion"?: SecretsResourceVersion
  /** SwitchReplicaClusterStatus is the status of the switch to replica cluster */
  "switchReplicaClusterStatus"?: SwitchReplicaClusterStatus
  /** SystemID is the latest detected PostgreSQL SystemID */
  "systemID"?: string
  /** TablespacesStatus reports the state of the declarative tablespaces in the cluster */
  "tablespacesStatus"?: TablespacesStatusItem[]
  /** Target primary instance, this is different from the previous one during a switchover or a failover */
  "targetPrimary"?: string
  /** The timestamp when the last request for a new primary has occurred */
  "targetPrimaryTimestamp"?: string
  /** The timeline of the Postgres cluster */
  "timelineID"?: number
  /** Instances topology. */
  "topology"?: Topology
  /** List of all the PVCs that are unusable because another PVC is missing */
  "unusablePVC"?: string[]
  /** Current write pod */
  "writeService"?: string
}

export interface Cluster2 {
  /** Name of the referent. */
  "name": string
}

export interface RollingUpdate {
  /** The maximum number of pods that can be scheduled above the desired number of pods. Value can be an absolute number (ex: 5) or a percentage of desired pods (ex: 10%). This can not be 0 if MaxUnavailable is 0. Absolute number is calculated from percentage by rounding up. Defaults to 25%. Example: when this is set to 30%, the new ReplicaSet can be scaled up immediately when the rolling update starts, such that the total number of old and new pods do not exceed 130% of desired pods. Once old pods have been killed, new ReplicaSet can be scaled up further, ensuring that total number of pods running at any time during the update is at most 130% of desired pods. */
  "maxSurge"?: number | string
  /** The maximum number of pods that can be unavailable during the update. Value can be an absolute number (ex: 5) or a percentage of desired pods (ex: 10%). Absolute number is calculated from percentage by rounding down. This can not be 0 if MaxSurge is 0. Defaults to 25%. Example: when this is set to 30%, the old ReplicaSet can be scaled down to 70% of desired pods immediately when the rolling update starts. Once new pods are ready, old ReplicaSet can be scaled down further, followed by scaling up the new ReplicaSet, ensuring that the total number of pods available at all times during the update is at least 70% of desired pods. */
  "maxUnavailable"?: number | string
}

export interface DeploymentStrategy {
  /** Rolling update config params. Present only if DeploymentStrategyType = RollingUpdate. */
  "rollingUpdate"?: RollingUpdate
  /** Type of deployment. Can be "Recreate" or "RollingUpdate". Default is RollingUpdate. */
  "type"?: string
}

export interface Monitoring2 {
  /** Enable or disable the `PodMonitor` */
  "enablePodMonitor"?: boolean
  /** The list of metric relabelings for the `PodMonitor`. Applied to samples before ingestion. */
  "podMonitorMetricRelabelings"?: PodMonitorMetricRelabelingsItem[]
  /** The list of relabelings for the `PodMonitor`. Applied to samples before scraping. */
  "podMonitorRelabelings"?: PodMonitorRelabelingsItem[]
}

export interface AuthQuerySecret {
  /** Name of the referent. */
  "name": string
}

export interface Pgbouncer {
  /** The query that will be used to download the hash of the password of a certain user. Default: "SELECT usename, passwd FROM public.user_search($1)". In case it is specified, also an AuthQuerySecret has to be specified and no automatic CNPG Cluster integration will be triggered. */
  "authQuery"?: string
  /** The credentials of the user that need to be used for the authentication query. In case it is specified, also an AuthQuery (e.g. "SELECT usename, passwd FROM pg_catalog.pg_shadow WHERE usename=$1") has to be specified and no automatic CNPG Cluster integration will be triggered. */
  "authQuerySecret"?: AuthQuerySecret
  /** Additional parameters to be passed to PgBouncer - please check the CNPG documentation for a list of options you can configure */
  "parameters"?: Record<string, unknown>
  /** When set to `true`, PgBouncer will disconnect from the PostgreSQL server, first waiting for all queries to complete, and pause all new client connections until this value is set to `false` (default). Internally, the operator calls PgBouncer's `PAUSE` and `RESUME` commands. */
  "paused"?: boolean
  /** PostgreSQL Host Based Authentication rules (lines to be appended to the pg_hba.conf file) */
  "pg_hba"?: string[]
  /** The pool mode. Default: `session`. */
  "poolMode"?: string
}

export interface PodAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  /** If the affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface PodAntiAffinity {
  /** The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and subtracting "weight" from the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
  "preferredDuringSchedulingIgnoredDuringExecution"?: PreferredDuringSchedulingIgnoredDuringExecutionItem[]
  /** If the anti-affinity requirements specified by this field are not met at scheduling time, the pod will not be scheduled onto the node. If the anti-affinity requirements specified by this field cease to be met at some point during pod execution (e.g. due to a pod label update), the system may or may not try to eventually evict the pod from its node. When there are multiple elements, the lists of nodes corresponding to each podAffinityTerm are intersected, i.e. all terms must be satisfied. */
  "requiredDuringSchedulingIgnoredDuringExecution"?: RequiredDuringSchedulingIgnoredDuringExecutionItem[]
}

export interface Affinity2 {
  /** Describes node affinity scheduling rules for the pod. */
  "nodeAffinity"?: NodeAffinity
  /** Describes pod affinity scheduling rules (e.g. co-locate this pod in the same node, zone, etc. as some other pod(s)). */
  "podAffinity"?: PodAffinity
  /** Describes pod anti-affinity scheduling rules (e.g. avoid putting this pod in the same node, zone, etc. as some other pod(s)). */
  "podAntiAffinity"?: PodAntiAffinity
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

export interface PortsItem2 {
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
  /** procMount denotes the type of proc mount to use for the containers. The default value is Default which uses the container runtime defaults for readonly paths and masked paths. This requires the ProcMountType feature flag to be enabled. Note that this field cannot be set when spec.os.name is windows. */
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
  "ports"?: PortsItem2[]
  /** Periodic probe of container service readiness. Container will be removed from service endpoints if the probe fails. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "readinessProbe"?: ReadinessProbe
  /** Resources resize policy for the container. This field cannot be set on ephemeral containers. */
  "resizePolicy"?: ResizePolicyItem[]
  /** Compute Resources required by this container. Cannot be updated. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "resources"?: Resources2
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
  /** Name is this DNS resolver option's name. Required. */
  "name"?: string
  /** Value is this DNS resolver option's value. */
  "value"?: string
}

export interface DnsConfig {
  /** A list of DNS name server IP addresses. This will be appended to the base nameservers generated from DNSPolicy. Duplicated nameservers will be removed. */
  "nameservers"?: string[]
  /** A list of DNS resolver options. This will be merged with the base options generated from DNSPolicy. Duplicated entries will be removed. Resolution options given in Options will override those that appear in the base DNSPolicy. */
  "options"?: OptionsItem[]
  /** A list of DNS search domains for host-name lookup. This will be appended to the base search paths generated from DNSPolicy. Duplicated search paths will be removed. */
  "searches"?: string[]
}

export interface EphemeralContainersItem {
  /** Arguments to the entrypoint. The image's CMD is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell */
  "args"?: string[]
  /** Entrypoint array. Not executed within a shell. The image's ENTRYPOINT is used if this is not provided. Variable references $(VAR_NAME) are expanded using the container's environment. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Cannot be updated. More info: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/#running-a-command-in-a-shell */
  "command"?: string[]
  /** List of environment variables to set in the container. Cannot be updated. */
  "env"?: EnvItem[]
  /** List of sources to populate environment variables in the container. The keys defined within a source may consist of any printable ASCII characters except '='. When a key exists in multiple sources, the value associated with the last source will take precedence. Values defined by an Env with a duplicate key will take precedence. Cannot be updated. */
  "envFrom"?: EnvFromItem[]
  /** Container image name. More info: https://kubernetes.io/docs/concepts/containers/images */
  "image"?: string
  /** Image pull policy. One of Always, Never, IfNotPresent. Defaults to Always if :latest tag is specified, or IfNotPresent otherwise. Cannot be updated. More info: https://kubernetes.io/docs/concepts/containers/images#updating-images */
  "imagePullPolicy"?: string
  /** Lifecycle is not allowed for ephemeral containers. */
  "lifecycle"?: Lifecycle
  /** Probes are not allowed for ephemeral containers. */
  "livenessProbe"?: LivenessProbe
  /** Name of the ephemeral container specified as a DNS_LABEL. This name must be unique among all containers, init containers and ephemeral containers. */
  "name": string
  /** Ports are not allowed for ephemeral containers. */
  "ports"?: PortsItem2[]
  /** Probes are not allowed for ephemeral containers. */
  "readinessProbe"?: ReadinessProbe
  /** Resources resize policy for the container. */
  "resizePolicy"?: ResizePolicyItem[]
  /** Resources are not allowed for ephemeral containers. Ephemeral containers use spare resources already allocated to the pod. */
  "resources"?: Resources2
  /** Restart policy for the container to manage the restart behavior of each container within a pod. You cannot set this field on ephemeral containers. */
  "restartPolicy"?: string
  /** Represents a list of rules to be checked to determine if the container should be restarted on exit. You cannot set this field on ephemeral containers. */
  "restartPolicyRules"?: RestartPolicyRulesItem[]
  /** Optional: SecurityContext defines the security options the ephemeral container should be run with. If set, the fields of SecurityContext override the equivalent fields of PodSecurityContext. */
  "securityContext"?: SecurityContext
  /** Probes are not allowed for ephemeral containers. */
  "startupProbe"?: StartupProbe
  /** Whether this container should allocate a buffer for stdin in the container runtime. If this is not set, reads from stdin in the container will always result in EOF. Default is false. */
  "stdin"?: boolean
  /** Whether the container runtime should close the stdin channel after it has been opened by a single attach. When stdin is true the stdin stream will remain open across multiple attach sessions. If stdinOnce is set to true, stdin is opened on container start, is empty until the first client attaches to stdin, and then remains open and accepts data until the client disconnects, at which time stdin is closed and remains closed until the container is restarted. If this flag is false, a container processes that reads from stdin will never receive an EOF. Default is false */
  "stdinOnce"?: boolean
  /** If set, the name of the container from PodSpec that this ephemeral container targets. The ephemeral container will be run in the namespaces (IPC, PID, etc) of this container. If not set then the ephemeral container uses the namespaces configured in the Pod spec. The container runtime must implement support for this feature. If the runtime does not support namespace targeting then the result of setting this field is undefined. */
  "targetContainerName"?: string
  /** Optional: Path at which the file to which the container's termination message will be written is mounted into the container's filesystem. Message written is intended to be brief final status, such as an assertion failure message. Will be truncated by the node if greater than 4096 bytes. The total message length across all containers will be limited to 12kb. Defaults to /dev/termination-log. Cannot be updated. */
  "terminationMessagePath"?: string
  /** Indicate how the termination message should be populated. File will use the contents of terminationMessagePath to populate the container status message on both success and failure. FallbackToLogsOnError will use the last chunk of container log output if the termination message file is empty and the container exited with an error. The log output is limited to 2048 bytes or 80 lines, whichever is smaller. Defaults to File. Cannot be updated. */
  "terminationMessagePolicy"?: string
  /** Whether this container should allocate a TTY for itself, also requires 'stdin' to be true. Default is false. */
  "tty"?: boolean
  /** volumeDevices is the list of block devices to be used by the container. */
  "volumeDevices"?: VolumeDevicesItem[]
  /** Pod volumes to mount into the container's filesystem. Subpath mounts are not allowed for ephemeral containers. Cannot be updated. */
  "volumeMounts"?: VolumeMountsItem[]
  /** Container's working directory. If not specified, the container runtime's default will be used, which might be configured in the container image. Cannot be updated. */
  "workingDir"?: string
}

export interface HostAliasesItem {
  /** Hostnames for the above IP address. */
  "hostnames"?: string[]
  /** IP address of the host file entry. */
  "ip": string
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
  "ports"?: PortsItem2[]
  /** Periodic probe of container service readiness. Container will be removed from service endpoints if the probe fails. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "readinessProbe"?: ReadinessProbe
  /** Resources resize policy for the container. This field cannot be set on ephemeral containers. */
  "resizePolicy"?: ResizePolicyItem[]
  /** Compute Resources required by this container. Cannot be updated. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "resources"?: Resources2
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

export interface Os {
  /** Name is the name of the operating system. The currently supported values are linux and windows. Additional value may be defined in future and can be one of: https://github.com/opencontainers/runtime-spec/blob/master/config.md#platform-specific-configuration Clients should expect to handle additional values and treat unrecognized values in this field as os: null */
  "name": string
}

export interface ReadinessGatesItem {
  /** ConditionType refers to a condition in the pod's condition list with matching type. */
  "conditionType": string
}

export interface ResourceClaimsItem {
  /** Name uniquely identifies this resource claim inside the pod. This must be a DNS_LABEL. */
  "name": string
  /** ResourceClaimName is the name of a ResourceClaim object in the same namespace as this pod. Exactly one of ResourceClaimName and ResourceClaimTemplateName must be set. */
  "resourceClaimName"?: string
  /** ResourceClaimTemplateName is the name of a ResourceClaimTemplate object in the same namespace as this pod. The template will be used to create a new ResourceClaim, which will be bound to this pod. When this pod is deleted, the ResourceClaim will also be deleted. The pod name and resource name, along with a generated component, will be used to form a unique name for the ResourceClaim, which will be recorded in pod.status.resourceClaimStatuses. This field is immutable and no changes will be made to the corresponding ResourceClaim by the control plane after creating the ResourceClaim. Exactly one of ResourceClaimName and ResourceClaimTemplateName must be set. */
  "resourceClaimTemplateName"?: string
}

export interface SchedulingGatesItem {
  /** Name of the scheduling gate. Each scheduling gate must have a unique name field. */
  "name": string
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

export interface DownwardAPI2 {
  /** Optional: mode bits to use on created files by default. Must be a Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** Items is a list of downward API volume file */
  "items"?: ItemsItem2[]
}

export interface EmptyDir {
  /** medium represents what type of storage medium should back this directory. The default is "" which means to use the node's default medium. Must be an empty string (default) or Memory. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "medium"?: string
  /** sizeLimit is the total amount of local storage required for this EmptyDir volume. The size limit is also applicable for memory medium. The maximum usage on memory medium EmptyDir would be the minimum value between the SizeLimit specified here and the sum of memory limits of all containers in a pod. The default is nil which means that the limit is undefined. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "sizeLimit"?: number | string
}

export interface Ephemeral {
  /** Will be used to create a stand-alone PVC to provision the volume. The pod in which this EphemeralVolumeSource is embedded will be the owner of the PVC, i.e. the PVC will be deleted together with the pod.  The name of the PVC will be `<pod name>-<volume name>` where `<volume name>` is the name from the `PodSpec.Volumes` array entry. Pod validation will reject the pod if the concatenated name is not valid for a PVC (for example, too long). An existing PVC with that name that is not owned by the pod will *not* be used for the pod to avoid using an unrelated volume by mistake. Starting the pod is then blocked until the unrelated PVC is removed. If such a pre-created PVC is meant to be used by the pod, the PVC has to updated with an owner reference to the pod once the pod exists. Normally this should not be necessary, but it may be useful when manually reconstructing a broken cluster. This field is read-only and no changes will be made by Kubernetes to the PVC after it has been created. Required, must not be nil. */
  "volumeClaimTemplate"?: VolumeClaimTemplate
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
  "downwardAPI"?: DownwardAPI2
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
  /** image represents an OCI object (a container image or artifact) pulled and mounted on the kubelet's host machine. The volume is resolved at pod startup depending on which PullPolicy value is provided: - Always: the kubelet always attempts to pull the reference. Container creation will fail If the pull fails. - Never: the kubelet never pulls the reference and only uses a local image or artifact. Container creation will fail if the reference isn't present. - IfNotPresent: the kubelet pulls if the reference isn't already present on disk. Container creation will fail if the reference isn't present and the pull fails. The volume gets re-resolved if the pod gets deleted and recreated, which means that new remote content will become available on pod recreation. A failure to resolve or pull the image during pod startup will block containers from starting and may add significant latency. Failures will be retried using normal volume backoff and will be reported on the pod reason and message. The types of objects that may be mounted by this volume are defined by the container runtime implementation on a host machine and at minimum must include all valid types supported by the container image field. The OCI object gets mounted in a single directory (spec.containers[*].volumeMounts.mountPath) by merging the manifest layers in the same way as for container images. The volume will be mounted read-only (ro) and non-executable files (noexec). Sub path mounts for containers are not supported (spec.containers[*].volumeMounts.subpath) before 1.33. The field spec.securityContext.fsGroupChangePolicy has no effect on this volume type. */
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
  /** portworxVolume represents a portworx volume attached and mounted on kubelets host machine. Deprecated: PortworxVolume is deprecated. All operations for the in-tree portworxVolume type are redirected to the pxd.portworx.com CSI driver when the CSIMigrationPortworx feature-gate is on. */
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

export interface WorkloadRef {
  /** Name defines the name of the Workload object this Pod belongs to. Workload must be in the same namespace as the Pod. If it doesn't match any existing Workload, the Pod will remain unschedulable until a Workload object is created and observed by the kube-scheduler. It must be a DNS subdomain. */
  "name": string
  /** PodGroup is the name of the PodGroup within the Workload that this Pod belongs to. If it doesn't match any existing PodGroup within the Workload, the Pod will remain unschedulable until the Workload object is recreated and observed by the kube-scheduler. It must be a DNS label. */
  "podGroup": string
  /** PodGroupReplicaKey specifies the replica key of the PodGroup to which this Pod belongs. It is used to distinguish pods belonging to different replicas of the same pod group. The pod group policy is applied separately to each replica. When set, it must be a DNS label. */
  "podGroupReplicaKey"?: string
}

export interface Spec3 {
  /** Optional duration in seconds the pod may be active on the node relative to StartTime before the system will actively try to mark it failed and kill associated containers. Value must be a positive integer. */
  "activeDeadlineSeconds"?: number
  /** If specified, the pod's scheduling constraints */
  "affinity"?: Affinity2
  /** AutomountServiceAccountToken indicates whether a service account token should be automatically mounted. */
  "automountServiceAccountToken"?: boolean
  /** List of containers belonging to the pod. Containers cannot currently be added or removed. There must be at least one container in a Pod. Cannot be updated. */
  "containers": ContainersItem[]
  /** Specifies the DNS parameters of a pod. Parameters specified here will be merged to the generated DNS configuration based on DNSPolicy. */
  "dnsConfig"?: DnsConfig
  /** Set DNS policy for the pod. Defaults to "ClusterFirst". Valid values are 'ClusterFirstWithHostNet', 'ClusterFirst', 'Default' or 'None'. DNS parameters given in DNSConfig will be merged with the policy selected with DNSPolicy. To have DNS options set along with hostNetwork, you have to specify DNS policy explicitly to 'ClusterFirstWithHostNet'. */
  "dnsPolicy"?: string
  /** EnableServiceLinks indicates whether information about services should be injected into pod's environment variables, matching the syntax of Docker links. Optional: Defaults to true. */
  "enableServiceLinks"?: boolean
  /** List of ephemeral containers run in this pod. Ephemeral containers may be run in an existing pod to perform user-initiated actions such as debugging. This list cannot be specified when creating a pod, and it cannot be modified by updating the pod spec. In order to add an ephemeral container to an existing pod, use the pod's ephemeralcontainers subresource. */
  "ephemeralContainers"?: EphemeralContainersItem[]
  /** HostAliases is an optional list of hosts and IPs that will be injected into the pod's hosts file if specified. */
  "hostAliases"?: HostAliasesItem[]
  /** Use the host's ipc namespace. Optional: Default to false. */
  "hostIPC"?: boolean
  /** Host networking requested for this pod. Use the host's network namespace. When using HostNetwork you should specify ports so the scheduler is aware. When `hostNetwork` is true, specified `hostPort` fields in port definitions must match `containerPort`, and unspecified `hostPort` fields in port definitions are defaulted to match `containerPort`. Default to false. */
  "hostNetwork"?: boolean
  /** Use the host's pid namespace. Optional: Default to false. */
  "hostPID"?: boolean
  /** Use the host's user namespace. Optional: Default to true. If set to true or not present, the pod will be run in the host user namespace, useful for when the pod needs a feature only available to the host user namespace, such as loading a kernel module with CAP_SYS_MODULE. When set to false, a new userns is created for the pod. Setting false is useful for mitigating container breakout vulnerabilities even allowing users to run their containers as root without actually having root privileges on the host. This field is alpha-level and is only honored by servers that enable the UserNamespacesSupport feature. */
  "hostUsers"?: boolean
  /** Specifies the hostname of the Pod If not specified, the pod's hostname will be set to a system-defined value. */
  "hostname"?: string
  /** HostnameOverride specifies an explicit override for the pod's hostname as perceived by the pod. This field only specifies the pod's hostname and does not affect its DNS records. When this field is set to a non-empty string: - It takes precedence over the values set in `hostname` and `subdomain`. - The Pod's hostname will be set to this value. - `setHostnameAsFQDN` must be nil or set to false. - `hostNetwork` must be set to false. This field must be a valid DNS subdomain as defined in RFC 1123 and contain at most 64 characters. Requires the HostnameOverride feature gate to be enabled. */
  "hostnameOverride"?: string
  /** ImagePullSecrets is an optional list of references to secrets in the same namespace to use for pulling any of the images used by this PodSpec. If specified, these secrets will be passed to individual puller implementations for them to use. More info: https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** List of initialization containers belonging to the pod. Init containers are executed in order prior to containers being started. If any init container fails, the pod is considered to have failed and is handled according to its restartPolicy. The name for an init container or normal container must be unique among all containers. Init containers may not have Lifecycle actions, Readiness probes, Liveness probes, or Startup probes. The resourceRequirements of an init container are taken into account during scheduling by finding the highest request/limit for each resource type, and then using the max of that value or the sum of the normal containers. Limits are applied to init containers in a similar fashion. Init containers cannot currently be added or removed. Cannot be updated. More info: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ */
  "initContainers"?: InitContainersItem[]
  /** NodeName indicates in which node this pod is scheduled. If empty, this pod is a candidate for scheduling by the scheduler defined in schedulerName. Once this field is set, the kubelet for this node becomes responsible for the lifecycle of this pod. This field should not be used to express a desire for the pod to be scheduled on a specific node. https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename */
  "nodeName"?: string
  /** NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ */
  "nodeSelector"?: Record<string, unknown>
  /** Specifies the OS of the containers in the pod. Some pod and container fields are restricted if this is set. If the OS field is set to linux, the following fields must be unset: -securityContext.windowsOptions If the OS field is set to windows, following fields must be unset: - spec.hostPID - spec.hostIPC - spec.hostUsers - spec.resources - spec.securityContext.appArmorProfile - spec.securityContext.seLinuxOptions - spec.securityContext.seccompProfile - spec.securityContext.fsGroup - spec.securityContext.fsGroupChangePolicy - spec.securityContext.sysctls - spec.shareProcessNamespace - spec.securityContext.runAsUser - spec.securityContext.runAsGroup - spec.securityContext.supplementalGroups - spec.securityContext.supplementalGroupsPolicy - spec.containers[*].securityContext.appArmorProfile - spec.containers[*].securityContext.seLinuxOptions - spec.containers[*].securityContext.seccompProfile - spec.containers[*].securityContext.capabilities - spec.containers[*].securityContext.readOnlyRootFilesystem - spec.containers[*].securityContext.privileged - spec.containers[*].securityContext.allowPrivilegeEscalation - spec.containers[*].securityContext.procMount - spec.containers[*].securityContext.runAsUser - spec.containers[*].securityContext.runAsGroup */
  "os"?: Os
  /** Overhead represents the resource overhead associated with running a pod for a given RuntimeClass. This field will be autopopulated at admission time by the RuntimeClass admission controller. If the RuntimeClass admission controller is enabled, overhead must not be set in Pod create requests. The RuntimeClass admission controller will reject Pod create requests which have the overhead already set. If RuntimeClass is configured and selected in the PodSpec, Overhead will be set to the value defined in the corresponding RuntimeClass, otherwise it will remain unset and treated as zero. More info: https://git.k8s.io/enhancements/keps/sig-node/688-pod-overhead/README.md */
  "overhead"?: Record<string, unknown>
  /** PreemptionPolicy is the Policy for preempting pods with lower priority. One of Never, PreemptLowerPriority. Defaults to PreemptLowerPriority if unset. */
  "preemptionPolicy"?: string
  /** The priority value. Various system components use this field to find the priority of the pod. When Priority Admission Controller is enabled, it prevents users from setting this field. The admission controller populates this field from PriorityClassName. The higher the value, the higher the priority. */
  "priority"?: number
  /** If specified, indicates the pod's priority. "system-node-critical" and "system-cluster-critical" are two special keywords which indicate the highest priorities with the former being the highest priority. Any other name must be defined by creating a PriorityClass object with that name. If not specified, the pod priority will be default or zero if there is no default. */
  "priorityClassName"?: string
  /** If specified, all readiness gates will be evaluated for pod readiness. A pod is ready when all its containers are ready AND all conditions specified in the readiness gates have status equal to "True" More info: https://git.k8s.io/enhancements/keps/sig-network/580-pod-readiness-gates */
  "readinessGates"?: ReadinessGatesItem[]
  /** ResourceClaims defines which ResourceClaims must be allocated and reserved before the Pod is allowed to start. The resources will be made available to those containers which consume them by name. This is a stable field but requires that the DynamicResourceAllocation feature gate is enabled. This field is immutable. */
  "resourceClaims"?: ResourceClaimsItem[]
  /** Resources is the total amount of CPU and Memory resources required by all containers in the pod. It supports specifying Requests and Limits for "cpu", "memory" and "hugepages-" resource names only. ResourceClaims are not supported. This field enables fine-grained control over resource allocation for the entire pod, allowing resource sharing among containers in a pod. This is an alpha field and requires enabling the PodLevelResources feature gate. */
  "resources"?: Resources2
  /** Restart policy for all containers within the pod. One of Always, OnFailure, Never. In some contexts, only a subset of those values may be permitted. Default to Always. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#restart-policy */
  "restartPolicy"?: string
  /** RuntimeClassName refers to a RuntimeClass object in the node.k8s.io group, which should be used to run this pod.  If no RuntimeClass resource matches the named class, the pod will not be run. If unset or empty, the "legacy" RuntimeClass will be used, which is an implicit class with an empty definition that uses the default runtime handler. More info: https://git.k8s.io/enhancements/keps/sig-node/585-runtime-class */
  "runtimeClassName"?: string
  /** If specified, the pod will be dispatched by specified scheduler. If not specified, the pod will be dispatched by default scheduler. */
  "schedulerName"?: string
  /** SchedulingGates is an opaque list of values that if specified will block scheduling the pod. If schedulingGates is not empty, the pod will stay in the SchedulingGated state and the scheduler will not attempt to schedule the pod. SchedulingGates can only be set at pod creation time, and be removed only afterwards. */
  "schedulingGates"?: SchedulingGatesItem[]
  /** SecurityContext holds pod-level security attributes and common container settings. Optional: Defaults to empty.  See type description for default values of each field. */
  "securityContext"?: SecurityContext2
  /** DeprecatedServiceAccount is a deprecated alias for ServiceAccountName. Deprecated: Use serviceAccountName instead. */
  "serviceAccount"?: string
  /** ServiceAccountName is the name of the ServiceAccount to use to run this pod. More info: https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/ */
  "serviceAccountName"?: string
  /** If true the pod's hostname will be configured as the pod's FQDN, rather than the leaf name (the default). In Linux containers, this means setting the FQDN in the hostname field of the kernel (the nodename field of struct utsname). In Windows containers, this means setting the registry value of hostname for the registry key HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters to FQDN. If a pod does not have FQDN, this has no effect. Default to false. */
  "setHostnameAsFQDN"?: boolean
  /** Share a single process namespace between all of the containers in a pod. When this is set containers will be able to view and signal processes from other containers in the same pod, and the first process in each container will not be assigned PID 1. HostPID and ShareProcessNamespace cannot both be set. Optional: Default to false. */
  "shareProcessNamespace"?: boolean
  /** If specified, the fully qualified Pod hostname will be "<hostname>.<subdomain>.<pod namespace>.svc.<cluster domain>". If not specified, the pod will not have a domainname at all. */
  "subdomain"?: string
  /** Optional duration in seconds the pod needs to terminate gracefully. May be decreased in delete request. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). If this value is nil, the default grace period will be used instead. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. Defaults to 30 seconds. */
  "terminationGracePeriodSeconds"?: number
  /** If specified, the pod's tolerations. */
  "tolerations"?: TolerationsItem[]
  /** TopologySpreadConstraints describes how a group of pods ought to spread across topology domains. Scheduler will schedule pods in a way which abides by the constraints. All topologySpreadConstraints are ANDed. */
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  /** List of volumes that can be mounted by containers belonging to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes */
  "volumes"?: VolumesItem[]
  /** WorkloadRef provides a reference to the Workload object that this Pod belongs to. This field is used by the scheduler to identify the PodGroup and apply the correct group scheduling policies. The Workload object referenced by this field may not exist at the time the Pod is created. This field is immutable, but a Workload object with the same name may be recreated with different policies. Doing this during pod scheduling may result in the placement not conforming to the expected policies. */
  "workloadRef"?: WorkloadRef
}

export interface Template {
  /** Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata */
  "metadata"?: Metadata
  /** Specification of the desired behavior of the pod. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status */
  "spec"?: Spec3
}

export interface PoolerSpec {
  /** This is the cluster reference on which the Pooler will work. Pooler name should never match with any cluster name within the same namespace. */
  "cluster": Cluster2
  /** The deployment strategy to use for pgbouncer to replace existing pods with new ones */
  "deploymentStrategy"?: DeploymentStrategy
  /** The number of replicas we want. Default: 1. */
  "instances"?: number
  /** The configuration of the monitoring infrastructure of this pooler. Deprecated: This feature will be removed in an upcoming release. If you need this functionality, you can create a PodMonitor manually. */
  "monitoring"?: Monitoring2
  /** The PgBouncer configuration */
  "pgbouncer": Pgbouncer
  /** Template for the Service to be created */
  "serviceTemplate"?: ServiceTemplate
  /** The template of the Pod to be created */
  "template"?: Template
  /** Type of service to forward traffic to. Default: `rw`. */
  "type"?: string
}

export interface ClientCA {
  /** The name of the secret */
  "name"?: string
  /** The ResourceVersion of the secret */
  "version"?: string
}

export interface AuthQuery {
  /** The name of the secret */
  "name"?: string
  /** The ResourceVersion of the secret */
  "version"?: string
}

export interface PgBouncerSecrets {
  /** The auth query secret version */
  "authQuery"?: AuthQuery
}

export interface ServerCA {
  /** The name of the secret */
  "name"?: string
  /** The ResourceVersion of the secret */
  "version"?: string
}

export interface ServerTLS {
  /** The name of the secret */
  "name"?: string
  /** The ResourceVersion of the secret */
  "version"?: string
}

export interface Secrets {
  /** The client CA secret version */
  "clientCA"?: ClientCA
  /** The version of the secrets used by PgBouncer */
  "pgBouncerSecrets"?: PgBouncerSecrets
  /** The server CA secret version */
  "serverCA"?: ServerCA
  /** The server TLS secret version */
  "serverTLS"?: ServerTLS
}

export interface PoolerStatus {
  /** The number of pods trying to be scheduled */
  "instances"?: number
  /** The resource version of the config object */
  "secrets"?: Secrets
}

export interface PluginConfiguration {
  /** Name is the name of the plugin managing this backup */
  "name": string
  /** Parameters are the configuration parameters passed to the backup plugin for this backup */
  "parameters"?: Record<string, unknown>
}

export interface ScheduledBackupSpec {
  /** Indicates which ownerReference should be put inside the created backup resources.<br /> - none: no owner reference for created backup objects (same behavior as before the field was introduced)<br /> - self: sets the Scheduled backup object as owner of the backup<br /> - cluster: set the cluster as owner of the backup<br /> */
  "backupOwnerReference"?: string
  /** The cluster to backup */
  "cluster": Cluster2
  /** If the first backup has to be immediately start after creation or not */
  "immediate"?: boolean
  /** The backup method to be used, possible options are `barmanObjectStore`, `volumeSnapshot` or `plugin`. Defaults to: `barmanObjectStore`. */
  "method"?: string
  /** Whether the default type of backup with volume snapshots is online/hot (`true`, default) or offline/cold (`false`) Overrides the default setting specified in the cluster field '.spec.backup.volumeSnapshot.online' */
  "online"?: boolean
  /** Configuration parameters to control the online/hot backup with volume snapshots Overrides the default settings specified in the cluster '.backup.volumeSnapshot.onlineConfiguration' stanza */
  "onlineConfiguration"?: OnlineConfiguration
  /** Configuration parameters passed to the plugin managing this backup */
  "pluginConfiguration"?: PluginConfiguration
  /** The schedule does not follow the same format used in Kubernetes CronJobs as it includes an additional seconds specifier, see https://pkg.go.dev/github.com/robfig/cron#hdr-CRON_Expression_Format */
  "schedule": string
  /** If this backup is suspended or not */
  "suspend"?: boolean
  /** The policy to decide which instance should perform this backup. If empty, it defaults to `cluster.spec.backup.target`. Available options are empty string, `primary` and `prefer-standby`. `primary` to have backups run always on primary instances, `prefer-standby` to have backups run preferably on the most updated standby, if available. */
  "target"?: string
}

export interface ScheduledBackupStatus {
  /** The latest time the schedule */
  "lastCheckTime"?: string
  /** Information when was the last time that backup was successfully scheduled. */
  "lastScheduleTime"?: string
  /** Next time we will run a backup */
  "nextScheduleTime"?: string
}
