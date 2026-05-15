"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, RefreshCcw } from "lucide-react"

import {
  marketplaceApi,
  type Product,
  type ProductStatus,
} from "@/lib/marketplace-api"

import { MarketplaceHero } from "./components/marketplace-hero"
import { ProductFilters, type ViewMode } from "./components/product-filters"
import { ProductCard } from "./components/product-card"
import { ProductRow } from "./components/product-row"
import { EmptyState } from "./components/empty-state"

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<ProductStatus | "all">("all")
  const [category, setCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await marketplaceApi.listProducts({ limit: 200 })
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load products"
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
    <BaseLayout>
      <div className="flex flex-col gap-6 px-4 lg:px-6">
        <div className="mkt-rise mkt-rise-1">
          {loading && products.length === 0 ? (
            <Skeleton className="h-[300px] w-full rounded-2xl" />
          ) : (
            <MarketplaceHero products={products} />
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              <span className="font-medium">{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                load()
                toast.info("Retrying…")
              }}
            >
              <RefreshCcw className="mr-1.5 size-3.5" />
              Retry
            </Button>
          </div>
        )}

        {!error && (products.length > 0 || loading) && (
          <div className="mkt-rise mkt-rise-2">
            <ProductFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={filtered.length}
              totalCount={products.length}
              onReset={reset}
            />
          </div>
        )}

        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border overflow-hidden">
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
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((p, i) => (
                <ProductRow key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseLayout>
  )
}
