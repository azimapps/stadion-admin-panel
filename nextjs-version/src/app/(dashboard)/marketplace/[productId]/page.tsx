"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, Loader2, RefreshCcw, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { cn } from "@/lib/utils"

import {
    marketplaceService,
    statusTone,
    type Product,
    type ProductSize,
    type UpdateProductInput,
} from "@/services/marketplace"

import { PageHeader } from "../components/page-header"
import { ImageUploader } from "../components/image-uploader"
import { ProductFields, type ProductFieldValues } from "../components/product-fields"
import { SizesEditorEdit } from "../components/sizes-editor-edit"

function valuesFromProduct(p: Product): ProductFieldValues {
    return {
        title: p.title,
        description: p.description ?? "",
        category: p.category ?? "",
        status: p.status,
        price: p.price,
        prepayment_amount: p.prepayment_amount,
    }
}

export default function MarketplaceEditPage() {
    const params = useParams<{ productId: string }>()
    const productId = params?.productId
    const router = useRouter()

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const [fields, setFields] = useState<ProductFieldValues>({
        title: "",
        description: "",
        category: "",
        status: "active",
        price: 0,
        prepayment_amount: 0,
    })
    const [images, setImages] = useState<string[]>([])
    const [errors, setErrors] = useState<Partial<Record<keyof ProductFieldValues, string>>>({})

    const load = async () => {
        if (!productId) return
        setLoading(true)
        setError(null)
        try {
            const data = await marketplaceService.getById(productId)
            setProduct(data)
            setFields(valuesFromProduct(data))
            setImages(data.images || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Mahsulotni yuklashda xatolik")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId])

    const dirty =
        product !== null &&
        (fields.title !== (product.title ?? "") ||
            fields.description !== (product.description ?? "") ||
            fields.category !== (product.category ?? "") ||
            fields.status !== product.status ||
            fields.price !== product.price ||
            fields.prepayment_amount !== product.prepayment_amount ||
            JSON.stringify(images) !== JSON.stringify(product.images || []))

    const validate = () => {
        const next: typeof errors = {}
        if (!fields.title.trim()) next.title = "Sarlavha shart"
        if (fields.price < 0) next.price = "Narx manfiy bo'lmasin"
        if (fields.prepayment_amount < 0)
            next.prepayment_amount = "Oldindan to'lov manfiy bo'lmasin"
        if (fields.prepayment_amount > fields.price)
            next.prepayment_amount = "Oldindan to'lov narxdan oshmasin"
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const save = async () => {
        if (!product) return
        if (!validate()) return
        setSaving(true)
        try {
            const payload: UpdateProductInput = {
                title: fields.title.trim(),
                description: fields.description.trim(),
                category: fields.category.trim(),
                status: fields.status,
                price: fields.price,
                prepayment_amount: fields.prepayment_amount,
                images,
            }
            const updated = await marketplaceService.update(product.id, payload)
            toast.success("O'zgarishlar saqlandi", {
                description: `“${updated.title}” yangilandi.`,
            })
            router.push("/marketplace")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Saqlashda xatolik")
            setSaving(false)
        }
    }

    const remove = async () => {
        if (!product) return
        setDeleting(true)
        try {
            await marketplaceService.delete(product.id)
            toast.success("Mahsulot o'chirildi")
            router.push("/marketplace")
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "O'chirishda xatolik")
            setDeleting(false)
        }
    }

    const onSizesChanged = (sizes: ProductSize[]) => {
        if (!product) return
        const total_stock = sizes.reduce((sum, s) => sum + s.stock, 0)
        setProduct({ ...product, sizes, total_stock })
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-6 py-2 px-4 lg:px-6">
                <Skeleton className="h-[200px] w-full rounded-3xl" />
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <Skeleton className="h-[600px] rounded-2xl" />
                    <Skeleton className="h-[400px] rounded-2xl" />
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex flex-col gap-6 py-2 px-4 lg:px-6">
                <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-10 text-center">
                    <AlertTriangle className="size-8 text-destructive mx-auto mb-3" />
                    <div className="font-black italic uppercase tracking-tighter text-3xl mb-1">
                        Yuklab bo'lmadi
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">
                        {error || "Mahsulot topilmadi."}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Button asChild variant="outline" className="cursor-pointer rounded-xl">
                            <Link href="/marketplace">Do'konga qaytish</Link>
                        </Button>
                        <Button onClick={load} className="cursor-pointer rounded-xl">
                            <RefreshCcw className="mr-1.5 size-3.5" /> Qayta urinish
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const tone = statusTone(product.status)

    return (
        <div className="flex flex-col gap-6 py-2">
            <PageHeader
                eyebrow={`Mahsulot #${product.id}`}
                title="Tahrirlash"
                highlight={product.title.split(" ").slice(0, 4).join(" ")}
                crumbs={[
                    { label: "Do'kon", href: "/marketplace" },
                    { label: product.title },
                ]}
                actions={
                    <>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ring-1",
                                tone.bg,
                                tone.text,
                                tone.ring
                            )}
                        >
                            <span className={cn("size-1.5 rounded-full", tone.dot)} />
                            {tone.label}
                        </span>
                        <Button asChild variant="ghost" className="cursor-pointer">
                            <Link href="/marketplace">Tayyor</Link>
                        </Button>
                        <Button
                            onClick={save}
                            disabled={saving || !dirty}
                            className="cursor-pointer rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 px-6 disabled:opacity-50"
                        >
                            {saving ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4 stroke-[2.5]" />
                            )}
                            {dirty ? "Saqlash" : "Saqlangan"}
                        </Button>
                    </>
                }
            />

            <div className="grid gap-6 px-4 lg:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                        <header className="px-6 py-4 border-b border-border/50 flex items-baseline justify-between gap-4 bg-muted/20">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">00</div>
                                <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">Rasmlar</h2>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hidden sm:block">
                                {images.length} ta rasm · Birinchi asosiy
                            </p>
                        </header>
                        <div className="p-6">
                            <ImageUploader images={images} onChange={setImages} />
                        </div>
                    </section>

                    <ProductFields values={fields} onChange={setFields} errors={errors} />

                    <section className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                        <header className="px-6 py-4 border-b border-border/50 bg-muted/20">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">03</div>
                            <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">Variantlar</h2>
                        </header>
                        <div className="p-6">
                            <SizesEditorEdit product={product} onChange={onSizesChanged} />
                        </div>
                    </section>

                    {/* Danger zone */}
                    <section className="rounded-2xl border border-destructive/40 bg-destructive/5 overflow-hidden">
                        <header className="px-6 py-4 border-b border-destructive/30">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive">
                                Xavfli zona
                            </div>
                            <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">
                                Mahsulotni o'chirish
                            </h2>
                        </header>
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground max-w-md italic">
                                Mahsulot katalog va admin ro'yxatidan olib tashlanadi. Mavjud buyurtmalar saqlanadi.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteOpen(true)}
                                className="cursor-pointer rounded-xl"
                            >
                                <Trash2 className="mr-1.5 size-4" /> O'chirish
                            </Button>
                        </div>
                    </section>

                    <ConfirmDeleteDialog
                        open={deleteOpen}
                        onOpenChange={setDeleteOpen}
                        onConfirm={remove}
                        loading={deleting}
                        title="Mahsulot o'chirilsinmi?"
                        description={`“${product.title}” mahsulotini katalogdan o'chirmoqchimisiz?`}
                    />
                </div>

                {/* Snapshot side */}
                <aside className="lg:sticky lg:top-20 h-fit space-y-4">
                    <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                        <div className="aspect-[4/5] bg-muted relative">
                            {images[0] ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={images[0]} alt="cover" className="size-full object-cover" />
                            ) : (
                                <div className="size-full grid place-items-center text-muted-foreground italic text-sm">
                                    Rasm yo'q
                                </div>
                            )}
                            {images.length > 1 && (
                                <span className="absolute bottom-2 left-2 rounded-full bg-background/85 backdrop-blur-md px-2 py-0.5 text-[9px] tabular-nums font-black uppercase tracking-widest ring-1 ring-border/60">
                                    +{images.length - 1} ko'proq
                                </span>
                            )}
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                    SKU
                                </div>
                                <div className="font-black tabular-nums text-sm mt-0.5">
                                    STADION-{String(product.id).padStart(6, "0")}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                        Layklar
                                    </div>
                                    <div className="font-black italic tabular-nums text-xl mt-0.5">
                                        {product.likes_count}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                        Zaxira
                                    </div>
                                    <div
                                        className={cn(
                                            "font-black italic tabular-nums text-xl mt-0.5",
                                            product.total_stock === 0 && "text-rose-500"
                                        )}
                                    >
                                        {product.total_stock}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 space-y-1">
                                <div className="flex justify-between">
                                    <span>Yaratilgan</span>
                                    <span className="tabular-nums text-foreground">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Yangilangan</span>
                                    <span className="tabular-nums text-foreground">
                                        {new Date(product.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {dirty && (
                        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 flex items-start gap-3">
                            <span className="size-2 rounded-full bg-primary mt-1.5 animate-pulse" />
                            <div className="flex-1 min-w-0">
                                <div className="font-black italic uppercase tracking-tight text-sm">Saqlanmagan o'zgarish</div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mt-0.5">
                                    O'zgarishlarni yuklash uchun saqlang
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={save}
                                disabled={saving}
                                className="cursor-pointer rounded-xl"
                            >
                                {saving ? <Loader2 className="size-3.5 animate-spin" /> : "Saqlash"}
                            </Button>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    )
}
