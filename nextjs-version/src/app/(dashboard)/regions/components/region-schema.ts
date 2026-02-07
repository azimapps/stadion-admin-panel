import { z } from "zod"

export const regionSchema = z.object({
    name_uz: z.string().min(1, "Nomini kiriting (UZ)"),
    name_ru: z.string().min(1, "Nomini kiriting (RU)"),
    is_active: z.boolean().default(true),
})

export type RegionFormValues = z.infer<typeof regionSchema>
