/**
 * Operator declarations re-exported from @r8s/crds.
 *
 * The canonical source is packages/crds/operators.yaml. These wrappers
 * exist for backwards compatibility with recipes that import from here.
 */
import { operators } from '@r8s/crds'

/** CloudNativePG operator declaration */
export const cnpgOperator = operators['cnpg']

/** NGINX Ingress Controller operator declaration (not in operators.yaml — nginx-specific) */
export const nginxIngressOperator = (version = '1.15.1') => ({
  name: 'nginx-ingress',
  description: 'NGINX Ingress Controller',
  source: {
    type: 'manifest' as const,
    url: `https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v${version}/deploy/static/provider/cloud/deploy.yaml`,
    version,
    namespace: 'ingress-nginx',
  },
  version,
  namespace: 'ingress-nginx',
  installCommand: `kubectl apply --server-side -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v${version}/deploy/static/provider/cloud/deploy.yaml`,
})

/** Vault Secrets Operator declaration */
export const vaultSecretsOperator = operators['vault-secrets-operator']
