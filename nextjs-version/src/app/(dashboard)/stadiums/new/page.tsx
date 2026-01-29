"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StadiumForm } from "../components/stadium-form"
import { StadiumFormValues } from "../components/stadium-schema"
import { stadiumsService } from "@/services/stadium"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreateStadiumPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: StadiumFormValues) => {
        setLoading(true)
        // No catch block here because we want the error to propagate back to 
        // StadiumForm so it can set field-specific errors (like slug conflicts).
        await stadiumsService.create(data)
        toast.success("Stadion muvaffaqiyatli yaratildi")
        router.push("/stadiums")
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/stadiums">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Yangi stadion qo&apos;shish</h1>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <StadiumForm onSubmit={onSubmit} loading={loading} />
            </div>
        </div>
    )
}
