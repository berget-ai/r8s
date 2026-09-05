import { describe, it, expect } from 'vitest'
import { render, jsx, runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { SecretContext, RoutingContext, type SecretProvider } from '@r8s/core/defaults'

// Provider-matrix: every app package that exposes an Endpoint must render
// equally well under either endpoint provider (ingress controller, Gateway
// API) and either provisioning secrets backend (OpenBao, Vault) — and must
// fail gracefully (actionable error) or fall back to explicit secret
// references under passive backends (manual-secrets, sealed-secrets).
// Test against package SOURCES (not dist): dist is CommonJS and vitest's
// CJS↔ESM interop loads context singletons twice, which breaks Provider
// context identity. Transpiling sources in-process keeps a single module
// graph — exactly like each package's own test suite does.
import { N8n } from '../../n8n/src/index'
import { Outline } from '../../outline/src/index'
import { Paperclip } from '../../paperclip/src/index'
import { EuroOffice } from '../../eurooffice/src/index'
import { Matrix } from '../../matrix/src/index'
import { Nextcloud } from '../../nextcloud/src/index'
import { Odoo } from '../../odoo/src/index'
import { ChromaDb } from '../../chromadb/src/index'
import { LibreChat } from '../../librechat/src/index'

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }
const vault = { backend: 'vault', mount: 'kv', path: 'test' }
const manual = { backend: 'manual-secrets' }
const sealed = { backend: 'sealed-secrets' }

interface Fixture {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any
  /** Minimal props valid with a provisioning backend */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  /**
   * Extra props that replace backend provisioning with explicit secret
   * references. When absent the package is expected to throw an actionable
   * error under passive backends.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manualProps?: any
  /** Host names the Endpoint must expose under ANY routing mode */
  expectedHosts: string[]
  /**
   * Whether the package provisions StaticSecrets under a secrets backend
   * (default true). Packages without secrets to manage (e.g. ChromaDb)
   * set this to false — the matrix then asserts *none* are rendered.
   */
  provisionsSecrets?: boolean
}

const fixtures: Fixture[] = [
  {
    name: 'N8n',
    component: N8n,
    props: { host: 'n8n.example.com' },
    manualProps: { encryptionKeySecretName: 'n8n-encryption' },
    expectedHosts: ['n8n.example.com'],
  },
  {
    name: 'Outline',
    component: Outline,
    props: { host: 'wiki.example.com' },
    expectedHosts: ['wiki.example.com'],
  },
  {
    name: 'Paperclip',
    component: Paperclip,
    props: { host: 'paperclip.example.com' },
    expectedHosts: ['paperclip.example.com'],
    // The paperclip-operator owns routing: the Instance CR carries hosts in
    // its own spec and the operator renders the Ingress itself — no r8s
    // Endpoint/Ingress/HTTPRoute resources exist to assert.
    skipEndpoints: true,
  },
  {
    name: 'EuroOffice',
    component: EuroOffice,
    props: { host: 'docs.example.com' },
    expectedHosts: ['docs.example.com'],
  },
  {
    name: 'Matrix',
    component: Matrix,
    // StaticSecrets (OIDC bundle etc.) are gated on sso
    props: {
      domain: 'example.com',
      sso: { issuer: 'https://keycloak.example.com/realms/x', clientId: 'matrix' },
    },
    expectedHosts: ['matrix.example.com', 'element.example.com'],
  },
  {
    name: 'Nextcloud',
    component: Nextcloud,
    props: { port: 80, host: 'cloud.example.com' },
    expectedHosts: ['cloud.example.com'],
  },
  {
    name: 'Odoo',
    component: Odoo,
    props: { host: 'erp.example.com' },
    expectedHosts: ['erp.example.com'],
  },
  {
    name: 'ChromaDb',
    component: ChromaDb,
    props: { host: 'vectors.example.com' },
    expectedHosts: ['vectors.example.com'],
    provisionsSecrets: false,
  },
  {
    name: 'LibreChat',
    component: LibreChat,
    props: {
      host: 'chat.example.com',
      mongodb: { host: 'mongo.data.svc.cluster.local', port: 27017, passwordSecret: 'chat-mongo' },
    },
    expectedHosts: ['chat.example.com'],
  },
]

function wrapWithSecrets(backend: SecretProvider, children: unknown) {
  return jsx(SecretContext.Provider, { value: backend as never, children })
}

function wrapWithRouting(mode: 'ingress' | 'gateway', children: unknown) {
  return jsx(RoutingContext.Provider, {
    value: mode === 'gateway' ? { mode: 'gateway', gatewayClassName: 'eg' } : { mode: 'ingress' },
    children,
  })
}

