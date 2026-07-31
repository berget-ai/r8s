import { useEffect, useState } from 'react'
import './Layout.css'
import { SearchDialog } from '../components/SearchDialog'
import { Logo } from '../components/Logo'

interface NavItem {
  label: string
  href: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Introduction',
    items: [
      { label: 'Overview', href: '/' },
      { label: 'Core Concepts', href: '/core' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Recipes', href: '/recipes' },
      { label: 'Packages', href: '/packages' },
      { label: 'Operators', href: '/operators' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { label: 'Deployment', href: '/deployment' },
      { label: 'Testing', href: '/testing' },
      { label: 'Adding Packages', href: '/adding-packages' },
    ],
  },
]

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pathname, setPathname] = useState('')

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-night text-peak font-sans">
      {/* Top bar */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 bg-night">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle — using Logo as hamburger */}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="lg:hidden text-cloud/60 hover:text-peak"
            aria-label="Toggle navigation"
          >
            <Logo size={24} />
          </button>
          <a href="/" className="flex items-center gap-2.5">
            <Logo size={28} className="text-peak hidden lg:block" />
            <span className="font-serif text-2xl tracking-tight">r8s</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-cloud/60 hover:text-peak hover:border-white/20 transition-colors"
            aria-label="Open search"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block font-mono text-xs text-cloud/50">⌘K</kbd>
          </button>
          <a
            href="https://github.com/berget-ai/r8s"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-cloud/60 hover:text-peak hover:border-white/20 transition-colors"
            aria-label="r8s on GitHub"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-60 shrink-0 border-r border-white/10 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
          <Sidebar navGroups={NAV_GROUPS} pathname={pathname} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-64 bg-night border-r border-white/10 h-full overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="flex items-center gap-2">
                  <Logo size={22} className="text-peak" />
                  <span className="font-serif text-lg">r8s</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="text-cloud/60 hover:text-peak"
                  aria-label="Close navigation"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <Sidebar
                navGroups={NAV_GROUPS}
                pathname={pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-4xl mx-auto px-6 py-12 w-full">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cloud/50">
          <span>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Berget AI AB ·{' '}
            <a
              href="https://github.com/berget-ai/r8s/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-peak transition-colors"
            >
              MIT License
            </a>
          </span>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/berget-ai/r8s"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-peak transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/berget-ai/r8s/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-peak transition-colors"
            >
              Issues
            </a>
            <a
              href="https://berget.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-peak transition-colors"
            >
              Berget AI
            </a>
          </div>
        </div>
      </footer>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

function Sidebar({
  navGroups,
  pathname,
  onNavigate,
}: {
  navGroups: NavGroup[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="px-3 py-4 space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <h3 className="text-xs uppercase tracking-wider text-cloud/40 font-medium px-3 mb-2">
            {group.title}
          </h3>
          {group.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive(item.href, pathname)
                  ? 'text-peak bg-white/5 font-medium'
                  : 'text-cloud/70 hover:text-peak hover:bg-white/5'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  )
}
