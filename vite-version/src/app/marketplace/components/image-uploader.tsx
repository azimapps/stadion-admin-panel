"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, GripVertical, Star, X } from "lucide-react"
import { toast } from "sonner"
import { marketplaceApi } from "@/lib/marketplace-api"
import { cn } from "@/lib/utils"

const MAX_BYTES = 1024 * 1024
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

interface ImageUploaderProps {
  images: string[]
  onChange: (next: string[]) => void
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const list = Array.from(files)

    for (const file of list) {
      if (!ALLOWED.includes(file.type)) {
        toast.error(`Unsupported: ${file.name}`, {
          description: "Use JPEG, PNG or WEBP",
        })
        return
      }
      if (file.size > MAX_BYTES) {
        toast.error(`Too large: ${file.name}`, { description: "Max 1 MB" })
        return
      }
    }

    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of list) {
        const res = await marketplaceApi.uploadImage(file)
        uploaded.push(res.url)
      }
      onChange([...images, ...uploaded])
      toast.success(
        uploaded.length === 1
          ? "Image uploaded"
          : `${uploaded.length} images uploaded`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      toast.error(msg)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeAt = (idx: number) => {
    const next = images.filter((_, i) => i !== idx)
    onChange(next)
  }

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

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "group relative w-full overflow-hidden rounded-xl border-2 border-dashed bg-card transition-colors",
          "hover:border-[color:color-mix(in_oklch,var(--mkt-accent)_50%,var(--border))] hover:bg-[color:color-mix(in_oklch,var(--mkt-accent)_4%,var(--card))]",
          uploading && "opacity-70 cursor-not-allowed"
        )}
      >
        <div className="absolute inset-0 mkt-grid-bg opacity-40 pointer-events-none" />
        <div className="relative flex flex-col items-center gap-3 py-10 px-6 text-center">
          <div className="size-12 rounded-xl bg-background ring-1 ring-border grid place-items-center">
            {uploading ? (
              <Loader2 className="size-5 mkt-accent animate-spin" />
            ) : (
              <ImagePlus className="size-5 mkt-accent" />
            )}
          </div>
          <div>
            <div className="font-semibold">
              {uploading ? "Uploading…" : "Drop images or click to browse"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              JPEG · PNG · WEBP · up to 1 MB per file
            </div>
          </div>
        </div>
      </button>

      {/* Thumbs */}
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
                "relative aspect-square rounded-xl overflow-hidden border bg-muted group cursor-grab active:cursor-grabbing",
                i === 0 && "ring-2 ring-[var(--mkt-accent)] ring-offset-2 ring-offset-background",
                hoverIndex === i && dragIndex !== null && dragIndex !== i && "scale-[1.03] border-[var(--mkt-accent)]"
              )}
            >
              <img src={url} alt={`Image ${i + 1}`} className="size-full object-cover" />

              {/* gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* cover badge */}
              {i === 0 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--mkt-accent)] text-white">
                  <Star className="size-3 fill-white" />
                  Cover
                </span>
              )}

              {/* index */}
              <span className="absolute bottom-2 left-2 inline-flex items-center mkt-mono text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>

              {/* drag handle */}
              <span className="absolute top-2 right-9 size-7 rounded-md bg-background/85 backdrop-blur-md grid place-items-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="size-3.5" />
              </span>

              {/* delete */}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove"
                className="absolute top-2 right-2 size-7 rounded-md bg-background/85 backdrop-blur-md grid place-items-center text-rose-600 hover:bg-rose-50 hover:text-rose-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3.5" />
              </button>

              {/* make cover */}
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => moveToCover(i)}
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-background/85 backdrop-blur-md text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Star className="size-3" /> Set cover
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Trash2 className="size-3" /> Drag thumbnails to reorder. First image is the cover shown in listings.
        </p>
      )}
    </div>
  )
}
