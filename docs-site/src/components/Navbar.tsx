import { useState, useEffect } from 'react'

const sections = [
  { id: 'features', label: 'features' },
  { id: 'installation', label: 'install' },
  { id: 'components', label: 'modules' },
  { id: 'docs', label: 'docs' },
  { id: 'architecture', label: 'arch' },
  { id: 'examples', label: 'examples' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) { setActive(e.target.id); break }
        }
      },
      { threshold: 0.3 }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid #1e1e1e' : '1px solid transparent' }}>
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: '#e0e0e0' }}>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded border" style={{ borderColor: '#2a2a2a', background: '#111' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#5fffa7', boxShadow: '0 0 6px rgba(95,255,167,0.4)' }} />
            <span className="text-xs" style={{ color: '#5fffa7' }}>mcp-test</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
              style={{
                color: active === s.id ? '#5fffa7' : '#666',
                background: active === s.id ? 'rgba(95,255,167,0.06)' : 'transparent',
              }}
              onMouseEnter={e => { if (active !== s.id) e.currentTarget.style.color = '#999' }}
              onMouseLeave={e => { if (active !== s.id) e.currentTarget.style.color = '#666' }}
            >
              ~/{s.label}
            </button>
          ))}
          <a
            href="https://github.com/Abhiramrathod/mcp-testing"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
            style={{ color: '#888', border: '1px solid #2a2a2a' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#5fffa7'; e.currentTarget.style.borderColor = 'rgba(95,255,167,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2a2a2a' }}
          >
            gh:repo
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden px-2 py-1 rounded text-xs" style={{ color: '#888', border: '1px solid #2a2a2a' }}
        >
          {menuOpen ? '[x]' : '[=]'}
        </button>
      </div>

      {menuOpen && (
        <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }}>
          <div className="px-4 py-3 space-y-1">
            {sections.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="block w-full text-left px-3 py-2 rounded text-xs" style={{ color: '#888' }}>
                $ cd ~/{s.label}
              </button>
            ))}
            <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded text-xs" style={{ color: '#888' }}>
              $ open github.com
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
