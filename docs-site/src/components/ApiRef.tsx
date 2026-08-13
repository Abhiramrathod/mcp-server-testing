import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import Reveal from './Reveal'

function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter language="java" style={atomDark}
        customStyle={{ padding: '10px 14px', borderRadius: '3px', fontSize: '11px', lineHeight: '1.6', margin: 0, background: '#080808', border: '1px solid #181818' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
        className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#111', border: '1px solid #222' }}
      >
        {copied ? <Check size={11} style={{ color: 'var(--accent)' }} /> : <Copy size={11} style={{ color: '#666' }} />}
      </button>
    </div>
  )
}

const sections = [
  {
    name: 'McpClient',
    tag: 'entry-point',
    desc: 'The single entry point for all MCP testing. Build one instance per test class, call the domain sub-clients (tools, resources, prompts) to interact with the server, and close it when done. Initialization is lazy — the MCP handshake runs automatically on first use, or explicitly via initializeOnBuild() / initialize().',
    methods: [
      { sig: 'static Builder connectTo(String serverUrl)', note: 'Start building a client for the given base URL.' },
      { sig: 'McpClient initialize()', note: 'Explicit initialize handshake. Optional — auto-triggered on first use.' },
      { sig: 'boolean isInitialized()', note: 'Returns true after the handshake completes.' },
      { sig: 'McpServerInfo serverInfo()', note: 'Returns name, version, protocolVersion, capabilities. Triggers init if needed.' },
      { sig: 'void ping()', note: 'Sends ping to verify server is reachable and session is alive.' },
      { sig: 'void setLogLevel(String level)', note: 'logging/setLevel — RFC 5424 levels: debug, info, warning, error, …' },
      { sig: 'void cancelRequest(long requestId, String reason)', note: 'Sends notifications/cancelled for a previously issued request.' },
      { sig: 'void onServerMessage(Consumer<JsonNode> listener)', note: 'Listener for server-initiated messages: roots/list, sampling/createMessage, notifications/progress, …' },
      { sig: 'void setSessionExpiredHandler(Runnable handler)', note: 'Called when the server terminates the HTTP session; re-initialize inside.' },
      { sig: 'ToolsClient tools()', note: 'Sub-client for tool discovery and invocation.' },
      { sig: 'ResourcesClient resources()', note: 'Sub-client for resource listing, templates, reading, completions.' },
      { sig: 'PromptsClient prompts()', note: 'Sub-client for prompt listing, retrieval, completions.' },
      { sig: 'McpExchangeAssertions exchanges()', note: 'Exchange history, latency assertions, export.' },
      { sig: 'void close()', note: 'Closes the connection and releases all resources.' },
    ],
    builderCode: `McpClient client = McpClient.connectTo("http://localhost:8080")
    .config(McpClientConfig.builder()
        .timeout(Duration.ofSeconds(30))
        .protocolVersion("2024-11-05")
        .header("Authorization", "Bearer <token>")
        .build())
    .streamableHttp()   // or .sse() / .streamableHttp("/custom/path")
    .initializeOnBuild()
    .build();`,
  },
  {
    name: 'McpClientConfig',
    tag: 'config',
    desc: 'Controls how the client connects and authenticates. The most important options are timeout (how long to wait for each RPC call) and protocolVersion (must match what the server expects — use 2024-11-05 for SSE servers, 2025-03-26 for legacy Streamable HTTP servers, and 2026-07-28 or later for the stateless protocol). Use header() to pass Authorization tokens or any other per-request HTTP headers.',
    methods: [
      { sig: 'Builder timeout(Duration timeout)', note: 'Request timeout for connection and RPC calls. Default: 10 s.' },
      { sig: 'Builder protocolVersion(String version)', note: 'MCP protocol version. Default: "2024-11-05" (legacy). "2026-07-28" selects the stateless protocol.' },
      { sig: 'Builder objectMapper(ObjectMapper mapper)', note: 'Custom Jackson ObjectMapper for JSON serialization.' },
      { sig: 'Builder header(String name, String value)', note: 'Adds a single HTTP header sent on every transport request.' },
      { sig: 'Builder headers(Map<String,String> headers)', note: 'Replaces all custom HTTP headers at once.' },
    ],
    builderCode: `McpClientConfig config = McpClientConfig.builder()
    .timeout(Duration.ofSeconds(30))
    .protocolVersion("2025-03-26")
    .header("Authorization", "Bearer <token>")
    .build();

// Constants
McpClientConfig.DEFAULT_TIMEOUT           // Duration.ofSeconds(10)
McpClientConfig.DEFAULT_PROTOCOL_VERSION  // "2024-11-05"
McpClientConfig.DEFAULT_SSE_PATH          // "/sse"
McpClientConfig.DEFAULT_MCP_PATH          // "/mcp"`,
  },
  {
    name: 'ToolsClient',
    tag: 'client.tools()',
    desc: 'Tests MCP tools — the functions your server exposes. Use listTools() to verify the server advertises the right tools, getTool() to inspect a tool\'s JSON Schema, and callTool() to invoke it and assert on the result. McpToolResult carries the content array and an isError flag; assertSuccess() and assertTextContains() let you chain assertions inline.',
    methods: [
      { sig: 'List<McpTool> listTools()', note: 'Returns all tools registered on the server.' },
      { sig: 'McpTool getTool(String name)', note: 'Returns a single tool definition by name. Throws AssertionError if not found.' },
      { sig: 'boolean hasTool(String name)', note: 'Returns true if a tool with that name exists.' },
      { sig: 'McpToolResult callTool(String name)', note: 'Invokes a tool with no arguments.' },
      { sig: 'McpToolResult callTool(String name, Object args)', note: 'Invokes a tool with the given arguments (Map, POJO, or JsonNode).' },
    ],
    builderCode: `List<McpTool> tools = client.tools().listTools();
// McpTool fields: name(), description(), inputSchema() (JsonNode)

McpToolResult result = client.tools()
    .callTool("calculator", Map.of("op", "add", "a", 5, "b", 3))
    .assertSuccess()          // throws if isError=true
    .assertTextContains("8"); // throws if firstText() doesn't contain "8"

result.firstText();   // text of first content item
result.isError();     // true if tool reported an error
result.content();     // List<McpToolResult.ContentItem>`,
  },
  {
    name: 'ResourcesClient',
    tag: 'client.resources()',
    desc: 'Tests MCP resources — files, database rows, or any data the server exposes by URI. listResources() returns static URIs; listResourceTemplates() returns URI patterns like file:///{path} that accept arguments. readResource() fetches the content. completeResourceTemplateArgument() tests the server\'s autocomplete suggestions for template arguments.',
    methods: [
      { sig: 'List<McpResource> listResources()', note: 'Returns all resources, following pagination (nextCursor) transparently.' },
      { sig: 'List<McpResourceTemplate> listResourceTemplates()', note: 'Returns all resource templates, e.g. "file:///{path}".' },
      { sig: 'McpResourceContent readResource(String uri)', note: 'Reads a resource by URI.' },
      { sig: 'McpCompletion completeResourceTemplateArgument(String uriTemplate, String argumentName, String value)', note: 'completion/complete for a resource template argument.' },
      { sig: 'McpCompletion completeResourceTemplateArgument(String uriTemplate, String argumentName, String value, Object contextArguments)', note: 'Same with optional context arguments.' },
    ],
    builderCode: `// List resources
List<McpResource> resources = client.resources().listResources();
// McpResource fields: uri(), name(), description(), mimeType(), raw()

// List templates
List<McpResourceTemplate> templates = client.resources().listResourceTemplates();
// McpResourceTemplate fields: uriTemplate(), name(), description(), mimeType(), raw()

// Read a resource
McpResourceContent content = client.resources()
    .readResource("file:///data/config.json")
    .assertNotEmpty()
    .assertTextContains("version");

content.firstText();   // text of first content item
content.contents();    // List<McpResourceContent.ContentItem>

// Completion
McpCompletion c = client.resources()
    .completeResourceTemplateArgument("file:///{path}", "path", "a");
c.hasSuggestions();  // true
c.values();          // ["a.txt", "api.json", ...]
c.total();           // Integer or null
c.hasMore();         // boolean`,
  },
  {
    name: 'PromptsClient',
    tag: 'client.prompts()',
    desc: 'Tests MCP prompts — reusable message templates the server provides. listPrompts() verifies the server exposes the expected prompts and their declared arguments. getPrompt() renders a prompt with specific arguments and returns the message list. completePromptArgument() tests the server\'s autocomplete for prompt arguments.',
    methods: [
      { sig: 'List<McpPrompt> listPrompts()', note: 'Returns all prompts, following pagination transparently.' },
      { sig: 'McpPromptResult getPrompt(String name)', note: 'Retrieves a rendered prompt with no arguments.' },
      { sig: 'McpPromptResult getPrompt(String name, Object args)', note: 'Retrieves a rendered prompt with the given arguments.' },
      { sig: 'McpCompletion completePromptArgument(String promptName, String argumentName, String value)', note: 'completion/complete for a prompt argument.' },
      { sig: 'McpCompletion completePromptArgument(String promptName, String argumentName, String value, Object contextArguments)', note: 'Same with optional context arguments.' },
    ],
    builderCode: `List<McpPrompt> prompts = client.prompts().listPrompts();
// McpPrompt fields: name(), description(), arguments() (List<PromptArgument>), raw()
// PromptArgument fields: name(), description(), required()

McpPromptResult result = client.prompts()
    .getPrompt("translate", Map.of("language", "Spanish"))
    .assertNotEmpty()
    .assertUserTextContains("Translate");

result.firstUserText();  // text of first "user" role message
result.messages();       // List<McpPromptResult.PromptMessage>
result.description();    // optional description

// Completion
McpCompletion c = client.prompts()
    .completePromptArgument("translate", "language", "E");
c.values();  // ["English", "Estonian", ...]`,
  },
  {
    name: 'McpExchangeAssertions',
    tag: 'client.exchanges()',
    desc: 'Every JSON-RPC call the client makes is recorded as an McpExchangeSummary with its method, status (SUCCESS / ERROR / TIMEOUT / FAILED), and round-trip latency. Use this to write performance assertions (assertAverageLatencyBelow, assertLatencyPercentileBelow), verify no calls failed (assertAllSucceeded), or export the full history as JSON for CI reporting.',
    methods: [
      { sig: 'List<McpExchangeSummary> allExchanges()', note: 'All recorded exchanges.' },
      { sig: 'McpExchangeSummary lastExchange()', note: 'Most recent exchange. Throws if none.' },
      { sig: 'List<McpExchangeSummary> exchangesForMethod(McpMethod method)', note: 'All exchanges for a specific method.' },
      { sig: 'int count()', note: 'Total number of recorded exchanges.' },
      { sig: 'int countForMethod(McpMethod method)', note: 'Count for a specific method.' },
      { sig: 'long averageLatency(McpMethod method)', note: 'Average round-trip latency in ms for a method.' },
      { sig: 'long latencyPercentile(McpMethod method, int percentile)', note: 'Latency at the given percentile (0–100) in ms.' },
      { sig: 'void assertLastSucceeded()', note: 'Throws AssertionError if last exchange was not SUCCESS.' },
      { sig: 'void assertLastMethod(String method)', note: 'Throws if last exchange method does not match.' },
      { sig: 'void assertAllSucceeded(McpMethod method)', note: 'Throws if any exchange for that method failed.' },
      { sig: 'void assertAverageLatencyBelow(McpMethod method, long thresholdMillis)', note: 'Throws if average latency exceeds threshold.' },
      { sig: 'void assertLatencyPercentileBelow(McpMethod method, int percentile, long thresholdMillis)', note: 'Throws if Pn latency exceeds threshold.' },
      { sig: 'void clear()', note: 'Clears all recorded exchanges.' },
      { sig: 'JsonNode export()', note: 'Exports all exchanges as a JSON array for reporting or telemetry.' },
    ],
    builderCode: `// McpMethod enum — all standard JSON-RPC methods
McpMethod.INITIALIZE              // "initialize"
McpMethod.PING                    // "ping"
McpMethod.TOOLS_LIST              // "tools/list"
McpMethod.TOOLS_CALL              // "tools/call"
McpMethod.RESOURCES_LIST          // "resources/list"
McpMethod.RESOURCES_READ          // "resources/read"
McpMethod.RESOURCES_TEMPLATES_LIST // "resources/templates/list"
McpMethod.PROMPTS_LIST            // "prompts/list"
McpMethod.PROMPTS_GET             // "prompts/get"
McpMethod.COMPLETION_COMPLETE     // "completion/complete"
McpMethod.LOGGING_SET_LEVEL       // "logging/setLevel"

// McpExchangeSummary fields
summary.id()           // long — unique exchange id
summary.method()       // String — JSON-RPC method name
summary.status()       // Status.SUCCESS | ERROR | TIMEOUT | FAILED
summary.latency()      // Duration (round-trip), may be null
summary.errorDetail()  // String error description, may be null
summary.isSuccess()    // shorthand for status == SUCCESS

// Usage
client.exchanges().assertLastSucceeded();
client.exchanges().assertAllSucceeded(McpMethod.TOOLS_CALL);
client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
client.exchanges().assertLatencyPercentileBelow(McpMethod.TOOLS_CALL, 99, 1000);
long p95 = client.exchanges().latencyPercentile(McpMethod.TOOLS_CALL, 95);
JsonNode report = client.exchanges().export();`,
  },
  {
    name: 'McpServerInfo',
    tag: 'model',
    desc: 'Typed server information: name, version, protocol version, and advertised capabilities. Built from the initialize handshake result (legacy era) or the server/discover result (stateless era, 2026-07-28+). Obtained via client.serverInfo() — triggers initialization if not already done. Stateless clients can also call client.discover() for the raw result and client.isStateless() to check the era.',
    methods: [
      { sig: 'String name()', note: 'Server name reported during initialization or discover.' },
      { sig: 'String version()', note: 'Server version reported during initialization or discover.' },
      { sig: 'String protocolVersion()', note: 'MCP protocol version negotiated (initialize) or highest supported (discover).' },
      { sig: 'Set<String> supportedCapabilities()', note: 'Capability names advertised by the server, e.g. "tools", "resources", "prompts".' },
      { sig: 'boolean supportsTools()', note: 'Shorthand for supportsCapability("tools").' },
      { sig: 'boolean supportsResources()', note: 'Shorthand for supportsCapability("resources").' },
      { sig: 'boolean supportsPrompts()', note: 'Shorthand for supportsCapability("prompts").' },
      { sig: 'boolean supportsCapability(String capability)', note: 'Returns true if the named capability is present.' },
      { sig: 'JsonNode raw()', note: 'Raw JSON result as returned by the server (initialize or discover).' },
    ],
    builderCode: `McpServerInfo info = client.serverInfo();
info.name();                        // "my-mcp-server"
info.version();                     // "1.2.0"
info.protocolVersion();             // "2026-07-28" (stateless era)
info.supportsTools();               // true
info.supportsResources();           // true
info.supportsPrompts();             // false
info.supportsCapability("logging"); // true / false

// Stateless helpers (2026-07-28+)
client.isStateless();               // true
client.discover().path("protocolVersions"); // supported versions`,
  },
]

