import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { docSections } from '../data/content'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Wrench, FolderOpen, MessageSquare, LineChart, Radio, Copy, Check } from 'lucide-react'
import TiltCard from './TiltCard'

const iconMap: Record<string, React.ElementType> = { Wrench, FolderOpen, MessageSquare, LineChart, Radio }

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{ padding: '1.25rem 1.5rem', borderRadius: '0.625rem', fontSize: '0.8rem', lineHeight: '1.65', margin: 0, border: '1px solid rgba(255,255,255,0.06)', background: '#0c1427' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
        className="absolute top-2.5 right-2.5 p-2 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-ter)', border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Copy code"
      >
        {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
      </button>
      <span
        className="absolute top-2.5 left-3 text-[0.55rem] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-40 transition-opacity"
        style={{ color: 'var(--text-ter)' }}
      >
        {language}
      </span>
    </div>
  )
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState(0)

  return (
    <section id="docs" className="py-20 sm:py-28 relative">
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

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {docSections.map((s, i) => {
            const Icon = iconMap[s.icon] || Wrench
            return (
              <button
                key={s.title}
                onClick={() => setActiveSection(i)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeSection === i ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'var(--bg-card)',
                  color: activeSection === i ? 'white' : 'var(--text-sec)',
                  border: activeSection === i ? 'none' : '1px solid var(--border)',
                  boxShadow: activeSection === i ? '0 4px 16px var(--accent-glow)' : 'none',
                }}
              >
                <Icon size={15} />
                {s.title}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <TiltCard key={activeSection} intensity={3}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-2xl p-6 sm:p-8 transition-all duration-300 card-shine"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  {(() => { const Icon = iconMap[docSections[activeSection].icon] || Wrench; return <Icon size={18} /> })()}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{docSections[activeSection].title}</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-sec)' }}>{docSections[activeSection].desc}</p>
              <CodeBlock code={docSections[activeSection].code} language="java" />
            </motion.div>
          </TiltCard>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-2 mt-6"
        >
          {docSections.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: activeSection === i ? 'var(--accent)' : 'var(--border)',
                transform: activeSection === i ? 'scale(1.5)' : 'scale(1)',
                boxShadow: activeSection === i ? '0 0 6px var(--accent-glow)' : 'none',
              }}
              aria-label={`Go to section ${i + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
