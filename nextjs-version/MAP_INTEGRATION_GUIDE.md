# Complete Map Integration Guide for Stadion Admin Panel

This guide contains everything you need to implement the interactive map location picker with:
1. Yandex Maps integration for visual display.
2. OpenStreetMap (Nominatim) for address search.
3. Overpass API for finding nearest landmarks (Metro, Restaurants, etc.).

---

## 1. Installation

First, install the required Yandex Maps wrapper package:

```bash
npm install @pbe/react-yandex-maps
```

---

## 2. Constants Configuration

Create or update `src/app/(dashboard)/stadiums/components/stadium-constants.ts`. 
This file defines the types of landmarks we search for (like Metro, Cafe, etc.) and their Overpass API queries.

```typescript
// src/app/(dashboard)/stadiums/components/stadium-constants.ts

export const LANDMARK_TYPES = [
    { label: "Metro bekati", value: "subway", amenity: "station", overpass: '["railway"="station"]["station"="subway"]' },
    { label: "Kafe", value: "cafe", amenity: "cafe", overpass: '["amenity"="cafe"]' },
    { label: "Restoran", value: "restaurant", amenity: "restaurant", overpass: '["amenity"="restaurant"]' },
    { label: "Bozor", value: "marketplace", amenity: "marketplace", overpass: '["amenity"="marketplace"]' },
    { label: "Masjid", value: "place_of_worship", amenity: "place_of_worship", overpass: '["amenity"="place_of_worship"]["religion"="muslim"]' },
    { label: "Maktab", value: "school", amenity: "school", overpass: '["amenity"="school"]' },
    { label: "Kasalxona", value: "hospital", amenity: "hospital", overpass: '["amenity"="hospital"]' },
    { label: "Bog' / Park", value: "park", amenity: "park", overpass: '["leisure"="park"]' },
] as const;

// ... (Other constants like SURFACE_TYPES, CAPACITY_TYPES can remain here)
```

---

## 3. The Map Component

Create `src/app/(dashboard)/stadiums/components/location-picker.tsx`.
This is the main component that handles the map logic.

```tsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { YMaps, Map, Placemark, ZoomControl } from "@pbe/react-yandex-maps"
import { Search, Loader2, MapPin, X } from "lucide-react"
import { Input as CustomInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { LANDMARK_TYPES } from "./stadium-constants"
import { toast } from "sonner"
import { useTheme } from "next-themes"

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    onClose?: () => void;
    onLandmarkUpdate?: (name: string, distance: number, type: string) => void;
    initialLandmarkName?: string;
}

interface SearchSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    address?: {
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
    };
}

export default function LocationPicker({ latitude, longitude, onLocationSelect, onClose, onLandmarkUpdate, initialLandmarkName }: LocationPickerProps) {
    // Default to Tashkent
    const defaultCenter = [41.2995, 69.2401] 
    
    const [mapState, setMapState] = useState({
        center: latitude && longitude ? [latitude, longitude] : defaultCenter,
        zoom: 13,
    })
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(
        latitude && longitude ? [latitude, longitude] : null
    )
    
    // Search State
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    
    // Landmark Calculation State
    const [findingLandmark, setFindingLandmark] = useState<string | null>(null)
    const [selectedLandmarkType, setSelectedLandmarkType] = useState<string | null>(null)
    const [landmarkText, setLandmarkText] = useState(initialLandmarkName || "")
    
    const mapRef = useRef<any>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const { resolvedTheme } = useTheme()

    // Sync state if props change (e.g. opening edit mode)
    useEffect(() => {
        if (latitude && longitude) {
            setMarkerPos([latitude, longitude])
            setMapState(prev => ({ ...prev, center: [latitude, longitude] }))
        }
    }, [latitude, longitude])

    useEffect(() => {
        if (initialLandmarkName) {
            setLandmarkText(initialLandmarkName)
        }
    }, [initialLandmarkName])

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Calculate distance between two points in meters
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // --- LANDMARK SEARCH LOGIC (Overpass API) ---
    const handleLandmarkSearch = async (typeValue: string) => {
        if (!markerPos) return;
        const [lat, lng] = markerPos;

        setFindingLandmark(typeValue);
        setSelectedLandmarkType(typeValue);

        try {
            const typeObj = LANDMARK_TYPES.find(t => t.value === typeValue);
            // Construct Overpass query
            const filter = (typeObj as any)?.overpass || `["amenity"="${typeObj?.amenity || typeValue}"]`;
            
            // Search within 2000m (2km)
            const query = `
                [out:json][timeout:10];
                (
                  node${filter}(around:2000,${lat},${lng});
                  way${filter}(around:2000,${lat},${lng});
                  relation${filter}(around:2000,${lat},${lng});
                );
                out center 15;
            `;

            const response = await fetch("https://overpass-api.de/api/interpreter", {
                method: "POST",
                body: query
            });

            if (!response.ok) throw new Error("Overpass API request failed");

            const data = await response.json();
            const elements = data.elements || [];

            if (elements.length > 0) {
                // Find nearest element
                let closest = elements[0];
                let minSubst = Infinity;

                elements.forEach((item: any) => {
                    const itemLat = item.lat || item.center?.lat;
                    const itemLon = item.lon || item.center?.lon;

                    if (itemLat && itemLon) {
                        const dist = getDistance(lat, lng, itemLat, itemLon);
                        if (dist < minSubst) {
                            minSubst = dist;
                            closest = item;
                        }
                    }
                });

                if (minSubst === Infinity) {
                    toast.error("Yaqin atrofda ma'lumot topilmadi.");
                    setSelectedLandmarkType(null);
                    return;
                }

                const tags = closest.tags || {};
                const name = tags.name || tags["name:uz"] || tags["name:en"] || "Nomsiz";
                const distance = Math.round(minSubst);

                toast.success(`${name} topildi (${distance}m)`);
                if (onLandmarkUpdate) {
                    onLandmarkUpdate(name, distance, typeValue);
                }
                setLandmarkText(name);
            } else {
                toast.error("Yaqin atrofda bunday joy topilmadi.");
                setSelectedLandmarkType(null);
            }
        } catch (error) {
            console.error("Landmark error:", error);
            toast.error("Mo'ljalni aniqlashda xatolik yuz berdi.");
            setSelectedLandmarkType(null);
        } finally {
            setFindingLandmark(null);
        }
    };

    // Handle user clicking on the map
    const onMapClick = (e: any) => {
        const coords = e.get("coords")
        setMarkerPos(coords)
        onLocationSelect(coords[0], coords[1])
    }

    // --- SEARCH SUGGESTIONS LOGIC (Nominatim API) ---
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
                )}&limit=8&addressdetails=1`
            )
            const data = await response.json()

            if (data && data.length > 0) {
                setSuggestions(data)
                setShowSuggestions(true)
                setSelectedIndex(-1)
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

        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value)
        }, 300)
    }

    const selectSuggestion = (suggestion: SearchSuggestion) => {
        const newLat = parseFloat(suggestion.lat)
        const newLng = parseFloat(suggestion.lon)

        setMarkerPos([newLat, newLng])
        setMapState({ center: [newLat, newLng], zoom: 16 })
        onLocationSelect(newLat, newLng)
        setSearchQuery(suggestion.display_name.split(",")[0])
        setShowSuggestions(false)
        setSuggestions([])
    }

    // --- RENDER ---
    return (
        <div className="relative w-full h-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden group">
            <style jsx global>{`
                html.dark .yandex-map-canvas,
                html[data-theme='dark'] .yandex-map-canvas {
                    filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9) grayscale(0.2);
                    -webkit-filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9) grayscale(0.2);
                }
             `}</style>
             
            {/* Map Container */}
            <div className="w-full h-full yandex-map-canvas transition-[filter] duration-500">
                <YMaps query={{ lang: "uz_UZ" as any, coordorder: "latlong" }}>
                    <Map
                        state={mapState}
                        width="100%"
                        height="100%"
                        onClick={onMapClick}
                        instanceRef={(ref) => (mapRef.current = ref)}
                        modules={["control.ZoomControl", "control.FullscreenControl"]}
                    >
                        <ZoomControl options={{ position: { right: 10, top: 10 } } as any} />
                        {markerPos && (
                            <Placemark
                                geometry={markerPos}
                                options={{
                                    preset: "islands#redSportIcon",
                                    draggable: true,
                                }}
                                onDragEnd={(e: any) => {
                                    const coords = e.get("target").geometry.getCoordinates()
                                    setMarkerPos(coords)
                                    onLocationSelect(coords[0], coords[1])
                                }}
                            />
                        )}
                    </Map>
                </YMaps>
            </div>

            {/* Search Bar & Suggestions */}
            <div className="absolute left-6 top-6 w-[380px] z-10 space-y-3" ref={suggestionsRef}>
                <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <CustomInput
                            placeholder="Qidirish... (Masalan: Beruniy metro)"
                            value={searchQuery}
                            onChange={handleInputChange}
                            className="pl-9"
                        />
                         {/* ... (Search loading/clear buttons logic) */}
                    </div>
                </div>
                {/* ... (Suggestions list rendering) */}
            </div>

            {/* Landmark Buttons */}
            {markerPos && !showSuggestions && (
                <div className="absolute left-6 top-32 w-[380px] bg-background/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 z-10">
                     <p className="text-xs font-bold mb-2">Yaqin joyni topish:</p>
                     <div className="flex flex-wrap gap-2">
                        {LANDMARK_TYPES.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => handleLandmarkSearch(type.value)}
                                className={cn(
                                    "text-xs px-2 py-1 rounded border",
                                    selectedLandmarkType === type.value ? "bg-emerald-100 text-emerald-700 border-emerald-500" : "bg-muted"
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                     </div>
                </div>
            )}

            {/* Save/Cancel Buttons */}
            <div className="absolute left-6 bottom-6 w-[380px] z-10 flex flex-col gap-3">
                 <button onClick={onClose} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg">
                    SAQLASH VA YOPISH
                 </button>
            </div>
        </div>
    )
}
```
