import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// Odoo recipe tests:
//   1. Operator declarations (deduped via OperatorContext)
//   2. Rendering: defaults, all props, gateway/ingress adaptation, odoo.conf
//   3. Security: no plaintext credentials in rendered output
//   4. Validation: replica constraint and missing secrets throw
import { Odoo } from '../src/index'

/** Render Odoo inside a Platform-like secrets backend (OpenBao). */
function renderOdoo(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: { backend: 'openbao', mount: 'kv', path: 'test' },
      children: jsx(Odoo, props as never),
    })
  )
}

/** Render Odoo wrapped only in an OperatorContext (no secrets backend). */
function renderOdooWithContext(operators_: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(Odoo, props as never),
  })
}

function findDeployment(result: ReturnType<typeof render>, name = 'odoo'): any {
  return result.resources.find(
    (r: any) => r.kind === 'Deployment' && r.metadata.name === name
  ) as any
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderOdooWithContext([operators['cnpg']()], {
        host: 'erp.example.com',
        masterPasswordSecretName: 'existing-master',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      renderOdooWithContext([operators['cnpg']('1.25.0')], {
        host: 'erp.example.com',
        masterPasswordSecretName: 'existing-master',
      })
    )
    const cnpg = result.operators.filter((op) => op.name === 'cnpg')
    expect(cnpg).toHaveLength(1)
    expect(cnpg[0].version).toBe('1.25.0')
  })
})

describe('rendering defaults', () => {
  it('renders deployment, odoo.conf configmap, filestore PVC, service, database and endpoint', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('ConfigMap')
    expect(kinds).toContain('PersistentVolumeClaim')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
  })

  it('renders a ReadWriteOnce filestore PVC with the default 20Gi size', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const pvc = result.resources.find((r: any) => r.kind === 'PersistentVolumeClaim') as any
    expect(pvc.metadata.name).toBe('odoo-filestore')
    expect(pvc.spec.accessModes).toEqual(['ReadWriteOnce'])
    expect(pvc.spec.resources.requests.storage).toBe('20Gi')
  })

  it('mounts the filestore at /var/lib/odoo and probes /web/health on 8069', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const deployment = findDeployment(result)
    const container = deployment.spec.template.spec.containers[0]
    expect(container.livenessProbe.httpGet).toEqual({ path: '/web/health', port: 8069 })
    expect(container.livenessProbe.initialDelaySeconds).toBe(60)
    expect(container.readinessProbe.httpGet).toEqual({ path: '/web/health', port: 8069 })
    expect(container.readinessProbe.initialDelaySeconds).toBe(30)
  })

  it('exposes only the http port 8069 (no gevent 8072 declaration)', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const deployment = findDeployment(result)
    expect(deployment.spec.template.spec.containers[0].ports).toEqual([
      { name: 'http', containerPort: 8069 },
    ])
    const service = result.resources.find(
      (r: any) => r.kind === 'Service' && r.metadata.name === 'odoo'
    ) as any
    expect(service.spec.ports).toEqual([{ name: 'http', port: 8069, targetPort: 8069 }])
  })

  it('wires upstream odoo entrypoint env vars by default', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const env = findDeployment(result).spec.template.spec.containers[0].env
    const byName = (v: string) => env.find((e: any) => e.name === v)
    expect(byName('DB_HOST').value).toBe('odoo-rw')
    expect(byName('DB_PORT').value).toBe('5432')
    expect(byName('DB_USER').value).toBe('odoo')
    expect(byName('ODOO_DB').value).toBe('odoo')
  })

  it('does not emit the legacy ODOO_* env names or ODOO_WORKERS', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const env = findDeployment(result).spec.template.spec.containers[0].env
    const names = env.map((e: any) => e.name)
    expect(names).not.toContain('ODOO_DB_HOST')
    expect(names).not.toContain('ODOO_DB_PORT')
    expect(names).not.toContain('ODOO_DB_USER')
    expect(names).not.toContain('ODOO_DB_PASSWORD')
    expect(names).not.toContain('ODOO_MASTER_PASSWORD')
    expect(names).not.toContain('ODOO_WORKERS')
  })

  it('renders a ConfigMap with the expected odoo.conf markers', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const configMap = result.resources.find(
      (r: any) => r.kind === 'ConfigMap' && r.metadata.name === 'odoo-config'
    ) as any
    expect(configMap).toBeDefined()
    const conf = configMap.data['odoo.conf']
    expect(conf).toContain('[options]')
    expect(conf).toContain('proxy_mode = True')
    expect(conf).toContain('workers = 2')
    expect(conf).toContain(`limit_memory_hard = ${2 * 1024 ** 3}`)
    expect(conf).toContain(`limit_memory_soft = ${Math.round(2 * 1024 ** 3 * 0.8)}`)
    expect(conf).toContain('max_requests = 80')
  })

  it('mounts the odoo.conf ConfigMap at /etc/odoo/odoo.conf', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const deployment = findDeployment(result)
    const container = deployment.spec.template.spec.containers[0]
    expect(container.volumeMounts).toEqual([
      { name: 'filestore', mountPath: '/var/lib/odoo' },
      { name: 'config', mountPath: '/etc/odoo/odoo.conf', subPath: 'odoo.conf' },
    ])
    expect(deployment.spec.template.spec.volumes).toEqual([
      { name: 'filestore', persistentVolumeClaim: { claimName: 'odoo-filestore' } },
      { name: 'config', configMap: { name: 'odoo-config' } },
    ])
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Odoo, { host: 'erp.example.com' }),
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
          children: jsx(Odoo, { host: 'erp.example.com' }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('erp.example.com')
  })

  it('passes resource validation', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface at the maximum replica count of 1', () => {
    const result = renderOdoo({
      name: 'erp',
      namespace: 'erp',
      version: '17.0',
      host: 'erp.example.com',
      filestore: '50Gi',
      workers: 4,
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'erp-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    expect(result.resources.length).toBeGreaterThan(0)
    const deployment = findDeployment(result, 'erp')
    expect(deployment.spec.replicas).toBe(1)
    expect(deployment.spec.template.spec.containers[0].image).toBe('odoo:17.0')
    expect(deployment.spec.template.spec.containers[0].resources.limits.memory).toBe('4Gi')
    const configMap = result.resources.find(
      (r: any) => r.kind === 'ConfigMap' && r.metadata.name === 'erp-config'
    ) as any
    const conf = configMap.data['odoo.conf']
    expect(conf).toContain('workers = 4')
    expect(conf).toContain(`limit_memory_hard = ${4 * 1024 ** 3}`)
    expect(conf).toContain(`limit_memory_soft = ${Math.round(4 * 1024 ** 3 * 0.8)}`)
    const pvc = result.resources.find((r: any) => r.kind === 'PersistentVolumeClaim') as any
    expect(pvc.metadata.name).toBe('erp-filestore')
    expect(pvc.spec.resources.requests.storage).toBe('50Gi')
  })

  it('throws a descriptive error when replicas > 1 (RWO filestore)', () => {
    expect(() => renderOdoo({ host: 'erp.example.com', replicas: 2 })).toThrow(
      /filestore.*ReadWriteOnce/
    )
    expect(() => renderOdoo({ host: 'erp.example.com', name: 'erp', replicas: 3 })).toThrow(
      /Fix: keep replicas at 1/
    )
  })

  it('throws when the memory limit cannot be parsed', () => {
    expect(() =>
      renderOdoo({
        host: 'erp.example.com',
        masterPasswordSecretName: 'existing-master',
        resources: { limits: { memory: 'lots' } },
      })
    ).toThrow(/cannot parse memory quantity/)
  })
})

