"use client"

import { Link } from "react-router-dom"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUZS, type Product } from "@/lib/marketplace-api"

interface MarketplaceHeroProps {
  products: Product[]
}

export function MarketplaceHero({ products }: MarketplaceHeroProps) {
  const active = products.filter((p) => p.status === "active").length
  const hidden = products.filter((p) => p.status === "hidden").length
  const soldOut = products.filter((p) => p.status === "sold_out").length
  const totalStock = products.reduce((sum, p) => sum + p.total_stock, 0)
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.total_stock * p.price,
    0
  )

  const stats = [
    { label: "Live", value: active, accent: "text-emerald-500" },
    { label: "Hidden", value: hidden, accent: "text-zinc-500" },
    { label: "Sold out", value: soldOut, accent: "text-rose-500" },
    { label: "Total units", value: totalStock, accent: "mkt-accent" },
  ]

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      {/* background atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 size-[420px] rounded-full bg-[var(--mkt-accent)] opacity-[0.12] blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-[380px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 mkt-grid-bg opacity-[0.35]" />
      </div>

      <div className="relative grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 mkt-eyebrow mkt-accent">
            <Sparkles className="size-3.5" />
            Stadion · Marketplace control room
          </div>

          <h1 className="mkt-display text-5xl sm:text-6xl lg:text-7xl">
            The shop floor,
            <br />
            <span className="mkt-accent">in your hands.</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Curate jerseys, boots and gear. Upload assets, manage sizes, switch status — every change goes live to buyers the instant you hit save.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white shadow-md">
              <Link to="/marketplace/new">
                <Plus className="mr-1.5 size-4" />
                New product
              </Link>
            </Button>
            <div className="hidden sm:flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-3 py-1.5">
              <span className="size-2 rounded-full bg-emerald-500 mkt-pulse-dot" />
              <span className="text-xs font-medium">Storefront online</span>
              <span className="mkt-mono text-xs text-muted-foreground">v1</span>
            </div>
          </div>
        </div>

        {/* stat board */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-background/70 backdrop-blur p-4 flex flex-col gap-2"
            >
              <div className="mkt-eyebrow text-muted-foreground">{s.label}</div>
              <div className={`mkt-display text-4xl ${s.accent}`}>
                {s.value}
              </div>
            </div>
          ))}
          <div className="col-span-2 rounded-xl border bg-foreground text-background p-4 flex items-center justify-between">
            <div>
              <div className="mkt-eyebrow opacity-70">Inventory value</div>
              <div className="mkt-mono text-2xl font-semibold mt-1 tabular-nums">
                {formatUZS(inventoryValue)} <span className="text-xs opacity-70">UZS</span>
              </div>
            </div>
            <div className="text-right">
              <div className="mkt-eyebrow opacity-70">SKUs</div>
              <div className="mkt-mono text-2xl font-semibold mt-1 tabular-nums">
                {products.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
