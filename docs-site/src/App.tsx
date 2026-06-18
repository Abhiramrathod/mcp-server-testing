import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Installation from './components/Installation'
import Modules from './components/Modules'
import Docs from './components/Docs'
import Architecture from './components/Architecture'
import Examples from './components/Examples'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <div className="scanline-overlay" />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          mixBlendMode: 'overlay',
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(95,255,167,0.03) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.02) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <Navbar />
      <main className="relative z-[1]">
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
