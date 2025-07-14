'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuthFetch } from '@/lib/authFetch'
import { Plus, Link, Loader2, Globe, CheckCircle } from 'lucide-react'
import { Toaster } from "@/components/ui/sonner"

const UrlSchema = z.object({
  url: z
    .url({ message: 'Must be a valid URL' })
    .refine((u) => u.startsWith('http'), 'Must start with http or https'),
})
type UrlForm = z.infer<typeof UrlSchema>

export function AddUrlForm() {
  const qc = useQueryClient()
  const authFetch = useAuthFetch()
  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<UrlForm>({ resolver: zodResolver(UrlSchema) })

  const urlValue = watch('url')
  const isValidUrl = urlValue && !errors.url && urlValue.startsWith('http')

  const mutation = useMutation({
    mutationFn: async (data: UrlForm) => {
      const r = await authFetch('/api/v1/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    <>
      <Toaster />
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-8">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add New URL</h2>
            <p className="text-sm text-gray-600">Queue a new URL for crawling and analysis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Globe className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              placeholder="https://example.com"
              {...register('url')}
              aria-invalid={!!errors.url}
              disabled={isSubmitting}
              className={`pl-12 pr-12 h-12 text-base bg-white/80 backdrop-blur-sm border-2 transition-all duration-200 ${
                errors.url 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : isValidUrl
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {isValidUrl && !isSubmitting && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
            {isSubmitting && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            )}
          </div>

          {errors.url && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <p className="text-sm font-medium">{errors.url.message}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !isValidUrl}
              className={`h-12 px-8 font-medium transition-all duration-200 ${
                isSubmitting || !isValidUrl
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding URL...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Add URL to Queue
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Quick Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• URLs must start with http:// or https://</li>
            <li>• URLs will be automatically queued for crawling</li>
            <li>• You can monitor progress in the table below</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    </>
  )
}