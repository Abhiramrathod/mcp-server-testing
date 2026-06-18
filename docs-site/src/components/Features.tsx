import { features } from '../data/content'

const sym: Record<string, string> = {
  Shield: '◇', Link2: '↗', Boxes: '⊞', Gauge: '⊙', Lock: '⊟', Puzzle: '◇',
}

export default function Features() {
  return (
    <section id="features" className="py-8 section-content">
      <div className="output-block">
        <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
          <span className="cmd">#</span> features
        </p>

        {features.map((f, i) => (
          <div key={f.title} className={`flex items-start gap-3 py-1.5 fade-in fade-in-${Math.min(i + 1, 6)}`}>
            <span className="text-xs w-4 shrink-0" style={{ color: 'var(--accent)' }}>{sym[f.icon] || '◆'}</span>
            <div>
              <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{f.title}</span>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}> — {f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
