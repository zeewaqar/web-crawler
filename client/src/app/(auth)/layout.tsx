'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  /* if already signed-in, skip login/register */
  useEffect(() => {
    if (localStorage.getItem('jwt')) router.replace('/dashboard')
  }, [router])

  return <>{children}</>
}
