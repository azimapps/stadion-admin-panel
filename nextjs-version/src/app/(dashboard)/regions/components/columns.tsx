"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Region } from "@/services/region"
import { cn } from "@/lib/utils"

export const columns: ColumnDef<Region>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="w-[40px] font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "name_uz",
        header: "Nomi (UZ)",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-foreground">{row.getValue("name_uz")}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "name_ru",
        header: "Nomi (RU)",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-muted-foreground">{row.getValue("name_ru")}</span>
                </div>
            )
        }
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
]
