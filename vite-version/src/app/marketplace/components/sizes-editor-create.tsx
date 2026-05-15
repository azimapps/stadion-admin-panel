"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProductSizeInput } from "@/lib/marketplace-api"

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Sizes</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Add inline at creation. After save, manage stock per size from the edit page.
          </p>
        </div>
        <div className="text-right">
          <div className="mkt-eyebrow text-muted-foreground">Total units</div>
          <div className="mkt-mono text-xl font-semibold tabular-nums">{totalStock}</div>
        </div>
      </div>

      {sizes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No sizes yet. You can save without sizes and add them later.
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          <div className="hidden sm:grid grid-cols-[120px_1fr_120px_44px] gap-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
            <div>Label</div>
            <div>Hint</div>
            <div>Stock</div>
            <div />
          </div>
          {sizes.map((s, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-[120px_1fr_120px_44px] gap-3 p-3 items-center">
              <Input
                placeholder="S / 42"
                value={s.size_label}
                onChange={(e) => update(i, { size_label: e.target.value })}
                className="font-semibold"
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
                className="mkt-mono tabular-nums"
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

      <Button type="button" variant="outline" onClick={add} className="cursor-pointer">
        <Plus className="mr-1.5 size-4" /> Add size
      </Button>
    </div>
  )
}
