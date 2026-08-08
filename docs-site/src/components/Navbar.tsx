import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import Logo from './Logo'

const links = [
  { label: 'features', href: '#features' },
  { label: 'install', href: '#installation' },
  { label: 'modules', href: '#components' },
  { label: 'arch', href: '#architecture' },
  { label: 'flow', href: '#flow' },
  { label: 'docs', href: '#docs' },
  { label: 'api-ref', href: '#api-ref' },
  { label: 'junit5', href: '#junit' },
  { label: 'examples', href: '#examples' },
  { label: 'releases', href: '#releases' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const scroll = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-720px mx-auto flex items-center justify-between h-12 px-5">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text)' }}>
          <Logo size={18} showText />
        </button>

        <div className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <button key={l.href} onClick={() => scroll(l.href.slice(1))}
              className="px-2.5 py-1 rounded text-xs transition-colors" style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              {l.label}
            </button>
          ))}

          <button onClick={toggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="ml-2 px-2.5 py-1 rounded text-xs transition-all font-medium"
            style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
          >
            {theme === 'dark' ? '☀︎ light' : '☾ dark'}
          </button>

          <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
            className="ml-1 px-2.5 py-1 rounded text-xs" style={{ color: 'var(--text-dim2)', border: '1px solid var(--border)' }}
          >
            gh:repo
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-xs px-2 py-1 rounded" style={{ color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
          {open ? 'close' : 'menu'}
        </button>
      </div>

      {open && (
        <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
          <div className="px-5 py-2 space-y-1">
            {links.map(l => (
              <button key={l.href} onClick={() => scroll(l.href.slice(1))}
                className="block w-full text-left text-xs py-1.5" style={{ color: 'var(--text-dim)' }}
              >
                $ cd {l.label}
              </button>
            ))}
            <button onClick={toggle} className="block w-full text-left text-xs py-1.5" style={{ color: 'var(--accent)' }}>
              $ {theme === 'dark' ? '☀︎ light' : '☾ dark'} mode
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
