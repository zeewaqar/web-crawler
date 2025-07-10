// src/app/page.tsx
import { redirect } from 'next/navigation'

/** tell Next.js not to pre-render this route at build-time */
export const dynamic = 'force-dynamic'

export default function Root() {
  /* runs only at request time */
  redirect('/dashboard')
}
