// app/(protected)/layout.tsx
'use client'

import { ReactNode } from 'react'
import { redirect }  from 'next/navigation'
import Nav           from '@/components/ui/Nav'
import { useAuth }   from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth()

  /* 1. still hydrating → show spinner */
  if (token === undefined) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  /* ---------- 2. unauthenticated → /login ------------- */
  if (!token) redirect('/login')

  /* ---------- 3. authenticated → render UI ------------ */
  return (
    <>
      <Nav />
      {children}
    </>
  )
}
