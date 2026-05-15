"use client"

import Link from "next/link"
import { Heart, Layers, ArrowUpRight, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatUZS, statusTone, type Product } from "@/services/marketplace"

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const cover = product.images?.[0]
    const tone = statusTone(product.status)
    const lowStock = product.total_stock > 0 && product.total_stock <= 5

    return (
        <Link
            href={`/marketplace/${product.id}`}
            className="group relative flex flex-col rounded-2xl border border-border/50 bg-card/30 overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                {cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={cover}
                        alt={product.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="size-full grid place-items-center text-muted-foreground/40">
                        <ImageOff className="size-10" />
                    </div>
                )}

                <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] ring-1 backdrop-blur-md bg-background/75", tone.text, tone.ring)}>
                        <span className={cn("inline-block size-1.5 rounded-full", tone.dot)} />
                        {tone.label}
                    </span>
                    {product.category && (
                        <span className="hidden sm:inline-flex items-center rounded-full bg-background/75 backdrop-blur-md px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] ring-1 ring-border/60 text-foreground/80">
                            {product.category}
                        </span>
                    )}
                </div>

                {product.likes_count > 0 && (
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/75 backdrop-blur-md px-2 py-1 text-[10px] font-black tabular-nums ring-1 ring-border/60">
                        <Heart className="size-3 fill-rose-500 text-rose-500" />
                        {product.likes_count}
                    </div>
                )}

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    {product.images.length > 1 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background/75 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ring-1 ring-border/60 tabular-nums">
                            {product.images.length} rasm
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/75 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ring-1 ring-border/60 tabular-nums">
                        <Layers className="size-3" />
                        {product.sizes.length}
                    </span>
                </div>

                <div className="absolute right-3 bottom-3 size-9 rounded-full bg-foreground text-background grid place-items-center opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                    <ArrowUpRight className="size-4" />
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="font-black italic uppercase tracking-tighter text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {product.title}
                </h3>

                <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Narxi</div>
                        <div className="font-black italic tabular-nums text-base mt-0.5">
                            {formatUZS(product.price)}
                            <span className="ml-1 text-[9px] font-bold text-muted-foreground/70 tracking-widest uppercase">UZS</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Zaxira</div>
                        <div
                            className={cn(
                                "font-black italic tabular-nums text-base mt-0.5",
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
