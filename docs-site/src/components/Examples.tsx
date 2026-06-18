import { motion } from 'framer-motion'
import { examples } from '../data/content'
import { ArrowRight, Github } from 'lucide-react'

const iconSymbols: Record<string, string> = {
  PlayCircle: '▶', Wrench: '◈', FolderOpen: '📂', MessageSquare: '💬', LineChart: '📊', CheckCheck: '✓',
}

export default function Examples() {
  return (
    <section id="examples" className="py-24 relative" style={{ background: '#0d0d0d' }}>
      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-label mb-3">examples</div>
          <h2 className="section-title">Test Suites</h2>
          <p className="section-sub font-mono">ls ./mcp-test-examples/src/test/</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {examples.map((ex, i) => (
            <motion.a
              key={ex.title}
              href={ex.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-terminal group block no-underline"
            >
              <div className="flex items-start gap-3">
                <span className="text-sm mt-0.5" style={{ color: '#5fffa7' }}>
                  {iconSymbols[ex.icon] || '◆'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: '#e0e0e0' }}>{ex.title}</span>
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#5fffa7' }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{ex.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs mt-2" style={{ color: '#555' }}>
                    <Github size={10} />
                    view source
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
