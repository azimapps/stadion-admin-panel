import { z } from "zod";

export const discountSchema = z.object({
    stadium_id: z.coerce.number().min(1, "Stadium tanlanishi shart"),
    discount_price_per_hour: z.coerce.number().min(1, "Chegirma narxi 0 dan katta bo'lishi kerak"),
    start_datetime: z.string().min(1, "Boshlanish vaqti majburiy"),
    end_datetime: z.string().min(1, "Tugash vaqti majburiy"),
}).refine((data) => {
    return new Date(data.end_datetime) > new Date(data.start_datetime);
}, {
    message: "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak",
    path: ["end_datetime"],
});

export type DiscountFormValues = z.infer<typeof discountSchema>;
