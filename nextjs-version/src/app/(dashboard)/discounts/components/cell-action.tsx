"use client"

import { useState } from "react"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Discount } from "@/services/discount"
import { DiscountFormDialog } from "./discount-form-dialog"
import { useDiscounts } from "../page"

interface CellActionProps {
    data: Discount
}

export function CellAction({ data }: CellActionProps) {
    const { onEdit, onDelete } = useDiscounts()
    const [loading, setLoading] = useState(false)

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id)
        toast.success("Chegirma ID nusxalandi.")
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menyu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(data.id.toString())}>
                        <Copy className="mr-2 h-4 w-4" />
                        ID nusxalash
                    </DropdownMenuItem>
                    <DiscountFormDialog
                        discount={data}
                        onEditDiscount={onEdit}
                        onDeleteDiscount={onDelete}
                        trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                Tahrirlash
                            </DropdownMenuItem>
                        }
                    />
                    <DropdownMenuItem
                        onClick={() => onDelete(data.id)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        O'chirish
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
