import { z } from "zod";

export const stadiumSchema = z.object({
    slug: z.string().min(1, "Slug kiritish shart"),
    name_uz: z.string().min(1, "O'zbekcha nomini kiritish shart"),
    name_ru: z.string().min(1, "Ruscha nomini kiritish shart"),
    description_uz: z.string().optional(),
    description_ru: z.string().optional(),
    address_uz: z.string().min(1, "O'zbekcha manzilni kiritish shart"),
    address_ru: z.string().min(1, "Ruscha manzilni kiritish shart"),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    is_metro_near: z.boolean().default(false).optional(),
    metro_station: z.string().optional(),
    metro_distance: z.coerce.number().optional(),
    capacity: z.string().min(1, "Sig'imini kiritish shart"), // 7x7, 5x5 etc
    surface_type: z.string().optional(),
    roof_type: z.string().optional(),
    price_per_hour: z.coerce.number().min(0, "Narx 0 dan katta bo'lishi kerak"),
    phones: z.array(z.object({ value: z.string().min(1, "Raqam kiritish shart") })).min(1, "Kamida bitta telefon raqam kiritish shart").optional(),
    main_image: z.string().optional(),
    images: z.array(z.string()).optional(),
    is_active: z.boolean().default(true).optional(),
});

export type StadiumFormValues = z.infer<typeof stadiumSchema>;
