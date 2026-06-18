import { useMousePosition } from '../hooks/useMousePosition'
import { useScrollProgress } from '../hooks/useScrollProgress'

export default function CursorGlow() {
  const { x, y } = useMousePosition()
  const progress = useScrollProgress()

  return (
    <>
      <div
        className="fixed pointer-events-none z-[60] rounded-full"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          left: x - 300,
          top: y - 300,
          opacity: 0.5,
          transition: 'left 0.3s ease-out, top 0.3s ease-out',
        }}
      />
      <div
        className="fixed top-0 left-0 z-[100] h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-all duration-150"
        style={{ width: `${progress * 100}%` }}
      />
    </>
  )
}
