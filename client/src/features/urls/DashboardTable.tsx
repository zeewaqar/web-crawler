// src/features/urls/DashboardTable.tsx
'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { fetchUrls } from '@/features/urls/api'
import { columns } from './columns'
import { BulkToolbar } from './components/BulkToolbar'

export default function DashboardTable() {
  /* ── pagination & search state ─────────────────── */
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  /* ── row-selection state for bulk actions ───────── */
  const [rowSelection, setRowSelection] = useState({})

  /* debounce global search input */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250)
    return () => clearTimeout(id)
  }, [q])

  /* fetch paginated & filtered data */
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['urls', page, debouncedQ],
    queryFn: () => fetchUrls(page, 20, debouncedQ),
    placeholderData: (prev) => prev,
  })

  /* ── react-table instance setup ─────────────────── */
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20),

    state: {
      pagination: { pageIndex: page - 1, pageSize: 20 },
      rowSelection,
      sorting: [],
      columnFilters: [],
    },

    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) =>
      table.setState((old) => ({
        ...old,
        sorting:
          typeof updater === 'function' ? updater(old.sorting) : updater,
      })),
    onColumnFiltersChange: (updater) =>
      table.setState((old) => ({
        ...old,
        columnFilters:
          typeof updater === 'function'
            ? updater(old.columnFilters)
            : updater,
      })),

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  /* collect selected row IDs for bulk actions */
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id)

  const pageCount = table.getPageCount() || 1

  return (
    <>
      {/* bulk actions toolbar */}
      <BulkToolbar selected={selectedIds} />

      {/* search + status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search URL…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />

        <Select
          defaultValue="all"
          onValueChange={(val) => {
            table
              .getColumn('crawl_status')
              ?.setFilterValue(val === 'all' ? '' : val)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        {isFetching && (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
      </div>

      {/* table with horizontal scroll on small screens */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[720px] text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="p-2 text-left">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  Loading…
                </td>
              </tr>
            ) : !table.getRowModel().rows.length ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No rows found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="text-xs">
          Page {page} / {pageCount}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </>
  )
}
