"use client"

import { useState, useEffect } from "react"
import { Clock, Check, Plus, AlertCircle, Save, Calendar as CalendarIcon, MapPin, Users, Trophy } from "lucide-react"
import { timetableService, Timetable, TimetableUpdate } from "@/services/timetable"
import { Stadium, stadiumsService } from "@/services/stadium"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

const DAYS = [
    { key: "monday", label: "Dushanba" },
    { key: "tuesday", label: "Seshanba" },
    { key: "wednesday", label: "Chorshanba" },
    { key: "thursday", label: "Payshanba" },
    { key: "friday", label: "Juma" },
    { key: "saturday", label: "Shanba" },
    { key: "sunday", label: "Yakshanba" },
] as const

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function TimetableForm() {
    const [stadiums, setStadiums] = useState<Stadium[]>([])
    const [selectedStadiumId, setSelectedStadiumId] = useState<number | null>(null)
    const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null)
    const [timetable, setTimetable] = useState<TimetableUpdate>({
        monday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        tuesday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        wednesday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        thursday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        friday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        saturday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        sunday: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)

    useEffect(() => {
        stadiumsService.getAll().then(setStadiums).catch(console.error)
    }, [])

    useEffect(() => {
        if (selectedStadiumId) {
            const stadium = stadiums.find(s => s.id === selectedStadiumId)
            setSelectedStadium(stadium || null)

            setFetching(true)
            timetableService.getByStadiumId(selectedStadiumId)
                .then(data => {
                    const { id, stadium_id, ...rest } = data
                    setTimetable(rest)
                })
                .catch(err => {
                    // If not found, it's okay, we use default
                    if (err.message.includes('404')) {
                        // Keep default values
                    } else {
                        toast.error("Ish vaqtini yuklashda xatolik")
                    }
                })
                .finally(() => setFetching(false))
        }
    }, [selectedStadiumId, stadiums])

    const toggleHour = (day: keyof TimetableUpdate, hour: number) => {
        setTimetable(prev => {
            const currentHours = prev[day] || []
            const isSelected = currentHours.includes(hour)
            const newHours = isSelected
                ? currentHours.filter(h => h !== hour)
                : [...currentHours, hour].sort((a, b) => a - b)

            return { ...prev, [day]: newHours }
        })
    }

    const selectAllDay = (day: keyof TimetableUpdate) => {
        setTimetable(prev => ({ ...prev, [day]: HOURS }))
    }

    const clearDay = (day: keyof TimetableUpdate) => {
        setTimetable(prev => ({ ...prev, [day]: [] }))
    }

    const onSave = async () => {
        if (!selectedStadiumId) {
            toast.error("Stadionni tanlang")
            return
        }

        setLoading(true)
        try {
            await timetableService.createOrUpdate(selectedStadiumId, timetable)
            toast.success("Ish vaqti muvaffaqiyatli saqlandi")
        } catch (error: any) {
            toast.error(error.message || "Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Stadionni tanlang</label>
                        <Select
                            onValueChange={(val) => setSelectedStadiumId(parseInt(val))}
                            value={selectedStadiumId ? selectedStadiumId.toString() : undefined}
                        >
                            <SelectTrigger className="h-14 rounded-2xl bg-muted/20 border-border/40 font-bold text-lg transition-all focus:ring-primary/20 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Clock className="size-5 text-primary" />
                                    <SelectValue placeholder="Stadionni tanlang..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/40 shadow-2xl p-2 bg-background/95 backdrop-blur-xl">
                                {stadiums.map((stadium) => (
                                    <SelectItem
                                        key={stadium.id}
                                        value={stadium.id.toString()}
                                        className="rounded-xl py-3 px-4 focus:bg-primary focus:text-white transition-all cursor-pointer mb-1 last:mb-0"
                                    >
                                        <span className="font-bold">{stadium.name_uz}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedStadium && (
                        <Card className="border-none shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] bg-muted/30 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row gap-6 p-8">
                                <div className="size-24 rounded-3xl overflow-hidden border-2 border-background shadow-xl shrink-0">
                                    {selectedStadium.main_image ? (
                                        <img src={selectedStadium.main_image} alt="" className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full bg-muted flex items-center justify-center">
                                            <Trophy className="size-10 text-muted-foreground/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Tanlangan stadion</p>
                                        <h3 className="text-2xl font-black tracking-tight">{selectedStadium.name_uz}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <MapPin className="size-4 text-primary/60" />
                                            <span className="truncate">{selectedStadium.address_uz}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground text-right justify-end">
                                            <Users className="size-4 text-primary/60" />
                                            <span>{selectedStadium.capacity} kishi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="flex flex-col justify-end gap-4 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Clock className="size-40" />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <h4 className="text-xl font-black tracking-tight">Qulay boshqaruv</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-md">
                            Har bir kun uchun ish soatlarini belgilang. Ko'k rangli soatlar stadion ochiqligini, kulrang esa yopiqligini anglatadi. Bir kunda bir nechta vaqt oralig'ini tanlashingiz mumkin.
                        </p>
                    </div>
                    <Button
                        onClick={onSave}
                        disabled={loading || !selectedStadiumId || fetching}
                        className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-sm uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 z-10 w-fit px-10"
                    >
                        {loading ? "Saqlanmoqda..." : (
                            <>
                                <Save className="size-5" />
                                Saqlash
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Separator className="bg-border/40" />

            {!selectedStadiumId ? (
                <div className="h-96 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-border/60 bg-muted/10 gap-6 animate-pulse">
                    <div className="size-20 rounded-full bg-muted/40 flex items-center justify-center">
                        <Clock className="size-10 text-muted-foreground/20" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-muted-foreground/60 uppercase tracking-widest">Ish vaqtini boshqarish uchun</p>
                        <p className="text-sm font-medium text-muted-foreground/40 italic">Yuqoridan stadionni tanlang</p>
                    </div>
                </div>
            ) : fetching ? (
                <div className="h-96 flex flex-col items-center justify-center rounded-[3rem] bg-muted/10 gap-6">
                    <div className="size-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Ma'lumotlar yuklanmoqda...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12 animate-in fade-in duration-700">
                    {DAYS.map((day) => (
                        <div key={day.key} className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                                        <CalendarIcon className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <h5 className="text-2xl font-black italic tracking-tighter uppercase">{day.label}</h5>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ish soatlarini tanlang</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-border/40 bg-muted/20 text-xs font-bold uppercase tracking-widest">
                                        {(timetable[day.key] || []).length} ta soat tanlangan
                                    </Badge>
                                    <Button variant="ghost" size="sm" onClick={() => selectAllDay(day.key)} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary">Hamma soatlar</Button>
                                    <Button variant="ghost" size="sm" onClick={() => clearDay(day.key)} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive">Tozalash</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                                {HOURS.map((hour) => {
                                    const isSelected = (timetable[day.key] || []).includes(hour)
                                    return (
                                        <button
                                            key={hour}
                                            onClick={() => toggleHour(day.key, hour)}
                                            className={cn(
                                                "relative h-16 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 group overflow-hidden",
                                                isSelected
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105 z-10 active:scale-95"
                                                    : "bg-muted/10 border-border/40 hover:border-primary/40 hover:bg-muted/20 active:scale-95"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-lg font-black tracking-tighter transition-colors",
                                                isSelected ? "text-white" : "text-foreground/80 group-hover:text-primary"
                                            )}>
                                                {hour.toString().padStart(2, '0')}:00
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="size-3 rounded-full bg-white/20 flex items-center justify-center">
                                                        <Check className="size-2 text-white" strokeWidth={4} />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                            {day.key !== 'sunday' && <Separator className="bg-border/20 mt-12" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
