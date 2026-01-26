import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/upload';

export interface UploadResponse {
    uploaded: {
        url: string;
        filename: string;
        content_type: string;
        size: number;
    }[];
    errors: unknown[];
    total: number;
    success: number;
    failed: number;
}

export const uploadService = {
    async uploadStadiumImages(files: File[]): Promise<UploadResponse> {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        return apiClient.post<UploadResponse>(`${ENDPOINT}/stadium-images`, formData);
    }
};
