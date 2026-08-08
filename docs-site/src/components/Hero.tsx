import { useTypewriter } from '../hooks/useTypewriter'
import { useMavenVersion } from '../hooks/useMavenVersion'
import Logo from './Logo'

function TypeLine({ text, speed = 25, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const { displayed, done } = useTypewriter(text, speed, delay)
  return (
    <span>
      {displayed}
      {!done && <span className="cursor-blink-thin" />}
    </span>
  )
}

export default function Hero() {
  const version = useMavenVersion()
  return (
    <section className="pt-16 pb-8 section-content">
      <div className="flex items-center gap-3 mb-6 fade-in fade-in-1">
        <Logo size={36} />
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text)', lineHeight: 1.2 }}>
            <span style={{ color: 'var(--accent)' }}>mcp</span>-test
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            MCP Testing Framework
          </p>
        </div>
      </div>

      <div className="output-block">
        <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
          <span className="cmd">#</span>{' '}
          <TypeLine text={`mcp-test — MCP Testing Framework v${version}`} speed={20} delay={100} />
        </p>

        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
          <span className="cmd">mcp-test</span>{' '}
          <TypeLine text="is a lightweight Java testing framework for" speed={18} delay={600} />
        </p>
        <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>
          <TypeLine text="Model Context Protocol servers. Type-safe, fluent, with pluggable transports." speed={16} delay={1200} />
        </p>

        <p className="text-xs mb-1">
          <span style={{ color: 'var(--text-dim)' }}>├── runtime:</span>{' '}
          <span style={{ color: 'var(--accent)' }}>Java 17+</span>
          <span style={{ color: 'var(--text-dim2)' }}> │ </span>
          <span style={{ color: 'var(--text-dim)' }}>transports:</span>{' '}
          <span style={{ color: 'var(--accent)' }}>SSE</span>
          <span style={{ color: 'var(--text-dim2)' }}> + </span>
          <span style={{ color: 'var(--accent)' }}>Streamable HTTP</span>
          <span style={{ color: 'var(--text-dim2)' }}> │ </span>
          <span style={{ color: 'var(--text-dim)' }}>status:</span>{' '}
          <span style={{ color: 'var(--accent)' }}>active</span>
          <span className="glow-dot ml-1.5" style={{ verticalAlign: 'middle' }} />
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-5 fade-in fade-in-3">
        <a href="#installation"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
        >
          $ ./install
        </a>
        <a href="#docs"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
          style={{ color: 'var(--text-dim)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-light)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          man docs
        </a>
        <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
          style={{ color: 'var(--text-dim2)', border: '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-dim)' }
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim2)' }
        >
          gh:source
        </a>
      </div>
    </section>
  )
}
