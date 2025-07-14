// src/app/(protected)/layout.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav, { NavProvider } from '@/components/ui/Nav'
import { useAuth } from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const router    = useRouter()

  // 2) not logged in? kick them to /login
  useEffect(() => {
    if (token === null) {
      router.replace('/login')
    }
  }, [token, router])

  // 1) still hydrating → announce loading
  if (token === undefined) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-screen items-center justify-center text-sm text-muted-foreground"
      >
        <svg
          className="animate-spin mr-2 h-5 w-5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        Loading…
      </div>
    )
  }

  // 2b) token === null causes the redirect above; render nothing
  if (!token) return null

  // 3) logged in → show protected UI
  return (
    <NavProvider>
      <Nav />
      {/* mark main content for skip-link */}
      <main id="main-content">{children}</main>
    </NavProvider>
  )
}