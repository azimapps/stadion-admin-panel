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

    const [currentAddress, setCurrentAddress] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const mapRef = useRef<any>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [ymaps, setYmaps] = useState<any>(null);

    // Initial load
    useEffect(() => {
        if (initialLat && initialLng && ymaps) {
            // Try to fetch address if we have coords but no address passed (we don't pass address in params usually)
            // But we can trigger a fetch
            fetchAddress(initialLat, initialLng).then(addr => {
                if (addr) setCurrentAddress(addr)
            })
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
    const fetchAddress = async (lat: number, lng: number) => {
        if (!ymaps) return undefined;
        try {
            const res = await ymaps.geocode([lat, lng]);
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
                const name = firstGeoObject.properties.get('name');
                return name;
            }
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
                address: currentAddress
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

    const selectSuggestion = (suggestion: SearchSuggestion) => {
        const newLat = parseFloat(suggestion.lat)
        const newLng = parseFloat(suggestion.lon)

        setMarkerPos([newLat, newLng])
        setMapCenter([newLat, newLng])
        setZoom(16)

        const shortAddr = suggestion.address ? formatAddress(suggestion.address) : suggestion.display_name.split(",")[0];
        setCurrentAddress(shortAddr);
        setSearchQuery(shortAddr)
        setShowSuggestions(false)
    }

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
            {/* Header Area */}
            <div className="z-20 p-4 bg-background/95 backdrop-blur-md border-b flex items-center justify-between gap-4 shadow-sm shrink-0">

                {/* Search Box */}
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <CustomInput
                        placeholder="Manzilni qidirish..."
                        className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 h-10"
                        value={searchQuery}
                        onChange={handleInputChange}
                    />
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-lg border p-1 z-50">
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    className="p-2 hover:bg-accent rounded-md text-sm cursor-pointer truncate"
                                    onClick={() => selectSuggestion(s)}
                                >
                                    {s.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Address Display & Save Button */}
                <div className="flex flex-1 items-center justify-end gap-4 min-w-0">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground truncate bg-secondary/50 py-2 px-3 rounded-md border border-border/50 max-w-[400px]">
                        <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="truncate font-medium text-foreground">{currentAddress || "Manzil tanlanmagan"}</span>
                    </div>
                    <Button onClick={handleSave} disabled={!markerPos} className="h-10 px-6 font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700">
                        SAQLASH
                    </Button>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full h-full relative z-0">
                <YMaps query={{ apikey: YANDEX_API_KEY, lang: "uz_UZ", coordorder: "latlong" }}>
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
