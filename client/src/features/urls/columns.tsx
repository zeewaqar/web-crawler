import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { UrlRow } from './api'
import { ProgressCell } from './components/ProgressCell'

export const columns: ColumnDef<UrlRow>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <Link
        href={`/urls/${row.original.id}`}
        className="text-blue-600 hover:underline"
      >
        {/* Fallback to URL if title is null */}
        {row.original.title ?? row.original.original_url}
      </Link>
    ),
  },
  { header: 'HTML', accessorKey: 'html_version' },
  { header: 'Internal', accessorKey: 'internal_links' },
  { header: 'External', accessorKey: 'external_links' },
  { header: 'Broken', accessorKey: 'broken_links' },
  {
    header: 'Progress',
    accessorKey: 'crawl_status',
    cell: ({ row }) => (
      <ProgressCell
        urlId={row.original.id}
        initialStatus={row.original.crawl_status}
      />
    ),
  },
]
