import { Fragment, useMemo } from 'react'

export const GREEN = '#5fffa7'
export const BLUE = '#60a5fa'
export const PURPLE = '#a78bfa'
export const AMBER = '#fbbf24'
export const EMERALD = '#34d399'
export const ROSE = '#f472b6'
export const CYAN = '#22d3ee'

const MONO = "'JetBrains Mono', 'Fira Code', monospace"

function mask(label: string, size = 9) {
  const w = label.length * (size * 0.62) + 8
  return { w, h: size + 3 }
}

function ArrowLabel({ x, y, text, size = 9, fill = 'var(--text-dim)', weight = 500 }: {
  x: number; y: number; text: string; size?: number; fill?: string; weight?: number
}) {
  const { w, h } = mask(text, size)
  return (
    <g>
      <rect x={x - w / 2} y={y - size + 2} width={w} height={h} rx={2} fill="var(--bg)" />
      <text x={x} y={y} textAnchor="middle" fill={fill} fontSize={size} fontWeight={weight} fontFamily={MONO}>{text}</text>
    </g>
  )
}

/* ── UML component diagram ─────────────────────────────────────────────────── */

interface ComponentBox {
  x: number; y: number; w: number; h: number
  color: string; title: string; tag: string; subtitle?: string
  lines?: string[]; note?: string
}

function CBox({ b }: { b: ComponentBox }) {
  const { x, y, w, h, color, title, tag, subtitle, lines, note } = b
  const dash = tag === 'external'
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={`${color}08`} stroke={`${color}45`} strokeWidth={1.2} />
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={`${color}20`} strokeWidth={1} strokeDasharray={dash ? '5 3' : undefined} />
      <rect x={x + 8} y={y + 9} width={10} height={7} rx={1.5} fill="none" stroke={color} strokeWidth={1} />
      <rect x={x + 11} y={y + 13} width={10} height={7} rx={1.5} fill="none" stroke={color} strokeWidth={1} />
      <text x={x + 27} y={y + 19} fill={color} fontSize={12} fontWeight={700} fontFamily={MONO}>{title}</text>
      <text x={x + w - 10} y={y + 16} fill={color} fontSize={8} textAnchor="end" fontWeight={600} opacity={0.85}>«{tag}»</text>
      {subtitle && <text x={x + 12} y={y + 33} fill="var(--text-dim2)" fontSize={9} fontFamily={MONO}>{subtitle}</text>}
      <line x1={x + 8} y1={y + 40} x2={x + w - 8} y2={y + 40} stroke={`${color}35`} strokeWidth={1} />
      {lines?.map((ln, i) => (
        <text key={i} x={x + 14} y={y + 56 + i * 15} fill="var(--text-dim)" fontSize={9.5} fontFamily={MONO}>{ln}</text>
      ))}
      {note && <text x={x + 14} y={y + h - 10} fill="var(--text-dim2)" fontSize={8.5} fontStyle="italic" fontFamily={MONO}>{note}</text>}
    </g>
  )
}

