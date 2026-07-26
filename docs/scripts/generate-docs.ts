/**
 * Generate docs data (packages.ts, recipes.ts) from source code.
 *
 * Usage:
 *   npx tsx docs/scripts/generate-docs.ts
 *
 * This extracts component props, JSDoc descriptions, and package metadata
 * from the TypeScript source files and writes them to docs/data/.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as ts from 'typescript';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DOCS_DATA = path.join(ROOT, 'docs', 'data');

// ─── Types ──────────────────────────────────────────────────────────────────

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

interface ComponentDoc {
  name: string;
  description: string;
  props: ComponentProp[];
  /** JSDoc @example blocks */
  examples: string[];
}

interface PackageDoc {
  slug: string;
  name: string;
  title: string;
  description: string;
  category: string;
  operator?: string;
  operatorVersion?: string;
  keywords: string[];
  components: ComponentDoc[];
}

// ─── TypeScript extraction ───────────────────────────────────────────────────

function parseSourceFile(filePath: string): ts.SourceFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

function getJSDoc(node: ts.Node): string {
  const jsDoc = (ts as any).getJSDocCommentsAndTags?.(node) ?? [];
  for (const doc of jsDoc) {
    if (ts.isJSDoc(doc)) {
      return doc.comment
        ?.toString()
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => !line.startsWith('@'))
        .join(' ')
        .trim() ?? '';
    }
  }
  // Fallback: check for JSDoc via symbol
  const sym = (node as any).jsDoc?.[0];
  if (sym?.comment) {
    return sym.comment
      .toString()
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => !line.startsWith('@'))
      .join(' ')
      .trim();
  }
  return '';
}

function getJSDocTag(node: ts.Node, tagName: string): string | null {
  const jsDoc = (node as any).jsDoc?.[0];
  if (jsDoc?.tags) {
    for (const tag of jsDoc.tags) {
      if (tag.tagName?.text === tagName) {
        // JSDoc @tag value is the first line/word after the tag name
        const comment = tag.comment?.toString().trim() ?? '';
        // Take only the first line (the tag value)
        return comment.split('\n')[0].trim();
      }
    }
  }
  return null;
}

function getJSDocExamples(node: ts.Node): string[] {
  const examples: string[] = [];
  const jsDoc = (node as any).jsDoc?.[0];
  if (jsDoc?.tags) {
    for (const tag of jsDoc.tags) {
      if (tag.tagName?.text === 'example') {
        examples.push(tag.comment?.toString() ?? '');
      }
    }
  }
  return examples.filter(Boolean);
}

