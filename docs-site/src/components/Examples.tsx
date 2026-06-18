import { examples } from '../data/content'
import { Github } from 'lucide-react'

const sym: Record<string, string> = {
  PlayCircle: '▶', Wrench: '◇', FolderOpen: '📂', MessageSquare: '💬', LineChart: '📊', CheckCheck: '✓',
}

export default function Examples() {
  return (
    <section id="examples" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs dim mb-3">
          <span className="cmd">#</span> examples
        </p>
        <p className="text-xs dim2 mb-3">$ ls mcp-test-examples/src/test/</p>

        {examples.map((ex, i) => (
          <a key={ex.title} href={ex.url} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-3 py-1.5 rounded no-underline transition-colors group"
            style={{ color: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(95,255,167,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="text-xs shrink-0 mt-0.5" style={{ color: '#5fffa7' }}>{sym[ex.icon] || '◆'}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: '#d4d4d4' }}>{ex.title}</span>
                <Github size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#555' }} />
              </div>
              <p className="text-xs dim2">{ex.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
