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

const tabs = [
  {
    label: '@McpServerTest',
    desc: 'A composed JUnit 5 annotation that replaces all the boilerplate of starting a server and building a client. Annotate your test class with it, configure the server in a @BeforeAll method that receives McpTestServer as a parameter, and every @Test method automatically receives a fresh, initialized McpClient. The server starts once for the whole class and stops after all tests finish.',
    attrs: [
      { name: 'transport', type: 'Transport', default: 'Transport.SSE', note: 'Transport the embedded server and injected client use.' },
      { name: 'name', type: 'String', default: '"mcp-test-server"', note: 'Advertised server name returned during initialize.' },
      { name: 'version', type: 'String', default: '"1.0.0"', note: 'Advertised server version returned during initialize.' },
      { name: 'protocolVersion', type: 'String', default: '"2024-11-05"', note: 'MCP protocol version advertised during initialize.' },
      { name: 'port', type: 'int', default: '0', note: 'Port to bind; 0 selects an ephemeral port.' },
      { name: 'clientTimeoutMillis', type: 'long', default: '10000', note: 'Timeout applied to the injected client.' },
    ],
    code: `@McpServerTest(
    transport = Transport.STREAMABLE_HTTP,
    protocolVersion = "2025-03-26",
    name = "my-server",
    version = "2.0.0",
    clientTimeoutMillis = 5000)
class MyMcpTest {

    // McpTestServer is shared across all tests in the class
    @BeforeAll
    static void configure(McpTestServer server) {
        server.addTool("echo", "Echoes input", args ->
                McpResponses.toolText(args.path("message").asText()));

        server.addResource("file:///config.json", "Config", "application/json",
                params -> McpResponses.resourceText(
                        "file:///config.json", "application/json", "{\"v\":1}"));

        server.addPrompt("greet", "Greets a user",
                List.of(new McpTestServer.PromptArgument("name", "User name", true)),
                params -> McpResponses.promptUser("Greets",
                        "Hello " + params.path("arguments").path("name").asText()));
    }

    // McpClient is fresh per test method, closed automatically after each
    @Test
    void echoWorks(McpClient client) {
        McpToolResult result = client.tools()
                .callTool("echo", Map.of("message", "hello"))
                .assertSuccess();
        assertEquals("hello", result.firstText());
    }

    @Test
    void serverInfoIsCorrect(McpClient client) {
        McpServerInfo info = client.serverInfo();
        assertEquals("my-server", info.name());
        assertEquals("2025-03-26", info.protocolVersion());
        assertTrue(info.supportsTools());
    }
}`,
  },
  {
    label: 'McpTestServer',
    desc: 'An embedded, in-process HTTP server that speaks the MCP protocol. It lets you write tests without running a real MCP server — you register handlers for tools, resources, prompts, and completions, and the server responds exactly as a real server would. Handlers receive the raw JsonNode params and return any serializable value; use McpResponses helpers to build correctly shaped payloads.',
    attrs: [
      { name: 'addTool(name, desc, handler)', type: 'void', default: '—', note: 'Registers a tool with an open {type:"object"} schema.' },
      { name: 'addTool(name, desc, inputSchema, handler)', type: 'void', default: '—', note: 'Registers a tool with an explicit JSON Schema.' },
      { name: 'addResource(uri, name, mimeType, handler)', type: 'void', default: '—', note: 'Registers a resource at the given URI.' },
      { name: 'addResource(uri, name, description, mimeType, handler)', type: 'void', default: '—', note: 'Same with an optional description.' },
      { name: 'addResourceTemplate(uriTemplate, name, mimeType, handler)', type: 'void', default: '—', note: 'Registers a URI template, e.g. "file:///{path}".' },
      { name: 'addPrompt(name, desc, handler)', type: 'void', default: '—', note: 'Registers a prompt with no declared arguments.' },
      { name: 'addPrompt(name, desc, arguments, handler)', type: 'void', default: '—', note: 'Registers a prompt with declared PromptArgument list.' },
      { name: 'addPromptCompletion(promptName, argumentName, handler)', type: 'void', default: '—', note: 'Registers a completion/complete provider for a prompt argument.' },
      { name: 'addResourceCompletion(uriTemplate, argumentName, handler)', type: 'void', default: '—', note: 'Registers a completion/complete provider for a resource template argument.' },
      { name: 'onMethod(method, handler)', type: 'void', default: '—', note: 'Handles an arbitrary JSON-RPC method not covered by built-in dispatch.' },
      { name: 'start() / stop() / close()', type: 'void', default: '—', note: 'Lifecycle. close() delegates to stop().' },
      { name: 'baseUrl()', type: 'String', default: '—', note: 'Returns "http://localhost:{port}" after start().' },
      { name: 'port()', type: 'int', default: '—', note: 'Bound port after start().' },
      { name: 'isRunning()', type: 'boolean', default: '—', note: 'True while the server is running.' },
    ],
    code: `// Manual usage (without @McpServerTest)
McpTestServer server = McpTestServer.builder()
        .transport(Transport.STREAMABLE_HTTP)
        .protocolVersion("2025-03-26")
        .port(0)   // ephemeral
        .build();
server.start();

// Register handlers
server.addTool("add", "Adds two numbers", args -> {
    double result = args.path("a").asDouble() + args.path("b").asDouble();
    return McpResponses.toolText(String.valueOf(result));
});

server.addResourceTemplate("file:///{path}", "File", "text/plain",
        params -> McpResponses.resourceText(
                params.path("uri").asText(), "text/plain",
                "content of " + params.path("uri").asText()));

server.addResourceCompletion("file:///{path}", "path",
        params -> List.of("readme.txt", "config.json"));

server.addPromptCompletion("translate", "language",
        params -> List.of("English", "Spanish", "French"));

// Custom method handler
server.onMethod("custom/echo",
        params -> Map.of("echo", params.path("text").asText()));

try (McpClient client = McpClient.connectTo(server.baseUrl())
        .streamableHttp().initializeOnBuild().build()) {
    client.tools().callTool("add", Map.of("a", 3, "b", 4))
            .assertSuccess().assertTextContains("7.0");
}
server.stop();`,
  },
  {
    label: 'McpResponses',
    desc: 'Static factory methods that produce response payloads in the exact shape the framework\'s domain clients expect to parse. Use these inside McpTestServer handlers instead of building maps by hand — they guarantee the right field names (content, isError, contents, messages, completion) and structure.',
    attrs: [
      { name: 'toolText(String text)', type: 'Map', default: '—', note: 'tools/call result with a single text content item, isError=false.' },
      { name: 'toolResult(List<?> content)', type: 'Map', default: '—', note: 'tools/call result with a structured content array, isError=false.' },
      { name: 'toolError(String text)', type: 'Map', default: '—', note: 'tools/call result with isError=true.' },
      { name: 'resourceText(String uri, String mimeType, String text)', type: 'Map', default: '—', note: 'resources/read result with a single text content item.' },
      { name: 'promptUser(String description, String text)', type: 'Map', default: '—', note: 'prompts/get result with a single user message.' },
      { name: 'promptResult(String description, List<?> messages)', type: 'Map', default: '—', note: 'prompts/get result with an arbitrary message list.' },
      { name: 'completion(List<String> values)', type: 'Map', default: '—', note: 'completion/complete result.' },
      { name: 'completion(List<String> values, int total, boolean hasMore)', type: 'Map', default: '—', note: 'completion/complete result with explicit paging.' },
    ],
    code: `// Tool responses
McpResponses.toolText("42");
McpResponses.toolError("division by zero");
McpResponses.toolResult(List.of(
    Map.of("type", "text", "text", "result: 42")));

// Resource response
McpResponses.resourceText(
    "file:///data.json", "application/json", "{\"key\":\"value\"}");

// Prompt responses
McpResponses.promptUser("Translates text", "Translate to Spanish: hello");
McpResponses.promptResult("Multi-turn", List.of(
    Map.of("role", "user",
           "content", Map.of("type", "text", "text", "hello")),
    Map.of("role", "assistant",
           "content", Map.of("type", "text", "text", "hola"))));

// Completion responses
McpResponses.completion(List.of("English", "Spanish", "French"));
McpResponses.completion(List.of("English"), 10, true); // with paging`,
  },
  {
    label: 'Transport enum',
    desc: 'Chooses which MCP transport protocol the embedded server speaks and the injected client uses. SSE (the default) uses a persistent Server-Sent Events stream opened at /sse; the server pushes responses back over that stream. STREAMABLE_HTTP uses stateless POST requests to /mcp where each response is returned inline in the HTTP body — no persistent connection needed. Use STREAMABLE_HTTP with protocolVersion="2025-03-26" for newer servers.',
    attrs: [
      { name: 'Transport.SSE', type: 'enum', default: 'default', note: 'Legacy HTTP + Server-Sent Events transport (protocol version 2024-11-05).' },
      { name: 'Transport.STREAMABLE_HTTP', type: 'enum', default: '—', note: 'Streamable HTTP transport (protocol version 2025-03-26 and later).' },
    ],
    code: `// In @McpServerTest
@McpServerTest(transport = Transport.SSE)               // default
@McpServerTest(transport = Transport.STREAMABLE_HTTP,
               protocolVersion = "2025-03-26")

// In McpTestServer.builder()
McpTestServer.builder()
    .transport(Transport.STREAMABLE_HTTP)
    .build();

// SSE server endpoints:        GET /sse  +  POST /mcp/message
// Streamable HTTP endpoint:    POST /mcp  (GET /mcp for SSE push, DELETE /mcp for session end)`,
  },
]

