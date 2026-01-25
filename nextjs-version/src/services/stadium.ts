import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/v1/stadiums';

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
    phone: string[];
    main_image?: string;
    images?: string[];
    is_active?: boolean;
}

export const stadiumsService = {
    async getAll(): Promise<Stadium[]> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch stadiums');
        return response.json();
    },

    async getById(id: string | number): Promise<Stadium> {
        // GET /:id is public, but we send token if available
        const token = Cookies.get('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/${id}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch stadium details');
        return response.json();
    },

    async create(data: Partial<Stadium>): Promise<Stadium> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create stadium');
        return response.json();
    },

    async update(id: number, data: Partial<Stadium>): Promise<Stadium> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT', // or PATCH depending on backend, backend docs say PUT
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update stadium');
        return response.json();
    },

    async delete(id: number): Promise<void> {
        const token = Cookies.get('token');
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete stadium');
    }
};
