// src/app/(protected)/layout.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import { useAuth } from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const router = useRouter()

  // 2) not logged in? kick them to /login
  useEffect(() => {
    if (token === null) {
      router.replace('/login')
    }
  }, [token, router])

  // 1) still hydrating
  if (token === undefined) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  // don’t render anything until the redirect fires
  if (!token) {
    return null
  }

  // 3) logged in → show protected UI
  return (
    <>
      <Nav />
      {children}
    </>
  )
}
