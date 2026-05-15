import { apiClient } from "./api-client"

export type ProductStatus = "active" | "hidden" | "sold_out"

export interface ProductSize {
  id: number
  size_label: string
  hint_label: string | null
  stock: number
}

export interface Product {
  id: number
  title: string
  description: string | null
  images: string[]
  price: number
  prepayment_amount: number
  category: string | null
  status: ProductStatus
  likes_count: number
  sizes: ProductSize[]
  is_liked_by_me: boolean
  total_stock: number
  created_at: string
  updated_at: string
}

export interface UploadedImage {
  url: string
  filename: string
  size: number
}

export interface ProductSizeInput {
  size_label: string
  hint_label?: string | null
  stock: number
}

export interface CreateProductInput {
  title: string
  description?: string
  images?: string[]
  price: number
  prepayment_amount: number
  category?: string
  status?: ProductStatus
  sizes?: ProductSizeInput[]
}

export interface UpdateProductInput {
  title?: string
  description?: string
  images?: string[]
  price?: number
  prepayment_amount?: number
  category?: string
  status?: ProductStatus
}

export interface ListProductsParams {
  search?: string
  category?: string
  status?: ProductStatus
  limit?: number
  offset?: number
}

const BASE = "/api/v1/admin/marketplace"

function qs(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === null) continue
    usp.set(k, String(v))
  }
  const s = usp.toString()
  return s ? `?${s}` : ""
}

export const marketplaceApi = {
  uploadImage(file: File) {
    const form = new FormData()
    form.append("file", file)
    return apiClient.post<UploadedImage>(`${BASE}/upload-image`, form)
  },

  listProducts(params: ListProductsParams = {}) {
    return apiClient.get<Product[]>(`${BASE}/products${qs({ ...params })}`)
  },

  getProduct(id: number | string) {
    return apiClient.get<Product>(`${BASE}/products/${id}`)
  },

  createProduct(payload: CreateProductInput) {
    return apiClient.post<Product>(`${BASE}/products`, payload)
  },

  updateProduct(id: number | string, payload: UpdateProductInput) {
    return apiClient.patch<Product>(`${BASE}/products/${id}`, payload)
  },

  deleteProduct(id: number | string) {
    return apiClient.delete<void>(`${BASE}/products/${id}`)
  },

  addSize(productId: number | string, payload: ProductSizeInput) {
    return apiClient.post<ProductSize>(`${BASE}/products/${productId}/sizes`, payload)
  },

  updateSize(sizeId: number | string, payload: Partial<ProductSizeInput>) {
    return apiClient.patch<ProductSize>(`${BASE}/sizes/${sizeId}`, payload)
  },

  deleteSize(sizeId: number | string) {
    return apiClient.delete<void>(`${BASE}/sizes/${sizeId}`)
  },
}

export function formatUZS(value: number): string {
  if (!Number.isFinite(value)) return "0"
  return new Intl.NumberFormat("uz-UZ").format(Math.round(value))
}

export function statusMeta(status: ProductStatus) {
  switch (status) {
    case "active":
      return { label: "Active", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40", ring: "ring-emerald-200/70 dark:ring-emerald-900/60" }
    case "hidden":
      return { label: "Hidden", dot: "bg-zinc-400", text: "text-zinc-700 dark:text-zinc-300", bg: "bg-zinc-100 dark:bg-zinc-900/60", ring: "ring-zinc-200 dark:ring-zinc-800" }
    case "sold_out":
      return { label: "Sold out", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/40", ring: "ring-rose-200/70 dark:ring-rose-900/60" }
  }
}
