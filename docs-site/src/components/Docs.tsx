import { motion } from 'framer-motion'
import { docSections } from '../data/content'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Wrench, FolderOpen, MessageSquare, LineChart } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = { Wrench, FolderOpen, MessageSquare, LineChart }

export default function Docs() {
  return (
    <section id="docs" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Core Features</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Comprehensive testing for every MCP feature</p>
        </motion.div>

        <div className="space-y-4">
          {docSections.map((s, i) => {
            const Icon = iconMap[s.icon] || Wrench
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 sm:p-8 transition-all duration-300"
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{s.title}</h3>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-sec)' }}>{s.desc}</p>
                <SyntaxHighlighter
                  language={s.lang}
                  style={atomDark}
                  customStyle={{ padding: '1.25rem 1.5rem', borderRadius: '0.625rem', fontSize: '0.8rem', lineHeight: '1.65', margin: 0, border: '1px solid rgba(255,255,255,0.06)', background: '#0c1427' }}
                  showLineNumbers={false}
                >
                  {s.code}
                </SyntaxHighlighter>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
