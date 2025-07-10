'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchUrls } from './api'
import { columns } from './columns'

export default function DashboardTable() {
  const [page, setPage]   = useState(1)
  const [q, setQ]         = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['urls', page, q],
    queryFn: () => fetchUrls(page, 20, q),
  })

  const rowModel = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20),
    state: { pagination: { pageIndex: page - 1, pageSize: 20 } },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <>
      {/* Search box */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search URL…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          {rowModel.getHeaderGroups().map((hg) => (
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
            <tr><td colSpan={columns.length} className="p-4 text-center">Loading…</td></tr>
          ) : (
            rowModel.getRowModel().rows.map((row) => (
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
        <Button variant="outline" size="sm" disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}>Prev</Button>

        <span className="text-xs">
          Page {page} / {rowModel.getPageCount() || 1}
        </span>

        <Button variant="outline" size="sm"
          disabled={page === rowModel.getPageCount()}
          onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </>
  )
}
