import { useState, useEffect } from 'react'

const FALLBACK = '1.5.0'
let cached: string | null = null

export function useLatestVersion(): string {
  const [version, setVersion] = useState<string>(cached ?? FALLBACK)

  useEffect(() => {
    if (cached) { setVersion(cached); return }
    fetch('https://api.github.com/repos/Abhiramrathod/mcp-testing/tags?per_page=1')
      .then(r => r.json())
      .then((data: { name: string }[]) => {
        const tag = data?.[0]?.name
        if (tag) {
          // strip leading 'v' if present
          const v = tag.startsWith('v') ? tag.slice(1) : tag
          cached = v
          setVersion(v)
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  return version
}
