import { z } from "zod"

export const teamSchema = z.object({
    name_uz: z.string().min(1, "Nomini kiriting (UZ)"),
    name_ru: z.string().min(1, "Nomini kiriting (RU)"),
    logo_url: z.string().url("Rasm URL haqiqiy bo'lishi kerak").optional().or(z.literal("")),
    is_active: z.boolean().default(true),
})

export type TeamFormValues = z.infer<typeof teamSchema>
