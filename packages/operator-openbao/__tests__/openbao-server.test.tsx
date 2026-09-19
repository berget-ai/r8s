import { describe, expect, it } from 'vitest'
import { render, jsx } from '@r8s/core'
import { OpenBaoServer } from '../src/index'

describe('@r8s/operator-openbao', () => {
  it('renders ConfigMap + Service + StatefulSet with raft storage', async () => {
    const { resources } = await render(jsx(OpenBaoServer, {}))
    const kinds = resources.map((r: any) => r.kind)
    expect(kinds).toEqual(['ConfigMap', 'Service', 'StatefulSet'])

    const sts = resources.find((r: any) => r.kind === 'StatefulSet')
    expect(sts.spec.replicas).toBe(1)
    expect(sts.spec.template.spec.containers[0].image).toBe('openbao/openbao:2.6.2')
    expect(sts.spec.template.spec.containers[0].args).toEqual([
      'server',
      '-config=/openbao/config/server.hcl',
    ])
    const vct = sts.spec.volumeClaimTemplates[0]
    expect(vct.spec.resources.requests.storage).toBe('5Gi')
    expect(vct.spec.accessModes).toEqual(['ReadWriteOnce'])
  })

  it('the server HCL enables raft + the UI and disables TLS in-cluster', async () => {
    const { resources } = await render(jsx(OpenBaoServer, {}))
    const cm = resources.find((r: any) => r.kind === 'ConfigMap')
    const hcl = cm.data['server.hcl']
    expect(hcl).toContain('storage "raft"')
    expect(hcl).toContain('ui = true')
    expect(hcl).toContain('tls_disable = 1')
  })

  it('props flow: namespace, storage size/class, replicas, ui off', async () => {
    const { resources } = await render(
      jsx(OpenBaoServer, {
        namespace: 'secrets',
        storage: '2Gi',
        storageClass: 'harvester',
        replicas: 3,
        ui: false,
      })
    )
    const sts = resources.find((r: any) => r.kind === 'StatefulSet')
    expect(sts.metadata.namespace).toBe('secrets')
    expect(sts.spec.replicas).toBe(3)
    expect(sts.spec.volumeClaimTemplates[0].spec.storageClassName).toBe('harvester')
    expect(sts.spec.volumeClaimTemplates[0].spec.resources.requests.storage).toBe('2Gi')
    const cm = resources.find((r: any) => r.kind === 'ConfigMap')
    expect(cm.metadata.namespace).toBe('secrets')
    expect(cm.data['server.hcl']).toContain('ui = false')
  })

  it('credentials never appear as literals — the POD_IP comes from a fieldRef', async () => {
    const { resources } = await render(jsx(OpenBaoServer, {}))
    const sts = resources.find((r: any) => r.kind === 'StatefulSet')
    const env = sts.spec.template.spec.containers[0].env
    expect(env).toEqual([
      { name: 'POD_IP', valueFrom: { fieldRef: { fieldPath: 'status.podIP' } } },
    ])
  })
})
