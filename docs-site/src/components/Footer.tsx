import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <>
      <div className="status-bar">
        <span className="flex items-center gap-1.5" style={{ color: '#5fffa7' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#5fffa7', boxShadow: '0 0 4px rgba(95,255,167,0.6)' }} />
          mcp-test
        </span>
        <span style={{ color: '#444' }}>v1.0.15</span>
        <span className="hidden sm:inline" style={{ color: '#333' }}>|</span>
        <span className="hidden sm:inline" style={{ color: '#555' }}>Java 17+</span>
        <span style={{ color: '#333' }}>|</span>
        <span style={{ color: '#555' }}>SSE + Streamable HTTP</span>
        <span className="flex-1" />
        <a href="https://github.com/Abhiramrathod/mcp-testing" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1" style={{ color: '#444' }}>
          <Github size={10} /> gh:Abhiramrathod/mcp-testing
        </a>
        <span style={{ color: '#333' }}>|</span>
        <span style={{ color: '#444' }}>Apache 2.0</span>
      </div>
      <div className="h-6" />
    </>
  )
}
