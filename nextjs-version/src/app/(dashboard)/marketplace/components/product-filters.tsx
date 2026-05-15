"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { ProductStatus } from "@/services/marketplace"

interface ProductFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    status: ProductStatus | "all"
    onStatusChange: (value: ProductStatus | "all") => void
    category: string
    onCategoryChange: (value: string) => void
    categories: string[]
    resultCount: number
    totalCount: number
    onReset: () => void
}

export function ProductFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    category,
    onCategoryChange,
    categories,
    resultCount,
    totalCount,
    onReset,
}: ProductFiltersProps) {
    const isFiltered = search !== "" || status !== "all" || category !== "all"

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-3 sm:p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                    placeholder="Mahsulot nomi bo'yicha qidiruv..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-10 rounded-xl"
                />
                {search && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
                        aria-label="Tozalash"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select value={status} onValueChange={(v) => onStatusChange(v as ProductStatus | "all")}>
                    <SelectTrigger className="cursor-pointer w-[150px] h-10 rounded-xl">
                        <SelectValue placeholder="Holati" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Barcha holat</SelectItem>
                        <SelectItem value="active">Faol</SelectItem>
                        <SelectItem value="hidden">Yashirin</SelectItem>
                        <SelectItem value="sold_out">Tugagan</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={category} onValueChange={onCategoryChange}>
                    <SelectTrigger className="cursor-pointer w-[170px] h-10 rounded-xl">
                        <SelectValue placeholder="Kategoriya" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Barcha kategoriya</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isFiltered && (
                    <Button variant="ghost" size="sm" onClick={onReset} className="cursor-pointer">
                        <X className="mr-1 size-3.5" />
                        Tozalash
                    </Button>
                )}
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 whitespace-nowrap tabular-nums sm:ml-auto">
                {resultCount} / {totalCount}
            </div>
        </div>
    )
}
