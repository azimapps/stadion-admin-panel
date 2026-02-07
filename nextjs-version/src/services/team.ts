import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/teams';

export interface Team {
    id: number;
    name_uz: string;
    name_ru: string;
    logo_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export const teamService = {
    async getAll(): Promise<Team[]> {
        return apiClient.get<Team[]>(`${ENDPOINT}/`);
    },

    async getById(id: string | number): Promise<Team> {
        return apiClient.get<Team>(`${ENDPOINT}/${id}`);
    },

    async create(data: Partial<Team>): Promise<Team> {
        return apiClient.post<Team>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<Team>): Promise<Team> {
        return apiClient.put<Team>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
