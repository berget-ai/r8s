/**
 * GENERATED from velero CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface Backup {
  apiVersion: 'velero.io/v1'
  kind: 'Backup'
  metadata: ObjectMeta
  spec: BackupSpec
  status?: BackupStatus
}

/** Props for the {@link Backup} component — a 1:1 mapping of the velero.io/v1 CRD. */
export interface BackupProps {
  metadata: ObjectMeta
  spec: BackupSpec
}

/** Render a Backup (velero.io/v1) exactly as defined by its CRD. */
export function BackupComponent(props: BackupProps) {
  return jsx('Backup', {
    apiVersion: 'velero.io/v1',
    kind: 'Backup',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface BackupStorageLocation {
  apiVersion: 'velero.io/v1'
  kind: 'BackupStorageLocation'
  metadata: ObjectMeta
  spec: BackupStorageLocationSpec
  status?: BackupStorageLocationStatus
}

/** Props for the {@link BackupStorageLocation} component — a 1:1 mapping of the velero.io/v1 CRD. */
export interface BackupStorageLocationProps {
  metadata: ObjectMeta
  spec: BackupStorageLocationSpec
}

/** Render a BackupStorageLocation (velero.io/v1) exactly as defined by its CRD. */
export function BackupStorageLocationComponent(props: BackupStorageLocationProps) {
  return jsx('BackupStorageLocation', {
    apiVersion: 'velero.io/v1',
    kind: 'BackupStorageLocation',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Schedule {
  apiVersion: 'velero.io/v1'
  kind: 'Schedule'
  metadata: ObjectMeta
  spec: ScheduleSpec
  status?: ScheduleStatus
}

/** Props for the {@link Schedule} component — a 1:1 mapping of the velero.io/v1 CRD. */
export interface ScheduleProps {
  metadata: ObjectMeta
  spec: ScheduleSpec
}

/** Render a Schedule (velero.io/v1) exactly as defined by its CRD. */
export function ScheduleComponent(props: ScheduleProps) {
  return jsx('Schedule', {
    apiVersion: 'velero.io/v1',
    kind: 'Schedule',
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

export interface Exec {
  /** Command is the command and arguments to execute. */
  "command": string[]
  /** Container is the container in the pod where the command should be executed. If not specified, the pod's first container is used. */
  "container"?: string
  /** OnError specifies how Velero should behave if it encounters an error executing this hook. */
  "onError"?: string
  /** Timeout defines the maximum amount of time Velero should wait for the hook to complete before considering the execution a failure. */
  "timeout"?: string
}

export interface PostItem {
  /** Exec defines an exec hook. */
  "exec": Exec
}

export interface PreItem {
  /** Exec defines an exec hook. */
  "exec": Exec
}

export interface ResourcesItem {
  /** ExcludedNamespaces specifies the namespaces to which this hook spec does not apply. */
  "excludedNamespaces"?: string[] | null
  /** ExcludedResources specifies the resources to which this hook spec does not apply. */
  "excludedResources"?: string[] | null
  /** IncludedNamespaces specifies the namespaces to which this hook spec applies. If empty, it applies to all namespaces. */
  "includedNamespaces"?: string[] | null
  /** IncludedResources specifies the resources to which this hook spec applies. If empty, it applies to all resources. */
  "includedResources"?: string[] | null
  /** LabelSelector, if specified, filters the resources to which this hook spec applies. */
  "labelSelector"?: LabelSelector | null
  /** Name is the name of this hook. */
  "name": string
  /** PostHooks is a list of BackupResourceHooks to execute after storing the item in the backup. These are executed after all "additional items" from item actions are processed. */
  "post"?: PostItem[]
  /** PreHooks is a list of BackupResourceHooks to execute prior to storing the item in the backup. These are executed before any "additional items" from item actions are processed. */
  "pre"?: PreItem[]
}

export interface Hooks {
  /** Resources are hooks that should be executed when backing up individual instances of a resource. */
  "resources"?: ResourcesItem[] | null
}

export interface Metadata {
  "labels"?: Record<string, unknown>
}

export interface OrLabelSelectorsItem {
  /** matchExpressions is a list of label selector requirements. The requirements are ANDed. */
  "matchExpressions"?: MatchExpressionsItem[]
  /** matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed. */
  "matchLabels"?: Record<string, unknown>
}

export interface ResourcePolicy {
  /** APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required. */
  "apiGroup"?: string
  /** Kind is the type of resource being referenced */
  "kind": string
  /** Name is the name of resource being referenced */
  "name": string
}

export interface UploaderConfig {
  /** ParallelFilesUpload is the number of files parallel uploads to perform when using the uploader. */
  "parallelFilesUpload"?: number
}

export interface BackupSpec {
  /** CSISnapshotTimeout specifies the time used to wait for CSI VolumeSnapshot status turns to ReadyToUse during creation, before returning error as timeout. The default value is 10 minute. */
  "csiSnapshotTimeout"?: string
  /** DataMover specifies the data mover to be used by the backup. If DataMover is "" or "velero", the built-in data mover will be used. */
  "datamover"?: string
  /** DefaultVolumesToFsBackup specifies whether pod volume file system backup should be used for all volumes by default. */
  "defaultVolumesToFsBackup"?: boolean | null
  /** DefaultVolumesToRestic specifies whether restic should be used to take a backup of all pod volumes by default.   Deprecated: this field is no longer used and will be removed entirely in future. Use DefaultVolumesToFsBackup instead. */
  "defaultVolumesToRestic"?: boolean | null
  /** ExcludedClusterScopedResources is a slice of cluster-scoped resource type names to exclude from the backup. If set to "*", all cluster-scoped resource types are excluded. The default value is empty. */
  "excludedClusterScopedResources"?: string[] | null
  /** ExcludedNamespaceScopedResources is a slice of namespace-scoped resource type names to exclude from the backup. If set to "*", all namespace-scoped resource types are excluded. The default value is empty. */
  "excludedNamespaceScopedResources"?: string[] | null
  /** ExcludedNamespaces contains a list of namespaces that are not included in the backup. */
  "excludedNamespaces"?: string[] | null
  /** ExcludedResources is a slice of resource names that are not included in the backup. */
  "excludedResources"?: string[] | null
  /** Hooks represent custom behaviors that should be executed at different phases of the backup. */
  "hooks"?: Hooks
  /** IncludeClusterResources specifies whether cluster-scoped resources should be included for consideration in the backup. */
  "includeClusterResources"?: boolean | null
  /** IncludedClusterScopedResources is a slice of cluster-scoped resource type names to include in the backup. If set to "*", all cluster-scoped resource types are included. The default value is empty, which means only related cluster-scoped resources are included. */
  "includedClusterScopedResources"?: string[] | null
  /** IncludedNamespaceScopedResources is a slice of namespace-scoped resource type names to include in the backup. The default value is "*". */
  "includedNamespaceScopedResources"?: string[] | null
  /** IncludedNamespaces is a slice of namespace names to include objects from. If empty, all namespaces are included. */
  "includedNamespaces"?: string[] | null
  /** IncludedResources is a slice of resource names to include in the backup. If empty, all resources are included. */
  "includedResources"?: string[] | null
  /** ItemOperationTimeout specifies the time used to wait for asynchronous BackupItemAction operations The default value is 1 hour. */
  "itemOperationTimeout"?: string
  /** LabelSelector is a metav1.LabelSelector to filter with when adding individual objects to the backup. If empty or nil, all objects are included. Optional. */
  "labelSelector"?: LabelSelector | null
  "metadata"?: Metadata
  /** OrLabelSelectors is list of metav1.LabelSelector to filter with when adding individual objects to the backup. If multiple provided they will be joined by the OR operator. LabelSelector as well as OrLabelSelectors cannot co-exist in backup request, only one of them can be used. */
  "orLabelSelectors"?: OrLabelSelectorsItem[] | null
  /** OrderedResources specifies the backup order of resources of specific Kind. The map key is the resource name and value is a list of object names separated by commas. Each resource name has format "namespace/objectname".  For cluster resources, simply use "objectname". */
  "orderedResources"?: Record<string, unknown> | null
  /** ResourcePolicy specifies the referenced resource policies that backup should follow */
  "resourcePolicy"?: ResourcePolicy
  /** SnapshotMoveData specifies whether snapshot data should be moved */
  "snapshotMoveData"?: boolean | null
  /** SnapshotVolumes specifies whether to take snapshots of any PV's referenced in the set of objects included in the Backup. */
  "snapshotVolumes"?: boolean | null
  /** StorageLocation is a string containing the name of a BackupStorageLocation where the backup should be stored. */
  "storageLocation"?: string
  /** TTL is a time.Duration-parseable string describing how long the Backup should be retained for. */
  "ttl"?: string
  /** UploaderConfig specifies the configuration for the uploader. */
  "uploaderConfig"?: UploaderConfig | null
  /** VolumeSnapshotLocations is a list containing names of VolumeSnapshotLocations associated with this backup. */
  "volumeSnapshotLocations"?: string[]
}

export interface HookStatus {
  /** HooksAttempted is the total number of attempted hooks Specifically, HooksAttempted represents the number of hooks that failed to execute and the number of hooks that executed successfully. */
  "hooksAttempted"?: number
  /** HooksFailed is the total number of hooks which ended with an error */
  "hooksFailed"?: number
}

export interface Progress {
  /** ItemsBackedUp is the number of items that have actually been written to the backup tarball so far. */
  "itemsBackedUp"?: number
  /** TotalItems is the total number of items to be backed up. This number may change throughout the execution of the backup due to plugins that return additional related items to back up, the velero.io/exclude-from-backup label, and various other filters that happen as items are processed. */
  "totalItems"?: number
}

export interface BackupStatus {
  /** BackupItemOperationsAttempted is the total number of attempted async BackupItemAction operations for this backup. */
  "backupItemOperationsAttempted"?: number
  /** BackupItemOperationsCompleted is the total number of successfully completed async BackupItemAction operations for this backup. */
  "backupItemOperationsCompleted"?: number
  /** BackupItemOperationsFailed is the total number of async BackupItemAction operations for this backup which ended with an error. */
  "backupItemOperationsFailed"?: number
  /** CompletionTimestamp records the time a backup was completed. Completion time is recorded even on failed backups. Completion time is recorded before uploading the backup object. The server's time is used for CompletionTimestamps */
  "completionTimestamp"?: string | null
  /** CSIVolumeSnapshotsAttempted is the total number of attempted CSI VolumeSnapshots for this backup. */
  "csiVolumeSnapshotsAttempted"?: number
  /** CSIVolumeSnapshotsCompleted is the total number of successfully completed CSI VolumeSnapshots for this backup. */
  "csiVolumeSnapshotsCompleted"?: number
  /** Errors is a count of all error messages that were generated during execution of the backup.  The actual errors are in the backup's log file in object storage. */
  "errors"?: number
  /** Expiration is when this Backup is eligible for garbage-collection. */
  "expiration"?: string | null
  /** FailureReason is an error that caused the entire backup to fail. */
  "failureReason"?: string
  /** FormatVersion is the backup format version, including major, minor, and patch version. */
  "formatVersion"?: string
  /** HookStatus contains information about the status of the hooks. */
  "hookStatus"?: HookStatus | null
  /** Phase is the current state of the Backup. */
  "phase"?: string
  /** Progress contains information about the backup's execution progress. Note that this information is best-effort only -- if Velero fails to update it during a backup for any reason, it may be inaccurate/stale. */
  "progress"?: Progress | null
  /** StartTimestamp records the time a backup was started. Separate from CreationTimestamp, since that value changes on restores. The server's time is used for StartTimestamps */
  "startTimestamp"?: string | null
  /** ValidationErrors is a slice of all validation errors (if applicable). */
  "validationErrors"?: string[] | null
  /** Version is the backup format major version. Deprecated: Please see FormatVersion */
  "version"?: number
  /** VolumeSnapshotsAttempted is the total number of attempted volume snapshots for this backup. */
  "volumeSnapshotsAttempted"?: number
  /** VolumeSnapshotsCompleted is the total number of successfully completed volume snapshots for this backup. */
  "volumeSnapshotsCompleted"?: number
  /** Warnings is a count of all warning messages that were generated during execution of the backup. The actual warnings are in the backup's log file in object storage. */
  "warnings"?: number
}

export interface Credential {
  /** The key of the secret to select from.  Must be a valid secret key. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid? */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ObjectStorage {
  /** Bucket is the bucket to use for object storage. */
  "bucket": string
  /** CACert defines a CA bundle to use when verifying TLS connections to the provider. */
  "caCert"?: string
  /** Prefix is the path inside a bucket to use for Velero storage. Optional. */
  "prefix"?: string
}

export interface BackupStorageLocationSpec {
  /** AccessMode defines the permissions for the backup storage location. */
  "accessMode"?: string
  /** BackupSyncPeriod defines how frequently to sync backup API objects from object storage. A value of 0 disables sync. */
  "backupSyncPeriod"?: string | null
  /** Config is for provider-specific configuration fields. */
  "config"?: Record<string, unknown>
  /** Credential contains the credential information intended to be used with this location */
  "credential"?: Credential
  /** Default indicates this location is the default backup storage location. */
  "default"?: boolean
  /** ObjectStorageLocation specifies the settings necessary to connect to a provider's object storage. */
  "objectStorage": ObjectStorage
  /** Provider is the provider of the backup storage. */
  "provider": string
  /** ValidationFrequency defines how frequently to validate the corresponding object storage. A value of 0 disables validation. */
  "validationFrequency"?: string | null
}

export interface BackupStorageLocationStatus {
  /** AccessMode is an unused field.   Deprecated: there is now an AccessMode field on the Spec and this field will be removed entirely as of v2.0. */
  "accessMode"?: string
  /** LastSyncedRevision is the value of the `metadata/revision` file in the backup storage location the last time the BSL's contents were synced into the cluster.   Deprecated: this field is no longer updated or used for detecting changes to the location's contents and will be removed entirely in v2.0. */
  "lastSyncedRevision"?: string
  /** LastSyncedTime is the last time the contents of the location were synced into the cluster. */
  "lastSyncedTime"?: string | null
  /** LastValidationTime is the last time the backup store location was validated the cluster. */
  "lastValidationTime"?: string | null
  /** Message is a message about the backup storage location's status. */
  "message"?: string
  /** Phase is the current state of the BackupStorageLocation. */
  "phase"?: string
}

export interface Template {
  /** CSISnapshotTimeout specifies the time used to wait for CSI VolumeSnapshot status turns to ReadyToUse during creation, before returning error as timeout. The default value is 10 minute. */
  "csiSnapshotTimeout"?: string
  /** DataMover specifies the data mover to be used by the backup. If DataMover is "" or "velero", the built-in data mover will be used. */
  "datamover"?: string
  /** DefaultVolumesToFsBackup specifies whether pod volume file system backup should be used for all volumes by default. */
  "defaultVolumesToFsBackup"?: boolean | null
  /** DefaultVolumesToRestic specifies whether restic should be used to take a backup of all pod volumes by default.   Deprecated: this field is no longer used and will be removed entirely in future. Use DefaultVolumesToFsBackup instead. */
  "defaultVolumesToRestic"?: boolean | null
  /** ExcludedClusterScopedResources is a slice of cluster-scoped resource type names to exclude from the backup. If set to "*", all cluster-scoped resource types are excluded. The default value is empty. */
  "excludedClusterScopedResources"?: string[] | null
  /** ExcludedNamespaceScopedResources is a slice of namespace-scoped resource type names to exclude from the backup. If set to "*", all namespace-scoped resource types are excluded. The default value is empty. */
  "excludedNamespaceScopedResources"?: string[] | null
  /** ExcludedNamespaces contains a list of namespaces that are not included in the backup. */
  "excludedNamespaces"?: string[] | null
  /** ExcludedResources is a slice of resource names that are not included in the backup. */
  "excludedResources"?: string[] | null
  /** Hooks represent custom behaviors that should be executed at different phases of the backup. */
  "hooks"?: Hooks
  /** IncludeClusterResources specifies whether cluster-scoped resources should be included for consideration in the backup. */
  "includeClusterResources"?: boolean | null
  /** IncludedClusterScopedResources is a slice of cluster-scoped resource type names to include in the backup. If set to "*", all cluster-scoped resource types are included. The default value is empty, which means only related cluster-scoped resources are included. */
  "includedClusterScopedResources"?: string[] | null
  /** IncludedNamespaceScopedResources is a slice of namespace-scoped resource type names to include in the backup. The default value is "*". */
  "includedNamespaceScopedResources"?: string[] | null
  /** IncludedNamespaces is a slice of namespace names to include objects from. If empty, all namespaces are included. */
  "includedNamespaces"?: string[] | null
  /** IncludedResources is a slice of resource names to include in the backup. If empty, all resources are included. */
  "includedResources"?: string[] | null
  /** ItemOperationTimeout specifies the time used to wait for asynchronous BackupItemAction operations The default value is 1 hour. */
  "itemOperationTimeout"?: string
  /** LabelSelector is a metav1.LabelSelector to filter with when adding individual objects to the backup. If empty or nil, all objects are included. Optional. */
  "labelSelector"?: LabelSelector | null
  "metadata"?: Metadata
  /** OrLabelSelectors is list of metav1.LabelSelector to filter with when adding individual objects to the backup. If multiple provided they will be joined by the OR operator. LabelSelector as well as OrLabelSelectors cannot co-exist in backup request, only one of them can be used. */
  "orLabelSelectors"?: OrLabelSelectorsItem[] | null
  /** OrderedResources specifies the backup order of resources of specific Kind. The map key is the resource name and value is a list of object names separated by commas. Each resource name has format "namespace/objectname".  For cluster resources, simply use "objectname". */
  "orderedResources"?: Record<string, unknown> | null
  /** ResourcePolicy specifies the referenced resource policies that backup should follow */
  "resourcePolicy"?: ResourcePolicy
  /** SnapshotMoveData specifies whether snapshot data should be moved */
  "snapshotMoveData"?: boolean | null
  /** SnapshotVolumes specifies whether to take snapshots of any PV's referenced in the set of objects included in the Backup. */
  "snapshotVolumes"?: boolean | null
  /** StorageLocation is a string containing the name of a BackupStorageLocation where the backup should be stored. */
  "storageLocation"?: string
  /** TTL is a time.Duration-parseable string describing how long the Backup should be retained for. */
  "ttl"?: string
  /** UploaderConfig specifies the configuration for the uploader. */
  "uploaderConfig"?: UploaderConfig | null
  /** VolumeSnapshotLocations is a list containing names of VolumeSnapshotLocations associated with this backup. */
  "volumeSnapshotLocations"?: string[]
}

export interface ScheduleSpec {
  /** Paused specifies whether the schedule is paused or not */
  "paused"?: boolean
  /** Schedule is a Cron expression defining when to run the Backup. */
  "schedule": string
  /** SkipImmediately specifies whether to skip backup if schedule is due immediately from `schedule.status.lastBackup` timestamp when schedule is unpaused or if schedule is new. If true, backup will be skipped immediately when schedule is unpaused if it is due based on .Status.LastBackupTimestamp or schedule is new, and will run at next schedule time. If false, backup will not be skipped immediately when schedule is unpaused, but will run at next schedule time. If empty, will follow server configuration (default: false). */
  "skipImmediately"?: boolean
  /** Template is the definition of the Backup to be run on the provided schedule */
  "template": Template
  /** UseOwnerReferencesBackup specifies whether to use OwnerReferences on backups created by this Schedule. */
  "useOwnerReferencesInBackup"?: boolean | null
}

export interface ScheduleStatus {
  /** LastBackup is the last time a Backup was run for this Schedule schedule */
  "lastBackup"?: string | null
  /** LastSkipped is the last time a Schedule was skipped */
  "lastSkipped"?: string | null
  /** Phase is the current phase of the Schedule */
  "phase"?: string
  /** ValidationErrors is a slice of all validation errors (if applicable) */
  "validationErrors"?: string[]
}
