import { useTheme } from '../hooks/useTheme'
import { Moon, Sun, Menu, X, Github } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Install', href: '#installation' },
  { label: 'Modules', href: '#components' },
  { label: 'Docs', href: '#docs' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Examples', href: '#examples' },
]

export default function Navbar({ theme, toggle }: { theme: string; toggle: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'shadow-lg shadow-black/5 dark:shadow-black/20'
          : ''
      }`}
      style={{
        background: scrolled
          ? 'var(--bg-card)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(1.5)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.5)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 font-bold text-lg no-underline" style={{ color: 'var(--text)' }}>
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
          </span>
          MCP Testing
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group no-underline"
              style={{ color: 'var(--text-sec)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.background = 'transparent' }}
            >
              {l.label}
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 rounded-full transition-all duration-300 -translate-x-1/2 group-hover:w-3/5" style={{ background: 'var(--accent)' }} />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 border border-transparent"
            style={{ color: 'var(--text-sec)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.borderColor = 'transparent' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href="https://github.com/Abhiramrathod/mcp-testing"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: '0 2px 8px var(--accent-glow)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px var(--accent-glow)' }}
          >
            <Github size={15} />
            GitHub
          </a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t"
            style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 py-3 space-y-1">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline"
                  style={{ color: 'var(--text)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={() => { toggle(); setMobileOpen(false) }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--text)' }}
              >
                {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
