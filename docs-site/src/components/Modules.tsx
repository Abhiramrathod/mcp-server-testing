import { modules } from '../data/content'

const tagColors: Record<string, string> = {
  'bg-indigo-500': '#818cf8', 'bg-pink-500': '#f472b6', 'bg-purple-500': '#a78bfa',
  'bg-emerald-500': '#34d399', 'bg-amber-500': '#fbbf24', 'bg-cyan-500': '#22d3ee',
}

export default function Modules() {
  return (
    <section id="components" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs dim mb-3">
          <span className="cmd">#</span> modules
        </p>
        <p className="text-xs dim2 mb-3">$ tree ./ --depth=1</p>

        {modules.map((m, i) => (
          <div key={m.name} className="flex items-start gap-3 py-1.5">
            <span className="text-xs dim2 w-4 shrink-0" style={{ color: '#5fffa7' }}>📁</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium" style={{ color: '#d4d4d4' }}>{m.name}/</span>
                <span className="tag" style={{ background: `${tagColors[m.tagColor] || '#666'}15`, color: tagColors[m.tagColor] || '#666', border: `1px solid ${tagColors[m.tagColor] || '#666'}20` }}>
                  {m.tag}
                </span>
              </div>
              {m.coords && <p className="text-xs dim mt-0.5">{m.coords}</p>}
              <p className="text-xs dim2 mt-0.5">{m.desc}</p>
              {m.details && <p className="text-xs dim mt-0.5">{m.details}</p>}
            </div>
          </div>
        ))}

        <p className="text-xs dim mt-4">
          <span className="dim">└──</span> build: <span style={{ color: '#5fffa7' }}>mvn -T 1C clean install</span>
          <span className="dim2"> | </span>
          <span className="dim">javadoc:</span> <span style={{ color: '#5fffa7' }}>./javadoc/index.html</span>
        </p>
      </div>
    </section>
  )
}
