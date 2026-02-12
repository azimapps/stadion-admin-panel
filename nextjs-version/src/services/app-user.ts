import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/admin/users';

export interface AppUser {
    id: number;
    phone: string;
    fullname: string | null;
    avatar: string | null;
    is_active: boolean;
    total_orders: number;
    total_spent: number;
    created_at: string;
    updated_at: string;
}

export interface AppUsersResponse {
    total: number;
    skip: number;
    limit: number;
    items: AppUser[];
}

export interface AppUsersParams {
    search?: string;
    sort_by?: 'newest' | 'most_paid';
    skip?: number;
    limit?: number;
}

export const appUsersService = {
    async getAll(params?: AppUsersParams): Promise<AppUsersResponse> {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
        if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
        if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());

        const query = searchParams.toString();
        return apiClient.get<AppUsersResponse>(`${ENDPOINT}/${query ? `?${query}` : ''}`);
    },

    async getById(id: number): Promise<AppUser> {
        return apiClient.get<AppUser>(`${ENDPOINT}/${id}`);
    },
};
