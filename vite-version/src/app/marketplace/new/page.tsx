"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"

import {
  marketplaceApi,
  type ProductSizeInput,
  type CreateProductInput,
} from "@/lib/marketplace-api"

import { PageShell } from "../components/page-shell"
import { ImageUploader } from "../components/image-uploader"
import {
  ProductFields,
  type ProductFieldValues,
} from "../components/product-fields"
import { SizesEditorCreate } from "../components/sizes-editor-create"

export default function MarketplaceNewPage() {
  const navigate = useNavigate()
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
    if (!fields.title.trim()) next.title = "Title is required"
    if (fields.price < 0) next.price = "Price cannot be negative"
    if (fields.prepayment_amount < 0)
      next.prepayment_amount = "Prepayment cannot be negative"
    if (fields.prepayment_amount > fields.price)
      next.prepayment_amount = "Prepayment cannot exceed price"

    for (const s of sizes) {
      if (!s.size_label.trim()) {
        toast.error("Every size needs a label")
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
      const created = await marketplaceApi.createProduct(payload)
      toast.success("Product created", {
        description: `“${created.title}” is now in the catalogue.`,
      })
      navigate(`/marketplace/${created.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <BaseLayout>
      <PageShell
        eyebrow="Marketplace · New listing"
        title="Add a new"
        highlight="product"
        description="Upload photos, set price and stock — once you save, it lands on the catalogue immediately (unless marked hidden)."
        crumbs={[
          { label: "Marketplace", to: "/marketplace" },
          { label: "New product" },
        ]}
        actions={
          <>
            <Button asChild variant="ghost" className="cursor-pointer">
              <Link to="/marketplace">Cancel</Link>
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white shadow-md"
            >
              {submitting ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 size-4" />
              )}
              Save product
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card overflow-hidden">
              <header className="px-5 py-4 border-b flex items-baseline justify-between gap-4">
                <div>
                  <div className="mkt-eyebrow mkt-accent">00</div>
                  <h2 className="mkt-display text-2xl mt-1">Imagery</h2>
                </div>
                <p className="text-xs text-muted-foreground max-w-xs text-right hidden sm:block">
                  First image becomes the cover. Add multiple angles for richer product pages.
                </p>
              </header>
              <div className="p-5">
                <ImageUploader images={images} onChange={setImages} />
              </div>
            </section>

            <ProductFields
              values={fields}
              onChange={setFields}
              errors={errors}
            />

            <section className="rounded-2xl border bg-card overflow-hidden">
              <header className="px-5 py-4 border-b">
                <div className="mkt-eyebrow mkt-accent">03</div>
                <h2 className="mkt-display text-2xl mt-1">Variants</h2>
              </header>
              <div className="p-5">
                <SizesEditorCreate sizes={sizes} onChange={setSizes} />
              </div>
            </section>
          </div>

          {/* Sticky side: live preview */}
          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <header className="px-5 py-4 border-b">
                <div className="mkt-eyebrow mkt-accent">Live preview</div>
                <h2 className="mkt-display text-2xl mt-1">Storefront card</h2>
              </header>
              <div className="p-5">
                <div className="rounded-xl border overflow-hidden">
                  <div className="aspect-[4/5] bg-muted mkt-grid-bg relative">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt="cover"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full grid place-items-center text-muted-foreground text-sm">
                        Cover preview
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {fields.category || "uncategorised"}
                    </div>
                    <div className="font-semibold line-clamp-2 min-h-[2.5rem]">
                      {fields.title || "Your product title"}
                    </div>
                    <div className="flex items-end justify-between pt-1">
                      <div className="mkt-mono tabular-nums font-semibold">
                        {new Intl.NumberFormat("uz-UZ").format(fields.price)}
                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                          UZS
                        </span>
                      </div>
                      <div className="mkt-mono tabular-nums text-sm">
                        {sizes.reduce(
                          (sum, s) => sum + (Number(s.stock) || 0),
                          0
                        )}{" "}
                        in stock
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                  This is roughly how buyers will see the card.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </PageShell>
    </BaseLayout>
  )
}