function getPropDescription(prop: ts.PropertySignature): string {
  // Check for JSDoc on the property
  const jsDoc = (prop as any).jsDoc?.[0];
  if (jsDoc?.comment) {
    return jsDoc.comment.toString().trim();
  }
  // Check for inline comment
  const fullText = prop.getFullText();
  const commentMatch = fullText.match(/\/\*\*\s*(.*?)\s*\*\//);
  if (commentMatch) {
    return commentMatch[1].trim();
  }
  return '';
}

function typeNodeToString(typeNode: ts.TypeNode | undefined): string {
  if (!typeNode) return 'unknown';

  // Simple type reference
  if (ts.isTypeReferenceNode(typeNode)) {
    return typeNode.typeName.getText();
  }

  // Array type
  if (ts.isArrayTypeNode(typeNode)) {
    return `${typeNodeToString(typeNode.elementType)}[]`;
  }

  // Union type
  if (ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.map(t => typeNodeToString(t)).join(' | ');
  }

  // Literal types
  if (ts.isLiteralTypeNode(typeNode)) {
    return typeNode.literal.getText();
  }

  // Inline object type
  if (ts.isTypeLiteralNode(typeNode)) {
    const members = typeNode.members.map(m => {
      if (ts.isPropertySignature(m)) {
        return `${m.name?.getText()}${m.questionToken ? '?' : ''}: ${typeNodeToString(m.type)}`;
      }
      return '';
    }).filter(Boolean);
    return `{ ${members.join(', ')} }`;
  }

  // Keyword types (string, number, boolean, etc.)
  if (ts.isTypeNode(typeNode)) {
    return typeNode.getText();
  }

  return typeNode.getText();
}

function extractProps(interfaceDecl: ts.InterfaceDeclaration): ComponentProp[] {
  const props: ComponentProp[] = [];

  for (const member of interfaceDecl.members) {
    if (!ts.isPropertySignature(member)) continue;
    if (!member.name) continue;

    const name = member.name.getText();
    const type = typeNodeToString(member.type);
    const required = !member.questionToken;
    const description = getPropDescription(member);

    // Extract default from JSDoc @default tag
    let defaultVal: string | undefined;
    const jsDoc = (member as any).jsDoc?.[0];
    if (jsDoc?.tags) {
      for (const tag of jsDoc.tags) {
        if (tag.tagName?.text === 'default') {
          defaultVal = tag.comment?.toString().trim();
        }
      }
    }

    props.push({ name, type, required, default: defaultVal, description });
  }

  return props;
}

function extractComponents(sourceFile: ts.SourceFile, sourcePath: string): ComponentDoc[] {
  const components: ComponentDoc[] = [];

  function visit(node: ts.Node) {
    // Find export function declarations
    if (ts.isFunctionDeclaration(node) && hasExportModifier(node)) {
      const name = node.name?.text;
      if (!name || name[0] === name[0].toLowerCase()) {
        // Skip lowercase (non-component) exports like operators
        // But allow if it's a known component
      }
      if (!name) return;

      // Only include PascalCase functions (components)
      if (name[0] !== name[0].toUpperCase()) return;

      const description = getJSDoc(node);
      const examples = getJSDocExamples(node);
      components.push({ name, description, props: [], examples });
    }

    // Find interface declarations with "Props" suffix
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
      const componentName = node.name.text.replace('Props', '');
      const props = extractProps(node);

      // Find matching component description from the function
      const existing = components.find(c => c.name === componentName);
      if (existing) {
        existing.props = props;
      } else {
        const description = getJSDoc(node);
        components.push({ name: componentName, description, props, examples: [] });
      }
    }
  }

  sourceFile.forEachChild(visit);
  return components;
}

