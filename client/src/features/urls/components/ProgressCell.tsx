'use client'

import { Progress } from '@/components/ui/progress'
import { useProgress } from '../hooks/useProgress'

export function ProgressCell(props: { urlId: number; initialStatus: string }) {
  const { urlId, initialStatus } = props
  const pct = useProgress(
    initialStatus === 'queued' || initialStatus === 'running' ? urlId : undefined
  )

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
