import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/comforts';

export interface Comfort {
    id: number;
    title_uz: string;
    title_ru: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export const comfortService = {
    async getAll(): Promise<Comfort[]> {
        return apiClient.get<Comfort[]>(`${ENDPOINT}/`);
    },

    async getById(id: string | number): Promise<Comfort> {
        return apiClient.get<Comfort>(`${ENDPOINT}/${id}`);
    },

    async create(data: Partial<Comfort>): Promise<Comfort> {
        return apiClient.post<Comfort>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<Comfort>): Promise<Comfort> {
        return apiClient.put<Comfort>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
