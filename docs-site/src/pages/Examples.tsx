import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  { t: 'p', md: 'Working examples from the `mcp-test-examples` module. Each runs against the real bundled `DummyMcpServer` via `RealMcpServerTestBase`. The full source is in the repo under `mcp-test-examples/src/test/`.' },
  { t: 'h2', id: 'client-init', md: 'Client initialization & server info' },
  {
    t: 'code', lang: 'java', file: 'BasicClientTest',
    code: `@Test
void testInitialize() {
    McpServerInfo info = client.serverInfo();
    assertEquals("dummy-mcp-server", info.name());
}

@Test
void testCapabilities() {
    McpServerInfo info = client.serverInfo();
    assertTrue(info.supportsTools());
    assertTrue(info.supportsResources());
    assertTrue(info.supportsPrompts());
}`,
  },
  { t: 'h2', id: 'tools', md: 'Tools' },
  {
    t: 'code', lang: 'java', file: 'ToolsClientTest',
    code: `@Test
void testListTools() {
    List<McpTool> tools = client.tools().listTools();
    assertTrue(tools.stream().anyMatch(t -> t.name().equals("calculator")));
}

@Test
void testCallTool() {
    McpToolResult result = client.tools().callTool("calculator",
            Map.of("operation", "add", "a", 5, "b", 3))
            .assertSuccess();
    assertEquals("8.0", result.firstText());
}`,
  },
  { t: 'h2', id: 'resources', md: 'Resources' },
  {
    t: 'code', lang: 'java', file: 'ResourcesClientTest',
    code: `@Test
void testListResources() {
    List<McpResource> resources = client.resources().listResources();
    assertEquals(2, resources.size());
}

@Test
void testReadResource() {
    McpResourceResult result = client.resources()
            .readResource("file:///logs/app.log")
            .assertSuccess();
    assertTrue(result.text().contains("INFO"));
}`,
  },
  { t: 'h2', id: 'prompts', md: 'Prompts' },
  {
    t: 'code', lang: 'java', file: 'PromptsClientTest',
    code: `@Test
void testGetPrompt() {
    McpPromptResult result = client.prompts()
            .getPrompt("translate", Map.of("text", "hello", "target", "es"))
            .assertSuccess();
    assertTrue(result.text().contains("hola"));
}`,
  },
  { t: 'h2', id: 'exchanges', md: 'Exchange tracking' },
  {
    t: 'code', lang: 'java', file: 'ExchangeTrackingTest',
    code: `@Test
void testExchangesRecorded() {
    client.tools().callTool("calculator", Map.of(
            "operation", "add", "a", 1, "b", 2));

    assertTotalExchanges(client, 1);
    assertRequestSucceeded(client, "tools/call");

    McpExchangeSummary summary = client.exchanges().summary();
    assertTrue(summary.avgDurationMillis("tools/call") >= 0);
}`,
  },
  { t: 'h2', id: 'comprehensive', md: 'Comprehensive flow' },
  {
    t: 'code', lang: 'java', file: 'ComprehensiveIntegrationTest',
    code: `@Test
void testFullSurface() {
    // initialize (already done by base class)
    assertTrue(client.serverInfo().supportsTools());

    // tools
    client.tools().callTool("calculator",
            Map.of("operation", "multiply", "a", 3, "b", 4))
            .assertSuccess().assertTextEquals("12.0");

    // resources
    client.resources().readResource("file:///docs/README.md")
            .assertSuccess().assertTextContains("mcp-test");

    // prompts
    client.prompts().getPrompt("code-review", Map.of("code", "x = 1"))
            .assertSuccess();

    // exchanges tell the story
    assertTotalExchanges(client, 3);
    assertRequestSucceeded(client, "tools/call");
    assertRequestSucceeded(client, "resources/read");
    assertRequestSucceeded(client, "prompts/get");
}`,
  },
  { t: 'h2', id: 'next', md: 'Where to go next' },
  {
    t: 'list',
    items: [
      'Point the same tests at your own server with `-Dmcp.test.server.url=http://localhost:8080`.',
      'Enforce latency budgets with the **Performance** guide.',
      'Learn the stateless protocol in **Transports & Protocols**.',
    ],
  },
]

export default function ExamplesPage() {
  return <DocLayout page={{
    meta: {
      path: '/examples',
      title: 'Examples',
      description: 'Complete working tests for tools, resources, prompts, and exchange tracking.',
      section: 'Guides',
      keywords: ['examples', 'samples', 'tools', 'resources', 'prompts'],
      editPath: 'docs-site/src/pages/Examples.tsx',
    },
    blocks,
  }} />
}
