// src/features/urls/components/ProgressCell.tsx
'use client'

import { useEffect, useState } from 'react'
import { Progress }            from '@/components/ui/progress'
import { apiBase }             from '@/features/urls/api'
import { useAuth }             from '@/lib/auth'

interface Props {
  urlId: number
  initialStatus: 'queued' | 'running' | 'done' | 'error'
}

export function ProgressCell({ urlId, initialStatus }: Props) {
  const { token } = useAuth()

  /* pct = null → not started, 0-100 → in progress/done */
  const [pct, setPct] = useState<number | null>(
    initialStatus === 'done'  ? 100 :
    initialStatus === 'error' ? 0   :
    null
  )

  /* subscribe only if queued/running */
  useEffect(() => {
    if (initialStatus === 'done' || initialStatus === 'error') return

    // build the EventSource URL, appending token if we have one
    const url = new URL(`${apiBase()}/api/v1/urls/${urlId}/stream`)
    if (token) {
      url.searchParams.set('token', token)
    }

    const es = new EventSource(url.toString())

    es.addEventListener('progress', (e: MessageEvent) => {
      const v = Number(e.data)
      setPct(v)
      if (v >= 100) es.close()
    })

    es.onerror = () => {
      es.close()
      setPct(null)
    }

    return () => {
      es.close()
    }
  }, [urlId, initialStatus, token])

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
