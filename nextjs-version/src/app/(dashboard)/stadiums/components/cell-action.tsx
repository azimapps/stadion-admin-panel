"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EllipsisVertical, Pencil, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Stadium, stadiumsService } from "@/services/stadium"
import Link from "next/link"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

interface CellActionProps {
    data: Stadium
}

export function CellAction({ data }: CellActionProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const onDelete = async () => {
        try {
            setLoading(true)
            await stadiumsService.delete(data.id)
            toast.success("Stadion muvaffaqiyatli o'chirildi")
            setOpen(false)
            window.location.reload()
        } catch (error) {
            toast.error("O'chirishda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                            <EllipsisVertical className="size-4" />
                            <span className="sr-only">Amallar</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-border/50" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem
                            className="cursor-pointer py-2.5"
                            onSelect={() => router.push(`/stadiums/${data.id}`)}
                        >
                            <Eye className="mr-2 size-4 text-muted-foreground" />
                            Ko'rish
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer py-2.5"
                            onSelect={() => router.push(`/stadiums/${data.id}/edit`)}
                        >
                            <Pencil className="mr-2 size-4 text-muted-foreground" />
                            Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => setOpen(true)}
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5"
                        >
                            <Trash2 className="mr-2 size-4" />
                            O'chirish
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ConfirmDeleteDialog
                open={open}
                onOpenChange={setOpen}
                onConfirm={onDelete}
                loading={loading}
                title="Stadion tizimdan o'chirilsinmi?"
                description={`"${data.name_uz}" stadionini barcha ma'lumotlari bilan o'chirmoqchimisiz?`}
            />


        </>
    )
}
