import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/admin/notifications';

export interface SendNotificationRequest {
    title_uz: string;
    title_ru: string;
    body_uz: string;
    body_ru: string;
    data?: Record<string, string>;
    user_id?: number;
}

export interface SendNotificationResponse {
    sent: number;
    failed: number;
}

export const notificationService = {
    async send(payload: SendNotificationRequest): Promise<SendNotificationResponse> {
        return apiClient.post<SendNotificationResponse>(`${ENDPOINT}/send`, payload);
    },
};
