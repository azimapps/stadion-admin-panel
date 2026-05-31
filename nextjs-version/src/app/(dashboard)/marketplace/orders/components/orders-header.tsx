"use client"

import { cn } from "@/lib/utils"
import { formatUZS, type MarketplaceOrder } from "@/services/marketplace-order"

interface OrdersHeaderProps {
    orders: MarketplaceOrder[]
}

export function OrdersHeader({ orders }: OrdersHeaderProps) {
    const prepaid = orders.filter((o) => o.status === "prepaid").length
    const confirmed = orders.filter((o) => o.status === "confirmed").length
    const inTransit = orders.filter((o) => o.status === "delivery_sent").length
    const delivered = orders.filter((o) => o.status === "delivery_completed").length
    const refundQueue = orders.filter((o) => o.needs_refund).length

    const todayKey = new Date().toISOString().slice(0, 10)
    const todayRevenue = orders
        .filter(
            (o) => o.status === "delivery_completed" && (o.delivery_completed_at ?? "").startsWith(todayKey)
        )
        .reduce((sum, o) => sum + (o.total_price ?? 0), 0)

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Buyurtmalar</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Yetkazib berishni boshqaring, pul qaytarish navbatini kuzating.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2">
                    <span className="text-xs text-muted-foreground">Bugungi tushum</span>
                    <span className="text-sm font-semibold tabular-nums">
                        {formatUZS(todayRevenue)} <span className="text-[10px] text-muted-foreground">UZS</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px rounded-xl border bg-border overflow-hidden">
                <Stat label="Narx kutmoqda" value={prepaid} dot="bg-sky-500" emphasize={prepaid > 0} />
                <Stat label="Tasdiqlangan" value={confirmed} dot="bg-violet-500" />
                <Stat label="Yo'lda" value={inTransit} dot="bg-orange-500" emphasize={inTransit > 0} />
                <Stat label="Yetkazildi" value={delivered} dot="bg-emerald-500" />
                <Stat
                    label="Pul qaytarish"
                    value={refundQueue}
                    dot="bg-amber-500"
                    emphasize={refundQueue > 0}
                />
            </div>
        </div>
    )
}

interface StatProps {
    label: string
    value: number
    dot: string
    emphasize?: boolean
}

function Stat({ label, value, dot, emphasize }: StatProps) {
    return (
        <div className="bg-card px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
                <span className={cn("inline-block size-1.5 rounded-full", dot)} />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <div
                className={cn(
                    "text-2xl font-semibold tabular-nums",
                    emphasize ? "text-foreground" : "text-foreground/80"
                )}
            >
                {value}
            </div>
        </div>
    )
}
