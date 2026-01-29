import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/managers';

export interface Manager {
    id: number;
    name: string;
    phone: string;
    stadium_ids: number[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface ManagerFormValues {
    name: string;
    phone: string;
    stadium_ids?: number[];
    is_active?: boolean;
}

export const managersService = {
    async getAll(params?: { skip?: number; limit?: number; is_active?: boolean }): Promise<Manager[]> {
        const searchParams = new URLSearchParams();
        if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
        if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());

        const query = searchParams.toString();
        return apiClient.get<Manager[]>(`${ENDPOINT}/${query ? `?${query}` : ''}`);
    },

    async create(data: ManagerFormValues): Promise<Manager> {
        return apiClient.post<Manager>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<Manager>): Promise<Manager> {
        return apiClient.put<Manager>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    },

    async addStadiumAccess(managerId: number, stadiumId: number): Promise<{ message: string; stadium_ids: number[] }> {
        return apiClient.post(`${ENDPOINT}/${managerId}/stadiums/${stadiumId}`);
    },

    async removeStadiumAccess(managerId: number, stadiumId: number): Promise<{ message: string; stadium_ids: number[] }> {
        return apiClient.delete(`${ENDPOINT}/${managerId}/stadiums/${stadiumId}`);
    }
};
