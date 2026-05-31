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
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <div className="text-[10px] font-black uppercase tracking-[0.25em]">
                        Xaridor
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 tabular-nums">
                    USER · #{userId}
                </span>
            </div>

            <div className="p-5 flex flex-col gap-4">
                <div>
                    <div className="font-black italic uppercase tracking-tighter text-2xl leading-tight">
                        {fullname || "Noma'lum"}
                    </div>
                    <a
                        href={`tel:${phone}`}
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors tabular-nums"
                    >
                        <Phone className="size-3.5" />
                        {phone}
                    </a>
                </div>

                <div className="rounded-xl bg-background/50 ring-1 ring-border/40 p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                        <MapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-1">
                                Yetkazib berish manzili
                            </div>
                            <div className="text-sm leading-relaxed italic">{addressText}</div>
                        </div>
                    </div>

                    {hasGeo && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                            <div className="text-[10px] font-mono tabular-nums text-muted-foreground/70">
                                {addressLat?.toFixed(5)}, {addressLng?.toFixed(5)}
                            </div>
                            <a
                                href={mapsUrl!}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Xaritada ko'rish
                                <ExternalLink className="size-3" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
