import { apiClient } from '@/lib/api-client';

const ENDPOINT = '/api/v1/admin/finance';

// Stadium Finance
export interface DailyFinance {
    date: string;
    income: number;
    booking_income: number;
    tournament_income: number;
    expenses: number;
    profit: number;
}

export interface Expense {
    id: number;
    stadium_id: number;
    amount: number;
    description: string;
    date: string;
    created_at: string;
}

export interface FinanceSummary {
    total_income: number;
    total_booking_income: number;
    total_tournament_income: number;
    total_expenses: number;
    total_profit: number;
}

export interface StadiumFinanceResponse {
    stadium_id: number;
    stadium_name: string;
    month: number;
    year: number;
    daily: DailyFinance[];
    expenses_list: Expense[];
    summary: FinanceSummary;
}

// Schedule
export interface SlotBooking {
    id: number;
    user_name: string;
    user_phone: string;
    status: 'in_progress' | 'partially_paid' | 'paid' | 'cancelled';
    price: number;
    paid_amount: number;
    is_recurring: boolean;
}

export interface TimeSlot {
    hour: number;
    status: 'available' | 'booked';
    booking?: SlotBooking;
}

export interface ScheduleResponse {
    stadium_id: number;
    stadium_name: string;
    date: string;
    slots: TimeSlot[];
}

export interface MarkPaidResponse {
    id: number;
    status: string;
    price: number;
    paid_amount: number;
    detail: string;
}

export interface CreateExpenseData {
    stadium_id: number;
    amount: number;
    description: string;
    date: string;
}

export const financeService = {
    async getStadiumFinance(stadiumId: number, month: number, year: number): Promise<StadiumFinanceResponse> {
        return apiClient.get<StadiumFinanceResponse>(
            `${ENDPOINT}/stadiums/${stadiumId}?month=${month}&year=${year}`
        );
    },

    async getSchedule(stadiumId: number, date: string): Promise<ScheduleResponse> {
        return apiClient.get<ScheduleResponse>(
            `${ENDPOINT}/stadiums/${stadiumId}/schedule?date=${date}`
        );
    },

    async createExpense(data: CreateExpenseData): Promise<Expense> {
        return apiClient.post<Expense>(`${ENDPOINT}/expenses`, data);
    },

    async updateExpense(id: number, data: Partial<Omit<CreateExpenseData, 'stadium_id'>>): Promise<Expense> {
        return apiClient.put<Expense>(`${ENDPOINT}/expenses/${id}`, data);
    },

    async deleteExpense(id: number): Promise<void> {
        return apiClient.delete(`${ENDPOINT}/expenses/${id}`);
    },

    async markBookingPaid(bookingId: number): Promise<MarkPaidResponse> {
        return apiClient.put<MarkPaidResponse>(`${ENDPOINT}/bookings/${bookingId}/mark-paid`, {});
    },
};
