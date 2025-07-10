// app/(protected)/layout.tsx
'use client'
import { useAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth()

  if (token === null) {
    // still hydrating – show nothing (or a spinner) instead of redirecting
    return null
  }
  if (!token) redirect('/login')

  return <>{children}</>
}
