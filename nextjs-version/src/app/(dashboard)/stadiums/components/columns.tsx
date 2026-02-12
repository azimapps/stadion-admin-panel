"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Stadium } from "@/services/stadium"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MapPin, BadgeDollarSign, Users2, Eye, Pencil, Trash2, Percent, Calendar } from "lucide-react"
import Link from "next/link"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export const columns: ColumnDef<Stadium>[] = [
    {
        accessorKey: "name_uz",
        header: "Stadion",
        cell: ({ row }) => {
            const name_uz = row.getValue("name_uz") as string
            const name_ru = row.original.name_ru
            return (
                <div className="flex flex-col gap-0.5 min-w-[200px]">
                    <span className="font-black italic uppercase tracking-tighter text-sm text-foreground">{name_uz}</span>
                    <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest">{name_ru}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "address_uz",
        header: "Manzil",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 max-w-[250px]">
                <div className="flex items-center gap-1.5 text-muted-foreground/60">
                    <MapPin className="size-3 text-primary/40 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{row.getValue("address_uz")}</span>
                </div>
                {row.original.metro_station && (
                    <div className="flex items-center gap-1.5 text-primary/40 text-[9px] font-bold uppercase tracking-wide ml-4">
                        <span>Metro: {row.original.metro_station} ({row.original.metro_distance}km)</span>
                    </div>
                )}
            </div>
        )
    },
    {
        accessorKey: "price_per_hour",
        header: "Narxi",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price_per_hour"))
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-black text-sm text-primary italic tracking-tight uppercase">
                        {price.toLocaleString()} UZS
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">soatiga</span>
                </div>
            )
        },
    },
    {
        id: "discount",
        header: "Chegirma",
        cell: ({ row }) => {
            const discount = row.original.discount
            const topLevelDiscountPrice = row.original.discount_price_per_hour

            if (!discount && !topLevelDiscountPrice) {
                return (
                    <div className="flex items-center gap-1.5 text-muted-foreground/40">
                        <span className="text-[10px] font-medium">—</span>
                    </div>
                )
            }

            if (discount) {
                const now = new Date()
                const startDate = new Date(discount.start_datetime)
                const endDate = new Date(discount.end_datetime)
                const isActive = now >= startDate && now <= endDate

                return (
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <div className="flex items-center gap-1.5">
                            <Percent className={cn("size-3", isActive ? "text-green-500" : "text-orange-400")} />
                            <span className={cn(
                                "font-black text-sm italic tracking-tight",
                                isActive ? "text-green-600" : "text-orange-500"
                            )}>
                                {discount.discount_price_per_hour.toLocaleString()} UZS
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground/50">
                            <Calendar className="size-2.5" />
                            <span>{format(startDate, "dd.MM")} - {format(endDate, "dd.MM.yy")}</span>
                        </div>
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className={cn(
                                "w-fit text-[8px] px-1.5 py-0 h-4",
                                isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                            )}
                        >
                            {isActive ? "Faol" : "Kutilmoqda"}
                        </Badge>
                    </div>
                )
            }

            // Fallback to top-level discount price if no discount object (permanent discount)
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                        <Percent className="size-3 text-green-500" />
                        <span className="font-black text-sm italic tracking-tight text-green-600">
                            {topLevelDiscountPrice!.toLocaleString()} UZS
                        </span>
                    </div>
                    <Badge
                        variant="default"
                        className="w-fit text-[8px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20"
                    >
                        Doimiy
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "capacity",
        header: "Sig'im",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 group">
                <div className="size-8 rounded-lg bg-muted/30 flex items-center justify-center border border-border/20 group-hover:border-primary/20 transition-colors">
                    <Users2 className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="font-black text-sm tabular-nums">{row.getValue("capacity")}</span>
            </div>
        )
    },
    {
        accessorKey: "is_active",
        header: "Holati",
        cell: ({ row }) => {
            const active = row.getValue("is_active") as boolean
            return (
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                    active
                        ? "bg-primary/5 text-primary border-primary/10 shadow-sm shadow-primary/5"
                        : "bg-muted/50 text-muted-foreground/40 border-border/50"
                )}>
                    <div className={cn("size-1.5 rounded-full animate-pulse", active ? "bg-primary" : "bg-muted-foreground/20")} />
                    {active ? "Faol" : "Nofaol"}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "Amallar",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
