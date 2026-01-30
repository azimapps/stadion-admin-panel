"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => Promise<void>
    title?: string
    description?: string
    loading?: boolean
}

export function ConfirmDeleteDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Ma'lumotni o'chirish",
    description = "Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.",
    loading = false,
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-destructive/5 p-6">
                    <DialogHeader className="mb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                                <AlertTriangle className="size-6" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-foreground">
                                {title}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-muted-foreground mt-2">
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-row justify-end gap-3 pt-4 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl px-6 h-11 border-border/50 hover:bg-background transition-colors"
                            disabled={loading}
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            className="rounded-xl px-8 h-11 font-bold shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all active:scale-95"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    O'chirilmoqda...
                                </>
                            ) : (
                                "Ha, o'chirilsin"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
