import { motion } from 'framer-motion'
import { modules } from '../data/content'
import TiltCard from './TiltCard'

export default function Modules() {
  return (
    <section id="components" className="py-20 sm:py-28 relative" style={{ background: 'var(--bg-alt)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.3 }} />
      </div>
      <div className="max-w-6xl mx-auto px-6 relative z-[1]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text)' }}>Modular by Design</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-sec)' }}>Six specialized modules with clean separation of concerns</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, i) => (
            <TiltCard key={m.name} intensity={4}>
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative p-6 rounded-2xl transition-all duration-300 overflow-hidden card-shine"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', opacity: 0.5 }} />
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 flex-wrap" style={{ color: 'var(--text)' }}>
                  {m.name}
                  <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded text-white ${m.tagColor}`}>{m.tag}</span>
                </h3>
                {m.coords && (
                  <p className="text-xs mb-2 font-mono" style={{ color: 'var(--text-ter)' }}>{m.coords}</p>
                )}
                <p className="text-sm mb-2" style={{ color: 'var(--text-sec)' }}>{m.desc}</p>
                {m.details && (
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-ter)' }}>{m.details}</p>
                )}
              </motion.div>
            </TiltCard>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 p-5 rounded-2xl glass text-sm leading-relaxed"
          style={{ color: 'var(--text-sec)' }}
        >
          <strong style={{ color: 'var(--text)' }}>Build:</strong> <code style={{ color: 'var(--accent)' }}>mvn -T 1C clean install</code> &nbsp;·&nbsp;
          <strong style={{ color: 'var(--text)' }}>Javadocs:</strong> <code style={{ color: 'var(--accent)' }}>mvn javadoc:jar</code> &nbsp;·&nbsp;
          <strong style={{ color: 'var(--text)' }}>Dist:</strong> Sonatype OSSRH / Maven Central
          <br />
          View <a href="./javadoc/index.html" style={{ color: 'var(--accent)', fontWeight: 600 }}>API Javadocs</a> (if generated locally).
        </motion.div>
      </div>
    </section>
  )
}
