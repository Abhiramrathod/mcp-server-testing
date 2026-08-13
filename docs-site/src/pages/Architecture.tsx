import { useState } from 'react'
import DocLayout from '../layouts/DocLayout'
import { Blocks } from '../components/Blocks'
import type { Block } from '../lib/markdown'

const dim = 'var(--text-dim)'
const dim2 = 'var(--text-dim2)'

const layers = [
  {
    id: 'user', label: 'Your Test Code', sublabel: 'Integration tests — real MCP server',
    color: '#5fffa7', tag: 'USER',
    desc: 'Write integration tests with the fluent McpClient API. Point it at a real running MCP server. Import only mcp-test-api.',
  },
  {
    id: 'api', label: 'mcp-test-api', sublabel: 'Public API layer', color: '#5fffa7', tag: 'PUBLIC',
    desc: 'McpClient · ToolsClient · ResourcesClient · PromptsClient · McpExchangeAssertions · domain models. The only artifact you import.',
  },
  {
    id: 'client', label: 'mcp-test-client', sublabel: 'RPC orchestration', color: '#60a5fa', tag: 'INTERNAL',
    desc: 'McpTestClient · McpRpcClient · RpcExchangeTracker · McpInitializationGuard · directory implementations. Transitive.',
  },
  {
    id: 'transport', label: 'mcp-test-transport', sublabel: 'Transport layer', color: '#a78bfa', tag: 'INTERNAL',
    desc: 'McpSseTransport · McpStreamableHttpTransport · SseEventDecoder · McpTransport SPI. Transitive.',
  },
  {
    id: 'foundation', label: 'mcp-test-interfaces + mcp-test-core', sublabel: 'Foundation', color: '#fbbf24', tag: 'SPI / CORE',
    desc: 'McpTransport interface · McpJsonCodec · McpValidation · constants · exceptions. Transitive.',
  },
  {
    id: 'server', label: 'MCP Server', sublabel: 'Your application under test', color: '#34d399', tag: 'EXTERNAL',
    desc: 'Any MCP-compliant server. Supports SSE (2024-11-05), Streamable HTTP (2025-03-26) and the stateless protocol (2026-07-28).',
  },
]

function HldDiagram() {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div className="hld-diagram">
      <div className="hld-layers">
        {layers.map((l, i) => {
          const isActive = hovered === l.id
          return (
            <div key={l.id}>
              <div className="hld-layer" style={{
                borderColor: isActive ? l.color : `${l.color}30`,
                background: isActive ? `${l.color}10` : `${l.color}05`,
                transform: isActive ? 'translateX(4px)' : 'none',
                animationDelay: `${i * 80}ms`,
              }}
                onMouseEnter={() => setHovered(l.id)} onMouseLeave={() => setHovered(null)}
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
                {i < layers.length - 1 && <div className="hld-connector" style={{ borderColor: `${l.color}20` }} />}
              </div>
            </div>
          )
        })}
        <div className="hld-flow-line" />
      </div>
      <div className="hld-detail">
        <div className="hld-detail-inner" style={{ opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(6px)' }}>
          {hovered ? (
            (() => {
              const l = layers.find(x => x.id === hovered)!
              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
                    <span style={{ color: l.color, fontWeight: 600, fontSize: '11px' }}>{l.label}</span>
                  </div>
                  <p style={{ color: dim, fontSize: '10px', lineHeight: 1.7 }}>{l.desc}</p>
                </>
              )
            })()
          ) : (
            <p style={{ color: dim2, fontSize: '10px' }}>← hover a layer for details</p>
          )}
        </div>
      </div>
    </div>
  )
}

