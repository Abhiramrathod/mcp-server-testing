import { useState, useEffect, useRef } from 'react'
import Reveal from './Reveal'

const accent = 'var(--accent)'
const dim = 'var(--text-dim)'
const dim2 = 'var(--text-dim2)'
const border = 'var(--border)'

// ── Animated Arrow ────────────────────────────────────────────────────────────
function AnimatedArrow({ delay = 0, reverse = false, color = '#5fffa7', label = '', sublabel = '' }: {
  delay?: number; reverse?: boolean; color?: string; label?: string; sublabel?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5" style={{ animationDelay: `${delay}ms` }}>
      {label && <span className="text-xs" style={{ color, fontSize: '10px' }}>{label}</span>}
      {sublabel && <span style={{ color: dim2, fontSize: '9px' }}>{sublabel}</span>}
      <div className="relative w-full flex items-center" style={{ height: '20px' }}>
        <div className="flow-arrow-line" style={{
          background: `linear-gradient(${reverse ? '270deg' : '90deg'}, transparent, ${color}80, ${color})`,
          animationDelay: `${delay}ms`
        }} />
        <div className="flow-arrow-head" style={{
          borderLeft: `6px solid ${color}`,
          [reverse ? 'left' : 'right']: 0,
          [reverse ? 'right' : 'left']: 'auto',
          transform: reverse ? 'scaleX(-1)' : 'none',
          animationDelay: `${delay}ms`
        }} />
      </div>
    </div>
  )
}

// ── Node Box ──────────────────────────────────────────────────────────────────
function Node({ label, sublabel, color, pulse = false }: { label: string; sublabel?: string; color: string; pulse?: boolean }) {
  return (
    <div className="flow-node" style={{ borderColor: `${color}40`, background: `${color}08` }}>
      {pulse && <div className="node-pulse" style={{ background: color }} />}
      <span style={{ color, fontWeight: 600, fontSize: '11px' }}>{label}</span>
      {sublabel && <span style={{ color: dim2, fontSize: '9px', display: 'block' }}>{sublabel}</span>}
    </div>
  )
}

// ── SSE Transport Flow ────────────────────────────────────────────────────────
function SseFlow() {
  const [step, setStep] = useState(0)
  const total = 4

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % (total + 1)), 1400)
    return () => clearInterval(t)
  }, [])

  const steps = [
    { label: 'GET /sse', sub: 'Connect', dir: 'right', color: '#5fffa7' },
    { label: 'event: endpoint', sub: 'data: /mcp/message', dir: 'left', color: '#60a5fa' },
    { label: 'POST /mcp/message', sub: 'JSON-RPC request', dir: 'right', color: '#5fffa7' },
    { label: 'SSE event: message', sub: 'data: {jsonrpc response}', dir: 'left', color: '#60a5fa' },
  ]

  return (
    <div className="font-mono text-xs">
      <p className="mb-4" style={{ color: dim }}>$ trace — SSE transport (persistent connection)</p>
      <div className="flex items-center gap-4 mb-6">
        <Node label="McpClient" sublabel="Test Code" color="#5fffa7" pulse />
        <div className="flex-1 flex flex-col gap-2">
          {steps.map((s, i) => (
            <div key={i} className="relative" style={{
              opacity: step > i ? 1 : 0.2,
              transition: 'opacity 0.4s ease',
            }}>
              <AnimatedArrow
                reverse={s.dir === 'left'}
                color={s.color}
                label={s.label}
                sublabel={s.sub}
                delay={i * 100}
              />
            </div>
          ))}
        </div>
        <Node label="MCP Server" sublabel="SSE endpoint" color="#60a5fa" pulse />
      </div>

      <div className="sse-persistent-bar">
        <div className="sse-stream-line" />
        <span style={{ color: dim2, fontSize: '10px' }}>SSE stream stays open — responses pushed via persistent connection</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { k: 'Connection', v: 'Persistent SSE (GET /sse)' },
          { k: 'Requests', v: 'POST /mcp/message' },
          { k: 'Responses', v: 'SSE events on open stream' },
          { k: 'Matching', v: 'pendingRequests map by id' },
        ].map(({ k, v }) => (
          <div key={k} className="flow-stat">
            <span style={{ color: accent, fontSize: '10px' }}>{k}</span>
            <span style={{ color: dim, fontSize: '10px' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Streamable HTTP Flow ──────────────────────────────────────────────────────
function StreamableFlow() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 7), 1200)
    return () => clearInterval(t)
  }, [])

  const phases = [
    { phase: '1. Initialize', steps: [
      { label: 'POST /mcp', sub: 'method: initialize', dir: 'right', color: '#5fffa7' },
      { label: 'HTTP 200 + Mcp-Session-Id', sub: 'inline JSON response', dir: 'left', color: '#a78bfa' },
    ]},
    { phase: '2. Requests', steps: [
      { label: 'POST /mcp', sub: 'Mcp-Session-Id: {id}', dir: 'right', color: '#5fffa7' },
      { label: 'HTTP 200 + JSON body', sub: 'inline response (no SSE)', dir: 'left', color: '#a78bfa' },
    ]},
    { phase: '3. Terminate', steps: [
      { label: 'DELETE /mcp', sub: 'end session', dir: 'right', color: '#f87171' },
      { label: 'HTTP 200', sub: 'session closed', dir: 'left', color: '#a78bfa' },
    ]},
  ]

  let globalStep = 0
  return (
    <div className="font-mono text-xs">
      <p className="mb-4" style={{ color: dim }}>$ trace — Streamable HTTP transport (stateless POSTs)</p>
      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.phase}>
            <p className="mb-2" style={{ color: dim2, fontSize: '10px' }}>// {phase.phase}</p>
            <div className="flex items-center gap-4">
              <Node label="McpClient" color="#5fffa7" />
              <div className="flex-1 flex flex-col gap-1.5">
                {phase.steps.map((s) => {
                  const idx = globalStep++
                  return (
                    <div key={idx} style={{ opacity: step > idx ? 1 : 0.2, transition: 'opacity 0.4s ease' }}>
                      <AnimatedArrow reverse={s.dir === 'left'} color={s.color} label={s.label} sublabel={s.sub} />
                    </div>
                  )
                })}
              </div>
              <Node label="MCP Server" color="#a78bfa" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-2 rounded" style={{ background: 'var(--bg-surface)', border: `1px solid ${border}` }}>
        <p style={{ color: dim2, fontSize: '10px' }}>✦ No persistent connection — each POST is independent · Session tracked via Mcp-Session-Id header</p>
      </div>
    </div>
  )
}

