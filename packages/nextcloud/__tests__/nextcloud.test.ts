import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import { S3Provider, Bucket } from '@r8s/recipes'
import type { r8sElement } from '@r8s/core'

// Nextcloud recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation, cron
//   3. Persistence: /var/www/html claim shared by app + cron
//   4. Security: no plaintext credentials in rendered output
//   5. objectStorage resolution: explicit wins → <Bucket/> descriptor →
//      derived from the S3Provider → actionable throw without either
import { Nextcloud } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

const s3Config = {
  endpoint: 'https://rustfs:9000',
  bucket: 'infra',
  credentialsSecret: 'infra-s3-creds',
}

/** Render Nextcloud under an S3Provider (storage + backups both derive). */
function renderNextcloudUnderS3Provider(
  props: Record<string, unknown>,
  provider: Record<string, unknown> = s3Config
): ReturnType<typeof render> {
  return render(
    jsx(S3Provider as never, {
      provider,
      children: jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(Nextcloud, props as never),
      }),
    })
  )
}

/** Render Nextcloud inside a Platform-like secrets backend (OpenBao). */
function renderNextcloud(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao as never,
      children: jsx(Nextcloud, { backup: false, objectStorage, ...(props ?? {}) } as never),
    })
  )
}

/** Wrap Nextcloud in an OperatorContext (no secrets backend). */
function elementWithContext(ops: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: ops,
    children: jsx(Nextcloud, { backup: false, objectStorage, ...(props ?? {}) } as never),
  })
}

const objectStorage = {
  endpoint: 's3.internal.example.com',
  bucket: 'cloud-files',
  credentialsSecret: 'cloud-files-credentials',
}

function findAppDeployment(result: ReturnType<typeof render>, name = 'nextcloud'): any {
  return result.resources.find(
    (r: any) => r.kind === 'Deployment' && r.metadata.name === name
  ) as any
}

function findCron(result: ReturnType<typeof render>, name = 'nextcloud-cron'): any {
  return result.resources.find((r: any) => r.kind === 'CronJob' && r.metadata.name === name) as any
}

describe('operator declarations', () => {
  it('declares the redis operator when cache is enabled', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(true)
  })

  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('skips the redis operator when cache is disabled', () => {
    const result = renderNextcloud({ host: 'cloud.example.com', cache: false })
    expect(result.operators.some((op) => op.name === 'redis-operator')).toBe(false)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      elementWithContext([operators['redis-operator'](), operators['cnpg']()], {
        host: 'cloud.example.com',
        secretsName: 'existing-secrets',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'redis-operator')).toHaveLength(1)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })
})

