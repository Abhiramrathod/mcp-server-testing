import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy, ArrowLeft } from 'lucide-react'
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
    label: 'RealMcpServerTestBase',
    desc: 'The shared base class used by every example test. It starts a real, running MCP server once for the whole test class and creates a fresh, initialized McpClient for every test method. By default it boots the bundled DummyMcpServer on an ephemeral port; set the system property mcp.test.server.url to point the same tests at any external server instead.',
    attrs: [
      { name: 'mcp.test.server.url', type: 'String', default: 'unset', note: 'System property. When set (e.g. -Dmcp.test.server.url=http://localhost:8080), tests run against that external server instead of the bundled DummyMcpServer.' },
      { name: 'protected McpClient client', type: 'field', default: '—', note: 'Fresh, initialized client scoped to the current test method. Closed automatically in @AfterEach.' },
      { name: '@BeforeAll', type: 'static', default: '—', note: 'Starts DummyMcpServer(0) on an ephemeral port, or reads the external URL.' },
      { name: '@AfterAll', type: 'static', default: '—', note: 'Stops the bundled server when one was started.' },
      { name: '@BeforeEach / @AfterEach', type: 'hooks', default: '—', note: 'Build + initialize the client before each test, close it after each test — exchanges stay isolated.' },
    ],
    code: `// mcp-test-examples/src/test/java/mcp/toolkit/testing/examples/RealMcpServerTestBase.java
public abstract class RealMcpServerTestBase {

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
  {
    label: 'DummyMcpServer',
    desc: 'A reference MCP server bundled in the mcp-test-examples module. It speaks the MCP protocol over SSE (GET /sse + POST /message) and serves the calculator/greet tools, two file resources, and the translate/code-review prompts used by the example tests. Run it standalone with DummyMcpServer.main() and test against it exactly as you would any real server.',
    attrs: [
      { name: 'DummyMcpServer(int port)', type: 'ctor', default: '0 = ephemeral', note: 'Binds to the given port; 0 selects an ephemeral port.' },
      { name: 'start()', type: 'void', default: '—', note: 'Starts accepting connections on /sse and /message.' },
      { name: 'stop()', type: 'void', default: '—', note: 'Stops the server and releases resources.' },
      { name: 'port()', type: 'int', default: '—', note: 'Bound port after start().' },
      { name: 'baseUrl()', type: 'String', default: '—', note: 'Returns "http://localhost:{port}" — pass to McpClient.connectTo().' },
      { name: 'main(String[] args)', type: 'static', default: '—', note: 'Starts the server on port 8080 for manual testing (Ctrl+C to stop).' },
    ],
    code: `// Run the reference server standalone (binds port 8080)
DummyMcpServer.main(new String[0]);

// …or start it in-process on an ephemeral port
DummyMcpServer server = new DummyMcpServer(0);
server.start();

McpClient client = McpClient.connectTo(server.baseUrl())
        .sse()          // SSE transport: GET /sse + POST /message
        .initializeOnBuild()
        .build();

client.tools().callTool("calculator",
        Map.of("operation", "add", "a", 10, "b", 5))
        .assertSuccess().assertTextContains("15");

server.stop();`,
  },
  {
    label: 'Example Tests',
    desc: 'The example test classes extend RealMcpServerTestBase and exercise the framework end-to-end against a real server — no mocks, no embedded server library. Extend the base class yourself, or copy the pattern to point at your own MCP server.',
    attrs: [
      { name: 'BasicClientTest', type: 'class', default: '—', note: 'Client initialization, server info, capabilities.' },
      { name: 'ToolsClientTest', type: 'class', default: '—', note: 'Tool discovery, invocation, schemas.' },
      { name: 'ResourcesClientTest', type: 'class', default: '—', note: 'Resource listing and reading.' },
      { name: 'PromptsClientTest', type: 'class', default: '—', note: 'Prompt listing and retrieval.' },
      { name: 'ExchangeTrackingTest', type: 'class', default: '—', note: 'Exchange history, latency, percentiles.' },
      { name: 'ComprehensiveIntegrationTest', type: 'class', default: '—', note: 'Full capability surface in one pass.' },
    ],
    code: `// Every example test looks like this:
class ToolsClientTest extends RealMcpServerTestBase {

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
]

