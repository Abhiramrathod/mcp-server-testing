export default function Footer() {
  return (
    <footer className="py-16 border-t" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-[2fr_1fr_1fr] gap-10 mb-10">
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>MCP Testing Framework</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-sec)' }}>
              Production-grade Java testing framework for Model Context Protocol servers. Type-safe, fluent, extensible — built for the developer community.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Resources</h4>
            <div className="space-y-1.5">
              {[
                { label: 'Installation', href: '#installation' },
                { label: 'Documentation', href: '#docs' },
                { label: 'Examples', href: '#examples' },
                { label: 'Maven Central', href: 'https://central.sonatype.com/artifact/io.github.abhiramrathod/mcp-test-api' },
              ].map(l => (
                <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block text-sm transition-colors no-underline w-fit" style={{ color: 'var(--text-sec)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sec)'}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Community</h4>
            <div className="space-y-1.5">
              {[
                { label: 'GitHub', href: 'https://github.com/Abhiramrathod/mcp-testing' },
                { label: 'Issues', href: 'https://github.com/Abhiramrathod/mcp-testing/issues' },
                { label: 'Discussions', href: 'https://github.com/Abhiramrathod/mcp-testing/discussions' },
                { label: 'License', href: 'https://github.com/Abhiramrathod/mcp-testing/blob/master/LICENSE' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors no-underline w-fit" style={{ color: 'var(--text-sec)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sec)'}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-6 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-ter)' }}>
          <span>&copy; 2024 MCP Testing Framework — Apache 2.0</span>
          <span>Built for the developer community</span>
        </div>
      </div>
    </footer>
  )
}
