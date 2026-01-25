"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Stadium } from "@/services/stadium"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { CellAction } from "./cell-action"

export const columns: ColumnDef<Stadium>[] = [
    {
        accessorKey: "name_uz",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nomi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "address_uz",
        header: "Manzil",
    },
    {
        accessorKey: "price_per_hour",
        header: "Narxi (soat)",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price_per_hour"))
            const formatted = new Intl.NumberFormat("uz-UZ", {
                style: "currency",
                currency: "UZS",
            }).format(price)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "capacity",
        header: "Sig'imi",
    },
    {
        accessorKey: "is_active",
        header: "Holati",
        cell: ({ row }) => (
            <div className={row.getValue("is_active") ? "text-green-600" : "text-red-600"}>
                {row.getValue("is_active") ? "Faol" : "Faol emas"}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />,
    },
]
