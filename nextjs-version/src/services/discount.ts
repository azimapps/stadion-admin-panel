import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/discounts';

export interface Discount {
    id: number;
    stadium_id: number;
    discount_price_per_hour: number;
    start_datetime: string;
    end_datetime: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    stadium_name_uz: string;
    stadium_name_ru: string;
    stadium_slug: string;
}

export interface DiscountListResponse {
    total: number;
    skip: number;
    limit: number;
    items: Discount[];
}

export const discountsService = {
    async getAll(params?: { stadium_id?: number; skip?: number; limit?: number }): Promise<DiscountListResponse> {
        const queryParams = new URLSearchParams();
        if (params?.stadium_id) queryParams.append('stadium_id', params.stadium_id.toString());
        if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = queryString ? `${ENDPOINT}/?${queryString}` : `${ENDPOINT}/`;
        return apiClient.get<DiscountListResponse>(url);
    },

    async getById(id: string | number): Promise<Discount> {
        return apiClient.get<Discount>(`${ENDPOINT}/${id}`);
    },

    async create(data: {
        stadium_id: number;
        discount_price_per_hour: number;
        start_datetime: string;
        end_datetime: string;
    }): Promise<Discount> {
        return apiClient.post<Discount>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<{
        stadium_id: number;
        discount_price_per_hour: number;
        start_datetime: string;
        end_datetime: string;
    }>): Promise<Discount> {
        return apiClient.put<Discount>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
