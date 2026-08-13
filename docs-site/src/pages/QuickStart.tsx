import DocLayout from '../layouts/DocLayout'
import type { Block } from '../lib/markdown'

const blocks: Block[] = [
  {
    t: 'callout', kind: 'info',
    md: '**Assumes** Java 17+ and an MCP server you can reach over HTTP. No prior MCP knowledge needed — the steps below cover everything.',
  },
  { t: 'h2', id: 'overview', md: 'Overview' },
  {
    t: 'p',
    md: '`mcp-test` is a Java testing framework for **Model Context Protocol (MCP) servers**. Your tests use a strongly-typed, fluent `McpClient` to connect to a running server and assert on its tools, resources, prompts, and response latency. All tests are **integration tests** — a real server is exercised over the network, so nothing is mocked.',
  },
  { t: 'h2', id: 'what-youll-need', md: 'What you’ll need' },
  {
    t: 'list',
    items: [
      '**Java 17+** (JDK 17 LTS or newer)',
      'A **Maven or Gradle** project (JUnit 5 for running tests)',
      'An **MCP server** to test — or use the bundled `DummyMcpServer` from `mcp-test-examples`',
    ],
  },
  { t: 'h2', id: 'step-1-add-dependency', md: 'Step 1 — Add the dependency' },
  { t: 'p', md: 'Only `mcp-test-api` is imported — everything else is a transitive dependency.' },
  {
    t: 'tabs',
    tabs: [
      { label: 'Maven', lang: 'xml', code: `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>1.0.38</version>
  <scope>test</scope>
</dependency>` },
      { label: 'Gradle', lang: 'gradle', code: `testImplementation 'io.github.abhiramrathod:mcp-test-api:1.0.38'` },
    ],
  },
  { t: 'h2', id: 'step-2-start-server', md: 'Step 2 — Start a server' },
  {
    t: 'p',
    md: 'You can test against any running MCP server. To try the framework without one, `mcp-test-examples` bundles a reference server:',
  },
  {
    t: 'code', lang: 'java', file: 'DummyMcpServer.java',
    code: `DummyMcpServer server = new DummyMcpServer(0);  // 0 = ephemeral port
server.start();
String baseUrl = server.baseUrl();  // e.g. http://localhost:34567`,
  },
  {
    t: 'callout', kind: 'tip',
    md: '`RealMcpServerTestBase` (in `mcp-test-examples`) starts this server automatically per test class and hands each test a fresh, initialized client.',
  },
  { t: 'h2', id: 'step-3-write-a-test', md: 'Step 3 — Write your first test' },
  {
    t: 'p',
    md: '`McpClient.connectTo()` builds a client. `.streamableHttp()` selects the transport; `.sse()` is the default if omitted. `initializeOnBuild()` runs the MCP handshake eagerly.',
  },
  {
    t: 'code', lang: 'java', file: 'MyFirstMcpTest.java',
    code: `import mcp.toolkit.testing.framework.api.McpClient;
import org.junit.jupiter.api.Test;
import java.time.Duration;
import java.util.Map;

class MyFirstMcpTest {

    @Test
    void calculatorAddsNumbers() {
        McpClient client = McpClient.connectTo("http://localhost:8080")
                .config(McpClientConfig.builder()
                        .timeout(Duration.ofSeconds(10))
                        .build())
                .streamableHttp()
                .initializeOnBuild()
                .build();

        client.tools()
                .callTool("calculator", Map.of("op", "add", "a", 5, "b", 3))
                .assertSuccess()
                .assertTextContains("8");

        client.close();
    }
}`,
  },
  { t: 'h2', id: 'step-4-run', md: 'Step 4 — Run it' },
  {
    t: 'tabs',
    tabs: [
      { label: 'Maven', lang: 'bash', code: 'mvn test' },
      { label: 'Gradle', lang: 'bash', code: 'gradle test' },
    ],
  },
  {
    t: 'p',
    md: 'The test connects to your server, lists nothing extra — it simply calls the `calculator` tool and asserts the response contains `8`.',
  },
  { t: 'h2', id: 'whats-next', md: 'What’s next' },
  {
    t: 'list',
    items: [
      '**Installation** — full Maven Central / JitPack / build-from-source instructions.',
      '**Tools, Resources, Prompts** guides — assert on each capability.',
      '**Integration Testing** — test against a real reference server with `RealMcpServerTestBase`.',
      '**Performance** — latency assertions and percentile tracking with `client.exchanges()`.',
    ],
  },
]

export default function QuickStartPage() {
  return <DocLayout page={{
    meta: {
      path: '/quickstart',
      title: 'Quick Start',
      description: 'Get from zero to a passing MCP server test in four steps.',
      section: 'Getting Started',
      keywords: ['quickstart', 'getting started', 'first test', 'mcp test'],
      editPath: 'docs-site/src/pages/QuickStart.tsx',
    },
    blocks,
  }} />
}
