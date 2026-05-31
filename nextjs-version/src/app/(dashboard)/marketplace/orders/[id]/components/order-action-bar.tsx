"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
    AlertTriangle,
    Banknote,
    Hourglass,
    Loader2,
    PackageCheck,
    Tag,
    Truck,
    XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
    formatUZS,
    isTerminalStatus,
    marketplaceOrderService,
    type MarketplaceOrder,
} from "@/services/marketplace-order"
import { DeliveryFeeDialog } from "./delivery-fee-dialog"

interface OrderActionBarProps {
    order: MarketplaceOrder
    onUpdated: (next: MarketplaceOrder) => void
}

export function OrderActionBar({ order, onUpdated }: OrderActionBarProps) {
    const [busyKind, setBusyKind] = useState<null | "fee" | "sent" | "delivered" | "cancel" | "refund">(null)
    const [feeOpen, setFeeOpen] = useState(false)
    const [confirm, setConfirm] = useState<null | "sent" | "delivered" | "cancel" | "refund">(null)

    const handleSetFee = async (fee: number) => {
        try {
            setBusyKind("fee")
            const updated = await marketplaceOrderService.setDeliveryFee(order.id, fee)
            onUpdated(updated)
            toast.success(`Yetkazish narxi belgilandi · ${formatUZS(fee)} UZS`)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi")
            throw err
        } finally {
            setBusyKind(null)
        }
    }

    const handleMarkSent = async () => {
        try {
            setBusyKind("sent")
            const updated = await marketplaceOrderService.markSent(order.id)
            onUpdated(updated)
            toast.success("Kuryer yo'lga chiqdi")
            setConfirm(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi")
        } finally {
            setBusyKind(null)
        }
    }

    const handleMarkDelivered = async () => {
        try {
            setBusyKind("delivered")
            const updated = await marketplaceOrderService.markDelivered(order.id)
            onUpdated(updated)
            toast.success("Buyurtma yetkazildi, naqd qabul qilindi")
            setConfirm(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi")
        } finally {
            setBusyKind(null)
        }
    }

    const handleCancel = async () => {
        try {
            setBusyKind("cancel")
            const updated = await marketplaceOrderService.cancel(order.id)
            onUpdated(updated)
            toast.success(
                updated.needs_refund ? "Bekor qilindi · Pul qaytarish navbatiga qo'shildi" : "Buyurtma bekor qilindi"
            )
            setConfirm(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi")
        } finally {
            setBusyKind(null)
        }
    }

    const handleClearRefund = async () => {
        try {
            setBusyKind("refund")
            const updated = await marketplaceOrderService.clearRefundFlag(order.id)
            onUpdated(updated)
            toast.success("Pul qaytarish belgisi olib tashlandi")
            setConfirm(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi")
        } finally {
            setBusyKind(null)
        }
    }

    const primaryAction = (() => {
        switch (order.status) {
            case "awaiting_prepayment":
                return {
                    label: "Xaridor to'lovi kutilmoqda",
                    icon: Hourglass,
                    handler: null,
                    busy: false,
                    accent: "bg-muted text-muted-foreground hover:bg-muted",
                    disabled: true,
                }
            case "prepaid":
                return {
                    label: "Yetkazish narxini belgilash",
                    icon: Tag,
                    handler: () => setFeeOpen(true),
                    busy: busyKind === "fee",
                    accent: "bg-sky-500 hover:bg-sky-600 text-white",
                    disabled: false,
                }
            case "confirmed":
                return {
                    label: "Yo'lga chiqdi",
                    icon: Truck,
                    handler: () => setConfirm("sent"),
                    busy: busyKind === "sent",
                    accent: "bg-orange-500 hover:bg-orange-600 text-white",
                    disabled: false,
                }
            case "delivery_sent":
                return {
                    label: "Yetkazildi · Naqd qabul qilindi",
                    icon: PackageCheck,
                    handler: () => setConfirm("delivered"),
                    busy: busyKind === "delivered",
                    accent: "bg-emerald-500 hover:bg-emerald-600 text-white",
                    disabled: false,
                }
            default:
                return null
        }
    })()

    const canCancel = !isTerminalStatus(order.status)
    const showRefundClear = order.needs_refund

    return (
        <div className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            {primaryAction ? (
                <Button
                    size="lg"
                    onClick={primaryAction.handler ?? undefined}
                    disabled={primaryAction.disabled || primaryAction.busy}
                    className={cn(
                        "cursor-pointer rounded-lg h-11 px-5 font-medium transition-colors flex-1 sm:flex-none sm:min-w-[260px]",
                        primaryAction.accent
                    )}
                >
                    {primaryAction.busy ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Bajarilmoqda...
                        </>
                    ) : (
                        <>
                            <primaryAction.icon className="mr-2 size-4" />
                            {primaryAction.label}
                        </>
                    )}
                </Button>
            ) : (
                <div className="flex-1 rounded-lg bg-muted/40 px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <PackageCheck className="size-4" />
                    {order.status === "delivery_completed"
                        ? "Buyurtma muvaffaqiyatli yakunlandi."
                        : "Bekor qilingan buyurtma."}
                </div>
            )}

            <div className="flex items-center gap-2 sm:ml-auto">
                {showRefundClear && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setConfirm("refund")}
                        disabled={busyKind === "refund"}
                        className="cursor-pointer rounded-lg h-11 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                        {busyKind === "refund" ? (
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                            <Banknote className="mr-1.5 size-3.5" />
                        )}
                        Refund tugadi
                    </Button>
                )}

                {canCancel && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setConfirm("cancel")}
                        disabled={busyKind === "cancel"}
                        className="cursor-pointer rounded-lg h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                        {busyKind === "cancel" ? (
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : (
                            <XCircle className="mr-1.5 size-3.5" />
                        )}
                        Bekor qilish
                    </Button>
                )}
            </div>

            <DeliveryFeeDialog
                open={feeOpen}
                onOpenChange={setFeeOpen}
                itemsTotal={order.items_total}
                prepaymentTotal={order.prepayment_total}
                onConfirm={handleSetFee}
            />

            <ConfirmDialog
                open={confirm === "sent"}
                onOpenChange={(v) => !v && setConfirm(null)}
                title="Kuryer yo'lga chiqdimi?"
                description="Xaridorga yetkazib berish boshlangani haqida push yuboriladi."
                tone="orange"
                icon={Truck}
                confirmLabel="Ha, yo'lga chiqdi"
                onConfirm={handleMarkSent}
                loading={busyKind === "sent"}
            />
            <ConfirmDialog
                open={confirm === "delivered"}
                onOpenChange={(v) => !v && setConfirm(null)}
                title="Yetkazildi va naqd qabul qilindi?"
                description={`Tizim qoldiq ${formatUZS(order.remaining_amount ?? 0)} UZS naqd to'langan deb belgilaydi. Bekor qilib bo'lmaydi.`}
                tone="emerald"
                icon={PackageCheck}
                confirmLabel="Ha, yetkazildi"
                onConfirm={handleMarkDelivered}
                loading={busyKind === "delivered"}
            />
            <ConfirmDialog
                open={confirm === "cancel"}
                onOpenChange={(v) => !v && setConfirm(null)}
                title="Buyurtmani bekor qilasizmi?"
                description={
                    order.paid_amount > 0
                        ? `Buyurtma bekor qilinadi, mahsulotlar javonga qaytariladi va ${formatUZS(order.paid_amount)} UZS uchun pul qaytarish navbati ochiladi.`
                        : "Buyurtma bekor qilinadi va mahsulotlar javonga qaytariladi. Pul qaytarish kerak emas."
                }
                tone="rose"
                icon={AlertTriangle}
                confirmLabel="Ha, bekor qilinsin"
                onConfirm={handleCancel}
                loading={busyKind === "cancel"}
            />
            <ConfirmDialog
                open={confirm === "refund"}
                onOpenChange={(v) => !v && setConfirm(null)}
                title="Pul qaytarildimi?"
                description="Bu pul qaytarish navbatidan olib tashlaydi. Avval Payme / Click yoki naqd orqali xaridorga qaytarganingizga ishonch hosil qiling."
                tone="amber"
                icon={Banknote}
                confirmLabel="Ha, qaytardim"
                onConfirm={handleClearRefund}
                loading={busyKind === "refund"}
            />
        </div>
    )
}

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    confirmLabel: string
    onConfirm: () => Promise<void> | void
    loading: boolean
    tone: "emerald" | "orange" | "rose" | "amber"
}

function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    icon: Icon,
    confirmLabel,
    onConfirm,
    loading,
    tone,
}: ConfirmDialogProps) {
    const toneClasses = {
        emerald: {
            iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            button: "bg-emerald-500 hover:bg-emerald-600 text-white",
        },
        orange: {
            iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            button: "bg-orange-500 hover:bg-orange-600 text-white",
        },
        rose: {
            iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
            button: "bg-rose-600 hover:bg-rose-700 text-white",
        },
        amber: {
            iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            button: "bg-amber-500 hover:bg-amber-600 text-white",
        },
    }[tone]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={cn("size-9 rounded-lg flex items-center justify-center", toneClasses.iconBg)}>
                            <Icon className="size-4" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground mt-2 leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="cursor-pointer rounded-lg"
                        disabled={loading}
                    >
                        Bekor
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn("cursor-pointer rounded-lg", toneClasses.button)}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                Bajarilmoqda...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
