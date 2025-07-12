'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input }   from '@/components/ui/input'
import { Button }  from '@/components/ui/button'
import { apiBase } from '@/features/urls/api'
import { useAuth } from '@/lib/auth'

/* ----- inner component that uses the hook ----- */
function LoginForm() {
  const params       = useSearchParams()          
  const { setToken } = useAuth()
  const router       = useRouter()

  const [email, setEmail] = useState('')
  const [pass , setPass ] = useState('')
  const [err  , setErr  ] = useState<string | null>(null)
  const [busy , setBusy ] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)

    const r = await fetch(`${apiBase()}/api/v1/login`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ email, password: pass }),
    })

    if (r.ok) {
      const { token } = await r.json()
      setToken(token)
      router.replace('/dashboard')
    } else {
      setErr('Invalid email or password')
      setBusy(false)
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {params.get('ok') && (
        <p className="text-sm text-green-600">
          Registration successful — please sign in.
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="password"
          value={pass}
          onChange={(e)=>setPass(e.target.value)}
          required
        />

        {err && <p className="text-sm text-red-600">{err}</p>}

        <Button className="w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Login'}
        </Button>
      </form>

      <p className="text-sm">
        No account?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Register
        </a>
      </p>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
