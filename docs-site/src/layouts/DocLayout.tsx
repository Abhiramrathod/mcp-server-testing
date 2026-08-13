import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, ChevronLeft, ChevronRight, GitBranch, Clock } from 'lucide-react'
import type { Block, PageMeta } from '../lib/markdown'
import { buildPageMd } from '../lib/markdown'
import { Blocks, Toc } from '../components/Blocks'
import Sidebar from '../components/Sidebar'
import { prevNext, crumbTrail } from '../data/nav'

export interface DocPage {
  meta: PageMeta
  blocks: Block[]
  headings?: { id: string; label: string }[]
  custom?: ReactNode
}

function CopyMarkdownButton({ meta, blocks }: { meta: PageMeta; blocks: Block[] }) {
  const [copied, setCopied] = useState<'md' | 'src' | null>(null)
  const copyMd = () => {
    navigator.clipboard.writeText(buildPageMd(meta, blocks))
    setCopied('md'); setTimeout(() => setCopied(null), 1600)
  }
  return (
    <button onClick={copyMd}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all font-medium"
      style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
    >
      {copied === 'md' ? <Check size={11} /> : <Copy size={11} />}
      {copied === 'md' ? 'copied as .md' : 'copy page as .md'}
    </button>
  )
}

export default function DocLayout({ page }: { page: DocPage }) {
  const { meta, blocks, headings, custom } = page
  const { prev, next } = prevNext(meta.path)
  const crumbs = crumbTrail(meta.path)

  const tocHeadings = headings ?? blocks
    .filter(b => b.t === 'h2' || b.t === 'h3')
    .map(b => ({ id: (b as { id: string }).id, label: (b as { md: string }).md.replace(/`/g, '') }))

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-5 flex gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-14 pb-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[11px] pt-4 mb-3" style={{ color: 'var(--text-dim2)' }}>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {c.path ? <Link to={c.path} className="no-underline" style={{ color: 'var(--accent)' }}>{c.label}</Link> : <span>{c.label}</span>}
              </span>
            ))}
          </nav>

          {/* Title block */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold" style={{ color: 'var(--text)', lineHeight: 1.3 }}>{meta.title}</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>{meta.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: 'var(--text-dim2)' }}>
                <span className="flex items-center gap-1"><Clock size={9} /> {meta.lastUpdated ?? 'current'}</span>
                <a href={`https://github.com/Abhiramrathod/mcp-testing/blob/master/${meta.editPath ?? ''}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 no-underline transition-colors" style={{ color: 'var(--text-dim2)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim2)'}
                >
                  <GitBranch size={9} /> edit on GitHub
                </a>
              </div>
            </div>
            <div className="flex gap-2">
              <CopyMarkdownButton meta={meta} blocks={blocks} />
            </div>
          </div>

          {/* Body + TOC */}
          <div className="flex gap-8">
            <article className="flex-1 min-w-0">
              <div className="output-block">
                {custom ?? <Blocks blocks={blocks} />}
              </div>
            </article>
            <Toc headings={tocHeadings} />
          </div>

          {/* Prev / Next */}
          <div className="mt-10 pt-4 flex justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
            {prev ? (
              <Link to={prev.path} className="group flex items-center gap-1.5 text-xs no-underline" style={{ color: 'var(--text-dim)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <ChevronLeft size={12} /> <span><span className="block text-[9px] uppercase" style={{ color: 'var(--text-dim2)' }}>Prev</span>{prev.label}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={next.path} className="group flex items-center gap-1.5 text-xs no-underline text-right" style={{ color: 'var(--text-dim)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <span><span className="block text-[9px] uppercase" style={{ color: 'var(--text-dim2)' }}>Next</span>{next.label}</span> <ChevronRight size={12} />
              </Link>
            ) : <span />}
          </div>
        </main>
      </div>
    </div>
  )
}
