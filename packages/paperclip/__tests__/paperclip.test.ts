import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Namespace, OperatorContext, SecretContext, RoutingContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { operators } from '@r8s/crds'
import type { r8sElement } from '@r8s/core'

// Paperclip recipe tests:
//   1. Operator declarations (cnpg via Database, deduped via OperatorContext)
//   2. Rendering: defaults, sandbox agents (hardened sandbox, TCP probes),
//      all props, gateway/ingress adaptation
//   3. Namespace inheritance from the Platform context
//   4. Security: no plaintext credentials in rendered output
import { Paperclip } from '../src/index'

/** Render Paperclip inside a Platform-like secrets backend (OpenBao). */
function renderPaperclip(props: Record<string, unknown>): ReturnType<typeof render> {
  return render(
    jsx(SecretContext.Provider, {
      value: { backend: 'openbao', mount: 'kv', path: 'test' },
      children: jsx(Paperclip, props as never),
    })
  )
}

/** Render Paperclip inside a Platform-like Namespace context (no explicit namespace prop). */
function renderPaperclipInNamespace(
  namespaceValue: string,
  props: Record<string, unknown>
): ReturnType<typeof render> {
  return render(
    jsx(Namespace.Provider, {
      value: namespaceValue,
      children: jsx(SecretContext.Provider, {
        value: { backend: 'openbao', mount: 'kv', path: 'test' },
        children: jsx(Paperclip, props as never),
      }),
    })
  )
}

/** Render Paperclip wrapped only in an OperatorContext (no secrets backend). */
function renderPaperclipWithContext(operators_: any[], props: Record<string, unknown>): r8sElement {
  return jsx(OperatorContext.Provider, {
    value: operators_,
    children: jsx(Paperclip, props as never),
  })
}

const openbao = { backend: 'openbao', mount: 'kv', path: 'test' }

describe('operator declarations', () => {
  it('declares the cnpg operator via the Database recipe', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com' })
    expect(result.operators.some((op) => op.name === 'cnpg')).toBe(true)
  })

  it('declares cnpg exactly once even with sandbox agents (no redis for paperclip)', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 3 },
    })
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('RedisCluster')
  })

  it('deduplicates operators provided via context', () => {
    const result = render(
      renderPaperclipWithContext([operators['cnpg']()], {
        host: 'paperclip.example.com',
        secretsName: 'existing-secrets',
      })
    )
    const names = result.operators.map((op) => op.name)
    expect(names.filter((n) => n === 'cnpg')).toHaveLength(1)
  })

  it('allows version overrides through context operators', () => {
    const result = render(
      renderPaperclipWithContext([operators['cnpg']('1.25.0')], {
        host: 'paperclip.example.com',
        secretsName: 'existing-secrets',
      })
    )
    const cnpg = result.operators.filter((op) => op.name === 'cnpg')
    expect(cnpg).toHaveLength(1)
    expect(cnpg[0].version).toBe('1.25.0')
  })
})

