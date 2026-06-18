import { motion } from 'framer-motion'
import { modules } from '../data/content'

const tagStyles: Record<string, string> = {
  'bg-indigo-500': '#818cf8',
  'bg-pink-500': '#f472b6',
  'bg-purple-500': '#a78bfa',
  'bg-emerald-500': '#34d399',
  'bg-amber-500': '#fbbf24',
  'bg-cyan-500': '#22d3ee',
}

export default function Modules() {
  return (
    <section id="components" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="section-label mb-3">modules</div>
          <h2 className="section-title">Package Structure</h2>
          <p className="section-sub font-mono">ls -la ./mcp-test-*/</p>
        </motion.div>

        <div className="terminal-window">
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title ml-2">mcp-testing — directory listing</span>
          </div>
          <div className="terminal-body">
            <p className="text-xs mb-4" style={{ color: '#666' }}>
              <span className="prompt" /> tree ./ --depth=1
            </p>

            <div className="space-y-2">
              {modules.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 py-2 px-3 rounded transition-colors"
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(95,255,167,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ color: '#5fffa7', fontSize: 12 }}>📁</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: '#e0e0e0' }}>{m.name}/</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: `${tagStyles[m.tagColor] || '#666'}18`,
                          color: tagStyles[m.tagColor] || '#666',
                          border: `1px solid ${tagStyles[m.tagColor] || '#666'}25`,
                        }}
                      >
                        {m.tag}
                      </span>
                    </div>
                    {m.coords && (
                      <p className="text-xs mt-0.5" style={{ color: '#555', fontFamily: 'monospace' }}>{m.coords}</p>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: '#777' }}>{m.desc}</p>
                    {m.details && (
                      <p className="text-xs mt-0.5" style={{ color: '#555' }}>{m.details}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t text-xs" style={{ borderColor: '#1a1a1a', color: '#555' }}>
              <span style={{ color: '#888' }}>Build:</span> <span style={{ color: '#5fffa7' }}>mvn -T 1C clean install</span>
              <span className="mx-2" style={{ color: '#333' }}>|</span>
              <span style={{ color: '#888' }}>Docs:</span> <span style={{ color: '#5fffa7' }}>./javadoc/index.html</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
