"use client"

import { Search, LayoutGrid, Rows3, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { ProductStatus } from "@/lib/marketplace-api"

export type ViewMode = "grid" | "list"

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: ProductStatus | "all"
  onStatusChange: (value: ProductStatus | "all") => void
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  resultCount: number
  totalCount: number
  onReset: () => void
}

export function ProductFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categories,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
  onReset,
}: ProductFiltersProps) {
  const isFiltered = search !== "" || status !== "all" || category !== "all"

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products by title…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={status} onValueChange={(v) => onStatusChange(v as ProductStatus | "all")}>
          <SelectTrigger className="cursor-pointer w-[150px] h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="sold_out">Sold out</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="cursor-pointer w-[170px] h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onReset} className="cursor-pointer">
            <X className="mr-1 size-3.5" />
            Reset
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1 rounded-lg border p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            aria-label="Grid view"
            className={cn(
              "size-8 grid place-items-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            aria-label="List view"
            className={cn(
              "size-8 grid place-items-center rounded-md transition-colors",
              viewMode === "list"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Rows3 className="size-4" />
          </button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground whitespace-nowrap mkt-mono">
        {resultCount} / {totalCount}
      </div>
    </div>
  )
}
