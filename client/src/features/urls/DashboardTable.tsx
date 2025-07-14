'use client'

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Search, Filter, RefreshCw, AlertCircle, Database, TrendingUp } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

import { fetchUrls, UrlRow } from '@/features/urls/api'
import { columns } from './columns'
import { BulkToolbar } from './components/BulkToolbar'

type UrlListResponse = {
  data: UrlRow[]
  total: number
}

export default function DashboardTable() {
  /* ── pagination & search state ──────────────────────── */
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(id)
  }, [q])

  /* ── fetch paginated & filtered data ────────────────── */
  const {
    data,           // UrlListResponse | undefined
    isLoading,
    isFetching,
    error,          // Error | null
  } = useQuery<UrlListResponse, Error>({
    queryKey: ['urls', page, debouncedQ],
    queryFn : () => fetchUrls(page, 20, debouncedQ),
    placeholderData: keepPreviousData,
  })

  // Handle errors with toast in useEffect
  useEffect(() => {
    if (error) {
      toast.error('Failed to load URLs')
    }
  }, [error])

  /* ── react-table setup ─────────────────────────────── */
  const [rowSelection, setRowSelection] = useState({})
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20) || 1,
    state: {
      pagination: { pageIndex: page - 1, pageSize: 20 },
      rowSelection,
      sorting: [],
      columnFilters: [],
    },
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: u =>
      table.setState(o => ({ ...o, sorting: typeof u === 'function' ? u(o.sorting) : u })),
    onColumnFiltersChange: u =>
      table.setState(o => ({
        ...o,
        columnFilters: typeof u === 'function' ? u(o.columnFilters) : u,
      })),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id)
  const pageCount   = table.getPageCount()

  /* ── if we have an error, show a retry UI ───────────── */
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Something went wrong</h3>
            <p className="text-red-600 mb-6 text-sm">{error.message}</p>
            <Button 
              onClick={() => void window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total URLs</p>
                <p className="text-2xl font-bold">{data?.total ?? 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Selected</p>
                <p className="text-2xl font-bold">{selectedIds.length}</p>
              </div>
              <Database className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Current Page</p>
                <p className="text-2xl font-bold">{page}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <BulkToolbar selected={selectedIds} />

      {/* Main Content Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              URL Management
            </CardTitle>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search URLs..."
                  value={q}
                  onChange={e => { setQ(e.target.value); setPage(1) }}
                  className="pl-10 min-w-[250px] bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <Select
                  defaultValue="all"
                  onValueChange={val => {
                    table.getColumn('crawl_status')?.setFilterValue(val === 'all' ? '' : val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="min-w-[140px] bg-white/80 backdrop-blur-sm border-gray-200">
                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isFetching && (
                <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading URLs...</p>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Database className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No URLs found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/50'
                      }`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 overflow-hidden"
                          style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : 'auto' }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{pageCount}</span>
            </p>
            {data?.total && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ({data.total} total items)
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 p-0 ${
                      page === pageNum 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0' 
                        : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage(p => p + 1)}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}