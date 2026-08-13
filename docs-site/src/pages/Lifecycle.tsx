import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'A client goes through a small, predictable lifecycle. Most tests never touch it explicitly — `initializeOnBuild()` plus `client.close()` covers everything.' },
  { t: 'h2', id: 'phases', md: 'Lifecycle phases' },
  {
    t: 'table',
    headers: ['Phase', 'What happens', 'Triggered by'],
    rows: [
      ['Build', 'Builder creates the transport and RPC client', 'McpClient.connectTo(...).build()'],
      ['Connect', 'Transport opens its connection (SSE stream / HTTP client)', 'First use, or initializeOnBuild()'],
      ['Initialize', 'MCP handshake (legacy) or server/discover (stateless)', 'Auto on first use, or initialize()'],
      ['Use', 'tools/resources/prompts calls, notifications, listener callbacks', 'Your test code'],
      ['Close', 'Transport closed, pending requests failed, resources released', 'client.close()'],
    ],
  },
  { t: 'h2', id: 'lazy-vs-eager', md: 'Lazy vs. eager initialization' },
  { t: 'p', md: 'By default the client **initializes lazily** — the handshake runs automatically on first use. If you want the handshake to fail fast (before the first assertion), build with `initializeOnBuild()`:' },
  {
    t: 'code', lang: 'java',
    code: `// Eager — handshake happens during build(); throws if the server is unreachable
McpClient eager = McpClient.connectTo(url).initializeOnBuild().build();

// Lazy — handshake deferred until first use
McpClient lazy = McpClient.connectTo(url).build();`,
  },
  {
    t: 'callout', kind: 'note',
    md: '`initializeOnBuild()` runs the handshake during `build()`. Without it, initialization triggers on the first `tools()` / `resources()` / `prompts()` / `serverInfo()` call.',
  },
  { t: 'h2', id: 'closing', md: 'Closing the client' },
  { t: 'p', md: 'Always `close()` when done — it closes the transport, cancels the SSE stream, and fails any pending requests. Prefer `try-with-resources`:' },
  {
    t: 'code', lang: 'java',
    code: `try (McpClient client = McpClient.connectTo(url).build()) {
    client.tools().callTool("calculator", args).assertSuccess();
} // client.close() called automatically`,
  },
  { t: 'h2', id: 'server-initiated', md: 'Server-initiated messages' },
  { t: 'p', md: 'During use the server may push requests or notifications (e.g. `sampling/createMessage`, `notifications/progress`, `roots/list`). Register a listener with `onServerMessage`:' },
  {
    t: 'code', lang: 'java',
    code: `client.onServerMessage(message -> {
    String method = message.path("method").asText();
    if ("sampling/createMessage".equals(method)) {
        // respond or record
    }
});`,
  },
  { t: 'h2', id: 'session-expiry', md: 'Session expiry' },
  { t: 'p', md: 'Stateless and Streamable HTTP servers may terminate a session. `setSessionExpiredHandler` lets you react — typically by re-initializing:' },
  {
    t: 'code', lang: 'java',
    code: `client.setSessionExpiredHandler(() -> {
    client.initialize();   // reconnect and re-handshake
});`,
  },
  { t: 'h2', id: 'best-practices', md: 'Best practices' },
  {
    t: 'list',
    items: [
      'Create **one client per test method** (or use `RealMcpServerTestBase` which does this for you) — exchanges stay isolated.',
      'Use **`initializeOnBuild()`** for fast, clear failures in CI.',
      'Set a **realistic timeout** (default 10s) so hung servers surface as `TIMEOUT` exchanges rather than hanging forever.',
      'Always **close** the client, preferably via try-with-resources.',
    ],
  },
]

export default function LifecyclePage() {
  return <DocLayout page={{
    meta: {
      path: '/lifecycle',
      title: 'Client Lifecycle',
      description: 'How a client is built, connected, initialized, used, and closed — plus server-initiated messages.',
      section: 'Core Concepts',
      keywords: ['lifecycle', 'initialize', 'close', 'lazy', 'session'],
      editPath: 'docs-site/src/pages/Lifecycle.tsx',
    },
    blocks,
  }} />
}
