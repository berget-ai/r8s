import { describe, it, expect } from 'vitest'
import { render, jsx } from '@r8s/core'
import { Auth } from '../src/index'
import { Realm, Realms, Clients, Client } from '../src/auth/index'

describe('Auth with hierarchical realms', () => {
  it('should create Keycloak with default settings', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
    })

    const result = render(element)
    const kinds = result.resources.map((r) => r.kind)

    expect(kinds).toContain('Keycloak')
    expect(kinds).toContain('Cluster')
    expect(kinds).toContain('Ingress')
  })

  it('should create KeycloakRealmImport when Realm is provided', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
      children: jsx(Realms, {
        children: jsx(Realm, {
          id: 'company',
          displayName: 'Company',
        }),
      }),
    })

    const result = render(element)
    const kinds = result.resources.map((r) => r.kind)

    expect(kinds).toContain('Keycloak')
    expect(kinds).toContain('KeycloakRealmImport')
  })

  it('should create realm with clients', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
      children: jsx(Realms, {
        children: jsx(Realm, {
          id: 'company',
          children: jsx(Clients, {
            children: [
              jsx(Client, {
                id: 'api',
                type: 'bearer-only',
              }),
              jsx(Client, {
                id: 'web',
                type: 'public',
                redirectUris: ['https://app.example.com/*'],
              }),
            ],
          }),
        }),
      }),
    })

    const result = render(element)
    const realmImport = result.resources.find((r) => r.kind === 'KeycloakRealmImport')

    expect(realmImport).toBeDefined()
    expect(realmImport.spec.realm.realm).toBe('company')
    expect(realmImport.spec.realm.clients).toHaveLength(2)
    expect(realmImport.spec.realm.clients[0].clientId).toBe('api')
    expect(realmImport.spec.realm.clients[0].bearerOnly).toBe(true)
    expect(realmImport.spec.realm.clients[1].clientId).toBe('web')
    expect(realmImport.spec.realm.clients[1].publicClient).toBe(true)
  })

  it('should create realm with identity provider', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
      children: jsx(Realms, {
        children: jsx(Realm, {
          id: 'company',
          identityProviders: [
            {
              alias: 'entra-id',
              displayName: 'Entra ID',
              providerId: 'oidc',
              enabled: true,
              trustEmail: true,
              config: {
                clientId: '${env:ENTRA_CLIENT_ID}',
                clientSecret: '${env:ENTRA_CLIENT_SECRET}',
              },
            },
          ],
        }),
      }),
    })

    const result = render(element)
    const realmImport = result.resources.find((r) => r.kind === 'KeycloakRealmImport')

    expect(realmImport).toBeDefined()
    expect(realmImport.spec.realm.identityProviders).toHaveLength(1)
    expect(realmImport.spec.realm.identityProviders[0].alias).toBe('entra-id')
    expect(realmImport.spec.realm.identityProviders[0].providerId).toBe('oidc')
  })

  it('should support multiple realms', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
      children: jsx(Realms, {
        children: [jsx(Realm, { id: 'internal' }), jsx(Realm, { id: 'customers' })],
      }),
    })

    const result = render(element)
    const realmImports = result.resources.filter((r) => r.kind === 'KeycloakRealmImport')

    expect(realmImports).toHaveLength(2)
    expect(realmImports[0].spec.realm.realm).toBe('internal')
    expect(realmImports[1].spec.realm.realm).toBe('customers')
  })

  it('should map client types correctly', () => {
    const element = jsx(Auth, {
      name: 'auth',
      host: 'auth.example.com',
      children: jsx(Realms, {
        children: jsx(Realm, {
          id: 'company',
          children: jsx(Clients, {
            children: [
              jsx(Client, { id: 'spa', type: 'public' }),
              jsx(Client, { id: 'backend', type: 'confidential', secret: '${env:SECRET}' }),
              jsx(Client, { id: 'api', type: 'bearer-only' }),
            ],
          }),
        }),
      }),
    })

    const result = render(element)
    const realmImport = result.resources.find((r) => r.kind === 'KeycloakRealmImport')
    const clients = realmImport.spec.realm.clients

    expect(clients[0].publicClient).toBe(true)
    expect(clients[0].standardFlowEnabled).toBe(true)

    expect(clients[1].publicClient).toBe(false)
    expect(clients[1].secret).toBe('${env:SECRET}')
    expect(clients[1].serviceAccountsEnabled).toBe(true)

    expect(clients[2].bearerOnly).toBe(true)
  })
})
