"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {useQuery, keepPreviousData} from "@tanstack/react-query";
import {useState, useEffect} from "react";
import {toast} from "sonner";
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Database,
  TrendingUp,
} from "lucide-react";

import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {fetchUrls, UrlRow} from "@/features/urls/api";
import {columns} from "./columns";
import {BulkToolbar} from "./components/BulkToolbar";

type UrlListResponse = {
  data: UrlRow[];
  total: number;
};

export default function DashboardTable() {
  /* ── pagination & search state ──────────────────────── */
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  /* ── sorting & filters lifted into React state ─────── */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  /* ── fetch paginated & filtered data ────────────────── */
  const {data, isLoading, isFetching, error} = useQuery<UrlListResponse, Error>(
    {
      queryKey: ["urls", page, debouncedQ],
      queryFn: () => fetchUrls(page, 20, debouncedQ),
      placeholderData: keepPreviousData,
    }
  );

  /* toast on error */
  useEffect(() => {
    if (error) toast.error("Failed to load URLs");
  }, [error]);

  /* ── react-table setup ─────────────────────────────── */
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20) || 1,

    state: {
      pagination: {pageIndex: page - 1, pageSize: 20},
      rowSelection,
      sorting,
      columnFilters,
    },

    manualPagination: true,
    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);
  const pageCount = table.getPageCount();

  /* ── error UI ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              Something went wrong
            </h3>
            <p className="text-red-600 mb-6 text-sm">{error.message}</p>
            <Button
              onClick={() => void window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <RefreshCw className="animate-spin mr-2 w-4 h-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── helper for status filter ──────────────────────── */
  function handleStatusFilter(val: string) {
    table
      .getColumn("crawl_status")
      ?.setFilterValue(val === "all" ? undefined : val);
    setPage(1);
  }

  return (
    <div className="space-y-8 px-4 lg:px-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total URLs</p>
              <p className="text-2xl font-bold">{data?.total ?? 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Selected</p>
              <p className="text-2xl font-bold">{selectedIds.length}</p>
            </div>
            <Database className="w-8 h-8 text-green-200" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Current Page</p>
              <p className="text-2xl font-bold">{page}</p>
            </div>
            <Filter className="w-8 h-8 text-purple-200" />
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <BulkToolbar selected={selectedIds} />

      {/* Main Table Card */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="text-xl font-semibold">
              URL Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  aria-label="Search URLs"
                  placeholder="Search URLs..."
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 min-w-[250px]"
                />
              </div>
              <Select defaultValue="all" onValueChange={handleStatusFilter}>
                <SelectTrigger
                  className="min-w-[140px]"
                  aria-label="Filter URLs by status">
                  <Filter className="mr-2 text-gray-400" />
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
              {isFetching && (
                <div className="flex items-center text-sm text-blue-600">
                  <RefreshCw className="animate-spin mr-2 w-4 h-4" />
                  Updating…
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-blue-500" />
                    Loading URLs…
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-gray-500">
                    No URLs found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-3 text-sm text-gray-900">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        <div className="px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-700">
            Page <b>{page}</b> of <b>{pageCount}</b>{" "}
            {data?.total != null && `(${data.total} total)`}
          </div>
          <div className="flex space-x-2">
            <Button
              aria-label="Previous page"
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              aria-label="Next page"
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
