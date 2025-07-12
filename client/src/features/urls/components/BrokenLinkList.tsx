// src/features/urls/components/BrokenLinkList.tsx
'use client'

import { useState, useEffect } from 'react'
import { LinkRow } from '@/features/types'

interface BrokenLinkListProps {
  links: LinkRow[]
}

export function BrokenLinkList({ links }: BrokenLinkListProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render on server to avoid any localStorage issues
  if (!isClient) {
    return (
      <div className="space-y-2">
        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {links.length === 0 ? (
        <p className="text-sm text-gray-500">
          No broken links 🎉
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">URL</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2 break-all">{l.href}</td>
                  <td className="p-2 text-center">
                    <span className="font-mono">{l.http_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}