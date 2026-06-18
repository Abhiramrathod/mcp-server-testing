import { features } from '../data/content'

const symbols: Record<string, string> = {
  Shield: '◇', Link2: '↗', Boxes: '⊞', Gauge: '⊙', Lock: '⊟', Puzzle: '◇',
}

export default function Features() {
  return (
    <section id="features" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs dim mb-4">
          <span className="cmd">#</span> features
        </p>

        {features.map((f, i) => (
          <div key={f.title} className="flex items-start gap-3 py-1.5">
            <span className="text-xs dim2 w-4 shrink-0" style={{ color: '#5fffa7' }}>{symbols[f.icon] || '◆'}</span>
            <div>
              <span className="text-xs font-medium" style={{ color: '#d4d4d4' }}>{f.title}</span>
              <span className="text-xs dim2"> — {f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
