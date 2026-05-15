"use client"

import { useState } from "react"
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    marketplaceService,
    type Product,
    type ProductSize,
} from "@/services/marketplace"
import { cn } from "@/lib/utils"

interface SizesEditorEditProps {
    product: Product
    onChange: (sizes: ProductSize[]) => void
}

export function SizesEditorEdit({ product, onChange }: SizesEditorEditProps) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [draft, setDraft] = useState<{ size_label: string; hint_label: string; stock: number }>({
        size_label: "",
        hint_label: "",
        stock: 0,
    })
    const [savingId, setSavingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const [addOpen, setAddOpen] = useState(false)
    const [newSize, setNewSize] = useState({ size_label: "", hint_label: "", stock: 0 })
    const [adding, setAdding] = useState(false)

    const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0)

    const beginEdit = (s: ProductSize) => {
        setEditingId(s.id)
        setDraft({
            size_label: s.size_label,
            hint_label: s.hint_label ?? "",
            stock: s.stock,
        })
    }

    const cancelEdit = () => setEditingId(null)

    const saveEdit = async (id: number) => {
        setSavingId(id)
        try {
            const updated = await marketplaceService.updateSize(id, {
                size_label: draft.size_label.trim() || undefined,
                hint_label: draft.hint_label.trim() || null,
                stock: Number(draft.stock) || 0,
            })
            onChange(product.sizes.map((s) => (s.id === id ? updated : s)))
            toast.success("O'lcham yangilandi")
            setEditingId(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Yangilashda xatolik")
        } finally {
            setSavingId(null)
        }
    }

    const removeSize = async (id: number) => {
        if (!confirm("O'lchamni o'chirasizmi? Mavjud buyurtmalar ta'sirlanmaydi.")) return
        setDeletingId(id)
        try {
            await marketplaceService.deleteSize(id)
            onChange(product.sizes.filter((s) => s.id !== id))
            toast.success("O'lcham o'chirildi")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "O'chirishda xatolik")
        } finally {
            setDeletingId(null)
        }
    }

    const addSize = async () => {
        if (!newSize.size_label.trim()) {
            toast.error("O'lcham belgisi shart")
            return
        }
        setAdding(true)
        try {
            const created = await marketplaceService.addSize(product.id, {
                size_label: newSize.size_label.trim(),
                hint_label: newSize.hint_label.trim() || null,
                stock: Number(newSize.stock) || 0,
            })
            onChange([...product.sizes, created])
            toast.success("O'lcham qo'shildi")
            setAddOpen(false)
            setNewSize({ size_label: "", hint_label: "", stock: 0 })
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "O'lcham qo'shishda xatolik")
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label className="font-black italic uppercase tracking-tight text-base">O'lchamlar va zaxira</Label>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">
                        O'zgarishlar darhol saqlanadi
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Jami soni</div>
                        <div
                            className={cn(
                                "font-black italic tabular-nums text-2xl",
                                totalStock === 0 ? "text-rose-500" : "text-primary"
                            )}
                        >
                            {totalStock}
                        </div>
                    </div>
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="cursor-pointer rounded-xl">
                                <Plus className="mr-1.5 size-4" /> Qo'shish
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="font-black italic uppercase tracking-tight">
                                    Yangi o'lcham
                                </DialogTitle>
                                <DialogDescription>
                                    Mahsulot uchun yangi variant kiriting.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-size-label">O'lcham belgisi *</Label>
                                    <Input
                                        id="new-size-label"
                                        placeholder="masalan: XL, 42, One Size"
                                        value={newSize.size_label}
                                        onChange={(e) =>
                                            setNewSize((s) => ({ ...s, size_label: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-size-hint">Izoh (ixtiyoriy)</Label>
                                    <Input
                                        id="new-size-hint"
                                        placeholder="170-180 sm, 65-75 kg"
                                        value={newSize.hint_label}
                                        onChange={(e) =>
                                            setNewSize((s) => ({ ...s, hint_label: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="new-size-stock">Zaxira</Label>
                                    <Input
                                        id="new-size-stock"
                                        type="number"
                                        min={0}
                                        value={newSize.stock}
                                        onChange={(e) =>
                                            setNewSize((s) => ({
                                                ...s,
                                                stock: Number(e.target.value) || 0,
                                            }))
                                        }
                                        className="tabular-nums font-bold"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setAddOpen(false)} className="cursor-pointer">
                                    Bekor qilish
                                </Button>
                                <Button
                                    onClick={addSize}
                                    disabled={adding}
                                    className="cursor-pointer rounded-xl"
                                >
                                    {adding && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                                    Qo'shish
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {product.sizes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center bg-card/30">
                    <div className="font-black italic uppercase tracking-tight text-2xl mb-1">
                        O'lchamlar yo'q
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                        Mahsulotni sotuvga chiqarish uchun birinchi o'lchamni qo'shing.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 divide-y divide-border/50">
                    <div className="hidden sm:grid grid-cols-[120px_1fr_140px_120px] gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/40">
                        <div>Belgi</div>
                        <div>Izoh</div>
                        <div>Zaxira</div>
                        <div className="text-right">Amallar</div>
                    </div>
                    {product.sizes.map((s) => {
                        const isEditing = editingId === s.id
                        const isSaving = savingId === s.id
                        const isDeleting = deletingId === s.id

                        return (
                            <div
                                key={s.id}
                                className="grid grid-cols-2 sm:grid-cols-[120px_1fr_140px_120px] gap-3 px-4 py-3 items-center"
                            >
                                {isEditing ? (
                                    <>
                                        <Input
                                            value={draft.size_label}
                                            onChange={(e) =>
                                                setDraft((d) => ({ ...d, size_label: e.target.value }))
                                            }
                                            className="font-black italic tracking-tight"
                                        />
                                        <Input
                                            placeholder="Izoh"
                                            value={draft.hint_label}
                                            onChange={(e) =>
                                                setDraft((d) => ({ ...d, hint_label: e.target.value }))
                                            }
                                            className="col-span-2 sm:col-span-1 text-sm"
                                        />
                                        <Input
                                            type="number"
                                            min={0}
                                            value={draft.stock}
                                            onChange={(e) =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    stock: Number(e.target.value) || 0,
                                                }))
                                            }
                                            className="tabular-nums font-bold"
                                        />
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={cancelEdit}
                                                disabled={isSaving}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                className="cursor-pointer rounded-xl"
                                                onClick={() => saveEdit(s.id)}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <Check className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-black italic uppercase tracking-tight text-2xl">
                                            {s.size_label}
                                        </div>
                                        <div className="text-sm text-muted-foreground col-span-2 sm:col-span-1">
                                            {s.hint_label || <span className="opacity-50 italic">Izohsiz</span>}
                                        </div>
                                        <div
                                            className={cn(
                                                "tabular-nums font-black text-base",
                                                s.stock === 0 && "text-rose-500",
                                                s.stock > 0 && s.stock <= 3 && "text-amber-500"
                                            )}
                                        >
                                            {s.stock}{" "}
                                            <span className="text-[9px] text-muted-foreground/70 font-bold uppercase tracking-widest">
                                                dona
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer"
                                                onClick={() => beginEdit(s)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="cursor-pointer text-muted-foreground hover:text-destructive"
                                                onClick={() => removeSize(s.id)}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