// ── Module Dependency Graph ───────────────────────────────────────────────────
function ModuleGraph() {
  const [hovered, setHovered] = useState<string | null>(null)

  const modules = [
    { id: 'mcp-test-api', label: 'mcp-test-api', tag: 'PUBLIC', color: '#5fffa7', x: 300, y: 30, deps: ['mcp-test-client'] },
    { id: 'mcp-test-junit', label: 'mcp-test-junit', tag: 'PUBLIC', color: '#f87171', x: 80, y: 30, deps: ['mcp-test-api'] },
    { id: 'mcp-test-client', label: 'mcp-test-client', tag: 'INTERNAL', color: '#60a5fa', x: 300, y: 130, deps: ['mcp-test-transport', 'mcp-test-core'] },
    { id: 'mcp-test-transport', label: 'mcp-test-transport', tag: 'INTERNAL', color: '#a78bfa', x: 180, y: 230, deps: ['mcp-test-interfaces', 'mcp-test-core'] },
    { id: 'mcp-test-interfaces', label: 'mcp-test-interfaces', tag: 'SPI', color: '#fbbf24', x: 80, y: 330, deps: [] },
    { id: 'mcp-test-core', label: 'mcp-test-core', tag: 'INTERNAL', color: '#34d399', x: 420, y: 230, deps: [] },
  ]

  const nodeW = 150, nodeH = 36

  const edges: { from: string; to: string }[] = []
  modules.forEach(m => m.deps.forEach(d => edges.push({ from: m.id, to: d })))

  const getCenter = (id: string) => {
    const m = modules.find(x => x.id === id)!
    return { x: m.x + nodeW / 2, y: m.y + nodeH / 2 }
  }

  const isHighlighted = (id: string) => {
    if (!hovered) return true
    const m = modules.find(x => x.id === hovered)!
    return id === hovered || m.deps.includes(id) || modules.some(x => x.id === id && x.deps.includes(hovered))
  }

  return (
    <div className="font-mono text-xs">
      <p className="mb-3" style={{ color: dim }}>$ mvn dependency:tree — hover a module to highlight dependencies</p>
      <div className="overflow-x-auto">
        <svg width="600" height="390" style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            {modules.map(m => (
              <marker key={m.id} id={`arrow-${m.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={`${m.color}80`} />
              </marker>
            ))}
          </defs>

          {edges.map(({ from, to }) => {
            const f = getCenter(from), t = getCenter(to)
            const fromM = modules.find(x => x.id === from)!
            const highlighted = !hovered || hovered === from || hovered === to
            return (
              <line key={`${from}-${to}`}
                x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                stroke={highlighted ? `${fromM.color}60` : `${fromM.color}15`}
                strokeWidth={highlighted ? 1.5 : 1}
                strokeDasharray="4 3"
                markerEnd={`url(#arrow-${from})`}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {modules.map(m => (
            <g key={m.id}
              style={{ cursor: 'pointer', opacity: isHighlighted(m.id) ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <rect x={m.x} y={m.y} width={nodeW} height={nodeH} rx={4}
                fill={`${m.color}10`}
                stroke={hovered === m.id ? m.color : `${m.color}40`}
                strokeWidth={hovered === m.id ? 1.5 : 1}
                style={{ transition: 'all 0.2s ease' }}
              />
              <text x={m.x + nodeW / 2} y={m.y + 14} textAnchor="middle" fill={m.color} fontSize="10" fontWeight="600" fontFamily="monospace">{m.label}</text>
              <text x={m.x + nodeW / 2} y={m.y + 27} textAnchor="middle" fill={`${m.color}80`} fontSize="9" fontFamily="monospace">{m.tag}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-center" style={{ color: dim2, fontSize: '10px' }}>
        └── import only <span style={{ color: accent }}>mcp-test-api</span> — all others are transitive
      </p>
    </div>
  )
}

// ── Request Lifecycle ─────────────────────────────────────────────────────────
function RequestLifecycle() {
  const [activeStep, setActiveStep] = useState(-1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const steps = [
    { layer: 'McpClient', action: 'client.tools().callTool("add", args)', color: '#5fffa7', group: 'api' },
    { layer: 'ToolsClient', action: 'toolDirectory.callTool(name, args)', color: '#5fffa7', group: 'api' },
    { layer: 'McpTestClient', action: 'ensureInitialized() → rpcClient.call("tools/call", params)', color: '#60a5fa', group: 'client' },
    { layer: 'McpRpcClient', action: 'build JSON-RPC {jsonrpc, id, method, params}', color: '#60a5fa', group: 'client' },
    { layer: 'RpcExchangeTracker', action: 'record exchange start (id, method, timestamp)', color: '#60a5fa', group: 'client' },
    { layer: 'McpTransport', action: 'sendRequest(payload, requestId) — SSE or HTTP', color: '#a78bfa', group: 'transport' },
    { layer: 'MCP Server', action: 'process request → return JSON-RPC response', color: '#fbbf24', group: 'server' },
    { layer: 'McpTransport', action: 'return JsonNode response', color: '#a78bfa', group: 'transport' },
    { layer: 'RpcExchangeTracker', action: 'record exchange end (latency, status)', color: '#60a5fa', group: 'client' },
    { layer: 'McpRpcClient', action: 'extract result or throw on error', color: '#60a5fa', group: 'client' },
    { layer: 'ToolsClient', action: 'map JsonNode → McpToolResult', color: '#5fffa7', group: 'api' },
    { layer: 'McpClient', action: 'return McpToolResult to test', color: '#5fffa7', group: 'api' },
  ]

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveStep(s => {
        if (s >= steps.length - 1) return -1
        return s + 1
      })
    }, 600)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="font-mono text-xs">
      <p className="mb-3" style={{ color: dim }}>$ strace — request lifecycle (tools/call example)</p>
      <div className="space-y-0.5">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-2 rounded px-1 py-0.5 transition-all duration-300"
            style={{
              background: activeStep === i ? `${s.color}12` : 'transparent',
              borderLeft: activeStep === i ? `2px solid ${s.color}` : '2px solid transparent',
            }}
          >
            <span style={{ color: dim2, minWidth: '12px', fontSize: '10px' }}>{i < steps.length - 1 ? '├' : '└'}</span>
            <span style={{
              color: s.color,
              minWidth: '148px',
              fontSize: '10px',
              opacity: activeStep === -1 || activeStep >= i ? 1 : 0.35,
              transition: 'opacity 0.3s',
            }}>{s.layer}</span>
            <span style={{
              color: dim,
              fontSize: '10px',
              opacity: activeStep === -1 || activeStep >= i ? 1 : 0.35,
              transition: 'opacity 0.3s',
            }}>{s.action}</span>
            {activeStep === i && <span className="lifecycle-dot" style={{ background: s.color }} />}
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
