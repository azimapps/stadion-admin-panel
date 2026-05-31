"use client"

import Link from "next/link"
import { Plus, Sparkles, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUZS, type Product } from "@/services/marketplace"

interface MarketplaceHeroProps {
    products: Product[]
}

export function MarketplaceHero({ products }: MarketplaceHeroProps) {
    const active = products.filter((p) => p.status === "active").length
    const hidden = products.filter((p) => p.status === "hidden").length
    const soldOut = products.filter((p) => p.status === "sold_out").length
    const totalStock = products.reduce((sum, p) => sum + p.total_stock, 0)
    const inventoryValue = products.reduce((sum, p) => sum + p.total_stock * p.price, 0)

    const stats = [
        { label: "Faol", value: active, accent: "text-emerald-500" },
        { label: "Yashirin", value: hidden, accent: "text-zinc-500" },
        { label: "Tugagan", value: soldOut, accent: "text-rose-500" },
        { label: "Jami soni", value: totalStock, accent: "text-primary" },
    ]

    return (
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-32 -right-24 size-[420px] rounded-full bg-primary opacity-[0.10] blur-3xl" />
                <div className="absolute -bottom-40 -left-20 size-[380px] rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="relative grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-12">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        <Sparkles className="size-3.5" />
                        Stadion · Do'kon boshqaruvi
                    </div>

                    <h1 className="font-black italic uppercase tracking-tighter text-5xl sm:text-6xl lg:text-7xl leading-[0.88]">
                        Sotuv maydoni —
                        <br />
                        <span className="text-primary">qo'lingizda</span>
                    </h1>

                    <p className="text-sm sm:text-base text-muted-foreground max-w-xl italic">
                        Forma, butsa va aksessuarlar uchun katalog. Rasm yuklang, o'lcham qo'shing, holatni o'zgartiring — har bir o'zgarish darhol xaridorlarga ko'rinadi.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 px-6">
                            <Link href="/marketplace/new">
                                <Plus className="mr-1.5 size-4 stroke-[2.5]" /> Yangi mahsulot
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-xl active:scale-95 px-5 border-foreground/20 hover:border-foreground/40">
                            <Link href="/marketplace/orders">
                                <Receipt className="mr-1.5 size-4 stroke-[2.5]" /> Buyurtmalar
                            </Link>
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-background/60 backdrop-blur px-3 py-1.5">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Do'kon onlayn</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur p-4 flex flex-col gap-2"
                        >
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                {s.label}
                            </div>
                            <div className={`font-black italic tracking-tight text-4xl ${s.accent}`}>{s.value}</div>
                        </div>
                    ))}
                    <div className="col-span-2 rounded-2xl border border-foreground/10 bg-foreground text-background p-4 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                Zaxira qiymati
                            </div>
                            <div className="font-black italic text-2xl mt-1 tabular-nums">
                                {formatUZS(inventoryValue)}{" "}
                                <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">UZS</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">SKU</div>
                            <div className="font-black italic text-2xl mt-1 tabular-nums">{products.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
