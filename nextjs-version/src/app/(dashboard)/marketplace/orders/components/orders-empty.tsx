"use client"

import { Search, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrdersEmptyProps {
    variant?: "no-results" | "no-orders"
    onClear?: () => void
}

export function OrdersEmpty({ variant = "no-orders", onClear }: OrdersEmptyProps) {
    const Icon = variant === "no-results" ? Search : Inbox
    const title = variant === "no-results" ? "Topilmadi" : "Hozircha bo'sh"
    const description =
        variant === "no-results"
            ? "Filtrlarni o'zgartirib ko'ring yoki qidiruvni tozalang."
            : "Birinchi buyurtma kelganda u shu yerda paydo bo'ladi."

    return (
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
            <div className="size-10 rounded-full bg-muted grid place-items-center">
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
                <div className="text-base font-semibold">{title}</div>
                <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
            </div>
            {variant === "no-results" && onClear && (
                <Button variant="outline" size="sm" onClick={onClear} className="cursor-pointer rounded-lg mt-1">
                    Filtrlarni tozalash
                </Button>
            )}
        </div>
    )
}
