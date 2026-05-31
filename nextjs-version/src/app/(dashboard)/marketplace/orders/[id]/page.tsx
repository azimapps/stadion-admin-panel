"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
    AlertTriangle,
    ArrowLeft,
    ChevronRight,
    Copy,
    Hash,
    RefreshCcw,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    formatDateTime,
    formatRelativeTime,
    marketplaceOrderService,
    type MarketplaceOrder,
} from "@/services/marketplace-order"

import { OrderStatusPill, NeedsRefundBadge } from "../components/order-status-pill"
import { OrderActionBar } from "./components/order-action-bar"
import { OrderTimeline } from "./components/order-timeline"
import { OrderMoneyPanel } from "./components/order-money-panel"
import { OrderItemsPanel } from "./components/order-items-panel"
import { BuyerPanel } from "./components/buyer-panel"
import { NotesEditor } from "./components/notes-editor"

export default function MarketplaceOrderDetailPage() {
    const params = useParams<{ id: string }>()
    const orderId = params?.id

    const [order, setOrder] = useState<MarketplaceOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = async () => {
        if (!orderId) return
        setLoading(true)
        setError(null)
        try {
            const data = await marketplaceOrderService.getById(orderId)
            setOrder(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Buyurtmani yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId])

    const handleSaveNotes = async (next: string | null) => {
        if (!order) return
        const updated = await marketplaceOrderService.updateNotes(order.id, next)
        setOrder(updated)
        toast.success(next === null ? "Eslatma tozalandi" : "Eslatma saqlandi")
    }

    const copyOrderId = async () => {
        if (!order) return
        try {
            await navigator.clipboard.writeText(`#${order.id}`)
            toast.success("Buyurtma raqami nusxalandi")
        } catch {
            toast.error("Nusxalashda xatolik")
        }
    }

    if (loading && !order) {
        return (
            <div className="flex flex-col gap-6 py-2 px-4 lg:px-6">
                <Skeleton className="h-[200px] w-full rounded-3xl" />
                <Skeleton className="h-[100px] w-full rounded-2xl" />
                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4 py-2 px-4 lg:px-6">
                <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertTriangle className="size-5" />
                        <div>
                            <div className="font-bold">{error}</div>
                            <div className="text-xs opacity-80">Buyurtma topilmagan yoki tarmoq xatosi.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild className="cursor-pointer rounded-xl">
                            <Link href="/marketplace/orders">Ro'yxatga qaytish</Link>
                        </Button>
                        <Button
                            onClick={() => {
                                load()
                                toast.info("Qayta urinilmoqda…")
                            }}
                            className="cursor-pointer rounded-xl"
                        >
                            <RefreshCcw className="mr-1.5 size-3.5" />
                            Qayta urinish
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!order) return null

    return (
        <div className="flex flex-col gap-6 py-2 px-4 lg:px-6">
            <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                <Link
                    href="/marketplace"
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                    <ArrowLeft className="size-3" />
                    Do'kon
                </Link>
                <ChevronRight className="size-3" />
                <Link href="/marketplace/orders" className="hover:text-foreground transition-colors">
                    Buyurtmalar
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground tabular-nums">#{order.id}</span>
            </nav>

            <header className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 -right-16 size-[420px] rounded-full bg-primary opacity-[0.10] blur-3xl" />
                    <div className="absolute -bottom-32 -left-12 size-[320px] rounded-full bg-violet-500/15 blur-3xl" />
                </div>

                <div className="relative grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Sparkles className="size-3.5" />
                            Buyurtma · Lifecycle paneli
                        </div>

                        <div className="flex items-start gap-4">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <Hash className="size-6 text-muted-foreground/50 self-end mb-1.5" />
                                    <h1 className="font-black italic tracking-tighter text-6xl sm:text-7xl tabular-nums leading-none">
                                        {order.id}
                                    </h1>
                                </div>
                                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                                    {formatDateTime(order.created_at)} ·{" "}
                                    <span className="text-foreground">{formatRelativeTime(order.created_at)}</span>
                                </div>
                            </div>
                            <button
                                onClick={copyOrderId}
                                className="cursor-pointer mt-1 inline-flex items-center justify-center size-9 rounded-xl bg-background/70 ring-1 ring-border hover:bg-background transition-colors"
                                aria-label="Buyurtma raqamini nusxalash"
                            >
                                <Copy className="size-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <OrderStatusPill status={order.status} size="md" glow={order.status === "prepaid" || order.status === "delivery_sent"} />
                            {order.needs_refund && <NeedsRefundBadge size="md" />}
                            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-border/60 bg-background/40 text-muted-foreground tabular-nums">
                                {order.items.length} ta tovar · {order.items.reduce((sum, i) => sum + i.quantity, 0)} dona
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="rounded-2xl border border-border/60 bg-background/70 backdrop-blur p-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Xaridor
                            </div>
                            <div className="font-black italic uppercase tracking-tight text-xl mt-1 truncate">
                                {order.buyer_fullname || "Noma'lum"}
                            </div>
                            <div className="text-sm text-muted-foreground tabular-nums mt-0.5">{order.buyer_phone}</div>
                        </div>
                        {order.payment_deadline && order.status === "awaiting_prepayment" && (
                            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-300">
                                <div className="text-[10px] font-black uppercase tracking-widest">
                                    To'lov muddati
                                </div>
                                <div className="font-black italic text-sm tabular-nums mt-0.5">
                                    {formatDateTime(order.payment_deadline)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <OrderActionBar order={order} onUpdated={setOrder} />

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                <div className="flex flex-col gap-6 min-w-0">
                    <OrderItemsPanel items={order.items} itemsTotal={order.items_total} />
                    <NotesEditor value={order.admin_notes} onSave={handleSaveNotes} />
                </div>

                <div className="flex flex-col gap-6 min-w-0">
                    <OrderMoneyPanel order={order} />
                    <BuyerPanel
                        fullname={order.buyer_fullname}
                        phone={order.buyer_phone}
                        addressText={order.address_text}
                        addressLat={order.address_lat}
                        addressLng={order.address_lng}
                        userId={order.user_id}
                    />
                    <OrderTimeline order={order} />
                </div>
            </div>
        </div>
    )
}
