"use client"

import { useState, useRef } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CAPACITY_TYPES, METRO_STATIONS, ROOF_TYPES, SURFACE_TYPES } from "./stadium-constants"
import { uploadService } from "@/services/upload"
import { Loader2, Plus, Trash, Upload } from "lucide-react"
import dynamic from "next/dynamic"

const LocationPicker = dynamic(() => import('./location-picker'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground">Xarita yuklanmoqda...</div>
})

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
        phones: initialData?.phone ? initialData.phone.map((p: string) => ({ value: p })) : [{ value: "" }],
        capacity: initialData?.capacity || "7x7",
        price_per_hour: initialData?.price_per_hour || 200000,
        surface_type: initialData?.surface_type || "artificial",
        roof_type: initialData?.roof_type || "open",
    }

    const form = useForm<StadiumFormValues>({
        resolver: zodResolver(stadiumSchema) as any,
        defaultValues,
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "phones",
    })

    const fileMap = useRef<Map<string, File>>(new Map())

    const handleSubmit = async (values: StadiumFormValues) => {
        setUploading(true);
        try {
            // Identify pending files
            const filesToUpload: File[] = [];
            const blobToUrlMap = new Map<string, string>();

            const mainImage = values.main_image;
            if (mainImage && mainImage.startsWith('blob:')) {
                const file = fileMap.current.get(mainImage);
                if (file) filesToUpload.push(file);
            }

            const galleryImages = values.images || [];
            galleryImages.forEach(img => {
                if (img.startsWith('blob:')) {
                    const file = fileMap.current.get(img);
                    if (file) filesToUpload.push(file);
                }
            });

            // Upload pending files
            if (filesToUpload.length > 0) {
                const result = await uploadService.uploadStadiumImages(filesToUpload);

                // Map uploaded files back to their blobs via filename/order or assume sequential handling?
                // `uploadService` preserves order.
                // We need to match which file corresponds to which URL.
                // Let's iterate filesToUpload and result.uploaded together.

                if (result.uploaded.length !== filesToUpload.length) {
                    throw new Error("Mismatch in uploaded file count");
                }

                filesToUpload.forEach((file, index) => {
                    // We need to find the blob URL that corresponds to this file
                    // Inverse lookup in fileMap is slow, but we can iterate the map.
                    for (const [blob, f] of fileMap.current.entries()) {
                        if (f === file) {
                            blobToUrlMap.set(blob, result.uploaded[index].url);
                            break;
                        }
                    }
                });
            }

            // Replace blobs with real URLs
            let finalMainImage = values.main_image;
            if (finalMainImage && finalMainImage.startsWith('blob:')) {
                finalMainImage = blobToUrlMap.get(finalMainImage) || finalMainImage;
            }

            const finalImages = (values.images || []).map(img => {
                if (img.startsWith('blob:')) {
                    return blobToUrlMap.get(img) || img;
                }
                return img;
            });

            // Transform phones array of objects back to string array for API
            const submissionData = {
                ...values,
                main_image: finalMainImage,
                images: finalImages,
                phone: values.phones?.map(p => p.value) || [],
            };
            // Remove internal phones field
            delete (submissionData as any).phones;

            await onSubmit(submissionData as any);
        } catch (error) {
            console.error("Submission error:", error);
            alert("Ma'lumotlarni saqlashda xatolik yuz berdi");
        } finally {
            setUploading(false);
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "main_image" | "images") => {
        if (!e.target.files?.length) return

        const files = Array.from(e.target.files)

        if (fieldName === "main_image") {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file);
            fileMap.current.set(previewUrl, file);
            form.setValue("main_image", previewUrl);
        } else {
            const newImages = files.map(file => {
                const previewUrl = URL.createObjectURL(file);
                fileMap.current.set(previewUrl, file);
                return previewUrl;
            });
            const currentImages = form.getValues("images") || [];
            form.setValue("images", [...currentImages, ...newImages]);
        }
    }

    const [currentTab, setCurrentTab] = useState("main")

    const tabs = ["main", "info", "location", "media"]
    // Validation fields for each tab
    const tabFields: Record<string, (keyof StadiumFormValues)[]> = {
        main: ["is_active", "phones", "capacity", "price_per_hour", "surface_type", "roof_type"], // phones is complex, trigger("phones") works
        info: ["name_uz", "name_ru", "slug", "description_uz", "description_ru"],
        location: ["latitude", "longitude", "address_uz", "address_ru", "is_metro_near", "metro_station", "metro_distance"],
        media: ["main_image", "images"],
    }

    const handleNext = async () => {
        const fields = tabFields[currentTab]
        const isValid = await form.trigger(fields as any)

        if (isValid) {
            const currentIndex = tabs.indexOf(currentTab)
            if (currentIndex < tabs.length - 1) {
                setCurrentTab(tabs[currentIndex + 1])
            }
        }
    }

    const handlePrevious = () => {
        const currentIndex = tabs.indexOf(currentTab)
        if (currentIndex > 0) {
            setCurrentTab(tabs[currentIndex - 1])
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="main">Asosiy</TabsTrigger>
                        <TabsTrigger value="info">Ma&apos;lumotlar</TabsTrigger>
                        <TabsTrigger value="location">Manzil</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                    </TabsList>

                    <TabsContent value="main" className="space-y-4 pt-4">

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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sig&apos;imi</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sig'imni tanlang" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CAPACITY_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Qoplamani tanlang" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {SURFACE_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tom turini tanlang" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ROOF_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator className="my-2" />

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
                                                        <div className="flex items-center">
                                                            <span className="mr-2 text-sm text-muted-foreground">+998</span>
                                                            <Input
                                                                {...field}
                                                                placeholder="(90) 123-45-67"
                                                                value={(field.value || "").replace(/^\+998\s?/, '')}
                                                                onChange={(e) => {
                                                                    let value = e.target.value.replace(/\D/g, '').substring(0, 9);
                                                                    if (value.length > 0) {
                                                                        if (value.length <= 2) {
                                                                            value = `(${value}`;
                                                                        } else if (value.length <= 5) {
                                                                            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                                                                        } else if (value.length <= 7) {
                                                                            value = `(${value.slice(0, 2)}) ${value.slice(2, 5)}-${value.slice(5)}`;
                                                                        } else {
                                                                            value = `(${value.slice(0, 2)}) ${value.slice(2, 5)}-${value.slice(5, 7)}-${value.slice(7, 9)}`;
                                                                        }
                                                                    }
                                                                    field.onChange(`+998 ${value}`);
                                                                }}
                                                            />
                                                        </div>
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
                                onClick={() => append({ value: "" })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Raqam qo&apos;shish
                            </Button>
                        </div>


                    </TabsContent>

                    <TabsContent value="info" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name_uz"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomi 🇺🇿</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Chilonzor Arena"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    const slug = e.target.value
                                                        .toLowerCase()
                                                        .replace(/\s+/g, '-')
                                                        .replace(/[^a-z0-9-]/g, '');
                                                    form.setValue("slug", slug, { shouldValidate: true });
                                                }}
                                            />
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
                                        <FormLabel>Название 🇷🇺</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Чилонзор Арена" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug (URL) 🔗</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="stadion-nomi"
                                            {...field}
                                            onChange={(e) => {
                                                // Auto-format: lowercase, replace spaces with dashes, remove invalid chars
                                                const value = e.target.value
                                                    .toLowerCase()
                                                    .replace(/\s+/g, '-')
                                                    .replace(/[^a-z0-9-]/g, '');
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Bu sizning stadioningizning internetdagi manzili bo&apos;ladi. Faqat lotin harflari va raqamlar ishating.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="description_uz"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tavsif 🇺🇿</FormLabel>
                                        <FormControl>
                                            <Textarea className="h-32" placeholder="Stadion haqida..." {...field} />
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
                                        <FormLabel>Описание 🇷🇺</FormLabel>
                                        <FormControl>
                                            <Textarea className="h-32" placeholder="О стадионе..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <FormLabel className="sr-only">Joylashuv (Xarita)</FormLabel>

                            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
                                {/* Left Side: Map Preview (Square) */}
                                <div className="w-[200px] h-[200px] shrink-0">
                                    <LocationPicker
                                        latitude={form.watch("latitude")}
                                        longitude={form.watch("longitude")}
                                        className="h-full w-full aspect-square"
                                        onLocationSelect={(lat, lng, address) => {
                                            form.setValue("latitude", lat)
                                            form.setValue("longitude", lng)
                                            if (address) {
                                                form.setValue("address_uz", address);
                                                form.setValue("address_ru", address);
                                            }
                                        }}
                                    />
                                </div>

                                {/* Right Side: Address Inputs */}
                                <div className="flex flex-col gap-4 w-full">
                                    <FormField
                                        control={form.control}
                                        name="address_uz"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Manzil 🇺🇿</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Toshkent sh., ..." {...field} />
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
                                                <FormLabel>Адрес 🇷🇺</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="г. Ташкент, ..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 hidden">
                                <FormField
                                    control={form.control}
                                    name="latitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="number" step="any" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="longitude"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="number" step="any" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Bekatni tanlang" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[200px]">
                                                    {METRO_STATIONS.map((station) => (
                                                        <SelectItem key={station.value} value={station.value}>
                                                            {station.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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

                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentTab === "main" || uploading}
                        className={currentTab === "main" ? "invisible" : ""}
                    >
                        Avvalgisi
                    </Button>

                    {currentTab === "media" ? (
                        <Button type="submit" disabled={loading || uploading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Saqlash
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleNext}
                        >
                            Keyingisi
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
