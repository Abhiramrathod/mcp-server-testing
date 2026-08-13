import { Link } from 'react-router-dom'
import { ArrowLeft, Github, Clock } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import Logo from '../components/Logo'

const REPO = 'Abhiramrathod/mcp-testing'
const NEXT_VERSION = '1.0.39'

const SECTION_COLORS: Record<string, string> = {
  'breaking': '#f87171',
  'features': '#5fffa7',
  'fix': '#60a5fa',
  'docs': '#fbbf24',
}

const sections = [
  {
    title: 'features',
    color: SECTION_COLORS['features'],
    items: [
      'Real-server integration testing — <code>RealMcpServerTestBase</code> boots the bundled <code>DummyMcpServer</code> per test class and gives every test a fresh, initialized <code>McpClient</code> (or point it at your own server with <code>-Dmcp.test.server.url</code>).',
      'Stateless protocol support (<code>2026-07-28</code>) — <code>server/discover</code> for version negotiation, results carry <code>resultType</code>/<code>ttlMs</code>/<code>cacheScope</code>, change notifications flow over <code>subscriptions/listen</code>, no <code>initialize</code> handshake.',
      'Bundled <code>DummyMcpServer</code> reference server — SSE transport (<code>GET /sse</code> + <code>POST /message</code>) serving calculator/greet tools, file resources, and translate/code-review prompts.',
      'Docs site revamp — new integration-testing guide, single-dependency Maven/Gradle install, updated module and architecture pages.',
    ],
  },
  {
    title: 'breaking',
    color: SECTION_COLORS['breaking'],
    items: [
      'Removed the <code>mcp-test-junit</code> module — JUnit testkit mode, <code>@McpServerTest</code>, <code>@Transport</code>, <code>McpServerExtension</code>, and <code>McpTestServer</code> are gone. Test against the bundled reference server (or your own) with <code>mcp-test-api</code> only.',
      'Removed <code>ExampleServerFixtures</code> — replaced by <code>RealMcpServerTestBase</code>.',
    ],
  },
  {
    title: 'fix',
    color: SECTION_COLORS['fix'],
    items: [
      'SSE handler no longer pins a fixed thread pool — keep-alive writes detect client disconnects so handler threads are reused, fixing "Timed out waiting for SSE stream" under load.',
    ],
  },
  {
    title: 'docs',
    color: SECTION_COLORS['docs'],
    items: [
      'Installation: one dependency (<code>mcp-test-api</code>), no JUnit testkit mode.',
      'New <code>/integration-testing</code> guide with HLD diagram and lifecycle.',
      'Architecture and flow diagrams updated for the removed JUnit layer.',
    ],
  },
]

function ReleaseItem({ item }: { item: string }) {
  const parts = item.split(/(`[^`]+`)/g)
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '3px', paddingLeft: '4px' }}>
      <span style={{ color: 'var(--accent)', flexShrink: 0, fontSize: '11px', marginTop: '1px' }}>·</span>
      <span style={{ color: 'var(--text-dim)', fontSize: '11px', lineHeight: 1.65 }}>
        {parts.map((p, i) =>
          p.startsWith('`') && p.endsWith('`')
            ? <code key={i} style={{ color: 'var(--accent)', background: 'var(--code-bg)', padding: '0 3px', borderRadius: '2px', fontSize: '10px' }}>{p.slice(1, -1)}</code>
            : <span key={i}>{p}</span>
        )}
      </span>
    </div>
  )
}

function PageNavbar() {
  const { theme, toggle } = useTheme()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-720px mx-auto flex items-center justify-between h-12 px-5">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={18} showText />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs"
            style={{ color: 'var(--text-dim)', border: '1px solid var(--border)', textDecoration: 'none' }}
          >
            <ArrowLeft size={11} /> main docs
          </Link>
          <button onClick={toggle}
            className="px-2.5 py-1 rounded text-xs font-medium"
            style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
          >
            {theme === 'dark' ? '☀︎ light' : '☾ dark'}
          </button>
          <a href={`https://github.com/${REPO}`} target="_blank" rel="noopener noreferrer"
            className="px-2.5 py-1 rounded text-xs" style={{ color: 'var(--text-dim2)', border: '1px solid var(--border)' }}
          >
            gh:repo
          </a>
        </div>
      </div>
    </nav>
  )
}

export default function UpcomingRelease() {
  return (
    <>
      <PageNavbar />
      <main className="pt-14 pb-12">
        <section className="py-8 section-content">
          <div className="output-block">
            <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>
              <span className="cmd">#</span> upcoming-release
            </p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-dim2)' }}>
              $ gh release view --repo {REPO} --next
            </p>

            {/* Release header */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '13px' }}>v{NEXT_VERSION}</span>
              <span className="tag" style={{ background: '#5fffa715', color: '#5fffa7', border: '1px solid #5fffa730' }}>next</span>
              <span className="tag" style={{ background: '#fbbf2415', color: '#fbbf24', border: '1px solid #fbbf2420' }}>planned</span>
              <span className="flex items-center gap-1" style={{ color: 'var(--text-dim2)', fontSize: '10px' }}>
                <Clock size={10} /> unreleased · in development
              </span>
            </div>

            {/* What's next */}
            <div className="mb-4 px-3 py-2.5 rounded text-xs font-mono" style={{ background: '#5fffa708', border: '1px solid #5fffa720' }}>
              <p style={{ color: 'var(--text-dim2)' }}>// This release ships the integration-testing overhaul plus the stateless protocol client.</p>
              <p style={{ color: 'var(--text-dim2)' }}>// Current published version: v1.0.38</p>
            </div>

            {/* Sections */}
            {sections.map(section => (
              <div key={section.title}>
                <div style={{ marginTop: '18px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ height: '1px', width: '12px', background: section.color, flexShrink: 0 }} />
                  <span style={{ color: section.color, fontWeight: 700, fontSize: '11px', letterSpacing: '0.3px' }}>{section.title}</span>
                  <div style={{ flex: 1, height: '1px', background: `${section.color}20` }} />
                </div>
                {section.items.map((item, i) => <ReleaseItem key={i} item={item} />)}
              </div>
            ))}

            {/* Footer */}
            <div className="flex items-center gap-4 mt-5 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <a href={`https://github.com/${REPO}/compare/v1.0.38...master`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: 'var(--text-dim)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
              >
                <Github size={11} /> v1.0.38...master diff
              </a>
              <a href={`https://github.com/${REPO}/releases`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: 'var(--text-dim2)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim2)'}
              >
                published releases ↗
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
