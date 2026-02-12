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
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CAPACITY_TYPES, METRO_STATIONS, ROOF_TYPES, SURFACE_TYPES } from "./stadium-constants"
import { uploadService } from "@/services/upload"
import {
    Loader2,
    Plus,
    Trash,
    Upload,
    LayoutGrid,
    Info,
    MapPin,
    Image as ImageIcon,
    Users,
    BadgeDollarSign,
    Phone,
    TrainFront,
    Trophy,
    Calendar as CalendarIcon,
    Clock,
    DollarSign,
    ExternalLink,
    Pencil,
    Zap,
    Check,
    ChevronsUpDown
} from "lucide-react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { tournamentService, Tournament, TournamentCreate } from "@/services/tournament"
import { regionService, Region } from "@/services/region"
import { comfortService, Comfort } from "@/services/comfort"
import { TournamentFormDialog } from "../../tournaments/components/tournament-form-dialog"
import { useEffect } from "react"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

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
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [showErrorDialog, setShowErrorDialog] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showPreviewDialog, setShowPreviewDialog] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [tournamentsLoading, setTournamentsLoading] = useState(false)
    const [regions, setRegions] = useState<Region[]>([])
    const [comforts, setComforts] = useState<Comfort[]>([])

    useEffect(() => {
        fetchInitialData()
    }, [initialData?.id])

    async function fetchInitialData() {
        if (initialData?.id) {
            fetchTournaments(initialData.id)
        }
        try {
            const [regionsData, comfortsData] = await Promise.all([
                regionService.getAll(),
                comfortService.getAll()
            ])
            setRegions(regionsData)
            setComforts(comfortsData)
        } catch (error) {
            console.error("Error fetching regions/comforts:", error)
        }
    }

    async function fetchTournaments(stadiumId: number) {
        setTournamentsLoading(true)
        try {
            const data = await tournamentService.getAll(0, 50, stadiumId)
            setTournaments(data)
        } catch (error) {
            console.error(error)
        } finally {
            setTournamentsLoading(false)
        }
    }

    const handleAddTournament = async (tournamentData: TournamentCreate) => {
        try {
            await tournamentService.create(tournamentData);
            toast.success("Turnir muvaffaqiyatli qo'shildi");
            if (initialData?.id) fetchTournaments(initialData.id);
        } catch (error) {
            console.error(error);
            toast.error("Turnir qo'shishda xatolik");
        }
    };

    const handleEditTournament = async (id: number, tournamentData: Partial<TournamentCreate>) => {
        try {
            await tournamentService.update(id, tournamentData);
            toast.success("Turnir yangilandi");
            if (initialData?.id) fetchTournaments(initialData.id);
        } catch (error) {
            console.error(error);
            toast.error("Turnirni yangilashda xatolik");
        }
    };

    const handleDeleteTournament = async (id: number) => {
        try {
            await tournamentService.delete(id);
            toast.success("Turnir o'chirildi");
            if (initialData?.id) fetchTournaments(initialData.id);
        } catch (error) {
            console.error(error);
            toast.error("Turnirni o'chirishda xatolik");
        }
    };

    const defaultValues: StadiumFormValues = {
        name_uz: initialData?.name_uz || "",
        name_ru: initialData?.name_ru || "",
        slug: initialData?.slug || "",
        description_uz: initialData?.description_uz || "",
        description_ru: initialData?.description_ru || "",
        address_uz: initialData?.address_uz || "",
        address_ru: initialData?.address_ru || "",
        latitude: initialData?.latitude || 0,
        longitude: initialData?.longitude || 0,
        is_active: initialData?.is_active ?? true,
        is_metro_near: initialData?.is_metro_near ?? false,
        metro_station: initialData?.metro_station || "",
        metro_distance: initialData?.metro_distance || 0,
        phones: initialData?.phone ? initialData.phone.map((p: string) => ({ value: p })) : (initialData?.phones || [{ value: "" }]),
        capacity: initialData?.capacity || "7x7",
        price_per_hour: initialData?.price_per_hour || 200000,
        discount_price_per_hour: initialData?.discount_price_per_hour || initialData?.discount?.discount_price_per_hour || undefined,
        surface_type: initialData?.surface_type || "artificial",
        roof_type: initialData?.roof_type || "open",
        main_image: initialData?.main_image || "",
        images: initialData?.images || [],
        region_id: initialData?.region?.id || initialData?.region_id || 0,
        comfort_ids: initialData?.comforts?.map((c: any) => c.id) || initialData?.comfort_ids || [],
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

                if (result.uploaded.length !== filesToUpload.length) {
                    throw new Error("Mismatch in uploaded file count");
                }

                filesToUpload.forEach((file, index) => {
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
                metro_station: values.is_metro_near && values.metro_station ? values.metro_station : null,
                metro_distance: values.is_metro_near && values.metro_distance ? values.metro_distance : 0,
                surface_type: values.surface_type || null,
                roof_type: values.roof_type || null,
            };
            // Remove internal phones field
            delete (submissionData as any).phones;

            await onSubmit(submissionData as any);
        } catch (error: any) {
            console.error("Submission error:", error);

            // If it's a slug conflict error, show it under the slug field
            const errorMsg = error.message || "";
            if (errorMsg.toLowerCase().includes("slug") && errorMsg.toLowerCase().includes("exists")) {
                form.setError("slug", {
                    type: "manual",
                    message: "Ushbu slug band. Iltimos, boshqa nom tanlang yoki slugni o'zgartiring."
                });
                // Switch to info tab where slug is located
                setCurrentTab("info");
                toast.error("Stadion slug manzili band!");
            } else {
                // Otherwise show generic toast (parent usually does this, but we help if it doesn't)
                toast.error(error.message || "Ma'lumotlarni saqlashda xatolik yuz berdi");
            }
            // Re-throw if the parent expects to handle it too (like for loading states)
            throw error;
        } finally {
            setUploading(false);
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "main_image" | "images") => {
        if (!e.target.files?.length) return

        const validFiles = Array.from(e.target.files).filter(file => {
            if (file.size > 500 * 1024) {
                setErrorMessage(`"${file.name}" fayl hajmi 500KB dan oshmasligi kerak!`);
                setShowErrorDialog(true);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return

        const files = validFiles;

        if (fieldName === "main_image") {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file);
            fileMap.current.set(previewUrl, file);
            form.setValue("main_image", previewUrl, { shouldValidate: true });
        } else {
            const newImages = files.map(file => {
                const previewUrl = URL.createObjectURL(file);
                fileMap.current.set(previewUrl, file);
                return previewUrl;
            });
            const currentImages = form.getValues("images") || [];
            form.setValue("images", [...currentImages, ...newImages], { shouldValidate: true });
        }
    }

    const [currentTab, setCurrentTab] = useState("main")

    const tabs = initialData ? ["main", "info", "location", "media", "tournaments"] : ["main", "info", "location", "media"]
    // Validation fields for each tab
    const tabFields: Record<string, (keyof StadiumFormValues)[]> = {
        main: ["is_active", "phones", "capacity", "price_per_hour", "discount_price_per_hour", "surface_type", "roof_type", "comfort_ids"], // phones is complex, trigger("phones") works
        info: ["name_uz", "name_ru", "slug", "description_uz", "description_ru"],
        location: ["region_id", "latitude", "longitude", "address_uz", "address_ru", "is_metro_near", "metro_station", "metro_distance"],
        media: ["main_image", "images"],
        tournaments: [],
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

    const handlePreSave = async () => {
        // validate all fields
        const isValid = await form.trigger();

        if (!isValid) {
            // Find which tab has error
            for (const tab of tabs) {
                const fields = tabFields[tab];
                const isTabValid = await form.trigger(fields as any);
                if (!isTabValid) {
                    setCurrentTab(tab);
                    // Optional: toast error
                    return;
                }
            }
        }

        setShowSaveDialog(true);
    }

    return (
        <>
            <Form {...form}>
                <form className="space-y-8">
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                        <TabsList className={cn(
                            "grid w-full h-14 p-1.5 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-inner",
                            initialData ? "grid-cols-5" : "grid-cols-4"
                        )}>
                            <TabsTrigger value="main" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-2 py-2">
                                <LayoutGrid className="size-4 opacity-70 group-data-[state=active]:opacity-100" />
                                <span className="hidden sm:inline">Asosiy</span>
                            </TabsTrigger>
                            <TabsTrigger value="info" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-2 py-2">
                                <Info className="size-4 opacity-70 group-data-[state=active]:opacity-100" />
                                <span className="hidden sm:inline">Ma&apos;lumotlar</span>
                            </TabsTrigger>
                            <TabsTrigger value="location" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-2 py-2">
                                <MapPin className="size-4 opacity-70 group-data-[state=active]:opacity-100" />
                                <span className="hidden sm:inline">Manzil</span>
                            </TabsTrigger>
                            <TabsTrigger value="media" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-2 py-2">
                                <ImageIcon className="size-4 opacity-70 group-data-[state=active]:opacity-100" />
                                <span className="hidden sm:inline">Media</span>
                            </TabsTrigger>
                            {initialData && (
                                <TabsTrigger value="tournaments" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md transition-all gap-2 py-2">
                                    <Trophy className="size-4 opacity-70 group-data-[state=active]:opacity-100" />
                                    <span className="hidden sm:inline">Turnirlar</span>
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="main" className="space-y-4 pt-4">

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 bg-background/50">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="cursor-pointer font-bold">
                                                    Aktiv holatda
                                                </FormLabel>
                                                <FormDescription className="text-[10px]">
                                                    Stadion saytda ko&apos;rinadimi?
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Users className="size-3.5 text-muted-foreground" />
                                                Sig&apos;imi
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/50">
                                                        <SelectValue placeholder="Sig'imni tanlang" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    {CAPACITY_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value} className="rounded-lg m-1">
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
                                            <FormLabel className="flex items-center gap-2">
                                                <BadgeDollarSign className="size-3.5 text-muted-foreground" />
                                                Soatiga narx (UZS)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1000" {...field} className="h-11 rounded-xl bg-background/50 border-border/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="discount_price_per_hour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <BadgeDollarSign className="size-3.5 text-emerald-500" />
                                                Soatlik chegirma narxi (UZS)
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1000" {...field} className="h-11 rounded-xl bg-background/50 border-border/50 text-emerald-600 font-bold" />
                                            </FormControl>
                                            <FormDescription className="text-[10px]">
                                                Ixtiyoriy. Faqat soatlik narxga qo&apos;llanadi (har bir soat uchun alohida).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>


                            <Separator className="my-2" />

                            <div className="space-y-3">
                                <FormLabel className="flex items-center gap-2">
                                    <LayoutGrid className="size-3.5 text-muted-foreground" />
                                    Qulayliklar
                                </FormLabel>
                                <FormField
                                    control={form.control}
                                    name="comfort_ids"
                                    render={({ field }) => (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {comforts.map((comfort) => {
                                                    const isChecked = Array.isArray(field.value) && field.value.includes(comfort.id);

                                                    return (
                                                        <div
                                                            key={comfort.id}
                                                            className={cn(
                                                                "group flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-3 cursor-pointer transition-all hover:bg-primary/5 select-none",
                                                                isChecked
                                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                                    : "bg-background/50 border-border/50 hover:border-primary/30"
                                                            )}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const current = Array.isArray(field.value) ? field.value : [];
                                                                const newValue = isChecked
                                                                    ? current.filter(id => id !== comfort.id)
                                                                    : [...current, comfort.id];
                                                                field.onChange(newValue);
                                                            }}
                                                        >
                                                            <div className={cn(
                                                                "flex items-center justify-center size-4 rounded-md border transition-all",
                                                                isChecked
                                                                    ? "bg-primary border-primary text-primary-foreground"
                                                                    : "border-muted-foreground/30 group-hover:border-primary/50"
                                                            )}>
                                                                {isChecked && <Check className="size-3" strokeWidth={3} />}
                                                            </div>

                                                            <div className="flex items-center gap-2 leading-none">
                                                                {comfort.image_url ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={comfort.image_url} alt="" className="size-4 object-contain opacity-70" />
                                                                ) : (
                                                                    <Zap className="size-3.5 text-muted-foreground opacity-50" />
                                                                )}
                                                                <span className={cn(
                                                                    "text-xs font-medium transition-colors",
                                                                    isChecked ? "text-primary" : "text-muted-foreground"
                                                                )}>
                                                                    {comfort.title_uz}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <FormMessage />
                                        </div>
                                    )}
                                />
                            </div>

                            <Separator className="my-2" />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="surface_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maydon qoplamasi</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/50">
                                                        <SelectValue placeholder="Qoplamani tanlang" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    {SURFACE_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value} className="rounded-lg m-1">
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
                                                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/50">
                                                        <SelectValue placeholder="Tom turini tanlang" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    {ROOF_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value} className="rounded-lg m-1">
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
                                <FormLabel className="flex items-center gap-2 mb-2">
                                    <Phone className="size-3.5 text-muted-foreground" />
                                    Telefon raqamlar
                                </FormLabel>
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
                                                                    className="h-11 rounded-xl bg-background/50 border-border/50"
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
                                                    className="h-11 rounded-xl bg-background/50 border-border/50"
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
                                                <Input placeholder="Чилонзор Арена" {...field} className="h-11 rounded-xl bg-background/50 border-border/50" />
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
                                                className="h-11 rounded-xl bg-background/50 border-border/50"
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
                                            className={`h-full w-full aspect-square ${form.formState.errors.latitude ? "!border-destructive/80 !border-solid ring-4 ring-destructive/20" : ""}`}
                                            onLocationSelect={(lat, lng, addressUz, addressRu) => {
                                                form.setValue("latitude", lat, { shouldValidate: true })
                                                form.setValue("longitude", lng, { shouldValidate: true })
                                                if (addressUz) form.setValue("address_uz", addressUz, { shouldValidate: true });
                                                // Fallback to Uzbek address if Russian fetch failed or is same
                                                if (addressRu) {
                                                    form.setValue("address_ru", addressRu, { shouldValidate: true });
                                                } else if (addressUz) {
                                                    form.setValue("address_ru", addressUz, { shouldValidate: true });
                                                }
                                                // Trigger validation to clear errors and update state
                                                form.trigger(["latitude", "longitude"]);
                                            }}
                                        />
                                        {form.formState.errors.latitude && (
                                            <p className="text-sm font-medium text-destructive mt-1">
                                                {form.formState.errors.latitude.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right Side: Address Inputs */}
                                    <div className="flex flex-col gap-4 w-full">
                                        <FormField
                                            control={form.control}
                                            name="region_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="size-3.5 text-muted-foreground" />
                                                        Hudud
                                                    </FormLabel>
                                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-11 rounded-xl bg-background/50 border-border/50 shadow-sm transition-all hover:bg-background/80 hover:border-primary/30">
                                                                <SelectValue placeholder="Hududni tanlang" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl border-border/50 shadow-2xl">
                                                            <ScrollArea className="h-[200px]">
                                                                {regions.map((region) => (
                                                                    <SelectItem key={region.id} value={region.id.toString()} className="rounded-lg m-1 hover:bg-primary/5 cursor-pointer">
                                                                        {region.name_uz}
                                                                    </SelectItem>
                                                                ))}
                                                            </ScrollArea>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address_uz"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="size-3.5 text-muted-foreground" />
                                                        Manzil 🇺🇿
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Toshkent sh., ..." {...field} className="h-11 rounded-xl bg-background/50 border-border/50" />
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
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="size-3.5 text-muted-foreground" />
                                                        Адрес 🇷🇺
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="г. Ташкент, ..." {...field} className="h-11 rounded-xl bg-background/50 border-border/50" />
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
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked);
                                                    if (!checked) {
                                                        form.setValue("metro_station", "");
                                                        form.setValue("metro_distance", 0);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                                                <TrainFront className="size-4 text-muted-foreground mr-1" />
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



                        <TabsContent value="media" className="space-y-6 pt-4">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {/* Card 1: Main Image (Asosiy) */}
                                <FormItem className="col-span-1">
                                    <div className={cn(
                                        "relative group aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:shadow-md",
                                        form.formState.errors.main_image
                                            ? "border-destructive bg-destructive/5"
                                            : "border-emerald-500/50 bg-emerald-50/10 hover:bg-emerald-50/20"
                                    )}
                                        onClick={() => {
                                            const img = form.getValues("main_image");
                                            if (img) {
                                                setPreviewImage(img);
                                                setShowPreviewDialog(true);
                                            } else {
                                                document.getElementById("main-image-input")?.click();
                                            }
                                        }}>

                                        <Input
                                            id="main-image-input"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploading}
                                            onChange={(e) => handleImageUpload(e, "main_image")}
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        {form.watch("main_image") ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={form.watch("main_image")} alt="Main" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 text-xs gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            document.getElementById("main-image-input")?.click();
                                                        }}
                                                    >
                                                        <Upload className="h-3 w-3" />
                                                        Almashtirish
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                                    <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Rasm 1 (Asosiy)</span>
                                                <span className="text-[10px] text-muted-foreground">Yuklash</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10 pointer-events-none">
                                            ASOSIY
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>

                                {/* Cards 2-6: Gallery Slots */}
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const images = form.watch("images") || [];
                                    const hasImage = i < images.length;
                                    const imgUrl = images[i];

                                    return (
                                        <div key={i} className={cn(
                                            "relative aspect-square rounded-xl border border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer",
                                            !hasImage && form.formState.errors.images && i === 0
                                                ? "border-destructive bg-destructive/5"
                                                : "border-border bg-muted/20 hover:bg-muted/30"
                                        )}
                                            onClick={() => {
                                                if (hasImage) {
                                                    setPreviewImage(imgUrl);
                                                    setShowPreviewDialog(true);
                                                }
                                            }}
                                        >
                                            {hasImage ? (
                                                <>
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={imgUrl} alt={`Gallery ${i}`} className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const newImages = [...images];
                                                                newImages.splice(i, 1);
                                                                form.setValue("images", newImages, { shouldValidate: true });
                                                            }}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div
                                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4"
                                                    onClick={() => {
                                                        // Trigger hidden input for gallery append
                                                        document.getElementById("gallery-image-input")?.click();
                                                    }}
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-background transition-colors shadow-sm">
                                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground">Rasm {i + 2}</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Hidden Input for Gallery Uploads */}
                                <Input
                                    id="gallery-image-input"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={(e) => {
                                        handleImageUpload(e, "images");
                                        // Reset value to allow selecting same file again if needed
                                        e.target.value = "";
                                    }}
                                />
                            </div>
                            {form.formState.errors.images && (
                                <p className="text-sm font-medium text-destructive mt-2">
                                    {form.formState.errors.images.message}
                                </p>
                            )}

                            {uploading && <div className="text-sm text-muted-foreground flex items-center justify-center py-4"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rasmlar yuklanmoqda...</div>}
                        </TabsContent>

                        {initialData && (
                            <TabsContent value="tournaments" className="space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">Stadion turnirlari</h3>
                                        <p className="text-sm text-muted-foreground">Ushbu stadionda o'tkaziladigan barcha turnirlarni boshqaring.</p>
                                    </div>
                                    <TournamentFormDialog
                                        fixedStadiumId={initialData.id}
                                        onAddTournament={handleAddTournament}
                                        trigger={
                                            <Button className="gap-2 rounded-xl">
                                                <Plus className="h-4 w-4" /> Turnir qo'shish
                                            </Button>
                                        }
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {tournamentsLoading ? (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 opacity-50">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <p className="font-medium text-muted-foreground">Turnirlar yuklanmoqda...</p>
                                        </div>
                                    ) : tournaments.length === 0 ? (
                                        <div className="col-span-full py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 bg-muted/20">
                                            <div className="p-4 bg-muted rounded-full">
                                                <Trophy className="h-10 w-10 text-muted-foreground/30" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="font-bold">Turnirlar hali yo'q</p>
                                                <p className="text-sm text-muted-foreground">Ushbu stadion uchun birinchi turnirni yarating.</p>
                                            </div>
                                            <TournamentFormDialog
                                                fixedStadiumId={initialData.id}
                                                onAddTournament={handleAddTournament}
                                                trigger={
                                                    <Button variant="outline" className="rounded-xl">
                                                        Birinchi turnirni qo'shing
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    ) : (
                                        tournaments.map((tournament) => (
                                            <div key={tournament.id} className="group relative rounded-2xl border bg-card p-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                                <div className="flex flex-col h-full gap-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <h4 className="font-bold text-sm leading-tight line-clamp-2">{tournament.title_uz}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={tournament.is_active ? "default" : "secondary"} className="h-5 text-[10px] px-2">
                                                                    {tournament.is_active ? "Faol" : "Yopilgan"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <TournamentFormDialog
                                                                tournament={tournament}
                                                                fixedStadiumId={initialData.id}
                                                                onEditTournament={handleEditTournament}
                                                                onDeleteTournament={handleDeleteTournament}
                                                                trigger={
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-dashed">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                                                <CalendarIcon className="h-3 w-3" /> Sana
                                                            </span>
                                                            <span className="text-xs font-semibold">{format(new Date(tournament.start_time), "dd.MM.yyyy")}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> Vaqt
                                                            </span>
                                                            <span className="text-xs font-semibold">{format(new Date(tournament.start_time), "HH:mm")}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">To'lov</span>
                                                            <span className="text-sm font-bold text-primary flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3" /> {tournament.entrance_fee.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-[11px] gap-1 hover:text-primary rounded-lg" asChild>
                                                            <Link href={`/tournaments?stadium_id=${initialData.id}`}>
                                                                Batafsil <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>

                    <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border border-border/50 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentTab === "main" || uploading}
                            className={cn(
                                "rounded-xl px-6 h-11 border-border/50 hover:bg-background transition-all",
                                currentTab === "main" ? "invisible" : ""
                            )}
                        >
                            Avvalgisi
                        </Button>

                        {currentTab === tabs[tabs.length - 1] ? (
                            <Button
                                type="button"
                                disabled={loading || uploading}
                                onClick={handlePreSave}
                                className="rounded-xl px-8 h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Saqlash
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="rounded-xl px-8 h-11 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                            >
                                Keyingisi
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ma&apos;lumotlarni saqlash</DialogTitle>
                        <DialogDescription>
                            Barcha kiritilgan ma'lumotlar to'g'riligiga ishonchingiz komilmi?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Bekor qilish</Button>
                        <Button onClick={() => {
                            setShowSaveDialog(false);
                            form.handleSubmit(handleSubmit)();
                        }}>Tasdiqlash</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">Xatolik</DialogTitle>
                        <DialogDescription>
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowErrorDialog(false)}>Tushunarli</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="!max-w-none w-auto h-auto max-w-[100vw] max-h-[100vh] p-0 bg-transparent border-none shadow-none [&>button]:hidden flex items-center justify-center overflow-hidden">
                    <div className="relative flex items-center justify-center w-full h-full">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute -top-2 -right-2 md:-top-3 md:-right-3 rounded-full h-9 w-9 z-50 shadow-md border hover:bg-destructive hover:text-white transition-colors"
                            onClick={() => setShowPreviewDialog(false)}
                        >
                            <Plus className="h-6 w-6 rotate-45" />
                        </Button>
                        {previewImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-w-[98vw] max-h-[98vh] w-auto h-auto rounded-md object-contain shadow-2xl"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
