import { useEffect, useState } from 'react'

export function useProgress(urlId: number | undefined) {
  const [pct, setPct] = useState<number | null>(null)

  useEffect(() => {
    if (!urlId) return                     // nothing yet

    let es = new EventSource(`/api/v1/urls/${urlId}/stream`)

    es.onmessage = (e) => {
      const v = Number(e.data)
      if (!Number.isNaN(v)) setPct(v)
      if (v >= 100) es.close()             // auto-close when done
    }

    es.onerror = () => {
      es.close()
      if (pct !== 100) {
        setTimeout(() => {
          es = new EventSource(`/api/v1/urls/${urlId}/stream`)
        }, 3000)
      }
    }

    return () => es.close()
  }, [pct, urlId])

  return pct
}
