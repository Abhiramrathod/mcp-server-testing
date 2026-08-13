import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Search, Github, Command } from 'lucide-react'
import Logo from './Logo'
import { allNavLeaves } from '../data/nav'

const topLinks = [
  { label: 'home', path: '/' },
  { label: 'quickstart', path: '/quickstart' },
  { label: 'guides', path: '/integration-testing' },
  { label: 'api-ref', path: '/api-reference' },
  { label: 'examples', path: '/examples' },
  { label: 'changelog', path: '/changelog' },
]

export default function SiteHeader() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setSearchOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  const results = query.trim()
    ? allNavLeaves.filter(l => l.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : allNavLeaves

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between h-12 px-5 gap-3">
        <Link to="/" style={{ textDecoration: 'none' }} className="flex items-center gap-2">
          <Logo size={18} showText />
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {topLinks.map(l => (
            <Link key={l.path} to={l.path}
              className="px-2.5 py-1 rounded text-xs transition-colors"
              style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs"
            style={{ color: 'var(--text-dim2)', border: '1px solid var(--border)' }}
          >
            <Search size={11} /> <span className="hidden sm:inline">search</span> <Command size={10} />
          </button>
          <button onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="px-2.5 py-1 rounded text-xs transition-all font-medium"
            style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
          >
            {theme === 'dark' ? '☀︎ light' : '☾ dark'}
          </button>
          <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs" style={{ color: 'var(--text-dim2)', border: '1px solid var(--border)' }}
          >
            <Github size={11} /> gh
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-xs px-2 py-1 rounded" style={{ color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
            {menuOpen ? 'close' : 'menu'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <div className="px-5 py-2 space-y-1">
            {topLinks.map(l => (
              <Link key={l.path} to={l.path} onClick={() => setMenuOpen(false)}
                className="block w-full text-left text-xs py-1.5" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
              >
                $ cd {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setSearchOpen(false)}>
          <div className="w-[480px] max-w-[92vw] rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <Search size={12} style={{ color: 'var(--text-dim2)' }} />
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search documentation…"
                className="flex-1 bg-transparent outline-none text-xs" style={{ color: 'var(--text)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-dim2)' }}>esc</span>
            </div>
            <div className="py-1 max-h-72 overflow-y-auto">
              {results.map(r => (
                <Link key={r.path} to={r.path} onClick={() => { setSearchOpen(false); setQuery('') }}
                  className="block px-3 py-1.5 text-xs transition-colors" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {r.label} <span style={{ color: 'var(--text-dim2)', fontSize: '10px' }}>— {r.path}</span>
                </Link>
              ))}
              {!results.length && <p className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-dim2)' }}>No results for “{query}”.</p>}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
