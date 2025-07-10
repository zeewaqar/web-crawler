'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthFetch } from '@/lib/authFetch'

export function BulkToolbar({ selected }: { selected: number[] }) {
  const qc         = useQueryClient()
  const authFetch  = useAuthFetch()          // 🔐 attaches Bearer token
  const [err, setErr] = useState<string | null>(null)

  /* shared helper */
  async function call(path: string, ids: number[]) {
    const method =
      path.endsWith('restart') || path.endsWith('stop') ? 'POST' : 'DELETE'

    const r = await authFetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ ids }),
    })

    if (!r.ok) {
      const { error } = await r.json().catch(() => ({ error: 'server error' }))
      throw new Error(error ?? 'failed')
    }
  }

  /* ── mutations ────────────────────────── */
  const restart = useMutation({
    mutationFn : (ids: number[]) => call('/api/v1/urls/bulk/restart', ids),
    onSuccess  : () => { qc.invalidateQueries({ queryKey: ['urls'] }); setErr(null) },
    onError    : (e) => setErr((e as Error).message),
  })

  const stop = useMutation({
    mutationFn : (ids: number[]) => call('/api/v1/urls/bulk/stop', ids),
    onSuccess  : () => { qc.invalidateQueries({ queryKey: ['urls'] }); setErr(null) },
    onError    : (e) => setErr((e as Error).message),
  })

  const del = useMutation({
    mutationFn : (ids: number[]) => call('/api/v1/urls', ids),
    onSuccess  : () => { qc.invalidateQueries({ queryKey: ['urls'] }); setErr(null) },
    onError    : (e) => setErr((e as Error).message),
  })

  if (!selected.length) return null

  /* ── ui ────────────────────────────────── */
  return (
    <div className="flex flex-col gap-2 mb-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => restart.mutate(selected)}
          disabled={restart.isPending}
        >
          Re-run ({selected.length})
        </Button>

        <Button
          size="sm"
          onClick={() => stop.mutate(selected)}
          disabled={stop.isPending}
        >
          Stop
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => del.mutate(selected)}
          disabled={del.isPending}
        >
          Delete
        </Button>
      </div>

      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  )
}
