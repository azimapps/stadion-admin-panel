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
  marketplaceApi,
  type Product,
  type ProductSize,
} from "@/lib/marketplace-api"
import { cn } from "@/lib/utils"

interface SizesEditorEditProps {
  product: Product
  onChange: (sizes: ProductSize[]) => void
}

export function SizesEditorEdit({ product, onChange }: SizesEditorEditProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<{
    size_label: string
    hint_label: string
    stock: number
  }>({ size_label: "", hint_label: "", stock: 0 })
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [newSize, setNewSize] = useState({
    size_label: "",
    hint_label: "",
    stock: 0,
  })
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

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (id: number) => {
    setSavingId(id)
    try {
      const updated = await marketplaceApi.updateSize(id, {
        size_label: draft.size_label.trim() || undefined,
        hint_label: draft.hint_label.trim() || null,
        stock: Number(draft.stock) || 0,
      })
      onChange(product.sizes.map((s) => (s.id === id ? updated : s)))
      toast.success("Size updated")
      setEditingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed")
    } finally {
      setSavingId(null)
    }
  }

  const removeSize = async (id: number) => {
    if (!confirm("Delete this size? Existing orders keep snapshots.")) return
    setDeletingId(id)
    try {
      await marketplaceApi.deleteSize(id)
      onChange(product.sizes.filter((s) => s.id !== id))
      toast.success("Size deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  const addSize = async () => {
    if (!newSize.size_label.trim()) {
      toast.error("Size label required")
      return
    }
    setAdding(true)
    try {
      const created = await marketplaceApi.addSize(product.id, {
        size_label: newSize.size_label.trim(),
        hint_label: newSize.hint_label.trim() || null,
        stock: Number(newSize.stock) || 0,
      })
      onChange([...product.sizes, created])
      toast.success("Size added")
      setAddOpen(false)
      setNewSize({ size_label: "", hint_label: "", stock: 0 })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add size failed")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-sm font-semibold">Sizes &amp; stock</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Changes save immediately. Useful for restocking and label tweaks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="mkt-eyebrow text-muted-foreground">Total units</div>
            <div
              className={cn(
                "mkt-mono text-xl font-semibold tabular-nums",
                totalStock === 0 && "text-rose-500"
              )}
            >
              {totalStock}
            </div>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <Plus className="mr-1.5 size-4" /> Add size
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a size</DialogTitle>
                <DialogDescription>
                  Define a new variant for this product.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-size-label">Size label *</Label>
                  <Input
                    id="new-size-label"
                    placeholder="e.g. XL, 42, One Size"
                    value={newSize.size_label}
                    onChange={(e) =>
                      setNewSize((s) => ({ ...s, size_label: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-size-hint">Hint (optional)</Label>
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
                  <Label htmlFor="new-size-stock">Stock</Label>
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
                    className="mkt-mono tabular-nums"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setAddOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addSize}
                  disabled={adding}
                  className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white"
                >
                  {adding && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                  Add size
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {product.sizes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <div className="mkt-display text-2xl mb-1">No sizes</div>
          <p className="text-sm text-muted-foreground">
            Add the first size to make this product purchasable.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          <div className="hidden sm:grid grid-cols-[120px_1fr_140px_120px] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
            <div>Label</div>
            <div>Hint</div>
            <div>Stock</div>
            <div className="text-right">Actions</div>
          </div>
          {product.sizes.map((s) => {
            const isEditing = editingId === s.id
            const isSaving = savingId === s.id
            const isDeleting = deletingId === s.id

            return (
              <div
                key={s.id}
                className="grid grid-cols-2 sm:grid-cols-[120px_1fr_140px_120px] gap-3 px-3 py-3 items-center"
              >
                {isEditing ? (
                  <>
                    <Input
                      value={draft.size_label}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, size_label: e.target.value }))
                      }
                      className="font-semibold"
                    />
                    <Input
                      placeholder="Hint"
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
                      className="mkt-mono tabular-nums"
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
                        className="cursor-pointer mkt-accent-bg hover:opacity-90 text-white"
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
                    <div className="font-display mkt-display text-2xl">
                      {s.size_label}
                    </div>
                    <div className="text-sm text-muted-foreground col-span-2 sm:col-span-1">
                      {s.hint_label || (
                        <span className="opacity-50">No hint</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "mkt-mono tabular-nums text-base font-semibold",
                        s.stock === 0 && "text-rose-500",
                        s.stock > 0 && s.stock <= 3 && "text-amber-500"
                      )}
                    >
                      {s.stock}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        in stock
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
