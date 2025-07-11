'use client'

import { useRouter } from 'next/navigation'
import { useAuth }  from '@/lib/auth'
import { Button }   from '@/components/ui/button'
import { apiBase }   from '@/features/urls/api'   // ← helper already exists

export function SignOutButton() {
  const { setToken } = useAuth()
  const router       = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try { await fetch(`${apiBase()}/api/v1/logout`, { method: 'POST' }) } catch {}
        setToken(null)              // wipes localStorage
        router.replace('/login')
      }}
    >
      Sign out
    </Button>
  )
}
