'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthFetch } from '@/lib/authFetch'

export function BulkToolbar({ selected }: { selected: number[] }) {
  const qc = useQueryClient()
  const authFetch = useAuthFetch()          // 🔐 attaches Bearer token
  const [err, setErr] = useState<string | null>(null)

  async function call(path: string, ids: number[]) {
    const r = await authFetch(path, {
      method : path.endsWith('restart') ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ ids }),
    })
    if (!r.ok) {
      const { error } = await r.json().catch(() => ({ error: 'server error' }))
      throw new Error(error ?? 'failed')
    }
  }

  const restart = useMutation({
    mutationFn : (ids: number[]) => call('/api/v1/urls/bulk/restart', ids),
    onSuccess  : () => {
      qc.invalidateQueries({ queryKey: ['urls'] })
      setErr(null)
    },
    onError: (e: unknown) => setErr((e as Error).message),
  })

  const del = useMutation({
    mutationFn : (ids: number[]) => call('/api/v1/urls', ids),
    onSuccess  : () => {
      qc.invalidateQueries({ queryKey: ['urls'] })
      setErr(null)
    },
    onError: (e: unknown) => setErr((e as Error).message),
  })

  if (!selected.length) return null

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
