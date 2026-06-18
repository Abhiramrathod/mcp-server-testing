import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'

const deps = {
  maven: `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>1.0.15</version>
  <scope>test</scope>
</dependency>`,
  gradle: `testImplementation 'io.github.abhiramrathod:mcp-test-api:1.0.15'`,
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
        {copied ? <Check size={11} style={{ color: '#5fffa7' }} /> : <Copy size={11} style={{ color: '#666' }} />}
      </button>
    </div>
  )
}

export default function Installation() {
  const [tab, setTab] = useState<'maven' | 'gradle'>('maven')

  return (
    <section id="installation" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs dim mb-3">
          <span className="cmd">#</span> install
        </p>
        <p className="text-xs dim2 mb-3">Add a single dependency to your project:</p>

        <div className="flex gap-2 mb-3">
          {(['maven', 'gradle'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-2.5 py-1 rounded text-xs transition-all capitalize"
              style={{ background: tab === t ? 'rgba(95,255,167,0.08)' : 'transparent', color: tab === t ? '#5fffa7' : '#555', border: tab === t ? '1px solid rgba(95,255,167,0.15)' : '1px solid transparent' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <Code code={deps[tab]} lang={tab === 'maven' ? 'xml' : 'gradle'} />
        </div>

        <p className="text-xs dim mb-2 mt-5">
          <span className="cmd">#</span> your first test
        </p>
        <p className="text-xs dim2 mb-2">
          <span className="dim">$</span> cat src/test/java/MyFirstTest.java
        </p>
        <Code code={firstTest} lang="java" />

        <p className="text-xs dim2 mt-3">
          <span className="dim">└──</span> Only import <span style={{ color: '#5fffa7' }}>mcp-test-api</span> — everything else is transitive.
        </p>
      </div>
    </section>
  )
}
