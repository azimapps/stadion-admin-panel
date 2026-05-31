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
        sm: "px-2 py-0.5 text-[10px] gap-1.5",
        md: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-2",
    }
    const dotSize = {
        sm: "size-1.5",
        md: "size-2",
        lg: "size-2.5",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md font-medium border bg-card",
                sizeClasses[size],
                tone.text,
                className
            )}
        >
            <span
                className={cn(
                    "inline-block rounded-full",
                    dotSize[size],
                    tone.dot,
                    glow && "animate-pulse"
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
        sm: "px-2 py-0.5 text-[10px] gap-1.5",
        md: "px-2.5 py-1 text-xs gap-1.5",
        lg: "px-3 py-1.5 text-sm gap-2",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md font-medium border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                sizeClasses[size],
                className
            )}
        >
            <span className="inline-block size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pul qaytarish
        </span>
    )
}
