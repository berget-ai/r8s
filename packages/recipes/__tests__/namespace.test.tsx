import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { Namespace, Platform, StaticSecret, Database } from '../src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'apps' }

function scopedStaticSecret(name: string) {
  return jsx(SecretContext.Provider, {
    value: openbao as never,
    children: jsx(StaticSecret, { name, path: `s/${name}`, keys: { FOO: 'foo' } }),
  })
}

describe('Namespace scope', () => {
  it('emits the v1/Namespace resource and scopes children', () => {
    const result = render(jsx(Namespace, { name: 'team-a', children: scopedStaticSecret('s') }))
    const ns = result.resources.find((r) => r.kind === 'Namespace')
    expect(ns?.metadata?.name).toBe('team-a')
    const sec = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
    expect(sec?.metadata?.namespace).toBe('team-a')
  })

  it('create={false} scopes without emitting the resource', () => {
    const result = render(
      jsx(Namespace, { name: 'team-a', create: false, children: scopedStaticSecret('s') })
    )
    expect(result.resources.some((r) => r.kind === 'Namespace')).toBe(false)
    const sec = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
    expect(sec?.metadata?.namespace).toBe('team-a')
  })

  it('innermost scope wins when nested', () => {
    const result = render(
      jsx(Namespace, {
        name: 'outer',
        children: jsx(Namespace, {
          name: 'inner',
          create: false,
          children: scopedStaticSecret('s'),
        }),
      })
    )
    const sec = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
    expect(sec?.metadata?.namespace).toBe('inner')
    // only the outer scope emitted the resource
    expect(result.resources.filter((r) => r.kind === 'Namespace')).toHaveLength(1)
  })

  it('explicit namespace prop on a child still overrides the scope', () => {
    const result = render(
      jsx(Namespace, {
        name: 'team-a',
        create: false,
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(StaticSecret, {
            name: 's',
            namespace: 'override-ns',
            path: 's/app',
            keys: { FOO: 'foo' },
          }),
        }),
      })
    )
    const sec = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
    expect(sec?.metadata?.namespace).toBe('override-ns')
  })

  it('throws actionable guidance on a non-DNS-1123 name', () => {
    expect(() => render(jsx(Namespace, { name: 'Team_A', children: null }))).toThrow(
      /DNS-1123[\s\S]*team-a/
    )
  })

  it('throws on a non-string name instead of coercing it past validation', () => {
    expect(() => render(jsx(Namespace, { name: undefined as never, children: null }))).toThrow(
      /DNS-1123/
    )
  })

  it('nested scopes reusing the same name emit the resource only once', () => {
    const result = render(
      jsx(Namespace, {
        name: 'team-a',
        children: jsx(Namespace, { name: 'team-a', children: scopedStaticSecret('s') }),
      })
    )
    expect(result.resources.filter((r) => r.kind === 'Namespace')).toHaveLength(1)
    const sec = result.resources.find((r) => r.kind === 'OpenBaoStaticSecret')
    expect(sec?.metadata?.namespace).toBe('team-a')
  })

  it('Platform namespace prop still emits the resource and scopes children (delegates to <Namespace>)', () => {
    const result = render(
      jsx(Platform, {
        namespace: 'production',
        children: jsx(Database, { name: 'api-db', backup: false }),
      })
    )
    const ns = result.resources.find((r) => r.kind === 'Namespace')
    expect(ns?.metadata?.name).toBe('production')
    const cluster = result.resources.find((r) => r.kind === 'Cluster')
    expect(cluster?.metadata?.namespace).toBe('production')
  })
})
