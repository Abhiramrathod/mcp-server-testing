import { Github } from 'lucide-react'
import Logo from './Logo'
import { useMavenVersion } from '../hooks/useMavenVersion'

export default function Footer() {
  const version = useMavenVersion()
  return (
    <>
      <div className="status-bar">
        <span className="flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
          <span className="glow-dot" />
          <Logo size={12} />
        </span>
        <span style={{ color: 'var(--text-dim)' }}>v{version}</span>
        <span style={{ color: 'var(--border-light)' }}>|</span>
        <span className="hidden sm:inline" style={{ color: 'var(--text-dim2)' }}>Java 17+</span>
        <span style={{ color: 'var(--border-light)' }}>|</span>
        <span style={{ color: 'var(--text-dim2)' }}>SSE + Streamable HTTP</span>
        <span className="flex-1" />
        <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
          <Github size={10} /> gh:Abhiramrathod/mcp-testing
        </a>
        <span style={{ color: 'var(--border-light)' }}>|</span>
        <span style={{ color: 'var(--text-dim2)' }}>Apache 2.0</span>
      </div>
      <div className="h-6" />
    </>
  )
}