export default function ApiRef() {
  const [active, setActive] = useState(0)
  const s = sections[active]

  return (
    <section id="api-ref" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> api-reference
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim2)' }}>$ javadoc mcp-test-api — public surface</p>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            {sections.map((sec, i) => (
              <button key={sec.name} onClick={() => setActive(i)}
                className="px-2.5 py-1 rounded text-xs transition-all font-mono"
                style={{
                  background: active === i ? 'var(--accent-dim)' : 'transparent',
                  color: active === i ? 'var(--accent)' : 'var(--text-dim)',
                  border: active === i ? '1px solid var(--accent-glow)' : '1px solid transparent',
                }}
              >
                {sec.name}
              </button>
            ))}
          </div>

          {/* Active section */}
          <div key={active} className="fade-in fade-in-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent)' }}>{s.name}</span>
              <span className="tag" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)', fontSize: '10px', padding: '1px 6px', borderRadius: '3px' }}>
                {s.tag}
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>{s.desc}</p>

            {/* Method table */}
            <div className="mb-4" style={{ borderLeft: '2px solid var(--border)' }}>
              {s.methods.map((m, i) => (
                <div key={i} className="pl-3 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs font-mono mb-0.5" style={{ color: 'var(--text)' }}>{m.sig}</p>
                  <p className="text-xs" style={{ color: 'var(--text-dim2)' }}>{m.note}</p>
                </div>
              ))}
            </div>

            {/* Code example */}
            <p className="text-xs mb-1.5" style={{ color: 'var(--text-dim)' }}>$ example</p>
            <Code code={s.builderCode} />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
