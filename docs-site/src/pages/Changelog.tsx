import { useState, useEffect } from 'react'
import DocLayout from '../layouts/DocLayout'
import { Blocks } from '../components/Blocks'
import type { Block } from '../lib/markdown'
import { ExternalLink, RefreshCw, Tag, Calendar } from 'lucide-react'

const REPO = 'Abhiramrathod/mcp-testing'

const introBlocks: Block[] = [
  { t: 'p', md: 'Release history for `mcp-test`, loaded live from [GitHub Releases](https://github.com/Abhiramrathod/mcp-testing/releases). Latest tag: **v1.5.0**.' },
  {
    t: 'callout', kind: 'note',
    md: 'The releases below are fetched from the GitHub API. Click a version tag to open its full release page.',
  },
]

interface GhRelease {
  tag_name: string
  name: string
  published_at: string
  body: string
  html_url: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function inline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) => {
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link)
          return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{link[1]}</a>
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={i} style={{ color: 'var(--accent)', background: 'var(--code-bg)', padding: '0 3px', borderRadius: '2px', fontSize: '10px' }}>{p.slice(1, -1)}</code>
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

function ReleaseBody({ body }: { body: string }) {
  const lines = body.split('\n')
  const items: { type: 'h' | 'li' | 'p' | 'quote'; text: string; level?: number }[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line === '---') continue
    if (/^#+\s/.test(line)) {
      const level = line.match(/^#+/)![0].length
      if (level === 1) continue
      items.push({ type: 'h', text: line.replace(/^#+\s*/, ''), level })
    } else if (line.startsWith('- ')) {
      items.push({ type: 'li', text: line.slice(2) })
    } else if (line.startsWith('> ')) {
      items.push({ type: 'quote', text: line.slice(2) })
    } else {
      items.push({ type: 'p', text: line })
    }
  }
  return (
    <div className="space-y-1.5 mt-2">
      {items.map((it, i) => {
        switch (it.type) {
          case 'h':
            return <p key={i} style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '10px', letterSpacing: '0.3px', textTransform: 'uppercase' as const, marginTop: it.level === 3 ? 4 : 8 }}>{it.text}</p>
          case 'li':
            return <p key={i} style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.7, paddingLeft: 14, position: 'relative' as const }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>·</span>
              {inline(it.text)}
            </p>
          case 'quote':
            return <p key={i} className="px-2 py-1" style={{ color: 'var(--text-dim)', fontSize: '11px', background: 'var(--accent-dim)', borderLeft: '2px solid var(--accent-glow)' }}>{inline(it.text)}</p>
          default:
            return <p key={i} style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.7 }}>{inline(it.text)}</p>
        }
      })}
    </div>
  )
}

function Releases() {
  const [releases, setReleases] = useState<GhRelease[] | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true); setError(false)
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=10`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: GhRelease[]) => { setReleases(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(load, [])

  if (loading)
    return (
      <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
        <RefreshCw size={11} className="animate-spin" /> fetching releases from GitHub…
      </p>
    )
  if (error || !releases)
    return (
      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-dim)' }}>
        <span>Couldn’t load releases from GitHub.</span>
        <button onClick={load} className="px-2 py-0.5 rounded" style={{ color: 'var(--accent)', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', cursor: 'pointer' }}>retry</button>
        <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>open on GitHub ↗</a>
      </div>
    )

  return (
    <div className="space-y-4">
      {releases.map(r => (
        <div key={r.tag_name} className="px-3 py-2.5 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap items-center gap-2">
            <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 no-underline transition-colors"
              style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '12px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
            >
              <Tag size={11} /> {r.tag_name}
            </a>
            <span className="tag" style={{ background: '#5fffa715', color: '#5fffa7', border: '1px solid #5fffa730' }}>latest</span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-dim2)' }}>
              <Calendar size={10} /> {formatDate(r.published_at)}
            </span>
            {r.name && r.name !== r.tag_name && (
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{r.name}</span>
            )}
          </div>
          {r.body && <ReleaseBody body={r.body} />}
        </div>
      ))}
      <p className="text-xs" style={{ color: 'var(--text-dim2)' }}>
        <ExternalLink size={10} style={{ verticalAlign: '-1px' }} />{' '}
        Older tags (v1.0.34 … v1.0.38) exist on GitHub but have no release notes — see{' '}
        <a href={`https://github.com/${REPO}/tags`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>tags</a>.
      </p>
    </div>
  )
}

export default function ChangelogPage() {
  return <DocLayout page={{
    meta: {
      path: '/changelog',
      title: 'Changelog',
      description: 'Release history for mcp-test, loaded live from GitHub Releases.',
      section: 'Project',
      keywords: ['changelog', 'releases', 'versions'],
      editPath: 'docs-site/src/pages/Changelog.tsx',
    },
    blocks: introBlocks,
    custom: (
      <div className="space-y-4">
        <Blocks blocks={introBlocks} />
        <Releases />
      </div>
    ),
  }} />
}
