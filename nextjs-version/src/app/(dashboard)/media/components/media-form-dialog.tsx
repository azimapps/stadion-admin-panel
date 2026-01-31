"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, Video, Plus } from "lucide-react"

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
import { Media, mediaService } from "@/services/media"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { MarkdownEditor } from "@/components/markdown-editor"

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
        message: "To'g'ri YouTube linkini kiriting.",
    }),
})

type MediaFormValues = z.infer<typeof mediaFormSchema>

interface MediaFormDialogProps {
    media?: Media
    onAddMedia?: (data: MediaFormValues) => Promise<void>
    onEditMedia?: (id: number, data: MediaFormValues) => Promise<void>
    onDeleteMedia?: (id: number) => Promise<void>
}

export function MediaFormDialog({
    media,
    onAddMedia,
    onEditMedia,
    onDeleteMedia,
}: MediaFormDialogProps) {
    const isEditing = !!media
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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

    async function onSubmit(values: MediaFormValues) {
        setLoading(true)
        try {
            if (isEditing && onEditMedia && media) {
                await onEditMedia(media.id, values)
            } else if (onAddMedia) {
                await onAddMedia(values)
            }
            setOpen(false)
            form.reset()
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (media && onDeleteMedia) {
            setLoading(true)
            try {
                await onDeleteMedia(media.id)
                setShowDeleteConfirm(false)
                setOpen(false)
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEditing ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                    >
                        <Plus className="h-4 w-4 rotate-45 scale-125" />
                    </Button>
                ) : (
                    <Button className="h-11 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        <Plus className="h-5 w-5" />
                        Yangi media
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden text-foreground">
                <DialogHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">{isEditing ? "Media tahrirlash" : "Yangi media qo'shish"}</DialogTitle>
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 pt-2 space-y-8">
                        <FormField
                            control={form.control}
                            name="youtube_video_link"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">YouTube Video Link</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input placeholder="https://www.youtube.com/watch?v=..." className="pl-12 h-14 bg-muted/20 border-border/50 rounded-xl" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Tabs defaultValue="uz" className="w-full">
                            <TabsList className="grid w-fit grid-cols-2 rounded-xl h-12 p-1 bg-muted/50">
                                <TabsTrigger value="uz" className="rounded-lg px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Uzbekcha</TabsTrigger>
                                <TabsTrigger value="ru" className="rounded-lg px-8 data-[state=active]:bg-background data-[state=active]:shadow-sm">Русский</TabsTrigger>
                            </TabsList>

                            <TabsContent value="uz" className="space-y-6 mt-8">
                                <FormField
                                    control={form.control}
                                    name="title_uz"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sarlavha (UZ)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Video sarlavhasini kiriting" className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold text-lg" {...field} />
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

                            <TabsContent value="ru" className="space-y-6 mt-8">
                                <FormField
                                    control={form.control}
                                    name="title_ru"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Заголовок (RU)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Введите заголовок видео" className="h-14 bg-muted/20 border-border/50 rounded-xl font-bold text-lg" {...field} />
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
                    </form>
                </Form>

                <DialogFooter className="p-8 pt-4 border-t bg-muted/10">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-10 h-12 font-bold"
                        disabled={loading}
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                        className="rounded-xl bg-primary px-12 h-12 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        disabled={loading}
                    >
                        {loading ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
