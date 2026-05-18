"use client"

import { useRef, useState } from "react"
import {
    ImagePlus,
    Loader2,
    GripVertical,
    Star,
    X,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { marketplaceService } from "@/services/marketplace"
import { compressImage } from "@/lib/image-compressor"
import { cn } from "@/lib/utils"

const MAX_RAW_BYTES = 15 * 1024 * 1024
const MAX_UPLOAD_BYTES = 1024 * 1024
const COMPRESS_TARGET_KB = 200
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

interface ImageUploaderProps {
    images: string[]
    onChange: (next: string[]) => void
}

type ProcessingStatus = "compressing" | "uploading" | "done" | "failed"

interface ProcessingItem {
    id: string
    name: string
    originalSize: number
    compressedSize?: number
    status: ProcessingStatus
    error?: string
    previewUrl?: string
}

function formatBytes(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
    return `${bytes} B`
}

function savingPercent(original: number, compressed: number): number {
    if (!original) return 0
    return Math.max(0, Math.round((1 - compressed / original) * 100))
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const [busy, setBusy] = useState(false)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [hoverIndex, setHoverIndex] = useState<number | null>(null)
    const [processing, setProcessing] = useState<ProcessingItem[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const updateItem = (id: string, patch: Partial<ProcessingItem>) => {
        setProcessing((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        )
    }

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        const list = Array.from(files)

        for (const file of list) {
            if (!ALLOWED.includes(file.type)) {
                toast.error(`Yaroqsiz fayl: ${file.name}`, {
                    description: "JPEG, PNG yoki WEBP bo'lishi kerak",
                })
                return
            }
            if (file.size > MAX_RAW_BYTES) {
                toast.error(`Fayl juda katta: ${file.name}`, {
                    description: `Maksimum ${formatBytes(MAX_RAW_BYTES)}`,
                })
                return
            }
        }

        const items: ProcessingItem[] = list.map((file, i) => ({
            id: `${Date.now()}-${i}-${file.name}`,
            name: file.name,
            originalSize: file.size,
            status: "compressing",
            previewUrl: URL.createObjectURL(file),
        }))
        setProcessing((prev) => [...prev, ...items])
        setBusy(true)

        let totalOriginal = 0
        let totalCompressed = 0
        const uploadedUrls: string[] = []

        try {
            for (let i = 0; i < list.length; i++) {
                const file = list[i]
                const item = items[i]
                totalOriginal += file.size

                let processed: File
                try {
                    processed = await compressImage(file, COMPRESS_TARGET_KB)
                } catch (err) {
                    updateItem(item.id, {
                        status: "failed",
                        error: err instanceof Error ? err.message : "Siqishda xatolik",
                    })
                    continue
                }

                updateItem(item.id, {
                    compressedSize: processed.size,
                    status: "uploading",
                })

                if (processed.size > MAX_UPLOAD_BYTES) {
                    updateItem(item.id, {
                        status: "failed",
                        error: `Siqishdan keyin ham ${formatBytes(processed.size)} (maks ${formatBytes(MAX_UPLOAD_BYTES)})`,
                    })
                    continue
                }

                try {
                    const res = await marketplaceService.uploadImage(processed)
                    uploadedUrls.push(res.url)
                    totalCompressed += processed.size
                    updateItem(item.id, { status: "done" })
                } catch (err) {
                    updateItem(item.id, {
                        status: "failed",
                        error: err instanceof Error ? err.message : "Yuklashda xatolik",
                    })
                }
            }

            if (uploadedUrls.length > 0) {
                onChange([...images, ...uploadedUrls])
                if (uploadedUrls.length === 1 && totalOriginal > 0) {
                    toast.success("Rasm yuklandi", {
                        description: `${formatBytes(totalOriginal)} → ${formatBytes(totalCompressed)} (${savingPercent(totalOriginal, totalCompressed)}% kichikroq)`,
                    })
                } else if (uploadedUrls.length > 1) {
                    toast.success(`${uploadedUrls.length} ta rasm yuklandi`, {
                        description: `Jami ${formatBytes(totalOriginal)} → ${formatBytes(totalCompressed)} (${savingPercent(totalOriginal, totalCompressed)}% kichikroq)`,
                    })
                }
            }

            // Auto-clear successful entries after a moment so the user sees confirmation
            setTimeout(() => {
                setProcessing((prev) =>
                    prev.filter((p) => p.status !== "done" || items.findIndex((it) => it.id === p.id) === -1)
                )
            }, 4500)
        } finally {
            setBusy(false)
            if (inputRef.current) inputRef.current.value = ""
            items.forEach((it) => {
                if (it.previewUrl) URL.revokeObjectURL(it.previewUrl)
            })
        }
    }

    const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx))

    const moveToCover = (idx: number) => {
        if (idx === 0) return
        const next = [...images]
        const [moved] = next.splice(idx, 1)
        next.unshift(moved)
        onChange(next)
    }

    const onDragStart = (i: number) => setDragIndex(i)
    const onDragOverItem = (e: React.DragEvent, i: number) => {
        e.preventDefault()
        setHoverIndex(i)
    }
    const onDrop = (i: number) => {
        if (dragIndex === null || dragIndex === i) {
            setDragIndex(null)
            setHoverIndex(null)
            return
        }
        const next = [...images]
        const [moved] = next.splice(dragIndex, 1)
        next.splice(i, 0, moved)
        onChange(next)
        setDragIndex(null)
        setHoverIndex(null)
    }

    const dismissProcessing = (id: string) =>
        setProcessing((prev) => prev.filter((p) => p.id !== id))

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className={cn(
                    "group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-card/30 transition-all",
                    "hover:border-primary/50 hover:bg-primary/[0.03]",
                    busy && "opacity-70 cursor-not-allowed"
                )}
            >
                <div className="relative flex flex-col items-center gap-3 py-10 px-6 text-center">
                    <div className="size-12 rounded-xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center text-primary">
                        {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                    </div>
                    <div>
                        <div className="font-black italic uppercase tracking-tight text-lg">
                            {busy ? "Ishlanmoqda…" : "Rasm yuklash"}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mt-1 flex items-center justify-center gap-1.5">
                            <Sparkles className="size-3 text-primary/70" />
                            <span>Avtomatik siqiladi · Target ~{COMPRESS_TARGET_KB}KB · Maks 1MB</span>
                        </div>
                    </div>
                </div>
            </button>

            {/* Compression / upload status list */}
            {processing.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden divide-y divide-border/40">
                    {processing.map((p) => {
                        const pct =
                            p.compressedSize !== undefined && p.originalSize > 0
                                ? savingPercent(p.originalSize, p.compressedSize)
                                : 0
                        const targetMet =
                            p.compressedSize !== undefined && p.compressedSize <= COMPRESS_TARGET_KB * 1024 * 1.05
                        return (
                            <div key={p.id} className="flex items-center gap-3 p-3">
                                <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                                    {p.previewUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={p.previewUrl}
                                            alt={p.name}
                                            className={cn(
                                                "size-full object-cover",
                                                p.status === "failed" && "opacity-40 grayscale"
                                            )}
                                        />
                                    ) : null}
                                    {p.status === "compressing" || p.status === "uploading" ? (
                                        <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
                                            <Loader2 className="size-4 animate-spin text-primary" />
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-bold text-sm truncate">{p.name}</span>
                                        {p.status === "done" && (
                                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                        )}
                                        {p.status === "failed" && (
                                            <AlertCircle className="size-3.5 text-destructive shrink-0" />
                                        )}
                                    </div>

                                    {p.status === "failed" ? (
                                        <div className="text-xs text-destructive mt-1 truncate">{p.error}</div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1 text-[11px] tabular-nums">
                                            <span className="text-muted-foreground/70 font-medium">
                                                {formatBytes(p.originalSize)}
                                            </span>
                                            <ArrowRight className="size-3 text-muted-foreground/40" />
                                            {p.compressedSize !== undefined ? (
                                                <>
                                                    <span className="font-black text-foreground">
                                                        {formatBytes(p.compressedSize)}
                                                    </span>
                                                    {pct > 0 && (
                                                        <span
                                                            className={cn(
                                                                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest",
                                                                targetMet
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                            )}
                                                        >
                                                            −{pct}%
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground/60 italic font-medium">
                                                    {p.status === "compressing" ? "Siqilmoqda…" : "…"}
                                                </span>
                                            )}
                                            {p.status === "uploading" && (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                                    yuklanmoqda
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {(p.status === "done" || p.status === "failed") && (
                                    <button
                                        type="button"
                                        onClick={() => dismissProcessing(p.id)}
                                        className="size-7 grid place-items-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
                                        aria-label="Yopish"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {images.map((url, i) => (
                        <div
                            key={url + i}
                            draggable
                            onDragStart={() => onDragStart(i)}
                            onDragOver={(e) => onDragOverItem(e, i)}
                            onDrop={() => onDrop(i)}
                            onDragEnd={() => {
                                setDragIndex(null)
                                setHoverIndex(null)
                            }}
                            className={cn(
                                "relative aspect-square rounded-2xl overflow-hidden border border-border/60 bg-muted group cursor-grab active:cursor-grabbing transition-all",
                                i === 0 && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                hoverIndex === i && dragIndex !== null && dragIndex !== i && "scale-[1.03] border-primary"
                            )}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Rasm ${i + 1}`} className="size-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {i === 0 && (
                                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] bg-primary text-primary-foreground">
                                    <Star className="size-3 fill-current" />
                                    Asosiy
                                </span>
                            )}

                            <span className="absolute bottom-2 left-2 inline-flex items-center font-black tabular-nums text-[10px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                            </span>

                            <span className="absolute top-2 right-9 size-7 rounded-md bg-background/85 backdrop-blur-md grid place-items-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="size-3.5" />
                            </span>

                            <button
                                type="button"
                                onClick={() => removeAt(i)}
                                aria-label="O'chirish"
                                className="absolute top-2 right-2 size-7 rounded-md bg-background/85 backdrop-blur-md grid place-items-center text-rose-600 hover:bg-rose-50 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="size-3.5" />
                            </button>

                            {i !== 0 && (
                                <button
                                    type="button"
                                    onClick={() => moveToCover(i)}
                                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] bg-background/85 backdrop-blur-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Star className="size-3" /> Asosiy qil
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {images.length > 1 && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                    <Trash2 className="size-3" /> Tartibni o'zgartirish uchun rasmlarni torting · Birinchi rasm asosiy bo'ladi
                </p>
            )}
        </div>
    )
}
