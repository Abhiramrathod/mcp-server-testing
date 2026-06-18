import { useRef, type ReactNode, type MouseEvent } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export default function TiltCard({ children, className = '', intensity = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouse = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (0.5 - y) * intensity
    const rotateY = (x - 0.5) * intensity
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)'
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
