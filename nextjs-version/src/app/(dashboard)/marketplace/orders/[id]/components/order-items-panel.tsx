"use client"

import Link from "next/link"
import { ImageOff, Package } from "lucide-react"
import { formatUZS, type OrderItem } from "@/services/marketplace-order"

interface OrderItemsPanelProps {
    items: OrderItem[]
    itemsTotal: number
}

export function OrderItemsPanel({ items, itemsTotal }: OrderItemsPanelProps) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <div className="text-[10px] font-black uppercase tracking-[0.25em]">
                        Mahsulotlar
                    </div>
                    <span className="ml-1 inline-flex items-center justify-center text-[10px] font-black tabular-nums rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground">
                        {items.length}
                    </span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    Snapshot · checkout
                </div>
            </div>

            <ul className="divide-y divide-border/40">
                {items.map((item) => (
                    <li key={item.id} className="px-5 py-4 flex gap-4 items-center">
                        <Link
                            href={`/marketplace/${item.product_id}`}
                            className="size-16 rounded-xl overflow-hidden bg-muted shrink-0 ring-1 ring-border/60 grid place-items-center group"
                        >
                            {item.product_image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={item.product_image}
                                    alt={item.product_title}
                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <ImageOff className="size-5 text-muted-foreground/50" />
                            )}
                        </Link>

                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/marketplace/${item.product_id}`}
                                className="font-black italic uppercase tracking-tight text-sm leading-tight line-clamp-2 hover:text-primary transition-colors"
                            >
                                {item.product_title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="inline-flex items-center rounded-md bg-foreground text-background px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                                    O'lcham · {item.size_label}
                                </span>
                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-foreground/70 tabular-nums">
                                    × {item.quantity}
                                </span>
                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                    {formatUZS(item.unit_price)} / dona
                                </span>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Yig'indi
                            </div>
                            <div className="font-black italic tabular-nums text-base mt-0.5">
                                {formatUZS(item.line_total)}
                                <span className="ml-0.5 text-[9px] opacity-60 tracking-widest">UZS</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                                Avans: {formatUZS(item.line_prepayment)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="px-5 py-3 flex items-center justify-between border-t border-border/40 bg-background/30">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                    Mahsulotlar jami
                </div>
                <div className="font-black italic tabular-nums text-base">
                    {formatUZS(itemsTotal)}{" "}
                    <span className="text-[9px] opacity-60 tracking-widest">UZS</span>
                </div>
            </div>
        </div>
    )
}
