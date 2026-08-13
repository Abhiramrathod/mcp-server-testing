import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLatestVersion } from '../hooks/useLatestVersion'
import { useTypewriter } from '../hooks/useTypewriter'
import { Github, ArrowRight, Terminal, Boxes, Shield, Gauge, Lock, Link2, Puzzle } from 'lucide-react'
import Logo from '../components/Logo'
import { CodeBlock } from '../components/Blocks'
import { modules } from '../data/content'

const deps = (version: string) => ({
  maven: `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>${version}</version>
  <scope>test</scope>
</dependency>`,
  gradle: `testImplementation 'io.github.abhiramrathod:mcp-test-api:${version}'`,
})

const firstTest = `McpClient client = McpClient.connectTo("http://localhost:8080")
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

client.close();`

const features = [
  { icon: Shield, title: 'Type-Safe API', desc: 'Strongly typed domain models eliminate runtime errors. No raw JSON handling.' },
  { icon: Link2, title: 'Fluent Assertions', desc: 'Chainable methods make tests readable and maintainable.' },
  { icon: Boxes, title: 'Modular Design', desc: 'Clean separation across 6 modules. Import only the API artifact.' },
  { icon: Gauge, title: 'Performance Tracking', desc: 'Built-in latency monitoring with percentile calculations.' },
  { icon: Lock, title: 'Full Abstraction', desc: 'Internal details never leak into your test code.' },
  { icon: Puzzle, title: 'Pluggable Transports', desc: 'SSE and Streamable HTTP built in. Custom transports via the McpTransport SPI.' },
]

const stats = [
  { label: 'modules', value: '6' },
  { label: 'transports', value: '3' },
  { label: 'protocols', value: '2024 → 2026' },
  { label: 'example tests', value: '31' },
]

function TypeLine({ text, speed = 20, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const { displayed, done } = useTypewriter(text, speed, delay)
  return <span>{displayed}{!done && <span className="cursor-blink-thin" />}</span>
}

function InstallTabs() {
  const [tab, setTab] = useState<'maven' | 'gradle'>('maven')
  const version = useLatestVersion()
  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(['maven', 'gradle'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-2.5 py-1 rounded text-xs transition-all capitalize"
            style={{ background: tab === t ? 'var(--accent-dim)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--text-dim)', border: tab === t ? '1px solid var(--accent-glow)' : '1px solid transparent' }}
          >
            {t}
          </button>
        ))}
      </div>
      <CodeBlock code={deps(version)[tab]} lang={tab === 'maven' ? 'xml' : 'gradle'} />
    </div>
  )
}

export default function Home() {
  const version = useLatestVersion()

  return (
    <div className="min-h-screen">
      <main className="pt-14">
        {/* Hero */}
        <section className="section-content pt-10 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Logo size={36} />
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text)', lineHeight: 1.2 }}>
                <span style={{ color: 'var(--accent)' }}>mcp</span>-test
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>MCP Testing Framework for Java</p>
            </div>
          </div>

          <div className="output-block">
            <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
              <span className="cmd">#</span>{' '}
              <TypeLine text={`mcp-test — production-grade testing for Model Context Protocol servers · v${version}`} speed={18} delay={100} />
            </p>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
              <span className="cmd">mcp-test</span> <TypeLine text="is a lightweight, type-safe Java framework for" speed={18} delay={500} />
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
              <TypeLine text="testing MCP servers — tools, resources, prompts, and performance." speed={16} delay={1000} />
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <Link to="/quickstart"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)', textDecoration: 'none' }}
              >
                $ ./quickstart <ArrowRight size={11} />
              </Link>
              <Link to="/api-reference"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
                style={{ color: 'var(--text-dim)', border: '1px solid var(--border)', textDecoration: 'none' }}
              >
                man api-ref
              </Link>
              <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all"
                style={{ color: 'var(--text-dim2)', border: '1px solid transparent', textDecoration: 'none' }}
              >
                <Github size={11} /> gh:source
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-6">
              {stats.map(s => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>{s.value}</span>
                  <span style={{ color: 'var(--text-dim2)', fontSize: '10px' }}>{s.label}</span>
                </div>
              ))}
              <span className="glow-dot ml-2" style={{ alignSelf: 'center' }} />
            </div>

            {/* Terminal runtime line */}
            <p className="text-xs mb-2" style={{ color: 'var(--text-dim)' }}>
              ├── runtime: <span style={{ color: 'var(--accent)' }}>Java 17+</span>
              <span style={{ color: 'var(--text-dim2)' }}> │ </span>transports: <span style={{ color: 'var(--accent)' }}>SSE</span>
              <span style={{ color: 'var(--text-dim2)' }}> + </span><span style={{ color: 'var(--accent)' }}>Streamable HTTP</span>
              <span style={{ color: 'var(--text-dim2)' }}> + </span><span style={{ color: 'var(--accent)' }}>Stateless</span>
              <span style={{ color: 'var(--text-dim2)' }}> │ </span>status: <span style={{ color: 'var(--accent)' }}>active</span>
            </p>
          </div>
        </section>

        <div className="divider" />

        {/* Install + as-simple-as */}
        <section className="section-content py-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="output-block">
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}><span className="cmd">#</span> install</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>One dependency — mcp-test-api. Everything else is transitive.</p>
              <InstallTabs />
              <p className="text-xs mt-3" style={{ color: 'var(--text-dim2)' }}>
                Latest: <span style={{ color: 'var(--accent)' }}>v{version}</span> · Maven Central + JitPack
              </p>
            </div>
            <div className="output-block">
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}><span className="cmd">#</span> your first test</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>$ cat MyFirstMcpTest.java</p>
              <CodeBlock code={firstTest} lang="java" />
              <p className="text-xs mt-3" style={{ color: 'var(--text-dim2)' }}>
                <span style={{ color: 'var(--text-dim)' }}>└──</span> Point it at a real MCP server — or boot the bundled <span style={{ color: 'var(--accent)' }}>DummyMcpServer</span>.
              </p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* Features */}
        <section className="section-content py-8">
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}><span className="cmd">#</span> features</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="px-4 py-3 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={14} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{f.title}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <div className="divider" />

        {/* Modules grid */}
        <section className="section-content py-8">
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}><span className="cmd">#</span> modules</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {modules.map(m => (
              <div key={m.name} className="px-4 py-3 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>{m.name}</span>
                  <span className="tag" style={{ background: `${'#5fffa7'}15`, color: 'var(--accent)', border: `1px solid ${'#5fffa7'}20` }}>{m.tag}</span>
                </div>
                {m.coords && <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-dim2)' }}>{m.coords}</p>}
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>{m.desc}</p>
                {m.details && <p className="text-[11px] mt-1" style={{ color: 'var(--text-dim2)' }}>{m.details}</p>}
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Link to="/modules" className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              module details <ArrowRight size={11} />
            </Link>
          </div>
        </section>

        <div className="divider" />

        {/* CTA */}
        <section className="section-content py-8 text-center">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>
            <Terminal size={12} style={{ verticalAlign: '-2px', color: 'var(--accent)' }} />{' '}
            Start testing your MCP server today
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-dim2)' }}>Integration tests against a real server — no mocks.</p>
          <Link to="/quickstart"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs transition-all"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)', textDecoration: 'none' }}
          >
            $ ./quickstart <ArrowRight size={11} />
          </Link>
        </section>
      </main>
    </div>
  )
}
