import { Database, WebService, Endpoint } from '@r8s/recipes'

/**
 * Shared multi-env building blocks.
 *
 * The environment overlays only vary sizing and hostnames — credentials
 * are never part of the overlay files. If an environment needs managed
 * secrets, wrap its tree in a Platform with a secrets backend.
 */
export function AppDatabase(props: { name: string; namespace: string; storage: string }) {
  return <Database name={props.name} namespace={props.namespace} storage={props.storage} />
}

export function WebApp(props: {
  name: string
  namespace: string
  image: string
  replicas: number
  dbHost: string
  ingressHost: string
  tlsSecretName?: string
  enableHPA?: boolean
}) {
  return (
    <>
      <WebService
        name={props.name}
        namespace={props.namespace}
        image={props.image}
        port={3000}
        replicas={props.replicas}
        env={{ NODE_ENV: props.namespace === 'production' ? 'production' : 'development' }}
        resources={{
          requests: { memory: '256Mi', cpu: '250m' },
          limits: { memory: '512Mi', cpu: '500m' },
        }}
      />

      <Endpoint
        name={`${props.name}-ingress`}
        namespace={props.namespace}
        host={props.ingressHost}
        serviceName={props.name}
        servicePort={80}
        tls={
          props.tlsSecretName
            ? { secretName: props.tlsSecretName, clusterIssuer: 'letsencrypt-prod' }
            : undefined
        }
      />
    </>
  )
}
