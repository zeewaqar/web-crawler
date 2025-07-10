'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import { Input }         from '@/components/ui/input'
import { Button }        from '@/components/ui/button'
import { fetchUrls }     from '@/features/urls/api'
import { columns }       from './columns'
import { BulkToolbar }   from './components/BulkToolbar'

export default function DashboardTable() {
  /* ——— pagination & search ——— */
  const [page, setPage] = useState(1)
  const [q, setQ]       = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  /* ——— row-selection state ——— */
  const [rowSelection, setRowSelection] = useState({})

  /* debounce search */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250)
    return () => clearTimeout(id)
  }, [q])

  /* query */
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['urls', page, debouncedQ],
    queryFn : () => fetchUrls(page, 20, debouncedQ),
  })

  /* table instance */
  const table = useReactTable({
    data   : data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20),
    state: {
      pagination  : { pageIndex: page - 1, pageSize: 20 },
      rowSelection,                   // <- managed by React
    },
    manualPagination  : true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,       // <- simple setter
    getCoreRowModel      : getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id)

  const pageCount = table.getPageCount() || 1

  /* ——— render ——— */
  return (
    <>
      <BulkToolbar selected={selectedIds} />

      {/* Search box */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search URL…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
        {isFetching && (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
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

      {/* Pagination */}
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