describe('rendering defaults', () => {
  it('renders app deployment, service, ingress, database cluster, cron job, redis and html claim', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('CronJob')
    expect(kinds).toContain('RedisReplication')
    expect(kinds).toContain('PersistentVolumeClaim')
  })

  it('renders the app on nextcloud:31-apache, port 80, as a raw deployment', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const app = findAppDeployment(result)
    expect(app).toBeDefined()
    const container = app.spec.template.spec.containers[0]
    expect(container.image).toBe('nextcloud:31-apache')
    expect(container.ports[0].containerPort).toBe(80)
    expect(container.name).toBe('app')
  })

  it('probes /status.php on port 80 for liveness and readiness', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const container = findAppDeployment(result).spec.template.spec.containers[0]
    expect(container.livenessProbe.httpGet).toEqual({ path: '/status.php', port: 80 })
    expect(container.livenessProbe.initialDelaySeconds).toBe(30)
    expect(container.readinessProbe.httpGet).toEqual({ path: '/status.php', port: 80 })
    expect(container.readinessProbe.initialDelaySeconds).toBe(20)
    expect(container.readinessProbe.failureThreshold).toBe(5)
  })

  it('runs cron.php every 5 minutes with the same image, no busybox', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const cron = findCron(result)
    expect(cron).toBeDefined()
    expect(cron.apiVersion).toBe('batch/v1')
    expect(cron.spec.schedule).toBe('*/5 * * * *')
    const container = cron.spec.jobTemplate.spec.template.spec.containers[0]
    expect(container.image).toBe('nextcloud:31-apache')
    expect(container.command).toEqual(['php', '-f', '/var/www/html/cron.php'])
    expect(container.env.find((e: any) => e.name === 'POSTGRES_HOST').value).toBe('nextcloud-rw')
    expect(container.env.find((e: any) => e.name === 'POSTGRES_USER').value).toBe('nextcloud')
  })

  it('renders a ReadWriteMany html claim with the default 10Gi size', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const pvc = result.resources.find(
      (r: any) => r.kind === 'PersistentVolumeClaim' && r.metadata.name === 'nextcloud-html'
    ) as any
    expect(pvc).toBeDefined()
    expect(pvc.spec.accessModes).toEqual(['ReadWriteMany'])
    expect(pvc.spec.resources.requests.storage).toBe('10Gi')
    expect(pvc.spec.storageClassName).toBeUndefined()
  })

  it('honours storage and storageClassName props on the html claim', () => {
    const result = renderNextcloud({
      host: 'cloud.example.com',
      storage: '25Gi',
      storageClassName: 'nfs-client',
    })
    const pvc = result.resources.find(
      (r: any) => r.kind === 'PersistentVolumeClaim' && r.metadata.name === 'nextcloud-html'
    ) as any
    expect(pvc.spec.resources.requests.storage).toBe('25Gi')
    expect(pvc.spec.storageClassName).toBe('nfs-client')
  })

  it('mounts the html claim in both the app deployment and the cron job', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const appContainer = findAppDeployment(result).spec.template.spec.containers[0]
    expect(appContainer.volumeMounts).toEqual([{ name: 'html', mountPath: '/var/www/html' }])
    expect(findAppDeployment(result).spec.template.spec.volumes).toEqual([
      { name: 'html', persistentVolumeClaim: { claimName: 'nextcloud-html' } },
    ])
    const cronPodSpec = findCron(result).spec.jobTemplate.spec.template.spec
    expect(cronPodSpec.containers[0].volumeMounts).toEqual([
      { name: 'html', mountPath: '/var/www/html' },
    ])
    expect(cronPodSpec.volumes).toEqual([
      { name: 'html', persistentVolumeClaim: { claimName: 'nextcloud-html' } },
    ])
  })

  it('forbids cron concurrency and never restarts jobs past the backoff limit', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const cron = findCron(result)
    expect(cron.spec.concurrencyPolicy).toBe('Forbid')
    const jobSpec = cron.spec.jobTemplate.spec
    expect(jobSpec.backoffLimit).toBe(2)
    expect(jobSpec.template.spec.restartPolicy).toBe('OnFailure')
  })

  it('renders a ClusterIP service that fronts the app on port 80', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const service = result.resources.find(
      (r: any) => r.kind === 'Service' && r.metadata.name === 'nextcloud'
    ) as any
    expect(service).toBeDefined()
    expect(service.spec.type).toBe('ClusterIP')
    expect(service.spec.ports[0].port).toBe(80)
  })

  it('skips redis resources when cache is disabled', () => {
    const result = renderNextcloud({ host: 'cloud.example.com', cache: false })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('RedisReplication')
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Nextcloud, {
            backup: false,
            host: 'cloud.example.com',
            objectStorage,
          }),
        }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('HTTPRoute')
  })

  it('renders a valid Ingress when platform uses ingress routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'ingress' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Nextcloud, {
            backup: false,
            host: 'cloud.example.com',
            objectStorage,
          }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('cloud.example.com')
  })

  it('passes resource validation', () => {
    const result = renderNextcloud({
      host: 'cloud.example.com',
      objectStorage,
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderNextcloud({
      name: 'cloud',
      namespace: 'collab',
      version: '31.0.5-apache',
      host: 'cloud.example.com',
      replicas: 3,
      storage: '50Gi',
      storageClassName: 'nfs-client',
      objectStorage: {
        ...objectStorage,
        bucket: 'shared',
        region: 'eu-north-1',
        port: 9000,
        ssl: false,
      },
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'cloud-tls', clusterIssuer: 'letsencrypt-prod' },
    })

    const app = findAppDeployment(result, 'cloud')
    expect(app).toBeDefined()
    expect(app.spec.replicas).toBe(3)
    expect(app.spec.template.spec.containers[0].image).toContain('31.0.5-apache')
    expect(app.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')

    const env = app.spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_BUCKET').value).toBe('shared')
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_REGION').value).toBe('eu-north-1')
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_PORT').value).toBe('9000')
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_SSL').value).toBe('false')
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_HOST').value).toBe(
      's3.internal.example.com'
    )
    expect(env.find((e: any) => e.name === 'NEXTCLOUD_TRUSTED_DOMAINS').value).toBe(
      'cloud.example.com'
    )

    const pvc = result.resources.find(
      (r: any) => r.kind === 'PersistentVolumeClaim' && r.metadata.name === 'cloud-html'
    ) as any
    expect(pvc.spec.resources.requests.storage).toBe('50Gi')
    expect(pvc.spec.storageClassName).toBe('nfs-client')
  })

  it('defaults OBJECTSTORE_S3_SSL to true and omits the port when unset', () => {
    const result = renderNextcloud({ host: 'cloud.example.com', objectStorage })
    const env = findAppDeployment(result).spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_SSL').value).toBe('true')
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_PORT')).toBeUndefined()
  })

  it('wires the app and cron to redis and database by naming convention', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const env = findAppDeployment(result).spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'REDIS_HOST').value).toBe('nextcloud-redis')
    expect(env.find((e: any) => e.name === 'REDIS_HOST_PORT').value).toBe('6379')
    expect(env.find((e: any) => e.name === 'POSTGRES_HOST').value).toBe('nextcloud-rw')
    const cronEnv = findCron(result).spec.jobTemplate.spec.template.spec.containers[0].env
    expect(cronEnv.find((e: any) => e.name === 'REDIS_HOST').value).toBe('nextcloud-redis')
  })

  it('emits the redis replication component with 3 nodes', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const redis = result.resources.find(
      (r: any) => r.kind === 'RedisReplication' && r.metadata.name === 'nextcloud-redis'
    ) as any
    expect(redis).toBeDefined()
    expect(redis.spec.clusterSize).toBe(3)
    expect(redis.spec.kubernetesConfig.image).toBe('redis:7.2-alpine')
  })

  it('keeps only POSTGRES_* database wiring (no DATABASE_URL)', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const env = findAppDeployment(result).spec.template.spec.containers[0].env
    expect(env.find((e: any) => e.name === 'DATABASE_URL')).toBeUndefined()
    expect(env.find((e: any) => e.name === 'POSTGRES_HOST').value).toBe('nextcloud-rw')
    expect(env.find((e: any) => e.name === 'POSTGRES_PORT').value).toBe('5432')
    expect(env.find((e: any) => e.name === 'POSTGRES_DB').value).toBe('nextcloud')
    expect(env.find((e: any) => e.name === 'POSTGRES_USER').value).toBe('nextcloud')
    expect(env.find((e: any) => e.name === 'POSTGRES_PASSWORD').value).toBe('$(PGPASSWORD)')
  })
})

