import { useState, useEffect } from 'react'

const GROUP_ID = 'io.github.abhiramrathod'
const ARTIFACT_ID = 'mcp-test-api'
const FALLBACK = '1.0.38'

let cached: string | null = null

export function useMavenVersion(): string {
  const [version, setVersion] = useState<string>(cached ?? FALLBACK)

  useEffect(() => {
    if (cached) { setVersion(cached); return }
    fetch(`https://search.maven.org/solrsearch/select?q=g:${GROUP_ID}+AND+a:${ARTIFACT_ID}&rows=1&wt=json`)
      .then(r => r.json())
      .then(data => {
        const v = data?.response?.docs?.[0]?.latestVersion
        if (v) { cached = v; setVersion(v) }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  return version
}
