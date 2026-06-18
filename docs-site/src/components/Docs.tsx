import { useState } from 'react'
import { docSections } from '../data/content'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'

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
        {copied ? <Check size={11} style={{ color: '#5fffa7' }} /> : <Copy size={11} style={{ color: '#666' }} />}
      </button>
    </div>
  )
}

export default function Docs() {
  const [section, setSection] = useState(0)

  return (
    <section id="docs" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs dim mb-3">
          <span className="cmd">#</span> docs
        </p>
        <p className="text-xs dim2 mb-3">$ man mcp-test-api</p>

        <div className="flex flex-wrap gap-1 mb-4 pb-3" style={{ borderBottom: '1px solid #181818' }}>
          {docSections.map((s, i) => (
            <button key={s.title} onClick={() => setSection(i)}
              className="px-2.5 py-1 rounded text-xs transition-all"
              style={{ background: section === i ? 'rgba(95,255,167,0.08)' : 'transparent', color: section === i ? '#5fffa7' : '#555', border: section === i ? '1px solid rgba(95,255,167,0.12)' : '1px solid transparent' }}
            >
              {s.title.toLowerCase().replace(/\s+/g, '-')}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium mb-1" style={{ color: '#5fffa7' }}>{docSections[section].title}</p>
        <p className="text-xs dim2 mb-3">{docSections[section].desc}</p>
        <Code code={docSections[section].code} lang={docSections[section].lang} />

        <div className="flex justify-center gap-1.5 mt-4">
          {docSections.map((_, i) => (
            <button key={i} onClick={() => setSection(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ background: section === i ? '#5fffa7' : '#222', boxShadow: section === i ? '0 0 4px rgba(95,255,167,0.4)' : 'none' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