describe('secrets handling', () => {
  it('provisions app secrets through a secrets backend', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
    const appSecret = result.resources.find(
      (r: any) =>
        r.kind === 'OpenBaoStaticSecret' && r.spec.destination.name === 'nextcloud-app-secrets'
    ) as any
    expect(appSecret).toBeDefined()
    expect(appSecret.spec.path).toBe('test/nextcloud/secrets')
  })

  it('provisions app secrets through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(Nextcloud, {
          backup: false,
          host: 'cloud.example.com',
          objectStorage,
        }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
  })

  it('throws when no secrets backend and no secretsName', () => {
    expect(() => render(jsx(Nextcloud, { backup: false, host: 'cloud.example.com' }))).toThrow(
      /application secrets/
    )
  })

  it('accepts an existing secretsName without a backend', () => {
    expect(() =>
      render(
        jsx(Nextcloud, {
          backup: false,
          host: 'cloud.example.com',
          secretsName: 'existing-secrets',
          objectStorage,
        })
      )
    ).not.toThrow()
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = renderNextcloud({ host: 'cloud.example.com', secretsName: 'existing-secrets' })
    const env = findAppDeployment(result).spec.template.spec.containers[0].env
    const adminPassword = env.find((e: any) => e.name === 'NEXTCLOUD_ADMIN_PASSWORD')
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(adminPassword.valueFrom.secretKeyRef.name).toBe('existing-secrets')
    expect(adminPassword.valueFrom.secretKeyRef.key).toBe('adminPassword')
    expect(pgPassword.valueFrom.secretKeyRef.name).toBe('nextcloud-db-credentials')
    expect(adminPassword.value).toBeUndefined()
    expect(pgPassword.value).toBeUndefined()
  })

  it('wires object storage credentials to the referenced bucket secret', () => {
    const result = renderNextcloud({ host: 'cloud.example.com', objectStorage })
    const env = findAppDeployment(result).spec.template.spec.containers[0].env
    const accessKey = env.find((e: any) => e.name === 'AWS_ACCESS_KEY_ID')
    const secretAccessKey = env.find((e: any) => e.name === 'AWS_SECRET_ACCESS_KEY')
    expect(accessKey.valueFrom.secretKeyRef).toEqual({
      name: 'cloud-files-credentials',
      key: 'accessKey',
    })
    expect(secretAccessKey.valueFrom.secretKeyRef).toEqual({
      name: 'cloud-files-credentials',
      key: 'secretKey',
    })
    expect(accessKey.value).toBeUndefined()
    expect(secretAccessKey.value).toBeUndefined()
    // Nextcloud-native envs are $(...) references to the secret-backed vars
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_KEY').value).toBe('$(AWS_ACCESS_KEY_ID)')
    expect(env.find((e: any) => e.name === 'OBJECTSTORE_S3_SECRET').value).toBe(
      '$(AWS_SECRET_ACCESS_KEY)'
    )
  })

  it('cron job reads the database password via secretKeyRef', () => {
    const result = renderNextcloud({ host: 'cloud.example.com' })
    const env = findCron(result).spec.jobTemplate.spec.template.spec.containers[0].env
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(pgPassword.valueFrom.secretKeyRef.name).toBe('nextcloud-db-credentials')
    expect(pgPassword.valueFrom.secretKeyRef.key).toBe('password')
    expect(pgPassword.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderNextcloud({
      host: 'cloud.example.com',
      objectStorage,
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('namespace scope', () => {
  it('inherits a surrounding Namespace via useNamespace()', () => {
    const result = render(
      jsx(Namespace.Provider, {
        value: 'team-a',
        children: jsx(SecretContext.Provider, {
          value: openbao,
          children: jsx(Nextcloud, {
            host: 'app.example.com',
            backup: false,
            objectStorage,
          } as never),
        }),
      })
    )
    const dep = result.resources.find((r: any) => r.kind === 'Deployment') as any
    expect(dep?.metadata?.namespace).toBe('team-a')
  })
})

describe('no secrets backend — CNPG-generated credentials contract', () => {
  it('references the CNPG-generated <name>-app secret without a secrets backend', () => {
    const result = render(
      jsx(Nextcloud, {
        backup: false,
        host: 'cloud.example.com',
        secretsName: 'existing-secrets',
        objectStorage,
      } as never)
    )
    const env = findAppDeployment(result).spec.template.spec.containers[0].env
    const pgPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(pgPassword.valueFrom.secretKeyRef).toEqual({ name: 'nextcloud-app', key: 'password' })

    // CronJob references the same resolved secret
    const cronEnv = findCron(result).spec.jobTemplate.spec.template.spec.containers[0].env
    expect(cronEnv.find((e: any) => e.name === 'PGPASSWORD').valueFrom.secretKeyRef).toEqual({
      name: 'nextcloud-app',
      key: 'password',
    })

    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster).toBeDefined()
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
  })
})

describe('objectStorage — derives from the S3Provider', () => {
  const s3Env = (result: ReturnType<typeof render>) =>
    findAppDeployment(result).spec.template.spec.containers[0].env as any[]
  const envOf = (env: any[], name: string) => env.find((e: any) => e.name === name)

  it('omitted under an S3Provider: scheme-less host + SSL derive from the provider URL', () => {
    const result = renderNextcloudUnderS3Provider({ host: 'cloud.example.com' })
    const env = s3Env(result)
    expect(envOf(env, 'OBJECTSTORE_S3_HOST').value).toBe('rustfs:9000')
    expect(envOf(env, 'OBJECTSTORE_S3_BUCKET').value).toBe(s3Config.bucket)
    expect(envOf(env, 'OBJECTSTORE_S3_SSL').value).toBe('true')
    expect(envOf(env, 'OBJECTSTORE_S3_PORT')).toBeUndefined()
    const accessKey = envOf(env, 'AWS_ACCESS_KEY_ID')
    expect(accessKey.value).toBeUndefined()
    expect(accessKey.valueFrom.secretKeyRef).toEqual({
      name: s3Config.credentialsSecret,
      key: 'accessKey',
    })
  })

  it('omitted under an S3Provider: a plain-http provider URL flips the SSL default', () => {
    const result = renderNextcloudUnderS3Provider(
      { host: 'cloud.example.com' },
      { ...s3Config, endpoint: 'http://rustfs-insecure:9000' }
    )
    expect(envOf(s3Env(result), 'OBJECTSTORE_S3_HOST').value).toBe('rustfs-insecure:9000')
    expect(envOf(s3Env(result), 'OBJECTSTORE_S3_SSL').value).toBe('false')
  })

  it('omitted under an S3Provider: the provider region is carried through (no us-east-1 fallback)', () => {
    const result = renderNextcloudUnderS3Provider(
      { host: 'cloud.example.com' },
      { ...s3Config, region: 'eu-north-1' }
    )
    expect(envOf(s3Env(result), 'OBJECTSTORE_S3_REGION').value).toBe('eu-north-1')
  })

  it('omitted under an S3Provider: backups default on and derive too', () => {
    const result = renderNextcloudUnderS3Provider({ host: 'cloud.example.com' })
    const cluster = result.resources.find((r: any) => r.kind === 'Cluster') as any
    expect(cluster.spec.backup.barmanObjectStore.endpointURL).toBe(s3Config.endpoint)
    expect(result.resources.filter((r) => r.kind === 'ScheduledBackup')).toHaveLength(1)
  })

  it('explicit object wins over the provider and keeps its documented shape', () => {
    const result = renderNextcloudUnderS3Provider({
      host: 'cloud.example.com',
      objectStorage: { ...objectStorage, port: 9000, ssl: false },
    })
    const env = s3Env(result)
    expect(envOf(env, 'OBJECTSTORE_S3_HOST').value).toBe('s3.internal.example.com')
    expect(envOf(env, 'OBJECTSTORE_S3_PORT').value).toBe('9000')
    expect(envOf(env, 'OBJECTSTORE_S3_SSL').value).toBe('false')
    expect(envOf(env, 'AWS_ACCESS_KEY_ID').valueFrom.secretKeyRef.name).toBe(
      objectStorage.credentialsSecret
    )
  })

  it('<Bucket/> descriptor: provider config is used and normalized (name is the scope)', () => {
    const result = renderNextcloudUnderS3Provider({
      host: 'cloud.example.com',
      objectStorage: jsx(Bucket as never, { name: 'cloud' } as never),
    })
    const env = s3Env(result)
    expect(envOf(env, 'OBJECTSTORE_S3_HOST').value).toBe('rustfs:9000')
    expect(envOf(env, 'OBJECTSTORE_S3_BUCKET').value).toBe(s3Config.bucket)
  })

  it('<Bucket/> descriptor: the bucket override selects a different bucket', () => {
    const result = renderNextcloudUnderS3Provider({
      host: 'cloud.example.com',
      objectStorage: jsx(Bucket as never, { name: 'cloud', bucket: 'files' } as never),
    })
    expect(envOf(s3Env(result), 'OBJECTSTORE_S3_BUCKET').value).toBe('files')
  })

  it('omitted without a provider throws the actionable guidance (what/why/how)', () => {
    // secretsName satisfies the instance-secrets decision so the storage
    // guidance is what surfaces
    expect(() =>
      render(
        jsx(Nextcloud, {
          backup: false,
          host: 'cloud.example.com',
          secretsName: 'existing-secrets',
        })
      )
    ).toThrow(
      /Nextcloud "nextcloud" needs object storage[\s\S]*no <S3Provider> in scope[\s\S]*no objectStorage prop[\s\S]*Fix:[\s\S]*<S3Provider[\s\S]*or pass a <Bucket> descriptor[\s\S]*objectStorage=\{<Bucket name="…"/
    )
  })
})
