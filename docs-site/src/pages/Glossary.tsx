import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'The vocabulary used throughout these docs and the codebase.' },
  {
    t: 'table',
    headers: ['Term', 'Definition'],
    rows: [
      ['MCP', 'Model Context Protocol — the JSON-RPC-based protocol a client uses to talk to an MCP server.'],
      ['SSE', 'Server-Sent Events — a one-way HTTP stream used by the legacy transport (GET /sse + POST /message).'],
      ['Streamable HTTP', 'The 2025-03-26 transport: single POST /mcp endpoint, optional SSE streaming responses.'],
      ['Stateless protocol', '2026-07-28+: no initialize handshake; server/discover negotiates versions; results carry resultType/ttlMs/cacheScope; changes via subscriptions/listen.'],
      ['JSON-RPC', 'The request/response wire format MCP uses.'],
      ['Exchange', 'One recorded request/response round-trip (SUCCESS, ERROR, or TIMEOUT).'],
      ['ToolsClient / ResourcesClient / PromptsClient', 'Fluent sub-clients of McpClient for each MCP capability.'],
      ['DummyMcpServer', 'Bundled reference MCP server used by the example tests.'],
      ['RealMcpServerTestBase', 'JUnit base class that starts a server per class and a fresh client per test.'],
      ['mcp.test.server.url', 'System property to point integration tests at an external server.'],
      ['Protocol version', '2024-11-05 (legacy), 2025-03-26 (Streamable HTTP), 2026-07-28 (stateless).'],
      ['server/discover', 'Stateless-era endpoint the client uses to learn supported protocol versions and capabilities.'],
    ],
  },
]

export default function GlossaryPage() {
  return <DocLayout page={{
    meta: {
      path: '/glossary',
      title: 'Glossary',
      description: 'MCP and mcp-test terms defined.',
      section: 'Reference',
      keywords: ['glossary', 'terms', 'mcp', 'sse'],
      editPath: 'docs-site/src/pages/Glossary.tsx',
    },
    blocks,
  }} />
}
