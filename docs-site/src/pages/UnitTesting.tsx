import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy, ArrowLeft } from 'lucide-react'
import { useMavenVersion } from '../hooks/useMavenVersion'
import { useTheme } from '../hooks/useTheme'
import Logo from '../components/Logo'

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
        className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: '#111', border: '1px solid #222' }}
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

    @BeforeAll
    static void configure(McpTestServer server) {
        server.addTool("echo", "Echoes input", args ->
                McpResponses.toolText(args.path("message").asText()));

        server.addResource("file:///config.json", "Config", "application/json",
                params -> McpResponses.resourceText(
                        "file:///config.json", "application/json", "{\\"v\\":1}"));

        server.addPrompt("greet", "Greets a user",
                List.of(new McpTestServer.PromptArgument("name", "User name", true)),
                params -> McpResponses.promptUser("Greets",
                        "Hello " + params.path("arguments").path("name").asText()));
    }

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
    desc: 'An embedded, in-process HTTP server that speaks the MCP protocol. It lets you write tests without running a real MCP server — you register handlers for tools, resources, prompts, and completions, and the server responds exactly as a real server would.',
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
    code: `McpTestServer server = McpTestServer.builder()
        .transport(Transport.STREAMABLE_HTTP)
        .protocolVersion("2025-03-26")
        .port(0)
        .build();
server.start();

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
    desc: "Static factory methods that produce response payloads in the exact shape the framework's domain clients expect to parse. Use these inside McpTestServer handlers instead of building maps by hand.",
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
    code: `McpResponses.toolText("42");
McpResponses.toolError("division by zero");
McpResponses.toolResult(List.of(
    Map.of("type", "text", "text", "result: 42")));

McpResponses.resourceText(
    "file:///data.json", "application/json", "{\\"key\\":\\"value\\"}");

McpResponses.promptUser("Translates text", "Translate to Spanish: hello");
McpResponses.promptResult("Multi-turn", List.of(
    Map.of("role", "user",
           "content", Map.of("type", "text", "text", "hello")),
    Map.of("role", "assistant",
           "content", Map.of("type", "text", "text", "hola"))));

McpResponses.completion(List.of("English", "Spanish", "French"));
McpResponses.completion(List.of("English"), 10, true);`,
  },
  {
    label: 'Transport enum',
    desc: 'Chooses which MCP transport protocol the embedded server speaks and the injected client uses. SSE uses a persistent Server-Sent Events stream. STREAMABLE_HTTP uses stateless POST requests — no persistent connection needed.',
    attrs: [
      { name: 'Transport.SSE', type: 'enum', default: 'default', note: 'Legacy HTTP + Server-Sent Events transport (protocol version 2024-11-05).' },
      { name: 'Transport.STREAMABLE_HTTP', type: 'enum', default: '—', note: 'Streamable HTTP transport (protocol version 2025-03-26 and later).' },
    ],
    code: `@McpServerTest(transport = Transport.SSE)               // default
@McpServerTest(transport = Transport.STREAMABLE_HTTP,
               protocolVersion = "2025-03-26")

McpTestServer.builder()
    .transport(Transport.STREAMABLE_HTTP)
    .build();

// SSE endpoints:          GET /sse  +  POST /mcp/message
// Streamable HTTP:        POST /mcp  (GET /mcp for SSE push, DELETE /mcp for session end)`,
  },
]

