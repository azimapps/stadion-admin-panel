"use client"

import { Check, Clock, X, Truck, PackageCheck, Banknote, Hourglass } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    formatDateTime,
    formatRelativeTime,
    type MarketplaceOrder,
    type OrderStatus,
} from "@/services/marketplace-order"

interface OrderTimelineProps {
    order: MarketplaceOrder
}

type Step = {
    id: string
    label: string
    sublabel: string
    timestamp: string | null
    state: "done" | "active" | "pending" | "cancelled"
    icon: React.ComponentType<{ className?: string }>
    accent: string
}

export function OrderTimeline({ order }: OrderTimelineProps) {
    const steps = buildSteps(order)

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <div className="text-sm font-semibold">Buyurtma yo'li</div>
                </div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {formatRelativeTime(order.updated_at)}
                </div>
            </div>

            <ol className="relative p-4 space-y-3">
                <span
                    className="absolute left-[28px] top-7 bottom-7 w-px bg-border"
                    aria-hidden
                />
                {steps.map((step) => (
                    <li
                        key={step.id}
                        className="relative grid grid-cols-[24px_1fr_auto] items-start gap-3"
                    >
                        <div
                            className={cn(
                                "relative z-10 size-6 rounded-full grid place-items-center ring-4 ring-card transition-colors",
                                step.state === "done"
                                    ? `${step.accent} text-white`
                                    : step.state === "active"
                                      ? `${step.accent} text-white`
                                      : step.state === "cancelled"
                                        ? "bg-rose-500 text-white"
                                        : "bg-muted text-muted-foreground"
                            )}
                        >
                            <step.icon className="size-3" />
                            {step.state === "active" && (
                                <span
                                    className={cn(
                                        "absolute inset-0 rounded-full animate-ping opacity-40",
                                        step.accent
                                    )}
                                />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <div
                                className={cn(
                                    "text-sm font-medium leading-tight",
                                    step.state === "pending"
                                        ? "text-muted-foreground"
                                        : "text-foreground"
                                )}
                            >
                                {step.label}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{step.sublabel}</div>
                        </div>
                        <div className="text-right">
                            {step.timestamp ? (
                                <>
                                    <div className="text-[11px] text-foreground tabular-nums">
                                        {formatRelativeTime(step.timestamp)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                                        {formatDateTime(step.timestamp)}
                                    </div>
                                </>
                            ) : (
                                <div className="text-[11px] text-muted-foreground">
                                    {step.state === "cancelled" ? "—" : "Kutilmoqda"}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    )
}

function buildSteps(order: MarketplaceOrder): Step[] {
    const cancelled = order.status === "cancelled"
    const reached = (status: OrderStatus): boolean => {
        const ladder: OrderStatus[] = [
            "awaiting_prepayment",
            "prepaid",
            "confirmed",
            "delivery_sent",
            "delivery_completed",
        ]
        return ladder.indexOf(order.status) >= ladder.indexOf(status)
    }

    const stateFor = (status: OrderStatus, timestamp: string | null): Step["state"] => {
        if (cancelled && !timestamp) return "cancelled"
        if (timestamp) return "done"
        if (order.status === status) return "active"
        if (reached(status)) return "done"
        return "pending"
    }

    const steps: Step[] = [
        {
            id: "created",
            label: "Yaratildi",
            sublabel: "Buyurtma tizimga tushdi",
            timestamp: order.created_at,
            state: "done",
            icon: Hourglass,
            accent: "bg-zinc-600 dark:bg-zinc-400",
        },
        {
            id: "prepaid",
            label: "Oldindan to'lov",
            sublabel: "Payme / Click orqali tasdiqlandi",
            timestamp: order.prepaid_at,
            state: stateFor("prepaid", order.prepaid_at),
            icon: Banknote,
            accent: "bg-sky-500",
        },
        {
            id: "confirmed",
            label: "Admin tasdiqladi",
            sublabel: "Yetkazib berish narxi belgilandi",
            timestamp: order.confirmed_at,
            state: stateFor("confirmed", order.confirmed_at),
            icon: Check,
            accent: "bg-violet-500",
        },
        {
            id: "sent",
            label: "Yo'lga chiqdi",
            sublabel: "Kuryer mahsulotni oldi",
            timestamp: order.delivery_sent_at,
            state: stateFor("delivery_sent", order.delivery_sent_at),
            icon: Truck,
            accent: "bg-orange-500",
        },
        {
            id: "delivered",
            label: "Yetkazildi",
            sublabel: "Naqd to'lov qabul qilindi",
            timestamp: order.delivery_completed_at,
            state: stateFor("delivery_completed", order.delivery_completed_at),
            icon: PackageCheck,
            accent: "bg-emerald-500",
        },
    ]

    if (cancelled) {
        steps.push({
            id: "cancelled",
            label: "Bekor qilindi",
            sublabel: order.needs_refund ? "Pul qaytarish zarur" : "Bekor qilingan",
            timestamp: order.cancelled_at,
            state: "cancelled",
            icon: X,
            accent: "bg-rose-500",
        })
    }

    return steps
}
