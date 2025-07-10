'use client'
import { useAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) redirect('/login')
  return children
}
