"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, ShieldCheck, FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { legalService, LegalDocument } from "@/services/legal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownEditor } from "@/components/markdown-editor"
import { toast } from "sonner"

const legalFormSchema = z.object({
    title_uz: z.string().min(2, "Sarlavha (UZ) kiritilishi shart"),
    title_ru: z.string().min(2, "Sarlavha (RU) kiritilishi shart"),
    content_uz: z.string().min(2, "Matn (UZ) kiritilishi shart"),
    content_ru: z.string().min(2, "Matn (RU) kiritilishi shart"),
})

type LegalFormValues = z.infer<typeof legalFormSchema>

export default function LegalPage() {
    const [activeTab, setActiveTab] = useState("terms")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const form = useForm<LegalFormValues>({
        resolver: zodResolver(legalFormSchema),
        defaultValues: {
            title_uz: "",
            title_ru: "",
            content_uz: "",
            content_ru: "",
        },
    })

    useEffect(() => {
        loadData(activeTab)
    }, [activeTab])

    async function loadData(type: string) {
        setLoading(true)
        try {
            let data: LegalDocument
            if (type === "terms") {
                data = await legalService.getTerms()
            } else {
                data = await legalService.getPrivacy()
            }
            form.reset({
                title_uz: data.title_uz || "",
                title_ru: data.title_ru || "",
                content_uz: data.content_uz || "",
                content_ru: data.content_ru || "",
            })
        } catch (error) {
            console.error("Failed to load legal document:", error)
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: LegalFormValues) {
        setSaving(true)
        try {
            if (activeTab === "terms") {
                await legalService.updateTerms(values)
                toast.success("Foydalanish shartlari saqlandi")
            } else {
                await legalService.updatePrivacy(values)
                toast.success("Maxfiylik siyosati saqlandi")
            }
        } catch (error) {
            console.error("Failed to save legal document:", error)
            toast.error("Ma'lumotlarni saqlashda xatolik yuz berdi")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight">Hujjatlar</h2>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Platformaning huquqiy hujjatlari, foydalanish shartlari va maxfiylik siyosati.
                    </p>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-8"
            >
                <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl h-14 p-1.5 bg-muted/50">
                    <TabsTrigger value="terms" className="rounded-lg text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                        <FileText className="w-4 h-4 mr-2" />
                        Foydalanish shartlari
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="rounded-lg text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Maxfiylik siyosati
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex items-center justify-center p-20 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-card rounded-2xl p-8 border border-border shadow-sm">
                            <Tabs defaultValue="uz" className="w-full">
                                <TabsList className="grid w-fit grid-cols-2 rounded-xl h-12 p-1 bg-muted/50 mb-8">
                                    <TabsTrigger value="uz" className="rounded-lg px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Uzbekcha</TabsTrigger>
                                    <TabsTrigger value="ru" className="rounded-lg px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Русский</TabsTrigger>
                                </TabsList>

                                <TabsContent value="uz" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title_uz"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sarlavha (UZ)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Hujjat sarlavhasini kiriting" className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold text-lg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content_uz"
                                        render={({ field }) => (
                                            <FormItem>
                                                <MarkdownEditor
                                                    label="Maqola matni (Markdown)"
                                                    placeholder="Maqola matnini yozish uchun bosing"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="ru" className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title_ru"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Заголовок (RU)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Введите заголовок документа" className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold text-lg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content_ru"
                                        render={({ field }) => (
                                            <FormItem>
                                                <MarkdownEditor
                                                    label="Текст статьи (Markdown)"
                                                    placeholder="Нажмите, чтобы написать текст статьи"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end pt-8 border-t">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    size="lg"
                                    className="rounded-xl bg-primary px-12 h-14 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </Tabs>
        </div>
    )
}
