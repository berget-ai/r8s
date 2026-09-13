import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { SecretContext } from '@r8s/core/defaults'
import { runGuardrails, noPlaintextSecrets, validateResource } from '@r8s/core'
import { Netbird } from '../src/index'

// Netbird package tests, aligned against the netbirdio/helms chart 1.9.0
// (appVersion 0.46.0) and its own nginx-ingress authentik example:
//   1. Flux HelmRepository (gh-pages index) + HelmRelease (pinned chart)
//   2. Single-host ingress topology with ONE shared TLS secret (dashboard
//      catch-all carries the cert-manager annotation)
//   3. management.json with {{ .VAR }} env placeholders (no plaintext)
//   4. CNPG DSN via <db>-app/fqdn-uri; CNPG-generated credentials
//   5. Secrets via backend with reference fallbacks + actionable errors

const openbao = { backend: 'openbao', mount: 'secret', path: 'apps' }
const baseIdp = {
  issuer: 'https://auth.example.com/realms/netbird',
  clientId: 'netbird',
}

function renderApp(props: Record<string, unknown> = {}) {
  return render(
    jsx(SecretContext.Provider, {
      value: openbao,
      children: jsx(Netbird, {
        host: 'netbird.example.com',
        idp: baseIdp,
        backup: false,
        dbInstances: 1,
        ...props,
      } as never),
    })
  )
}

