import { CodeBlock } from '../../components/CodeBlock'

const secretProviderExample = `import { SecretProvider, OpenBao, Database } from '@r8s/recipes';

// Simple — string provider
export const Simple = () => (
  <SecretProvider provider="openbao">
    <Database name="app-db" />
  </SecretProvider>
);

// Advanced — component provider
export const Advanced = () => (
  <SecretProvider provider={<OpenBao mount="secret" path="infra" authRef="custom-auth" />}>
    <Database name="app-db" />
  </SecretProvider>
);`

const dnsProviderExample = `import { DnsProvider, ExternalDns, SecretProvider, App } from '@r8s/recipes';

// Simple — string provider
export const Simple = () => (
  <SecretProvider provider="openbao">
    <DnsProvider provider="external-dns">
      <App name="api" image="myapp:v1" host="api.example.com" />
    </DnsProvider>
  </SecretProvider>
);

// Advanced — component provider with TSIG
export const Advanced = () => (
  <SecretProvider provider="openbao">
    <DnsProvider provider={
      <ExternalDns
        server="ns1.example.com"
        zone="example.com"
        tsig={{ path: 'dns/tsig', key: 'secret' }}
      />
    }>
      <App name="api" image="myapp:v1" host="api.example.com" />
    </DnsProvider>
  </SecretProvider>
);`

const endpointProviderExample = `import { EndpointProvider, Nginx, EnvoyGateway, App } from '@r8s/recipes';

// Simple — string provider
export const Simple = () => (
  <EndpointProvider provider="nginx">
    <App name="api" image="myapp:v1" host="api.example.com" />
  </EndpointProvider>
);

// Advanced — component provider
export const Advanced = () => (
  <EndpointProvider provider={
    <Nginx className="nginx-internal" tls={{ clusterIssuer: 'letsencrypt' }} />
  }>
    <App name="api" image="myapp:v1" host="api.example.com" />
  </EndpointProvider>
);

// Envoy Gateway
export const Gateway = () => (
  <EndpointProvider provider={
    <EnvoyGateway className="eg" tls={{ clusterIssuer: 'letsencrypt-prod' }} />
  }>
    <App name="api" image="myapp:v1" host="api.example.com" />
  </EndpointProvider>
);`

const fullHierarchyExample = `import { SecretProvider, OpenBao, DnsProvider, ExternalDns, EndpointProvider, Nginx, App, Database, Monitoring } from '@r8s/recipes';

export default () => (
  <SecretProvider provider={<OpenBao mount="secret" path="myapp" />}>
    <DnsProvider provider={<ExternalDns server="ns1.example.com" tsig={{ path: 'dns/tsig', key: 'secret' }} />}>
      <EndpointProvider provider={<Nginx tls={{ clusterIssuer: 'letsencrypt-prod' }} />}>
        <Database name="myapp-db" storage="20Gi" />
        <App name="myapp" image="myapp:v1" host="myapp.example.com" replicas={3} cache />
        <Monitoring name="myapp-monitor" selector={{ app: 'myapp' }} logs />
      </EndpointProvider>
    </DnsProvider>
  </SecretProvider>
);`

