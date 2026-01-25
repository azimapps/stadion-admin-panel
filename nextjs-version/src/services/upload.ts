import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/api/v1/upload';

export interface UploadResponse {
    uploaded: {
        url: string;
        filename: string;
        content_type: string;
        size: number;
    }[];
    errors: any[];
    total: number;
    success: number;
    failed: number;
}

export const uploadService = {
    async uploadStadiumImages(files: File[]): Promise<UploadResponse> {
        const token = Cookies.get('token');
        if (!token) {
            throw new Error("Authentication token not found. Please log in again.");
        }
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_URL}/stadium-images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        if (response.status === 401) {
            Cookies.remove('token');
            window.location.href = '/sign-in';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || 'Failed to upload images');
        }

        return response.json();
    }
};