describe('rendering defaults', () => {
  it('renders main deployment, service, database and endpoint', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com' })
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('Deployment')
    expect(kinds).toContain('Service')
    expect(kinds).toContain('Ingress')
    expect(kinds).toContain('Cluster')
  })

  it('renders the main app with the paperclip image on port 3000', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com' })
    const main = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip'
    ) as any
    expect(main).toBeDefined()
    const container = main.spec.template.spec.containers[0]
    expect(container.image).toBe('ghcr.io/berget-ai/paperclip:latest')
    expect(container.ports[0].containerPort).toBe(3000)
    expect(main.spec.replicas).toBe(2)
  })

  it('probes both workloads with TCP sockets (unknown HTTP health contract)', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 2 },
    })
    for (const name of ['paperclip', 'paperclip-agent-sandbox']) {
      const deployment = result.resources.find(
        (r: any) => r.kind === 'Deployment' && r.metadata.name === name
      ) as any
      const container = deployment.spec.template.spec.containers[0]
      expect(container.livenessProbe.tcpSocket).toEqual({ port: 3000 })
      expect(container.readinessProbe.tcpSocket).toEqual({ port: 3000 })
      expect(container.livenessProbe.httpGet).toBeUndefined()
      expect(container.readinessProbe.httpGet).toBeUndefined()
    }
  })

  it('renders no sandbox deployment when agents is not set', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com' })
    const names = result.resources
      .filter((r) => r.kind === 'Deployment')
      .map((d: any) => d.metadata.name)
    expect(names).toEqual(['paperclip'])
  })

  it('renders the sandbox agent deployment when agents is set', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 3 },
    })
    const sandbox = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip-agent-sandbox'
    ) as any
    expect(sandbox).toBeDefined()
    expect(sandbox.spec.replicas).toBe(3)
    expect(sandbox.spec.template.spec.containers[0].image).toBe(
      'ghcr.io/berget-ai/paperclip:latest'
    )
    expect(sandbox.spec.template.spec.containers[0].command).toEqual([
      'paperclip',
      'agent',
      '--sandbox',
    ])
  })

  it('hardens the sandbox with a locked-down securityContext', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: {},
    })
    const sandbox = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip-agent-sandbox'
    ) as any
    const podSpec = sandbox.spec.template.spec
    expect(podSpec.securityContext).toEqual({ seccompProfile: { type: 'RuntimeDefault' } })
    const securityContext = podSpec.containers[0].securityContext
    expect(securityContext.runAsNonRoot).toBe(true)
    expect(securityContext.allowPrivilegeEscalation).toBe(false)
    expect(securityContext.seccompProfile).toEqual({ type: 'RuntimeDefault' })
    expect(securityContext.capabilities.drop).toEqual(['ALL'])
  })

  it('gives the sandbox explicit resources by default and honours overrides', () => {
    const defaults = renderPaperclip({ host: 'paperclip.example.com', agents: {} })
    const defaultSandbox = defaults.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip-agent-sandbox'
    ) as any
    const defaultContainer = defaultSandbox.spec.template.spec.containers[0]
    expect(defaultContainer.resources.requests).toEqual({ cpu: '250m', memory: '256Mi' })
    expect(defaultContainer.resources.limits).toEqual({ cpu: '1000m', memory: '2Gi' })

    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: {
        sandboxReplicas: 1,
        resources: {
          requests: { cpu: '500m', memory: '1Gi' },
          limits: { cpu: '2000m', memory: '4Gi' },
        },
      },
    })
    const sandbox = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip-agent-sandbox'
    ) as any
    const container = sandbox.spec.template.spec.containers[0]
    expect(container.resources.requests).toEqual({ cpu: '500m', memory: '1Gi' })
    expect(container.resources.limits).toEqual({ cpu: '2000m', memory: '4Gi' })
  })

  it('defaults sandbox replicas to 2', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com', agents: {} })
    const sandbox = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip-agent-sandbox'
    ) as any
    expect(sandbox.spec.replicas).toBe(2)
  })

  it('renders gateway resources when platform uses gateway routing', () => {
    const result = render(
      jsx(RoutingContext.Provider, {
        value: { mode: 'gateway', gatewayClassName: 'eg' },
        children: jsx(SecretContext.Provider, {
          value: openbao as never,
          children: jsx(Paperclip, { host: 'paperclip.example.com' }),
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
          children: jsx(Paperclip, { host: 'paperclip.example.com' }),
        }),
      })
    )
    const ingress = result.resources.find((r) => r.kind === 'Ingress') as any
    expect(ingress).toBeDefined()
    expect(ingress.spec.rules[0].host).toBe('paperclip.example.com')
  })

  it('passes resource validation', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 2 },
    })
    for (const resource of result.resources) {
      expect(validateResource(resource)).toEqual([])
    }
  })
})

describe('namespace inheritance', () => {
  it('inherits namespace from the Platform context when namespace prop is not set', () => {
    const result = renderPaperclipInNamespace('agents', {
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 1 },
    })
    for (const kind of ['Deployment', 'Service', 'Cluster', 'Ingress']) {
      const resource = result.resources.find((r: any) => r.kind === kind)
      expect(resource).toBeDefined()
      expect(resource.metadata.namespace).toBe('agents')
    }
  })

  it('explicit namespace prop wins over the Platform context', () => {
    const result = renderPaperclipInNamespace('agents', {
      host: 'paperclip.example.com',
      namespace: 'paperclip-ns',
    })
    const main = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip'
    ) as any
    expect(main.metadata.namespace).toBe('paperclip-ns')
  })

  it('falls back to default when no Platform namespace is present', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com' })
    const main = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip'
    ) as any
    expect(main.metadata.namespace).toBe('default')
  })
})

describe('rendering with all props', () => {
  it('accepts the full prop surface', () => {
    const result = renderPaperclip({
      name: 'agents',
      namespace: 'agents',
      version: '0.4.0',
      host: 'agents.example.com',
      replicas: 3,
      dbStorage: '20Gi',
      websockets: true,
      agents: { sandboxReplicas: 4 },
      resources: {
        requests: { memory: '1Gi', cpu: '500m' },
        limits: { memory: '4Gi', cpu: '2000m' },
      },
      tls: { secretName: 'agents-tls', clusterIssuer: 'letsencrypt-prod' },
    })
    expect(result.resources.length).toBeGreaterThan(0)

    const main = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'agents'
    ) as any
    const container = main.spec.template.spec.containers[0]
    expect(container.image).toBe('ghcr.io/berget-ai/paperclip:0.4.0')
    expect(main.spec.replicas).toBe(3)
    expect(container.resources.limits.memory).toBe('4Gi')
    const websockets = container.env.find((e: any) => e.name === 'WEBSOCKETS_ENABLED')
    expect(websockets.value).toBe('true')

    const sandbox = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'agents-agent-sandbox'
    ) as any
    expect(sandbox.spec.replicas).toBe(4)

    const cluster = result.resources.find((r) => r.kind === 'Cluster') as any
    expect(cluster.spec.storage.size).toBe('20Gi')
  })

  it('renders unique env var names (k8s rejects duplicates)', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 1 },
    })
    for (const name of ['paperclip', 'paperclip-agent-sandbox']) {
      const deployment = result.resources.find(
        (r: any) => r.kind === 'Deployment' && r.metadata.name === name
      ) as any
      const env = deployment.spec.template.spec.containers[0].env as Array<{ name: string }>
      const names = env.map((e) => e.name)
      expect(new Set(names).size).toBe(names.length)
    }
  })
})

