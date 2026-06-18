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

export interface Testimonial {
  quote: string
  author: string
  role: string
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
    icon: 'Radio', title: 'Streamable HTTP', desc: 'Use Streamable HTTP transport for stateless request/response testing without persistent SSE.',
    lang: 'java', code: `McpClient client = McpClient.connectTo("http://localhost:8080")
    .config(McpClientConfig.builder()
        .timeout(Duration.ofSeconds(30))
        .build())
    .streamableHttp()    // <-- use Streamable HTTP
    .initializeOnBuild()
    .build();

// Use the same fluent API — transport is abstracted
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
]

export const examples: Example[] = [
  { icon: 'PlayCircle', title: 'Basic Client Setup', desc: 'Initialize and configure the MCP client with custom timeouts.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/BasicClientTest.java' },
  { icon: 'Wrench', title: 'Tools Testing', desc: 'Discover tools, inspect schemas, and invoke with arguments.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ToolsClientTest.java' },
  { icon: 'FolderOpen', title: 'Resources Testing', desc: 'List resources, read content, and validate with assertions.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ResourcesClientTest.java' },
  { icon: 'MessageSquare', title: 'Prompts Testing', desc: 'Retrieve prompts, inspect arguments, validate responses.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/PromptsClientTest.java' },
  { icon: 'LineChart', title: 'Performance Monitoring', desc: 'Track exchanges, compute percentiles, assert on latency.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ExchangeTrackingTest.java' },
  { icon: 'CheckCheck', title: 'Full Integration', desc: 'End-to-end workflow covering tools, resources, prompts, performance.', url: 'https://github.com/Abhiramrathod/mcp-testing/tree/master/mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/ComprehensiveIntegrationTest.java' },
]
