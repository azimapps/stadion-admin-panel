"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { YMaps, Map, Placemark, ZoomControl } from "@pbe/react-yandex-maps"
import { Search, MapPin } from "lucide-react"
import { Input as CustomInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const YANDEX_API_KEY = "a67d2f0d-f7f6-4dd7-8611-3aab09bce787";

interface SearchSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    address?: {
        road?: string;
        house_number?: string;
        suburb?: string;
        city?: string;
        state?: string;
        display_name?: string;
    };
}

function LocationPickerContent() {
    const searchParams = useSearchParams()

    // Default to Tashkent or params
    const initialLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 41.2995
    const initialLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : 69.2401

    const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLng])
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(
        searchParams.get("lat") && searchParams.get("lng") ? [initialLat, initialLng] : null
    )
    const [zoom, setZoom] = useState(13)

    const [currentAddressUz, setCurrentAddressUz] = useState<string>("")
    const [currentAddressRu, setCurrentAddressRu] = useState<string>("")
    const [currentAddress, setCurrentAddress] = useState<string>("") // Display address

    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const mapRef = useRef<any>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [ymaps, setYmaps] = useState<any>(null);

    // Initial load
    useEffect(() => {
        if (initialLat && initialLng && ymaps) {
            fetchAddress(initialLat, initialLng)
        }
    }, [ymaps, initialLat, initialLng])

    // Helper to format concise address from Nominatim details
    const formatAddress = (details: any) => {
        const parts = [];
        if (details.road) parts.push(details.road);
        if (details.house_number) parts.push(details.house_number);

        // If we don't have road, try suburb/city
        if (parts.length === 0) {
            if (details.suburb) parts.push(details.suburb);
            else if (details.city) parts.push(details.city);
        }

        return parts.join(", ") || "";
    }

    // Yandex Geocoder
    // Yandex Geocoder
    const fetchAddress = async (lat: number, lng: number) => {
        if (!ymaps) return undefined;
        try {
            // 1. Fetch Uzbek Address (using JS API as it's already configured to uz_UZ via YMaps provider)
            const resUz = await ymaps.geocode([lat, lng]);
            const firstGeoObjectUz = resUz.geoObjects.get(0);
            const addressUz = firstGeoObjectUz ? firstGeoObjectUz.properties.get('name') : "";

            if (addressUz) {
                setCurrentAddressUz(addressUz);
                setCurrentAddress(addressUz);
            }

            // 2. Fetch Russian Address via HTTP API
            // format=json, lang=ru_RU, sco=latlong
            try {
                const resRu = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${lng},${lat}&lang=ru_RU&format=json&sco=longlat&results=1`);
                // Wait... standard sco is longlat (lng, lat). JS API calls geocode([lat, lng]) because of coordorder: "latlong".
                // HTTP API default sco is "longlat" -> Expects "lng, lat".
                // So geocode=${lng},${lat} is correct if sco=longlat (default).
                const dataRu = await resRu.json();

                // Extract feature member
                const featureMember = dataRu.response?.GeoObjectCollection?.featureMember?.[0];
                const addressRu = featureMember?.GeoObject?.name || featureMember?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text || "";

                if (addressRu) {
                    setCurrentAddressRu(addressRu);
                }
            } catch (e) {
                console.error("Russian address fetch failed", e);
            }

            return addressUz;

        } catch (error) {
            console.error("Yandex Geocode error:", error);
        }
        return undefined;
    }

    const handleMapClick = async (e: any) => {
        const coords = e.get("coords")
        setMarkerPos(coords)
        const lat = coords[0];
        const lng = coords[1];

        const addr = await fetchAddress(lat, lng);
        if (addr) setCurrentAddress(addr);
    }

    const handleDragEnd = async (e: any) => {
        const coords = e.get("target").geometry.getCoordinates()
        setMarkerPos(coords)
        const addr = await fetchAddress(coords[0], coords[1]);
        if (addr) setCurrentAddress(addr);
    }

    const handleSave = () => {
        if (markerPos && window.opener) {
            window.opener.postMessage({
                type: 'LOCATION_SELECTED',
                lat: markerPos[0],
                lng: markerPos[1],
                addressUz: currentAddressUz,
                addressRu: currentAddressRu
            }, "*");
            window.close();
        }
    }

    // --- SEARCH SUGGESTIONS LOGIC ---
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query + ", Uzbekistan"
                )}&limit=5&addressdetails=1`
            )
            const data = await response.json()

            if (data && data.length > 0) {
                setSuggestions(data)
                setShowSuggestions(true)
            } else {
                setSuggestions([])
                setShowSuggestions(false)
            }
        } catch (error) {
            console.error("Suggestions error:", error)
        }
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 300)
    }

    const selectSuggestion = async (suggestion: SearchSuggestion) => {
        const newLat = parseFloat(suggestion.lat)
        const newLng = parseFloat(suggestion.lon)

        setMarkerPos([newLat, newLng])
        setMapCenter([newLat, newLng])
        setZoom(16)

        // We trigger the full fetch to populate Uzbek and Russian addresses correctly from Yandex
        // This ensures saving works correctly
        await fetchAddress(newLat, newLng);

        setSearchQuery(suggestion.display_name.split(",")[0])
        setShowSuggestions(false)
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            {/* Header Area - Floating Overlay */}
            <div className="absolute top-4 left-4 right-4 z-50 flex flex-col gap-4 pointer-events-none">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-7xl mx-auto pointer-events-auto">

                    {/* Search Box - Card Style */}
                    <div className="relative w-full sm:w-96 shadow-xl rounded-xl transition-all duration-300">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                        <CustomInput
                            placeholder="Manzilni qidirish..."
                            className="pl-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-white/20 dark:border-white/10 h-12 rounded-xl text-base shadow-sm ring-1 ring-black/5 dark:ring-white/10 focus-visible:ring-emerald-500/50 transition-all placeholder:text-muted-foreground/80"
                            value={searchQuery}
                            onChange={handleInputChange}
                        />
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-xl border border-black/5 dark:border-white/10 p-1.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="p-3 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 rounded-lg text-sm cursor-pointer truncate transition-colors flex items-center gap-3 group"
                                        onClick={() => selectSuggestion(s)}
                                    >
                                        <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
                                        <span className="truncate text-foreground/80 group-hover:text-foreground">{s.display_name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Address Display & Save Button - Floating Card */}
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-white/20 dark:border-white/10 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex flex-col gap-0.5 px-3 max-w-[200px] sm:max-w-[300px]">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Tanlangan manzil</span>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground truncate">
                                <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span className="truncate">{currentAddress || "Xaritadan tanlang"}</span>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={!markerPos} className="rounded-lg shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 h-10 transition-all hover:scale-105 active:scale-95 shrink-0">
                            SAQLASH
                        </Button>
                    </div>
                </div>
            </div>

            {/* Map Container - Fullscreen Underlay */}
            <div className="absolute inset-0 z-0">
                <YMaps query={{ apikey: YANDEX_API_KEY, lang: "ru_RU", coordorder: "latlong" }}>
                    <Map
                        state={{ center: mapCenter, zoom: zoom }}
                        width="100%"
                        height="100%"
                        onLoad={(ymapsInstance) => setYmaps(ymapsInstance)}
                        modules={["geocode", "Placemark", "control.ZoomControl", "control.FullscreenControl"]}
                        onClick={handleMapClick}
                        instanceRef={(ref) => (mapRef.current = ref)}
                        options={{ exclude: ['searchControl'] }}
                    >
                        <ZoomControl options={{ position: { right: 10, top: 100 } } as any} />
                        {markerPos && (
                            <Placemark
                                geometry={markerPos}
                                options={{
                                    preset: "islands#redSportIcon",
                                    draggable: true,
                                }}
                                onDragEnd={handleDragEnd}
                            />
                        )}
                    </Map>
                </YMaps>
            </div>
        </div>
    )
}

export default function LocationPickerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LocationPickerContent />
        </Suspense>
    )
}
