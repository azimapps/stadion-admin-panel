import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/stadiums';

export interface Stadium {
    id: number;
    slug: string;
    name_uz: string;
    name_ru: string;
    description_uz?: string;
    description_ru?: string;
    address_uz: string;
    address_ru: string;
    latitude?: number;
    longitude?: number;
    is_metro_near?: boolean;
    metro_station?: string;
    metro_distance?: number;
    capacity: string;
    surface_type?: string;
    roof_type?: string;
    price_per_hour: number;
    discount_price_per_hour?: number;
    phone: string[];
    main_image?: string;
    images?: string[];
    is_active?: boolean;
    region_id?: number;
    comfort_ids?: number[];
}

export const stadiumsService = {
    async getAll(): Promise<Stadium[]> {
        return apiClient.get<Stadium[]>(`${ENDPOINT}/`);
    },

    async getById(id: string | number): Promise<Stadium> {
        return apiClient.get<Stadium>(`${ENDPOINT}/${id}`);
    },

    async create(data: Partial<Stadium>): Promise<Stadium> {
        return apiClient.post<Stadium>(`${ENDPOINT}/`, data);
    },

    async update(id: number, data: Partial<Stadium>): Promise<Stadium> {
        return apiClient.put<Stadium>(`${ENDPOINT}/${id}`, data);
    },

    async delete(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/${id}`);
    }
};
