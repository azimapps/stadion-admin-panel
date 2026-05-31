"use client"

import { useEffect, useState } from "react"
import { Loader2, Tag } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatUZS } from "@/services/marketplace-order"

interface DeliveryFeeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    itemsTotal: number
    prepaymentTotal: number
    onConfirm: (fee: number) => Promise<void>
}

const QUICK_FEES = [0, 15000, 20000, 25000, 30000, 50000]

export function DeliveryFeeDialog({
    open,
    onOpenChange,
    itemsTotal,
    prepaymentTotal,
    onConfirm,
}: DeliveryFeeDialogProps) {
    const [fee, setFee] = useState<number>(15000)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setFee(15000)
            setError(null)
        }
    }, [open])

    const totalAfter = itemsTotal + fee
    const remainingAfter = totalAfter - prepaymentTotal

    const submit = async () => {
        if (fee < 0 || !Number.isFinite(fee)) {
            setError("Narx 0 yoki musbat bo'lsin")
            return
        }
        try {
            setSubmitting(true)
            setError(null)
            await onConfirm(fee)
            onOpenChange(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Xatolik yuz berdi")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                        <Tag className="size-4 text-sky-500" />
                        Yetkazish narxi
                    </DialogTitle>
                    <DialogDescription>
                        Narxni belgilang — buyurtma <strong>tasdiqlangan</strong> holatga o'tadi va xaridorga
                        push yuboriladi.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="fee" className="text-xs font-medium">
                            Yetkazish narxi (UZS)
                        </Label>
                        <Input
                            id="fee"
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1000}
                            value={Number.isFinite(fee) ? fee : ""}
                            onChange={(e) => setFee(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                            className="h-11 rounded-lg text-base font-semibold tabular-nums"
                            autoFocus
                        />
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {QUICK_FEES.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => setFee(amount)}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                                        fee === amount
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {amount === 0 ? "Bepul" : `${formatUZS(amount)}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3 grid grid-cols-3 gap-3">
                        <Stat label="Mahsulot" value={itemsTotal} />
                        <Stat label="Yangi jami" value={totalAfter} accent="text-foreground" bold />
                        <Stat label="Kuryer naqd" value={remainingAfter} accent="text-amber-600 dark:text-amber-400" bold />
                    </div>

                    {error && (
                        <div className="text-xs text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                        className="cursor-pointer rounded-lg"
                    >
                        Bekor
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={submitting}
                        className="cursor-pointer rounded-lg bg-sky-500 hover:bg-sky-600 text-white"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                Yuborilmoqda
                            </>
                        ) : (
                            <>Tasdiqlash · {formatUZS(fee)} UZS</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function Stat({
    label,
    value,
    accent = "text-muted-foreground",
    bold,
}: {
    label: string
    value: number
    accent?: string
    bold?: boolean
}) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
            <div
                className={`tabular-nums ${bold ? "font-semibold text-sm" : "font-medium text-xs"} ${accent}`}
            >
                {formatUZS(value)}
            </div>
        </div>
    )
}
