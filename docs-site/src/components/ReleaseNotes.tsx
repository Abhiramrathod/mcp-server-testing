import { useState, useEffect } from 'react'
import { Github } from 'lucide-react'
import Reveal from './Reveal'

const REPO = 'Abhiramrathod/mcp-testing'
const API = `https://api.github.com/repos/${REPO}/releases?per_page=20`

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
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return '1 day ago'
  if (d < 30) return `${d} days ago`
  const m = Math.floor(d / 30)
  if (m < 12) return `${m} month${m > 1 ? 's' : ''} ago`
  const y = Math.floor(m / 12)
  return `${y} year${y > 1 ? 's' : ''} ago`
}

// Render a subset of markdown: headings, bullets, bold, inline code
function ReleaseBody({ body }: { body: string }) {
  if (!body?.trim()) return <p style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>No release notes provided.</p>

  const lines = body.split('\n')
  const elements: React.ReactNode[] = []

  const renderInline = (text: string, key: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return (
      <span key={key}>
        {parts.map((p, i) => {
          if (p.startsWith('`') && p.endsWith('`'))
            return <code key={i} style={{ color: 'var(--accent)', background: 'var(--code-bg)', padding: '0 3px', borderRadius: '2px', fontSize: '10px' }}>{p.slice(1, -1)}</code>
          if (p.startsWith('**') && p.endsWith('**'))
            return <strong key={i} style={{ color: 'var(--text)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
          return p
        })}
      </span>
    )
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('### ')) {
      elements.push(<p key={i} style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '11px', marginTop: '10px', marginBottom: '3px' }}>{line.slice(4)}</p>)
    } else if (line.startsWith('## ')) {
      elements.push(<p key={i} style={{ color: 'var(--text)', fontWeight: 600, fontSize: '11px', marginTop: '12px', marginBottom: '4px', borderBottom: '1px solid var(--border)', paddingBottom: '3px' }}>{line.slice(3)}</p>)
    } else if (line.startsWith('# ')) {
      // skip top-level heading (it's the release title already shown)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-1.5" style={{ marginBottom: '2px' }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0, fontSize: '11px' }}>·</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.6 }}>{renderInline(line.slice(2), `il-${i}`)}</span>
        </div>
      )
    } else if (line.startsWith('> ')) {
      elements.push(<p key={i} style={{ color: 'var(--text-dim2)', fontSize: '10px', borderLeft: '2px solid var(--border)', paddingLeft: '8px', margin: '4px 0' }}>{renderInline(line.slice(2), `bq-${i}`)}</p>)
    } else if (line.trim()) {
      elements.push(<p key={i} style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.6 }}>{renderInline(line, `p-${i}`)}</p>)
    }
    i++
  }

  return <div>{elements}</div>
}

export default function ReleaseNotes() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => r.json())
      .then((data: Release[]) => {
        setReleases(Array.isArray(data) ? data : [])
        if (data.length > 0) setExpanded(data[0].id)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="releases" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> releases
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim2)' }}>
            $ gh release list --repo {REPO}
          </p>

          {loading && (
            <div className="flex items-center gap-2" style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>
              <span className="glow-dot" />
              fetching releases from GitHub...
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>
              Unable to load releases.{' '}
              <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                View on GitHub ↗
              </a>
            </p>
          )}

          {!loading && !error && releases.length === 0 && (
            <p style={{ color: 'var(--text-dim2)', fontSize: '11px' }}>No releases found.</p>
          )}

          {!loading && !error && releases.length > 0 && (
            <div className="space-y-1">
              {releases.map((r, i) => {
                const isOpen = expanded === r.id
                return (
                  <div key={r.id} className={`fade-in fade-in-${Math.min(i + 1, 6)}`}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      className="w-full flex items-center gap-3 py-1.5 px-2 rounded text-left transition-all"
                      style={{
                        background: isOpen ? 'var(--accent-dim)' : 'transparent',
                        border: `1px solid ${isOpen ? 'var(--accent-glow)' : 'transparent'}`,
                      }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span style={{ color: 'var(--text-dim2)', fontSize: '10px', flexShrink: 0 }}>{isOpen ? '▼' : '▶'}</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '11px', minWidth: '70px' }}>{r.tag_name}</span>
                      {r.prerelease && (
                        <span className="tag" style={{ background: '#fbbf2415', color: '#fbbf24', border: '1px solid #fbbf2420', fontSize: '9px' }}>pre</span>
                      )}
                      {i === 0 && !r.prerelease && (
                        <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)', fontSize: '9px' }}>latest</span>
                      )}
                      <span style={{ color: 'var(--text-dim)', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name && r.name !== r.tag_name ? r.name : ''}
                      </span>
                      <span style={{ color: 'var(--text-dim2)', fontSize: '10px', flexShrink: 0 }}>{timeAgo(r.published_at)}</span>
                    </button>

                    {isOpen && (
                      <div className="fade-in fade-in-1 px-3 py-3 mx-1 mb-1 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <ReleaseBody body={r.body} />
                        <div className="flex items-center gap-3 mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                          <a href={r.html_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs transition-colors"
                            style={{ color: 'var(--text-dim)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                          >
                            <Github size={10} /> View on GitHub
                          </a>
                          <span style={{ color: 'var(--text-dim2)', fontSize: '10px' }}>
                            {new Date(r.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
            >
              <Github size={11} /> View all releases on GitHub ↗
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
