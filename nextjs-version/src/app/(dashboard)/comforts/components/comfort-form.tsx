"use client"

import { ImageUpload } from "@/components/ui/image-upload"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ComfortFormValues, comfortSchema } from "./comfort-schema"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { comfortService } from "@/services/comfort"
import { useRouter } from "next/navigation"
import { Loader2, Languages } from "lucide-react"
import { toast } from "sonner"

export function ComfortForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [translating, setTranslating] = useState(false)

    const form = useForm<ComfortFormValues>({
        resolver: zodResolver(comfortSchema) as any,
        defaultValues: {
            title_uz: "",
            title_ru: "",
            image_url: "",
            is_active: true,
        },
    })

    async function translateToRussian() {
        const titleUz = form.getValues("title_uz")
        if (!titleUz) {
            toast.error("Avval o'zbek tilidagi maydonni to'ldiring")
            return
        }
        setTranslating(true)
        try {
            const res = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=uz&tl=ru&dt=t&q=${encodeURIComponent(titleUz)}`
            )
            const data = await res.json()
            const translated = (data[0] as Array<[string]>).map((s) => s[0]).join("")
            form.setValue("title_ru", translated, { shouldValidate: true })
            toast.success("Rus tiliga tarjima qilindi!")
        } catch {
            toast.error("Tarjima qilishda xatolik yuz berdi")
        } finally {
            setTranslating(false)
        }
    }

    const onSubmit = async (values: ComfortFormValues) => {
        setLoading(true)
        try {
            await comfortService.create(values)
            toast.success("Qulaylik muvaffaqiyatli yaratildi")
            router.push("/comforts")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Yangi qulaylik</h2>
                    <p className="text-muted-foreground">Yangi qulaylik qo&apos;shish</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Aktiv holatda
                                    </FormLabel>
                                    <FormDescription>
                                        Saytda ko&apos;rinadimi?
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="title_uz"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomi (UZ)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Wi-Fi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title_ru"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomi (RU)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Wi-Fi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={translateToRussian}
                            disabled={translating || loading}
                            className="rounded-xl"
                        >
                            {translating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Languages className="mr-2 h-4 w-4" />
                            )}
                            {translating ? "Tarjima qilinmoqda..." : "Rus tiliga tarjima qilish"}
                        </Button>
                    </div>

                    <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rasm</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        folder="comforts"
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Qulaylik rasmini yuklang.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex gap-4 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            Bekor qilish
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Saqlash
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
