// src/lib/useAuthFetch.ts
'use client'

import { useCallback } from 'react'
import { apiBase } from '@/features/urls/api'
import { useAuth } from '@/lib/auth'

export function useAuthFetch() {
  const { token } = useAuth()

  return useCallback(
    async (path: string, init: RequestInit = {}) => {
      // if they passed a full URL, use it; otherwise prepend your API base
      const url = path.startsWith('http')
        ? path
        : `${apiBase()}${path}`

      // merge headers, preserving any they passed
      const headers = new Headers(init.headers)
      if (token) headers.set('Authorization', `Bearer ${token}`)

      const res = await fetch(url, { ...init, headers })
      return res
    },
    [token]
  )
}
