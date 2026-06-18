import { motion } from 'framer-motion'
import { ArrowRight, Github, Rocket, Cuboid as Cube } from 'lucide-react'

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, var(--accent-glow) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(192,132,252,0.06) 0%, transparent 50%)',
        }}
      />

      <motion.div className="max-w-6xl mx-auto px-6 w-full" variants={stagger} initial="initial" animate="animate">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 glass" style={{ color: 'var(--text-sec)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Production-ready &bull; Java 17+
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-5 text-balance" style={{ color: 'var(--text)' }}>
            Test <span className="gradient-text">MCP Servers</span>
            <br />
            with confidence
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-sec)' }}>
            A lightweight Java framework to write maintainable MCP tests, track performance, and assert on every exchange — with a type-safe, fluent API.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-10">
            <a
              href="#installation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: '0 2px 12px var(--accent-glow)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px var(--accent-glow)' }}
            >
              <Rocket size={16} />
              Get Started
            </a>
            <a
              href="#components"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 glass"
              style={{ color: 'var(--text)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              <Cube size={16} />
              Components
            </a>
            <a
              href="https://github.com/Abhiramrathod/mcp-testing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{ color: 'var(--text-sec)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.background = 'transparent' }}
            >
              <Github size={16} />
              GitHub
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Cube, label: '6 modules' },
              { icon: ArrowRight, label: 'Java 17+' },
              { icon: Rocket, label: 'Maven Central' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium glass"
                style={{ color: 'var(--text-sec)' }}
              >
                <Icon size={13} style={{ color: 'var(--accent)' }} />
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
