"use client"

import { Search, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrdersEmptyProps {
    variant?: "no-results" | "no-orders"
    onClear?: () => void
}

export function OrdersEmpty({ variant = "no-orders", onClear }: OrdersEmptyProps) {
    if (variant === "no-results") {
        return (
            <div className="rounded-2xl border border-border/50 bg-card/30 flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
                <div className="size-14 rounded-full bg-background ring-1 ring-border grid place-items-center">
                    <Search className="size-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <div className="font-black italic uppercase tracking-tighter text-3xl">Topilmadi</div>
                    <p className="text-sm text-muted-foreground max-w-sm italic">
                        Filtrlarni o'zgartirib ko'ring yoki qidiruvni tozalang.
                    </p>
                </div>
                {onClear && (
                    <Button variant="outline" onClick={onClear} className="cursor-pointer rounded-xl">
                        Filtrlarni tozalash
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 -right-10 size-80 rounded-full bg-sky-500 opacity-[0.10] blur-3xl" />
                <div className="absolute -bottom-24 -left-10 size-72 rounded-full bg-violet-500/20 blur-3xl" />
            </div>
            <div className="relative flex flex-col items-center justify-center gap-6 px-8 py-24 text-center">
                <div className="size-16 rounded-2xl bg-background ring-1 ring-border grid place-items-center shadow-sm">
                    <Inbox className="size-7 text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Stadion · Buyurtmalar
                    </div>
                    <div className="font-black italic uppercase tracking-tighter text-4xl">
                        Hozircha bo'sh
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                        Birinchi buyurtma kelganda u shu yerda paydo bo'ladi. Mahsulotlarni faollashtiring va xaridorlar
                        bilan ulashing.
                    </p>
                </div>
            </div>
        </div>
    )
}
