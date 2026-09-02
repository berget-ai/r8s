import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')

const join = path.join
const relative = path.relative

/**
 * Directories scanned for hardcoded credentials. Rendered manifest
 * output (dist/, rendered/, node_modules) is excluded.
 */
const SCAN_DIRS = ['examples', 'k8s', 'packages']
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.yaml', '.yml', '.json'])
const EXCLUDED_DIRS = new Set([
  'node_modules',
  'dist',
  'rendered',
  'test-temp',
  'test-temp',
  '__tests__',
  '.git',
  'coverage',
])

const CODE_EXTENSIONS = new Set(['.ts', '.tsx'])

/**
 * Credential assignments with literal string values. Values that are
 * deploy-time interpolations (`$(VAR)`, `${env:VAR}`) are excluded via
 * the leading-`$` guard in the value group.
 */
const SUSPICIOUS_ASSIGNMENT =
  /\b(password|passwd|dbPassword|rootPassword|adminPassword|api_key|apiKey|access_key|secret_key|client_secret)\s*[:=]\s*['"][^$'"][^'"]{3,}['"]/i

/**
 * Connection strings with an embedded password. The negative lookahead
 * leaves runtime-expanded credentials (`postgresql://u:$(PGPASSWORD)@…`,
 * backtick templates) alone — the credential is injected in-cluster.
 */
const SUSPICIOUS_CONNECTION_STRING =
  /['"`][a-z][a-z0-9+.-]*:\/\/[^'"`\s:@/]+:(?!\$\()[^'"`\s@]{3,}@[^'"`\s]*['"`]/i

const KNOWN_PLACEHOLDER_VALUES = /\b(supersecret|staging-password|admin-password)\b/

/** Sealed-secret ciphertext slots — intentionally left for the user to fill with kubeseal. */
const SEALED_PLACEHOLDER_ASSIGNMENT = /\b(password|passwd)\s*[:=]\s*['"]REPLACE_WITH_/
/** Lines that are comments or doc prose never count as live values. */
function isCommentLine(line: string, ext: string): boolean {
  const trimmed = line.trim()
  if (CODE_EXTENSIONS.has(ext)) {
    return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')
  }
  return trimmed.startsWith('#')
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      walk(join(dir, entry.name), out)
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(join(dir, entry.name))
    }
  }
  return out
}

function findSecrets(): string[] {
  const findings: string[] = []

  for (const scanDir of SCAN_DIRS) {
    const files = walk(join(ROOT, scanDir))
    for (const file of files) {
      const ext = path.extname(file)
      const relPath = relative(ROOT, file)
      const lines = readFileSync(file, 'utf-8').split('\n')

      lines.forEach((line, i) => {
        if (isCommentLine(line, ext)) return

        const quotedValues = [...line.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
        const location = `${relPath}:${i + 1}`
        if (SUSPICIOUS_ASSIGNMENT.test(line) && !SEALED_PLACEHOLDER_ASSIGNMENT.test(line)) {
          findings.push(
            `${location}: hardcoded credential assignment: ${line.trim().slice(0, 120)}`
          )
        }
        if (SUSPICIOUS_CONNECTION_STRING.test(line)) {
          findings.push(`${location}: connection string with embedded password in literals`)
        }
        if (KNOWN_PLACEHOLDER_VALUES.test(line) && quotedValues.length > 0) {
          findings.push(
            `${location}: known placeholder credential value used: ${line.trim().slice(0, 120)}`
          )
        }
      })
    }
  }

  return findings
}

describe('secret hygiene', () => {
  it('has no hardcoded credentials in source examples, k8s manifests, or packages', () => {
    const findings = findSecrets()
    if (findings.length > 0) {
      console.error('Hardcoded credential findings:\n' + findings.join('\n'))
    }
    expect(findings).toEqual([])
  })

  it('scans at least the well-known example entry files', () => {
    const scanned = walk(join(ROOT, 'examples'))
    const names = scanned.map((f) => relative(ROOT, f))
    expect(names).toContain(join('examples', 'basic-app', 'k8s', 'r8s.tsx'))
    expect(names).toContain(join('examples', 'saas-platform', 'index.tsx'))
    expect(scanned.length).toBeGreaterThan(5)
  })
})
