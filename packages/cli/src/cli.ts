#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'
import { renderToYaml } from './renderer'

interface CliOptions {
  entry?: string
  out?: string
  help?: boolean
  template?: string
  operators?: string
  strategy?: 'github-actions' | 'flux-controller'
  includeOperators?: boolean
  operatorsOnly?: boolean
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--entry' || arg === '-e') {
      options.entry = args[++i]
    } else if (arg === '--out' || arg === '-o') {
      options.out = args[++i]
    } else if (arg === '--template' || arg === '-t') {
      options.template = args[++i]
    } else if (arg === '--operators') {
      options.operators = args[++i]
    } else if (arg === '--strategy' || arg === '-s') {
      options.strategy = args[++i] as 'github-actions' | 'flux-controller'
    } else if (arg === '--include-operators') {
      options.includeOperators = true
    } else if (arg === '--operators-only') {
      options.operatorsOnly = true
    } else if (arg === '--help' || arg === '-h') {
      options.help = true
    }
  }

  return options
}

function showHelp(): void {
  console.log(`
r8s CLI - Render TSX components to Kubernetes YAML

Usage: r8s [command] [options]

Commands:
  render     Render k8s/r8s.tsx to YAML (default)
  operators  Render only operator manifests
  init       Scaffold a new r8s project
  list       List all available components and operators
  info       Show props and example for a component (e.g. r8s info App)
  context    Print a compact LLM context blob (component model + workflow)
  search     Search npm for r8s community recipes (e.g. r8s search database)
  add        Install a community recipe from npm (e.g. r8s add @acme/r8s-redis)
  preview    Render a component with dummy defaults to see output (e.g. r8s preview App)
  explain    Show resources and operators a component creates (e.g. r8s explain App)
  validate   Type-check and validate rendered output (e.g. r8s validate infra.tsx)

Options:
  --entry, -e <path>     Entry file path (default: k8s/r8s.tsx)
  --out, -o <path>       Output file path (default: stdout)
  --include-operators    Include operator manifests in rendered output
  --operators-only       Render only operator manifests (with render command)
  --template, -t <name>  Template for init (basic, fullstack) [default: basic]
  --operators <list>     Comma-separated list of operators to include
  --strategy, -s <name>  Deployment strategy:
                         - github-actions: Render YAML in CI (default)
                         - flux-controller: Keep .tsx files, render in-cluster
  --help, -h             Show this help message

Examples:
  r8s render
  r8s render --entry ./infra/manifest.tsx
  r8s render --out ./output/k8s.yaml --include-operators
  r8s operators --out ./operators.yaml
  r8s init
  r8s init my-project
  r8s init my-project --template fullstack
  r8s init my-project --strategy flux-controller
  r8s init my-project --operators cert-manager,openbao
  r8s list
  r8s info App
  r8s info Database
  r8s context
  r8s search database
  r8s add @acme/r8s-redis
  r8s preview App
  r8s explain App
  r8s validate infra.tsx
`)
}

async function findEntryFile(entryPath?: string): Promise<string> {
  if (entryPath) {
    const resolved = resolve(entryPath)
    if (!existsSync(resolved)) {
      throw new Error(`Entry file not found: ${resolved}`)
    }
    return resolved
  }

  const defaults = ['k8s/r8s.tsx', 'k8s/r8s.tsx', 'k8s/index.tsx', 'infra/r8s.tsx']

  for (const defaultPath of defaults) {
    const resolved = resolve(defaultPath)
    if (existsSync(resolved)) {
      return resolved
    }
  }

  throw new Error(
    'No entry file found. Expected one of:\n' +
      defaults.map((d) => `  - ${d}`).join('\n') +
      '\n\nUse --entry to specify a custom path.'
  )
}

const VALID_OPERATORS = [
  'cert-manager',
  'openbao',
  'keycloak',
  'external-dns',
  'redis',
  'envoy',
  'prometheus',
  'clickhouse',
  'logging-operator',
  'loki',
]

