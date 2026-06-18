import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phrases = [
  'with confidence',
  'in production',
  'at scale',
  'with precision',
  'effortlessly',
]

export default function MorphingText() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="inline-block min-w-[15ch] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={phrases[index]}
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="gradient-text"
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
