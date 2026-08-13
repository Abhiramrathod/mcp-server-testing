import { Link } from 'react-router-dom'
import { Github, ExternalLink } from 'lucide-react'
import Logo from './Logo'
import { useLatestVersion } from '../hooks/useLatestVersion'

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="block text-xs no-underline transition-colors" style={{ color: 'var(--text-dim)' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
    >
      {children}
    </Link>
  )
}

export default function Footer() {
  const version = useLatestVersion()
  return (
    <footer className="border-t pt-8 pb-6" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>PROJECT</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>v{version} · Java 17+</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Apache 2.0</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>SSE + Streamable HTTP</p>
            <a href="https://github.com/Abhiramrathod/mcp-testing/releases" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs no-underline transition-colors" style={{ color: 'var(--accent)' }}
            >
              releases <ExternalLink size={9} />
            </a>
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>DOCS</p>
            <FooterLink to="/quickstart">Quick Start</FooterLink>
            <FooterLink to="/api-reference">API Reference</FooterLink>
            <FooterLink to="/examples">Examples</FooterLink>
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>GUIDES</p>
            <FooterLink to="/integration-testing">Integration Testing</FooterLink>
            <FooterLink to="/tools-testing">Tools</FooterLink>
            <FooterLink to="/resources-testing">Resources</FooterLink>
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--text-dim2)', letterSpacing: '0.3px' }}>PROJECT</p>
            <FooterLink to="/changelog">Changelog</FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/glossary">Glossary</FooterLink>
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
