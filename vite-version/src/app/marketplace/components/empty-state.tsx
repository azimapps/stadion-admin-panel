"use client"

import { Link } from "react-router-dom"
import { Plus, Search, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  variant?: "no-results" | "no-products"
  onClear?: () => void
}

export function EmptyState({ variant = "no-products", onClear }: EmptyStateProps) {
  if (variant === "no-results") {
    return (
      <div className="mkt-card flex flex-col items-center justify-center gap-4 px-8 py-20 text-center mkt-grid-bg">
        <div className="size-14 rounded-full bg-background ring-1 ring-border grid place-items-center">
          <Search className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <div className="mkt-display text-3xl">No matches</div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting the search term, status or category filters to find what you’re looking for.
          </p>
        </div>
        {onClear && (
          <Button variant="outline" onClick={onClear} className="cursor-pointer">
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mkt-card relative overflow-hidden">
      <div className="absolute inset-0 mkt-grid-bg opacity-60 pointer-events-none" />
      <div className="relative flex flex-col items-center justify-center gap-5 px-8 py-24 text-center">
        <div className="relative">
          <div className="size-16 rounded-2xl bg-background ring-1 ring-border grid place-items-center shadow-sm">
            <PackageOpen className="size-7 mkt-accent" />
          </div>
          <span className="absolute -right-2 -top-2 inline-flex items-center justify-center size-6 rounded-full bg-[var(--mkt-accent)] text-white shadow-md">
            <Plus className="size-3.5" />
          </span>
        </div>
        <div className="space-y-2 max-w-md">
          <div className="mkt-eyebrow mkt-accent">Stadion · Marketplace</div>
          <div className="mkt-display text-4xl">Stock the shelves</div>
          <p className="text-sm text-muted-foreground">
            You haven’t listed any products yet. Add your first jersey, boot, or accessory — buyers will see it instantly on the live store.
          </p>
        </div>
        <Button asChild className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white">
          <Link to="/marketplace/new">
            <Plus className="mr-1.5 size-4" /> Add first product
          </Link>
        </Button>
      </div>
    </div>
  )
}
