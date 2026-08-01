import { usePageContext } from 'vike-react/usePageContext'
import { useConfig } from 'vike-react/useConfig'
import type { Recipe } from '../../../data/recipes'
import { CodeBlock } from '../../../components/CodeBlock'

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Prop</th>
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Required</th>
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Default</th>
                <th className="text-left py-3 px-4 text-cloud/60 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-cloud/80">
              {recipe.component.props.map((prop) => (
                <tr key={prop.name} className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-moss">{prop.name}</td>
                  <td className="py-3 px-4 font-mono text-cloud/60">{prop.type}</td>
                  <td className="py-3 px-4">
                    {prop.required ? (
                      <span className="text-red-400">Required</span>
                    ) : (
                      <span className="text-cloud/40">Optional</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-cloud/40">{prop.default || '—'}</td>
                  <td className="py-3 px-4 text-cloud/70">{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <h3 className="text-xl">Example {index + 1}</h3>
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
