import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/tournaments';

export interface Tournament {
    id: number;
    title_uz: string;
    title_ru: string;
    description_uz: string;
    description_ru: string;
    stadium_id: number;
    start_time: string;
    end_time: string;
    entrance_fee: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface TournamentCreate {
    title_uz: string;
    title_ru: string;
    description_uz?: string;
    description_ru?: string;
    stadium_id: number;
    start_time: string;
    end_time: string;
    entrance_fee?: number;
}

export const tournamentService = {
    async getAll(skip = 0, limit = 100, stadiumId?: number, isActive?: boolean): Promise<Tournament[]> {
        let url = `${ENDPOINT}/?skip=${skip}&limit=${limit}`;
        if (stadiumId) url += `&stadium_id=${stadiumId}`;
        if (isActive !== undefined) url += `&is_active=${isActive}`;
        return apiClient.get<Tournament[]>(url);
    },

    async getById(id: string | number): Promise<Tournament> {
        return apiClient.get<Tournament>(`${ENDPOINT}/${id}`);
    },

    async create(data: TournamentCreate): Promise<Tournament> {
        return apiClient.post<Tournament>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<TournamentCreate>): Promise<Tournament> {
        return apiClient.put<Tournament>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
