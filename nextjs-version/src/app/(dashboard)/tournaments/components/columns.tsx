"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Tournament } from "@/services/tournament"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { uz } from "date-fns/locale"
import { Trophy, Calendar, Users, MapPin } from "lucide-react"

export const columns: ColumnDef<Tournament>[] = [
    {
        accessorKey: "title_uz",
        header: "Turnir nomi",
        cell: ({ row }) => {
            const title_uz = row.getValue("title_uz") as string
            const title_ru = row.original.title_ru
            return (
                <div className="flex flex-col gap-0.5 min-w-[200px]">
                    <span className="font-bold text-sm tracking-tight text-foreground line-clamp-1 italic uppercase">{title_uz}</span>
                    <span className="text-[10px] text-muted-foreground font-medium line-clamp-1 opacity-60 uppercase">{title_ru}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "stadium_id",
        header: "Stadion",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                        <MapPin className="size-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">ID: {row.original.stadium_id}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "start_time",
        header: "Vaqti",
        cell: ({ row }) => {
            const start = new Date(row.original.start_time)
            const end = new Date(row.original.end_time)
            return (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-primary/60" />
                        <span className="text-[11px] font-black tracking-widest text-foreground uppercase">
                            {format(start, "d-MMM, yyyy", { locale: uz })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[9px] font-black h-5 px-1.5 bg-muted/30 border-none uppercase tracking-tighter">
                            {format(start, "HH:mm")} - {format(end, "HH:mm")}
                        </Badge>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "entrance_fee",
        header: "Narxi",
        cell: ({ row }) => {
            const fee = row.original.entrance_fee
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tight text-primary italic">
                        {fee === 0 ? "BEPUL" : `${fee.toLocaleString()} UZS`}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none">Kirish haqi</span>
                </div>
            )
        },
    },
    {
        accessorKey: "is_active",
        header: "Holati",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean
            return (
                <Badge
                    className={cn(
                        "rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                        isActive
                            ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10"
                            : "bg-destructive/10 text-destructive shadow-destructive/10"
                    )}
                >
                    {isActive ? "FAOL" : "YOPILGAN"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]

import { cn } from "@/lib/utils"
