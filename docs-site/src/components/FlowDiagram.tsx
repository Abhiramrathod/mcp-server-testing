import { useState } from 'react'
import Reveal from './Reveal'

const accent = 'var(--accent)'
const dim = 'var(--text-dim)'
const dim2 = 'var(--text-dim2)'
const border = 'var(--border)'
const text = 'var(--text)'

// ── SSE Transport Flow ────────────────────────────────────────────────────────
function SseFlow() {
  return (
    <div className="font-mono text-xs space-y-0">
      <p className="mb-2" style={{ color: dim }}>$ trace — SSE transport (protocol: 2024-11-05)</p>

      {/* Connection phase */}
      <p className="mb-1" style={{ color: dim2 }}>// 1. connect()</p>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>──── GET /sse ────────────────────────────────▶</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>◀─── event: endpoint\ndata: /mcp/message ──────</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>     SSE stream stays open (persistent) ◀──────</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>

      {/* Request phase */}
      <p className="mb-1" style={{ color: dim2 }}>// 2. sendRequest(payload, requestId)</p>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>──── POST /mcp/message ───────────────────────▶</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: dim2 }}>       </span>
        <span style={{ color: dim }}>       Content-Type: application/json</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: dim2 }}>       </span>
        <span style={{ color: dim }}>       MCP-Protocol-Version: 2024-11-05</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: '#60a5fa' }}>server</span>
        <span style={{ color: dim }}>──── HTTP 202 Accepted ───────────────────────▶</span>
        <span style={{ color: accent }}>client</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span style={{ color: '#60a5fa' }}>server</span>
        <span style={{ color: dim }}>──── SSE event: message\ndata: {'{'}jsonrpc response{'}'} ──▶</span>
        <span style={{ color: accent }}>client</span>
      </div>

      {/* Matching */}
      <p className="mb-1" style={{ color: dim2 }}>// 3. response matching (pendingRequests map)</p>
      <div className="pl-2 space-y-0.5" style={{ borderLeft: `2px solid ${border}` }}>
        <p style={{ color: dim }}>pendingRequests.put(requestId, CompletableFuture)</p>
        <p style={{ color: dim }}>SSE message arrives → match by response.id</p>
        <p style={{ color: dim }}>future.complete(response) → unblocks sendRequest()</p>
      </div>
    </div>
  )
}

// ── Streamable HTTP Flow ──────────────────────────────────────────────────────
function StreamableFlow() {
  return (
    <div className="font-mono text-xs space-y-0">
      <p className="mb-2" style={{ color: dim }}>$ trace — Streamable HTTP transport (protocol: 2025-03-26)</p>

      {/* Initialize */}
      <p className="mb-1" style={{ color: dim2 }}>// 1. initialize handshake</p>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>──── POST /mcp ───────────────────────────────▶</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: dim2 }}>       </span>
        <span style={{ color: dim }}>       body: {'{'}method:"initialize", id:1{'}'}</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: '#60a5fa' }}>server</span>
        <span style={{ color: dim }}>──── HTTP 200 + Mcp-Session-Id header ────────▶</span>
        <span style={{ color: accent }}>client</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span style={{ color: dim2 }}>       </span>
        <span style={{ color: dim }}>       body: {'{'}jsonrpc result{'}'} (inline, no SSE)</span>
      </div>

      {/* Regular request */}
      <p className="mb-1" style={{ color: dim2 }}>// 2. every subsequent request (stateless POST)</p>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>──── POST /mcp ───────────────────────────────▶</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: dim2 }}>       </span>
        <span style={{ color: dim }}>       Mcp-Session-Id: {'{'}session-id{'}'}</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span style={{ color: '#60a5fa' }}>server</span>
        <span style={{ color: dim }}>──── HTTP 200 + JSON body (inline response) ──▶</span>
        <span style={{ color: accent }}>client</span>
      </div>

      {/* Session end */}
      <p className="mb-1" style={{ color: dim2 }}>// 3. session termination</p>
      <div className="flex items-center gap-1 mb-0.5">
        <span style={{ color: accent }}>client</span>
        <span style={{ color: dim }}>──── DELETE /mcp ─────────────────────────────▶</span>
        <span style={{ color: '#60a5fa' }}>server</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        <span style={{ color: '#60a5fa' }}>server</span>
        <span style={{ color: dim }}>──── HTTP 200 ────────────────────────────────▶</span>
        <span style={{ color: accent }}>client</span>
      </div>

      <div className="pl-2 space-y-0.5" style={{ borderLeft: `2px solid ${border}` }}>
        <p style={{ color: dim }}>No persistent connection — each POST is independent</p>
        <p style={{ color: dim }}>Session tracked via Mcp-Session-Id header</p>
        <p style={{ color: dim }}>setSessionExpiredHandler() called on 404/session-expired</p>
      </div>
    </div>
  )
}

