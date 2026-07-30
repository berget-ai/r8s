import { packages } from '../../../data/packages'

// Prerender every package page at build time — the data is generated
// by scripts/generate-docs.ts before `vike build` runs.
export function onBeforePrerenderStart() {
  return packages.map((pkg) => `/packages/${pkg.slug}`)
}
