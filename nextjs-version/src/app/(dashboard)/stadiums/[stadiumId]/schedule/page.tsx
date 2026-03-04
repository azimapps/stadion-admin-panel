"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import {
    ArrowLeft, ChevronLeft, ChevronRight, Clock, Phone, User,
    Loader2, CheckCircle2, AlertCircle, Timer, Banknote, RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

import { financeService, ScheduleResponse, TimeSlot } from "@/services/finance"

const WEEKDAYS_UZ = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"]

const formatUZS = (num: number = 0) => new Intl.NumberFormat('ru-RU').format(num) + ' UZS'

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "paid":
            return <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">To&apos;langan</Badge>
        case "partially_paid":
            return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">Qisman to&apos;langan</Badge>
        case "in_progress":
            return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20">Jarayonda</Badge>
        case "cancelled":
            return <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">Bekor qilingan</Badge>
        default:
            return null
    }
}

function StatusIcon({ status }: { status: string }) {
    switch (status) {
        case "paid":
            return <CheckCircle2 className="h-4 w-4 text-green-500" />
        case "partially_paid":
            return <AlertCircle className="h-4 w-4 text-amber-500" />
        case "in_progress":
            return <Timer className="h-4 w-4 text-blue-500" />
        default:
            return null
    }
}

export default function StadiumSchedulePage() {
    const params = useParams<{ stadiumId: string }>()
    const stadiumId = Number(params.stadiumId)

    const [currentDate, setCurrentDate] = React.useState(() => new Date())
    const [data, setData] = React.useState<ScheduleResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [markingPaid, setMarkingPaid] = React.useState<number | null>(null)
    const [confirmMarkPaid, setConfirmMarkPaid] = React.useState<{ bookingId: number; userName: string } | null>(null)

    const dateStr = format(currentDate, "yyyy-MM-dd")
    const dayName = WEEKDAYS_UZ[currentDate.getDay()]

    const fetchSchedule = React.useCallback(async () => {
        try {
            setLoading(true)
            const res = await financeService.getSchedule(stadiumId, dateStr)
            setData(res)
        } catch (error) {
            console.error(error)
            toast.error("Jadvalni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }, [stadiumId, dateStr])

    React.useEffect(() => {
        fetchSchedule()
    }, [fetchSchedule])

    const handlePrevDay = () => setCurrentDate(prev => {
        const d = new Date(prev)
        d.setDate(d.getDate() - 1)
        return d
    })

    const handleNextDay = () => setCurrentDate(prev => {
        const d = new Date(prev)
        d.setDate(d.getDate() + 1)
        return d
    })

    const handleMarkPaid = async () => {
        if (!confirmMarkPaid) return
        try {
            setMarkingPaid(confirmMarkPaid.bookingId)
            const result = await financeService.markBookingPaid(confirmMarkPaid.bookingId)
            toast.success(result.detail)
            setConfirmMarkPaid(null)
            fetchSchedule()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "To'lovni belgilashda xatolik")
        } finally {
            setMarkingPaid(null)
        }
    }

    const isToday = format(new Date(), "yyyy-MM-dd") === dateStr

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/stadiums/${stadiumId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kunlik jadval</h1>
                        {data && <p className="text-sm text-muted-foreground">{data.stadium_name}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isToday && (
                        <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs mr-2">
                            Bugun
                        </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={handlePrevDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center justify-center min-w-[140px]">
                        <span className="font-medium text-sm">{format(currentDate, "dd.MM.yyyy")}</span>
                        <span className="text-xs text-muted-foreground">{dayName}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Slots */}
            {loading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array(12).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : !data || data.slots.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Clock className="h-12 w-12 text-muted-foreground/20 mb-4" />
                        <p className="text-sm font-medium text-muted-foreground">Bu kunga jadval topilmadi</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Summary */}
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/40" />
                            <span className="text-muted-foreground">Bo&apos;sh: {data.slots.filter(s => s.status === "available").length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary/20 border border-primary/40" />
                            <span className="text-muted-foreground">Band: {data.slots.filter(s => s.status === "booked").length}</span>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {data.slots.map((slot) => (
                            <SlotCard
                                key={slot.hour}
                                slot={slot}
                                markingPaid={markingPaid}
                                onMarkPaid={(bookingId, userName) => setConfirmMarkPaid({ bookingId, userName })}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Confirm mark paid */}
            {confirmMarkPaid && (
                <ConfirmDeleteDialog
                    open={!!confirmMarkPaid}
                    onOpenChange={(open) => !open && setConfirmMarkPaid(null)}
                    onConfirm={handleMarkPaid}
                    title="To'lovni tasdiqlash"
                    description={`${confirmMarkPaid.userName} uchun to'lovni to'liq deb belgilash?`}
                    loading={markingPaid === confirmMarkPaid.bookingId}
                />
            )}
        </div>
    )
}

function SlotCard({ slot, markingPaid, onMarkPaid }: {
    slot: TimeSlot
    markingPaid: number | null
    onMarkPaid: (bookingId: number, userName: string) => void
}) {
    const hourStr = `${String(slot.hour).padStart(2, "0")}:00`
    const nextHourStr = `${String(slot.hour + 1).padStart(2, "0")}:00`

    if (slot.status === "available") {
        return (
            <div className="rounded-xl border border-dashed border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3">
                <div className="text-lg font-bold font-mono text-green-600/60">{hourStr}</div>
                <div className="text-xs text-green-600/50 font-medium">Bo&apos;sh</div>
            </div>
        )
    }

    const booking = slot.booking!

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-sm font-bold">{hourStr} — {nextHourStr}</span>
                </div>
                <StatusBadge status={booking.status} />
            </div>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{booking.user_name}</span>
                    {booking.is_recurring && (
                        <span title="Doimiy bron"><RefreshCw className="h-3 w-3 text-primary" /></span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono">{booking.user_phone}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <div className="flex items-center gap-1.5">
                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs">
                            <span className="font-bold">{formatUZS(booking.paid_amount)}</span>
                            <span className="text-muted-foreground"> / {formatUZS(booking.price)}</span>
                        </span>
                    </div>
                    <StatusIcon status={booking.status} />
                </div>

                {booking.status === "partially_paid" && (
                    <Button
                        size="sm"
                        className="w-full mt-1 gap-2"
                        variant="outline"
                        onClick={() => onMarkPaid(booking.id, booking.user_name)}
                        disabled={markingPaid === booking.id}
                    >
                        {markingPaid === booking.id ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Belgilanmoqda...</>
                        ) : (
                            <><CheckCircle2 className="h-3.5 w-3.5" /> To&apos;langan deb belgilash</>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