function assertRendersCleanly(renderFn: () => ReturnType<typeof render>) {
  const result = renderFn()
  expect(result.resources.length).toBeGreaterThan(0)
  for (const resource of result.resources) {
    expect(validateResource(resource)).toEqual([])
  }
  const { passed, errors } = runGuardrails(result.resources as never, [noPlaintextSecrets])
  if (!passed) console.error('guardrail violations:', errors)
  expect(passed).toBe(true)
  return result
}

/** Every host name appearing anywhere in rendered routes */
function routedHosts(resources: any[]): string[] {
  const hosts = new Set<string>()
  for (const r of resources) {
    if (r.kind === 'Ingress') {
      for (const rule of r.spec.rules ?? []) if (rule.host) hosts.add(rule.host)
    }
    if (r.kind === 'HTTPRoute') {
      for (const h of r.spec.hostnames ?? []) hosts.add(h)
    }
  }
  return [...hosts]
}

for (const fx of fixtures) {
  describe(`${fx.name} — provider matrix`, () => {
    ;(fx.skipEndpoints ? describe.skip : describe)('endpoint provider', () => {
      it('renders a valid Ingress with the expected host under ingress routing', () => {
        const result = assertRendersCleanly(() =>
          render(wrapWithRouting('ingress', wrapWithSecrets(openbao, jsx(fx.component, fx.props))))
        )
        expect(result.resources.some((r: any) => r.kind === 'Ingress')).toBe(true)
        const hosts = routedHosts(result.resources)
        for (const expected of fx.expectedHosts) {
          expect(hosts).toContain(expected)
        }
      })

      it('renders an HTTPRoute with the same hosts under Gateway API routing', () => {
        const result = assertRendersCleanly(() =>
          render(wrapWithRouting('gateway', wrapWithSecrets(openbao, jsx(fx.component, fx.props))))
        )
        expect(result.resources.some((r: any) => r.kind === 'HTTPRoute')).toBe(true)
        const hosts = routedHosts(result.resources)
        for (const expected of fx.expectedHosts) {
          expect(hosts).toContain(expected)
        }
      })
    })

    describe('secret provider', () => {
      it('provisions secrets through OpenBao (baseline)', () => {
        const result = assertRendersCleanly(() =>
          render(wrapWithSecrets(openbao, jsx(fx.component, fx.props)))
        )
        const obs = result.resources.filter((r: any) => r.kind === 'OpenBaoStaticSecret')
        if (fx.provisionsSecrets === false) {
          expect(obs).toHaveLength(0)
        } else {
          expect(obs.length).toBeGreaterThan(0)
        }
      })

      it('provisions the same secrets through Vault', () => {
        const baseline = assertRendersCleanly(() =>
          render(wrapWithSecrets(openbao, jsx(fx.component, fx.props)))
        )
        if (!baseline.resources.some((r: any) => r.kind === 'OpenBaoStaticSecret')) {
          return // package provisions nothing — nothing to switch
        }
        const result = assertRendersCleanly(() =>
          render(wrapWithSecrets(vault, jsx(fx.component, fx.props)))
        )
        expect(result.resources.some((r: any) => r.kind === 'VaultStaticSecret')).toBe(true)
        // same destination secrets — switching backend must not rewire the app
        const destNames = (res: ReturnType<typeof render>, kind: string) =>
          res.resources
            .filter((r: any) => r.kind === kind)
            .map((r: any) => r.spec.destination?.name)
            .sort()
        expect(destNames(result, 'VaultStaticSecret')).toEqual(
          destNames(baseline, 'OpenBaoStaticSecret')
        )
      })

      for (const [label, backend] of [
        ['manual-secrets', manual],
        ['sealed-secrets', sealed],
      ] as const) {
        it(`works or fails gracefully under ${label}`, () => {
          const props = fx.manualProps ? { ...fx.props, ...fx.manualProps } : fx.props
          if (fx.manualProps) {
            assertRendersCleanly(() => render(wrapWithSecrets(backend, jsx(fx.component, props))))
          } else {
            // Packages without explicit-secret props must at least guide the
            // user with an actionable error — never a cryptic crash.
            let error: Error | undefined
            try {
              render(wrapWithSecrets(backend, jsx(fx.component, props)))
            } catch (e) {
              error = e as Error
            }
            if (error) {
              expect(error.message).toMatch(
                /backend|secret|secrets|manual|explicit|reference|encryption|provision/i
              )
            }
          }
        })
      }
    })
  })
}
