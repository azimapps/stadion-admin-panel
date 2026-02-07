"use client"

import { ImageUpload } from "@/components/ui/image-upload"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TeamFormValues, teamSchema } from "./team-schema"
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
import { teamService } from "@/services/team"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function TeamForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema) as any, // Cast to any to avoid generic type mismatch issues
        defaultValues: {
            name_uz: "",
            name_ru: "",
            logo_url: "",
            is_active: true,
        },
    })

    const onSubmit = async (values: TeamFormValues) => {
        setLoading(true)
        try {
            await teamService.create(values)
            toast.success("Jamoa muvaffaqiyatli yaratildi")
            router.push("/teams")
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
                    <h2 className="text-2xl font-bold tracking-tight">Yangi jamoa</h2>
                    <p className="text-muted-foreground">Yangi jamoa qo&apos;shish</p>
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
                                        Jamoa saytda ko&apos;rinadimi?
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name_uz"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomi (UZ)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Paxtakor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name_ru"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomi (RU)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Пахтакор" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>



                    <FormField
                        control={form.control}
                        name="logo_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        folder="teams"
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Jamoa logotipini yuklang.
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
