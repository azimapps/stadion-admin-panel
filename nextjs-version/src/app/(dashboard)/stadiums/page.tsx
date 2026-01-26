"use client"

import { useEffect, useState } from "react"
import { Stadium, stadiumsService } from "@/services/stadium"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

import { useRouter } from "next/navigation"

export default function StadiumsPage() {
    const router = useRouter()
    const [data, setData] = useState<Stadium[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const stadiums = await stadiumsService.getAll()
                setData(stadiums)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="flex flex-col gap-6 px-4 lg:px-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Stadionlar</h1>
                <Button asChild>
                    <Link href="/stadiums/new">
                        <Plus className="mr-2 h-4 w-4" /> Yangi stadion
                    </Link>
                </Button>
            </div>

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
                    onRowClick={(row) => router.push(`/stadiums/${row.id}`)}
                />
            )}
        </div>
    )
}
