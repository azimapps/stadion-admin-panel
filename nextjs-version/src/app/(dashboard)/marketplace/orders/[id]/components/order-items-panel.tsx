"use client"

import { ImageOff, Package } from "lucide-react"
import { formatUZS, type OrderItem } from "@/services/marketplace-order"

interface OrderItemsPanelProps {
    items: OrderItem[]
    itemsTotal: number
}

export function OrderItemsPanel({ items, itemsTotal }: OrderItemsPanelProps) {
    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <div className="text-sm font-semibold">Mahsulotlar</div>
                    <span className="ml-1 inline-flex items-center justify-center text-[11px] tabular-nums rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
                        {items.length}
                    </span>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Snapshot
                </div>
            </div>

            <ul className="divide-y">
                {items.map((item) => (
                    <li key={item.id} className="px-4 py-3 flex gap-3 items-center">
                        <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0 grid place-items-center">
                            {item.product_image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={item.product_image}
                                    alt={item.product_title}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <ImageOff className="size-5 text-muted-foreground/50" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium leading-snug line-clamp-2">
                                {item.product_title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="inline-flex items-center rounded-md bg-foreground text-background px-1.5 py-0.5 text-[10px] font-semibold">
                                    {item.size_label}
                                </span>
                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                    × {item.quantity}
                                </span>
                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                    · {formatUZS(item.unit_price)} / dona
                                </span>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="text-sm font-semibold tabular-nums">
                                {formatUZS(item.line_total)}
                                <span className="ml-0.5 text-[10px] text-muted-foreground">UZS</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                                Avans: {formatUZS(item.line_prepayment)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="px-4 py-3 flex items-center justify-between border-t bg-muted/30">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Mahsulotlar jami
                </div>
                <div className="text-sm font-semibold tabular-nums">
                    {formatUZS(itemsTotal)}{" "}
                    <span className="text-[10px] text-muted-foreground">UZS</span>
                </div>
            </div>
        </div>
    )
}
