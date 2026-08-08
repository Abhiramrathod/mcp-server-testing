import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import Reveal from './Reveal'

const deps = {
  maven: `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>1.0.38</version>
  <scope>test</scope>
</dependency>

<!-- Optional: JUnit 5 testkit (embedded server + @McpServerTest) -->
<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-junit</artifactId>
  <version>1.0.38</version>
  <scope>test</scope>
</dependency>`,
  gradle: `testImplementation 'io.github.abhiramrathod:mcp-test-api:1.0.38'

// Optional: JUnit 5 testkit (embedded server + @McpServerTest)
testImplementation 'io.github.abhiramrathod:mcp-test-junit:1.0.38'`,
}

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
            <Code code={deps[tab]} lang={tab === 'maven' ? 'xml' : 'gradle'} />
          </div>

          <p className="text-xs mb-2 mt-5 fade-in fade-in-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span>{' '}
            <TypeLine text="your first test" speed={15} delay={200} />
          </p>
          <p className="text-xs mb-2 fade-in fade-in-4" style={{ color: 'var(--text-dim2)' }}>
            <span style={{ color: 'var(--text-dim)' }}>$</span> cat src/test/java/MyFirstTest.java
          </p>
          <div className="fade-in fade-in-4">
            <Code code={firstTest} lang="java" />
          </div>

          <p className="text-xs mt-3 fade-in fade-in-5" style={{ color: 'var(--text-dim2)' }}>
            <span style={{ color: 'var(--text-dim)' }}>└──</span> Only import <span style={{ color: 'var(--accent)' }}>mcp-test-api</span> — everything else is transitive.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
