import { motion } from 'framer-motion'
import { ArrowRight, Github, Rocket, Cuboid as Cube, Star, Zap } from 'lucide-react'
import MorphingText from './MorphingText'
import StatsCounter from './StatsCounter'

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, var(--accent-glow) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(192,132,252,0.06) 0%, transparent 50%)',
        }}
      />

      <motion.div className="max-w-6xl mx-auto px-6 w-full relative z-[3]" variants={stagger} initial="initial" animate="animate">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 glass" style={{ color: 'var(--text-sec)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Production-ready</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-ter)' }} />
            <span>Java 17+</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-ter)' }} />
            <span>Maven Central</span>
          </motion.div>

          <motion.div variants={scaleIn}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight mb-4 text-balance" style={{ color: 'var(--text)' }}>
              Test <span className="gradient-text">MCP Servers</span>
              <br />
              <MorphingText />
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-sec)' }}>
            A lightweight Java framework to write maintainable MCP tests, track performance, and assert on every exchange — with a type-safe, fluent API.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center mb-6">
            <a
              href="#installation"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', boxShadow: '0 4px 20px var(--accent-glow)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 32px var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-glow)' }}
            >
              <Rocket size={17} />
              <span>Get Started</span>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#components"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 glass"
              style={{ color: 'var(--text)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
            >
              <Cube size={17} />
              Modules
            </a>
            <a
              href="https://github.com/Abhiramrathod/mcp-testing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-300"
              style={{ color: 'var(--text-sec)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--accent-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.background = 'transparent' }}
            >
              <Github size={17} />
              GitHub
            </a>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center mb-6">
            {[
              { icon: Star, label: '6 modules' },
              { icon: Zap, label: 'Java 17+' },
              { icon: ArrowRight, label: 'Maven Central' },
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

          <StatsCounter />
        </div>
      </motion.div>
    </section>
  )
}
