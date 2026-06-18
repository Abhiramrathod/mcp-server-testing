import { useState } from 'react'
import { motion } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Info, Copy, Check } from 'lucide-react'

const maven = `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>1.0.15</version>
  <scope>test</scope>
</dependency>`

const gradle = `testImplementation 'io.github.abhiramrathod:mcp-test-api:1.0.15'`

const firstTest = `import mcp.toolkit.testing.framework.api.*;
import mcp.toolkit.testing.framework.api.model.*;

public class MyFirstTest {
  @Test
  public void testMcpServer() {
    McpClient client = McpClient.connectTo("http://localhost:8080")
        .config(McpClientConfig.builder()
            .timeout(Duration.ofSeconds(30))
            .build())
        .initializeOnBuild()
        .build();

    McpToolResult result = client.tools()
        .callTool("calculator", Map.of("operation", "add", "a", 5, "b", 3))
        .assertSuccess()
        .assertTextContains("8");

    client.exchanges().assertAverageLatencyBelow(McpMethod.TOOLS_CALL, 500);
    client.close();
  }
}`

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{ padding: '1.25rem 1.5rem', borderRadius: '0.625rem', fontSize: '0.8rem', lineHeight: '1.65', margin: 0, border: '1px solid rgba(255,255,255,0.06)', background: '#0c1427' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
        className="absolute top-2.5 right-2.5 p-2 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-ter)', border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Copy code"
      >
        {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

export default function Installation() {
  const [tab, setTab] = useState<'maven' | 'gradle'>('maven')

  return (
    <section id="installation" className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>Get Started</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Quick Installation</h2>
          <p className="text-base" style={{ color: 'var(--text-sec)' }}>Add one dependency — that&rsquo;s it</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-6 sm:p-8 mb-6"
        >
          <div className="flex gap-2 mb-5">
            {(['maven', 'gradle'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize"
                style={{
                  background: tab === t ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'var(--bg-alt)',
                  color: tab === t ? 'white' : 'var(--text-sec)',
                  border: tab === t ? 'none' : '1px solid var(--border)',
                  boxShadow: tab === t ? '0 2px 8px var(--accent-glow)' : 'none',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <CodeBlock code={tab === 'maven' ? maven : gradle} language={tab === 'maven' ? 'xml' : 'gradle'} />
          <div className="flex items-center gap-2.5 mt-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-glow)', color: 'var(--text-sec)' }}>
            <Info size={15} style={{ color: 'var(--accent)' }} />
            Only add <code style={{ color: 'var(--accent)', fontWeight: 600 }}>mcp-test-api</code> — all other modules are pulled in transitively.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-6 sm:p-8"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>Your First Test</h3>
          <CodeBlock code={firstTest} language="java" />
        </motion.div>
      </div>
    </section>
  )
}
