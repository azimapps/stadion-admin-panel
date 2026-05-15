"use client"

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
import { formatUZS, type ProductStatus } from "@/lib/marketplace-api"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

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
  const set = <K extends keyof ProductFieldValues>(
    key: K,
    val: ProductFieldValues[K]
  ) => onChange({ ...values, [key]: val })

  const prepaymentExceedsPrice =
    values.price > 0 && values.prepayment_amount > values.price

  return (
    <div className="space-y-6">
      {/* DETAILS */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <header className="px-5 py-4 border-b flex items-baseline justify-between gap-4">
          <div>
            <div className="mkt-eyebrow mkt-accent">01</div>
            <h2 className="mkt-display text-2xl mt-1">Details</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs text-right hidden sm:block">
            The headline that shoppers see in the catalogue and product page.
          </p>
        </header>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Uzbekistan National Team Jersey 2026"
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={255}
              className={cn(errors?.title && "border-destructive")}
            />
            {errors?.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {values.title.length} / 255
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Official home jersey. Breathable Dri-FIT fabric…"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="jerseys, boots, accessories…"
                value={values.category}
                onChange={(e) => set("category", e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => set("status", v as ProductStatus)}
              >
                <SelectTrigger id="status" className="cursor-pointer w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active — visible to clients
                    </span>
                  </SelectItem>
                  <SelectItem value="hidden">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-zinc-400" />
                      Hidden — admin only
                    </span>
                  </SelectItem>
                  <SelectItem value="sold_out">
                    <span className="inline-flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-rose-500" />
                      Sold out
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <header className="px-5 py-4 border-b flex items-baseline justify-between gap-4">
          <div>
            <div className="mkt-eyebrow mkt-accent">02</div>
            <h2 className="mkt-display text-2xl mt-1">Pricing</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs text-right hidden sm:block">
            All values in Uzbek so'm (UZS). Prepayment is what buyers pay online to reserve.
          </p>
        </header>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1000}
                  value={values.price}
                  onChange={(e) => set("price", Number(e.target.value) || 0)}
                  className={cn(
                    "mkt-mono tabular-nums pr-14",
                    errors?.price && "border-destructive"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  UZS
                </span>
              </div>
              {errors?.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
              <p className="text-[11px] text-muted-foreground mkt-mono">
                {formatUZS(values.price)} UZS
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prepayment">Prepayment *</Label>
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
                    "mkt-mono tabular-nums pr-14",
                    (errors?.prepayment_amount || prepaymentExceedsPrice) &&
                      "border-destructive"
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  UZS
                </span>
              </div>
              {(errors?.prepayment_amount || prepaymentExceedsPrice) && (
                <p className="text-xs text-destructive inline-flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {errors?.prepayment_amount ||
                    "Prepayment cannot exceed price"}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mkt-mono">
                {formatUZS(values.prepayment_amount)} UZS
              </p>
            </div>
          </div>

          {/* Pricing visualization */}
          <div className="rounded-xl border bg-background overflow-hidden">
            <div className="px-4 py-2.5 border-b text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Payment split preview
            </div>
            <div className="p-4 space-y-2">
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 mkt-accent-bg transition-all"
                  style={{
                    width:
                      values.price > 0
                        ? `${Math.min(
                            100,
                            (values.prepayment_amount / values.price) * 100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full mkt-accent-bg" />
                  Prepay online{" "}
                  <span className="mkt-mono tabular-nums text-foreground font-semibold">
                    {formatUZS(values.prepayment_amount)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                  On delivery{" "}
                  <span className="mkt-mono tabular-nums text-foreground font-semibold">
                    {formatUZS(
                      Math.max(0, values.price - values.prepayment_amount)
                    )}
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
