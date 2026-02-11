"use client"

import * as React from "react"
import { Clock, List } from "lucide-react"
import { TimetableForm } from "./components/timetable-form"
import { Separator } from "@/components/ui/separator"

export default function TimetablesPage() {
    return (
        <div className="flex-1 space-y-12 p-10 pt-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="size-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center shadow-inner">
                            <Clock className="size-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase italic">Ish vaqtlari</h1>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground/60 tracking-wide ml-1">
                        Stadionlarning haftalik ish grafigi va ochiq soatlarini boshqarish.
                    </p>
                </div>
            </div>

            <Separator className="bg-border/40" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List className="size-4 text-primary" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Grafikni tahrirlash</h2>
                    </div>
                </div>

                <div className="rounded-[3rem] p-10 bg-card/30 backdrop-blur-sm border border-border/50 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                    <TimetableForm />
                </div>
            </div>
        </div>
    )
}
