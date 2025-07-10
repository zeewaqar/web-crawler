import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { UrlRow } from '../urls/api'            // <— path may differ; adjust if needed
import { ProgressCell } from './components/ProgressCell'

export const columns: ColumnDef<UrlRow>[] = [
  /* ──────────────── Select checkbox ──────────────── */
  {
    id: 'select',
    size: 30,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
  },

  /* ──────────────── Existing columns ─────────────── */
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <Link
        href={`/urls/${row.original.id}`}
        className="text-blue-600 hover:underline"
      >
        {row.original.title ?? row.original.original_url}
      </Link>
    ),
  },
  { header: 'HTML',      accessorKey: 'html_version' },
  { header: 'Internal',  accessorKey: 'internal_links' },
  { header: 'External',  accessorKey: 'external_links' },
  { header: 'Broken',    accessorKey: 'broken_links' },
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
