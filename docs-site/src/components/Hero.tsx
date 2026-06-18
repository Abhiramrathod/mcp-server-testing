export default function Hero() {
  return (
    <section className="pt-16 pb-8 section-content">
      <div className="output-block">
        <p className="text-xs dim2 mb-4"># mcp-test — MCP Testing Framework v1.0.15</p>

        <p className="text-sm font-semibold mb-1">
          <span className="cmd">mcp-test</span>{' '}
          <span className="text-sub">is a lightweight Java testing framework for</span>
        </p>
        <p className="text-sm mb-3 text-sub">
          Model Context Protocol servers. Type-safe, fluent, with pluggable transports.
        </p>

        <p className="text-xs mb-1">
          <span className="dim">├── runtime:</span>{' '}
          <span style={{ color: '#5fffa7' }}>Java 17+</span>
          <span className="dim2"> │ </span>
          <span className="dim">transports:</span>{' '}
          <span style={{ color: '#5fffa7' }}>SSE</span>
          <span className="dim2"> + </span>
          <span style={{ color: '#5fffa7' }}>Streamable HTTP</span>
          <span className="dim2"> │ </span>
          <span className="dim">status:</span>{' '}
          <span style={{ color: '#5fffa7' }}>active</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full ml-1" style={{ background: '#5fffa7', boxShadow: '0 0 4px rgba(95,255,167,0.6)', verticalAlign: 'middle' }} />
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <a href="#installation"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
          style={{ background: 'rgba(95,255,167,0.08)', color: '#5fffa7', border: '1px solid rgba(95,255,167,0.15)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(95,255,167,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(95,255,167,0.08)' }}
        >
          $ ./install
        </a>
        <a href="#docs"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
          style={{ color: '#666', border: '1px solid #1a1a1a' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = '#2a2a2a' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#1a1a1a' }}
        >
          man docs
        </a>
        <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
          style={{ color: '#444', border: '1px solid #181818' }}
          onMouseEnter={e => e.currentTarget.style.color = '#666' }
          onMouseLeave={e => e.currentTarget.style.color = '#444' }
        >
          gh:source
        </a>
      </div>
    </section>
  )
}
