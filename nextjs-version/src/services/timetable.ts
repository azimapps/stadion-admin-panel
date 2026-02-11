import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/timetables';

export interface Timetable {
    id: number;
    stadium_id: number;
    monday: number[];
    tuesday: number[];
    wednesday: number[];
    thursday: number[];
    friday: number[];
    saturday: number[];
    sunday: number[];
}

export type TimetableUpdate = Partial<Omit<Timetable, 'id' | 'stadium_id'>>;

export const timetableService = {
    async getAll(skip = 0, limit = 100): Promise<Timetable[]> {
        return apiClient.get<Timetable[]>(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    },

    async getByStadiumId(stadiumId: number): Promise<Timetable> {
        return apiClient.get<Timetable>(`${ENDPOINT}/stadium/${stadiumId}`);
    },

    async createOrUpdate(stadiumId: number, data: TimetableUpdate): Promise<Timetable> {
        return apiClient.put<Timetable>(`${ENDPOINT}/stadium/${stadiumId}`, data);
    },

    async delete(stadiumId: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/stadium/${stadiumId}`);
    }
};
