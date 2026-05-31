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
            className={cn(
                "group relative flex flex-col gap-4 rounded-2xl border bg-card/30 backdrop-blur-sm p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg overflow-hidden",
                "border-border/50 hover:border-foreground/30"
            )}
        >
            <span
                className={cn(
                    "absolute inset-x-0 top-0 h-[3px] rounded-t-2xl",
                    tone.bg
                )}
                aria-hidden
            />

            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                            #
                        </span>
                        <span className="font-black italic tabular-nums text-2xl tracking-tighter leading-none">
                            {order.id}
                        </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                        {formatRelativeTime(order.created_at)}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <OrderStatusPill status={order.status} short glow={order.status === "prepaid"} />
                    {order.needs_refund && <NeedsRefundBadge />}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {previewImages.length === 0 ? (
                        <div className="size-12 rounded-xl bg-muted grid place-items-center text-muted-foreground/40 ring-2 ring-background">
                            <ImageOff className="size-4" />
                        </div>
                    ) : (
                        previewImages.map((src, i) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                key={i}
                                src={src}
                                alt=""
                                className="size-12 rounded-xl object-cover ring-2 ring-background"
                            />
                        ))
                    )}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="font-black italic text-base tracking-tight truncate">
                        {order.buyer_fullname || "Noma'lum xaridor"}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        <Phone className="size-3" />
                        <span className="truncate">{order.buyer_phone}</span>
                    </div>
                </div>
                <div className="ml-auto text-right shrink-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                        Mahsulot
                    </div>
                    <div className="font-black italic text-base tabular-nums">{itemCount}</div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate italic">{order.address_text}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
                <MoneyCol
                    label="Mahsulot"
                    value={order.items_total}
                    accent="text-foreground"
                />
                <MoneyCol
                    label="To'langan"
                    value={order.paid_amount}
                    accent="text-emerald-500"
                />
                <MoneyCol
                    label="Qoldiq"
                    value={order.remaining_amount}
                    accent={
                        order.remaining_amount && order.remaining_amount > 0
                            ? "text-amber-500"
                            : "text-muted-foreground/50"
                    }
                />
            </div>

            {action && (
                <div
                    className={cn(
                        "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ring-1 transition-all",
                        action.kind === "wait-buyer"
                            ? "bg-muted/40 ring-border/40"
                            : `${tone.softBg} ${tone.ring}`
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <ActionIcon
                            className={cn(
                                "size-3.5 shrink-0",
                                action.kind === "wait-buyer"
                                    ? "text-muted-foreground"
                                    : tone.accentText
                            )}
                        />
                        <span
                            className={cn(
                                "text-[10px] font-black uppercase tracking-widest truncate",
                                action.kind === "wait-buyer"
                                    ? "text-muted-foreground"
                                    : tone.text
                            )}
                        >
                            {action.label}
                        </span>
                    </div>
                    <ArrowUpRight
                        className={cn(
                            "size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                            action.kind === "wait-buyer"
                                ? "text-muted-foreground"
                                : tone.accentText
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
    accent,
}: {
    label: string
    value: number | null | undefined
    accent: string
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                {label}
            </div>
            <div className={cn("font-black italic tabular-nums text-sm leading-none mt-0.5", accent)}>
                {formatUZS(value)}
                <span className="ml-0.5 text-[8px] font-bold opacity-60 tracking-widest">UZS</span>
            </div>
        </div>
    )
}
