"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { YMaps, Map, Placemark, ZoomControl, SearchControl } from "@pbe/react-yandex-maps"
import { Search, Loader2, MapPin, Navigation } from "lucide-react"
import { Input as CustomInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTheme } from "next-themes"

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    onClose?: () => void;
    onLandmarkUpdate?: (name: string, distance: number, type: string) => void; // Kept for interface compatibility but unused
    initialLandmarkName?: string;
    className?: string;
}

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

const YANDEX_API_KEY = "a67d2f0d-f7f6-4dd7-8611-3aab09bce787";

export default function LocationPicker({ latitude, longitude, onLocationSelect, className }: LocationPickerProps) {
    // Default to Tashkent
    const defaultCenter = [41.2995, 69.2401]

    // Internal state for the map inside dialog
    const [mapCenter, setMapCenter] = useState(latitude && longitude ? [latitude, longitude] : defaultCenter)
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(
        latitude && longitude ? [latitude, longitude] : null
    )
    const [zoom, setZoom] = useState(13)

    // Address state
    const [currentAddress, setCurrentAddress] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Search State
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const mapRef = useRef<any>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Sync props to state when dialog opens or props change
    useEffect(() => {
        if (latitude && longitude) {
            setMarkerPos([latitude, longitude])
            setMapCenter([latitude, longitude])
        }
    }, [latitude, longitude])

    // Helper to format concise address
    const formatAddress = (details: any) => {
        const parts = [];
        if (details.road) parts.push(details.road);
        if (details.house_number) parts.push(details.house_number);

        // If we don't have road, try suburb/city
        if (parts.length === 0) {
            if (details.suburb) parts.push(details.suburb);
            else if (details.city) parts.push(details.city);
        }

        return parts.join(", ") || details.display_name?.split(",").slice(0, 2).join(",") || "";
    }

    // Fetch address using Nominatim (better free reverse geocoding than Yandex sometimes for details, but Yandex is good too)
    // We stick to Nominatim for consistency with search, but format it shorter.
    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            )
            const data = await response.json();
            if (data && data.address) {
                return formatAddress(data.address);
            }
            return data.display_name?.split(",").slice(0, 2).join(",");
        } catch (error) {
            console.error("Address fetch error:", error);
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
        onLocationSelect(lat, lng, addr);
    }

    const handleDragEnd = async (e: any) => {
        const coords = e.get("target").geometry.getCoordinates()
        setMarkerPos(coords)
        const addr = await fetchAddress(coords[0], coords[1]);
        if (addr) setCurrentAddress(addr);
        onLocationSelect(coords[0], coords[1], addr);
    }

    // --- SEARCH SUGGESTIONS LOGIC ---
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        setIsSearching(true)
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
        } finally {
            setIsSearching(false)
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
        onLocationSelect(newLat, newLng, shortAddr);

        setSearchQuery(shortAddr)
        setShowSuggestions(false)
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <div className={cn(
                    "relative w-full h-[120px] rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group",
                    className
                )}>
                    {latitude && longitude ? (
                        // Small static preview or just info
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="flex items-center gap-2 text-emerald-600 font-medium mb-1">
                                <MapPin className="h-5 w-5" />
                                <span>Joylashuv belgilangan</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {currentAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
                            </p>
                            <span className="text-xs text-emerald-600/70 group-hover:text-emerald-600 mt-2 underline">O'zgartirish</span>
                        </div>
                    ) : (
                        <>
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                                Xaritadan joylashuvni tanlash
                            </span>
                        </>
                    )}
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden rounded-2xl h-[500px]">
                <DialogHeader className="p-4 bg-background z-10 border-b absolute top-0 left-0 right-0 glass-effect">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <CustomInput
                            placeholder="Manzilni qidirish..."
                            className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
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
                </DialogHeader>

                <div className="w-full h-full pt-[72px] pb-[60px] relative">
                    <YMaps query={{ apikey: YANDEX_API_KEY, lang: "uz_UZ", coordorder: "latlong" }}>
                        <Map
                            state={{ center: mapCenter, zoom: zoom }}
                            width="100%"
                            height="100%"
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

                <DialogFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate max-w-[70%]">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="truncate">{currentAddress || "Manzil tanlanmagan"}</span>
                        </div>
                        <Button onClick={() => setIsDialogOpen(false)} disabled={!markerPos}>
                            Saqlash
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
