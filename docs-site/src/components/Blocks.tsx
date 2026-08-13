import { useState } from 'react'
import type { Block } from '../lib/markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy, FileCode, AlertTriangle, Info, Lightbulb, TriangleAlert, OctagonAlert } from 'lucide-react'

export function CodeBlock({ code, lang, file }: { code: string; lang: string; file?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      {file && (
        <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-[10px]" style={{ background: '#060606', borderBottom: '1px solid #181818', color: 'var(--text-dim2)' }}>
          <FileCode size={10} /> {file}
        </div>
      )}
      <SyntaxHighlighter language={lang} style={atomDark}
        customStyle={{ padding: '10px 14px', borderRadius: '3px', fontSize: '11px', lineHeight: '1.6', margin: 0, background: '#080808', border: '1px solid #181818' }}
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

const CALLOUT_STYLES = {
  note:    { icon: Info,        color: '#60a5fa', bg: '#60a5fa08', border: '#60a5fa25', label: 'NOTE' },
  info:    { icon: Info,        color: '#60a5fa', bg: '#60a5fa08', border: '#60a5fa25', label: 'INFO' },
  tip:     { icon: Lightbulb,   color: '#5fffa7', bg: '#5fffa708', border: '#5fffa725', label: 'TIP' },
  warning: { icon: TriangleAlert, color: '#fbbf24', bg: '#fbbf2408', border: '#fbbf2425', label: 'WARNING' },
  danger:  { icon: OctagonAlert, color: '#f87171', bg: '#f8717108', border: '#f8717125', label: 'DANGER' },
}

export function Callout({ kind, title, md }: { kind: 'note' | 'tip' | 'warning' | 'info' | 'danger'; title?: string; md: string }) {
  const s = CALLOUT_STYLES[kind]
  const Icon = s.icon
  return (
    <div className="flex gap-2.5 px-3 py-2.5 rounded text-xs" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <Icon size={13} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
      <div>
        <span style={{ color: s.color, fontWeight: 700, fontSize: '10px', letterSpacing: '0.3px' }}>
          {s.label}{title ? ` · ${title}` : ''}
        </span>
        <p className="mt-0.5" style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>{md}</p>
      </div>
    </div>
  )
}

export function MdTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-left text-xs" style={{ borderCollapse: 'collapse', minWidth: '480px' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface)' }}>
            {headers.map(h => (
              <th key={h} className="px-3 py-2 font-medium" style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 ? 'transparent' : 'var(--bg-surface)' }}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 align-top" style={{ color: j === 0 ? 'var(--text)' : 'var(--text-dim)', fontFamily: j === 0 ? 'inherit' : undefined }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeTabs({ tabs }: { tabs: { label: string; lang: string; code: string }[] }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setActive(i)}
            className="px-2.5 py-1 rounded text-xs capitalize transition-all"
            style={{ background: active === i ? 'var(--accent-dim)' : 'transparent', color: active === i ? 'var(--accent)' : 'var(--text-dim)', border: active === i ? '1px solid var(--accent-glow)' : '1px solid transparent' }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock code={tabs[active].code} lang={tabs[active].lang} />
    </div>
  )
}

// Inline markdown-lite: `code` and **bold**
export function Inline({ md }: { md: string }) {
  const parts = md.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={i} style={{ color: 'var(--accent)', background: 'var(--code-bg)', padding: '0 3px', borderRadius: '2px', fontSize: '10px' }}>{p.slice(1, -1)}</code>
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p': return <p key={i} style={{ color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.8 }}><Inline md={b.md} /></p>
          case 'h2': return <h2 key={i} id={b.id} className="pt-2 text-sm font-bold" style={{ color: 'var(--text)' }}><Inline md={b.md} /></h2>
          case 'h3': return <h3 key={i} id={b.id} className="pt-1 text-[13px] font-semibold" style={{ color: 'var(--text)' }}><Inline md={b.md} /></h3>
          case 'h4': return <h4 key={i} id={b.id} className="text-xs font-semibold" style={{ color: 'var(--text)' }}><Inline md={b.md} /></h4>
          case 'quote': return <blockquote key={i} className="px-3 py-2 text-xs" style={{ borderLeft: '2px solid var(--accent-glow)', color: 'var(--text-dim)' }}>{b.md}</blockquote>
          case 'rule': return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          case 'code': return <CodeBlock key={i} code={b.code} lang={b.lang} file={b.file} />
          case 'table': return <MdTable key={i} headers={b.headers} rows={b.rows} />
          case 'list':
            return b.ordered ? (
              <ol key={i} className="space-y-1.5" style={{ color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.7, paddingLeft: '18px', listStyle: 'decimal' }}>
                {b.items.map((it, j) => <li key={j}><Inline md={it} /></li>)}
              </ol>
            ) : (
              <ul key={i} className="space-y-1.5" style={{ color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.7, paddingLeft: '18px', listStyle: 'disc' }}>
                {b.items.map((it, j) => <li key={j}><Inline md={it} /></li>)}
              </ul>
            )
          case 'callout': return <Callout key={i} kind={b.kind} title={b.title} md={b.md} />
          case 'tabs': return <CodeTabs key={i} tabs={b.tabs} />
          case 'html': return <div key={i}>{b.md}</div>
          default: return null
        }
      })}
    </div>
  )
}

export function Toc({ headings }: { headings: { id: string; label: string }[] }) {
  if (!headings.length) return null
  return (
    <div className="hidden lg:block w-52 shrink-0">
      <div className="sticky top-16 space-y-1 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
        <p className="text-[10px] mb-2 font-semibold" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>ON THIS PAGE</p>
        {headings.map(h => (
          <a key={h.id} href={`#${h.id}`} className="block text-[11px] transition-colors no-underline"
            style={{ color: 'var(--text-dim)', padding: '2px 0' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            {h.label}
          </a>
        ))}
      </div>
    </div>
  )
}
