'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth }   from '@/lib/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const router    = useRouter()

  /* redirect unauth → /login */
  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  return <>{children}</>
}
