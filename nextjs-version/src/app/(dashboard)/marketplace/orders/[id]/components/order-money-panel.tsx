"use client"

import { Banknote, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatUZS, type MarketplaceOrder } from "@/services/marketplace-order"

interface OrderMoneyPanelProps {
    order: MarketplaceOrder
}

export function OrderMoneyPanel({ order }: OrderMoneyPanelProps) {
    const hasFee = order.delivery_fee !== null
    const hasTotal = order.total_price !== null
    const hasRemaining = order.remaining_amount !== null && order.remaining_amount > 0
    const courierMustCollect = order.status === "delivery_sent" && hasRemaining

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Wallet className="size-4 text-muted-foreground" />
                    <div className="text-sm font-semibold">Hisob-kitob</div>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">UZS</div>
            </div>

            <div className="divide-y">
                <Row label="Mahsulotlar jami" value={order.items_total} />
                <Row label="Oldindan to'lov" value={order.prepayment_total} />
                <Row
                    label="Yetkazish narxi"
                    value={order.delivery_fee}
                    placeholder={!hasFee ? "Belgilanmagan" : undefined}
                />
                <Row
                    label="Jami narx"
                    value={order.total_price}
                    placeholder={!hasTotal ? "—" : undefined}
                    bold
                />
            </div>

            <div className="grid grid-cols-2 divide-x border-t bg-muted/20">
                <div className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        To'langan
                    </span>
                    <span className="text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatUZS(order.paid_amount)}
                    </span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Qoldiq
                    </span>
                    <span
                        className={cn(
                            "text-base font-semibold tabular-nums",
                            hasRemaining ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                        )}
                    >
                        {formatUZS(order.remaining_amount)}
                    </span>
                </div>
            </div>

            {courierMustCollect && (
                <div className="px-4 py-2.5 border-t flex items-center gap-2 bg-amber-500/5">
                    <Banknote className="size-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-amber-700 dark:text-amber-300">
                        Kuryer naqd qabul qiladi:{" "}
                        <span className="font-semibold tabular-nums">
                            {formatUZS(order.remaining_amount)} UZS
                        </span>
                    </span>
                </div>
            )}
        </div>
    )
}

function Row({
    label,
    value,
    placeholder,
    bold,
}: {
    label: string
    value: number | null | undefined
    placeholder?: string
    bold?: boolean
}) {
    return (
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{label}</span>
            {placeholder ? (
                <span className="text-xs text-muted-foreground italic">{placeholder}</span>
            ) : (
                <span className={cn("tabular-nums text-sm", bold ? "font-semibold" : "font-medium")}>
                    {formatUZS(value)}
                </span>
            )}
        </div>
    )
}
