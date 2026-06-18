import { motion } from 'framer-motion'
import { features } from '../data/content'

const iconSymbols: Record<string, string> = {
  Shield: '◈', Link2: '↗', Boxes: '▦', Gauge: '◉', Lock: '🔒', Puzzle: '◇',
}

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="section-label mb-3">features</div>
          <h2 className="section-title">Capabilities</h2>
          <p className="section-sub font-mono">tree ./features --depth=1</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-terminal group"
            >
              <div className="flex items-start gap-3">
                <span className="text-sm mt-0.5" style={{ color: '#5fffa7' }}>{iconSymbols[f.icon] || '◆'}</span>
                <div>
                  <h3 className="text-sm font-medium mb-1.5" style={{ color: '#e0e0e0' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
