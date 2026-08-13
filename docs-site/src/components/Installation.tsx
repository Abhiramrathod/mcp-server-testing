import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import { useMavenVersion } from '../hooks/useMavenVersion'
import Reveal from './Reveal'

const deps = (version: string) => ({
  maven: `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>${version}</version>
  <scope>test</scope>
</dependency>`,
  gradle: `testImplementation 'io.github.abhiramrathod:mcp-test-api:${version}'`,
})

const firstTest = `import mcp.toolkit.testing.framework.api.*;

public class MyFirstTest {
  @Test
  public void testMcpServer() {
    McpClient client = McpClient.connectTo("http://localhost:8080")
        .streamableHttp()
        .initializeOnBuild()
        .build();

    client.tools()
        .callTool("calculator", Map.of("a", 5, "b", 3))
        .assertSuccess()
        .assertTextContains("8");

    client.close();
  }
}`

function Code({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter language={lang} style={atomDark}
        customStyle={{ padding: '10px 14px', borderRadius: '3px', fontSize: '12px', lineHeight: '1.6', margin: 0, background: '#080808', border: '1px solid #181818' }}
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

function TypeLine({ text, speed = 20, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const { displayed, done } = useTypewriter(text, speed, delay)
  return <span>{displayed}{!done && <span className="cursor-blink-thin" />}</span>
}

export default function Installation() {
  const [tab, setTab] = useState<'maven' | 'gradle'>('maven')
  const version = useMavenVersion()

  return (
    <section id="installation" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span>{' '}
            <TypeLine text="install" speed={15} delay={100} />
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>
            <TypeLine text="Add a single dependency to your project:" speed={12} delay={500} />
          </p>

          <div className="fade-in fade-in-1 flex gap-2 mb-3">
            {(['maven', 'gradle'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-2.5 py-1 rounded text-xs transition-all capitalize"
                style={{ background: tab === t ? 'var(--accent-dim)' : 'transparent', color: tab === t ? 'var(--accent)' : 'var(--text-dim)', border: tab === t ? '1px solid var(--accent-glow)' : '1px solid transparent' }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="fade-in fade-in-2 mb-4">
            <Code code={deps(version)[tab]} lang={tab === 'maven' ? 'xml' : 'gradle'} />
          </div>

          <p className="text-xs mb-2 mt-5 fade-in fade-in-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span>{' '}
            <TypeLine text="your first test" speed={15} delay={200} />
          </p>

          <div className="fade-in fade-in-3 mb-3 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="px-3 py-2 rounded" style={{ background: '#5fffa708', border: '1px solid #5fffa720' }}>
              <p style={{ color: '#5fffa7', fontWeight: 600, marginBottom: '2px' }}>Integration Test</p>
              <p style={{ color: 'var(--text-dim2)' }}>Real MCP server running. Test actual end-to-end behaviour over the network.</p>
            </div>
            <div className="px-3 py-2 rounded" style={{ background: '#60a5fa08', border: '1px solid #60a5fa20' }}>
              <p style={{ color: '#60a5fa', fontWeight: 600, marginBottom: '2px' }}>Local Server</p>
              <p style={{ color: 'var(--text-dim2)' }}>No external server handy? Start a reference MCP server locally — see the mcp-test-examples module.</p>
            </div>
          </div>

          <div className="fade-in fade-in-1">
            <p className="text-xs mb-1" style={{ color: 'var(--text-dim2)' }}>
              <span style={{ color: 'var(--text-dim)' }}>$</span> cat MyFirstIntegrationTest.java
            </p>
            <p className="text-xs mb-2" style={{ color: 'var(--text-dim2)' }}>// Point McpClient at your running MCP server and test its actual behaviour.</p>
            <Code code={firstTest} lang="java" />
            <div className="mt-3 space-y-1">
              {[
                { k: 'Requires a live server', v: 'point McpClient.connectTo() at your running MCP server URL' },
                { k: 'Tests real behaviour', v: 'exercises actual tool/resource/prompt handlers end-to-end' },
                { k: 'Manage lifecycle', v: 'call client.close() when done, or use try-with-resources' },
                { k: 'Dependency', v: 'mcp-test-api only' },
              ].map(({ k, v }) => (
                <p key={k} className="text-xs" style={{ color: 'var(--text-dim2)' }}>
                  <span style={{ color: '#5fffa7' }}>✦ {k}</span> — {v}
                </p>
              ))}
            </div>
          </div>

          <p className="text-xs mt-3 fade-in fade-in-5" style={{ color: 'var(--text-dim2)' }}>
            <span style={{ color: 'var(--text-dim)' }}>└──</span> Only import <span style={{ color: 'var(--accent)' }}>mcp-test-api</span> — everything else is transitive.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
