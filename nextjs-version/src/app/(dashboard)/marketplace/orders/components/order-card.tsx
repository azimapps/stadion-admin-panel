"use client"

import Link from "next/link"
import {
    ArrowUpRight,
    Phone,
    MapPin,
    ImageOff,
    Banknote,
    Tag,
    Truck,
    PackageCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    formatRelativeTime,
    formatUZS,
    nextAction,
    orderStatusTone,
    type MarketplaceOrder,
} from "@/services/marketplace-order"
import { OrderStatusPill, NeedsRefundBadge } from "./order-status-pill"

interface OrderCardProps {
    order: MarketplaceOrder
}

export function OrderCard({ order }: OrderCardProps) {
    const tone = orderStatusTone(order.status)
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
    const action = nextAction(order.status)
    const previewImages = order.items
        .map((i) => i.product_image)
        .filter((src): src is string => !!src)
        .slice(0, 3)

    const ActionIcon =
        action?.kind === "set-fee"
            ? Tag
            : action?.kind === "mark-sent"
              ? Truck
              : action?.kind === "mark-delivered"
                ? PackageCheck
                : Banknote

    return (
        <Link
            href={`/marketplace/orders/${order.id}`}
            className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30 hover:border-foreground/20"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground">#</span>
                    <span className="text-lg font-semibold tabular-nums">{order.id}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                        {formatRelativeTime(order.created_at)}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {order.needs_refund && <NeedsRefundBadge />}
                    <OrderStatusPill status={order.status} short glow={order.status === "prepaid"} />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                    {previewImages.length === 0 ? (
                        <div className="size-10 rounded-lg bg-muted grid place-items-center text-muted-foreground/40 ring-2 ring-card">
                            <ImageOff className="size-4" />
                        </div>
                    ) : (
                        previewImages.map((src, i) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                key={i}
                                src={src}
                                alt=""
                                className="size-10 rounded-lg object-cover ring-2 ring-card"
                            />
                        ))
                    )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                        {order.buyer_fullname || "Noma'lum xaridor"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        <Phone className="size-3" />
                        <span className="truncate">{order.buyer_phone}</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Mahsulot
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{itemCount}</div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{order.address_text}</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                <MoneyCol label="Mahsulot" value={order.items_total} />
                <MoneyCol label="To'langan" value={order.paid_amount} accent="text-emerald-600 dark:text-emerald-400" />
                <MoneyCol
                    label="Qoldiq"
                    value={order.remaining_amount}
                    accent={
                        order.remaining_amount && order.remaining_amount > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                    }
                />
            </div>

            {action && (
                <div
                    className={cn(
                        "flex items-center justify-between gap-2 -mx-4 -mb-4 mt-1 px-4 py-2.5 border-t transition-colors",
                        action.kind === "wait-buyer"
                            ? "bg-muted/30"
                            : `${tone.softBg}`
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <ActionIcon
                            className={cn(
                                "size-3.5 shrink-0",
                                action.kind === "wait-buyer" ? "text-muted-foreground" : tone.accentText
                            )}
                        />
                        <span
                            className={cn(
                                "text-xs font-medium truncate",
                                action.kind === "wait-buyer" ? "text-muted-foreground" : tone.text
                            )}
                        >
                            {action.label}
                        </span>
                    </div>
                    <ArrowUpRight
                        className={cn(
                            "size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                            action.kind === "wait-buyer" ? "text-muted-foreground" : tone.accentText
                        )}
                    />
                </div>
            )}
        </Link>
    )
}

function MoneyCol({
    label,
    value,
    accent = "text-foreground",
}: {
    label: string
    value: number | null | undefined
    accent?: string
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className={cn("text-sm font-semibold tabular-nums", accent)}>
                {formatUZS(value)}
                <span className="ml-0.5 text-[9px] text-muted-foreground/70">UZS</span>
            </div>
        </div>
    )
}