describe('secrets handling', () => {
  it('accepts an explicit masterPasswordSecretName without a backend', () => {
    expect(() =>
      render(jsx(Odoo, { host: 'erp.example.com', masterPasswordSecretName: 'existing-master' }))
    ).not.toThrow()
  })

  it('provisions the master password through a secrets backend', () => {
    const result = renderOdoo({ host: 'erp.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('OpenBaoStaticSecret')
    const secret = result.resources.find((r: any) => r.kind === 'OpenBaoStaticSecret') as any
    expect(secret.metadata.name).toBe('odoo-master-password')
    expect(secret.spec.path).toBe('test/odoo/master')
    expect(secret.spec.destination).toEqual({ create: true, name: 'odoo-master-password' })
  })

  it('provisions the master password through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(Odoo, { host: 'erp.example.com' }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
    const secret = result.resources.find((r: any) => r.kind === 'VaultStaticSecret') as any
    expect(secret.spec.path).toBe('apps/odoo/master')
  })

  it('wires credentials via upstream env names and secretKeyRef (never plaintext)', () => {
    const result = renderOdoo({
      host: 'erp.example.com',
      masterPasswordSecretName: 'existing-master',
    })
    const env = findDeployment(result).spec.template.spec.containers[0].env
    const masterPassword = env.find((e: any) => e.name === 'MASTER_PASSWORD')
    const dbPassword = env.find((e: any) => e.name === 'DB_PASSWORD')
    expect(masterPassword.valueFrom.secretKeyRef.name).toBe('existing-master')
    expect(masterPassword.valueFrom.secretKeyRef.key).toBe('masterPassword')
    expect(dbPassword.valueFrom.secretKeyRef.name).toBe('odoo-db-credentials')
    expect(dbPassword.valueFrom.secretKeyRef.key).toBe('password')
    expect(masterPassword.value).toBeUndefined()
    expect(dbPassword.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderOdoo({ host: 'erp.example.com', filestore: '50Gi', workers: 4 })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('validation errors', () => {
  it('throws when no secrets backend and no master password secret', () => {
    expect(() => render(jsx(Odoo, { host: 'erp.example.com' }))).toThrow(/master password/)
  })

  it('throws for unknown secrets backends', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'unknown' as never },
          children: jsx(Odoo, { host: 'erp.example.com' }),
        })
      )
    ).toThrow(/master password/)
  })
})
