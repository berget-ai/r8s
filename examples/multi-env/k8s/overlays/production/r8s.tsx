import { Fragment } from '@r8s/core'
import { AppDatabase, WebApp } from '../../components/shared'

export default function Production() {
  return (
    <>
      {/* For real production deployments, wrap in a Platform with a
          secrets backend so credentials are provisioned by the backend:
          <Platform secrets={{ backend: 'openbao', mount: 'kv', path: 'production' }}> */}
      <AppDatabase name="app-db" namespace="production" storage="50Gi" />

      <WebApp
        name="app"
        namespace="production"
        image="myapp/app:v1.2.3"
        replicas={5}
        dbHost="app-db"
        ingressHost="myapp.example.com"
        tlsSecretName="myapp-tls"
        enableHPA={true}
      />
    </>
  )
}
