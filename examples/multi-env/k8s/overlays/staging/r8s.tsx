import { Fragment } from '@r8s/core'
import { AppDatabase, WebApp } from '../../components/shared'

export default function Staging() {
  return (
    <>
      <AppDatabase name="app-db" namespace="staging" storage="5Gi" />

      <WebApp
        name="app"
        namespace="staging"
        image="myapp/app:staging"
        replicas={1}
        dbHost="app-db"
        ingressHost="staging.myapp.example.com"
      />
    </>
  )
}
