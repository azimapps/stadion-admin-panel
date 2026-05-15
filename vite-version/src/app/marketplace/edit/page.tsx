"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Save,
  Trash2,
} from "lucide-react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
  marketplaceApi,
  statusMeta,
  type Product,
  type ProductSize,
  type UpdateProductInput,
} from "@/lib/marketplace-api"
import { cn } from "@/lib/utils"

import { PageShell } from "../components/page-shell"
import { ImageUploader } from "../components/image-uploader"
import {
  ProductFields,
  type ProductFieldValues,
} from "../components/product-fields"
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
  const { id } = useParams()
  const navigate = useNavigate()

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
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await marketplaceApi.getProduct(id)
      setProduct(data)
      setFields(valuesFromProduct(data))
      setImages(data.images || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
    if (!fields.title.trim()) next.title = "Title is required"
    if (fields.price < 0) next.price = "Price cannot be negative"
    if (fields.prepayment_amount < 0)
      next.prepayment_amount = "Prepayment cannot be negative"
    if (fields.prepayment_amount > fields.price)
      next.prepayment_amount = "Prepayment cannot exceed price"
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
      const updated = await marketplaceApi.updateProduct(product.id, payload)
      setProduct(updated)
      setFields(valuesFromProduct(updated))
      setImages(updated.images || [])
      toast.success("Changes saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!product) return
    setDeleting(true)
    try {
      await marketplaceApi.deleteProduct(product.id)
      toast.success("Product deleted")
      navigate("/marketplace")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
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
      <BaseLayout>
        <div className="flex flex-col gap-6 px-4 lg:px-6">
          <Skeleton className="h-[180px] w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Skeleton className="h-[600px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </BaseLayout>
    )
  }

  if (error || !product) {
    return (
      <BaseLayout>
        <div className="flex flex-col gap-6 px-4 lg:px-6">
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
            <AlertTriangle className="size-8 text-destructive mx-auto mb-3" />
            <div className="mkt-display text-3xl mb-1">Couldn’t load product</div>
            <p className="text-sm text-muted-foreground mb-4">
              {error || "Product not found."}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button asChild variant="outline" className="cursor-pointer">
                <Link to="/marketplace">Back to marketplace</Link>
              </Button>
              <Button onClick={load} className="cursor-pointer">
                <RefreshCcw className="mr-1.5 size-3.5" /> Retry
              </Button>
            </div>
          </div>
        </div>
      </BaseLayout>
    )
  }

  const status = statusMeta(product.status)

  return (
    <BaseLayout>
      <PageShell
        eyebrow={`Product #${product.id}`}
        title="Edit"
        highlight={product.title.split(" ").slice(0, 4).join(" ")}
        crumbs={[
          { label: "Marketplace", to: "/marketplace" },
          { label: product.title },
        ]}
        actions={
          <>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ring-1",
                status.bg,
                status.text,
                status.ring
              )}
            >
              <span className={cn("size-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
            <Button asChild variant="ghost" className="cursor-pointer">
              <Link to="/marketplace">Done</Link>
            </Button>
            <Button
              onClick={save}
              disabled={saving || !dirty}
              className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white shadow-md disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 size-4" />
              )}
              {dirty ? "Save changes" : "Saved"}
            </Button>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card overflow-hidden">
              <header className="px-5 py-4 border-b flex items-baseline justify-between gap-4">
                <div>
                  <div className="mkt-eyebrow mkt-accent">00</div>
                  <h2 className="mkt-display text-2xl mt-1">Imagery</h2>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {images.length} {images.length === 1 ? "image" : "images"} · first is cover
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
                <SizesEditorEdit
                  product={product}
                  onChange={onSizesChanged}
                />
              </div>
            </section>

            {/* Danger zone */}
            <section className="rounded-2xl border border-destructive/40 bg-destructive/5 overflow-hidden">
              <header className="px-5 py-4 border-b border-destructive/30">
                <div className="mkt-eyebrow text-destructive">Danger zone</div>
                <h2 className="mkt-display text-2xl mt-1">Delete product</h2>
              </header>
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground max-w-md">
                  Soft-deletes this product — it disappears from admin and client lists.
                  Existing orders keep their snapshots and stay intact.
                </p>
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="cursor-pointer">
                      <Trash2 className="mr-1.5 size-4" /> Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete this product?</DialogTitle>
                      <DialogDescription>
                        “{product.title}” will be removed from the catalogue.
                        This action is soft and can be reversed by support,
                        but it’s effectively gone from the panel.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteOpen(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={remove}
                        disabled={deleting}
                        className="cursor-pointer"
                      >
                        {deleting ? (
                          <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 size-4" />
                        )}
                        Yes, delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </section>
          </div>

          {/* Sticky side: snapshot */}
          <aside className="lg:sticky lg:top-20 h-fit space-y-4">
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="aspect-[4/5] bg-muted mkt-grid-bg relative">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt="cover"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full grid place-items-center text-muted-foreground text-sm">
                    No cover
                  </div>
                )}
                {images.length > 1 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-background/85 backdrop-blur-md px-2 py-0.5 text-[10px] mkt-mono font-semibold ring-1 ring-border">
                    +{images.length - 1} more
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="mkt-eyebrow text-muted-foreground">SKU</div>
                  <div className="mkt-mono text-sm tabular-nums">
                    STADION-{String(product.id).padStart(6, "0")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mkt-eyebrow text-muted-foreground">Likes</div>
                    <div className="mkt-mono tabular-nums font-semibold">
                      {product.likes_count}
                    </div>
                  </div>
                  <div>
                    <div className="mkt-eyebrow text-muted-foreground">Total stock</div>
                    <div
                      className={cn(
                        "mkt-mono tabular-nums font-semibold",
                        product.total_stock === 0 && "text-rose-500"
                      )}
                    >
                      {product.total_stock}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span className="mkt-mono">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated</span>
                    <span className="mkt-mono">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {dirty && (
              <div className="rounded-2xl border border-[var(--mkt-accent)]/40 bg-[color:color-mix(in_oklch,var(--mkt-accent)_6%,var(--card))] p-4 flex items-start gap-3">
                <span className="size-2 rounded-full mkt-accent-bg mt-1.5 mkt-pulse-dot" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">Unsaved changes</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hit save to push your edits live.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={saving}
                  className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white"
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}

            <a
              href={`https://stadion24.com/marketplace/${product.id}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border bg-card p-4 text-sm hover:border-[color:color-mix(in_oklch,var(--mkt-accent)_50%,var(--border))] transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="mkt-eyebrow text-muted-foreground">Storefront</div>
                  <div className="font-medium mt-0.5">View on live store</div>
                </div>
                <ExternalLink className="size-4 text-muted-foreground group-hover:mkt-accent transition-colors" />
              </div>
            </a>
          </aside>
        </div>
      </PageShell>
    </BaseLayout>
  )
}