export function UmlComponentDiagram() {
  const uid = useMemo(() => `uc-${Math.random().toString(36).slice(2, 8)}`, [])
  const boxes: ComponentBox[] = [
    { x: 20, y: 10, w: 420, h: 54, color: GREEN, title: 'Your Test Code', tag: 'user', subtitle: 'JUnit 5 tests · RealMcpServerTestBase' },
    {
      x: 20, y: 86, w: 420, h: 92, color: GREEN, title: 'mcp-test-api', tag: 'public',
      lines: ['McpClient · ToolsClient · ResourcesClient · PromptsClient', 'McpClientConfig · McpExchangeAssertions · domain models'],
    },
    {
      x: 20, y: 200, w: 420, h: 92, color: BLUE, title: 'mcp-test-client', tag: 'internal',
      lines: ['McpTestClient · McpRpcClient · RpcExchangeTracker', 'McpInitializationGuard · tools/resources/prompts dirs'],
    },
    {
      x: 20, y: 314, w: 420, h: 112, color: PURPLE, title: 'mcp-test-transport', tag: 'internal',
      lines: ['McpTransportFactory · McpSseTransport', 'McpStreamableHttpTransport · SseEventDecoder', 'NettyTransportClient · JdkTransportClient · proxy CONNECT'],
    },
    {
      x: 20, y: 448, w: 420, h: 92, color: AMBER, title: 'mcp-test-core', tag: 'internal',
      lines: ['McpJsonCodec · McpValidation · McpProtocolVersions', 'constants · exceptions'],
      note: 'dependents: api · client · transport',
    },
    {
      x: 20, y: 562, w: 420, h: 92, color: EMERALD, title: 'MCP Server', tag: 'external',
      lines: ['SSE       GET /sse + POST /message      (2024-11-05)', 'Streamable POST /mcp · session id        (2025-03-26)', 'Stateless  POST /mcp · server/discover    (2026-07-28+)'],
    },
    {
      x: 500, y: 86, w: 300, h: 78, color: CYAN, title: 'mcp-test-examples', tag: 'reference',
      lines: ['DummyMcpServer · RealMcpServerTestBase', 'example tests'],
    },
    {
      x: 500, y: 314, w: 300, h: 112, color: ROSE, title: 'mcp-test-interfaces', tag: 'spi',
      lines: ['McpTransport «interface»', 'McpTransportClient «interface»', 'McpResponse · channels'],
    },
  ]

  return (
    <div className="rounded overflow-x-auto" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <svg viewBox="0 0 820 664" style={{ width: '100%', minWidth: 700, height: 'auto' }} fontFamily={MONO}>
        <defs>
          <marker id={`${uid}-open`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="none" stroke="var(--text-dim)" strokeWidth="1.1" />
          </marker>
          <marker id={`${uid}-solid`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--text-dim)" />
          </marker>
          <marker id={`${uid}-net`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>

        {boxes.map(b => <CBox key={b.title} b={b} />)}

        {/* left-column dependency arrows */}
        <line x1={245} y1={64} x2={245} y2={86} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={252} y={74} text="imports" />
        <line x1={245} y1={178} x2={245} y2={200} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={252} y={188} text="depends on" />
        <line x1={245} y1={292} x2={245} y2={314} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={252} y={302} text="depends on" />
        <line x1={245} y1={426} x2={245} y2={448} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={252} y={436} text="uses" />

        {/* test → examples */}
        <polyline points="440,37 470,37 470,125 500,125" fill="none" stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={452} y={28} text="reference patterns" />

        {/* transport → interfaces (realization) */}
        <line x1={440} y1={370} x2={500} y2={370} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={470} y={361} text="«implements»" />

        {/* transport → server (network) */}
        <polyline points="440,400 452,400 452,608 500,608" fill="none" stroke="var(--accent)" strokeWidth={1.2} markerEnd={`url(#${uid}-net)`} />
        <g transform="rotate(-90 452 500)">
          <ArrowLabel x={452} y={500} text="HTTP / SSE" fill="var(--text-dim2)" />
        </g>
      </svg>
    </div>
  )
}

/* ── UML class diagram ─────────────────────────────────────────────────────── */

interface UmlClassDef {
  x: number; y: number; w: number; color: string; title: string
  stereotype: string; module: string; methods: string[]; dashed?: boolean
}

function UmlClass({ c }: { c: UmlClassDef }) {
  const h = 44 + c.methods.length * 15
  return (
    <g>
      <rect x={c.x} y={c.y} width={c.w} height={h} rx={4} fill="var(--bg-surface)" stroke={c.color} strokeWidth={1.2} strokeDasharray={c.dashed ? '5 3' : undefined} />
      <line x1={c.x} y1={c.y + 26} x2={c.x + c.w} y2={c.y + 26} stroke={c.color} strokeWidth={1} opacity={0.6} />
      <text x={c.x + 10} y={c.y + 12} fill={c.color} fontSize={9} fontStyle="italic" opacity={0.85} fontFamily={MONO}>{c.stereotype}</text>
      <text x={c.x + 10} y={c.y + 22} fill="var(--text)" fontSize={11} fontWeight={700} fontFamily={MONO}>{c.title}</text>
      <text x={c.x + c.w - 10} y={c.y + 13} fill={c.color} fontSize={8} textAnchor="end" opacity={0.7} fontFamily={MONO}>{c.module}</text>
      {c.methods.map((m, i) => (
        <text key={i} x={c.x + 10} y={c.y + 42 + i * 15} fill="var(--text-dim)" fontSize={9} fontFamily={MONO}>{m}</text>
      ))}
    </g>
  )
}

export function ClassDiagram() {
  const uid = useMemo(() => `cd-${Math.random().toString(36).slice(2, 8)}`, [])
  const classes: UmlClassDef[] = [
    {
      x: 40, y: 20, w: 210, color: GREEN, title: 'McpClient', stereotype: '«facade»', module: 'mcp-test-api',
      methods: ['+ connectTo(url) : Builder', '+ tools() : ToolsClient', '+ resources() : ResourcesClient', '+ prompts() : PromptsClient', '+ exchanges() : ExchangeHistory', '+ close() : void'],
    },
    {
      x: 340, y: 20, w: 210, color: BLUE, title: 'McpTestClient', stereotype: '«implementation»', module: 'mcp-test-client',
      methods: ['+ sendRequest(method, params) : JsonNode', '+ initialize() : void', '+ onServerMessage(listener)', '+ close() : void'],
    },
    {
      x: 330, y: 150, w: 210, color: ROSE, title: 'McpTransport', stereotype: '«interface»', module: 'mcp-test-interfaces', dashed: true,
      methods: ['+ connect()', '+ sendRequest(payload, id) : JsonNode', '+ sendNotification(payload)', '+ close()'],
    },
    {
      x: 600, y: 150, w: 200, color: ROSE, title: 'McpTransportClient', stereotype: '«interface»', module: 'mcp-test-interfaces', dashed: true,
      methods: ['+ send(uri, headers, body) : McpResponse', '+ openStream(uri, headers)', '+ closeSession(uri, headers)', '+ close()'],
    },
    {
      x: 40, y: 180, w: 210, color: PURPLE, title: 'McpTransportFactory', stereotype: '«factory»', module: 'mcp-test-transport',
      methods: ['+ sse(...) : McpTransport', '+ streamable(...) : McpTransport', '+ channelFor(timeout, proxy)'],
    },
    {
      x: 40, y: 360, w: 210, color: PURPLE, title: 'McpSseTransport', stereotype: '«realizes»', module: 'mcp-test-transport',
      methods: ['SSE 2024-11-05 · GET /sse + POST /message'],
    },
    {
      x: 330, y: 360, w: 210, color: PURPLE, title: 'McpStreamableHttpTransport', stereotype: '«realizes»', module: 'mcp-test-transport',
      methods: ['Streamable + stateless · POST /mcp'],
    },
    {
      x: 650, y: 330, w: 140, color: PURPLE, title: 'NettyTransportClient', stereotype: '«realizes»', module: 'mcp-test-transport',
      methods: ['Netty 4.1 · pooled connections'],
    },
    {
      x: 600, y: 410, w: 140, color: PURPLE, title: 'JdkTransportClient', stereotype: '«realizes»', module: 'mcp-test-transport',
      methods: ['JDK HttpClient · ProxySelector'],
    },
    {
      x: 330, y: 470, w: 210, color: AMBER, title: 'McpJsonCodec', stereotype: '«utility»', module: 'mcp-test-core',
      methods: ['+ parse(String) : JsonNode', '+ write(JsonNode) : String'],
    },
  ]

  return (
    <div className="rounded overflow-x-auto" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <svg viewBox="0 0 820 560" style={{ width: '100%', minWidth: 700, height: 'auto' }} fontFamily={MONO}>
        <defs>
          <marker id={`${uid}-open`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="none" stroke="var(--text-dim)" strokeWidth="1.1" />
          </marker>
        </defs>

        {classes.map(c => <UmlClass key={c.title} c={c} />)}

        {/* McpClient → McpTestClient (dependency) */}
        <line x1={250} y1={70} x2={340} y2={70} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={295} y={78} text="delegates to" />

        {/* McpTestClient → McpTransport (dependency) */}
        <line x1={445} y1={124} x2={445} y2={150} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={445} y={137} text="uses" />

        {/* factory → McpSseTransport (creates) */}
        <line x1={145} y1={269} x2={145} y2={360} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <text x={153} y={315} fill="var(--text-dim2)" fontSize={9} fontFamily={MONO}>creates (both)</text>

        {/* realizations → McpTransport */}
        <polyline points="140,360 140,330 375,330 375,254" fill="none" stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <line x1={435} y1={360} x2={435} y2={254} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={260} y={322} text="«implements»" />

        {/* transports → McpTransportClient (uses) */}
        <polyline points="540,389 560,389 560,200 600,200" fill="none" stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={550} y={381} text="uses" />

        {/* realizations → McpTransportClient */}
        <line x1={770} y1={330} x2={770} y2={254} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <line x1={610} y1={410} x2={610} y2={254} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />

        {/* transports → McpJsonCodec (uses) */}
        <polyline points="140,419 140,440 330,440" fill="none" stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <ArrowLabel x={235} y={432} text="uses" />
        <line x1={435} y1={419} x2={435} y2={470} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="4 3" markerEnd={`url(#${uid}-open)`} />
        <text x={443} y={445} fill="var(--text-dim2)" fontSize={9} fontFamily={MONO}>uses</text>
      </svg>
    </div>
  )
}

/* ── Sequence diagrams ─────────────────────────────────────────────────────── */

export interface SeqParticipant { id: string; label: string; color: string }
export interface SeqMessage { from: string; to: string; label: string; kind?: 'sync' | 'return' }

export function SequenceDiagram({ participants, messages, note }: {
  participants: SeqParticipant[]
  messages: SeqMessage[]
  note?: string[]
}) {
  const uid = useMemo(() => `sd-${Math.random().toString(36).slice(2, 8)}`, [])
  const colW = 170
  const padX = 20
  const width = participants.length * colW + padX * 2
  const xc = (i: number) => padX + colW * i + colW / 2
  const msgY = (i: number) => 66 + i * 27
  const lastY = messages.length ? msgY(messages.length - 1) : 66
  const noteH = note ? 44 : 0
  const height = lastY + 26 + noteH

  return (
    <div className="rounded overflow-x-auto" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: Math.min(width, 680), height: 'auto' }} fontFamily={MONO}>
        <defs>
          <marker id={`${uid}-solid`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--text)" />
          </marker>
          <marker id={`${uid}-open`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill="none" stroke="var(--text)" strokeWidth="1.1" />
          </marker>
        </defs>

        {participants.map((p, i) => (
          <g key={p.id}>
            <rect x={xc(i) - 75} y={10} width={150} height={26} rx={3} fill="var(--bg-surface)" stroke={p.color} strokeWidth={1.2} />
            <text x={xc(i)} y={27} textAnchor="middle" fill={p.color} fontSize={10} fontWeight={600} fontFamily={MONO}>{p.label}</text>
            <line x1={xc(i)} y1={40} x2={xc(i)} y2={lastY + 6} stroke="var(--border-light)" strokeWidth={1} strokeDasharray="3 3" />
          </g>
        ))}

        {messages.map((m, i) => {
          const y = msgY(i)
          const x1 = xc(participants.findIndex(p => p.id === m.from))
          const x2 = xc(participants.findIndex(p => p.id === m.to))
          const solid = m.kind !== 'return'
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--text)" strokeWidth={1}
                strokeDasharray={solid ? undefined : '4 3'}
                markerEnd={`url(#${uid}-${solid ? 'solid' : 'open'})`} />
              <ArrowLabel x={(x1 + x2) / 2} y={y - 6} text={m.label} fill="var(--text-dim)" />
            </g>
          )
        })}

        {note && (
          <g>
            <rect x={padX} y={lastY + 18} width={width - padX * 2} height={noteH - 4} rx={4}
              fill="var(--accent-dim)" stroke="var(--accent-glow)" strokeWidth={1} />
            {note.map((n, i) => (
              <text key={i} x={padX + 10} y={lastY + 34 + i * 13} fill="var(--text-dim)" fontSize={9} fontFamily={MONO}>{n}</text>
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}

/* ── Exchange pipeline flow (HTML/CSS) ─────────────────────────────────────── */

function FlowRow({ steps, tone, dashed }: { steps: string[]; tone: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {steps.map((s, i) => (
        <Fragment key={i}>
          <div className="flow-node whitespace-nowrap" style={{
            borderColor: tone, background: `${tone}0d`, color: 'var(--text)', fontSize: 10,
          }}>
            {s}
          </div>
          {i < steps.length - 1 && (
            <div className={`flow-arrow ${dashed ? 'return' : ''}`}>
              <span className="flow-arrow-line" />
              <span className="flow-arrow-head" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}

export function ExchangeFlow() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] mb-1" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>REQUEST PATH — a tools() call, left → right</p>
        <FlowRow tone={BLUE} steps={['Your test', 'McpClient', 'ToolsClient', 'McpRpcClient', 'McpTransport', 'Netty / JDK', 'MCP Server']} />
      </div>
      <div>
        <p className="text-[10px] mb-1" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>RESPONSE PATH — recorded on the way back</p>
        <FlowRow tone={GREEN} dashed steps={['MCP Server', 'McpResponse', 'RpcExchangeTracker', 'ExchangeHistory', 'assertions']} />
      </div>
    </div>
  )
}