function IntegrationHLD() {
  return (
    <svg viewBox="0 0 380 250" style={{ width: '100%', maxWidth: 440, display: 'block' }}>
      <defs>
        <marker id="it-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#444" />
        </marker>
      </defs>

      {/* Your Test Class */}
      <rect x="10" y="10" width="140" height="38" rx="3" fill="#5fffa710" stroke="#5fffa750" strokeWidth="1" />
      <text x="80" y="25" fontSize="9" fontWeight="600" fill="#5fffa7" textAnchor="middle" fontFamily="monospace">Your Test Class</text>
      <text x="80" y="38" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">extends RealMcpServerTestBase</text>

      {/* arrow down */}
      <line x1="80" y1="48" x2="80" y2="88" stroke="#333" strokeWidth="1" markerEnd="url(#it-arr)" />
      <text x="86" y="72" fontSize="7" fill="#555" fontFamily="monospace">inherits</text>

      {/* RealMcpServerTestBase */}
      <rect x="10" y="90" width="140" height="38" rx="3" fill="#60a5fa10" stroke="#60a5fa50" strokeWidth="1" />
      <text x="80" y="105" fontSize="9" fontWeight="600" fill="#60a5fa" textAnchor="middle" fontFamily="monospace">RealMcpServerTestBase</text>
      <text x="80" y="118" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">start/stop + fresh client</text>

      {/* arrow down */}
      <line x1="80" y1="128" x2="80" y2="168" stroke="#333" strokeWidth="1" markerEnd="url(#it-arr)" />
      <text x="86" y="152" fontSize="7" fill="#555" fontFamily="monospace">starts</text>

      {/* DummyMcpServer */}
      <rect x="10" y="170" width="140" height="38" rx="3" fill="#a78bfa10" stroke="#a78bfa50" strokeWidth="1" />
      <text x="80" y="185" fontSize="9" fontWeight="600" fill="#a78bfa" textAnchor="middle" fontFamily="monospace">MCP Server</text>
      <text x="80" y="198" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">DummyMcpServer / external</text>

      {/* arrow right from Base to McpClient */}
      <line x1="150" y1="109" x2="210" y2="109" stroke="#333" strokeWidth="1" markerEnd="url(#it-arr)" />
      <text x="180" y="104" fontSize="7" fill="#555" textAnchor="middle" fontFamily="monospace">builds</text>

      {/* McpClient */}
      <rect x="212" y="90" width="140" height="38" rx="3" fill="#5fffa710" stroke="#5fffa750" strokeWidth="1" />
      <text x="282" y="105" fontSize="9" fontWeight="600" fill="#5fffa7" textAnchor="middle" fontFamily="monospace">McpClient</text>
      <text x="282" y="118" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">fresh per @Test</text>

      {/* arrow down from McpClient */}
      <line x1="282" y1="128" x2="282" y2="168" stroke="#333" strokeWidth="1" markerEnd="url(#it-arr)" />
      <text x="288" y="152" fontSize="7" fill="#555" fontFamily="monospace">calls</text>

      {/* MCP Server right side */}
      <rect x="212" y="170" width="140" height="38" rx="3" fill="#34d39910" stroke="#34d39950" strokeWidth="1" />
      <text x="282" y="185" fontSize="9" fontWeight="600" fill="#34d399" textAnchor="middle" fontFamily="monospace">real handlers</text>
      <text x="282" y="198" fontSize="7.5" fill="#555" textAnchor="middle" fontFamily="monospace">tools/resources/prompts</text>
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

export default function IntegrationTesting() {
  const [active, setActive] = useState(0)
  const t = tabs[active]

  return (
    <>
      <PageNavbar />
      <main className="pt-14 pb-12">
        <section className="py-8 section-content">
          <div className="output-block">
            <p className="text-xs mb-1" style={{ color: 'var(--text-dim)' }}>
              <span className="cmd">#</span> integration-testing
            </p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-dim2)' }}>$ man mcp-test-examples — real-server integration tests · no mocks</p>

            {/* Callout */}
            <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="px-3 py-2 rounded" style={{ background: '#5fffa710', border: '1px solid #5fffa740' }}>
                <p style={{ color: '#5fffa7', fontWeight: 600, marginBottom: '3px' }}>Real Server — End-to-End</p>
                <p style={{ color: 'var(--text-dim2)', lineHeight: 1.6 }}>McpClient connects to a real running MCP server over the network and tests actual tool/resource/prompt handlers. No embedded server library, no mocks.</p>
              </div>
              <div className="px-3 py-2 rounded" style={{ background: '#60a5fa08', border: '1px solid #60a5fa20' }}>
                <p style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '3px' }}>DummyMcpServer — Reference Server</p>
                <p style={{ color: 'var(--text-dim2)', lineHeight: 1.6 }}>Bundled in mcp-test-examples. Start it locally and test against it just like any external server. Point mcp.test.server.url at your own server to swap it out.</p>
              </div>
            </div>

            {/* Dependency */}
            <div className="mb-5 px-3 py-2.5 rounded text-xs font-mono" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="mb-1" style={{ color: 'var(--text-dim2)' }}>// Maven</p>
              <p style={{ color: 'var(--text-dim)' }}>&lt;dependency&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;groupId&gt;<span style={{ color: 'var(--accent)' }}>io.github.abhiramrathod</span>&lt;/groupId&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;artifactId&gt;<span style={{ color: 'var(--accent)' }}>mcp-test-api</span>&lt;/artifactId&gt;</p>
              <p className="pl-4" style={{ color: 'var(--text-dim)' }}>&lt;scope&gt;test&lt;/scope&gt;</p>
              <p style={{ color: 'var(--text-dim)' }}>&lt;/dependency&gt;</p>
              <p className="mt-2 mb-1" style={{ color: 'var(--text-dim2)' }}>// Gradle</p>
              <p style={{ color: 'var(--text-dim)' }}>testImplementation <span style={{ color: 'var(--accent)' }}>'io.github.abhiramrathod:mcp-test-api'</span></p>
              <p className="mt-2" style={{ color: 'var(--text-dim2)' }}>// Everything else is transitive — import mcp-test-api only</p>
            </div>

            {/* HLD diagram */}
            <div className="mb-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>$ hld — integration test architecture</p>
              <IntegrationHLD />
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

              <div key={active}>
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
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>$ lifecycle — RealMcpServerTestBase</p>
              <div className="font-mono text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
                {[
                  { phase: '@BeforeAll',  action: 'DummyMcpServer(0).start()',        note: 'server bound to ephemeral port (or external URL)', color: '#5fffa7' },
                  { phase: '@BeforeEach', action: 'McpClient.connectTo(baseUrl)',     note: 'fresh client per test method',                      color: '#60a5fa' },
                  { phase: 'test method', action: 'use client field',                 note: 'tools/resources/prompts/exchanges assertions',      color: '#a78bfa' },
                  { phase: '@AfterEach',  action: 'McpClient.close()',                note: 'client closed after each test',                     color: '#fbbf24' },
                  { phase: '@AfterAll',   action: 'DummyMcpServer.stop()',            note: 'server stopped after all tests',                    color: '#f87171' },
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
