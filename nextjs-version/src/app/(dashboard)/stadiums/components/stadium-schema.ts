import { z } from "zod";

export const stadiumSchema = z.object({
    slug: z.string().default("").transform(val => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).refine(val => val.length > 0, "Slug kiritish shart"),
    name_uz: z.string().default("").refine(val => val.length > 0, "O'zbekcha nomini kiritish shart"),
    name_ru: z.string().default("").refine(val => val.length > 0, "Ruscha nomini kiritish shart"),
    description_uz: z.string().default("").refine(val => val.length > 0, "O'zbekcha tavsif kiritish shart"),
    description_ru: z.string().default("").refine(val => val.length > 0, "Ruscha tavsif kiritish shart"),
    address_uz: z.string().default("").refine(val => val.length > 0, "O'zbekcha manzilni kiritish shart"),
    address_ru: z.string().default("").refine(val => val.length > 0, "Ruscha manzilni kiritish shart"),
    latitude: z.coerce.number().refine(val => !isNaN(val) && val !== 0 && val >= -90 && val <= 90, "Xaritadan joylashuvni tanlash shart"),
    longitude: z.coerce.number().refine(val => !isNaN(val) && val !== 0 && val >= -180 && val <= 180, "Xaritadan joylashuvni tanlash shart"),
    is_metro_near: z.boolean().default(false).optional(),
    metro_station: z.string().optional(),
    metro_distance: z.coerce.number().optional(),
    capacity: z.string().default("").refine(val => val.length > 0, "Sig'imini tanlash shart"),
    surface_type: z.string().optional(),
    roof_type: z.string().optional(),
    price_per_hour: z.coerce.number().min(100000, "Narx kamida 100,000 so'm bo'lishi shart"),
    phones: z.array(z.object({ value: z.string().min(1, "Raqam kiritish shart") })).min(1, "Kamida bitta telefon raqam kiritish shart").optional(),
    main_image: z.string().default("").refine(val => val.length > 0, "Asosiy rasmni yuklash shart"),
    images: z.array(z.string()).default([]).refine(val => val.length > 0, "Kamida bitta qo'shimcha rasm yuklash shart"),
    is_active: z.boolean().default(true).optional(),
}).superRefine((data, ctx) => {
    if (data.is_metro_near) {
        if (!data.metro_station || data.metro_station.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Metro bekatini tanlash shart",
                path: ["metro_station"],
            });
        }
        if (!data.metro_distance || data.metro_distance <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Masofani kiritish shart",
                path: ["metro_distance"],
            });
        }
    }
});

export type StadiumFormValues = z.infer<typeof stadiumSchema>;
