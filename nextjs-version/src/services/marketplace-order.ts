import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/admin/marketplace';

export type OrderStatus =
    | 'awaiting_prepayment'
    | 'prepaid'
    | 'confirmed'
    | 'delivery_sent'
    | 'delivery_completed'
    | 'cancelled';

export interface OrderItem {
    id: number;
    product_id: number;
    product_size_id: number;
    quantity: number;
    unit_price: number;
    prepayment_per_unit: number;
    product_title: string;
    size_label: string;
    product_image: string | null;
    line_total: number;
    line_prepayment: number;
}

export interface MarketplaceOrder {
    id: number;
    user_id: number;
    buyer_phone: string;
    buyer_fullname: string;

    address_text: string;
    address_lat: number | null;
    address_lng: number | null;

    items_total: number;
    prepayment_total: number;
    delivery_fee: number | null;
    paid_amount: number;
    total_price: number | null;
    remaining_amount: number | null;

    status: OrderStatus;
    payment_deadline: string | null;

    prepaid_at: string | null;
    confirmed_at: string | null;
    delivery_sent_at: string | null;
    delivery_completed_at: string | null;
    cancelled_at: string | null;

    admin_notes: string | null;
    needs_refund: boolean;

    items: OrderItem[];

    created_at: string;
    updated_at: string;
}

export interface ListOrdersParams {
    status?: OrderStatus;
    needs_refund?: boolean;
    user_id?: number;
    limit?: number;
    offset?: number;
}

function qs(params: ListOrdersParams) {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === '') continue;
        usp.set(k, String(v));
    }
    const s = usp.toString();
    return s ? `?${s}` : '';
}

export const marketplaceOrderService = {
    async list(params: ListOrdersParams = {}): Promise<MarketplaceOrder[]> {
        return apiClient.get<MarketplaceOrder[]>(`${ENDPOINT}/orders${qs(params)}`);
    },

    async getById(id: number | string): Promise<MarketplaceOrder> {
        return apiClient.get<MarketplaceOrder>(`${ENDPOINT}/orders/${id}`);
    },

    async setDeliveryFee(id: number | string, deliveryFee: number): Promise<MarketplaceOrder> {
        return apiClient.patch<MarketplaceOrder>(`${ENDPOINT}/orders/${id}/delivery-fee`, {
            delivery_fee: deliveryFee,
        });
    },

    async markSent(id: number | string): Promise<MarketplaceOrder> {
        return apiClient.patch<MarketplaceOrder>(`${ENDPOINT}/orders/${id}/mark-sent`, {});
    },

    async markDelivered(id: number | string): Promise<MarketplaceOrder> {
        return apiClient.patch<MarketplaceOrder>(`${ENDPOINT}/orders/${id}/mark-delivered`, {});
    },

    async cancel(id: number | string): Promise<MarketplaceOrder> {
        return apiClient.patch<MarketplaceOrder>(`${ENDPOINT}/orders/${id}/cancel`, {});
    },

    async updateNotes(id: number | string, adminNotes: string | null): Promise<MarketplaceOrder> {
        return apiClient.patch<MarketplaceOrder>(`${ENDPOINT}/orders/${id}/notes`, {
            admin_notes: adminNotes,
        });
    },

    async clearRefundFlag(id: number | string): Promise<MarketplaceOrder> {
        return apiClient.patch<MarketplaceOrder>(`${ENDPOINT}/orders/${id}/clear-refund-flag`, {});
    },
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    awaiting_prepayment: "To'lov kutilmoqda",
    prepaid: "Oldindan to'langan",
    confirmed: 'Tasdiqlangan',
    delivery_sent: 'Yetkazilmoqda',
    delivery_completed: 'Yetkazildi',
    cancelled: 'Bekor qilingan',
};

export const ORDER_STATUS_SHORT: Record<OrderStatus, string> = {
    awaiting_prepayment: 'Kutilmoqda',
    prepaid: 'Yangi',
    confirmed: 'Tasdiqlangan',
    delivery_sent: 'Yo\'lda',
    delivery_completed: 'Yakunlandi',
    cancelled: 'Bekor',
};

export interface StatusTone {
    label: string;
    short: string;
    dot: string;
    text: string;
    bg: string;
    ring: string;
    border: string;
    accentText: string;
    softBg: string;
}

