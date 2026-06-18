import { motion } from 'framer-motion'
import { Shield, Link2, Boxes, Gauge, Lock, Puzzle } from 'lucide-react'
import { features } from '../data/content'

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
    <section id="features" className="py-20 sm:py-28" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Built for Developers</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Everything you need to test MCP servers effectively</p>
        </motion.div>

        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={container} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-60px' }}>
          {features.map((f, i) => {
            const Icon = iconMap[f.icon] || Shield
            return (
              <motion.div
                key={f.title}
                variants={item}
                className="group relative p-6 rounded-2xl transition-all duration-300"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-light))' }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-2"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sec)' }}>{f.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
