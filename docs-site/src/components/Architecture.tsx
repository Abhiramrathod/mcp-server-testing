const layers = [
  { label: 'PUBLIC', name: 'mcp-test-api', color: '#5fffa7', desc: 'Public API — fluent builders, domain models, assertions.' },
  { label: 'INTERNAL', name: 'mcp-test-client', color: '#60a5fa', desc: 'RPC orchestration, initialization, exchange tracking.' },
  { label: 'TRANSPORT', name: 'mcp-test-transport', color: '#a78bfa', desc: 'SSE + Streamable HTTP via McpTransport SPI.' },
  { label: 'CORE', name: 'mcp-test-interfaces / core', color: '#fbbf24', desc: 'SPI contract, JSON codec, constants, validation.' },
]

export default function Architecture() {
  return (
    <section id="architecture" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs dim mb-3">
          <span className="cmd">#</span> architecture
        </p>
        <p className="text-xs dim2 mb-3">$ tree --deps --charset=ascii</p>

        <div className="font-mono">
          <p className="text-xs" style={{ color: '#5fffa7' }}>.</p>
          {layers.map((l, i) => (
            <div key={l.name} className="ml-4 py-1">
              <div className="flex items-start gap-2">
                <span className="text-xs shrink-0" style={{ color: '#444' }}>
                  {i < layers.length - 1 ? '├──' : '└──'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium" style={{ color: '#5fffa7' }}>{l.name}</span>
                    <span className="tag" style={{ background: `${l.color}15`, color: l.color, border: `1px solid ${l.color}20` }}>
                      {l.label}
                    </span>
                  </div>
                  <p className="text-xs dim2 mt-0.5">{l.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs dim mt-4">
          <span className="dim">└──</span> Import only <span style={{ color: '#5fffa7' }}>mcp-test-api</span> — all others are transitive.
        </p>
      </div>
    </section>
  )
}