const compatibilityTable = `| Provider | Compatible Recipes | Notes |
|----------|-------------------|-------|
| SecretProvider | Database, Auth, App (secrets) | Required for TSIG, Vault secrets |
| DnsProvider | Endpoint, App | Auto-creates DNS records |
| EndpointProvider | Endpoint, App | Routing (nginx/gateway) |`

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl tracking-tight">Providers</h1>
        <p className="text-xl text-cloud/80">
          Cluster-level configuration for secrets, DNS, and routing
        </p>
      </div>

      {/* Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl">Overview</h2>
        <p className="text-cloud/70 leading-relaxed max-w-3xl">
          Providers configure cluster-level concerns that affect all child components. They follow a
          hierarchical pattern: wrap your app (or part of it) in providers to set the context. Each
          provider declares its required operators automatically.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-white/10">
            <h3 className="font-serif text-xl mb-3 text-moss">SecretProvider</h3>
            <p className="text-cloud/70 text-sm leading-relaxed">
              Secrets backend: OpenBao, Vault, Sealed Secrets, or plain Kubernetes Secrets.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-white/10">
            <h3 className="font-serif text-xl mb-3 text-moss">DnsProvider</h3>
            <p className="text-cloud/70 text-sm leading-relaxed">
              DNS management: ExternalDNS with RFC 2136 (TSIG) or cloud providers.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-white/10">
            <h3 className="font-serif text-xl mb-3 text-moss">EndpointProvider</h3>
            <p className="text-cloud/70 text-sm leading-relaxed">
              Routing: nginx Ingress or Envoy Gateway (Gateway API).
            </p>
          </div>
        </div>
      </div>

      {/* SecretProvider */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">01</span>
          <h2 className="text-2xl">SecretProvider</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Configures how secrets are managed: OpenBao, Vault, Sealed Secrets, or plain Kubernetes
          Secrets. Required for TSIG DNS updates and Vault secrets in apps.
        </p>
        <CodeBlock code={secretProviderExample} language="tsx" />
        <div className="text-sm text-cloud/60">
          <p className="font-medium mb-2">Available providers:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code>openbao</code> — OpenBao Vault Secrets Operator (recommended)
            </li>
            <li>
              <code>vault</code> — HashiCorp Vault Secrets Operator
            </li>
            <li>
              <code>sealed-secrets</code> — Bitnami Sealed Secrets
            </li>
            <li>
              <code>kubernetes</code> — Plain Kubernetes Secrets (CNPG-managed)
            </li>
          </ul>
        </div>
      </div>

      {/* DnsProvider */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">02</span>
          <h2 className="text-2xl">DnsProvider</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Configures DNS management via ExternalDNS. Supports RFC 2136 (TSIG) for secure updates or
          cloud providers (Route53, Cloudflare, Google Cloud DNS).
        </p>
        <CodeBlock code={dnsProviderExample} language="tsx" />
        <div className="text-sm text-cloud/60">
          <p className="font-medium mb-2">Available providers:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code>external-dns</code> — ExternalDNS operator
            </li>
          </ul>
          <p className="font-medium mt-4 mb-2">Configuration components:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code>&lt;ExternalDns /&gt;</code> — RFC 2136 or cloud provider config
            </li>
          </ul>
        </div>
      </div>

      {/* EndpointProvider */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">03</span>
          <h2 className="text-2xl">EndpointProvider</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Configures routing: nginx Ingress or Envoy Gateway (Gateway API). All Endpoint and App
          children use this routing mode.
        </p>
        <CodeBlock code={endpointProviderExample} language="tsx" />
        <div className="text-sm text-cloud/60">
          <p className="font-medium mb-2">Available providers:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code>nginx</code> — nginx Ingress (default)
            </li>
            <li>
              <code>envoy-gateway</code> — Envoy Gateway (Gateway API)
            </li>
          </ul>
          <p className="font-medium mt-4 mb-2">Configuration components:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <code>&lt;Nginx /&gt;</code> — Custom ingress class, TLS
            </li>
            <li>
              <code>&lt;EnvoyGateway /&gt;</code> — Custom gateway class, TLS
            </li>
          </ul>
        </div>
      </div>

      {/* Full Hierarchy */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">04</span>
          <h2 className="text-2xl">Full Hierarchy</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Compose all providers for a complete production setup. Each layer is independent — swap
          providers without changing your app.
        </p>
        <CodeBlock code={fullHierarchyExample} language="tsx" />
      </div>

      {/* Compatibility */}
      <div className="space-y-6">
        <h2 className="text-2xl">Compatibility</h2>
        <p className="text-cloud/70 leading-relaxed">Which providers work with which recipes:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Provider</th>
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">
                  Compatible Recipes
                </th>
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="text-cloud/80">
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-moss">SecretProvider</td>
                <td className="py-3 px-4">
                  <a href="/recipes/database" className="text-moss hover:text-lichen">
                    Database
                  </a>
                  ,{' '}
                  <a href="/recipes/auth" className="text-moss hover:text-lichen">
                    Auth
                  </a>
                  ,{' '}
                  <a href="/recipes/app" className="text-moss hover:text-lichen">
                    App
                  </a>
                </td>
                <td className="py-3 px-4">Required for TSIG, Vault secrets</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-moss">DnsProvider</td>
                <td className="py-3 px-4">
                  <a href="/recipes/endpoint" className="text-moss hover:text-lichen">
                    Endpoint
                  </a>
                  ,{' '}
                  <a href="/recipes/app" className="text-moss hover:text-lichen">
                    App
                  </a>
                </td>
                <td className="py-3 px-4">Auto-creates DNS records</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 font-mono text-moss">EndpointProvider</td>
                <td className="py-3 px-4">
                  <a href="/recipes/endpoint" className="text-moss hover:text-lichen">
                    Endpoint
                  </a>
                  ,{' '}
                  <a href="/recipes/app" className="text-moss hover:text-lichen">
                    App
                  </a>
                </td>
                <td className="py-3 px-4">Routing (nginx/gateway)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-6 rounded-lg border border-white/10 bg-spruce/20">
        <h2 className="font-serif text-2xl mb-3">Ready to use providers?</h2>
        <p className="text-cloud/70 text-sm leading-relaxed">
          Check out the{' '}
          <a href="/getting-started" className="text-moss hover:text-lichen">
            Getting Started guide
          </a>{' '}
          for a step-by-step walkthrough, or browse{' '}
          <a href="/recipes" className="text-moss hover:text-lichen">
            all recipes
          </a>{' '}
          to see providers in action.
        </p>
      </div>
    </div>
  )
}
