import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: '`mcp-test` is a multi-module Maven project. Only `mcp-test-api` is imported directly — everything else is transitive.' },
  { t: 'h2', id: 'module-map', md: 'Module map' },
  {
    t: 'table',
    headers: ['Module', 'Purpose', 'Depends on', 'Import?'],
    rows: [
      ['mcp-test-api', 'Public API: clients, models, assertions', 'client, transport, core', 'Yes'],
      ['mcp-test-client', 'Orchestration: RPC, exchange tracking, guards', 'transport, interfaces, core', 'No (transitive)'],
      ['mcp-test-transport', 'SSE + Streamable HTTP transports, SSE decoder', 'interfaces, core', 'No (transitive)'],
      ['mcp-test-interfaces', 'SPI: McpTransport interface', 'core', 'No (transitive)'],
      ['mcp-test-core', 'Json codec, validation, constants, exceptions', '—', 'No (transitive)'],
      ['mcp-test-examples', 'DummyMcpServer + 31 reference tests', 'api', 'No'],
    ],
  },
  { t: 'h2', id: 'dependency-graph', md: 'Dependency graph' },
  {
    t: 'code', lang: 'text', file: 'mvn dependency:tree (api)',
    code: `io.github.abhiramrathod:mcp-test-api
└── mcp-test-client
    ├── mcp-test-transport
    │   └── mcp-test-interfaces
    │       └── mcp-test-core
    └── mcp-test-core`,
  },
  { t: 'h2', id: 'api', md: 'mcp-test-api' },
  { t: 'p', md: 'The public surface. One artifact, everything needed to write integration tests. Its presence keeps your `pom.xml` tiny and guarantees you cannot accidentally depend on internals.' },
  { t: 'h2', id: 'client', md: 'mcp-test-client' },
  { t: 'p', md: 'Wires initialization guards, the JSON-RPC `McpRpcClient`, and exchange tracking. Holds the concrete directory implementations and the era logic (legacy initialize vs. stateless discover).' },
  { t: 'h2', id: 'transport', md: 'mcp-test-transport' },
  { t: 'p', md: '`McpSseTransport` implements the legacy 2024-11-05 flow (GET /sse, endpoint event, POST /message). `McpStreamableHttpTransport` covers Streamable HTTP (2025-03-26) and the stateless protocol (2026-07-28). Both expose live connections and stream decoding.' },
  { t: 'h2', id: 'interfaces', md: 'mcp-test-interfaces' },
  { t: 'p', md: 'The `McpTransport` SPI — connect, sendRequest, sendNotification, listener, close. Implement it to support a custom transport.' },
  { t: 'h2', id: 'core', md: 'mcp-test-core' },
  { t: 'p', md: '`McpJsonCodec` (Jackson-based), `McpValidation`, `McpProtocolVersions`, endpoint/header constants, and the exception hierarchy. No dependencies on other mcp-test modules.' },
  { t: 'h2', id: 'examples', md: 'mcp-test-examples' },
  { t: 'p', md: 'Ships `DummyMcpServer` and `RealMcpServerTestBase` plus 31 tests — BasicClient, Tools, Resources, Prompts, ExchangeTracking, ComprehensiveIntegration. The best reference for how to structure your own suites.' },
  {
    t: 'callout', kind: 'note',
    md: '`mcp-test-examples` is not published as a test dependency. Copy its patterns (or its test sources) into your project — they are MIT-licensed reference material.',
  },
]

export default function ModulesPage() {
  return <DocLayout page={{
    meta: {
      path: '/modules',
      title: 'Modules',
      description: 'The six Maven modules, their purposes, and their dependency graph.',
      section: 'Reference',
      keywords: ['modules', 'maven', 'dependencies', 'api', 'core'],
      editPath: 'docs-site/src/pages/Modules.tsx',
    },
    blocks,
  }} />
}