// ── Module Dependency Graph ───────────────────────────────────────────────────
function ModuleGraph() {
  const modules = [
    {
      name: 'mcp-test-api',
      color: '#5fffa7',
      label: 'PUBLIC',
      items: ['McpClient', 'McpClientConfig', 'ToolsClient', 'ResourcesClient', 'PromptsClient', 'McpExchangeAssertions', 'McpMethod', 'McpServerInfo', 'McpTool / McpToolResult', 'McpResource / McpResourceContent', 'McpResourceTemplate', 'McpPrompt / McpPromptResult', 'McpCompletion', 'McpExchangeSummary'],
    },
    {
      name: 'mcp-test-junit',
      color: '#f87171',
      label: 'PUBLIC',
      items: ['@McpServerTest', 'McpServerExtension', 'McpTestServer', 'McpResponses', 'Transport (SSE | STREAMABLE_HTTP)'],
    },
    {
      name: 'mcp-test-client',
      color: '#60a5fa',
      label: 'INTERNAL',
      items: ['McpTestClient', 'McpToolDirectory', 'McpResourceDirectory', 'McpPromptDirectory', 'McpRpcClient', 'RpcExchangeTracker', 'RpcExchange', 'McpInitializationGuard'],
    },
    {
      name: 'mcp-test-transport',
      color: '#a78bfa',
      label: 'INTERNAL',
      items: ['McpSseTransport', 'McpStreamableHttpTransport', 'SseEventDecoder'],
    },
    {
      name: 'mcp-test-interfaces',
      color: '#fbbf24',
      label: 'SPI',
      items: ['McpTransport (interface)', 'connect()', 'sendRequest()', 'sendNotification()', 'setServerMessageListener()', 'setSessionExpiredHandler()', 'clearSession()'],
    },
    {
      name: 'mcp-test-core',
      color: '#34d399',
      label: 'INTERNAL',
      items: ['McpJsonCodec', 'McpTestClientConstants', 'McpSessionExpiredException', 'McpValidation', 'McpTestClientUtils'],
    },
  ]

  const deps: Record<string, string[]> = {
    'mcp-test-api': ['mcp-test-client'],
    'mcp-test-junit': ['mcp-test-api'],
    'mcp-test-client': ['mcp-test-transport', 'mcp-test-core'],
    'mcp-test-transport': ['mcp-test-interfaces', 'mcp-test-core'],
    'mcp-test-interfaces': [],
    'mcp-test-core': [],
  }

  return (
    <div className="font-mono text-xs">
      <p className="mb-3" style={{ color: dim }}>$ mvn dependency:tree — module graph</p>
      <div className="space-y-3">
        {modules.map(m => (
          <div key={m.name}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: m.color, fontWeight: 600 }}>{m.name}</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}20`, fontSize: '10px' }}>{m.label}</span>
              {deps[m.name].length > 0 && (
                <span style={{ color: dim2 }}>→ {deps[m.name].join(', ')}</span>
              )}
            </div>
            <div className="pl-3 flex flex-wrap gap-x-3 gap-y-0.5" style={{ borderLeft: `2px solid ${m.color}30` }}>
              {m.items.map(item => (
                <span key={item} style={{ color: dim }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${border}` }}>
        <p style={{ color: dim2 }}>└── users import only <span style={{ color: accent }}>mcp-test-api</span> (all others transitive) + optionally <span style={{ color: '#f87171' }}>mcp-test-junit</span></p>
      </div>
    </div>
  )
}

// ── Request Lifecycle ─────────────────────────────────────────────────────────
function RequestLifecycle() {
  const steps = [
    { layer: 'McpClient', action: 'client.tools().callTool("add", args)', color: '#5fffa7' },
    { layer: 'ToolsClient', action: 'toolDirectory.callTool(name, args)', color: '#5fffa7' },
    { layer: 'McpTestClient', action: 'ensureInitialized() → rpcClient.call("tools/call", params)', color: '#60a5fa' },
    { layer: 'McpRpcClient', action: 'build JSON-RPC request {jsonrpc,id,method,params}', color: '#60a5fa' },
    { layer: 'RpcExchangeTracker', action: 'record exchange start (id, method, timestamp)', color: '#60a5fa' },
    { layer: 'McpTransport', action: 'sendRequest(payload, requestId) — SSE or Streamable HTTP', color: '#a78bfa' },
    { layer: 'MCP Server', action: 'process request → return JSON-RPC response', color: '#fbbf24' },
    { layer: 'McpTransport', action: 'return JsonNode response', color: '#a78bfa' },
    { layer: 'RpcExchangeTracker', action: 'record exchange end (latency, status)', color: '#60a5fa' },
    { layer: 'McpRpcClient', action: 'extract result or throw on error', color: '#60a5fa' },
    { layer: 'ToolsClient', action: 'map JsonNode → McpToolResult', color: '#5fffa7' },
    { layer: 'McpClient', action: 'return McpToolResult to test', color: '#5fffa7' },
  ]

  return (
    <div className="font-mono text-xs">
      <p className="mb-3" style={{ color: dim }}>$ strace — request lifecycle (tools/call example)</p>
      <div className="space-y-0.5">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <span style={{ color: dim2, minWidth: '16px' }}>{i < steps.length - 1 ? '├' : '└'}</span>
            <span style={{ color: s.color, minWidth: '160px' }}>{s.layer}</span>
            <span style={{ color: dim }}>{s.action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const diagrams = [
  { label: 'SSE Transport', component: <SseFlow /> },
  { label: 'Streamable HTTP', component: <StreamableFlow /> },
  { label: 'Module Graph', component: <ModuleGraph /> },
  { label: 'Request Lifecycle', component: <RequestLifecycle /> },
]

export default function FlowDiagram() {
  const [active, setActive] = useState(0)

  return (
    <section id="flow" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: dim }}>
            <span className="cmd">#</span> internals
          </p>
          <p className="text-xs mb-4" style={{ color: dim2 }}>$ diagrams — transport flows, module graph, request lifecycle</p>

          <div className="flex flex-wrap gap-1 mb-4 pb-3" style={{ borderBottom: `1px solid ${border}` }}>
            {diagrams.map((d, i) => (
              <button key={d.label} onClick={() => setActive(i)}
                className="px-2.5 py-1 rounded text-xs transition-all"
                style={{
                  background: active === i ? 'var(--accent-dim)' : 'transparent',
                  color: active === i ? accent : dim,
                  border: active === i ? '1px solid var(--accent-glow)' : '1px solid transparent',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div key={active} className="fade-in fade-in-1 overflow-x-auto">
            {diagrams[active].component}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
