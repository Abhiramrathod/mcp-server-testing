import { modules } from '../data/content'
import Reveal from './Reveal'

const tagColors: Record<string, string> = {
  'bg-indigo-500': '#818cf8', 'bg-pink-500': '#f472b6', 'bg-purple-500': '#a78bfa',
  'bg-emerald-500': '#34d399', 'bg-amber-500': '#fbbf24', 'bg-cyan-500': '#22d3ee',
}

export default function Modules() {
  return (
    <section id="components" className="py-8 section-content">
      <Reveal>
        <div className="output-block">
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
            <span className="cmd">#</span> modules
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim2)' }}>$ tree ./ --depth=1</p>

          {modules.map((m, i) => (
            <div key={m.name} className={`fade-in fade-in-${Math.min(i + 1, 6)} flex items-start gap-3 py-1.5`}>
              <span className="text-xs w-4 shrink-0" style={{ color: 'var(--accent)' }}>📁</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{m.name}/</span>
                  <span className="tag" style={{ background: `${tagColors[m.tagColor] || '#666'}15`, color: tagColors[m.tagColor] || '#666', border: `1px solid ${tagColors[m.tagColor] || '#666'}20` }}>
                    {m.tag}
                  </span>
                </div>
                {m.coords && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{m.coords}</p>}
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim2)' }}>{m.desc}</p>
                {m.details && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{m.details}</p>}
              </div>
            </div>
          ))}

          <p className="text-xs mt-4 fade-in fade-in-6" style={{ color: 'var(--text-dim)' }}>
            <span style={{ color: 'var(--text-dim)' }}>└──</span> build: <span style={{ color: 'var(--accent)' }}>mvn -T 1C clean install</span>
            <span style={{ color: 'var(--text-dim2)' }}> | </span>
            <span style={{ color: 'var(--text-dim)' }}>javadoc:</span> <span style={{ color: 'var(--accent)' }}>./javadoc/index.html</span>
          </p>
        </div>
      </Reveal>
    </section>
  )
}
