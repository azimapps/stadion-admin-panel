import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/media';

export interface Media {
    id: number;
    title_uz: string;
    title_ru: string;
    content_uz: string;
    content_ru: string;
    youtube_video_link: string;
    created_at: string;
    updated_at: string;
}

export const mediaService = {
    async getAll(skip = 0, limit = 100): Promise<Media[]> {
        return apiClient.get<Media[]>(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    },

    async getById(id: string | number): Promise<Media> {
        return apiClient.get<Media>(`${ENDPOINT}/${id}`);
    },

    async create(data: Omit<Media, 'id' | 'created_at' | 'updated_at'>): Promise<Media> {
        return apiClient.post<Media>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<Media>): Promise<Media> {
        return apiClient.put<Media>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