function UnitTestingHLD() {
  return (
    <svg viewBox="0 0 380 290" style={{ width: '100%', maxWidth: 440, display: 'block' }}>
      <defs>
        <marker id="ut-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#444" />
        </marker>
      </defs>

      {/* Your Test Class */}
      <rect x="10" y="10" width="140" height="38" rx="3" fill="#f8717110" stroke="#f8717150" strokeWidth="1" />
      <text x="80" y="25" fontSize="9" fontWeight="600" fill="#f87171" textAnchor="middle" fontFamily="monospace">Your Test Class</text>
      <text x="80" y="38" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">@McpServerTest</text>

      {/* arrow down */}
      <line x1="80" y1="48" x2="80" y2="88" stroke="#333" strokeWidth="1" markerEnd="url(#ut-arr)" />
      <text x="86" y="72" fontSize="7" fill="#555" fontFamily="monospace">registers</text>

      {/* McpServerExtension */}
      <rect x="10" y="90" width="140" height="38" rx="3" fill="#fbbf2410" stroke="#fbbf2450" strokeWidth="1" />
      <text x="80" y="105" fontSize="9" fontWeight="600" fill="#fbbf24" textAnchor="middle" fontFamily="monospace">McpServerExtension</text>
      <text x="80" y="118" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">JUnit 5 Extension</text>

      {/* arrow down */}
      <line x1="80" y1="128" x2="80" y2="168" stroke="#333" strokeWidth="1" markerEnd="url(#ut-arr)" />
      <text x="86" y="152" fontSize="7" fill="#555" fontFamily="monospace">starts</text>

      {/* McpTestServer */}
      <rect x="10" y="170" width="140" height="38" rx="3" fill="#a78bfa10" stroke="#a78bfa50" strokeWidth="1" />
      <text x="80" y="185" fontSize="9" fontWeight="600" fill="#a78bfa" textAnchor="middle" fontFamily="monospace">McpTestServer</text>
      <text x="80" y="198" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">Embedded HTTP Server</text>

      {/* arrow right from Extension to McpClient */}
      <line x1="150" y1="109" x2="210" y2="109" stroke="#333" strokeWidth="1" markerEnd="url(#ut-arr)" />
      <text x="180" y="104" fontSize="7" fill="#555" textAnchor="middle" fontFamily="monospace">builds+injects</text>

      {/* McpClient */}
      <rect x="212" y="90" width="140" height="38" rx="3" fill="#5fffa710" stroke="#5fffa750" strokeWidth="1" />
      <text x="282" y="105" fontSize="9" fontWeight="600" fill="#5fffa7" textAnchor="middle" fontFamily="monospace">McpClient</text>
      <text x="282" y="118" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">Injected per @Test</text>

      {/* arrow down from McpClient */}
      <line x1="282" y1="128" x2="282" y2="168" stroke="#333" strokeWidth="1" markerEnd="url(#ut-arr)" />
      <text x="288" y="152" fontSize="7" fill="#555" fontFamily="monospace">calls</text>

      {/* McpTestServer (right side — same server, dashed reference) */}
      <rect x="212" y="170" width="140" height="38" rx="3" fill="#60a5fa10" stroke="#60a5fa50" strokeWidth="1" strokeDasharray="4 2" />
      <text x="282" y="185" fontSize="9" fontWeight="600" fill="#60a5fa" textAnchor="middle" fontFamily="monospace">McpTestServer</text>
      <text x="282" y="198" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">handles requests</text>

      {/* arrow left from right McpTestServer to McpResponses */}
      <line x1="212" y1="189" x2="160" y2="189" stroke="#333" strokeWidth="1" markerEnd="url(#ut-arr)" />
      <text x="186" y="184" fontSize="7" fill="#555" textAnchor="middle" fontFamily="monospace">via handlers</text>

      {/* McpResponses */}
      <rect x="10" y="250" width="140" height="30" rx="3" fill="#34d39910" stroke="#34d39950" strokeWidth="1" />
      <text x="80" y="263" fontSize="9" fontWeight="600" fill="#34d399" textAnchor="middle" fontFamily="monospace">McpResponses</text>
      <text x="80" y="274" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">Response Factories</text>

      {/* arrow up from McpResponses to McpTestServer */}
      <line x1="80" y1="250" x2="80" y2="208" stroke="#333" strokeWidth="1" markerEnd="url(#ut-arr)" />
      <text x="86" y="234" fontSize="7" fill="#555" fontFamily="monospace">returns</text>
    </svg>
  )
}

function PageNavbar() {
  const { theme, toggle } = useTheme()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-720px mx-auto flex items-center justify-between h-12 px-5">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={18} showText />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs"
            style={{ color: 'var(--text-dim)', border: '1px solid var(--border)', textDecoration: 'none' }}
          >
            <ArrowLeft size={11} /> main docs
          </Link>
          <button onClick={toggle}
            className="px-2.5 py-1 rounded text-xs font-medium"
            style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
          >
            {theme === 'dark' ? '☀︎ light' : '☾ dark'}
          </button>
          <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
            className="px-2.5 py-1 rounded text-xs" style={{ color: 'var(--text-dim2)', border: '1px solid var(--border)' }}
          >
            gh:repo
          </a>
        </div>
      </div>
    </nav>
  )
}

