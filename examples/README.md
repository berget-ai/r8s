# Example Applications

Complete, production-ready example applications built with r8s.

## Examples

| Example | Description | Components |
|---------|-------------|------------|
| [web-shop](./web-shop/) | E-commerce platform | Platform, App, Database, Auth, Endpoint, DNS, TLS |
| [monitoring-stack](./monitoring-stack/) | Observability platform | Platform, Grafana, Loki, Prometheus, Endpoint, DNS, TLS |
| [saas-platform](./saas-platform/) | Multi-tenant SaaS | Platform, App, Database, Auth, Superset, RustFS, Endpoint, DNS, TLS |

## Usage

Each example is a complete TSX file that can be rendered to Kubernetes manifests:

```bash
# Render to YAML
npx tsx examples/web-shop/index.tsx

# Or use the r8s CLI
r8s render examples/web-shop/index.tsx
```

## Validation

All examples are validated by:
1. TypeScript compilation
2. Rendering to YAML
3. Schema validation (coming soon: kind dry-run)

## Structure

Each example demonstrates:
- **Platform**: Cluster-level configuration (DNS, secrets, routing)
- **Auth**: Identity provider with realms and clients
- **Database**: PostgreSQL with automatic credentials
- **Apps**: Containerized applications with TLS and DNS
- **Storage**: Object storage, databases, caches