function hasExportModifier(node: ts.Node): boolean {
  const modifiers = (node as any).modifiers;
  if (!modifiers) return false;
  return modifiers.some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function extractOperatorInfo(sourceFile: ts.SourceFile, sourcePath: string): { name: string; version: string } | null {
  function visit(node: ts.Node): { name: string; version: string } | null {
    if (ts.isVariableStatement(node) && hasExportModifier(node)) {
      for (const decl of node.declarationList.declarations) {
        const name = decl.name.getText();
        if (name.endsWith('Operator') && decl.initializer && ts.isArrowFunction(decl.initializer)) {
          // Extract default version from parameter
          if (decl.initializer.parameters.length > 0) {
            const param = decl.initializer.parameters[0];
            if (param.initializer) {
              const version = param.initializer.getText().replace(/['"]/g, '');
              return { name: name.replace('Operator', ''), version };
            }
          }
          return { name: name.replace('Operator', ''), version: '' };
        }
      }
    }
    return null;
  }

  let result: { name: string; version: string } | null = null;
  sourceFile.forEachChild(node => {
    const found = visit(node);
    if (found) result = found;
  });
  return result;
}

// ─── Generate packages.ts ────────────────────────────────────────────────────

function readPackageJson(dir: string): { name: string; description: string; keywords: string[]; category: string } {
  const pkgPath = path.join(ROOT, 'packages', dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return {
    name: pkg.name,
    description: pkg.description || '',
    keywords: pkg.keywords || [],
    category: pkg.r8s?.category || 'Uncategorized',
  };
}

function generatePackages(): PackageDoc[] {
  const packages: PackageDoc[] = [];
  const packageDirs = fs.readdirSync(path.join(ROOT, 'packages'))
    .filter(dir => {
      const srcPath = path.join(ROOT, 'packages', dir, 'src', 'index.ts');
      return fs.existsSync(srcPath);
    })
    .filter(dir => dir !== 'core' && dir !== 'k8s-types' && dir !== 'cli' && dir !== 'r8s-controller' && dir !== 'recipes');

  for (const dir of packageDirs) {
    const srcPath = path.join(ROOT, 'packages', dir, 'src', 'index.ts');
    const sourceFile = parseSourceFile(srcPath);
    const components = extractComponents(sourceFile, srcPath);
    const operator = extractOperatorInfo(sourceFile, srcPath);
    const pkg = readPackageJson(dir);

    if (components.length === 0) {
      console.warn(`No components found in package "${dir}", skipping`);
      continue;
    }

    packages.push({
      slug: dir,
      name: pkg.name,
      title: pkg.name.replace('@r8s/', ''),
      description: pkg.description,
      category: pkg.category,
      operator: operator?.name,
      operatorVersion: operator?.version,
      keywords: pkg.keywords,
      components,
    });
  }

  return packages;
}

// ─── Generate recipes.ts ────────────────────────────────────────────────────

function generateRecipes(): PackageDoc[] {
  const recipes: PackageDoc[] = [];

  // Get all .tsx files in recipes/src (excluding index, operators, legacy)
  const recipeFiles = fs.readdirSync(path.join(ROOT, 'packages', 'recipes', 'src'))
    .filter(f => f.endsWith('.tsx') && f !== 'index.ts' && f !== 'operators.ts' && f !== 'ingress-legacy.tsx' && f !== 'postgres.tsx');

  for (const file of recipeFiles) {
    const filePath = path.join(ROOT, 'packages', 'recipes', 'src', file);
    const fileSource = parseSourceFile(filePath);
    const fileComponents = extractComponents(fileSource, filePath);

    for (const comp of fileComponents) {
      // Skip non-recipe components (Ingress is a low-level component, not a recipe)
      if (comp.name === 'Postgres' || comp.name === 'CustomIngress' || comp.name === 'Ingress') continue;

      // Extract @title and @category from the function's JSDoc
      // Find the function declaration for this component
      let title: string | null = null;
      let category: string | null = null;
      let description: string | null = null;

      function visit(node: ts.Node) {
        if (ts.isFunctionDeclaration(node) && node.name?.text === comp.name) {
          title = getJSDocTag(node, 'title');
          category = getJSDocTag(node, 'category');
          description = getJSDoc(node);
        }
      }
      fileSource.forEachChild(visit);

      const slug = comp.name
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

      recipes.push({
        slug,
        name: `@r8s/recipes`,
        title: title ?? comp.name,
        description: description ?? comp.description,
        category: category ?? 'Recipes',
        keywords: [],
        components: [comp],
      });
    }
  }

  return recipes;
}

// ─── Write output ───────────────────────────────────────────────────────────

function escapeStr(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatProp(prop: ComponentProp): string {
  const parts = [
    `      { name: "${escapeStr(prop.name)}", type: "${escapeStr(prop.type)}", required: ${prop.required}`,
    prop.default ? `, default: "${escapeStr(prop.default)}"` : '',
    `, description: "${escapeStr(prop.description)}" },`,
  ];
  return parts.join('');
}

function writePackages(packages: PackageDoc[]) {
  const lines: string[] = [
    '// AUTO-GENERATED by docs/scripts/generate-docs.ts',
    '// Do not edit manually — run: npx tsx docs/scripts/generate-docs.ts',
    '',
    'export interface ComponentProp {',
    '  name: string;',
    '  type: string;',
    '  required: boolean;',
    '  default?: string;',
    '  description: string;',
    '}',
    '',
    'export interface ComponentDoc {',
    '  name: string;',
    '  description: string;',
    '  props: ComponentProp[];',
    '  examples: string[];',
    '}',
    '',
    'export interface Package {',
    '  slug: string;',
    '  name: string;',
    '  title: string;',
    '  description: string;',
    '  category: string;',
    '  operator?: string;',
    '  operatorVersion?: string;',
    '  keywords: string[];',
    '  components: ComponentDoc[];',
    '}',
    '',
    'export const packages: Package[] = [',
  ];

  for (const pkg of packages) {
    lines.push('  {');
    lines.push(`    slug: "${escapeStr(pkg.slug)}",`);
    lines.push(`    name: "${escapeStr(pkg.name)}",`);
    lines.push(`    title: "${escapeStr(pkg.title)}",`);
    lines.push(`    description: "${escapeStr(pkg.description)}",`);
    lines.push(`    category: "${escapeStr(pkg.category)}",`);
    if (pkg.operator) lines.push(`    operator: "${pkg.operator}",`);
    if (pkg.operatorVersion) lines.push(`    operatorVersion: "${pkg.operatorVersion}",`);
    lines.push(`    keywords: [${pkg.keywords.map(k => `"${k}"`).join(', ')}],`);
    lines.push('    components: [');
    for (const comp of pkg.components) {
      lines.push('      {');
      lines.push(`        name: "${comp.name}",`);
      lines.push(`        description: "${escapeStr(comp.description)}",`);
      lines.push('        props: [');
      for (const prop of comp.props) {
        lines.push(formatProp(prop));
      }
      lines.push('        ],');
      lines.push(`        examples: ${JSON.stringify(comp.examples)},`);
      lines.push('      },');
    }
    lines.push('    ],');
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push('export function getPackageCategories(): string[] {');
  lines.push('  return [...new Set(packages.map(p => p.category))].sort();');
  lines.push('}');
  lines.push('');
  lines.push('export function getPackageBySlug(slug: string): Package | undefined {');
  lines.push('  return packages.find(p => p.slug === slug);');
  lines.push('}');
  lines.push('');

  const output = lines.join('\n');
  const outPath = path.join(DOCS_DATA, 'packages.ts');
  fs.writeFileSync(outPath, output);
  console.log(`✅ Generated ${outPath} (${packages.length} packages, ${packages.reduce((sum, p) => sum + p.components.length, 0)} components)`);
}

function writeRecipes(recipes: PackageDoc[]) {
  const lines: string[] = [
    '// AUTO-GENERATED by docs/scripts/generate-docs.ts',
    '// Do not edit manually — run: npx tsx docs/scripts/generate-docs.ts',
    '',
    'export interface ComponentProp {',
    '  name: string;',
    '  type: string;',
    '  required: boolean;',
    '  default?: string;',
    '  description: string;',
    '}',
    '',
    'export interface ComponentDoc {',
    '  name: string;',
    '  description: string;',
    '  props: ComponentProp[];',
    '  examples: string[];',
    '}',
    '',
    'export interface Recipe {',
    '  slug: string;',
    '  title: string;',
    '  description: string;',
    '  category: string;',
    '  keywords: string[];',
    '  component: ComponentDoc;',
    '}',
    '',
    'export const recipes: Recipe[] = [',
  ];

  for (const recipe of recipes) {
    const comp = recipe.components[0];
    lines.push('  {');
    lines.push(`    slug: "${escapeStr(recipe.slug)}",`);
    lines.push(`    title: "${escapeStr(recipe.title)}",`);
    lines.push(`    description: "${escapeStr(recipe.description)}",`);
    lines.push(`    category: "${escapeStr(recipe.category)}",`);
    lines.push(`    keywords: [${recipe.keywords.map(k => `"${k}"`).join(', ')}],`);
    lines.push('    component: {');
    lines.push(`      name: "${comp.name}",`);
    lines.push(`      description: "${escapeStr(comp.description)}",`);
    lines.push('      props: [');
    for (const prop of comp.props) {
      lines.push(formatProp(prop));
    }
    lines.push('      ],');
    lines.push(`      examples: ${JSON.stringify(comp.examples)},`);
    lines.push('    },');
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push('export function getRecipeBySlug(slug: string): Recipe | undefined {');
  lines.push('  return recipes.find(r => r.slug === slug);');
  lines.push('}');
  lines.push('');

  const output = lines.join('\n');
  const outPath = path.join(DOCS_DATA, 'recipes.ts');
  fs.writeFileSync(outPath, output);
  console.log(`✅ Generated ${outPath} (${recipes.length} recipes)`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('🚀 Generating docs from source code...\n');

  const pkgs = generatePackages();
  writePackages(pkgs);

  const recipes = generateRecipes();
  writeRecipes(recipes);

  console.log('\n✅ Done!');
}

main();
