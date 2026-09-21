import type { Operator } from '@r8s/k8s-types'

/**
 * Fetch operator manifests from their source URLs.
 * Returns YAML strings that can be prepended to rendered output.
 */
export async function fetchOperatorManifests(operators: Operator[]): Promise<string[]> {
  const manifests: string[] = []

  for (const op of operators) {
    if (op.source.type !== 'manifest') {
      // Skip non-manifest operators (helm, olm, flux) — they need external tooling
      continue
    }

    // Multi-URL manifests (upstream kustomize splits) fetch in order first,
    // then the optional single url. Without either, nothing to fetch.
    const urls = [...(op.source.urls ?? []), ...(op.source.url ? [op.source.url] : [])]
    if (urls.length === 0) continue

    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText} (fetched ${url})`)
        }
        const yaml = await response.text()
        manifests.push(i === 0 ? `# Operator: ${op.name} v${op.version}\n${yaml}` : yaml)
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch operator manifest for ${op.name}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  return manifests
}
