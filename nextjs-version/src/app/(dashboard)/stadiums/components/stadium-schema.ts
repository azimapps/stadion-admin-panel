import { z } from "zod";

export const stadiumSchema = z.object({
    slug: z.string().default("").transform(val => val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).refine(val => val.length > 0, "Slug kiritish shart"),
    name_uz: z.string().default("").refine(val => val.length > 0, "O'zbekcha nomini kiritish shart"),
    name_ru: z.string().default("").refine(val => val.length > 0, "Ruscha nomini kiritish shart"),
    description_uz: z.string().optional(),
    description_ru: z.string().optional(),
    address_uz: z.string().default("").refine(val => val.length > 0, "O'zbekcha manzilni kiritish shart"),
    address_ru: z.string().default("").refine(val => val.length > 0, "Ruscha manzilni kiritish shart"),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    is_metro_near: z.boolean().default(false).optional(),
    metro_station: z.string().optional(),
    metro_distance: z.coerce.number().optional(),
    capacity: z.string().default("").refine(val => val.length > 0, "Sig'imini tanlash shart"),
    surface_type: z.string().optional(),
    roof_type: z.string().optional(),
    price_per_hour: z.coerce.number().default(0),
    phones: z.array(z.object({ value: z.string().min(1, "Raqam kiritish shart") })).min(1, "Kamida bitta telefon raqam kiritish shart").optional(),
    main_image: z.string().optional(),
    images: z.array(z.string()).optional(),
    is_active: z.boolean().default(true).optional(),
});

export type StadiumFormValues = z.infer<typeof stadiumSchema>;
