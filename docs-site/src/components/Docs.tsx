import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { docSections } from '../data/content'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={lang}
        style={atomDark}
        customStyle={{ padding: '14px 16px', borderRadius: '4px', fontSize: '12px', lineHeight: '1.65', margin: 0, background: '#0a0a0a', border: '1px solid #1a1a1a' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
        className="absolute top-2 right-2 p-1.5 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
        style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}
      >
        {copied ? <Check size={12} style={{ color: '#5fffa7' }} /> : <Copy size={12} />}
      </button>
    </div>
  )
}

export default function Docs() {
  const [section, setSection] = useState(0)

  return (
    <section id="docs" className="py-24 relative" style={{ background: '#0d0d0d' }}>
      <div className="max-w-4xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-label mb-3">docs</div>
          <h2 className="section-title">API Reference</h2>
          <p className="section-sub font-mono">man mcp-test-api</p>
        </motion.div>

        <div className="terminal-window">
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title ml-2">mcp-test-api(3) — Java API</span>
          </div>
          <div className="terminal-body">
            <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b" style={{ borderColor: '#1a1a1a' }}>
              {docSections.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setSection(i)}
                  className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                  style={{
                    background: section === i ? 'rgba(95,255,167,0.08)' : 'transparent',
                    color: section === i ? '#5fffa7' : '#555',
                    border: section === i ? '1px solid rgba(95,255,167,0.15)' : '1px solid transparent',
                  }}
                >
                  {s.title.toLowerCase().replace(/\s+/g, '-')}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#5fffa7' }}>
                    {docSections[section].title}
                  </p>
                  <p className="text-xs" style={{ color: '#888' }}>{docSections[section].desc}</p>
                </div>
                <CodeBlock code={docSections[section].code} lang={docSections[section].lang} />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-1.5 mt-4">
              {docSections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSection(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: section === i ? '#5fffa7' : '#2a2a2a',
                    boxShadow: section === i ? '0 0 6px rgba(95,255,167,0.4)' : 'none',
                  }}
                  aria-label={`Section ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded text-xs" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#555' }}>
          <span style={{ color: '#5fffa7' }}>ⓘ</span>
          All methods return strongly-typed results with fluent assertions — no raw JSON.
        </div>
      </div>
    </section>
  )
}
