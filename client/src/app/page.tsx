// Runs on every request (no prerender)
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Root() {
  const jwt = (await cookies()).get('jwt')?.value
  redirect(jwt ? '/dashboard' : '/login')
}
