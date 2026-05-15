import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/admin/marketplace';

export type ProductStatus = 'active' | 'hidden' | 'sold_out';

export interface ProductSize {
    id: number;
    size_label: string;
    hint_label: string | null;
    stock: number;
}

export interface Product {
    id: number;
    title: string;
    description: string | null;
    images: string[];
    price: number;
    prepayment_amount: number;
    category: string | null;
    status: ProductStatus;
    likes_count: number;
    sizes: ProductSize[];
    is_liked_by_me: boolean;
    total_stock: number;
    created_at: string;
    updated_at: string;
}

export interface MarketplaceUploadedImage {
    url: string;
    filename: string;
    size: number;
}

export interface ProductSizeInput {
    size_label: string;
    hint_label?: string | null;
    stock: number;
}

export interface CreateProductInput {
    title: string;
    description?: string;
    images?: string[];
    price: number;
    prepayment_amount: number;
    category?: string;
    status?: ProductStatus;
    sizes?: ProductSizeInput[];
}

export interface UpdateProductInput {
    title?: string;
    description?: string;
    images?: string[];
    price?: number;
    prepayment_amount?: number;
    category?: string;
    status?: ProductStatus;
}

export interface ListProductsParams {
    search?: string;
    category?: string;
    status?: ProductStatus;
    limit?: number;
    offset?: number;
}

function qs(params: ListProductsParams) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === '' || v === null) continue;
        usp.set(k, String(v));
    }
    const s = usp.toString();
    return s ? `?${s}` : '';
}

export const marketplaceService = {
    async uploadImage(file: File): Promise<MarketplaceUploadedImage> {
        const form = new FormData();
        form.append('file', file);
        return apiClient.post<MarketplaceUploadedImage>(`${ENDPOINT}/upload-image`, form);
    },

    async list(params: ListProductsParams = {}): Promise<Product[]> {
        return apiClient.get<Product[]>(`${ENDPOINT}/products${qs(params)}`);
    },

    async getById(id: number | string): Promise<Product> {
        return apiClient.get<Product>(`${ENDPOINT}/products/${id}`);
    },

    async create(payload: CreateProductInput): Promise<Product> {
        return apiClient.post<Product>(`${ENDPOINT}/products`, payload);
    },

    async update(id: number | string, payload: UpdateProductInput): Promise<Product> {
        return apiClient.patch<Product>(`${ENDPOINT}/products/${id}`, payload);
    },

    async delete(id: number | string): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/products/${id}`);
    },

    async addSize(productId: number | string, payload: ProductSizeInput): Promise<ProductSize> {
        return apiClient.post<ProductSize>(`${ENDPOINT}/products/${productId}/sizes`, payload);
    },

    async updateSize(sizeId: number | string, payload: Partial<ProductSizeInput>): Promise<ProductSize> {
        return apiClient.patch<ProductSize>(`${ENDPOINT}/sizes/${sizeId}`, payload);
    },

    async deleteSize(sizeId: number | string): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/sizes/${sizeId}`);
    },
};

export function formatUZS(value: number): string {
    if (!Number.isFinite(value)) return '0';
    return new Intl.NumberFormat('uz-UZ').format(Math.round(value));
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
    active: 'Faol',
    hidden: 'Yashirin',
    sold_out: 'Tugagan',
};

export function statusTone(status: ProductStatus): {
    label: string;
    dot: string;
    text: string;
    bg: string;
    ring: string;
} {
    switch (status) {
        case 'active':
            return {
                label: 'Faol',
                dot: 'bg-emerald-500',
                text: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-500/10',
                ring: 'ring-emerald-500/30',
            };
        case 'hidden':
            return {
                label: 'Yashirin',
                dot: 'bg-zinc-400',
                text: 'text-zinc-600 dark:text-zinc-300',
                bg: 'bg-zinc-500/10',
                ring: 'ring-zinc-500/30',
            };
        case 'sold_out':
            return {
                label: 'Tugagan',
                dot: 'bg-rose-500',
                text: 'text-rose-600 dark:text-rose-400',
                bg: 'bg-rose-500/10',
                ring: 'ring-rose-500/30',
            };
    }
}
