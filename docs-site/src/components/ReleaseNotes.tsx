import { useState, useEffect } from 'react'
import { Github } from 'lucide-react'
import Reveal from './Reveal'

const REPO = 'Abhiramrathod/mcp-testing'

interface Release {
  id: number
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body: string
  prerelease: boolean
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return '1 day ago'
  if (d < 30) return `${d} days ago`
  const m = Math.floor(d / 30)
  if (m < 12) return `${m} month${m > 1 ? 's' : ''} ago`
  const y = Math.floor(m / 12)
  return `${y} year${y > 1 ? 's' : ''} ago`
}

// Section heading → color
const SECTION_COLORS: Record<string, string> = {
  'breaking': '#f87171',
  'features': '#5fffa7',
  'fix': '#60a5fa',
  'perf': '#a78bfa',
  'docs': '#fbbf24',
  'deps': '#34d399',
  'test': '#60a5fa',
  'refactor': '#a78bfa',
  'ci': '#fbbf24',
  'other': 'var(--text-dim)',
  'contributors': '#5fffa7',
  'upgrade': '#fbbf24',
  'changelog': 'var(--text-dim)',
  "what's": 'var(--accent)',
}

function sectionColor(heading: string) {
  const key = heading.toLowerCase().split(/\s+/)[0].replace(/[^a-z']/g, '')
  return SECTION_COLORS[key] ?? 'var(--accent)'
}

// Render inline markdown: `code`, **bold**, [@user](url), [text](url)
function Inline({ text }: { text: string }) {
  // Split on backtick code, bold, and markdown links
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[@?[^\]]+\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`'))
          return <code key={i} style={{ color: 'var(--accent)', background: 'var(--code-bg)', padding: '0 3px', borderRadius: '2px', fontSize: '10px' }}>{p.slice(1, -1)}</code>
        if (p.startsWith('**') && p.endsWith('**'))
          return <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
        const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch)
          return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >{linkMatch[1]}</a>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

function ReleaseBody({ body, tag }: { body: string; tag: string }) {
  if (!body?.trim())
    return <p style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>No release notes for {tag}.</p>

  const lines = body.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // ## heading (skip the top-level # Release vX.X.X — already shown in header)
    if (line.startsWith('# ')) { i++; continue }

    if (line.startsWith('## ')) {
      const heading = line.slice(3).trim()
      const color = sectionColor(heading)
      nodes.push(
        <div key={i} style={{ marginTop: '16px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ height: '1px', width: '12px', background: color, flexShrink: 0 }} />
          <span style={{ color, fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>{heading}</span>
          <div style={{ flex: 1, height: '1px', background: `${color}20` }} />
        </div>
      )
      i++; continue
    }

    // ### sub-heading
    if (line.startsWith('### ')) {
      const heading = line.slice(4).trim()
      const color = sectionColor(heading)
      nodes.push(
        <p key={i} style={{ color, fontWeight: 600, fontSize: '11px', marginTop: '10px', marginBottom: '4px' }}>
          {heading}
        </p>
      )
      i++; continue
    }

    // blockquote > (summary / published lines)
    if (line.startsWith('> ')) {
      nodes.push(
        <p key={i} style={{ color: 'var(--text-dim2)', fontSize: '10px', paddingLeft: '8px', borderLeft: '2px solid var(--border)', margin: '2px 0' }}>
          <Inline text={line.slice(2)} />
        </p>
      )
      i++; continue
    }

    // bullet - item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.slice(2)
      nodes.push(
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '3px', paddingLeft: '4px' }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0, fontSize: '11px', marginTop: '1px' }}>·</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.65 }}>
            <Inline text={content} />
          </span>
        </div>
      )
      i++; continue
    }

    // blank line
    if (!trimmed) { i++; continue }

    // plain paragraph
    nodes.push(
      <p key={i} style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.65, marginBottom: '3px' }}>
        <Inline text={trimmed} />
      </p>
    )
    i++
  }

  return <div>{nodes}</div>
}

export default function ReleaseNotes() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then(r => r.json())
      .then((data: Release[]) => setReleases(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const release = releases[selected]

  return (
    <section id="releases" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> release-notes
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim2)' }}>
            $ gh release view --repo {REPO}
          </p>

          {loading && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>
              <span className="glow-dot" /> fetching release notes from GitHub...
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>
              Unable to load.{' '}
              <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                View on GitHub ↗
              </a>
            </p>
          )}

          {!loading && !error && releases.length === 0 && (
            <p style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>No releases published yet.</p>
          )}

          {!loading && !error && releases.length > 0 && (
            <>
              {/* Version selector dropdown */}
              <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-dim2)', fontSize: '10px', flexShrink: 0 }}>$ version</span>
                <select
                  value={selected}
                  onChange={e => setSelected(Number(e.target.value))}
                  className="font-mono text-xs px-2 py-1 rounded"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-glow)',
                    outline: 'none',
                    cursor: 'pointer',
                    minWidth: '140px',
                  }}
                >
                  {releases.map((r, i) => (
                    <option key={r.id} value={i} style={{ background: 'var(--bg-surface)', color: 'var(--text)' }}>
                      {r.tag_name}{i === 0 && !r.prerelease ? '  ← latest' : ''}{r.prerelease ? '  (pre)' : ''}
                    </option>
                  ))}
                </select>
                <span style={{ color: 'var(--text-dim2)', fontSize: '10px' }}>
                  {releases.length} release{releases.length !== 1 ? 's' : ''} total
                </span>
              </div>

              {/* Release header */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px' }}>{release.tag_name}</span>
                {selected === 0 && !release.prerelease && (
                  <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>latest</span>
                )}
                {release.prerelease && (
                  <span className="tag" style={{ background: '#fbbf2415', color: '#fbbf24', border: '1px solid #fbbf2420' }}>pre-release</span>
                )}
                <span style={{ color: 'var(--text-dim2)', fontSize: '10px' }}>
                  {new Date(release.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}{timeAgo(release.published_at)}
                </span>
              </div>

              {/* Full release notes body */}
              <div key={release.id} className="fade-in fade-in-1">
                <ReleaseBody body={release.body} tag={release.tag_name} />
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 mt-5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <a href={release.html_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-dim)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <Github size={11} /> View {release.tag_name} on GitHub
                </a>
                <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'var(--text-dim2)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim2)'}
                >
                  all releases ↗
                </a>
              </div>
            </>
          )}
        </div>
      </Reveal>
    </section>
  )
}
