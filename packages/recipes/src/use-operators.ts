import { useContext } from '@r8s/core'
import { OperatorContext } from '@r8s/core/defaults'
import type { Operator } from '@r8s/k8s-types'

/**
 * Read the operators the surrounding Platform already provides — the
 * dedupe-seed shared with every consumer's `declareIfMissing`.
 */
export function useOperators(): Operator[] {
  return useContext(OperatorContext)
}
