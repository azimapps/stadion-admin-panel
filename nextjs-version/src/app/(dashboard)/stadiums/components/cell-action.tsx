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
            <div className="flex items-center justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground">
                            <EllipsisVertical className="size-4" />
                            <span className="sr-only">Amallar</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-border/50">
                        <Link href={`/stadiums/${data.id}`}>
                            <DropdownMenuItem className="cursor-pointer py-2.5">
                                <Eye className="mr-2 size-4 text-muted-foreground" />
                                Ko'rish
                            </DropdownMenuItem>
                        </Link>
                        <Link href={`/stadiums/${data.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer py-2.5">
                                <Pencil className="mr-2 size-4 text-muted-foreground" />
                                Tahrirlash
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setOpen(true)}
                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-2.5"
                        >
                            <Trash2 className="mr-2 size-4" />
                            O'chirish
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="rounded-2xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="size-5" />
                            Stadionni o'chirish
                        </DialogTitle>
                        <DialogDescription className="py-2">
                            Siz haqiqatdan ham <span className="font-bold text-foreground">"{data.name_uz}"</span> stadionini o'chirmoqchimisiz?
                            <br />
                            Bu amalni ortga qaytarib bo'lmaydi.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 bg-muted/30 p-4 -mx-6 -mb-6 mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={loading} className="rounded-xl">
                            Bekor qilish
                        </Button>
                        <Button variant="destructive" onClick={onDelete} disabled={loading} className="rounded-xl px-6">
                            {loading ? "O'chirilmoqda..." : "O'chirish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
