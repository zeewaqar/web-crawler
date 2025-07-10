"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {useQuery} from "@tanstack/react-query";
import {useState, useEffect} from "react";

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {fetchUrls} from "@/features/urls/api";
import {columns} from "./columns";
import {BulkToolbar} from "./components/BulkToolbar";

export default function DashboardTable() {
  /* ── pagination & search state ─────────────────── */
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  /* ── row-selection state (bulk) ─────────────────── */
  const [rowSelection, setRowSelection] = useState({});

  /* debounce search */
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(id);
  }, [q]);

  /* query */
  const {data, isLoading, isFetching} = useQuery({
    queryKey: ["urls", page, debouncedQ],
    queryFn: () => fetchUrls(page, 20, debouncedQ),
    placeholderData: (prev) => prev,
  });

  /* ── table instance ─────────────────────────────── */
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: Math.ceil((data?.total ?? 0) / 20),

    /* --- state kept in React --- */
    state: {
      pagination: {pageIndex: page - 1, pageSize: 20},
      rowSelection,
      sorting: [],
      columnFilters: [],
    },

    /* --- callbacks --- */
    manualPagination: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (u) =>
      table.setState((o) => ({
        ...o,
        sorting: typeof u === "function" ? u(o.sorting) : u,
      })),
    onColumnFiltersChange: (u) =>
      table.setState((o) => ({
        ...o,
        columnFilters: typeof u === "function" ? u(o.columnFilters) : u,
      })),

    /* --- row models --- */
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);

  const pageCount = table.getPageCount() || 1;

  /* ── render ─────────────────────────────────────── */
  return (
    <>
      <BulkToolbar selected={selectedIds} />

      {/* Search + Status filter */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search URL…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />

        {/* ——— status dropdown ——— */}
        <Select
          defaultValue="all"
          onValueChange={(val) => {
            table
              .getColumn("crawl_status")
              ?.setFilterValue(val === "all" ? "" : val);
            setPage(1);
          }}>
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

      {/* Table (scrollable on mobile) */}
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
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>

        <span className="text-xs">
          Page {page} / {pageCount}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </>
  );
}
