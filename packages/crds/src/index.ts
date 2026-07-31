/**
 * @r8s/crds — Generated TypeScript types and components from upstream CRDs.
 *
 * Types are 1:1 with the CRD OpenAPI v3 schemas. Components are thin
 * wrappers that set apiVersion/kind and pass metadata + spec through.
 *
 * Import per API group to avoid name collisions between groups:
 *
 *   import { Cluster, ClusterComponent } from '@r8s/crds/postgresql'
 *   import { Certificate } from '@r8s/crds/cert-manager'
 *
 * Operator declarations (from operators.yaml):
 *
 *   import { operators } from '@r8s/crds'
 *   operators['cnpg']('1.27.0')
 */
export * from './generated/index'
