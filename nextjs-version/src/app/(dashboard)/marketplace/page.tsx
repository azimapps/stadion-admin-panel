"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { marketplaceService, type Product, type ProductStatus } from "@/services/marketplace"
import { MarketplaceHero } from "./components/marketplace-hero"
import { ProductFilters } from "./components/product-filters"
import { ProductCard } from "./components/product-card"
import { EmptyState } from "./components/empty-state"

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState("")
    const [status, setStatus] = useState<ProductStatus | "all">("all")
    const [category, setCategory] = useState<string>("all")

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await marketplaceService.list({ limit: 200 })
            setProducts(Array.isArray(data) ? data : [])
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Mahsulotlarni yuklashda xatolik"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const categories = useMemo(() => {
        const set = new Set<string>()
        products.forEach((p) => {
            if (p.category) set.add(p.category)
        })
        return Array.from(set).sort()
    }, [products])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return products.filter((p) => {
            if (status !== "all" && p.status !== status) return false
            if (category !== "all" && p.category !== category) return false
            if (q && !p.title.toLowerCase().includes(q)) return false
            return true
        })
    }, [products, search, status, category])

    const isFiltered = search !== "" || status !== "all" || category !== "all"

    const reset = () => {
        setSearch("")
        setStatus("all")
        setCategory("all")
    }

    return (
        <div className="flex flex-col gap-6 py-2 px-4 lg:px-6">
            {loading && products.length === 0 ? (
                <Skeleton className="h-[320px] w-full rounded-3xl" />
            ) : (
                <MarketplaceHero products={products} />
            )}

            {error && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="size-4" />
                        <span className="font-medium">{error}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-xl"
                        onClick={() => {
                            load()
                            toast.info("Qayta urinilmoqda…")
                        }}
                    >
                        <RefreshCcw className="mr-1.5 size-3.5" />
                        Qayta urinish
                    </Button>
                </div>
            )}

            {!error && (products.length > 0 || loading) && (
                <ProductFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    category={category}
                    onCategoryChange={setCategory}
                    categories={categories}
                    resultCount={filtered.length}
                    totalCount={products.length}
                    onReset={reset}
                />
            )}

            <div>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
                                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                                <div className="p-4 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 && !error ? (
                    <EmptyState variant="no-products" />
                ) : filtered.length === 0 ? (
                    <EmptyState variant="no-results" onClear={isFiltered ? reset : undefined} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
