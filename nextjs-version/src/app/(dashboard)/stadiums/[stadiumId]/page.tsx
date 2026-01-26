"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Stadium, stadiumsService } from "@/services/stadium"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, MapPin, Phone, Banknote, Users, Layers, Umbrella, Image as ImageIcon, ArrowLeft, Pencil, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner" // Assuming sonner is used based on other files
import { Loader2 } from "lucide-react"
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SURFACE_TYPES, ROOF_TYPES } from "../components/stadium-constants"

export default function StadiumDetailsPage() {
    const params = useParams<{ stadiumId: string }>()
    const [data, setData] = useState<Stadium | null>(null)
    const [loading, setLoading] = useState(true)
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStadium() {
            try {
                if (!params.stadiumId) return;
                const stadium = await stadiumsService.getById(params.stadiumId)
                setData(stadium)
            } catch (error) {
                console.error(error)
                toast.error("Stadion ma'lumotlarini yuklashda xatolik")
            } finally {
                setLoading(false)
            }
        }
        fetchStadium()
    }, [params.stadiumId])

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-muted-foreground">Stadion topilmadi</p>
                <Button asChild variant="outline">
                    <Link href="/stadiums">Ortga qaytish</Link>
                </Button>
            </div>
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
            maximumFractionDigits: 0
        }).format(price)
    }

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/stadiums">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Stadion haqida</h1>
                </div>
                <Button asChild>
                    <Link href={`/stadiums/${data.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
                    </Link>
                </Button>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://flagcdn.com/w40/uz.png" alt="UZ" className="h-5 w-5 rounded-full object-cover shrink-0" />
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold">{data.name_uz}</h2>
                                <Badge variant={data.is_active ? "default" : "destructive"} className="text-sm px-3 py-1">
                                    {data.is_active ? "Faol" : "Faol emas"}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="h-5 w-5 rounded-full object-cover shrink-0" />
                            <p className="text-xl font-bold">
                                {data.name_ru}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-8 md:grid-cols-5">
                        {/* Left Column: Images (40% width) */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Main Image */}
                            <div className="aspect-video w-full overflow-hidden rounded-xl border bg-muted relative shadow-sm">
                                {data.main_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={data.main_image}
                                        alt={data.name_uz}
                                        className="h-full w-full object-cover transition-transform hover:scale-105 duration-500 cursor-pointer"
                                        onClick={() => setPreviewImage(data.main_image || null)}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        <ImageIcon className="h-12 w-12 opacity-20" />
                                    </div>
                                )}
                            </div>

                            {/* Gallery Grid */}
                            {data.images && data.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {data.images.map((img, i) => (
                                        <div key={i} className="aspect-square overflow-hidden rounded-lg border bg-muted shadow-sm hover:shadow-md transition-all cursor-pointer">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={img}
                                                alt={`Gallery ${i}`}
                                                className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                                                onClick={() => setPreviewImage(img)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column: Details (60% width) */}
                        <div className="md:col-span-3 space-y-8">
                            {/* Primary Stats Card */}
                            <div className="grid gap-6 p-6 border rounded-xl bg-muted/30 backdrop-blur-sm">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    Asosiy ma'lumotlar
                                </h3>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Banknote className="h-3 w-3" /> Narxi (soat)
                                        </span>
                                        <span className="text-xl font-bold">{formatPrice(data.price_per_hour)}</span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Users className="h-3 w-3" /> Sig'imi
                                        </span>
                                        <span className="text-xl font-medium">{data.capacity}</span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Layers className="h-3 w-3" /> Maydon
                                        </span>
                                        <span className="text-lg font-medium capitalize">
                                            {SURFACE_TYPES.find(t => t.value === data.surface_type)?.label || data.surface_type}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Umbrella className="h-3 w-3" /> Tom
                                        </span>
                                        <span className="text-lg font-medium capitalize">
                                            {ROOF_TYPES.find(t => t.value === data.roof_type)?.label || data.roof_type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Location Block */}
                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Phones */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Telefonlar
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {data.phone.map((phone, i) => (
                                            <div key={i} className="font-mono text-sm bg-muted/50 px-3 py-2 rounded border w-fit">
                                                {phone}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Location Mini-Card */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Manzil
                                    </h3>
                                    <div className="text-sm space-y-2">
                                        <div className="flex gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="https://flagcdn.com/w40/uz.png" alt="UZ" className="h-4 w-4 rounded-full object-cover shrink-0 mt-0.5" />
                                            <p className="font-medium">{data.address_uz}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="h-4 w-4 rounded-full object-cover shrink-0 mt-0.5" />
                                            <p className="font-medium">{data.address_ru}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="h-3 w-3" /> Tavsif
                                </h3>
                                <div className="text-sm space-y-4">
                                    <div className="flex gap-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src="https://flagcdn.com/w40/uz.png" alt="UZ" className="h-4 w-4 rounded-full object-cover shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">{data.description_uz}</p>
                                    </div>

                                    {data.description_ru && (
                                        <div className="flex gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src="https://flagcdn.com/w40/ru.png" alt="RU" className="h-4 w-4 rounded-full object-cover shrink-0 mt-0.5" />
                                            <p className="leading-relaxed">{data.description_ru}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metro */}
                            {data.is_metro_near && (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Metro yaqinida</p>
                                        <p className="text-sm">
                                            <span className="font-bold">{data.metro_station}</span> bekati ({data.metro_distance} km)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Map */}
                            <a
                                href={`https://yandex.uz/maps/?pt=${data.longitude || 69.240562},${data.latitude || 41.311081}&z=15&l=map`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-56 w-56 rounded-xl overflow-hidden border shadow-sm relative block group cursor-pointer"
                            >
                                <div className="absolute inset-0 z-10 bg-transparent group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md h-8 w-8" />
                                </div>
                                <YMaps>
                                    <Map
                                        defaultState={{
                                            center: [data.latitude || 41.311081, data.longitude || 69.240562],
                                            zoom: 13,
                                            behaviors: [], // Disable interactions
                                        }}
                                        width="100%"
                                        height="100%"
                                    >
                                        <Placemark
                                            geometry={[data.latitude || 41.311081, data.longitude || 69.240562]}
                                            options={{
                                                preset: 'islands#blueSportIcon',
                                            }}
                                        />
                                    </Map>
                                </YMaps>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-fit w-auto p-0 border-none bg-transparent shadow-none">
                    <div className="relative flex items-center justify-center">
                        {previewImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg object-contain"
                            />
                        )}
                        <Button
                            className="absolute -top-4 -right-4 rounded-full bg-white text-black hover:bg-gray-200 border shadow-md h-8 w-8 p-0"
                            size="icon"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
