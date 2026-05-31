"use client"

import { ArrowDownRight, ArrowUpRight, Banknote, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatUZS, type MarketplaceOrder } from "@/services/marketplace-order"

interface OrderMoneyPanelProps {
    order: MarketplaceOrder
}

export function OrderMoneyPanel({ order }: OrderMoneyPanelProps) {
    const hasFee = order.delivery_fee !== null
    const hasTotal = order.total_price !== null

    return (
        <div className="rounded-2xl border border-foreground/10 bg-foreground text-background overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-background/10">
                <div className="flex items-center gap-2">
                    <Wallet className="size-4 opacity-80" />
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] opacity-90">
                        Hisob-kitob
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 tabular-nums">
                    UZS
                </div>
            </div>

            <div className="px-5 py-5 grid grid-cols-2 gap-y-3 gap-x-4">
                <Row label="Mahsulotlar jami" value={order.items_total} muted />
                <Row label="Oldindan to'lov" value={order.prepayment_total} muted />
                <Row
                    label="Yetkazish narxi"
                    value={order.delivery_fee}
                    placeholder={!hasFee ? "Belgilanmagan" : undefined}
                    muted
                />
                <Row
                    label="Jami narx"
                    value={order.total_price}
                    placeholder={!hasTotal ? "—" : undefined}
                    muted
                />
            </div>

            <div className="grid grid-cols-2 gap-px bg-background/10">
                <div className="bg-foreground px-5 py-4 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <ArrowDownRight className="size-3 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                            To'langan
                        </span>
                    </div>
                    <div className="font-black italic tabular-nums text-2xl text-emerald-400 leading-none mt-0.5">
                        {formatUZS(order.paid_amount)}
                    </div>
                </div>
                <div className="bg-foreground px-5 py-4 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <ArrowUpRight
                            className={cn(
                                "size-3",
                                order.remaining_amount && order.remaining_amount > 0
                                    ? "text-amber-400"
                                    : "text-background/40"
                            )}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                            Qoldiq
                        </span>
                    </div>
                    <div
                        className={cn(
                            "font-black italic tabular-nums text-2xl leading-none mt-0.5",
                            order.remaining_amount && order.remaining_amount > 0
                                ? "text-amber-400"
                                : "text-background/40"
                        )}
                    >
                        {formatUZS(order.remaining_amount)}
                    </div>
                </div>
            </div>

            {order.status === "delivery_sent" && order.remaining_amount && order.remaining_amount > 0 ? (
                <div className="px-5 py-3 bg-background/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <Banknote className="size-3.5 text-amber-300" />
                    Kuryer naqd qabul qilishi kerak: {formatUZS(order.remaining_amount)} UZS
                </div>
            ) : null}
        </div>
    )
}

function Row({
    label,
    value,
    muted,
    placeholder,
}: {
    label: string
    value: number | null | undefined
    muted?: boolean
    placeholder?: string
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className={cn("text-[10px] font-black uppercase tracking-widest", muted ? "opacity-60" : "opacity-90")}>
                {label}
            </div>
            <div className="font-black italic tabular-nums text-base">
                {placeholder ? (
                    <span className="text-background/50 italic font-medium normal-case tracking-normal">
                        {placeholder}
                    </span>
                ) : (
                    formatUZS(value)
                )}
            </div>
        </div>
    )
}
