import { apiBase } from '@/features/urls/api'
import { useAuth } from '@/lib/auth'

export function useAuthFetch() {
  const { token } = useAuth()
  return (path: string, init: RequestInit = {}) =>
    fetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
}
