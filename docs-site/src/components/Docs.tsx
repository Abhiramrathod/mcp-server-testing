import { useState } from 'react'
import { docSections } from '../data/content'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import Reveal from './Reveal'

function Code({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter language={lang} style={atomDark}
        customStyle={{ padding: '10px 14px', borderRadius: '3px', fontSize: '12px', lineHeight: '1.6', margin: 0, background: '#080808', border: '1px solid #181818' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
        className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#111', border: '1px solid #222' }}
      >
        {copied ? <Check size={11} style={{ color: 'var(--accent)' }} /> : <Copy size={11} style={{ color: '#666' }} />}
      </button>
    </div>
  )
}

export default function Docs() {
  const [section, setSection] = useState(0)

  return (
    <section id="docs" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> docs
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>$ man mcp-test-api</p>

          <div className="fade-in fade-in-1 flex flex-wrap gap-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            {docSections.map((s, i) => (
              <button key={s.title} onClick={() => setSection(i)}
                className="px-2.5 py-1 rounded text-xs transition-all"
                style={{ background: section === i ? 'var(--accent-dim)' : 'transparent', color: section === i ? 'var(--accent)' : 'var(--text-dim)', border: section === i ? '1px solid var(--accent-glow)' : '1px solid transparent' }}
              >
                {s.title.toLowerCase().replace(/\s+/g, '-')}
              </button>
            ))}
          </div>

          <div key={section} className="fade-in fade-in-2">
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)' }}>{docSections[section].title}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>{docSections[section].desc}</p>
            <Code code={docSections[section].code} lang={docSections[section].lang} />
          </div>

          <div className="flex justify-center gap-1.5 mt-4">
            {docSections.map((_, i) => (
              <button key={i} onClick={() => setSection(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: section === i ? 'var(--accent)' : 'var(--border)', boxShadow: section === i ? '0 0 4px var(--accent-glow)' : 'none' }}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
