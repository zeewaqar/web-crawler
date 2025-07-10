'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiBase } from '@/features/urls/api'

export function AddUrlForm() {
  const qc = useQueryClient()
  const [url, setUrl] = useState('')

  const addUrl = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${apiBase()}/api/v1/urls`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ url }),
      })
      if (!r.ok) throw new Error('invalid')
    },
    onSuccess: () => {
      setUrl('')
      qc.invalidateQueries({ queryKey: ['urls'] })   // refresh table
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        addUrl.mutate()
      }}
      className="flex gap-2 mb-6"
    >
      <Input
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
        required
      />
      <Button type="submit" disabled={addUrl.status === 'pending'}>
        {addUrl.status === 'pending' ? 'Adding…' : 'Add URL'}
      </Button>
    </form>
  )
}
