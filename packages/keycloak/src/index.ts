import { jsx, useContext } from '@r8s/core';
import { Keycloak, KeycloakRealmImport } from '@r8s/k8s-types';
import { DatabaseContext } from '@r8s/core/defaults';
import { olmOperator } from '@r8s/k8s-types';

/** Keycloak operator declaration (requires OLM) */
export const keycloakOperator = (version = '24.0.0') =>
  olmOperator('keycloak-operator', 'keycloak-operator', 'fast', version, {
    description: 'Keycloak identity and access management operator',
  });

export interface KeycloakInstanceProps {
  /** Resource name */
  name: string;
  /** Kubernetes namespace (defaults to 'default') */
  namespace?: string;
  /** Public hostname users reach Keycloak on (e.g., 'auth.example.com') */
  hostname: string;
  /** Number of Keycloak pod replicas */
  instances?: number;
  /** Name of the Kubernetes Secret holding the Keycloak TLS certificate */
  tlsSecretName?: string;
  /** Hostname of the external PostgreSQL database; auto-wired when wrapped in a Database component */
  dbHost?: string;
  /** PostgreSQL database name (defaults to 'keycloak') */
  dbName?: string;
  /** Kubernetes Secret holding the database username (used as { name, key }) */
  dbUsernameSecret?: { name: string; key: string };
  /** Kubernetes Secret holding the database password (used as { name, key }) */
  dbPasswordSecret?: { name: string; key: string };
  /** Ingress controller class (e.g., 'nginx') used to expose Keycloak */
  ingressClassName?: string;
}

/**
 * Keycloak identity provider with automatic database wiring.
 *
 * When placed inside a Database component, it auto-connects:
 * <Database name="keycloak-db" storage="10Gi">
 *   <KeycloakInstance name="keycloak" hostname="auth.example.com" />
 * </Database>
 *
 * Or provide explicit dbHost for external databases:
 * <KeycloakInstance name="keycloak" hostname="auth.example.com" dbHost="my-db-rw" />
 */
/**
 * Provisions a Keycloak identity provider instance with optional
 * database and ingress configuration.
 *
 * @example
 * <KeycloakInstance name="keycloak" hostname="auth.example.com" instances={2} />
 */
export function KeycloakInstance(props: KeycloakInstanceProps) {
  const {
    name,
    namespace = 'default',
    hostname,
    instances = 1,
    tlsSecretName,
    dbHost: explicitDbHost,
    dbName = 'keycloak',
    dbUsernameSecret: explicitUsernameSecret,
    dbPasswordSecret: explicitPasswordSecret,
    ingressClassName = 'nginx',
  } = props;

  // Auto-wire from DatabaseContext if available
  const dbContext = useContext(DatabaseContext);
  const dbHost = explicitDbHost ?? dbContext?.host;
  const dbPasswordSecretRef = dbContext?.passwordSecret;
  const dbUsernameSecret =
    explicitUsernameSecret ??
    (dbContext && dbPasswordSecretRef && {
      name: dbPasswordSecretRef.name,
      key: 'username',
    });
  const dbPasswordSecret =
    explicitPasswordSecret ??
    (dbContext && dbPasswordSecretRef && {
      name: dbPasswordSecretRef.name,
      key: dbContext.passwordKey || dbPasswordSecretRef.key || 'password',
    });

  const keycloak: Keycloak = {
    apiVersion: 'k8s.keycloak.org/v2alpha1',
    kind: 'Keycloak',
    metadata: { name, namespace },
    spec: {
      instances,
      hostname: {
        hostname,
        strict: false,
        strictBackchannel: false,
      },
      ...(tlsSecretName && {
        http: { tlsSecret: tlsSecretName },
      }),
      proxy: {
        headers: 'xforwarded',
      },
      ...(dbHost && {
        db: {
          vendor: 'postgres',
          host: dbHost,
          database: dbName,
          port: 5432,
          ...(dbUsernameSecret && { usernameSecret: dbUsernameSecret }),
          ...(dbPasswordSecret && { passwordSecret: dbPasswordSecret }),
        },
      }),
      ingress: {
        enabled: true,
        className: ingressClassName,
      },
      transaction: {
        xaEnabled: false,
      },
    },
  };

  return jsx('Keycloak', keycloak);
}

export interface KeycloakRealmProps {
  /** Resource name */
  name: string;
  /** Kubernetes namespace for the realm import — required */
  namespace: string;
  /** Name of the Keycloak instance this realm is imported into */
  keycloakName: string;
  /** Realm name inside Keycloak (e.g., 'my-company') */
  realmName: string;
  /** Human-readable name shown in the Keycloak UI */
  displayName?: string;
  /** Clients (applications) created inside this realm */
  clients?: Array<{
    clientId: string;
    name?: string;
    redirectUris?: string[];
    webOrigins?: string[];
    publicClient?: boolean;
    serviceAccountsEnabled?: boolean;
  }>;
  /** User accounts created inside this realm */
  users?: Array<{
    username: string;
    email?: string;
    password?: string;
    temporary?: boolean;
  }>;
}

/**
 * Creates a KeycloakRealmImport to bootstrap a realm with clients, users,
 * and roles into an existing Keycloak instance.
 *
 * @example
 * <KeycloakRealm name="my-realm" keycloakCRName="keycloak" realm="myapp" />
 */
export function KeycloakRealm(props: KeycloakRealmProps) {
  const { name, namespace, keycloakName, realmName, displayName, clients = [], users = [] } = props;

  const realmImport: KeycloakRealmImport = {
    apiVersion: 'k8s.keycloak.org/v2alpha1',
    kind: 'KeycloakRealmImport',
    metadata: { name, namespace },
    spec: {
      keycloakCRName: keycloakName,
      realm: {
        realm: realmName,
        enabled: true,
        ...(displayName && { displayName }),
        clients: clients.map((client) => ({
          clientId: client.clientId,
          name: client.name || client.clientId,
          enabled: true,
          clientAuthenticatorType: 'client-secret',
          redirectUris: client.redirectUris || ['/*'],
          webOrigins: client.webOrigins || ['/*'],
          standardFlowEnabled: true,
          implicitFlowEnabled: false,
          directAccessGrantsEnabled: true,
          serviceAccountsEnabled: client.serviceAccountsEnabled || false,
          publicClient: client.publicClient !== false,
          protocol: 'openid-connect',
        })),
        users: users.map((user) => ({
          username: user.username,
          enabled: true,
          ...(user.email && { email: user.email }),
          ...(user.password && {
            credentials: [
              {
                type: 'password',
                value: user.password,
                temporary: user.temporary || false,
              },
            ],
          }),
        })),
      },
    },
  };

  return jsx('KeycloakRealmImport', realmImport);
}
