/**
 * GENERATED from keycloak CRDs — do not edit by hand.
 * Regenerate with: npm run generate -w @r8s/crds
 */
import type { ObjectMeta } from '@r8s/k8s-types'
import { jsx } from '@r8s/core'

export interface Keycloak {
  apiVersion: 'k8s.keycloak.org/v2alpha1'
  kind: 'Keycloak'
  metadata: ObjectMeta
  spec: KeycloakSpec
  status?: KeycloakStatus
}

/** Props for the {@link Keycloak} component — a 1:1 mapping of the k8s.keycloak.org/v2alpha1 CRD. */
export interface KeycloakProps {
  metadata: ObjectMeta
  spec: KeycloakSpec
}

/** Render a Keycloak (k8s.keycloak.org/v2alpha1) exactly as defined by its CRD. */
export function KeycloakComponent(props: KeycloakProps) {
  return jsx('Keycloak', {
    apiVersion: 'k8s.keycloak.org/v2alpha1',
    kind: 'Keycloak',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface KeycloakRealmImport {
  apiVersion: 'k8s.keycloak.org/v2alpha1'
  kind: 'KeycloakRealmImport'
  metadata: ObjectMeta
  spec: KeycloakRealmImportSpec
  status?: KeycloakRealmImportStatus
}

/** Props for the {@link KeycloakRealmImport} component — a 1:1 mapping of the k8s.keycloak.org/v2alpha1 CRD. */
export interface KeycloakRealmImportProps {
  metadata: ObjectMeta
  spec: KeycloakRealmImportSpec
}

/** Render a KeycloakRealmImport (k8s.keycloak.org/v2alpha1) exactly as defined by its CRD. */
export function KeycloakRealmImportComponent(props: KeycloakRealmImportProps) {
  return jsx('KeycloakRealmImport', {
    apiVersion: 'k8s.keycloak.org/v2alpha1',
    kind: 'KeycloakRealmImport',
    metadata: props.metadata,
    spec: props.spec,
  })
}

export interface Secret {
  "key"?: string
  "name"?: string
  "optional"?: boolean
}

export interface AdditionalOptionsItem {
  "name"?: string
  "secret"?: Secret
  "value"?: string
}

export interface ConfigMapFile {
  "key"?: string
  "name"?: string
  "optional"?: boolean
}

export interface Cache {
  "configMapFile"?: ConfigMapFile
}

export interface PasswordSecret {
  "key"?: string
  "name"?: string
  "optional"?: boolean
}

export interface UsernameSecret {
  "key"?: string
  "name"?: string
  "optional"?: boolean
}

export interface Db {
  /** Sets the database name of the default JDBC URL of the chosen vendor. If the `url` option is set, this option is ignored. */
  "database"?: string
  /** Sets the hostname of the default JDBC URL of the chosen vendor. If the `url` option is set, this option is ignored. */
  "host"?: string
  /** The reference to a secret holding the password of the database user. */
  "passwordSecret"?: PasswordSecret
  /** The initial size of the connection pool. */
  "poolInitialSize"?: number
  /** The maximum size of the connection pool. */
  "poolMaxSize"?: number
  /** The minimal size of the connection pool. */
  "poolMinSize"?: number
  /** Sets the port of the default JDBC URL of the chosen vendor. If the `url` option is set, this option is ignored. */
  "port"?: number
  /** The database schema to be used. */
  "schema"?: string
  /** The full database JDBC URL. If not provided, a default URL is set based on the selected database vendor. For instance, if using 'postgres', the default JDBC URL would be 'jdbc:postgresql://localhost/keycloak'.  */
  "url"?: string
  /** The reference to a secret holding the username of the database user. */
  "usernameSecret"?: UsernameSecret
  /** The database vendor. */
  "vendor"?: string
}

export interface Features {
  /** Disabled Keycloak features */
  "disabled"?: string[]
  /** Enabled Keycloak features */
  "enabled"?: string[]
}

export interface Hostname {
  /** The hostname for accessing the administration console. */
  "admin"?: string
  /** Set the base URL for accessing the administration console, including scheme, host, port and path */
  "adminUrl"?: string
  /** Hostname for the Keycloak server. */
  "hostname"?: string
  /** Disables dynamically resolving the hostname from request headers. */
  "strict"?: boolean
  /** By default backchannel URLs are dynamically resolved from request headers to allow internal and external applications. */
  "strictBackchannel"?: boolean
}

export interface Http {
  /** Enables the HTTP listener. */
  "httpEnabled"?: boolean
  /** The used HTTP port. */
  "httpPort"?: number
  /** The used HTTPS port. */
  "httpsPort"?: number
  /** A secret containing the TLS configuration for HTTPS. Reference: https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets. */
  "tlsSecret"?: string
}

export interface ImagePullSecretsItem {
  "name"?: string
}

export interface Ingress {
  /** Additional annotations to be appended to the Ingress object */
  "annotations"?: Record<string, unknown>
  "className"?: string
  "enabled"?: boolean
}

export interface Proxy {
  /** The proxy headers that should be accepted by the server. Misconfiguration might leave the server exposed to security vulnerabilities. */
  "headers"?: string
}

export interface ClaimsItem {
  "name"?: string
}

export interface Resources {
  "claims"?: ClaimsItem[]
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface Transaction {
  /** Determine whether Keycloak should use a non-XA datasource in case the database does not support XA transactions. */
  "xaEnabled"?: boolean
}

export interface ManagedFieldsItem {
  "apiVersion"?: string
  "fieldsType"?: string
  "fieldsV1"?: Record<string, unknown>
  "manager"?: string
  "operation"?: string
  "subresource"?: string
  "time"?: string
}

export interface OwnerReferencesItem {
  "apiVersion"?: string
  "blockOwnerDeletion"?: boolean
  "controller"?: boolean
  "kind"?: string
  "name"?: string
  "uid"?: string
}

export interface Metadata {
  "annotations"?: Record<string, unknown>
  "creationTimestamp"?: string
  "deletionGracePeriodSeconds"?: number
  "deletionTimestamp"?: string
  "finalizers"?: string[]
  "generateName"?: string
  "generation"?: number
  "labels"?: Record<string, unknown>
  "managedFields"?: ManagedFieldsItem[]
  "name"?: string
  "namespace"?: string
  "ownerReferences"?: OwnerReferencesItem[]
  "resourceVersion"?: string
  "selfLink"?: string
  "uid"?: string
}

export interface MatchExpressionsItem {
  "key"?: string
  "operator"?: string
  "values"?: string[]
}

export interface MatchFieldsItem {
  "key"?: string
  "operator"?: string
  "values"?: string[]
}

export interface Preference {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchFields"?: MatchFieldsItem[]
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem {
  "preference"?: Preference
  "weight"?: number
}

export interface NodeSelectorTermsItem {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchFields"?: MatchFieldsItem[]
}

export interface RequiredDuringSchedulingIgnoredDuringExecution {
  "nodeSelectorTerms"?: NodeSelectorTermsItem[]
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
  "topologyKey"?: string
}

export interface PreferredDuringSchedulingIgnoredDuringExecutionItem2 {
  "podAffinityTerm"?: PodAffinityTerm
  "weight"?: number
}

export interface RequiredDuringSchedulingIgnoredDuringExecutionItem {
  "labelSelector"?: LabelSelector
  "matchLabelKeys"?: string[]
  "mismatchLabelKeys"?: string[]
  "namespaceSelector"?: NamespaceSelector
  "namespaces"?: string[]
  "topologyKey"?: string
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

export interface ConfigMapKeyRef {
  "key"?: string
  "name"?: string
  "optional"?: boolean
}

export interface FieldRef {
  "apiVersion"?: string
  "fieldPath"?: string
}

export interface ResourceFieldRef {
  "containerName"?: string
  "divisor"?: number | string
  "resource"?: string
}

export interface SecretKeyRef {
  "key"?: string
  "name"?: string
  "optional"?: boolean
}

export interface ValueFrom {
  "configMapKeyRef"?: ConfigMapKeyRef
  "fieldRef"?: FieldRef
  "resourceFieldRef"?: ResourceFieldRef
  "secretKeyRef"?: SecretKeyRef
}

export interface EnvItem {
  "name"?: string
  "value"?: string
  "valueFrom"?: ValueFrom
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

export interface Exec {
  "command"?: string[]
}

export interface HttpHeadersItem {
  "name"?: string
  "value"?: string
}

export interface HttpGet {
  "host"?: string
  "httpHeaders"?: HttpHeadersItem[]
  "path"?: string
  "port"?: number | string
  "scheme"?: string
}

export interface Sleep {
  "seconds"?: number
}

export interface TcpSocket {
  "host"?: string
  "port"?: number | string
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
}

export interface Grpc {
  "port"?: number
  "service"?: string
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

export interface PortsItem {
  "containerPort"?: number
  "hostIP"?: string
  "hostPort"?: number
  "name"?: string
  "protocol"?: string
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

export interface ResizePolicyItem {
  "resourceName"?: string
  "restartPolicy"?: string
}

export interface Capabilities {
  "add"?: string[]
  "drop"?: string[]
}

export interface SeLinuxOptions {
  "level"?: string
  "role"?: string
  "type"?: string
  "user"?: string
}

export interface SeccompProfile {
  "localhostProfile"?: string
  "type"?: string
}

export interface WindowsOptions {
  "gmsaCredentialSpec"?: string
  "gmsaCredentialSpecName"?: string
  "hostProcess"?: boolean
  "runAsUserName"?: string
}

export interface SecurityContext {
  "allowPrivilegeEscalation"?: boolean
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
  "devicePath"?: string
  "name"?: string
}

export interface VolumeMountsItem {
  "mountPath"?: string
  "mountPropagation"?: string
  "name"?: string
  "readOnly"?: boolean
  "subPath"?: string
  "subPathExpr"?: string
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
  "name"?: string
  "ports"?: PortsItem[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources
  "restartPolicy"?: string
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

export interface OptionsItem {
  "name"?: string
  "value"?: string
}

export interface DnsConfig {
  "nameservers"?: string[]
  "options"?: OptionsItem[]
  "searches"?: string[]
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
  "name"?: string
  "ports"?: PortsItem[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources
  "restartPolicy"?: string
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
  "ip"?: string
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
  "name"?: string
  "ports"?: PortsItem[]
  "readinessProbe"?: ReadinessProbe
  "resizePolicy"?: ResizePolicyItem[]
  "resources"?: Resources
  "restartPolicy"?: string
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

export interface Os {
  "name"?: string
}

export interface ReadinessGatesItem {
  "conditionType"?: string
}

export interface Source {
  "resourceClaimName"?: string
  "resourceClaimTemplateName"?: string
}

export interface ResourceClaimsItem {
  "name"?: string
  "source"?: Source
}

export interface SchedulingGatesItem {
  "name"?: string
}

export interface SysctlsItem {
  "name"?: string
  "value"?: string
}

export interface SecurityContext2 {
  "fsGroup"?: number
  "fsGroupChangePolicy"?: string
  "runAsGroup"?: number
  "runAsNonRoot"?: boolean
  "runAsUser"?: number
  "seLinuxOptions"?: SeLinuxOptions
  "seccompProfile"?: SeccompProfile
  "supplementalGroups"?: number[]
  "sysctls"?: SysctlsItem[]
  "windowsOptions"?: WindowsOptions
}

export interface TolerationsItem {
  "effect"?: string
  "key"?: string
  "operator"?: string
  "tolerationSeconds"?: number
  "value"?: string
}

export interface TopologySpreadConstraintsItem {
  "labelSelector"?: LabelSelector
  "matchLabelKeys"?: string[]
  "maxSkew"?: number
  "minDomains"?: number
  "nodeAffinityPolicy"?: string
  "nodeTaintsPolicy"?: string
  "topologyKey"?: string
  "whenUnsatisfiable"?: string
}

export interface AwsElasticBlockStore {
  "fsType"?: string
  "partition"?: number
  "readOnly"?: boolean
  "volumeID"?: string
}

export interface AzureDisk {
  "cachingMode"?: string
  "diskName"?: string
  "diskURI"?: string
  "fsType"?: string
  "kind"?: string
  "readOnly"?: boolean
}

export interface AzureFile {
  "readOnly"?: boolean
  "secretName"?: string
  "shareName"?: string
}

export interface SecretRef2 {
  "name"?: string
}

export interface Cephfs {
  "monitors"?: string[]
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
  "volumeID"?: string
}

export interface ItemsItem {
  "key"?: string
  "mode"?: number
  "path"?: string
}

export interface ConfigMap {
  "defaultMode"?: number
  "items"?: ItemsItem[]
  "name"?: string
  "optional"?: boolean
}

export interface NodePublishSecretRef {
  "name"?: string
}

export interface Csi {
  "driver"?: string
  "fsType"?: string
  "nodePublishSecretRef"?: NodePublishSecretRef
  "readOnly"?: boolean
  "volumeAttributes"?: Record<string, unknown>
}

export interface ItemsItem2 {
  "fieldRef"?: FieldRef
  "mode"?: number
  "path"?: string
  "resourceFieldRef"?: ResourceFieldRef
}

export interface DownwardAPI {
  "defaultMode"?: number
  "items"?: ItemsItem2[]
}

export interface EmptyDir {
  "medium"?: string
  "sizeLimit"?: number | string
}

export interface DataSource {
  "apiGroup"?: string
  "kind"?: string
  "name"?: string
}

export interface DataSourceRef {
  "apiGroup"?: string
  "kind"?: string
  "name"?: string
  "namespace"?: string
}

export interface Resources2 {
  "limits"?: Record<string, unknown>
  "requests"?: Record<string, unknown>
}

export interface Selector {
  "matchExpressions"?: MatchExpressionsItem[]
  "matchLabels"?: Record<string, unknown>
}

export interface Spec2 {
  "accessModes"?: string[]
  "dataSource"?: DataSource
  "dataSourceRef"?: DataSourceRef
  "resources"?: Resources2
  "selector"?: Selector
  "storageClassName"?: string
  "volumeAttributesClassName"?: string
  "volumeMode"?: string
  "volumeName"?: string
}

export interface VolumeClaimTemplate {
  "metadata"?: Metadata
  "spec"?: Spec2
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
  "driver"?: string
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
  "pdName"?: string
  "readOnly"?: boolean
}

export interface GitRepo {
  "directory"?: string
  "repository"?: string
  "revision"?: string
}

export interface Glusterfs {
  "endpoints"?: string
  "path"?: string
  "readOnly"?: boolean
}

export interface HostPath {
  "path"?: string
  "type"?: string
}

export interface Iscsi {
  "chapAuthDiscovery"?: boolean
  "chapAuthSession"?: boolean
  "fsType"?: string
  "initiatorName"?: string
  "iqn"?: string
  "iscsiInterface"?: string
  "lun"?: number
  "portals"?: string[]
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "targetPortal"?: string
}

export interface Nfs {
  "path"?: string
  "readOnly"?: boolean
  "server"?: string
}

export interface PersistentVolumeClaim {
  "claimName"?: string
  "readOnly"?: boolean
}

export interface PhotonPersistentDisk {
  "fsType"?: string
  "pdID"?: string
}

export interface PortworxVolume {
  "fsType"?: string
  "readOnly"?: boolean
  "volumeID"?: string
}

export interface ClusterTrustBundle {
  "labelSelector"?: LabelSelector
  "name"?: string
  "optional"?: boolean
  "path"?: string
  "signerName"?: string
}

export interface ConfigMap2 {
  "items"?: ItemsItem[]
  "name"?: string
  "optional"?: boolean
}

export interface DownwardAPI2 {
  "items"?: ItemsItem2[]
}

export interface Secret2 {
  "items"?: ItemsItem[]
  "name"?: string
  "optional"?: boolean
}

export interface ServiceAccountToken {
  "audience"?: string
  "expirationSeconds"?: number
  "path"?: string
}

export interface SourcesItem {
  "clusterTrustBundle"?: ClusterTrustBundle
  "configMap"?: ConfigMap2
  "downwardAPI"?: DownwardAPI2
  "secret"?: Secret2
  "serviceAccountToken"?: ServiceAccountToken
}

export interface Projected {
  "defaultMode"?: number
  "sources"?: SourcesItem[]
}

export interface Quobyte {
  "group"?: string
  "readOnly"?: boolean
  "registry"?: string
  "tenant"?: string
  "user"?: string
  "volume"?: string
}

export interface Rbd {
  "fsType"?: string
  "image"?: string
  "keyring"?: string
  "monitors"?: string[]
  "pool"?: string
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "user"?: string
}

export interface ScaleIO {
  "fsType"?: string
  "gateway"?: string
  "protectionDomain"?: string
  "readOnly"?: boolean
  "secretRef"?: SecretRef2
  "sslEnabled"?: boolean
  "storageMode"?: string
  "storagePool"?: string
  "system"?: string
  "volumeName"?: string
}

export interface Secret3 {
  "defaultMode"?: number
  "items"?: ItemsItem[]
  "optional"?: boolean
  "secretName"?: string
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
  "volumePath"?: string
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
  "iscsi"?: Iscsi
  "name"?: string
  "nfs"?: Nfs
  "persistentVolumeClaim"?: PersistentVolumeClaim
  "photonPersistentDisk"?: PhotonPersistentDisk
  "portworxVolume"?: PortworxVolume
  "projected"?: Projected
  "quobyte"?: Quobyte
  "rbd"?: Rbd
  "scaleIO"?: ScaleIO
  "secret"?: Secret3
  "storageos"?: Storageos
  "vsphereVolume"?: VsphereVolume
}

export interface Spec {
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
  "hostUsers"?: boolean
  "hostname"?: string
  "imagePullSecrets"?: ImagePullSecretsItem[]
  "initContainers"?: InitContainersItem[]
  "nodeName"?: string
  "nodeSelector"?: Record<string, unknown>
  "os"?: Os
  "overhead"?: Record<string, unknown>
  "preemptionPolicy"?: string
  "priority"?: number
  "priorityClassName"?: string
  "readinessGates"?: ReadinessGatesItem[]
  "resourceClaims"?: ResourceClaimsItem[]
  "restartPolicy"?: string
  "runtimeClassName"?: string
  "schedulerName"?: string
  "schedulingGates"?: SchedulingGatesItem[]
  "securityContext"?: SecurityContext2
  "serviceAccount"?: string
  "serviceAccountName"?: string
  "setHostnameAsFQDN"?: boolean
  "shareProcessNamespace"?: boolean
  "subdomain"?: string
  "terminationGracePeriodSeconds"?: number
  "tolerations"?: TolerationsItem[]
  "topologySpreadConstraints"?: TopologySpreadConstraintsItem[]
  "volumes"?: VolumesItem[]
}

export interface PodTemplate {
  "metadata"?: Metadata
  "spec"?: Spec
}

export interface Unsupported {
  /** You can configure that will be merged with the one configured by default by the operator. Use at your own risk, we reserve the possibility to remove/change the way any field gets merged in future releases without notice. Reference: https://kubernetes.io/docs/concepts/workloads/pods/#pod-templates */
  "podTemplate"?: PodTemplate
}

export interface KeycloakSpec {
  /** Configuration of the Keycloak server. expressed as a keys (reference: https://www.keycloak.org/server/all-config) and values that can be either direct values or references to secrets. */
  "additionalOptions"?: AdditionalOptionsItem[]
  /** In this section you can configure Keycloak's cache */
  "cache"?: Cache
  /** In this section you can find all properties related to connect to a database. */
  "db"?: Db
  /** In this section you can configure Keycloak features, which should be enabled/disabled. */
  "features"?: Features
  /** In this section you can configure Keycloak hostname and related properties. */
  "hostname"?: Hostname
  /** In this section you can configure Keycloak features related to HTTP and HTTPS */
  "http"?: Http
  /** Custom Keycloak image to be used. */
  "image"?: string
  /** Secret(s) that might be used when pulling an image from a private container image registry or repository. */
  "imagePullSecrets"?: ImagePullSecretsItem[]
  /** The deployment is, by default, exposed through a basic ingress. You can change this behaviour by setting the enabled property to false. */
  "ingress"?: Ingress
  /** Number of Keycloak instances in HA mode. Default is 1. */
  "instances"?: number
  /** In this section you can configure Keycloak's reverse proxy setting */
  "proxy"?: Proxy
  /** Compute Resources required by Keycloak container */
  "resources"?: Resources
  /** Set to force the behavior of the --optimized flag for the start command. If left unspecified the operator will assume custom images have already been augmented. */
  "startOptimized"?: boolean
  /** In this section you can find all properties related to the settings of transaction behavior. */
  "transaction"?: Transaction
  /** In this section you can configure Keycloak truststores. */
  "truststores"?: Record<string, unknown>
  /** In this section you can configure podTemplate advanced features, not production-ready, and not supported settings. Use at your own risk and open an issue with your use-case if you don't find an alternative way. */
  "unsupported"?: Unsupported
}

export interface ConditionsItem {
  "lastTransitionTime"?: string
  "message"?: string
  "observedGeneration"?: number
  "status"?: string
  "type"?: string
}

export interface KeycloakStatus {
  "conditions"?: ConditionsItem[]
  "instances"?: number
  "observedGeneration"?: number
  "selector"?: string
}

export interface Owner {
  "id"?: string
  "name"?: string
}

export interface ScopesItem {
  "displayName"?: string
  "iconUri"?: string
  "id"?: string
  "name"?: string
}

export interface ResourcesDataItem {
  "_id"?: string
  "attributes"?: Record<string, unknown>
  "displayName"?: string
  "icon_uri"?: string
  "name"?: string
  "owner"?: Owner
  "ownerManagedAccess"?: boolean
  "scopes"?: ScopesItem[]
  "type"?: string
  "uris"?: string[]
}

export interface ScopesDataItem {
  "displayName"?: string
  "iconUri"?: string
  "id"?: string
  "name"?: string
}

export interface PoliciesItem {
  "config"?: Record<string, unknown>
  "decisionStrategy"?: string
  "description"?: string
  "id"?: string
  "logic"?: string
  "name"?: string
  "owner"?: string
  "policies"?: string[]
  "resources"?: string[]
  "resourcesData"?: ResourcesDataItem[]
  "scopes"?: string[]
  "scopesData"?: ScopesDataItem[]
  "type"?: string
}

export interface ResourcesItem {
  "_id"?: string
  "attributes"?: Record<string, unknown>
  "displayName"?: string
  "icon_uri"?: string
  "name"?: string
  "owner"?: Owner
  "ownerManagedAccess"?: boolean
  "scopes"?: ScopesItem[]
  "type"?: string
  "uris"?: string[]
}

export interface AuthorizationSettings {
  "allowRemoteResourceManagement"?: boolean
  "clientId"?: string
  "decisionStrategy"?: string
  "id"?: string
  "name"?: string
  "policies"?: PoliciesItem[]
  "policyEnforcementMode"?: string
  "resources"?: ResourcesItem[]
  "scopes"?: ScopesItem[]
}

export interface Claims {
  "address"?: boolean
  "email"?: boolean
  "gender"?: boolean
  "locale"?: boolean
  "name"?: boolean
  "phone"?: boolean
  "picture"?: boolean
  "profile"?: boolean
  "username"?: boolean
  "website"?: boolean
}

export interface ProtocolMappersItem {
  "config"?: Record<string, unknown>
  "consentRequired"?: boolean
  "consentText"?: string
  "id"?: string
  "name"?: string
  "protocol"?: string
  "protocolMapper"?: string
}

export interface ApplicationsItem {
  "access"?: Record<string, unknown>
  "adminUrl"?: string
  "alwaysDisplayInConsole"?: boolean
  "attributes"?: Record<string, unknown>
  "authenticationFlowBindingOverrides"?: Record<string, unknown>
  "authorizationServicesEnabled"?: boolean
  "authorizationSettings"?: AuthorizationSettings
  "baseUrl"?: string
  "bearerOnly"?: boolean
  "claims"?: Claims
  "clientAuthenticatorType"?: string
  "clientId"?: string
  "clientTemplate"?: string
  "consentRequired"?: boolean
  "defaultClientScopes"?: string[]
  "defaultRoles"?: string[]
  "description"?: string
  "directAccessGrantsEnabled"?: boolean
  "directGrantsOnly"?: boolean
  "enabled"?: boolean
  "frontchannelLogout"?: boolean
  "fullScopeAllowed"?: boolean
  "id"?: string
  "implicitFlowEnabled"?: boolean
  "name"?: string
  "nodeReRegistrationTimeout"?: number
  "notBefore"?: number
  "optionalClientScopes"?: string[]
  "origin"?: string
  "protocol"?: string
  "protocolMappers"?: ProtocolMappersItem[]
  "publicClient"?: boolean
  "redirectUris"?: string[]
  "registeredNodes"?: Record<string, unknown>
  "registrationAccessToken"?: string
  "rootUrl"?: string
  "secret"?: string
  "serviceAccountsEnabled"?: boolean
  "standardFlowEnabled"?: boolean
  "surrogateAuthRequired"?: boolean
  "useTemplateConfig"?: boolean
  "useTemplateMappers"?: boolean
  "useTemplateScope"?: boolean
  "webOrigins"?: string[]
}

export interface AuthenticationExecutionsItem {
  "authenticator"?: string
  "authenticatorConfig"?: string
  "authenticatorFlow"?: boolean
  "autheticatorFlow"?: boolean
  "flowAlias"?: string
  "priority"?: number
  "requirement"?: string
  "userSetupAllowed"?: boolean
}

export interface AuthenticationFlowsItem {
  "alias"?: string
  "authenticationExecutions"?: AuthenticationExecutionsItem[]
  "builtIn"?: boolean
  "description"?: string
  "id"?: string
  "providerId"?: string
  "topLevel"?: boolean
}

export interface AuthenticatorConfigItem {
  "alias"?: string
  "config"?: Record<string, unknown>
  "id"?: string
}

export interface ClientScopesItem {
  "attributes"?: Record<string, unknown>
  "description"?: string
  "id"?: string
  "name"?: string
  "protocol"?: string
  "protocolMappers"?: ProtocolMappersItem[]
}

export interface ClientTemplatesItem {
  "attributes"?: Record<string, unknown>
  "bearerOnly"?: boolean
  "consentRequired"?: boolean
  "description"?: string
  "directAccessGrantsEnabled"?: boolean
  "frontchannelLogout"?: boolean
  "fullScopeAllowed"?: boolean
  "id"?: string
  "implicitFlowEnabled"?: boolean
  "name"?: string
  "protocol"?: string
  "protocolMappers"?: ProtocolMappersItem[]
  "publicClient"?: boolean
  "serviceAccountsEnabled"?: boolean
  "standardFlowEnabled"?: boolean
}

export interface ClientsItem {
  "access"?: Record<string, unknown>
  "adminUrl"?: string
  "alwaysDisplayInConsole"?: boolean
  "attributes"?: Record<string, unknown>
  "authenticationFlowBindingOverrides"?: Record<string, unknown>
  "authorizationServicesEnabled"?: boolean
  "authorizationSettings"?: AuthorizationSettings
  "baseUrl"?: string
  "bearerOnly"?: boolean
  "clientAuthenticatorType"?: string
  "clientId"?: string
  "clientTemplate"?: string
  "consentRequired"?: boolean
  "defaultClientScopes"?: string[]
  "defaultRoles"?: string[]
  "description"?: string
  "directAccessGrantsEnabled"?: boolean
  "directGrantsOnly"?: boolean
  "enabled"?: boolean
  "frontchannelLogout"?: boolean
  "fullScopeAllowed"?: boolean
  "id"?: string
  "implicitFlowEnabled"?: boolean
  "name"?: string
  "nodeReRegistrationTimeout"?: number
  "notBefore"?: number
  "optionalClientScopes"?: string[]
  "origin"?: string
  "protocol"?: string
  "protocolMappers"?: ProtocolMappersItem[]
  "publicClient"?: boolean
  "redirectUris"?: string[]
  "registeredNodes"?: Record<string, unknown>
  "registrationAccessToken"?: string
  "rootUrl"?: string
  "secret"?: string
  "serviceAccountsEnabled"?: boolean
  "standardFlowEnabled"?: boolean
  "surrogateAuthRequired"?: boolean
  "useTemplateConfig"?: boolean
  "useTemplateMappers"?: boolean
  "useTemplateScope"?: boolean
  "webOrigins"?: string[]
}

export interface Composites {
  "application"?: Record<string, unknown>
  "client"?: Record<string, unknown>
  "realm"?: string[]
}

export interface DefaultRole {
  "attributes"?: Record<string, unknown>
  "clientRole"?: boolean
  "composite"?: boolean
  "composites"?: Composites
  "containerId"?: string
  "description"?: string
  "id"?: string
  "name"?: string
  "scopeParamRequired"?: boolean
}

export interface ClientConsentsItem {
  "clientId"?: string
  "createdDate"?: number
  "grantedClientScopes"?: string[]
  "grantedRealmRoles"?: string[]
  "lastUpdatedDate"?: number
}

export interface CredentialsItem {
  "algorithm"?: string
  "config"?: Record<string, unknown>
  "counter"?: number
  "createdDate"?: number
  "credentialData"?: string
  "device"?: string
  "digits"?: number
  "hashIterations"?: number
  "hashedSaltedValue"?: string
  "id"?: string
  "period"?: number
  "priority"?: number
  "salt"?: string
  "secretData"?: string
  "temporary"?: boolean
  "type"?: string
  "userLabel"?: string
  "value"?: string
}

export interface FederatedIdentitiesItem {
  "identityProvider"?: string
  "userId"?: string
  "userName"?: string
}

export interface SocialLinksItem {
  "socialProvider"?: string
  "socialUserId"?: string
  "socialUsername"?: string
}

export interface AttributesItem {
  "annotations"?: Record<string, unknown>
  "displayName"?: string
  "group"?: string
  "multivalued"?: boolean
  "name"?: string
  "readOnly"?: boolean
  "required"?: boolean
  "validators"?: Record<string, unknown>
}

export interface GroupsItem {
  "annotations"?: Record<string, unknown>
  "displayDescription"?: string
  "displayHeader"?: string
  "name"?: string
}

export interface UserProfileMetadata {
  "attributes"?: AttributesItem[]
  "groups"?: GroupsItem[]
}

export interface FederatedUsersItem {
  "access"?: Record<string, unknown>
  "applicationRoles"?: Record<string, unknown>
  "attributes"?: Record<string, unknown>
  "clientConsents"?: ClientConsentsItem[]
  "clientRoles"?: Record<string, unknown>
  "createdTimestamp"?: number
  "credentials"?: CredentialsItem[]
  "disableableCredentialTypes"?: string[]
  "email"?: string
  "emailVerified"?: boolean
  "enabled"?: boolean
  "federatedIdentities"?: FederatedIdentitiesItem[]
  "federationLink"?: string
  "firstName"?: string
  "groups"?: string[]
  "id"?: string
  "lastName"?: string
  "notBefore"?: number
  "origin"?: string
  "realmRoles"?: string[]
  "requiredActions"?: string[]
  "self"?: string
  "serviceAccountClientId"?: string
  "socialLinks"?: SocialLinksItem[]
  "totp"?: boolean
  "userProfileMetadata"?: UserProfileMetadata
  "username"?: string
}

export interface SubGroupsItem {
  "access"?: Record<string, unknown>
  "attributes"?: Record<string, unknown>
  "clientRoles"?: Record<string, unknown>
  "id"?: string
  "name"?: string
  "parentId"?: string
  "path"?: string
  "realmRoles"?: string[]
  "subGroupCount"?: number
  "subGroups"?: SubGroupsItem[]
}

export interface GroupsItem2 {
  "access"?: Record<string, unknown>
  "attributes"?: Record<string, unknown>
  "clientRoles"?: Record<string, unknown>
  "id"?: string
  "name"?: string
  "parentId"?: string
  "path"?: string
  "realmRoles"?: string[]
  "subGroupCount"?: number
  "subGroups"?: SubGroupsItem[]
}

export interface IdentityProviderMappersItem {
  "config"?: Record<string, unknown>
  "id"?: string
  "identityProviderAlias"?: string
  "identityProviderMapper"?: string
  "name"?: string
}

export interface IdentityProvidersItem {
  "addReadTokenRoleOnCreate"?: boolean
  "alias"?: string
  "authenticateByDefault"?: boolean
  "config"?: Record<string, unknown>
  "displayName"?: string
  "enabled"?: boolean
  "firstBrokerLoginFlowAlias"?: string
  "internalId"?: string
  "linkOnly"?: boolean
  "postBrokerLoginFlowAlias"?: string
  "providerId"?: string
  "storeToken"?: boolean
  "trustEmail"?: boolean
  "updateProfileFirstLoginMode"?: string
}

export interface OauthClientsItem {
  "access"?: Record<string, unknown>
  "adminUrl"?: string
  "alwaysDisplayInConsole"?: boolean
  "attributes"?: Record<string, unknown>
  "authenticationFlowBindingOverrides"?: Record<string, unknown>
  "authorizationServicesEnabled"?: boolean
  "authorizationSettings"?: AuthorizationSettings
  "baseUrl"?: string
  "bearerOnly"?: boolean
  "claims"?: Claims
  "clientAuthenticatorType"?: string
  "clientId"?: string
  "clientTemplate"?: string
  "consentRequired"?: boolean
  "defaultClientScopes"?: string[]
  "defaultRoles"?: string[]
  "description"?: string
  "directAccessGrantsEnabled"?: boolean
  "directGrantsOnly"?: boolean
  "enabled"?: boolean
  "frontchannelLogout"?: boolean
  "fullScopeAllowed"?: boolean
  "id"?: string
  "implicitFlowEnabled"?: boolean
  "name"?: string
  "nodeReRegistrationTimeout"?: number
  "notBefore"?: number
  "optionalClientScopes"?: string[]
  "origin"?: string
  "protocol"?: string
  "protocolMappers"?: ProtocolMappersItem[]
  "publicClient"?: boolean
  "redirectUris"?: string[]
  "registeredNodes"?: Record<string, unknown>
  "registrationAccessToken"?: string
  "rootUrl"?: string
  "secret"?: string
  "serviceAccountsEnabled"?: boolean
  "standardFlowEnabled"?: boolean
  "surrogateAuthRequired"?: boolean
  "useTemplateConfig"?: boolean
  "useTemplateMappers"?: boolean
  "useTemplateScope"?: boolean
  "webOrigins"?: string[]
}

export interface RequiredActionsItem {
  "alias"?: string
  "config"?: Record<string, unknown>
  "defaultAction"?: boolean
  "enabled"?: boolean
  "name"?: string
  "priority"?: number
  "providerId"?: string
}

export interface RealmItem {
  "attributes"?: Record<string, unknown>
  "clientRole"?: boolean
  "composite"?: boolean
  "composites"?: Composites
  "containerId"?: string
  "description"?: string
  "id"?: string
  "name"?: string
  "scopeParamRequired"?: boolean
}

export interface Roles {
  "application"?: Record<string, unknown>
  "client"?: Record<string, unknown>
  "realm"?: RealmItem[]
}

export interface ScopeMappingsItem {
  "client"?: string
  "clientScope"?: string
  "clientTemplate"?: string
  "roles"?: string[]
  "self"?: string
}

export interface UserFederationMappersItem {
  "config"?: Record<string, unknown>
  "federationMapperType"?: string
  "federationProviderDisplayName"?: string
  "id"?: string
  "name"?: string
}

export interface UserFederationProvidersItem {
  "changedSyncPeriod"?: number
  "config"?: Record<string, unknown>
  "displayName"?: string
  "fullSyncPeriod"?: number
  "id"?: string
  "lastSync"?: number
  "priority"?: number
  "providerName"?: string
}

export interface UsersItem {
  "access"?: Record<string, unknown>
  "applicationRoles"?: Record<string, unknown>
  "attributes"?: Record<string, unknown>
  "clientConsents"?: ClientConsentsItem[]
  "clientRoles"?: Record<string, unknown>
  "createdTimestamp"?: number
  "credentials"?: CredentialsItem[]
  "disableableCredentialTypes"?: string[]
  "email"?: string
  "emailVerified"?: boolean
  "enabled"?: boolean
  "federatedIdentities"?: FederatedIdentitiesItem[]
  "federationLink"?: string
  "firstName"?: string
  "groups"?: string[]
  "id"?: string
  "lastName"?: string
  "notBefore"?: number
  "origin"?: string
  "realmRoles"?: string[]
  "requiredActions"?: string[]
  "self"?: string
  "serviceAccountClientId"?: string
  "socialLinks"?: SocialLinksItem[]
  "totp"?: boolean
  "userProfileMetadata"?: UserProfileMetadata
  "username"?: string
}

export interface Realm {
  "accessCodeLifespan"?: number
  "accessCodeLifespanLogin"?: number
  "accessCodeLifespanUserAction"?: number
  "accessTokenLifespan"?: number
  "accessTokenLifespanForImplicitFlow"?: number
  "accountTheme"?: string
  "actionTokenGeneratedByAdminLifespan"?: number
  "actionTokenGeneratedByUserLifespan"?: number
  "adminEventsDetailsEnabled"?: boolean
  "adminEventsEnabled"?: boolean
  "adminTheme"?: string
  "applicationScopeMappings"?: Record<string, unknown>
  "applications"?: ApplicationsItem[]
  "attributes"?: Record<string, unknown>
  "authenticationFlows"?: AuthenticationFlowsItem[]
  "authenticatorConfig"?: AuthenticatorConfigItem[]
  "browserFlow"?: string
  "browserSecurityHeaders"?: Record<string, unknown>
  "bruteForceProtected"?: boolean
  "certificate"?: string
  "clientAuthenticationFlow"?: string
  "clientOfflineSessionIdleTimeout"?: number
  "clientOfflineSessionMaxLifespan"?: number
  "clientPolicies"?: Record<string, unknown>
  "clientProfiles"?: Record<string, unknown>
  "clientScopeMappings"?: Record<string, unknown>
  "clientScopes"?: ClientScopesItem[]
  "clientSessionIdleTimeout"?: number
  "clientSessionMaxLifespan"?: number
  "clientTemplates"?: ClientTemplatesItem[]
  "clients"?: ClientsItem[]
  "codeSecret"?: string
  "components"?: Record<string, unknown>
  "defaultDefaultClientScopes"?: string[]
  "defaultGroups"?: string[]
  "defaultLocale"?: string
  "defaultOptionalClientScopes"?: string[]
  "defaultRole"?: DefaultRole
  "defaultRoles"?: string[]
  "defaultSignatureAlgorithm"?: string
  "directGrantFlow"?: string
  "displayName"?: string
  "displayNameHtml"?: string
  "dockerAuthenticationFlow"?: string
  "duplicateEmailsAllowed"?: boolean
  "editUsernameAllowed"?: boolean
  "emailTheme"?: string
  "enabled"?: boolean
  "enabledEventTypes"?: string[]
  "eventsEnabled"?: boolean
  "eventsExpiration"?: number
  "eventsListeners"?: string[]
  "failureFactor"?: number
  "federatedUsers"?: FederatedUsersItem[]
  "firstBrokerLoginFlow"?: string
  "groups"?: GroupsItem2[]
  "id"?: string
  "identityProviderMappers"?: IdentityProviderMappersItem[]
  "identityProviders"?: IdentityProvidersItem[]
  "internationalizationEnabled"?: boolean
  "keycloakVersion"?: string
  "localizationTexts"?: Record<string, unknown>
  "loginTheme"?: string
  "loginWithEmailAllowed"?: boolean
  "maxDeltaTimeSeconds"?: number
  "maxFailureWaitSeconds"?: number
  "maxTemporaryLockouts"?: number
  "minimumQuickLoginWaitSeconds"?: number
  "notBefore"?: number
  "oauth2DeviceCodeLifespan"?: number
  "oauth2DevicePollingInterval"?: number
  "oauthClients"?: OauthClientsItem[]
  "offlineSessionIdleTimeout"?: number
  "offlineSessionMaxLifespan"?: number
  "offlineSessionMaxLifespanEnabled"?: boolean
  "otpPolicyAlgorithm"?: string
  "otpPolicyCodeReusable"?: boolean
  "otpPolicyDigits"?: number
  "otpPolicyInitialCounter"?: number
  "otpPolicyLookAheadWindow"?: number
  "otpPolicyPeriod"?: number
  "otpPolicyType"?: string
  "otpSupportedApplications"?: string[]
  "passwordCredentialGrantAllowed"?: boolean
  "passwordPolicy"?: string
  "permanentLockout"?: boolean
  "privateKey"?: string
  "protocolMappers"?: ProtocolMappersItem[]
  "publicKey"?: string
  "quickLoginCheckMilliSeconds"?: number
  "realm"?: string
  "realmCacheEnabled"?: boolean
  "refreshTokenMaxReuse"?: number
  "registrationAllowed"?: boolean
  "registrationEmailAsUsername"?: boolean
  "registrationFlow"?: string
  "rememberMe"?: boolean
  "requiredActions"?: RequiredActionsItem[]
  "requiredCredentials"?: string[]
  "resetCredentialsFlow"?: string
  "resetPasswordAllowed"?: boolean
  "revokeRefreshToken"?: boolean
  "roles"?: Roles
  "scopeMappings"?: ScopeMappingsItem[]
  "smtpServer"?: Record<string, unknown>
  "social"?: boolean
  "socialProviders"?: Record<string, unknown>
  "sslRequired"?: string
  "ssoSessionIdleTimeout"?: number
  "ssoSessionIdleTimeoutRememberMe"?: number
  "ssoSessionMaxLifespan"?: number
  "ssoSessionMaxLifespanRememberMe"?: number
  "supportedLocales"?: string[]
  "updateProfileOnInitialSocialLogin"?: boolean
  "userCacheEnabled"?: boolean
  "userFederationMappers"?: UserFederationMappersItem[]
  "userFederationProviders"?: UserFederationProvidersItem[]
  "userManagedAccessAllowed"?: boolean
  "users"?: UsersItem[]
  "verifyEmail"?: boolean
  "waitIncrementSeconds"?: number
  "webAuthnPolicyAcceptableAaguids"?: string[]
  "webAuthnPolicyAttestationConveyancePreference"?: string
  "webAuthnPolicyAuthenticatorAttachment"?: string
  "webAuthnPolicyAvoidSameAuthenticatorRegister"?: boolean
  "webAuthnPolicyCreateTimeout"?: number
  "webAuthnPolicyExtraOrigins"?: string[]
  "webAuthnPolicyPasswordlessAcceptableAaguids"?: string[]
  "webAuthnPolicyPasswordlessAttestationConveyancePreference"?: string
  "webAuthnPolicyPasswordlessAuthenticatorAttachment"?: string
  "webAuthnPolicyPasswordlessAvoidSameAuthenticatorRegister"?: boolean
  "webAuthnPolicyPasswordlessCreateTimeout"?: number
  "webAuthnPolicyPasswordlessExtraOrigins"?: string[]
  "webAuthnPolicyPasswordlessRequireResidentKey"?: string
  "webAuthnPolicyPasswordlessRpEntityName"?: string
  "webAuthnPolicyPasswordlessRpId"?: string
  "webAuthnPolicyPasswordlessSignatureAlgorithms"?: string[]
  "webAuthnPolicyPasswordlessUserVerificationRequirement"?: string
  "webAuthnPolicyRequireResidentKey"?: string
  "webAuthnPolicyRpEntityName"?: string
  "webAuthnPolicyRpId"?: string
  "webAuthnPolicySignatureAlgorithms"?: string[]
  "webAuthnPolicyUserVerificationRequirement"?: string
}

export interface KeycloakRealmImportSpec {
  /** The name of the Keycloak CR to reference, in the same namespace. */
  "keycloakCRName": string
  /** The RealmRepresentation to import into Keycloak. */
  "realm": Realm
  /** Compute Resources required by Keycloak container. If not specified, the value is inherited from the Keycloak CR. */
  "resources"?: Resources
}

export interface KeycloakRealmImportStatus {
  "conditions"?: ConditionsItem[]
}
