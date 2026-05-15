"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProductSizeInput } from "@/services/marketplace"

interface SizesEditorCreateProps {
    sizes: ProductSizeInput[]
    onChange: (next: ProductSizeInput[]) => void
}

export function SizesEditorCreate({ sizes, onChange }: SizesEditorCreateProps) {
    const update = (i: number, patch: Partial<ProductSizeInput>) => {
        onChange(sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
    }
    const remove = (i: number) => onChange(sizes.filter((_, idx) => idx !== i))
    const add = () =>
        onChange([...sizes, { size_label: "", hint_label: "", stock: 0 }])

    const totalStock = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="font-black italic uppercase tracking-tight text-base">O'lchamlar</Label>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-1">
                        Yaratishda qo'shing · Keyinroq tahrirlash sahifasidan boshqarasiz
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Jami soni</div>
                    <div className="font-black italic tabular-nums text-2xl text-primary">{totalStock}</div>
                </div>
            </div>

            {sizes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center bg-card/30">
                    <p className="text-sm text-muted-foreground italic">
                        Hozircha o'lcham yo'q. O'lchamsiz ham saqlash mumkin — keyin qo'shasiz.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 divide-y divide-border/50">
                    <div className="hidden sm:grid grid-cols-[120px_1fr_120px_44px] gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/40">
                        <div>Belgi</div>
                        <div>Izoh</div>
                        <div>Zaxira</div>
                        <div />
                    </div>
                    {sizes.map((s, i) => (
                        <div key={i} className="grid grid-cols-2 sm:grid-cols-[120px_1fr_120px_44px] gap-3 p-3 items-center">
                            <Input
                                placeholder="S / 42"
                                value={s.size_label}
                                onChange={(e) => update(i, { size_label: e.target.value })}
                                className="font-black italic tracking-tight"
                            />
                            <Input
                                placeholder="170-180 sm, 65-75 kg"
                                value={s.hint_label ?? ""}
                                onChange={(e) => update(i, { hint_label: e.target.value })}
                                className="col-span-2 sm:col-span-1 text-sm"
                            />
                            <Input
                                type="number"
                                min={0}
                                value={s.stock}
                                onChange={(e) => update(i, { stock: Number(e.target.value) || 0 })}
                                className="tabular-nums font-bold"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive cursor-pointer"
                                onClick={() => remove(i)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Button type="button" variant="outline" onClick={add} className="cursor-pointer rounded-xl">
                <Plus className="mr-1.5 size-4" /> O'lcham qo'shish
            </Button>
        </div>
    )
}
