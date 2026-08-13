import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: '`mcp-test` supports three transport/protocol eras. Transport is chosen on the `McpClient` builder; the protocol version is configured on `McpClientConfig`.' },
  {
    t: 'table',
    headers: ['Transport', 'Builder method', 'Protocol', 'Connection model'],
    rows: [
      ['SSE (legacy)', '.sse()', '2024-11-05', 'Persistent SSE stream + POST /message'],
      ['Streamable HTTP (session)', '.streamableHttp()', '2025-03-26', 'Single POST /mcp endpoint'],
      ['Streamable HTTP (stateless)', '.streamableHttp()', '2026-07-28+', 'Stateless; server/discover negotiation'],
    ],
  },
  { t: 'h2', id: 'sse', md: 'SSE transport (2024-11-05)' },
  { t: 'p', md: 'The legacy transport: the client opens a **persistent Server-Sent Events** stream to `GET /sse`, receives an `endpoint` event telling it where to POST JSON-RPC messages, and receives responses back over the SSE stream.' },
  {
    t: 'code', lang: 'java', file: 'Choosing SSE',
    code: `McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
                .timeout(Duration.ofSeconds(30))
                .protocolVersion("2024-11-05")
                .build())
        .sse()
        .initializeOnBuild()
        .build();`,
  },
  {
    t: 'list',
    items: [
      '**Default** transport when `.sse()` is omitted.',
      'Requires a persistent connection — good for long-lived testing sessions.',
      '`/message` endpoint path can be overridden with `.sse("/custom-path")`.',
    ],
  },
  { t: 'h2', id: 'streamable-http', md: 'Streamable HTTP (2025-03-26)' },
  { t: 'p', md: 'A simpler request/response model over a single `POST /mcp` endpoint. The server may reply with JSON directly or with an SSE stream. The client still runs an `initialize` handshake to establish the session.' },
  {
    t: 'code', lang: 'java',
    code: `McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
                .protocolVersion("2025-03-26")
                .build())
        .streamableHttp()
        .initializeOnBuild()
        .build();`,
  },
  { t: 'h2', id: 'stateless', md: 'Stateless protocol (2026-07-28+)' },
  { t: 'p', md: 'The modern era. No `initialize` handshake — the client advertises protocol versions through `server/discover`, results carry `resultType`/`ttlMs`/`cacheScope` metadata, and change notifications flow over `subscriptions/listen`. Use `client.isStateless()` to detect the era.' },
  {
    t: 'code', lang: 'java',
    code: `McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
                .protocolVersion("2026-07-28")
                .build())
        .streamableHttp()
        .build();

// No initialize handshake. Discover capabilities:
boolean stateless = client.isStateless();   // true
JsonNode discovered = client.discover();
String[] versions = discovered.path("protocolVersions").asText().split(",");`,
  },
  {
    t: 'callout', kind: 'tip',
    md: 'The **stateless** protocol is ideal for testing because each request is self-contained — no session state to set up or tear down.',
  },
  { t: 'h2', id: 'custom-transport', md: 'Custom transports (SPI)' },
  { t: 'p', md: 'Implement `McpTransport` from `mcp-test-interfaces` to plug in a custom transport. The client builder accepts a transport via `.transport(yourImplementation)`. The interface is minimal:' },
  {
    t: 'code', lang: 'java', file: 'McpTransport.java',
    code: `public interface McpTransport {
    void connect();
    JsonNode sendRequest(String payload, long requestId);
    void sendNotification(String payload);
    void setServerMessageListener(Consumer<JsonNode> listener);
    void close();
}`,
  },
  { t: 'h2', id: 'which-to-choose', md: 'Which should you use?' },
  {
    t: 'table',
    headers: ['Situation', 'Recommendation'],
    rows: [
      ['Testing a legacy SSE server', '.sse()'],
      ['Testing a modern stateless server', '.streamableHttp() + 2026-07-28'],
      ['Matching your own server’s era', 'Match `protocolVersion` to what the server expects'],
      ['Unknown / mixed', 'Start with SSE (default), switch if handshake fails'],
    ],
  },
]

export default function TransportsPage() {
  return <DocLayout page={{
    meta: {
      path: '/transports',
      title: 'Transports & Protocols',
      description: 'SSE, Streamable HTTP, and the stateless protocol — how to choose and configure them.',
      section: 'Core Concepts',
      keywords: ['transport', 'sse', 'streamable http', 'stateless', 'protocol'],
      editPath: 'docs-site/src/pages/Transports.tsx',
    },
    blocks,
  }} />
}