export default function UnitTesting() {
  const [active, setActive] = useState(0)
  const version = useMavenVersion()
  const t = tabs[active]

  return (
    <>
      <PageNavbar />
      <main className="pt-14 pb-12">
        <section className="py-8 section-content">
          <div className="output-block">
            <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>
              <span className="cmd">#</span> unit-testing
            </p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-dim2)' }}>$ man mcp-test-junit — embedded mock server · no real server needed</p>

            {/* Unit vs Integration callout */}
            <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="px-3 py-2 rounded" style={{ background: '#f8717110', border: '1px solid #f8717140' }}>
                <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '3px' }}>mcp-test-junit — Unit Testing</p>
                <p style={{ color: 'var(--text-dim2)', lineHeight: 1.6 }}>Embedded in-process mock server. Register fake handlers, test client logic in isolation. No real server, no network. Fast and deterministic.</p>
              </div>
              <div className="px-3 py-2 rounded" style={{ background: '#5fffa708', border: '1px solid #5fffa720' }}>
                <p style={{ color: '#5fffa7', fontWeight: 600, marginBottom: '3px' }}>mcp-test-api — Integration Testing</p>
                <p style={{ color: 'var(--text-dim2)', lineHeight: 1.6 }}>Real MCP server running externally. McpClient connects over the network and tests actual end-to-end behaviour of your server.</p>
              </div>
            </div>

            {/* Dependency */}
            <div className="mb-5 px-3 py-2.5 rounded text-xs font-mono" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="mb-1" style={{ color: 'var(--text-dim2)' }}>// Maven</p>
              <p style={{ color: 'var(--text-dim)' }}>&lt;dependency&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;groupId&gt;<span style={{ color: 'var(--accent)' }}>io.github.abhiramrathod</span>&lt;/groupId&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;artifactId&gt;<span style={{ color: 'var(--accent)' }}>mcp-test-junit</span>&lt;/artifactId&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;version&gt;<span style={{ color: 'var(--accent)' }}>{version}</span>&lt;/version&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;scope&gt;test&lt;/scope&gt;</p>
              <p style={{ color: 'var(--text-dim)' }}>&lt;/dependency&gt;</p>
              <p className="mt-2 mb-1" style={{ color: 'var(--text-dim2)' }}>// Gradle</p>
              <p style={{ color: 'var(--text-dim)' }}>testImplementation <span style={{ color: 'var(--accent)' }}>'io.github.abhiramrathod:mcp-test-junit:{version}'</span></p>
              <p className="mt-2" style={{ color: 'var(--text-dim2)' }}>// Separate artifact — not transitive from mcp-test-api</p>
            </div>

            {/* HLD diagram */}
            <div className="mb-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>$ hld — unit testing architecture</p>
              <UnitTestingHLD />
            </div>

            {/* API Reference tabs */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>$ api-reference</p>
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

              <div key={active} className="fade-in fade-in-1">
                <p className="text-xs font-bold font-mono mb-1" style={{ color: 'var(--accent)' }}>{t.label}</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>{t.desc}</p>

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
            </div>

            {/* Lifecycle */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>$ lifecycle — McpServerExtension</p>
              <div className="font-mono text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
                {[
                  { phase: '@BeforeAll',  action: 'McpTestServer.start()',             note: 'server bound to ephemeral port',                    color: '#5fffa7' },
                  { phase: '@BeforeAll',  action: 'inject McpTestServer',              note: 'parameter injection into @BeforeAll static method', color: '#5fffa7' },
                  { phase: '@BeforeEach', action: 'McpClient.build() + initialize()',  note: 'fresh client per test method',                      color: '#60a5fa' },
                  { phase: 'test method', action: 'inject McpClient + McpTestServer',  note: 'both available as parameters',                      color: '#a78bfa' },
                  { phase: '@AfterEach',  action: 'McpClient.close()',                 note: 'client closed after each test',                     color: '#fbbf24' },
                  { phase: '@AfterAll',   action: 'McpTestServer.stop()',              note: 'server stopped after all tests',                    color: '#f87171' },
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
        </section>
      </main>
    </>
  )
}
