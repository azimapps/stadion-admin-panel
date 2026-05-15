"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

import {
    marketplaceService,
    formatUZS,
    type CreateProductInput,
    type ProductSizeInput,
} from "@/services/marketplace"

import { PageHeader } from "../components/page-header"
import { ImageUploader } from "../components/image-uploader"
import { ProductFields, type ProductFieldValues } from "../components/product-fields"
import { SizesEditorCreate } from "../components/sizes-editor-create"

export default function MarketplaceNewPage() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [sizes, setSizes] = useState<ProductSizeInput[]>([])
    const [fields, setFields] = useState<ProductFieldValues>({
        title: "",
        description: "",
        category: "",
        status: "active",
        price: 0,
        prepayment_amount: 0,
    })
    const [errors, setErrors] = useState<Partial<Record<keyof ProductFieldValues, string>>>({})

    const validate = () => {
        const next: typeof errors = {}
        if (!fields.title.trim()) next.title = "Sarlavha shart"
        if (fields.price < 0) next.price = "Narx manfiy bo'lmasin"
        if (fields.prepayment_amount < 0)
            next.prepayment_amount = "Oldindan to'lov manfiy bo'lmasin"
        if (fields.prepayment_amount > fields.price)
            next.prepayment_amount = "Oldindan to'lov narxdan oshmasin"

        for (const s of sizes) {
            if (!s.size_label.trim()) {
                toast.error("Har bir o'lcham uchun belgi kerak")
                return false
            }
        }
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const submit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const payload: CreateProductInput = {
                title: fields.title.trim(),
                description: fields.description.trim() || undefined,
                category: fields.category.trim() || undefined,
                status: fields.status,
                price: fields.price,
                prepayment_amount: fields.prepayment_amount,
                images,
                sizes: sizes.map((s) => ({
                    size_label: s.size_label.trim(),
                    hint_label: s.hint_label?.toString().trim() || undefined,
                    stock: Number(s.stock) || 0,
                })),
            }
            const created = await marketplaceService.create(payload)
            toast.success("Mahsulot yaratildi", {
                description: `“${created.title}” katalogga qo'shildi.`,
            })
            router.push(`/marketplace/${created.id}`)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Yaratishda xatolik")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 py-2">
            <PageHeader
                eyebrow="Do'kon · Yangi"
                title="Yangi"
                highlight="mahsulot"
                description="Rasm yuklang, narx va o'lchamlarni kiriting — saqlaganingizdan keyin darhol katalogga qo'shiladi (yashirin bo'lmasa)."
                crumbs={[
                    { label: "Do'kon", href: "/marketplace" },
                    { label: "Yangi mahsulot" },
                ]}
                actions={
                    <>
                        <Button asChild variant="ghost" className="cursor-pointer">
                            <Link href="/marketplace">Bekor qilish</Link>
                        </Button>
                        <Button
                            onClick={submit}
                            disabled={submitting}
                            className="cursor-pointer rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 px-6"
                        >
                            {submitting ? (
                                <Loader2 className="mr-1.5 size-4 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 size-4 stroke-[2.5]" />
                            )}
                            Saqlash
                        </Button>
                    </>
                }
            />

            <div className="grid gap-6 px-4 lg:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                        <header className="px-6 py-4 border-b border-border/50 flex items-baseline justify-between gap-4 bg-muted/20">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">00</div>
                                <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">Rasmlar</h2>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hidden sm:block max-w-xs text-right">
                                Birinchi rasm asosiy bo'ladi · Bir nechta burchak yuklang
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
                            <SizesEditorCreate sizes={sizes} onChange={setSizes} />
                        </div>
                    </section>
                </div>

                <aside className="lg:sticky lg:top-20 h-fit">
                    <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                        <header className="px-6 py-4 border-b border-border/50 bg-muted/20">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Jonli ko'rinish</div>
                            <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">Do'kon kartasi</h2>
                        </header>
                        <div className="p-5">
                            <div className="rounded-2xl border border-border/50 overflow-hidden">
                                <div className="aspect-[4/5] bg-muted relative">
                                    {images[0] ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={images[0]} alt="cover" className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full grid place-items-center text-muted-foreground italic text-sm">
                                            Asosiy rasm
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground/70 font-black">
                                        {fields.category || "kategoriyasiz"}
                                    </div>
                                    <div className="font-black italic uppercase tracking-tighter text-base line-clamp-2 min-h-[2.5rem]">
                                        {fields.title || "Mahsulot sarlavhasi"}
                                    </div>
                                    <div className="flex items-end justify-between pt-1">
                                        <div className="font-black italic tabular-nums text-base">
                                            {formatUZS(fields.price)}
                                            <span className="ml-1 text-[9px] font-bold text-muted-foreground/70 tracking-widest uppercase">
                                                UZS
                                            </span>
                                        </div>
                                        <div className="tabular-nums text-sm font-black">
                                            {sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)}{" "}
                                            <span className="text-[9px] font-bold text-muted-foreground/70 tracking-widest uppercase">
                                                dona
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-3 text-center">
                                Xaridorlar shu kabi ko'radi
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
