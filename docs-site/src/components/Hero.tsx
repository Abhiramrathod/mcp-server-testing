import { motion } from 'framer-motion'

const ascii = String.raw`
  ╔══════════════════════════════════════════╗
  ║  MCP Testing Framework                   ║
  ║  Production-grade MCP server testing     ║
  ╚══════════════════════════════════════════╝
`

const infoLines = [
  { key: 'Status', value: 'operational' },
  { key: 'Version', value: '1.0.15' },
  { key: 'Runtime', value: 'Java 17+' },
  { key: 'Transport', value: 'SSE / Streamable HTTP' },
]

export default function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-center pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 50%, #5fffa7 0%, transparent 50%), radial-gradient(circle at 75% 30%, #60a5fa 0%, transparent 50%)`,
        }}
      />

      <div className="max-w-4xl mx-auto px-5 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="terminal-window mb-8">
            <div className="terminal-header">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title ml-2">mcp-test — bash</span>
            </div>
            <div className="terminal-body">
              <pre className="text-xs leading-relaxed" style={{ color: '#5fffa7' }}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.01, delay: 0.2 }}
                >
                  {ascii}
                </motion.span>
              </pre>

              <div className="space-y-1.5 mt-4 text-xs">
                {infoLines.map((l, i) => (
                  <motion.div
                    key={l.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <span style={{ color: '#666', minWidth: 80, display: 'inline-block' }}>{l.key}:</span>
                    <span style={{ color: l.key === 'Status' ? '#5fffa7' : '#ccc' }}>
                      {l.value}
                      {l.key === 'Status' && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full ml-2" style={{ background: '#5fffa7', boxShadow: '0 0 6px rgba(95,255,167,0.6)', verticalAlign: 'middle' }} />
                      )}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-5 pt-4 border-t" style={{ borderColor: '#1a1a1a' }}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="prompt text-xs" />
                  <span className="text-xs" style={{ color: '#888' }}>
                    A lightweight Java framework to write maintainable tests for{' '}
                    <span style={{ color: '#5fffa7' }}>Model Context Protocol</span> servers.
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs" style={{ color: '#444' }}>Type-safe · Fluent · Pluggable transports</span>
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-wrap gap-2.5"
          >
            <a
              href="#installation"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-all duration-200"
              style={{ background: 'rgba(95,255,167,0.1)', color: '#5fffa7', border: '1px solid rgba(95,255,167,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(95,255,167,0.15)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(95,255,167,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(95,255,167,0.1)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              $ ./install.sh →
            </a>
            <a
              href="#docs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-all duration-200"
              style={{ color: '#888', border: '1px solid #2a2a2a' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.borderColor = '#3a3a3a' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#2a2a2a' }}
            >
              man mcp-test
            </a>
            <a
              href="https://github.com/Abhiramrathod/mcp-testing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-medium transition-all duration-200"
              style={{ color: '#666', border: '1px solid #1e1e1e' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#888' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#666' }}
            >
              gh:source
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
