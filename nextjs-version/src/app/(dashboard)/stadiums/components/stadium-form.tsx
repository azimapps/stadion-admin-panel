"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StadiumFormValues, stadiumSchema } from "./stadium-schema"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadService } from "@/services/upload"
import { Loader2, Plus, Trash, Upload } from "lucide-react"

interface StadiumFormProps {
    initialData?: any; // strict typing can be added later
    onSubmit: (data: StadiumFormValues) => Promise<void>;
    loading?: boolean;
}

export function StadiumForm({ initialData, onSubmit, loading }: StadiumFormProps) {
    const [uploading, setUploading] = useState(false)

    const defaultValues: Partial<StadiumFormValues> = {
        ...initialData,
        is_active: initialData?.is_active ?? true,
        is_metro_near: initialData?.is_metro_near ?? false,
        phones: initialData?.phone ? initialData.phone.map((p: string) => ({ value: p })) : [{ value: "+998" }],
        capacity: initialData?.capacity || "7x7",
        price_per_hour: initialData?.price_per_hour || 0,
    }

    const form = useForm<StadiumFormValues>({
        resolver: zodResolver(stadiumSchema) as any,
        defaultValues,
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "phones",
    })

    const handleSubmit = async (values: StadiumFormValues) => {
        // Transform phones array of objects back to string array for API
        const submissionData = {
            ...values,
            phone: values.phones?.map(p => p.value) || [],
        };
        // Remove internal phones field
        delete (submissionData as any).phones;

        await onSubmit(submissionData as any);
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "main_image" | "images") => {
        if (!e.target.files?.length) return
        setUploading(true)
        try {
            const files = Array.from(e.target.files)
            const result = await uploadService.uploadStadiumImages(files)

            if (result.uploaded?.length) {
                if (fieldName === "main_image") {
                    form.setValue("main_image", result.uploaded[0].url)
                } else {
                    const currentImages = form.getValues("images") || []
                    const newImages = result.uploaded.map(u => u.url)
                    form.setValue("images", [...currentImages, ...newImages])
                }
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Rasmni yuklashda xatolik yuz berdi")
        } finally {
            setUploading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <Tabs defaultValue="main" className="w-full">
                    <TabsList>
                        <TabsTrigger value="main">Asosiy</TabsTrigger>
                        <TabsTrigger value="uz">O&apos;zbekcha</TabsTrigger>
                        <TabsTrigger value="ru">Ruscha</TabsTrigger>
                        <TabsTrigger value="location">Manzil & Metro</TabsTrigger>
                        <TabsTrigger value="details">Batafsil & Narx</TabsTrigger>
                        <TabsTrigger value="media">Media (Rasmlar)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="main" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug (URL uchun)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="stadion-nomi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            Stadion saytda ko&apos;rinadimi?
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div>
                            <FormLabel>Telefon raqamlar</FormLabel>
                            <div className="space-y-2 mt-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <FormField
                                            control={form.control}
                                            name={`phones.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => append({ value: "+998" })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Raqam qo&apos;shish
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="uz" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name_uz"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomi (O&apos;zbekcha)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Chilonzor Arena" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description_uz"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tavsif (O&apos;zbekcha)</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-32" placeholder="Stadion haqida..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address_uz"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manzil (O&apos;zbekcha)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Toshkent sh., ..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="ru" className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name_ru"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomi (Ruscha)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Чилонзор Арена" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description_ru"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tavsif (Ruscha)</FormLabel>
                                    <FormControl>
                                        <Textarea className="h-32" placeholder="О стадионе..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address_ru"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manzil (Ruscha)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="г. Ташкент, ..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="location" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="latitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Kenglik (Latitude)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="any" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="longitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Uzunlik (Longitude)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="any" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="is_metro_near"
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
                                            Metro yaqinmi?
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {form.watch("is_metro_near") && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="metro_station"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Metro bekati</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Chilonzor" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metro_distance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Masofa (km)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sig&apos;imi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="7x7" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price_per_hour"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Soatiga narx (UZS)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="1000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="surface_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maydon qoplamasi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="artificial" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="roof_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tom turi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="covered" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="media" className="space-y-4 pt-4">
                        <FormItem>
                            <FormLabel>Asosiy rasm (Main Image)</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploading}
                                    onChange={(e) => handleImageUpload(e, "main_image")}
                                />
                            </FormControl>
                            {form.watch("main_image") && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.watch("main_image")} alt="Main" className="h-40 w-auto rounded-md object-cover mt-2" />
                            )}
                        </FormItem>

                        <FormItem>
                            <FormLabel>Galereya rasmlari</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    disabled={uploading}
                                    onChange={(e) => handleImageUpload(e, "images")}
                                />
                            </FormControl>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {form.watch("images")?.map((img, i) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img key={i} src={img} alt={`Gallery ${i}`} className="h-24 w-24 rounded-md object-cover" />
                                ))}
                            </div>
                        </FormItem>
                        {uploading && <div className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Yuklanmoqda...</div>}
                    </TabsContent>
                </Tabs>

                <Button type="submit" disabled={loading || uploading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Saqlash
                </Button>
            </form>
        </Form>
    )
}
