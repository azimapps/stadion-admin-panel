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
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                        placeholder="Telefon, ism yoki #ID bo'yicha qidiruv..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-10 rounded-xl"
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
                        <Button variant="ghost" size="sm" onClick={onReset} className="cursor-pointer">
                            <X className="mr-1 size-3.5" />
                            Tozalash
                        </Button>
                    )}
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 whitespace-nowrap tabular-nums">
                        {resultCount} / {totalCount}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <StatusChip
                    active={statusFilter === "all"}
                    onClick={() => onStatusFilterChange("all")}
                    label="Hammasi"
                    count={counts.all}
                />
                {ORDER_STATUS_ORDER.map((status) => {
                    const tone = orderStatusTone(status)
                    const count = counts[status] ?? 0
                    return (
                        <StatusChip
                            key={status}
                            active={statusFilter === status}
                            onClick={() => onStatusFilterChange(status)}
                            label={ORDER_STATUS_LABEL[status]}
                            count={count}
                            tone={tone}
                        />
                    )
                })}
                <StatusChip
                    active={statusFilter === "cancelled"}
                    onClick={() => onStatusFilterChange("cancelled")}
                    label={ORDER_STATUS_LABEL.cancelled}
                    count={counts.cancelled ?? 0}
                    tone={orderStatusTone("cancelled")}
                />
                <span className="hidden sm:inline-block w-px h-5 bg-border/70 mx-1" />
                <StatusChip
                    active={statusFilter === "needs_refund"}
                    onClick={() => onStatusFilterChange("needs_refund")}
                    label="Pul qaytarish"
                    count={counts.needs_refund ?? 0}
                    icon={<BadgeAlert className="size-3" />}
                    tone={{
                        dot: "bg-amber-500",
                        text: "text-amber-600 dark:text-amber-300",
                        ring: "ring-amber-500/40",
                        bg: "bg-amber-500",
                        softBg: "bg-amber-500/15",
                        accentText: "text-amber-500",
                    }}
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
    tone?: {
        dot: string
        text: string
        ring: string
        bg: string
        softBg: string
        accentText: string
    }
    icon?: React.ReactNode
}

function StatusChip({ active, onClick, label, count, tone, icon }: StatusChipProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all border",
                active
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-border/60 bg-background/40 hover:bg-background hover:border-border text-foreground/70 hover:text-foreground"
            )}
        >
            {icon
                ? icon
                : tone && (
                      <span
                          className={cn(
                              "inline-block size-1.5 rounded-full transition-transform",
                              tone.dot,
                              active && "scale-110"
                          )}
                      />
                  )}
            <span>{label}</span>
            <span
                className={cn(
                    "tabular-nums text-[9px] tracking-normal px-1 rounded-full",
                    active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                )}
            >
                {count}
            </span>
        </button>
    )
}
