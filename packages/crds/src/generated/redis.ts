/**
 * GENERATED from redis CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface RedisCluster {
  apiVersion: 'redis.redis.opstreelabs.in/v1beta2'
  kind: 'RedisCluster'
  metadata: ObjectMeta
  spec: RedisClusterSpec
  status?: RedisClusterStatus
}

/** Props for the {@link RedisCluster} component — a 1:1 mapping of the redis.redis.opstreelabs.in/v1beta2 CRD. */
export interface RedisClusterProps {
  metadata: ObjectMeta
  spec: RedisClusterSpec
}

/** Render a RedisCluster (redis.redis.opstreelabs.in/v1beta2) exactly as defined by its CRD. */
export function RedisClusterComponent(props: RedisClusterProps) {
  return jsx('RedisCluster', {
    apiVersion: 'redis.redis.opstreelabs.in/v1beta2',
    kind: 'RedisCluster',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface RedisReplication {
  apiVersion: 'redis.redis.opstreelabs.in/v1beta2'
  kind: 'RedisReplication'
  metadata: ObjectMeta
  spec: RedisReplicationSpec
  status?: RedisReplicationStatus
}

/** Props for the {@link RedisReplication} component — a 1:1 mapping of the redis.redis.opstreelabs.in/v1beta2 CRD. */
export interface RedisReplicationProps {
  metadata: ObjectMeta
  spec: RedisReplicationSpec
}

/** Render a RedisReplication (redis.redis.opstreelabs.in/v1beta2) exactly as defined by its CRD. */
export function RedisReplicationComponent(props: RedisReplicationProps) {
  return jsx('RedisReplication', {
    apiVersion: 'redis.redis.opstreelabs.in/v1beta2',
    kind: 'RedisReplication',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface ItemsItem {
  /** key is the key to project. */
  "key": string
  /** mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "mode"?: number
  /** path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. */
  "path": string
}

export interface Secret {
  /** defaultMode is Optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** items If unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** optional field specify whether the Secret or its keys must be defined */
  "optional"?: boolean
  /** secretName is the name of the secret in the pod's namespace to use. More info: https://kubernetes.io/docs/concepts/storage/volumes#secret */
  "secretName"?: string
}

export interface TLS {
  "ca"?: string
  "cert"?: string
  "key"?: string
  /** Reference to secret which contains the certificates */
  "secret": Secret
}

export interface Acl {
  /** Adapts a Secret into a volume. The contents of the target Secret's Data field will be presented in a volume as files using the keys in the Data field as the file names. Secret volumes support ownership management and SELinux relabeling. */
  "secret"?: Secret
}

export interface ConfigMapKeyRef {
  /** The key to select. */
  "key": string
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
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
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the Secret or its key must be defined */
  "optional"?: boolean
}

export interface ValueFrom {
  /** Selects a key of a ConfigMap. */
  "configMapKeyRef"?: ConfigMapKeyRef
  /** Selects a field of the pod: supports metadata.name, metadata.namespace, `metadata.labels['<KEY>']`, `metadata.annotations['<KEY>']`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs. */
  "fieldRef"?: FieldRef
  /** Selects a resource of the container: only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported. */
  "resourceFieldRef"?: ResourceFieldRef
  /** Selects a key of a secret in the pod's namespace */
  "secretKeyRef"?: SecretKeyRef
}

export interface EnvItem {
  /** Name of the environment variable. Must be a C_IDENTIFIER. */
  "name": string
  /** Variable references $(VAR_NAME) are expanded using the previously defined environment variables in the container and any service environment variables. If a variable cannot be resolved, the reference in the input string will be unchanged. Double $$ are reduced to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e. "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)". Escaped references will never be expanded, regardless of whether the variable exists or not. Defaults to "". */
  "value"?: string
  /** Source for the environment variable's value. Cannot be used if value is not empty. */
  "valueFrom"?: ValueFrom
}

export interface ClaimsItem {
  /** Name must match the name of one entry in pod.spec.resourceClaims of the Pod where this field is used. It makes that resource available inside a container. */
  "name": string
}

export interface Resources {
  /** Claims lists the names of resources, defined in spec.resourceClaims, that are used by this container. This is an alpha field and requires enabling the DynamicResourceAllocation feature gate. This field is immutable. It can only be set for containers. */
  "claims"?: ClaimsItem[]
  /** Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "limits"?: Record<string, unknown>
  /** Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. Requests cannot exceed Limits. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "requests"?: Record<string, unknown>
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
  /** The capabilities to add/drop when running containers. Defaults to the default set of capabilities granted by the container runtime. Note that this field cannot be set when spec.os.name is windows. */
  "capabilities"?: Capabilities
  /** Run container in privileged mode. Processes in privileged containers are essentially equivalent to root on the host. Defaults to false. Note that this field cannot be set when spec.os.name is windows. */
  "privileged"?: boolean
  /** procMount denotes the type of proc mount to use for the containers. The default is DefaultProcMount which uses the container runtime defaults for readonly paths and masked paths. This requires the ProcMountType feature flag to be enabled. Note that this field cannot be set when spec.os.name is windows. */
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

export interface InitContainer {
  "args"?: string[]
  "command"?: string[]
  "enabled"?: boolean
  "env"?: EnvItem[]
  "image": string
  /** PullPolicy describes a policy for if/when to pull a container image */
  "imagePullPolicy"?: string
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  /** SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. */
  "securityContext"?: SecurityContext
}

export interface ImagePullSecretsItem {
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
}

export interface PersistentVolumeClaimRetentionPolicy {
  /** WhenDeleted specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is deleted. The default policy of `Retain` causes PVCs to not be affected by StatefulSet deletion. The `Delete` policy causes those PVCs to be deleted. */
  "whenDeleted"?: string
  /** WhenScaled specifies what happens to PVCs created from StatefulSet VolumeClaimTemplates when the StatefulSet is scaled down. The default policy of `Retain` causes PVCs to not be affected by a scaledown. The `Delete` policy causes the associated PVCs for any excess pods above the replica count to be deleted. */
  "whenScaled"?: string
}

export interface RedisSecret {
  "key"?: string
  "name"?: string
}

export interface Additional {
  "additionalAnnotations"?: Record<string, unknown>
  "enabled"?: boolean
  /** IncludeBusPort when set to true, it will add bus port to the service, such as 16379. This field is only used for Redis cluster mode. */
  "includeBusPort"?: boolean
  "type"?: string
}

export interface Headless {
  "additionalAnnotations"?: Record<string, unknown>
  "enabled"?: boolean
  /** IncludeBusPort when set to true, it will add bus port to the service, such as 16379. This field is only used for Redis cluster mode. */
  "includeBusPort"?: boolean
  "type"?: string
}

export interface Service {
  /** Additional config for which suffix is -additional service */
  "additional"?: Additional
  "annotations"?: Record<string, unknown>
  /** Headless config for which suffix is -headless service */
  "headless"?: Headless
  /** IncludeBusPort when set to true, it will add bus port to the service, such as 16379. This field is only used for Redis cluster mode. */
  "includeBusPort"?: boolean
  "serviceType"?: string
}

export interface RollingUpdate {
  /** The maximum number of pods that can be unavailable during the update. Value can be an absolute number (ex: 5) or a percentage of desired pods (ex: 10%). Absolute number is calculated from percentage by rounding up. This can not be 0. Defaults to 1. This field is alpha-level and is only honored by servers that enable the MaxUnavailableStatefulSet feature. The field applies to all pods in the range 0 to Replicas-1. That means if there is any unavailable pod in the range 0 to Replicas-1, it will be counted towards MaxUnavailable. */
  "maxUnavailable"?: number | string
  /** Partition indicates the ordinal at which the StatefulSet should be partitioned for updates. During a rolling update, all pods from ordinal Replicas-1 to Partition are updated. All pods from ordinal Partition-1 to 0 remain untouched. This is helpful in being able to do a canary based deployment. The default value is 0. */
  "partition"?: number
}

export interface UpdateStrategy {
  /** RollingUpdate is used to communicate parameters when Type is RollingUpdateStatefulSetStrategyType. */
  "rollingUpdate"?: RollingUpdate
  /** Type indicates the type of the StatefulSetUpdateStrategy. Default is RollingUpdate. */
  "type"?: string
}

export interface KubernetesConfig {
  "ignoreAnnotations"?: string[]
  "image": string
  /** PullPolicy describes a policy for if/when to pull a container image */
  "imagePullPolicy"?: string
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "minReadySeconds"?: number
  /** StatefulSetPersistentVolumeClaimRetentionPolicy describes the policy used for PVCs created from the StatefulSet VolumeClaimTemplates. */
  "persistentVolumeClaimRetentionPolicy"?: PersistentVolumeClaimRetentionPolicy
  /** ExistingPasswordSecret is the struct to access the existing secret */
  "redisSecret"?: RedisSecret
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  /** ServiceConfig define the type of service to be created and its annotations */
  "service"?: Service
  /** StatefulSetUpdateStrategy indicates the strategy that the StatefulSet controller will use to perform updates. It includes any additional parameters necessary to perform the update for the indicated strategy. */
  "updateStrategy"?: UpdateStrategy
}

export interface SysctlsItem {
  /** Name of a property to set */
  "name": string
  /** Value of a property to set */
  "value": string
}

export interface PodSecurityContext {
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
  /** The SELinux context to be applied to all containers. If unspecified, the container runtime will allocate a random SELinux context for each container.  May also be set in SecurityContext.  If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence for that container. Note that this field cannot be set when spec.os.name is windows. */
  "seLinuxOptions"?: SeLinuxOptions
  /** The seccomp options to use by the containers in this pod. Note that this field cannot be set when spec.os.name is windows. */
  "seccompProfile"?: SeccompProfile
  /** A list of groups applied to the first process run in each container, in addition to the container's primary GID, the fsGroup (if specified), and group memberships defined in the container image for the uid of the container process. If unspecified, no additional groups are added to any container. Note that group memberships defined in the container image for the uid of the container process are still effective, even if they are not included in this list. Note that this field cannot be set when spec.os.name is windows. */
  "supplementalGroups"?: number[]
  /** Sysctls hold a list of namespaced sysctls used for the pod. Pods with unsupported sysctls (by the container runtime) might fail to launch. Note that this field cannot be set when spec.os.name is windows. */
  "sysctls"?: SysctlsItem[]
  /** The Windows specific settings applied to all containers. If unspecified, the options within a container's SecurityContext will be used. If set in both SecurityContext and PodSecurityContext, the value specified in SecurityContext takes precedence. Note that this field cannot be set when spec.os.name is linux. */
  "windowsOptions"?: WindowsOptions
}

export interface RedisConfig {
  "additionalRedisConfig"?: string
  "dynamicConfig"?: string[]
  /** MaxMemoryPercentOfLimit is the percentage of redis container memory limit to be used as maxmemory. */
  "maxMemoryPercentOfLimit"?: number
}

export interface RedisExporter {
  "enabled"?: boolean
  "env"?: EnvItem[]
  "image": string
  /** PullPolicy describes a policy for if/when to pull a container image */
  "imagePullPolicy"?: string
  "port"?: number
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  /** SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. */
  "securityContext"?: SecurityContext
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
  /** MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `LabelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. Also, MatchLabelKeys cannot be set when LabelSelector isn't set. This is an alpha field and requires enabling MatchLabelKeysInPodAffinity feature gate. */
  "matchLabelKeys"?: string[]
  /** MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `LabelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both MismatchLabelKeys and LabelSelector. Also, MismatchLabelKeys cannot be set when LabelSelector isn't set. This is an alpha field and requires enabling MatchLabelKeysInPodAffinity feature gate. */
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
  /** MatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `LabelSelector` as `key in (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. Also, MatchLabelKeys cannot be set when LabelSelector isn't set. This is an alpha field and requires enabling MatchLabelKeysInPodAffinity feature gate. */
  "matchLabelKeys"?: string[]
  /** MismatchLabelKeys is a set of pod label keys to select which pods will be taken into consideration. The keys are used to lookup values from the incoming pod labels, those key-value labels are merged with `LabelSelector` as `key notin (value)` to select the group of existing pods which pods will be taken into consideration for the incoming pod's pod (anti) affinity. Keys that don't exist in the incoming pod labels will be ignored. The default value is empty. The same key is forbidden to exist in both MismatchLabelKeys and LabelSelector. Also, MismatchLabelKeys cannot be set when LabelSelector isn't set. This is an alpha field and requires enabling MatchLabelKeysInPodAffinity feature gate. */
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
  /** The scheduler will prefer to schedule pods to nodes that satisfy the anti-affinity expressions specified by this field, but it may choose a node that violates one or more of the expressions. The node that is most preferred is the one with the greatest sum of weights, i.e. for each node that meets all of the scheduling requirements (resource request, requiredDuringScheduling anti-affinity expressions, etc.), compute a sum by iterating through the elements of this field and adding "weight" to the sum if the node has pods which matches the corresponding podAffinityTerm; the node(s) with the highest sum are the most preferred. */
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

export interface Exec {
  /** Command is the command line to execute inside the container, the working directory for the command  is root ('/') in the container's filesystem. The command is simply exec'd, it is not run inside a shell, so traditional shell instructions ('|', etc) won't work. To use a shell, you need to explicitly call out to that shell. Exit status of 0 is treated as live/healthy and non-zero is unhealthy. */
  "command"?: string[]
}

export interface Grpc {
  /** Port number of the gRPC service. Number must be in the range 1 to 65535. */
  "port": number
  /** Service is the name of the service to place in the gRPC HealthCheckRequest (see https://github.com/grpc/grpc/blob/master/doc/health-checking.md). If this is not specified, the default behavior is defined by gRPC. */
  "service"?: string
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

export interface TcpSocket {
  /** Optional: Host name to connect to, defaults to the pod IP. */
  "host"?: string
  /** Number or name of the port to access on the container. Number must be in the range 1 to 65535. Name must be an IANA_SVC_NAME. */
  "port": number | string
}

export interface LivenessProbe {
  /** Exec specifies the action to take. */
  "exec"?: Exec
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** GRPC specifies an action involving a GRPC port. */
  "grpc"?: Grpc
  /** HTTPGet specifies the http request to perform. */
  "httpGet"?: HttpGet
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** TCPSocket specifies an action involving a TCP port. */
  "tcpSocket"?: TcpSocket
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
}

export interface Pdb {
  "enabled"?: boolean
  "maxUnavailable"?: number
  "minAvailable"?: number
}

export interface ReadinessProbe {
  /** Exec specifies the action to take. */
  "exec"?: Exec
  /** Minimum consecutive failures for the probe to be considered failed after having succeeded. Defaults to 3. Minimum value is 1. */
  "failureThreshold"?: number
  /** GRPC specifies an action involving a GRPC port. */
  "grpc"?: Grpc
  /** HTTPGet specifies the http request to perform. */
  "httpGet"?: HttpGet
  /** Number of seconds after the container has started before liveness probes are initiated. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "initialDelaySeconds"?: number
  /** How often (in seconds) to perform the probe. Default to 10 seconds. Minimum value is 1. */
  "periodSeconds"?: number
  /** Minimum consecutive successes for the probe to be considered successful after having failed. Defaults to 1. Must be 1 for liveness and startup. Minimum value is 1. */
  "successThreshold"?: number
  /** TCPSocket specifies an action involving a TCP port. */
  "tcpSocket"?: TcpSocket
  /** Optional duration in seconds the pod needs to terminate gracefully upon probe failure. The grace period is the duration in seconds after the processes running in the pod are sent a termination signal and the time when the processes are forcibly halted with a kill signal. Set this value longer than the expected cleanup time for your process. If this value is nil, the pod's terminationGracePeriodSeconds will be used. Otherwise, this value overrides the value provided by the pod spec. Value must be non-negative integer. The value zero indicates stop immediately via the kill signal (no opportunity to shut down). This is a beta field and requires enabling ProbeTerminationGracePeriod feature gate. Minimum value is 1. spec.terminationGracePeriodSeconds is used if unset. */
  "terminationGracePeriodSeconds"?: number
  /** Number of seconds after which the probe times out. Defaults to 1 second. Minimum value is 1. More info: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle#container-probes */
  "timeoutSeconds"?: number
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

export interface TopologySpreadConstraintsItem {
  /** LabelSelector is used to find matching pods. Pods that match this label selector are counted to determine the number of pods in their corresponding topology domain. */
  "labelSelector"?: LabelSelector
  /** MatchLabelKeys is a set of pod label keys to select the pods over which spreading will be calculated. The keys are used to lookup values from the incoming pod labels, those key-value labels are ANDed with labelSelector to select the group of existing pods over which spreading will be calculated for the incoming pod. The same key is forbidden to exist in both MatchLabelKeys and LabelSelector. MatchLabelKeys cannot be set when LabelSelector isn't set. Keys that don't exist in the incoming pod labels will be ignored. A null or empty list means only match against labelSelector. This is a beta field and requires the MatchLabelKeysInPodTopologySpread feature gate to be enabled (enabled by default). */
  "matchLabelKeys"?: string[]
  /** MaxSkew describes the degree to which pods may be unevenly distributed. When `whenUnsatisfiable=DoNotSchedule`, it is the maximum permitted difference between the number of matching pods in the target topology and the global minimum. The global minimum is the minimum number of matching pods in an eligible domain or zero if the number of eligible domains is less than MinDomains. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 2/2/1: In this case, the global minimum is 1. | zone1 | zone2 | zone3 | |  P P  |  P P  |   P   | - if MaxSkew is 1, incoming pod can only be scheduled to zone3 to become 2/2/2; scheduling it onto zone1(zone2) would make the ActualSkew(3-1) on zone1(zone2) violate MaxSkew(1). - if MaxSkew is 2, incoming pod can be scheduled onto any zone. When `whenUnsatisfiable=ScheduleAnyway`, it is used to give higher precedence to topologies that satisfy it. It's a required field. Default value is 1 and 0 is not allowed. */
  "maxSkew": number
  /** MinDomains indicates a minimum number of eligible domains. When the number of eligible domains with matching topology keys is less than minDomains, Pod Topology Spread treats "global minimum" as 0, and then the calculation of Skew is performed. And when the number of eligible domains with matching topology keys equals or greater than minDomains, this value has no effect on scheduling. As a result, when the number of eligible domains is less than minDomains, scheduler won't schedule more than maxSkew Pods to those domains. If value is nil, the constraint behaves as if MinDomains is equal to 1. Valid values are integers greater than 0. When value is not nil, WhenUnsatisfiable must be DoNotSchedule. For example, in a 3-zone cluster, MaxSkew is set to 2, MinDomains is set to 5 and pods with the same labelSelector spread as 2/2/2: | zone1 | zone2 | zone3 | |  P P  |  P P  |  P P  | The number of domains is less than 5(MinDomains), so "global minimum" is treated as 0. In this situation, new pod with the same labelSelector cannot be scheduled, because computed skew will be 3(3 - 0) if new Pod is scheduled to any of the three zones, it will violate MaxSkew. This is a beta field and requires the MinDomainsInPodTopologySpread feature gate to be enabled (enabled by default). */
  "minDomains"?: number
  /** NodeAffinityPolicy indicates how we will treat Pod's nodeAffinity/nodeSelector when calculating pod topology spread skew. Options are: - Honor: only nodes matching nodeAffinity/nodeSelector are included in the calculations. - Ignore: nodeAffinity/nodeSelector are ignored. All nodes are included in the calculations. If this value is nil, the behavior is equivalent to the Honor policy. This is a beta-level feature default enabled by the NodeInclusionPolicyInPodTopologySpread feature flag. */
  "nodeAffinityPolicy"?: string
  /** NodeTaintsPolicy indicates how we will treat node taints when calculating pod topology spread skew. Options are: - Honor: nodes without taints, along with tainted nodes for which the incoming pod has a toleration, are included. - Ignore: node taints are ignored. All nodes are included. If this value is nil, the behavior is equivalent to the Ignore policy. This is a beta-level feature default enabled by the NodeInclusionPolicyInPodTopologySpread feature flag. */
  "nodeTaintsPolicy"?: string
  /** TopologyKey is the key of node labels. Nodes that have a label with this key and identical values are considered to be in the same topology. We consider each <key, value> as a "bucket", and try to put balanced number of pods into each bucket. We define a domain as a particular instance of a topology. Also, we define an eligible domain as a domain whose nodes meet the requirements of nodeAffinityPolicy and nodeTaintsPolicy. e.g. If TopologyKey is "kubernetes.io/hostname", each Node is a domain of that topology. And, if TopologyKey is "topology.kubernetes.io/zone", each zone is a domain of that topology. It's a required field. */
  "topologyKey": string
  /** WhenUnsatisfiable indicates how to deal with a pod if it doesn't satisfy the spread constraint. - DoNotSchedule (default) tells the scheduler not to schedule it. - ScheduleAnyway tells the scheduler to schedule the pod in any location,   but giving higher precedence to topologies that would help reduce the   skew. A constraint is considered "Unsatisfiable" for an incoming pod if and only if every possible node assignment for that pod would violate "MaxSkew" on some topology. For example, in a 3-zone cluster, MaxSkew is set to 1, and pods with the same labelSelector spread as 3/1/1: | zone1 | zone2 | zone3 | | P P P |   P   |   P   | If WhenUnsatisfiable is set to DoNotSchedule, incoming pod can only be scheduled to zone2(zone3) to become 3/2/1(3/1/2) as ActualSkew(2-1) on zone2(zone3) satisfies MaxSkew(1). In other words, the cluster can still be imbalanced, but scheduler won't make it *more* imbalanced. It's a required field. */
  "whenUnsatisfiable": string
}

export interface RedisFollower {
  /** Affinity is a group of affinity scheduling rules. */
  "affinity"?: Affinity
  /** Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. */
  "livenessProbe"?: LivenessProbe
  "nodeSelector"?: Record<string, unknown>
  /** RedisPodDisruptionBudget configure a PodDisruptionBudget on the resource (leader/follower) */
  "pdb"?: Pdb
  /** Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. */
  "readinessProbe"?: ReadinessProbe
  /** RedisConfig defines the external configuration of Redis */
  "redisConfig"?: RedisConfig
  /** Replicas overrides clusterSize for follower nodes count. If not set, uses clusterSize value */
  "replicas"?: number
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  /** SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. */
  "securityContext"?: SecurityContext
  "terminationGracePeriodSeconds"?: number
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
}

export interface RedisLeader {
  /** Affinity is a group of affinity scheduling rules. */
  "affinity"?: Affinity
  /** Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. */
  "livenessProbe"?: LivenessProbe
  "nodeSelector"?: Record<string, unknown>
  /** RedisPodDisruptionBudget configure a PodDisruptionBudget on the resource (leader/follower) */
  "pdb"?: Pdb
  /** Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. */
  "readinessProbe"?: ReadinessProbe
  /** RedisConfig defines the external configuration of Redis */
  "redisConfig"?: RedisConfig
  /** Replicas overrides clusterSize for leader nodes count. If not set, uses clusterSize value */
  "replicas"?: number
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  /** SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. */
  "securityContext"?: SecurityContext
  "terminationGracePeriodSeconds"?: number
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
}

export interface MountPathItem {
  /** Path within the container at which the volume should be mounted.  Must not contain ':'. */
  "mountPath": string
  /** mountPropagation determines how mounts are propagated from the host to container and the other way around. When not set, MountPropagationNone is used. This field is beta in 1.10. */
  "mountPropagation"?: string
  /** This must match the Name of a Volume. */
  "name": string
  /** Mounted read-only if true, read-write otherwise (false or unspecified). Defaults to false. */
  "readOnly"?: boolean
  /** Path within the volume from which the container's volume should be mounted. Defaults to "" (volume's root). */
  "subPath"?: string
  /** Expanded path within the volume from which the container's volume should be mounted. Behaves similarly to SubPath but environment variable references $(VAR_NAME) are expanded using the container's environment. Defaults to "" (volume's root). SubPathExpr and SubPath are mutually exclusive. */
  "subPathExpr"?: string
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

export interface SidecarsItem {
  "command"?: string[]
  "env"?: EnvItem[]
  "image": string
  /** PullPolicy describes a policy for if/when to pull a container image */
  "imagePullPolicy"?: string
  "mountPath"?: MountPathItem[]
  "name": string
  "ports"?: PortsItem[]
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  /** SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. */
  "securityContext"?: SecurityContext
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
  /** resources represents the minimum resources the volume should have. If RecoverVolumeExpansionFailure feature is enabled users are allowed to specify resource requirements that are lower than previous value but must still be higher than capacity recorded in the status field of the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#resources */
  "resources"?: Resources2
  /** selector is a label query over volumes to consider for binding. */
  "selector"?: Selector
  /** storageClassName is the name of the StorageClass required by the claim. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#class-1 */
  "storageClassName"?: string
  /** volumeAttributesClassName may be used to set the VolumeAttributesClass used by this claim. If specified, the CSI driver will create or update the volume with the attributes defined in the corresponding VolumeAttributesClass. This has a different purpose than storageClassName, it can be changed after the claim is created. An empty string value means that no VolumeAttributesClass will be applied to the claim but it's not allowed to reset this field to empty string once it is set. If unspecified and the PersistentVolumeClaim is unbound, the default VolumeAttributesClass will be set by the persistentvolume controller if it exists. If the resource referred to by volumeAttributesClass does not exist, this PersistentVolumeClaim will be set to a Pending state, as reflected by the modifyVolumeStatus field, until such as a resource exists. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#volumeattributesclass (Alpha) Using this field requires the VolumeAttributesClass feature gate to be enabled. */
  "volumeAttributesClassName"?: string
  /** volumeMode defines what type of volume is required by the claim. Value of Filesystem is implied when not included in claim spec. */
  "volumeMode"?: string
  /** volumeName is the binding reference to the PersistentVolume backing this claim. */
  "volumeName"?: string
}

export interface ConditionsItem {
  /** lastProbeTime is the time we probed the condition. */
  "lastProbeTime"?: string
  /** lastTransitionTime is the time the condition transitioned from one status to another. */
  "lastTransitionTime"?: string
  /** message is the human-readable message indicating details about last transition. */
  "message"?: string
  /** reason is a unique, this should be a short, machine understandable string that gives the reason for condition's last transition. If it reports "ResizeStarted" that means the underlying persistent volume is being resized. */
  "reason"?: string
  "status": string
  /** PersistentVolumeClaimConditionType is a valid value of PersistentVolumeClaimCondition.Type */
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
  /** allocatedResourceStatuses stores status of resource being resized for the given PVC. Key names follow standard Kubernetes label syntax. Valid values are either: 	* Un-prefixed keys: 		- storage - the capacity of the volume. 	* Custom resources must use implementation-defined prefixed names such as "example.com/my-custom-resource" Apart from above values - keys that are unprefixed or have kubernetes.io prefix are considered reserved and hence may not be used. ClaimResourceStatus can be in any of following states: 	- ControllerResizeInProgress: 		State set when resize controller starts resizing the volume in control-plane. 	- ControllerResizeFailed: 		State set when resize has failed in resize controller with a terminal error. 	- NodeResizePending: 		State set when resize controller has finished resizing the volume but further resizing of 		volume is needed on the node. 	- NodeResizeInProgress: 		State set when kubelet starts resizing the volume. 	- NodeResizeFailed: 		State set when resizing has failed in kubelet with a terminal error. Transient errors don't set 		NodeResizeFailed. For example: if expanding a PVC for more capacity - this field can be one of the following states: 	- pvc.status.allocatedResourceStatus['storage'] = "ControllerResizeInProgress"      - pvc.status.allocatedResourceStatus['storage'] = "ControllerResizeFailed"      - pvc.status.allocatedResourceStatus['storage'] = "NodeResizePending"      - pvc.status.allocatedResourceStatus['storage'] = "NodeResizeInProgress"      - pvc.status.allocatedResourceStatus['storage'] = "NodeResizeFailed" When this field is not set, it means that no resize operation is in progress for the given PVC. A controller that receives PVC update with previously unknown resourceName or ClaimResourceStatus should ignore the update for the purpose it was designed. For example - a controller that only is responsible for resizing capacity of the volume, should ignore PVC updates that change other valid resources associated with PVC. This is an alpha field and requires enabling RecoverVolumeExpansionFailure feature. */
  "allocatedResourceStatuses"?: Record<string, unknown>
  /** allocatedResources tracks the resources allocated to a PVC including its capacity. Key names follow standard Kubernetes label syntax. Valid values are either: 	* Un-prefixed keys: 		- storage - the capacity of the volume. 	* Custom resources must use implementation-defined prefixed names such as "example.com/my-custom-resource" Apart from above values - keys that are unprefixed or have kubernetes.io prefix are considered reserved and hence may not be used. Capacity reported here may be larger than the actual capacity when a volume expansion operation is requested. For storage quota, the larger value from allocatedResources and PVC.spec.resources is used. If allocatedResources is not set, PVC.spec.resources alone is used for quota calculation. If a volume expansion capacity request is lowered, allocatedResources is only lowered if there are no expansion operations in progress and if the actual volume capacity is equal or lower than the requested capacity. A controller that receives PVC update with previously unknown resourceName should ignore the update for the purpose it was designed. For example - a controller that only is responsible for resizing capacity of the volume, should ignore PVC updates that change other valid resources associated with PVC. This is an alpha field and requires enabling RecoverVolumeExpansionFailure feature. */
  "allocatedResources"?: Record<string, unknown>
  /** capacity represents the actual resources of the underlying volume. */
  "capacity"?: Record<string, unknown>
  /** conditions is the current Condition of persistent volume claim. If underlying persistent volume is being resized then the Condition will be set to 'ResizeStarted'. */
  "conditions"?: ConditionsItem[]
  /** currentVolumeAttributesClassName is the current name of the VolumeAttributesClass the PVC is using. When unset, there is no VolumeAttributeClass applied to this PersistentVolumeClaim This is an alpha field and requires enabling VolumeAttributesClass feature. */
  "currentVolumeAttributesClassName"?: string
  /** ModifyVolumeStatus represents the status object of ControllerModifyVolume operation. When this is unset, there is no ModifyVolume operation being attempted. This is an alpha field and requires enabling VolumeAttributesClass feature. */
  "modifyVolumeStatus"?: ModifyVolumeStatus
  /** phase represents the current phase of PersistentVolumeClaim. */
  "phase"?: string
}

export interface NodeConfVolumeClaimTemplate {
  /** APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources */
  "apiVersion"?: string
  /** Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds */
  "kind"?: string
  /** Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata */
  "metadata"?: Record<string, unknown>
  /** spec defines the desired characteristics of a volume requested by a pod author. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "spec"?: Spec
  /** status represents the current information/status of a persistent volume claim. Read-only. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "status"?: Status
}

export interface VolumeClaimTemplate {
  /** APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources */
  "apiVersion"?: string
  /** Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds */
  "kind"?: string
  /** Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata */
  "metadata"?: Record<string, unknown>
  /** spec defines the desired characteristics of a volume requested by a pod author. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "spec"?: Spec
  /** status represents the current information/status of a persistent volume claim. Read-only. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "status"?: Status
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

export interface SecretRef {
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
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
  "secretRef"?: SecretRef
  /** user is optional: User is the rados user name, default is admin More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it */
  "user"?: string
}

export interface Cinder {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Examples: "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "fsType"?: string
  /** readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "readOnly"?: boolean
  /** secretRef is optional: points to a secret object containing parameters used to connect to OpenStack. */
  "secretRef"?: SecretRef
  /** volumeID used to identify the volume in cinder. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "volumeID": string
}

export interface ConfigMap {
  /** defaultMode is optional: mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Defaults to 0644. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** optional specify whether the ConfigMap or its keys must be defined */
  "optional"?: boolean
}

export interface NodePublishSecretRef {
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
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
  /** Required: Selects a field of the pod: only annotations, labels, name and namespace are supported. */
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

export interface EmptyDir {
  /** medium represents what type of storage medium should back this directory. The default is "" which means to use the node's default medium. Must be an empty string (default) or Memory. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "medium"?: string
  /** sizeLimit is the total amount of local storage required for this EmptyDir volume. The size limit is also applicable for memory medium. The maximum usage on memory medium EmptyDir would be the minimum value between the SizeLimit specified here and the sum of memory limits of all containers in a pod. The default is nil which means that the limit is undefined. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "sizeLimit"?: number | string
}

export interface VolumeClaimTemplate2 {
  /** May contain labels and annotations that will be copied into the PVC when creating it. No other fields are allowed and will be rejected during validation. */
  "metadata"?: Record<string, unknown>
  /** The specification for the PersistentVolumeClaim. The entire content is copied unchanged into the PVC that gets created from this template. The same fields as in a PersistentVolumeClaim are also valid here. */
  "spec": Spec
}

export interface Ephemeral {
  /** Will be used to create a stand-alone PVC to provision the volume. The pod in which this EphemeralVolumeSource is embedded will be the owner of the PVC, i.e. the PVC will be deleted together with the pod.  The name of the PVC will be `<pod name>-<volume name>` where `<volume name>` is the name from the `PodSpec.Volumes` array entry. Pod validation will reject the pod if the concatenated name is not valid for a PVC (for example, too long). An existing PVC with that name that is not owned by the pod will *not* be used for the pod to avoid using an unrelated volume by mistake. Starting the pod is then blocked until the unrelated PVC is removed. If such a pre-created PVC is meant to be used by the pod, the PVC has to updated with an owner reference to the pod once the pod exists. Normally this should not be necessary, but it may be useful when manually reconstructing a broken cluster. This field is read-only and no changes will be made by Kubernetes to the PVC after it has been created. Required, must not be nil. */
  "volumeClaimTemplate"?: VolumeClaimTemplate2
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
  "secretRef"?: SecretRef
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
  /** endpoints is the endpoint name that details Glusterfs topology. More info: https://examples.k8s.io/volumes/glusterfs/README.md#create-a-pod */
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
  "secretRef"?: SecretRef
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

export interface ConfigMap2 {
  /** items if unspecified, each key-value pair in the Data field of the referenced ConfigMap will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the ConfigMap, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** optional specify whether the ConfigMap or its keys must be defined */
  "optional"?: boolean
}

export interface DownwardAPI2 {
  /** Items is a list of DownwardAPIVolume file */
  "items"?: ItemsItem2[]
}

export interface Secret2 {
  /** items if unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'. */
  "items"?: ItemsItem[]
  /** Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
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
  "configMap"?: ConfigMap2
  /** downwardAPI information about the downwardAPI data to project */
  "downwardAPI"?: DownwardAPI2
  /** secret information about the secret data to project */
  "secret"?: Secret2
  /** serviceAccountToken is information about the serviceAccountToken data to project */
  "serviceAccountToken"?: ServiceAccountToken
}

export interface Projected {
  /** defaultMode are the mode bits used to set permissions on created files by default. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. Directories within the path are not affected by this setting. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "defaultMode"?: number
  /** sources is the list of volume projections */
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
  "secretRef"?: SecretRef
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
  "secretRef": SecretRef
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

export interface Storageos {
  /** fsType is the filesystem type to mount. Must be a filesystem type supported by the host operating system. Ex. "ext4", "xfs", "ntfs". Implicitly inferred to be "ext4" if unspecified. */
  "fsType"?: string
  /** readOnly defaults to false (read/write). ReadOnly here will force the ReadOnly setting in VolumeMounts. */
  "readOnly"?: boolean
  /** secretRef specifies the secret to use for obtaining the StorageOS API credentials.  If not specified, default values will be attempted. */
  "secretRef"?: SecretRef
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

export interface VolumeItem {
  /** awsElasticBlockStore represents an AWS Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes#awselasticblockstore */
  "awsElasticBlockStore"?: AwsElasticBlockStore
  /** azureDisk represents an Azure Data Disk mount on the host and bind mount to the pod. */
  "azureDisk"?: AzureDisk
  /** azureFile represents an Azure File Service mount on the host and bind mount to the pod. */
  "azureFile"?: AzureFile
  /** cephFS represents a Ceph FS mount on the host that shares a pod's lifetime */
  "cephfs"?: Cephfs
  /** cinder represents a cinder volume attached and mounted on kubelets host machine. More info: https://examples.k8s.io/mysql-cinder-pd/README.md */
  "cinder"?: Cinder
  /** configMap represents a configMap that should populate this volume */
  "configMap"?: ConfigMap
  /** csi (Container Storage Interface) represents ephemeral storage that is handled by certain external CSI drivers (Beta feature). */
  "csi"?: Csi
  /** downwardAPI represents downward API about the pod that should populate this volume */
  "downwardAPI"?: DownwardAPI
  /** emptyDir represents a temporary directory that shares a pod's lifetime. More info: https://kubernetes.io/docs/concepts/storage/volumes#emptydir */
  "emptyDir"?: EmptyDir
  /** ephemeral represents a volume that is handled by a cluster storage driver. The volume's lifecycle is tied to the pod that defines it - it will be created before the pod starts, and deleted when the pod is removed. Use this if: a) the volume is only needed while the pod runs, b) features of normal volumes like restoring from snapshot or capacity    tracking are needed, c) the storage driver is specified through a storage class, and d) the storage driver supports dynamic volume provisioning through    a PersistentVolumeClaim (see EphemeralVolumeSource for more    information on the connection between this volume type    and PersistentVolumeClaim). Use PersistentVolumeClaim or one of the vendor-specific APIs for volumes that persist for longer than the lifecycle of an individual pod. Use CSI for light-weight local ephemeral volumes if the CSI driver is meant to be used that way - see the documentation of the driver for more information. A pod can use both types of ephemeral volumes and persistent volumes at the same time. */
  "ephemeral"?: Ephemeral
  /** fc represents a Fibre Channel resource that is attached to a kubelet's host machine and then exposed to the pod. */
  "fc"?: Fc
  /** flexVolume represents a generic volume resource that is provisioned/attached using an exec based plugin. */
  "flexVolume"?: FlexVolume
  /** flocker represents a Flocker volume attached to a kubelet's host machine. This depends on the Flocker control service being running */
  "flocker"?: Flocker
  /** gcePersistentDisk represents a GCE Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes#gcepersistentdisk */
  "gcePersistentDisk"?: GcePersistentDisk
  /** gitRepo represents a git repository at a particular revision. DEPRECATED: GitRepo is deprecated. To provision a container with a git repo, mount an EmptyDir into an InitContainer that clones the repo using git, then mount the EmptyDir into the Pod's container. */
  "gitRepo"?: GitRepo
  /** glusterfs represents a Glusterfs mount on the host that shares a pod's lifetime. More info: https://examples.k8s.io/volumes/glusterfs/README.md */
  "glusterfs"?: Glusterfs
  /** hostPath represents a pre-existing file or directory on the host machine that is directly exposed to the container. This is generally used for system agents or other privileged things that are allowed to see the host machine. Most containers will NOT need this. More info: https://kubernetes.io/docs/concepts/storage/volumes#hostpath */
  "hostPath"?: HostPath
  /** iscsi represents an ISCSI Disk resource that is attached to a kubelet's host machine and then exposed to the pod. More info: https://examples.k8s.io/volumes/iscsi/README.md */
  "iscsi"?: Iscsi
  /** name of the volume. Must be a DNS_LABEL and unique within the pod. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name": string
  /** nfs represents an NFS mount on the host that shares a pod's lifetime More info: https://kubernetes.io/docs/concepts/storage/volumes#nfs */
  "nfs"?: Nfs
  /** persistentVolumeClaimVolumeSource represents a reference to a PersistentVolumeClaim in the same namespace. More info: https://kubernetes.io/docs/concepts/storage/persistent-volumes#persistentvolumeclaims */
  "persistentVolumeClaim"?: PersistentVolumeClaim
  /** photonPersistentDisk represents a PhotonController persistent disk attached and mounted on kubelets host machine */
  "photonPersistentDisk"?: PhotonPersistentDisk
  /** portworxVolume represents a portworx volume attached and mounted on kubelets host machine */
  "portworxVolume"?: PortworxVolume
  /** projected items for all in one resources secrets, configmaps, and downward API */
  "projected"?: Projected
  /** quobyte represents a Quobyte mount on the host that shares a pod's lifetime */
  "quobyte"?: Quobyte
  /** rbd represents a Rados Block Device mount on the host that shares a pod's lifetime. More info: https://examples.k8s.io/volumes/rbd/README.md */
  "rbd"?: Rbd
  /** scaleIO represents a ScaleIO persistent volume attached and mounted on Kubernetes nodes. */
  "scaleIO"?: ScaleIO
  /** secret represents a secret that should populate this volume. More info: https://kubernetes.io/docs/concepts/storage/volumes#secret */
  "secret"?: Secret
  /** storageOS represents a StorageOS volume attached and mounted on Kubernetes nodes. */
  "storageos"?: Storageos
  /** vsphereVolume represents a vSphere volume attached and mounted on kubelets host machine */
  "vsphereVolume"?: VsphereVolume
}

export interface VolumeMount {
  "mountPath"?: MountPathItem[]
  "volume"?: VolumeItem[]
}

export interface Storage {
  "keepAfterDelete"?: boolean
  "nodeConfVolume"?: boolean
  /** PersistentVolumeClaim is a user's request for and claim to a persistent volume */
  "nodeConfVolumeClaimTemplate"?: NodeConfVolumeClaimTemplate
  /** PersistentVolumeClaim is a user's request for and claim to a persistent volume */
  "volumeClaimTemplate"?: VolumeClaimTemplate
  /** Additional Volume is provided by user that is mounted on the pods */
  "volumeMount"?: VolumeMount
}

export interface RedisClusterSpec {
  /** TLS Configuration for redis instances */
  "TLS"?: TLS
  "acl"?: Acl
  /** ClusterSize defines the default number of replicas for both leader and follower when not explicitly set */
  "clusterSize": number
  "clusterVersion"?: string
  "env"?: EnvItem[]
  "hostNetwork"?: boolean
  "hostPort"?: number
  /** InitContainer for each Redis pods */
  "initContainer"?: InitContainer
  /** KubernetesConfig will be the JSON struct for Basic Redis Config */
  "kubernetesConfig": KubernetesConfig
  "persistenceEnabled"?: boolean
  /** PodSecurityContext holds pod-level security attributes and common container settings. Some fields are also present in container.securityContext.  Field values of container.securityContext take precedence over field values of PodSecurityContext. */
  "podSecurityContext"?: PodSecurityContext
  "port"?: number
  "priorityClassName"?: string
  /** RedisConfig defines the external configuration of Redis */
  "redisConfig"?: RedisConfig
  /** RedisExporter interface will have the information for redis exporter related stuff */
  "redisExporter"?: RedisExporter
  /** RedisFollower interface will have the redis follower configuration */
  "redisFollower"?: RedisFollower
  /** RedisLeader interface will have the redis leader configuration */
  "redisLeader"?: RedisLeader
  /** ResourceRequirements describes the compute resource requirements. */
  "resources"?: Resources
  "serviceAccountName"?: string
  "sidecars"?: SidecarsItem[]
  /** Node-conf needs to be added only in redis cluster */
  "storage"?: Storage
}

export interface RedisClusterStatus {
  "readyFollowerReplicas"?: number
  "readyLeaderReplicas"?: number
  "reason"?: string
  "state"?: string
}

export interface Storage2 {
  "keepAfterDelete"?: boolean
  /** PersistentVolumeClaim is a user's request for and claim to a persistent volume */
  "volumeClaimTemplate"?: VolumeClaimTemplate
  /** Additional Volume is provided by user that is mounted on the pods */
  "volumeMount"?: VolumeMount
}

export interface RedisReplicationSpec {
  /** TLS Configuration for redis instances */
  "TLS"?: TLS
  "acl"?: Acl
  /** Affinity is a group of affinity scheduling rules. */
  "affinity"?: Affinity
  "clusterSize": number
  "env"?: EnvItem[]
  "hostPort"?: number
  /** InitContainer for each Redis pods */
  "initContainer"?: InitContainer
  /** KubernetesConfig will be the JSON struct for Basic Redis Config */
  "kubernetesConfig": KubernetesConfig
  /** Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. */
  "livenessProbe"?: LivenessProbe
  "nodeSelector"?: Record<string, unknown>
  /** RedisPodDisruptionBudget configure a PodDisruptionBudget on the resource (leader/follower) */
  "pdb"?: Pdb
  /** PodSecurityContext holds pod-level security attributes and common container settings. Some fields are also present in container.securityContext.  Field values of container.securityContext take precedence over field values of PodSecurityContext. */
  "podSecurityContext"?: PodSecurityContext
  "priorityClassName"?: string
  /** Probe describes a health check to be performed against a container to determine whether it is alive or ready to receive traffic. */
  "readinessProbe"?: ReadinessProbe
  /** RedisConfig defines the external configuration of Redis */
  "redisConfig"?: RedisConfig
  /** RedisExporter interface will have the information for redis exporter related stuff */
  "redisExporter"?: RedisExporter
  /** SecurityContext holds security configuration that will be applied to a container. Some fields are present in both SecurityContext and PodSecurityContext.  When both are set, the values in SecurityContext take precedence. */
  "securityContext"?: SecurityContext
  "serviceAccountName"?: string
  "sidecars"?: SidecarsItem[]
  /** Storage is the inteface to add pvc and pv support in redis */
  "storage"?: Storage2
  "terminationGracePeriodSeconds"?: number
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
}

export interface RedisReplicationStatus {
  "masterNode"?: string
}
