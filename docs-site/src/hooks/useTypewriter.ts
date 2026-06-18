import { useState, useEffect, useRef } from 'react'

export function useTypewriter(text: string, speed = 30, startDelay = 0) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)
    startedRef.current = false

    const startTimeout = setTimeout(() => {
      startedRef.current = true
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [text, speed, startDelay])

  useEffect(() => {
    if (!startedRef.current) return

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current++
        setDisplayed(text.slice(0, indexRef.current))
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, startedRef.current])

  return { displayed, done }
}
