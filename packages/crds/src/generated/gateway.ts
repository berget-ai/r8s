/**
 * GENERATED from gateway CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface EnvoyProxy {
  apiVersion: 'gateway.envoyproxy.io/v1alpha1'
  kind: 'EnvoyProxy'
  metadata: ObjectMeta
  spec: EnvoyProxySpec
  status?: EnvoyProxyStatus
}

/** Props for the {@link EnvoyProxy} component — a 1:1 mapping of the gateway.envoyproxy.io/v1alpha1 CRD. */
export interface EnvoyProxyProps {
  metadata: ObjectMeta
  spec: EnvoyProxySpec
}

/** Render a EnvoyProxy (gateway.envoyproxy.io/v1alpha1) exactly as defined by its CRD. */
export function EnvoyProxyComponent(props: EnvoyProxyProps) {
  return jsx('EnvoyProxy', {
    apiVersion: 'gateway.envoyproxy.io/v1alpha1',
    kind: 'EnvoyProxy',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Gateway {
  apiVersion: 'gateway.networking.k8s.io/v1'
  kind: 'Gateway'
  metadata: ObjectMeta
  spec: GatewaySpec
  status?: GatewayStatus
}

/** Props for the {@link Gateway} component — a 1:1 mapping of the gateway.networking.k8s.io/v1 CRD. */
export interface GatewayProps {
  metadata: ObjectMeta
  spec: GatewaySpec
}

/** Render a Gateway (gateway.networking.k8s.io/v1) exactly as defined by its CRD. */
export function GatewayComponent(props: GatewayProps) {
  return jsx('Gateway', {
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'Gateway',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface HTTPRoute {
  apiVersion: 'gateway.networking.k8s.io/v1'
  kind: 'HTTPRoute'
  metadata: ObjectMeta
  spec: HTTPRouteSpec
  status?: HTTPRouteStatus
}

/** Props for the {@link HTTPRoute} component — a 1:1 mapping of the gateway.networking.k8s.io/v1 CRD. */
export interface HTTPRouteProps {
  metadata: ObjectMeta
  spec: HTTPRouteSpec
}

/** Render a HTTPRoute (gateway.networking.k8s.io/v1) exactly as defined by its CRD. */
export function HTTPRouteComponent(props: HTTPRouteProps) {
  return jsx('HTTPRoute', {
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'HTTPRoute',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface ClientCertificateRef {
  /** Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred. */
  "group"?: string
  /** Kind is kind of the referent. For example "Secret". */
  "kind"?: string
  /** Name is the name of the referent. */
  "name": string
  /** Namespace is the namespace of the referenced object. When unspecified, the local namespace is inferred. Note that when a namespace different than the local namespace is specified, a ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. Support: Core */
  "namespace"?: string
}

export interface BackendTLS {
  /** ALPNProtocols supplies the list of ALPN protocols that should be exposed by the listener or used by the proxy to connect to the backend. Defaults: 1. HTTPS Routes: h2 and http/1.1 are enabled in listener context. 2. Other Routes: ALPN is disabled. 3. Backends: proxy uses the appropriate ALPN options for the backend protocol. When an empty list is provided, the ALPN TLS extension is disabled. Defaults to [h2, http/1.1] if not specified. Typical Supported values are: - http/1.0 - http/1.1 - h2 */
  "alpnProtocols"?: string[]
  /** Ciphers specifies the set of cipher suites supported when negotiating TLS 1.0 - 1.2. This setting has no effect for TLS 1.3. In non-FIPS Envoy Proxy builds the default cipher list is: - [ECDHE-ECDSA-AES128-GCM-SHA256|ECDHE-ECDSA-CHACHA20-POLY1305] - [ECDHE-RSA-AES128-GCM-SHA256|ECDHE-RSA-CHACHA20-POLY1305] - ECDHE-ECDSA-AES256-GCM-SHA384 - ECDHE-RSA-AES256-GCM-SHA384 In builds using BoringSSL FIPS the default cipher list is: - ECDHE-ECDSA-AES128-GCM-SHA256 - ECDHE-RSA-AES128-GCM-SHA256 - ECDHE-ECDSA-AES256-GCM-SHA384 - ECDHE-RSA-AES256-GCM-SHA384 */
  "ciphers"?: string[]
  /** ClientCertificateRef defines the reference to a Kubernetes Secret that contains the client certificate and private key for Envoy to use when connecting to backend services and external services, such as ExtAuth, ALS, OpenTelemetry, etc. This secret should be located within the same namespace as the Envoy proxy resource that references it. */
  "clientCertificateRef"?: ClientCertificateRef
  /** ECDHCurves specifies the set of supported ECDH curves. In non-FIPS Envoy Proxy builds the default curves are: - X25519 - P-256 In builds using BoringSSL FIPS the default curve is: - P-256 */
  "ecdhCurves"?: string[]
  /** Max specifies the maximal TLS protocol version to allow The default is TLS 1.3 if this is not specified. */
  "maxVersion"?: "Auto" | "1.0" | "1.1" | "1.2" | "1.3"
  /** Min specifies the minimal TLS protocol version to allow. The default is TLS 1.2 if this is not specified. */
  "minVersion"?: "Auto" | "1.0" | "1.1" | "1.2" | "1.3"
  /** SignatureAlgorithms specifies which signature algorithms the listener should support. */
  "signatureAlgorithms"?: string[]
}

export interface JsonPatchesItem {
  /** From is the source location of the value to be copied or moved. Only valid for move or copy operations Refer to https://datatracker.ietf.org/doc/html/rfc6901 for more details. */
  "from"?: string
  /** JSONPath is a JSONPath expression. Refer to https://datatracker.ietf.org/doc/rfc9535/ for more details. It produces one or more JSONPointer expressions based on the given JSON document. If no JSONPointer is found, it will result in an error. If the 'Path' property is also set, it will be appended to the resulting JSONPointer expressions from the JSONPath evaluation. This is useful when creating a property that does not yet exist in the JSON document. The final JSONPointer expressions specifies the locations in the target document/field where the operation will be applied. */
  "jsonPath"?: string
  /** Op is the type of operation to perform */
  "op": "add" | "remove" | "replace" | "move" | "copy" | "test"
  /** Path is a JSONPointer expression. Refer to https://datatracker.ietf.org/doc/html/rfc6901 for more details. It specifies the location of the target document/field where the operation will be performed */
  "path"?: string
  /** Value is the new value of the path location. The value is only used by the `add` and `replace` operations. */
  "value"?: Record<string, unknown>
}

export interface Bootstrap {
  /** JSONPatches is an array of JSONPatches to be applied to the default bootstrap. Patches are applied in the order in which they are defined. */
  "jsonPatches"?: JsonPatchesItem[]
  /** Type is the type of the bootstrap configuration, it should be either **Replace**,  **Merge**, or **JSONPatch**. If unspecified, it defaults to Replace. */
  "type"?: "Merge" | "Replace" | "JSONPatch"
  /** Value is a YAML string of the bootstrap. */
  "value"?: string
}

export interface FilterOrderItem {
  /** After defines the filter that should come after the filter. Only one of Before or After must be set. */
  "after"?: "envoy.filters.http.custom_response" | "envoy.filters.http.health_check" | "envoy.filters.http.fault" | "envoy.filters.http.cors" | "envoy.filters.http.header_mutation" | "envoy.filters.http.ext_authz" | "envoy.filters.http.api_key_auth" | "envoy.filters.http.basic_auth" | "envoy.filters.http.oauth2" | "envoy.filters.http.jwt_authn" | "envoy.filters.http.stateful_session" | "envoy.filters.http.buffer" | "envoy.filters.http.lua" | "envoy.filters.http.ext_proc" | "envoy.filters.http.wasm" | "envoy.filters.http.rbac" | "envoy.filters.http.local_ratelimit" | "envoy.filters.http.ratelimit" | "envoy.filters.http.grpc_web" | "envoy.filters.http.grpc_stats" | "envoy.filters.http.credential_injector" | "envoy.filters.http.compressor" | "envoy.filters.http.dynamic_forward_proxy"
  /** Before defines the filter that should come before the filter. Only one of Before or After must be set. */
  "before"?: "envoy.filters.http.custom_response" | "envoy.filters.http.health_check" | "envoy.filters.http.fault" | "envoy.filters.http.cors" | "envoy.filters.http.header_mutation" | "envoy.filters.http.ext_authz" | "envoy.filters.http.api_key_auth" | "envoy.filters.http.basic_auth" | "envoy.filters.http.oauth2" | "envoy.filters.http.jwt_authn" | "envoy.filters.http.stateful_session" | "envoy.filters.http.buffer" | "envoy.filters.http.lua" | "envoy.filters.http.ext_proc" | "envoy.filters.http.wasm" | "envoy.filters.http.rbac" | "envoy.filters.http.local_ratelimit" | "envoy.filters.http.ratelimit" | "envoy.filters.http.grpc_web" | "envoy.filters.http.grpc_stats" | "envoy.filters.http.credential_injector" | "envoy.filters.http.compressor" | "envoy.filters.http.dynamic_forward_proxy"
  /** Name of the filter. */
  "name": "envoy.filters.http.custom_response" | "envoy.filters.http.health_check" | "envoy.filters.http.fault" | "envoy.filters.http.cors" | "envoy.filters.http.header_mutation" | "envoy.filters.http.ext_authz" | "envoy.filters.http.api_key_auth" | "envoy.filters.http.basic_auth" | "envoy.filters.http.oauth2" | "envoy.filters.http.jwt_authn" | "envoy.filters.http.stateful_session" | "envoy.filters.http.buffer" | "envoy.filters.http.lua" | "envoy.filters.http.ext_proc" | "envoy.filters.http.wasm" | "envoy.filters.http.rbac" | "envoy.filters.http.local_ratelimit" | "envoy.filters.http.ratelimit" | "envoy.filters.http.grpc_web" | "envoy.filters.http.grpc_stats" | "envoy.filters.http.credential_injector" | "envoy.filters.http.compressor" | "envoy.filters.http.dynamic_forward_proxy"
}

export interface Logging {
  /** Level is a map of logging level per component, where the component is the key and the log level is the value. If unspecified, defaults to "default: warn". */
  "level"?: Record<string, unknown>
}

export interface Host {
  /** EnvoyVersion is the version of Envoy to use. If unspecified, the version against which Envoy Gateway is built will be used. */
  "envoyVersion"?: string
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

export interface Container {
  /** List of environment variables to set in the container. */
  "env"?: EnvItem[]
  /** Image specifies the EnvoyProxy container image to be used including a tag, instead of the default image. This field is mutually exclusive with ImageRepository. */
  "image"?: string
  /** ImageRepository specifies the container image repository to be used without specifying a tag. The default tag will be used. This field is mutually exclusive with Image. */
  "imageRepository"?: string
  /** Resources required by this container. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ */
  "resources"?: Resources
  /** SecurityContext defines the security options the container should be run with. If set, the fields of SecurityContext override the equivalent fields of PodSecurityContext. More info: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ */
  "securityContext"?: SecurityContext
  /** VolumeMounts are volumes to mount into the container's filesystem. Cannot be updated. */
  "volumeMounts"?: VolumeMountsItem[]
}

export interface Patch {
  /** Type is the type of merge operation to perform By default, StrategicMerge is used as the patch type. */
  "type"?: string
  /** Object contains the raw configuration for merged object */
  "value": Record<string, unknown>
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

export interface ImagePullSecretsItem {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
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

export interface ItemsItem {
  /** key is the key to project. */
  "key": string
  /** mode is Optional: mode bits used to set permissions on this file. Must be an octal value between 0000 and 0777 or a decimal value between 0 and 511. YAML accepts both octal and decimal values, JSON requires decimal values for mode bits. If not specified, the volume defaultMode will be used. This might be in conflict with other options that affect the file mode, like fsGroup, and the result can be other mode bits set. */
  "mode"?: number
  /** path is the relative path of the file to map the key to. May not be an absolute path. May not contain the path element '..'. May not start with the string '..'. */
  "path": string
}

export interface ConfigMap {
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

export interface Secret {
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
  "configMap"?: ConfigMap2
  /** downwardAPI information about the downwardAPI data to project */
  "downwardAPI"?: DownwardAPI2
  /** Projects an auto-rotating credential bundle (private key and certificate chain) that the pod can use either as a TLS client or server. Kubelet generates a private key and uses it to send a PodCertificateRequest to the named signer.  Once the signer approves the request and issues a certificate chain, Kubelet writes the key and certificate chain to the pod filesystem.  The pod does not start until certificates have been issued for each podCertificate projected volume source in its spec. Kubelet will begin trying to rotate the certificate at the time indicated by the signer using the PodCertificateRequest.Status.BeginRefreshAt timestamp. Kubelet can write a single file, indicated by the credentialBundlePath field, or separate files, indicated by the keyPath and certificateChainPath fields. The credential bundle is a single file in PEM format.  The first PEM entry is the private key (in PKCS#8 format), and the remaining PEM entries are the certificate chain issued by the signer (typically, signers will return their certificate chain in leaf-to-root order). Prefer using the credential bundle format, since your application code can read it atomically.  If you use keyPath and certificateChainPath, your application must make two separate file reads. If these coincide with a certificate rotation, it is possible that the private key and leaf certificate you read may not correspond to each other.  Your application will need to check for this condition, and re-read until they are consistent. The named signer controls chooses the format of the certificate it issues; consult the signer implementation's documentation to learn how to use the certificates it issues. */
  "podCertificate"?: PodCertificate
  /** secret information about the secret data to project */
  "secret"?: Secret
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

export interface Secret2 {
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
  "configMap"?: ConfigMap
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
  "secret"?: Secret2
  /** storageOS represents a StorageOS volume attached and mounted on Kubernetes nodes. Deprecated: StorageOS is deprecated and the in-tree storageos type is no longer supported. */
  "storageos"?: Storageos
  /** vsphereVolume represents a vSphere volume attached and mounted on kubelets host machine. Deprecated: VsphereVolume is deprecated. All operations for the in-tree vsphereVolume type are redirected to the csi.vsphere.vmware.com CSI driver. */
  "vsphereVolume"?: VsphereVolume
}

export interface Pod {
  /** If specified, the pod's scheduling constraints. */
  "affinity"?: Affinity
  /** Annotations are the annotations that should be appended to the pods. By default, no pod annotations are appended. */
  "annotations"?: Record<string, unknown>
  /** ImagePullSecrets is an optional list of references to secrets in the same namespace to use for pulling any of the images used by this PodSpec. If specified, these secrets will be passed to individual puller implementations for them to use. More info: https://kubernetes.io/docs/concepts/containers/images#specifying-imagepullsecrets-on-a-pod */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** Labels are the additional labels that should be tagged to the pods. By default, no additional pod labels are tagged. */
  "labels"?: Record<string, unknown>
  /** NodeSelector is a selector which must be true for the pod to fit on a node. Selector which must match a node's labels for the pod to be scheduled on that node. More info: https://kubernetes.io/docs/concepts/configuration/assign-pod-node/ */
  "nodeSelector"?: Record<string, unknown>
  /** PriorityClassName indicates the importance of a Pod relative to other Pods. If a PriorityClassName is not specified, the pod priority will be default or zero if there is no default. More info: https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/ */
  "priorityClassName"?: string
  /** SecurityContext holds pod-level security attributes and common container settings. Optional: Defaults to empty.  See type description for default values of each field. */
  "securityContext"?: SecurityContext2
  /** If specified, the pod's tolerations. */
  "tolerations"?: TolerationsItem[]
  /** TopologySpreadConstraints describes how a group of pods ought to spread across topology domains. Scheduler will schedule pods in a way which abides by the constraints. All topologySpreadConstraints are ANDed. */
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  /** Volumes that can be mounted by containers belonging to the pod. More info: https://kubernetes.io/docs/concepts/storage/volumes */
  "volumes"?: VolumesItem[]
}

export interface RollingUpdate {
  /** The maximum number of nodes with an existing available DaemonSet pod that can have an updated DaemonSet pod during during an update. Value can be an absolute number (ex: 5) or a percentage of desired pods (ex: 10%). This can not be 0 if MaxUnavailable is 0. Absolute number is calculated from percentage by rounding up to a minimum of 1. Default value is 0. Example: when this is set to 30%, at most 30% of the total number of nodes that should be running the daemon pod (i.e. status.desiredNumberScheduled) can have their a new pod created before the old pod is marked as deleted. The update starts by launching new pods on 30% of nodes. Once an updated pod is available (Ready for at least minReadySeconds) the old DaemonSet pod on that node is marked deleted. If the old pod becomes unavailable for any reason (Ready transitions to false, is evicted, or is drained) an updated pod is immediately created on that node without considering surge limits. Allowing surge implies the possibility that the resources consumed by the daemonset on any given node can double if the readiness check fails, and so resource intensive daemonsets should take into account that they may cause evictions during disruption. */
  "maxSurge"?: number | string
  /** The maximum number of DaemonSet pods that can be unavailable during the update. Value can be an absolute number (ex: 5) or a percentage of total number of DaemonSet pods at the start of the update (ex: 10%). Absolute number is calculated from percentage by rounding up. This cannot be 0 if MaxSurge is 0 Default value is 1. Example: when this is set to 30%, at most 30% of the total number of nodes that should be running the daemon pod (i.e. status.desiredNumberScheduled) can have their pods stopped for an update at any given time. The update starts by stopping at most 30% of those DaemonSet pods and then brings up new DaemonSet pods in their place. Once the new pods are available, it then proceeds onto other DaemonSet pods, thus ensuring that at least 70% of original number of DaemonSet pods are available at all times during the update. */
  "maxUnavailable"?: number | string
}

export interface Strategy {
  /** Rolling update config params. Present only if type = "RollingUpdate". */
  "rollingUpdate"?: RollingUpdate
  /** Type of daemon set update. Can be "RollingUpdate" or "OnDelete". Default is RollingUpdate. */
  "type"?: string
}

export interface EnvoyDaemonSet {
  /** Container defines the desired specification of main container. */
  "container"?: Container
  /** Name of the daemonSet. When unset, this defaults to an autogenerated name. */
  "name"?: string
  /** Patch defines how to perform the patch operation to daemonset */
  "patch"?: Patch
  /** Pod defines the desired specification of pod. */
  "pod"?: Pod
  /** The daemonset strategy to use to replace existing pods with new ones. */
  "strategy"?: Strategy
}

export interface ConfigMapRef {
  /** Name of the referent. This field is effectively required, but due to backwards compatibility is allowed to be empty. Instances of this type with an empty value here are almost certainly wrong. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name"?: string
  /** Specify whether the ConfigMap must be defined */
  "optional"?: boolean
}

export interface SecretRef2 {
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
  "secretRef"?: SecretRef2
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

export interface EnvoyDeployment {
  /** Container defines the desired specification of main container. */
  "container"?: Container
  /** List of initialization containers belonging to the pod. More info: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ */
  "initContainers"?: InitContainersItem[]
  /** Name of the deployment. When unset, this defaults to an autogenerated name. */
  "name"?: string
  /** Patch defines how to perform the patch operation to deployment */
  "patch"?: Patch
  /** Pod defines the desired specification of pod. */
  "pod"?: Pod
  /** Replicas is the number of desired pods. Defaults to 1. */
  "replicas"?: number
  /** The deployment strategy to use to replace existing pods with new ones. */
  "strategy"?: Strategy
}

export interface PoliciesItem {
  /** periodSeconds specifies the window of time for which the policy should hold true. PeriodSeconds must be greater than zero and less than or equal to 1800 (30 min). */
  "periodSeconds": number
  /** type is used to specify the scaling policy. */
  "type": string
  /** value contains the amount of change which is permitted by the policy. It must be greater than zero */
  "value": number
}

export interface ScaleDown {
  /** policies is a list of potential scaling polices which can be used during scaling. If not set, use the default values: - For scale up: allow doubling the number of pods, or an absolute change of 4 pods in a 15s window. - For scale down: allow all pods to be removed in a 15s window. */
  "policies"?: PoliciesItem[]
  /** selectPolicy is used to specify which policy should be used. If not set, the default value Max is used. */
  "selectPolicy"?: string
  /** stabilizationWindowSeconds is the number of seconds for which past recommendations should be considered while scaling up or scaling down. StabilizationWindowSeconds must be greater than or equal to zero and less than or equal to 3600 (one hour). If not set, use the default values: - For scale up: 0 (i.e. no stabilization is done). - For scale down: 300 (i.e. the stabilization window is 300 seconds long). */
  "stabilizationWindowSeconds"?: number
  /** tolerance is the tolerance on the ratio between the current and desired metric value under which no updates are made to the desired number of replicas (e.g. 0.01 for 1%). Must be greater than or equal to zero. If not set, the default cluster-wide tolerance is applied (by default 10%). For example, if autoscaling is configured with a memory consumption target of 100Mi, and scale-down and scale-up tolerances of 5% and 1% respectively, scaling will be triggered when the actual consumption falls below 95Mi or exceeds 101Mi. This is an beta field and requires the HPAConfigurableTolerance feature gate to be enabled. */
  "tolerance"?: number | string
}

export interface ScaleUp {
  /** policies is a list of potential scaling polices which can be used during scaling. If not set, use the default values: - For scale up: allow doubling the number of pods, or an absolute change of 4 pods in a 15s window. - For scale down: allow all pods to be removed in a 15s window. */
  "policies"?: PoliciesItem[]
  /** selectPolicy is used to specify which policy should be used. If not set, the default value Max is used. */
  "selectPolicy"?: string
  /** stabilizationWindowSeconds is the number of seconds for which past recommendations should be considered while scaling up or scaling down. StabilizationWindowSeconds must be greater than or equal to zero and less than or equal to 3600 (one hour). If not set, use the default values: - For scale up: 0 (i.e. no stabilization is done). - For scale down: 300 (i.e. the stabilization window is 300 seconds long). */
  "stabilizationWindowSeconds"?: number
  /** tolerance is the tolerance on the ratio between the current and desired metric value under which no updates are made to the desired number of replicas (e.g. 0.01 for 1%). Must be greater than or equal to zero. If not set, the default cluster-wide tolerance is applied (by default 10%). For example, if autoscaling is configured with a memory consumption target of 100Mi, and scale-down and scale-up tolerances of 5% and 1% respectively, scaling will be triggered when the actual consumption falls below 95Mi or exceeds 101Mi. This is an beta field and requires the HPAConfigurableTolerance feature gate to be enabled. */
  "tolerance"?: number | string
}

export interface Behavior {
  /** scaleDown is scaling policy for scaling Down. If not set, the default value is to allow to scale down to minReplicas pods, with a 300 second stabilization window (i.e., the highest recommendation for the last 300sec is used). */
  "scaleDown"?: ScaleDown
  /** scaleUp is scaling policy for scaling Up. If not set, the default value is the higher of:   * increase no more than 4 pods per 60 seconds   * double the number of pods per 60 seconds No stabilization is used. */
  "scaleUp"?: ScaleUp
}

export interface Target {
  /** averageUtilization is the target value of the average of the resource metric across all relevant pods, represented as a percentage of the requested value of the resource for the pods. Currently only valid for Resource metric source type */
  "averageUtilization"?: number
  /** averageValue is the target value of the average of the metric across all relevant pods (as a quantity) */
  "averageValue"?: number | string
  /** type represents whether the metric type is Utilization, Value, or AverageValue */
  "type": string
  /** value is the target value of the metric (as a quantity). */
  "value"?: number | string
}

export interface ContainerResource {
  /** container is the name of the container in the pods of the scaling target */
  "container": string
  /** name is the name of the resource in question. */
  "name": string
  /** target specifies the target value for the given metric */
  "target": Target
}

export interface Metric {
  /** name is the name of the given metric */
  "name": string
  /** selector is the string-encoded form of a standard kubernetes label selector for the given metric When set, it is passed as an additional parameter to the metrics server for more specific metrics scoping. When unset, just the metricName will be used to gather metrics. */
  "selector"?: Selector
}

export interface External {
  /** metric identifies the target metric by name and selector */
  "metric": Metric
  /** target specifies the target value for the given metric */
  "target": Target
}

export interface DescribedObject {
  /** apiVersion is the API version of the referent */
  "apiVersion"?: string
  /** kind is the kind of the referent; More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds */
  "kind": string
  /** name is the name of the referent; More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names */
  "name": string
}

export interface Object {
  /** describedObject specifies the descriptions of a object,such as kind,name apiVersion */
  "describedObject": DescribedObject
  /** metric identifies the target metric by name and selector */
  "metric": Metric
  /** target specifies the target value for the given metric */
  "target": Target
}

export interface Pods {
  /** metric identifies the target metric by name and selector */
  "metric": Metric
  /** target specifies the target value for the given metric */
  "target": Target
}

export interface Resource {
  /** name is the name of the resource in question. */
  "name": string
  /** target specifies the target value for the given metric */
  "target": Target
}

export interface MetricsItem {
  /** containerResource refers to a resource metric (such as those specified in requests and limits) known to Kubernetes describing a single container in each pod of the current scale target (e.g. CPU or memory). Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source. */
  "containerResource"?: ContainerResource
  /** external refers to a global metric that is not associated with any Kubernetes object. It allows autoscaling based on information coming from components running outside of cluster (for example length of queue in cloud messaging service, or QPS from loadbalancer running outside of cluster). */
  "external"?: External
  /** object refers to a metric describing a single kubernetes object (for example, hits-per-second on an Ingress object). */
  "object"?: Object
  /** pods refers to a metric describing each pod in the current scale target (for example, transactions-processed-per-second).  The values will be averaged together before being compared to the target value. */
  "pods"?: Pods
  /** resource refers to a resource metric (such as those specified in requests and limits) known to Kubernetes describing each pod in the current scale target (e.g. CPU or memory). Such metrics are built in to Kubernetes, and have special scaling options on top of those available to normal per-pod metrics using the "pods" source. */
  "resource"?: Resource
  /** type is the type of metric source.  It should be one of "ContainerResource", "External", "Object", "Pods" or "Resource", each mapping to a matching field in the object. */
  "type": string
}

export interface EnvoyHpa {
  /** behavior configures the scaling behavior of the target in both Up and Down directions (scaleUp and scaleDown fields respectively). If not set, the default HPAScalingRules for scale up and scale down are used. See k8s.io.autoscaling.v2.HorizontalPodAutoScalerBehavior. */
  "behavior"?: Behavior
  /** maxReplicas is the upper limit for the number of replicas to which the autoscaler can scale up. It cannot be less that minReplicas. */
  "maxReplicas": number
  /** metrics contains the specifications for which to use to calculate the desired replica count (the maximum replica count across all metrics will be used). If left empty, it defaults to being based on CPU utilization with average on 80% usage. */
  "metrics"?: MetricsItem[]
  /** minReplicas is the lower limit for the number of replicas to which the autoscaler can scale down. It defaults to 1 replica. */
  "minReplicas"?: number
  /** Name of the horizontalPodAutoScaler. When unset, this defaults to an autogenerated name. */
  "name"?: string
  /** Patch defines how to perform the patch operation to the HorizontalPodAutoscaler */
  "patch"?: Patch
}

export interface EnvoyPDB {
  /** MaxUnavailable specifies the maximum amount of pods (can be expressed as integers or as a percentage) that can be unavailable at all times during voluntary disruptions, such as node drains or updates. This setting ensures that your envoy proxy maintains a certain level of availability and resilience during maintenance operations. Cannot be combined with minAvailable. */
  "maxUnavailable"?: number | string
  /** MinAvailable specifies the minimum amount of pods (can be expressed as integers or as a percentage) that must be available at all times during voluntary disruptions, such as node drains or updates. This setting ensures that your envoy proxy maintains a certain level of availability and resilience during maintenance operations. Cannot be combined with maxUnavailable. */
  "minAvailable"?: number | string
  /** Name of the podDisruptionBudget. When unset, this defaults to an autogenerated name. */
  "name"?: string
  /** Patch defines how to perform the patch operation to the PodDisruptionBudget */
  "patch"?: Patch
}

export interface EnvoyService {
  /** AllocateLoadBalancerNodePorts defines if NodePorts will be automatically allocated for services with type LoadBalancer. Default is "true". It may be set to "false" if the cluster load-balancer does not rely on NodePorts. If the caller requests specific NodePorts (by specifying a value), those requests will be respected, regardless of this field. This field may only be set for services with type LoadBalancer and will be cleared if the type is changed to any other type. */
  "allocateLoadBalancerNodePorts"?: boolean
  /** Annotations that should be appended to the service. By default, no annotations are appended. */
  "annotations"?: Record<string, unknown>
  /** ExternalTrafficPolicy determines the externalTrafficPolicy for the Envoy Service. Valid options are Local and Cluster. Default is "Local". "Local" means traffic will only go to pods on the node receiving the traffic. "Cluster" means connections are loadbalanced to all pods in the cluster. */
  "externalTrafficPolicy"?: "Local" | "Cluster"
  /** Labels that should be appended to the service. By default, no labels are appended. */
  "labels"?: Record<string, unknown>
  /** LoadBalancerClass, when specified, allows for choosing the LoadBalancer provider implementation if more than one are available or is otherwise expected to be specified */
  "loadBalancerClass"?: string
  /** LoadBalancerIP defines the IP Address of the underlying load balancer service. This field may be ignored if the load balancer provider does not support this feature. This field has been deprecated in Kubernetes, but it is still used for setting the IP Address in some cloud providers such as GCP. */
  "loadBalancerIP"?: string
  /** LoadBalancerSourceRanges defines a list of allowed IP addresses which will be configured as firewall rules on the platform providers load balancer. This is not guaranteed to be working as it happens outside of kubernetes and has to be supported and handled by the platform provider. This field may only be set for services with type LoadBalancer and will be cleared if the type is changed to any other type. */
  "loadBalancerSourceRanges"?: string[]
  /** Name of the service. When unset, this defaults to an autogenerated name. */
  "name"?: string
  /** Patch defines how to perform the patch operation to the service */
  "patch"?: Patch
  /** Type determines how the Service is exposed. Defaults to LoadBalancer. Valid options are ClusterIP, LoadBalancer and NodePort. "LoadBalancer" means a service will be exposed via an external load balancer (if the cloud provider supports it). "ClusterIP" means a service will only be accessible inside the cluster, via the cluster IP. "NodePort" means a service will be exposed on a static Port on all Nodes of the cluster. */
  "type"?: "ClusterIP" | "LoadBalancer" | "NodePort"
}

export interface EnvoyServiceAccount {
  /** Name of the Service Account. When unset, this defaults to an autogenerated name. */
  "name"?: string
}

export interface Kubernetes {
  /** EnvoyDaemonSet defines the desired state of the Envoy daemonset resource. Disabled by default, a deployment resource is used instead to provision the Envoy Proxy fleet */
  "envoyDaemonSet"?: EnvoyDaemonSet
  /** EnvoyDeployment defines the desired state of the Envoy deployment resource. If unspecified, default settings for the managed Envoy deployment resource are applied. */
  "envoyDeployment"?: EnvoyDeployment
  /** EnvoyHpa defines the Horizontal Pod Autoscaler settings for Envoy Proxy Deployment. */
  "envoyHpa"?: EnvoyHpa
  /** EnvoyPDB allows to control the pod disruption budget of an Envoy Proxy. */
  "envoyPDB"?: EnvoyPDB
  /** EnvoyService defines the desired state of the Envoy service resource. If unspecified, default settings for the managed Envoy service resource are applied. */
  "envoyService"?: EnvoyService
  /** EnvoyServiceAccount defines the desired state of the Envoy service account resource. */
  "envoyServiceAccount"?: EnvoyServiceAccount
  /** UseListenerPortAsContainerPort disables the port shifting feature in the Envoy Proxy. When set to false (default value), if the service port is a privileged port (1-1023), add a constant to the value converting it into an ephemeral port. This allows the container to bind to the port without needing a CAP_NET_BIND_SERVICE capability. */
  "useListenerPortAsContainerPort"?: boolean
}

export interface Provider {
  /** Host provides runtime deployment of the data plane as a child process on the host environment. If unspecified and type is "Host", default settings for the custom provider are applied. */
  "host"?: Host
  /** Kubernetes defines the desired state of the Kubernetes resource provider. Kubernetes provides infrastructure resources for running the data plane, e.g. Envoy proxy. If unspecified and type is "Kubernetes", default settings for managed Kubernetes resources are applied. */
  "kubernetes"?: Kubernetes
  /** Type is the type of resource provider to use. A resource provider provides infrastructure resources for running the data plane, e.g. Envoy proxy, and optional auxiliary control planes. Supported types are "Kubernetes"and "Host". */
  "type": "Kubernetes" | "Host"
}

export interface Shutdown {
  /** DrainTimeout defines the graceful drain timeout. This should be less than the pod's terminationGracePeriodSeconds. If unspecified, defaults to 60 seconds. */
  "drainTimeout"?: string
  /** MinDrainDuration defines the minimum drain duration allowing time for endpoint deprogramming to complete. If unspecified, defaults to 10 seconds. */
  "minDrainDuration"?: string
}

export interface Format {
  /** JSON is additional attributes that describe the specific event occurrence. Structured format for the envoy access logs. Envoy [command operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators) can be used as values for fields within the Struct. It's required when the format type is "JSON". */
  "json"?: Record<string, unknown>
  /** Text defines the text accesslog format, following Envoy accesslog formatting, It's required when the format type is "Text". Envoy [command operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators) may be used in the format. The [format string documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#config-access-log-format-strings) provides more information. */
  "text"?: string
  /** Type defines the type of accesslog format. When unset, both text and json can be specified. */
  "type"?: "Text" | "JSON"
}

export interface BackendRef {
  /** Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred. */
  "group"?: string
  /** Kind is the Kubernetes resource kind of the referent. For example "Service". Defaults to "Service" when not specified. ExternalName services can refer to CNAME DNS records that may live outside of the cluster and as such are difficult to reason about in terms of conformance. They also may not be safe to forward to (see CVE-2021-25740 for more information). Implementations SHOULD NOT support ExternalName Services. Support: Core (Services with a type other than ExternalName) Support: Implementation-specific (Services with type ExternalName) */
  "kind"?: string
  /** Name is the name of the referent. */
  "name": string
  /** Namespace is the namespace of the backend. When unspecified, the local namespace is inferred. Note that when a namespace different than the local namespace is specified, a ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. Support: Core */
  "namespace"?: string
  /** Port specifies the destination port number to use for this resource. Port is required when the referent is a Kubernetes Service. In this case, the port number is the service port number, not the target port. For other resources, destination port might be derived from the referent resource or this field. */
  "port"?: number
}

export interface BackendRefsItem {
  /** Fallback indicates whether the backend is designated as a fallback. Multiple fallback backends can be configured. It is highly recommended to configure active or passive health checks to ensure that failover can be detected when the active backends become unhealthy and to automatically readjust once the primary backends are healthy again. The overprovisioning factor is set to 1.4, meaning the fallback backends will only start receiving traffic when the health of the active backends falls below 72%. */
  "fallback"?: boolean
  /** Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred. */
  "group"?: string
  /** Kind is the Kubernetes resource kind of the referent. For example "Service". Defaults to "Service" when not specified. ExternalName services can refer to CNAME DNS records that may live outside of the cluster and as such are difficult to reason about in terms of conformance. They also may not be safe to forward to (see CVE-2021-25740 for more information). Implementations SHOULD NOT support ExternalName Services. Support: Core (Services with a type other than ExternalName) Support: Implementation-specific (Services with type ExternalName) */
  "kind"?: string
  /** Name is the name of the referent. */
  "name": string
  /** Namespace is the namespace of the backend. When unspecified, the local namespace is inferred. Note that when a namespace different than the local namespace is specified, a ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. Support: Core */
  "namespace"?: string
  /** Port specifies the destination port number to use for this resource. Port is required when the referent is a Kubernetes Service. In this case, the port number is the service port number, not the target port. For other resources, destination port might be derived from the referent resource or this field. */
  "port"?: number
  /** Weight specifies the proportion of requests forwarded to the referenced backend. This is computed as weight/(sum of all weights in this BackendRefs list). For non-zero values, there may be some epsilon from the exact proportion defined here depending on the precision an implementation supports. Weight is not a percentage and the sum of weights does not need to equal 100. If only one backend is specified and it has a weight greater than 0, 100% of the traffic is forwarded to that backend. If weight is set to 0, no traffic should be forwarded for this entry. If unspecified, weight defaults to 1. Support for this field varies based on the context where used. */
  "weight"?: number
}

export interface PerEndpoint {
  /** MaxConnections configures the maximum number of connections that Envoy will establish per-endpoint to the referenced backend defined within a xRoute rule. */
  "maxConnections"?: number
}

export interface CircuitBreaker {
  /** The maximum number of connections that Envoy will establish to the referenced backend defined within a xRoute rule. */
  "maxConnections"?: number
  /** The maximum number of parallel requests that Envoy will make to the referenced backend defined within a xRoute rule. */
  "maxParallelRequests"?: number
  /** The maximum number of parallel retries that Envoy will make to the referenced backend defined within a xRoute rule. */
  "maxParallelRetries"?: number
  /** The maximum number of pending requests that Envoy will queue to the referenced backend defined within a xRoute rule. */
  "maxPendingRequests"?: number
  /** The maximum number of requests that Envoy will make over a single connection to the referenced backend defined within a xRoute rule. Default: unlimited. */
  "maxRequestsPerConnection"?: number
  /** PerEndpoint defines Circuit Breakers that will apply per-endpoint for an upstream cluster */
  "perEndpoint"?: PerEndpoint
}

export interface Preconnect {
  /** PerEndpointPercent configures how many additional connections to maintain per upstream endpoint, useful for high-QPS or latency sensitive services. Expressed as a percentage of the connections required by active streams (e.g. 100 = preconnect disabled, 105 = 1.05x connections per-endpoint, 200 = 2.00×). Allowed value range is between 100-300. When both PerEndpointPercent and PredictivePercent are set, Envoy ensures both are satisfied (max of the two). */
  "perEndpointPercent"?: number
  /** PredictivePercent configures how many additional connections to maintain across the cluster by anticipating which upstream endpoint the load balancer will select next, useful for low-QPS services. Relies on deterministic loadbalancing and is only supported with Random or RoundRobin. Expressed as a percentage of the connections required by active streams (e.g. 100 = 1.0 (no preconnect), 105 = 1.05× connections across the cluster, 200 = 2.00×). Minimum allowed value is 100. When both PerEndpointPercent and PredictivePercent are set Envoy ensures both are satisfied per host (max of the two). */
  "predictivePercent"?: number
}

export interface Connection {
  /** BufferLimit Soft limit on size of the cluster’s connections read and write buffers. BufferLimit applies to connection streaming (maybe non-streaming) channel between processes, it's in user space. If unspecified, an implementation defined default is applied (32768 bytes). For example, 20Mi, 1Gi, 256Ki etc. Note: that when the suffix is not provided, the value is interpreted as bytes. */
  "bufferLimit"?: number | string
  /** Preconnect configures proactive upstream connections to reduce latency by establishing connections before they’re needed and avoiding connection establishment overhead. If unset, Envoy will fetch connections as needed to serve in-flight requests. */
  "preconnect"?: Preconnect
  /** SocketBufferLimit provides configuration for the maximum buffer size in bytes for each socket to backend. SocketBufferLimit applies to socket streaming channel between TCP/IP stacks, it's in kernel space. For example, 20Mi, 1Gi, 256Ki etc. Note that when the suffix is not provided, the value is interpreted as bytes. */
  "socketBufferLimit"?: number | string
}

export interface Dns {
  /** DNSRefreshRate specifies the rate at which DNS records should be refreshed. Defaults to 30 seconds. */
  "dnsRefreshRate"?: string
  /** LookupFamily determines how Envoy would resolve DNS for Routes where the backend is specified as a fully qualified domain name (FQDN). If set, this configuration overrides other defaults. */
  "lookupFamily"?: "IPv4" | "IPv6" | "IPv4Preferred" | "IPv6Preferred" | "IPv4AndIPv6"
  /** RespectDNSTTL indicates whether the DNS Time-To-Live (TTL) should be respected. If the value is set to true, the DNS refresh rate will be set to the resource record’s TTL. Defaults to true. */
  "respectDnsTtl"?: boolean
}

export interface Grpc2 {
  /** Service to send in the health check request. If this is not specified, then the health check request applies to the entire server and not to a specific service. */
  "service"?: string
}

export interface ExpectedResponse {
  /** Binary payload base64 encoded. */
  "binary"?: string
  /** Text payload in plain text. */
  "text"?: string
  /** Type defines the type of the payload. */
  "type": string
}

export interface Http {
  /** ExpectedResponse defines a list of HTTP expected responses to match. */
  "expectedResponse"?: ExpectedResponse
  /** ExpectedStatuses defines a list of HTTP response statuses considered healthy. Defaults to 200 only */
  "expectedStatuses"?: number[]
  /** Hostname defines the HTTP host that will be requested during health checking. Default: HTTPRoute or GRPCRoute hostname. */
  "hostname"?: string
  /** Method defines the HTTP method used for health checking. Defaults to GET */
  "method"?: string
  /** Path defines the HTTP path that will be requested during health checking. */
  "path": string
}

export interface Receive {
  /** Binary payload base64 encoded. */
  "binary"?: string
  /** Text payload in plain text. */
  "text"?: string
  /** Type defines the type of the payload. */
  "type": string
}

export interface Send {
  /** Binary payload base64 encoded. */
  "binary"?: string
  /** Text payload in plain text. */
  "text"?: string
  /** Type defines the type of the payload. */
  "type": string
}

export interface Tcp {
  /** Receive defines the expected response payload. */
  "receive"?: Receive
  /** Send defines the request payload. */
  "send"?: Send
}

export interface Active {
  /** GRPC defines the configuration of the GRPC health checker. It's optional, and can only be used if the specified type is GRPC. */
  "grpc"?: Grpc2
  /** HealthyThreshold defines the number of healthy health checks required before a backend host is marked healthy. */
  "healthyThreshold"?: number
  /** HTTP defines the configuration of http health checker. It's required while the health checker type is HTTP. */
  "http"?: Http
  /** InitialJitter defines the maximum time Envoy will wait before the first health check. Envoy will randomly select a value between 0 and the initial jitter value. */
  "initialJitter"?: string
  /** Interval defines the time between active health checks. */
  "interval"?: string
  /** TCP defines the configuration of tcp health checker. It's required while the health checker type is TCP. */
  "tcp"?: Tcp
  /** Timeout defines the time to wait for a health check response. */
  "timeout"?: string
  /** Type defines the type of health checker. */
  "type": string
  /** UnhealthyThreshold defines the number of unhealthy health checks required before a backend host is marked unhealthy. */
  "unhealthyThreshold"?: number
}

export interface Passive {
  /** BaseEjectionTime defines the base duration for which a host will be ejected on consecutive failures. */
  "baseEjectionTime"?: string
  /** Consecutive5xxErrors sets the number of consecutive 5xx errors triggering ejection. */
  "consecutive5XxErrors"?: number
  /** ConsecutiveGatewayErrors sets the number of consecutive gateway errors triggering ejection. */
  "consecutiveGatewayErrors"?: number
  /** ConsecutiveLocalOriginFailures sets the number of consecutive local origin failures triggering ejection. Parameter takes effect only when split_external_local_origin_errors is set to true. */
  "consecutiveLocalOriginFailures"?: number
  /** FailurePercentageThreshold sets the failure percentage threshold for outlier detection. If the failure percentage of a given host is greater than or equal to this value, it will be ejected. Defaults to 85. */
  "failurePercentageThreshold"?: number
  /** Interval defines the time between passive health checks. */
  "interval"?: string
  /** MaxEjectionPercent sets the maximum percentage of hosts in a cluster that can be ejected. */
  "maxEjectionPercent"?: number
  /** SplitExternalLocalOriginErrors enables splitting of errors between external and local origin. */
  "splitExternalLocalOriginErrors"?: boolean
}

export interface HealthCheck {
  /** Active health check configuration */
  "active"?: Active
  /** When number of unhealthy endpoints for a backend reaches this threshold Envoy will disregard health status and balance across all endpoints. It's designed to prevent a situation in which host failures cascade throughout the cluster as load increases. If not set, the default value is 50%. To disable panic mode, set value to `0`. */
  "panicThreshold"?: number
  /** Passive passive check configuration */
  "passive"?: Passive
}

export interface Http2 {
  /** InitialConnectionWindowSize sets the initial window size for HTTP/2 connections. If not set, the default value is 1 MiB. */
  "initialConnectionWindowSize"?: number | string
  /** InitialStreamWindowSize sets the initial window size for HTTP/2 streams. If not set, the default value is 64 KiB(64*1024). */
  "initialStreamWindowSize"?: number | string
  /** MaxConcurrentStreams sets the maximum number of concurrent streams allowed per connection. If not set, the default value is 100. */
  "maxConcurrentStreams"?: number
  /** OnInvalidMessage determines if Envoy will terminate the connection or just the offending stream in the event of HTTP messaging error It's recommended for L2 Envoy deployments to set this value to TerminateStream. https://www.envoyproxy.io/docs/envoy/latest/configuration/best_practices/level_two Default: TerminateConnection */
  "onInvalidMessage"?: string
}

export interface Cookie {
  /** Additional Attributes to set for the generated cookie. */
  "attributes"?: Record<string, unknown>
  /** Name of the cookie to hash. If this cookie does not exist in the request, Envoy will generate a cookie and set the TTL on the response back to the client based on Layer 4 attributes of the backend endpoint, to ensure that these future requests go to the same backend endpoint. Make sure to set the TTL field for this case. */
  "name": string
  /** TTL of the generated cookie if the cookie is not present. This value sets the Max-Age attribute value. */
  "ttl"?: string
}

export interface Header {
  /** Name of the header to hash. */
  "name": string
}

export interface HeadersItem {
  /** Name of the header to hash. */
  "name": string
}

export interface QueryParamsItem {
  /** Name of the query param to hash. */
  "name": string
}

export interface ConsistentHash {
  /** Cookie configures the cookie hash policy when the consistent hash type is set to Cookie. */
  "cookie"?: Cookie
  /** Header configures the header hash policy when the consistent hash type is set to Header. Deprecated: use Headers instead */
  "header"?: Header
  /** Headers configures the header hash policy for each header, when the consistent hash type is set to Headers. */
  "headers"?: HeadersItem[]
  /** QueryParams configures the query parameter hash policy when the consistent hash type is set to QueryParams. */
  "queryParams"?: QueryParamsItem[]
  /** The table size for consistent hashing, must be prime number limited to 5000011. */
  "tableSize"?: number
  /** ConsistentHashType defines the type of input to hash on. Valid Type values are "SourceIP", "Header", "Headers", "Cookie". "QueryParams". */
  "type": "SourceIP" | "Header" | "Headers" | "Cookie" | "QueryParams"
}

export interface ExtractFromItem {
  /** Header defines the header to get the override endpoint addresses. The header value must specify at least one endpoint in `IP:Port` format or multiple endpoints in `IP:Port,IP:Port,...` format. For example `10.0.0.5:8080` or `[2600:4040:5204::1574:24ae]:80`. The IPv6 address is enclosed in square brackets. */
  "header"?: string
}

export interface EndpointOverride {
  /** ExtractFrom defines the sources to extract endpoint override information from. */
  "extractFrom": ExtractFromItem[]
}

export interface SlowStart {
  /** Window defines the duration of the warm up period for newly added host. During slow start window, traffic sent to the newly added hosts will gradually increase. Currently only supports linear growth of traffic. For additional details, see https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/cluster.proto#config-cluster-v3-cluster-slowstartconfig */
  "window": string
}

export interface Force {
  /** MinEndpointsInZoneThreshold is the minimum number of upstream endpoints in the local zone required to honor the forceLocalZone override. This is useful for protecting zones with fewer endpoints. */
  "minEndpointsInZoneThreshold"?: number
}

export interface PreferLocal {
  /** ForceLocalZone defines override configuration for forcing all traffic to stay within the local zone instead of the default behavior which maintains equal distribution among upstream endpoints while sending as much traffic as possible locally. */
  "force"?: Force
  /** MinEndpointsThreshold is the minimum number of total upstream endpoints across all zones required to enable zone-aware routing. */
  "minEndpointsThreshold"?: number
  /** Configures percentage of requests that will be considered for zone aware routing if zone aware routing is configured. If not specified, Envoy defaults to 100%. */
  "percentageEnabled"?: number
}

export interface ZoneAware {
  /** PreferLocalZone configures zone-aware routing to prefer sending traffic to the local locality zone. */
  "preferLocal"?: PreferLocal
}

export interface LoadBalancer {
  /** ConsistentHash defines the configuration when the load balancer type is set to ConsistentHash */
  "consistentHash"?: ConsistentHash
  /** EndpointOverride defines the configuration for endpoint override. When specified, the load balancer will attempt to route requests to endpoints based on the override information extracted from request headers or metadata.  If the override endpoints are not available, the configured load balancer policy will be used as fallback. */
  "endpointOverride"?: EndpointOverride
  /** SlowStart defines the configuration related to the slow start load balancer policy. If set, during slow start window, traffic sent to the newly added hosts will gradually increase. Currently this is only supported for RoundRobin and LeastRequest load balancers */
  "slowStart"?: SlowStart
  /** Type decides the type of Load Balancer policy. Valid LoadBalancerType values are "ConsistentHash", "LeastRequest", "Random", "RoundRobin". */
  "type": "ConsistentHash" | "LeastRequest" | "Random" | "RoundRobin"
  /** ZoneAware defines the configuration related to the distribution of requests between locality zones. */
  "zoneAware"?: ZoneAware
}

export interface ProxyProtocol {
  /** Version of ProxyProtol Valid ProxyProtocolVersion values are "V1" "V2" */
  "version": "V1" | "V2"
}

export interface BackOff {
  /** BaseInterval is the base interval between retries. */
  "baseInterval"?: string
  /** MaxInterval is the maximum interval between retries. This parameter is optional, but must be greater than or equal to the base_interval if set. The default is 10 times the base_interval */
  "maxInterval"?: string
}

export interface PerRetry {
  /** Backoff is the backoff policy to be applied per retry attempt. gateway uses a fully jittered exponential back-off algorithm for retries. For additional details, see https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/router_filter#config-http-filters-router-x-envoy-max-retries */
  "backOff"?: BackOff
  /** Timeout is the timeout per retry attempt. */
  "timeout"?: string
}

export interface RetryOn {
  /** HttpStatusCodes specifies the http status codes to be retried. The retriable-status-codes trigger must also be configured for these status codes to trigger a retry. */
  "httpStatusCodes"?: number[]
  /** Triggers specifies the retry trigger condition(Http/Grpc). */
  "triggers"?: ("5xx" | "gateway-error" | "reset" | "reset-before-request" | "connect-failure" | "retriable-4xx" | "refused-stream" | "retriable-status-codes" | "cancelled" | "deadline-exceeded" | "internal" | "resource-exhausted" | "unavailable")[]
}

export interface Retry {
  /** NumAttemptsPerPriority defines the number of requests (initial attempt + retries) that should be sent to the same priority before switching to a different one. If not specified or set to 0, all requests are sent to the highest priority that is healthy. */
  "numAttemptsPerPriority"?: number
  /** NumRetries is the number of retries to be attempted. Defaults to 2. */
  "numRetries"?: number
  /** PerRetry is the retry policy to be applied per retry attempt. */
  "perRetry"?: PerRetry
  /** RetryOn specifies the retry trigger condition. If not specified, the default is to retry on connect-failure,refused-stream,unavailable,cancelled,retriable-status-codes(503). */
  "retryOn"?: RetryOn
}

export interface TcpKeepalive {
  /** The duration a connection needs to be idle before keep-alive probes start being sent. The duration format is Defaults to `7200s`. */
  "idleTime"?: string
  /** The duration between keep-alive probes. Defaults to `75s`. */
  "interval"?: string
  /** The total number of unacknowledged probes to send before deciding the connection is dead. Defaults to 9. */
  "probes"?: number
}

export interface Http3 {
  /** The idle timeout for an HTTP connection. Idle time is defined as a period in which there are no active requests in the connection. Default: 1 hour. */
  "connectionIdleTimeout"?: string
  /** The maximum duration of an HTTP connection. Default: unlimited. */
  "maxConnectionDuration"?: string
  /** MaxStreamDuration is the maximum duration for a stream to complete. This timeout measures the time from when the request is sent until the response stream is fully consumed and does not apply to non-streaming requests. When set to "0s", no max duration is applied and streams can run indefinitely. */
  "maxStreamDuration"?: string
  /** RequestTimeout is the time until which entire response is received from the upstream. */
  "requestTimeout"?: string
}

export interface Tcp2 {
  /** The timeout for network connection establishment, including TCP and TLS handshakes. Default: 10 seconds. */
  "connectTimeout"?: string
}

export interface Timeout {
  /** Timeout settings for HTTP. */
  "http"?: Http3
  /** Timeout settings for TCP. */
  "tcp"?: Tcp2
}

export interface BackendSettings {
  /** Circuit Breaker settings for the upstream connections and requests. If not set, circuit breakers will be enabled with the default thresholds */
  "circuitBreaker"?: CircuitBreaker
  /** Connection includes backend connection settings. */
  "connection"?: Connection
  /** DNS includes dns resolution settings. */
  "dns"?: Dns
  /** HealthCheck allows gateway to perform active health checking on backends. */
  "healthCheck"?: HealthCheck
  /** HTTP2 provides HTTP/2 configuration for backend connections. */
  "http2"?: Http2
  /** LoadBalancer policy to apply when routing traffic from the gateway to the backend endpoints. Defaults to `LeastRequest`. */
  "loadBalancer"?: LoadBalancer
  /** ProxyProtocol enables the Proxy Protocol when communicating with the backend. */
  "proxyProtocol"?: ProxyProtocol
  /** Retry provides more advanced usage, allowing users to customize the number of retries, retry fallback strategy, and retry triggering conditions. If not set, retry will be disabled. */
  "retry"?: Retry
  /** TcpKeepalive settings associated with the upstream client connection. Disabled by default. */
  "tcpKeepalive"?: TcpKeepalive
  /** Timeout settings for the backend connections. */
  "timeout"?: Timeout
}

export interface Http4 {
  /** RequestHeaders defines request headers to include in log entries sent to the access log service. */
  "requestHeaders"?: string[]
  /** ResponseHeaders defines response headers to include in log entries sent to the access log service. */
  "responseHeaders"?: string[]
  /** ResponseTrailers defines response trailers to include in log entries sent to the access log service. */
  "responseTrailers"?: string[]
}

export interface Als {
  /** BackendRef references a Kubernetes object that represents the backend server to which the authorization request will be sent. Deprecated: Use BackendRefs instead. */
  "backendRef"?: BackendRef
  /** BackendRefs references a Kubernetes object that represents the backend server to which the authorization request will be sent. */
  "backendRefs"?: BackendRefsItem[]
  /** BackendSettings holds configuration for managing the connection to the backend. */
  "backendSettings"?: BackendSettings
  /** HTTP defines additional configuration specific to HTTP access logs. */
  "http"?: Http4
  /** LogName defines the friendly name of the access log to be returned in StreamAccessLogsMessage.Identifier. This allows the access log server to differentiate between different access logs coming from the same Envoy. */
  "logName"?: string
  /** Type defines the type of accesslog. Supported types are "HTTP" and "TCP". */
  "type": "HTTP" | "TCP"
}

export interface File {
  /** Path defines the file path used to expose envoy access log(e.g. /dev/stdout). */
  "path"?: string
}

export interface HeadersItem2 {
  /** Name is the name of the HTTP Header to be matched. Name matching MUST be case-insensitive. (See https://tools.ietf.org/html/rfc7230#section-3.2). If multiple entries specify equivalent header names, the first entry with an equivalent name MUST be considered for a match. Subsequent entries with an equivalent header name MUST be ignored. Due to the case-insensitivity of header names, "foo" and "Foo" are considered equivalent. */
  "name": string
  /** Value is the value of HTTP Header to be matched. */
  "value": string
}

export interface OpenTelemetry {
  /** BackendRef references a Kubernetes object that represents the backend server to which the authorization request will be sent. Deprecated: Use BackendRefs instead. */
  "backendRef"?: BackendRef
  /** BackendRefs references a Kubernetes object that represents the backend server to which the authorization request will be sent. */
  "backendRefs"?: BackendRefsItem[]
  /** BackendSettings holds configuration for managing the connection to the backend. */
  "backendSettings"?: BackendSettings
  /** Headers is a list of additional headers to send with OTLP export requests. These headers are added as gRPC initial metadata for the OTLP gRPC service. */
  "headers"?: HeadersItem2[]
  /** Host define the extension service hostname. Deprecated: Use BackendRefs instead. */
  "host"?: string
  /** Port defines the port the extension service is exposed on. Deprecated: Use BackendRefs instead. */
  "port"?: number
  /** ResourceAttributes is a set of labels that describe the source of a log entry, including envoy node info. It's recommended to follow [semantic conventions](https://opentelemetry.io/docs/reference/specification/resource/semantic_conventions/). */
  "resourceAttributes"?: Record<string, unknown>
  /** Resources is a set of labels that describe the source of a log entry, including envoy node info. It's recommended to follow [semantic conventions](https://opentelemetry.io/docs/reference/specification/resource/semantic_conventions/). Deprecated: Use ResourceAttributes instead. */
  "resources"?: Record<string, unknown>
}

export interface SinksItem {
  /** ALS defines the gRPC Access Log Service (ALS) sink. */
  "als"?: Als
  /** File defines the file accesslog sink. */
  "file"?: File
  /** OpenTelemetry defines the OpenTelemetry accesslog sink. */
  "openTelemetry"?: OpenTelemetry
  /** Type defines the type of accesslog sink. */
  "type"?: "ALS" | "File" | "OpenTelemetry"
}

export interface SettingsItem {
  /** Format defines the format of accesslog. This will be ignored if sink type is ALS. */
  "format"?: Format
  /** Matches defines the match conditions for accesslog in CEL expression. An accesslog will be emitted only when one or more match conditions are evaluated to true. Invalid [CEL](https://www.envoyproxy.io/docs/envoy/latest/xds/type/v3/cel.proto.html#common-expression-language-cel-proto) expressions will be ignored. */
  "matches"?: string[]
  /** Sinks defines the sinks of accesslog. */
  "sinks": SinksItem[]
  /** Type defines the component emitting the accesslog, such as Listener and Route. If type not defined, the setting would apply to: (1) All Routes. (2) Listeners if and only if Envoy does not find a matching route for a request. If type is defined, the accesslog settings would apply to the relevant component (as-is). */
  "type"?: "Listener" | "Route"
}

export interface AccessLog {
  /** Disable disables access logging for managed proxies if set to true. */
  "disable"?: boolean
  /** Settings defines accesslog settings for managed proxies. If unspecified, will send default format to stdout. */
  "settings"?: SettingsItem[]
}

export interface MatchesItem {
  /** Type specifies how to match against a string. */
  "type"?: "Exact" | "Prefix" | "Suffix" | "RegularExpression"
  /** Value specifies the string value that the match must have. */
  "value": string
}

export interface Compression {
  /** The configuration for Brotli compressor. */
  "brotli"?: Record<string, unknown>
  /** The configuration for GZIP compressor. */
  "gzip"?: Record<string, unknown>
  /** MinContentLength defines the minimum response size in bytes to apply compression. Responses smaller than this threshold will not be compressed. Must be at least 30 bytes as enforced by Envoy Proxy. Note that when the suffix is not provided, the value is interpreted as bytes. Default: 30 bytes */
  "minContentLength"?: number | string
  /** CompressorType defines the compressor type to use for compression. */
  "type": "Gzip" | "Brotli" | "Zstd"
  /** The configuration for Zstd compressor. */
  "zstd"?: Record<string, unknown>
}

export interface Prometheus {
  /** Configure the compression on Prometheus endpoint. Compression is useful in situations when bandwidth is scarce and large payloads can be effectively compressed at the expense of higher CPU load. */
  "compression"?: Compression
  /** Disable the Prometheus endpoint. */
  "disable"?: boolean
}

export interface OpenTelemetry2 {
  /** BackendRef references a Kubernetes object that represents the backend server to which the authorization request will be sent. Deprecated: Use BackendRefs instead. */
  "backendRef"?: BackendRef
  /** BackendRefs references a Kubernetes object that represents the backend server to which the authorization request will be sent. */
  "backendRefs"?: BackendRefsItem[]
  /** BackendSettings holds configuration for managing the connection to the backend. */
  "backendSettings"?: BackendSettings
  /** Headers is a list of additional headers to send with OTLP export requests. These headers are added as gRPC initial metadata for the OTLP gRPC service. */
  "headers"?: HeadersItem2[]
  /** Host define the service hostname. Deprecated: Use BackendRefs instead. */
  "host"?: string
  /** Port defines the port the service is exposed on. Deprecated: Use BackendRefs instead. */
  "port"?: number
  /** ReportCountersAsDeltas configures the OpenTelemetry sink to report counters as delta temporality instead of cumulative. */
  "reportCountersAsDeltas"?: boolean
  /** ReportHistogramsAsDeltas configures the OpenTelemetry sink to report histograms as delta temporality instead of cumulative. Required for backends like Elastic that drop cumulative histograms. */
  "reportHistogramsAsDeltas"?: boolean
  /** ResourceAttributes is a set of labels that describe the source of metrics. It's recommended to follow semantic conventions: https://opentelemetry.io/docs/reference/specification/resource/semantic_conventions/ */
  "resourceAttributes"?: Record<string, unknown>
}

export interface SinksItem2 {
  /** OpenTelemetry defines the configuration for OpenTelemetry sink. It's required if the sink type is OpenTelemetry. */
  "openTelemetry"?: OpenTelemetry2
  /** Type defines the metric sink type. EG currently only supports OpenTelemetry. */
  "type": "OpenTelemetry"
}

export interface Metrics {
  /** ClusterStatName defines the value of cluster alt_stat_name, determining how cluster stats are named. For more details, see envoy docs: https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/cluster/v3/cluster.proto.html The supported operators for this pattern are: `%ROUTE_NAME%`: name of Gateway API xRoute resource `%ROUTE_NAMESPACE%`: namespace of Gateway API xRoute resource `%ROUTE_KIND%`: kind of Gateway API xRoute resource `%ROUTE_RULE_NAME%`: name of the Gateway API xRoute section `%ROUTE_RULE_NUMBER%`: name of the Gateway API xRoute section `%BACKEND_REFS%`: names of all backends referenced in `<NAMESPACE>/<NAME>|<NAMESPACE>/<NAME>|...` format Only xDS Clusters created for HTTPRoute and GRPCRoute are currently supported. Default: `%ROUTE_KIND%/%ROUTE_NAMESPACE%/%ROUTE_NAME%/rule/%ROUTE_RULE_NUMBER%` Example: `httproute/my-ns/my-route/rule/0` */
  "clusterStatName"?: string
  /** EnablePerEndpointStats enables per endpoint envoy stats metrics. Please use with caution. */
  "enablePerEndpointStats"?: boolean
  /** EnableRequestResponseSizesStats enables publishing of histograms tracking header and body sizes of requests and responses. */
  "enableRequestResponseSizesStats"?: boolean
  /** EnableVirtualHostStats enables envoy stat metrics for virtual hosts. */
  "enableVirtualHostStats"?: boolean
  /** Matches defines configuration for selecting specific metrics instead of generating all metrics stats that are enabled by default. This helps reduce CPU and memory overhead in Envoy, but eliminating some stats may after critical functionality. Here are the stats that we strongly recommend not disabling: `cluster_manager.warming_clusters`, `cluster.<cluster_name>.membership_total`,`cluster.<cluster_name>.membership_healthy`, `cluster.<cluster_name>.membership_degraded`，reference  https://github.com/envoyproxy/envoy/issues/9856, https://github.com/envoyproxy/envoy/issues/14610 */
  "matches"?: MatchesItem[]
  /** Prometheus defines the configuration for Admin endpoint `/stats/prometheus`. */
  "prometheus"?: Prometheus
  /** Sinks defines the metric sinks where metrics are sent to. */
  "sinks"?: SinksItem2[]
}

export interface RequestID {
  /** Tracing configures Envoy's behavior for the UUID request ID extension, including whether the trace sampling decision is packed into the UUID and whether `X-Request-ID` is used for trace sampling decisions. When omitted, the default behavior is `PackAndSample`, which alters the UUID to contain the trace sampling decision and uses `X-Request-ID` for stable trace sampling. */
  "tracing"?: "PackAndSample" | "Sample" | "Pack" | "Disable"
}

export interface OpenTelemetry3 {
  /** Headers is a list of additional headers to send with OTLP export requests. These headers are added as gRPC initial metadata for the OTLP gRPC service. */
  "headers"?: HeadersItem2[]
  /** ResourceAttributes is a set of labels that describe the source of traces. It's recommended to follow semantic conventions: https://opentelemetry.io/docs/reference/specification/resource/semantic_conventions/ */
  "resourceAttributes"?: Record<string, unknown>
}

export interface Zipkin {
  /** DisableSharedSpanContext determines whether the default Envoy behaviour of client and server spans sharing the same span context should be disabled. */
  "disableSharedSpanContext"?: boolean
  /** Enable128BitTraceID determines whether a 128bit trace id will be used when creating a new trace instance. If set to false, a 64bit trace id will be used. */
  "enable128BitTraceId"?: boolean
}

export interface Provider2 {
  /** BackendRef references a Kubernetes object that represents the backend server to which the authorization request will be sent. Deprecated: Use BackendRefs instead. */
  "backendRef"?: BackendRef
  /** BackendRefs references a Kubernetes object that represents the backend server to which the authorization request will be sent. */
  "backendRefs"?: BackendRefsItem[]
  /** BackendSettings holds configuration for managing the connection to the backend. */
  "backendSettings"?: BackendSettings
  /** Host define the provider service hostname. Deprecated: Use BackendRefs instead. */
  "host"?: string
  /** OpenTelemetry defines the OpenTelemetry tracing provider configuration */
  "openTelemetry"?: OpenTelemetry3
  /** Port defines the port the provider service is exposed on. Deprecated: Use BackendRefs instead. */
  "port"?: number
  /** ServiceName defines the service name to use in tracing configuration. If not set, Envoy Gateway will use a default service name set as "name.namespace" (e.g., "my-gateway.default"). Note: This field is only supported for OpenTelemetry and Datadog tracing providers. For Zipkin, the service name in traces is always derived from the Envoy --service-cluster flag (typically "namespace/name" format). Setting this field has no effect for Zipkin. */
  "serviceName"?: string
  /** Type defines the tracing provider type. */
  "type": "OpenTelemetry" | "Zipkin" | "Datadog"
  /** Zipkin defines the Zipkin tracing provider configuration */
  "zipkin"?: Zipkin
}

export interface SamplingFraction {
  "denominator"?: number
  "numerator": number
}

export interface SpanName {
  /** Client defines operation name of the span which will be used for tracing. */
  "client": string
  /** Server defines the operation name of the upstream span which will be used for tracing. */
  "server": string
}

export interface Tracing {
  /** CustomTags defines the custom tags to add to each span. If provider is kubernetes, pod name and namespace are added by default. Deprecated: Use Tags instead. */
  "customTags"?: Record<string, unknown>
  /** Provider defines the tracing provider. */
  "provider": Provider2
  /** SamplingFraction represents the fraction of requests that should be selected for tracing if no prior sampling decision has been made. */
  "samplingFraction"?: SamplingFraction
  /** SamplingRate controls the rate at which traffic will be selected for tracing if no prior sampling decision has been made. Defaults to 100, valid values [0-100]. 100 indicates 100% sampling. Only one of SamplingRate or SamplingFraction may be specified. If neither field is specified, all requests will be sampled. */
  "samplingRate"?: number
  /** SpanName defines the name of the span which will be used for tracing. Envoy [command operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators) may be used in the value. The [format string documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#config-access-log-format-strings) provides more information. If not set, the span name is provider specific. e.g. Datadog use `ingress` as the default client span name, and `router <UPSTREAM_CLUSTER> egress` as the server span name. */
  "spanName"?: SpanName
  /** Tags defines the custom tags to add to each span. Envoy [command operators](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#command-operators) may be used in the value. The [format string documentation](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage#config-access-log-format-strings) provides more information. If provider is kubernetes, pod name and namespace are added by default. Same keys take precedence over CustomTags. */
  "tags"?: Record<string, unknown>
}

export interface Telemetry {
  /** AccessLogs defines accesslog parameters for managed proxies. If unspecified, will send default format to stdout. */
  "accessLog"?: AccessLog
  /** Metrics defines metrics configuration for managed proxies. */
  "metrics"?: Metrics
  /** RequestID configures Envoy request ID behavior. */
  "requestID"?: RequestID
  /** Tracing defines tracing configuration for managed proxies. If unspecified, will not send tracing data. */
  "tracing"?: Tracing
}

export interface EnvoyProxySpec {
  /** BackendTLS is the TLS configuration for the Envoy proxy to use when connecting to backends. These settings are applied on backends for which TLS policies are specified. */
  "backendTLS"?: BackendTLS
  /** Bootstrap defines the Envoy Bootstrap as a YAML string. Visit https://www.envoyproxy.io/docs/envoy/latest/api-v3/config/bootstrap/v3/bootstrap.proto#envoy-v3-api-msg-config-bootstrap-v3-bootstrap to learn more about the syntax. If set, this is the Bootstrap configuration used for the managed Envoy Proxy fleet instead of the default Bootstrap configuration set by Envoy Gateway. Some fields within the Bootstrap that are required to communicate with the xDS Server (Envoy Gateway) and receive xDS resources from it are not configurable and will result in the `EnvoyProxy` resource being rejected. Backward compatibility across minor versions is not guaranteed. We strongly recommend using `egctl x translate` to generate a `EnvoyProxy` resource with the `Bootstrap` field set to the default Bootstrap configuration used. You can edit this configuration, and rerun `egctl x translate` to ensure there are no validation errors. */
  "bootstrap"?: Bootstrap
  /** Concurrency defines the number of worker threads to run. If unset, it defaults to the number of cpuset threads on the platform. */
  "concurrency"?: number
  /** ExtraArgs defines additional command line options that are provided to Envoy. More info: https://www.envoyproxy.io/docs/envoy/latest/operations/cli#command-line-options Note: some command line options are used internally(e.g. --log-level) so they cannot be provided here. */
  "extraArgs"?: string[]
  /** FilterOrder defines the order of filters in the Envoy proxy's HTTP filter chain. The FilterPosition in the list will be applied in the order they are defined. If unspecified, the default filter order is applied. Default filter order is: - envoy.filters.http.custom_response - envoy.filters.http.health_check - envoy.filters.http.fault - envoy.filters.http.cors - envoy.filters.http.header_mutation - envoy.filters.http.ext_authz - envoy.filters.http.api_key_auth - envoy.filters.http.basic_auth - envoy.filters.http.oauth2 - envoy.filters.http.jwt_authn - envoy.filters.http.stateful_session - envoy.filters.http.buffer - envoy.filters.http.lua - envoy.filters.http.ext_proc - envoy.filters.http.wasm - envoy.filters.http.rbac - envoy.filters.http.local_ratelimit - envoy.filters.http.ratelimit - envoy.filters.http.grpc_web - envoy.filters.http.grpc_stats - envoy.filters.http.credential_injector - envoy.filters.http.compressor - envoy.filters.http.dynamic_forward_proxy - envoy.filters.http.router Note: "envoy.filters.http.router" cannot be reordered, it's always the last filter in the chain. */
  "filterOrder"?: FilterOrderItem[]
  /** IPFamily specifies the IP family for the EnvoyProxy fleet. This setting only affects the Gateway listener port and does not impact other aspects of the Envoy proxy configuration. If not specified, the system will operate as follows: - It defaults to IPv4 only. - IPv6 and dual-stack environments are not supported in this default configuration. Note: To enable IPv6 or dual-stack functionality, explicit configuration is required. */
  "ipFamily"?: "IPv4" | "IPv6" | "DualStack"
  /** Logging defines logging parameters for managed proxies. */
  "logging"?: Logging
  /** LuaValidation determines strictness of the Lua script validation for Lua EnvoyExtensionPolicies Default: Strict */
  "luaValidation"?: "Strict" | "InsecureSyntax" | "Disabled"
  /** MergeGateways defines if Gateway resources should be merged onto the same Envoy Proxy Infrastructure. Setting this field to true would merge all Gateway Listeners under the parent Gateway Class. This means that the port, protocol and hostname tuple must be unique for every listener. If a duplicate listener is detected, the newer listener (based on timestamp) will be rejected and its status will be updated with a "Accepted=False" condition. */
  "mergeGateways"?: boolean
  /** PreserveRouteOrder determines if the order of matching for HTTPRoutes is determined by Gateway-API specification (https://gateway-api.sigs.k8s.io/reference/1.4/spec/#httprouterule) or preserves the order defined by users in the HTTPRoute's HTTPRouteRule list. Default: False */
  "preserveRouteOrder"?: boolean
  /** Provider defines the desired resource provider and provider-specific configuration. If unspecified, the "Kubernetes" resource provider is used with default configuration parameters. */
  "provider"?: Provider
  /** RoutingType can be set to "Service" to use the Service Cluster IP for routing to the backend, or it can be set to "Endpoint" to use Endpoint routing. The default is "Endpoint". */
  "routingType"?: string
  /** Shutdown defines configuration for graceful envoy shutdown process. */
  "shutdown"?: Shutdown
  /** Telemetry defines telemetry parameters for managed proxies. */
  "telemetry"?: Telemetry
}

export interface AncestorRef {
  /** Group is the group of the referent. When unspecified, "gateway.networking.k8s.io" is inferred. To set the core API group (such as for a "Service" kind referent), Group must be explicitly set to "" (empty string). Support: Core */
  "group"?: string
  /** Kind is kind of the referent. There are two kinds of parent resources with "Core" support: * Gateway (Gateway conformance profile) * Service (Mesh conformance profile, ClusterIP Services only) Support for other resources is Implementation-Specific. */
  "kind"?: string
  /** Name is the name of the referent. Support: Core */
  "name": string
  /** Namespace is the namespace of the referent. When unspecified, this refers to the local namespace of the Route. Note that there are specific rules for ParentRefs which cross namespace boundaries. Cross-namespace references are only valid if they are explicitly allowed by something in the namespace they are referring to. For example: Gateway has the AllowedRoutes field, and ReferenceGrant provides a generic way to enable any other kind of cross-namespace reference. <gateway:experimental:description> ParentRefs from a Route to a Service in the same namespace are "producer" routes, which apply default routing rules to inbound connections from any namespace to the Service. ParentRefs from a Route to a Service in a different namespace are "consumer" routes, and these routing rules are only applied to outbound connections originating from the same namespace as the Route, for which the intended destination of the connections are a Service targeted as a ParentRef of the Route. </gateway:experimental:description> Support: Core */
  "namespace"?: string
  /** Port is the network port this Route targets. It can be interpreted differently based on the type of parent resource. When the parent resource is a Gateway, this targets all listeners listening on the specified port that also support this kind of Route(and select this Route). It's not recommended to set `Port` unless the networking behaviors specified in a Route must apply to a specific port as opposed to a listener(s) whose port(s) may be changed. When both Port and SectionName are specified, the name and port of the selected listener must match both specified values. <gateway:experimental:description> When the parent resource is a Service, this targets a specific port in the Service spec. When both Port (experimental) and SectionName are specified, the name and port of the selected port must match both specified values. </gateway:experimental:description> Implementations MAY choose to support other parent resources. Implementations supporting other types of parent resources MUST clearly document how/if Port is interpreted. For the purpose of status, an attachment is considered successful as long as the parent resource accepts it partially. For example, Gateway listeners can restrict which Routes can attach to them by Route kind, namespace, or hostname. If 1 of 2 Gateway listeners accept attachment from the referencing Route, the Route MUST be considered successfully attached. If no Gateway listeners accept attachment from this Route, the Route MUST be considered detached from the Gateway. Support: Extended */
  "port"?: number
  /** SectionName is the name of a section within the target resource. In the following resources, SectionName is interpreted as the following: * Gateway: Listener name. When both Port (experimental) and SectionName are specified, the name and port of the selected listener must match both specified values. * Service: Port name. When both Port (experimental) and SectionName are specified, the name and port of the selected listener must match both specified values. Implementations MAY choose to support attaching Routes to other resources. If that is the case, they MUST clearly document how SectionName is interpreted. When unspecified (empty string), this will reference the entire resource. For the purpose of status, an attachment is considered successful if at least one section in the parent resource accepts it. For example, Gateway listeners can restrict which Routes can attach to them by Route kind, namespace, or hostname. If 1 of 2 Gateway listeners accept attachment from the referencing Route, the Route MUST be considered successfully attached. If no Gateway listeners accept attachment from this Route, the Route MUST be considered detached from the Gateway. Support: Core */
  "sectionName"?: string
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
  "status": "True" | "False" | "Unknown"
  /** type of condition in CamelCase or in foo.example.com/CamelCase. */
  "type": string
}

export interface AncestorsItem {
  /** AncestorRef corresponds a GatewayClass or Gateway use this EnvoyProxy with ParametersReference. */
  "ancestorRef": AncestorRef
  /** Conditions describes the status of the Policy with respect to the given Ancestor. */
  "conditions"?: ConditionsItem[]
}

export interface EnvoyProxyStatus {
  /** Ancestors represent the status information for all the GatewayClass or Gateway reference this EnvoyProxy with ParametersReference. */
  "ancestors"?: AncestorsItem[]
}

export interface AddressesItem {
  /** Type of the address. */
  "type"?: string
  /** When a value is unspecified, an implementation SHOULD automatically assign an address matching the requested type if possible. If an implementation does not support an empty value, they MUST set the "Programmed" condition in status to False with a reason of "AddressNotAssigned". Examples: `1.2.3.4`, `128::1`, `my-ip-address`. */
  "value"?: string
}

export interface ParametersRef {
  /** Group is the group of the referent. */
  "group": string
  /** Kind is kind of the referent. */
  "kind": string
  /** Name is the name of the referent. */
  "name": string
}

export interface Infrastructure {
  /** Annotations that SHOULD be applied to any resources created in response to this Gateway. For implementations creating other Kubernetes objects, this should be the `metadata.annotations` field on resources. For other implementations, this refers to any relevant (implementation specific) "annotations" concepts. An implementation may chose to add additional implementation-specific annotations as they see fit. Support: Extended */
  "annotations"?: Record<string, unknown>
  /** Labels that SHOULD be applied to any resources created in response to this Gateway. For implementations creating other Kubernetes objects, this should be the `metadata.labels` field on resources. For other implementations, this refers to any relevant (implementation specific) "labels" concepts. An implementation may chose to add additional implementation-specific labels as they see fit. If an implementation maps these labels to Pods, or any other resource that would need to be recreated when labels change, it SHOULD clearly warn about this behavior in documentation. Support: Extended */
  "labels"?: Record<string, unknown>
  /** ParametersRef is a reference to a resource that contains the configuration parameters corresponding to the Gateway. This is optional if the controller does not require any additional configuration. This follows the same semantics as GatewayClass's `parametersRef`, but on a per-Gateway basis The Gateway's GatewayClass may provide its own `parametersRef`. When both are specified, the merging behavior is implementation specific. It is generally recommended that GatewayClass provides defaults that can be overridden by a Gateway. If the referent cannot be found, refers to an unsupported kind, or when the data within that resource is malformed, the Gateway SHOULD be rejected with the "Accepted" status condition set to "False" and an "InvalidParameters" reason. Support: Implementation-specific */
  "parametersRef"?: ParametersRef
}

export interface KindsItem {
  /** Group is the group of the Route. */
  "group"?: string
  /** Kind is the kind of the Route. */
  "kind": string
}

export interface Namespaces {
  /** From indicates where Routes will be selected for this Gateway. Possible values are: * All: Routes in all namespaces may be used by this Gateway. * Selector: Routes in namespaces selected by the selector may be used by   this Gateway. * Same: Only Routes in the same namespace may be used by this Gateway. Support: Core */
  "from"?: "All" | "Selector" | "Same"
  /** Selector must be specified when From is set to "Selector". In that case, only Routes in Namespaces matching this Selector will be selected by this Gateway. This field is ignored for other values of "From". Support: Core */
  "selector"?: Selector
}

export interface AllowedRoutes {
  /** Kinds specifies the groups and kinds of Routes that are allowed to bind to this Gateway Listener. When unspecified or empty, the kinds of Routes selected are determined using the Listener protocol. A RouteGroupKind MUST correspond to kinds of Routes that are compatible with the application protocol specified in the Listener's Protocol field. If an implementation does not support or recognize this resource type, it MUST set the "ResolvedRefs" condition to False for this Listener with the "InvalidRouteKinds" reason. Support: Core */
  "kinds"?: KindsItem[]
  /** Namespaces indicates namespaces from which Routes may be attached to this Listener. This is restricted to the namespace of this Gateway by default. Support: Core */
  "namespaces"?: Namespaces
}

export interface CertificateRefsItem {
  /** Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred. */
  "group"?: string
  /** Kind is kind of the referent. For example "Secret". */
  "kind"?: string
  /** Name is the name of the referent. */
  "name": string
  /** Namespace is the namespace of the referenced object. When unspecified, the local namespace is inferred. Note that when a namespace different than the local namespace is specified, a ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. Support: Core */
  "namespace"?: string
}

export interface Tls {
  /** CertificateRefs contains a series of references to Kubernetes objects that contains TLS certificates and private keys. These certificates are used to establish a TLS handshake for requests that match the hostname of the associated listener. A single CertificateRef to a Kubernetes Secret has "Core" support. Implementations MAY choose to support attaching multiple certificates to a Listener, but this behavior is implementation-specific. References to a resource in different namespace are invalid UNLESS there is a ReferenceGrant in the target namespace that allows the certificate to be attached. If a ReferenceGrant does not allow this reference, the "ResolvedRefs" condition MUST be set to False for this listener with the "RefNotPermitted" reason. This field is required to have at least one element when the mode is set to "Terminate" (default) and is optional otherwise. CertificateRefs can reference to standard Kubernetes resources, i.e. Secret, or implementation-specific custom resources. Support: Core - A single reference to a Kubernetes Secret of type kubernetes.io/tls Support: Implementation-specific (More than one reference or other resource types) */
  "certificateRefs"?: CertificateRefsItem[]
  /** Mode defines the TLS behavior for the TLS session initiated by the client. There are two possible modes: - Terminate: The TLS session between the downstream client and the   Gateway is terminated at the Gateway. This mode requires certificates   to be specified in some way, such as populating the certificateRefs   field. - Passthrough: The TLS session is NOT terminated by the Gateway. This   implies that the Gateway can't decipher the TLS stream except for   the ClientHello message of the TLS protocol. The certificateRefs field   is ignored in this mode. Support: Core */
  "mode"?: "Terminate" | "Passthrough"
  /** Options are a list of key/value pairs to enable extended TLS configuration for each implementation. For example, configuring the minimum TLS version or supported cipher suites. A set of common keys MAY be defined by the API in the future. To avoid any ambiguity, implementation-specific definitions MUST use domain-prefixed names, such as `example.com/my-custom-option`. Un-prefixed names are reserved for key names defined by Gateway API. Support: Implementation-specific */
  "options"?: Record<string, unknown>
}

export interface ListenersItem {
  /** AllowedRoutes defines the types of routes that MAY be attached to a Listener and the trusted namespaces where those Route resources MAY be present. Although a client request may match multiple route rules, only one rule may ultimately receive the request. Matching precedence MUST be determined in order of the following criteria: * The most specific match as defined by the Route type. * The oldest Route based on creation timestamp. For example, a Route with   a creation timestamp of "2020-09-08 01:02:03" is given precedence over   a Route with a creation timestamp of "2020-09-08 01:02:04". * If everything else is equivalent, the Route appearing first in   alphabetical order (namespace/name) should be given precedence. For   example, foo/bar is given precedence over foo/baz. All valid rules within a Route attached to this Listener should be implemented. Invalid Route rules can be ignored (sometimes that will mean the full Route). If a Route rule transitions from valid to invalid, support for that Route rule should be dropped to ensure consistency. For example, even if a filter specified by a Route rule is invalid, the rest of the rules within that Route should still be supported. Support: Core */
  "allowedRoutes"?: AllowedRoutes
  /** Hostname specifies the virtual hostname to match for protocol types that define this concept. When unspecified, all hostnames are matched. This field is ignored for protocols that don't require hostname based matching. Implementations MUST apply Hostname matching appropriately for each of the following protocols: * TLS: The Listener Hostname MUST match the SNI. * HTTP: The Listener Hostname MUST match the Host header of the request. * HTTPS: The Listener Hostname SHOULD match both the SNI and Host header.   Note that this does not require the SNI and Host header to be the same.   The semantics of this are described in more detail below. To ensure security, Section 11.1 of RFC-6066 emphasizes that server implementations that rely on SNI hostname matching MUST also verify hostnames within the application protocol. Section 9.1.2 of RFC-7540 provides a mechanism for servers to reject the reuse of a connection by responding with the HTTP 421 Misdirected Request status code. This indicates that the origin server has rejected the request because it appears to have been misdirected. To detect misdirected requests, Gateways SHOULD match the authority of the requests with all the SNI hostname(s) configured across all the Gateway Listeners on the same port and protocol: * If another Listener has an exact match or more specific wildcard entry,   the Gateway SHOULD return a 421. * If the current Listener (selected by SNI matching during ClientHello)   does not match the Host:     * If another Listener does match the Host the Gateway SHOULD return a       421.     * If no other Listener matches the Host, the Gateway MUST return a       404. For HTTPRoute and TLSRoute resources, there is an interaction with the `spec.hostnames` array. When both listener and route specify hostnames, there MUST be an intersection between the values for a Route to be accepted. For more information, refer to the Route specific Hostnames documentation. Hostnames that are prefixed with a wildcard label (`*.`) are interpreted as a suffix match. That means that a match for `*.example.com` would match both `test.example.com`, and `foo.test.example.com`, but not `example.com`. Support: Core */
  "hostname"?: string
  /** Name is the name of the Listener. This name MUST be unique within a Gateway. Support: Core */
  "name": string
  /** Port is the network port. Multiple listeners may use the same port, subject to the Listener compatibility rules. Support: Core */
  "port": number
  /** Protocol specifies the network protocol this listener expects to receive. Support: Core */
  "protocol": string
  /** TLS is the TLS configuration for the Listener. This field is required if the Protocol field is "HTTPS" or "TLS". It is invalid to set this field if the Protocol field is "HTTP", "TCP", or "UDP". The association of SNIs to Certificate defined in ListenerTLSConfig is defined based on the Hostname field for this listener. The GatewayClass MUST use the longest matching SNI out of all available certificates for any TLS handshake. Support: Core */
  "tls"?: Tls
}

export interface GatewaySpec {
  /** Addresses requested for this Gateway. This is optional and behavior can depend on the implementation. If a value is set in the spec and the requested address is invalid or unavailable, the implementation MUST indicate this in an associated entry in GatewayStatus.Conditions. The Addresses field represents a request for the address(es) on the "outside of the Gateway", that traffic bound for this Gateway will use. This could be the IP address or hostname of an external load balancer or other networking infrastructure, or some other address that traffic will be sent to. If no Addresses are specified, the implementation MAY schedule the Gateway in an implementation-specific manner, assigning an appropriate set of Addresses. The implementation MUST bind all Listeners to every GatewayAddress that it assigns to the Gateway and add a corresponding entry in GatewayStatus.Addresses. Support: Extended */
  "addresses"?: AddressesItem[]
  /** GatewayClassName used for this Gateway. This is the name of a GatewayClass resource. */
  "gatewayClassName": string
  /** Infrastructure defines infrastructure level attributes about this Gateway instance. Support: Extended */
  "infrastructure"?: Infrastructure
  /** Listeners associated with this Gateway. Listeners define logical endpoints that are bound on this Gateway's addresses. At least one Listener MUST be specified. ## Distinct Listeners Each Listener in a set of Listeners (for example, in a single Gateway) MUST be _distinct_, in that a traffic flow MUST be able to be assigned to exactly one listener. (This section uses "set of Listeners" rather than "Listeners in a single Gateway" because implementations MAY merge configuration from multiple Gateways onto a single data plane, and these rules _also_ apply in that case). Practically, this means that each listener in a set MUST have a unique combination of Port, Protocol, and, if supported by the protocol, Hostname. Some combinations of port, protocol, and TLS settings are considered Core support and MUST be supported by implementations based on the objects they support: HTTPRoute 1. HTTPRoute, Port: 80, Protocol: HTTP 2. HTTPRoute, Port: 443, Protocol: HTTPS, TLS Mode: Terminate, TLS keypair provided TLSRoute 1. TLSRoute, Port: 443, Protocol: TLS, TLS Mode: Passthrough "Distinct" Listeners have the following property: **The implementation can match inbound requests to a single distinct Listener**. When multiple Listeners share values for fields (for example, two Listeners with the same Port value), the implementation can match requests to only one of the Listeners using other Listener fields. When multiple listeners have the same value for the Protocol field, then each of the Listeners with matching Protocol values MUST have different values for other fields. The set of fields that MUST be different for a Listener differs per protocol. The following rules define the rules for what fields MUST be considered for Listeners to be distinct with each protocol currently defined in the Gateway API spec. The set of listeners that all share a protocol value MUST have _different_ values for _at least one_ of these fields to be distinct: * **HTTP, HTTPS, TLS**: Port, Hostname * **TCP, UDP**: Port One **very** important rule to call out involves what happens when an implementation: * Supports TCP protocol Listeners, as well as HTTP, HTTPS, or TLS protocol   Listeners, and * sees HTTP, HTTPS, or TLS protocols with the same `port` as one with TCP   Protocol. In this case all the Listeners that share a port with the TCP Listener are not distinct and so MUST NOT be accepted. If an implementation does not support TCP Protocol Listeners, then the previous rule does not apply, and the TCP Listeners SHOULD NOT be accepted. Note that the `tls` field is not used for determining if a listener is distinct, because Listeners that _only_ differ on TLS config will still conflict in all cases. ### Listeners that are distinct only by Hostname When the Listeners are distinct based only on Hostname, inbound request hostnames MUST match from the most specific to least specific Hostname values to choose the correct Listener and its associated set of Routes. Exact matches MUST be processed before wildcard matches, and wildcard matches MUST be processed before fallback (empty Hostname value) matches. For example, `"foo.example.com"` takes precedence over `"*.example.com"`, and `"*.example.com"` takes precedence over `""`. Additionally, if there are multiple wildcard entries, more specific wildcard entries must be processed before less specific wildcard entries. For example, `"*.foo.example.com"` takes precedence over `"*.example.com"`. The precise definition here is that the higher the number of dots in the hostname to the right of the wildcard character, the higher the precedence. The wildcard character will match any number of characters _and dots_ to the left, however, so `"*.example.com"` will match both `"foo.bar.example.com"` _and_ `"bar.example.com"`. ## Handling indistinct Listeners If a set of Listeners contains Listeners that are not distinct, then those Listeners are _Conflicted_, and the implementation MUST set the "Conflicted" condition in the Listener Status to "True". The words "indistinct" and "conflicted" are considered equivalent for the purpose of this documentation. Implementations MAY choose to accept a Gateway with some Conflicted Listeners only if they only accept the partial Listener set that contains no Conflicted Listeners. Specifically, an implementation MAY accept a partial Listener set subject to the following rules: * The implementation MUST NOT pick one conflicting Listener as the winner.   ALL indistinct Listeners must not be accepted for processing. * At least one distinct Listener MUST be present, or else the Gateway effectively   contains _no_ Listeners, and must be rejected from processing as a whole. The implementation MUST set a "ListenersNotValid" condition on the Gateway Status when the Gateway contains Conflicted Listeners whether or not they accept the Gateway. That Condition SHOULD clearly indicate in the Message which Listeners are conflicted, and which are Accepted. Additionally, the Listener status for those listeners SHOULD indicate which Listeners are conflicted and not Accepted. ## General Listener behavior Note that, for all distinct Listeners, requests SHOULD match at most one Listener. For example, if Listeners are defined for "foo.example.com" and "*.example.com", a request to "foo.example.com" SHOULD only be routed using routes attached to the "foo.example.com" Listener (and not the "*.example.com" Listener). This concept is known as "Listener Isolation", and it is an Extended feature of Gateway API. Implementations that do not support Listener Isolation MUST clearly document this, and MUST NOT claim support for the `GatewayHTTPListenerIsolation` feature. Implementations that _do_ support Listener Isolation SHOULD claim support for the Extended `GatewayHTTPListenerIsolation` feature and pass the associated conformance tests. ## Compatible Listeners A Gateway's Listeners are considered _compatible_ if: 1. They are distinct. 2. The implementation can serve them in compliance with the Addresses    requirement that all Listeners are available on all assigned    addresses. Compatible combinations in Extended support are expected to vary across implementations. A combination that is compatible for one implementation may not be compatible for another. For example, an implementation that cannot serve both TCP and UDP listeners on the same address, or cannot mix HTTPS and generic TLS listens on the same port would not consider those cases compatible, even though they are distinct. Implementations MAY merge separate Gateways onto a single set of Addresses if all Listeners across all Gateways are compatible. In a future release the MinItems=1 requirement MAY be dropped. Support: Core */
  "listeners": ListenersItem[]
}

export interface SupportedKindsItem {
  /** Group is the group of the Route. */
  "group"?: string
  /** Kind is the kind of the Route. */
  "kind": string
}

export interface ListenersItem2 {
  /** AttachedRoutes represents the total number of Routes that have been successfully attached to this Listener. Successful attachment of a Route to a Listener is based solely on the combination of the AllowedRoutes field on the corresponding Listener and the Route's ParentRefs field. A Route is successfully attached to a Listener when it is selected by the Listener's AllowedRoutes field AND the Route has a valid ParentRef selecting the whole Gateway resource or a specific Listener as a parent resource (more detail on attachment semantics can be found in the documentation on the various Route kinds ParentRefs fields). Listener or Route status does not impact successful attachment, i.e. the AttachedRoutes field count MUST be set for Listeners with condition Accepted: false and MUST count successfully attached Routes that may themselves have Accepted: false conditions. Uses for this field include troubleshooting Route attachment and measuring blast radius/impact of changes to a Listener. */
  "attachedRoutes": number
  /** Conditions describe the current condition of this listener. */
  "conditions": ConditionsItem[]
  /** Name is the name of the Listener that this status corresponds to. */
  "name": string
  /** SupportedKinds is the list indicating the Kinds supported by this listener. This MUST represent the kinds an implementation supports for that Listener configuration. If kinds are specified in Spec that are not supported, they MUST NOT appear in this list and an implementation MUST set the "ResolvedRefs" condition to "False" with the "InvalidRouteKinds" reason. If both valid and invalid Route kinds are specified, the implementation MUST reference the valid Route kinds that have been specified. */
  "supportedKinds": SupportedKindsItem[]
}

export interface GatewayStatus {
  /** Addresses lists the network addresses that have been bound to the Gateway. This list may differ from the addresses provided in the spec under some conditions:   * no addresses are specified, all addresses are dynamically assigned   * a combination of specified and dynamic addresses are assigned   * a specified address was unusable (e.g. already in use) */
  "addresses"?: AddressesItem[]
  /** Conditions describe the current conditions of the Gateway. Implementations should prefer to express Gateway conditions using the `GatewayConditionType` and `GatewayConditionReason` constants so that operators and tools can converge on a common vocabulary to describe Gateway state. Known condition types are: * "Accepted" * "Programmed" * "Ready" */
  "conditions"?: ConditionsItem[]
  /** Listeners provide status for each unique listener port defined in the Spec. */
  "listeners"?: ListenersItem2[]
}

export interface ParentRefsItem {
  /** Group is the group of the referent. When unspecified, "gateway.networking.k8s.io" is inferred. To set the core API group (such as for a "Service" kind referent), Group must be explicitly set to "" (empty string). Support: Core */
  "group"?: string
  /** Kind is kind of the referent. There are two kinds of parent resources with "Core" support: * Gateway (Gateway conformance profile) * Service (Mesh conformance profile, ClusterIP Services only) Support for other resources is Implementation-Specific. */
  "kind"?: string
  /** Name is the name of the referent. Support: Core */
  "name": string
  /** Namespace is the namespace of the referent. When unspecified, this refers to the local namespace of the Route. Note that there are specific rules for ParentRefs which cross namespace boundaries. Cross-namespace references are only valid if they are explicitly allowed by something in the namespace they are referring to. For example: Gateway has the AllowedRoutes field, and ReferenceGrant provides a generic way to enable any other kind of cross-namespace reference. Support: Core */
  "namespace"?: string
  /** Port is the network port this Route targets. It can be interpreted differently based on the type of parent resource. When the parent resource is a Gateway, this targets all listeners listening on the specified port that also support this kind of Route(and select this Route). It's not recommended to set `Port` unless the networking behaviors specified in a Route must apply to a specific port as opposed to a listener(s) whose port(s) may be changed. When both Port and SectionName are specified, the name and port of the selected listener must match both specified values. Implementations MAY choose to support other parent resources. Implementations supporting other types of parent resources MUST clearly document how/if Port is interpreted. For the purpose of status, an attachment is considered successful as long as the parent resource accepts it partially. For example, Gateway listeners can restrict which Routes can attach to them by Route kind, namespace, or hostname. If 1 of 2 Gateway listeners accept attachment from the referencing Route, the Route MUST be considered successfully attached. If no Gateway listeners accept attachment from this Route, the Route MUST be considered detached from the Gateway. Support: Extended */
  "port"?: number
  /** SectionName is the name of a section within the target resource. In the following resources, SectionName is interpreted as the following: * Gateway: Listener name. When both Port (experimental) and SectionName are specified, the name and port of the selected listener must match both specified values. * Service: Port name. When both Port (experimental) and SectionName are specified, the name and port of the selected listener must match both specified values. Implementations MAY choose to support attaching Routes to other resources. If that is the case, they MUST clearly document how SectionName is interpreted. When unspecified (empty string), this will reference the entire resource. For the purpose of status, an attachment is considered successful if at least one section in the parent resource accepts it. For example, Gateway listeners can restrict which Routes can attach to them by Route kind, namespace, or hostname. If 1 of 2 Gateway listeners accept attachment from the referencing Route, the Route MUST be considered successfully attached. If no Gateway listeners accept attachment from this Route, the Route MUST be considered detached from the Gateway. Support: Core */
  "sectionName"?: string
}

export interface ExtensionRef {
  /** Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred. */
  "group": string
  /** Kind is kind of the referent. For example "HTTPRoute" or "Service". */
  "kind": string
  /** Name is the name of the referent. */
  "name": string
}

export interface AddItem {
  /** Name is the name of the HTTP Header to be matched. Name matching MUST be case-insensitive. (See https://tools.ietf.org/html/rfc7230#section-3.2). If multiple entries specify equivalent header names, the first entry with an equivalent name MUST be considered for a match. Subsequent entries with an equivalent header name MUST be ignored. Due to the case-insensitivity of header names, "foo" and "Foo" are considered equivalent. */
  "name": string
  /** Value is the value of HTTP Header to be matched. */
  "value": string
}

export interface SetItem {
  /** Name is the name of the HTTP Header to be matched. Name matching MUST be case-insensitive. (See https://tools.ietf.org/html/rfc7230#section-3.2). If multiple entries specify equivalent header names, the first entry with an equivalent name MUST be considered for a match. Subsequent entries with an equivalent header name MUST be ignored. Due to the case-insensitivity of header names, "foo" and "Foo" are considered equivalent. */
  "name": string
  /** Value is the value of HTTP Header to be matched. */
  "value": string
}

export interface RequestHeaderModifier {
  /** Add adds the given header(s) (name, value) to the request before the action. It appends to any existing values associated with the header name. Input:   GET /foo HTTP/1.1   my-header: foo Config:   add:   - name: "my-header"     value: "bar,baz" Output:   GET /foo HTTP/1.1   my-header: foo,bar,baz */
  "add"?: AddItem[]
  /** Remove the given header(s) from the HTTP request before the action. The value of Remove is a list of HTTP header names. Note that the header names are case-insensitive (see https://datatracker.ietf.org/doc/html/rfc2616#section-4.2). Input:   GET /foo HTTP/1.1   my-header1: foo   my-header2: bar   my-header3: baz Config:   remove: ["my-header1", "my-header3"] Output:   GET /foo HTTP/1.1   my-header2: bar */
  "remove"?: string[]
  /** Set overwrites the request with the given header (name, value) before the action. Input:   GET /foo HTTP/1.1   my-header: foo Config:   set:   - name: "my-header"     value: "bar" Output:   GET /foo HTTP/1.1   my-header: bar */
  "set"?: SetItem[]
}

export interface Fraction {
  "denominator"?: number
  "numerator": number
}

export interface RequestMirror {
  /** BackendRef references a resource where mirrored requests are sent. Mirrored requests must be sent only to a single destination endpoint within this BackendRef, irrespective of how many endpoints are present within this BackendRef. If the referent cannot be found, this BackendRef is invalid and must be dropped from the Gateway. The controller must ensure the "ResolvedRefs" condition on the Route status is set to `status: False` and not configure this backend in the underlying implementation. If there is a cross-namespace reference to an *existing* object that is not allowed by a ReferenceGrant, the controller must ensure the "ResolvedRefs"  condition on the Route is set to `status: False`, with the "RefNotPermitted" reason and not configure this backend in the underlying implementation. In either error case, the Message of the `ResolvedRefs` Condition should be used to provide more detail about the problem. Support: Extended for Kubernetes Service Support: Implementation-specific for any other resource */
  "backendRef": BackendRef
  /** Fraction represents the fraction of requests that should be mirrored to BackendRef. Only one of Fraction or Percent may be specified. If neither field is specified, 100% of requests will be mirrored. */
  "fraction"?: Fraction
  /** Percent represents the percentage of requests that should be mirrored to BackendRef. Its minimum value is 0 (indicating 0% of requests) and its maximum value is 100 (indicating 100% of requests). Only one of Fraction or Percent may be specified. If neither field is specified, 100% of requests will be mirrored. */
  "percent"?: number
}

export interface Path {
  /** ReplaceFullPath specifies the value with which to replace the full path of a request during a rewrite or redirect. */
  "replaceFullPath"?: string
  /** ReplacePrefixMatch specifies the value with which to replace the prefix match of a request during a rewrite or redirect. For example, a request to "/foo/bar" with a prefix match of "/foo" and a ReplacePrefixMatch of "/xyz" would be modified to "/xyz/bar". Note that this matches the behavior of the PathPrefix match type. This matches full path elements. A path element refers to the list of labels in the path split by the `/` separator. When specified, a trailing `/` is ignored. For example, the paths `/abc`, `/abc/`, and `/abc/def` would all match the prefix `/abc`, but the path `/abcd` would not. ReplacePrefixMatch is only compatible with a `PathPrefix` HTTPRouteMatch. Using any other HTTPRouteMatch type on the same HTTPRouteRule will result in the implementation setting the Accepted Condition for the Route to `status: False`. Request Path | Prefix Match | Replace Prefix | Modified Path */
  "replacePrefixMatch"?: string
  /** Type defines the type of path modifier. Additional types may be added in a future release of the API. Note that values may be added to this enum, implementations must ensure that unknown values will not cause a crash. Unknown values here must result in the implementation setting the Accepted Condition for the Route to `status: False`, with a Reason of `UnsupportedValue`. */
  "type": "ReplaceFullPath" | "ReplacePrefixMatch"
}

export interface RequestRedirect {
  /** Hostname is the hostname to be used in the value of the `Location` header in the response. When empty, the hostname in the `Host` header of the request is used. Support: Core */
  "hostname"?: string
  /** Path defines parameters used to modify the path of the incoming request. The modified path is then used to construct the `Location` header. When empty, the request path is used as-is. Support: Extended */
  "path"?: Path
  /** Port is the port to be used in the value of the `Location` header in the response. If no port is specified, the redirect port MUST be derived using the following rules: * If redirect scheme is not-empty, the redirect port MUST be the well-known   port associated with the redirect scheme. Specifically "http" to port 80   and "https" to port 443. If the redirect scheme does not have a   well-known port, the listener port of the Gateway SHOULD be used. * If redirect scheme is empty, the redirect port MUST be the Gateway   Listener port. Implementations SHOULD NOT add the port number in the 'Location' header in the following cases: * A Location header that will use HTTP (whether that is determined via   the Listener protocol or the Scheme field) _and_ use port 80. * A Location header that will use HTTPS (whether that is determined via   the Listener protocol or the Scheme field) _and_ use port 443. Support: Extended */
  "port"?: number
  /** Scheme is the scheme to be used in the value of the `Location` header in the response. When empty, the scheme of the request is used. Scheme redirects can affect the port of the redirect, for more information, refer to the documentation for the port field of this filter. Note that values may be added to this enum, implementations must ensure that unknown values will not cause a crash. Unknown values here must result in the implementation setting the Accepted Condition for the Route to `status: False`, with a Reason of `UnsupportedValue`. Support: Extended */
  "scheme"?: "http" | "https"
  /** StatusCode is the HTTP status code to be used in response. Note that values may be added to this enum, implementations must ensure that unknown values will not cause a crash. Unknown values here must result in the implementation setting the Accepted Condition for the Route to `status: False`, with a Reason of `UnsupportedValue`. Support: Core */
  "statusCode"?: 301 | 302
}

export interface ResponseHeaderModifier {
  /** Add adds the given header(s) (name, value) to the request before the action. It appends to any existing values associated with the header name. Input:   GET /foo HTTP/1.1   my-header: foo Config:   add:   - name: "my-header"     value: "bar,baz" Output:   GET /foo HTTP/1.1   my-header: foo,bar,baz */
  "add"?: AddItem[]
  /** Remove the given header(s) from the HTTP request before the action. The value of Remove is a list of HTTP header names. Note that the header names are case-insensitive (see https://datatracker.ietf.org/doc/html/rfc2616#section-4.2). Input:   GET /foo HTTP/1.1   my-header1: foo   my-header2: bar   my-header3: baz Config:   remove: ["my-header1", "my-header3"] Output:   GET /foo HTTP/1.1   my-header2: bar */
  "remove"?: string[]
  /** Set overwrites the request with the given header (name, value) before the action. Input:   GET /foo HTTP/1.1   my-header: foo Config:   set:   - name: "my-header"     value: "bar" Output:   GET /foo HTTP/1.1   my-header: bar */
  "set"?: SetItem[]
}

export interface UrlRewrite {
  /** Hostname is the value to be used to replace the Host header value during forwarding. Support: Extended */
  "hostname"?: string
  /** Path defines a path rewrite. Support: Extended */
  "path"?: Path
}

export interface FiltersItem {
  /** ExtensionRef is an optional, implementation-specific extension to the "filter" behavior.  For example, resource "myroutefilter" in group "networking.example.net"). ExtensionRef MUST NOT be used for core and extended filters. This filter can be used multiple times within the same rule. Support: Implementation-specific */
  "extensionRef"?: ExtensionRef
  /** RequestHeaderModifier defines a schema for a filter that modifies request headers. Support: Core */
  "requestHeaderModifier"?: RequestHeaderModifier
  /** RequestMirror defines a schema for a filter that mirrors requests. Requests are sent to the specified destination, but responses from that destination are ignored. This filter can be used multiple times within the same rule. Note that not all implementations will be able to support mirroring to multiple backends. Support: Extended */
  "requestMirror"?: RequestMirror
  /** RequestRedirect defines a schema for a filter that responds to the request with an HTTP redirection. Support: Core */
  "requestRedirect"?: RequestRedirect
  /** ResponseHeaderModifier defines a schema for a filter that modifies response headers. Support: Extended */
  "responseHeaderModifier"?: ResponseHeaderModifier
  /** Type identifies the type of filter to apply. As with other API fields, types are classified into three conformance levels: - Core: Filter types and their corresponding configuration defined by   "Support: Core" in this package, e.g. "RequestHeaderModifier". All   implementations must support core filters. - Extended: Filter types and their corresponding configuration defined by   "Support: Extended" in this package, e.g. "RequestMirror". Implementers   are encouraged to support extended filters. - Implementation-specific: Filters that are defined and supported by   specific vendors.   In the future, filters showing convergence in behavior across multiple   implementations will be considered for inclusion in extended or core   conformance levels. Filter-specific configuration for such filters   is specified using the ExtensionRef field. `Type` should be set to   "ExtensionRef" for custom filters. Implementers are encouraged to define custom implementation types to extend the core API with implementation-specific behavior. If a reference to a custom filter type cannot be resolved, the filter MUST NOT be skipped. Instead, requests that would have been processed by that filter MUST receive a HTTP error response. Note that values may be added to this enum, implementations must ensure that unknown values will not cause a crash. Unknown values here must result in the implementation setting the Accepted Condition for the Route to `status: False`, with a Reason of `UnsupportedValue`. */
  "type": "RequestHeaderModifier" | "ResponseHeaderModifier" | "RequestMirror" | "RequestRedirect" | "URLRewrite" | "ExtensionRef"
  /** URLRewrite defines a schema for a filter that modifies a request during forwarding. Support: Extended */
  "urlRewrite"?: UrlRewrite
}

export interface BackendRefsItem2 {
  /** Filters defined at this level should be executed if and only if the request is being forwarded to the backend defined here. Support: Implementation-specific (For broader support of filters, use the Filters field in HTTPRouteRule.) */
  "filters"?: FiltersItem[]
  /** Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred. */
  "group"?: string
  /** Kind is the Kubernetes resource kind of the referent. For example "Service". Defaults to "Service" when not specified. ExternalName services can refer to CNAME DNS records that may live outside of the cluster and as such are difficult to reason about in terms of conformance. They also may not be safe to forward to (see CVE-2021-25740 for more information). Implementations SHOULD NOT support ExternalName Services. Support: Core (Services with a type other than ExternalName) Support: Implementation-specific (Services with type ExternalName) */
  "kind"?: string
  /** Name is the name of the referent. */
  "name": string
  /** Namespace is the namespace of the backend. When unspecified, the local namespace is inferred. Note that when a namespace different than the local namespace is specified, a ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. Support: Core */
  "namespace"?: string
  /** Port specifies the destination port number to use for this resource. Port is required when the referent is a Kubernetes Service. In this case, the port number is the service port number, not the target port. For other resources, destination port might be derived from the referent resource or this field. */
  "port"?: number
  /** Weight specifies the proportion of requests forwarded to the referenced backend. This is computed as weight/(sum of all weights in this BackendRefs list). For non-zero values, there may be some epsilon from the exact proportion defined here depending on the precision an implementation supports. Weight is not a percentage and the sum of weights does not need to equal 100. If only one backend is specified and it has a weight greater than 0, 100% of the traffic is forwarded to that backend. If weight is set to 0, no traffic should be forwarded for this entry. If unspecified, weight defaults to 1. Support for this field varies based on the context where used. */
  "weight"?: number
}

export interface HeadersItem3 {
  /** Name is the name of the HTTP Header to be matched. Name matching MUST be case-insensitive. (See https://tools.ietf.org/html/rfc7230#section-3.2). If multiple entries specify equivalent header names, only the first entry with an equivalent name MUST be considered for a match. Subsequent entries with an equivalent header name MUST be ignored. Due to the case-insensitivity of header names, "foo" and "Foo" are considered equivalent. When a header is repeated in an HTTP request, it is implementation-specific behavior as to how this is represented. Generally, proxies should follow the guidance from the RFC: https://www.rfc-editor.org/rfc/rfc7230.html#section-3.2.2 regarding processing a repeated header, with special handling for "Set-Cookie". */
  "name": string
  /** Type specifies how to match against the value of the header. Support: Core (Exact) Support: Implementation-specific (RegularExpression) Since RegularExpression HeaderMatchType has implementation-specific conformance, implementations can support POSIX, PCRE or any other dialects of regular expressions. Please read the implementation's documentation to determine the supported dialect. */
  "type"?: "Exact" | "RegularExpression"
  /** Value is the value of HTTP Header to be matched. */
  "value": string
}

export interface Path2 {
  /** Type specifies how to match against the path Value. Support: Core (Exact, PathPrefix) Support: Implementation-specific (RegularExpression) */
  "type"?: "Exact" | "PathPrefix" | "RegularExpression"
  /** Value of the HTTP path to match against. */
  "value"?: string
}

export interface QueryParamsItem2 {
  /** Name is the name of the HTTP query param to be matched. This must be an exact string match. (See https://tools.ietf.org/html/rfc7230#section-2.7.3). If multiple entries specify equivalent query param names, only the first entry with an equivalent name MUST be considered for a match. Subsequent entries with an equivalent query param name MUST be ignored. If a query param is repeated in an HTTP request, the behavior is purposely left undefined, since different data planes have different capabilities. However, it is *recommended* that implementations should match against the first value of the param if the data plane supports it, as this behavior is expected in other load balancing contexts outside of the Gateway API. Users SHOULD NOT route traffic based on repeated query params to guard themselves against potential differences in the implementations. */
  "name": string
  /** Type specifies how to match against the value of the query parameter. Support: Extended (Exact) Support: Implementation-specific (RegularExpression) Since RegularExpression QueryParamMatchType has Implementation-specific conformance, implementations can support POSIX, PCRE or any other dialects of regular expressions. Please read the implementation's documentation to determine the supported dialect. */
  "type"?: "Exact" | "RegularExpression"
  /** Value is the value of HTTP query param to be matched. */
  "value": string
}

export interface MatchesItem2 {
  /** Headers specifies HTTP request header matchers. Multiple match values are ANDed together, meaning, a request must match all the specified headers to select the route. */
  "headers"?: HeadersItem3[]
  /** Method specifies HTTP method matcher. When specified, this route will be matched only if the request has the specified method. Support: Extended */
  "method"?: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH"
  /** Path specifies a HTTP request path matcher. If this field is not specified, a default prefix match on the "/" path is provided. */
  "path"?: Path2
  /** QueryParams specifies HTTP query parameter matchers. Multiple match values are ANDed together, meaning, a request must match all the specified query parameters to select the route. Support: Extended */
  "queryParams"?: QueryParamsItem2[]
}

export interface Timeouts {
  /** BackendRequest specifies a timeout for an individual request from the gateway to a backend. This covers the time from when the request first starts being sent from the gateway to when the full response has been received from the backend. Setting a timeout to the zero duration (e.g. "0s") SHOULD disable the timeout completely. Implementations that cannot completely disable the timeout MUST instead interpret the zero duration as the longest possible value to which the timeout can be set. An entire client HTTP transaction with a gateway, covered by the Request timeout, may result in more than one call from the gateway to the destination backend, for example, if automatic retries are supported. The value of BackendRequest must be a Gateway API Duration string as defined by GEP-2257.  When this field is unspecified, its behavior is implementation-specific; when specified, the value of BackendRequest must be no more than the value of the Request timeout (since the Request timeout encompasses the BackendRequest timeout). Support: Extended */
  "backendRequest"?: string
  /** Request specifies the maximum duration for a gateway to respond to an HTTP request. If the gateway has not been able to respond before this deadline is met, the gateway MUST return a timeout error. For example, setting the `rules.timeouts.request` field to the value `10s` in an `HTTPRoute` will cause a timeout if a client request is taking longer than 10 seconds to complete. Setting a timeout to the zero duration (e.g. "0s") SHOULD disable the timeout completely. Implementations that cannot completely disable the timeout MUST instead interpret the zero duration as the longest possible value to which the timeout can be set. This timeout is intended to cover as close to the whole request-response transaction as possible although an implementation MAY choose to start the timeout after the entire request stream has been received instead of immediately after the transaction is initiated by the client. The value of Request is a Gateway API Duration string as defined by GEP-2257. When this field is unspecified, request timeout behavior is implementation-specific. Support: Extended */
  "request"?: string
}

export interface RulesItem {
  /** BackendRefs defines the backend(s) where matching requests should be sent. Failure behavior here depends on how many BackendRefs are specified and how many are invalid. If *all* entries in BackendRefs are invalid, and there are also no filters specified in this route rule, *all* traffic which matches this rule MUST receive a 500 status code. See the HTTPBackendRef definition for the rules about what makes a single HTTPBackendRef invalid. When a HTTPBackendRef is invalid, 500 status codes MUST be returned for requests that would have otherwise been routed to an invalid backend. If multiple backends are specified, and some are invalid, the proportion of requests that would otherwise have been routed to an invalid backend MUST receive a 500 status code. For example, if two backends are specified with equal weights, and one is invalid, 50 percent of traffic must receive a 500. Implementations may choose how that 50 percent is determined. When a HTTPBackendRef refers to a Service that has no ready endpoints, implementations SHOULD return a 503 for requests to that backend instead. If an implementation chooses to do this, all of the above rules for 500 responses MUST also apply for responses that return a 503. Support: Core for Kubernetes Service Support: Extended for Kubernetes ServiceImport Support: Implementation-specific for any other resource Support for weight: Core */
  "backendRefs"?: BackendRefsItem2[]
  /** Filters define the filters that are applied to requests that match this rule. Wherever possible, implementations SHOULD implement filters in the order they are specified. Implementations MAY choose to implement this ordering strictly, rejecting any combination or order of filters that cannot be supported. If implementations choose a strict interpretation of filter ordering, they MUST clearly document that behavior. To reject an invalid combination or order of filters, implementations SHOULD consider the Route Rules with this configuration invalid. If all Route Rules in a Route are invalid, the entire Route would be considered invalid. If only a portion of Route Rules are invalid, implementations MUST set the "PartiallyInvalid" condition for the Route. Conformance-levels at this level are defined based on the type of filter: - ALL core filters MUST be supported by all implementations. - Implementers are encouraged to support extended filters. - Implementation-specific custom filters have no API guarantees across   implementations. Specifying the same filter multiple times is not supported unless explicitly indicated in the filter. All filters are expected to be compatible with each other except for the URLRewrite and RequestRedirect filters, which may not be combined. If an implementation cannot support other combinations of filters, they must clearly document that limitation. In cases where incompatible or unsupported filters are specified and cause the `Accepted` condition to be set to status `False`, implementations may use the `IncompatibleFilters` reason to specify this configuration error. Support: Core */
  "filters"?: FiltersItem[]
  /** Matches define conditions used for matching the rule against incoming HTTP requests. Each match is independent, i.e. this rule will be matched if **any** one of the matches is satisfied. For example, take the following matches configuration: ``` matches: - path:     value: "/foo"   headers:   - name: "version"     value: "v2" - path:     value: "/v2/foo" ``` For a request to match against this rule, a request must satisfy EITHER of the two conditions: - path prefixed with `/foo` AND contains the header `version: v2` - path prefix of `/v2/foo` See the documentation for HTTPRouteMatch on how to specify multiple match conditions that should be ANDed together. If no matches are specified, the default is a prefix path match on "/", which has the effect of matching every HTTP request. Proxy or Load Balancer routing configuration generated from HTTPRoutes MUST prioritize matches based on the following criteria, continuing on ties. Across all rules specified on applicable Routes, precedence must be given to the match having: * "Exact" path match. * "Prefix" path match with largest number of characters. * Method match. * Largest number of header matches. * Largest number of query param matches. Note: The precedence of RegularExpression path matches are implementation-specific. If ties still exist across multiple Routes, matching precedence MUST be determined in order of the following criteria, continuing on ties: * The oldest Route based on creation timestamp. * The Route appearing first in alphabetical order by   "{namespace}/{name}". If ties still exist within an HTTPRoute, matching precedence MUST be granted to the FIRST matching rule (in list order) with a match meeting the above criteria. When no rules matching a request have been successfully attached to the parent a request is coming from, a HTTP 404 status code MUST be returned. */
  "matches"?: MatchesItem2[]
  /** Name is the name of the route rule. This name MUST be unique within a Route if it is set. Support: Extended */
  "name"?: string
  /** Timeouts defines the timeouts that can be configured for an HTTP request. Support: Extended */
  "timeouts"?: Timeouts
}

export interface HTTPRouteSpec {
  /** Hostnames defines a set of hostnames that should match against the HTTP Host header to select a HTTPRoute used to process the request. Implementations MUST ignore any port value specified in the HTTP Host header while performing a match and (absent of any applicable header modification configuration) MUST forward this header unmodified to the backend. Valid values for Hostnames are determined by RFC 1123 definition of a hostname with 2 notable exceptions: 1. IPs are not allowed. 2. A hostname may be prefixed with a wildcard label (`*.`). The wildcard    label must appear by itself as the first label. If a hostname is specified by both the Listener and HTTPRoute, there must be at least one intersecting hostname for the HTTPRoute to be attached to the Listener. For example: * A Listener with `test.example.com` as the hostname matches HTTPRoutes   that have either not specified any hostnames, or have specified at   least one of `test.example.com` or `*.example.com`. * A Listener with `*.example.com` as the hostname matches HTTPRoutes   that have either not specified any hostnames or have specified at least   one hostname that matches the Listener hostname. For example,   `*.example.com`, `test.example.com`, and `foo.test.example.com` would   all match. On the other hand, `example.com` and `test.example.net` would   not match. Hostnames that are prefixed with a wildcard label (`*.`) are interpreted as a suffix match. That means that a match for `*.example.com` would match both `test.example.com`, and `foo.test.example.com`, but not `example.com`. If both the Listener and HTTPRoute have specified hostnames, any HTTPRoute hostnames that do not match the Listener hostname MUST be ignored. For example, if a Listener specified `*.example.com`, and the HTTPRoute specified `test.example.com` and `test.example.net`, `test.example.net` must not be considered for a match. If both the Listener and HTTPRoute have specified hostnames, and none match with the criteria above, then the HTTPRoute is not accepted. The implementation must raise an 'Accepted' Condition with a status of `False` in the corresponding RouteParentStatus. In the event that multiple HTTPRoutes specify intersecting hostnames (e.g. overlapping wildcard matching and exact matching hostnames), precedence must be given to rules from the HTTPRoute with the largest number of: * Characters in a matching non-wildcard hostname. * Characters in a matching hostname. If ties exist across multiple Routes, the matching precedence rules for HTTPRouteMatches takes over. Support: Core */
  "hostnames"?: string[]
  /** ParentRefs references the resources (usually Gateways) that a Route wants to be attached to. Note that the referenced parent resource needs to allow this for the attachment to be complete. For Gateways, that means the Gateway needs to allow attachment from Routes of this kind and namespace. For Services, that means the Service must either be in the same namespace for a "producer" route, or the mesh implementation must support and allow "consumer" routes for the referenced Service. ReferenceGrant is not applicable for governing ParentRefs to Services - it is not possible to create a "producer" route for a Service in a different namespace from the Route. There are two kinds of parent resources with "Core" support: * Gateway (Gateway conformance profile) * Service (Mesh conformance profile, ClusterIP Services only) This API may be extended in the future to support additional kinds of parent resources. ParentRefs must be _distinct_. This means either that: * They select different objects.  If this is the case, then parentRef   entries are distinct. In terms of fields, this means that the   multi-part key defined by `group`, `kind`, `namespace`, and `name` must   be unique across all parentRef entries in the Route. * They do not select different objects, but for each optional field used,   each ParentRef that selects the same object must set the same set of   optional fields to different values. If one ParentRef sets a   combination of optional fields, all must set the same combination. Some examples: * If one ParentRef sets `sectionName`, all ParentRefs referencing the   same object must also set `sectionName`. * If one ParentRef sets `port`, all ParentRefs referencing the same   object must also set `port`. * If one ParentRef sets `sectionName` and `port`, all ParentRefs   referencing the same object must also set `sectionName` and `port`. It is possible to separately reference multiple distinct objects that may be collapsed by an implementation. For example, some implementations may choose to merge compatible Gateway Listeners together. If that is the case, the list of routes attached to those resources should also be merged. Note that for ParentRefs that cross namespace boundaries, there are specific rules. Cross-namespace references are only valid if they are explicitly allowed by something in the namespace they are referring to. For example, Gateway has the AllowedRoutes field, and ReferenceGrant provides a generic way to enable other kinds of cross-namespace reference. */
  "parentRefs"?: ParentRefsItem[]
  /** Rules are a list of HTTP matchers, filters and actions. */
  "rules"?: RulesItem[]
}

export interface ParentRef {
  /** Group is the group of the referent. When unspecified, "gateway.networking.k8s.io" is inferred. To set the core API group (such as for a "Service" kind referent), Group must be explicitly set to "" (empty string). Support: Core */
  "group"?: string
  /** Kind is kind of the referent. There are two kinds of parent resources with "Core" support: * Gateway (Gateway conformance profile) * Service (Mesh conformance profile, ClusterIP Services only) Support for other resources is Implementation-Specific. */
  "kind"?: string
  /** Name is the name of the referent. Support: Core */
  "name": string
  /** Namespace is the namespace of the referent. When unspecified, this refers to the local namespace of the Route. Note that there are specific rules for ParentRefs which cross namespace boundaries. Cross-namespace references are only valid if they are explicitly allowed by something in the namespace they are referring to. For example: Gateway has the AllowedRoutes field, and ReferenceGrant provides a generic way to enable any other kind of cross-namespace reference. Support: Core */
  "namespace"?: string
  /** Port is the network port this Route targets. It can be interpreted differently based on the type of parent resource. When the parent resource is a Gateway, this targets all listeners listening on the specified port that also support this kind of Route(and select this Route). It's not recommended to set `Port` unless the networking behaviors specified in a Route must apply to a specific port as opposed to a listener(s) whose port(s) may be changed. When both Port and SectionName are specified, the name and port of the selected listener must match both specified values. Implementations MAY choose to support other parent resources. Implementations supporting other types of parent resources MUST clearly document how/if Port is interpreted. For the purpose of status, an attachment is considered successful as long as the parent resource accepts it partially. For example, Gateway listeners can restrict which Routes can attach to them by Route kind, namespace, or hostname. If 1 of 2 Gateway listeners accept attachment from the referencing Route, the Route MUST be considered successfully attached. If no Gateway listeners accept attachment from this Route, the Route MUST be considered detached from the Gateway. Support: Extended */
  "port"?: number
  /** SectionName is the name of a section within the target resource. In the following resources, SectionName is interpreted as the following: * Gateway: Listener name. When both Port (experimental) and SectionName are specified, the name and port of the selected listener must match both specified values. * Service: Port name. When both Port (experimental) and SectionName are specified, the name and port of the selected listener must match both specified values. Implementations MAY choose to support attaching Routes to other resources. If that is the case, they MUST clearly document how SectionName is interpreted. When unspecified (empty string), this will reference the entire resource. For the purpose of status, an attachment is considered successful if at least one section in the parent resource accepts it. For example, Gateway listeners can restrict which Routes can attach to them by Route kind, namespace, or hostname. If 1 of 2 Gateway listeners accept attachment from the referencing Route, the Route MUST be considered successfully attached. If no Gateway listeners accept attachment from this Route, the Route MUST be considered detached from the Gateway. Support: Core */
  "sectionName"?: string
}

export interface ParentsItem {
  /** Conditions describes the status of the route with respect to the Gateway. Note that the route's availability is also subject to the Gateway's own status conditions and listener status. If the Route's ParentRef specifies an existing Gateway that supports Routes of this kind AND that Gateway's controller has sufficient access, then that Gateway's controller MUST set the "Accepted" condition on the Route, to indicate whether the route has been accepted or rejected by the Gateway, and why. A Route MUST be considered "Accepted" if at least one of the Route's rules is implemented by the Gateway. There are a number of cases where the "Accepted" condition may not be set due to lack of controller visibility, that includes when: * The Route refers to a nonexistent parent. * The Route is of a type that the controller does not support. * The Route is in a namespace the controller does not have access to. */
  "conditions": ConditionsItem[]
  /** ControllerName is a domain/path string that indicates the name of the controller that wrote this status. This corresponds with the controllerName field on GatewayClass. Example: "example.net/gateway-controller". The format of this field is DOMAIN "/" PATH, where DOMAIN and PATH are valid Kubernetes names (https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names). Controllers MUST populate this field when writing status. Controllers should ensure that entries to status populated with their ControllerName are cleaned up when they are no longer necessary. */
  "controllerName": string
  /** ParentRef corresponds with a ParentRef in the spec that this RouteParentStatus struct describes the status of. */
  "parentRef": ParentRef
}

export interface HTTPRouteStatus {
  /** Parents is a list of parent resources (usually Gateways) that are associated with the route, and the status of the route with respect to each parent. When this route attaches to a parent, the controller that manages the parent must add an entry to this list when the controller first sees the route and should update the entry as appropriate when the route or gateway is modified. Note that parent references that cannot be resolved by an implementation of this API will not be added to this list. Implementations of this API can only populate Route status for the Gateways/parent resources they are responsible for. A maximum of 32 Gateways will be represented in this list. An empty list means the route has not been attached to any Gateway. */
  "parents": ParentsItem[]
}
