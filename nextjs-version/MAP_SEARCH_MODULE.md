# 🗺️ Pro Map Search & Picker Integration

This documentation provides a guide on how to integrate the professional map picker and search system used in the Stadion Admin Panel into any other React/Next.js project.

---

## 🌟 Key Features

1.  **Hybrid Map Support**: Uses **Yandex Maps** for high-quality imagery and **OpenStreetMap (Nominatim)** for powerful address searching.
2.  **Landmark Discovery**: Built-in **Overpass API** integration to find nearest landmarks like Metro stations, Cafes, and Restaurants within a 2km radius.
3.  **Reverse Geocoding**: Automatically fetches the address when you click or drag a marker.
4.  **Smart Transliteration**: Specialized Uzbek Cyrillic-to-Latin transliteration for consistent data entry.
5.  **Premium Aesthetics**: Modern, glassmorphism UI with dark mode support (including filtered map tiles).

---

## 🚀 Installation Guide

### 1. Install Dependencies

```bash
npm install @pbe/react-yandex-maps lucide-react clsx tailwind-merge
```

### 2. Configuration (Constants)

Create `map-constants.ts` to define your landmarks.

```typescript
export const LANDMARK_TYPES = [
    { label: "Metro bekati", value: "subway", amenity: "station", overpass: '["railway"="station"]["station"="subway"]' },
    { label: "Kafe", value: "cafe", amenity: "cafe", overpass: '["amenity"="cafe"]' },
    { label: "Restoran", value: "restaurant", amenity: "restaurant", overpass: '["amenity"="restaurant"]' },
    { label: "Masjid", value: "place_of_worship", amenity: "place_of_worship", overpass: '["amenity"="place_of_worship"]["religion"="muslim"]' },
    { label: "Maktab", value: "school", amenity: "school", overpass: '["amenity"="school"]' },
] as const;
```

---

## 🛠️ Full Implementation Code

Below is the complete, standalone component code that you can copy into your project as `LocationPicker.tsx`.

### `LocationPicker.tsx`

```tsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { YMaps, Map, Placemark, ZoomControl } from "@pbe/react-yandex-maps"
import { Search, MapPin, X, Loader2 } from "lucide-react"

// --- UTILS ---
const toLatin = (text: string): string => {
    if (!text) return "";
    const map: Record<string, string> = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'J', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'X', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'ъ': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'Ў': "O'", 'ў': "o'", 'Қ': 'Q', 'қ': 'q', 'Ғ': "G'", 'ғ': "g'", 'Ҳ': 'H', 'ҳ': 'h'
    };
    return text.split('').map(char => map[char] || char).join('');
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- COMPONENT ---
export default function LocationPicker({ 
    latitude, 
    longitude, 
    onLocationSelect 
}: { 
    latitude?: number, 
    longitude?: number, 
    onLocationSelect: (lat: number, lng: number, addr: string) => void 
}) {
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(latitude && longitude ? [latitude, longitude] : null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search OSM Nominatim
    const handleSearch = async (query: string) => {
        if (query.length < 3) return;
        setIsSearching(true);
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Uzbekistan")}&limit=5`);
            const data = await resp.json();
            setSuggestions(data);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle Selection
    const selectPos = (lat: number, lng: number, displayName: string) => {
        setMarkerPos([lat, lng]);
        setSuggestions([]);
        onLocationSelect(lat, lng, toLatin(displayName));
    };

    return (
        <div className="relative w-full h-[500px] rounded-xl overflow-hidden border">
            {/* Dark Mode Tile Filter */}
            <style>{` .yandex-map-canvas { filter: invert(1) hue-rotate(180deg) brightness(0.95); } `}</style>

            <div className="absolute top-4 left-4 z-10 w-80">
                <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-lg border">
                    <input 
                        className="w-full p-2 bg-transparent outline-none" 
                        placeholder="Manzil qidirish..." 
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <div className="mt-2 border-t pt-2">
                            {suggestions.map((s, i) => (
                                <div key={i} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => selectPos(parseFloat(s.lat), parseFloat(s.lon), s.display_name)}>
                                    {s.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full h-full yandex-map-canvas">
                <YMaps query={{ lang: "uz_UZ" }}>
                    <Map 
                        state={{ center: markerPos || [41.2995, 69.2401], zoom: 13 }} 
                        width="100%" height="100%"
                        onClick={(e: any) => {
                            const coords = e.get("coords");
                            selectPos(coords[0], coords[1], "Tanlangan nuqta");
                        }}
                    >
                        {markerPos && <Placemark geometry={markerPos} />}
                        <ZoomControl />
                    </Map>
                </YMaps>
            </div>
        </div>
    );
}
```

---

## 🎯 Important Tips for Other Projects

1.  **API Keys**: While this guide uses a public key/free tier for Yandex, it is highly recommended to get your own [Yandex Maps API Key](https://developer.tech.yandex.ru/) for production.
2.  **Transliteration**: Always use the `toLatin` helper when saving addresses to your database if your project requires standardized Latin script.
3.  **Responsive Design**: The map container should have a defined height (e.g., `h-[500px]` or `h-screen`).
4.  **Tailwind Integration**: Ensure your `tailwind.config.js` includes the directories where you place these components.

---

## 📜 Summary
This integration provides a "best of both worlds" solution: the visual polish of Yandex Maps combined with the powerful, free searching capabilities of OpenStreetMap. It is specifically optimized for use in Uzbekistan.
