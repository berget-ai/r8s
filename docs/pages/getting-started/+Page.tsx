import { CodeBlock } from '../../components/CodeBlock'

const step1 = `import { App } from '@r8s/recipes';

export default () => (
  <App
    name="myapp"
    image="nginx:latest"
    host="myapp.example.com"
  />
);`

const step1Output = `# 3 resources created:
# - Deployment (myapp)
# - Service (myapp)
# - Ingress (myapp-endpoint)`

const step2 = `import { App, Database } from '@r8s/recipes';

export default () => (
  <>
    <Database name="myapp-db" storage="10Gi" />
    <App
      name="myapp"
      image="myapp:v1"
      host="myapp.example.com"
    />
  </>
);`

const step2Output = `# 5 resources created:
# - Cluster (myapp-db) — CNPG PostgreSQL
# - Deployment (myapp)
# - Service (myapp)
# - Ingress (myapp-endpoint)
# - Secret (myapp-db-app) — auto-generated credentials`

const step3 = `import { App, Database, Monitoring } from '@r8s/recipes';

export default () => (
  <>
    <Database name="myapp-db" storage="10Gi" />
    <App
      name="myapp"
      image="myapp:v1"
      host="myapp.example.com"
    />
    <Monitoring
      name="myapp-monitor"
      selector={{ app: 'myapp' }}
    />
  </>
);`

const step3Output = `# 7 resources created:
# - Cluster (myapp-db)
# - Deployment (myapp)
# - Service (myapp)
# - Ingress (myapp-endpoint)
# - Secret (myapp-db-app)
# - ServiceMonitor (myapp-monitor) — Prometheus scraping
# - Prometheus Operator — declared as dependency`

const step4 = `import { SecretProvider, DnsProvider, EndpointProvider, App, Database, Monitoring } from '@r8s/recipes';

export default () => (
  <SecretProvider provider="openbao">
    <DnsProvider provider="external-dns">
      <EndpointProvider provider="nginx">
        <Database name="myapp-db" storage="10Gi" />
        <App
          name="myapp"
          image="myapp:v1"
          host="myapp.example.com"
        />
        <Monitoring
          name="myapp-monitor"
          selector={{ app: 'myapp' }}
        />
      </EndpointProvider>
    </DnsProvider>
  </SecretProvider>
);`

const step4Output = `# 9 resources created:
# - Cluster (myapp-db)
# - Deployment (myapp)
# - Service (myapp)
# - Ingress (myapp-endpoint)
# - OpenBaoStaticSecret (myapp-db-app) — synced from OpenBao
# - ServiceMonitor (myapp-monitor)
# - DNSEndpoint (myapp-endpoint-dns) — automatic DNS record
# - Prometheus Operator
# - ExternalDNS Operator
# - Vault Secrets Operator`

const step5 = `import { SecretProvider, OpenBao, DnsProvider, ExternalDns, EndpointProvider, Nginx, App, Database, Monitoring, Auth } from '@r8s/recipes';

export default () => (
  <SecretProvider provider={<OpenBao mount="secret" path="myapp" />}>
    <DnsProvider provider={<ExternalDns server="ns1.example.com" tsig={{ path: 'dns/tsig', key: 'secret' }} />}>
      <EndpointProvider provider={<Nginx tls={{ clusterIssuer: 'letsencrypt-prod' }} />}>
        <Database name="myapp-db" storage="20Gi" />
        <Auth name="auth" host="auth.example.com" />
        <App
          name="myapp"
          image="myapp:v1"
          host="myapp.example.com"
          replicas={3}
          cache
        />
        <Monitoring
          name="myapp-monitor"
          selector={{ app: 'myapp' }}
          logs
        />
      </EndpointProvider>
    </DnsProvider>
  </SecretProvider>
);`

const step5Output = `# 15+ resources created:
# - Cluster (myapp-db) — CNPG PostgreSQL
# - Keycloak (auth) — Identity provider
# - Cluster (auth-db) — Keycloak's database
# - RedisCluster (myapp-cache) — Session store
# - Deployment (myapp) — 3 replicas
# - Service (myapp)
# - Ingress (myapp-endpoint) — TLS via cert-manager
# - Ingress (auth-endpoint) — TLS via cert-manager
# - OpenBaoStaticSecret (myapp-db-app)
# - OpenBaoStaticSecret (auth-db-app)
# - OpenBaoStaticSecret (external-dns-tsig) — TSIG for DNS updates
# - ServiceMonitor (myapp-monitor)
# - LokiStack (myapp-monitor-loki) — Log aggregation
# - Logging (myapp-monitor-logging)
# - Flow (myapp-monitor-flow)
# - Output (myapp-monitor-loki-output)
# - DNSEndpoint (myapp-endpoint-dns)
# - DNSEndpoint (auth-endpoint-dns)
# - All operators declared automatically`

