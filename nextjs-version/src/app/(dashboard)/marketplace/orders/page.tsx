"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import {
    marketplaceOrderService,
    type MarketplaceOrder,
    type OrderStatus,
} from "@/services/marketplace-order"
import { OrdersHeader } from "./components/orders-header"
import { OrdersFilters, type StatusFilter } from "./components/orders-filters"
import { OrderCard } from "./components/order-card"
import { OrdersEmpty } from "./components/orders-empty"

export default function MarketplaceOrdersPage() {
    const [orders, setOrders] = useState<MarketplaceOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await marketplaceOrderService.list({ limit: 200 })
            setOrders(Array.isArray(data) ? data : [])
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Buyurtmalarni yuklashda xatolik"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const counts = useMemo(() => {
        const result: Record<StatusFilter, number> = {
            all: orders.length,
            awaiting_prepayment: 0,
            prepaid: 0,
            confirmed: 0,
            delivery_sent: 0,
            delivery_completed: 0,
            cancelled: 0,
            needs_refund: 0,
        }
        for (const o of orders) {
            result[o.status as OrderStatus] = (result[o.status as OrderStatus] ?? 0) + 1
            if (o.needs_refund) result.needs_refund += 1
        }
        return result
    }, [orders])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return orders.filter((o) => {
            if (statusFilter === "needs_refund") {
                if (!o.needs_refund) return false
            } else if (statusFilter !== "all") {
                if (o.status !== statusFilter) return false
            }
            if (q) {
                const haystack = [
                    String(o.id),
                    o.buyer_phone,
                    o.buyer_fullname,
                    o.address_text,
                ]
                    .join(" ")
                    .toLowerCase()
                if (!haystack.includes(q)) return false
            }
            return true
        })
    }, [orders, search, statusFilter])

    const isFiltered = search !== "" || statusFilter !== "all"

    const reset = () => {
        setSearch("")
        setStatusFilter("all")
    }

    return (
        <div className="flex flex-col gap-6 py-2 px-4 lg:px-6">
            {loading && orders.length === 0 ? (
                <Skeleton className="h-[120px] w-full rounded-xl" />
            ) : (
                <OrdersHeader orders={orders} />
            )}

            {error && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="size-4" />
                        <span className="font-medium">{error}</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer rounded-xl"
                        onClick={() => {
                            load()
                            toast.info("Qayta urinilmoqda…")
                        }}
                    >
                        <RefreshCcw className="mr-1.5 size-3.5" />
                        Qayta urinish
                    </Button>
                </div>
            )}

            {!error && (orders.length > 0 || loading) && (
                <OrdersFilters
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    counts={counts}
                    resultCount={filtered.length}
                    totalCount={orders.length}
                    onReset={reset}
                />
            )}

            <div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-[340px] w-full rounded-2xl" />
                        ))}
                    </div>
                ) : orders.length === 0 && !error ? (
                    <OrdersEmpty variant="no-orders" />
                ) : filtered.length === 0 ? (
                    <OrdersEmpty variant="no-results" onClear={isFiltered ? reset : undefined} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((o) => (
                            <OrderCard key={o.id} order={o} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
