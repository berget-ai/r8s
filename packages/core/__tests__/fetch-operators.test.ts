import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchOperatorManifests } from '../src/fetch-operators'
import type { Operator } from '@r8s/k8s-types'

function fakeFetch(responses: Record<string, { ok: boolean; status?: number; body: string }>) {
  const calls: string[] = []
  const impl = async (url: string) => {
    calls.push(url)
    const r = responses[url]
    if (!r) throw new Error(`unexpected fetch: ${url}`)
    return {
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 500),
      statusText: r.ok ? 'OK' : 'Error',
      text: async () => r.body,
    }
  }
  return { calls, mock: vi.fn(impl) }
}

const CRD_A = 'https://raw.example/{version}/a.yml'
const CRD_B = 'https://raw.example/{version}/b.yml'
const OPERATOR = 'https://raw.example/{version}/operator.yml'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchOperatorManifests', () => {
  it('fetches all manifest urls in order when urls is set', async () => {
    const { calls, mock } = fakeFetch({
      [`https://raw.example/26.7.4/a.yml`]: { ok: true, body: 'crd-a' },
      [`https://raw.example/26.7.4/b.yml`]: { ok: true, body: 'crd-b' },
      [`https://raw.example/26.7.4/operator.yml`]: { ok: true, body: 'operator-doc' },
    })
    vi.stubGlobal('fetch', mock)

    const op: Operator = {
      name: 'keycloak-operator',
      version: '26.7.4',
      source: {
        type: 'manifest',
        urls: [CRD_A, CRD_B, OPERATOR].map((u) => u.replace('{version}', '26.7.4')),
        version: '26.7.4',
      },
    }

    const manifests = await fetchOperatorManifests([op])

    expect(calls).toEqual([
      'https://raw.example/26.7.4/a.yml',
      'https://raw.example/26.7.4/b.yml',
      'https://raw.example/26.7.4/operator.yml',
    ])
    expect(manifests).toHaveLength(3)
    // Operator header only on the first document
    expect(manifests[0]).toBe('# Operator: keycloak-operator v26.7.4\ncrd-a')
    expect(manifests[1]).toBe('crd-b')
    expect(manifests[2]).toBe('operator-doc')
  })

  it('fetches urls (in order) before url when both are set', async () => {
    const { calls, mock } = fakeFetch({
      'https://raw.example/1.2.3/first.yml': { ok: true, body: 'first' },
      'https://raw.example/1.2.3/single.yml': { ok: true, body: 'single' },
    })
    vi.stubGlobal('fetch', mock)

    const op: Operator = {
      name: 'split-then-single',
      version: '1.2.3',
      source: {
        type: 'manifest',
        urls: ['https://raw.example/1.2.3/first.yml'],
        url: 'https://raw.example/1.2.3/single.yml',
        version: '1.2.3',
      },
    }

    const manifests = await fetchOperatorManifests([op])
    expect(calls).toEqual([
      'https://raw.example/1.2.3/first.yml',
      'https://raw.example/1.2.3/single.yml',
    ])
    expect(manifests[0]).toBe('# Operator: split-then-single v1.2.3\nfirst')
    expect(manifests[1]).toBe('single')
  })

  it('behaves as before for a single-url manifest source', async () => {
    const { calls, mock } = fakeFetch({
      'https://example.com/op.yaml': { ok: true, body: 'kind: Deployment' },
    })
    vi.stubGlobal('fetch', mock)

    const op: Operator = {
      name: 'cnpg',
      version: '1.27.0',
      source: { type: 'manifest', url: 'https://example.com/op.yaml', version: '1.27.0' },
    }

    const manifests = await fetchOperatorManifests([op])
    expect(calls).toEqual(['https://example.com/op.yaml'])
    expect(manifests).toEqual(['# Operator: cnpg v1.27.0\nkind: Deployment'])
  })

  it('throws with URL and status when a urls response is not ok', async () => {
    const { mock } = fakeFetch({
      'https://raw.example/26.7.4/a.yml': { ok: true, body: 'crd-a' },
      'https://raw.example/26.7.4/b.yml': { ok: false, status: 422, body: 'nope' },
    })
    vi.stubGlobal('fetch', mock)

    const op: Operator = {
      name: 'keycloak-operator',
      version: '26.7.4',
      source: {
        type: 'manifest',
        urls: ['https://raw.example/26.7.4/a.yml', 'https://raw.example/26.7.4/b.yml'],
        version: '26.7.4',
      },
    }

    await expect(fetchOperatorManifests([op])).rejects.toThrow(
      'Failed to fetch operator manifest for keycloak-operator: HTTP 422: Error (fetched https://raw.example/26.7.4/b.yml)'
    )
  })

  it('skips non-manifest sources and manifest sources with no urls/url', async () => {
    const { mock } = fakeFetch({})
    vi.stubGlobal('fetch', mock)

    const olm: Operator = {
      name: 'fluent-operator',
      version: '2.0.0',
      source: { type: 'olm', package: 'fluent-operator', channel: 'stable', version: '2.0.0' },
    }
    const neither: Operator = {
      name: 'openbao',
      version: '2.6.2',
      source: { type: 'manifest', version: '2.6.2' },
    }

    expect(await fetchOperatorManifests([olm, neither])).toEqual([])
    expect(mock).not.toHaveBeenCalled()
  })
})
