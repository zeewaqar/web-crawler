'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input }   from '@/components/ui/input'
import { Button }  from '@/components/ui/button'
import { toast }   from 'sonner'
import { useAuthFetch } from '@/lib/authFetch'

const UrlSchema = z.object({
  url: z
    .url({ message: 'Must be a valid URL' })
    .refine((u) => u.startsWith('http'), 'Must start with http or https'),
})
type UrlForm = z.infer<typeof UrlSchema>

export function AddUrlForm() {
  const qc        = useQueryClient()
  const authFetch = useAuthFetch()
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<UrlForm>({ resolver: zodResolver(UrlSchema) })

  const mutation = useMutation({
    mutationFn: async (data: UrlForm) => {
      const r = await authFetch('/api/v1/urls', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(data),
      })
      if (!r.ok) {
        const { error } =
          await r.json().catch(() => ({ error: 'Server error' }))
        throw new Error(error)
      }
    },
    onSuccess: () => {
      toast.success('URL queued for crawling')
      qc.invalidateQueries({ queryKey: ['urls'] })
      reset()
    },
    onError: (e: unknown) =>
      toast.error((e as Error).message || 'Failed to add URL'),
  })

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="flex flex-col gap-2 mb-6 max-w-xl"
    >
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com"
          {...register('url')}
          aria-invalid={!!errors.url}
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add URL'}
        </Button>
      </div>
      {errors.url && (
        <p className="text-sm text-red-600">{errors.url.message}</p>
      )}
    </form>
  )
}
