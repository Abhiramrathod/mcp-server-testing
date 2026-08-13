import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: '`mcp-test` shines at **real-server integration testing**: `McpClient` connects over the network to a real, running MCP server and exercises its actual tool/resource/prompt handlers. No mocks, no embedded server library.' },
  { t: 'h2', id: 'the-pattern', md: 'The pattern' },
  { t: 'p', md: 'The `mcp-test-examples` module bundles `RealMcpServerTestBase` — a base class that starts a real MCP server **once per test class** and hands every test method a **fresh, initialized `McpClient`**. By default it boots the bundled `DummyMcpServer` on an ephemeral port; set the `mcp.test.server.url` system property to run the *same* tests against your own server.' },
  {
    t: 'table',
    headers: ['Piece', 'What it does'],
    rows: [
      ['DummyMcpServer', 'Bundled reference server (SSE: GET /sse + POST /message). Calculator/greet tools, two file resources, translate/code-review prompts. Runnable via main().'],
      ['RealMcpServerTestBase', 'Starts/stops the server around the test class; builds + initializes a client per test method; closes it after.'],
      ['mcp.test.server.url', 'System property. When set, the base class targets that server instead of the bundled one.'],
    ],
  },
  { t: 'h2', id: 'base-class', md: 'Using RealMcpServerTestBase' },
  {
    t: 'code', lang: 'java', file: 'RealMcpServerTestBase.java',
    code: `public abstract class RealMcpServerTestBase {

    protected McpClient client;

    @BeforeAll
    static void startServer() {
        String external = System.getProperty("mcp.test.server.url");
        if (external != null && !external.isBlank()) {
            serverBaseUrl = external;          // test against your own server
        } else {
            server = new DummyMcpServer(0);    // ephemeral port
            server.start();
            serverBaseUrl = server.baseUrl();
        }
    }

    @BeforeEach
    void connectClient() {
        client = McpClient.connectTo(serverBaseUrl)
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .protocolVersion("2024-11-05")
                        .build())
                .initializeOnBuild()
                .build();
    }

    @AfterEach
    void disconnectClient() {
        if (client != null) { client.close(); }
    }
}`,
  },
  { t: 'h2', id: 'example-test', md: 'An example test' },
  { t: 'p', md: 'Extend the base class and write plain JUnit tests. Everything — discovery, invocation, assertions — flows through the real server:' },
  {
    t: 'code', lang: 'java', file: 'ToolsClientTest.java',
    code: `class ToolsClientTest extends RealMcpServerTestBase {

    @Test
    void testCallCalculatorAdd() {
        McpToolResult result = client.tools()
                .callTool("calculator",
                        Map.of("operation", "add", "a", 5, "b", 3))
                .assertSuccess();

        assertEquals("8.0", result.firstText());
    }

    @Test
    void testServerCapabilities() {
        McpServerInfo info = client.serverInfo();
        assertEquals("dummy-mcp-server", info.name());
        assertTrue(info.supportsTools());
        assertTrue(info.supportsResources());
        assertTrue(info.supportsPrompts());
    }
}`,
  },
  { t: 'h2', id: 'lifecycle', md: 'Lifecycle' },
  {
    t: 'list',
    items: [
      '`@BeforeAll` — start `DummyMcpServer(0)` on an ephemeral port (or read the external URL).',
      '`@BeforeEach` — build + `initializeOnBuild()` a fresh client.',
      'Test method — use the protected `client` field.',
      '`@AfterEach` — `client.close()`.',
      '`@AfterAll` — `server.stop()`.',
    ],
  },
  {
    t: 'callout', kind: 'note',
    md: 'Extend the base class yourself, or copy the pattern and point `McpClient.connectTo(...)` at your own MCP server URL. The framework does not care who runs the server.',
  },
  { t: 'h2', id: 'targeting-external', md: 'Targeting an external server' },
  {
    t: 'code', lang: 'shell',
    code: `# Run the exact same tests against your own MCP server
mvn test -Dmcp.test.server.url=http://localhost:8080

# …or against the bundled reference server running standalone
DummyMcpServer.main(new String[0]);   # binds port 8080
mvn test -Dmcp.test.server.url=http://localhost:8080`,
  },
]

export default function IntegrationTestingPage() {
  return <DocLayout page={{
    meta: {
      path: '/integration-testing',
      title: 'Integration Testing',
      description: 'Real-server integration tests with RealMcpServerTestBase and DummyMcpServer — no mocks.',
      section: 'Guides',
      keywords: ['integration', 'test base', 'real server', 'dummy server'],
      editPath: 'docs-site/src/pages/IntegrationTesting.tsx',
    },
    blocks,
  }} />
}
