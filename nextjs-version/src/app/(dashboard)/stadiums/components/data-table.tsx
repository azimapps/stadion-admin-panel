"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import {
    ChevronDown,
    Search,
    SlidersHorizontal,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRowClick?: (data: TData) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnVisibility, setColumnVisibility] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            globalFilter,
            columnVisibility,
        },
        onGlobalFilterChange: setGlobalFilter,
    })

    return (
        <div className="w-full space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm group">
                        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Stadionlarni qidirish..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/20 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12 text-muted-foreground font-semibold">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={onRowClick ? "cursor-pointer group hover:bg-muted/30 transition-colors border-border/50" : "group hover:bg-muted/30 transition-colors border-border/50"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Search className="size-8 opacity-20" />
                                        <p>Stadionlar topilmadi.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination & Summary */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground italic">
                    Jami <span className="font-semibold text-foreground">{table.getFilteredRowModel().rows.length}</span> ta stadion mavjud
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium mr-2">
                        <span className="text-muted-foreground">Sahifa</span>
                        <div className="flex items-center justify-center min-w-[40px] h-8 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            {table.getState().pagination.pageIndex + 1}
                        </div>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">{table.getPageCount()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-9 px-4 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                            Oldingi
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-9 px-4 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
