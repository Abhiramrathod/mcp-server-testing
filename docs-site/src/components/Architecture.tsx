import { useState } from 'react'
import Reveal from './Reveal'

const accent = 'var(--accent)'
const dim = 'var(--text-dim)'
const dim2 = 'var(--text-dim2)'
const border = 'var(--border)'

const mainLayers = [
  {
    id: 'user',
    label: 'Your Test Code',
    sublabel: 'Integration tests — real MCP server',
    color: '#5fffa7',
    tag: 'USER',
    desc: 'Write integration tests using the fluent McpClient API. Point it at a real running MCP server. Import only mcp-test-api.',
  },
  {
    id: 'api',
    label: 'mcp-test-api',
    sublabel: 'Public API Layer',
    color: '#5fffa7',
    tag: 'PUBLIC',
    desc: 'McpClient · ToolsClient · ResourcesClient · PromptsClient · McpExchangeAssertions · Domain models. The only artifact you import.',
  },
  {
    id: 'client',
    label: 'mcp-test-client',
    sublabel: 'RPC Orchestration',
    color: '#60a5fa',
    tag: 'INTERNAL',
    desc: 'McpTestClient · McpRpcClient · RpcExchangeTracker · McpInitializationGuard · Directory impls. Transitive — never import directly.',
  },
  {
    id: 'transport',
    label: 'mcp-test-transport',
    sublabel: 'Transport Layer',
    color: '#a78bfa',
    tag: 'INTERNAL',
    desc: 'McpSseTransport · McpStreamableHttpTransport · SseEventDecoder · McpTransport SPI. Transitive — never import directly.',
  },
  {
    id: 'foundation',
    label: 'mcp-test-interfaces + mcp-test-core',
    sublabel: 'Foundation',
    color: '#fbbf24',
    tag: 'SPI / CORE',
    desc: 'McpTransport interface · McpJsonCodec · McpValidation · Constants · McpSessionExpiredException. Transitive — never import directly.',
  },
  {
    id: 'server',
    label: 'MCP Server',
    sublabel: 'Your Application Under Test',
    color: '#34d399',
    tag: 'EXTERNAL',
    desc: 'Any MCP-compliant server. Supports SSE (2024-11-05), Streamable HTTP (2025-03-26) and the stateless protocol (2026-07-28).',
  },
]

export default function Architecture() {
  const [hovered, setHovered] = useState<string | null>(null)

  const allLayers = mainLayers

  return (
    <section id="architecture" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: dim }}>
            <span className="cmd">#</span> architecture
          </p>
          <p className="text-xs mb-5" style={{ color: dim2 }}>$ hld — high-level design · hover a layer for details</p>

          <div className="hld-diagram">
            {/* Left: main vertical stack */}
            <div className="hld-layers">
              {mainLayers.map((l, i) => {
                const isActive = hovered === l.id
                return (
                  <div key={l.id}>
                    <div
                      className="hld-layer"
                      style={{
                        borderColor: isActive ? l.color : `${l.color}30`,
                        background: isActive ? `${l.color}10` : `${l.color}05`,
                        transform: isActive ? 'translateX(4px)' : 'none',
                        transition: 'all 0.25s ease',
                        animationDelay: `${i * 80}ms`,
                      }}
                      onMouseEnter={() => setHovered(l.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="hld-dot" style={{ background: l.color, boxShadow: isActive ? `0 0 8px ${l.color}` : 'none' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span style={{ color: l.color, fontWeight: 600, fontSize: '11px' }}>{l.label}</span>
                            <span className="tag" style={{ background: `${l.color}15`, color: l.color, border: `1px solid ${l.color}20` }}>{l.tag}</span>
                          </div>
                          <p style={{ color: dim2, fontSize: '9px', marginTop: '1px' }}>{l.sublabel}</p>
                        </div>
                      </div>
                      {/* connector to next layer */}
                      {i < mainLayers.length - 1 && (
                        <div className="hld-connector" style={{ borderColor: `${l.color}20` }} />
                      )}
                    </div>
                  </div>
                )
              })}

              {/* vertical flow line — only spans main layers */}
              <div className="hld-flow-line" />
            </div>

            {/* Right: detail panel */}
            <div className="hld-detail">
              <div className="hld-detail-inner" style={{
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0)' : 'translateY(6px)',
                transition: 'all 0.25s ease',
              }}>
                {hovered && (() => {
                  const l = allLayers.find(x => x.id === hovered)!
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                        <span style={{ color: l.color, fontWeight: 600, fontSize: '11px' }}>{l.label}</span>
                      </div>
                      <p style={{ color: dim, fontSize: '10px', lineHeight: 1.7 }}>{l.desc}</p>
                    </>
                  )
                })()}
                {!hovered && (
                  <p style={{ color: dim2, fontSize: '10px' }}>← hover a layer</p>
                )}
              </div>
            </div>
          </div>

          {/* Transport protocol badges */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4" style={{ borderTop: `1px solid ${border}` }}>
            {[
              { label: 'SSE Transport', sub: 'protocol: 2024-11-05', color: '#a78bfa' },
              { label: 'Streamable HTTP', sub: 'protocol: 2025-03-26', color: '#60a5fa' },
              { label: 'Stateless', sub: 'protocol: 2026-07-28+', color: '#fbbf24' },
              { label: 'Custom Transport', sub: 'implement McpTransport SPI', color: '#fbbf24' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 px-2 py-1 rounded"
                style={{ background: `${b.color}08`, border: `1px solid ${b.color}25` }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: b.color }} />
                <span style={{ color: b.color, fontSize: '10px', fontWeight: 600 }}>{b.label}</span>
                <span style={{ color: dim2, fontSize: '9px' }}>{b.sub}</span>
              </div>
            ))}
          </div>

          <p className="text-xs mt-3 fade-in fade-in-5" style={{ color: dim2 }}>
            └── import only <span style={{ color: accent }}>mcp-test-api</span> — all others are transitive
          </p>
        </div>
      </Reveal>
    </section>
  )
}
