'use client'

import { LinkRow } from '@/features/types'

export function BrokenLinkList({ links }: { links: LinkRow[] }) {
  if (!links.length) return <p className="text-sm text-muted-foreground">No broken links 🎉</p>

  return (
    <table className="text-sm w-full">
      <thead>
        <tr><th className="text-left p-1">URL</th><th className="p-1">Status</th></tr>
      </thead>
      <tbody>
        {links.map((l, i) => (
          <tr key={i} className="border-t">
            <td className="p-1 break-all">{l.href}</td>
            <td className="p-1 text-center">{l.http_status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
