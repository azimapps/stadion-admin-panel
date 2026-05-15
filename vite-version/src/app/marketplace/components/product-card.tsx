"use client"

import { Link } from "react-router-dom"
import { Heart, Layers, ArrowUpRight, ImageOff } from "lucide-react"
import { formatUZS, statusMeta, type Product } from "@/lib/marketplace-api"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const cover = product.images?.[0]
  const status = statusMeta(product.status)
  const lowStock = product.total_stock > 0 && product.total_stock <= 5

  return (
    <Link
      to={`/marketplace/${product.id}`}
      className={cn(
        "mkt-card mkt-rise group flex flex-col",
        index === 0 && "mkt-rise-1",
        index === 1 && "mkt-rise-2",
        index === 2 && "mkt-rise-3",
        index === 3 && "mkt-rise-4",
        index >= 4 && "mkt-rise-5"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="size-full mkt-grid-bg flex items-center justify-center text-muted-foreground">
            <ImageOff className="size-10 opacity-50" />
          </div>
        )}

        {/* Top-left: status pill */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 backdrop-blur-md bg-background/70", status.text, status.ring)}>
            <span className={cn("inline-block size-1.5 rounded-full mkt-pulse-dot", status.dot)} />
            {status.label}
          </span>
          {product.category && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-background/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-border text-foreground/80">
              {product.category}
            </span>
          )}
        </div>

        {/* Top-right: like count */}
        {product.likes_count > 0 && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-md px-2 py-1 text-[11px] font-semibold ring-1 ring-border">
            <Heart className="size-3 fill-rose-500 text-rose-500" />
            <span className="mkt-mono">{product.likes_count}</span>
          </div>
        )}

        {/* Bottom-left: image count + sizes count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {product.images.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-border mkt-mono">
              {product.images.length} shots
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-background/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-border">
            <Layers className="size-3" />
            <span className="mkt-mono">{product.sizes.length}</span>
          </span>
        </div>

        {/* Hover hint */}
        <div className="absolute right-3 bottom-3 size-9 rounded-full bg-foreground text-background grid place-items-center opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <ArrowUpRight className="size-4" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:mkt-accent transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <div className="mkt-eyebrow text-muted-foreground">Price</div>
            <div className="mkt-mono text-base font-semibold tabular-nums">
              {formatUZS(product.price)}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">UZS</span>
            </div>
          </div>
          <div className="text-right">
            <div className="mkt-eyebrow text-muted-foreground">Stock</div>
            <div
              className={cn(
                "mkt-mono text-base font-semibold tabular-nums",
                product.total_stock === 0 && "text-rose-500",
                lowStock && "text-amber-500"
              )}
            >
              {product.total_stock}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
