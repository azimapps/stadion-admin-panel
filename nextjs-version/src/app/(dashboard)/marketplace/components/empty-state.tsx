"use client"

import Link from "next/link"
import { Plus, Search, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    variant?: "no-results" | "no-products"
    onClear?: () => void
}

export function EmptyState({ variant = "no-products", onClear }: EmptyStateProps) {
    if (variant === "no-results") {
        return (
            <div className="rounded-2xl border border-border/50 bg-card/30 flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
                <div className="size-14 rounded-full bg-background ring-1 ring-border grid place-items-center">
                    <Search className="size-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <div className="font-black italic uppercase tracking-tighter text-3xl">Topilmadi</div>
                    <p className="text-sm text-muted-foreground max-w-sm italic">
                        Qidiruv, holat yoki kategoriya filtrlarini o'zgartirib ko'ring.
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
                <div className="absolute -top-20 -right-10 size-80 rounded-full bg-primary opacity-[0.08] blur-3xl" />
                <div className="absolute -bottom-24 -left-10 size-72 rounded-full bg-emerald-500/15 blur-3xl" />
            </div>
            <div className="relative flex flex-col items-center justify-center gap-6 px-8 py-24 text-center">
                <div className="relative">
                    <div className="size-16 rounded-2xl bg-background ring-1 ring-border grid place-items-center shadow-sm">
                        <PackageOpen className="size-7 text-primary" />
                    </div>
                    <span className="absolute -right-2 -top-2 inline-flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground shadow-md">
                        <Plus className="size-3.5" />
                    </span>
                </div>
                <div className="space-y-2 max-w-md">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Stadion · Do'kon</div>
                    <div className="font-black italic uppercase tracking-tighter text-4xl">Javonlarni to'ldiring</div>
                    <p className="text-sm text-muted-foreground italic">
                        Hozircha bironta mahsulot yo'q. Birinchi forma, butsa yoki aksessuarni qo'shing — xaridorlar darhol ko'radi.
                    </p>
                </div>
                <Button asChild className="cursor-pointer rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 px-6">
                    <Link href="/marketplace/new">
                        <Plus className="mr-1.5 size-4 stroke-[2.5]" /> Birinchi mahsulot
                    </Link>
                </Button>
            </div>
        </div>
    )
}
