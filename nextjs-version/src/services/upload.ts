import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/upload';

export interface UploadedFile {
    url: string;
    filename: string;
    content_type: string;
    size: number;
    folder: string;
}

export interface UploadResponse {
    uploaded: UploadedFile[];
    errors: unknown[];
    total: number;
    success: number;
    failed: number;
}

export const uploadService = {
    async uploadImage(file: File, folder: string = 'general'): Promise<UploadedFile> {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<UploadedFile>(`${ENDPOINT}/image?folder=${folder}`, formData);
    },

    // Helper for backward compatibility with StadiumForm which sends multiple files
    async uploadStadiumImages(files: File[]): Promise<UploadResponse> {
        const results: UploadedFile[] = [];
        const errors: any[] = [];

        await Promise.all(
            files.map(async (file) => {
                try {
                    const result = await this.uploadImage(file, 'stadiums');
                    results.push(result);
                } catch (err) {
                    errors.push(err);
                }
            })
        );

        return {
            uploaded: results,
            errors: errors,
            total: files.length,
            success: results.length,
            failed: errors.length
        };
    }
};
