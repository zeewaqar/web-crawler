// app/register/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth }   from '@/lib/auth'
import { Input }     from '@/components/ui/input'
import { Button }    from '@/components/ui/button'
import { apiBase }   from '@/features/urls/api'

export default function RegisterPage() {
  const { token }     = useAuth()
  const router        = useRouter()

  const [email, setEmail] = useState('')
  const [pass,  setPass ] = useState('')
  const [err,   setErr ]  = useState<string|null>(null)

  useEffect(() => {
    if (token) router.replace('/dashboard')
  }, [token, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const res = await fetch(`${apiBase()}/api/v1/register`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email, password: pass }),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error' }))
      setErr(error)
      return
    }
    router.replace('/login?registered=1')
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        {err && <p className="text-red-600">{err}</p>}
        <Button className="w-full">Create account</Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </main>
  )
}
