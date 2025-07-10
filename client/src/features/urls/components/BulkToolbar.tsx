'use client'

import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiBase } from '@/features/urls/api'          // ← import helper

async function postJson(path: string, ids: number[]) {
  await fetch(`${apiBase()}${path}`, {                // ← prepend base
    method : path.endsWith('restart') ? 'POST' : 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ ids }),
  }).then((r) => {
    if (!r.ok) throw new Error('failed')
  })
}
export function BulkToolbar({ selected }: { selected: number[] }) {
  const qc = useQueryClient()

  const restart = useMutation({
    mutationFn: (ids: number[]) => postJson('/api/v1/urls/bulk/restart', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['urls'] }),
  })

  const del = useMutation({
    mutationFn: (ids: number[]) => postJson('/api/v1/urls', ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['urls'] }),
  })

  if (!selected.length) return null

  return (
    <div className="flex gap-2 mb-2">
      <Button size="sm" onClick={() => restart.mutate(selected)} disabled={restart.isPending}>
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
  )
}
