import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Installation from './components/Installation'
import Modules from './components/Modules'
import Docs from './components/Docs'
import Architecture from './components/Architecture'
import Examples from './components/Examples'
import Footer from './components/Footer'
import { useTheme } from './hooks/useTheme'

const sections = [
  { id: 'features', label: 'Features' },
  { id: 'installation', label: 'Install' },
  { id: 'components', label: 'Modules' },
  { id: 'docs', label: 'Docs' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'examples', label: 'Examples' },
]

function TocDots() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id)
            break
          }
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

  return (
    <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2.5">
      {sections.map(s => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={e => {
            e.preventDefault()
            const el = document.getElementById(s.id)
            if (el) window.scrollTo({ top: el.offsetTop - 72, behavior: 'smooth' })
          }}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            background: active === s.id ? 'var(--accent)' : 'var(--text-ter)',
            opacity: active === s.id ? 1 : 0.25,
            transform: active === s.id ? 'scale(1.4)' : 'scale(1)',
            boxShadow: active === s.id ? '0 0 8px var(--accent-glow)' : 'none',
          }}
          aria-label={s.label}
        />
      ))}
    </nav>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-grid" style={{ opacity: 0.15 }} />
      <div
        className="fixed pointer-events-none z-[-1] rounded-full animate-float"
        style={{
          width: 500, height: 500,
          background: 'var(--accent-glow)',
          top: '-10%', right: '-5%',
          filter: 'blur(80px)',
        }}
      />
      <Navbar theme={theme} toggle={toggle} />
      <TocDots />
      <main>
        <Hero />
        <Features />
        <Installation />
        <Modules />
        <Docs />
        <Architecture />
        <Examples />
      </main>
      <Footer />
    </>
  )
}
