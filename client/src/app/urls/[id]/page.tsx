// src/app/urls/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { fetchUrlDetail } from '@/features/urls/api'
import { BrokenLinkList } from '@/features/urls/components/BrokenLinkList'
import { LinkTypeChart } from '@/features/urls/components/LinkTypeChart'

export default function UrlDetailPage() {
  const { token } = useAuth()
  const router = useRouter()
  const { id } = useParams() as { id?: string }

  const [data, setData] = useState<Awaited<ReturnType<typeof fetchUrlDetail>> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // wait for auth hydration
    if (token === undefined) return

    // not logged in → kick back to login
    if (!token) {
      router.replace('/login')
      return
    }

    // invalid id param
    const urlId = Number(id)
    if (!urlId) {
      setError('Invalid URL id')
      setLoading(false)
      return
    }

    // fetch with token injected by your fetch wrapper
    fetchUrlDetail(urlId)
      .then((d) => setData(d))
      .catch(() => setError('Failed to load URL details'))
      .finally(() => setLoading(false))
  }, [token, id, router])

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }
  if (loading || !data) {
    return <div className="p-6">Loading…</div>
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold break-all">
        {data.original_url}
      </h1>

      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-medium mb-2">Link breakdown</h2>
          <LinkTypeChart
            internal={data.internal_links}
            external={data.external_links}
          />
        </div>

        <div>
          <h2 className="font-medium mb-2">Broken links</h2>
          <BrokenLinkList
            links={data.links.filter((l) => l.http_status && l.http_status >= 400)}
          />
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Meta</h2>
        <ul className="text-sm list-disc ml-5">
          <li>HTML version: {data.html_version ?? 'unknown'}</li>
          <li>Headings: h1={data.h1} h2={data.h2} h3={data.h3}</li>
          <li>Login form: {data.has_login ? 'yes' : 'no'}</li>
        </ul>
      </section>
    </main>
  )
}
