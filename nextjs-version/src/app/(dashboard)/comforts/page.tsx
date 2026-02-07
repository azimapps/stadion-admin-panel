"use client"

import { useEffect, useState } from "react"
import { Comfort, comfortService } from "@/services/comfort"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function ComfortsPage() {
    const [data, setData] = useState<Comfort[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const comforts = await comfortService.getAll()
                setData(comforts)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex flex-col gap-8 py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Qulayliklar</h1>
                    <p className="text-muted-foreground text-sm mt-1">Stadiondagi qulayliklarni boshqarish</p>
                </div>
                <Button asChild className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 px-6">
                    <Link href="/comforts/new">
                        <Plus className="mr-2 h-5 w-5 stroke-[2.5]" /> Yangi qulaylik
                    </Link>
                </Button>
            </div>

            <div className="px-4 lg:px-6">

                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        Yuklanmoqda...
                    </div>
                ) : error ? (
                    <div className="text-red-500">Xatolik: {error}</div>
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
