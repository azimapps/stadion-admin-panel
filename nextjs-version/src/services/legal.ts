import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/admin/legal';

export interface LegalDocument {
    title_uz: string;
    title_ru: string;
    content_uz: string;
    content_ru: string;
    updated_at: string;
}

export type UpdateLegalDocument = Partial<Omit<LegalDocument, 'updated_at'>>;

export const legalService = {
    async getTerms(): Promise<LegalDocument> {
        return apiClient.get<LegalDocument>(`${ENDPOINT}/terms`);
    },

    async updateTerms(data: UpdateLegalDocument): Promise<LegalDocument> {
        return apiClient.put<LegalDocument>(`${ENDPOINT}/terms`, data);
    },

    async getPrivacy(): Promise<LegalDocument> {
        return apiClient.get<LegalDocument>(`${ENDPOINT}/privacy`);
    },

    async updatePrivacy(data: UpdateLegalDocument): Promise<LegalDocument> {
        return apiClient.put<LegalDocument>(`${ENDPOINT}/privacy`, data);
    }
};
