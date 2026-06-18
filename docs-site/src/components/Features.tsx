import { motion } from 'framer-motion'
import { Shield, Link2, Boxes, Gauge, Lock, Puzzle, Sparkles } from 'lucide-react'
import { features } from '../data/content'
import TiltCard from './TiltCard'

const iconMap: Record<string, React.ElementType> = { Shield, Link2, Boxes, Gauge, Lock, Puzzle }

const container = {
  animate: { transition: { staggerChildren: 0.06 } }
}
const item = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 relative" style={{ background: 'var(--bg-alt)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.4 }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase inline-flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
            <Sparkles size={12} />
            Features
            <Sparkles size={12} />
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Built for Developers</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Everything you need to test MCP servers effectively</p>
        </motion.div>

        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={container} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-60px' }}>
          {features.map((f) => {
            const Icon = iconMap[f.icon] || Shield
            return (
              <TiltCard key={f.title} intensity={5}>
                <motion.div
                  variants={item}
                  className="group relative p-6 rounded-2xl transition-all duration-300 card-shine"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }}
                  />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sec)' }}>{f.desc}</p>
                </motion.div>
              </TiltCard>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
