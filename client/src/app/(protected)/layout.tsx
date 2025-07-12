// app/(protected)/layout.tsx
'use client'

import { ReactNode } from 'react'
import { redirect }  from 'next/navigation'
import Nav            from '@/components/ui/Nav'
import { useAuth }    from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth()

  // 1️⃣ still loading the token?
  if (token === undefined) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  // 2️⃣ not authenticated → /login
  if (token === null) {
    redirect('/login')
  }

  // 3️⃣ signed in → render protected UI
  return (
    <>
      <Nav />
      {children}
    </>
  )
}
