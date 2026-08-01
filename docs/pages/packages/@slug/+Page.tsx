import { usePageContext } from 'vike-react/usePageContext'
import { useConfig } from 'vike-react/useConfig'
import type { Package } from '../../../data/packages'
import { CodeBlock } from '../../../components/CodeBlock'
import { Markdown } from '../../../components/Markdown'

export default function Page() {
  const pageContext = usePageContext()
  const pkg = pageContext.package as Package | undefined
  const config = useConfig()

  if (!pkg) {
    config({
      title: 'Package Not Found — r8s',
    })
    return (
      <div className="space-y-8">
        <h1 className="text-4xl tracking-tight">Package Not Found</h1>
        <p className="text-cloud/70">The package you're looking for doesn't exist.</p>
        <a href="/packages" className="text-moss hover:text-lichen">
          ← Back to packages
        </a>
      </div>
    )
  }

  config({
    title: `${pkg.title} — r8s Packages`,
    description: pkg.description,
  })

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-moss uppercase tracking-wider font-medium">
            {pkg.category}
          </span>
        </div>
        <h1 className="text-4xl tracking-tight">{pkg.title}</h1>
        <p className="text-xl text-cloud/80">{pkg.description}</p>
        <p className="text-sm font-mono text-cloud/60">{pkg.name}</p>
      </div>

      {/* Keywords + Provider Interfaces */}
      <div className="flex flex-wrap gap-2">
        {pkg.keywords.map((keyword) => (
          <span
            key={keyword}
            className="text-xs px-3 py-1 rounded-full bg-white/5 text-cloud/60 border border-white/5"
          >
            {keyword}
          </span>
        ))}
        {pkg.providerInterfaces?.map((iface) => (
          <a
            key={iface}
            href={`/providers#${iface}`}
            className="text-xs px-3 py-1 rounded-full bg-moss/20 text-moss border border-moss/30 hover:bg-moss/30 transition-colors"
          >
            {iface} provider
          </a>
        ))}
      </div>

      {/* Operator badge */}
      {pkg.operator && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl tracking-tight">Declared Operator</h2>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
              <span className="text-moss text-xl">⚙</span>
              <div>
                <p className="font-mono text-peak">{pkg.operator}</p>
                {pkg.operatorVersion && (
                  <p className="text-xs text-cloud/60 mt-1">version {pkg.operatorVersion}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Components */}
      <div className="space-y-16">
        <h2 className="text-2xl tracking-tight">
          Components{' '}
          {pkg.components.length > 0 && (
            <span className="text-cloud/40 text-base font-sans">({pkg.components.length})</span>
          )}
        </h2>

        {pkg.components.map((component, index) => (
          <div key={component.name} className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-moss font-mono text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-mono">{component.name}</h3>
            </div>
            <p className="text-cloud/70">{component.description}</p>

            {/* Code examples */}
            {component.examples.length > 0 && (
              <div className="space-y-6">
                {component.examples.map((example, i) => (
                  <CodeBlock
                    key={i}
                    code={example.tsx}
                    yaml={example.yaml ?? undefined}
                    language="tsx"
                  />
                ))}
              </div>
            )}

            {/* Props table */}
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {component.props.map((prop) => (
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
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="pt-8 border-t border-white/10 flex justify-between">
        <a href="/packages" className="text-moss hover:text-lichen flex items-center gap-2">
          <span>←</span>
          All packages
        </a>
      </div>
    </div>
  )
}
