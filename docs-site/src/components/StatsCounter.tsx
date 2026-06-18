import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'

const stats = [
  { label: 'Modules', value: 6, suffix: '' },
  { label: 'Java Version', value: 17, suffix: '+' },
  { label: 'Transports', value: 2, suffix: '' },
  { label: 'Test Examples', value: 6, suffix: '' },
]

export default function StatsCounter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-10"
    >
      {stats.map(s => {
        const { count, ref } = useCountUp(s.value, 2000)
        return (
          <div key={s.label} ref={ref} className="text-center">
            <div
              className="text-3xl sm:text-4xl font-extrabold tabular-nums"
              style={{ color: 'var(--accent)' }}
            >
              {count}{s.suffix}
            </div>
            <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-ter)' }}>
              {s.label}
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}
