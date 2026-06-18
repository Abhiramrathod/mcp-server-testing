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
import CursorGlow from './components/CursorGlow'
import ParticlesBg from './components/ParticlesBg'
import NoiseOverlay from './components/NoiseOverlay'
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
          className="w-2.5 h-2.5 rounded-full transition-all duration-500"
          style={{
            background: active === s.id ? 'var(--accent)' : 'var(--text-ter)',
            opacity: active === s.id ? 1 : 0.2,
            transform: active === s.id ? 'scale(1.6)' : 'scale(1)',
            boxShadow: active === s.id ? `0 0 12px var(--accent-glow)` : 'none',
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
      <ParticlesBg />
      <NoiseOverlay />
      <CursorGlow />

      <div className="fixed inset-0 pointer-events-none z-[2] bg-grid" style={{ opacity: 0.12 }} />

      <div
        className="fixed pointer-events-none z-[2] rounded-full animate-float"
        style={{
          width: 600, height: 600,
          background: 'var(--accent-glow)',
          top: '-10%', right: '-5%',
          filter: 'blur(100px)',
          opacity: 0.7,
        }}
      />
      <div
        className="fixed pointer-events-none z-[2] rounded-full animate-float-slow"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)',
          bottom: '-5%', left: '-5%',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="fixed pointer-events-none z-[2] rounded-full animate-drift"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          top: '40%', left: '60%',
          filter: 'blur(60px)',
        }}
      />

      <Navbar theme={theme} toggle={toggle} />
      <TocDots />
      <main className="relative z-[3]">
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
