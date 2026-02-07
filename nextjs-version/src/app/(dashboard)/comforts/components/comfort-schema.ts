import { z } from "zod"

export const comfortSchema = z.object({
    title_uz: z.string().min(1, "Nomini kiriting (UZ)"),
    title_ru: z.string().min(1, "Nomini kiriting (RU)"),
    image_url: z.string().url("Rasm URL haqiqiy bo'lishi kerak").optional().or(z.literal("")),
    is_active: z.boolean().default(true),
})

export type ComfortFormValues = z.infer<typeof comfortSchema>