async function initProject(
  projectName: string,
  template: string,
  strategy: 'github-actions' | 'flux-controller' = 'github-actions',
  operators?: string[]
): Promise<void> {
  const projectDir = resolve(projectName)

  if (existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists`)
  }

  // Validate operators if provided
  if (operators && operators.length > 0) {
    const invalid = operators.filter((op) => !VALID_OPERATORS.includes(op))
    if (invalid.length > 0) {
      throw new Error(
        `Invalid operators: ${invalid.join(', ')}. ` +
          `Valid operators are: ${VALID_OPERATORS.join(', ')}`
      )
    }
  }

  console.log(`Creating r8s project: ${projectName}`)
  console.log(`Deployment strategy: ${strategy}`)

  // Create directory structure
  mkdirSync(join(projectDir, 'k8s'), { recursive: true })

  // Create package.json
  const dependencies: Record<string, string> = {
    '@r8s/core': '^0.1.0',
    '@r8s/recipes': '^0.1.0',
  }

  // Add operator packages if requested
  if (operators) {
    for (const op of operators) {
      dependencies[`@r8s/${op}`] = '^0.1.0'
    }
  }

  const scripts: Record<string, string> = {}
  if (strategy === 'github-actions') {
    scripts['render-k8s'] = 'r8s render'
  }

  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts,
    dependencies,
    devDependencies: {
      '@r8s/cli': '^0.1.0',
      typescript: '^5.3.0',
    },
  }

  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  )

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      jsx: 'react-jsx',
      jsxImportSource: '@r8s/core',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['k8s/**/*'],
  }

  writeFileSync(
    join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2) + '\n',
    'utf-8'
  )

  // Create k8s/r8s.tsx based on template
  let r8sContent: string

  if (template === 'fullstack') {
    r8sContent = generateFullstackTemplate(strategy)
  } else {
    r8sContent = generateBasicTemplate(strategy)
  }

  writeFileSync(join(projectDir, 'k8s', 'r8s.tsx'), r8sContent, 'utf-8')

  // Create .gitignore
  const gitignore =
    strategy === 'github-actions'
      ? `node_modules/
dist/
# Ignore rendered manifests except in k8s directory
*.yaml
!k8s/*.yaml
!.github/
`
      : `node_modules/
dist/
# Keep .tsx files, Flux renders them in-cluster
*.yaml
!k8s/*.yaml
!.github/
!flux/
`

  writeFileSync(join(projectDir, '.gitignore'), gitignore, 'utf-8')

  // Create deployment strategy files
  if (strategy === 'github-actions') {
    createGitHubActionsWorkflow(projectDir)
  } else {
    createFluxControllerFiles(projectDir, projectName)
  }

  // Create README.md
  const readme = generateReadme(projectName, strategy)

  writeFileSync(join(projectDir, 'README.md'), readme, 'utf-8')

  console.log(`\n✅ Project created: ${projectName}`)
  console.log(`\nDeployment strategy: ${strategy}`)

  if (strategy === 'github-actions') {
    console.log(`\nNext steps:`)
    console.log(`  cd ${projectName}`)
    console.log(`  npm install`)
    console.log(`  npm run render-k8s`)
    console.log(`\nGitHub Actions will auto-render on push to main.`)
  } else {
    console.log(`\nNext steps:`)
    console.log(`  cd ${projectName}`)
    console.log(`  npm install`)
    console.log(`  git init && git add . && git commit -m "init"`)
    console.log(`  # Push to a Git repository`)
    console.log(`  # Configure FluxCD to point to your repo`)
    console.log(`\nFluxCD will render .tsx files in-cluster.`)
    console.log(`See flux/ directory for example manifests.`)
  }
}

function generateBasicTemplate(strategy: string): string {
  const fluxComment =
    strategy === 'flux-controller'
      ? `// This file stays as .tsx - FluxCD renders it in-cluster via r8s-controller\n`
      : ''

  return `${fluxComment}import { App } from '@r8s/recipes';

export default () => (
  <App
    name="myapp"
    image="myapp/web:v1.2.3"
    host="myapp.example.com"
  />
);
`
}

function generateFullstackTemplate(strategy: string): string {
  const fluxComment =
    strategy === 'flux-controller'
      ? `// This file stays as .tsx - FluxCD renders it in-cluster via r8s-controller\n`
      : ''

  return `${fluxComment}import { App, Database } from '@r8s/recipes';

export default () => (
  <>
    <Database
      name="app-db"
      namespace="production"
      storage="10Gi"
    />

    <App
      name="api"
      namespace="production"
      image="myapp/api:v1.2.3"
      port={3000}
      host="api.example.com"
      replicas={3}
      tls={{ secretName: 'api-tls', clusterIssuer: 'letsencrypt' }}
      env={{ LOG_LEVEL: 'info' }}
      secrets={{ DATABASE_URL: 'api-secrets' }}
    />

    <App
      name="frontend"
      namespace="production"
      image="myapp/frontend:v1.2.3"
      port={80}
      host="app.example.com"
      replicas={2}
      tls={{ secretName: 'app-tls', clusterIssuer: 'letsencrypt' }}
    />
  </>
);
`
}

function createGitHubActionsWorkflow(projectDir: string): void {
  mkdirSync(join(projectDir, '.github', 'workflows'), { recursive: true })

  const workflowContent = `name: Render Kubernetes Manifests

on:
  push:
    branches: [main, master]
    paths:
      - 'k8s/**'
      - 'package.json'
      - 'package-lock.json'
  pull_request:
    branches: [main, master]
    paths:
      - 'k8s/**'

jobs:
  render:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Render Kubernetes manifests
        run: npx r8s render --out k8s/manifest.yaml

      - name: Check for changes
        id: git-check
        run: |
          git diff --quiet k8s/manifest.yaml || echo "changed=true" >> \$GITHUB_OUTPUT

      - name: Commit rendered manifests
        if: steps.git-check.outputs.changed == 'true' && github.event_name == 'push'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add k8s/manifest.yaml
          git commit -m "chore: render kubernetes manifests [skip ci]"
          git push
`

  writeFileSync(join(projectDir, '.github', 'workflows', 'render.yaml'), workflowContent, 'utf-8')
}

function createFluxControllerFiles(projectDir: string, projectName: string): void {
  // Create flux/ directory with example manifests
  mkdirSync(join(projectDir, 'flux'), { recursive: true })

  const gitRepository = `apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ${projectName}
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/your-org/${projectName}
  ref:
    branch: main
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ${projectName}
  namespace: flux-system
spec:
  interval: 10m
  path: ./k8s/rendered
  prune: true
  sourceRef:
    kind: GitRepository
    name: ${projectName}
`

  writeFileSync(join(projectDir, 'flux', 'gitrepository.yaml'), gitRepository, 'utf-8')

  const webhook = `apiVersion: notification.toolkit.fluxcd.io/v1
kind: Receiver
metadata:
  name: ${projectName}-webhook
  namespace: flux-system
spec:
  type: github
  events:
    - ping
    - push
  secretRef:
    name: ${projectName}-webhook-token
  resources:
    - apiVersion: source.toolkit.fluxcd.io/v1
      kind: GitRepository
      name: ${projectName}
      namespace: flux-system
---
apiVersion: v1
kind: Secret
metadata:
  name: ${projectName}-webhook-token
  namespace: flux-system
type: Opaque
stringData:
  token: "replace-me-with-20-char-random-string"
`

  writeFileSync(join(projectDir, 'flux', 'webhook.yaml'), webhook, 'utf-8')

  const readme = `# FluxCD Setup for ${projectName}

## Prerequisites

1. FluxCD installed on your cluster
2. r8s-controller image available (or build your own)

## Setup

### 1. Configure FluxCD

Apply the manifests in this directory:

\`\`\`bash
kubectl apply -f flux/gitrepository.yaml
kubectl apply -f flux/webhook.yaml
\`\`\`

### 2. Configure GitHub Webhook

1. Go to your repository → Settings → Webhooks
2. Add webhook:
   - Payload URL: \`https://flux-webhook.yourdomain.com/hook/flux-system/${projectName}-webhook\`
   - Content type: \`application/json\`
   - Secret: (the token from flux/webhook.yaml)
   - Events: Push

### 3. Configure r8s-controller

The r8s-controller runs as an init container in the Flux source-controller.

See https://github.com/berget-ai/r8s/tree/main/packages/flux-controller for setup instructions.

## How It Works

1. You push .tsx files to git
2. GitHub webhook triggers Flux reconciliation
3. Flux clones repo to /data
4. r8s-controller renders TSX → YAML to /data/rendered
5. Flux Kustomization applies rendered YAML

## Local Development

\`\`\`bash
# Render locally for testing
npm install
npx r8s render --out k8s/manifest.yaml
\`\`\`
`

  writeFileSync(join(projectDir, 'flux', 'README.md'), readme, 'utf-8')
}

function generateReadme(projectName: string, strategy: string): string {
  if (strategy === 'github-actions') {
    return `# ${projectName}

Generated with r8s (GitHub Actions strategy).

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Render Kubernetes manifests locally
npm run render-k8s

# Or use the CLI directly
npx r8s render
npx r8s render --out k8s/manifest.yaml
\`\`\`

## Project Structure

\`\`\`
.
├── .github/
│   └── workflows/
│       └── render.yaml   # Auto-render on push
├── k8s/
│   ├── r8s.tsx          # Your Kubernetes components
│   └── manifest.yaml     # Generated YAML (auto-committed)
├── package.json
└── tsconfig.json
\`\`\`

## Deployment Strategy: GitHub Actions

This project uses **GitHub Actions** to render TSX → YAML:

1. You edit \`k8s/r8s.tsx\` and push to \`main\`
2. GitHub Actions renders the TSX to \`k8s/manifest.yaml\`
3. The rendered YAML is committed back to the repository
4. Your GitOps tool (Flux, ArgoCD) picks up the YAML and applies it

## Learn More

- [r8s Documentation](https://github.com/berget-ai/r8s)
- [FluxCD Integration](https://github.com/berget-ai/r8s/tree/main/packages/flux-controller)
`
  } else {
    return `# ${projectName}

Generated with r8s (Flux Controller strategy).

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Render locally for testing
npx r8s render --out k8s/manifest.yaml
\`\`\`

## Project Structure

\`\`\`
.
├── flux/
│   ├── gitrepository.yaml   # Flux GitRepository manifest
│   ├── webhook.yaml         # Webhook receiver for instant sync
│   └── README.md           # Flux setup instructions
├── k8s/
│   └── r8s.tsx            # Your Kubernetes components (kept as .tsx)
├── package.json
└── tsconfig.json
\`\`\`

## Deployment Strategy: Flux Controller

This project uses **FluxCD with r8s-controller** to render TSX → YAML in-cluster:

1. You edit \`k8s/r8s.tsx\` and push to \`main\`
2. GitHub webhook triggers Flux reconciliation (instant)
3. Flux clones repo to /data
4. r8s-controller (init container) renders TSX → YAML to /data/rendered
5. Flux Kustomization applies rendered YAML to cluster

## Benefits

- **No CI build step** — rendering happens in-cluster
- **Git is source of truth** — only .tsx files in repo
- **Instant updates** — webhook triggers reconciliation immediately
- **Type safety** — catch errors at build time

## Setup

See \`flux/README.md\` for detailed setup instructions.

## Learn More

- [r8s Documentation](https://github.com/berget-ai/r8s)
- [FluxCD Controller](https://github.com/berget-ai/r8s/tree/main/packages/flux-controller)
- [FluxCD Webhooks](https://github.com/berget-ai/r8s/tree/main/packages/flux-controller/WEBHOOKS.md)
`
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  if (options.help) {
    showHelp()
    process.exit(0)
  }

  const command = args[0] || 'render'

  if (command === 'init') {
    const projectName = args[1] || 'r8s-app'
    const template = options.template || 'basic'
    const strategy = options.strategy || 'github-actions'
    const operators = options.operators
      ?.split(',')
      .map((op) => op.trim())
      .filter(Boolean)

    if (strategy !== 'github-actions' && strategy !== 'flux-controller') {
      console.error(`Invalid strategy: ${strategy}. Valid: github-actions, flux-controller`)
      process.exit(1)
    }

    try {
      await initProject(projectName, template, strategy, operators)
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
    return
  }

  if (command === 'operators') {
    try {
      const entryFile = await findEntryFile(options.entry)
      console.error(`Rendering operators from: ${entryFile}`)

      const { renderToOperatorsYaml } = await import('./renderer.js')
      const yamlOutput = await renderToOperatorsYaml(entryFile)

      if (options.out) {
        const { writeFileSync, mkdirSync } = await import('fs')
        const { dirname } = await import('path')
        mkdirSync(dirname(resolve(options.out)), { recursive: true })
        writeFileSync(resolve(options.out), yamlOutput, 'utf-8')
        console.error(`Output written to: ${resolve(options.out)}`)
      } else {
        console.log(yamlOutput)
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
    return
  }

  if (command === 'list') {
    const { allComponents, operators } = await import('./catalog.js')
    const comps = allComponents()
    console.log('\nComponents:\n')
    const byCat = new Map<string, typeof comps>()
    for (const c of comps) {
      const arr = byCat.get(c.category) ?? []
      arr.push(c)
      byCat.set(c.category, arr)
    }
    for (const [cat, items] of byCat) {
      console.log(`  ${cat}:`)
      for (const c of items) {
        console.log(`    ${c.name.padEnd(12)} ${c.package.padEnd(20)} ${c.description}`)
      }
      console.log()
    }
    console.log('Operators:\n')
    for (const op of operators) {
      console.log(`    ${op.name.padEnd(24)} ${op.description}`)
    }
    console.log('\nUse "r8s info <name>" for props and examples.')
    return
  }

  if (command === 'info') {
    const name = args[1]
    if (!name) {
      console.error('Usage: r8s info <component-name>')
      console.error('Example: r8s info App')
      process.exit(1)
    }
    const { findComponent } = await import('./catalog.js')
    const comp = findComponent(name)
    if (!comp) {
      console.error(`Component not found: ${name}`)
      console.error('Use "r8s list" to see available components.')
      process.exit(1)
    }
    console.log(`\n${comp.name} (${comp.package})`)
    console.log(`${comp.category}`)
    console.log(`\n${comp.description}\n`)
    console.log('Props:')
    for (const p of comp.props) {
      const req = p.required ? 'required' : 'optional'
      const def = p.default ? ` [default: ${p.default}]` : ''
      console.log(`  ${p.name.padEnd(16)} ${p.type.padEnd(36)} ${req}${def}`)
      console.log(`  ${' '.repeat(18)}${p.description}`)
    }
    console.log('\nExample:')
    console.log(`  ${comp.example}`)
    return
  }

  if (command === 'context') {
    const { allComponents, operators } = await import('./catalog.js')
    const comps = allComponents()
    console.log('# r8s context for LLMs\n')
    console.log('## Workflow')
    console.log('1. Write TSX that default-exports a JSX element')
    console.log('2. Run: r8s render --entry <file.tsx> --out <file.yaml>')
    console.log('3. Commit the YAML. GitOps (FluxCD/ArgoCD) applies it.')
    console.log('4. Never hand-edit YAML — change TSX and re-render.\n')
    console.log('## Rules')
    console.log('- Lowercase elements (<deployment>, <service>) are raw K8s resources.')
    console.log('- PascalCase elements (<App>, <Database>) are recipe components.')
    console.log('- Components are TypeScript functions — testable with render() + vitest.')
    console.log('- Entry file must default-export a JSX element or function.\n')
    console.log('## Components\n')
    for (const c of comps) {
      const required = c.props.filter((p) => p.required).map((p) => `${p.name}: ${p.type}`)
      console.log(`${c.name} (${c.package}) — ${c.description}`)
      console.log(`  Required: ${required.join(', ') || 'none'}`)
      console.log(`  Example: ${c.example.replace(/\n/g, ' ')}`)
      console.log()
    }
    console.log('## Operators (auto-declared by recipes)')
    for (const op of operators) {
      console.log(`  ${op.name} — ${op.description}`)
    }
    console.log('\n## Commands')
    console.log('  r8s init [name]              Scaffold a project')
    console.log('  r8s render --entry f.tsx      Render to stdout')
    console.log('  r8s render --out k8s.yaml     Render to file')
    console.log('  r8s list                      List all components')
    console.log('  r8s info <name>               Show props for a component')
    console.log('  r8s preview <name>            Render a component with dummy props')
    console.log('  r8s explain <name>            Show resources + operators a component creates')
    console.log('  r8s validate <file.tsx>       Type-check + reference-check')
    console.log('  r8s search <term>             Search npm for community recipes')
    console.log('  r8s add <package>             Install a community recipe from npm')
    console.log('  r8s context                   This output')
    return
  }

  if (command === 'search') {
    const term = args.slice(1).join(' ')
    if (!term) {
      console.error('Usage: r8s search <term>')
      console.error('Example: r8s search database')
      process.exit(1)
    }
    console.log(`Searching npm for r8s recipes matching "${term}"...\n`)
    try {
      const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(`keywords:r8s ${term}`)}&size=25`
      const res = await fetch(url)
      const data: any = await res.json()
      if (!data.objects || data.objects.length === 0) {
        console.log('No packages found.')
        console.log('\nTo publish a recipe, add "r8s" to the keywords in package.json.')
        return
      }
      console.log('Package                         Version    Description')
      console.log('─'.repeat(80))
      for (const obj of data.objects) {
        const pkg = obj.package
        const name = pkg.name.padEnd(30)
        const version = pkg.version.padEnd(10)
        const desc = (pkg.description ?? '').substring(0, 38)
        console.log(`${name} ${version} ${desc}`)
      }
      console.log(`\n${data.total} package(s) found.`)
      console.log('Install with: r8s add <package-name>')
    } catch (error) {
      console.error('Search failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
    return
  }

  if (command === 'add') {
    const packageName = args[1]
    if (!packageName) {
      console.error('Usage: r8s add <package-name>')
      console.error('Example: r8s add @acme/r8s-redis')
      process.exit(1)
    }
    console.log(`Installing ${packageName}...`)
    const { execSync } = await import('child_process')
    try {
      execSync(`npm install ${packageName}`, { stdio: 'inherit' })
      console.log(`\n✅ ${packageName} installed.`)
      console.log(`Import components in your TSX:`)
      console.log(`  import { MyComponent } from '${packageName}'`)
    } catch (error) {
      console.error('Install failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
    return
  }

  if (command === 'preview') {
    const name = args[1]
    if (!name) {
      console.error('Usage: r8s preview <component-name>')
      console.error('Example: r8s preview App')
      process.exit(1)
    }
    const { findComponent } = await import('./catalog.js')
    const comp = findComponent(name)
    if (!comp) {
      console.error(`Component not found: ${name}`)
      console.error('Use "r8s list" to see available components.')
      process.exit(1)
    }
    // Build a TSX file that renders the component with dummy required props
    const requiredProps = comp.props.filter((p) => p.required)
    const dummyValues: Record<string, string> = {
      name: '"example"',
      image: '"example/app:v1"',
      host: '"example.com"',
      serviceName: '"example"',
      children: 'null',
      selector: '{ app: "example" }',
    }
    const propsStr = requiredProps
      .map((p) => `${p.name}={${dummyValues[p.name] ?? '"dummy"'}}`)
      .join(' ')
    const tsx = `import { ${comp.name} } from '${comp.package}'\nexport default <${comp.name} ${propsStr} />\n`
    const tmpFile = resolve(`.r8s-preview-${Date.now()}.tsx`)
    writeFileSync(tmpFile, tsx, 'utf-8')
    try {
      const { renderToYaml } = await import('./renderer.js')
      const yaml = await renderToYaml(tmpFile)
      console.log(`# Preview of ${comp.name} with dummy required props\n`)
      console.log(yaml)
    } catch (error) {
      console.error('Preview failed:', error instanceof Error ? error.message : error)
      console.error('\nThis component may require a Platform context or specific props.')
      process.exit(1)
    } finally {
      try {
        require('fs').unlinkSync(tmpFile)
      } catch {}
    }
    return
  }

  if (command === 'explain') {
    const name = args[1]
    if (!name) {
      console.error('Usage: r8s explain <component-name>')
      console.error('Example: r8s explain App')
      process.exit(1)
    }
    const { findComponent, operators } = await import('./catalog.js')
    const comp = findComponent(name)
    if (!comp) {
      console.error(`Component not found: ${name}`)
      process.exit(1)
    }
    console.log(`\n${comp.name} (${comp.package})`)
    console.log(`${comp.description}\n`)
    // Render with dummy props to discover what resources it creates
    const requiredProps = comp.props.filter((p) => p.required)
    const dummyValues: Record<string, string> = {
      name: '"example"',
      image: '"example/app:v1"',
      host: '"example.com"',
      serviceName: '"example"',
      children: 'null',
      selector: '{ app: "example" }',
    }
    const propsStr = requiredProps
      .map((p) => `${p.name}={${dummyValues[p.name] ?? '"dummy"'}}`)
      .join(' ')
    const tsx = `import { ${comp.name} } from '${comp.package}'\nexport default <${comp.name} ${propsStr} />\n`
    const tmpFile = resolve(`.r8s-explain-${Date.now()}.tsx`)
    writeFileSync(tmpFile, tsx, 'utf-8')
    try {
      const { bundleAndRender } = await import('./renderer.js')
      const result = await bundleAndRender(tmpFile)
      console.log('Resources created:')
      for (const r of result.resources) {
        console.log(
          `  ${r.kind.padEnd(24)} ${r.metadata?.namespace ?? ''}/${r.metadata?.name ?? ''}`
        )
      }
      if (result.operators.length > 0) {
        console.log('\nOperators required:')
        for (const op of result.operators) {
          const meta = operators.find((o) => o.name === op.name)
          console.log(`  ${op.name.padEnd(24)} ${meta?.description ?? ''}`)
        }
      }
      console.log(
        `\n${result.resources.length} resource(s), ${result.operators.length} operator(s).`
      )
    } catch (error) {
      console.error('Explain failed:', error instanceof Error ? error.message : error)
      console.error('\nThis component may require a Platform context.')
      process.exit(1)
    } finally {
      try {
        require('fs').unlinkSync(tmpFile)
      } catch {}
    }
    return
  }

  if (command === 'validate') {
    const entryFile = args[1]
    if (!entryFile) {
      console.error('Usage: r8s validate <file.tsx>')
      console.error('Example: r8s validate infra/app.tsx')
      process.exit(1)
    }
    const resolved = resolve(entryFile)
    if (!existsSync(resolved)) {
      console.error(`File not found: ${resolved}`)
      process.exit(1)
    }
    console.log(`Validating: ${resolved}\n`)
    // 1. Type-check with tsc using the project tsconfig
    try {
      const { execSync } = await import('child_process')
      // Use --noEmit with the project's tsconfig if available, else minimal flags
      const tsconfigPath = resolve('tsconfig.json')
      const tscCmd = existsSync(tsconfigPath)
        ? `npx tsc --noEmit -p ${tsconfigPath}`
        : `npx tsc --noEmit --jsx react-jsx --jsxImportSource @r8s/core --moduleResolution bundler --target es2022 --module esnext ${resolved}`
      execSync(tscCmd, {
        stdio: 'pipe',
        cwd: process.cwd(),
      })
      console.log('✅ TypeScript: no errors')
    } catch (error: any) {
      const stdout = error.stdout?.toString() ?? ''
      const stderr = error.stderr?.toString() ?? ''
      console.error('❌ TypeScript errors:')
      console.error(stdout || stderr || error.message)
      process.exit(1)
    }
    // 2. Render and check references
    try {
      const { bundleAndRender } = await import('./renderer.js')
      const result = await bundleAndRender(resolved)
      const resources = result.resources as any[]
      const names = new Set(
        resources.map(
          (r: any) => `${r.kind}/${r.metadata?.namespace ?? ''}/${r.metadata?.name ?? ''}`
        )
      )
      const issues: string[] = []
      // Check HTTPRoute backendRefs
      for (const route of resources.filter(
        (r: any) => r.kind === 'HTTPRoute' || r.kind === 'Ingress'
      )) {
        const refs =
          route.kind === 'HTTPRoute'
            ? (route.spec?.rules?.flatMap((r: any) => r.backendRefs ?? []) ?? [])
            : (route.spec?.rules?.flatMap(
                (r: any) => r.http?.paths?.map((p: any) => p.backend?.service) ?? []
              ) ?? [])
        for (const ref of refs) {
          const svcName = ref.name
          const svc = resources.find((r) => r.kind === 'Service' && r.metadata.name === svcName)
          if (!svc) {
            issues.push(
              `⚠️  ${route.kind} ${route.metadata.name} → Service "${svcName}" not found (operator-managed?)`
            )
          }
        }
      }
      // Check Deployment volume refs
      for (const d of resources.filter(
        (r: any) => r.kind === 'Deployment' || r.kind === 'StatefulSet'
      )) {
        const vols = d.spec?.template?.spec?.volumes ?? []
        for (const vol of vols) {
          if (vol.secret) {
            const sec = resources.find(
              (r) => r.kind === 'Secret' && r.metadata.name === vol.secret.secretName
            )
            if (!sec)
              issues.push(
                `⚠️  ${d.kind} ${d.metadata.name} → Secret "${vol.secret.secretName}" not found`
              )
          }
          if (vol.configMap) {
            const cm = resources.find(
              (r) => r.kind === 'ConfigMap' && r.metadata.name === vol.configMap.name
            )
            if (!cm)
              issues.push(
                `⚠️  ${d.kind} ${d.metadata.name} → ConfigMap "${vol.configMap.name}" not found`
              )
          }
          if (vol.persistentVolumeClaim) {
            const pvc = resources.find(
              (r) =>
                r.kind === 'PersistentVolumeClaim' &&
                r.metadata.name === vol.persistentVolumeClaim.claimName
            )
            if (!pvc)
              issues.push(
                `⚠️  ${d.kind} ${d.metadata.name} → PVC "${vol.persistentVolumeClaim.claimName}" not found`
              )
          }
        }
      }
      // Check empty DNSEndpoint targets
      for (const dns of resources.filter((r) => r.kind === 'DNSEndpoint')) {
        for (const ep of dns.spec?.endpoints ?? []) {
          if (!ep.targets || ep.targets.length === 0) {
            issues.push(`⚠️  DNSEndpoint ${dns.metadata.name} has empty targets`)
          }
        }
      }
      console.log(`✅ Render: ${resources.length} resources, ${result.operators.length} operators`)
      if (issues.length > 0) {
        console.log(`\n${issues.length} reference issue(s) found:`)
        for (const issue of issues) {
          console.log(`  ${issue}`)
        }
        console.log('\nSome references may be operator-managed (e.g. Keycloak Service).')
        process.exit(1)
      } else {
        console.log('✅ References: all resolved')
      }
    } catch (error) {
      console.error('❌ Render failed:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
    return
  }

  if (command !== 'render') {
    console.error(`Unknown command: ${command}`)
    showHelp()
    process.exit(1)
  }

  try {
    const entryFile = await findEntryFile(options.entry)
    console.error(`Rendering: ${entryFile}`)

    const { renderToYaml } = await import('./renderer.js')
    const yamlOutput = await renderToYaml(entryFile, {
      includeOperators: options.includeOperators,
      operatorsOnly: options.operatorsOnly,
    })

    if (options.out) {
      const { writeFileSync, mkdirSync } = await import('fs')
      const { dirname } = await import('path')
      mkdirSync(dirname(resolve(options.out)), { recursive: true })
      writeFileSync(resolve(options.out), yamlOutput, 'utf-8')
      console.error(`Output written to: ${resolve(options.out)}`)
    } else {
      console.log(yamlOutput)
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
