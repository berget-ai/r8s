import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { EuroOffice } from '../src/index'

// EuroOffice (DocumentServer) recipe tests, facit-aligned against
// berget-internal/apps/onlyoffice:
//   1. DocumentServer model (image/port/probes/lifecycle/resources)
//   2. Single-replica + Recreate + data PVC (secure-link secret / WOPI keys)
//   3. JWT secret via secrets backend (refresh + rotation restart) or reference
//   4. CNPG database: instances/storage/parameters, DB_* env (no DATABASE_URL)
//   5. Version pinning policy and error cases
//   6. Brand fonts init container (default/on/off), Endpoint annotations

const openbao = { backend: 'openbao', mount: 'secret', path: 'onlyoffice' }

function renderApp(props: Record<string, unknown> = {}) {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao,
      children: jsx(EuroOffice, { host: 'docs.example.com', ...props } as never),
    })
  )
}

const resource = (result: ReturnType<typeof render>, kind: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind) as any

describe('EuroOffice DocumentServer', () => {
  it('renders the pinned documentserver image on port 80 with facit probes', () => {
    const d = resource(renderApp(), 'Deployment')
    const c = d.spec.template.spec.containers[0]
    expect(c.image).toBe('ghcr.io/euro-office/documentserver:v9.3.2')
    expect(c.imagePullPolicy).toBe('IfNotPresent')
    expect(c.ports[0].containerPort).toBe(80)
    expect(d.spec.template.spec.startupProbe ?? c.startupProbe).toBeDefined()
    expect(c.startupProbe.httpGet.path).toBe('/healthcheck')
    expect(c.startupProbe.failureThreshold).toBe(60)
    expect(c.startupProbe.periodSeconds).toBe(10)
    expect(c.readinessProbe.httpGet.path).toBe('/healthcheck')
    expect(c.readinessProbe.periodSeconds).toBe(15)
    expect(c.livenessProbe.httpGet.path).toBe('/healthcheck')
    expect(c.livenessProbe.periodSeconds).toBe(30)
    expect(c.resources.requests).toEqual({ memory: '1Gi', cpu: '500m' })
    expect(c.resources.limits).toEqual({ memory: '4Gi', cpu: '2' })
  })

  it('is single-replica Recreate with the data PVC mounted at the WOPI path', () => {
    const result = renderApp()
    const d = resource(result, 'Deployment')
    expect(d.spec.replicas).toBe(1)
    expect(d.spec.strategy.type).toBe('Recreate')

    const pvc = resource(result, 'PersistentVolumeClaim')
    expect(pvc.metadata.name).toBe('onlyoffice-data')
    expect(pvc.spec.resources.requests.storage).toBe('5Gi')

    const c = d.spec.template.spec.containers[0]
    const dataMount = c.volumeMounts.find((m: { name: string }) => m.name === 'data')
    expect(dataMount.mountPath).toBe('/var/www/euro-office/Data')
    expect(dataMount.subPath).toBe('data')
    const dataVol = d.spec.template.spec.volumes.find((v: { name: string }) => v.name === 'data')
    expect(dataVol.persistentVolumeClaim.claimName).toBe('onlyoffice-data')

    // PVC size + storage class overridable; dataStorage: false drops the volume
    const custom = resource(
      renderApp({ dataStorage: { size: '10Gi', storageClass: 'harvester' } }),
      'PersistentVolumeClaim'
    )
    expect(custom.spec.resources.requests.storage).toBe('10Gi')
    expect(custom.spec.storageClassName).toBe('harvester')
    expect(
      renderApp({ dataStorage: false }).resources.find((r) => r.kind === 'PersistentVolumeClaim')
    ).toBeUndefined()
  })

  it('rejects replicas != 1 (embedded Redis/RabbitMQ + RWO volume)', () => {
    expect(() => renderApp({ replicas: 2 })).toThrow('replicas=1')
  })

  it('rejects the unpinned latest tag with an actionable error', () => {
    expect(() => renderApp({ version: 'latest' })).toThrow('pinned version')
  })

  it('sets DB_* env against the CNPG cluster FQDN (no DATABASE_URL autowiring)', () => {
    const d = resource(renderApp(), 'Deployment')
    const env = Object.fromEntries(
      d.spec.template.spec.containers[0].env.map((e: { name: string; value?: string }) => [
        e.name,
        e.value,
      ])
    )
    expect(env.DB_TYPE).toBe('postgres')
    expect(env.DB_HOST).toBe('eurooffice-db-rw.default.svc.cluster.local')
    expect(env.DB_PORT).toBe('5432')
    expect(env.DB_NAME).toBe('eurooffice-db')
    expect(env.DB_USER).toBe('eurooffice-db')
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.JWT_ENABLED).toBe('true')
    expect(env.JWT_HEADER).toBe('Authorization')
    expect(env.EXAMPLE_ENABLED).toBeUndefined()

    const withExample = Object.fromEntries(
      resource(
        renderApp({ exampleEnabled: true }),
        'Deployment'
      ).spec.template.spec.containers[0].env.map((e: { name: string; value?: string }) => [
        e.name,
        e.value,
      ])
    )
    expect(withExample.EXAMPLE_ENABLED).toBe('true')
  })

  it('DB_PWD references the CNPG credentials secret; JWT_SECRET the provisioned secret', () => {
    const d = resource(renderApp(), 'Deployment')
    const byName = Object.fromEntries(
      d.spec.template.spec.containers[0].env.map(
        (e: { name: string; valueFrom?: { secretKeyRef?: { name: string; key: string } } }) => [
          e.name,
          e.valueFrom?.secretKeyRef,
        ]
      )
    )
    expect(byName.DB_PWD).toEqual({ name: 'eurooffice-db-db-credentials', key: 'password' })
    expect(byName.JWT_SECRET).toEqual({ name: 'onlyoffice-jwt-secret', key: 'JWT_SECRET' })
  })

  it('provisions the JWT secret via StaticSecret with 1h refresh + rotation restart', () => {
    const vso = resource(renderApp(), 'OpenBaoStaticSecret')
    expect(vso.metadata.name).toBe('onlyoffice-jwt')
    expect(vso.spec.mount).toBe('secret')
    expect(vso.spec.type).toBe('kv-v2')
    expect(vso.spec.path).toBe('onlyoffice/onlyoffice/jwt')
    expect(vso.spec.refreshAfter).toBe('1h')
    expect(vso.spec.rolloutRestartTargets).toEqual([{ kind: 'Deployment', name: 'onlyoffice' }])
    expect(vso.spec.destination.name).toBe('onlyoffice-jwt-secret')
    expect(vso.spec.destination.transformation.templates.JWT_SECRET.text).toBe(
      '{{ .Secrets.JWT_SECRET }}'
    )
  })

  it('jwtSecretName references a pre-created secret instead of provisioning', () => {
    const result = renderApp({ jwtSecretName: 'existing-jwt' })
    expect(
      result.resources.find(
        (r) => r.kind === 'OpenBaoStaticSecret' && r.metadata.name === 'onlyoffice-jwt'
      )
    ).toBeUndefined()
    const d = resource(result, 'Deployment')
    const jwt = d.spec.template.spec.containers[0].env.find(
      (e: { name: string }) => e.name === 'JWT_SECRET'
    )
    expect(jwt.valueFrom.secretKeyRef.name).toBe('existing-jwt')
  })

  it('throws an actionable error without a backend and without jwtSecretName', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(EuroOffice, { host: 'docs.example.com' } as never),
        })
      )
    ).toThrow(/EuroOffice "onlyoffice" requires/)
  })

  it('renders the CNPG cluster: 2 instances, 20Gi, facit parameters + PodMonitor', () => {
    const cluster = resource(renderApp(), 'Cluster')
    expect(cluster.metadata.name).toBe('eurooffice-db')
    expect(cluster.spec.instances).toBe(2)
    expect(cluster.spec.storage.size).toBe('20Gi')
    expect(cluster.spec.postgresql.parameters).toMatchObject({
      shared_buffers: '256MB',
      max_connections: '200',
    })
    expect(cluster.spec.monitoring.enablePodMonitor).toBe(true)

    const scaled = resource(
      renderApp({ dbInstances: 3, dbStorage: '50Gi', dbStorageClass: 'harvester' }),
      'Cluster'
    )
    expect(scaled.spec.instances).toBe(3)
    expect(scaled.spec.storage.size).toBe('50Gi')
    expect(scaled.spec.storage.storageClass).toBe('harvester')
  })

  it('passes backup through to the Database recipe (WAL + scheduled)', () => {
    const cluster = resource(
      renderApp({
        backup: {
          destinationPath: 's3://backups/eurooffice-cnpg',
          endpointURL: 'https://s3.nl-ams.scw.cloud',
          credentialsSecret: 'scaleway-s3-secret',
          schedule: '0 0 3 * * *',
        },
      }),
      'Cluster'
    )
    expect(cluster.spec.backup.barmanObjectStore.destinationPath).toBe(
      's3://backups/eurooffice-cnpg'
    )
  })

  it('adds the preStop shutdown hook (save documents before shutdown)', () => {
    const c = resource(renderApp(), 'Deployment').spec.template.spec.containers[0]
    expect(c.lifecycle.preStop.exec.command.join(' ')).toContain(
      'documentserver-prepare4shutdown.sh'
    )
  })

  it('downloads the Berget brand fonts by default into core-fonts/berget', () => {
    const d = resource(renderApp(), 'Deployment')
    const init = d.spec.template.spec.initContainers.find(
      (c: { name: string }) => c.name === 'custom-fonts'
    )
    expect(init.image).toBe('curlimages/curl:8.12.0')
    expect(init.args[0]).toContain('DMSans-Regular.ttf')
    expect(init.args[0]).toContain('Ovo-Regular.ttf')
    const c = d.spec.template.spec.containers[0]
    const fontMount = c.volumeMounts.find((m: { name: string }) => m.name === 'custom-fonts')
    expect(fontMount.mountPath).toBe('/var/www/euro-office/documentserver/core-fonts/berget')

    // customFonts: false removes init + mounts entirely
    const dOff = resource(renderApp({ customFonts: false }), 'Deployment')
    expect(dOff.spec.template.spec.initContainers ?? []).toHaveLength(0)
  })

  it('renders the Endpoint with facit proxy annotations', () => {
    const ann = resource(renderApp(), 'Ingress').metadata.annotations
    expect(ann['nginx.ingress.kubernetes.io/proxy-body-size']).toBe('100m')
    expect(ann['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe('600')
    expect(ann['nginx.ingress.kubernetes.io/proxy-send-timeout']).toBe('600')
    expect(ann['cert-manager.io/cluster-issuer']).toBe('letsencrypt-prod')
  })

  it('user endpointAnnotations merge over the defaults', () => {
    const ann = resource(
      renderApp({
        endpointAnnotations: { 'nginx.ingress.kubernetes.io/proxy-body-size': '250m' },
      }),
      'Ingress'
    ).metadata.annotations
    expect(ann['nginx.ingress.kubernetes.io/proxy-body-size']).toBe('250m')
    expect(ann['nginx.ingress.kubernetes.io/proxy-read-timeout']).toBe('600')
  })

  it('produces valid, plaintext-free manifests', () => {
    const result = renderApp()
    for (const r of result.resources) {
      expect(validateResource(r)).toEqual([])
    }
    expect(runGuardrails(result.resources as never, [noPlaintextSecrets]).passed).toBe(true)
  })
})
