"use client"

import { Link } from "react-router-dom"
import { ImageOff, Heart, Layers, ArrowUpRight } from "lucide-react"
import { formatUZS, statusMeta, type Product } from "@/lib/marketplace-api"
import { cn } from "@/lib/utils"

interface ProductRowProps {
  product: Product
  index?: number
}

export function ProductRow({ product, index = 0 }: ProductRowProps) {
  const cover = product.images?.[0]
  const status = statusMeta(product.status)

  return (
    <Link
      to={`/marketplace/${product.id}`}
      className={cn(
        "group mkt-rise grid grid-cols-[88px_1.6fr_1fr_1fr_1fr_auto] items-center gap-4 rounded-xl border bg-card px-3 py-3 transition-colors hover:border-[color:color-mix(in_oklch,var(--mkt-accent)_40%,var(--border))]",
        index === 0 && "mkt-rise-1",
        index === 1 && "mkt-rise-2",
        index === 2 && "mkt-rise-3",
        index >= 3 && "mkt-rise-4"
      )}
    >
      <div className="relative size-[88px] overflow-hidden rounded-lg bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full mkt-grid-bg grid place-items-center text-muted-foreground">
            <ImageOff className="size-5 opacity-50" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1", status.bg, status.text, status.ring)}>
            <span className={cn("inline-block size-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          {product.category && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.category}
            </span>
          )}
        </div>
        <h3 className="font-semibold truncate group-hover:mkt-accent transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Layers className="size-3" /> {product.sizes.length} sizes
          </span>
          {product.likes_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <Heart className="size-3 fill-rose-500 text-rose-500" /> {product.likes_count}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex flex-col">
        <span className="mkt-eyebrow text-muted-foreground">Price</span>
        <span className="mkt-mono tabular-nums font-semibold">{formatUZS(product.price)}</span>
      </div>

      <div className="hidden md:flex flex-col">
        <span className="mkt-eyebrow text-muted-foreground">Prepayment</span>
        <span className="mkt-mono tabular-nums">{formatUZS(product.prepayment_amount)}</span>
      </div>

      <div className="hidden sm:flex flex-col items-start">
        <span className="mkt-eyebrow text-muted-foreground">Stock</span>
        <span
          className={cn(
            "mkt-mono tabular-nums font-semibold",
            product.total_stock === 0 && "text-rose-500",
            product.total_stock > 0 && product.total_stock <= 5 && "text-amber-500"
          )}
        >
          {product.total_stock}
        </span>
      </div>

      <div className="size-9 rounded-full bg-muted grid place-items-center group-hover:bg-foreground group-hover:text-background transition-colors">
        <ArrowUpRight className="size-4" />
      </div>
    </Link>
  )
}
