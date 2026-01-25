"use client"

import { useState, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, MapPin } from "lucide-react"

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

// Component to handle map clicks
function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

// Component to fly to new location
function MapFlyTo({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap()
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15)
        }
    }, [lat, lng, map])
    return null
}

export default function LocationPicker({ latitude, longitude, onLocationSelect }: LocationPickerProps) {
    // Default to Tashkent coordinates if none provided
    const [center] = useState<[number, number]>([41.2995, 69.2401])
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(
        latitude && longitude ? [latitude, longitude] : null
    )

    // Sync internal state with props
    useEffect(() => {
        if (latitude && longitude) {
            setMarkerPos([latitude, longitude])
        }
    }, [latitude, longitude])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            // Restrict search to Uzbekistan via countrycodes=uz
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=uz`)
            const data = await response.json()

            if (data && data.length > 0) {
                const { lat, lon } = data[0]
                const newLat = parseFloat(lat)
                const newLng = parseFloat(lon)
                setMarkerPos([newLat, newLng])
                onLocationSelect(newLat, newLng)
            } else {
                alert("Joylashuv topilmadi")
            }
        } catch (error) {
            console.error("Search error:", error)
            alert("Qidirishda xatolik")
        } finally {
            setIsSearching(false)
        }
    }

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setMarkerPos([lat, lng])
        onLocationSelect(lat, lng)
    }, [onLocationSelect])

    return (
        <div className="space-y-2">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    placeholder="Qidirish... (Masalan: Chilonzor kompyuter bozori)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={isSearching} variant="secondary">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </form>

            <div className="h-[400px] w-full rounded-md border overflow-hidden relative z-0">
                <MapContainer
                    center={markerPos || center}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onSelect={handleMapClick} />
                    {markerPos && <Marker position={markerPos} />}
                    {markerPos && <MapFlyTo lat={markerPos[0]} lng={markerPos[1]} />}
                </MapContainer>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {markerPos ?
                    `Tanlangan: ${markerPos[0].toFixed(6)}, ${markerPos[1].toFixed(6)}` :
                    "Xaridadan joylashuvni tanlang"}
            </div>
        </div>
    )
}
