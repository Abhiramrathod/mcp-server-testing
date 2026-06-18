import { type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={`${inView ? 'triggered' : ''} ${className}`}>
      {children}
    </div>
  )
}
