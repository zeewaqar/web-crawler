'use client'

import { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import { Input }   from '@/components/ui/input'
import { Button }  from '@/components/ui/button'
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select'

import { fetchUrls, type UrlRow } from '@/features/urls/api'
import { columns } from './columns'
import { BulkToolbar } from './components/BulkToolbar'

/* ---------- Result shape returned by fetchUrls ---------- */
type ListResponse = { data: UrlRow[]; total: number }

export default function DashboardTable() {
  /* ——— pagination & search state ——— */
  const [page , setPage ] = useState(1)
  const [q    , setQ    ] = useState('')
  const [debQ , setDebQ ] = useState('')

  /* debounced search */
  useEffect(()=>{
    const t = setTimeout(()=> setDebQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  /* ——— react-query ——— */
  const qc = useQueryClient()

  const query: UseQueryResult<ListResponse, Error> = useQuery({
    queryKey: ['urls', page, debQ],
    queryFn : async () => {
      try {
        return await fetchUrls(page, 20, debQ)
      } catch (e) {
        toast.error('Failed to load URLs')
        throw e               // keep query in error state
      }
    },
    placeholderData: (old) => old,
  })

  const { data, isFetching, isLoading, error } = query

  /* ——— react-table ——— */
  type RowSel = Record<string, boolean>
  const [rowSel, setRowSel] = useState<RowSel>({})

  const table = useReactTable({
    data   : data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20),

    state : {
      pagination: { pageIndex: page-1, pageSize: 20 },
      rowSelection: rowSel,
      sorting      : [],
      columnFilters: [],
    },

    manualPagination   : true,
    enableRowSelection : true,
    onRowSelectionChange: setRowSel,
    onSortingChange      : (u)=>
      table.setState(s=>({ ...s,
        sorting: typeof u==='function'? u(s.sorting):u })),
    onColumnFiltersChange: (u)=>
      table.setState(s=>({ ...s,
        columnFilters: typeof u==='function'? u(s.columnFilters):u })),

    getCoreRowModel      : getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel    : getSortedRowModel(),
    getFilteredRowModel  : getFilteredRowModel(),
  })

  const selectedIds = table.getSelectedRowModel().rows.map(r=>r.original.id)
  const pageCount   = table.getPageCount() || 1

  /* ——— render ——— */
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load –{' '}
        <Button variant="link"
          onClick={()=> qc.invalidateQueries({ queryKey:['urls'] })}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <BulkToolbar selected={selectedIds} />

      {/* Search + status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search URL…"
          value={q}
          onChange={(e)=>{ setQ(e.target.value); setPage(1) }}
          className="max-w-sm"
        />

        <Select
          defaultValue="all"
          onValueChange={(val)=>{
            table.getColumn('crawl_status')
                 ?.setFilterValue(val==='all'?'':val)
            setPage(1)
          }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {['all','queued','running','done','error'].map(s=>(
              <SelectItem key={s} value={s}>
                {s[0].toUpperCase()+s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFetching && (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[720px] text-sm">
          <thead>
            {table.getHeaderGroups().map(hg=>(
              <tr key={hg.id}>
                {hg.headers.map(h=>(
                  <th key={h.id} className="p-2 text-left">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={columns.length} className="p-4 text-center">
                Loading…</td></tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-4 text-center text-muted-foreground">
                No URLs yet. Add one above.
              </td></tr>
            ) : (
              table.getRowModel().rows.map(row=>(
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map(cell=>(
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" size="sm"
          disabled={page===1} onClick={()=> setPage(p=>p-1)}>
          Prev
        </Button>

        <span className="text-xs">Page {page} / {pageCount}</span>

        <Button variant="outline" size="sm"
          disabled={page>=pageCount} onClick={()=> setPage(p=>p+1)}>
          Next
        </Button>
      </div>
    </>
  )
}
