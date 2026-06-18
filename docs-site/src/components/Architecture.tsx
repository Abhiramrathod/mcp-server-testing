import { motion } from 'framer-motion'

const layers = [
  {
    label: 'PUBLIC', name: 'mcp-test-api', color: '#5fffa7',
    desc: 'Public API surface — client builders, domain models, assertions.',
  },
  {
    label: 'INTERNAL', name: 'mcp-test-client', color: '#60a5fa',
    desc: 'RPC orchestration, initialization, exchange tracking.',
  },
  {
    label: 'TRANSPORT', name: 'mcp-test-transport', color: '#a78bfa',
    desc: 'SSE and Streamable HTTP via McpTransport SPI.',
  },
  {
    label: 'CORE', name: 'mcp-test-interfaces / core', color: '#fbbf24',
    desc: 'McpTransport SPI contract, JSON codec, constants, utilities.',
  },
]

export default function Architecture() {
  return (
    <section id="architecture" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-label mb-3">architecture</div>
          <h2 className="section-title">Dependency Tree</h2>
          <p className="section-sub font-mono">tree --charset=ascii</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="terminal-window"
        >
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title ml-2">mcp-testing — dependency graph</span>
          </div>
          <div className="terminal-body">
            <p className="text-xs mb-4" style={{ color: '#666' }}>
              <span className="prompt" /> tree ./mcp-test-*/ --deps
            </p>

            <div className="font-mono text-xs">
              <div className="leading-relaxed">
                <span style={{ color: '#5fffa7' }}>.</span>
                {layers.map((l, i) => (
                  <motion.div
                    key={l.name}
                    initial={{ opacity: 0, x: -4 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="ml-4"
                  >
                    <div className="flex items-start gap-2 py-2 px-2 rounded transition-colors cursor-default"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,255,167,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ color: '#444', flexShrink: 0, width: 12 }}>
                        {i < layers.length - 1 ? '├' : '└'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ color: '#5fffa7', fontWeight: 500 }}>{l.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${l.color}15`, color: l.color, border: `1px solid ${l.color}20` }}>
                            {l.label}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#666' }}>{l.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex items-center gap-2 text-xs" style={{ borderColor: '#1a1a1a', color: '#555' }}>
              <span style={{ color: '#fbbf24' }}>◆</span>
              <span>
                Import only <code style={{ color: '#5fffa7' }}>mcp-test-api</code> — all internal modules are transitive.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
