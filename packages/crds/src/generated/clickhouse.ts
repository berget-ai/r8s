/**
 * GENERATED from clickhouse CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface ClickHouseInstallation {
  apiVersion: 'clickhouse.altinity.com/v1'
  kind: 'ClickHouseInstallation'
  metadata: ObjectMeta
  spec: ClickHouseInstallationSpec
  status?: ClickHouseInstallationStatus
}

/** Props for the {@link ClickHouseInstallation} component — a 1:1 mapping of the clickhouse.altinity.com/v1 CRD. */
export interface ClickHouseInstallationProps {
  metadata: ObjectMeta
  spec: ClickHouseInstallationSpec
}

/** Render a ClickHouseInstallation (clickhouse.altinity.com/v1) exactly as defined by its CRD. */
export function ClickHouseInstallationComponent(props: ClickHouseInstallationProps) {
  return jsx('ClickHouseInstallation', {
    apiVersion: 'clickhouse.altinity.com/v1',
    kind: 'ClickHouseInstallation',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Templating {
  /** When defined as `auto` inside ClickhouseInstallationTemplate, this ClickhouseInstallationTemplate will be auto-added into ClickHouseInstallation, selectable by `chiSelector`. Default value is `manual`, meaning ClickHouseInstallation should request this ClickhouseInstallationTemplate explicitly.  */
  "policy"?: "" | "Auto" | "auto" | "Manual" | "manual"
  /** Optional, defines selector for ClickHouseInstallation(s) to be templated with ClickhouseInstallationTemplate */
  "chiSelector"?: Record<string, unknown>
}

export interface UnknownObjects {
  /** Behavior policy for unknown StatefulSet, `Delete` by default (case-insensitive) */
  "statefulSet"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** Behavior policy for unknown PVC, `Delete` by default */
  "pvc"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** Behavior policy for unknown ConfigMap, `Delete` by default */
  "configMap"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** Behavior policy for unknown Service, `Delete` by default */
  "service"?: "" | "Retain" | "retain" | "Delete" | "delete"
}

export interface ReconcileFailedObjects {
  /** Behavior policy for failed StatefulSet, `Retain` by default */
  "statefulSet"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** Behavior policy for failed PVC, `Retain` by default */
  "pvc"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** Behavior policy for failed ConfigMap, `Retain` by default */
  "configMap"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** Behavior policy for failed Service, `Retain` by default */
  "service"?: "" | "Retain" | "retain" | "Delete" | "delete"
}

export interface Cleanup {
  /** Describes what clickhouse-operator should do with found Kubernetes resources which should be managed by clickhouse-operator, but do not have `ownerReference` to any currently managed `ClickHouseInstallation` resource. Default behavior is `Delete`"  */
  "unknownObjects"?: UnknownObjects
  /** Describes what clickhouse-operator should do with Kubernetes resources which are failed during reconcile. Default behavior is `Retain`"  */
  "reconcileFailedObjects"?: ReconcileFailedObjects
}

export interface Users {
  /** enabled or not */
  "enabled"?: Record<string, unknown>
}

export interface Profiles {
  /** enabled or not */
  "enabled"?: Record<string, unknown>
}

export interface Quotas {
  /** enabled or not */
  "enabled"?: Record<string, unknown>
}

export interface Settings {
  /** enabled or not */
  "enabled"?: Record<string, unknown>
}

export interface Files {
  /** enabled or not */
  "enabled"?: Record<string, unknown>
}

export interface Sections {
  /** sections behaviour for macros on users */
  "users"?: Users
  /** sections behaviour for macros on profiles */
  "profiles"?: Profiles
  /** sections behaviour for macros on quotas */
  "quotas"?: Quotas
  /** sections behaviour for macros on settings */
  "settings"?: Settings
  /** sections behaviour for macros on files */
  "files"?: Files
}

export interface Macros {
  /** sections behaviour for macros */
  "sections"?: Sections
}

export interface Runtime {
  /** The maximum number of cluster shards that may be reconciled in parallel, 1 by default */
  "reconcileShardsThreadsNumber"?: number
  /** The maximum percentage of cluster shards that may be reconciled in parallel, 50 percent by default. */
  "reconcileShardsMaxConcurrencyPercent"?: number
}

export interface Create {
  /** What to do in case created StatefulSet is not in 'Ready' after `reconcile.statefulSet.update.timeout` seconds. Possible options: 1. abort - abort the process, do nothing with the problematic StatefulSet, leave it as it is. 2. delete - delete newly created problematic StatefulSet and follow 'abort' path afterwards. 3. ignore - ignore an error, pretend nothing happened, continue reconcile and move on to the next StatefulSet.  */
  "onFailure"?: "" | "Abort" | "abort" | "Delete" | "delete" | "Ignore" | "ignore"
}

export interface Update {
  /** How many seconds to wait for StatefulSet to be 'Ready' during update */
  "timeout"?: number
  /** How many seconds to wait between checks for StatefulSet status during update */
  "pollInterval"?: number
  /** What to do in case updated StatefulSet is not in 'Ready' after `reconcile.statefulSet.update.timeout` seconds. Possible options: 1. abort - abort the process, do nothing with the problematic StatefulSet, leave it as it is. 2. rollback - delete Pod and rollback StatefulSet to previous Generation. Follow 'abort' path afterwards. 3. ignore - ignore an error, pretend nothing happened, continue reconcile and move on to the next StatefulSet.  */
  "onFailure"?: "" | "Abort" | "abort" | "Rollback" | "rollback" | "Ignore" | "ignore"
}

export interface Recreate {
  /** What to do in case operator needs to recreate StatefulSet due to PVC data loss or missing volumes. Possible options: 1. abort - abort the process, do nothing with the problematic StatefulSet. 2. recreate - proceed and recreate StatefulSet.  */
  "onDataLoss"?: "" | "Abort" | "abort" | "Recreate" | "recreate"
  /** What to do in case operator needs to recreate StatefulSet due to update failure or StatefulSet not ready. Possible options: 1. abort - abort the process, do nothing with the problematic StatefulSet. 2. recreate - proceed and recreate StatefulSet.  */
  "onUpdateFailure"?: "" | "Abort" | "abort" | "Recreate" | "recreate"
}

export interface StatefulSet {
  /** Behavior during create StatefulSet */
  "create"?: Create
  /** Behavior during update StatefulSet */
  "update"?: Update
  /** Behavior during recreate StatefulSet */
  "recreate"?: Recreate
}

export interface Replicas {
  /** Whether the operator during reconcile procedure should wait for all replicas to catch-up */
  "all"?: Record<string, unknown>
  /** Whether the operator during reconcile procedure should wait for new replicas to catch-up */
  "new"?: Record<string, unknown>
  /** replication max absolute delay to consider replica is not delayed */
  "delay"?: number
}

export interface Probes {
  /** Whether the operator during host launch procedure should wait for startup probe to succeed. In case probe is unspecified wait is assumed to be completed successfully. Default option value is to do not wait.  */
  "startup"?: Record<string, unknown>
  /** Whether the operator during host launch procedure should wait for ready probe to succeed. In case probe is unspecified wait is assumed to be completed successfully. Default option value is to wait.  */
  "readiness"?: Record<string, unknown>
}

export interface Wait {
  /** Allows to stop all ClickHouse clusters defined in a CHI. Works as the following:  - When `stop` is `1` operator sets `Replicas: 0` in each StatefulSet. Thie leads to having all `Pods` and `Service` deleted. All PVCs are kept intact.  - When `stop` is `0` operator sets `Replicas: 1` and `Pod`s and `Service`s will created again and all retained PVCs will be attached to `Pod`s.  */
  "exclude"?: Record<string, unknown>
  /** Whether the operator during reconcile procedure should wait for a ClickHouse host to complete all running queries */
  "queries"?: Record<string, unknown>
  /** Whether the operator during reconcile procedure should wait for a ClickHouse host to be included into a ClickHouse cluster */
  "include"?: Record<string, unknown>
  /** Whether the operator during reconcile procedure should wait for replicas to catch-up */
  "replicas"?: Replicas
  /** What probes the operator should wait during host launch procedure */
  "probes"?: Probes
}

export interface Replicas2 {
  /** Whether the operator during reconcile procedure should drop replicas when replica is deleted  */
  "onDelete"?: Record<string, unknown>
  /** Whether the operator during reconcile procedure should drop replicas when replica volume is lost  */
  "onLostVolume"?: Record<string, unknown>
  /** Whether the operator during reconcile procedure should drop active replicas when replica is deleted or recreated  */
  "active"?: Record<string, unknown>
}

export interface Drop {
  /** Whether the operator during reconcile procedure should drop replicas when replica is deleted or recreated  */
  "replicas"?: Replicas2
}

export interface Sql {
  "queries"?: string[] | null
}

export interface Shell {
  "command"?: string[] | null
  "container"?: string
}

export interface Http {
  "url"?: string
  "method"?: string
}

export interface PreItem {
  "sql"?: Sql
  "shell"?: Shell
  "http"?: Http
  /** where to execute hook for cluster-level hooks: FirstHost (default), AllHosts, AllShards */
  "target"?: "" | "FirstHost" | "firsthost" | "AllHosts" | "allhosts" | "AllShards" | "allshards"
  /** Reconcile lifecycle events that trigger this hook. Required, must be non-empty. The hook is skipped on any reconcile whose classifier does not emit at least one of the listed events. Supported values:   Any               - wildcard match: fires on every hook-evaluation point,                       including the pre-delete sweep on the dying host   HostCreate        - first reconcile that creates a host (no ancestor); best                       paired with POST hooks because PRE hooks on first creation                       are skipped (no live pod yet)   HostUpdate        - reconcile that has prior state for the host; catch-all                       for ongoing reconciles   HostStart         - host transitions from stopped to running   HostStop          - host is being stopped (current spec marks it stopped)   HostConfigRestart - in-place software restart for a configuration change   HostRollout       - pod-template change forces a StatefulSet rollout   HostShutdown      - aggregate: fires whenever the pod is going down for any                       reason (Stop, ConfigRestart, Rollout, or Delete)   HostDelete        - host is being removed from the cluster (downsize); fires                       on the dying host before tear-down. Always emitted                       alongside HostShutdown.  */
  "events": ("Any" | "any" | "HostCreate" | "hostcreate" | "HostDelete" | "hostdelete" | "HostUpdate" | "hostupdate" | "HostStart" | "hoststart" | "HostStop" | "hoststop" | "HostConfigRestart" | "hostconfigrestart" | "HostRollout" | "hostrollout" | "HostShutdown" | "hostshutdown")[]
  /** Controls what happens when this hook returns an error. Fail (default): error propagates — pre-hook aborts reconcile / host deletion. Ignore: error is logged and the reconcile continues.  */
  "failurePolicy"?: "Fail" | "fail" | "Ignore" | "ignore"
}

export interface PostItem {
  "sql"?: Sql
  "shell"?: Shell
  "http"?: Http
  /** where to execute hook for cluster-level hooks: FirstHost (default), AllHosts, AllShards */
  "target"?: "" | "FirstHost" | "firsthost" | "AllHosts" | "allhosts" | "AllShards" | "allshards"
  /** Reconcile lifecycle events that trigger this hook. Required, must be non-empty. The hook is skipped on any reconcile whose classifier does not emit at least one of the listed events. Supported values:   Any               - wildcard match: fires on every hook-evaluation point,                       including the pre-delete sweep on the dying host   HostCreate        - first reconcile that creates a host (no ancestor); best                       paired with POST hooks because PRE hooks on first creation                       are skipped (no live pod yet)   HostUpdate        - reconcile that has prior state for the host; catch-all                       for ongoing reconciles   HostStart         - host transitions from stopped to running   HostStop          - host is being stopped (current spec marks it stopped)   HostConfigRestart - in-place software restart for a configuration change   HostRollout       - pod-template change forces a StatefulSet rollout   HostShutdown      - aggregate: fires whenever the pod is going down for any                       reason (Stop, ConfigRestart, Rollout, or Delete)   HostDelete        - host is being removed from the cluster (downsize); fires                       on the dying host before tear-down. Always emitted                       alongside HostShutdown.  */
  "events": ("Any" | "any" | "HostCreate" | "hostcreate" | "HostDelete" | "hostdelete" | "HostUpdate" | "hostupdate" | "HostStart" | "hoststart" | "HostStop" | "hoststop" | "HostConfigRestart" | "hostconfigrestart" | "HostRollout" | "hostrollout" | "HostShutdown" | "hostshutdown")[]
  /** Controls what happens when this hook returns an error. Fail (default): error propagates — pre-hook aborts reconcile / host deletion. Ignore: error is logged and the reconcile continues.  */
  "failurePolicy"?: "Fail" | "fail" | "Ignore" | "ignore"
}

export interface Hooks {
  /** actions to execute before reconcile */
  "pre"?: PreItem[] | null
  /** actions to execute after reconcile */
  "post"?: PostItem[] | null
}

export interface Host {
  "wait"?: Wait
  "drop"?: Drop
  /** hooks to execute before and after host reconcile */
  "hooks"?: Hooks
}

export interface Cluster {
  /** cluster-level hooks inherited by every cluster */
  "hooks"?: Hooks
}

export interface Reconciling {
  /** DISCUSSED TO BE DEPRECATED Syntax sugar Overrides all three 'reconcile.host.wait.{exclude, queries, include}' values from the operator's config Possible values:  - wait - should wait to exclude host, complete queries and include host back into the cluster  - nowait - should NOT wait to exclude host, complete queries and include host back into the cluster (case-insensitive)  */
  "policy"?: "" | "Wait" | "wait" | "NoWait" | "nowait"
  /** Timeout in seconds for `clickhouse-operator` to wait for modified `ConfigMap` to propagate into the `Pod` More details: https://kubernetes.io/docs/concepts/configuration/configmap/#mounted-configmaps-are-updated-automatically  */
  "configMapPropagationTimeout"?: number
  /** Optional, defines behavior for cleanup Kubernetes resources during reconcile cycle */
  "cleanup"?: Cleanup
  /** macros parameters */
  "macros"?: Macros
  /** runtime parameters for clickhouse-operator process which are used during reconcile cycle */
  "runtime"?: Runtime
  /** Optional, StatefulSet reconcile behavior tuning */
  "statefulSet"?: StatefulSet
  /** Whether the operator during reconcile procedure should wait for a ClickHouse host:   - to be excluded from a ClickHouse cluster   - to complete all running queries   - to be included into a ClickHouse cluster respectfully before moving forward  */
  "host"?: Host
  /** CHI-level cluster reconcile defaults inherited by every cluster's spec.configuration.clusters[N].reconcile section. Use this as a single place to define cluster-level hooks that should apply to all clusters in this CHI; per-cluster hooks (under clusters[N].reconcile.hooks) are appended to (and dedup'd against) the inherited set.  */
  "cluster"?: Cluster
}

export interface Reconcile {
  /** DISCUSSED TO BE DEPRECATED Syntax sugar Overrides all three 'reconcile.host.wait.{exclude, queries, include}' values from the operator's config Possible values:  - wait - should wait to exclude host, complete queries and include host back into the cluster  - nowait - should NOT wait to exclude host, complete queries and include host back into the cluster (case-insensitive)  */
  "policy"?: "" | "Wait" | "wait" | "NoWait" | "nowait"
  /** Timeout in seconds for `clickhouse-operator` to wait for modified `ConfigMap` to propagate into the `Pod` More details: https://kubernetes.io/docs/concepts/configuration/configmap/#mounted-configmaps-are-updated-automatically  */
  "configMapPropagationTimeout"?: number
  /** Optional, defines behavior for cleanup Kubernetes resources during reconcile cycle */
  "cleanup"?: Cleanup
  /** macros parameters */
  "macros"?: Macros
  /** runtime parameters for clickhouse-operator process which are used during reconcile cycle */
  "runtime"?: Runtime
  /** Optional, StatefulSet reconcile behavior tuning */
  "statefulSet"?: StatefulSet
  /** Whether the operator during reconcile procedure should wait for a ClickHouse host:   - to be excluded from a ClickHouse cluster   - to complete all running queries   - to be included into a ClickHouse cluster respectfully before moving forward  */
  "host"?: Host
  /** CHI-level cluster reconcile defaults inherited by every cluster's spec.configuration.clusters[N].reconcile section. Use this as a single place to define cluster-level hooks that should apply to all clusters in this CHI; per-cluster hooks (under clusters[N].reconcile.hooks) are appended to (and dedup'd against) the inherited set.  */
  "cluster"?: Cluster
}

export interface DistributedDDL {
  /** Settings from this profile will be used to execute DDL queries */
  "profile"?: string
}

export interface StorageManagement {
  /** defines `PVC` provisioner - be it StatefulSet or the Operator (case-insensitive) */
  "provisioner"?: "" | "StatefulSet" | "statefulset" | "Operator" | "operator"
  /** defines behavior of `PVC` deletion (case-insensitive). `Delete` by default, if `Retain` specified then `PVC` will be kept when deleting StatefulSet  */
  "reclaimPolicy"?: "" | "Retain" | "retain" | "Delete" | "delete"
}

export interface Templates {
  /** optional, template name from chi.spec.templates.hostTemplates, which will apply to configure every `clickhouse-server` instance during render ConfigMap resources which will mount into `Pod` */
  "hostTemplate"?: string
  /** optional, template name from chi.spec.templates.podTemplates, allows customization each `Pod` resource during render and reconcile each StatefulSet.spec resource described in `chi.spec.configuration.clusters` */
  "podTemplate"?: string
  /** optional, template name from chi.spec.templates.volumeClaimTemplates, allows customization each `PVC` which will mount for clickhouse data directory in each `Pod` during render and reconcile every StatefulSet.spec resource described in `chi.spec.configuration.clusters` */
  "dataVolumeClaimTemplate"?: string
  /** optional, template name from chi.spec.templates.volumeClaimTemplates, allows customization each `PVC` which will mount for clickhouse log directory in each `Pod` during render and reconcile every StatefulSet.spec resource described in `chi.spec.configuration.clusters` */
  "logVolumeClaimTemplate"?: string
  /** optional, template name from chi.spec.templates.serviceTemplates. used for customization of the `Service` resource, created by `clickhouse-operator` to cover all clusters in whole `chi` resource */
  "serviceTemplate"?: string
  /** optional, template names from chi.spec.templates.serviceTemplates. used for customization of the `Service` resources, created by `clickhouse-operator` to cover all clusters in whole `chi` resource */
  "serviceTemplates"?: string[] | null
  /** optional, template name from chi.spec.templates.serviceTemplates, allows customization for each `Service` resource which will created by `clickhouse-operator` which cover each clickhouse cluster described in `chi.spec.configuration.clusters` */
  "clusterServiceTemplate"?: string
  /** optional, template name from chi.spec.templates.serviceTemplates, allows customization for each `Service` resource which will created by `clickhouse-operator` which cover each shard inside clickhouse cluster described in `chi.spec.configuration.clusters` */
  "shardServiceTemplate"?: string
  /** optional, template name from chi.spec.templates.serviceTemplates, allows customization for each `Service` resource which will created by `clickhouse-operator` which cover each replica inside each shard inside each clickhouse cluster described in `chi.spec.configuration.clusters` */
  "replicaServiceTemplate"?: string
  /** optional, alias for dataVolumeClaimTemplate, template name from chi.spec.templates.volumeClaimTemplates, allows customization each `PVC` which will mount for clickhouse data directory in each `Pod` during render and reconcile every StatefulSet.spec resource described in `chi.spec.configuration.clusters` */
  "volumeClaimTemplate"?: string
}

export interface Defaults {
  /** define should replicas be specified by FQDN in `<host></host>`. In case of "no" will use short hostname and clickhouse-server will use kubernetes default suffixes for DNS lookup "no" by default  */
  "replicasUseFQDN"?: Record<string, unknown>
  /** allows change `<yandex><distributed_ddl></distributed_ddl></yandex>` settings More info: https://clickhouse.tech/docs/en/operations/server-configuration-parameters/settings/#server-settings-distributed_ddl  */
  "distributedDDL"?: DistributedDDL
  /** default storage management options */
  "storageManagement"?: StorageManagement
  /** optional, configuration of the templates names which will use for generate Kubernetes resources according to one or more ClickHouse clusters described in current ClickHouseInstallation (chi) resource */
  "templates"?: Templates
}

export interface NodesItem {
  /** dns name or ip address for Zookeeper node */
  "host"?: string
  /** TCP port which used to connect to Zookeeper node */
  "port"?: number
  /** if a secure connection to Zookeeper is required */
  "secure"?: Record<string, unknown>
  /** availability zone for Zookeeper node */
  "availabilityZone"?: string
}

export interface Keeper {
  /** name of the ClickHouseKeeperInstallation custom resource */
  "name"?: string
  /** namespace of the CHK resource, defaults to the CHI namespace if omitted */
  "namespace"?: string
  /** how to discover keeper endpoints (case-insensitive):   Replicas (default) — enumerate per-host services, one ZK node per keeper replica   Service — use the CR-level headless service as a single ZK node entry  */
  "serviceType"?: "" | "Replicas" | "replicas" | "Service" | "service"
}

export interface Zookeeper {
  /** describe every available zookeeper cluster node for interaction */
  "nodes"?: NodesItem[]
  /** reference to a ClickHouseKeeperInstallation (CHK) resource. The operator resolves this to ZooKeeper node addresses automatically.  */
  "keeper"?: Keeper
  /** session timeout during connect to Zookeeper */
  "session_timeout_ms"?: number
  /** one operation timeout during Zookeeper transactions */
  "operation_timeout_ms"?: number
  /** optional root znode path inside zookeeper to store ClickHouse related data (replication queue or distributed DDL) */
  "root"?: string
  /** optional access credentials string with `user:password` format used when use digest authorization in Zookeeper */
  "identity"?: string
  /** Enables compression in Keeper protocol if set to true */
  "use_compression"?: Record<string, unknown>
}

export interface SchemaPolicy {
  /** how schema is propagated within a replica (case-insensitive) */
  "replica"?: "" | "None" | "none" | "All" | "all"
  /** how schema is propagated between shards (case-insensitive) */
  "shard"?: "" | "None" | "none" | "All" | "all" | "DistributedTablesOnly" | "distributedtablesonly"
}

export interface SecretKeyRef {
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names  */
  "name": string
  /** The key of the secret to select from. Must be a valid secret key. */
  "key": string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ValueFrom {
  /** Selects a key of a secret in the clickhouse installation namespace. Should not be used if value is not empty.  */
  "secretKeyRef"?: SecretKeyRef
}

export interface Secret {
  /** Auto-generate shared secret value to secure cluster communications */
  "auto"?: Record<string, unknown>
  /** Cluster shared secret value in plain text */
  "value"?: string
  /** Cluster shared secret source */
  "valueFrom"?: ValueFrom
}

export interface Reconcile2 {
  /** runtime parameters for clickhouse-operator process which are used during reconcile cycle */
  "runtime"?: Runtime
  /** Whether the operator during reconcile procedure should wait for a ClickHouse host:   - to be excluded from a ClickHouse cluster   - to complete all running queries   - to be included into a ClickHouse cluster respectfully before moving forward  */
  "host"?: Host
  /** cluster-level hooks to execute before and after cluster reconcile */
  "hooks"?: Hooks
}

export interface ReplicasItem {
  /** optional, by default replica name is generated, but you can override it and setup custom name */
  "name"?: string
  /** optional, open insecure ports for cluster, defaults to "yes"  */
  "insecure"?: Record<string, unknown>
  /** optional, open secure ports  */
  "secure"?: Record<string, unknown>
  /** optional, setup `Pod.spec.containers.ports` with name `tcp` for selected replica, override `chi.spec.templates.hostTemplates.spec.tcpPort` allows connect to `clickhouse-server` via TCP Native protocol via kubernetes `Service`  */
  "tcpPort"?: number
  "tlsPort"?: number
  /** optional, setup `Pod.spec.containers.ports` with name `http` for selected replica, override `chi.spec.templates.hostTemplates.spec.httpPort` allows connect to `clickhouse-server` via HTTP protocol via kubernetes `Service`  */
  "httpPort"?: number
  "httpsPort"?: number
  /** optional, setup `Pod.spec.containers.ports` with name `interserver` for selected replica, override `chi.spec.templates.hostTemplates.spec.interserverHTTPPort` allows connect between replicas inside same shard during fetch replicated data parts HTTP protocol  */
  "interserverHTTPPort"?: number
  /** optional, allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in `Pod` only in one replica during generate `ConfigMap` which will mount in `/etc/clickhouse-server/conf.d/` override top-level `chi.spec.configuration.settings`, cluster-level `chi.spec.configuration.clusters.settings` and shard-level `chi.spec.configuration.clusters.layout.shards.settings` More details: https://clickhouse.tech/docs/en/operations/settings/settings/  */
  "settings"?: Record<string, unknown>
  /** optional, allows define content of any setting file inside `Pod` only in one replica during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/` override top-level `chi.spec.configuration.files`, cluster-level `chi.spec.configuration.clusters.files` and shard-level `chi.spec.configuration.clusters.layout.shards.files`  */
  "files"?: Record<string, unknown>
  /** optional, configuration of the templates names which will use for generate Kubernetes resources according to selected replica override top-level `chi.spec.configuration.templates`, cluster-level `chi.spec.configuration.clusters.templates` and shard-level `chi.spec.configuration.clusters.layout.shards.templates`  */
  "templates"?: Templates
}

export interface ShardsItem {
  /** optional, by default shard name is generated, but you can override it and setup custom name */
  "name"?: string
  /** DEPRECATED - to be removed soon */
  "definitionType"?: string
  /** optional, 1 by default, allows setup shard <weight> setting which will use during insert into tables with `Distributed` engine, will apply in <remote_servers> inside ConfigMap which will mount in /etc/clickhouse-server/config.d/chop-generated-remote_servers.xml More details: https://clickhouse.tech/docs/en/engines/table-engines/special/distributed/  */
  "weight"?: number
  /** optional, `true` by default when `chi.spec.configuration.clusters[].layout.ReplicaCount` > 1 and 0 otherwise allows setup <internal_replication> setting which will use during insert into tables with `Distributed` engine for insert only in one live replica and other replicas will download inserted data during replication, will apply in <remote_servers> inside ConfigMap which will mount in /etc/clickhouse-server/config.d/chop-generated-remote_servers.xml More details: https://clickhouse.tech/docs/en/engines/table-engines/special/distributed/  */
  "internalReplication"?: Record<string, unknown>
  /** optional, allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in each `Pod` only in one shard during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` override top-level `chi.spec.configuration.settings` and cluster-level `chi.spec.configuration.clusters.settings` More details: https://clickhouse.tech/docs/en/operations/settings/settings/  */
  "settings"?: Record<string, unknown>
  /** optional, allows define content of any setting file inside each `Pod` only in one shard during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/` override top-level `chi.spec.configuration.files` and cluster-level `chi.spec.configuration.clusters.files`  */
  "files"?: Record<string, unknown>
  /** optional, configuration of the templates names which will use for generate Kubernetes resources according to selected shard override top-level `chi.spec.configuration.templates` and cluster-level `chi.spec.configuration.clusters.templates`  */
  "templates"?: Templates
  /** optional, how much replicas in selected shard for selected ClickHouse cluster will run in Kubernetes, each replica is a separate `StatefulSet` which contains only one `Pod` with `clickhouse-server` instance, shard contains 1 replica by default override cluster-level `chi.spec.configuration.clusters.layout.replicasCount`  */
  "replicasCount"?: number
  /** optional, allows override behavior for selected replicas from cluster-level `chi.spec.configuration.clusters` and shard-level `chi.spec.configuration.clusters.layout.shards`  */
  "replicas"?: ReplicasItem[]
}

export interface ShardsItem2 {
  /** optional, by default shard name is generated, but you can override it and setup custom name */
  "name"?: string
  /** optional, open insecure ports for cluster, defaults to "yes"  */
  "insecure"?: Record<string, unknown>
  /** optional, open secure ports  */
  "secure"?: Record<string, unknown>
  /** optional, setup `Pod.spec.containers.ports` with name `tcp` for selected shard, override `chi.spec.templates.hostTemplates.spec.tcpPort` allows connect to `clickhouse-server` via TCP Native protocol via kubernetes `Service`  */
  "tcpPort"?: number
  "tlsPort"?: number
  /** optional, setup `Pod.spec.containers.ports` with name `http` for selected shard, override `chi.spec.templates.hostTemplates.spec.httpPort` allows connect to `clickhouse-server` via HTTP protocol via kubernetes `Service`  */
  "httpPort"?: number
  "httpsPort"?: number
  /** optional, setup `Pod.spec.containers.ports` with name `interserver` for selected shard, override `chi.spec.templates.hostTemplates.spec.interserverHTTPPort` allows connect between replicas inside same shard during fetch replicated data parts HTTP protocol  */
  "interserverHTTPPort"?: number
  /** optional, allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in `Pod` only in one shard related to current replica during generate `ConfigMap` which will mount in `/etc/clickhouse-server/conf.d/` override top-level `chi.spec.configuration.settings`, cluster-level `chi.spec.configuration.clusters.settings` and replica-level `chi.spec.configuration.clusters.layout.replicas.settings` More details: https://clickhouse.tech/docs/en/operations/settings/settings/  */
  "settings"?: Record<string, unknown>
  /** optional, allows define content of any setting file inside each `Pod` only in one shard related to current replica during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/` override top-level `chi.spec.configuration.files` and cluster-level `chi.spec.configuration.clusters.files`, will ignore if `chi.spec.configuration.clusters.layout.shards` presents  */
  "files"?: Record<string, unknown>
  /** optional, configuration of the templates names which will use for generate Kubernetes resources according to selected replica override top-level `chi.spec.configuration.templates`, cluster-level `chi.spec.configuration.clusters.templates`, replica-level `chi.spec.configuration.clusters.layout.replicas.templates`  */
  "templates"?: Templates
}

export interface ReplicasItem2 {
  /** optional, by default replica name is generated, but you can override it and setup custom name */
  "name"?: string
  /** optional, allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in `Pod` only in one replica during generate `ConfigMap` which will mount in `/etc/clickhouse-server/conf.d/` override top-level `chi.spec.configuration.settings`, cluster-level `chi.spec.configuration.clusters.settings` and will ignore if shard-level `chi.spec.configuration.clusters.layout.shards` present More details: https://clickhouse.tech/docs/en/operations/settings/settings/  */
  "settings"?: Record<string, unknown>
  /** optional, allows define content of any setting file inside each `Pod` only in one replica during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/` override top-level `chi.spec.configuration.files` and cluster-level `chi.spec.configuration.clusters.files`, will ignore if `chi.spec.configuration.clusters.layout.shards` presents  */
  "files"?: Record<string, unknown>
  /** optional, configuration of the templates names which will use for generate Kubernetes resources according to selected replica override top-level `chi.spec.configuration.templates`, cluster-level `chi.spec.configuration.clusters.templates`  */
  "templates"?: Templates
  /** optional, count of shards related to current replica, you can override each shard behavior on low-level `chi.spec.configuration.clusters.layout.replicas.shards` */
  "shardsCount"?: number
  /** optional, list of shards related to current replica, will ignore if `chi.spec.configuration.clusters.layout.shards` presents */
  "shards"?: ShardsItem2[]
}

export interface Layout {
  /** how much shards for current ClickHouse cluster will run in Kubernetes, each shard contains shared-nothing part of data and contains set of replicas, cluster contains 1 shard by default"  */
  "shardsCount"?: number
  /** how much replicas in each shards for current cluster will run in Kubernetes, each replica is a separate `StatefulSet` which contains only one `Pod` with `clickhouse-server` instance, every shard contains 1 replica by default"  */
  "replicasCount"?: number
  /** optional, allows override top-level `chi.spec.configuration`, cluster-level `chi.spec.configuration.clusters` settings for each shard separately, use it only if you fully understand what you do"  */
  "shards"?: ShardsItem[]
  /** optional, allows override top-level `chi.spec.configuration` and cluster-level `chi.spec.configuration.clusters` configuration for each replica and each shard relates to selected replica, use it only if you fully understand what you do */
  "replicas"?: ReplicasItem2[]
}

export interface ClustersItem {
  /** cluster name, used to identify set of servers and wide used during generate names of related Kubernetes resources */
  "name"?: string
  /** optional, allows configure <yandex><zookeeper>..</zookeeper></yandex> section in each `Pod` only in current ClickHouse cluster, during generate `ConfigMap` which will mounted in `/etc/clickhouse-server/config.d/` override top-level `chi.spec.configuration.zookeeper` settings  */
  "zookeeper"?: Zookeeper
  /** optional, allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in each `Pod` only in one cluster during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` override top-level `chi.spec.configuration.settings` More details: https://clickhouse.tech/docs/en/operations/settings/settings/  */
  "settings"?: Record<string, unknown>
  /** optional, allows define content of any setting file inside each `Pod` on current cluster during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/` override top-level `chi.spec.configuration.files`  */
  "files"?: Record<string, unknown>
  /** optional, configuration of the templates names which will use for generate Kubernetes resources according to selected cluster override top-level `chi.spec.configuration.templates`  */
  "templates"?: Templates
  /** describes how schema is propagated within replicas and shards  */
  "schemaPolicy"?: SchemaPolicy
  /** optional, open insecure ports for cluster, defaults to "yes" */
  "insecure"?: Record<string, unknown>
  /** optional, open secure ports for cluster */
  "secure"?: Record<string, unknown>
  /** optional, shared secret value to secure cluster communications */
  "secret"?: Secret
  /** Per-cluster security toggles for outbound TLS connections the operator makes to this cluster's ClickHouse and ZooKeeper / Keeper hosts. Nil fields fall through to the operator-wide defaults in ClickHouseOperatorConfiguration. See docs/security_hardening.md for details.  */
  "security"?: Record<string, unknown>
  /** Specifies whether the Pod Disruption Budget (PDB) should be managed. During the next installation, if PDB management is enabled, the operator will attempt to retrieve any existing PDB. If none is found, it will create a new one and initiate a reconciliation loop. If PDB management is disabled, the existing PDB will remain intact, and the reconciliation loop will not be executed. By default, PDB management is enabled.  */
  "pdbManaged"?: Record<string, unknown>
  /** Pod eviction is allowed if at most "pdbMaxUnavailable" pods are unavailable after the eviction, i.e. even in absence of the evicted pod. For example, one can prevent all voluntary evictions by specifying 0. This is a mutually exclusive setting with "minAvailable".  */
  "pdbMaxUnavailable"?: number
  /** allow tuning reconciling process */
  "reconcile"?: Reconcile2
  /** describe current cluster layout, how much shards in cluster, how much replica in shard allows override settings on each shard and replica separatelly  */
  "layout"?: Layout
}

export interface Configuration {
  /** allows configure <yandex><zookeeper>..</zookeeper></yandex> section in each `Pod` during generate `ConfigMap` which will mounted in `/etc/clickhouse-server/config.d/` `clickhouse-operator` itself doesn't manage Zookeeper, please install Zookeeper separatelly look examples on https://github.com/Altinity/clickhouse-operator/tree/master/deploy/zookeeper/ currently, zookeeper (or clickhouse-keeper replacement) used for *ReplicatedMergeTree table engines and for `distributed_ddl` More details: https://clickhouse.tech/docs/en/operations/server-configuration-parameters/settings/#server-settings_zookeeper  */
  "zookeeper"?: Zookeeper
  /** allows configure <yandex><users>..</users></yandex> section in each `Pod` during generate `ConfigMap` which will mount in `/etc/clickhouse-server/users.d/` you can configure password hashed, authorization restrictions, database level security row filters etc. More details: https://clickhouse.tech/docs/en/operations/settings/settings-users/ Your yaml code will convert to XML, see examples https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#specconfigurationusers any key could contains `valueFrom` with `secretKeyRef` which allow pass password from kubernetes secrets secret value will pass in `pod.spec.containers.evn`, and generate with from_env=XXX in XML in /etc/clickhouse-server/users.d/chop-generated-users.xml it not allow automatically updates when updates `secret`, change spec.taskID for manually trigger reconcile cycle look into https://github.com/Altinity/clickhouse-operator/blob/master/docs/chi-examples/05-settings-01-overview.yaml for examples any key with prefix `k8s_secret_` shall has value with format namespace/secret/key or secret/key in this case value from secret will write directly into XML tag during render *-usersd ConfigMap any key with prefix `k8s_secret_env` shall has value with format namespace/secret/key or secret/key in this case value from secret will write into environment variable and write to XML tag via from_env=XXX look into https://github.com/Altinity/clickhouse-operator/blob/master/docs/chi-examples/05-settings-01-overview.yaml for examples  */
  "users"?: Record<string, unknown>
  /** allows configure <yandex><profiles>..</profiles></yandex> section in each `Pod` during generate `ConfigMap` which will mount in `/etc/clickhouse-server/users.d/` you can configure any aspect of settings profile More details: https://clickhouse.tech/docs/en/operations/settings/settings-profiles/ Your yaml code will convert to XML, see examples https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#specconfigurationprofiles  */
  "profiles"?: Record<string, unknown>
  /** allows configure <yandex><quotas>..</quotas></yandex> section in each `Pod` during generate `ConfigMap` which will mount in `/etc/clickhouse-server/users.d/` you can configure any aspect of resource quotas More details: https://clickhouse.tech/docs/en/operations/quotas/ Your yaml code will convert to XML, see examples https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#specconfigurationquotas  */
  "quotas"?: Record<string, unknown>
  /** allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in each `Pod` during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` More details: https://clickhouse.tech/docs/en/operations/settings/settings/ Your yaml code will convert to XML, see examples https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#specconfigurationsettings any key could contains `valueFrom` with `secretKeyRef` which allow pass password from kubernetes secrets look into https://github.com/Altinity/clickhouse-operator/blob/master/docs/chi-examples/05-settings-01-overview.yaml for examples secret value will pass in `pod.spec.env`, and generate with from_env=XXX in XML in /etc/clickhouse-server/config.d/chop-generated-settings.xml it not allow automatically updates when updates `secret`, change spec.taskID for manually trigger reconcile cycle  */
  "settings"?: Record<string, unknown>
  /** allows define content of any setting file inside each `Pod` during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/` every key in this object is the file name every value in this object is the file content you can use `!!binary |` and base64 for binary files, see details here https://yaml.org/type/binary.html each key could contains prefix like {common}, {users}, {hosts} or config.d, users.d, conf.d, wrong prefixes will be ignored, subfolders also will be ignored More details: https://github.com/Altinity/clickhouse-operator/blob/master/docs/chi-examples/05-settings-05-files-nested.yaml any key could contains `valueFrom` with `secretKeyRef` which allow pass values from kubernetes secrets secrets will mounted into pod as separate volume in /etc/clickhouse-server/secrets.d/ and will automatically update when update secret it useful for pass SSL certificates from cert-manager or similar tool look into https://github.com/Altinity/clickhouse-operator/blob/master/docs/chi-examples/05-settings-01-overview.yaml for examples  */
  "files"?: Record<string, unknown>
  /** describes clusters layout and allows change settings on cluster-level, shard-level and replica-level every cluster is a set of StatefulSet, one StatefulSet contains only one Pod with `clickhouse-server` all Pods will rendered in <remote_server> part of ClickHouse configs, mounted from ConfigMap as `/etc/clickhouse-server/config.d/chop-generated-remote_servers.xml` Clusters will use for Distributed table engine, more details: https://clickhouse.tech/docs/en/engines/table-engines/special/distributed/ If `cluster` contains zookeeper settings (could be inherited from top `chi` level), when you can create *ReplicatedMergeTree tables  */
  "clusters"?: ClustersItem[]
}

export interface PortDistributionItem {
  /** type of distribution, when `Unspecified` (default value) then all listen ports on clickhouse-server configuration in all Pods will have the same value, when `ClusterScopeIndex` then ports will increment to offset from base value depends on shard and replica index inside cluster with combination of `chi.spec.templates.podTemlates.spec.HostNetwork` it allows setup ClickHouse cluster inside Kubernetes and provide access via external network bypass Kubernetes internal network */
  "type"?: "" | "Unspecified" | "unspecified" | "ClusterScopeIndex" | "clusterscopeindex"
}

export interface Spec {
  /** by default, hostname will generate, but this allows define custom name for each `clickhouse-server` */
  "name"?: string
  /** optional, open insecure ports for cluster, defaults to "yes"  */
  "insecure"?: Record<string, unknown>
  /** optional, open secure ports  */
  "secure"?: Record<string, unknown>
  /** optional, setup `tcp_port` inside `clickhouse-server` settings for each Pod where current template will apply if specified, should have equal value with `chi.spec.templates.podTemplates.spec.containers.ports[name=tcp]` More info: https://clickhouse.tech/docs/en/interfaces/tcp/  */
  "tcpPort"?: number
  "tlsPort"?: number
  /** optional, setup `http_port` inside `clickhouse-server` settings for each Pod where current template will apply if specified, should have equal value with `chi.spec.templates.podTemplates.spec.containers.ports[name=http]` More info: https://clickhouse.tech/docs/en/interfaces/http/  */
  "httpPort"?: number
  "httpsPort"?: number
  /** optional, setup `interserver_http_port` inside `clickhouse-server` settings for each Pod where current template will apply if specified, should have equal value with `chi.spec.templates.podTemplates.spec.containers.ports[name=interserver]` More info: https://clickhouse.tech/docs/en/operations/server-configuration-parameters/settings/#interserver-http-port  */
  "interserverHTTPPort"?: number
  /** optional, allows configure `clickhouse-server` settings inside <yandex>...</yandex> tag in each `Pod` where this template will apply during generate `ConfigMap` which will mount in `/etc/clickhouse-server/conf.d/` More details: https://clickhouse.tech/docs/en/operations/settings/settings/  */
  "settings"?: Record<string, unknown>
  /** optional, allows define content of any setting file inside each `Pod` where this template will apply during generate `ConfigMap` which will mount in `/etc/clickhouse-server/config.d/` or `/etc/clickhouse-server/conf.d/` or `/etc/clickhouse-server/users.d/`  */
  "files"?: Record<string, unknown>
  /** be careful, this part of CRD allows override template inside template, don't use it if you don't understand what you do */
  "templates"?: Templates
}

export interface HostTemplatesItem {
  /** template name, could use to link inside top-level `chi.spec.defaults.templates.hostTemplate`, cluster-level `chi.spec.configuration.clusters.templates.hostTemplate`, shard-level `chi.spec.configuration.clusters.layout.shards.temlates.hostTemplate`, replica-level `chi.spec.configuration.clusters.layout.replicas.templates.hostTemplate` */
  "name"?: string
  /** define how will distribute numeric values of named ports in `Pod.spec.containers.ports` and clickhouse-server configs */
  "portDistribution"?: PortDistributionItem[]
  "spec"?: Spec
}

export interface Zone {
  /** optional, if defined, allows select kubernetes nodes by label with `name` equal `key` */
  "key"?: string
  /** optional, if defined, allows select kubernetes nodes by label with `value` in `values` */
  "values"?: string[]
}

export interface PodDistributionItem {
  /** you can define multiple affinity policy types */
  "type"?: "" | "Unspecified" | "unspecified" | "ClickHouseAntiAffinity" | "clickhouseantiaffinity" | "ShardAntiAffinity" | "shardantiaffinity" | "ReplicaAntiAffinity" | "replicaantiaffinity" | "AnotherNamespaceAntiAffinity" | "anothernamespaceantiaffinity" | "AnotherClickHouseInstallationAntiAffinity" | "anotherclickhouseinstallationantiaffinity" | "AnotherClusterAntiAffinity" | "anotherclusterantiaffinity" | "MaxNumberPerNode" | "maxnumberpernode" | "NamespaceAffinity" | "namespaceaffinity" | "ClickHouseInstallationAffinity" | "clickhouseinstallationaffinity" | "ClusterAffinity" | "clusteraffinity" | "ShardAffinity" | "shardaffinity" | "ReplicaAffinity" | "replicaaffinity" | "PreviousTailAffinity" | "previoustailaffinity" | "CircularReplication" | "circularreplication"
  /** scope for apply each podDistribution */
  "scope"?: "" | "Unspecified" | "unspecified" | "Shard" | "shard" | "Replica" | "replica" | "Cluster" | "cluster" | "ClickHouseInstallation" | "clickhouseinstallation" | "Namespace" | "namespace"
  /** define, how much ClickHouse Pods could be inside selected scope with selected distribution type */
  "number"?: number
  /** use for inter-pod affinity look to `pod.spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution.podAffinityTerm.topologyKey`, more info: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#inter-pod-affinity-and-anti-affinity"  */
  "topologyKey"?: string
}

export interface PodTemplatesItem {
  /** template name, could use to link inside top-level `chi.spec.defaults.templates.podTemplate`, cluster-level `chi.spec.configuration.clusters.templates.podTemplate`, shard-level `chi.spec.configuration.clusters.layout.shards.temlates.podTemplate`, replica-level `chi.spec.configuration.clusters.layout.replicas.templates.podTemplate` */
  "name"?: string
  /** allows define format for generated `Pod` name, look to https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#spectemplatesservicetemplates for details about available template variables */
  "generateName"?: string
  /** allows define custom zone name and will separate ClickHouse `Pods` between nodes, shortcut for `chi.spec.templates.podTemplates.spec.affinity.podAntiAffinity` */
  "zone"?: Zone
  /** DEPRECATED, shortcut for `chi.spec.templates.podTemplates.spec.affinity.podAntiAffinity` */
  "distribution"?: "" | "Unspecified" | "unspecified" | "OnePerHost" | "oneperhost"
  /** define ClickHouse Pod distribution policy between Kubernetes Nodes inside Shard, Replica, Namespace, CHI, another ClickHouse cluster */
  "podDistribution"?: PodDistributionItem[]
  /** allows pass standard object's metadata from template to Pod More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata  */
  "metadata"?: Record<string, unknown>
  /** allows define whole Pod.spec inside StaefulSet.spec, look to https://kubernetes.io/docs/concepts/workloads/pods/#pod-templates for details */
  "spec"?: Record<string, unknown>
}

export interface VolumeClaimTemplatesItem {
  /** template name, could use to link inside top-level `chi.spec.defaults.templates.dataVolumeClaimTemplate` or `chi.spec.defaults.templates.logVolumeClaimTemplate`, cluster-level `chi.spec.configuration.clusters.templates.dataVolumeClaimTemplate` or `chi.spec.configuration.clusters.templates.logVolumeClaimTemplate`, shard-level `chi.spec.configuration.clusters.layout.shards.temlates.dataVolumeClaimTemplate` or `chi.spec.configuration.clusters.layout.shards.temlates.logVolumeClaimTemplate` replica-level `chi.spec.configuration.clusters.layout.replicas.templates.dataVolumeClaimTemplate` or `chi.spec.configuration.clusters.layout.replicas.templates.logVolumeClaimTemplate`  */
  "name"?: string
  /** defines `PVC` provisioner - be it StatefulSet or the Operator (case-insensitive) */
  "provisioner"?: "" | "StatefulSet" | "statefulset" | "Operator" | "operator"
  /** defines behavior of `PVC` deletion (case-insensitive). `Delete` by default, if `Retain` specified then `PVC` will be kept when deleting StatefulSet  */
  "reclaimPolicy"?: "" | "Retain" | "retain" | "Delete" | "delete"
  /** allows to pass standard object's metadata from template to PVC More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata  */
  "metadata"?: Record<string, unknown>
  /** allows define all aspects of `PVC` resource More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims  */
  "spec"?: Record<string, unknown>
}

export interface ServiceTemplatesItem {
  /** template name, could use to link inside chi-level `chi.spec.defaults.templates.serviceTemplate` cluster-level `chi.spec.configuration.clusters.templates.clusterServiceTemplate` shard-level `chi.spec.configuration.clusters.layout.shards.temlates.shardServiceTemplate` replica-level `chi.spec.configuration.clusters.layout.replicas.templates.replicaServiceTemplate` or `chi.spec.configuration.clusters.layout.shards.replicas.replicaServiceTemplate`  */
  "name"?: string
  /** allows define format for generated `Service` name, look to https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#spectemplatesservicetemplates for details about available template variables"  */
  "generateName"?: string
  /** allows pass standard object's metadata from template to Service Could be use for define specificly for Cloud Provider metadata which impact to behavior of service More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata  */
  "metadata"?: Record<string, unknown>
  /** describe behavior of generated Service More info: https://kubernetes.io/docs/concepts/services-networking/service/  */
  "spec"?: Record<string, unknown>
}

export interface Templates2 {
  /** hostTemplate will use during apply to generate `clickhose-server` config files */
  "hostTemplates"?: HostTemplatesItem[]
  /** podTemplate will use during render `Pod` inside `StatefulSet.spec` and allows define rendered `Pod.spec`, pod scheduling distribution and pod zone More information: https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#spectemplatespodtemplates  */
  "podTemplates"?: PodTemplatesItem[]
  /** allows define template for rendering `PVC` kubernetes resource, which would use inside `Pod` for mount clickhouse `data`, clickhouse `logs` or something else  */
  "volumeClaimTemplates"?: VolumeClaimTemplatesItem[]
  /** allows define template for rendering `Service` which would get endpoint from Pods which scoped chi-wide, cluster-wide, shard-wide, replica-wide level  */
  "serviceTemplates"?: ServiceTemplatesItem[]
}

export interface UseTemplatesItem {
  /** name of `ClickHouseInstallationTemplate` (chit) resource */
  "name"?: string
  /** Kubernetes namespace where need search `chit` resource, depending on `watchNamespaces` settings in `clickhouse-operator` */
  "namespace"?: string
  /** optional, current strategy is only merge, and current `chi` settings have more priority than merged template `chit` (case-insensitive) */
  "useType"?: "" | "Merge" | "merge"
}

export interface ClickHouseInstallationSpec {
  /** Allows to define custom taskID for CHI update and watch status of this update execution. Displayed in all .status.taskID* fields. By default (if not filled) every update of CHI manifest will generate random taskID  */
  "taskID"?: string
  /** Allows to stop all ClickHouse clusters defined in a CHI. Works as the following:  - When `stop` is `1` operator sets `Replicas: 0` in each StatefulSet. Thie leads to having all `Pods` and `Service` deleted. All PVCs are kept intact.  - When `stop` is `0` operator sets `Replicas: 1` and `Pod`s and `Service`s will created again and all retained PVCs will be attached to `Pod`s.  */
  "stop"?: Record<string, unknown>
  /** In case 'RollingUpdate' specified, the operator will always restart ClickHouse pods during reconcile. This options is used in rare cases when force restart is required and is typically removed after the use in order to avoid unneeded restarts.  */
  "restart"?: "" | "RollingUpdate" | "rollingupdate"
  /** Suspend reconciliation of resources managed by a ClickHouse Installation. Works as the following:  - When `suspend` is `true` operator stops reconciling all resources.  - When `suspend` is `false` or not set, operator reconciles all resources.  */
  "suspend"?: Record<string, unknown>
  /** Allows to troubleshoot Pods during CrashLoopBack state. This may happen when wrong configuration applied, in this case `clickhouse-server` wouldn't start. Command within ClickHouse container is modified with `sleep` in order to avoid quick restarts and give time to troubleshoot via CLI. Liveness and Readiness probes are disabled as well.  */
  "troubleshoot"?: Record<string, unknown>
  /** Custom domain pattern which will be used for DNS names of `Service` or `Pod`. Typical use scenario - custom cluster domain in Kubernetes cluster Example: %s.svc.my.test  */
  "namespaceDomainPattern"?: string
  /** Optional, applicable inside ClickHouseInstallationTemplate only. Defines current ClickHouseInstallationTemplate application options to target ClickHouseInstallation(s)."  */
  "templating"?: Templating
  /** [OBSOLETED] Optional, allows tuning reconciling cycle for ClickhouseInstallation from clickhouse-operator side */
  "reconciling"?: Reconciling
  /** Optional, allows tuning reconciling cycle for ClickhouseInstallation from clickhouse-operator side */
  "reconcile"?: Reconcile
  /** define default behavior for whole ClickHouseInstallation, some behavior can be re-define on cluster, shard and replica level More info: https://github.com/Altinity/clickhouse-operator/blob/master/docs/custom_resource_explained.md#specdefaults  */
  "defaults"?: Defaults
  /** allows configure multiple aspects and behavior for `clickhouse-server` instance and also allows describe multiple `clickhouse-server` clusters inside one `chi` resource */
  "configuration"?: Configuration
  /** allows define templates which will use for render Kubernetes resources like StatefulSet, ConfigMap, Service, PVC, by default, clickhouse-operator have own templates, but you can override it */
  "templates"?: Templates2
  /** CHI-level security defaults, applied to every cluster that does not override them. Each cluster can shadow these via spec.configuration.clusters[].security. See docs/security_hardening.md for details.  */
  "security"?: Record<string, unknown>
  /** list of `ClickHouseInstallationTemplate` (chit) resource names which will merge with current `CHI` manifest during render Kubernetes resources to create related ClickHouse clusters"  */
  "useTemplates"?: UseTemplatesItem[]
}

export interface ClickHouseInstallationStatus {
  /** Operator version */
  "chop-version"?: string
  /** Operator git commit SHA */
  "chop-commit"?: string
  /** Operator build date */
  "chop-date"?: string
  /** IP address of the operator's pod which managed this resource */
  "chop-ip"?: string
  /** Clusters count */
  "clusters"?: number
  /** Shards count */
  "shards"?: number
  /** Replicas count */
  "replicas"?: number
  /** Hosts count */
  "hosts"?: number
  /** Status */
  "status"?: string
  /** Current task id */
  "taskID"?: string
  /** Started task ids */
  "taskIDsStarted"?: string[] | null
  /** Completed task ids */
  "taskIDsCompleted"?: string[] | null
  /** Action */
  "action"?: string
  /** Actions */
  "actions"?: string[] | null
  /** Last error */
  "error"?: string
  /** Errors */
  "errors"?: string[] | null
  /** Unchanged Hosts count */
  "hostsUnchanged"?: number
  /** Updated Hosts count */
  "hostsUpdated"?: number
  /** Added Hosts count */
  "hostsAdded"?: number
  /** Completed Hosts count */
  "hostsCompleted"?: number
  /** Deleted Hosts count */
  "hostsDeleted"?: number
  /** About to delete Hosts count */
  "hostsDelete"?: number
  /** Pods */
  "pods"?: string[] | null
  /** Pod IPs */
  "pod-ips"?: string[] | null
  /** Pods FQDNs */
  "fqdns"?: string[] | null
  /** Endpoint */
  "endpoint"?: string
  /** All endpoints */
  "endpoints"?: string[] | null
  /** Generation */
  "generation"?: number
  /** Normalized resource requested */
  "normalized"?: Record<string, unknown> | null
  /** Normalized resource completed */
  "normalizedCompleted"?: Record<string, unknown> | null
  /** Action Plan */
  "actionPlan"?: Record<string, unknown> | null
  /** List of hosts with tables created by the operator */
  "hostsWithTablesCreated"?: string[] | null
  /** List of hosts with replica caught up */
  "hostsWithReplicaCaughtUp"?: string[] | null
  /** List of templates used to build this CHI */
  "usedTemplates"?: Record<string, unknown> | null
}
