import { useState } from 'react'

const links = [
  { label: 'features', href: '#features' },
  { label: 'install', href: '#installation' },
  { label: 'modules', href: '#components' },
  { label: 'docs', href: '#docs' },
  { label: 'arch', href: '#architecture' },
  { label: 'examples', href: '#examples' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const scroll = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: '#0a0a0a', borderBottom: '1px solid #181818' }}>
      <div className="max-w-720px mx-auto flex items-center justify-between h-12 px-5">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-xs font-medium" style={{ color: '#d4d4d4' }}>
          <span style={{ color: '#5fffa7' }}>~</span>
          <span>/mcp-test</span>
        </button>

        <div className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <button key={l.href} onClick={() => scroll(l.href.slice(1))}
              className="px-2.5 py-1 rounded text-xs transition-colors" style={{ color: '#555' }}
              onMouseEnter={e => e.currentTarget.style.color = '#999'}
              onMouseLeave={e => e.currentTarget.style.color = '#555'}
            >
              {l.label}
            </button>
          ))}
          <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
            className="ml-2 px-2.5 py-1 rounded text-xs" style={{ color: '#444', border: '1px solid #1a1a1a' }}
          >
            gh:repo
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-xs px-2 py-1 rounded" style={{ color: '#666', border: '1px solid #1a1a1a' }}>
          {open ? 'close' : 'menu'}
        </button>
      </div>

      {open && (
        <div style={{ background: '#0a0a0a', borderTop: '1px solid #181818' }}>
          <div className="px-5 py-2 space-y-1">
            {links.map(l => (
              <button key={l.href} onClick={() => scroll(l.href.slice(1))}
                className="block w-full text-left text-xs py-1.5" style={{ color: '#666' }}
              >
                $ cd {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
