"use client"

import { Inbox, Truck, BadgeAlert, Sparkles } from "lucide-react"
import { formatUZS, type MarketplaceOrder } from "@/services/marketplace-order"

interface OrdersHeroProps {
    orders: MarketplaceOrder[]
}

export function OrdersHero({ orders }: OrdersHeroProps) {
    const prepaid = orders.filter((o) => o.status === "prepaid").length
    const inTransit = orders.filter((o) => o.status === "delivery_sent").length
    const refundQueue = orders.filter((o) => o.needs_refund).length

    const today = new Date()
    const todayKey = today.toISOString().slice(0, 10)
    const todayRevenue = orders
        .filter((o) => o.status === "delivery_completed" && (o.delivery_completed_at ?? "").startsWith(todayKey))
        .reduce((sum, o) => sum + (o.total_price ?? 0), 0)

    const allPaidAmount = orders.reduce((sum, o) => sum + (o.paid_amount ?? 0), 0)

    return (
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -right-24 size-[420px] rounded-full bg-sky-500 opacity-[0.12] blur-3xl" />
                <div className="absolute -bottom-40 -left-20 size-[380px] rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="relative grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-12">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <Sparkles className="size-3.5" />
                        Stadion · Buyurtmalar markazi
                    </div>

                    <h1 className="font-black italic uppercase tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.86]">
                        Har bir
                        <br />
                        buyurtma —
                        <br />
                        <span className="text-primary">o'z izida</span>
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground max-w-xl italic">
                        Yetkazib berish narxini belgilang, kuryerni jo'nating, naqd to'lovni qabul qilishni belgilang. Bekor qilishlar va pul qaytarishlar bitta panelda.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sky-600 dark:text-sky-400">
                            <Inbox className="size-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">
                                {prepaid} narx kutmoqda
                            </span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-orange-600 dark:text-orange-400">
                            <Truck className="size-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">
                                {inTransit} yo'lda
                            </span>
                        </div>
                        {refundQueue > 0 && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-amber-600 dark:text-amber-300">
                                <BadgeAlert className="size-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">
                                    {refundQueue} pul qaytarish
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur p-4 flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Yangi</div>
                        <div className="font-black italic tracking-tight text-4xl text-sky-500">{prepaid}</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur p-4 flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Yo'lda</div>
                        <div className="font-black italic tracking-tight text-4xl text-orange-500">{inTransit}</div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur p-4 flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Pul qaytarish</div>
                        <div className={`font-black italic tracking-tight text-4xl ${refundQueue > 0 ? "text-amber-500" : "text-muted-foreground/40"}`}>
                            {refundQueue}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur p-4 flex flex-col gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Jami</div>
                        <div className="font-black italic tracking-tight text-4xl text-foreground">{orders.length}</div>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-foreground/10 bg-foreground text-background p-4 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                Bugungi tushum
                            </div>
                            <div className="font-black italic text-2xl mt-1 tabular-nums">
                                {formatUZS(todayRevenue)}{" "}
                                <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">UZS</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Yig'ilgan jami</div>
                            <div className="font-black italic text-2xl mt-1 tabular-nums">
                                {formatUZS(allPaidAmount)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
