"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Video, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Media } from "@/services/media"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"

const mediaFormSchema = z.object({
    title_uz: z.string().min(2, {
        message: "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak.",
    }),
    title_ru: z.string().min(2, {
        message: "Заголовок должен содержать минимум 2 символа.",
    }),
    content_uz: z.string().min(10, {
        message: "Tarkib kamida 10 ta belgidan iborat bo'lishi kerak.",
    }),
    content_ru: z.string().min(10, {
        message: "Контент должен содержать минимум 10 символов.",
    }),
    youtube_video_link: z.string().url({
        message: "To'g'ri YouTube havolasini kiriting.",
    }).refine((val) => val.includes('youtube.com') || val.includes('youtu.be'), {
        message: "Havola YouTube manzili bo'lishi kerak.",
    }),
})

type MediaFormValues = z.infer<typeof mediaFormSchema>

interface MediaFormDialogProps {
    onAddMedia?: (media: MediaFormValues) => Promise<void>
    onEditMedia?: (id: number, media: MediaFormValues) => Promise<void>
    onDeleteMedia?: (id: number) => Promise<void>
    media?: Media
    trigger?: React.ReactNode
}

export function MediaFormDialog({ onAddMedia, onEditMedia, onDeleteMedia, media, trigger }: MediaFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const isEditing = !!media

    const form = useForm<MediaFormValues>({
        resolver: zodResolver(mediaFormSchema),
        defaultValues: {
            title_uz: media?.title_uz || "",
            title_ru: media?.title_ru || "",
            content_uz: media?.content_uz || "",
            content_ru: media?.content_ru || "",
            youtube_video_link: media?.youtube_video_link || "",
        },
    })

    // Reset form when media changes or dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                title_uz: media?.title_uz || "",
                title_ru: media?.title_ru || "",
                content_uz: media?.content_uz || "",
                content_ru: media?.content_ru || "",
                youtube_video_link: media?.youtube_video_link || "",
            })
        }
    }, [open, media, form])

    async function onSubmit(data: MediaFormValues) {
        setLoading(true)
        try {
            if (isEditing && media && onEditMedia) {
                await onEditMedia(media.id, data)
            } else if (onAddMedia) {
                await onAddMedia(data)
            }
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (media && onDeleteMedia) {
            setLoading(true)
            try {
                await onDeleteMedia(media.id)
                setOpen(false)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="cursor-pointer rounded-xl bg-primary shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95">
                        <Plus className="mr-2 h-5 w-5 stroke-[2.5]" />
                        Yangi media
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden text-foreground">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>{isEditing ? "Media kontentni tahrirlash" : "Yangi media qo'shish"}</DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? "Media ma'lumotlarini o'zgartiring. Barcha maydonlarni tekshiring."
                                    : "Tizimga yangi media kontent qo'shing. Barcha maydonlarni to'ldiring."}
                            </DialogDescription>
                        </div>
                        {isEditing && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-xl shadow-lg shadow-destructive/20"
                                onClick={() => setShowDeleteConfirm(true)}
                                type="button"
                                disabled={loading}
                            >
                                <Trash2 className="size-5" />
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <ConfirmDeleteDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                    onConfirm={handleDelete}
                    loading={loading}
                    title="Media kontent o'chirilsinmi?"
                    description={`"${media?.title_uz}" degan media kontentni o'chirmoqchimisiz?`}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
                        <FormField
                            control={form.control}
                            name="youtube_video_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>YouTube Video Link</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input placeholder="https://www.youtube.com/watch?v=..." className="pl-10 h-11 bg-background/50" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Tabs defaultValue="uz" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl h-11 p-1 bg-muted/50">
                                <TabsTrigger value="uz" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Uzbekcha</TabsTrigger>
                                <TabsTrigger value="ru" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Русский</TabsTrigger>
                            </TabsList>

                            <TabsContent value="uz" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="title_uz"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sarlavha (UZ)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Video sarlavhasini kiriting" className="h-11 bg-background/50" {...field} />
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
                                            <FormLabel>Tarkib (UZ) - Markdown qo'llab-quvvatlanadi</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Video haqida batafsil ma'lumot..."
                                                    className="min-h-[200px] bg-background/50 resize-none font-mono text-sm shadow-inner"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="ru" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="title_ru"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Заголовок (RU)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Введите заголовок видео" className="h-11 bg-background/50" {...field} />
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
                                            <FormLabel>Контент (RU) - Поддержка Markdown</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Подробное описание видео..."
                                                    className="min-h-[200px] bg-background/50 resize-none font-mono text-sm shadow-inner"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>
                    </form>
                </Form>

                <DialogFooter className="p-6 pt-2 border-t bg-muted/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-6 h-11"
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        className="cursor-pointer rounded-xl bg-primary px-8 h-11 shadow-lg shadow-primary/20"
                        disabled={loading}
                    >
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
