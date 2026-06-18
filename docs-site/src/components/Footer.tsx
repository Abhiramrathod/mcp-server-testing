import { Github, ExternalLink, Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative py-14 border-t" style={{ background: '#0d0d0d', borderColor: '#1a1a1a' }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid sm:grid-cols-[2fr_1fr_1fr] gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: '#e0e0e0' }}>
              <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(95,255,167,0.1)', color: '#5fffa7', border: '1px solid rgba(95,255,167,0.15)' }}>
                mcp-test
              </span>
              <span style={{ color: '#555' }}>v1.0.15</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm" style={{ color: '#666' }}>
              Production-grade Java testing framework for Model Context Protocol servers.
              Type-safe, fluent assertions, pluggable transports.
            </p>
            <a
              href="https://github.com/Abhiramrathod/mcp-testing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded text-xs transition-all"
              style={{ color: '#666', border: '1px solid #2a2a2a' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#5fffa7'; e.currentTarget.style.borderColor = 'rgba(95,255,167,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#2a2a2a' }}
            >
              <Github size={12} />
              gh:Abhiramrathod/mcp-testing
            </a>
          </div>

          <div>
            <p className="text-xs font-medium mb-3" style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Links</p>
            <div className="space-y-1.5">
              {[
                { label: './install', href: '#installation' },
                { label: './docs', href: '#docs' },
                { label: './examples', href: '#examples' },
                { label: 'maven-central', href: 'https://central.sonatype.com/artifact/io.github.abhiramrathod/mcp-test-api' },
              ].map(l => (
                <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs transition-colors no-underline w-fit"
                  style={{ color: '#555' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#5fffa7'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}
                >
                  {l.label} {l.href.startsWith('http') && <ExternalLink size={10} />}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-3" style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Community</p>
            <div className="space-y-1.5">
              {[
                { label: 'github', href: 'https://github.com/Abhiramrathod/mcp-testing' },
                { label: 'issues', href: 'https://github.com/Abhiramrathod/mcp-testing/issues' },
                { label: 'discussions', href: 'https://github.com/Abhiramrathod/mcp-testing/discussions' },
                { label: 'license (apache 2.0)', href: 'https://github.com/Abhiramrathod/mcp-testing/blob/master/LICENSE' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs transition-colors no-underline w-fit"
                  style={{ color: '#555' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#5fffa7'}
                  onMouseLeave={e => e.currentTarget.style.color = '#555'}
                >
                  {l.label} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 border-t text-xs" style={{ borderColor: '#1a1a1a', color: '#444' }}>
          <span>&copy; {year} Apache 2.0</span>
          <span className="inline-flex items-center gap-1">
            built with <Heart size={10} style={{ color: '#ff4444' }} /> for the community
          </span>
        </div>
      </div>
    </footer>
  )
}
