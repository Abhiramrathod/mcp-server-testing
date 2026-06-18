import { motion } from 'framer-motion'
import { Github, Heart, ExternalLink } from 'lucide-react'

const links = [
  { label: 'Resources', items: [
    { label: 'Installation', href: '#installation' },
    { label: 'Documentation', href: '#docs' },
    { label: 'Examples', href: '#examples' },
    { label: 'Maven Central', href: 'https://central.sonatype.com/artifact/io.github.abhiramrathod/mcp-test-api', external: true },
  ]},
  { label: 'Community', items: [
    { label: 'GitHub', href: 'https://github.com/Abhiramrathod/mcp-testing', external: true },
    { label: 'Issues', href: 'https://github.com/Abhiramrathod/mcp-testing/issues', external: true },
    { label: 'Discussions', href: 'https://github.com/Abhiramrathod/mcp-testing/discussions', external: true },
    { label: 'License', href: 'https://github.com/Abhiramrathod/mcp-testing/blob/master/LICENSE', external: true },
  ]},
]

export default function Footer() {
  return (
    <footer className="relative border-t" style={{ background: 'var(--bg-alt)', borderColor: 'var(--border)' }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-[2fr_1fr_1fr] gap-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <a href="#" className="inline-flex items-center gap-2.5 font-bold text-lg no-underline mb-3" style={{ color: 'var(--text)' }}>
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
              </span>
              MCP Testing
            </a>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-sec)' }}>
              Production-grade Java testing framework for Model Context Protocol servers. Type-safe, fluent, extensible.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/Abhiramrathod/mcp-testing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px var(--accent-glow)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
            </div>
          </motion.div>

          {links.map(col => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>{col.label}</h4>
              <div className="space-y-2">
                {col.items.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.external ? '_blank' : undefined}
                    rel={l.external ? 'noopener noreferrer' : undefined}
                    className="group inline-flex items-center gap-1.5 text-sm transition-all duration-200 no-underline"
                    style={{ color: 'var(--text-sec)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-sec)'; e.currentTarget.style.transform = 'none' }}
                  >
                    {l.label}
                    {l.external && <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8 border-t text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-ter)' }}
        >
          <span>&copy; {new Date().getFullYear()} MCP Testing Framework — Apache 2.0</span>
          <span className="inline-flex items-center gap-1">
            Made with <Heart size={11} style={{ color: '#ef4444' }} /> by the community
          </span>
        </motion.div>
      </div>
    </footer>
  )
}
