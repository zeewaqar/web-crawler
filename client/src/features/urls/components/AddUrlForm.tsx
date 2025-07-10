'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input }   from '@/components/ui/input'
import { Button }  from '@/components/ui/button'
import { useAuthFetch } from '@/lib/authFetch'      // 👈 new helper

export function AddUrlForm() {
  const qc          = useQueryClient()
  const authFetch   = useAuthFetch()               // 👈 JWT-aware fetch
  const [url, setUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const addUrl = useMutation({
    mutationFn: async () => {
      const raw = url.trim()
      if (!/^https?:\/\//i.test(raw)) throw new Error('URL must start with http(s)')
      const r = await authFetch('/api/v1/urls', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ url: raw }),
      })
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({ error: 'error' }))
        throw new Error(error ?? 'server error')
      }
    },
    onSuccess: () => {
      setUrl('')
      setErr(null)
      qc.invalidateQueries({ queryKey: ['urls'] }) // refresh grid
    },
    onError: (e: unknown) => {
      setErr((e as Error).message || 'failed')
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        addUrl.mutate()
      }}
      className="flex flex-col gap-2 mb-6 max-w-xl"
    >
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" disabled={addUrl.isPending}>
          {addUrl.isPending ? 'Adding…' : 'Add URL'}
        </Button>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
    </form>
  )
}
