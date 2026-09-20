import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render, jsx, Fragment } from '@r8s/core'
import { operators } from '@r8s/crds'
import { DEFAULT_EXTERNALDNS_VERSION, ExternalDnsOperator, declareIfMissing } from '../src/index'

const pkg = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
)

describe('@r8s/operator-external-dns', () => {
  it('mirrors the registry version (cut for 1.21.1; 1.21.2 is a package patch)', () => {
    // The tracked upstream (chart 1.21.1) is unchanged — 1.21.2 is a
    // package patch carrying the native ExternalDns component (#156),
    // not a new operator cut. The mirror invariant binds the registry
    // default to the tracked cut; the package floats one patch above.
    expect(DEFAULT_EXTERNALDNS_VERSION).toBe('1.21.1')
    expect(ExternalDnsOperator().version).toBe('1.21.1')
    expect(operators['external-dns']().version).toBe('1.21.1')
    expect(pkg.version).toBe('1.21.2')
  })

  it('declaration is deep-equal to the generated registry entry', () => {
    const expected = operators['external-dns']('1.21.1')
    const actual = ExternalDnsOperator('1.21.1')
    expect({ ...actual }).toEqual({ ...expected })
  })

  it('declares only when the Platform does not already provide it', () => {
    expect(declareIfMissing([operators['external-dns']()])).toEqual([])
    const resources = declareIfMissing([])
    expect(resources).toHaveLength(1)
    const result = render(<Fragment>{resources}</Fragment>)
    expect(result.operators.map((o) => o.name)).toEqual(['external-dns'])
  })
})

describe('ExternalDns — the native helm-free workload', () => {
  it('grants pods+nodes read — the controller lists them at startup (fatal without)', async () => {
    const { render } = await import('@r8s/core')
    const { jsx } = await import('@r8s/core')
    const { ExternalDns } = await import('../src/external-dns')
    const { resources } = await render(jsx(ExternalDns, { awsSecretRef: { name: 'aws-creds' } }))
    const role = resources.find((r: any) => r.kind === 'ClusterRole')
    const core = role.rules.find((r: any) => r.apiGroups.includes(''))
    expect(core.resources).toContain('pods')
    expect(core.resources).toContain('nodes')
    expect(core.resources).toContain('services')
  })

  it('wires the AWS credentials via secretKeyRef — never literals', async () => {
    const { render, jsx } = await import('@r8s/core')
    const { ExternalDns } = await import('../src/external-dns')
    const { resources } = await render(
      jsx(ExternalDns, {
        awsSecretRef: {
          name: 'aws-creds',
          accessKeyId: 'AWS_ACCESS_KEY_ID',
          secretAccessKey: 'AWS_SECRET_ACCESS_KEY',
        },
        txtOwnerId: 'test',
        domainFilters: ['example.io'],
      })
    )
    const dep = resources.find((r: any) => r.kind === 'Deployment')
    const env = dep.spec.template.spec.containers[0].env
    const ak = env.find((e: any) => e.name === 'AWS_ACCESS_KEY_ID')
    expect(ak.valueFrom.secretKeyRef).toEqual({ name: 'aws-creds', key: 'AWS_ACCESS_KEY_ID' })
    expect(JSON.stringify(dep)).not.toMatch(/AKIA/)
  })
})
