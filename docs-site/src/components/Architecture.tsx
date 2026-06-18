import { motion } from 'framer-motion'
import { Lightbulb, ChevronDown, Sparkles, ArrowRight } from 'lucide-react'

const layers = [
  { label: 'Public', name: 'mcp-test-api', color: '#6366f1', desc: 'The only artifact you import — fluent client builders, domain models, assertions.' },
  { label: 'Internal', name: 'mcp-test-client', color: '#ec4899', desc: 'RPC orchestration, component wiring, exchange tracking, initialization.' },
  { label: 'Transport', name: 'mcp-test-transport', color: '#8b5cf6', desc: 'SSE and Streamable HTTP implementations. Pluggable via SPI.' },
  { label: 'Core & SPI', name: 'mcp-test-interfaces / mcp-test-core', color: '#22c55e', desc: 'McpTransport SPI, JSON codec, constants, validation.' },
]

export default function Architecture() {
  return (
    <section id="architecture" className="py-20 sm:py-28 relative" style={{ background: 'var(--bg-alt)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.3 }} />
      </div>
      <div className="max-w-6xl mx-auto px-6 relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase inline-flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
            <Sparkles size={12} />
            Architecture
            <Sparkles size={12} />
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Clean &amp; Layered</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Modular design with clear separation of concerns</p>
        </motion.div>

        <div className="max-w-lg mx-auto">
          {layers.map((l, i) => (
            <motion.div
              key={l.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-full p-5 rounded-2xl transition-all duration-300 cursor-default"
                style={{
                  background: `${l.color}08`,
                  border: `1.5px solid ${l.color}25`,
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 12px 32px ${l.color}15`,
                  borderColor: l.color,
                }}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className="text-[0.55rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md text-white"
                    style={{ background: l.color }}
                  >
                    {l.label}
                  </span>
                  <span className="text-sm font-semibold opacity-90" style={{ color: 'var(--text)' }}>{l.name}</span>
                </div>
                <p className="text-xs leading-relaxed ml-1" style={{ color: 'var(--text-sec)' }}>{l.desc}</p>
              </motion.div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2" style={{ color: 'var(--text-ter)' }}>
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-2.5 mt-8 px-5 py-4 rounded-xl glass text-sm"
            style={{ color: 'var(--text-sec)' }}
          >
            <Lightbulb size={16} style={{ color: '#f59e0b' }} />
            <span>Import only <code style={{ color: 'var(--accent)', fontWeight: 600 }}>mcp-test-api</code> — all internal modules are pulled in transitively</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
