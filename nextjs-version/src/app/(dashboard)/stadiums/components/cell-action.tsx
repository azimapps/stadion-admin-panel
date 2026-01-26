"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menyuni ochish</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={`/stadiums/${data.id}`}>
                        <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> Ko'rish
                        </DropdownMenuItem>
                    </Link>
                    <Link href={`/stadiums/${data.id}/edit`}>
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={() => setOpen(true)} className="text-red-600 focus:text-red-600">
                        <Trash className="mr-2 h-4 w-4" /> O'chirish
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Stadionni o'chirish</DialogTitle>
                        <DialogDescription>
                            Siz haqiqatdan ham <b>"{data.name_uz}"</b> stadionini o'chirmoqchimisiz?
                            <br />
                            Bu amalni ortga qaytarib bo'lmaydi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Bekor qilish
                        </Button>
                        <Button variant="destructive" onClick={onDelete} disabled={loading}>
                            {loading ? "O'chirilmoqda..." : "O'chirish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
