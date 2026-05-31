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
    RefreshCcw,
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
            <div className="flex flex-col gap-4 py-2 px-4 lg:px-6">
                <Skeleton className="h-[80px] w-full rounded-xl" />
                <Skeleton className="h-[80px] w-full rounded-xl" />
                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col gap-4 py-2 px-4 lg:px-6">
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-destructive">
                        <AlertTriangle className="size-5" />
                        <div>
                            <div className="font-semibold">{error}</div>
                            <div className="text-xs opacity-80">Buyurtma topilmagan yoki tarmoq xatosi.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="cursor-pointer rounded-lg">
                            <Link href="/marketplace/orders">Ro'yxatga qaytish</Link>
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                load()
                                toast.info("Qayta urinilmoqda…")
                            }}
                            className="cursor-pointer rounded-lg"
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

    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <div className="flex flex-col gap-4 py-2 px-4 lg:px-6">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link
                    href="/marketplace/orders"
                    className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                    <ArrowLeft className="size-3" />
                    Buyurtmalar
                </Link>
                <ChevronRight className="size-3" />
                <span className="text-foreground tabular-nums">#{order.id}</span>
            </nav>

            <div className="rounded-xl border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">Buyurtma</span>
                        <span className="text-2xl font-semibold tabular-nums">#{order.id}</span>
                    </div>
                    <button
                        onClick={copyOrderId}
                        className="cursor-pointer inline-flex items-center justify-center size-7 rounded-md bg-muted hover:bg-accent transition-colors"
                        aria-label="Buyurtma raqamini nusxalash"
                    >
                        <Copy className="size-3.5 text-muted-foreground" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusPill
                        status={order.status}
                        size="md"
                        glow={order.status === "prepaid" || order.status === "delivery_sent"}
                    />
                    {order.needs_refund && <NeedsRefundBadge size="md" />}
                </div>

                <div className="hidden md:block w-px h-8 bg-border" />

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>
                        <div className="uppercase tracking-wider text-[10px]">Yaratilgan</div>
                        <div className="text-foreground tabular-nums mt-0.5">
                            {formatDateTime(order.created_at)} · {formatRelativeTime(order.created_at)}
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="uppercase tracking-wider text-[10px]">Tovar</div>
                        <div className="text-foreground tabular-nums mt-0.5">
                            {order.items.length} ta · {itemCount} dona
                        </div>
                    </div>
                </div>
            </div>

            {order.payment_deadline && order.status === "awaiting_prepayment" && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-amber-700 dark:text-amber-400 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider">To'lov muddati</span>
                    <span className="text-sm font-semibold tabular-nums">
                        {formatDateTime(order.payment_deadline)}
                    </span>
                </div>
            )}

            <OrderActionBar order={order} onUpdated={setOrder} />

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="flex flex-col gap-4 min-w-0">
                    <OrderItemsPanel items={order.items} itemsTotal={order.items_total} />
                    <NotesEditor value={order.admin_notes} onSave={handleSaveNotes} />
                </div>

                <div className="flex flex-col gap-4 min-w-0">
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
