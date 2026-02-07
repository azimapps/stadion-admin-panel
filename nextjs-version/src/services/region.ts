import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/regions';

export interface Region {
    id: number;
    name_uz: string;
    name_ru: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export const regionService = {
    async getAll(): Promise<Region[]> {
        return apiClient.get<Region[]>(`${ENDPOINT}/`);
    },

    async getById(id: string | number): Promise<Region> {
        return apiClient.get<Region>(`${ENDPOINT}/${id}`);
    },

    async create(data: Partial<Region>): Promise<Region> {
        return apiClient.post<Region>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<Region>): Promise<Region> {
        return apiClient.put<Region>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
