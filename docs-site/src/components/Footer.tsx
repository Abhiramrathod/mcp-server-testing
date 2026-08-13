import { Github } from 'lucide-react'
import Logo from './Logo'
import { useMavenVersion } from '../hooks/useMavenVersion'

export default function Footer() {
  const version = useMavenVersion()
  return (
    <footer className="border-t pt-8 pb-6" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>PROJECT</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>v{version} · Java 17+</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Apache 2.0</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>SSE + Streamable HTTP</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>DOCS</p>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/quickstart">Quick Start</a>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/api-reference">API Reference</a>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/examples">Examples</a>
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>GUIDES</p>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/integration-testing">Integration Testing</a>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/tools-testing">Tools</a>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/resources-testing">Resources</a>
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>PROJECT</p>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/changelog">Changelog</a>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/faq">FAQ</a>
            <a className="block text-xs no-underline" style={{ color: 'var(--text-dim)' }} href="/glossary">Glossary</a>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--accent)' }}>
            <Logo size={12} /> mcp-testing docs
          </span>
          <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs no-underline" style={{ color: 'var(--text-dim)' }}>
            <Github size={11} /> gh:Abhiramrathod/mcp-testing
          </a>
        </div>
      </div>
    </footer>
  )
}
