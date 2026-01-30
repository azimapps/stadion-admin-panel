"use client"

import { useEffect, useState, useMemo } from "react"
import { Media, mediaService } from "@/services/media"
import { DataTable } from "./components/data-table"
import { getColumns } from "./components/columns"
import { MediaFormDialog } from "./components/media-form-dialog"
import { toast } from "sonner"

export default function MediaPage() {
    const [data, setData] = useState<Media[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const media = await mediaService.getAll()
            setData(media)
            setError(null)
        } catch (err: any) {
            setError(err.message)
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleAddMedia = async (mediaData: any) => {
        try {
            await mediaService.create(mediaData)
            toast.success("Yangi media muvaffaqiyatli qo'shildi")
            fetchData()
        } catch (err: any) {
            toast.error(err.message || "Xatolik yuz berdi")
            throw err
        }
    }

    const handleEditMedia = async (id: number, mediaData: any) => {
        try {
            await mediaService.update(id, mediaData)
            toast.success("Media muvaffaqiyatli tahrirlandi")
            fetchData()
        } catch (err: any) {
            toast.error(err.message || "Xatolik yuz berdi")
            throw err
        }
    }

    const handleDeleteMedia = async (id: number) => {
        try {
            await mediaService.delete(id)
            toast.success("Media muvaffaqiyatli o'chirildi")
            fetchData()
        } catch (err: any) {
            toast.error(err.message || "Xatolik yuz berdi")
            throw err
        }
    }

    const columns = useMemo(() =>
        getColumns(fetchData, handleEditMedia, handleDeleteMedia),
        [fetchData, handleEditMedia, handleDeleteMedia])

    return (
        <div className="flex flex-col gap-8 py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Media Management</h1>
                    <p className="text-muted-foreground text-sm mt-1">YouTube videolari va ularning tavsiflarini boshqarish</p>
                </div>
                <MediaFormDialog onAddMedia={handleAddMedia} />
            </div>

            <div className="px-4 lg:px-6">
                {loading ? (
                    <div className="flex h-64 items-center justify-center bg-card/30 rounded-2xl border border-dashed border-border/50 backdrop-blur-sm shadow-inner transition-all">
                        <div className="flex flex-col items-center gap-4">
                            <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="text-muted-foreground font-semibold tracking-wide animate-pulse">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-10 text-center bg-destructive/5 rounded-3xl border border-destructive/10 backdrop-blur-sm shadow-xl animate-in fade-in zoom-in duration-300">
                        <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-destructive mb-2">Yuklashda xatolik</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchData}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                        >
                            Qayta urinish
                        </button>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={data}
                    />
                )}
            </div>
        </div>
    )
}
