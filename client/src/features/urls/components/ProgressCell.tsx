'use client'

import { useEffect, useState } from 'react'
import { Progress }           from '@/components/ui/progress'
import { apiBase }            from '@/features/urls/api'   // ✅ absolute API base

interface Props {
  urlId: number
  initialStatus: 'queued' | 'running' | 'done' | 'error'
}

export function ProgressCell({ urlId, initialStatus }: Props) {
  /* pct = null → not started, 0-100 → in progress/done */
  const [pct, setPct] = useState<number | null>(
    initialStatus === 'done' ? 100 :
    initialStatus === 'error' ? 0   :  // won’t be shown (❌ path)
    null
  )

  /* subscribe only if queued/running */
  useEffect(() => {
    if (initialStatus === 'done' || initialStatus === 'error') return

    const es = new EventSource(`${apiBase()}/api/v1/urls/${urlId}/stream`)

    es.addEventListener('progress', (e) => {
      const v = Number((e as MessageEvent).data)
      setPct(v)
      if (v >= 100) es.close()
    })

    es.onerror = () => es.close()
    return () => es.close()
  }, [urlId, initialStatus])

  /* finished states */
  if (initialStatus === 'done')  return <span className="text-green-600">✅</span>
  if (initialStatus === 'error') return <span className="text-red-600">❌</span>

  /* not started yet */
  if (pct === null) return <span className="text-xs text-muted-foreground">–</span>

  /* in-flight */
  return (
    <div className="flex items-center gap-2 w-28">
      <Progress value={pct} className="h-1 flex-1" />
      <span className="text-xs w-8 text-right">{pct}%</span>
    </div>
  )
}
