export { renderToYaml } from './renderer'

/**
 * dist/index.js is the library export of @r8s/cli — executing it directly
 * does nothing and exits 0, which reads as "the CLI is broken". The real
 * binary is dist/cli.js (the package's `bin`), normally invoked as
 * `npx r8s <command>`. The typeof guards keep this module importable under
 * ESM/test runners where the CJS globals don't exist.
 */
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  console.error('This file is the @r8s/cli library export — there is nothing to run here.')
  console.error('The CLI binary is dist/cli.js — invoke it as `npx r8s <command>`.')
  process.exit(1)
}