const resource = (result: ReturnType<typeof render>, kind: string, name?: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result.resources.find((r: any) => r.kind === kind && (!name || r.metadata.name === name)) as any

describe('Netbird chart release', () => {
  it('renders the pinned Flux release against the netbirdio gh-pages index', () => {
    const repo = resource(renderApp(), 'HelmRepository')
    expect(repo.metadata.namespace).toBe('flux-system')
    expect(repo.spec.url).toBe('https://netbirdio.github.io/helms')
    expect(repo.spec.interval).toBe('24h')

    const rel = resource(renderApp(), 'HelmRelease')
    expect(rel.spec.chart.spec.chart).toBe('netbird')
    expect(rel.spec.chart.spec.version).toBe('1.9.0')
    expect(rel.spec.chart.spec.sourceRef).toEqual({
      kind: 'HelmRepository',
      name: 'netbird',
      namespace: 'flux-system',
    })
    expect(rel.spec.interval).toBe('30m')
  })

  it('pins all four images (core services to the chart appVersion, dashboard separately)', () => {
    const v = resource(renderApp(), 'HelmRelease').spec.values
    expect(v.management.image).toEqual({
      repository: 'netbirdio/management',
      tag: '0.46.0',
      pullPolicy: 'IfNotPresent',
    })
    expect(v.signal.image).toEqual({
      repository: 'netbirdio/signal',
      tag: '0.46.0',
      pullPolicy: 'IfNotPresent',
    })
    expect(v.relay.image).toEqual({
      repository: 'netbirdio/relay',
      tag: '0.46.0',
      pullPolicy: 'IfNotPresent',
    })
    expect(v.dashboard.image).toEqual({
      repository: 'netbirdio/dashboard',
      tag: 'v2.13.1',
      pullPolicy: 'IfNotPresent',
    })
    // imageTag follows the pinned core images
    expect(
      resource(renderApp({ imageTag: '0.78.1' }), 'HelmRelease').spec.values.management.image.tag
    ).toBe('0.78.1')
    expect(
      resource(renderApp({ imageTag: '0.78.1' }), 'HelmRelease').spec.values.dashboard.image.tag
    ).toBe('v2.13.1')
  })

  it('rejects floating chart and image tags', () => {
    expect(() => renderApp({ chartVersion: 'latest' })).toThrow(/requires a pinned chartVersion/)
    expect(() => renderApp({ imageTag: 'latest' })).toThrow(/requires a pinned imageTag/)
  })

  it('encodes the single-host ingress topology with one shared TLS secret', () => {
    const v = resource(renderApp(), 'HelmRelease').spec.values
    // cert-manager annotation ONLY on the dashboard catch-all — the other
    // ingresses reference the same secret (no duplicate issuances)
    expect(v.dashboard.ingress.annotations['cert-manager.io/cluster-issuer']).toBe(
      'letsencrypt-prod'
    )
    expect(v.management.ingress.annotations['cert-manager.io/cluster-issuer']).toBeUndefined()
    expect(v.management.ingressGrpc.annotations['cert-manager.io/cluster-issuer']).toBeUndefined()
    expect(v.signal.ingress.annotations['cert-manager.io/cluster-issuer']).toBeUndefined()
    expect(v.relay.ingress.annotations['cert-manager.io/cluster-issuer']).toBeUndefined()
    // every ingress references the same secret and carries external-dns
    for (const ingress of [
      v.management.ingress,
      v.management.ingressGrpc,
      v.signal.ingress,
      v.relay.ingress,
      v.dashboard.ingress,
    ]) {
      expect(ingress.enabled).toBe(true)
      expect(ingress.className).toBe('nginx')
      expect(ingress.tls).toEqual([{ secretName: 'netbird-tls', hosts: ['netbird.example.com'] }])
      expect(ingress.annotations['external-dns.alpha.kubernetes.io/hostname']).toBe(
        'netbird.example.com'
      )
    }
    // path routing: dashboard catch-all /, management /api, management gRPC,
    // signal exchange, relay
    expect(v.dashboard.ingress.hosts[0].paths[0].path).toBe('/')
    expect(v.management.ingress.hosts[0].paths[0].path).toBe('/api')
    expect(v.management.ingressGrpc.hosts[0].paths[0].path).toBe('/management.ManagementService')
    expect(v.signal.ingress.hosts[0].paths[0].path).toBe('/signalexchange.SignalExchange')
    expect(v.relay.ingress.hosts[0].paths[0].path).toBe('/relay')
    // gRPC backends need the nginx grpc mode + long timeouts
    expect(
      v.management.ingressGrpc.annotations['nginx.ingress.kubernetes.io/backend-protocol']
    ).toBe('GRPC')
    expect(v.signal.ingress.annotations['nginx.ingress.kubernetes.io/backend-protocol']).toBe(
      'GRPC'
    )
    expect(
      v.management.ingressGrpc.annotations['nginx.ingress.kubernetes.io/proxy-read-timeout']
    ).toBe('3600')
    // the chart's tested backwards-grpc wiring
    expect(v.management.useBackwardsGrpcService).toBe(true)
  })

  it('renders management.json with env placeholders, never secret values', () => {
    const v = resource(renderApp(), 'HelmRelease').spec.values
    const config = JSON.parse(v.management.configmap)
    // IdP endpoints derive from the issuer (Keycloak realm layout)
    expect(config.HttpConfig.AuthIssuer).toBe('{{ .NETBIRD_AUTH_ISSUER }}')
    expect(config.HttpConfig.OIDCConfigEndpoint).toBe(
      '{{ .NETBIRD_AUTH_OIDC_CONFIGURATION_ENDPOINT }}'
    )
    expect(v.management.env.NETBIRD_AUTH_JWT_CERTS).toBe(
      'https://auth.example.com/realms/netbird/protocol/openid-connect/certs'
    )
    expect(v.management.env.NETBIRD_AUTH_TOKEN_ENDPOINT).toBe(
      'https://auth.example.com/realms/netbird/protocol/openid-connect/token'
    )
    expect(v.management.env.IDP_CLIENT_ID).toBe('netbird')
    // keycloak IdP manager wires clientId + client secret placeholders
    expect(config.IdpManagerConfig.ManagerType).toBe('keycloak')
    expect(config.IdpManagerConfig.KeycloakClientCredentials.ClientID).toBe('{{ .IDP_CLIENT_ID }}')
    expect(config.IdpManagerConfig.KeycloakClientCredentials.ClientSecret).toBe(
      '{{ .IDP_CLIENT_SECRET }}'
    )
    expect(config.IdpManagerConfig.KeycloakClientCredentials.GrantType).toBe('client_credentials')
    // device + PKCE flows against the same issuer
    expect(config.DeviceAuthorizationFlow.Provider).toBe('hosted')
    expect(config.DeviceAuthorizationFlow.ProviderConfig.TokenEndpoint).toBe(
      '{{ .NETBIRD_AUTH_TOKEN_ENDPOINT }}'
    )
    expect(config.DeviceAuthorizationFlow.ProviderConfig.DeviceAuthEndpoint).toBe(
      'https://auth.example.com/realms/netbird/protocol/openid-connect/auth/device'
    )
    expect(config.PKCEAuthorizationFlow.ProviderConfig.AuthorizationEndpoint).toBe(
      'https://auth.example.com/realms/netbird/protocol/openid-connect/auth'
    )
    // relay + signal on the single host
    expect(config.Relay.Addresses).toEqual(['rels://netbird.example.com:443/relay'])
    expect(config.Relay.Secret).toBe('{{ .RELAY_PASSWORD }}')
    expect(config.Signal).toEqual({
      Proto: 'https',
      URI: 'netbird.example.com:443',
      Username: '',
      Password: '',
    })
    // postgres store; no STUN/TURN entries (chart ships no coturn)
    expect(config.StoreConfig).toEqual({ Engine: 'postgres' })
    expect(config.Stuns).toEqual([])
    expect(config.TURNConfig.Turns).toEqual([])
    // datastore encryption key is a placeholder, never a value
    expect(config.DataStoreEncryptionKey).toBe('{{ .DATASTORE_ENCRYPTION_KEY }}')
  })

  it('routes the store DSN from the CNPG-generated -app secret (fqdn-uri)', () => {
    const v = resource(renderApp(), 'HelmRelease').spec.values
    // envRaw carries structured valueFrom.secretKeyRef — plaintext-free by
    // construction; the DSN is the CNPG-generated <db>-app fqdn-uri
    const envRawByName = Object.fromEntries(
      v.management.envRaw.map((e: { name: string }) => [e.name, e.valueFrom.secretKeyRef]) as [
        string,
        { name: string; key: string },
      ][]
    )
    expect(envRawByName.NETBIRD_STORE_ENGINE_POSTGRES_DSN).toEqual({
      name: 'netbird-db-app',
      key: 'fqdn-uri',
    })
    // relay + datastore + idp secrets all reference their provisioned secrets
    expect(envRawByName.RELAY_PASSWORD).toEqual({
      name: 'netbird-credentials',
      key: 'relay-secret',
    })
    expect(envRawByName.DATASTORE_ENCRYPTION_KEY).toEqual({
      name: 'netbird-credentials',
      key: 'datastore-encryption-key',
    })
    expect(envRawByName.IDP_CLIENT_SECRET).toEqual({ name: 'netbird-oidc', key: 'client-secret' })
    // relay reads the same shared secret
    const relayEnv = Object.fromEntries(
      v.relay.envRaw.map((e: { name: string }) => [e.name, e.valueFrom.secretKeyRef]) as [
        string,
        { name: string; key: string },
      ][]
    )
    expect(relayEnv.NB_AUTH_SECRET).toEqual({ name: 'netbird-credentials', key: 'relay-secret' })
    expect(v.relay.env.NB_EXPOSED_ADDRESS).toBe('rels://netbird.example.com:443/relay')
    // dashboard points at the single host
    expect(v.dashboard.env.NETBIRD_MGMT_API_ENDPOINT).toBe('https://netbird.example.com')
    expect(v.dashboard.env.AUTH_AUTHORITY).toBe('https://auth.example.com/realms/netbird')
    expect(v.dashboard.env.AUTH_CLIENT_ID).toBe('netbird')
  })

  it('renders the CNPG cluster with netbird db/owner and cnpg credentialsMode', () => {
    const cluster = resource(renderApp(), 'Cluster')
    expect(cluster.metadata.name).toBe('netbird-db')
    expect(cluster.spec.instances).toBe(1)
    expect(cluster.spec.storage.size).toBe('10Gi')
    expect(cluster.spec.bootstrap.initdb.database).toBe('netbird')
    expect(cluster.spec.bootstrap.initdb.owner).toBe('netbird')
    expect(cluster.spec.bootstrap.initdb.secret).toBeUndefined()
    // CNPG generates netbird-db-app — the chart reads its fqdn-uri
  })

  it('disables the management PVC by default (postgres store) and honors storage', () => {
    // default: no PVC — the datadir is disposable with a postgres store
    expect(resource(renderApp(), 'HelmRelease').spec.values.management.persistentVolume).toEqual({
      enabled: false,
    })
    // explicit sizing keeps the chart's PVC
    expect(
      resource(renderApp({ storage: '5Gi' }), 'HelmRelease').spec.values.management.persistentVolume
    ).toMatchObject({ enabled: true, size: '5Gi' })
  })

  it('exposes the relay as a raw LoadBalancer only when relayPort is set', () => {
    // default: chart default ClusterIP (relay reached via ingress 443 only)
    expect(resource(renderApp(), 'HelmRelease').spec.values.relay.service).toBeUndefined()
    const lb = resource(renderApp({ relayPort: 3478 }), 'HelmRelease').spec.values.relay.service
    expect(lb).toEqual({ type: 'LoadBalancer', port: 3478, name: 'http' })
  })

  it('provisions the oidc + credentials secrets through the backend with restart targets', () => {
    const result = renderApp()
    const vsos = result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret') as {
      metadata: { name: string }
      spec: {
        path: string
        rolloutRestartTargets?: unknown[]
        destination: {
          name: string
          transformation: { templates: Record<string, { text: string }> }
        }
      }
    }[]
    const oidc = vsos.find((r) => r.metadata.name === 'netbird-oidc')
    expect(oidc).toBeDefined()
    expect(oidc?.spec.path).toBe('apps/netbird/oidc')
    expect(oidc?.spec.destination.name).toBe('netbird-oidc')
    expect(oidc?.spec.destination.transformation.templates['client-secret'].text).toBe(
      '{{ .Secrets.client_secret }}'
    )
    // rotation must reach the management deployment
    expect(oidc?.spec.rolloutRestartTargets).toEqual([
      { kind: 'Deployment', name: 'netbird-management' },
    ])
    const creds = vsos.find((r) => r.metadata.name === 'netbird-credentials')
    expect(creds).toBeDefined()
    expect(creds?.spec.destination.transformation.templates['relay-secret'].text).toBe(
      '{{ .Secrets.relay_secret }}'
    )
    expect(creds?.spec.destination.transformation.templates['datastore-encryption-key'].text).toBe(
      '{{ .Secrets.datastore_encryption_key }}'
    )
    // credentials rotate management AND relay (the relay secret travels to peers)
    const targets = creds?.spec.rolloutRestartTargets.map((t) => (t as { name: string }).name)
    expect(targets).toEqual(['netbird-management', 'netbird-relay'])
  })

  it('reference fallbacks skip provisioning', () => {
    const result = renderApp({
      idp: { ...baseIdp, clientSecretRef: 'existing-oidc' },
      credentialsSecretName: 'existing-credentials',
    })
    expect(result.resources.filter((r) => r.kind === 'OpenBaoStaticSecret')).toHaveLength(0)
    const v = resource(result, 'HelmRelease').spec.values
    const envRawByName = Object.fromEntries(
      v.management.envRaw.map((e: { name: string }) => [e.name, e.valueFrom.secretKeyRef]) as [
        string,
        { name: string; key: string },
      ][]
    )
    expect(envRawByName.IDP_CLIENT_SECRET).toEqual({ name: 'existing-oidc', key: 'client-secret' })
    expect(envRawByName.RELAY_PASSWORD).toEqual({
      name: 'existing-credentials',
      key: 'relay-secret',
    })
    expect(envRawByName.DATASTORE_ENCRYPTION_KEY).toEqual({
      name: 'existing-credentials',
      key: 'datastore-encryption-key',
    })
  })

  it('throws an actionable error without a backend and without pre-created refs', () => {
    const noBackend = () =>
      render(
        jsx(SecretContext.Provider, {
          value: { backend: 'manual-secrets' },
          children: jsx(Netbird, {
            host: 'netbird.example.com',
            idp: baseIdp,
            backup: false,
          } as never),
        })
      )
    expect(noBackend).toThrow(/Netbird "netbird" requires/)
    expect(noBackend).toThrow(/idp\.clientSecretRef/)
  })

  it('renders without a secrets backend when every secret is pre-created', () => {
    const result = render(
      jsx(Netbird, {
        host: 'netbird.example.com',
        idp: { ...baseIdp, clientSecretRef: 'netbird-oidc' },
        credentialsSecretName: 'netbird-credentials',
        backup: false,
      } as never)
    )
    const release = resource(result, 'HelmRelease')
    expect(release).toBeDefined()
    const envRawByName = Object.fromEntries(
      release.spec.values.management.envRaw.map((e: { name: string }) => [
        e.name,
        e.valueFrom.secretKeyRef,
      ]) as [string, { name: string; key: string }][]
    )
    expect(envRawByName.NETBIRD_STORE_ENGINE_POSTGRES_DSN).toEqual({
      name: 'netbird-db-app',
      key: 'fqdn-uri',
    })
    expect(resource(result, 'Cluster')).toBeDefined()
  })

  it('rejects a non-quantity storage prop', () => {
    expect(() => renderApp({ storage: 'big-volume' })).toThrow(/Kubernetes quantity/)
  })

  it('produces valid, plaintext-free manifests', () => {
    const result = renderApp()
    for (const r of result.resources) {
      expect(validateResource(r)).toEqual([])
    }
    expect(runGuardrails(result.resources as never, [noPlaintextSecrets]).passed).toBe(true)
  })
})
