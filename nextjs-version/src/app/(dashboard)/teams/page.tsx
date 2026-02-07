"use client"

import { useEffect, useState } from "react"
import { Team, teamService } from "@/services/team"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function TeamsPage() {
    const [data, setData] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const teams = await teamService.getAll()
                setData(teams)
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
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Jamoalar</h1>
                    <p className="text-muted-foreground text-sm mt-1">Jamoalarni boshqarish</p>
                </div>
                <Button asChild className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 px-6">
                    <Link href="/teams/new">
                        <Plus className="mr-2 h-5 w-5 stroke-[2.5]" /> Yangi jamoa
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