const blocks: Block[] = [
  { t: 'h2', id: 'layered-design', md: 'Layered design' },
  { t: 'p', md: 'The framework is split into **six Maven modules** with a strict dependency direction: your tests depend only on `mcp-test-api`, which depends on the client, transport, and foundation modules. Each layer is isolated so internals never leak into your test code.' },
  {
    t: 'table',
    headers: ['Module', 'Scope', 'Key types', 'Import directly?'],
    rows: [
      ['mcp-test-api', 'Public', 'McpClient, ToolsClient, ResourcesClient, PromptsClient, McpExchangeAssertions', 'Yes'],
      ['mcp-test-client', 'Internal', 'McpTestClient, McpRpcClient, RpcExchangeTracker', 'No'],
      ['mcp-test-transport', 'Internal', 'McpSseTransport, McpStreamableHttpTransport', 'No'],
      ['mcp-test-interfaces', 'SPI', 'McpTransport', 'No'],
      ['mcp-test-core', 'Internal', 'McpJsonCodec, McpValidation, constants', 'No'],
      ['mcp-test-examples', 'Reference', 'DummyMcpServer, RealMcpServerTestBase, example tests', 'No'],
    ],
  },
  { t: 'h2', id: 'diagram', md: 'High-level diagram' },
  { t: 'h3', id: 'module-responsibilities', md: 'Module responsibilities' },
  { t: 'h4', id: 'mcp-test-api', md: 'mcp-test-api — the public surface' },
  { t: 'p', md: 'The only artifact your tests import. Provides `McpClient`, its sub-clients for tools/resources/prompts, the typed domain models (`McpTool`, `McpResource`, `McpPrompt`, results), fluent assertions, `McpClientConfig`, and `McpMethod`. See **API Reference**.' },
  { t: 'h4', id: 'mcp-test-client', md: 'mcp-test-client — orchestration' },
  { t: 'p', md: 'Wires everything together: initialization guards, the JSON-RPC `McpRpcClient`, exchange tracking (`RpcExchangeTracker`), and the concrete directory implementations. Handles both legacy and stateless eras.' },
  { t: 'h4', id: 'mcp-test-transport', md: 'mcp-test-transport — transports' },
  { t: 'p', md: 'Implements the `McpTransport` SPI: `McpSseTransport` for legacy SSE (2024-11-05) and `McpStreamableHttpTransport` for Streamable HTTP and the stateless protocol. The SSE event decoder is here too.' },
  { t: 'h4', id: 'mcp-test-interfaces', md: 'mcp-test-interfaces — the SPI' },
  { t: 'p', md: 'Defines `McpTransport` (connect, sendRequest, sendNotification, close, listener) so you can plug in custom transports. No dependencies — the foundation every module builds on.' },
  { t: 'h4', id: 'mcp-test-core', md: 'mcp-test-core — shared utilities' },
  { t: 'p', md: '`McpJsonCodec` (Jackson), validation helpers, `McpProtocolVersions`, and the constants (headers, endpoints, default values) shared across modules.' },
  { t: 'h4', id: 'mcp-test-examples', md: 'mcp-test-examples — reference server + tests' },
  { t: 'p', md: 'Bundles `DummyMcpServer` (a real MCP server over SSE), `RealMcpServerTestBase`, and 31 example tests covering tools, resources, prompts, exchanges, and a comprehensive end-to-end flow.' },
  { t: 'h2', id: 'design-principles', md: 'Design principles' },
  {
    t: 'list',
    items: [
      '**Type safety** — domain models instead of raw JSON maps; compile-time validation.',
      '**Fluent API** — chainable assertions read like sentences.',
      '**Modularity** — one public artifact; internals stay internal and swappable.',
      '**Pluggable transports** — swap SSE for Streamable HTTP with a one-line builder change.',
      '**Observability** — every JSON-RPC exchange recorded with latency, status, and error detail.',
    ],
  },
]

const DIAGRAM_INDEX = 4

export default function ArchitecturePage() {
  return <DocLayout page={{
    meta: {
      path: '/architecture',
      title: 'Architecture',
      description: 'How the six mcp-test modules fit together, and the design principles behind them.',
      section: 'Core Concepts',
      keywords: ['architecture', 'modules', 'design', 'layers'],
      editPath: 'docs-site/src/pages/Architecture.tsx',
    },
    blocks,
    headings: [
      { id: 'layered-design', label: 'Layered design' },
      { id: 'diagram', label: 'High-level diagram' },
      { id: 'module-responsibilities', label: 'Module responsibilities' },
      { id: 'design-principles', label: 'Design principles' },
    ],
    custom: (
      <div className="space-y-4">
        <Blocks blocks={blocks.slice(0, DIAGRAM_INDEX)} />
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>$ hld — high-level design · hover a layer</p>
        <HldDiagram />
        <Blocks blocks={blocks.slice(DIAGRAM_INDEX)} />
      </div>
    ),
  }} />
}
