import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'

const maven = `<dependency>
  <groupId>io.github.abhiramrathod</groupId>
  <artifactId>mcp-test-api</artifactId>
  <version>1.0.15</version>
  <scope>test</scope>
</dependency>`

const gradle = `testImplementation 'io.github.abhiramrathod:mcp-test-api:1.0.15'`

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

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={lang === 'xml' ? 'xml' : 'java'}
        style={atomDark}
        customStyle={{ padding: '14px 16px', borderRadius: '4px', fontSize: '12px', lineHeight: '1.65', margin: 0, background: '#0a0a0a', border: '1px solid #1a1a1a' }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) }}
        className="absolute top-2 right-2 p-1.5 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
        style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}
      >
        {copied ? <Check size={12} style={{ color: '#5fffa7' }} /> : <Copy size={12} />}
      </button>
    </div>
  )
}

export default function Installation() {
  const [tab, setTab] = useState<'maven' | 'gradle'>('maven')

  return (
    <section id="installation" className="py-24 relative" style={{ background: '#0d0d0d' }}>
      <div className="max-w-4xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-label mb-3">install</div>
          <h2 className="section-title">Quick Setup</h2>
          <p className="section-sub font-mono">curl -s https://maven.central/mcp-test-api</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="terminal-window mb-6"
        >
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title ml-2">dependencies — pom.xml</span>
          </div>

          <div className="terminal-body">
            <div className="flex gap-2 mb-4">
              {(['maven', 'gradle'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded text-xs font-medium transition-all capitalize"
                  style={{
                    background: tab === t ? 'rgba(95,255,167,0.1)' : 'transparent',
                    color: tab === t ? '#5fffa7' : '#555',
                    border: tab === t ? '1px solid rgba(95,255,167,0.2)' : '1px solid transparent',
                  }}
                >
                  ${t === 'maven' ? 'mvn' : 'gradle'} {t}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CodeBlock code={tab === 'maven' ? maven : gradle} lang={tab === 'maven' ? 'xml' : 'gradle'} />
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: '#555' }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#5fffa7' }} />
              Only add <code style={{ color: '#5fffa7' }}>mcp-test-api</code> — others are transitive.
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="terminal-window"
        >
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title ml-2">example — FirstTest.java</span>
          </div>
          <div className="terminal-body">
            <p className="text-xs mb-3" style={{ color: '#888' }}>
              <span className="prompt" /> <span style={{ color: '#666' }}>cat ./src/test/java/FirstTest.java</span>
            </p>
            <CodeBlock code={firstTest} lang="java" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
