"use client"

import { AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatUZS, type ProductStatus } from "@/services/marketplace"

export interface ProductFieldValues {
    title: string
    description: string
    category: string
    status: ProductStatus
    price: number
    prepayment_amount: number
}

interface ProductFieldsProps {
    values: ProductFieldValues
    onChange: (next: ProductFieldValues) => void
    errors?: Partial<Record<keyof ProductFieldValues, string>>
}

export function ProductFields({ values, onChange, errors }: ProductFieldsProps) {
    const set = <K extends keyof ProductFieldValues>(key: K, val: ProductFieldValues[K]) =>
        onChange({ ...values, [key]: val })

    const prepaymentExceedsPrice = values.price > 0 && values.prepayment_amount > values.price

    return (
        <div className="space-y-6">
            {/* DETAILS */}
            <section className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                <header className="px-6 py-4 border-b border-border/50 flex items-baseline justify-between gap-4 bg-muted/20">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">01</div>
                        <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">Ma'lumotlar</h2>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hidden sm:block max-w-xs text-right">
                        Xaridorlar do'kon va mahsulot sahifasida ko'radigan sarlavha
                    </p>
                </header>
                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest">Sarlavha *</Label>
                        <Input
                            id="title"
                            placeholder="O'zbekiston terma jamoasi formasi 2026"
                            value={values.title}
                            onChange={(e) => set("title", e.target.value)}
                            maxLength={255}
                            className={cn("rounded-xl", errors?.title && "border-destructive")}
                        />
                        {errors?.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            {values.title.length} / 255
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest">Tavsif</Label>
                        <Textarea
                            id="description"
                            placeholder="Rasmiy uy formasi · Nafas oluvchi Dri-FIT mato…"
                            value={values.description}
                            onChange={(e) => set("description", e.target.value)}
                            rows={5}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest">Kategoriya</Label>
                            <Input
                                id="category"
                                placeholder="forma · butsa · aksessuar…"
                                value={values.category}
                                onChange={(e) => set("category", e.target.value)}
                                maxLength={100}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest">Holati</Label>
                            <Select value={values.status} onValueChange={(v) => set("status", v as ProductStatus)}>
                                <SelectTrigger id="status" className="cursor-pointer w-full rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-1.5 rounded-full bg-emerald-500" />
                                            Faol — xaridorlar ko'radi
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="hidden">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-1.5 rounded-full bg-zinc-400" />
                                            Yashirin — faqat admin
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="sold_out">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="size-1.5 rounded-full bg-rose-500" />
                                            Tugagan
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING */}
            <section className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                <header className="px-6 py-4 border-b border-border/50 flex items-baseline justify-between gap-4 bg-muted/20">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">02</div>
                        <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">Narx</h2>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hidden sm:block max-w-xs text-right">
                        Barcha qiymatlar UZS · Oldindan to'lov xaridor onlayn to'laydigan miqdor
                    </p>
                </header>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest">Narxi *</Label>
                            <div className="relative">
                                <Input
                                    id="price"
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={values.price}
                                    onChange={(e) => set("price", Number(e.target.value) || 0)}
                                    className={cn(
                                        "rounded-xl tabular-nums font-bold pr-14",
                                        errors?.price && "border-destructive"
                                    )}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                    UZS
                                </span>
                            </div>
                            {errors?.price && <p className="text-xs text-destructive">{errors.price}</p>}
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 tabular-nums">
                                {formatUZS(values.price)} UZS
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prepayment" className="text-[10px] font-black uppercase tracking-widest">Oldindan to'lov *</Label>
                            <div className="relative">
                                <Input
                                    id="prepayment"
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={values.prepayment_amount}
                                    onChange={(e) =>
                                        set("prepayment_amount", Number(e.target.value) || 0)
                                    }
                                    className={cn(
                                        "rounded-xl tabular-nums font-bold pr-14",
                                        (errors?.prepayment_amount || prepaymentExceedsPrice) && "border-destructive"
                                    )}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                    UZS
                                </span>
                            </div>
                            {(errors?.prepayment_amount || prepaymentExceedsPrice) && (
                                <p className="text-xs text-destructive inline-flex items-center gap-1">
                                    <AlertTriangle className="size-3" />
                                    {errors?.prepayment_amount || "Oldindan to'lov narxdan oshmasin"}
                                </p>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 tabular-nums">
                                {formatUZS(values.prepayment_amount)} UZS
                            </p>
                        </div>
                    </div>

                    {/* Payment split preview */}
                    <div className="rounded-2xl border border-border/40 bg-background/40 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            To'lov taqsimoti
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-primary transition-all"
                                    style={{
                                        width:
                                            values.price > 0
                                                ? `${Math.min(100, (values.prepayment_amount / values.price) * 100)}%`
                                                : "0%",
                                    }}
                                />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="inline-flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Onlayn</span>
                                    <span className="font-black tabular-nums">
                                        {formatUZS(values.prepayment_amount)}
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="size-2 rounded-full bg-muted-foreground/40" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Yetkazganda</span>
                                    <span className="font-black tabular-nums">
                                        {formatUZS(Math.max(0, values.price - values.prepayment_amount))}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
