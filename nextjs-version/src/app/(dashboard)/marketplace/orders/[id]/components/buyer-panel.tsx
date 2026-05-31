"use client"

import { ExternalLink, MapPin, Phone, User } from "lucide-react"

interface BuyerPanelProps {
    fullname: string
    phone: string
    addressText: string
    addressLat: number | null
    addressLng: number | null
    userId: number
}

export function BuyerPanel({
    fullname,
    phone,
    addressText,
    addressLat,
    addressLng,
    userId,
}: BuyerPanelProps) {
    const hasGeo = addressLat !== null && addressLng !== null
    const mapsUrl = hasGeo
        ? `https://www.google.com/maps/search/?api=1&query=${addressLat},${addressLng}`
        : null

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <div className="text-sm font-semibold">Xaridor</div>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground tabular-nums">
                    USER #{userId}
                </span>
            </div>

            <div className="p-4 flex flex-col gap-3">
                <div>
                    <div className="text-base font-semibold leading-tight">
                        {fullname || "Noma'lum"}
                    </div>
                    <a
                        href={`tel:${phone}`}
                        className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors tabular-nums"
                    >
                        <Phone className="size-3.5" />
                        {phone}
                    </a>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                                Yetkazib berish manzili
                            </div>
                            <div className="text-sm leading-relaxed">{addressText}</div>
                        </div>
                    </div>

                    {hasGeo && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t">
                            <div className="text-[11px] font-mono tabular-nums text-muted-foreground">
                                {addressLat?.toFixed(5)}, {addressLng?.toFixed(5)}
                            </div>
                            <a
                                href={mapsUrl!}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium hover:bg-accent transition-colors"
                            >
                                Xaritada
                                <ExternalLink className="size-3" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
