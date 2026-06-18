import Reveal from './Reveal'

const layers = [
  { label: 'PUBLIC', name: 'mcp-test-api', color: '#5fffa7', desc: 'Public API — fluent builders, domain models, assertions.' },
  { label: 'INTERNAL', name: 'mcp-test-client', color: '#60a5fa', desc: 'RPC orchestration, initialization, exchange tracking.' },
  { label: 'TRANSPORT', name: 'mcp-test-transport', color: '#a78bfa', desc: 'SSE + Streamable HTTP via McpTransport SPI.' },
  { label: 'CORE', name: 'mcp-test-interfaces / core', color: '#fbbf24', desc: 'SPI contract, JSON codec, constants, validation.' },
]

export default function Architecture() {
  return (
    <section id="architecture" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> architecture
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>$ tree --deps --charset=ascii</p>

          <div className="font-mono">
            <p className="text-xs" style={{ color: 'var(--accent)' }}>.</p>
            {layers.map((l, i) => (
              <div key={l.name} className={`fade-in fade-in-${Math.min(i + 1, 6)} ml-4 py-1`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-dim)' }}>
                    {i < layers.length - 1 ? '├──' : '└──'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{l.name}</span>
                      <span className="tag" style={{ background: `${l.color}15`, color: l.color, border: `1px solid ${l.color}20` }}>
                        {l.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{l.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs mt-4 fade-in fade-in-5" style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--text-dim)' }}>└──</span> Import only <span style={{ color: 'var(--accent)' }}>mcp-test-api</span> — all others are transitive.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
