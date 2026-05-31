"use client"

import { Search, X, BadgeAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    ORDER_STATUS_ORDER,
    ORDER_STATUS_LABEL,
    orderStatusTone,
    type OrderStatus,
} from "@/services/marketplace-order"

export type StatusFilter = OrderStatus | "all" | "needs_refund"

interface OrdersFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    statusFilter: StatusFilter
    onStatusFilterChange: (value: StatusFilter) => void
    counts: Record<StatusFilter, number>
    resultCount: number
    totalCount: number
    onReset: () => void
}

export function OrdersFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    counts,
    resultCount,
    totalCount,
    onReset,
}: OrdersFiltersProps) {
    const isFiltered = search !== "" || statusFilter !== "all"

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Telefon, ism yoki #ID bo'yicha qidiruv..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9 rounded-lg"
                    />
                    {search && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground cursor-pointer"
                            aria-label="Tozalash"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                    {isFiltered && (
                        <Button variant="ghost" size="sm" onClick={onReset} className="cursor-pointer h-8">
                            <X className="mr-1 size-3.5" />
                            Tozalash
                        </Button>
                    )}
                    <div className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {resultCount} / {totalCount}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                <StatusChip
                    active={statusFilter === "all"}
                    onClick={() => onStatusFilterChange("all")}
                    label="Hammasi"
                    count={counts.all}
                />
                {ORDER_STATUS_ORDER.map((status) => {
                    const tone = orderStatusTone(status)
                    return (
                        <StatusChip
                            key={status}
                            active={statusFilter === status}
                            onClick={() => onStatusFilterChange(status)}
                            label={ORDER_STATUS_LABEL[status]}
                            count={counts[status] ?? 0}
                            dot={tone.dot}
                        />
                    )
                })}
                <StatusChip
                    active={statusFilter === "cancelled"}
                    onClick={() => onStatusFilterChange("cancelled")}
                    label={ORDER_STATUS_LABEL.cancelled}
                    count={counts.cancelled ?? 0}
                    dot="bg-rose-500"
                />
                <span className="hidden sm:inline-block w-px h-5 bg-border mx-1" />
                <StatusChip
                    active={statusFilter === "needs_refund"}
                    onClick={() => onStatusFilterChange("needs_refund")}
                    label="Pul qaytarish"
                    count={counts.needs_refund ?? 0}
                    icon={<BadgeAlert className="size-3" />}
                />
            </div>
        </div>
    )
}

interface StatusChipProps {
    active: boolean
    onClick: () => void
    label: string
    count: number
    dot?: string
    icon?: React.ReactNode
}

function StatusChip({ active, onClick, label, count, dot, icon }: StatusChipProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors",
                active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:bg-accent text-foreground"
            )}
        >
            {icon ?? (dot && <span className={cn("inline-block size-1.5 rounded-full", dot)} />)}
            <span>{label}</span>
            <span
                className={cn(
                    "tabular-nums text-[10px] px-1 rounded",
                    active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                )}
            >
                {count}
            </span>
        </button>
    )
}
