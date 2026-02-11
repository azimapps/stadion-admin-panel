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
import { Percent } from "lucide-react"
import { cn } from "@/lib/utils"

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

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    })

    return (
        <div className="w-full space-y-6">
            <div className="rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:shadow-md">
                <Table>
                    <TableHeader className="bg-muted/50 border-b border-border/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={cn(
                                        "group border-border/50 transition-colors hover:bg-muted/20",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-5 px-6">
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
                                    className="h-40 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center text-muted-foreground/30 gap-3">
                                        <Percent className="size-12 opacity-10 animate-pulse" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em]">Chegirmalar topilmadi.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-2">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                    Jami <span className="text-foreground/60">{table.getFilteredRowModel().rows.length}</span> ta chegirma mavjud
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-xs font-black tracking-widest text-muted-foreground/40 uppercase">
                        Sahifa
                        <div className="flex items-center justify-center size-9 rounded-xl bg-primary/5 text-primary border border-primary/10 shadow-inner">
                            {table.getState().pagination.pageIndex + 1}
                        </div>
                        / {table.getPageCount()}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-muted/20 hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-20"
                        >
                            Oldingi
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-muted/20 hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-20"
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