export default function JUnitTestkit() {
  const [active, setActive] = useState(0)
  const t = tabs[active]

  return (
    <section id="junit" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> junit5-testkit
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim2)' }}>$ man mcp-test-junit — embedded server + annotations</p>

          {/* Dependency note */}
          <div className="mb-4 px-3 py-2 rounded text-xs" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--accent)' }}>import</span>
            {' '}io.github.abhiramrathod:<span style={{ color: 'var(--accent)' }}>mcp-test-junit</span>:1.0.38
            <span style={{ color: 'var(--text-dim2)' }}> — separate artifact, not transitive from mcp-test-api</span>
          </div>

          {/* Tab bar */}
          <div className="flex flex-wrap gap-1 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            {tabs.map((tab, i) => (
              <button key={tab.label} onClick={() => setActive(i)}
                className="px-2.5 py-1 rounded text-xs transition-all font-mono"
                style={{
                  background: active === i ? 'var(--accent-dim)' : 'transparent',
                  color: active === i ? 'var(--accent)' : 'var(--text-dim)',
                  border: active === i ? '1px solid var(--accent-glow)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active tab */}
          <div key={active} className="fade-in fade-in-1">
            <p className="text-xs font-bold font-mono mb-1" style={{ color: 'var(--accent)' }}>{t.label}</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>{t.desc}</p>

            {/* Attribute table */}
            <div className="mb-4" style={{ borderLeft: '2px solid var(--border)' }}>
              {t.attrs.map((a, i) => (
                <div key={i} className="pl-3 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono" style={{ color: 'var(--text)' }}>{a.name}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{a.type}</span>
                    {a.default !== '—' && (
                      <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>= {a.default}</span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim2)' }}>{a.note}</p>
                </div>
              ))}
            </div>

            <p className="text-xs mb-1.5" style={{ color: 'var(--text-dim)' }}>$ example</p>
            <Code code={t.code} />
          </div>

          {/* Lifecycle diagram */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>$ lifecycle — McpServerExtension</p>
            <div className="font-mono text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
              {[
                { phase: '@BeforeAll', action: 'McpTestServer.start()', note: 'server bound to ephemeral port', color: '#5fffa7' },
                { phase: '@BeforeAll', action: 'inject McpTestServer', note: 'parameter injection into @BeforeAll static method', color: '#5fffa7' },
                { phase: '@BeforeEach', action: 'McpClient.build() + initialize()', note: 'fresh client per test method', color: '#60a5fa' },
                { phase: 'test method', action: 'inject McpClient + McpTestServer', note: 'both available as parameters', color: '#a78bfa' },
                { phase: '@AfterEach', action: 'McpClient.close()', note: 'client closed after each test', color: '#fbbf24' },
                { phase: '@AfterAll', action: 'McpTestServer.stop()', note: 'server stopped after all tests', color: '#f87171' },
              ].map((row, i, arr) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ color: 'var(--text-dim2)', minWidth: '80px' }}>{i < arr.length - 1 ? '├──' : '└──'}</span>
                  <span style={{ color: row.color, minWidth: '90px' }}>{row.phase}</span>
                  <span style={{ color: 'var(--text)', minWidth: '220px' }}>{row.action}</span>
                  <span style={{ color: 'var(--text-dim2)' }}>// {row.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
