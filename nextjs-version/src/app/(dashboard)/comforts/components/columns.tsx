"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Comfort } from "@/services/comfort"
import { cn } from "@/lib/utils"
// import { CellAction } from "./cell-action" // Will implement later if needed, or inline

export const columns: ColumnDef<Comfort>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <div className="w-[40px] font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "image_url",
        header: "Rasm",
        cell: ({ row }) => {
            const imageUrl = row.getValue("image_url") as string
            return imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="icon" className="h-8 w-8 object-contain rounded-md bg-muted/50 p-1" />
            ) : (
                <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                    No
                </div>
            )
        },
    },
    {
        accessorKey: "title_uz",
        header: "Nomi (UZ)",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-foreground">{row.getValue("title_uz")}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "title_ru",
        header: "Nomi (RU)",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-muted-foreground">{row.getValue("title_ru")}</span>
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
    // Add actions column if needed
]