export function orderStatusTone(status: OrderStatus): StatusTone {
    switch (status) {
        case 'awaiting_prepayment':
            return {
                label: ORDER_STATUS_LABEL[status],
                short: ORDER_STATUS_SHORT[status],
                dot: 'bg-amber-500',
                text: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-500',
                ring: 'ring-amber-500/30',
                border: 'border-amber-500/40',
                accentText: 'text-amber-500',
                softBg: 'bg-amber-500/10',
            };
        case 'prepaid':
            return {
                label: ORDER_STATUS_LABEL[status],
                short: ORDER_STATUS_SHORT[status],
                dot: 'bg-sky-500',
                text: 'text-sky-600 dark:text-sky-400',
                bg: 'bg-sky-500',
                ring: 'ring-sky-500/30',
                border: 'border-sky-500/40',
                accentText: 'text-sky-500',
                softBg: 'bg-sky-500/10',
            };
        case 'confirmed':
            return {
                label: ORDER_STATUS_LABEL[status],
                short: ORDER_STATUS_SHORT[status],
                dot: 'bg-violet-500',
                text: 'text-violet-600 dark:text-violet-400',
                bg: 'bg-violet-500',
                ring: 'ring-violet-500/30',
                border: 'border-violet-500/40',
                accentText: 'text-violet-500',
                softBg: 'bg-violet-500/10',
            };
        case 'delivery_sent':
            return {
                label: ORDER_STATUS_LABEL[status],
                short: ORDER_STATUS_SHORT[status],
                dot: 'bg-orange-500',
                text: 'text-orange-600 dark:text-orange-400',
                bg: 'bg-orange-500',
                ring: 'ring-orange-500/30',
                border: 'border-orange-500/40',
                accentText: 'text-orange-500',
                softBg: 'bg-orange-500/10',
            };
        case 'delivery_completed':
            return {
                label: ORDER_STATUS_LABEL[status],
                short: ORDER_STATUS_SHORT[status],
                dot: 'bg-emerald-500',
                text: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-500',
                ring: 'ring-emerald-500/30',
                border: 'border-emerald-500/40',
                accentText: 'text-emerald-500',
                softBg: 'bg-emerald-500/10',
            };
        case 'cancelled':
            return {
                label: ORDER_STATUS_LABEL[status],
                short: ORDER_STATUS_SHORT[status],
                dot: 'bg-rose-500',
                text: 'text-rose-600 dark:text-rose-400',
                bg: 'bg-rose-500',
                ring: 'ring-rose-500/30',
                border: 'border-rose-500/40',
                accentText: 'text-rose-500',
                softBg: 'bg-rose-500/10',
            };
    }
}

export const ORDER_STATUS_ORDER: OrderStatus[] = [
    'awaiting_prepayment',
    'prepaid',
    'confirmed',
    'delivery_sent',
    'delivery_completed',
];

export function isTerminalStatus(status: OrderStatus): boolean {
    return status === 'delivery_completed' || status === 'cancelled';
}

export function nextAction(status: OrderStatus):
    | { kind: 'set-fee'; label: string }
    | { kind: 'mark-sent'; label: string }
    | { kind: 'mark-delivered'; label: string }
    | { kind: 'wait-buyer'; label: string }
    | null {
    switch (status) {
        case 'awaiting_prepayment':
            return { kind: 'wait-buyer', label: "Xaridor to'lovini kutmoqda" };
        case 'prepaid':
            return { kind: 'set-fee', label: 'Yetkazib berish narxini belgilash' };
        case 'confirmed':
            return { kind: 'mark-sent', label: "Yo'lga chiqdi" };
        case 'delivery_sent':
            return { kind: 'mark-delivered', label: 'Yetkazildi (naqd qabul qilindi)' };
        default:
            return null;
    }
}

export function formatUZS(value: number | null | undefined): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('uz-UZ').format(Math.round(value));
}

const RTF = new Intl.RelativeTimeFormat('uz', { numeric: 'auto' });

export function formatRelativeTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const diffSec = (date.getTime() - Date.now()) / 1000;
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['year', 60 * 60 * 24 * 365],
        ['month', 60 * 60 * 24 * 30],
        ['day', 60 * 60 * 24],
        ['hour', 60 * 60],
        ['minute', 60],
    ];
    for (const [unit, sec] of units) {
        if (Math.abs(diffSec) >= sec || unit === 'minute') {
            return RTF.format(Math.round(diffSec / sec), unit);
        }
    }
    return 'hozir';
}

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
