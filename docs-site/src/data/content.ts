export interface Feature {
  icon: string
  title: string
  desc: string
}

export interface Module {
  name: string
  tag: string
  tagColor: string
  coords?: string
  desc: string
  details?: string
}

export interface DocSection {
  icon: string
  title: string
  desc: string
  code: string
  lang: string
}

export interface Example {
  icon: string
  title: string
  desc: string
  url: string
}

export const features: Feature[] = [
  { icon: 'Shield', title: 'Type-Safe API', desc: 'Strongly typed domain models eliminate runtime errors. No raw JSON handling.' },
  { icon: 'Link2', title: 'Fluent Assertions', desc: 'Chainable methods make tests readable and maintainable.' },
  { icon: 'Boxes', title: 'Modular Design', desc: 'Clean separation with 6 specialized modules. Import only the API artifact.' },
  { icon: 'Gauge', title: 'Performance Tracking', desc: 'Built-in latency monitoring with percentile calculations.' },
  { icon: 'Lock', title: 'Full Abstraction', desc: 'Internal details never leak to your test code.' },
  { icon: 'Puzzle', title: 'Pluggable Transports', desc: 'SSE and Streamable HTTP built in. Custom transports via McpTransport SPI.' },
]

export const modules: Module[] = [
  { name: 'mcp-test-api', tag: 'Public', tagColor: 'bg-indigo-500', coords: 'io.github.abhiramrathod:mcp-test-api', desc: 'Public API surface — the only artifact you import.', details: 'McpClient, McpClientConfig, ToolsClient, ResourcesClient, PromptsClient, domain models, fluent assertions.' },
  { name: 'mcp-test-client', tag: 'Internal', tagColor: 'bg-pink-500', coords: 'io.github.abhiramrathod:mcp-test-client', desc: 'Internal client implementation.', details: 'Initialization, RPC orchestration, component wiring, tool/resource/prompt directories, exchange tracking.' },
  { name: 'mcp-test-transport', tag: 'Internal', tagColor: 'bg-purple-500', coords: 'io.github.abhiramrathod:mcp-test-transport', desc: 'Transport implementations.', details: 'McpSseTransport (SSE) and McpStreamableHttpTransport (Streamable HTTP). Pluggable via McpTransport SPI.' },
  { name: 'mcp-test-core', tag: 'Internal', tagColor: 'bg-emerald-500', coords: 'io.github.abhiramrathod:mcp-test-core', desc: 'Shared utilities.', details: 'JSON codec (McpJsonCodec), constants, and validation helpers.' },
  { name: 'mcp-test-interfaces', tag: 'SPI', tagColor: 'bg-amber-500', coords: 'io.github.abhiramrathod:mcp-test-interfaces', desc: 'Core interfaces.', details: 'The McpTransport SPI for custom transport implementations.' },
  { name: 'mcp-test-examples', tag: 'Ref', tagColor: 'bg-cyan-500', desc: 'Example tests.', details: 'Tools, resources, prompts, performance, and full integration with bundled DummyMcpServer. Run: mvn -pl mcp-test-examples test' },
  { name: 'mcp-test-junit', tag: 'Public', tagColor: 'bg-rose-500', coords: 'io.github.abhiramrathod:mcp-test-junit', desc: 'JUnit 5 testkit — embedded server + annotations.', details: '@McpServerTest annotation, McpServerExtension, McpTestServer (embedded in-process server), McpResponses helpers, Transport enum (SSE / STREAMABLE_HTTP).' },
]

