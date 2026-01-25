"use client"

import { useState, useEffect } from "react"
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const YANDEX_API_KEY = "a67d2f0d-f7f6-4dd7-8611-3aab09bce787";

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    className?: string;
}

export default function LocationPicker({ latitude, longitude, onLocationSelect, className }: LocationPickerProps) {
    const [currentAddress, setCurrentAddress] = useState<string>("")

    // Internal simple logic to fetch preview address if we have coords but no address string yet
    // This is purely for the preview box.
    const fetchAddressForPreview = async (lat: number, lng: number) => {
        try {
            // using nominatim for simple preview fetch to avoid loading ymaps instance just for this
            // or could use ymaps if we wrap this in YMaps provider.
            // Let's use Nominatim for lightweight preview
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            )
            const data = await response.json();
            if (data && data.address) {
                // simple format
                const parts = [];
                if (data.address.road) parts.push(data.address.road);
                if (data.address.house_number) parts.push(data.address.house_number);
                return parts.join(", ") || data.display_name?.split(",")[0];
            }
        } catch (e) {
            console.error("Preview address fetch failed", e);
        }
        return "";
    }

    useEffect(() => {
        if (latitude && longitude) {
            fetchAddressForPreview(latitude, longitude).then(addr => {
                if (addr) setCurrentAddress(addr);
            })
        }
    }, [latitude, longitude])


    // Listen for messages from popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'LOCATION_SELECTED') {
                const { lat, lng, address } = event.data;
                onLocationSelect(lat, lng, address);
                if (address) setCurrentAddress(address);
            }
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onLocationSelect])


    const openMapPopup = () => {
        const width = 1000;
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const params = new URLSearchParams();
        if (latitude) params.set("lat", latitude.toString());
        if (longitude) params.set("lng", longitude.toString());

        window.open(
            `/location-picker?${params.toString()}`,
            'LocationPicker',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }

    return (
        <YMaps query={{ apikey: YANDEX_API_KEY, lang: "uz_UZ", coordorder: "latlong" }}>
            <div
                onClick={openMapPopup}
                className={cn(
                    "relative w-full h-[200px] rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-emerald-500/50 overflow-hidden cursor-pointer group transition-all",
                    className
                )}>
                {latitude && longitude ? (
                    <div className="w-full h-full relative">
                        {/* Preview Map - Static-ish */}
                        <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <Map
                                state={{ center: [latitude, longitude], zoom: 15 }}
                                width="100%"
                                height="100%"
                                options={{
                                    suppressMapOpenBlock: true,
                                    yandexMapDisablePoiInteractivity: true,
                                    controls: [] // No controls for preview
                                }}
                            >
                                <Placemark geometry={[latitude, longitude]} options={{ preset: "islands#redSportIcon" }} />
                            </Map>
                        </div>

                        {/* Overlay Address */}
                        <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-3 border-t text-xs font-medium z-10 truncate">
                            <div className="flex items-center gap-2 text-emerald-600 mb-0.5">
                                <MapPin className="h-3 w-3" />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Tanlangan manzil</span>
                            </div>
                            <p className="truncate text-foreground" title={currentAddress}>
                                {currentAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
                            </p>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                            <div className="bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                                O'zgartirish
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-950/20 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform bg-white/50 shadow-sm">
                            <MapPin className="h-5 w-5 group-hover:text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium group-hover:text-foreground">
                            Xaritadan tanlash
                        </span>
                    </div>
                )}
            </div>
        </YMaps>
    )
}
