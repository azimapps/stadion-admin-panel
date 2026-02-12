"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Discount } from "@/services/discount"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const columns: ColumnDef<Discount>[] = [
    {
        accessorKey: "stadium_name_uz",
        header: "Stadion",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.stadium_name_uz}</span>
                    <span className="text-xs text-muted-foreground">{row.original.stadium_name_ru}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "discount_price_per_hour",
        header: "Umumiy chegirma narxi",
        cell: ({ row }) => {
            return (
                <div className="font-bold text-blue-600">
                    {row.original.discount_price_per_hour.toLocaleString()} UZS
                    <span className="text-[10px] text-muted-foreground font-normal ml-1">/soat</span>
                </div>
            )
        }
    },
    {
        accessorKey: "start_datetime",
        header: "Boshlanish",
        cell: ({ row }) => {
            return (
                <div className="text-sm">
                    {format(new Date(row.original.start_datetime), "dd.MM.yyyy HH:mm")}
                </div>
            )
        }
    },
    {
        accessorKey: "end_datetime",
        header: "Tugash",
        cell: ({ row }) => {
            return (
                <div className="text-sm">
                    {format(new Date(row.original.end_datetime), "dd.MM.yyyy HH:mm")}
                </div>
            )
        }
    },
    {
        accessorKey: "is_active",
        header: "Holat",
        cell: ({ row }) => {
            const isActive = row.original.is_active
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Faol" : "Faol emas"}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />
    }
]
