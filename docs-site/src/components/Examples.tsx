import { motion } from 'framer-motion'
import { examples } from '../data/content'
import { PlayCircle, Wrench, FolderOpen, MessageSquare, LineChart, CheckCheck, ArrowRight } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = { PlayCircle, Wrench, FolderOpen, MessageSquare, LineChart, CheckCheck }

export default function Examples() {
  return (
    <section id="examples" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>Examples</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>See It In Action</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Real-world tests to get you started</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((ex, i) => {
            const Icon = iconMap[ex.icon] || PlayCircle
            return (
              <motion.a
                key={ex.title}
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group block p-6 rounded-2xl transition-all duration-300 no-underline relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  <Icon size={18} />
                </div>
                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>{ex.title}</h4>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-sec)' }}>{ex.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:gap-2.5" style={{ color: 'var(--accent)' }}>
                  View Example <ArrowRight size={14} />
                </span>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
