"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Stadium } from "@/services/stadium"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MapPin, BadgeDollarSign, Users2, Eye, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Stadium>[] = [
    {
        accessorKey: "name_uz",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="hover:bg-transparent p-0 font-semibold"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nomi
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            )
        },
        cell: ({ row }) => <span className="font-semibold">{row.getValue("name_uz")}</span>
    },
    {
        accessorKey: "address_uz",
        header: "Manzil",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-muted-foreground text-sm max-w-[300px]">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{row.getValue("address_uz")}</span>
            </div>
        )
    },
    {
        accessorKey: "price_per_hour",
        header: "Narxi (soat)",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price_per_hour"))
            const formatted = new Intl.NumberFormat("uz-UZ", {
                style: "currency",
                currency: "UZS",
                maximumFractionDigits: 0
            }).format(price)
            return (
                <div className="flex items-center gap-2 font-bold text-primary">
                    <BadgeDollarSign className="size-3.5" />
                    {formatted}
                </div>
            )
        },
    },
    {
        accessorKey: "capacity",
        header: "Sig'imi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-sm">
                <Users2 className="size-3.5 text-muted-foreground" />
                {row.getValue("capacity")}
            </div>
        )
    },
    {
        accessorKey: "is_active",
        header: "Holati",
        cell: ({ row }) => {
            const active = row.getValue("is_active") as boolean
            return (
                <Badge
                    variant="secondary"
                    className={active
                        ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
                        : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
                    }
                >
                    {active ? "Faol" : "Nofaol"}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        header: "Amallar",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
