"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { StadiumForm } from "../../components/stadium-form"
import { StadiumFormValues } from "../../components/stadium-schema"
import { Stadium, stadiumsService } from "@/services/stadium"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EditStadiumPage() {
    const router = useRouter()
    const params = useParams<{ stadiumId: string }>()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [initialData, setInitialData] = useState<Partial<Stadium> | null>(null)

    useEffect(() => {
        async function fetchStadium() {
            try {
                if (!params.stadiumId) return;
                const data = await stadiumsService.getById(params.stadiumId)
                setInitialData(data)
            } catch (error: any) {
                console.error(error)
                toast.error("Stadion ma'lumotlarini yuklashda xatolik")
                router.push("/stadiums")
            } finally {
                setPageLoading(false)
            }
        }
        fetchStadium()
    }, [params.stadiumId, router])

    const onSubmit = async (data: StadiumFormValues) => {
        setLoading(true)
        if (!params.stadiumId) return;
        // No catch block here because we want the error to propagate back to 
        // StadiumForm so it can set field-specific errors.
        await stadiumsService.update(Number(params.stadiumId), data)
        toast.success("Stadion muvaffaqiyatli yangilandi")
        router.push("/stadiums")
        setLoading(false)
    }

    if (pageLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!initialData) {
        return null // Will redirect in useEffect
    }

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/stadiums">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Stadionni tahrirlash</h1>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <StadiumForm initialData={initialData} onSubmit={onSubmit} loading={loading} />
            </div>
        </div>
    )
}