export default function Page() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl tracking-tight">Getting Started</h1>
        <p className="text-xl text-cloud/80">
          From zero to production-ready in 5 steps
        </p>
      </div>

      {/* Step 1 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">Step 1</span>
          <h2 className="text-2xl">Your First App</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          One component. Three resources. Deployment, Service, and Ingress — all wired together.
        </p>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="text-sm text-cloud/60 font-mono">TSX</div>
            <CodeBlock code={step1} language="tsx" />
          </div>
          <div className="space-y-4">
            <div className="text-sm text-cloud/60 font-mono">YAML</div>
            <CodeBlock code={step1Output} language="bash" />
          </div>
        </div>
        <p className="text-cloud/70 text-sm">
          Run <code>npx r8s render</code> to see the full YAML output.
        </p>
      </div>

      {/* Step 2 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">Step 2</span>
          <h2 className="text-2xl">Add a Database</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Add a PostgreSQL database with one line. CNPG creates the cluster, manages credentials,
          and auto-wires the connection string to your app.
        </p>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="text-sm text-cloud/60 font-mono">TSX</div>
            <CodeBlock code={step2} language="tsx" />
          </div>
          <div className="space-y-4">
            <div className="text-sm text-cloud/60 font-mono">YAML</div>
            <CodeBlock code={step2Output} language="bash" />
          </div>
        </div>
        <p className="text-cloud/70 text-sm">
          The <code>DATABASE_URL</code> environment variable is automatically set in your Deployment.
        </p>
      </div>

      {/* Step 3 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">Step 3</span>
          <h2 className="text-2xl">Add Monitoring</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Prometheus scraping with one component. The operator is declared automatically.
        </p>
        <CodeBlock code={step3} language="tsx" />
        <CodeBlock code={step3Output} language="bash" />
      </div>

      {/* Step 4 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">Step 4</span>
          <h2 className="text-2xl">Add Providers</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Wrap your app in providers for secrets, DNS, and routing. Each provider declares its
          required operators.
        </p>
        <CodeBlock code={step4} language="tsx" />
        <CodeBlock code={step4Output} language="bash" />
        <p className="text-cloud/70 text-sm">
          Now your secrets come from OpenBao, DNS records are created automatically, and routing
          uses nginx with TLS.
        </p>
      </div>

      {/* Step 5 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-moss font-mono text-sm">Step 5</span>
          <h2 className="text-2xl">Production Ready</h2>
        </div>
        <p className="text-cloud/70 leading-relaxed">
          Full production setup: Keycloak for auth, Redis for cache, Loki for logs, TSIG for DNS,
          and TLS everywhere. All operators declared, all secrets managed.
        </p>
        <CodeBlock code={step5} language="tsx" />
        <CodeBlock code={step5Output} language="bash" />
        <p className="text-cloud/70 text-sm">
          This is a complete production stack — auth, database, cache, monitoring, logging, DNS,
          and TLS — in ~30 lines of TypeScript.
        </p>
      </div>

      {/* Next Steps */}
      <div className="p-6 rounded-lg border border-white/10 bg-spruce/20">
        <h2 className="font-serif text-2xl mb-3">What's next?</h2>
        <ul className="text-cloud/70 text-sm leading-relaxed space-y-2">
          <li>
            <a href="/recipes" className="text-moss hover:text-lichen">
              Browse all recipes
            </a>{' '}
            — Auth, Backup, Monitoring, and more
          </li>
          <li>
            <a href="/core" className="text-moss hover:text-lichen">
              Core concepts
            </a>{' '}
            — Providers, context, and composition
          </li>
          <li>
            <a href="/deployment" className="text-moss hover:text-lichen">
              Deployment
            </a>{' '}
            — FluxCD, GitHub Actions, and GitOps
          </li>
        </ul>
      </div>
    </div>
  )
}
