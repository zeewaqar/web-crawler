'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextValue {
  token: string | null
  setToken: (t: string | null) => void
}

export const AuthCtx = createContext<AuthContextValue>({
  token: null,
  setToken: () => {},
})

export const useAuth = () => useContext(AuthCtx)

/* ---------- updated provider ---------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    /* this runs only on the client */
    if (typeof window === 'undefined') return null
    return localStorage.getItem('jwt')
  })

  /* keep localStorage in sync */
  useEffect(() => {
    if (token) localStorage.setItem('jwt', token)
    else localStorage.removeItem('jwt')
  }, [token])

  return (
    <AuthCtx.Provider value={{ token, setToken }}>{children}</AuthCtx.Provider>
  )
}