describe('secrets handling', () => {
  it('provisions the model API key through a secrets backend', () => {
    const result = renderPaperclip({ host: 'paperclip.example.com' })
    const bundle = result.resources.find(
      (r: any) => r.kind === 'OpenBaoStaticSecret' && r.metadata.name === 'paperclip-secrets'
    ) as any
    expect(bundle).toBeDefined()
    expect(bundle.spec.path).toBe('test/paperclip/secrets')
    expect(bundle.spec.destination).toEqual({
      create: true,
      name: 'paperclip-secrets',
    })
  })

  it('provisions the model API key through Vault', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: { backend: 'vault', mount: 'kv', path: 'apps' },
        children: jsx(Paperclip, { host: 'paperclip.example.com' }),
      })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).toContain('VaultStaticSecret')
  })

  it('accepts an explicit secretsName without a backend', () => {
    const result = render(
      jsx(Paperclip, { host: 'paperclip.example.com', secretsName: 'existing-secrets' })
    )
    const kinds = result.resources.map((r) => r.kind)
    expect(kinds).not.toContain('OpenBaoStaticSecret')
    expect(kinds).not.toContain('VaultStaticSecret')
    expect(result.resources.length).toBeGreaterThan(0)
  })

  it('wires credentials via secretKeyRef (never plaintext env)', () => {
    const result = render(
      jsx(Paperclip, { host: 'paperclip.example.com', secretsName: 'existing-secrets' })
    )
    const main = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip'
    ) as any
    const env = main.spec.template.spec.containers[0].env
    const modelApiKey = env.find((e: any) => e.name === 'MODEL_API_KEY')
    const dbPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(modelApiKey.valueFrom.secretKeyRef).toEqual({
      name: 'existing-secrets',
      key: 'modelApiKey',
    })
    expect(dbPassword.valueFrom.secretKeyRef).toEqual({
      name: 'paperclip-db-credentials',
      key: 'password',
    })
    expect(modelApiKey.value).toBeUndefined()
    expect(dbPassword.value).toBeUndefined()
    const databaseUrl = env.find((e: any) => e.name === 'DATABASE_URL')
    expect(databaseUrl.value).toContain('$(PGPASSWORD)')
  })

  it('sandbox workers share the same secrets bundle', () => {
    const result = render(
      jsx(SecretContext.Provider, {
        value: openbao as never,
        children: jsx(Paperclip, {
          host: 'paperclip.example.com',
          agents: { sandboxReplicas: 2 },
        }),
      })
    )
    const sandbox = result.resources.find(
      (r: any) => r.kind === 'Deployment' && r.metadata.name === 'paperclip-agent-sandbox'
    ) as any
    const env = sandbox.spec.template.spec.containers[0].env
    const modelApiKey = env.find((e: any) => e.name === 'MODEL_API_KEY')
    const dbPassword = env.find((e: any) => e.name === 'PGPASSWORD')
    expect(modelApiKey.valueFrom.secretKeyRef.name).toBe('paperclip-secrets')
    expect(modelApiKey.valueFrom.secretKeyRef.key).toBe('modelApiKey')
    expect(dbPassword.valueFrom.secretKeyRef.name).toBe('paperclip-db-credentials')
    expect(modelApiKey.value).toBeUndefined()
  })

  it('renders no plaintext credentials anywhere', () => {
    const result = renderPaperclip({
      host: 'paperclip.example.com',
      agents: { sandboxReplicas: 2 },
    })
    const { passed, errors } = runGuardrails(result.resources as any[], [noPlaintextSecrets])
    if (!passed) {
      console.error('Plaintext credential violations:', errors)
    }
    expect(passed).toBe(true)
  })
})

describe('validation errors', () => {
  it('throws when no secrets backend and no model key secret', () => {
    expect(() => render(jsx(Paperclip, { host: 'paperclip.example.com' }))).toThrow(
      /model api key/i
    )
  })

  it('throws for unknown secrets backends', () => {
    expect(() =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'unknown' as never },
          children: jsx(Paperclip, { host: 'paperclip.example.com' }),
        })
      )
    ).toThrow(/model api key/i)
  })
})
