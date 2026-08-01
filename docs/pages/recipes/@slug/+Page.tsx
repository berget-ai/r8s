import { usePageContext } from 'vike-react/usePageContext'
import { useConfig } from 'vike-react/useConfig'
import type { Recipe } from '../../../data/recipes'
import { CodeBlock } from '../../../components/CodeBlock'
import { Markdown } from '../../../components/Markdown'

export default function Page() {
  const pageContext = usePageContext()
  const recipe = pageContext.recipe as Recipe | undefined
  const config = useConfig()

  if (!recipe) {
    config({
      title: 'Recipe Not Found — r8s',
    })
    return (
      <div className="space-y-8">
        <h1 className="text-4xl tracking-tight">Recipe Not Found</h1>
        <p className="text-cloud/70">The recipe you're looking for doesn't exist.</p>
        <a href="/recipes" className="text-moss hover:text-lichen">
          ← Back to recipes
        </a>
      </div>
    )
  }

  config({
    title: `${recipe.title} — r8s Recipes`,
    description: recipe.description,
  })

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-moss uppercase tracking-wider font-medium">
            {recipe.category}
          </span>
        </div>
        <h1 className="text-4xl tracking-tight">{recipe.title}</h1>
        <p className="text-xl text-cloud/80">{recipe.description}</p>
      </div>

      {/* Component name */}
      <div className="flex items-center gap-3">
        <span className="text-cloud/40 text-sm">Component:</span>
        <code className="text-moss font-mono text-sm">{recipe.component.name}</code>
      </div>

      {/* Props */}
      <div className="space-y-6">
        <h2 className="text-2xl tracking-tight">Props</h2>
        <div className="space-y-4">
          {recipe.component.props.map((prop) => (
            <div key={prop.name} className="border-b border-white/5 pb-4 last:border-0">
              <div className="grid grid-cols-[140px_1fr_80px_80px] gap-4 items-baseline mb-2">
                <code className="font-mono text-moss text-sm truncate">{prop.name}</code>
                <code className="font-mono text-cloud/60 text-sm truncate">{prop.type}</code>
                <span className={prop.required ? 'text-red-400 text-sm' : 'text-cloud/40 text-sm'}>
                  {prop.required ? 'Required' : 'Optional'}
                </span>
                <span className="text-cloud/40 text-sm truncate">{prop.default || '—'}</span>
              </div>
              {prop.description && (
                <Markdown content={prop.description} className="text-cloud/70 text-sm leading-relaxed" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      {recipe.component.examples.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl tracking-tight">Examples</h2>
          {recipe.component.examples.map((example, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-moss font-mono text-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl">{example.title ?? `Example ${index + 1}`}</h3>
              </div>
              <CodeBlock code={example.tsx} yaml={example.yaml ?? undefined} language="tsx" />
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="pt-8 border-t border-white/10 flex justify-between">
        <a href="/recipes" className="text-moss hover:text-lichen flex items-center gap-2">
          <span>←</span>
          All recipes
        </a>
      </div>
    </div>
  )
}
