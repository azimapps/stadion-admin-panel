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
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <div className="text-[10px] font-black uppercase tracking-[0.25em]">
                        Buyurtma yo'li
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                    {formatRelativeTime(order.updated_at)}
                </div>
            </div>

            <ol className="relative px-5 py-5">
                <span
                    className="absolute left-[40px] top-7 bottom-7 w-px bg-border/60"
                    aria-hidden
                />
                {steps.map((step, i) => (
                    <li
                        key={step.id}
                        className={cn(
                            "relative grid grid-cols-[40px_1fr_auto] items-start gap-3 pb-5 last:pb-0"
                        )}
                    >
                        <div
                            className={cn(
                                "relative z-10 size-10 rounded-full grid place-items-center ring-4 ring-background transition-colors",
                                step.state === "done"
                                    ? `${step.accent} text-white shadow-md`
                                    : step.state === "active"
                                      ? `${step.accent} text-white shadow-md`
                                      : step.state === "cancelled"
                                        ? "bg-rose-500 text-white"
                                        : "bg-muted text-muted-foreground/60 ring-background"
                            )}
                        >
                            <step.icon className="size-4" />
                            {step.state === "active" && (
                                <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-current" />
                            )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 pt-1">
                            <div
                                className={cn(
                                    "font-black italic uppercase tracking-tight text-sm",
                                    step.state === "pending"
                                        ? "text-muted-foreground/60"
                                        : "text-foreground"
                                )}
                            >
                                {step.label}
                            </div>
                            <div className="text-[10px] font-medium text-muted-foreground/80 italic">
                                {step.sublabel}
                            </div>
                        </div>
                        <div className="text-right pt-1">
                            {step.timestamp ? (
                                <>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 tabular-nums">
                                        {formatRelativeTime(step.timestamp)}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground/60 tabular-nums mt-0.5">
                                        {formatDateTime(step.timestamp)}
                                    </div>
                                </>
                            ) : (
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                    {step.state === "cancelled" ? "—" : "Kutilmoqda"}
                                </div>
                            )}
                        </div>
                        {i < steps.length - 1 && step.state === "done" && (
                            <span
                                className="absolute left-5 top-10 bottom-0 w-px bg-emerald-500/40"
                                aria-hidden
                            />
                        )}
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
            accent: "bg-zinc-700 dark:bg-zinc-300 dark:text-zinc-900",
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
