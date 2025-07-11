import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Column } from '@tanstack/react-table'
import { UrlRow, apiBase } from '../urls/api'
import { ProgressCell } from './components/ProgressCell'
import { useAuth } from '@/lib/auth'

/* ---------- reusable sort header ---------- */
function SortHeader<TData, TValue>({
  column,
  label,
}: {
  column: Column<TData, TValue>
  label: string
}) {
  const dir = column.getIsSorted() as false | 'asc' | 'desc'
  return (
    <button
      className="flex items-center gap-1 select-none"
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      {dir === 'asc' && <ChevronUp className="h-3 w-3" />}
      {dir === 'desc' && <ChevronDown className="h-3 w-3" />}
    </button>
  )
}


/* ---------- Stop button (needs hook) ---------- */
function StopButton({ id }: { id: number }) {
  const { token } = useAuth()
  const qc = useQueryClient()

  const stop = useMutation({
    mutationFn: () =>
      fetch(`${apiBase()}/api/v1/urls/${id}/stop`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['urls'] }),
  })

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={stop.isPending}
      onClick={() => stop.mutate()}
    >
      Stop
    </Button>
  )
}

/* ---------- column definitions ---------- */
export const columns: ColumnDef<UrlRow>[] = [
  /* Select checkbox */
  {
    id: 'select',
    size: 30,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        aria-label="Select all"
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

  /* Data columns */
  {
    accessorKey: 'title',
    header: ({ column }) => <SortHeader column={column} label="Title" />,
    cell: ({ row }) => (
      <Link
        href={`/urls/${row.original.id}`}
        className="text-blue-600 hover:underline"
      >
        {row.original.title ?? row.original.original_url}
      </Link>
    ),
  },
  { accessorKey: 'html_version', header: 'HTML' },
  {
    accessorKey: 'internal_links',
    header: ({ column }) => <SortHeader column={column} label="Internal" />,
  },
  {
    accessorKey: 'external_links',
    header: ({ column }) => <SortHeader column={column} label="External" />,
  },
  {
    accessorKey: 'broken_links',
    header: ({ column }) => <SortHeader column={column} label="Broken" />,
  },
  {
    accessorKey: 'crawl_status',
    header: ({ column }) => <SortHeader column={column} label="Progress" />,
    cell: ({ row }) => (
      <ProgressCell
        urlId={row.original.id}
        initialStatus={row.original.crawl_status}
      />
    ),
  },

  /* Per-row Stop action */
  {
    id: 'actions',
    size: 80,
    enableSorting: false,
    header: 'Actions',
    cell: ({ row }) =>
      row.original.crawl_status === 'running' ? (
        <StopButton id={row.original.id} />
      ) : null,
  },
]