export const docSections: DocSection[] = [
  {
    icon: 'Wrench', title: 'Tools Testing', desc: 'Discover and invoke MCP tools with strongly-typed results and fluent assertions.',
    lang: 'java', code: `List<McpTool> tools = client.tools().listTools();

McpToolResult result = client.tools()
    .callTool("calculator", Map.of("op", "add", "a", 5, "b", 3))
    .assertSuccess()
    .assertTextContains("8");`,
  },
  {
    icon: 'FolderOpen', title: 'Resources Testing', desc: 'List and read MCP resources with content validation.',
    lang: 'java', code: `List<McpResource> resources = client.resources().listResources();

McpResourceContent content = client.resources()
    .readResource("file://config.json")
    .assertNotEmpty();`,
  },
  {
    icon: 'MessageSquare', title: 'Prompts Testing', desc: 'Retrieve and inspect MCP prompts with argument validation.',
    lang: 'java', code: `List<McpPrompt> prompts = client.prompts().listPrompts();

McpPromptResult prompt = client.prompts()
    .getPrompt("translate", Map.of("lang", "en"))
    .assertNotEmpty();`,
  },
  {
    icon: 'Wifi', title: 'SSE Transport', desc: 'Use SSE (Server-Sent Events) transport for persistent streaming connections.',
    lang: 'java', code: `McpClient client = McpClient.connectTo("http://localhost:8080")
    .config(McpClientConfig.builder()
        .timeout(Duration.ofSeconds(30))
        .build())
    .sse()    // <-- use SSE (default if omitted)
    .initializeOnBuild()
    .build();

// Transport is abstracted — same fluent API
client.tools().callTool("calculator", args)
    .assertSuccess();`,
  },
  {
    icon: 'Radio', title: 'Streamable HTTP', desc: 'Use Streamable HTTP transport for stateless request/response testing without persistent SSE.',
    lang: 'java', code: `McpClient client = McpClient.connectTo("http://localhost:8080")
    .config(McpClientConfig.builder()
        .timeout(Duration.ofSeconds(30))
        .build())
    .streamableHttp()    // <-- use Streamable HTTP
    .initializeOnBuild()
    .build();

// Transport is abstracted — same fluent API
client.tools().callTool("calculator", args)
    .assertSuccess();`,
  },
  {
    icon: 'LineChart', title: 'Performance Monitoring', desc: 'Track every JSON-RPC exchange and assert on latency thresholds.',
    lang: 'java', code: `client.exchanges()
    .assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);

long p99 = client.exchanges()
    .latencyPercentile(McpMethod.TOOLS_CALL, 99);`,
  },
  {
    icon: 'Server', title: 'Server Info', desc: 'Inspect the connected server name, version, protocol version, and advertised capabilities.',
    lang: 'java', code: `McpServerInfo info = client.serverInfo();
System.out.println(info.name() + " " + info.version());
System.out.println(info.protocolVersion());

info.supportsTools();      // true / false
info.supportsResources();
info.supportsPrompts();
info.supportsCapability("logging");`,
  },
  {
    icon: 'TerminalSquare', title: 'Completions', desc: 'Request argument completions for prompts and resource templates via completion/complete.',
    lang: 'java', code: `// Prompt argument completion
McpCompletion c1 = client.prompts()
    .completePromptArgument("translate", "language", "E");
c1.hasSuggestions(); // true
c1.values();         // ["English", ...]

// Resource template argument completion
McpCompletion c2 = client.resources()
    .completeResourceTemplateArgument("file:///{path}", "path", "a");
c2.values();         // ["a.txt", ...]`,
  },
  {
    icon: 'FlaskConical', title: 'JUnit 5 Testkit', desc: 'Spin up an embedded MCP server and get an injected McpClient with a single annotation.',
    lang: 'java', code: `@McpServerTest(transport = Transport.STREAMABLE_HTTP)
class MyMcpTest {

    @BeforeAll
    static void configure(McpTestServer server) {
        server.addTool("echo", "Echoes input", args ->
                McpResponses.toolText(args.path("message").asText()));
    }

    @Test
    void echoWorks(McpClient client) {
        McpToolResult result = client.tools()
                .callTool("echo", Map.of("message", "hello"))
                .assertSuccess();
        assertEquals("hello", result.firstText());
    }
}`,
  },
  {
    icon: 'FolderOpen', title: 'Resource Templates', desc: 'List resource templates and read resources matched by URI template patterns.',
    lang: 'java', code: `List<McpResourceTemplate> templates =
    client.resources().listResourceTemplates();
// e.g. uriTemplate = "file:///{path}"

McpResourceContent content =
    client.resources().readResource("file:///docs/readme.txt")
        .assertNotEmpty();`,
  },
]

export const examples: Example[] = [
  { icon: 'PlayCircle', title: 'Basic Client Setup', desc: 'Initialize and configure the MCP client with custom timeouts.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/BasicClientTest.java' },
  { icon: 'Wrench', title: 'Tools Testing', desc: 'Discover tools, inspect schemas, and invoke with arguments.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ToolsClientTest.java' },
  { icon: 'FolderOpen', title: 'Resources Testing', desc: 'List resources, read content, and validate with assertions.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ResourcesClientTest.java' },
  { icon: 'MessageSquare', title: 'Prompts Testing', desc: 'Retrieve prompts, inspect arguments, validate responses.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/PromptsClientTest.java' },
  { icon: 'LineChart', title: 'Performance Monitoring', desc: 'Track exchanges, compute percentiles, assert on latency.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ExchangeTrackingTest.java' },
  { icon: 'CheckCheck', title: 'Full Integration', desc: 'End-to-end workflow covering tools, resources, prompts, performance.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ComprehensiveIntegrationTest.java' },
  { icon: 'PlayCircle', title: 'JUnit 5 SSE Integration', desc: 'Embedded server + @McpServerTest annotation over SSE transport.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-junit/src/test/java/mcp/toolkit/testing/junit/annotation/McpServerTestSseIntegrationTest.java' },
  { icon: 'Radio', title: 'JUnit 5 Streamable HTTP Integration', desc: 'Embedded server with resource templates, completions, and Streamable HTTP transport.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-junit/src/test/java/mcp/toolkit/testing/junit/annotation/McpServerTestStreamableIntegrationTest.java' },
]
