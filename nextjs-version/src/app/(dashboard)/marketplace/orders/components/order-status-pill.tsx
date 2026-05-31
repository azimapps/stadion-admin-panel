"use client"

import { cn } from "@/lib/utils"
import { orderStatusTone, type OrderStatus } from "@/services/marketplace-order"

interface OrderStatusPillProps {
    status: OrderStatus
    size?: "sm" | "md" | "lg"
    short?: boolean
    className?: string
    glow?: boolean
}

export function OrderStatusPill({
    status,
    size = "sm",
    short = false,
    className,
    glow = false,
}: OrderStatusPillProps) {
    const tone = orderStatusTone(status)
    const sizeClasses = {
        sm: "px-2.5 py-1 text-[9px] gap-1.5",
        md: "px-3 py-1.5 text-[10px] gap-2",
        lg: "px-4 py-2 text-xs gap-2.5",
    }
    const dotSize = {
        sm: "size-1.5",
        md: "size-2",
        lg: "size-2.5",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full font-black uppercase tracking-[0.15em] ring-1 backdrop-blur-md bg-background/75",
                sizeClasses[size],
                tone.text,
                tone.ring,
                className
            )}
        >
            <span
                className={cn(
                    "inline-block rounded-full",
                    dotSize[size],
                    tone.dot,
                    glow && "shadow-[0_0_0_3px_rgba(255,255,255,0.06)] animate-pulse"
                )}
            />
            {short ? tone.short : tone.label}
        </span>
    )
}

interface NeedsRefundBadgeProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function NeedsRefundBadge({ size = "sm", className }: NeedsRefundBadgeProps) {
    const sizeClasses = {
        sm: "px-2.5 py-1 text-[9px] gap-1.5",
        md: "px-3 py-1.5 text-[10px] gap-2",
        lg: "px-4 py-2 text-xs gap-2.5",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full font-black uppercase tracking-[0.15em] ring-1 ring-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 backdrop-blur-md",
                sizeClasses[size],
                className
            )}
        >
            <span className="inline-block size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pul qaytarish
        </span>
    )
}
