import { motion } from 'framer-motion'
import { Lightbulb, ChevronDown } from 'lucide-react'

const layers = [
  { label: 'Public', name: 'mcp-test-api', color: '#6366f1' },
  { label: 'Internal', name: 'mcp-test-client', color: '#ec4899' },
  { label: 'Transport', name: 'mcp-test-transport', color: '#8b5cf6' },
  { label: 'Core', name: 'mcp-test-interfaces / mcp-test-core', color: '#22c55e' },
]

export default function Architecture() {
  return (
    <section id="architecture" className="py-20 sm:py-28" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Clean &amp; Layered</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Modular design with clear separation of concerns</p>
        </motion.div>

        <div className="max-w-sm mx-auto text-center">
          {layers.map((l, i) => (
            <motion.div
              key={l.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 cursor-default"
                style={{
                  background: `${l.color}12`,
                  border: `1.5px solid ${l.color}30`,
                  color: l.color,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03) translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${l.color}15` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <span
                  className="text-[0.55rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-white"
                  style={{ background: l.color }}
                >
                  {l.label}
                </span>
                <span className="opacity-90">{l.name}</span>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-1.5" style={{ color: 'var(--text-ter)' }}>
                  <ChevronDown size={16} />
                </div>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-flex items-center gap-2.5 mt-8 px-5 py-3 rounded-xl glass text-sm"
            style={{ color: 'var(--text-sec)' }}
          >
            <Lightbulb size={15} style={{ color: '#f59e0b' }} />
            <span>Import only <code style={{ color: 'var(--accent)', fontWeight: 600 }}>mcp-test-api</code> — all internal modules are pulled in transitively</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
