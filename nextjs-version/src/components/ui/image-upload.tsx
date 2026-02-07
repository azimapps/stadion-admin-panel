"use client"

import { useState } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadService } from "@/services/upload"
import { toast } from "sonner"

interface ImageUploadProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    folder?: string
    className?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    folder = "general",
    className,
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Fayl hajmi 5MB dan oshmasligi kerak")
            return
        }

        try {
            setUploading(true)
            const result = await uploadService.uploadImage(file, folder)
            onChange(result.url)
            toast.success("Rasm yuklandi")
        } catch (error: any) {
            toast.error("Rasm yuklashda xatolik: " + (error.message || "Noma'lum xatolik"))
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        onChange("")
    }

    return (
        <div className={cn("flex items-center gap-4", className)}>
            <div className={cn(
                "relative group aspect-square h-32 w-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden",
                value ? "border-border" : "border-muted-foreground/25 hover:border-primary/50 bg-muted/50 hover:bg-muted/80",
                uploading && "opacity-50 cursor-not-allowed"
            )}>
                {value ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Upload"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={handleRemove}
                                disabled={disabled || uploading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground font-medium">Yuklash</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={disabled || uploading}
                        />
                    </label>
                )}
            </div>

            {value && (
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        disabled={disabled || uploading}
                        onClick={() => document.getElementById('edit-upload-trigger')?.click()}
                    >
                        O'zgartirish
                        <input
                            id="edit-upload-trigger"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={disabled || uploading}
                        />
                    </Button>
                </div>
            )}
        </div>
    )
}
