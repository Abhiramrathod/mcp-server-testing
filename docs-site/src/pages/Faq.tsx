import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Quick answers to common questions.' },
  { t: 'h2', id: 'what-is', md: 'What is mcp-test?' },
  { t: 'p', md: 'A Java testing framework for **Model Context Protocol** (MCP) servers. It spins up a real MCP server, connects a real client over the network, and lets you assert on tools, resources, prompts, and exchange timings — no mocks.' },
  { t: 'h2', id: 'deps', md: 'Which dependency do I add?' },
  { t: 'p', md: 'Only `io.github.abhiramrathod:mcp-test-api` with `<scope>test</scope>`. Client, transport, and core are transitive. See **Installation**.' },
  { t: 'h2', id: 'server', md: 'Do I need my own MCP server to test against?' },
  { t: 'p', md: 'No. The `mcp-test-examples` module bundles `DummyMcpServer`. Extend `RealMcpServerTestBase` and you get a server plus a fresh client automatically. Point `mcp.test.server.url` at your own server to test that instead.' },
  { t: 'h2', id: 'mocks', md: 'Does it use mocks?' },
  { t: 'p', md: 'No. `McpClient` talks to a real running server over the network (SSE or Streamable HTTP). Exchange tracking records the real JSON-RPC traffic.' },
  { t: 'h2', id: 'which-protocol', md: 'Which protocol version should I use?' },
  { t: 'p', md: 'Match the server. Legacy SSE servers use `2024-11-05` (the default). Modern stateless servers use `2026-07-28`. See **Transports & Protocols**.' },
  { t: 'h2', id: 'junit', md: 'Which JUnit do I need?' },
  { t: 'p', md: 'JUnit 5. The examples use `@Test`, `@BeforeEach`, `@AfterEach` from `org.junit.jupiter`. The framework itself has no JUnit dependency of its own.' },
  { t: 'h2', id: 'timeout', md: 'A test hangs forever. What now?' },
  { t: 'p', md: 'Set `McpClientConfig.timeout(...)` (default 10s). A timed-out request becomes a **TIMEOUT** exchange instead of hanging. Then check the exchange summary to see which method stalled.' },
  { t: 'h2', id: 'stateless', md: 'How do I test a stateless server?' },
  { t: 'p', md: 'Build with `.streamableHttp()` and `protocolVersion("2026-07-28")`. No `initializeOnBuild()` needed — there is no handshake. Use `client.isStateless()` and `client.discover()` to assert on the discovery result.' },
  { t: 'h2', id: 'custom', md: 'Can I use a custom transport?' },
  { t: 'p', md: 'Yes — implement `McpTransport` from `mcp-test-interfaces` and pass it to `.transport(...)`. See **Transports & Protocols**.' },
  { t: 'h2', id: 'proxy', md: 'My tests must go through a corporate proxy. How?' },
  { t: 'p', md: 'Set `McpClientConfig.proxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress("proxy.corp.example", 8080)))`. Only HTTP proxies are supported; omit it to connect directly. The JDK transport also honors the standard `-Dhttp.proxyHost` / `-Dhttps.proxyHost` system properties when no proxy is configured.' },
  { t: 'h2', id: 'where-source', md: 'Where is the full source?' },
  { t: 'p', md: 'On GitHub: [Abhiramrathod/mcp-testing](https://github.com/Abhiramrathod/mcp-testing). The example tests live under `mcp-test-examples/src/test/`.' },
]

export default function FaqPage() {
  return <DocLayout page={{
    meta: {
      path: '/faq',
      title: 'FAQ',
      description: 'Answers to the most common questions about mcp-test.',
      section: 'Guides',
      keywords: ['faq', 'questions', 'junit', 'mocks', 'proxy'],
      editPath: 'docs-site/src/pages/Faq.tsx',
    },
    blocks,
  }} />
}
