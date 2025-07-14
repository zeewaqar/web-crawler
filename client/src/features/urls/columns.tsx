// src/features/urls/columns.tsx
import Link from "next/link";
import {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {ChevronUp, ChevronDown} from "lucide-react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Column} from "@tanstack/react-table";
import {UrlRow, apiBase} from "../urls/api";
import {ProgressCell} from "./components/ProgressCell";
import {useAuth} from "@/lib/auth";

/** Sortable header with arrow */
function SortHeader<TData, TValue>({
  column,
  label,
}: {
  column: Column<TData, TValue>;
  label: string;
}) {
  const dir = column.getIsSorted() as false | "asc" | "desc";
  return (
    <button
      className="flex items-center gap-1 select-none"
      onClick={column.getToggleSortingHandler()}>
      {label}
      {dir === "asc" && <ChevronUp className="h-3 w-3" />}
      {dir === "desc" && <ChevronDown className="h-3 w-3" />}
    </button>
  );
}

/** Stop button for a running crawl */
function StopButton({id}: {id: number}) {
  const {token} = useAuth();
  const qc = useQueryClient();
  const stop = useMutation({
    mutationFn: () =>
      fetch(`${apiBase()}/api/v1/urls/${id}/stop`, {
        method: "PUT",
        headers: token ? {Authorization: `Bearer ${token}`} : {},
      }),
    onSuccess: () => qc.invalidateQueries({queryKey: ["urls"]}),
  });
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={stop.isPending}
      onClick={() => stop.mutate()}>
      Stop
    </Button>
  );
}

export const columns: ColumnDef<UrlRow>[] = [
  {
    id: "select",
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        aria-label="Select all rows"
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select this row"
      />
    ),
    enableSorting: false,
    size: 50,
  },

  {
    accessorKey: "original_url",
    header: ({column}) => <SortHeader column={column} label="URL" />,
    cell: ({row}) => {
      const url = row.original.original_url;
      const truncate = (s: string, max = 50) =>
        s.length <= max ? s : s.slice(0, 15) + "…" + s.slice(-25);
      return (
        <div className="max-w-xs">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline block truncate"
            title={url}>
            {truncate(url)}
          </a>
        </div>
      );
    },
  },

  {
    accessorKey: "title",
    header: ({column}) => <SortHeader column={column} label="Title" />,
    cell: ({row}) => {
      const txt = row.original.title ?? row.original.original_url;
      const truncate = (s: string, max = 60) =>
        s.length <= max ? s : s.slice(0, max) + "…";
      return (
        <div className="max-w-sm">
          <Link
            href={`/urls/${row.original.id}`}
            className="text-blue-600 hover:underline block truncate"
            title={txt}>
            {truncate(txt)}
          </Link>
        </div>
      );
    },
  },

  {accessorKey: "html_version", header: "HTML", size: 80},
  {
    accessorKey: "internal_links",
    header: ({column}) => <SortHeader column={column} label="Internal" />,
    size: 90,
  },
  {
    accessorKey: "external_links",
    header: ({column}) => <SortHeader column={column} label="External" />,
    size: 90,
  },
  {
    accessorKey: "broken_links",
    header: ({column}) => <SortHeader column={column} label="Broken" />,
    size: 90,
  },

  {
    accessorKey: "crawl_status",
    header: ({column}) => <SortHeader column={column} label="Progress" />,
    /** exact-match only */
    filterFn: (row, columnId, filterValue) =>
      row.getValue<string>(columnId) === filterValue,
    cell: ({row}) => (
      <ProgressCell
        urlId={row.original.id}
        initialStatus={row.original.crawl_status}
      />
    ),
    size: 120,
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({row}) =>
      row.original.crawl_status === "running" ? (
        <StopButton id={row.original.id} />
      ) : null,
    enableSorting: false,
    size: 100,
  },
];
