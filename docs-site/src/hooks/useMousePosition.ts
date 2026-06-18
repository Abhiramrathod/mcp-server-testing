import { useState, useEffect } from 'react'

interface MousePosition {
  x: number
  y: number
}

export function useMousePosition() {
  const [pos, setPos] = useState<MousePosition>({ x: -1000, y: -1000 })

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return pos
}
